"use client";

import { User } from "@/types";
import { useState } from "react";

interface ResourceFrameProps {
    readonly funds: number;
}
/**
 * The resource frame for the application. Displays the users resource count.
 * @returns
 */
export default function ResourceFrame({funds}: Readonly<ResourceFrameProps>){

    return (
        <div>
            <h3>Resource Count: {funds}</h3>
        </div>
    )
}