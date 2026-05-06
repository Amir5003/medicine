/**
 * Seed script — populates DB with demo users, salts, and 51 medicines (15 salt groups).
 * Usage (from /server):  npm run seed
 */
import 'dotenv/config'
import connectDB from '../config/db.js'
import Medicine from '../models/Medicine.js'
import User from '../models/User.js'
import Salt from '../models/Salt.js'
import Order from '../models/Order.js'

// ─── Users ───────────────────────────────────────────────────────────────────

const usersData = [
  {
    name: 'Admin User',
    email: 'admin@medicore.in',
    password: 'Admin@123',
    role: 'admin',
    phone: '9999000001',
  },
  {
    name: 'Pharmacist Demo',
    email: 'pharmacist@medicore.in',
    password: 'Pharma@123',
    role: 'pharmacist',
    phone: '9999000002',
  },
  {
    name: 'Patient Demo',
    email: 'patient@medicore.in',
    password: 'Patient@123',
    role: 'patient',
    phone: '9999000003',
    addresses: [
      {
        label: 'Home',
        line1: '42, MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        isDefault: true,
      },
    ],
  },
]

// ─── Salts ────────────────────────────────────────────────────────────────────

const saltsData = [
  { name: 'Paracetamol', description: 'Analgesic and antipyretic agent' },
  { name: 'Amoxicillin', description: 'Broad-spectrum penicillin antibiotic' },
  { name: 'Clavulanate', description: 'Beta-lactamase inhibitor' },
  { name: 'Azithromycin', description: 'Macrolide antibiotic' },
  { name: 'Metformin', description: 'Biguanide antidiabetic agent' },
  { name: 'Atorvastatin', description: 'HMG-CoA reductase inhibitor (statin)' },
  { name: 'Omeprazole', description: 'Proton pump inhibitor' },
  { name: 'Pantoprazole', description: 'Proton pump inhibitor' },
  { name: 'Cetirizine', description: 'Second-generation antihistamine' },
  { name: 'Montelukast', description: 'Leukotriene receptor antagonist' },
  { name: 'Metoprolol', description: 'Beta-1 selective adrenergic blocker' },
  { name: 'Amlodipine', description: 'Calcium channel blocker' },
]

// ─── Medicines (51 across 15 salt groups, ≥3 per group) ──────────────────────

