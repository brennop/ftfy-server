import hash from "object-hash";
import { Request } from "polka";
import { addEntry, getEntry, subscribe } from "./entries";
import { create } from "./services/api";
import { ServerResponse } from "http";

export async function createHandler(req: Request) {
  const key = req.headers["x-api-key"] as string;

  const entry = await create(req.body, key);

  const short: string = hash(entry).slice(0, 8);
  const owner = key;

  addEntry({ short, owner, ...entry, subscribers: [] });

  return JSON.stringify({ ...entry, short });
}

export async function subscribeHandler(req: Request, res: ServerResponse) {
  const key = req.headers["x-api-key"] as string;

  const { short } = req.query;

  const currentEntry = getEntry(short);

  if (!currentEntry) {
    res.statusCode = 422;
    res.end(JSON.stringify({ error: "Invalid entry identifier" }));
    return;
  }

  const { owner, subscribers, short: undefined, ...entry } = currentEntry;

  if (!currentEntry.subscribers.includes(key)) {
    subscribe(short, key);

    const realEntry = await create(entry, key);
  }

  res.end(JSON.stringify({ ...entry, short }));
}

export async function updateHandler(req: Request) {}

