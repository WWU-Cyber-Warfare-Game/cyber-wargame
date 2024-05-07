"use client";

import { User } from "@/types";

interface ResourceFrameProps {
    readonly user: User;
}
/**
 * The resource frame for the application. Displays the users resource count.
 * @returns
 */
export default function ResourceFrame({user}: Readonly<ResourceFrameProps>){
    return (
        <div>
            <h3>Resource Count: {user.funds}</h3>
        </div>
    )
}