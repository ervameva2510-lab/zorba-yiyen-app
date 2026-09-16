const express = require('express');
const router = express.Router();
const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');

// Create SOS Alert
router.post('/create', async (req, res) => {
  try {
    const { userId, location, description } = req.body;

    if (!userId || !location || !description) {
      return res.status(400).json({ error: 'Tüm alanlar gereklidir' });
    }

    const sosAlert = new SOSAlert({
      userId,
      location,
      description,
      status: 'active'
    });

    await sosAlert.save();

    // Notify users in that location
    const helpersInLocation = await User.find({
      'location.city': location.city,
      'location.district': location.district,
      profileCompleted: true,
      isActive: true
    });

    res.json({ 
      success: true, 
      message: 'SOS uyarısı başarıyla gönderildi',
      sosAlert,
      notifiedCount: helpersInLocation.length
    });
  } catch (err) {
    res.status(500).json({ error: 'SOS uyarısı gönderilemedi', message: err.message });
  }
});

// Get Active SOS Alerts by Location
router.get('/location/:city/:district', async (req, res) => {
  try {
    const { city, district } = req.params;

    const alerts = await SOSAlert.find({
      'location.city': city,
      'location.district': district,
      status: 'active'
    }).populate('userId', '-password').sort({ createdAt: -1 });

    res.json({ success: true, alerts });
  } catch (err) {
    res.status(500).json({ error: 'Uyarılar alınamadı', message: err.message });
  }
});

// Respond to SOS Alert
router.post('/:sosId/respond', async (req, res) => {
  try {
    const { userId } = req.body;
    const { sosId } = req.params;

    const sosAlert = await SOSAlert.findById(sosId);

    if (!sosAlert) {
      return res.status(404).json({ error: 'SOS uyarısı bulunamadı' });
    }

    if (sosAlert.status !== 'active') {
      return res.status(400).json({ error: 'Bu SOS uyarısı artık aktif değil' });
    }

    sosAlert.respondingUsers.push({
      userId,
      respondedAt: new Date()
    });

    await sosAlert.save();

    res.json({ success: true, message: 'SOS uyarısına başarıyla yanıt verdiniz', sosAlert });
  } catch (err) {
    res.status(500).json({ error: 'Yanıt verilemedi', message: err.message });
  }
});

// Resolve SOS Alert
router.put('/:sosId/resolve', async (req, res) => {
  try {
    const sosAlert = await SOSAlert.findByIdAndUpdate(
      req.params.sosId,
      {
        status: 'resolved',
        resolvedAt: new Date()
      },
      { new: true }
    );

    res.json({ success: true, message: 'SOS uyarısı çözüldü', sosAlert });
  } catch (err) {
    res.status(500).json({ error: 'SOS uyarısı çözülemedi', message: err.message });
  }
});

module.exports = router;
