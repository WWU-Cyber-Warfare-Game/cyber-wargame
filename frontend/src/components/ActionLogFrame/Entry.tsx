import { ActionLog } from "@/types";

interface EntryProps {
    readonly entry: ActionLog;
}

export default function Entry({ entry }: Readonly<EntryProps>) {
    return (
        <div>
            <p>Time: {entry.time.toLocaleString()}</p>
            <p>Action Name: {entry.action.name}</p>
            <p>Duration: {entry.action.duration}</p>
            <p>Description: {entry.action.description}</p>
            <p>Role: {entry.action.teamRole}</p>
        </div>
    )
}