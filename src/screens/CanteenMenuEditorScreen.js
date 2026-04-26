import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getMenu, saveCanteenMenu, logUpdate } from '../data/repository';
import { getTodayKey } from '../data/date';
import { MEAL_STATUSES, STATUS_CONFIG } from '../data/types';

function emptyItem() {
  return { name: '', price: '', count: '', status: 'available' };
}

export default function CanteenMenuEditorScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();
  const today = getTodayKey();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => { fetchExisting(); }, []);

  async function fetchExisting() {
    setLoading(true);
    const data = await getMenu(String(hallId), today);
    if (data?.canteen?.items) {
      setItems(data.canteen.items.map(it => ({
        ...it,
        price: String(it.price ?? ''),
        count: String(it.count ?? ''),
      })));
    }
    setLoading(false);
  }

  function addItem() { setItems(prev => [...prev, emptyItem()]); }
  function removeItem(idx) { setItems(prev => prev.filter((_, i) => i !== idx)); }
  function updateItem(idx, field, value) {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const cleaned = items
        .filter(it => it.name.trim())
        .map(it => ({
          name: it.name.trim(),
          price: Number(it.price) || 0,
          count: it.count === '' ? null : Number(it.count),
          status: it.status,
        }));
      await saveCanteenMenu(String(hallId), today, cleaned, String(moderatorName));
      await logUpdate(String(hallId), String(moderatorName), 'canteen', 'Updated canteen menu');
      router.replace({
        pathname: '/SuccessScreen',
        params: { hallId, hallName, role, moderatorName },
      });
    } catch (e) {
      Alert.alert('Error', 'Could not save. Try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#2d5a3d" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  if (showPreview) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>Canteen Preview</Text>
          <Text style={styles.pageSub}>Student side preview before save</Text>

          <View style={styles.previewCard}>
            <Text style={styles.previewHall}>{hallName}</Text>
            <Text style={styles.previewSub}>Hall: {hallId}</Text>
            <Text style={styles.previewSub}>Date: {today}</Text>
          </View>

          <View style={styles.previewSection}>
            <View style={styles.previewSectionHeader}>
              <Text style={styles.previewSectionTitle}>Hall Canteen</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            </View>
            <Text style={styles.previewAllDay}>All day items</Text>

            {items.filter(it => it.name.trim()).map((item, idx) => {
              const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
              return (
                <View key={idx} style={styles.previewItem}>
                  <View style={styles.previewItemLeft}>
                    <Text style={styles.previewItemName}>{item.name}</Text>
                    <Text style={styles.previewItemSub}>
                      ৳{item.price || 0} • Remaining: {item.count || '—'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>NOTE</Text>
              <Text style={styles.noteText}>
                {items.filter(it => it.name.trim()).map(it => it.name).join(', ')}
              </Text>
            </View>
          </View>

          <View style={styles.previewBtns}>
            <TouchableOpacity style={styles.backEditBtn} onPress={() => setShowPreview(false)}>
              <Text style={styles.backEditText}>Back to Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Confirm Save</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Update Canteen Menu (Item-wise)</Text>
        <Text style={styles.pageSub}>Hall: {hallId} • Date: {today}</Text>

        <View style={styles.itemsBlock}>
          <View style={styles.itemsHeader}>
            <Text style={styles.blockTitle}>Canteen</Text>
            <TouchableOpacity style={styles.addItemBtn} onPress={addItem}>
              <Text style={styles.addItemText}>+ Add item</Text>
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <Text style={styles.emptyHint}>No items yet</Text>
          ) : (
            items.map((item, idx) => (
              <View key={idx} style={styles.itemCard}>
                <View style={styles.itemCardTop}>
                  <TextInput
                    style={styles.itemNameInput}
                    placeholder="Item name"
                    placeholderTextColor="#9a9a8e"
                    value={item.name}
                    onChangeText={v => updateItem(idx, 'name', v)}
                  />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeItem(idx)}>
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.itemNums}>
                  <TextInput
                    style={styles.numInput}
                    placeholder="Price"
                    placeholderTextColor="#9a9a8e"
                    value={String(item.price)}
                    onChangeText={v => updateItem(idx, 'price', v)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.numInput}
                    placeholder="Count"
                    placeholderTextColor="#9a9a8e"
                    value={String(item.count)}
                    onChangeText={v => updateItem(idx, 'count', v)}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.statusRow}>
                  {MEAL_STATUSES.map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.statusBtn, item.status === s && styles.statusBtnActive]}
                      onPress={() => updateItem(idx, 'status', s)}
                    >
                      <Text style={[styles.statusBtnText, item.status === s && styles.statusBtnTextActive]}>
                        {s === 'limited' ? 'Low' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity style={styles.previewBtn} onPress={() => setShowPreview(true)}>
          <Text style={styles.previewBtnText}>Preview</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Canteen Menu</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edeae3' },
  scroll: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 20, fontWeight: '900', color: '#1a1a1a', marginBottom: 4 },
  pageSub: { fontSize: 12, color: '#6b6b60', marginBottom: 16 },
  itemsBlock: {
    backgroundColor: '#f5f2eb', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: '#d8d4c8', marginBottom: 12,
  },
  itemsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  blockTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a1a' },
  addItemBtn: { backgroundColor: '#e8ede9', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  addItemText: { fontSize: 12, fontWeight: '700', color: '#2d5a3d' },
  emptyHint: { fontSize: 13, color: '#7a7a6e', textAlign: 'center', paddingVertical: 20 },
  itemCard: {
    backgroundColor: '#edeae3', borderRadius: 12,
    padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#d8d4c8',
  },
  itemCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  itemNameInput: {
    flex: 1, backgroundColor: '#f5f2eb', borderRadius: 8,
    padding: 10, fontSize: 14, color: '#1a1a1a',
    borderWidth: 1, borderColor: '#d8d4c8',
  },
  removeBtn: { backgroundColor: '#f5e0de', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  removeBtnText: { fontSize: 11, fontWeight: '700', color: '#c0392b' },
  itemNums: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  numInput: {
    flex: 1, backgroundColor: '#f5f2eb', borderRadius: 8,
    padding: 10, fontSize: 13, color: '#1a1a1a',
    borderWidth: 1, borderColor: '#d8d4c8',
  },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#f5f2eb', borderWidth: 1, borderColor: '#d8d4c8', alignItems: 'center',
  },
  statusBtnActive: { borderColor: '#2d5a3d', backgroundColor: '#e8ede9' },
  statusBtnText: { fontSize: 11, fontWeight: '700', color: '#7a7a6e' },
  statusBtnTextActive: { color: '#2d5a3d' },
  previewBtn: {
    backgroundColor: '#f5f2eb', borderRadius: 14, padding: 14,
    alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#d8d4c8',
  },
  previewBtnText: { fontSize: 15, fontWeight: '700', color: '#3a3a30' },
  saveBtn: { backgroundColor: '#2d5a3d', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  previewCard: {
    backgroundColor: '#f5f2eb', borderRadius: 14, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#d8d4c8',
  },
  previewHall: { fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  previewSub: { fontSize: 12, color: '#6b6b60', marginBottom: 2 },
  previewSection: {
    backgroundColor: '#f5f2eb', borderRadius: 14, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#d8d4c8',
  },
  previewSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  previewSectionTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a1a' },
  activeBadge: { backgroundColor: '#d4e6d8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  activeBadgeText: { fontSize: 10, fontWeight: '800', color: '#2d5a3d' },
  previewAllDay: { fontSize: 11, color: '#7a7a6e', marginBottom: 10 },
  previewItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e8e4dc',
  },
  previewItemLeft: { flex: 1 },
  previewItemName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  previewItemSub: { fontSize: 11, color: '#7a7a6e', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  noteBox: { marginTop: 10, backgroundColor: '#edeae3', borderRadius: 8, padding: 8 },
  noteLabel: { fontSize: 10, fontWeight: '800', color: '#7a7a6e', marginBottom: 2 },
  noteText: { fontSize: 12, color: '#6b6b60' },
  previewBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  backEditBtn: {
    flex: 1, backgroundColor: '#f5f2eb', borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#d8d4c8',
  },
  backEditText: { fontSize: 14, fontWeight: '700', color: '#3a3a30' },
  confirmBtn: { flex: 1, backgroundColor: '#2d5a3d', borderRadius: 14, padding: 14, alignItems: 'center' },
  confirmText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
