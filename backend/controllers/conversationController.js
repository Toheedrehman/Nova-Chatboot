const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// GET /api/conversations
async function listConversations(req, res) {
  try {
    const conversations = await Conversation.find().sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Failed to load conversations", error: err.message });
  }
}

// POST /api/conversations
async function createConversation(req, res) {
  try {
    const title = (req.body?.title || "New chat").slice(0, 80);
    const conversation = await Conversation.create({ title });
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({ message: "Failed to create conversation", error: err.message });
  }
}

// DELETE /api/conversations/:id
async function deleteConversation(req, res) {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findByIdAndDelete(id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    await Message.deleteMany({ conversation: id });
    res.json({ message: "Conversation deleted", id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete conversation", error: err.message });
  }
}

// GET /api/conversations/:id/messages
async function getMessages(req, res) {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({ conversation: id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to load messages", error: err.message });
  }
}

module.exports = {
  listConversations,
  createConversation,
  deleteConversation,
  getMessages,
};
