import mongoose from "mongoose";

const connectDb = (MONGO_URI: string | undefined) => {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("[DATABASE] Connected");
    })
    .catch((err) => {
      console.error(err);
    });
};

export default connectDb;
