import { MongoClient } from "mongodb";
import { MONGODB_URI } from "./constants";

// Global variable to store the MongoDB client promise
declare global {
  var _mongoClientPromise: Promise<MongoClient> | null;
}

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Check if we're in development or production mode
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

// Create a caching mechanism for the MongoDB client
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect().catch((err) => {
      console.error("Failed to connect to MongoDB", err);
      throw err;
    });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect().catch((err) => {
    console.error("Failed to connect to MongoDB in production", err);
    throw err;
  });
}

// Export a module-scoped MongoClient promise
export default clientPromise;
