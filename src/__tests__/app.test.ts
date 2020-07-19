import app from "../app";
import request from "supertest";
import mockAxios from "axios";
import {
  removeEntry,
  addEntry,
  getEntry,
  getEntries,
  subscribe,
} from "../entries";

describe("creating a new time entry", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getEntries().forEach((entry) => removeEntry(entry.short));
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
        const entries = getEntries();
        expect(entries).toHaveLength(1);
        expect(entries[0]).toHaveProperty("short");
        expect(entries[0]).toHaveProperty("owner");
        expect(entries[0]).toHaveProperty("subscribers");
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
        expect(response.status).toBe(500);
        expect(response.text).toBe(JSON.stringify(errorMessage));
      });
  });

  it("adds itself to subscribers", async () => {
    const timeEntry: Entry = { description: "New time entry", start: "123" };
    const key = "abc123";

    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ data: { ...timeEntry, id: "123456" } })
    );

    await request(app.handler)
      .post("/create")
      .set("X-Api-Key", key)
      .send(timeEntry)
      .then((response) => {
        const { short } = JSON.parse(response.text);
        const { subscribers } = getEntry(short);
        expect(subscribers).toContain(key);
      });
  });
});

describe("subscribe", () => {
  const entry: Entry = { start: "1600", description: "test entry" };
  const short = "abcd";

  beforeEach(() => {
    jest.clearAllMocks();
    mockAxios.post.mockImplementationOnce(() =>
      Promise.resolve({ data: { ...entry, id: "123456" } })
    );
  });

  beforeEach(() => {
    getEntries().forEach((entry) => removeEntry(entry.short));
    addEntry({
      ...entry,
      short,
      owner: "xyz",
      subscribers: [],
    });
  });

  it("clones the given entry", async () => {
    return request(app.handler)
      .post(`/subscribe?short=${short}`)
      .set("X-Api-Key", "abc123")
      .then(() => {
        expect(mockAxios.post).toBeCalledWith(
          expect.anything(),
          entry,
          expect.anything()
        );
      });
  });

  it("adds itself to subscribers list", async () => {
    const key = "abc123";

    await request(app.handler)
      .post(`/subscribe?short=${short}`)
      .set("X-Api-Key", key);

    const { subscribers } = getEntry(short);
    expect(subscribers).toContain(key);
  });

  it("errors on invalid id", async () => {
    return request(app.handler)
      .post(`/subscribe?short=invalid`)
      .set("X-Api-Key", "abcd123")
      .then((response) => {
        expect(response.status).toBe(422);
      });
  });

  it("does not creates duplicates", async () => {
    const key = "abc123";

    await request(app.handler)
      .post(`/subscribe?short=${short}`)
      .set("X-Api-Key", key);

    return request(app.handler)
      .post(`/subscribe?short=${short}`)
      .set("X-Api-Key", key)
      .then((response) => {
        expect(response.text).toBe(JSON.stringify({ ...entry, short }));

        const { subscribers } = getEntry(short);
        expect(subscribers).toEqual([key]);
      });
  });
});

