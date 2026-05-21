import mongoose from "mongoose";

export interface IThumbnail extends mongoose.Document {
  userId: string;
  title: string;
  description?: string;
  style:
    | "Bold & Graphic"
    | "Minimalistic"
    | "Photorealistic"
    | "Illustrated"
    | "Tech/Futuristic";
  aspectRatio: "16:9" | "1:1" | "9:16";
  colorScheme:
    | "Vibrant"
    | "Sunset"
    | "forest"
    | "neon"
    | "purple"
    | "monochrome"
    | "pastel"
    | "ocean";
  text_overlay?: boolean;
  image_url?: string;
  prompt_used?: string;
  user_prompt?: string;
  isGenerating?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const thumbnailSchema = new mongoose.Schema<IThumbnail>({
  userId: { type: String, ref: "User", required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  style: {
    type: String,
    enum: [
      "Bold & Graphic",
      "Minimalistic",
      "Photorealistic",
      "Illustrated",
      "Tech/Futuristic",
    ],
    required: true,
  },

  aspectRatio: { type: String, enum: ["16:9", "1:1", "9:16"], default: "16:9" },
  colorScheme: {
    type: String,
    enum: [
      "Vibrant",
      "Sunset",
      "forest",
      "neon",
      "purple",
      "monochrome",
      "pastel",
      "ocean",
    ],
  },
  text_overlay: { type: Boolean, default: false },
  image_url: { type: String, default: "" },
  prompt_used: { type: String },
  user_prompt: { type: String },
  isGenerating: { type: Boolean, default: true },
});

const Thumbnail =
  mongoose.models.Thumbnail ||
  mongoose.model<IThumbnail>("Thumbnail", thumbnailSchema);

export default Thumbnail;
