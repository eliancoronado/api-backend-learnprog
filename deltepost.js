const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://cuentaparaelian12:HAayjRGRYOSk4F1B@cluster0.citmxdl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      refPath: 'userType' // Ref dinámico basado en userType
    },
    userType: { 
      type: String, 
      enum: ['student', 'teacher'], 
      required: true 
    }, 
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    usuariosLikestoPost: [      // Almacenar usuarios que han dado like para evitar más de uno
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Usuario'
      }
    ]
});
  
PostSchema.methods.toggleLikePost = function(userId) {
    const index = this.usuariosLikestoPost.indexOf(userId);
    if (index === -1) {
        // Si el usuario no ha dado like, lo añadimos
        this.usuariosLikestoPost.push(userId);
        this.likes += 1;
    } else {
        // Si ya dio like, lo removemos
        this.usuariosLikestoPost.splice(index, 1);
        this.likes -= 1;
    }

    return this.save();
}
  
const Post = mongoose.model('Post', PostSchema);

const title = "Me quiero quejar";

Post.deleteOne({ title: title })
    .then(result => {
        if (result.deletedCount > 0) {
            console.log(`Post con titulo ${title} borrado correctamente`);
        } else {
            console.log(`No se encontró un post con el titulo ${title}`);
        }
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error al borrar el curso:', err);
        mongoose.connection.close();
    });