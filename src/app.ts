import polka from "polka";
import { json } from "body-parser";
import { createHandler } from "./handlers";

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

app.post("/create", (req, res) =>
  createHandler(req)
    .then((data) => res.end(data))
    .catch((error) => {
      res.statusCode = error.response.status;
      res.end(JSON.stringify(error.response.data));
    })
);

export default app;