const medicinesData = [
  // ── GROUP 1: Paracetamol 650mg (4 medicines) ─────────────────────────────
  { name: 'Dolo 650', brand: 'Micro Labs', genericName: 'Paracetamol', category: 'Pain Relief', description: 'Fast-acting fever & pain relief tablet', mrp: 38, discountedPrice: 32, stock: 500, salesCount: 1200, salts: [{ name: 'Paracetamol', strength: '650mg' }] },
  { name: 'Calpol 650', brand: 'GSK', genericName: 'Paracetamol', category: 'Pain Relief', description: 'Trusted paracetamol brand for fever', mrp: 45, discountedPrice: 38, stock: 400, salesCount: 950, salts: [{ name: 'Paracetamol', strength: '650mg' }] },
  { name: 'Paracip 650', brand: 'Cipla', genericName: 'Paracetamol', category: 'Pain Relief', description: 'Cipla paracetamol 650mg for pain relief', mrp: 32, discountedPrice: 28, stock: 600, salesCount: 870, salts: [{ name: 'Paracetamol', strength: '650mg' }] },
  { name: 'Crocin Advance 650', brand: 'Haleon', genericName: 'Paracetamol', category: 'Pain Relief', description: 'Advanced formula paracetamol tablet', mrp: 52, discountedPrice: 44, stock: 350, salesCount: 730, salts: [{ name: 'Paracetamol', strength: '650mg' }] },

  // ── GROUP 2: Paracetamol 500mg (3 medicines) ─────────────────────────────
  { name: 'Calpol 500', brand: 'GSK', genericName: 'Paracetamol', category: 'Pain Relief', description: 'Standard dose paracetamol', mrp: 28, discountedPrice: 22, stock: 700, salesCount: 690, salts: [{ name: 'Paracetamol', strength: '500mg' }] },
  { name: 'Pamol 500', brand: 'Wockhardt', genericName: 'Paracetamol', category: 'Pain Relief', description: 'Wockhardt paracetamol tablet 500mg', mrp: 22, discountedPrice: 18, stock: 500, salesCount: 520, salts: [{ name: 'Paracetamol', strength: '500mg' }] },
  { name: 'Febrinil 500', brand: 'Torrent', genericName: 'Paracetamol', category: 'Pain Relief', description: 'Torrent paracetamol for fever management', mrp: 25, discountedPrice: 20, stock: 450, salesCount: 480, salts: [{ name: 'Paracetamol', strength: '500mg' }] },

  // ── GROUP 3: Amoxicillin 500mg (4 medicines) ─────────────────────────────
  { name: 'Mox 500', brand: 'Ranbaxy', genericName: 'Amoxicillin', category: 'Antibiotic', description: 'Amoxicillin capsules for bacterial infections', mrp: 72, discountedPrice: 61, stock: 300, requiresPrescription: true, salesCount: 460, salts: [{ name: 'Amoxicillin', strength: '500mg' }] },
  { name: 'Novamox 500', brand: 'Cipla', genericName: 'Amoxicillin', category: 'Antibiotic', description: 'Broad-spectrum amoxicillin capsule', mrp: 68, discountedPrice: 57, stock: 350, requiresPrescription: true, salesCount: 410, salts: [{ name: 'Amoxicillin', strength: '500mg' }] },
  { name: 'Amoxil 500', brand: 'GSK', genericName: 'Amoxicillin', category: 'Antibiotic', description: 'GSK amoxicillin 500mg capsule', mrp: 75, discountedPrice: 63, stock: 280, requiresPrescription: true, salesCount: 380, salts: [{ name: 'Amoxicillin', strength: '500mg' }] },
  { name: 'Cipmox 500', brand: 'Cipla', genericName: 'Amoxicillin', category: 'Antibiotic', description: 'Cipla amoxicillin for respiratory infections', mrp: 65, discountedPrice: 55, stock: 320, requiresPrescription: true, salesCount: 350, salts: [{ name: 'Amoxicillin', strength: '500mg' }] },

  // ── GROUP 4: Amoxicillin 500mg + Clavulanate 125mg (3 medicines) ──────────
  { name: 'Augmentin 625', brand: 'GSK', genericName: 'Amoxicillin + Clavulanate', category: 'Antibiotic', description: 'Combined antibiotic for resistant bacterial infections', mrp: 180, discountedPrice: 153, stock: 200, requiresPrescription: true, salesCount: 320, salts: [{ name: 'Amoxicillin', strength: '500mg' }, { name: 'Clavulanate', strength: '125mg' }] },
  { name: 'Clavam 625', brand: 'Alkem', genericName: 'Amoxicillin + Clavulanate', category: 'Antibiotic', description: 'Alkem broad-spectrum antibiotic combination', mrp: 165, discountedPrice: 140, stock: 220, requiresPrescription: true, salesCount: 290, salts: [{ name: 'Amoxicillin', strength: '500mg' }, { name: 'Clavulanate', strength: '125mg' }] },
  { name: 'MoxClav 625', brand: 'Cipla', genericName: 'Amoxicillin + Clavulanate', category: 'Antibiotic', description: 'Cipla amoxicillin-clavulanate combination tablet', mrp: 172, discountedPrice: 146, stock: 180, requiresPrescription: true, salesCount: 270, salts: [{ name: 'Amoxicillin', strength: '500mg' }, { name: 'Clavulanate', strength: '125mg' }] },

  // ── GROUP 5: Azithromycin 500mg (3 medicines) ────────────────────────────
  { name: 'Azithral 500', brand: 'Alembic', genericName: 'Azithromycin', category: 'Antibiotic', description: 'Macrolide antibiotic for respiratory & skin infections', mrp: 145, discountedPrice: 123, stock: 250, requiresPrescription: true, salesCount: 490, salts: [{ name: 'Azithromycin', strength: '500mg' }] },
  { name: 'Azee 500', brand: 'Cipla', genericName: 'Azithromycin', category: 'Antibiotic', description: 'Cipla azithromycin for bacterial infections', mrp: 138, discountedPrice: 117, stock: 280, requiresPrescription: true, salesCount: 450, salts: [{ name: 'Azithromycin', strength: '500mg' }] },
  { name: 'Zithromac 500', brand: 'Pfizer', genericName: 'Azithromycin', category: 'Antibiotic', description: 'Pfizer azithromycin tablet', mrp: 160, discountedPrice: 136, stock: 200, requiresPrescription: true, salesCount: 380, salts: [{ name: 'Azithromycin', strength: '500mg' }] },

  // ── GROUP 6: Metformin 500mg (4 medicines) ───────────────────────────────
  { name: 'Glycomet 500', brand: 'USV', genericName: 'Metformin', category: 'Diabetes', description: 'First-line metformin for type 2 diabetes management', mrp: 55, discountedPrice: 47, stock: 600, requiresPrescription: true, salesCount: 760, salts: [{ name: 'Metformin', strength: '500mg' }] },
  { name: 'Glucophage 500', brand: 'Merck', genericName: 'Metformin', category: 'Diabetes', description: 'Original metformin brand by Merck', mrp: 62, discountedPrice: 52, stock: 550, requiresPrescription: true, salesCount: 680, salts: [{ name: 'Metformin', strength: '500mg' }] },
  { name: 'Obimet 500', brand: 'Aristo', genericName: 'Metformin', category: 'Diabetes', description: 'Affordable metformin for blood sugar control', mrp: 48, discountedPrice: 40, stock: 700, requiresPrescription: true, salesCount: 620, salts: [{ name: 'Metformin', strength: '500mg' }] },
  { name: 'Gluformin 500', brand: 'Mankind', genericName: 'Metformin', category: 'Diabetes', description: 'Mankind metformin 500mg tablet', mrp: 50, discountedPrice: 42, stock: 650, requiresPrescription: true, salesCount: 570, salts: [{ name: 'Metformin', strength: '500mg' }] },

  // ── GROUP 7: Metformin 1000mg (3 medicines) ──────────────────────────────
  { name: 'Glycomet 1000', brand: 'USV', genericName: 'Metformin', category: 'Diabetes', description: 'High-dose metformin 1g for uncontrolled diabetes', mrp: 98, discountedPrice: 83, stock: 400, requiresPrescription: true, salesCount: 490, salts: [{ name: 'Metformin', strength: '1000mg' }] },
  { name: 'Glucophage 1000', brand: 'Merck', genericName: 'Metformin', category: 'Diabetes', description: 'Merck metformin 1000mg extended-release tablet', mrp: 110, discountedPrice: 93, stock: 380, requiresPrescription: true, salesCount: 440, salts: [{ name: 'Metformin', strength: '1000mg' }] },
  { name: 'Obimet 1000', brand: 'Aristo', genericName: 'Metformin', category: 'Diabetes', description: 'Aristo metformin 1000mg for type 2 diabetes', mrp: 92, discountedPrice: 78, stock: 350, requiresPrescription: true, salesCount: 400, salts: [{ name: 'Metformin', strength: '1000mg' }] },

  // ── GROUP 8: Atorvastatin 10mg (4 medicines) ─────────────────────────────
  { name: 'Atorva 10', brand: 'Zydus', genericName: 'Atorvastatin', category: 'Cholesterol', description: 'Zydus statin for cholesterol management', mrp: 85, discountedPrice: 72, stock: 450, requiresPrescription: true, salesCount: 560, salts: [{ name: 'Atorvastatin', strength: '10mg' }] },
  { name: 'Tonact 10', brand: 'Lupin', genericName: 'Atorvastatin', category: 'Cholesterol', description: 'Lupin atorvastatin 10mg tablet', mrp: 78, discountedPrice: 66, stock: 480, requiresPrescription: true, salesCount: 520, salts: [{ name: 'Atorvastatin', strength: '10mg' }] },
  { name: 'Storvas 10', brand: 'Cipla', genericName: 'Atorvastatin', category: 'Cholesterol', description: 'Cipla atorvastatin for lipid control', mrp: 82, discountedPrice: 70, stock: 420, requiresPrescription: true, salesCount: 490, salts: [{ name: 'Atorvastatin', strength: '10mg' }] },
  { name: 'Lipicure 10', brand: 'IPCA', genericName: 'Atorvastatin', category: 'Cholesterol', description: 'IPCA atorvastatin 10mg for hyperlipidaemia', mrp: 76, discountedPrice: 64, stock: 400, requiresPrescription: true, salesCount: 460, salts: [{ name: 'Atorvastatin', strength: '10mg' }] },

  // ── GROUP 9: Atorvastatin 20mg (3 medicines) ─────────────────────────────
  { name: 'Atorva 20', brand: 'Zydus', genericName: 'Atorvastatin', category: 'Cholesterol', description: 'Higher-dose atorvastatin 20mg', mrp: 130, discountedPrice: 110, stock: 320, requiresPrescription: true, salesCount: 370, salts: [{ name: 'Atorvastatin', strength: '20mg' }] },
  { name: 'Tonact 20', brand: 'Lupin', genericName: 'Atorvastatin', category: 'Cholesterol', description: 'Lupin atorvastatin 20mg tablet', mrp: 125, discountedPrice: 106, stock: 300, requiresPrescription: true, salesCount: 340, salts: [{ name: 'Atorvastatin', strength: '20mg' }] },
  { name: 'Storvas 20', brand: 'Cipla', genericName: 'Atorvastatin', category: 'Cholesterol', description: 'Cipla atorvastatin 20mg tablet', mrp: 128, discountedPrice: 108, stock: 280, requiresPrescription: true, salesCount: 310, salts: [{ name: 'Atorvastatin', strength: '20mg' }] },

  // ── GROUP 10: Omeprazole 20mg (4 medicines) ──────────────────────────────
  { name: 'Omez 20', brand: "Dr. Reddy's", genericName: 'Omeprazole', category: 'Gastrointestinal', description: 'Proton pump inhibitor for acid reflux and GERD', mrp: 65, discountedPrice: 55, stock: 550, salesCount: 680, salts: [{ name: 'Omeprazole', strength: '20mg' }] },
  { name: 'Omacid 20', brand: 'Alkem', genericName: 'Omeprazole', category: 'Gastrointestinal', description: 'Alkem omeprazole for gastric acid reduction', mrp: 58, discountedPrice: 49, stock: 600, salesCount: 630, salts: [{ name: 'Omeprazole', strength: '20mg' }] },
  { name: 'Ocid 20', brand: 'Cipla', genericName: 'Omeprazole', category: 'Gastrointestinal', description: 'Cipla omeprazole delayed-release capsule', mrp: 70, discountedPrice: 60, stock: 500, salesCount: 590, salts: [{ name: 'Omeprazole', strength: '20mg' }] },
  { name: 'Lomac 20', brand: 'Lupin', genericName: 'Omeprazole', category: 'Gastrointestinal', description: 'Lupin omeprazole 20mg for peptic ulcers', mrp: 62, discountedPrice: 52, stock: 480, salesCount: 550, salts: [{ name: 'Omeprazole', strength: '20mg' }] },

  // ── GROUP 11: Pantoprazole 40mg (3 medicines) ────────────────────────────
  { name: 'Pantodac 40', brand: 'Zydus', genericName: 'Pantoprazole', category: 'Gastrointestinal', description: 'Zydus pantoprazole for acid suppression', mrp: 95, discountedPrice: 81, stock: 400, salesCount: 520, salts: [{ name: 'Pantoprazole', strength: '40mg' }] },
  { name: 'Pan D 40', brand: 'Alkem', genericName: 'Pantoprazole', category: 'Gastrointestinal', description: 'Pantoprazole for gastroparesis and GERD', mrp: 105, discountedPrice: 89, stock: 420, salesCount: 480, salts: [{ name: 'Pantoprazole', strength: '40mg' }] },
  { name: 'Pantop 40', brand: 'Aristo', genericName: 'Pantoprazole', category: 'Gastrointestinal', description: 'Aristo pantoprazole 40mg gastro-resistant tablet', mrp: 88, discountedPrice: 75, stock: 380, salesCount: 440, salts: [{ name: 'Pantoprazole', strength: '40mg' }] },

  // ── GROUP 12: Cetirizine 10mg (4 medicines) ──────────────────────────────
  { name: 'Zyrtec 10', brand: 'Haleon', genericName: 'Cetirizine', category: 'Allergy', description: 'Non-drowsy antihistamine for allergic rhinitis', mrp: 72, discountedPrice: 61, stock: 500, salesCount: 640, salts: [{ name: 'Cetirizine', strength: '10mg' }] },
  { name: 'Cetriz 10', brand: 'Sun Pharma', genericName: 'Cetirizine', category: 'Allergy', description: 'Sun Pharma cetirizine antihistamine tablet', mrp: 65, discountedPrice: 55, stock: 550, salesCount: 590, salts: [{ name: 'Cetirizine', strength: '10mg' }] },
  { name: 'Okacet 10', brand: 'Cipla', genericName: 'Cetirizine', category: 'Allergy', description: 'Cipla cetirizine for allergies and urticaria', mrp: 68, discountedPrice: 58, stock: 480, salesCount: 560, salts: [{ name: 'Cetirizine', strength: '10mg' }] },
  { name: 'Alerid 10', brand: 'Cipla', genericName: 'Cetirizine', category: 'Allergy', description: 'Cipla Alerid cetirizine 10mg tablet', mrp: 70, discountedPrice: 60, stock: 460, salesCount: 530, salts: [{ name: 'Cetirizine', strength: '10mg' }] },

  // ── GROUP 13: Montelukast 10mg (3 medicines) ─────────────────────────────
  { name: 'Montair 10', brand: 'Cipla', genericName: 'Montelukast', category: 'Allergy', description: 'Leukotriene blocker for asthma and seasonal allergies', mrp: 160, discountedPrice: 136, stock: 300, requiresPrescription: true, salesCount: 450, salts: [{ name: 'Montelukast', strength: '10mg' }] },
  { name: 'Singulair 10', brand: 'Merck', genericName: 'Montelukast', category: 'Allergy', description: 'Merck montelukast for allergic asthma', mrp: 175, discountedPrice: 148, stock: 280, requiresPrescription: true, salesCount: 400, salts: [{ name: 'Montelukast', strength: '10mg' }] },
  { name: 'Lukotas 10', brand: 'Cipla', genericName: 'Montelukast', category: 'Allergy', description: 'Cipla montelukast 10mg tablet', mrp: 155, discountedPrice: 131, stock: 320, requiresPrescription: true, salesCount: 370, salts: [{ name: 'Montelukast', strength: '10mg' }] },

  // ── GROUP 14: Metoprolol 25mg (3 medicines) ──────────────────────────────
  { name: 'Metolar 25', brand: 'Cipla', genericName: 'Metoprolol', category: 'Cardiac', description: 'Beta-blocker for hypertension and angina', mrp: 55, discountedPrice: 47, stock: 400, requiresPrescription: true, salesCount: 430, salts: [{ name: 'Metoprolol', strength: '25mg' }] },
  { name: 'Betaloc 25', brand: 'AstraZeneca', genericName: 'Metoprolol', category: 'Cardiac', description: 'AstraZeneca metoprolol tartrate for heart conditions', mrp: 65, discountedPrice: 55, stock: 380, requiresPrescription: true, salesCount: 390, salts: [{ name: 'Metoprolol', strength: '25mg' }] },
  { name: 'Seloken 25', brand: 'AstraZeneca', genericName: 'Metoprolol', category: 'Cardiac', description: 'Metoprolol succinate for chronic heart failure', mrp: 70, discountedPrice: 60, stock: 350, requiresPrescription: true, salesCount: 360, salts: [{ name: 'Metoprolol', strength: '25mg' }] },

  // ── GROUP 15: Amlodipine 5mg (3 medicines) ───────────────────────────────
  { name: 'Amlovas 5', brand: 'Torrent', genericName: 'Amlodipine', category: 'Cardiac', description: 'Calcium channel blocker for blood pressure control', mrp: 48, discountedPrice: 40, stock: 500, requiresPrescription: true, salesCount: 520, salts: [{ name: 'Amlodipine', strength: '5mg' }] },
  { name: 'Stamlo 5', brand: "Dr. Reddy's", genericName: 'Amlodipine', category: 'Cardiac', description: "Dr. Reddy's amlodipine 5mg tablet", mrp: 52, discountedPrice: 44, stock: 480, requiresPrescription: true, salesCount: 480, salts: [{ name: 'Amlodipine', strength: '5mg' }] },
  { name: 'Norvasc 5', brand: 'Pfizer', genericName: 'Amlodipine', category: 'Cardiac', description: 'Pfizer amlodipine for hypertension and angina', mrp: 58, discountedPrice: 49, stock: 450, requiresPrescription: true, salesCount: 440, salts: [{ name: 'Amlodipine', strength: '5mg' }] },
]

