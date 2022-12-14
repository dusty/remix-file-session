import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { commitSession, getUserSession } from "~/session.server";

export async function loader(args: LoaderArgs) {
  const session = await getUserSession(args.request);
  session.set("index", true);
  return json(
    { index: true },
    { headers: { "set-cookie": await commitSession(session) } }
  );
}

export async function action(args: ActionArgs) {
  const session = await getUserSession(args.request);
  session.flash("message", "this is a message");
  return redirect("/", {
    headers: { "set-cookie": await commitSession(session) },
  });
}

export default function Index() {
  return (
    <Form method="post">
      <button name="thing" value="stuff">
        Submit
      </button>
    </Form>
  );
}
