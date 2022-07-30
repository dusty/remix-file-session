import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { commitSession, getUserSession } from "~/session.server";

export async function loader(args: LoaderArgs) {
  const session = await getUserSession(args.request);
  session.set("_thing", true);
  return json(
    { stuff: "ya" },
    { headers: { "set-cookie": await commitSession(session) } }
  );
}

export default function Thing() {
  return <Outlet />;
}
