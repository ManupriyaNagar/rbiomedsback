const Article = require('../models/Article');
const cloudinary = require('cloudinary').v2;

// Helper to parse date safely without timezone shifts
const parseDate = (dateStr) => {
    if (!dateStr) return new Date();

    // Check if it's already a Date object
    if (dateStr instanceof Date) return dateStr;

    // If it's a string like "February 13, 2026" (formatted by toJSON)
    // or "2026-02-13" (sent by frontend)
    try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
            // If it's YYYY-MM-DD from the frontend input, we want to treat it as local date
            // to avoid timezone shifts when it's just a "day" value.
            if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                const [year, month, day] = dateStr.split('-').map(Number);
                return new Date(year, month - 1, day);
            }
            return d;
        }
    } catch (e) {
        console.error("Error parsing date:", e);
    }

    return new Date();
};

exports.getArticles = async (req, res) => {
    try {
        const { site } = req.query;
        let query = {};
        if (site) {
            if (site === 'rbiomeds') {
                query = {
                    $or: [
                        { sites: 'rbiomeds' },
                        { sites: { $exists: false } }
                    ]
                };
            } else if (site === 'abc-international') {
                query = { sites: 'abc-international' };
            } else if (site === 'both') {
                query = { sites: { $all: ['rbiomeds', 'abc-international'] } };
            } else {
                query = { sites: site };
            }
        }
        const articles = await Article.find(query).sort({ date: -1, createdAt: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch articles" });
    }
};

exports.createArticle = async (req, res) => {
    try {
        const { title, description, image, category, sites, date } = req.body;

        const parsedDate = parseDate(date);
        console.log("Creating article:", {
            title,
            receivedDate: date,
            parsedDate: parsedDate.toISOString()
        });

        const newArticle = new Article({
            title,
            description,
            image: image || undefined,
            category: category || undefined,
            sites: sites || ["rbiomeds"],
            date: parsedDate
        });

        await newArticle.save();
        res.status(201).json(newArticle);
    } catch (error) {
        console.error("Failed to create article:", error);
        res.status(500).json({ error: "Failed to create article" });
    }
};

exports.updateArticle = async (req, res) => {
    try {
        const { title, description, image, category, sites, date } = req.body;

        const updatedDate = date ? parseDate(date) : undefined;
        console.log("Updating article:", { id: req.params.id, title, receivedDate: date, parsedDate: updatedDate?.toISOString() });

        const updateData = {
            title,
            description,
            image,
            category,
            sites: sites || ["rbiomeds"]
        };

        if (updatedDate) {
            updateData.date = updatedDate;
        }

        const updatedArticle = await Article.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedArticle) {
            return res.status(404).json({ error: "Article not found" });
        }

        res.json(updatedArticle);
    } catch (error) {
        res.status(500).json({ error: "Failed to update article" });
    }
};

exports.deleteArticle = async (req, res) => {
    try {
        const result = await Article.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ error: "Article not found" });
        }

        res.json({ message: "Article deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete article" });
    }
};

exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Please upload a file' });
        }

        // Upload directly using buffer
        const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const result = await cloudinary.uploader.upload(fileBase64, {
            folder: 'rbiomeds_articles',
        });

        console.log("Upload successful:", result.secure_url);
        res.json({ imageUrl: result.secure_url });
    } catch (err) {
        console.error("Cloudinary Error:", err);
        res.status(500).json({ error: `Upload error: ${err.message || 'Unknown error'}` });
    }
};
