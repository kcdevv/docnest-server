import File from "../models/file.model";
import { Request, RequestHandler, Response } from "express";
import { client } from "../aws-config";

export const uploadFile = async (req: Request, res: Response) => {
  const { fileName, fileType } = req.body;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    ContentType: fileType,
    ACL: "public-read",
  };

  try {
    const url = await client.getSignedUrlPromise("putObject", params);
    res.status(200).json({ url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not generate presigned URL" });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const files = await File.find().populate("uploadedBy");
    res.status(200).json({
      files,
    });
  } catch (err) {
    res.status(500).json({
      message: "Unable to fetch files",
    });
  }
};

export const getSingleFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);
    res.status(200).json({
        
    })
  } catch (err) {}
};
