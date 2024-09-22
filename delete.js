const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://cuentaparaelian12:HAayjRGRYOSk4F1B@cluster0.citmxdl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const teacherSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, required: true },
});
  
const Teachers = mongoose.model('Teacher', teacherSchema);

const nombre = "Manuel";

Teachers.deleteOne({ username: nombre })
    .then(result => {
        if (result.deletedCount > 0) {
            console.log(`profesor con nombre ${nombre} borrado correctamente`);
        } else {
            console.log(`No se encontró un curso con la clave ${nombre}`);
        }
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error al borrar el curso:', err);
        mongoose.connection.close();
    });
