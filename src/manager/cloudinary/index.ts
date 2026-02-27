import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { env } from "@/config/env-config";
import { HttpError } from "@/utils/http-error";

type MediaResourceType = "image" | "video" | "raw";

class CloudinaryFileUploadService {
  private configured = false;

  private ensureConfigured() {
    if (this.configured) return;

    const { cloudName, apiKey, apiSecret } = env.cloudinary;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new HttpError(
        500,
        "CLOUDINARY_NOT_CONFIGURED",
        "Cloudinary environment variables are missing",
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    this.configured = true;
  }

  private mapResourceType(mediaType: "image" | "video" | "document"): MediaResourceType {
    if (mediaType === "document") return "raw";
    return mediaType as MediaResourceType;
  }

  private sanitizeFileName(fileName: string): string {
    const fileExtension = fileName?.split(".")?.pop() || "file";
    const fileNameWithoutExtension = path.parse(fileName).name;
    const sanitizedFileName = fileNameWithoutExtension.replace(/[^a-zA-Z0-9.]/g, "-");
    return `${sanitizedFileName}-${Date.now()}.${fileExtension}`;
  }

  generatePublicId(fileName: string, featureName: string): string {
    const sanitizedFileName = this.sanitizeFileName(fileName);
    return `${featureName}/${sanitizedFileName}`;
  }

  async uploadFile(file: any, featureName: string): Promise<any> {
    this.ensureConfigured();
    const publicId = this.generatePublicId(file.originalname, featureName);
    const base64Data = file.buffer.toString("base64");
    const dataUri = `data:${file.mimetype};base64,${base64Data}`;

    return cloudinary.uploader.upload(dataUri, {
      public_id: publicId,
      resource_type: "auto",
      overwrite: false,
    });
  }

  async deleteByPublicId(
    publicId: string,
    mediaType: "image" | "video" | "document",
  ): Promise<void> {
    this.ensureConfigured();
    const resourceType = this.mapResourceType(mediaType);
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
  }

  async deleteMultipleByPublicIds(
    publicIds: string[],
    mediaType: "image" | "video" | "document",
  ): Promise<void> {
    this.ensureConfigured();
    if (!publicIds.length) return;

    const resourceType = this.mapResourceType(mediaType);
    await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
      invalidate: true,
    });
  }
}

export const cloudinaryFileUploadService = new CloudinaryFileUploadService();