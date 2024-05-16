import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONODB_URI}/${DB_NAME}`
    );
    console.log(`\n Monogo DB is connected !! At DB Host ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MongoDB Connection Error", error);
    process.exit(1);
  }
};

export default connectDb;

// this is the another appoach that we can use in src/index.js
// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONODB_URI}/${DB_NAME}`);
//   } catch (error) {
//     console.log("Error", error);
//     throw error;
//   }
// })();
