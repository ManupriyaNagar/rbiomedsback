const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1576091160550-217359f42f8c?q=80&w=2070&auto=format&fit=crop"
    },
    category: { type: String, default: "General" },
    sites: { type: [String], default: ["rbiomeds"] },
    date: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

// Transform _id to id for frontend compatibility
ArticleSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        // Always provide a formatted date string for the frontend
        if (returnedObject.date) {
            returnedObject.date = new Date(returnedObject.date).toLocaleDateString('en-US', {
                month: 'long',
                day: '2-digit',
                year: 'numeric'
            });
        }
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Article', ArticleSchema);
