const mongoose = require('mongoose');

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

module.exports = Post;

