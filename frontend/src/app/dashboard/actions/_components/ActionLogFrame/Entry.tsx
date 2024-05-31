import { ActionLog } from "@/types";

interface EntryProps {
    readonly entry: ActionLog;
}

export default function Entry({ entry }: Readonly<EntryProps>) {
    return (
        <div className="buttonCSS">
            <p>Time: {entry.time.toLocaleString()}</p>
            <p>Action Name: {entry.name}</p>
            <p>Description: {entry.description}</p>
            <p>Role: {entry.teamRole}</p>
            <p>End State: {entry.endState}</p>
        </div>
    )
}