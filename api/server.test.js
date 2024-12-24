
const request = require("supertest"); // Import Supertest for making HTTP requests in tests
const server = require("../api/server.js"); // Import the server instance
const db = require("../data/dbConfig"); // Import the database configuration

beforeAll(async () => {
  await db.migrate.rollback(); // Roll back any previous migrations
  await db.migrate.latest(); // Apply the latest database migrations
});

afterAll(async () => {
  await db.destroy(); // Destroy the database connection after all tests
});

beforeEach(async () => {
  await db("users").truncate(); // Truncate the "users" table before each test
});

// Sanity test to ensure Jest is working
test("sanity", () => {
  expect(true).toBe(true); // Check if Jest is working properly
});

// Test the /api/auth/register endpoint
describe("POST /api/auth/register", () => {
  test("should return 201 and the created user on successful registration", async () => {
    const user = { username: "testUser", password: "password123" };

    const res = await request(server)
      .post("/api/auth/register")
      .send(user);

    expect(res.status).toBe(201); // Check if status code is 201
    expect(res.body).toHaveProperty("id"); // Check if response has the user id
    expect(res.body).toHaveProperty("username", "testUser"); // Check if response has the correct username
    // Remove the check for password property to match best practices
  });

  test("should return 400 if username or password is missing", async () => {
    const res = await request(server)
      .post("/api/auth/register")
      .send({ username: "testUser" }); // Missing password

    expect(res.status).toBe(400); // Check if status code is 400
    expect(res.body.message).toBe("username and password required"); // Check if the error message is correct
  });

  test("should return 409 if username already exists", async () => {
    // First registration
    await request(server)
      .post("/api/auth/register")
      .send({ username: "testUser", password: "password123" });

    // Second registration with the same username
    const res = await request(server)
      .post("/api/auth/register")
      .send({ username: "testUser", password: "password123" });

    expect(res.status).toBe(409); // Check if status code is 409 for conflict
    expect(res.body.message).toBe("username taken"); // Check if the error message is correct
  });
});

// Test the /api/auth/login endpoint
describe("POST /api/auth/login", () => {
  test("should return 200 and a token on successful login", async () => {
    const user = { username: "testUser", password: "password123" };
    await request(server).post("/api/auth/register").send(user); // Register first

    const res = await request(server)
      .post("/api/auth/login")
      .send(user);

    expect(res.status).toBe(200); // Check if status code is 200
    expect(res.body).toHaveProperty("message", "welcome, testUser"); // Check if welcome message is correct
    expect(res.body).toHaveProperty("token"); // Check if token is returned
  });

  test("should return 400 if username or password is missing", async () => {
    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "testUser" }); // Missing password

    expect(res.status).toBe(400); // Check if status code is 400
    expect(res.body.message).toBe("username and password required"); // Check if the error message is correct
  });

  test("should return 401 if username or password is incorrect", async () => {
    const user = { username: "testUser", password: "password123" };
    await request(server).post("/api/auth/register").send(user); // Register first

    const res = await request(server)
      .post("/api/auth/login")
      .send({ username: "testUser", password: "wrongpassword" });

    expect(res.status).toBe(401); // Check if status code is 401
    expect(res.body.message).toBe("invalid credentials"); // Check if the error message is correct
  });
});

// Test the /api/jokes endpoint (protected route)
describe("GET /api/jokes", () => {
  test("should return 401 if token is missing", async () => {
    const res = await request(server).get("/api/jokes");
    expect(res.status).toBe(401); // Check if status code is 401
    expect(res.body.message).toBe("token required"); // Check if the error message is correct
  });

  test("should return 401 if token is invalid", async () => {
    const res = await request(server)
      .get("/api/jokes")
      .set("Authorization", "Bearer invalidtoken");

    expect(res.status).toBe(401); // Check if status code is 401
    expect(res.body.message).toBe("token invalid"); // Check if the error message is correct
  });
});
