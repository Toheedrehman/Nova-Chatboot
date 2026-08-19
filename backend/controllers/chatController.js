const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { generateReply } = require("../utils/aiClient");

// POST /api/chat/:conversationId
async function sendMessage(req, res, next) {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    // Find conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    // Get previous messages BEFORE adding the new one
    const previousMessages = await Message.find({
      conversation: conversationId,
    }).sort({ createdAt: 1 });

    // Save user message
    await Message.create({
      conversation: conversationId,
      role: "user",
      content: content.trim(),
    });

    // Build history for Gemini
    const history = [
      ...previousMessages,
      {
        role: "user",
        content: content.trim(),
      },
    ];

    // Generate AI response using Gemini
    const replyText = await generateReply(history);

    // Save assistant message
    const assistantMessage = await Message.create({
      conversation: conversationId,
      role: "assistant",
      content: replyText,
    });

    // Give a new conversation a title
    if (!conversation.title || conversation.title === "New chat") {
      conversation.title = content.trim().slice(0, 40);
      await conversation.save();
    }

    return res.status(201).json(assistantMessage);
  } catch (error) {
    console.error("[chat] Error:", error);
    next(error);
  }
}

module.exports = {
  sendMessage,
};