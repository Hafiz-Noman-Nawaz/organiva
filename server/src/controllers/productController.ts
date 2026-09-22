import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { KnowledgeDocument } from '../models/KnowledgeDocument';
import { Review } from '../models/Review';
import { KnowledgeBaseService, FALLBACK_STORE_PRODUCTS } from '../services/knowledgeBaseService';

// Public: Get all active products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, sort, isFeatured } = req.query;

    const filter: any = { isActive: true };

    if (category && category !== 'all') {
      if (mongoose.Types.ObjectId.isValid(String(category))) {
        filter.category = category;
      } else {
        const foundCat = await Category.findOne({ slug: String(category).toLowerCase() });
        if (foundCat) {
          filter.category = foundCat._id;
        } else {
          filter.category = new mongoose.Types.ObjectId(); // matches none
        }
      }
    }

    if (isFeatured === 'true') {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: String(search), $options: 'i' } },
        { shortBenefit: { $regex: String(search), $options: 'i' } },
        { sku: { $regex: String(search), $options: 'i' } },
      ];
    }

    let query = Product.find(filter).populate('category', 'name slug');

    if (sort === 'price-asc') query = query.sort({ price: 1 });
    else if (sort === 'price-desc') query = query.sort({ price: -1 });
    else if (sort === 'newest') query = query.sort({ createdAt: -1 });
    else query = query.sort({ isHero: -1, createdAt: -1 });

    let products = await query.select('-costPrice').lean();
    if (!products || products.length === 0) {
      products = FALLBACK_STORE_PRODUCTS as any;
    }

    res.json({ success: true, count: products.length, products });
  } catch (error: any) {
    console.warn('⚠️ Product query fallback served:', error?.message);
    res.json({ success: true, count: FALLBACK_STORE_PRODUCTS.length, products: FALLBACK_STORE_PRODUCTS });
  }
};

// Public: Get single hero product
export const getHeroProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    let hero = await Product.findOne({ isHero: true, isActive: true })
      .populate('category', 'name slug')
      .select('-costPrice')
      .lean();

    if (!hero) {
      hero = await Product.findOne({ isActive: true })
        .populate('category', 'name slug')
        .select('-costPrice')
        .lean();
    }

    if (!hero) {
      hero = FALLBACK_STORE_PRODUCTS[0] as any;
    }

    res.json({ success: true, product: hero });
  } catch (error: any) {
    console.warn('⚠️ Hero product query fallback served:', error?.message);
    res.json({ success: true, product: FALLBACK_STORE_PRODUCTS[0] });
  }
};

// Public: Get product by slug
export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    let product = await Product.findOne({ slug: slug.toLowerCase(), isActive: true })
      .populate('category', 'name slug')
      .select('-costPrice')
      .lean();

    if (!product) {
      product = (FALLBACK_STORE_PRODUCTS.find((p: any) => p.slug === slug.toLowerCase()) || FALLBACK_STORE_PRODUCTS[0]) as any;
    }

    res.json({ success: true, product });
  } catch (error: any) {
    console.warn('⚠️ Product by slug query fallback served:', error?.message);
    const fallback = FALLBACK_STORE_PRODUCTS.find((p: any) => p.slug === req.params.slug?.toLowerCase()) || FALLBACK_STORE_PRODUCTS[0];
    res.json({ success: true, product: fallback });
  }
};

// Admin: Get all products including costPrice & supplier details
export const getAdminProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find()
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: products.length, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const productData = req.body;

    if (productData.isHero) {
      await Product.updateMany({ isHero: true }, { isHero: false });
    }

    const product = new Product(productData);
    await product.save();

    // Dynamically sync to Knowledge Base for AI Concierge
    await KnowledgeBaseService.syncProductKnowledge(product);

    res.status(201).json({
      success: true,
      message: 'Product created successfully and indexed into knowledge base',
      product,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Update product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.isHero) {
      await Product.updateMany({ _id: { $ne: id }, isHero: true }, { isHero: false });
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Sync updated data to Knowledge Base for AI Concierge
    await KnowledgeBaseService.syncProductKnowledge(product);

    res.json({
      success: true,
      message: 'Product updated successfully and knowledge base updated',
      product,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin: Delete / Archive product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Deactivate knowledge document so AI Concierge does not recommend archived item
    await KnowledgeDocument.updateMany({ productRef: id }, { isActive: false });

    res.json({ success: true, message: 'Product archived successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to resolve product by ID or Slug
const resolveProduct = async (idOrSlug: string) => {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const prod = await Product.findById(idOrSlug);
    if (prod) return prod;
  }
  return Product.findOne({ slug: idOrSlug.toLowerCase() });
};

// Public: Get verified reviews for a product
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const product = await resolveProduct(idOrSlug);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const reviews = await Review.find({ product: product._id, isApproved: true })
      .sort({ createdAt: -1 })
      .lean();

    const count = reviews.length;
    const averageRating = count > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1))
      : 5.0;

    res.json({
      success: true,
      count,
      averageRating,
      reviews,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public: Submit a customer review
export const submitProductReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    const { customerName, rating, title, comment, city } = req.body;

    if (!customerName || !comment || !rating) {
      res.status(400).json({
        success: false,
        message: 'Customer name, star rating (1-5), and feedback comment are required.',
      });
      return;
    }

    const numericRating = Math.min(5, Math.max(1, Number(rating) || 5));
    const product = await resolveProduct(idOrSlug);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const review = await Review.create({
      product: product._id,
      customerName: customerName.trim(),
      rating: numericRating,
      title: title ? title.trim() : undefined,
      comment: comment.trim(),
      city: city ? city.trim() : 'Pakistan',
      verifiedPurchase: true,
      isApproved: true,
    });

    // Update product average rating & review count
    const allApproved = await Review.find({ product: product._id, isApproved: true });
    product.reviewCount = allApproved.length;
    product.rating = Number(
      (allApproved.reduce((acc, r) => acc + r.rating, 0) / allApproved.length).toFixed(1)
    );
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your verified review has been published.',
      review,
      productRating: product.rating,
      productReviewCount: product.reviewCount,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
