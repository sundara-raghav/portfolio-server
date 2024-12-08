require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection string
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@portfolio.rzuyn.mongodb.net/`; // Specify 'ecom' as the database name

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB is connected"))
  .catch((error) => {
    console.error("Failed to connect to MongoDB Atlas:", error);
    process.exit(1); // Exit process on connection error
  });

const formSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const Form = mongoose.model("Form", formSchema);

// Root route to display data from the database
app.get("/", async (req, res) => {
  try {
    const submissions = await Form.find();
    res.send(`
      <h1>Form Submissions</h1>
      <ul>
        ${submissions
          .map(
            (submission) => `
          <li>
            <strong>Name:</strong> ${submission.name} <br>
            <strong>Email:</strong> ${submission.email} <br>
            <strong>Mobile:</strong> ${submission.mobile} <br>
            <strong>Message:</strong> ${submission.message}
          </li>
        `
          )
          .join("")}
      </ul>
    `);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch submissions." });
  }
});

// Route to handle form submissions
app.post("/submit", async (req, res) => {
  try {
    const { name, email, mobile, message } = req.body;
    const form = new Form({ name, email, mobile, message });
    await form.save();
    res.status(201).json({ message: "Your message has sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to sent your message." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
