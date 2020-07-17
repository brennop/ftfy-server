import polka from "polka";
import { json } from "body-parser";
import { FullEntry } from "./server";

const entries: FullEntry[] = [];

const app = polka();
app.use(json());

//
// CREATE
//
app.post("/create", (req, res) => {
  const key = req.headers["x-api-key"];

  if (!key) {
    res.statusCode = 401;
    res.end("Missing API key");
  }

  res.end();
});

export default app;

