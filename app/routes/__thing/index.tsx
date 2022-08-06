import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import {
  commitSession,
  destroySession,
  getUserSession,
} from "~/session.server";

export async function loader(args: LoaderArgs) {
  const session = await getUserSession(args.request);
  session.set("index", true);
  return json(
    { index: true, session },
    { headers: { "set-cookie": await commitSession(session) } }
  );
}

export async function action(args: ActionArgs) {
  const session = await getUserSession(args.request);
  const formData = await args.request.formData();
  switch (formData.get("_action")) {
    case "thing":
      session.flash("message", "this is a message");
      return redirect("/", {
        headers: { "set-cookie": await commitSession(session) },
      });
    case "del":
      await destroySession(session);
      return redirect("/");
  }
}

export default function Index() {
  const { session } = useLoaderData();
  console.log("SESSION", session);
  return (
    <Form method="post">
      <button name="_action" value="thing">
        Submit A Thing
      </button>
      <button name="_action" value="del">
        Delete Session
      </button>
    </Form>
  );
}
