const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { connectToDb, getDb } = require("./db");
const { handleSocket } = require("./socketio");
const { Server } = require("socket.io");
const http = require("http");

//dotenv config
dotenv.config();

//rest object
const app = express();

const server = http.createServer(app);

//Socket IO Object
const io = new Server(server, {
  cors: {
    origin: true,
    methods: "POST",
  },
});

//middlewares
app.use(cors());
app.use(express.json());

// //static files access
// app.use(express.static(path.join(__dirname, "../client/build")));

//routes

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/public/index.html"));
});

//connect to database
let db;

connectToDb((err) => {
  if (!err) {
    db = getDb();
    app.use("/api/v1/tpo", require("./routes/route")(db));
    handleSocket(io, db);

    server.listen(PORT, () => {
      console.log(`Server is running ${PORT}`);
    });
  }
});

//Chat Application

//In case unable to get port from process.env use 8080
const PORT = process.env.PORT || 8080;
