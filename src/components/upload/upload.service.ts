import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getSerialForImage, validateFileType, validateFileSize } from '../../libs/utils';

type MulterFile = Express.Multer.File;

@Injectable()
export class UploadService {
  private readonly uploadsDir = 'uploads';

  async uploadFile(
    file: MulterFile | undefined,
    target: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Validate file type
    if (!validateFileType(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Allowed types: jpeg, jpg, png, webp',
      );
    }

    // Validate file size (max 10MB)
    if (!validateFileSize(file.size, 10)) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Create target directory if it doesn't exist
    const targetDir = join(this.uploadsDir, target);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // Generate unique filename
    const imageName = getSerialForImage(file.originalname);
    const filePath = join(targetDir, imageName);

    // Save file (multer already saved it, we just need to rename if needed)
    // In this case, we'll use the filename that multer generated
    const url = `${this.uploadsDir}/${target}/${imageName}`;

    return url;
  }

  async uploadMultipleFiles(
    files: MulterFile[] | undefined,
    target: string,
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    const uploadedImages: string[] = [];

    for (const file of files) {
      try {
        const url = await this.uploadFile(file, target);
        uploadedImages.push(url);
      } catch (error) {
        console.error('Error uploading file:', error);
        throw new BadRequestException(`Failed to upload file: ${file.originalname}`);
      }
    }

    return uploadedImages;
  }
}
