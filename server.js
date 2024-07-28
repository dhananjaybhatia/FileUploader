const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 3000;

// Enable CORS
app.use(cors());

// Ensure the uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    let filePath = path.join(uploadDir, originalName);
    let counter = 1;

    // Check if file exists and if it does, add a counter to the filename
    while (fs.existsSync(filePath)) {
      const ext = path.extname(originalName);
      const baseName = path.basename(originalName, ext);
      filePath = path.join(uploadDir, `${baseName}(${counter})${ext}`);
      counter++;
    }

    cb(null, path.basename(filePath));
  },
});

const upload = multer({ storage });

// Serve static files
app.use(express.static("public"));
app.use("/image", express.static("image")); // Serve image directory

// Upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  res.send({ status: "success", file: req.file });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
