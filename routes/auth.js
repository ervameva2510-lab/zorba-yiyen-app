const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'zorba-yiyen-secret-key-2024';

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir' });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre yanlış' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'Hesabınız yasaklanmıştır' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre yanlış' });
    }

    const token = jwt.encode(
      {
        userId: user._id,
        username: user.username,
        isAdmin: user.isAdmin
      },
      JWT_SECRET
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        profileCompleted: user.profileCompleted,
        isAdmin: user.isAdmin
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Giriş başarısız', message: err.message });
  }
});

// Register Route (Admin tarafından kullanıcı oluşturma)
router.post('/register', async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      isAdmin: isAdmin || false
    });

    await newUser.save();

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: {
        id: newUser._id,
        username: newUser.username
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcı oluşturma başarısız', message: err.message });
  }
});

// Token Verification
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Token gereklidir' });
    }

    const decoded = jwt.decode(token, JWT_SECRET);
    res.json({ success: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Geçersiz token', message: err.message });
  }
});

module.exports = router;
