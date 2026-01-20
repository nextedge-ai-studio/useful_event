import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

type SessionPayload = {
  accessToken: string;
  expiresIn: number;
};

export async function POST(request: Request) {
  const body = (await request.json()) as SessionPayload;
  const accessToken = body?.accessToken;
  const expiresIn = Number(body?.expiresIn ?? 0);

  if (!accessToken || !expiresIn) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const { data, error } = await supabaseServer.auth.getUser(accessToken);
  if (error || !data.user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("sb-access-token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: expiresIn,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("sb-access-token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
