import app from "../app";
import request from "supertest";
import { ServerResponse } from "http";

describe("creating a new time entry", () => {
  it("bails if key is missing", () => {
    return request(app.handler)
      .post("/create")
      .then((response) => {
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("Missing API key");
      });
  });
});

