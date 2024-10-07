const User = require("../models/userModel");

const bcrypt = require("bcryptjs");

const generateToken = require("../utils/generateToken");

const crypto = require("crypto");
const sendEmail = require("../utils/email");

const registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ error: "user already exists" });
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
  });

  if (user) {
    const token = generateToken(user._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "user registered successfully",
      user,
      token,
    });
  } else {
    response.status(400).json({ error: "invalid user data" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  //to check if the user exits
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "user logged in successfully",
      user,
      token,
    });
  } else {
    res.status(401).json({ error: "Invalid email or password" });
  }
};

const logoutUser = (req, res) => {
  // Clear the cookie by setting it to an empty value and an expiration date in the past
  res.cookie("jwt", "", {
    httpOnly: true,
    sameSite: "strict",
    expires: new Date(0), // Set expiration date to the past
  });

  res.status(200).json({
    message: "User logged out successfully",
  });
};

const registerAdmin = async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ error: "user already exists" });
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    isAdmin: true,
  });

  if (user) {
    const token = generateToken(user._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Admin registered successfully",
      user,
      token,
    });
  } else {
    res.status(400).json({ error: "invalid user data" });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (!userExists) {
      res.status(400).json({ message: "user does not exist" });
    }

    if (!userExists.isAdmin) {
      return res.status(403).json({ message: "Access denied. Not an admin." });
    }

    const isPasswordMatch = await userExists.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // if (userExists && (await userExists.matchPassword(password))) {
    const token = generateToken(userExists._id);
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res
      .status(201)
      .json({ message: "user logged in successfully", userExists, token });
    // }
  } catch (error) {
    res.status(400).json({ message: "invalid password or email" });
  }
};

const logoutAdmin = (req, res) => {
  // Clear the cookie by setting it to an empty value and an expiration date in the past
  res.cookie("jwt", "", {
    httpOnly: true,
    sameSite: "strict",
    expires: new Date(0), // Set expiration date to the past
  });

  res.status(200).json({
    message: "Admin logged out successfully",
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  //generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/users/reset-password/${resetToken}`;
  const message = `Your are rreceiving this email because you or someone else has requested a password reset. Please click the following link to reset your password. \n\n ${resetUrl}`;

  await sendEmail({
    email: user.email,
    subject: "Password reset token",
    message,
  });

  res.status(200).json({ success: true, data: "RESET LINK SENT TO EMAIL" });
};


const resetPasswordUser = async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400).json({ message: "invalid token" });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({ success: true, data: "password reset successfully" });
};

const forgotPasswordAdmin = async (req, res) => {
    const { email } = req.body;
    const admin = await User.findOne({ email });

    if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
    }

    // Check if the user is an admin
    if (!admin.isAdmin) {
        return res.status(403).json({ error: "Access denied. Not an admin." });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    admin.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    admin.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Token valid for 10 minutes

    await admin.save();

    // Corrected reset URL to point to /api/admin/reset-password/
    const resetUrl = `${req.protocol}://${req.get("host")}/api/user/admin/reset-password/${resetToken}`;
    
    const message = `You are receiving this email because you requested a password reset for your admin account. Please click the following link to reset your password:\n\n${resetUrl}`;

    try {
        await sendEmail({
            email: admin.email,
            subject: "Admin Password Reset",
            message,
        });
        res.status(200).json({ success: true, data: "RESET LINK SENT TO EMAIL" });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, error: "Failed to send email" });
    }
};

const resetPasswordAdmin = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");

        console.log("Reset token received:", req.params.resetToken);
        console.log("Request body:", req.body);

        const admin = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
            isAdmin: true,
        });

        if (!admin) {
            return res.status(400).json({ message: "Invalid token" });
        }

        if (!req.body.password) {
            return res.status(400).json({ message: "New password is required" });
        }

        admin.password = await bcrypt.hash(req.body.password, 10); // Hash new password
        admin.resetPasswordToken = undefined; // Clear token
        admin.resetPasswordExpire = undefined; // Clear expiration

        await admin.save(); // Save changes to the database

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


////get all users

const getAllUsers = async (req, res) => {
    try {
      const users = await User.find({}, '-password'); // Exclude password from the response
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };



  // getSingleUser function
const getSingleUser = async (req, res) => {
  try {
    // Extract user ID from the request parameters
    const userId = req.params.id;

    // Find the user by ID in the database
    const user = await User.findById(userId);

    if (user) {
      // If the user is found, return the user data
      res.status(200).json({
        message: "User fetched successfully",
        user
      });
    } else {
      // If the user is not found, return a 404 status with a message
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    // Handle any server or database errors
    res.status(500).json({ error: "Server error, please try again" });
  }
};



// updateUserProfile function
const updateUserProfile = async (req, res) => {
  try {
    // Get the user ID from request parameters (or you can get it from the auth token)
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (user) {
      // Update the fields if they are provided in the request body
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      if (req.body.password) {
        user.password = req.body.password; // Make sure to hash this password before saving
      }

      // Save the updated user to the database
      const updatedUser = await user.save();

      // Respond with the updated user information
      res.status(200).json({
        message: "User profile updated successfully",
        user: updatedUser
      });
    } else {
      // If user is not found, return 404 status
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    // Handle any server or database errors
    res.status(500).json({ error: "Server error, please try again" });
  }
};








module.exports = {
  registerUser,
  registerAdmin,
  loginUser,
  forgotPassword,
  loginAdmin,
  logoutUser,
  logoutAdmin,
  resetPasswordUser,
  forgotPasswordAdmin,
  resetPasswordAdmin,
  getAllUsers,
  getSingleUser,
  updateUserProfile
  
};
