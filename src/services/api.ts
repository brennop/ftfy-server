import axios from "axios";

export const create = (entry, workspace) =>
  axios
    .post(`/workspaces/${workspace}/time-entries`, entry)
    .then((res) => res.data);

