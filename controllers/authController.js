const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const Teacher = require('../models/Teacher');

// Registro de usuario
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const image = req.file;

  try {
    // Subir imagen a imgbb
    const formData = new FormData();
    formData.append('image', image.buffer.toString('base64'));

    const imgbbResponse = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, formData);
    const profileImageUrl = imgbbResponse.data.data.url;

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newTeacher = new Teacher({ username, email, password: hashedPassword, profileImageUrl });
    await newTeacher.save();

    // Crear token
    const token = jwt.sign({ id: newTeacher._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error en el registro', error });
  }
};

// Login de usuario
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(404).json({ message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error en el login', error });
  }
};
