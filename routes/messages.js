const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Send Message
router.post('/send', async (req, res) => {
  try {
    const { senderId, recipientId, content } = req.body;

    if (!senderId || !recipientId || !content) {
      return res.status(400).json({ error: 'Tüm alanlar gereklidir' });
    }

    const message = new Message({
      senderId,
      recipientId,
      content,
      messageType: 'text'
    });

    await message.save();

    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: 'Mesaj gönderilemedi', message: err.message });
  }
});

// Get Messages Between Two Users
router.get('/between/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: userId1, recipientId: userId2 },
        { senderId: userId2, recipientId: userId1 }
      ]
    }).sort({ timestamp: 1 }).populate('senderId recipientId', '-password');

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ error: 'Mesajlar alınamadı', message: err.message });
  }
});

// Get Inbox
router.get('/inbox/:userId', async (req, res) => {
  try {
    const messages = await Message.find({ recipientId: req.params.userId })
      .sort({ timestamp: -1 })
      .populate('senderId', '-password');

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ error: 'Gelen kutusu alınamadı', message: err.message });
  }
});

// Mark Message as Read
router.put('/read/:messageId', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { isRead: true },
      { new: true }
    );

    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: 'Mesaj güncellenemedi', message: err.message });
  }
});

// Delete Message (Admin)
router.delete('/:messageId', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ success: true, message: 'Mesaj silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Mesaj silinemedi', message: err.message });
  }
});

module.exports = router;
