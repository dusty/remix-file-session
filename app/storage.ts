// https://remix.run/docs/en/v1/api/remix#createsessionstorage
import type { Cookie } from "@remix-run/node";
import { createSessionStorage } from "@remix-run/node";
import crypto from "crypto";
import fs from "fs";
import path from "path";

interface FileSessionStorageOptions {
  cookie: Cookie;
  dir: string;
}

export function createFileSessionStorage({
  cookie,
  dir,
}: FileSessionStorageOptions) {
  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      const content = JSON.stringify({ data, expires });
      while (true) {
        // TODO: Once node v16 is available on AWS we should use the webcrypto
        // API's crypto.getRandomValues() function here instead.
        let randomBytes = crypto.randomBytes(8);
        // This storage manages an id space of 2^64 ids, which is far greater
        // than the maximum number of files allowed on an NTFS or ext4 volume
        // (2^32). However, the larger id space should help to avoid collisions
        // with existing ids when creating new sessions, which speeds things up.
        let id = Buffer.from(randomBytes).toString("hex");

        try {
          let file = getFile(dir, id);
          fs.mkdirSync(path.dirname(file), { recursive: true });
          fs.writeFileSync(file, content, { encoding: "utf-8", flag: "wx" });
          return id;
        } catch (error) {
          if (error.code !== "EEXIST") throw error;
        }
      }
    },
    async readData(id) {
      try {
        const file = getFile(dir, id);
        const content = JSON.parse(fs.readFileSync(file, "utf-8"));
        const data = content.data;
        const expires =
          typeof content.expires === "string"
            ? new Date(content.expires)
            : null;
        if (!expires || expires > new Date()) return data;
        // Remove expired session data.
        if (expires) fs.unlinkSync(file);
        return null;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
        return null;
      }
    },
    async updateData(id, data, expires) {
      const content = JSON.stringify({ data, expires });
      const file = getFile(dir, id);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content, "utf-8");
    },
    async deleteData(id) {
      try {
        fs.unlinkSync(getFile(dir, id));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    },
  });
}

// Divide the session id up into a directory (first 2 bytes) and filename
// (remaining 6 bytes) to reduce the chance of having very large directories,
// which should speed up file access. This is a maximum of 2^16 directories,
// each with 2^48 files.
function getFile(dir: string, id: string) {
  return path.join(dir, id.slice(0, 4), id.slice(4));
}
