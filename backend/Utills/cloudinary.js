import { v2 as cloudinary } from "cloudinary"; // Correctly importing Cloudinary
import dotenv from "dotenv";

dotenv.config({ path: "backend/config/config.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Standard image upload function that handles any image upload
export const uploadImage = (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file,
      {
        resource_type: "image",
        folder: folder,
        quality: "auto",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }
      }
    );
  });
};

// Upload PDF
export const uploadPDF = (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file,
      {
        // Use image resource type for PDFs to allow inline rendering
        resource_type: "image",
        folder: folder,
        format: "pdf",
        use_filename: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            public_id: result.public_id,
            url: result.secure_url, // direct link to the PDF
          });
        }
      }
    );
  });
};

// Delete asset (works for both images & PDFs, just pass type)
export const deleteImage = async (publicId, type = "image") => {
  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: type === "pdf" ? "image" : "image",
    });
    return res.result === "ok";
  } catch (error) {
    throw new Error(`Failed to delete the asset: ${error.message}`);
  }
};
