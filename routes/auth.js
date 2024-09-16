const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const multer = require('multer');

// Configuración de multer para cargar imágenes
const upload = multer({ dest: 'uploads/' });

// Clave secreta para JWT
const JWT_SECRET = 'supersecretkey';



// Ruta de registro
router.post('/register', upload.single('image'), async (req, res) => {
  const { name, email, password } = req.body;
  const imageFile = req.file; // Archivo de imagen

  try {
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // Subir la imagen a imgbb.com
    const formData = new FormData();
    formData.append('key', 'c18be72a3353447ab8137cc8489b5cd1'); // Reemplaza con tu API key de imgbb
    formData.append('image', imageFile.buffer.toString('base64'));

    const imgbbResponse = await axios.post('https://api.imgbb.com/1/upload', formData);

    const imageUrl = imgbbResponse.data.data.url; // URL de la imagen subida

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el nuevo usuario
    user = new User({
      name,
      email,
      password: hashedPassword,
      image: imageUrl,
    });

    await user.save();

    // Crear el token JWT
    const payload = { user: { id: user.id } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta de login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Crear el token JWT
    const payload = { user: { id: user.id } };
    jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el servidor');
  }
});

module.exports = router;
