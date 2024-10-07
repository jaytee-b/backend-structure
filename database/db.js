// database/db.js
const mongoose = require("mongoose");
require("dotenv").config();

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MONGODB CONNECTED SUCCESSFULLY ON ${connect.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit the process if there's an error
    }
};

module.exports = connectDb;