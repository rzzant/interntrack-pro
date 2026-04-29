const Application = require("../models/Application");
const AppError = require("../utils/AppError");

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1) Status counts
    const statusCounts = await Application.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats = {
      total: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    statusCounts.forEach(({ _id, count }) => {
      stats.total += count;
      const key = _id.toLowerCase();
      if (stats[key] !== undefined) stats[key] = count;
    });

    // 2) Monthly data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Application.aggregate([
      {
        $match: {
          user: userId,
          dateApplied: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateApplied" },
            month: { $month: "$dateApplied" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const monthNames = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const chartData = monthlyData.map(({ _id, count }) => ({
      month: `${monthNames[_id.month - 1]} ${_id.year}`,
      applications: count,
    }));

    // 3) Success rate
    const successRate =
      stats.total > 0
        ? Math.round(((stats.offer + stats.interview) / stats.total) * 100)
        : 0;

    // 4) Recent activity
    const recentApplications = await Application.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("companyName role status createdAt");

    res.status(200).json({
      status: 'success',
      data: {
        stats,
        chartData,
        successRate,
        recentApplications,
      }
    });
  } catch (error) {
    next(error);
  }
};
