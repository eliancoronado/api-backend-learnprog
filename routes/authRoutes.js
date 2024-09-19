const express = require('express');
const multer = require('multer');
const authController = require('../controllers/authController');
const Teacher = require('../models/Teacher');
const Curso = require("../models/Cursos")
const Student = require('../models/Students');

const router = express.Router();
const upload = multer(); // Middleware para subir archivos

router.post('/register', upload.single('profileImage'), authController.register);
router.post('/login', authController.login);
router.get("/teachers", async (req, res) => {
    try {
        const teachers = await Teacher.find({}); // Obtenemos solo el nombre, imagen y _id
        res.json(teachers);
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener los profesores' });
      }
});
router.get("/cursos", async (req, res) => {
    try {
        const cursos = await Curso.find({}); // Obtenemos solo el nombre, imagen y _id
        res.json(cursos);
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener los profesores' });
      }
});
router.get("/students", async (req, res) => {
    try {
        const students = await Student.find({}); // Obtenemos solo el nombre, imagen y _id
        res.json(students);
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener los estudiantes' });
      }
});
router.get("/teachers/:id", async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
  }
  res.json(teacher);
});

router.get("/profile/:id/cursos", async (req, res) => {
  try {
      // Busca al profesor por su ID
      const teacher = await Teacher.findById(req.params.id);
      if (!teacher) {
          return res.status(404).json({ error: 'Profesor no encontrado' });
      }
      
      // Busca cursos que tienen el nombre del profesor
      const cursos = await Curso.find({ instructor: teacher.username });
      res.json(cursos);
  } catch (error) {
      res.status(500).json({ error: 'Error al obtener los cursos del profesor' });
  }
});


module.exports = router;
