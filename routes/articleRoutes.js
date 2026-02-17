const express = require('express');
const router = express.Router();
const multer = require('multer');
const articleController = require('../controllers/articleController');

// Multer Setup for Image Upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Article Routes
router.get('/', articleController.getArticles);
router.post('/', articleController.createArticle);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

// Image Upload Route
router.post('/upload', upload.single('image'), articleController.uploadImage);

module.exports = router;
