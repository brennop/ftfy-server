import polka from "polka";
import { json } from "body-parser";
import { createHandler } from "./handlers";

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

export default app;

