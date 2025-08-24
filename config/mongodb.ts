import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
	if (mongoose.connection.readyState >= 1) {
      // already connected
      return;
    }
    await mongoose.connect(process.env.MONGO_URI as string, {
      dbName: "Analyzer",
    });
    console.log("connected successfully");
  } catch (error) {
    console.error("DB connection failed:", error);
  }
};
