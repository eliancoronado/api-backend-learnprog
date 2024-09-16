const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const User = require('../models/User');
const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://cuentaparaelian12:HAayjRGRYOSk4F1B@cluster0.citmxdl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define the User schema and model if not imported from '../models/User'
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    image: String, // URL of the uploaded image
});

const User = mongoose.model('User', userSchema);

// Define the Course schema and model
const cursoSchema = new mongoose.Schema({
    clave: String,
    titulo: String,
    instructor: String,
    video_url: String,
    syllabus: [String],
    descripcion: String, // Course description
    image_url: String,   // Course image URL
    precio: String       // Course price
});

const Curso = mongoose.model('Curso', cursoSchema);

// Multer setup for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Register endpoint
app.post('/api/register', upload.single('image'), async (req, res) => {
    const { name, email, password } = req.body;
    const image = req.file;

    if (!name || !email || !password || !image) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        // Upload image to imgbb
        const imageResponse = await axios.post('https://api.imgbb.com/1/upload', null, {
            params: {
                key: 'YOUR_IMGBB_API_KEY',
                image: image.buffer.toString('base64'),
            },
        });

        const imageUrl = imageResponse.data.data.url;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        const newUser = new User({ name, email, password: hashedPassword, image: imageUrl });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide email and password.' });
    }

    try {
        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign({ id: user._id }, 'YOUR_JWT_SECRET', { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Existing course routes
app.get('/api/cursos', async (req, res) => {
    try {
        const cursos = await Curso.find({});
        res.json(cursos);
    } catch (err) {
        res.status(500).send('Error en el servidor');
    }
});

// Existing user route
app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find(); // Obtener todos los usuarios
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error del servidor' });
    }
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
