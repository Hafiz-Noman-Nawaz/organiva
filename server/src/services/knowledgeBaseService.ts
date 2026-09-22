import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { KnowledgeDocument } from '../models/KnowledgeDocument';
import { Product, IProduct } from '../models/Product';
import { ShippingRule } from '../models/ShippingRule';

export const FALLBACK_STORE_PRODUCTS = [
  {
    _id: '65f000000000000000000001',
    title: 'OrbitSeal Pro - Precision Thermal Sealer & Cutter',
    slug: 'orbitseal-pro',
    price: 3800,
    salePrice: 2899,
    shortBenefit: 'Locks in freshness for chips, spices, and pulses in 1 second',
    images: ['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=800&auto=format&fit=crop'],
    stockStatus: 'IN_STOCK',
    isHero: true,
  },
  {
    _id: '65f000000000000000000002',
    title: 'SpaceVault™ Vacuum Compression Storage System (6-Pack)',
    slug: 'spacevault-vacuum-storage',
    price: 4999,
    salePrice: 3899,
    shortBenefit: 'Reclaim 80% wardrobe and luggage space instantly with triple-seal air valves',
    images: ['https://images.unsplash.com/photo-1558997519-83ea9252edf8?q=80&w=800&auto=format&fit=crop'],
    stockStatus: 'IN_STOCK',
  },
  {
    _id: '65f000000000000000000003',
    title: 'SpinTidy™ 360° Rotating Lazy Susan Organizer',
    slug: 'spintidy-360-turntable',
    price: 3499,
    salePrice: 2499,
    shortBenefit: 'Eliminate deep-shelf chaos with smooth stainless steel ball-bearing access',
    images: ['https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=800&auto=format&fit=crop'],
    stockStatus: 'IN_STOCK',
  },
  {
    _id: '65f000000000000000000004',
    title: 'CableGrid™ Magnetic Desk Cable Manager',
    slug: 'cablegrid-magnetic-cable-manager',
    price: 2499,
    salePrice: 1799,
    shortBenefit: 'Zero cable clutter on work desks with neodymium magnetic anchors',
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop'],
    stockStatus: 'IN_STOCK',
  },
  {
    _id: '65f000000000000000000005',
    title: 'FoldMaster™ Precision Clothes Folding Board',
    slug: 'foldmaster-laundry-board',
    price: 2999,
    salePrice: 1999,
    shortBenefit: 'Boutique-neat wardrobe folds in 3 simple moves',
    images: ['https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=800&auto=format&fit=crop'],
    stockStatus: 'IN_STOCK',
  },
  {
    _id: '65f00000000000000000006',
    title: 'CleanPress™ 2-in-1 Kitchen Soap Dispenser & Sponge Caddy',
    slug: 'cleanpress-soap-dispenser',
    price: 2200,
    salePrice: 1599,
    shortBenefit: 'One-hand pump saves liquid soap & keeps kitchen sinks completely dry',
    images: ['https://images.unsplash.com/photo-1585421514738-01798e348b17?q=80&w=800&auto=format&fit=crop'],
    stockStatus: 'IN_STOCK',
  },
  {
    _id: '65f00000000000000000007',
    title: 'AeroGlow™ Rechargeable Motion Sensor Closet Light',
    slug: 'aeroglow-motion-sensor-light',
    price: 3600,
    salePrice: 2699,
    shortBenefit: 'Magnetic mount automatic warm illumination for dark wardrobes and kitchens',
    images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop'],
    stockStatus: 'IN_STOCK',
  },
  {
    _id: '65f00000000000000000008',
    title: 'AutoGrip™ 15W MagSafe Wireless Car Charger & Mount',
    slug: 'autogrip-magsafe-car-mount',
    price: 4500,
    salePrice: 3299,
    shortBenefit: 'One-tap snap magnetic lock with active thermal protection on bumpy roads',
    images: ['https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop'],
    stockStatus: 'IN_STOCK',
  },
];

