import { Request } from "polka";
import { create } from "./services/api";
import { addEntry } from "./entries";
import hash from "object-hash";

export async function createHandler(req: Request) {
  const key = req.headers["x-api-key"] as string;

  const entry = await create(req.body, key);

  const short: string = hash(entry).slice(0, 8);
  const owner = key;

  addEntry({ short, owner, ...entry, subscribers: [] });

  return JSON.stringify({ ...entry, short });
}

