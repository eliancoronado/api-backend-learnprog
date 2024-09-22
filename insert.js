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
    clave: "curso5",
    titulo: "Curso de EXElearning desde cero (2024)",
    instructor: "Manuel Gongora",
    video_url: "https://www.youtube.com/embed/qOGMIx7B3LQ?si=DE7G5yTpM0XPJCz9",
    syllabus: [
        "1. Introducción a eXeLearning para la creación web",
        "2. Instalación y configuración para exportar a HTML",
        "3. Diseño responsive: Creación de contenido adaptable para la web",
        "4. Inserción de enlaces y navegación web",
        "5. Integración de recursos multimedia: Videos y audios embebidos",
        "6. Creación de actividades interactivas para la web",
        "7. Uso de estilos CSS personalizados para mejorar el diseño web",
        "8. Optimización de imágenes y videos para la web",
        "9. Publicación de contenido eXeLearning en servidores web",
        "10. SEO básico para materiales educativos en línea"
    ],
    descripcion: "Este curso de eXeLearning está diseñado para principiantes que desean crear y publicar contenidos educativos en formato web. ",
    image_url: "https://i.postimg.cc/HWy84G8L/Frame-1-11.png",
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
