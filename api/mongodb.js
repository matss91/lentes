import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("Falta configurar MONGO_URI");
}

const client = new MongoClient(uri);

let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }

  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;