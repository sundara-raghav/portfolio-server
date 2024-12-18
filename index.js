require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Atlas connection string
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@portfolio.rzuyn.mongodb.net/test?retryWrites=true&w=majority`; // Specify 'ecom' as the database name

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

const formSchema = new mongoose.Schema(
  {
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
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Form = mongoose.model("Form", formSchema);
module.exports = Form;

// Root route to display data from the database
app.get("/", async (req, res) => {
  try {
    const submissions = await Form.find();
    res.send(`
      <h1>Form Submissions</h1>
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>Message</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${submissions
            .map(
              (submission, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${submission.name}</td>
              <td>${submission.email}</td>
              <td>${submission.mobile}</td>
              <td>${submission.message}</td>
              <td>
                <form action="/delete/${submission._id}" method="POST" style="margin: 0;">
                  <button type="submit">Delete</button>
                </form>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch submissions." });
  }
});

app.post("/delete/:id", async (req, res) => {
  try {
    await Form.findByIdAndDelete(req.params.id);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ error: "Failed to delete the submission." });
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
    res.status(500).json({ error: "Failed to send your message." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

