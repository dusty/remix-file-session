import { createCookie } from "@remix-run/node";
import { createFileSessionStorage } from "./storage";

const sessionCookie = createCookie("__session", {
  secure: process.env.NODE_ENV === "production",
  secrets: ["r3m1xr0ck5"],
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30,
  httpOnly: true,
});

const { getSession, commitSession, destroySession } = createFileSessionStorage({
  dir: "/tmp/sessions",
  cookie: sessionCookie,
});

export async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export { getSession, commitSession, destroySession };
