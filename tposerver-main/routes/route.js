const express = require("express");

// router object
const router = express.Router();

// Function to configure the router with the db
module.exports = (db) => {
  // Import the controller and pass the db to it
  const {
    addNotices,
    addCredentials,
    deleteNotices,
    getLatestNotice,
    validateCredentials,
    forgotPassword,
    resetPassword,
    getNotices,
    getMessages,
  } = require("../controllers/controller");

  // routes
  router.post("/addNotices", addNotices(db));
  router.post("/addCredentials", addCredentials(db));
  router.post("/validateCredentials", validateCredentials(db));
  router.post("/deleteNotices/:id", deleteNotices(db));
  router.post("/getLatestNotice", getLatestNotice(db));
  router.post("/forgot-password", forgotPassword(db));
  router.post("/reset-password/:token", resetPassword(db));
  router.post("/getNotices/:category", getNotices(db));
  router.post("/messages/:num?", getMessages(db));

  return router;
};
