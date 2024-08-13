const handleSocket = (io, db) => {
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("message", async (msg) => {
      const messageDoc = {
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp,
      };

      await db.collection("messages").insertOne(messageDoc);
      io.emit("message", messageDoc);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
};

module.exports = { handleSocket };
