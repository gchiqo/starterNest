import { Injectable, NotFoundException } from '@nestjs/common';
import { createWriteStream, unlink, mkdir } from 'fs';
import { promisify } from 'util';
import { PassThrough } from 'stream';
import { extname } from 'path';
import { randomBytes } from 'crypto';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const mkdirAsync = promisify(mkdir);
const pipeline = promisify(require('stream').pipeline);

type ImageFile = {
  buffer: Buffer;
  originalname: string;
};

@Injectable()
export class ImageService {

  async saveImage(
    imageFile: ImageFile,
    filePath: string = '/',
  ): Promise<string> {
    const extension = extname(imageFile.originalname);
    // const randomName = randomBytes(8).toString('hex');
    const randomName = uuidv4();;
    const basePath = join('uploads', filePath);
    const imagePath = join(basePath, `${randomName}${extension}`);

    try {
      await mkdirAsync(basePath, { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err);
      throw err;
    }

    const readStream = new PassThrough();
    readStream.end(imageFile.buffer);

    const writeStream = createWriteStream(imagePath);
    await pipeline(readStream, writeStream);

    return imagePath;
  }

  async deleteImage(imagePath: string): Promise<void> {
    try {
      // await promisify(unlink)(imagePath);
      await promisify(unlink)(imagePath);

    } catch (error) {
      console.error(`Error deleting image ${imagePath}: ${error}`);
      throw new NotFoundException(`file not found`);
    }
  }

}
