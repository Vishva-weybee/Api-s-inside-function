const fs = require("fs");
const path = require("path");
const canvas = require("canvas");
const faceapi = require("face-api.js");

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODELS_URL = path.join(__dirname, "..", "models");

// Load models once
let modelsLoaded = false;
async function loadModels() {
  if (!modelsLoaded) {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(MODELS_URL, "ssd_mobilenetv1_model")),
      faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(MODELS_URL, "face_landmark_68_model")),
      faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(MODELS_URL, "face_recognition_model")),
    ]);
    modelsLoaded = true;
    console.log("Face-api models loaded.");
  }
}

// Helper: Convert base64 string to buffer
function base64ToBuffer(base64String) {
  const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  const base64Data = matches ? matches[2] : base64String;
  return Buffer.from(base64Data, "base64");
}

// ===== Function: Crop and Save Face Descriptor =====
async function cropAndSaveFace(imageBase64) {
  await loadModels();

  const buffer = base64ToBuffer(imageBase64);
  const img = await canvas.loadImage(buffer);

  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection || !detection.descriptor) {
    throw new Error("No face detected in the ID card.");
  }

  const descriptorPath = path.join(__dirname, "..", "faces", "descriptor.json");
  fs.writeFileSync(descriptorPath, JSON.stringify(Array.from(detection.descriptor)));

  const regionsToExtract = [detection.detection.box];
  const faceImages = await faceapi.extractFaces(img, regionsToExtract);
  if (faceImages.length > 0) {
    const out = fs.createWriteStream(path.join(__dirname, "..", "faces", "reference.png"));
    const stream = faceImages[0].createPNGStream();
    stream.pipe(out);
  }

  return {
    message: "Face cropped and descriptor saved successfully.",
    descriptorLength: detection.descriptor.length,
  };
}

// ===== Function: Compare Face with Reference =====
async function compareWithReference(imageBase64) {
  await loadModels();

  const descriptorPath = path.join(__dirname, "..", "faces", "descriptor.json");

  if (!fs.existsSync(descriptorPath)) {
    throw new Error("Reference face not found. Please run cropAndSaveFace first.");
  }

  const referenceDescriptorRaw = JSON.parse(fs.readFileSync(descriptorPath));
  const referenceDescriptor = new Float32Array(referenceDescriptorRaw);

  const buffer = base64ToBuffer(imageBase64);
  const img = await canvas.loadImage(buffer);

  const detection = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection || !detection.descriptor) {
    throw new Error("No face detected in the given image.");
  }

  const inputDescriptor = detection.descriptor;

  if (referenceDescriptor.length !== inputDescriptor.length) {
    throw new Error("Descriptor length mismatch. Cannot compare faces.");
  }

  const distance = faceapi.euclideanDistance(referenceDescriptor, inputDescriptor);
  const threshold = 0.6;

  return {
    match: distance < threshold,
    similarity: Number((1 - distance).toFixed(4)),
    distance: Number(distance.toFixed(4)),
  };
}

// ===== Function: Compare Two Faces =====
async function compareTwoFaces(imageBase64_1, imageBase64_2) {
  await loadModels();

  async function getDescriptor(base64Image) {
    const buffer = base64ToBuffer(base64Image);
    const img = await canvas.loadImage(buffer);
    const detection = await faceapi
      .detectSingleFace(img)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection || !detection.descriptor) {
      throw new Error("No face detected in one of the images.");
    }

    return detection.descriptor;
  }

  const descriptor1 = await getDescriptor(imageBase64_1);
  const descriptor2 = await getDescriptor(imageBase64_2);

  if (descriptor1.length !== descriptor2.length) {
    throw new Error("Descriptor length mismatch. Cannot compare faces.");
  }

  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  const threshold = 0.6;

  return {
    match: distance < threshold,
    similarity: Number((1 - distance).toFixed(4)),
    distance: Number(distance.toFixed(4)),
  };
}

// ===== EXPORTS =====
module.exports = {
  cropAndSaveFace,
  compareWithReference,
  compareTwoFaces,
};
