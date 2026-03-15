const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// ── তোমার service account key file path দাও ──
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

const HALLS = [
  { id: 'sher_e_bangla',        name: 'Sher-e-Bangla A.K. Fazlul Haque Hall' },
  { id: 'shah_makhdum',         name: 'Shah Makhdum Hall' },
  { id: 'syed_ameer_ali',       name: 'Syed Ameer Ali Hall' },
  { id: 'shaheed_shamsuzzoha',  name: 'Shaheed Shamsuzzoha Hall' },
  { id: 'shaheed_habibur',      name: 'Shaheed Habibur Rahman Hall' },
  { id: 'motihar',              name: 'Motihar Hall' },
  { id: 'madar_bux',            name: 'Madar Bux Hall' },
  { id: 'suhrawardy',           name: 'Huseyn Shaheed Suhrawardy Hall' },
  { id: 'nawab_abdul_latif',    name: 'Nawab Abdul Latif Hall' },
  { id: 'shaheed_ziaur',        name: 'Shaheed Ziaur Rahman Hall' },
  { id: 'bangabandhu',          name: 'Bangabandhu Sheikh Mujibur Rahman Hall' },
  { id: 'rokeya',               name: 'Begum Rokeya Hall' },
  { id: 'mannujan',             name: 'Mannujan Hall' },
  { id: 'taposhi_rabeya',       name: 'Tapashi Rabeya Hall' },
  { id: 'khaleda_zia',          name: 'Begum Khaleda Zia Hall' },
  { id: 'rahamatunnesa',        name: 'Rahamatunnesa Hall' },
  { id: 'july36',               name: 'July-36 Hall' },
];

const PASSWORD = 'rudining123';

async function createModerator(hall, role) {
  const email = `${role}.${hall.id}@rudining.com`;
  const displayName = `${role === 'dining' ? 'Dining' : 'Canteen'} Moderator`;

  try {
    // Create Firebase Auth user
    const user = await auth.createUser({
      email,
      password: PASSWORD,
      displayName,
    });

    // Create Firestore document
    await db.collection('moderators').doc(user.uid).set({
      hallId: hall.id,
      hallName: hall.name,
      name: displayName,
      role,
      email,
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Created: ${email}`);
  } catch (e) {
    if (e.code === 'auth/email-already-exists') {
      console.log(`⚠️  Already exists: ${email}`);
    } else {
      console.error(`❌ Failed: ${email} — ${e.message}`);
    }
  }
}

async function seedAll() {
  console.log('🚀 Starting moderator seed...\n');

  for (const hall of HALLS) {
    await createModerator(hall, 'dining');
    await createModerator(hall, 'canteen');
  }

  console.log('\n✅ All done! Total accounts: ' + (HALLS.length * 2));
  process.exit(0);
}

seedAll();