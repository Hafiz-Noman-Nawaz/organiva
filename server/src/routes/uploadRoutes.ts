import { Router, Request, Response } from 'express';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import { authenticate, requireAdmin } from '../middlewares/auth';

const router = Router();

router.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  try {
    const { image, folder } = req.body;

    if (!image) {
      res.status(400).json({ success: false, message: 'Image data or URL is required' });
      return;
    }

    const result = await uploadImageToCloudinary(image, folder || 'organiva/catalog');
    res.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      message: 'Image successfully uploaded to Cloudinary',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
