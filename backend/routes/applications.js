const express = require("express");
const { body } = require("express-validator");
const applicationController = require("../controllers/applicationController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.use(protect);

const createValidation = [
  body("companyName").trim().notEmpty().withMessage("Company name is required"),
  body("role").trim().notEmpty().withMessage("Role is required"),
  body("status")
    .optional()
    .isIn(["Applied", "Interview", "Offer", "Rejected"])
    .withMessage("Invalid status"),
  body("dateApplied").optional().isISO8601().withMessage("Invalid date format"),
];

const updateStatusValidation = [
  body("status")
    .isIn(["Applied", "Interview", "Offer", "Rejected"])
    .withMessage("Invalid status value"),
];

router
  .route("/")
  .get(applicationController.getAllApplications)
  .post(validate(createValidation), applicationController.createApplication);

router
  .route("/:id")
  .get(applicationController.getApplication)
  .put(applicationController.updateApplication)
  .delete(applicationController.deleteApplication);

router.patch("/:id/status", validate(updateStatusValidation), applicationController.updateStatus);

module.exports = router;
