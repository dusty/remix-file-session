import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { commitSession, getUserSession } from "./session.server";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export async function loader(args: LoaderArgs) {
  const session = await getUserSession(args.request);
  const message = session.get("message");
  return json(
    { message },
    { headers: { "set-cookie": await commitSession(session) } }
  );
}

export default function App() {
  const { message } = useLoaderData<typeof loader>();
  console.log("message", message);
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>message: {message}</h1>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