export const FALLBACK_POLICIES_CONTEXT = `
--- SOURCE: Organiva Shipping & Delivery Policy ---
Organiva provides nationwide delivery across all cities, towns, and regions in Pakistan.
Standard shipping rate is PKR 250.
FREE SHIPPING is automatically applied on all orders exceeding PKR 3500.
Estimated delivery time is 2 to 4 business days.
Cash on Delivery (COD) is available nationwide with zero advance deposit required.

--- SOURCE: Organiva 7-Day Replacement & Return Policy ---
Organiva offers an unconditional 7-day hassle-free replacement warranty for any item damaged in transit, defective, or not working as described.
Customers can reach official WhatsApp support (${config.WHATSAPP_NUMBER}) with their Order ID.

--- SOURCE: Organiva Brand Story & Mission ---
Organiva ("Smart products. Simpler living.") is Pakistan's premium direct-to-consumer brand for smart home organization.
`;

export class KnowledgeBaseService {
  /**
   * Automatically indexes or updates a product into the RAG Knowledge Base
   */
  public static async syncProductKnowledge(product: IProduct): Promise<void> {
    const title = `Product Guide: ${product.title}`;
    const tags = [
      product.title.toLowerCase(),
      product.slug,
      product.sku.toLowerCase(),
      'product',
      'shop',
      'price',
    ];

    const benefitsText = product.benefits
      .map((b) => `- ${b.title}: ${b.description}`)
      .join('\n');

    const specsText = product.specifications
      .map((s) => `- ${s.key}: ${s.value}`)
      .join('\n');

    const content = `
Product Name: ${product.title}
SKU: ${product.sku}
Regular Price: PKR ${product.price}
Sale Price: ${product.salePrice ? `PKR ${product.salePrice}` : 'N/A'}
Effective Selling Price: PKR ${product.salePrice || product.price}
Stock Status: ${product.stockStatus} (Available units: ${product.stock})
Category Slug: ${product.slug}
Core Promise: ${product.shortBenefit}

Problem it Solves:
${product.problemStatement}

Solution & How It Works:
${product.solutionStatement}

Full Description:
${product.description}

Key Benefits:
${benefitsText}

Technical Specifications:
${specsText}

Payment & Delivery:
Supports Cash on Delivery (COD), JazzCash, and Easypaisa. Nationwide delivery across Pakistan within 2-4 business days. 7-Day Easy Replacement Guarantee.
`.trim();

    await KnowledgeDocument.findOneAndUpdate(
      { productRef: product._id },
      {
        title,
        category: 'PRODUCT',
        content,
        tags,
        productRef: product._id,
        lastSyncedAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  /**
   * Initializes store-wide foundational knowledge (Policies, FAQ, Shipping)
   */
  public static async syncStorePolicies(): Promise<void> {
    const shipping = await ShippingRule.findOne({ isDefault: true });
    const freeThreshold = shipping?.freeShippingThreshold || 3500;
    const flatRate = shipping?.flatRate || 250;

    const docs = [
      {
        title: 'Organiva Shipping & Delivery Policy',
        category: 'POLICY' as const,
        tags: ['shipping', 'delivery', 'cod', 'cash on delivery', 'cities', 'karachi', 'lahore', 'islamabad', 'charges'],
        content: `
Organiva provides nationwide delivery across all cities, towns, and regions in Pakistan.
Standard shipping rate is PKR ${flatRate}.
FREE SHIPPING is automatically applied on all orders exceeding PKR ${freeThreshold}.
Estimated delivery time is 2 to 4 business days.
Orders placed before 2:00 PM are dispatched the same day.
Cash on Delivery (COD) is available nationwide with zero advance deposit required.
Orders can be tracked 24/7 on organiva.pk/track-order using your Order ID and mobile number.
`,
      },
      {
        title: 'Organiva 7-Day Replacement & Return Policy',
        category: 'POLICY' as const,
        tags: ['return', 'refund', 'warranty', 'replacement', 'damaged', 'broken', 'exchange'],
        content: `
Organiva offers an unconditional 7-day hassle-free replacement warranty for any item damaged in transit, defective, or not working as described.
To initiate a replacement, customers simply send a photo or video of the issue to our official WhatsApp support (${config.WHATSAPP_NUMBER}) or email support@organiva.pk with their Order ID.
Our team will dispatch a replacement unit or issue a refund immediately.
`,
      },
      {
        title: 'Organiva Brand Story & Mission',
        category: 'BRAND' as const,
        tags: ['brand', 'about', 'organiva', 'mission', 'trust', 'quality'],
        content: `
Organiva ("Smart products. Simpler living.") is a premium Pakistani direct-to-consumer (DTC) lifestyle brand.
We curate smart, durable everyday items that eliminate daily friction in Pakistani homes, kitchens, workspaces, and cars.
Unlike generic dropshipping websites, every Organiva product undergoes rigorous physical testing for build quality, battery safety, and durability before being listed.
We believe in clean minimalism, authentic Pakistani customer care, and complete transparency.
`,
      },
    ];

    for (const doc of docs) {
      await KnowledgeDocument.findOneAndUpdate(
        { title: doc.title },
        { ...doc, lastSyncedAt: new Date() },
        { upsert: true }
      );
    }
  }

  /**
   * Performs contextual retrieval based on user query
   */
  public static async retrieveRelevantContext(query: string): Promise<string> {
    try {
      const tokens = query
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((t) => t.length > 2);

      let docs: any[] = [];

      if (tokens.length > 0) {
        docs = await KnowledgeDocument.find({
          $or: [
            { tags: { $in: tokens } },
            { $text: { $search: query } },
          ],
        })
          .limit(4)
          .lean();
      }

      if (docs.length === 0) {
        docs = await KnowledgeDocument.find({ category: { $in: ['PRODUCT', 'POLICY'] } })
          .limit(3)
          .lean();
      }

      if (docs.length > 0) {
        return docs.map((d) => `--- SOURCE: ${d.title} ---\n${d.content}`).join('\n\n');
      }
    } catch (dbErr) {
      console.warn('⚠️ Context retrieval DB lookup bypassed:', (dbErr as any)?.message);
    }

    return FALLBACK_POLICIES_CONTEXT;
  }

  /**
   * Generates intelligent customer response using Gemini with retrieved context
   */
  public static async answerCustomerQuery(
    customerQuery: string,
    chatHistory: Array<{ role: 'user' | 'model'; parts: string }> = []
  ): Promise<{ response: string; recommendedProducts?: any[] }> {
    let context = FALLBACK_POLICIES_CONTEXT;
    let allProducts: any[] = FALLBACK_STORE_PRODUCTS;

    try {
      context = await this.retrieveRelevantContext(customerQuery);
      const dbProducts = await Product.find({ isActive: true })
        .select('title slug price salePrice shortBenefit images stockStatus')
        .lean();
      if (dbProducts && dbProducts.length > 0) {
        allProducts = dbProducts;
      }
    } catch (err: any) {
      console.warn('⚠️ Knowledge base product lookup failed, using static catalog:', err?.message);
    }

    const systemPrompt = `
You are "Orgi", the friendly, warm, and exceptionally knowledgeable home organization AI companion for ORGANIVA (organiva.pk) — Pakistan's premium brand for smart home organization and simpler living.

Your brand philosophy is "Thoughtful spaces. Calmer minds."
Your voice is modern, confident, helpful, minimal, and authentic. You speak politely with Pakistani warmth (using occasional warm greetings like Assalam-o-alaikum when starting conversation). Never use exaggerated hype or cheap sales tactics.

KNOWLEDGE BASE CONTEXT:
${context}

AVAILABLE STORE PRODUCTS:
${JSON.stringify(
  allProducts.map((p) => ({
    name: p.title,
    slug: p.slug,
    price: `PKR ${p.salePrice || p.price}`,
    benefit: p.shortBenefit,
    stock: p.stockStatus,
  })),
  null,
  2
)}

RULES:
1. Answer the customer's question directly based on the verified Organiva knowledge base above.
2. If the customer is asking for recommendations (e.g., "what do you have for keeping snacks fresh?", "something for messy desk cables?", "car holder"), recommend the exact Organiva product, explaining WHY it solves their specific problem.
3. Mention prices in PKR accurately.
4. Mention that Cash on Delivery (COD), JazzCash, and Easypaisa are available, with 2-4 days nationwide delivery and Free Delivery on orders over Rs. 3,500.
5. Keep responses concise, clear, and easy to read on mobile.
6. If the customer asks how to order, tell them they can click "Shop Now" or "Add to Cart" directly, or order via WhatsApp.
7. Do not invent products or specs that are not in the Organiva catalog.
`.trim();

    // Try Gemini 3.6 Flash
    if (config.GEMINI_API_KEY && config.GEMINI_API_KEY.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

        const prompt = `${systemPrompt}\n\nCustomer Inquiry: "${customerQuery}"\nPlease provide a helpful, friendly response:`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (text && text.trim().length > 0) {
          const queryLower = customerQuery.toLowerCase();
          const recommended = allProducts.filter(
            (p) =>
              text.toLowerCase().includes(p.title.toLowerCase()) ||
              queryLower.includes(p.slug.toLowerCase()) ||
              queryLower.includes(p.title.toLowerCase().split(' ')[0] || '')
          );

          return {
            response: text,
            recommendedProducts: recommended.slice(0, 2),
          };
        }
      } catch (geminiError: any) {
        console.error('Gemini 3.6 Flash call failed, falling back to local concierge:', geminiError?.message || geminiError);
      }
    }

    // High-quality local contextual fallback if GEMINI_API_KEY is pending or throttled
    return this.generateSmartLocalFallback(customerQuery, allProducts, context);
  }

  /**
   * Streams intelligent customer response via Gemini using SSE
   */
  public static async streamCustomerQuery(
    customerQuery: string,
    onChunk: (chunk: string) => void
  ): Promise<{ fullText: string; recommendedProducts: any[] }> {
    let context = FALLBACK_POLICIES_CONTEXT;
    let allProducts: any[] = FALLBACK_STORE_PRODUCTS;

    try {
      context = await this.retrieveRelevantContext(customerQuery);
      const dbProducts = await Product.find({ isActive: true })
        .select('title slug price salePrice shortBenefit images stockStatus')
        .lean();
      if (dbProducts && dbProducts.length > 0) {
        allProducts = dbProducts;
      }
    } catch (err: any) {
      console.warn('⚠️ Stream DB lookup failed, using static catalog:', err?.message);
    }

    const systemPrompt = `
You are "Orgi", the friendly, warm, and exceptionally knowledgeable home organization AI companion for ORGANIVA (organiva.pk) — Pakistan's premium brand for smart home organization and simpler living.
Your brand philosophy is "Thoughtful spaces. Calmer minds."
Your voice is modern, confident, helpful, minimal, and authentic. You speak politely with Pakistani warmth.

KNOWLEDGE BASE CONTEXT:
${context}

AVAILABLE STORE PRODUCTS:
${JSON.stringify(
  allProducts.map((p) => ({
    name: p.title,
    slug: p.slug,
    price: `PKR ${p.salePrice || p.price}`,
    benefit: p.shortBenefit,
    stock: p.stockStatus,
  })),
  null,
  2
)}

RULES:
1. Answer the customer's question directly based on the verified Organiva knowledge base above.
2. Recommend relevant Organiva products with prices in PKR.
3. Mention Cash on Delivery (COD), JazzCash, Easypaisa, 2-4 days nationwide delivery, and Free Delivery over Rs. 3,500.
4. Keep responses concise, clear, and easy to read.
`.trim();

    if (config.GEMINI_API_KEY && config.GEMINI_API_KEY.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

        const prompt = `${systemPrompt}\n\nCustomer Inquiry: "${customerQuery}"\nPlease provide a helpful, friendly response:`;
        const resultStream = await model.generateContentStream(prompt);
        // Suppress unhandled rejection on the response promise if Google stream fails
        resultStream.response?.catch(() => {});

        let fullText = '';
        try {
          for await (const chunk of resultStream.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            onChunk(chunkText);
          }
        } catch (iterErr: any) {
          console.warn('⚠️ Stream chunk iteration error:', iterErr?.message || iterErr);
        }

        if (fullText.trim().length > 0) {
          const queryLower = customerQuery.toLowerCase();
          const recommended = allProducts.filter(
            (p) =>
              fullText.toLowerCase().includes(p.title.toLowerCase()) ||
              queryLower.includes(p.slug.toLowerCase()) ||
              queryLower.includes(p.title.toLowerCase().split(' ')[0] || '')
          );

          return { fullText, recommendedProducts: recommended.slice(0, 2) };
        }
      } catch (geminiError: any) {
        console.error('Gemini 3.6 stream error, falling back to local:', geminiError?.message || geminiError);
      }
    }

    const fallback = this.generateSmartLocalFallback(customerQuery, allProducts, context);
    onChunk(fallback.response);
    return { fullText: fallback.response, recommendedProducts: fallback.recommendedProducts };
  }

  private static generateSmartLocalFallback(
    query: string,
    allProducts: any[],
    context: string
  ): { response: string; recommendedProducts: any[] } {
    const q = query.toLowerCase();

    // Matching products
    let matchedProducts = allProducts.filter(
      (p) =>
        q.includes(p.title.toLowerCase()) ||
        q.includes(p.slug) ||
        p.shortBenefit.toLowerCase().split(' ').some((word: string) => word.length > 3 && q.includes(word))
    );

    if (matchedProducts.length === 0) {
      if (q.includes('fresh') || q.includes('seal') || q.includes('snack') || q.includes('food') || q.includes('kitchen') || q.includes('chip')) {
        matchedProducts = allProducts.filter((p) => p.slug.includes('orbitseal'));
      } else if (q.includes('cable') || q.includes('wire') || q.includes('desk') || q.includes('workspace')) {
        matchedProducts = allProducts.filter((p) => p.slug.includes('cablegrid'));
      } else if (q.includes('car') || q.includes('phone holder') || q.includes('magsafe') || q.includes('charge')) {
        matchedProducts = allProducts.filter((p) => p.slug.includes('autogrip'));
      } else if (q.includes('light') || q.includes('closet') || q.includes('sensor') || q.includes('cabinet')) {
        matchedProducts = allProducts.filter((p) => p.slug.includes('aeroglow'));
      } else if (q.includes('trash') || q.includes('sink') || q.includes('soap') || q.includes('clean')) {
        matchedProducts = allProducts.filter((p) => p.slug.includes('cleanpress'));
      }
    }

    if (q.includes('track') || q.includes('status') || q.includes('where is my order')) {
      return {
        response: `You can track your Organiva order anytime at our **Track Order** page! Simply enter your Order ID (e.g. ORG-2601) and your phone number. You'll see real-time updates from dispatch to nationwide delivery. If you need urgent assistance, our WhatsApp team is also available at ${config.WHATSAPP_NUMBER}.`,
        recommendedProducts: [],
      };
    }

    if (q.includes('delivery') || q.includes('shipping') || q.includes('how long') || q.includes('days') || q.includes('charges')) {
      return {
        response: `We deliver nationwide across Pakistan in **2 to 4 business days**. Standard shipping is Rs. 250, and we offer **Free Nationwide Express Delivery** on all orders over Rs. 3,500! Cash on Delivery (COD) is available with no advance payment required.`,
        recommendedProducts: matchedProducts.slice(0, 2),
      };
    }

    if (q.includes('payment') || q.includes('cod') || q.includes('jazzcash') || q.includes('easypaisa')) {
      return {
        response: `We support 3 secure payment methods:\n1. **Cash on Delivery (COD)** — Pay the courier when your parcel arrives.\n2. **JazzCash** — Instant secure mobile wallet checkout.\n3. **Easypaisa** — Instant secure mobile wallet checkout.\n\nAll orders come with our 7-Day Replacement Guarantee!`,
        recommendedProducts: matchedProducts.slice(0, 2),
      };
    }

    if (matchedProducts.length > 0) {
      const p = matchedProducts[0];
      const price = p.salePrice || p.price;
      return {
        response: `I'd recommend the **${p.title}** (${p.shortBenefit}). It's priced at **PKR ${price}** and is in stock. It solves everyday clutter and makes daily life simpler! Would you like to view its full details or place an order with Cash on Delivery?`,
        recommendedProducts: [p],
      };
    }

    return {
      response: `Welcome to **Organiva**! We design smart, minimal products that make everyday Pakistani home, kitchen, workspace, and car life simpler. How can I help you today? You can ask me about our hero problem-solvers, pricing, delivery times, or tracking an order!`,
      recommendedProducts: allProducts.slice(0, 2),
    };
  }
}
