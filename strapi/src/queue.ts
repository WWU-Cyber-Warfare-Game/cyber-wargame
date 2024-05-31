import { ActionCompleteRequest, PendingAction } from "./types";
import EventEmitter from "node:events";
import { checkAction } from "./utilities";

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

// this dictates how often the queue will be checked in seconds
const iterator = 1;

/**
 * The ActionQueue class is responsible for managing the queue of pending actions
 */
export default class ActionQueue {
    private queue: PendingAction[] = [];
    private interval: NodeJS.Timeout;
    public readonly eventEmitter = new EventEmitter();

    /**
     * Checks the queue for any actions that have completed
     */
    private checkQueue() {
        if (this.queue.length > 0) {
            const topAction = this.queue[0];
            const endTime = new Date(topAction.date);
            const currentTime = new Date();
            const difference = endTime.getTime() - currentTime.getTime();

            if (difference <= 0) {
                // action is completed
                this.queue.shift();
                const actionCompleteRequest: ActionCompleteRequest = {
                    pendingActionId: topAction.id
                };
                this.eventEmitter.emit("actionComplete", actionCompleteRequest);
            }
        }
    }

    /**
     * Gets the queue from the database
     */
    private async fetchQueue() {
        const actions = await strapi.entityService.findMany('api::pending-action.pending-action', {});
        actions.forEach(async (pendingAction) => {
            const action = await checkAction(pendingAction.user, pendingAction.actionId);
            const item: PendingAction = {
                id: pendingAction.id as number,
                user: pendingAction.user,
                date: new Date(pendingAction.date),
                action: action
            };
            this.addAction(item);
        });
    }

    /**
     * Grabs any actions currently in the queue and starts the queue checking process
     */
    public constructor() {
        this.fetchQueue();
        this.interval = setInterval(this.checkQueue.bind(this), iterator * 1000);
    }

    /**
     * Deletes an action from the queue
     * @param id The id of the action to delete
     */
    public deleteAction(id: number) {
        console.log("action deleted");
        const deleted = this.queue.splice(this.queue.findIndex((action) => action.id === id), 1);
        if (deleted.length === 0) {
            console.error("action not found, queues are out of sync");
        }
    }

    /**
     * Adds an action to the queue
     * @param action The action to add to the queue
     */
    public addAction(action: PendingAction) {
        this.queue.push(action); // add to queue
        this.queue.sort(dateCompare); // sorts the actions by date in descending order
    }

    /**
     * Stops the queue checking process
     */
    public stopQueue() {
        clearInterval(this.interval);
    }
}