import { getGameState } from "@/actions";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    try {
        const gameState = await getGameState();
        if (!gameState) {
            return <div>Failed to fetch game data.</div>;
        }

        if (!gameState.gameRunning) {
            return <div>Game has not started yet.</div>;
        } else if (!gameState.endTime || new Date(gameState.endTime) < new Date()){
            return <div>The game has been started but the end time is not set or invalid.</div>
        } else {
            return <>{children}</>
        }
    } catch (error) {
        console.error(error);
        return <div>Failed to fetch game data.</div>;
    }
}