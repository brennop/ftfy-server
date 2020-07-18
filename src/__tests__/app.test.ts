import app, { Entry } from "../app";
import request from "supertest";
import mockAxios from "axios";
import entries, { removeEntry } from "../entries";

describe("creating a new time entry", () => {
  beforeEach(() => {
    entries.forEach((entry) => removeEntry(entry.short));
  });

  it("bails if key is missing", () => {
    return request(app.handler)
      .post("/create")
      .then((response) => {
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("Missing API key");
      });
  });

  it("calls axios with incoming data", () => {
    mockAxios.post.mockImplementationOnce(() => Promise.resolve({ data: {} }));

    const timeEntry: Entry = { description: "New time entry", start: "123" };

    return request(app.handler)
      .post("/create")
      .set("X-Api-Key", "abc123")
      .send(timeEntry)
      .then((response) => {
        expect(mockAxios.post).toBeCalledWith(expect.anything(), timeEntry);
      });
  });

  it("generates entry with short id and owner", () => {
    const timeEntry: Entry = { description: "New time entry", start: "123" };

    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ data: { ...timeEntry, id: "123456" } })
    );

    return request(app.handler)
      .post("/create")
      .set("X-Api-Key", "abc123")
      .send(timeEntry)
      .then((response) => {
        expect(entries).toHaveLength(1);
        expect(entries[0]).toHaveProperty("short");
        expect(entries[0]).toHaveProperty("owner", "abc123");
        expect(entries[0]).toHaveProperty("subscribers", []);
      });
  });
});

