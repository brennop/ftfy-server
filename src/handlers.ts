import hash from "object-hash";
import { Request } from "polka";
import { addEntry, getEntry, subscribe } from "./entries";
import { create } from "./services/api";

export async function createHandler(req: Request) {
  const key = req.headers["x-api-key"] as string;

  const entry = await create(req.body, key);

  const short: string = hash(entry).slice(0, 8);
  const owner = key;

  addEntry({ short, owner, ...entry, subscribers: [] });

  return JSON.stringify({ ...entry, short });
}

export async function subscribeHandler(req: Request) {
  const key = req.headers["x-api-key"] as string;

  const { short } = req.query;

  const { id, owner, subscribers, short: undefined, ...entry } = getEntry(
    short
  );

  const realEntry = await create(entry, key);

  subscribe(short, key);

  return JSON.stringify({ ...entry, short });
}

