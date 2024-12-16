const db = require("../data/db-config");
const bcrypt = require("bcryptjs"); // To hash passwords
const jwt = require("jsonwebtoken"); // To generate JWT tokens

// Add a new user
async function addUser(user) {
    try {
      // Insert the new user
      const [id] = await db("users").insert(user);
      
      // Fetch and return the user with the new ID
      const newUser = await db("users").where({ id }).first();
      return newUser;
    } catch (err) {
      console.error("Error adding user:", err); // Log error for debugging
      throw new Error("Could not add user to the database"); // Throw custom error message
    }
  }
  
  // Find a user by username
  async function findByUsername(username) {
    try {
      const user = await db("users").where({ username }).first();
      
      if (!user) {
        throw new Error("User not found");
      }
      
      return user;
    } catch (err) {
      console.error("Error finding user:", err); // Log error for debugging
      throw new Error("Could not find user in the database"); // Throw custom error message
    }
  }
  

// Compare password with hashed password
function validatePassword(password, hashedPassword) {
  return bcrypt.compareSync(password, hashedPassword);
}

// Generate JWT token
function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  };
  const secret = process.env.SECRET || "shh"; // Secret key for JWT
  const options = {
    expiresIn: "1h" // Token expiration time
  };

  return jwt.sign(payload, secret, options);
}

module.exports = {
  addUser,
  findByUsername,
  validatePassword,
  generateToken
};
