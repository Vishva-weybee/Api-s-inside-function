// const express = require("express");
// const { cropAndSaveFace, compareWithReference, compareTwoFaces } = require("./utils/faceRecognition");

// const app = express();
// app.use(express.json({ limit: "20mb" }));

// // /crop-face
// app.post("/crop-face", async (req, res) => {
//   try {
//     const result = await cropAndSaveFace(req.body.image);
//     res.json(result);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // /compare-face
// app.post("/compare-face", async (req, res) => {
//   try {
//     const result = await compareWithReference(req.body.image);
//     res.json(result);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // /compare-faces
// app.post("/compare-faces", async (req, res) => {
//   try {
//     const result = await compareTwoFaces(req.body.image1, req.body.image2);
//     res.json(result);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// const PORT = 3002;
// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

// FaceService.js

const {
  cropAndSaveFace,
  compareWithReference,
  compareTwoFaces,
} = require('../utils/faceRecognition');

// Example functions you might call from CLI, test, or UI

// Wrapper to crop a face
async function runCropFace(imageBase64) {
  try {
    const result = await cropAndSaveFace(imageBase64);
    console.log("Crop Result:", result);
    return result;
  } catch (err) {
    console.error("Crop Error:", err.message);
    throw err;
  }
}

// Wrapper to compare a face with the reference
async function runCompareFace(imageBase64) {
  try {
    const result = await compareWithReference(imageBase64);
    console.log("Compare Result:", result);
    return result;
  } catch (err) {
    console.error("Compare Error:", err.message);
    throw err;
  }
}

// Wrapper to compare two faces
async function runCompareFaces(image1, image2) {
  try {
    const result = await compareTwoFaces(image1, image2);
    console.log("Compare Two Faces Result:", result);
    return result;
  } catch (err) {
    console.error("Compare Faces Error:", err.message);
    throw err;
  }
}

// Export functions for reuse elsewhere
module.exports = {
  runCropFace,
  runCompareFace,
  runCompareFaces,
};
