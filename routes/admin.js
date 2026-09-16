const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Policy = require('../models/Policy');
const Message = require('../models/Message');
const Group = require('../models/Group');

// Get All Users (Admin Only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcılar alınamadı', message: err.message });
  }
});

// Ban User
router.put('/users/:userId/ban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: true, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Kullanıcı yasaklandı', user });
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcı yasaklanamadı', message: err.message });
  }
});

// Unban User
router.put('/users/:userId/unban', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: false, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Kullanıcı yasaklaması kaldırıldı', user });
  } catch (err) {
    res.status(500).json({ error: 'Yasaklama kaldırılamadı', message: err.message });
  }
});

// Delete User
router.delete('/users/:userId', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ success: true, message: 'Kullanıcı silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcı silinemedi', message: err.message });
  }
});

// Update Policy & Terms
router.put('/policy', async (req, res) => {
  try {
    const { version, title, content, articles, qurranAyah, updatedBy } = req.body;

    let policy = await Policy.findOne();

    if (!policy) {
      policy = new Policy({
        version,
        title,
        content,
        articles,
        qurranAyah,
        updatedBy
      });
    } else {
      policy.version = version || policy.version + 1;
      policy.title = title || policy.title;
      policy.content = content || policy.content;
      policy.articles = articles || policy.articles;
      policy.qurranAyah = qurranAyah || policy.qurranAyah;
      policy.updatedBy = updatedBy;
      policy.updatedAt = new Date();
    }

    await policy.save();

    res.json({ success: true, message: 'Politika güncellendi', policy });
  } catch (err) {
    res.status(500).json({ error: 'Politika güncellenemedi', message: err.message });
  }
});

// Get Policy
router.get('/policy', async (req, res) => {
  try {
    const policy = await Policy.findOne().populate('updatedBy', '-password');
    res.json({ success: true, policy });
  } catch (err) {
    res.status(500).json({ error: 'Politika alınamadı', message: err.message });
  }
});

// Delete Message
router.delete('/messages/:messageId', async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ success: true, message: 'Mesaj silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Mesaj silinemedi', message: err.message });
  }
});

// Get All Messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find({})
      .populate('senderId recipientId', '-password')
      .sort({ timestamp: -1 });

    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ error: 'Mesajlar alınamadı', message: err.message });
  }
});

// Get Statistics
router.get('/statistics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalGroups = await Group.countDocuments();
    const totalMessages = await Message.countDocuments();

    res.json({
      success: true,
      statistics: {
        totalUsers,
        activeUsers,
        bannedUsers,
        totalGroups,
        totalMessages
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'İstatistikler alınamadı', message: err.message });
  }
});

module.exports = router;
