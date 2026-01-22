import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/guards';
import { UploadService } from './upload.service';
import { multerConfig } from './config/multer.config';

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const target = 'products'; // Default target
    const url = await this.uploadService.uploadFile(file, target);
    return { url };
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[] | undefined,
  ): Promise<{ urls: string[] }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Files are required');
    }

    const target = 'products'; // Default target
    const urls = await this.uploadService.uploadMultipleFiles(files, target);
    return { urls };
  }

  @Post('product-images')
  @UseInterceptors(FilesInterceptor('images', 2, multerConfig))
  async uploadProductImages(
    @UploadedFiles() files: Express.Multer.File[] | undefined,
  ): Promise<{ frontImageUrl: string; backImageUrl: string }> {
    if (!files || files.length !== 2) {
      throw new BadRequestException('Exactly 2 images required (front and back)');
    }

    const target = 'products';
    const urls = await this.uploadService.uploadMultipleFiles(files, target);

    return {
      frontImageUrl: urls[0],
      backImageUrl: urls[1],
    };
  }
}
