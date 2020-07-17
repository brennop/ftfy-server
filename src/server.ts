import app from "./app";

const PORT = 3001;

export type Entry = {
  id: string;
  start: string;
  end?: string;
  description: string;
};

export type FullEntry = Entry & {
  short: string;
  owner: string;
  subscribers: string[];
};

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

