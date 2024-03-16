import axios from 'axios';
import { PendingAction } from './types';
import { Socket } from 'socket.io-client';
var cron = require('node-cron');

// only needed to parse an action from a get request
// see types.ts
function parseAction(data: any) {
    return {
        user: data.user,
        date: data.date,
        action: data.action
    } as PendingAction
}

/**
* function dateCompare
* @param a
* @param b 
* compares the dates associated with the actions in descending order
*/
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

//the local queue
const queue: PendingAction[] = [];

// this dictates how often the queue will be checked in seconds
const iterator = 3;

/**
* function queueLogic
* @param socket
* Recieves pendingActions via socket connection from strapi.
* Constantly polls the local queue for the action with the closest completion time, if the date has passed
* the addToActive() & removeAction() helpers are called
* 
*/
export async function queueLogic(socket: Socket) {

    socket.on("pendingAction", (pAction: PendingAction) => {
        console.log("action recieved\n");
        queue.push(pAction); // add to queue
        queue.sort(dateCompare); // sorts the actions by date in descending order
    });

    cron.schedule(`*/${iterator} * * * * *`, () => { // runs this code periodically

        if (queue.length > 0) {
            console.log("something in the queue\n");

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
                console.log("action not completed yet.\n");
            }
        } else {
            console.log("nothing in the queue\n");
        }
    });
}

/**
* function addToActive
* @param id
* copies the pendingAction associated with the unique id to the resolved queue
*/
async function addToActive(id: number) {
    
    try {
        console.log("adding to resolved queue\n");

        const date = new Date(); // generate a new timestamp

        // fetch the action from the strapi version of queue, if the socket transmits the action properly this isn't needed
        const res =  await axios.get(`${process.env.STRAPI_URL}/api/pending-actions/${id}?populate=*`, {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`
            }
        });

        const pAction = parseAction(res.data.data.attributes);

        await axios.post(`${process.env.STRAPI_URL}/api/resolved-actions`, {
                data: {
                    user: pAction.user,
                    date: date,
                    action: pAction.action
                }
            }, {
                headers: {
                    Authorization: `Bearer ${process.env.TOKEN}`
                },
            });
    } catch (error) {
        console.log(error);
        console.log("error in addToActive\n");
    }
}

/**
* function addToActive
* @param id
* removes the action associated with the unique id from the pending action queue
*/
async function removeAction(id: number) {
    
    try {
        console.log("removing action from pending queue\n");
        await axios.delete(`${process.env.STRAPI_URL}/api/pending-actions/${id}`, {
            headers: {
                Authorization: `Bearer ${process.env.TOKEN}`
            },
        });
        queue.shift();
    } catch (error) {
        console.log(error);
        console.log("error in removeAction\n");
    }
}