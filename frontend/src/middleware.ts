import { NextRequest, NextResponse } from "next/server";
import { validateUser, logOut } from "./actions";
import { headers } from "next/headers";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

// list of pages that require authentication
// all children of these pages will also require authentication
// NOTE: do not include the leading slash
const authRoutes = [
    'dashboard'
];

export async function middleware(req: NextRequest) {
    const cookie = req.cookies.get("jwt");
    const currentPath = req.nextUrl.pathname.split('/')[1];

    // validates users for authorized pages
    if (authRoutes.includes(currentPath)) {
        // FIXME: validateUser is called twice per page for some reason
        const user = await validateUser();
        if (!user) return NextResponse.redirect(new URL('/login', req.url));
    }
}