import axios from "axios";
import { Entry } from "../app";

const workspace = process.env.WORKSPACE || "";

export const create = (entry: Entry, key: string | undefined) =>
  axios
    .post(`/workspaces/${workspace}/time-entries`, entry, {
      headers: { "X-Api-Key": key },
    })
    .then((res) => res.data);

