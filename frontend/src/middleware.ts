import { NextRequest, NextResponse } from "next/server";
import { validateUser } from "./actions";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

const authRoutes = [
    "/dashboard"
];

export async function middleware(req: NextRequest) {
    const cookie = req.cookies.get("jwt");
    const currentPath = req.nextUrl.pathname;
    const user = await validateUser(cookie?.value); // TODO: find another way to do this, currently it calls the api like 8 times for each page load

    console.log(user);

    if (authRoutes.includes(currentPath) && !user) {
        return NextResponse.redirect(new URL('/login', req.url))
    }
}