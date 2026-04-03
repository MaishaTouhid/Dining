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

  function addItem() {
    setItems(prev => [...prev, emptyItem()]);
  }

  function removeItem(idx) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

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
        <ActivityIndicator color="#6e96eb" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // ── Preview ──
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
                    <Text style={[styles.statusText, { color: s.color }]}>
                      {s.label}
                    </Text>
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
            <TouchableOpacity
              style={styles.backEditBtn}
              onPress={() => setShowPreview(false)}
            >
              <Text style={styles.backEditText}>Back to Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.confirmText}>Confirm Save</Text>
              }
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Editor ──
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
                    placeholderTextColor="#9ca3af"
                    value={item.name}
                    onChangeText={v => updateItem(idx, 'name', v)}
                  />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeItem(idx)}
                  >
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.itemNums}>
                  <TextInput
                    style={styles.numInput}
                    placeholder="Price"
                    placeholderTextColor="#9ca3af"
                    value={String(item.price)}
                    onChangeText={v => updateItem(idx, 'price', v)}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.numInput}
                    placeholder="Count"
                    placeholderTextColor="#9ca3af"
                    value={String(item.count)}
                    onChangeText={v => updateItem(idx, 'count', v)}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.statusRow}>
                  {MEAL_STATUSES.map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.statusBtn,
                        item.status === s && styles.statusBtnActive,
                      ]}
                      onPress={() => updateItem(idx, 'status', s)}
                    >
                      <Text style={[
                        styles.statusBtnText,
                        item.status === s && styles.statusBtnTextActive,
                      ]}>
                        {s === 'limited' ? 'Low' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity
          style={styles.previewBtn}
          onPress={() => setShowPreview(true)}
        >
          <Text style={styles.previewBtnText}>Preview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Save Canteen Menu</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scroll: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 20, fontWeight: '900', color: '#1a1a2e', marginBottom: 4 },
  pageSub: { fontSize: 12, color: '#6b7280', marginBottom: 16 },
  itemsBlock: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 12,
  },
  itemsHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  blockTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a2e' },
  addItemBtn: {
    backgroundColor: '#eef2ff', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  addItemText: { fontSize: 12, fontWeight: '700', color: '#6e96eb' },
  emptyHint: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingVertical: 20 },
  itemCard: {
    backgroundColor: '#f9fafb', borderRadius: 12,
    padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  itemCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  itemNameInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 8,
    padding: 10, fontSize: 14, color: '#1a1a2e',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  removeBtn: {
    backgroundColor: '#fee2e2', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8,
  },
  removeBtnText: { fontSize: 11, fontWeight: '700', color: '#ef4444' },
  itemNums: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  numInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 8,
    padding: 10, fontSize: 13, color: '#1a1a2e',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  statusBtnActive: { borderColor: '#1a1a2e', backgroundColor: '#f0f0f0' },
  statusBtnText: { fontSize: 11, fontWeight: '700', color: '#9ca3af' },
  statusBtnTextActive: { color: '#1a1a2e' },
  previewBtn: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, alignItems: 'center',
    marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb',
  },
  previewBtnText: { fontSize: 15, fontWeight: '700', color: '#374151' },
  saveBtn: {
    backgroundColor: '#6e96eb', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  // Preview
  previewCard: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  previewHall: { fontSize: 18, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  previewSub: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  previewSection: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  previewSectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 6,
  },
  previewSectionTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a2e' },
  activeBadge: {
    backgroundColor: '#dcfce7', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  activeBadgeText: { fontSize: 10, fontWeight: '800', color: '#16a34a' },
  previewAllDay: { fontSize: 11, color: '#9ca3af', marginBottom: 10 },
  previewItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  previewItemLeft: { flex: 1 },
  previewItemName: { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  previewItemSub: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '800' },
  noteBox: { marginTop: 10, backgroundColor: '#f9fafb', borderRadius: 8, padding: 8 },
  noteLabel: { fontSize: 10, fontWeight: '800', color: '#9ca3af', marginBottom: 2 },
  noteText: { fontSize: 12, color: '#6b7280' },
  previewBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  backEditBtn: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14,
    padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  backEditText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  confirmBtn: {
    flex: 1, backgroundColor: '#6e96eb',
    borderRadius: 14, padding: 14, alignItems: 'center',
  },
  confirmText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});