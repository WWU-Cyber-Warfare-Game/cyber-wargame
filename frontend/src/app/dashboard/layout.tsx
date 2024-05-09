import { getGameState } from "@/actions";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    try {
        const gameState = await getGameState();
        if (!gameState.gameRunning) {
            return <div>Game has not started yet.</div>;
        } else {
            return <>{children}</>
        }
    } catch (error) {
        console.error(error);
        return <div>Failed to fetch game data.</div>;
    }
}