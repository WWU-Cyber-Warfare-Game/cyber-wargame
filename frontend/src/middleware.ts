import { NextRequest, NextResponse } from "next/server";
import { validateUser } from "./actions";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

const authRoutes = [
    "/dashboard"
];

export async function middleware(req: NextRequest) {
    const cookie = req.cookies.get("jwt");
    const currentPath = req.nextUrl.pathname;

    if (authRoutes.includes(currentPath)) {
        // FIXME: validateUser is called twice per page for some reason
        const user = await validateUser(cookie?.value);
        if (!user) return NextResponse.redirect(new URL('/login', req.url))
    }
}