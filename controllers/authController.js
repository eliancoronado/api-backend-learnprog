const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const ImageKit = require('imagekit');
const Teacher = require('../models/Teacher');
const Student = require('../models/Students');

// Inicialización del SDK de ImageKit
const imagekit = new ImageKit({
    publicKey: "public_Nz8PjU7igIvb4HJUoNUz4zh1+js=", // Asegúrate de configurar tus claves en variables de entorno
    privateKey: "private_suEbQaCw1Z3X8R79tvApi2WYZYk=",
    urlEndpoint: "https://ik.imagekit.io/41m0ikyq6"
});

// URL por defecto para la imagen de perfil
const DEFAULT_IMAGE_URL = 'https://i.postimg.cc/zvgYtwSn/logofaceboo.webp';

exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;
    const image = req.file; // Verificamos si se ha subido una imagen

    try {
        let profileImageUrl = DEFAULT_IMAGE_URL; // Inicializamos con la URL por defecto

        // Subir imagen a ImageKit.io solo si hay imagen
        if (image) {
            try {
                const result = await imagekit.upload({
                    file: image.buffer.toString('base64'), // Convertimos la imagen a base64
                    fileName: image.originalname,
                    tags: ["user_profile"] // Puedes agregar etiquetas personalizadas
                });

                // Actualizamos la URL de la imagen de perfil
                profileImageUrl = result.url;
            } catch (imageError) {
                console.error('Error al subir la imagen:', imageError);
                return res.status(500).json({ message: 'Error al subir la imagen', error: imageError.message });
            }
        }

        // Hashear la contraseña
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
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error en el registro', error: error.message });
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
