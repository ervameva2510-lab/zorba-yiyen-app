const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');

// Create Group
router.post('/create', async (req, res) => {
  try {
    const { name, description, creatorId, location } = req.body;

    if (!name || !description || !creatorId || !location) {
      return res.status(400).json({ error: 'Tüm alanlar gereklidir' });
    }

    const group = new Group({
      name,
      description,
      creatorId,
      location,
      members: [creatorId],
      memberCount: 1
    });

    await group.save();

    res.json({ success: true, message: 'Grup başarıyla oluşturuldu', group });
  } catch (err) {
    res.status(500).json({ error: 'Grup oluşturulamadı', message: err.message });
  }
});

// Get Groups by Location
router.get('/location/:city/:district', async (req, res) => {
  try {
    const { city, district } = req.params;

    const groups = await Group.find({
      'location.city': city,
      'location.district': district,
      isActive: true
    }).populate('creatorId', '-password').select('name description memberCount createdAt');

    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ error: 'Gruplar alınamadı', message: err.message });
  }
});

// Get Group Details
router.get('/:groupId', async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('creatorId members', '-password');

    if (!group) {
      return res.status(404).json({ error: 'Grup bulunamadı' });
    }

    res.json({ success: true, group });
  } catch (err) {
    res.status(500).json({ error: 'Grup alınamadı', message: err.message });
  }
});

// Join Group
router.post('/:groupId/join', async (req, res) => {
  try {
    const { userId } = req.body;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: 'Grup bulunamadı' });
    }

    if (group.members.includes(userId)) {
      return res.status(400).json({ error: 'Zaten bu grubun üyesisiniz' });
    }

    group.members.push(userId);
    group.memberCount = group.members.length;
    await group.save();

    res.json({ success: true, message: 'Gruba başarıyla katıldınız', group });
  } catch (err) {
    res.status(500).json({ error: 'Gruba katılınamadı', message: err.message });
  }
});

// Leave Group
router.post('/:groupId/leave', async (req, res) => {
  try {
    const { userId } = req.body;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ error: 'Grup bulunamadı' });
    }

    group.members = group.members.filter(id => id.toString() !== userId);
    group.memberCount = group.members.length;
    await group.save();

    res.json({ success: true, message: 'Gruptan başarıyla ayrıldınız' });
  } catch (err) {
    res.status(500).json({ error: 'Gruptan ayrılınamadı', message: err.message });
  }
});

// Get User's Groups
router.get('/user/:userId', async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.params.userId,
      isActive: true
    }).populate('creatorId', '-password');

    res.json({ success: true, groups });
  } catch (err) {
    res.status(500).json({ error: 'Gruplar alınamadı', message: err.message });
  }
});

module.exports = router;
