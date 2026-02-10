import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_KEY = "Adiel&Adryan2026@!";

export async function POST(req: Request) {
  try {
    const { key } = await req.json();

    if (key !== ADMIN_KEY) {
      return NextResponse.json({ error: "Invalid Key" }, { status: 401 });
    }

    // Set secure cookie
    // In production, use Secure: true (requires HTTPS)
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
