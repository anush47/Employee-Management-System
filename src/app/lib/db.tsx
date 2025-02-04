import mongoose from "mongoose";

interface Connection {
  isConnected?: number;
}

const connection: Connection = {};

async function dbConnect(): Promise<void> {
  if (connection.isConnected) {
    //console.log("Already connected to the database");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URL!);
    connection.isConnected = db.connections[0].readyState;
    //console.log("Database connected successfully");
  } catch (error) {
    console.error("Error connecting to the database:");
  }
}

export default dbConnect;
