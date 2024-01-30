"use client";

import { logOut } from "@/actions";

export default function LogOut() {
    logOut();

    return <p>Logging out...</p>
}