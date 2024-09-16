const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose")
const authRoutes = require('./routes/auth');
const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://cuentaparaelian12:HAayjRGRYOSk4F1B@cluster0.citmxdl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Definir el esquema y modelo del curso
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

app.get('/api/cursos', async (req, res) => {
    try {
        const cursos = await Curso.find({});
        res.json(cursos);
    } catch (err) {
        res.status(500).send('Error en el servidor');
    }
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));