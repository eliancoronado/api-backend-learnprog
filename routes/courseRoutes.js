const express = require('express');
const Teacher = require('../models/Teacher');
const Curso = require("../models/Cursos")
const Student = require('../models/Students');
const FormData = require('form-data');
const ImageKit = require('imagekit');
const axios = require('axios');

const router = express.Router();

const imagekit = new ImageKit({
  publicKey: "public_Nz8PjU7igIvb4HJUoNUz4zh1+js=", // Asegúrate de configurar tus claves en variables de entorno
  privateKey: "private_suEbQaCw1Z3X8R79tvApi2WYZYk=",
  urlEndpoint: "https://ik.imagekit.io/41m0ikyq6"
});

router.post('/cursos/:id/vistas', async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });
  
        await curso.aumentarVistas();
        res.status(200).json(curso);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
  });
  router.post('/cursos/:id/likes', async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });
  
        await curso.toggleLike(req.body.userId);
        res.status(200).json(curso);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
  });
  router.get('/cursos/:id', async (req, res) => {
    try {
        const curso = await Curso.findById(req.params.id);
        if (!curso) return res.status(404).json({ message: 'Curso no encontrado' });
        res.status(200).json(curso);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
    });
  router.get('/usuarioinfo/:email', async (req, res) => {
    try {
        const teacher = await Teacher.findOne({email: req.params.email});
        if (!teacher) {
          const students = await Student.findOne({email: req.params.email});
          return res.status(200).json(students);
        }
        res.status(200).json(teacher);
    } catch (error) {
        return res.status(500).json({ message: 'Error en el servidor' });
    }
  });
  router.get('/teacherinfo/:username', async (req, res) => {
    try {
        const teacher = await Teacher.findOne({username: req.params.username});
        res.status(200).json(teacher);
    } catch (error) {
        return res.status(500).json({ message: 'Error en el servidor' });
    }
  });


const multer = require('multer');
const upload = multer();

router.put('/updateProfile/:id', upload.single('profileImage'), async (req, res) => {
  const { username } = req.body;
  const image = req.file;
  let profileImageUrl;

  try {
    // Verificar si es un estudiante o profesor
    const user = await Student.findById(req.params.id);
    let isTeacher = false;

    if (!user) {
      // Si no se encuentra un estudiante, buscar un profesor
      const teacher = await Teacher.findById(req.params.id);
      if (!teacher) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      isTeacher = true; // Es un profesor

      // Manejo de imagen
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

      // Actualizar los datos del profesor
      teacher.username = username || teacher.username;
      teacher.profileImageUrl = profileImageUrl || teacher.profileImageUrl;

      // Guardar los cambios en la base de datos
      const updatedTeacher = await teacher.save();
      return res.status(200).json(updatedTeacher);
    }
    // Manejo de imagen
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

    // Actualizar los datos del estudiante
    user.username = username || user.username;
    user.profileImageUrl = profileImageUrl || user.profileImageUrl;

    // Guardar los cambios en la base de datos
    const updatedUser = await user.save();
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar el perfil' });
  }
});

module.exports = router;