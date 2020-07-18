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
      .then(() => {
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
      .then(() => {
        expect(entries).toHaveLength(1);
        expect(entries[0]).toHaveProperty("short");
        expect(entries[0]).toHaveProperty("owner", "abc123");
        expect(entries[0]).toHaveProperty("subscribers", []);
      });
  });

  it("gives a response with time entry", () => {
    const timeEntry: Entry = { description: "New time entry", start: "123" };

    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ data: { ...timeEntry, id: "123456" } })
    );

    return request(app.handler)
      .post("/create")
      .set("X-Api-Key", "abc123")
      .send(timeEntry)
      .then((response) => {
        const responseObject = JSON.parse(response.text);

        expect(responseObject).toEqual({
          ...timeEntry,
          id: "123456",
          short: expect.anything(),
        });
      });
  });

  it("it bails on api call error", () => {
    const timeEntry: Entry = { description: "New time entry", start: "123" };

    mockAxios.post.mockImplementationOnce(() =>
      Promise.reject({ response: { data: { error: "Api error" } } })
    );

    return request(app.handler)
      .post("/create")
      .set("X-Api-Key", "abc123")
      .send(timeEntry)
      .then((response) => {
        expect(response.statusCode).toBe(502);
        expect(response.text).toBe(JSON.stringify({ error: "Api error" }));
      });
  });
});

