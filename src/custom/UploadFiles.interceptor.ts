import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

interface FileInterceptorOptions {
  name: string;
  maxCount: number;
}

export const UploadFilesInterceptor = ({
  interceptorValues,
  dest,
}: {
  interceptorValues: FileInterceptorOptions[];
  dest: string;
}) =>
  FileFieldsInterceptor(interceptorValues, {
    storage: diskStorage({
      destination: (_req, file, cb) => {
        const uploadPath = `uploads/${dest}/${file.fieldname}`;
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
      },
      filename: (_req, file, cb) => {
        const filename = path.parse(file.originalname).name + uuidv4();
        const extension = path.parse(file.originalname).ext;
        cb(null, `${filename}${extension}`);
      },
    }),
  });