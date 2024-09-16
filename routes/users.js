const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importar el modelo User

// Ruta para obtener todos los usuarios
router.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); // Obtener todos los usuarios
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
