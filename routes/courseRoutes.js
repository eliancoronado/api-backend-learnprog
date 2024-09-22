const express = require('express');
const Teacher = require('../models/Teacher');
const Curso = require("../models/Cursos")
const Student = require('../models/Students');

const router = express.Router();

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
  router.get('/usuarioinfo/:user', async (req, res) => {
    try {
        const teacher = await Teacher.findOne({username: req.params.user});
        if (!teacher) {
          const students = await Student.findOne({username: req.params.user});
          return res.status(200).json(students);
        }
        res.status(200).json(teacher);
    } catch (error) {
        return res.status(500).json({ message: 'Error en el servidor' });
    }
});


  module.exports = router;