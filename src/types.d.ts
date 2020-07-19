type Entry = {
  start: string;
  end?: string;
  description: string;
};

type FullEntry = Entry & {
  short: string;
  owner: string;
  subscribers: string[];
};

