import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { getSerialForImage, validateFileType } from '../../../libs/utils';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const target = req.body.target || 'products';
      const uploadPath = join('uploads', target);

      // Create directory if it doesn't exist
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const imageName = getSerialForImage(file.originalname);
      cb(null, imageName);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (validateFileType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error('Invalid file type. Allowed types: jpeg, jpg, png, webp'),
        false,
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};
