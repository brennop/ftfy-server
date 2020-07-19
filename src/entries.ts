let entries: FullEntry[] = [];

export const addEntry = (entry: FullEntry) => entries.push(entry);

export const getEntry = (short: string) =>
  entries.find((entry) => entry.short === short);

export const removeEntry = (short: string) => {
  entries = entries.filter((entry) => entry.short !== short);
};

export default entries;

