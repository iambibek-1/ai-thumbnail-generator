//controllers to get all users thumbnail

import { Request, Response } from "express";
import Thumbnail from "../models/thumbnail.js";

export const getUserThumbnails = async (req: Request, res: Response) => {
  try {
    const user_id = req.session;
    const thumbnail = await Thumbnail.find({ user_id }).sort({ createdAt: -1 });

    res.status(200).json(thumbnail);
  } catch (error: any) {
    console.error("Error generating thumbnail:", error);
    res.status(500).json({ error: "Failed to generate thumbnail." });
  }
};

//control to get a single thumbnail by id

export const getUserThumbnailsById = async (req: Request, res: Response) => {
  try {
    const user_id = req.session;
    const id = req.params;

    const thumbnail = await Thumbnail.findOne({ _id: id, user_id });
    res.status(200).json(thumbnail);
  } catch (error: any) {
    console.error("Error generating thumbnail:", error);
    res.status(500).json({ error: "Failed to generate thumbnail." });
  }
};
