require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schema
const ArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1576091160550-217359f42f8c?q=80&w=2070&auto=format&fit=crop"
    },
    category: { type: String, default: "General" },
    sites: { type: [String], default: ["rbiomeds"] },
    date: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Transform _id to id for frontend compatibility
ArticleSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const Article = mongoose.model('Article', ArticleSchema);

app.use(cors());
app.use(express.json());

// Routes
app.get('/api/articles', async (req, res) => {
    try {
        const { site } = req.query;
        let query = {};
        if (site) {
            if (site === 'rbiomeds') {
                // Return articles where sites includes 'rbiomeds' OR the sites field doesn't exist (legacy)
                query = {
                    $or: [
                        { sites: 'rbiomeds' },
                        { sites: { $exists: false } }
                    ]
                };
            } else if (site === 'abc-international') {
                query = { sites: 'abc-international' };
            } else if (site === 'both') {
                // Return articles that are published to BOTH platforms
                query = { sites: { $all: ['rbiomeds', 'abc-international'] } };
            } else {
                query = { sites: site };
            }
        }
        const articles = await Article.find(query).sort({ createdAt: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch articles" });
    }
});

app.post('/api/articles', async (req, res) => {
    try {
        const { title, description, image, category, sites } = req.body;

        const newArticle = new Article({
            title,
            description,
            image: image || undefined,
            category: category || undefined,
            sites: sites || ["rbiomeds"],
            date: new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: '2-digit',
                year: 'numeric'
            })
        });

        await newArticle.save();
        res.status(201).json(newArticle);
    } catch (error) {
        res.status(500).json({ error: "Failed to create article" });
    }
});

app.put('/api/articles/:id', async (req, res) => {
    try {
        const { title, description, image, category, sites } = req.body;
        const updatedArticle = await Article.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                image,
                category,
                sites: sites || ["rbiomeds"]
            },
            { new: true }
        );

        if (!updatedArticle) {
            return res.status(404).json({ error: "Article not found" });
        }

        res.json(updatedArticle);
    } catch (error) {
        res.status(500).json({ error: "Failed to update article" });
    }
});

app.delete('/api/articles/:id', async (req, res) => {
    try {
        const result = await Article.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ error: "Article not found" });
        }

        res.json({ message: "Article deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete article" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
