const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get Profiles with Filters
router.post('/filter', async (req, res) => {
  try {
    const { 
      location, 
      sportStatus, 
      fitnessStatus, 
      tag,
      height,
      weight 
    } = req.body;

    let query = { 
      profileCompleted: true,
      isActive: true,
      isBanned: false 
    };

    if (location) {
      query['location.city'] = location.city;
      if (location.district) {
        query['location.district'] = location.district;
      }
    }

    if (sportStatus) {
      query.sportStatus = sportStatus;
    }

    if (fitnessStatus) {
      query.fitnessStatus = fitnessStatus;
    }

    if (tag) {
      query.tag = tag;
    }

    const profiles = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: profiles.length,
      profiles 
    });
  } catch (err) {
    res.status(500).json({ error: 'Profiller alınamadı', message: err.message });
  }
});

// Get Profile by ID
router.get('/:userId', async (req, res) => {
  try {
    const profile = await User.findById(req.params.userId).select('-password');

    if (!profile || !profile.profileCompleted) {
      return res.status(404).json({ error: 'Profil bulunamadı' });
    }

    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: 'Profil alınamadı', message: err.message });
  }
});

module.exports = router;
