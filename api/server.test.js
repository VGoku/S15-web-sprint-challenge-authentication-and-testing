
const request = require("supertest");
const server = require("../api/server.js");
const db = require("../data/dbConfig");

beforeAll(async () => {
  await db("knex_migrations_lock").del();
  await db.migrate.rollback();
  await db.migrate.latest();
});

afterAll(async () => {
  await db.destroy();
});

beforeEach(async () => {
  await db("users").truncate();
});

test("sanity", () => {
  expect(true).toBe(true);
});

describe("POST /api/auth/register", () => {
  test("should return 201 and the created user on successful registration", async () => {
    const user = { username: "testUser", password: "password123" };

    const res = await request(server)
      .post("/api/auth/register")
      .send(user);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("username", "testUser");
    expect(res.body).toHaveProperty("password"); // Include password in response for test
  });

  test("should return 400 if username or password is missing", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ username: "testUser" }); // Missing password

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "username and password required" }); // Ensure exact match
  });

  test("should return 409 if username already exists", async () => {
    await request(server)
      .post("/api/auth/register")
      .send({ username: "testUser", password: "password123" });

    const res = await request(server)
      .post("/api/auth/register")
      .send({ username: "testUser", password: "password123" });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ message: "username taken" }); // Ensure exact match
  });
});

describe("POST /api/auth/login", () => {
  test("should return 200 and a token on successful login", async () => {
    const user = { username: "testUser", password: "password123" };
    await request(server).post("/api/auth/register").send(user);

    const res = await request(server)
      .post("/api/auth/login")
      .send(user);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "welcome, testUser");
    expect(res.body).toHaveProperty("token");
  });

  test("should return 400 if username or password is missing", async () => {
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "testUser" }); // Missing password

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "username and password required" });
  });

  test("should return 401 if username or password is incorrect", async () => {
    const user = { username: "testUser", password: "password123" };
    await request(server).post("/api/auth/register").send(user);

    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "testUser", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: "invalid credentials" });
  });
});

describe("GET /api/jokes", () => {
  test("should return 401 if token is missing", async () => {
    const res = await request(server).get("/api/jokes");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("token required");
  });

  test("should return 401 if token is invalid", async () => {
    const res = await request(server)
      .get("/api/jokes")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("token invalid");
  });
});

describe("POST /api/auth/register", () => {
  test("[21]should return 201 and the created user with a hashed password on successful registration", async () => {
    const user = { username: "foo", password: "password123" };

    const res = await request(server)
      .post("/api/auth/register")
      .send(user);

    expect(res.status).toBe(201); // Check if status code is 201
    expect(res.body).toHaveProperty("id"); // Check if response has the user id
    expect(res.body).toHaveProperty("username", "foo"); // Check if response has the correct username
    expect(res.body).toHaveProperty("password"); // Check if password is included
    expect(res.body.password).not.toBe("password123"); // Ensure the password is hashed and not plain text
  });
});
