// middleware/upload.js
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");

// Set up GridFS storage
const storage = new GridFsStorage({
    url: process.env.MONGO_URI, // Ensure this matches your .env variable
    file: (req, file) => {
        // Check the file type and set the filename
        const match = ["image/png", "image/jpeg"];
        if (match.indexOf(file.mimetype) === -1) {
            return `${Date.now()}-any-name-${file.originalname}`;
        }
        return {
            bucketName: "uploads", // Collection name
            filename: `${Date.now()}-any-name-${file.originalname}`,
        };
    },
});

const upload = multer({dest: "uploads/" });

module.exports = upload;