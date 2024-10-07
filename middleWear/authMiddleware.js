const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/userModel");

// middleware to check for authenticated  users if you have a token
const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRETE);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "NOT AUTHORISED, USER NOT FOUND" });
      }
      next();
    } catch (error) {
      return res.status(401).json({ message: "not authorised, token failed" });
    }
  } else {
    return res.status(401).json({ message: "not authorised, no token" });
  }
};


//middleware to check for authenticated admin users
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "not authorised as an admin" });
  }
};

module.exports = { admin, protect };
