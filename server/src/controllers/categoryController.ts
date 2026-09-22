import { Request, Response } from 'express';
import { Category } from '../models/Category';

const FALLBACK_CATEGORIES = [
  { _id: 'cat-1', name: 'Kitchen & Pantry', slug: 'kitchen', description: 'Smart tools that keep food fresh and cooking effortless.', order: 1, isActive: true },
  { _id: 'cat-2', name: 'Desk & Workspace', slug: 'workspace', description: 'Minimalist cable organization and magnetic docks.', order: 2, isActive: true },
  { _id: 'cat-3', name: 'Closet & Wardrobe', slug: 'closet', description: 'Space-saving compression bags and smart lighting.', order: 3, isActive: true },
  { _id: 'cat-4', name: 'Living Room', slug: 'living-room', description: 'Organized turntables and aesthetic caddies.', order: 4, isActive: true },
  { _id: 'cat-5', name: 'Car Essentials', slug: 'car', description: 'Rock-solid MagSafe mounts and travel organizers.', order: 5, isActive: true },
];

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });
    if (!categories || categories.length === 0) {
      res.json({ success: true, count: FALLBACK_CATEGORIES.length, categories: FALLBACK_CATEGORIES });
      return;
    }
    res.json({ success: true, count: categories.length, categories });
  } catch (error: any) {
    console.warn('⚠️ Category query fallback served:', error?.message);
    res.json({ success: true, count: FALLBACK_CATEGORIES.length, categories: FALLBACK_CATEGORIES });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }
    res.json({ success: true, category });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Category.findByIdAndUpdate(id, { isActive: false });
    res.json({ success: true, message: 'Category archived' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
