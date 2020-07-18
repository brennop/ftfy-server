import polka from "polka";
import { json } from "body-parser";
import { create } from "./services/api";
import { addEntry } from "./entries";
import hash from "object-hash";

export type Entry = {
  start: string;
  end?: string;
  description: string;
};

export type FullEntry = Entry & {
  id: string;
  short: string;
  owner: string;
  subscribers: string[];
};

const app = polka();
app.use(json());

//
// CREATE
//
app.post("/create", async (req, res) => {
  const key = req.headers["x-api-key"];

  if (!key) {
    res.statusCode = 401;
    res.end("Missing API key");
    return;
  }

  const entry = await create(req.body);

  const short: string = hash(entry).slice(0, 8);
  const owner = key;

  addEntry({ short, owner, ...entry, subscribers: [] });

  res.end();
});

export default app;
