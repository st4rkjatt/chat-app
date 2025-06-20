const Mongoose = require("mongoose");

async function connectDB() {
  try {
   
    // Use the provided MONGO_URI or fallback to localDB
    await Mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

module.exports = connectDB;
