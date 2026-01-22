import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const validMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const getSerialForImage = (filename: string): string => {
  const ext = extname(filename);
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0];
  return `${timestamp}-${uuid}${ext}`;
};

export const validateFileType = (mimetype: string): boolean => {
  return validMimeTypes.includes(mimetype);
};

export const validateFileSize = (size: number, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  return size <= maxSizeBytes;
};
