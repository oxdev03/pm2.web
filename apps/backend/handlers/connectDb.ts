import mongoose from "mongoose";

const connectDb = (DB_URI: string | undefined) => {
  if (!DB_URI) {
    throw new Error("DB_URI is not defined");
  }
  mongoose
    .connect(DB_URI)
    .then(() => {
      console.log("[DATABASE] Connected");
    })
    .catch((err) => {
      console.error(err);
    });
};

export default connectDb;
