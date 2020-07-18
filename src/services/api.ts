import axios from "axios";
import { Entry } from "../app";

const workspace = process.env.WORKSPACE || "";

export const create = (entry: Entry) =>
  axios
    .post(`/workspaces/${workspace}/time-entries`, entry)
    .then((res) => res.data);

