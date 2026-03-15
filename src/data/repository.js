import {
  doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc,
  collection, query, where, orderBy, getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getTodayKey } from './date';

// ─── MENU ───────────────────────────────────────────

export async function getMenu(hallId, dateKey) {
  try {
    const ref = doc(db, 'menus', `${hallId}_${dateKey}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error('getMenu error:', e);
    return null;
  }
}

export async function upsertMenu(hallId, dateKey, payload) {
  const ref = doc(db, 'menus', `${hallId}_${dateKey}`);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
  } else {
    await setDoc(ref, {
      hallId, date: dateKey,
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

// dining meals: { breakfast: {items:[], time:''}, lunch:..., dinner:... }
export async function saveDiningMenu(hallId, dateKey, meals, moderatorName) {
  await upsertMenu(hallId, dateKey, {
    dining: meals,
    diningUpdatedBy: moderatorName || '',
    diningUpdatedAt: serverTimestamp(),
  });
}

// canteen items: [{name, price, count, status}]
export async function saveCanteenMenu(hallId, dateKey, items, moderatorName) {
  await upsertMenu(hallId, dateKey, {
    canteen: { items },
    canteenUpdatedBy: moderatorName || '',
    canteenUpdatedAt: serverTimestamp(),
  });
}

// quick status update only (no menu change)
export async function quickUpdateDining(hallId, dateKey, meals) {
  await upsertMenu(hallId, dateKey, { dining: meals });
}

export async function quickUpdateCanteen(hallId, dateKey, items) {
  await upsertMenu(hallId, dateKey, { canteen: { items } });
}

// duplicate yesterday's menu
export async function duplicateYesterday(hallId, dateKey, type) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().split('T')[0];
  const yMenu = await getMenu(hallId, yKey);
  if (!yMenu) return false;
  if (type === 'dining' && yMenu.dining) {
    await upsertMenu(hallId, dateKey, { dining: yMenu.dining });
    return true;
  }
  if (type === 'canteen' && yMenu.canteen) {
    await upsertMenu(hallId, dateKey, { canteen: yMenu.canteen });
    return true;
  }
  return false;
}

// ─── NOTICES ────────────────────────────────────────

export async function getNotices(type) {
  try {
    const q = query(
      collection(db, 'notices'),
      where('type', '==', type)
    );
    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Sort client-side
    return data.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  } catch (e) {
    console.error('getNotices error:', e);
    return [];
  }
}

export async function postNotice(hallId, hallName, role, payload) {
  await addDoc(collection(db, 'notices'), {
    hallId, hallName,
    role, // 'dining' | 'canteen'
    ...payload,
    createdAt: serverTimestamp(),
  });
}

export async function updateNotice(noticeId, payload) {
  await updateDoc(doc(db, 'notices', noticeId), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNotice(noticeId) {
  await deleteDoc(doc(db, 'notices', noticeId));
}

// ─── FEASTS ─────────────────────────────────────────

export async function getFeasts(type) {
  try {
    const q = query(
      collection(db, 'feasts'),
      where('role', '==', type)
    );
    const snap = await getDocs(q);
    // Deduplicate by id
    const seen = new Set();
    const data = [];
    snap.docs.forEach(d => {
      if (!seen.has(d.id)) {
        seen.add(d.id);
        data.push({ id: d.id, ...d.data() });
      }
    });
    return data.sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });
  } catch (e) {
    console.error('getFeasts error:', e);
    return [];
  }
}

export async function addFeast(hallId, hallName, role, payload) {
  await addDoc(collection(db, 'feasts'), {
    hallId, hallName, role,
    ...payload,
    createdAt: serverTimestamp(),
  });
}

export async function updateFeast(feastId, payload) {
  await updateDoc(doc(db, 'feasts', feastId), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteFeast(feastId) {
  await deleteDoc(doc(db, 'feasts', feastId));
}

// ─── MODERATOR ──────────────────────────────────────

export async function getModeratorData(uid) {
  try {
    const snap = await getDoc(doc(db, 'moderators', uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    return null;
  }
}

export async function logUpdate(hallId, moderatorName, role, action) {
  await addDoc(collection(db, 'updateHistory'), {
    hallId, moderatorName, role, action,
    timestamp: serverTimestamp(),
  });
}

export async function getUpdateHistory(hallId, dateKey) {
  try {
    const q = query(
      collection(db, 'updateHistory'),
      where('hallId', '==', hallId),
      orderBy('timestamp', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    return [];
  }
}