import request from "supertest";
import { Connection } from "typeorm";

import createConnection from "../../../../database"

import { app } from "../../../../app"

let connection: Connection

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an existent user", async () => {
    await request(app)
      .post("/api/v1/users")
      .send({
        name: "User Supertest",
        email: "user@supertest.com",
        password: "supertest"
      });
    
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@supertest.com",
        password: "supertest"
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate user with wrong password", async () => {   
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "user@supertest.com",
        password: "test"
      });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate a nonexistent user", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        email: "test@supertest.com",
        password: "supertest"
      });

    expect(response.status).toBe(401);
  });
});