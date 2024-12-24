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
 
// api/auth/auth-router.js
const bcrypt = require("bcryptjs"); // Import bcryptjs for password hashing and comparison
const jwt = require("jsonwebtoken"); // Import jsonwebtoken for generating JWT tokens
const router = require("express").Router(); // Create a new router instance from Express
const { addUser, findByUsername, generateToken } = require("./auth-model"); // Import functions from auth-model
const { checkUsernameFree, checkPayload } = require("./auth-middleware"); // Import middleware functions

// Register endpoint
router.post("/register", checkPayload, checkUsernameFree, async (req, res) => {
  try {
    const { username, password } = req.body; // Extract username and password from the request body
    const hashedPassword = await bcrypt.hash(password, 8); // Hash the password with a salt rounds of 8
    const user = await addUser({ username, password: hashedPassword }); // Add the new user to the database
    // Respond with the user ID and username upon successful registration
    res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    // If an error occurs, send a 500 status with an error message
    res.status(500).json({ message: "Error creating user" });
  }
});

// Login endpoint
router.post("/login", checkPayload, async (req, res) => {
  try {
    const { username, password } = req.body; // Extract username and password from the request body
    const user = await findByUsername(username); // Find the user by username
    if (user && bcrypt.compareSync(password, user.password)) {
      // If the user exists and the password matches, generate a JWT
      const token = generateToken(user);
      // Respond with a success message and the generated token
      res.status(200).json({ message: `welcome, ${user.username}`, token });
    } else {
      // If credentials are invalid, send a 401 Unauthorized response
      res.status(401).json({ message: "invalid credentials" });
    }
  } catch (err) {
    // If an error occurs, send a 500 status with an error message
    res.status(500).json({ message: "Error logging in" });
  }
});

module.exports = router; // Export the router to be used in other parts of the app
