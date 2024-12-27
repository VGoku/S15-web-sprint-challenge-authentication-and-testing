// //  /*
// //     IMPLEMENT
// //     You are welcome to build additional middlewares to help with the endpoint's functionality.
// //     DO NOT EXCEED 2^8 ROUNDS OF HASHING!

// //     1- In order to register a new account the client must provide `username` and `password`:
// //       {
// //         "username": "Captain Marvel", // must not exist already in the `users` table
// //         "password": "foobar"          // needs to be hashed before it's saved
// //       }

// //     2- On SUCCESSFUL registration,
// //       the response body should have `id`, `username` and `password`:
// //       {
// //         "id": 1,
// //         "username": "Captain Marvel",
// //         "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
// //       }

// //     3- On FAILED registration due to `username` or `password` missing from the request body,
// //       the response body should include a string exactly as follows: "username and password required".

// //     4- On FAILED registration due to the `username` being taken,
// //       the response body should include a string exactly as follows: "username taken".
// //   */

// //       /*
// //     IMPLEMENT
// //     You are welcome to build additional middlewares to help with the endpoint's functionality.

// //     1- In order to log into an existing account the client must provide `username` and `password`:
// //       {
// //         "username": "Captain Marvel",
// //         "password": "foobar"
// //       }

// //     2- On SUCCESSFUL login,
// //       the response body should have `message` and `token`:
// //       {
// //         "message": "welcome, Captain Marvel",
// //         "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
// //       }

// //     3- On FAILED login due to `username` or `password` missing from the request body,
// //       the response body should include a string exactly as follows: "username and password required".

// //     4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
// //       the response body should include a string exactly as follows: "invalid credentials".
// //   */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const { addUser, findByUsername } = require("./auth-model");
const { checkUsernameFree, checkPayload } = require("./auth-middleware");

const JWT_SECRET = process.env.JWT_SECRET || "shh";

// Helper function to generate a token
function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1d",
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

// Register endpoint
router.post("/register", checkPayload, checkUsernameFree, async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await addUser({ username, password: hashedPassword });

    // Respond with user details
    const responseUser = {
      id: user.id,
      username: user.username,
      password: hashedPassword // Include password in response for testing purposes
    };

    res.status(201).json(responseUser);
  } catch (err) {
    console.error(err); // Log error for debugging
    res.status(500).json({ message: "Error creating user" });
  }
});

// Login endpoint
router.post("/login", checkPayload, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await findByUsername(username);
    if (user && bcrypt.compareSync(password, user.password)) { // Ensure correct comparison
      const token = generateToken(user);
      res.status(200).json({ message: `welcome, ${user.username}`, token });
    } else {
      res.status(401).json({ message: "invalid credentials" });
    }
  } catch (err) {
    console.error(err); // Log error for debugging
    res.status(500).json({ message: "Error logging in" });
  }
});

module.exports = router;
