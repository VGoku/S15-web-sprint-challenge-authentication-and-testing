
// api/auth/auth-middleware.js
const User = require("./auth-model"); // Import the User model to interact with the user data

// Middleware to check if username is already taken
async function checkUsernameFree(req, res, next) {
  try {
    const { username } = req.body; // Extract the username from the request body

    // Check if the username already exists in the database
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      // If the username is already taken, send a 400 error with a message
      return res.status(400).json({ message: "username taken" });
    }

    next(); // If no existing user, proceed to the next middleware or route handler
  } catch (err) {
    // If an error occurs, pass it to the next error-handling middleware
    next(err);
  }
}

// Middleware to check if username and password are provided
function checkPayload(req, res, next) {
  const { username, password } = req.body; // Extract username and password from the request body

  // If either the username or password is missing, return a 400 error with a message
  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  next(); // If both username and password are provided, proceed to the next middleware or route handler
}

module.exports = {
  checkUsernameFree, // Export the checkUsernameFree middleware
  checkPayload, // Export the checkPayload middleware
};
