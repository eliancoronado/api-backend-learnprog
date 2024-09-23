const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String, required: true },
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