// ─── Main seed function ───────────────────────────────────────────────────────

async function seed() {
  await connectDB()

  console.log('\n🌱 Starting seed...\n')

  // Clear existing data
  await Promise.all([
    Medicine.deleteMany({}),
    User.deleteMany({}),
    Salt.deleteMany({}),
    Order.deleteMany({}),
  ])
  console.log('✓ Cleared existing data')

  // Seed users (use save() so pre-save password-hash hook runs)
  for (const data of usersData) {
    const user = new User(data)
    await user.save()
  }
  console.log(`✓ Seeded ${usersData.length} users`)

  // Seed salts (use save() so pre-save normalizedName hook runs)
  for (const data of saltsData) {
    const salt = new Salt(data)
    await salt.save()
  }
  console.log(`✓ Seeded ${saltsData.length} salts`)

  // Seed medicines (use save() so pre-save slug + saltFingerprint hooks run)
  for (const data of medicinesData) {
    const medicine = new Medicine(data)
    await medicine.save()
  }
  console.log(`✓ Seeded ${medicinesData.length} medicines`)

  // Verification summary
  const [medCount, userCount, saltCount] = await Promise.all([
    Medicine.countDocuments(),
    User.countDocuments(),
    Salt.countDocuments(),
  ])

  // Check alternates for Dolo 650
  const dolo = await Medicine.findOne({ name: 'Dolo 650' })
  const alternates = dolo
    ? await Medicine.find({ saltFingerprint: dolo.saltFingerprint, _id: { $ne: dolo._id } }).select('name brand mrp')
    : []

  // Check search for Paracetamol
  const searchHits = await Medicine.find({
    $or: [
      { name: { $regex: 'paracetamol', $options: 'i' } },
      { genericName: { $regex: 'paracetamol', $options: 'i' } },
    ],
  }).countDocuments()

  console.log('\n─── Verification ───────────────────────────────────────────')
  console.log(`  Medicines : ${medCount}`)
  console.log(`  Users     : ${userCount}`)
  console.log(`  Salts     : ${saltCount}`)

  if (dolo) {
    console.log(`\n  Dolo 650 saltFingerprint : ${dolo.saltFingerprint}`)
    console.log(`  Alternates for Dolo 650  : ${alternates.map((a) => a.name).join(', ')}`)
  }

  console.log(`\n  Search "Paracetamol" hits : ${searchHits}`)

  console.log('\n─── Demo credentials ────────────────────────────────────────')
  console.log('  admin@medicore.in       / Admin@123')
  console.log('  pharmacist@medicore.in  / Pharma@123')
  console.log('  patient@medicore.in     / Patient@123')
  console.log('─────────────────────────────────────────────────────────────\n')
  console.log('✅ Seed complete!\n')

  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
