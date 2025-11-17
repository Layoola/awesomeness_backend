import { Request, Response, NextFunction } from 'express';
import * as imageService from '../services/imageService';

export async function uploadImages(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params;
    console.log("eventId----------------", eventId);
    const files = req.files as Express.Multer.File[];

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedImages = [];

    for (const file of files) {
      const { s3Key } = await imageService.uploadImageToS3(file, eventId);

      const image = await imageService.createImageRecord({
        eventId,
        s3Key,
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size,
        description: req.body.description || '',
      });

      const url = await imageService.getPresignedUrl(s3Key);
      uploadedImages.push({ ...image, url });
    }

    res.status(201).json(uploadedImages);
  } catch (error) {
    next(error);
  }
}

export async function getImage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const image = await imageService.getImage(id);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const url = await imageService.getPresignedUrl(image.s3Key);
    res.json({ ...image, url });
  } catch (error) {
    next(error);
  }
}

export async function listImagesByEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params;
    const images = await imageService.listImagesByEvent(eventId);

    const imagesWithUrls = await Promise.all(
      images.map(async (image) => ({
        ...image,
        url: await imageService.getPresignedUrl(image.s3Key),
      }))
    );

    res.json(imagesWithUrls);
  } catch (error) {
    next(error);
  }
}
