const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const addNotices = (db) => {
  return async (req, res) => {
    try {
      const newId = String(new Date().getTime());

      const noticeDocument = {
        id: newId,
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
      };
      await db.collection("notices").insertOne(noticeDocument);

      return res.status(200).send({
        success: true,
        message: "Your Message Sent Successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "API Error",
      });
    }
  };
};

const addCredentials = (db) => {
  return async (req, res) => {
    try {
      // Create a unique index on the email field
      await db
        .collection("credentials")
        .createIndex({ email: 1 }, { unique: true });

      const credentialDocument = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.pass,
        faculty: req.body.faculty,
        userId: String(new Date().getTime()),
      };

      await db.collection("credentials").insertOne(credentialDocument);
      return res.status(200).send({
        success: true,
        message: "Credentials added successfully",
      });
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key error
        return res.status(400).send({
          success: false,
          message: "User with this email already exists",
        });
      }
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Error adding credentials",
      });
    }
  };
};

const deleteNotices = (db) => {
  return async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      await db.collection("notices").deleteOne({ id: id });
      return res.status(200).send({
        success: true,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Error deleting notice",
      });
    }
  };
};

const getLatestNotice = (db) => {
  return async (req, res) => {
    try {
      const notice = await db
        .collection("notices")
        .findOne({}, { sort: { id: -1 } });

      return res.status(200).send({
        success: true,
        message: "Notices fetched successfully",
        data: notice.id,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Error fetching notices",
      });
    }
  };
};

const validateCredentials = (db) => {
  return async (req, res) => {
    const { email, pass } = req.body;

    try {
      const user = await db
        .collection("credentials")
        .findOne({ email: email, password: pass });

      console.log(email + " - " + pass);
      if (user) {
        return res.status(200).send({
          success: true,
          message: "Login successful",
          faculty: user.faculty,
          userId: user.userId,
        });
      } else {
        return res.status(401).send({
          success: false,
          message: "Invalid email or password",
          faculty: false,
        });
      }
    } catch (error) {
      console.error("Error validating credentials:", error);
      return res.status(500).send({
        success: false,
        message: "Internal server error",
        faculty: false,
      });
    }
  };
};

const forgotPassword = (db) => {
  return async (req, res) => {
    console.log("Hi");
    try {
      const { email } = req.body;
      console.log(email);
      const user = await db.collection("credentials").findOne({
        email: email,
      });

      if (!user) {
        return res.status(404).send({ message: "Email not found" });
      }
      // Generate a unique reset token or reset link
      var privateKey = process.env.ACCESS_TOKEN_SECRET;

      const resetToken = jwt.sign({ email }, privateKey, {
        expiresIn: "20m",
      });

      // Send the reset token or link to the user's email address
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "saipremkakumani@gmail.com", // Replace with your email address@example.com",
          pass: "wjvtbmksjjpzqixc",
        },
      });

      const mailOptions = {
        from: "saipremkakumani@gmail.com",
        to: email,
        subject: "Password Reset",
        text: `Click the following link to reset your password: https://tp-cell.vercel.app/reset-password/${resetToken}`,
      };

      await transporter.sendMail(mailOptions);
      console.log("Email sent");

      res.status(200).send({
        success: true,
        message: "Password reset link sent to your email",
      });
    } catch (error) {
      console.error("Error validating credentials:", error);
      return res.status(500).send({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

const resetPassword = (db) => {
  return async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
      // Verify the reset token
      var privateKey = process.env.ACCESS_TOKEN_SECRET;
      const decoded = jwt.verify(token, privateKey);

      if (!decoded) {
        return res
          .status(400)
          .send({ success: false, message: "Invalid or expired reset token" });
      }

      const { email } = decoded;

      // Update the user's password in the database
      const result = await db
        .collection("credentials")
        .updateOne({ email: email }, { $set: { password: newPassword } });

      if (result.modifiedCount === 0) {
        return res
          .status(500)
          .send({ success: false, message: "Failed to update password" });
      }

      res.send({ success: true, message: "Password reset successful" });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ success: false, message: "Internal server error" });
    }
  };
};

const getNotices = (db) => {
  return async (req, res) => {
    try {
      const { category } = req.params; // Get the category from the query or request body
      console.log(category);

      // Find notes with the specified category
      const notices = await db
        .collection("notices")
        .find({ category: category })
        .toArray();

      return res.status(200).send({
        success: true,
        message: "Notes fetched successfully",
        notices: notices,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Error fetching notes",
      });
    }
  };
};

const getMessages = (db) => {
  return async (req, res) => {
    try {
      const num = req.params.num || req.body.num;
      let messages;
      if (!num) {
        messages = await db.collection("messages").find().toArray();
      } else {
        messages = await db
          .collection("messages")
          .find()
          .sort({ timestamp: -1 })
          .limit(parseInt(num))
          .toArray();
      }

      console.log(messages);

      res.status(200).send({
        success: true,
        message: "Messages fetched successfully",
        messages: messages,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error fetching messages",
      });
    }
  };
};

module.exports = {
  addNotices,
  addCredentials,
  deleteNotices,
  getLatestNotice,
  validateCredentials,
  forgotPassword,
  resetPassword,
  getNotices,
  getMessages,
}; // Export both functions
