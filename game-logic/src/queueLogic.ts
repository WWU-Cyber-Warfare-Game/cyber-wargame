import axios from 'axios';
const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.TOKEN
import { PendingAction } from './types';
import { Socket } from 'socket.io-client';

var cron = require('node-cron');

// not needed at the moment, maybe in the future?
function parseAction(data: any) {
    return {
        user: data.user,
        date: data.date,
        action: data.action
    } as PendingAction
}

// this is needed since .env is not updating correctly
const token =  `Bearer 7f2b1a92b39f8fe1fb1f69ece2e5c46d5940327ad0682413d4baf0e5fccbda19e9f6a4d531001ad372e68e77936d359a019513097a38dea897248e6cc723e8e2a30ce8865872e836f4be99722352ed3e9be01f7248976b4c25ae1d35c44de4a60468decd398b9471762e39fa51eb2ac7c22a66ac2c46b5a2ab3493b21720a8ef`

function dateCompare(a: PendingAction, b: PendingAction): number {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    if (dateA < dateB) {
        return -1;
    } else if (dateA > dateB) {
        return 1;
    } else {
        return 0;
    }
}

const queue: PendingAction[] = [];
/**
* function queueLogic
* constantly polls strapi for the action with the closest completion time, if the date has passed
* the action is copied to the resolved queue and removed from the pending queue
* 
*/

// this dictates how often the queue will be checked in seconds
const iterator = 3;

export async function queueLogic(socket: Socket) {

    socket.on("pendingAction", (pAction: PendingAction) => {
        console.log("Action recieved");
        queue.push(pAction); // add to queue
        queue.sort(dateCompare); // sorts the actions by date in descending order
    });

    cron.schedule(`*/${iterator} * * * * *`, () => { // runs this code periodically

        if (queue.length > 0) {
            console.log("something in the queue");

            const topAction = queue[0];
            const endTime = new Date(topAction.date);
            const currentTime = new Date();
            const difference = endTime.getTime() - currentTime.getTime();

            if (difference <= 0) {
                // add the item to the resolved queue
                addToActive(topAction.id);

                //removed the item from the pending queue
                removeAction(topAction.id);
            } else {
                console.log("Action not completed yet.");
            }
        } else {
            console.log("nothing in the queue");
        }
    });
}

/**
* function addToActive
* @param action: PendingAction
* takes a pendingAction and adds it the the strapi resolved queue
*/
async function addToActive(id: number) {
    
    try {
        console.log("Adding to resolved queue");

        const date = new Date(); // generate a new timestamp

        // fetch the action from the strapi version of queue, if the socket transmits the action properly this isn't needed
        const res =  await axios.get(`${STRAPI_URL}/api/pending-actions/${id}?populate=*`, {
            headers: {
                // Authorization: `Bearer ${STRAPI_API_TOKEN}`
                Authorization: token
            }
        });

        const pAction = parseAction(res.data.data.attributes);

        await axios.post(`${STRAPI_URL}/api/resolved-actions`, {
                data: {
                    user: pAction.user,
                    date: date,
                    action: pAction.action
                }
            }, {
                headers: {
                    // Authorization: `Bearer ${STRAPI_API_TOKEN}`
                    Authorization: token
                },
            });
    } catch (error) {
        console.log(error);
        console.log("error in addToActive");
    }
}

/**
* function addToActive
* @param action: PendingAction
* removes the action associated with the unique id from the pending action queue
*/
async function removeAction(id: number) {
    
    try {
        console.log("removing action from pending queue");
        await axios.delete(`${STRAPI_URL}/api/pending-actions/${id}`, {
            headers: {
                // Authorization: `Bearer ${STRAPI_API_TOKEN}`
                Authorization: token
            },
        });
        queue.shift();
    } catch (error) {
        console.log(error);
        console.log("error in removeAction");
    }
}