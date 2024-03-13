import axios from 'axios';
const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.TOKEN
import { PendingAction } from './types';

function parseAction(data: any) {
    return {
        user: data.user,
        date: data.date,
        action: data.action
    } as PendingAction
}

// this is needed since .env is not updating correctly
const token =  `Bearer 7f2b1a92b39f8fe1fb1f69ece2e5c46d5940327ad0682413d4baf0e5fccbda19e9f6a4d531001ad372e68e77936d359a019513097a38dea897248e6cc723e8e2a30ce8865872e836f4be99722352ed3e9be01f7248976b4c25ae1d35c44de4a60468decd398b9471762e39fa51eb2ac7c22a66ac2c46b5a2ab3493b21720a8ef`

/*
* function queueLogic
* @params -
* constantly polls strapi for the action with the closest completion time, if the date has passed
* the action is copied to the resolved queue and removed from the pending queue
* 
*/
export async function queueLogic() {
    //while (true) { // this loop should be disabled for testing purposes
        try {
            const res =  await axios.get(`${STRAPI_URL}/api/pending-actions?sort[0]=date:asc`, {
                headers: {
                    // Authorization: `Bearer ${STRAPI_API_TOKEN}`
                    Authorization: token
                }
            });
            
            const pAction = parseAction(res.data.data[0].attributes);
            const id = res.data.data[0].id;

            console.log(pAction);
                
            const endTime = new Date(pAction.date);
            const currentTime = new Date();
            const difference = endTime.getTime() - currentTime.getTime();

            console.log("diff" + difference)

            if (difference <= 0) {
                console.log("action completed")

                // add the item to the resolved queue
                addToActive(pAction);

                //removed the item from the pending queue
                removeAction(id);
            } else {
                console.log("action not completed yet")
                // potentially sleep for the difference?
            }
        } catch (error) {
            console.error(error)
        }
    //} // while loop bracket
}

/*
* function addToActive
* @params action: PendingAction
* takes a pendingAction and adds it the the strapi resolved queue
*/
async function addToActive(pAction: PendingAction) {
    console.log("Adding to resolved queue");
    try {
        const date = new Date();

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

/*
* function addToActive
* @params action: PendingAction
* removes the action associated with the unique id from the pending action queue
*/
async function removeAction(id: number) {
    console.log("removing action from pending queue");
    try {
        await axios.delete(`${STRAPI_URL}/api/pending-actions/${id}`, {
            headers: {
                // Authorization: `Bearer ${STRAPI_API_TOKEN}`
                Authorization: token
            },
        });
    } catch (error) {
        console.log(error);
        console.log("error in removeAction");
    }
}