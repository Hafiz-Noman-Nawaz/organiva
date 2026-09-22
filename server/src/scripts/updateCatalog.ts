import mongoose from 'mongoose';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Inventory } from '../models/Inventory';
import { config } from '../config/env';

export const updateHomeOrganizationCatalog = async () => {
  try {
    console.log('🔄 Syncing Home Organization catalog products...');

    // 1. Ensure Categories
    const categoriesMap: Record<string, any> = {};
    const categoriesToEnsure = [
      { name: 'Kitchen & Pantry', slug: 'kitchen', description: 'Airtight preservation, rotating spice carousels, and modular organizers.' },
      { name: 'Closet & Wardrobe', slug: 'closet', description: 'Vacuum compression cubes, cascading hangers, and drawer dividers.' },
      { name: 'Desk & Cables', slug: 'workspace', description: 'Magnetic cable anchors, under-desk wire raceways, and monitor risers.' },
      { name: 'Living & Entryway', slug: 'living', description: 'Floating magnetic key docks, remote caddies, and linen storage bins.' },
      { name: 'Car Organization', slug: 'car', description: 'Seat gap drop-catchers, 15W MagSafe mounts, and trunk organizers.' },
    ];

    for (const c of categoriesToEnsure) {
      const cat = await Category.findOneAndUpdate(
        { slug: c.slug },
        { name: c.name, description: c.description },
        { upsert: true, new: true }
      );
      categoriesMap[c.slug] = cat._id;
    }

    // 2. New & Updated Products
    const productsToUpsert = [
      {
        title: 'Organiva OrbitSeal 2-in-1 Magnetic Bag Resealer & Cutter',
        slug: 'orbitseal-magnetic-bag-resealer',
        sku: 'ORG-OS-01',
        category: categoriesMap['kitchen'],
        shortBenefit: 'Locks in crisp freshness in 2s with airtight heat sealing and built-in cutter.',
        price: 2850,
        salePrice: 2250,
        costPrice: 950,
        stock: 85,
        stockStatus: 'IN_STOCK',
        description:
          'Meet the little kitchen upgrade your pantry was missing. Replaces broken plastic clips, rubber bands, and stale chips with instantaneous, commercial-grade heat sealing. Press and slide across any snack bag, spice pouch, or frozen food bag for an airtight seal. Hidden stainless steel blade cuts cleanly. Docks right to your refrigerator door.',
        problemStatement: 'Still dealing with stale chips, floppy plastic clips that snap after two weeks, and torn cereal bags spilling across shelves?',
        solutionStatement: 'OrbitSeal delivers an airtight heat seal in under 2 seconds. Snacks stay factory-crisp for weeks, and the device docks magnetically to your fridge.',
        images: [
          '/images/products/orbitseal-main.webp',
          '/images/products/orbitseal-fridge.webp',
          '/images/products/orbitseal-demo.webp',
          '/images/products/orbitseal-pack.webp',
        ],
        isHero: true,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Organiva SpinTidy 360° Tiered Rotating Pantry Turntable',
        slug: 'spintidy-360-turntable-organizer',
        sku: 'ORG-ST-06',
        category: categoriesMap['kitchen'],
        shortBenefit: 'Smooth ball-bearing turntable brings high-shelf spices & condiments forward in 1 spin.',
        price: 2950,
        salePrice: 2450,
        costPrice: 1100,
        stock: 55,
        stockStatus: 'IN_STOCK',
        description:
          'No more digging through crowded, dark kitchen cabinets or knocking over spice bottles. The Organiva SpinTidy features precision stainless-steel ball bearings encased in frosted acrylic with a natural pale oak rim. Spins effortlessly 360 degrees, bringing every jar, oil bottle, and condiment directly to your fingertips.',
        problemStatement: 'Tired of reaching into deep pantry corners, knocking over turmeric bottles, and forgetting items until they expire?',
        solutionStatement: 'SpinTidy rotates 360° with a light flick of a finger. Every bottle is instantly visible and accessible.',
        images: ['/images/products/spintidy-main.webp'],
        isHero: false,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Organiva SpaceVault Vacuum Compression Storage Cubes (Set of 6)',
        slug: 'spacevault-vacuum-storage-cubes',
        sku: 'ORG-SV-07',
        category: categoriesMap['closet'],
        shortBenefit: 'Compresses bulky blankets, winter jackets, and bedding to recover 80% closet space.',
        price: 3250,
        salePrice: 2650,
        costPrice: 1150,
        stock: 45,
        stockStatus: 'IN_STOCK',
        description:
          'Instantly reclaim wardrobe shelves and under-bed storage. Organiva SpaceVault cubes combine multi-layer tear-resistant polymer with airtight triple-seal valves. Compatible with any home vacuum or included compact hand pump. Keeps comforters, winter shawls, and clothing completely sealed from moisture, dust, and humidity.',
        problemStatement: 'Closets bursting with winter duvets, lawn suits, and blankets leaving zero room for daily clothes?',
        solutionStatement: 'Compress bulky textiles down by 80% in 60 seconds with moisture-proof, dust-proof vacuum seals.',
        images: ['/images/products/spacevault-main.webp'],
        isHero: false,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Organiva MagDock Floating Entryway Key Dock & Mail Shelf',
        slug: 'magdock-entryway-key-shelf',
        sku: 'ORG-MD-08',
        category: categoriesMap['living'],
        shortBenefit: 'Solid walnut & white steel wall dock with hidden high-power magnetic key suspension.',
        price: 2450,
        salePrice: 1850,
        costPrice: 750,
        stock: 40,
        stockStatus: 'IN_STOCK',
        description:
          'Never frantically search for your car keys or house keys when heading out the door. The Organiva MagDock combines natural solid walnut wood with powder-coated architectural steel. Features a top groove for incoming mail and wallet/sunglasses, while high-strength neodymium magnets embedded on the underside hold your key rings suspended with a satisfying snap.',
        problemStatement: 'Constantly misplacing car keys, bills, and sunglasses on dining tables and sofa crevices?',
        solutionStatement: 'A dedicated, elegant entryway docking station that greets you the moment you step through your front door.',
        images: ['/images/products/magdock-main.webp'],
        isHero: false,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Organiva CableGrid Magnetic Desktop Cord Management Hub',
        slug: 'cablegrid-magnetic-cord-organizer',
        sku: 'ORG-CG-02',
        category: categoriesMap['workspace'],
        shortBenefit: 'Weighted aluminum hub with magnetic collars keeps charging cords neatly anchored.',
        price: 1950,
        salePrice: 1550,
        costPrice: 620,
        stock: 60,
        stockStatus: 'IN_STOCK',
        description:
          'Eliminate charging cable drops and messy tangled wires. Weighted matte space gray aluminum base with five magnetic clip collars. They snap into the dock when unplugged and release with effortless one-hand pull.',
        problemStatement: 'Tired of watching charging cables slip off the edge of your desk and crawling onto dusty floors?',
        solutionStatement: 'Magnetically anchors every wire in a neat, clean lineup right beside your laptop or nightstand.',
        images: ['/images/products/cablegrid-main.webp', '/images/products/cablegrid-desk.webp'],
        isHero: false,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Organiva AutoGrip 15W MagSafe Smart Wireless Car Vent Mount',
        slug: 'autogrip-magsafe-car-mount',
        sku: 'ORG-AG-03',
        category: categoriesMap['car'],
        shortBenefit: 'Locks onto any phone with 16 N52 magnets while fast-charging at 15W.',
        price: 3450,
        salePrice: 2850,
        costPrice: 1200,
        stock: 45,
        stockStatus: 'IN_STOCK',
        description:
          'Engineered for Pakistani road bumps and potholes. Dual-locking steel vent hook and 16 aerospace-grade N52 magnets anchor your phone with zero wobble while delivering 15W intelligent wireless fast charging.',
        problemStatement: 'Fumbling with flimsy plastic phone clamps that shake, block air vents, or drop your phone on sharp turns?',
        solutionStatement: 'Snap on with one tap, charge wirelessly, and rotate 360° for navigation with absolute peace of mind.',
        images: ['/images/products/autogrip-main.webp', '/images/products/autogrip-car.webp'],
        isHero: false,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Organiva AeroGlow Motion-Sensor Ultra-Thin Cabinet Light',
        slug: 'aeroglow-motion-sensor-light',
        sku: 'ORG-AGL-04',
        category: categoriesMap['closet'],
        shortBenefit: '9mm razor-thin magnetic light bar with dual PIR sensors and warm glare-free glow.',
        price: 2200,
        salePrice: 1750,
        costPrice: 700,
        stock: 50,
        stockStatus: 'IN_STOCK',
        description:
          'Add soft luxury lighting under kitchen cabinets, inside dark closets, on staircases, or in bathroom vanities. Side-emitting optical diffusion prevents harsh glare. Automatically illuminates when you approach.',
        problemStatement: 'Groping in pitch-black closets or being blinded by harsh 100W room lights during midnight runs?',
        solutionStatement: 'Soothing indirect ambient illumination only when someone is present. Zero wiring, zero electrician needed.',
        images: ['/images/products/aeroglow-main.webp', '/images/products/aeroglow-closet.webp'],
        isHero: false,
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Organiva CleanPress Under-Sink 2-in-1 Soap Dispenser & Caddy',
        slug: 'cleanpress-kitchen-soap-dispenser',
        sku: 'ORG-CP-05',
        category: categoriesMap['kitchen'],
        shortBenefit: 'One-hand sponge pump dispenses the exact soap measure without counter puddles.',
        price: 1650,
        salePrice: 1290,
        costPrice: 480,
        stock: 70,
        stockStatus: 'IN_STOCK',
        description:
          'Say goodbye to slimy, soapy countertops and dripping detergent bottles. Press your dish sponge down on the pump tray to distribute the perfect soap measure with zero dripping.',
        problemStatement: 'Hate slippery soap puddles around kitchen taps and the endless waste of pouring liquid soap?',
        solutionStatement: 'Instant, clean one-handed soap dispensing and a ventilated drainage tray for clean countertops.',
        images: ['/images/products/cleanpress-main.webp'],
        isHero: false,
        isFeatured: true,
        isActive: true,
      },
    ];

    for (const p of productsToUpsert) {
      const prod = await Product.findOneAndUpdate(
        { slug: p.slug },
        p,
        { upsert: true, new: true }
      );
      // Ensure linked inventory
      await Inventory.findOneAndUpdate(
        { product: prod._id },
        {
          product: prod._id,
          sku: prod.sku,
          stockQuantity: prod.stock,
          costPrice: prod.costPrice,
          sellingPrice: prod.salePrice || prod.price,
        },
        { upsert: true }
      );
    }

    console.log(`✅ Synced ${productsToUpsert.length} Home Organization products across 5 room spaces.`);
  } catch (err) {
    console.error('Error syncing Home Organization catalog:', err);
  }
};

// Execute if called directly
if (require.main === module) {
  mongoose.connect(config.MONGODB_URI || 'mongodb://127.0.0.1:27017/organiva_db').then(async () => {
    await updateHomeOrganizationCatalog();
    process.exit(0);
  });
}
