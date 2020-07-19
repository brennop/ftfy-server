let entries: FullEntry[] = [];

//
// mutate
//

export const addEntry = (entry: FullEntry) => entries.push(entry);

export const subscribe = (short: string, key: string) => {
  entries = entries.map((entry) =>
    entry.short === short
      ? { ...entry, subscribers: [...entry.subscribers, key] }
      : entry
  );
};

export const removeEntry = (short: string) => {
  entries = entries.filter((entry) => entry.short !== short);
};

//
// query
//

// prevent stale closure
export const getEntries = () => entries;

export const getEntry = (short: string) =>
  getEntries().find((entry) => entry.short === short);

export default entries;

