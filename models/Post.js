const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // O ref: 'Teacher' dependiendo del userType
  userType: { type: String, enum: ['student', 'teacher'], required: true }, // Campo para saber el tipo de usuario
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
