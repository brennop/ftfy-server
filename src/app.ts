import polka from "polka";
import { json } from "body-parser";
import { createHandler, subscribeHandler } from "./handlers";

const app = polka();
app.use(json());

app.post("/create", (req, res) =>
  createHandler(req)
    .then((data) => res.end(data))
    .catch((error) => {
      res.statusCode = error.response.status;
      res.end(JSON.stringify(error.response.data));
    })
);

app.post("/subscribe", (req, res) =>
  subscribeHandler(req)
    .then((data) => res.end(data))
    .catch((error) => {
      res.statusCode = error.response.status;
      res.end(JSON.stringify(error.response.data));
    })
);

export default app;

