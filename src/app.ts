import polka from "polka";
import { json } from "body-parser";
import cors from "cors";
import { createHandler, subscribeHandler } from "./handlers";

const app = polka();
app.use(json());
app.use(cors());

app.post("/create", (req, res) =>
  createHandler(req)
    .then((data) => res.end(data))
    .catch((error) => {
      res.statusCode = error.response.status;
      res.end(JSON.stringify(error.response.data));
    })
);

app.post("/subscribe", subscribeHandler);

export default app;

