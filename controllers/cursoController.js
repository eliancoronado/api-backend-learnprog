const Curso = require('../models/Cursos'); // Asegúrate de importar correctamente tu modelo
const Student = require('../models/Students');

const getStudentEnrollmentData = async (req, res) => {
  const { courseId } = req.params; // Obtener el ID del curso desde los parámetros de la URL

  try {
    // Asegúrate de que el curso con el ID proporcionado exista
    const curso = await Curso.findById(courseId).populate('estudiantesMatriculados');

    if (!curso) {
      return res.status(404).json({ message: 'Curso no encontrado.' });
    }

    // Contar el total de estudiantes
    const totalEstudiantes = await Student.countDocuments();

    // Obtener el número de estudiantes matriculados en el curso específico
    const totalMatriculados = curso.estudiantesMatriculados.length;
    console.log(totalMatriculados);

    res.json({
      totalEstudiantes,
      totalMatriculados,
      noMatriculados: totalEstudiantes - totalMatriculados,
    });
  } catch (err) {
    console.error('Error en la API:', err); // Añade más información sobre el error
    res.status(500).json({ message: 'Error al obtener los datos de matriculación', error: err });
  }
};

module.exports = { getStudentEnrollmentData };
