import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, TextInput,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getMenu, quickUpdateDining } from '../data/repository';
import { getTodayKey } from '../data/date';
import { MEAL_STATUSES } from '../data/types';

const MEALS = ['breakfast', 'lunch', 'dinner'];

export default function QuickStatusScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();
  const today = getTodayKey();

  const [meals, setMeals] = useState({
    breakfast: { items: [] },
    lunch: { items: [] },
    dinner: { items: [] },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMenu(); }, []);

  async function fetchMenu() {
    setLoading(true);
    const data = await getMenu(String(hallId), today);
    if (data?.dining) {
      setMeals({
        breakfast: data.dining.breakfast || { items: [] },
        lunch: data.dining.lunch || { items: [] },
        dinner: data.dining.dinner || { items: [] },
      });
    }
    setLoading(false);
  }

  function updateItemStatus(meal, idx, status) {
    setMeals(prev => {
      const items = [...prev[meal].items];
      items[idx] = { ...items[idx], status };
      return { ...prev, [meal]: { ...prev[meal], items } };
    });
  }

  function updateItemCount(meal, idx, count) {
    setMeals(prev => {
      const items = [...prev[meal].items];
      items[idx] = { ...items[idx], count };
      return { ...prev, [meal]: { ...prev[meal], items } };
    });
  }

  function applyAll(meal, status) {
    setMeals(prev => ({
      ...prev,
      [meal]: {
        ...prev[meal],
        items: prev[meal].items.map(it => ({ ...it, status })),
      },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await quickUpdateDining(String(hallId), today, meals);
      Alert.alert('✅ Saved!', 'Status updated successfully.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Quick Status Update (Item-wise)</Text>
        <Text style={styles.pageSub}>Hall: {hallId} • Date: {today}</Text>

        {MEALS.map(meal => (
          <View key={meal} style={styles.mealBlock}>
            <Text style={styles.mealTitle}>
              {meal.charAt(0).toUpperCase() + meal.slice(1)}
            </Text>

            {/* Bulk buttons */}
            <View style={styles.bulkRow}>
              {['available', 'limited', 'finished'].map(s => (
                <TouchableOpacity
                  key={s}
                  style={styles.bulkBtn}
                  onPress={() => applyAll(meal, s)}
                >
                  <Text style={styles.bulkText}>
                    All {s === 'limited' ? 'Low' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Items */}
            {meals[meal].items.length === 0 ? (
              <Text style={styles.emptyHint}>
                No items yet. Add items first from Menu Editor.
              </Text>
            ) : (
              meals[meal].items.map((item, idx) => (
                <View key={idx} style={styles.itemCard}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>৳{item.price || 0}</Text>

                  {/* Count */}
                  <View style={styles.countRow}>
                    <Text style={styles.countLabel}>Count</Text>
                    <TextInput
                      style={styles.countInput}
                      value={String(item.count ?? '')}
                      onChangeText={v => updateItemCount(meal, idx, v)}
                      keyboardType="numeric"
                      placeholder="—"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>

                  {/* Status buttons */}
                  <View style={styles.statusRow}>
                    {MEAL_STATUSES.map(s => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          styles.statusBtn,
                          item.status === s && styles.statusBtnActive,
                        ]}
                        onPress={() => updateItemStatus(meal, idx, s)}
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
        ))}

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Save Updates</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scroll: { padding: 16, paddingBottom: 40 },

  pageTitle: {
    fontSize: 20, fontWeight: '900',
    color: '#1a1a2e', marginBottom: 4,
  },
  pageSub: { fontSize: 12, color: '#6b7280', marginBottom: 16 },

  mealBlock: {
    backgroundColor: '#fff',
    borderRadius: 14, padding: 14,
    marginBottom: 12,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  mealTitle: {
    fontSize: 16, fontWeight: '800',
    color: '#1a1a2e', marginBottom: 10,
  },
  bulkRow: {
    flexDirection: 'row', gap: 8, marginBottom: 12,
  },
  bulkBtn: {
    flex: 1, paddingVertical: 8,
    borderRadius: 10, backgroundColor: '#f3f4f6',
    borderWidth: 1, borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  bulkText: { fontSize: 11, fontWeight: '700', color: '#374151' },

  emptyHint: {
    fontSize: 12, color: '#9ca3af',
    textAlign: 'center', paddingVertical: 12,
  },

  itemCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12, padding: 12,
    marginBottom: 8,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  itemName: {
    fontSize: 14, fontWeight: '800', color: '#1a1a2e',
  },
  itemPrice: { fontSize: 12, color: '#9ca3af', marginBottom: 8 },

  countRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, marginBottom: 8,
  },
  countLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  countInput: {
    flex: 1, backgroundColor: '#fff',
    borderRadius: 8, padding: 8,
    fontSize: 13, color: '#1a1a2e',
    borderWidth: 1, borderColor: '#e5e7eb',
  },

  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1, paddingVertical: 8,
    borderRadius: 8, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  statusBtnActive: {
    borderColor: '#1a1a2e', backgroundColor: '#f0f0f0',
  },
  statusBtnText: { fontSize: 11, fontWeight: '700', color: '#9ca3af' },
  statusBtnTextActive: { color: '#1a1a2e' },

  saveBtn: {
    backgroundColor: '#6e96eb',
    borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});