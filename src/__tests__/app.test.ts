import app from "../app";
import request from "supertest";
import mockAxios from "axios";
import entries, { removeEntry } from "../entries";

describe("creating a new time entry", () => {
  beforeEach(() => {
    entries.forEach((entry) => removeEntry(entry.short));
  });

  it("bails if key is missing", () => {
    const errorMessage = { message: "Missing API key" };

    mockAxios.post.mockImplementationOnce(() =>
      Promise.reject({
        response: {
          data: errorMessage,
          status: 401,
        },
      })
    );

    return request(app.handler)
      .post("/create")
      .then((response) => {
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe(JSON.stringify(errorMessage));
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
        expect(mockAxios.post).toBeCalledWith(expect.anything(), timeEntry, {
          headers: { "X-Api-Key": "abc123" },
        });
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
    const errorMessage = { error: "Api error" };

    mockAxios.post.mockImplementationOnce(() =>
      Promise.reject({ response: { data: errorMessage, status: 500 } })
    );

    return request(app.handler)
      .post("/create")
      .set("X-Api-Key", "abc123")
      .send(timeEntry)
      .then((response) => {
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe(JSON.stringify(errorMessage));
      });
  });
});

