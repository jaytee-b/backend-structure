// // routes/upload.js
// const express = require("express");
// const upload = multer({storageName });
// const upload = require("../middleWear/upload"); // Import the upload middleware
// const router = express.Router();


// // Define the upload route
// router.post("/upload", upload.single("file"), async (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ error: "No file uploaded" });
//     }
//     res.json({ file: req.file });
// });

// module.exports = router;


// routes/upload.js



const express = require("express");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Set up local storage
const storageName = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = './uploads'; // Local directory
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir); // Create directory if it doesn't exist
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Save with original name
    }
});

const uploadLocal = multer({ storage: storageName });

// Set up GridFS storage
const gridFsStorage = new GridFsStorage({
    url: process.env.MONGO_URI,
    file: (req, file) => {
        return {
            bucketName: "uploads",
            filename: `${Date.now()}-${file.originalname}`,
        };
    },
});

const uploadGridFS = multer({ storage: gridFsStorage });

// Define the upload route
router.post("/upload", uploadLocal.single("file"), uploadGridFS.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ file: req.file });
});

module.exports = router;