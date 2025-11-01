import Chat from '../models/Chat.js';

//API controller for new chats
export const createChat = async (req, res) => {
  try {
    const userId = req.user._id;

    const chatData = {
      userId,
      messages: [],
      name: "New Chat",
      userName: req.user.name
    }

    await Chat.create(chatData);
    res.json({ success: true, message: "Chat created successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

//API controller to fetch all chats of a user
export const getChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
    res.json({ success: true, chats });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

//API controller to delete a chat
export const deleteChat = async (req, res) => {
  try {
    const userId = req.user._id;

    const { chatId } = req.body;

    await Chat.deleteOne({ _id: chatId, userId });
    res.json({ success: true, message: "Chat deleted successfully" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}