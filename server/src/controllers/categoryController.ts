import { Request, Response } from 'express';
import { Category } from '../models/Category';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, count: categories.length, categories });
  } catch (error: any) {
    console.warn('⚠️ Category query error:', error?.message);
    res.json({ success: true, count: 0, categories: [] });
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
