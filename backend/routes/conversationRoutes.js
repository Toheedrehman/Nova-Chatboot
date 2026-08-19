const express = require("express");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// GET USER CONVERSATIONS
// =====================================================

router.get("/", protect, async (req, res) => {
  try {
    const conversations =
      await Conversation.find({
        user: req.user._id,
      })
        .sort({ updatedAt: -1 })
        .lean();

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error(
      "Get conversations error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load conversations",
    });
  }
});

// =====================================================
// CREATE CONVERSATION
// =====================================================

router.post("/", protect, async (req, res) => {
  try {
    const conversation =
      await Conversation.create({
        user: req.user._id,
        title:
          req.body.title?.trim() ||
          "New chat",
      });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error(
      "Create conversation error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
});

// =====================================================
// GET MESSAGES
// =====================================================

router.get(
  "/:conversationId/messages",
  protect,
  async (req, res) => {
    try {
      const conversation =
        await Conversation.findOne({
          _id: req.params.conversationId,
          user: req.user._id,
        });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      const messages =
        await Message.find({
          conversation: conversation._id,
          user: req.user._id,
        })
          .sort({ createdAt: 1 })
          .lean();

      res.json({
        success: true,
        messages,
      });
    } catch (error) {
      console.error(
        "Get messages error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to load messages",
      });
    }
  }
);

// =====================================================
// DELETE CONVERSATION
// =====================================================

router.delete(
  "/:conversationId",
  protect,
  async (req, res) => {
    try {
      const conversation =
        await Conversation.findOneAndDelete({
          _id: req.params.conversationId,
          user: req.user._id,
        });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      await Message.deleteMany({
        conversation: conversation._id,
        user: req.user._id,
      });

      res.json({
        success: true,
        message: "Conversation deleted",
      });
    } catch (error) {
      console.error(
        "Delete conversation error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to delete conversation",
      });
    }
  }
);

module.exports = router;