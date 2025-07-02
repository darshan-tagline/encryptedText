const mongoose = require("mongoose");

exports.connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(`Connection Failed with MongoDB`);
    console.error("mongodb connection error :===>>>", error);
  }
};

