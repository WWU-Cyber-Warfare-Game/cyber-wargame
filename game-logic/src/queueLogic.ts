import axios from 'axios';
import { PendingAction } from './types';
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
        console.log("action recieved");
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

            // TODO: move this stuff to the strapi process and just emit the action to the socket
            if (difference <= 0) {
                // action is completed
                console.log("action completed");
                queue.shift();
                socket.emit("actionComplete", topAction.id);
            } else {
                console.log("action not completed yet");
            }
        } else {
            console.log("nothing in the queue");
        }
    });
}