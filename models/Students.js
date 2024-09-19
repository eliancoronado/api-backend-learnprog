const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String, required: true },
});

module.exports = mongoose.model('Student', StudentSchema);
