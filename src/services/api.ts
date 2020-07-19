import axios from "axios";

const workspace = process.env.WORKSPACE || "";

export const create = (entry: Entry, key: string): Promise<Entry> =>
  axios
    .post(`/workspaces/${workspace}/time-entries`, entry, {
      headers: { "X-Api-Key": key },
    })
    .then((res) => res.data);

