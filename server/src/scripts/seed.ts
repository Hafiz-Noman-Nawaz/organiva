import { Category } from '../models/Category';
import { ShippingRule } from '../models/ShippingRule';
import { Coupon } from '../models/Coupon';
import { Supplier } from '../models/Inventory';
import { KnowledgeBaseService } from '../services/knowledgeBaseService';

export const purgeMockSuppliersIfAny = async (): Promise<void> => {
  try {
    const res = await Supplier.deleteMany({
      $or: [
        { email: { $in: ['orders@apexmod.cn', 'export@precisionliving.com'] } },
        { name: { $in: ['Apex Modern Tech Hub', 'Precision Living Co. Ltd'] } },
        { notes: { $regex: /OrbitSeal|AeroGlow|MagSafe/i } },
      ],
    });
    if (res.deletedCount && res.deletedCount > 0) {
      console.log(`🧹 Purged ${res.deletedCount} legacy mock supply partners.`);
    }
  } catch (err) {
    console.warn('Purge mock suppliers error:', err);
  }
};

export const autoSeedCouponsIfEmpty = async (): Promise<void> => {
  const count = await Coupon.countDocuments();
  if (count === 0) {
    await Coupon.create([
      {
        code: 'ORGANIVA10',
        discountType: 'PERCENTAGE',
        discountAmount: 10,
        minPurchaseAmount: 2000,
        maxDiscount: 1000,
        isActive: true,
      },
      {
        code: 'WELCOME500',
        discountType: 'FIXED',
        discountAmount: 500,
        minPurchaseAmount: 3500,
        isActive: true,
      },
    ]);
    console.log('✅ Default promotional coupons seeded (ORGANIVA10, WELCOME500).');
  }
};

export const autoSeedIfEmpty = async (): Promise<void> => {
  try {
    await purgeMockSuppliersIfAny();
    await autoSeedCouponsIfEmpty();

    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      const categoriesData = [
        { name: 'Kitchen & Pantry', slug: 'kitchen', description: 'Smart tools that keep food fresh and cooking effortless.', order: 1 },
        { name: 'Desk & Workspace', slug: 'workspace', description: 'Clean cable management and focus-enhancing productivity gear.', order: 2 },
        { name: 'Closet & Wardrobe', slug: 'closet', description: 'Smart organizers and storage systems.', order: 3 },
        { name: 'Living & Entryway', slug: 'living', description: 'Subtle upgrades that declutter shelves, drawers, and closets.', order: 4 },
        { name: 'Car Essentials', slug: 'car', description: 'Magnetic mounts and smart accessories for relaxed driving.', order: 5 },
      ];
      await Category.create(categoriesData);
      console.log('✅ Default categories initialized.');
    }

    const ruleCount = await ShippingRule.countDocuments();
    if (ruleCount === 0) {
      await ShippingRule.create({
        name: 'Standard Express Nationwide Delivery',
        flatRate: 250,
        freeShippingThreshold: 3500,
        isDefault: true,
        estimatedDays: '2-4 Business Days',
        cityOverrides: [
          { city: 'Lahore', rate: 200 },
          { city: 'Karachi', rate: 250 },
          { city: 'Islamabad', rate: 220 },
          { city: 'Rawalpindi', rate: 220 },
        ],
        isActive: true,
      });
      console.log('✅ Default shipping rules initialized.');
    }

    await KnowledgeBaseService.syncStorePolicies();
    console.log('✅ Foundational Knowledge Documents synchronized for Gemini RAG.');
  } catch (err) {
    console.error('Seeding check error:', err);
  }
};
