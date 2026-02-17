require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const articleRoutes = require('./routes/articleRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim()
});

console.log("Cloudinary Config Verified:", {
    cloud_name: cloudinary.config().cloud_name,
    api_key: cloudinary.config().api_key,
    secret_length: cloudinary.config().api_secret ? cloudinary.config().api_secret.length : 0
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/articles', articleRoutes);

// For backwards compatibility with the /api/upload endpoint
// Note: articleRoutes also defines /upload which becomes /api/articles/upload
// If the frontend specifically uses /api/upload, we handle it here:
const articleController = require('./controllers/articleController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/upload', upload.single('image'), articleController.uploadImage);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
