const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data'); // Asegúrate de tener este import
const Teacher = require('../models/Teacher');
const Student = require('../models/Students');

// Registro de usuario
const DEFAULT_IMAGE_URL = 'https://i.postimg.cc/zvgYtwSn/logofaceboo.webp';

exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;
  const image = req.file; // Verificamos si se ha subido una imagen

  try {
    let profileImageUrl = DEFAULT_IMAGE_URL; // URL por defecto

    // Subir imagen a imgbb solo si hay imagen
    if (image) {
      const formData = new FormData();
      formData.append('image', image.buffer.toString('base64'));
    
      const imgbbResponse = await axios.post(`https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`, formData);
      console.log('Respuesta de imgbb:', imgbbResponse.data); // Revisa qué URL se está generando
      
      profileImageUrl = imgbbResponse.data.data.url; // Asegúrate de obtener el URL correcto
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verificar el rol y crear el usuario adecuado
    let newUser;
    if (role === 'teacher') {
      newUser = new Teacher({ username, email, password: hashedPassword, profileImageUrl });
    } else if (role === 'student') {
      newUser = new Student({ username, email, password: hashedPassword, profileImageUrl });
    } else {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    // Guardar usuario en la base de datos
    await newUser.save();

    // Crear token
    const token = jwt.sign({ id: newUser._id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Devolver token y datos del usuario
    res.json({
      token,
      user: {
        username: newUser.username,
        email: newUser.email,
        profileImageUrl: newUser.profileImageUrl,
        role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el registro', error });
  }
};


// Login de usuario
// Login de usuario
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Primero intenta buscar al usuario como profesor
    let user = await Teacher.findOne({ email });
    let role = 'teacher';

    // Si no es un profesor, intenta buscarlo como estudiante
    if (!user) {
      user = await Student.findOne({ email });
      role = 'student';
    }

    // Si no se encuentra en ninguno de los dos roles, devuelve error
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Comparar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Crear el token JWT
    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Devolver token y datos del usuario
    res.json({
      token,
      user: {
        username: user.username,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el login', error });
  }
};
