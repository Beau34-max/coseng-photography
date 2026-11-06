import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadPhoto(base64, folder = "coseng-photography", { type = "upload" } = {}) {
  const result = await cloudinary.uploader.upload(base64, {
    folder,
    type,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });
  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    type: result.type || type,
  };
}

export async function deletePhoto(publicId, type = "upload") {
  return cloudinary.uploader.destroy(publicId, { type });
}

export function getPhotoUrl(publicId, opts = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    quality: "auto",
    fetch_format: "auto",
    ...opts,
  });
}

export function getThumbnailUrl(publicId) {
  return cloudinary.url(publicId, {
    secure: true,
    width: 600,
    height: 400,
    crop: "fill",
    quality: "auto",
    fetch_format: "auto",
  });
}

export function getWatermarkedUrl(publicId) {
  return cloudinary.url(publicId, {
    secure: true,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
      {
        overlay: { font_family: "Arial", font_size: 40, text: "© COSENG Photography" },
        gravity: "south_east",
        x: 20,
        y: 20,
        color: "white",
        opacity: 60,
      },
    ],
  });
}
