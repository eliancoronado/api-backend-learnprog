const express = require('express');
const Teacher = require('../models/Teacher');
const Curso = require("../models/Cursos");
const Student = require('../models/Students');
const FormData = require('form-data');
const ImageKit = require('imagekit');
const axios = require('axios');
const Post = require('../models/Post');
const multer = require('multer');
const router = express.Router();

const imagekit = new ImageKit({
  publicKey: "public_Nz8PjU7igIvb4HJUoNUz4zh1+js=",
  privateKey: "private_suEbQaCw1Z3X8R79tvApi2WYZYk=",
  urlEndpoint: "https://ik.imagekit.io/41m0ikyq6"
});

// Configuración de multer para la subida de imágenes
const upload = multer();

// Función que exporta las rutas, aceptando `io` como parámetro
module.exports = function(io) {

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

  router.put('/updateProfile/:id', upload.single('profileImage'), async (req, res) => {
    const { username } = req.body;
    const image = req.file;
    let profileImageUrl;

    try {
      const user = await Student.findById(req.params.id);
      let isTeacher = false;

      if (!user) {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        isTeacher = true;

        if (image) {
          try {
            const result = await imagekit.upload({
              file: image.buffer.toString('base64'),
              fileName: image.originalname,
              tags: ["user_profile"]
            });

            profileImageUrl = result.url;
          } catch (imageError) {
            console.error('Error al subir la imagen:', imageError);
            return res.status(500).json({ message: 'Error al subir la imagen', error: imageError.message });
          }
        }

        teacher.username = username || teacher.username;
        teacher.profileImageUrl = profileImageUrl || teacher.profileImageUrl;
        const updatedTeacher = await teacher.save();
        return res.status(200).json(updatedTeacher);
      }

      if (image) {
        try {
          const result = await imagekit.upload({
            file: image.buffer.toString('base64'),
            fileName: image.originalname,
            tags: ["user_profile"]
          });

          profileImageUrl = result.url;
        } catch (imageError) {
          console.error('Error al subir la imagen:', imageError);
          return res.status(500).json({ message: 'Error al subir la imagen', error: imageError.message });
        }
      }

      user.username = username || user.username;
      user.profileImageUrl = profileImageUrl || user.profileImageUrl;
      const updatedUser = await user.save();
      
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
      res.status(500).json({ message: 'Error del servidor al actualizar el perfil' });
    }
  });

  router.get('/buscar', async (req, res) => {
    try {
      const { query } = req.query;
      const cursos = await Curso.find({
        titulo: { $regex: query, $options: 'i' }
      });
      res.json(cursos);
    } catch (error) {
      res.status(500).json({ error: 'Error al buscar cursos' });
    }
  });

  router.post('/posts', async (req, res) => {
    const { title, message, userId } = req.body;

    try {
      const user = await Student.findById(userId);
      let isTeacher = false;

      if (!user) {
        const teacher = await Teacher.findById(userId);
        if (!teacher) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        isTeacher = true;
      }

      const newPost = new Post({
        title,
        message,
        user: userId,
        userType: isTeacher ? 'teacher' : 'student',
      });

      await newPost.save();
      const populatedPost = await newPost.populate({
        path: 'user',
        select: 'username email profileImageUrl',
        model: isTeacher ? Teacher : Student, // Usa el modelo correcto dependiendo del tipo de usuario
      });
  
      io.emit('newPost', populatedPost); // Emitir el post ya populado
      return res.status(201).json(populatedPost);
    } catch (error) {
      console.error('Error al crear la publicación:', error);
      return res.status(500).json({ message: 'Error del servidor al crear la publicación' });
    }
  });

  router.get('/posts', async (req, res) => {
    try {
      const posts = await Post.find();

      const populatedPosts = await Promise.all(posts.map(async (post) => {
        let user;
        if (post.userType === 'student') {
          user = await Student.findById(post.user).select('username email profileImageUrl');
        } else if (post.userType === 'teacher') {
          user = await Teacher.findById(post.user).select('username email profileImageUrl');
        }
        return { ...post.toObject(), user };
      }));

      res.json(populatedPosts);
    } catch (error) {
      console.error('Error al obtener publicaciones:', error);
      res.status(500).json({ message: 'Error del servidor al obtener publicaciones' });
    }
  });

  router.post('/posts/:id/like', async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      await post.toggleLikePost(req.body.userId);
      res.json(post);
    } catch (error) {
      console.error('Error al dar like a la publicación:', error);
      res.status(500).json({ message: 'Error del servidor al dar like a la publicación' });
    }
  });

  return router;
}
