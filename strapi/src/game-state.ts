import { GameState, SocketServer } from "./types";

/**
 * Gets the game state
 * @returns The game state
 */
export async function getGameState() {
    // initialize the game data if not initialized
    if ((await strapi.services['api::game.game'].find()) === null) {
        await strapi.services['api::game.game'].createOrUpdate({
            data: {
                initialized: false,
                gameState: 'notstarted'
            }
        });
    }

    const game = await strapi.services['api::game.game'].find();

    return {
        initialized: game.initialized as boolean,
        gameState: game.gameState as GameState,
        endTime: new Date(Date.parse(game.endTime as string))
    };
}

/**
 * Sets the game state
 * @param field The field to set
 * @param value The value to set
 */
export async function setGameState(field: 'initialized' | 'gameState' | 'endTime' | 'winner', value: any) {
    await strapi.services['api::game.game'].createOrUpdate({
        data: {
            [field]: value
        }
    });
}

/**
 * Sets the winning team, ends game, and emits event to frontend
 * @param winnerId The ID of the winning team, or null if there is no winner
 * @param frontend The frontend socket server
 */
export async function setWinner(winnerId: number | null, frontend: SocketServer) {
    setGameState('winner', winnerId);
    setGameState('gameState', GameState.Ended);
    frontend.emit('gameEnd');
}