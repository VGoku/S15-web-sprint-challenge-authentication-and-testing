
//   /*
//     IMPLEMENT

//     1- On valid token in the Authorization header, call next.

//     2- On missing token in the Authorization header,
//       the response body should include a string exactly as follows: "token required".

//     3- On invalid or expired token in the Authorization header,
//       the response body should include a string exactly as follows: "token invalid".
//   */
//  // 1. Check for token in the Authorization header
//  if (!token) {
//   return res.status(401).json({ message: "token required" });
// }

// // 2. Verify the token
// jwt.verify(token, secret, (err, decodedToken) => {
//   if (err) {
//     // Invalid or expired token
//     return res.status(401).json({ message: "token invalid" });
//   }

//   // If the token is valid, attach the decoded info to the request
//   req.user = decodedToken;

//   // 3. Proceed to the next middleware or route handler
//   next();
// });
// };

const jwt = require("jsonwebtoken");
const secret = process.env.SECRET || "shh";

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  // 1. Check for token in the Authorization header
  if (!token) {
    return res.status(401).json({ message: "token required" });
  }

  // 2. Verify the token
  jwt.verify(token, secret, (err, decodedToken) => {
    if (err) {
      // Invalid or expired token
      return res.status(401).json({ message: "token invalid" });
    }

    // If the token is valid, attach the decoded info to the request
    req.user = decodedToken;

    // 3. Proceed to the next middleware or route handler
    next();
  });
};
