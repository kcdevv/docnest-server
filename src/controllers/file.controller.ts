import { Request, Response } from "express";
import { s3Client } from "../aws-config";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import { fileModel } from "../models/file.model";
import { userModel } from "../models/user.model";

export const uploadFile = async (req: Request, res: Response) => {
  res.status(200).json({ message: "File uploaded successfully" });
  return;
};

export const editFile = async (req: Request, res: Response) => {};

const generateFileName = (extension = "") =>
  `${crypto.randomBytes(16).toString("hex")}${extension}`;

export const generateUploadURL = async (req: Request, res: Response) => {
  try {
    const { fileType } = req.body;
    const extension = fileType ? `.${fileType.split("/")[1]}` : "";

    const fileKey = `uploads/${generateFileName(extension)}`;

    const command = new PutObjectCommand({
      Bucket: "coursevita-kc",
      Key: fileKey,
      ContentType: fileType || "application/octet-stream",
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 60 * 24 });

    res.json({
      uploadUrl,
    });
  } catch (error) {
    console.error("Error generating upload URL:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const saveFile = async (req: Request, res: Response) => {
  try {
    const { name, type, size, url } = req.body;
    const admin = req.userId;

    if (!name || !type || !size || !url) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    let key = new URL(url).pathname;
    if (key.startsWith("/")) {
      key = key.substring(1);
    }

    const file = await fileModel.create({ name, type, size, url, key, admin });
    await userModel.findByIdAndUpdate(admin, { $push: { files: file._id } });

    res.status(201).json({ message: "File saved successfully", file });
    return;
  } catch (error) {
    console.error("Error saving file:", error);
    res.status(500).json({ message: "Server error" });
    return;
  }
};



export const getDownloadUrl = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.body;
    if (!fileId) {
      res.status(400).json({ error: "File ID is required" });
      return;
    }

    // Fetch file details from DB
    const file = await fileModel.findById(fileId);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    // Generate Signed URL using the stored `key`
    const command = new GetObjectCommand({
      Bucket: "coursevita-kc",
      Key: file.key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 min expiry
    res.json({ downloadUrl: url });
    return;
  } catch (error) {
    console.error("Error generating pre-signed download URL:", error);
    res.status(500).json({ error: "Failed to generate pre-signed URL" });
    return;
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;
    const admin = req.userId;

    if (!fileId) {
      res.status(400).json({ error: "File ID is required" });
      return;
    }

    // Find file in DB
    const file = await fileModel.findById(fileId);
    if (!file) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    // Delete from S3
    if (file.key) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: "coursevita-kc",
        Key: file.key,
      });

      await s3Client.send(deleteCommand);
    }

    // Delete file from DB
    await fileModel.findByIdAndDelete(fileId);
    await userModel.findByIdAndUpdate(admin, { $pull: { files: fileId } });

    res.json({ message: "File deleted successfully" });
    return;
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Failed to delete file" });
    return;
  }
};