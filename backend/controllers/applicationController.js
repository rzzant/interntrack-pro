const Application = require("../models/Application");
const AppError = require("../utils/AppError");

exports.getAllApplications = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1) Filtering
    const { search, status, sortBy = "createdAt", sortOrder = "desc", page = 1, limit = 10 } = req.query;

    let query = { user: userId };

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    // 2) Sorting
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // 3) Pagination
    const skip = (page - 1) * limit;

    const applications = await Application.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Application.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications,
      },
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createApplication = async (req, res, next) => {
  try {
    const { companyName, role, status, dateApplied, notes, location, salary, jobUrl } = req.body;

    const maxOrder = await Application.findOne({
      user: req.user._id,
      status: status || "Applied",
    })
      .sort({ kanbanOrder: -1 })
      .select("kanbanOrder");

    const application = await Application.create({
      user: req.user._id,
      companyName,
      role,
      status: status || "Applied",
      dateApplied: dateApplied || new Date(),
      notes: notes || "",
      location: location || "",
      salary: salary || "",
      jobUrl: jobUrl || "",
      kanbanOrder: (maxOrder?.kanbanOrder || 0) + 1,
    });

    res.status(201).json({
      status: 'success',
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { status, kanbanOrder } = req.body;

    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    application.status = status;
    if (kanbanOrder !== undefined) application.kanbanOrder = kanbanOrder;
    await application.save();

    res.status(200).json({
      status: 'success',
      data: {
        application,
      },
    });
  } catch (error) {
    next(error);
  }
};
