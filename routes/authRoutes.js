const express = require('express');
const multer = require('multer');
const authController = require('../controllers/authController');
const Teacher = require('../models/Teacher');
const Curso = require("../models/Cursos")

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

module.exports = router;
