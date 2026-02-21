import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Initialize Google Gen AI SDK
// It automatically uses process.env.GEMINI_API_KEY if present
let ai;
if (
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== "DUMMY" &&
  process.env.GEMINI_API_KEY !== ""
) {
  try {
    ai = new GoogleGenAI({});
  } catch (e) {
    console.warn("Failed to initialize GoogleGenAI:", e.message);
  }
} else {
  console.warn(
    "No valid GEMINI_API_KEY found. Backend will return mock responses.",
  );
}

app.use(cors());
app.use(express.json());

// Setup Multer for image uploads (store in memory temporarily)
const upload = multer({ dest: "uploads/" });

app.post("/api/analyze", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const { path, mimetype } = req.file;
    const fileBytes = fs.readFileSync(path);
    const base64Image = fileBytes.toString("base64");

    // We will ask Gemini to provide a JSON response
    const prompt = `Analyze this image of food. Identify the food item(s) and provide a nutritional breakdown.
Return ONLY a valid JSON object with the following structure:
{
  "foodName": "Name of the food",
  "calories": "Total calories (e.g. 250 kcal)",
  "proteins": "Total proteins in grams (e.g. 10g)",
  "carbs": "Total carbohydrates in grams (e.g. 30g)",
  "fats": "Total fats in grams (e.g. 5g)",
  "description": "A very brief 1-sentence description of the food"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimetype,
          },
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    // Clean up the uploaded file
    fs.unlinkSync(path);

    const jsonText = response.text;
    const nutritionalInfo = JSON.parse(jsonText);

    res.json(nutritionalInfo);
  } catch (error) {
    console.error("Error analyzing image:", error);
    // Cleanup if file exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to analyze image" });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
