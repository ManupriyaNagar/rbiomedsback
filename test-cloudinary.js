require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || "").trim(),
    api_key: (process.env.CLOUDINARY_API_KEY || "").trim(),
    api_secret: (process.env.CLOUDINARY_API_SECRET || "").trim()
});

async function testConfig() {
    try {
        console.log("Testing Cloudinary config...");
        console.log("Cloud Name:", cloudinary.config().cloud_name);
        console.log("API Key:", cloudinary.config().api_key);

        const result = await cloudinary.api.ping();
        console.log("Ping successful!", result);
    } catch (error) {
        console.error("Ping failed!");
        console.error("Error Message:", error.message);
        console.error("Error JSON:", JSON.stringify(error, null, 2));
    }
}

testConfig();
