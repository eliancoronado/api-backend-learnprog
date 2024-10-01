const Curso = require('./models/Curso'); // Asegúrate de importar correctamente tu modelo
const Student = require('./models/Student');

const getStudentEnrollmentData = async (req, res) => {
  try {
    // Contar el total de estudiantes registrados
    const totalEstudiantes = await Student.countDocuments();

    // Contar el número de estudiantes matriculados en cursos
    const cursos = await Curso.find().populate('estudiantesMatriculados');
    const estudiantesMatriculados = new Set();

    // Recorrer cada curso para obtener estudiantes matriculados
    cursos.forEach(curso => {
      curso.estudiantesMatriculados.forEach(estudiante => {
        estudiantesMatriculados.add(estudiante.toString());
      });
    });

    const totalMatriculados = estudiantesMatriculados.size;

    // Enviar datos al frontend
    res.json({
      totalEstudiantes,
      totalMatriculados,
      noMatriculados: totalEstudiantes - totalMatriculados,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener los datos de matriculación', error: err });
  }
};
