const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get User Profile
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Profil alınamadı', message: err.message });
  }
});

// Update User Profile (Profile Creation)
router.put('/:userId/profile', async (req, res) => {
  try {
    const { profilePhoto, location, sportStatus, fitnessStatus, tag, sözleşmeKabul, politikaKabul } = req.body;

    // Validation - Tüm alanlar zorunlu
    if (!profilePhoto || !location || !sportStatus || !fitnessStatus || !tag) {
      return res.status(400).json({ 
        error: 'Tüm Alanları Doldurunuz!',
        missing: {
          photo: !profilePhoto,
          location: !location,
          sport: !sportStatus,
          fitness: !fitnessStatus,
          tag: !tag
        }
      });
    }

    if (!sözleşmeKabul || !politikaKabul) {
      return res.status(400).json({ error: 'Sözleşme ve Politikayı kabul etmelisiniz' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        profilePhoto,
        location,
        sportStatus,
        fitnessStatus,
        tag,
        sözleşmeKabul,
        politikaKabul,
        profileCompleted: true,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Profil başarıyla oluşturuldu',
      user 
    });
  } catch (err) {
    res.status(500).json({ error: 'Profil güncellenemedi', message: err.message });
  }
});

// Get Users by Filter
router.post('/filter', async (req, res) => {
  try {
    const { location, sportType, height, weight, fitnessStatus, tag } = req.body;

    let query = { profileCompleted: true };

    if (location) {
      query['location.city'] = location.city;
      if (location.district) {
        query['location.district'] = location.district;
      }
    }

    if (sportType) {
      query.sportStatus = sportType;
    }

    if (fitnessStatus) {
      query.fitnessStatus = fitnessStatus;
    }

    if (tag) {
      query.tag = tag;
    }

    const users = await User.find(query).select('-password');

    res.json({ 
      success: true, 
      count: users.length,
      users 
    });
  } catch (err) {
    res.status(500).json({ error: 'Filtreleme başarısız', message: err.message });
  }
});

module.exports = router;
