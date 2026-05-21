import { Request, Response } from "express";
import Thumbnail from "../models/thumbnail.js";
import {
  GenerateContentConfig,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";
import ai from "../configs/ai.js";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

const stylePrompts = {
  "Bold & Graphic":
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",

  "Tech/Futuristic":
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",

  Minimalistic:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",

  Photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",

  Illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
};

const colorSchemeDescriptions = {
  vibrant:
    "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
  sunset:
    "wan sunset tones, orange pink and purple hues, soft gradients,cinematic glow",
  forest:
    "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
  neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
  monochrome:
    "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
  ocean:
    "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
  pastel:
    "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
};

export const generateThumbnail = async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    const {
      title,
      prompt: user_prompt,
      style,
      aspectRatio,
      text_overlay,
      colorScheme,
    } = req.body;

    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt_used: user_prompt,
      style,
      aspectRatio,
      text_overlay,
      colorScheme,
      isGenerating: true,
    });
    const model = "gemini-3-pro-image-preview";

    const generationConfig: GenerateContentConfig = {
      maxOutputTokens: 32768,
      temperature: 1,
      topP: 0.95,
      responseModalities: ["image"],
      imageConfig: {
        aspectRatio: aspectRatio || "16:9",
        imageSize: "1K",
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.OFF,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.OFF,
        },
      ],
    };
    let prompt = `Create a ${
      stylePrompts[style as keyof typeof stylePrompts]
    } for:${title}`;

    if (colorScheme) {
      prompt += ` use a ${
        colorSchemeDescriptions[
          colorScheme as keyof typeof colorSchemeDescriptions
        ]
      } color scheme.`;
    }
    if (user_prompt) {
      prompt += `Additional details:${user_prompt}.`;
    }
    prompt += `The thumbnail should be ${
      aspectRatio || "16:9"
    } visually stunning, and designed to maximize clicked through rate. make it bold,professional and impossible to ignore.`;

    //generate image using ai
    const response: any = await ai.models.generateContent({
      model,
      contents: [prompt],
      config: generationConfig,
    });
    //check response is valid
    if (!response?.candidates?.[0]?.content?.parts) {
      throw new Error("Invalid response ");
    }
    const parts = response.candidates[0].content.parts;

    let finalBuffer: Buffer | null = null;

    for (const part of parts) {
      if (part.inlineDate) {
        finalBuffer = Buffer.from(part.inlineData, "base64");
      }
    }
    const fileName = `final-output-${Date.now()}.png`;
    const filePath = path.join("images", fileName);

    //create the image directory if not exists
    fs.mkdirSync("images", { recursive: true });

    //write the image buffer to a file
    fs.writeFileSync(filePath, finalBuffer!);

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
    });
    thumbnail.imageUrl = uploadResult.url;
    thumbnail.isGenerating = false;
    await thumbnail.save();

    res.json({ message: "Thumbnail is generetad successfully.", thumbnail });

    //remove image from disk
    fs.unlinkSync(filePath);
  } catch (error: any) {
    console.error("Error generating thumbnail:", error);
    res.status(500).json({ error: "Failed to generate thumbnail." });
  }
};

export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session;

    await Thumbnail.findOneAndDelete({ _id: id, userId });

    res.json({ message: "Thumbnail deleted successfully." });
  } catch (error: any) {
    console.error("Error generating thumbnail:", error);
    res.status(500).json({ error: "Failed to generate thumbnail." });
  }
};
