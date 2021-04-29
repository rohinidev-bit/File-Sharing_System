
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://rohini:iamthereonmlab@cluster1.kco5d.mongodb.net/fileshare?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
