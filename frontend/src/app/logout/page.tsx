"use client";

import { logOut } from "@/actions";

/**
 * Page that logs the user out.
 * @returns 
 */
export default function LogOut() {
    logOut();

    return <p>Logging out...</p>
}