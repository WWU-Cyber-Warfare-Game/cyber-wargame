import axios from 'axios';
import { ActionCompleteRequest, ActionEndState, PendingAction } from './types';
import { Socket } from 'socket.io-client';
import cron from 'node-cron';

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
const iterator = 1;

// locks the queue and prevents any actions from being removed
let lock = false;

/**
* function queueLogic
* @param socket
* Recieves pendingActions via socket connection from strapi.
* Constantly polls the local queue for the action with the closest completion time, if the date has passed
* the addToActive() & removeAction() helpers are called
* 
*/
export async function queueLogic(socket: Socket) {

    // recieves pending actions from strapi process
    socket.on("pendingAction", (pAction: PendingAction) => {
        console.log("action recieved");
        queue.push(pAction); // add to queue
        queue.sort(dateCompare); // sorts the actions by date in descending order
    });

    // strapi locks the queue
    socket.on("queueLock", () => lockQueue());

    // strapi unlocks the queue
    socket.on("queueUnlock", () => unlockQueue());

    // delete an action from the queue
    socket.on("deleteAction", (id: number) => {
        console.log("action deleted");
        const deleted = queue.splice(queue.findIndex((action) => action.id === id), 1);
        if (deleted.length === 0) {
            console.error("action not found, queues are out of sync");
        }
    });

    cron.schedule(`*/${iterator} * * * * *`, () => { // runs this code periodically
        if (lock) {
            console.log("queue is locked, not processing");
            return;
        }

        if (queue.length > 0) {
            console.log("something in the queue");

            const topAction = queue[0];
            const endTime = new Date(topAction.date);
            const currentTime = new Date();
            const difference = endTime.getTime() - currentTime.getTime();

            if (difference <= 0) {
                // action is completed
                console.log("action completed");
                queue.shift();
                const actionCompleteRequest: ActionCompleteRequest = {
                    pendingActionId: topAction.id
                };
                socket.emit("actionComplete", actionCompleteRequest);
                lockQueue();
            } else {
                console.log("action not completed yet");
            }
        } else {
            console.log("nothing in the queue");
        }
    });
}

function lockQueue() {
    console.log("queue locked");
    lock = true;
}

function unlockQueue() {
    console.log("queue unlocked");
    lock = false;
}