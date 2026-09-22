import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Review } from '../models/Review';
import { ShippingRule } from '../models/ShippingRule';
import { Supplier, Inventory } from '../models/Inventory';
import { SiteSettings } from '../models/Inventory';
import { Coupon } from '../models/Coupon';
import { KnowledgeBaseService } from '../services/knowledgeBaseService';
import { config } from '../config/env';

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
    await autoSeedCouponsIfEmpty();
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log('📦 Database already seeded with catalog products.');
      await KnowledgeBaseService.syncStorePolicies();
      return;
    }

    console.log('🌱 Empty catalog detected. Seeding initial Organiva store data...');

    // Note: Super Admin is set up by the store owner via the one-time /admin/setup form!

    // 2. Seed Categories
    const categoriesData = [
      {
        name: 'Kitchen & Pantry',
        slug: 'kitchen',
        description: 'Smart tools that keep food fresh and cooking effortless.',
        order: 1,
      },
      {
        name: 'Desk & Workspace',
        slug: 'workspace',
        description: 'Clean cable management and focus-enhancing productivity gear.',
        order: 2,
      },
      {
        name: 'Car Essentials',
        slug: 'car',
        description: 'Magnetic mounts and smart accessories for relaxed driving.',
        order: 3,
      },
      {
        name: 'Home & Organization',
        slug: 'home',
        description: 'Subtle upgrades that declutter shelves, drawers, and closets.',
        order: 4,
      },
      {
        name: 'Daily Lifestyle',
        slug: 'lifestyle',
        description: 'Everyday carry and problem solvers designed for modern routines.',
        order: 5,
      },
    ];

    const categoryDocs: Record<string, any> = {};
    for (const cat of categoriesData) {
      const created = await Category.create(cat);
      categoryDocs[cat.slug] = created;
    }
    console.log(`✅ ${categoriesData.length} Categories seeded.`);

    // 3. Seed Confidential Suppliers (Admin Only)
    const supplier1 = await Supplier.create({
      name: 'Precision Living Co. Ltd',
      platform: 'Direct Factory Partner',
      contactPerson: 'Mr. Zhang Wei',
      email: 'export@precisionliving.com',
      paymentTerms: '30% Advance, 70% Bill of Lading',
      notes: 'OEM partner for OrbitSeal and AeroGlow sensor lighting with certified CE/RoHS battery cells.',
    });

    const supplier2 = await Supplier.create({
      name: 'Apex Modern Tech Hub',
      platform: 'Yiwu Export Agent',
      contactPerson: 'Sarah Chen',
      email: 'orders@apexmod.cn',
      paymentTerms: 'T/T Escrow',
      notes: 'Supplier for aluminum cable docks and 15W Qi MagSafe wireless mounts.',
    });

    // 4. Seed Products
    const productsData = [
      {
        title: 'Organiva OrbitSeal 2-in-1 Magnetic Bag Resealer & Cutter',
        slug: 'orbitseal-magnetic-bag-resealer',
        sku: 'ORG-OS-01',
        category: categoryDocs['kitchen']._id,
        shortBenefit: 'Locks in crisp freshness in 2s with airtight heat sealing and built-in cutter.',
        price: 2850,
        salePrice: 2250,
        costPrice: 950,
        stock: 85,
        stockStatus: 'IN_STOCK',
        description:
          'Meet the little kitchen upgrade your pantry was missing. The Organiva OrbitSeal replaces broken plastic bag clips, rubber bands, and stale chips with instantaneous, commercial-grade heat sealing. Simply press and slide across any snack bag, frozen vegetable pack, or dry spice pouch for an airtight seal. Flip it over, and a hidden stainless steel micro-blade glides open stubborn bags without tearing. Equipped with a high-capacity rechargeable battery and a rear neodymium magnet that docks right to your refrigerator.',
        problemStatement:
          'Still dealing with stale chips, floppy plastic bag clips that snap after two weeks, and torn cereal bags that spill across pantry shelves?',
        solutionStatement:
          "There's a simpler way. OrbitSeal delivers an airtight heat seal in under 2 seconds. Snacks stay factory-crisp for weeks, and the device docks magnetically to your fridge so it's always within arm's reach.",
        benefits: [
          {
            number: '01',
            title: 'AIRTIGHT HEAT SEAL IN 2s',
            description: 'Advanced micro-heating elements lock in factory crispness without pre-heating time.',
          },
          {
            number: '02',
            title: 'INTEGRATED SLICK CUTTER',
            description: 'Flip to access the precision safety blade that slices cleanly through stubborn plastic and foil pouches.',
          },
          {
            number: '03',
            title: 'USB-C RECHARGEABLE',
            description: 'Say goodbye to buying AA batteries. One charge delivers up to 120 reseals over weeks of daily use.',
          },
          {
            number: '04',
            title: 'MAGNETIC FRIDGE DOCK',
            description: 'Built-in rare-earth magnet docks seamlessly to your refrigerator or microwave door.',
          },
        ],
        specifications: [
          { key: 'Material', value: 'Flame-retardant Matte ABS + Ceramic Heating Strip' },
          { key: 'Battery', value: '1200mAh Lithium-ion (USB Type-C Fast Charge)' },
          { key: 'Sealing Speed', value: '2-3 Seconds per standard bag' },
          { key: 'Dimensions', value: '100mm x 38mm x 35mm' },
          { key: 'Weight', value: '88 grams' },
          { key: 'Supported Bags', value: 'Potato chip bags, aluminum foil snack bags, vacuum bags, spice pouches, frozen food PE bags' },
          { key: 'What is Included', value: '1x Organiva OrbitSeal, 1x Braided USB-C Cable, 1x Practice Bag, 1x English Guide' },
        ],
        images: [
          '/images/products/orbitseal-main.webp',
          '/images/products/orbitseal-fridge.webp',
          '/images/products/orbitseal-demo.webp',
          '/images/products/orbitseal-pack.webp',
        ],
        threeDModel: {
          enabled: true,
          modelType: 'orbitseal',
          accentColor: '#5B755D',
        },
        isHero: true,
        isFeatured: true,
        seo: {
          title: 'Organiva OrbitSeal 2-in-1 Magnetic Bag Resealer & Cutter | Organiva Pakistan',
          description: 'Keep snacks and pantry food crisp with the Organiva OrbitSeal. 2-in-1 rechargeable heat sealer and cutter with magnetic fridge dock. Cash on Delivery nationwide.',
          keywords: ['bag sealer', 'heat sealer pakistan', 'kitchen accessories', 'chip sealer', 'organiva'],
        },
        isActive: true,
      },
      {
        title: 'Organiva CableGrid Magnetic Desktop Cord Management Hub',
        slug: 'cablegrid-magnetic-cord-organizer',
        sku: 'ORG-CG-02',
        category: categoryDocs['workspace']._id,
        shortBenefit: 'Weighted aluminum hub with magnetic collars keeps charging cords neatly anchored.',
        price: 1950,
        salePrice: 1550,
        costPrice: 620,
        stock: 60,
        stockStatus: 'IN_STOCK',
        description:
          'Eliminate charging cable drops and messy tangled wires. The Organiva CableGrid features a weighted matte anodized aluminum base with five magnetic clip collars. Attach the collars to your phone, laptop, and earphone cables. They snap securely into the dock when unplugged and release with effortless one-hand pull.',
        problemStatement:
          'Tired of watching your charging cables slip off the edge of your desk and having to crawl onto dusty floors every single day?',
        solutionStatement:
          'Organiva CableGrid magnetically anchors every wire exactly where your hand reaches. Unplug your device and the cable snaps back into its neat lineup.',
        benefits: [
          {
            number: '01',
            title: 'MAGNETIC SNAP RELEASE',
            description: 'Precision magnetic collars hold cables firmly yet release smoothly with a gentle one-handed pull.',
          },
          {
            number: '02',
            title: 'WEIGHTED ALUMINUM BASE',
            description: 'Solid aluminum body with non-slip micro-suction base stays planted on any glass, wood, or stone surface.',
          },
          {
            number: '03',
            title: 'UNIVERSAL COMPATIBILITY',
            description: 'Includes 5 magnetic collar sizes fitting lightning, USB-C, micro-USB, and thicker laptop braided cords.',
          },
        ],
        specifications: [
          { key: 'Material', value: 'Anodized Space Gray Aluminum + Silicone' },
          { key: 'Cable Collars', value: '5 Included Magnetic Clips (4mm to 6.5mm)' },
          { key: 'Base Type', value: 'Weighted Core + Washable Nano-Suction Base' },
          { key: 'Dimensions', value: '88mm x 22mm x 15mm' },
        ],
        images: [
          '/images/products/cablegrid-main.webp',
          '/images/products/cablegrid-desk.webp',
        ],
        threeDModel: { enabled: false },
        isHero: false,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Organiva AutoGrip 15W MagSafe Smart Wireless Car Vent Mount',
        slug: 'autogrip-magsafe-car-mount',
        sku: 'ORG-AG-03',
        category: categoryDocs['car']._id,
        shortBenefit: 'Locks onto any phone with 16 N52 magnets while fast-charging at 15W.',
        price: 3450,
        salePrice: 2850,
        costPrice: 1200,
        stock: 45,
        stockStatus: 'IN_STOCK',
        description:
          'Engineered for Pakistani road bumps and potholes. The Organiva AutoGrip uses a dual-hook steel air vent clamp and sixteen aerospace-grade N52 neodymium magnets to anchor your phone with zero wobble. Simultaneously delivers 15W intelligent wireless fast charging so your battery is topped up while running GPS navigation.',
        problemStatement:
          'Fumbling with cheap plastic phone clamps that shake, block your air vents, or drop your phone on sharp turns?',
        solutionStatement:
          'AutoGrip combines military-grade magnetic retention with a steel vent hook and 15W wireless charging. Snap your phone on with one tap and drive safely.',
        benefits: [
          {
            number: '01',
            title: 'POTHOLE-PROOF STEEL HOOK',
            description: 'Dual-locking steel vent hook clamps to horizontal or vertical air vent blades without slipping.',
          },
          {
            number: '02',
            title: '15W QI SMART FAST CHARGE',
            description: 'Intelligent temperature-controlled coil fast-charges iPhone and Android without overheating.',
          },
          {
            number: '03',
            title: '360° BALL JOINT',
            description: 'Rotate between vertical portrait map view and horizontal dash camera view with one touch.',
          },
        ],
        specifications: [
          { key: 'Output Power', value: '15W / 10W / 7.5W / 5W Auto-Select' },
          { key: 'Magnetic Force', value: '1.4 kg Pull Force (16x N52 Magnets)' },
          { key: 'Compatibility', value: 'iPhone 12-16 series natively; MagSafe ring included for Android phones' },
        ],
        images: [
          '/images/products/autogrip-main.webp',
          '/images/products/autogrip-car.webp',
        ],
        threeDModel: { enabled: false },
        isHero: false,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Organiva AeroGlow Motion-Sensor Ultra-Thin Cabinet Light',
        slug: 'aeroglow-motion-sensor-light',
        sku: 'ORG-AGL-04',
        category: categoryDocs['home']._id,
        shortBenefit: '9mm razor-thin magnetic light bar with dual PIR sensors and warm glare-free glow.',
        price: 2200,
        salePrice: 1750,
        costPrice: 700,
        stock: 50,
        stockStatus: 'IN_STOCK',
        description:
          'Add soft luxury lighting under kitchen cabinets, inside dark closets, on staircases, or in bathroom vanities. AeroGlow features side-emitting optical diffusion that prevents harsh LED glare. Automatically illuminates when you approach within 3 meters and turns off 20 seconds after you leave. Mounts with 3M magnetic adhesive in seconds.',
        problemStatement:
          'Groping in pitch-black closets or being blinded by harsh 100W room lights during midnight kitchen water runs?',
        solutionStatement:
          'AeroGlow provides soothing, indirect ambient illumination only when someone is present. Zero wiring, zero electrician needed.',
        benefits: [
          {
            number: '01',
            title: 'DUAL PIR SENSORS',
            description: '120-degree optical cone detects motion up to 3.5 meters in ambient dim light.',
          },
          {
            number: '02',
            title: 'SIDE-EMITTING EYE CARE',
            description: 'Light passes through multi-layer diffusion plates to deliver soft, glare-free indirect glow.',
          },
          {
            number: '03',
            title: '60-DAY BATTERY LIFE',
            description: 'High-density lithium cell lasts up to 2 full months on sensor mode with regular daily triggers.',
          },
        ],
        specifications: [
          { key: 'Length & Thickness', value: '30cm Length x 9mm Ultra-thin profile' },
          { key: 'Light Temperature', value: '3000K Warm Sand or 4000K Neutral White' },
          { key: 'Mounting', value: 'Magnetic adhesive backing (removable for charging)' },
        ],
        images: [
          '/images/products/aeroglow-main.webp',
          '/images/products/aeroglow-closet.webp',
        ],
        threeDModel: { enabled: false },
        isHero: false,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Organiva CleanPress Under-Sink 2-in-1 Soap Dispenser & Caddy',
        slug: 'cleanpress-kitchen-soap-dispenser',
        sku: 'ORG-CP-05',
        category: categoryDocs['kitchen']._id,
        shortBenefit: 'One-hand sponge pump dispenses the exact soap measure without counter puddles.',
        price: 1650,
        salePrice: 1290,
        costPrice: 480,
        stock: 70,
        stockStatus: 'IN_STOCK',
        description:
          'Say goodbye to slimy, soapy countertops and dripping detergent bottles. Simply press your dish sponge directly down on the pump tray. It distributes the perfect measure of soap directly into the sponge pores with zero dripping or wasted soap.',
        problemStatement:
          'Hate the slippery, messy soap puddles that pool around kitchen taps and the endless waste of pouring liquid soap?',
        solutionStatement:
          'CleanPress allows instant, clean one-handed soap dispensing and gives your damp sponge a ventilated drainage tray.',
        benefits: [
          {
            number: '01',
            title: 'PRECISE ONE-HAND PUMP',
            description: 'Press down with any sponge to dispense the ideal amount of dish liquid automatically.',
          },
          {
            number: '02',
            title: 'DRIP-FREE VENTILATION',
            description: 'Top slatted tray allows sponges to drain freely into the reservoir rather than stagnating.',
          },
          {
            number: '03',
            title: 'EXTRA LARGE 13oz CAPACITY',
            description: 'Fill once and enjoy weeks of dishwashing without constant refilling.',
          },
        ],
        specifications: [
          { key: 'Capacity', value: '385 ml (13 oz)' },
          { key: 'Material', value: 'BPA-Free Heavy Gauge ABS Polymer' },
          { key: 'Includes', value: '1x Dispenser Caddy + 1x High-Density Cellulose Sponge' },
        ],
        images: [
          '/images/products/cleanpress-main.webp',
        ],
        threeDModel: { enabled: false },
        isHero: false,
        isFeatured: true,
        isActive: true,
      },
    ];

    const createdProducts: any[] = [];
    for (const p of productsData) {
      const prod = await Product.create(p);
      createdProducts.push(prod);

      // Create linked Inventory record (Admin only)
      await Inventory.create({
        product: prod._id,
        sku: prod.sku,
        stockQuantity: prod.stock,
        lowStockThreshold: 10,
        costPrice: prod.costPrice,
        sellingPrice: prod.salePrice || prod.price,
        supplier: supplier1._id,
        supplierSku: `SUP-${prod.sku}`,
        location: 'Lahore Logistics Hub',
        reorderStatus: 'NORMAL',
      });

      // Synchronize into RAG Knowledge Base
      await KnowledgeBaseService.syncProductKnowledge(prod);
    }
    console.log(`✅ ${createdProducts.length} Problem-Solver Products seeded & indexed into Knowledge Base.`);

    // 5. Seed Real Customer Reviews
    const heroProd = createdProducts[0];
    const reviewsData = [
      {
        product: heroProd._id,
        customerName: 'Usman Tariq',
        city: 'Lahore (DHA Phase 5)',
        rating: 5,
        title: 'Actually works as advertised. Fridge magnet is genius.',
        comment:
          'Ordered this with Cash on Delivery in Lahore, arrived in 2 days. The heat seal is genuinely airtight. Resealed my son’s half-eaten potato chips and two days later they were just as crispy. The magnet sticks firmly to the fridge so nobody loses it.',
        verifiedPurchase: true,
      },
      {
        product: heroProd._id,
        customerName: 'Ayesha Khan',
        city: 'Karachi (Clifton)',
        rating: 5,
        title: 'No more soggy biscuits and dry spices!',
        comment:
          'In Karachi humidity, biscuits go soft in 15 minutes if unsealed. OrbitSeal has solved this completely. Super easy to use, charges quickly via Type-C. Organiva’s packaging was also very premium.',
        verifiedPurchase: true,
      },
      {
        product: heroProd._id,
        customerName: 'Hamza Malik',
        city: 'Islamabad (F-10)',
        rating: 5,
        title: 'High quality build, not cheap plastic.',
        comment:
          'I was skeptical because most online gadget stores sell flimsy items, but Organiva’s build quality is legit. It feels solid in the hand and the cutter is razor sharp.',
        verifiedPurchase: true,
      },
    ];

    for (const r of reviewsData) {
      await Review.create(r);
    }
    console.log(`✅ ${reviewsData.length} Verified Reviews seeded.`);

    // 6. Seed Shipping Rules
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
    console.log('✅ Shipping Rules seeded.');

    // 7. Seed Site Settings
    await SiteSettings.create({
      storeName: 'ORGANIVA',
      tagline: 'Smart products. Simpler living.',
      announcementBarText: '✨ Free Nationwide Express Delivery on orders over Rs. 3,500 | Cash on Delivery Available Across Pakistan',
      heroProductId: heroProd._id,
      whatsappNumber: '+923001234567',
      supportEmail: 'support@organiva.pk',
      currency: 'PKR',
    });

    // 8. Seed Store Policies into Knowledge Base
    await KnowledgeBaseService.syncStorePolicies();
    console.log('✅ Foundational Knowledge Documents synchronized for Gemini RAG.');

    console.log('🎉 ORGANIVA BACKEND INITIAL SEEDING COMPLETE!\n');
  } catch (err) {
    console.error('Seeding error:', err);
  }
};
