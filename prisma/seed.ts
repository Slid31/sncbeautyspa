import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

// ── Catalog data ───────────────────────────────────────────────────────────────

const CATALOG = [
  {
    name: "Lash Extensions",
    description:
      "Applying synthetic, silk, or faux mink fibers to natural lashes using medical-grade adhesive. Performed by certified technicians — Classic, Volume, Hybrid, and Mega Volume lashes lasting up to 6 weeks.",
    services: [
      { name: "Classic Full Set",          price: 70,  duration: 120, description: "1 lash per 1 natural lash — individual extension applied to each natural lash for a natural look." },
      { name: "Classic Retouch",           price: 35,  duration: 60,  description: "Recommended after 2 weeks to replace lashes that have grown out with the natural shed cycle." },
      { name: "Hybrid Full Set",           price: 80,  duration: 150, description: "A blend of Classic and Volume lashes designed for a textured, wispy, and fuller appearance." },
      { name: "Hybrid Retouch",            price: 40,  duration: 75,  description: "Recommended after 2 weeks to replace lashes that have grown out with the natural shed cycle." },
      { name: "Volume Full Set",           price: 90,  duration: 180, description: "Multiple, ultra-lightweight lashes fanned and applied to each natural lash, creating a dense, voluminous look." },
      { name: "Volume Retouch",            price: 50,  duration: 90,  description: "Recommended after 2 weeks to replace lashes that have grown out with the natural shed cycle." },
      { name: "Mega Volume Full Set",      price: 110, duration: 240, description: "Premium high-density technique — maximum volume, dramatic and bold lashes with a dark dense base and fluffy tips." },
      { name: "Mega Volume Retouch",       price: 60,  duration: 120, description: "Recommended after 2 weeks to replace lashes that have grown out with the natural shed cycle." },
      { name: "Lash Removal",             price: 30,  duration: 30,  description: "Gentle removal using micro brushes or tweezers. All adhesive residue properly cleared to protect natural lashes." },
    ],
  },
  {
    name: "Brow Shape",
    description:
      "Expert brow shaping using a precise blend of waxing and tweezing techniques, tailored by our skilled brow artists. Refined, balanced brows that enhance your natural features.",
    services: [
      { name: "Brow Shape (Wax or Tweeze)", price: 15,  duration: 30, description: "Brief consultation followed by expert shaping — refined, balanced brows that enhance your natural features." },
      { name: "Brow Tint",                  price: 50,  duration: 45, description: "Professional brow tinting for added depth and richness." },
      { name: "Brow Lamination",            price: 120, duration: 90, description: "Keratin-infused treatment that smooths, shapes, and sets unruly brows. Enhances thickness, volume, and definition for a clean, lifted, fuller appearance lasting 4–6 weeks." },
    ],
  },
  {
    name: "Brows & Lashes Lift",
    description:
      "Keratin-infused lift treatment for brows and lashes delivering a refined, youthful look. Results last 4 to 6 weeks with minimal maintenance.",
    services: [
      { name: "Lash Lift", price: 100, duration: 60, description: "Chemical process applied step by step to perm and lift natural lashes — strengthens and curls them in place for a healthy, lifted look lasting 4–6 weeks." },
      { name: "Lash Tint", price: 50,  duration: 30, description: "Professional lash tinting to add depth and richness to your natural lashes." },
    ],
  },
  {
    name: "Hair Braiding",
    description:
      "Modern braiding styles geared towards both professional and daily lifestyle, implementing the latest techniques for your desired look.",
    services: [
      { name: "Bob",                       price: 120, duration: 120, description: "Starting from $120. Price varies based on length and complexity." },
      { name: "Box Braid",                 price: 120, duration: 240, description: "Starting from $120. Price varies based on length and number of braids." },
      { name: "Cornrows",                  price: 50,  duration: 90,  description: "Starting from $50. Price varies based on pattern and complexity." },
      { name: "Cornrows / Box Braid",      price: 130, duration: 150, description: "Starting from $130. Combination style — price varies based on complexity." },
      { name: "Senegalese Twists",         price: 120, duration: 240, description: "Starting from $120. Price varies based on length and thickness." },
      { name: "Faux Locks",               price: 180, duration: 300, description: "Starting from $180. Price varies based on length and volume." },
      { name: "Soft Locks",               price: 180, duration: 240, description: "Starting from $180. Price varies based on length and volume." },
      { name: "Knotless",                  price: 130, duration: 240, description: "Starting from $130. Price varies based on length and size." },
      { name: "Boho Knotless",             price: 130, duration: 270, description: "Starting from $130. Price varies based on length and added curls." },
      { name: "Boro-Boro Knotless",        price: 200, duration: 300, description: "Starting from $200. Premium knotless style — price varies based on length and complexity." },
      { name: "Kinky Twist",               price: 130, duration: 180, description: "Starting from $130. Price varies based on length and thickness." },
      { name: "Passion Twist",             price: 150, duration: 180, description: "Starting from $150. Price varies based on length and thickness." },
      { name: "Sewn-In",                   price: 130, duration: 150, description: "Starting from $130. Price varies based on number of tracks and length." },
      { name: "Crochet Braids",            price: 130, duration: 150, description: "Starting from $130. Price varies based on volume and style." },
      { name: "Single Twist",              price: 80,  duration: 120, description: "Starting from $80. Price varies based on length and thickness." },
      { name: "Locs & Interlocs Re-Twist", price: 150, duration: 180, description: "Starting from $150. Price varies based on length and number of locs." },
    ],
  },
  {
    name: "Hair Extensions",
    description:
      "Professional hair extension installation, maintenance, and removal. Prices listed do not include the cost of hair.",
    services: [
      { name: "Sew-In",                    price: 75,  duration: 180, description: "Price varies $0–$150 (hair not included). Depends on number of tracks and length." },
      { name: "Tape-In",                   price: 100, duration: 120, description: "Price varies $0–$200 (hair not included). Depends on number of pieces and length." },
      { name: "Clip-In",                   price: 65,  duration: 60,  description: "Price varies $0–$130 (hair not included). Depends on number of pieces." },
      { name: "I-Tip / Micro-Link",        price: 250, duration: 240, description: "Price varies $0–$500 (hair not included). Intensive method — depends on number of strands." },
      { name: "K-Tip / Fusion",            price: 250, duration: 240, description: "Price varies $0–$500 (hair not included). Intensive fusion method — depends on number of strands." },
      { name: "Full Head Re-Tape-In",      price: 100, duration: 90,  description: "Re-taping with new double-sided tape tabs (Walker Tape). Hair must be completely dry before appointment." },
      { name: "I-Tip / K-Tip Re-Install",  price: 120, duration: 120, description: "Starting from $120. Re-installation of I-Tip or K-Tip extensions." },
      { name: "Maintenance",               price: 140, duration: 90,  description: "Starting from $140. Extension maintenance — price depends on method and volume." },
      { name: "Removal Only",              price: 100, duration: 60,  description: "Starting from $100. Safe removal of hair extensions." },
    ],
  },
  {
    name: "Spa Treatments",
    description:
      "Professional skincare and spa treatments tailored to your skin type and concerns, performed by certified estheticians.",
    services: [
      { name: "Regular Facial",            price: 75,  duration: 45, description: "Gentle cleansing, nourishing exfoliation (no extractions), and a rejuvenating mask for radiant skin. Includes serum & SPF application." },
      { name: "Deep Cleansing Facial",     price: 130, duration: 90, description: "Thorough double cleansing, exfoliation, extractions, soothing mask, LED light therapy, face and décolleté massage. Includes serum & SPF application." },
      { name: "Teen Facial",               price: 85,  duration: 55, description: "Soothes the skin and reduces breakouts/acne scars (ages 16–21). Double cleanse, exfoliation, steam, extractions, mask & treatment, serum application." },
      { name: "Acne Treatment Facial",     price: 175, duration: 90, description: "Deep cleansing treatment to unclog pores, reduce inflammation, and minimize breakouts. Includes extractions, peels, high-frequency or light therapy, masks & serums." },
      { name: "BB Glow Facial",            price: 200, duration: 90, description: "Semi-permanent microneedling treatment injecting tinted serums for an instant glowing foundation effect lasting several weeks to months." },
      { name: "Dermaplaning Facial",       price: 175, duration: 60, description: "Non-invasive procedure using a surgical-grade scalpel to remove dead skin cells and fine vellus hair. Enhances product absorption and allows smoother makeup application." },
      { name: "Microdermabrasion Facial",  price: 0,   duration: 60, description: "Non-invasive mechanical exfoliation using a diamond-tipped or crystal wand. Reduces fine lines, scars, acne, and sun damage. Contact us for pricing." },
      { name: "Microneedling Facial",      price: 0,   duration: 60, description: "Collagen induction therapy using fine sterile needles to boost collagen and elastin. Reduces acne scars, wrinkles, and enlarged pores. 3–4 sessions recommended. Contact us for pricing." },
      { name: "Micro-Current Treatment",   price: 200, duration: 90, description: "Bio-Therapeutic Microcurrent uses low-level electrical currents to stimulate facial muscles, boost collagen/elastin, and increase ATP. Lifts, sculpts, and tightens skin." },
      { name: "Chemical Peels Treatment",  price: 180, duration: 60, description: "Dermalogica Pro Peels — professional-grade chemical peel to deeply exfoliate, resurface skin, and target wrinkles, uneven pigmentation, or acne scars." },
      { name: "Aromatherapy Facial",       price: 100, duration: 60, description: "Holistic treatment blending customized essential oils with traditional facial techniques. Includes cleansing, exfoliation, targeted mask, and calming facial/neck massage." },
      { name: "Vajacial & Manjacial",      price: 120, duration: 60, description: "Specialized treatment for the bikini/genital area — cleansing, exfoliation, steam, and extractions to treat ingrown hairs, acne, and hyperpigmentation." },
    ],
  },
  {
    name: "Waxing",
    description:
      "Semi-permanent removal of body hair from the root using depilatory wax. Experienced technicians for smooth, long-lasting results.",
    services: [
      { name: "Hands (fingers included)",   price: 15,  duration: 15,  description: "Hand and finger waxing." },
      { name: "Underarms",                  price: 20,  duration: 15,  description: "Underarm waxing." },
      { name: "Half Arm",                   price: 40,  duration: 30,  description: "Half arm waxing (lower or upper arm)." },
      { name: "Full Arm (fingers included)", price: 75, duration: 45,  description: "Full arm waxing including fingers." },
      { name: "Feet (toes included)",       price: 20,  duration: 15,  description: "Feet and toe waxing." },
      { name: "Lower Leg + Knee",           price: 45,  duration: 30,  description: "Lower leg and knee waxing." },
      { name: "Upper Leg",                  price: 45,  duration: 30,  description: "Upper leg waxing." },
      { name: "Full Legs",                  price: 80,  duration: 60,  description: "Full leg waxing from feet to upper thigh." },
      { name: "Shoulders",                  price: 30,  duration: 20,  description: "Shoulder waxing." },
      { name: "Upper Back",                 price: 30,  duration: 20,  description: "Upper back waxing." },
      { name: "Lower Back",                 price: 30,  duration: 20,  description: "Lower back waxing." },
      { name: "Full Back (incl. shoulders)", price: 85, duration: 45,  description: "Full back waxing including shoulders." },
      { name: "Chest",                      price: 45,  duration: 30,  description: "Chest waxing." },
      { name: "Stomach",                    price: 45,  duration: 30,  description: "Stomach waxing." },
      { name: "Bikini Line (V)",            price: 55,  duration: 30,  description: "Bikini line waxing (V-shape)." },
      { name: "Bikini Line (P)",            price: 55,  duration: 30,  description: "Bikini line waxing (P-shape)." },
      { name: "Bikini Full (V)",            price: 65,  duration: 30,  description: "Full bikini waxing (V-shape)." },
      { name: "Bikini Full (P)",            price: 65,  duration: 30,  description: "Full bikini waxing (P-shape)." },
      { name: "Brazilian (V)",              price: 85,  duration: 30,  description: "Full Brazilian waxing." },
      { name: "Brazilian (P)",              price: 85,  duration: 30,  description: "Full Brazilian waxing — alternative style." },
      { name: "Full Manzilian (Males)",     price: 90,  duration: 45,  description: "Full male Brazilian waxing." },
      { name: "Bikini Line (Sides/Top)",    price: 65,  duration: 30,  description: "Bikini line waxing — sides and top." },
      { name: "Butt (between the cheeks)", price: 50,  duration: 20,  description: "Butt strip waxing between the cheeks." },
      { name: "Full Body Waxing",           price: 300, duration: 120, description: "Complete full body waxing service." },
      { name: "Chin Wax",                   price: 13,  duration: 15,  description: "Chin hair waxing." },
      { name: "Ear Wax",                    price: 12,  duration: 15,  description: "Ear hair waxing." },
      { name: "Eyebrow Wax",                price: 10,  duration: 15,  description: "Eyebrow shaping by waxing." },
      { name: "Upper Lip Wax",              price: 10,  duration: 15,  description: "Upper lip hair waxing." },
      { name: "Lower Lip Wax",              price: 10,  duration: 15,  description: "Lower lip hair waxing." },
      { name: "Neck Wax",                   price: 15,  duration: 15,  description: "Neck hair waxing." },
      { name: "Nose Wax",                   price: 10,  duration: 15,  description: "Nose hair waxing." },
      { name: "Sideburns Wax",              price: 20,  duration: 15,  description: "Sideburns hair waxing." },
      { name: "Cheeks Wax",                 price: 15,  duration: 15,  description: "Cheek hair waxing." },
      { name: "Full Face Wax",              price: 65,  duration: 30,  description: "Complete facial waxing — chin, lip, brows, cheeks, sideburns, and neck." },
    ],
  },
  {
    name: "LED Light Therapy",
    description:
      "Non-invasive light treatments using specific wavelengths to reduce acne, promote healing, treat skin conditions, and reduce inflammation. Results typically require 3–7 sessions.",
    services: [
      { name: "LED Light Therapy Session", price: 175, duration: 70, description: "Red, Blue, UV, or IPL light therapy targeting acne, wound healing, psoriasis, and inflammation. Series of 3–7 sessions recommended for optimal results." },
    ],
  },
  {
    name: "Red Light Therapy",
    description:
      "Non-invasive, non-UV treatment using low-level red or near-infrared light (620–850 nm) to boost cellular energy through mitochondria stimulation.",
    services: [
      { name: "Red Light Therapy Session", price: 150, duration: 20, description: "Low-level red/near-infrared light therapy for skin rejuvenation, wound healing, hair growth, and pain reduction. 3 sessions per week recommended for optimal results." },
    ],
  },
  {
    name: "Body Contouring",
    description:
      "Non-surgical body sculpting treatments to lift, firm, and shape without surgery or downtime.",
    services: [
      { name: "Vacuum Butt Lift", price: 150, duration: 60, description: "Non-surgical vacuum therapy to lift, firm, and contour the buttocks. Stimulates muscles, breaks down cellulite, and tones the area. Multiple sessions recommended for best results." },
    ],
  },
  {
    name: "Teeth Whitening",
    description:
      "Cosmetic teeth whitening using professional-grade peroxides to remove stains and lighten enamel for a brighter smile.",
    services: [
      { name: "Teeth Whitening", price: 150, duration: 60, description: "Removes stains and lightens teeth. Best for healthy teeth with yellow/orange staining. Does not work on fillings, crowns, caps, or veneers. Follow-up within 2 weeks recommended." },
    ],
  },
  {
    name: "Tooth Gems",
    description:
      "Small decorative jewels or crystals bonded to tooth enamel. Non-invasive, painless, and lasting several months.",
    services: [
      { name: "Tooth Gem Application", price: 50, duration: 30, description: "Swarovski crystals or precious metal gems bonded to enamel using dental adhesive and curing light. Available in many shapes and sizes. Additional gems discounted $5–$10." },
      { name: "Tooth Gem Removal",     price: 50, duration: 30, description: "Safe removal using a dental scaler or polishing tool, followed by polishing to remove remaining resin and smooth the enamel." },
    ],
  },
];

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  // ── Admin user ──────────────────────────────────────────────────────────────
  const email    = process.env.SEED_ADMIN_EMAIL    ?? "admin@sncbeautysalon.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
  } else {
    const hashed = await bcrypt.hash(password, 12);
    const user   = await prisma.user.create({
      data: { name: "Admin", email, password: hashed, role: "ADMIN" },
    });
    console.log(`✓ Created admin user: ${user.email}`);
  }

  // ── Catalog ─────────────────────────────────────────────────────────────────
  const existingCatCount = await prisma.serviceCategory.count();
  if (existingCatCount > 0) {
    console.log(`\nCatalog already seeded (${existingCatCount} categories found) — skipping.`);
    console.log("To re-seed, truncate the services and service_categories tables first.");
    await prisma.$disconnect();
    return;
  }

  console.log("\nInserting catalog...\n");
  let catCount = 0;
  let svcCount = 0;

  for (const cat of CATALOG) {
    const category = await prisma.serviceCategory.create({
      data: { name: cat.name, description: cat.description },
    });
    catCount++;
    console.log(`  ✓ ${category.name}`);

    for (const svc of cat.services) {
      await prisma.service.create({
        data: {
          name:        svc.name,
          description: svc.description,
          price:       svc.price,
          duration:    svc.duration,
          categoryId:  category.id,
          isActive:    true,
        },
      });
      svcCount++;
    }
    console.log(`      ${cat.services.length} services`);
  }

  console.log(`\nDone. Inserted ${catCount} categories and ${svcCount} services.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
