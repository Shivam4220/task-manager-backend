const express = require("express");

const Task = require("../models/Task");
const adminMiddleware = require("../middleware/adminMiddleware");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    const task = await Task.create({
      title,
      description,
      user: req.user.id,
    });

    res.json({
      message: "Task created",
      task,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
});
router.get("/my-tasks", authMiddleware, async (req, res) => {
  try {
    const filter = {
      user: req.user.id,
    };
    if (req.query.search) {
      filter.title = {
        $regex: req.query.search,
        $options: "i",
      };
    }

    if (req.query.completed) {
      filter.completed = req.query.completed === "true";
    }

    // const tasks = await Task.find(filter);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    // const tasks = await Task.find(filter)
    //   .skip((page - 1) * limit)
    //   .limit(limit);
    const sortBy = req.query.sortBy || "createdAt";

    const tasks = await Task.find(filter)
      .sort({ [sortBy]: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(tasks);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
});
router.put("/update/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.json({
        message: "Task not found",
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.json({
        message: "Unauthorized",
      });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.json({
      message: "Task updated",
      updatedTask,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
});
router.delete("/delete/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.json({
        message: "Task not found",
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.json({
        message: "Unauthorized",
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      message: "Task deleted",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
});
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find().populate("user", "email role");

    res.json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
});
module.exports = router;
