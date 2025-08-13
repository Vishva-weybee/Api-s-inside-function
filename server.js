const express = require("express");
const { cropAndSaveFace, compareWithReference, compareTwoFaces } = require("./utils/faceRecognition");

const app = express();
app.use(express.json({ limit: "20mb" }));

// /crop-face
app.post("/crop-face", async (req, res) => {
  try {
    const result = await cropAndSaveFace(req.body.image);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// /compare-face
app.post("/compare-face", async (req, res) => {
  try {
    const result = await compareWithReference(req.body.image);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// /compare-faces
app.post("/compare-faces", async (req, res) => {
  try {
    const result = await compareTwoFaces(req.body.image1, req.body.image2);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
