const mongoose = require('mongoose');

const cursoSchema = new mongoose.Schema({
    clave: String,
    titulo: String,
    instructor: String,
    video_url: String,
    syllabus: [String],
    descripcion: String, // Nueva descripción del curso
    image_url: String,   // URL de la imagen del curso
    precio: String       // Precio del curso
});

const Curso = mongoose.model('Curso', cursoSchema);

module.exports = Curso;