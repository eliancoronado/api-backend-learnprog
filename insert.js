const mongoose = require('mongoose');

// Conectar a la base de datos
mongoose.connect("mongodb+srv://cuentaparaelian12:HAayjRGRYOSk4F1B@cluster0.citmxdl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const cursoSchema = new mongoose.Schema({
    clave: String,
    titulo: String,
    instructor: String,
    video_url: String,
    syllabus: [String], // Temario del curso
    descripcion: String, // Descripción del curso
    image_url: String,   // URL de la imagen del curso
    precio: String,      // Precio del curso
    vistas: {            // Conteo de vistas por usuario
        type: Number,
        default: 0
    },
    likes: {             // Conteo de likes
        type: Number,
        default: 0
    },
    usuariosLikes: [      // Almacenar usuarios que han dado like para evitar más de uno
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        }
    ]
});

// Método para aumentar vistas
cursoSchema.methods.aumentarVistas = function() {
    this.vistas += 1;
    return this.save();
};

// Método para manejar likes
cursoSchema.methods.toggleLike = function(userId) {
    const index = this.usuariosLikes.indexOf(userId);

    if (index === -1) {
        // Si el usuario no ha dado like, lo añadimos
        this.usuariosLikes.push(userId);
        this.likes += 1;
    } else {
        // Si ya dio like, lo removemos
        this.usuariosLikes.splice(index, 1);
        this.likes -= 1;
    }

    return this.save();
};

const Curso = mongoose.model('Curso', cursoSchema);

// Insertar un nuevo curso
const curso1 = new Curso({
    clave: "curso1",
    titulo: "Curso de HTML desde cero (2024)",
    instructor: "Elián Sieza",
    video_url: "https://www.youtube.com/embed/C7_kK1Lj1II?si=ATroNXyEfZ5PL_sj",
    syllabus: [
        "1. Introducción al HTML y su importancia",
        "2. Etiquetas básicas de HTML (Textos y encabezados)",
        "3. Listas, enlaces e imágenes",
        "4. Tablas y estructura avanzada",
        "5. Formularios: Entrada de datos",
        "6. Multimedia en HTML: Audio y Video",
        "7. CSS básico para mejorar la apariencia",
        "8. Layout y diseño con CSS (Flexbox y Grid básico)",
        "9. Crear una página web simple",
        "10. Proyecto: Construir una aplicación web simple"
    ],
    descripcion: "En este curso aprenderás HTML desde lo más básico hasta crear una aplicación web sencilla. A través de videos interactivos, descubrirás cómo estructurar páginas web, agregar texto, imágenes, formularios y darle estilo con CSS.",
    image_url: "https://i.postimg.cc/g0qm6dgW/html.png",
    precio: "$ Gratis"
});

curso1.save()
    .then(() => {
        console.log('Curso insertado correctamente');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error al insertar el curso:', err);
        mongoose.connection.close();
    });
