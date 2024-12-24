
// api/auth/auth-model.js
const db = require("../../data/dbConfig"); // Import the database configuration
const bcrypt = require("bcryptjs"); // Import bcryptjs for password hashing and comparison
const jwt = require("jsonwebtoken"); // Import jsonwebtoken for generating JWT tokens

// Add a new user to the database
async function addUser(user) {
  try {
    // Insert the new user into the "users" table and get the inserted user's ID
    const [id] = await db("users").insert(user);
    // Return the user data, including the newly inserted ID
    return db("users").where({ id }).first();
  } catch (err) {
    // If an error occurs, throw a custom error message
    throw new Error("Could not add user to the database");
  }
}

// Find a user by their username
async function findByUsername(username) {
  // Query the "users" table for a user with the given username and return the first match
  return db("users").where({ username }).first();
}

// Compare a given password with a hashed password
function validatePassword(password, hashedPassword) {
  // Use bcrypt to compare the plain password with the hashed password
  return bcrypt.compareSync(password, hashedPassword);
}

// Generate a JSON Web Token (JWT) for a user
function generateToken(user) {
  // Create the payload for the JWT, containing the user's ID and username
  const payload = {
    subject: user.id, // The subject of the token is the user's ID
    username: user.username // The username is also included in the payload
  };
  
  // The secret key used to sign the token (could come from an environment variable or default to "shh")
  const secret = process.env.SECRET || "shh"; 
  // Options for the token, including expiration time of 1 hour
  const options = { expiresIn: "1h" };
  
  // Generate and return the JWT
  return jwt.sign(payload, secret, options);
}

module.exports = {
  addUser, // Export the addUser function to be used in other parts of the app
  findByUsername, // Export the findByUsername function to be used in other parts of the app
  validatePassword, // Export the validatePassword function to be used in other parts of the app
  generateToken // Export the generateToken function to be used in other parts of the app
};
