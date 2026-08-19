const express = require("express");

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const protect = require("../middleware/authMiddleware");

const {
  generateReply,
} = require("../utils/aiClient")

const router = express.Router();

// =====================================================
// SEND MESSAGE TO NOVA
// =====================================================

router.post(
  "/:conversationId",
  protect,
  async (req, res) => {
    try {
      const { message } = req.body;

      // -----------------------------------------------
      // VALIDATE
      // -----------------------------------------------

      if (
        !message ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      const cleanMessage =
        message.trim();

      // -----------------------------------------------
      // FIND USER'S CONVERSATION
      // -----------------------------------------------

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

      // -----------------------------------------------
      // SAVE USER MESSAGE
      // -----------------------------------------------

      const userMessage =
        await Message.create({
          conversation:
            conversation._id,

          user: req.user._id,

          role: "user",

          content: cleanMessage,
        });

      // -----------------------------------------------
      // GET CONVERSATION HISTORY
      // -----------------------------------------------

      const history =
        await Message.find({
          conversation:
            conversation._id,
          user: req.user._id,
        })
          .sort({ createdAt: 1 })
          .lean();

      // -----------------------------------------------
      // SEND HISTORY TO GEMINI
      // -----------------------------------------------

      const aiReply =
        await generateReply(
          history
        );

      // -----------------------------------------------
      // SAVE NOVA RESPONSE
      // -----------------------------------------------

      const assistantMessage =
        await Message.create({
          conversation:
            conversation._id,

          user: req.user._id,

          role: "assistant",

          content: aiReply,
        });

      // -----------------------------------------------
      // UPDATE CONVERSATION TITLE
      // -----------------------------------------------

      if (
        !conversation.title ||
        conversation.title ===
          "New chat"
      ) {
        conversation.title =
          cleanMessage.slice(0, 40);
      }

      await conversation.save();

      // -----------------------------------------------
      // RETURN TO FRONTEND
      // -----------------------------------------------

      res.json({
        success: true,

        message: {
          _id: assistantMessage._id,

          id: assistantMessage._id,

          conversation:
            conversation._id,

          role: "assistant",

          content:
            assistantMessage.content,

          createdAt:
            assistantMessage.createdAt,
        },

        userMessage: {
          _id: userMessage._id,

          id: userMessage._id,

          conversation:
            conversation._id,

          role: "user",

          content:
            userMessage.content,

          createdAt:
            userMessage.createdAt,
        },
      });
    } catch (error) {
      console.error(
        "Nova chat error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Nova failed to generate a response",
      });
    }
  }
);

module.exports = router;