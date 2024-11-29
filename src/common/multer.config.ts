import { memoryStorage } from 'multer';
import { HttpException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

export const multerConfig = {
  storage: memoryStorage(),
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new HttpException('File not allowed!', 400), false);
    }
    callback(null, true);
  },
};

export const ImageFileInterceptorForStoreLogo = () =>
  FileInterceptor('image', multerConfig);

export const ImageFileInterceptorForBanner = () =>
  FileInterceptor('image', multerConfig);
