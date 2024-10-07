// index.js
require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose")
const multer = require("multer");
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require("gridfs-stream");

const app = express();
const port = 9020;

const connectDb = require("./database/db");

// Connect to the database
connectDb();

// Initialize gfs after connection is established
const conn = mongoose.connection;

// Initialize gfs
let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads"); // Set the collection name
});

// Set up storage engine for Multer using GridFS
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



const storageName = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/uploads')
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })

const upload = multer({storageName });

// Define routes
app.post("/api/upload", upload.single("file"), (req, res) => {
    res.json({ file: req.file });
});

// Route to get all images
app.get("/api/images", (req, res) => {
    gfs.find().toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(404).json({ err: "No files exist" });
        }
        return res.json(files);
    });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Testing route
app.get("/api", (req, res) => {
    res.json({ message: "Welcome to my server" });
});

// Import routes for users and products
const userRoute = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes")

app.use("/api/users", userRoute);
app.use("/api/products", productRoutes);
app.use("/api/order", orderRoutes);


// Import routes
const uploadRoute = require("./routes/upload");

// Use the upload route
app.use("/api", uploadRoute); // This means your upload endpoint will be at /api/upload

// Listening to port
app.listen(port, () => {
    console.log("Server connected successfully on port " + port);
});