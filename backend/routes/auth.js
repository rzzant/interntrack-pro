const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

// ─── VALIDATION SCHEMAS ─────────────────────────────
const registerValidation = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// ─── ROUTES ─────────────────────────────────────────
router.post("/register", validate(registerValidation), authController.register);
router.post("/login", validate(loginValidation), authController.login);

router.use(protect); // Protect all routes below this point

router.get("/me", authController.getMe);
router.put("/me", authController.updateMe);

module.exports = router;