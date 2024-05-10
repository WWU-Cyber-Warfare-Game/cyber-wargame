import { getGameState } from "@/actions";
import { GameState } from "@/types";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    try {
        const gameState = await getGameState();
        if (!gameState) {
            return <div>Failed to fetch game data.</div>;
        }

        if (gameState.gameState === GameState.NotStarted) {
            return <div>Game has not started yet.</div>;
        }

        if (gameState.gameState === GameState.Running && (!gameState.endTime || new Date(gameState.endTime) < new Date())) {
            return <div>The game has been started but the end time is not set or invalid.</div>
        }

        if (gameState.gameState === GameState.Ended) {
            if (gameState.winner) {
                return <div>The game has ended. The winner is {gameState.winner}!</div>
            } else {
                return <div>The game has ended. There was a tie.</div>
            }
        }

        return <>{children}</>
    } catch (error) {
        console.error(error);
        return <div>Failed to fetch game data.</div>;
    }
}