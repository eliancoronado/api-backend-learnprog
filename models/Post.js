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
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;

