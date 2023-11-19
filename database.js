const MongoClient = require("mongodb").MongoClient;

const client = new MongoClient("mongodb://localhost:27017");

const connectToDatabase = async () => {
  await client.connect();
  const database = client.db("gold-rate-calculator");
  return database;
};

module.exports = { connectToDatabase };
