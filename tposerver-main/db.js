const { MongoClient } = require("mongodb");

let dbConnection;

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(
      "mongodb+srv://saipremkakumani:24er6mx1zN1NgEZX@cluster0.mth8had.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    )
      .then((client) => {
        dbConnection = client.db("tpo");
        return cb();
      })
      .catch((err) => {
        console.log(err);
        return cb(err);
      });
  },
  getDb: () => {
    return dbConnection;
  },
};
