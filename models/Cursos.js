const mongoose = require('mongoose');

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
      ref: 'Student'
    }
  ],
  estudiantesMatriculados: [ // Lista de estudiantes matriculados con porcentaje de completado
    {
      estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      porcentajeCompletado: {
        type: Number,
        default: 0 // Porcentaje inicial de completado
      }
    }
  ],
  activities: [  // Arreglo de actividades
    {
      question: {
        type: String,
        required: true
      },
      options: [String],  // Arreglo de opciones para cada pregunta
      answer: {
        type: String,     // Respuesta correcta de la pregunta
        required: true
      }
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

// Método para matricular a un estudiante
cursoSchema.methods.matricularEstudiante = function(userId) {
  const matriculado = this.estudiantesMatriculados.find(est => est.estudiante.equals(userId));
  
  if (!matriculado) {
    this.estudiantesMatriculados.push({ estudiante: userId, porcentajeCompletado: 0 });
  }
  return this.save();
};

// Método para actualizar el porcentaje de completado de un estudiante
cursoSchema.methods.actualizarPorcentajeCompletado = function(userId, porcentaje) {
  console.log(this.estudiantesMatriculados); // Para verificar el contenido

  const matriculado = this.estudiantesMatriculados.find(est => est.estudiante && est.estudiante.equals(userId));
  
  if (matriculado) {
    matriculado.porcentajeCompletado = porcentaje;
  } else {
    console.error(`Estudiante no matriculado con ID: ${userId}`);
  }
  return this.save();
};

// Método para añadir una actividad al curso
cursoSchema.methods.agregarActividad = function(actividad) {
  this.activities.push(actividad);
  return this.save();
};

const Curso = mongoose.model('Curso', cursoSchema);

module.exports = Curso;
