
import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("Falta configurar MONGO_URI");
}

const opciones = {
  maxPoolSize: 5,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
};

const globalMongo = globalThis;

let clientPromise = globalMongo._mongoClientPromise;

if (!clientPromise) {
  const client = new MongoClient(uri, opciones);

  clientPromise = client.connect();

  globalMongo._mongoClientPromise = clientPromise;
}

export default clientPromise;
