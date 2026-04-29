/**
 * Application Model
 * Stores internship/job application data
 *
 * Status Flow: Applied → Interview → Offer (or Rejected at any stage)
 */

const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for faster queries per user
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
      maxlength: [100, "Role cannot exceed 100 characters"],
    },
    status: {
      type: String,
      enum: {
        values: ["Applied", "Interview", "Offer", "Rejected"],
        message: "Status must be one of: Applied, Interview, Offer, Rejected",
      },
      default: "Applied",
    },
    dateApplied: {
      type: Date,
      required: [true, "Date applied is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
    },
    // Extra fields for richer tracking
    location: {
      type: String,
      trim: true,
      default: "",
    },
    salary: {
      type: String,
      trim: true,
      default: "",
    },
    jobUrl: {
      type: String,
      trim: true,
      default: "",
    },
    // For Kanban board ordering
    kanbanOrder: {
      type: Number,
      default: 0,
    },
    // Track when status was last updated (for follow-up suggestions)
    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Update statusUpdatedAt when status changes ───────────────────────────────
applicationSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusUpdatedAt = new Date();
  }
  next();
});

// ─── Virtual: Days since applied ─────────────────────────────────────────────
applicationSchema.virtual("daysSinceApplied").get(function () {
  const now = new Date();
  const applied = new Date(this.dateApplied);
  return Math.floor((now - applied) / (1000 * 60 * 60 * 24));
});

// ─── Virtual: Follow-up suggestion (no update after 7 days in "Applied") ─────
applicationSchema.virtual("needsFollowUp").get(function () {
  if (this.status !== "Applied") return false;
  const daysSinceUpdate = Math.floor(
    (new Date() - new Date(this.statusUpdatedAt)) / (1000 * 60 * 60 * 24)
  );
  return daysSinceUpdate >= 7;
});

// Enable virtuals in JSON output
applicationSchema.set("toJSON", { virtuals: true });
applicationSchema.set("toObject", { virtuals: true });

// ─── Compound index for efficient user queries ────────────────────────────────
applicationSchema.index({ user: 1, createdAt: -1 });
applicationSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("Application", applicationSchema);
