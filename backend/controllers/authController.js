const User = require("../models/User");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

// 🔐 Generate JWT (include role for RBAC)
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// 🍪 Send token (cookie + JSON)
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user);

  // Remove password from output
  user.password = undefined;

  // httpOnly cookie (prevents XSS access)
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    status: "success",
    token, // still send for frontend convenience
    data: {
      user: user.toSafeObject(),
    },
  });
};

// 🧾 REGISTER
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return next(new AppError("All fields are required", 400));
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return next(new AppError("Invalid email format", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("User already exists", 409));
    }

    const newUser = await User.create({
      name,
      email,
      password,
      // role defaults to 'student'
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// 🔑 LOGIN
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password!", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// 👤 GET CURRENT USER
exports.getMe = async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
};

// ✏️ UPDATE PROFILE (safe)
exports.updateMe = async (req, res, next) => {
  try {
    // Block password updates here
    if (req.body.password) {
      return next(new AppError("Use /updatePassword route instead", 400));
    }

    const { name, preferences } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (preferences) updates.preferences = preferences;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};