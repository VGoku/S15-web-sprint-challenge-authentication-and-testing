const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const db = require("../../data/dbConfig.js");

const secret = process.env.SECRET || 'shh'; // Secret key for JWT, fallback if not set in environment

// router.post('/register', (req, res) => {
//   res.end('implement register, please!');

  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
 // Register endpoint
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

// Validate input
if (!username || !password) {
  return res.status(400).json({ message: "username and password required" });
}

// Check if username already exists
const existingUser = await db("users").where({ username }).first();
if (existingUser) {
  return res.status(400).json({ message: "username taken" });
}

// Hash the password
const hashedPassword = bcrypt.hashSync(password, 8); // 2^8 rounds of hashing

// Insert the new user into the database
try {
  const [id] = await db("users").insert({ username, password: hashedPassword });
  const newUser = await db("users").where({ id }).first();
  res.status(201).json({
    id: newUser.id,
    username: newUser.username,
    password: newUser.password, // In production, you should never send the password in the response.
  });
} catch (err) {
  res.status(500).json({ message: "Error registering user" });
}
});

// router.post('/login', (req, res) => {
//   res.end('implement login, please!');
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
 // Login endpoint
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  // Check if user exists
  const user = await db("users").where({ username }).first();
  if (!user) {
    return res.status(400).json({ message: "invalid credentials" });
  }

  // Check if password is correct
  const passwordMatches = bcrypt.compareSync(password, user.password);
  if (!passwordMatches) {
    return res.status(400).json({ message: "invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });

  // Return token and success message
  res.status(200).json({
    message: `welcome, ${user.username}`,
    token,
  });
});

module.exports = router;
