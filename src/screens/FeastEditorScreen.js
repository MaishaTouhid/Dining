// ─── FeastEditorScreen.js ────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addFeast } from '../data/repository';
import { getTodayKey } from '../data/date';

export default function FeastEditorScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();
  const today = getTodayKey();

  const [date, setDate] = useState(today);
  const [title, setTitle] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [menu, setMenu] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!date || !title) { Alert.alert('Error', 'Please enter date and title.'); return; }
    setSaving(true);
    try {
      const menuItems = menu.split(',').map(s => s.trim()).filter(Boolean);
      await addFeast(String(hallId), String(hallName), String(role), {
        date, title: title.trim(), timeRange: timeRange.trim(),
        menu: menuItems, price: Number(price) || 0,
        moderatorName: String(moderatorName),
      });
      router.replace({ pathname: '/SuccessScreen', params: { hallId, hallName, role, moderatorName } });
    } catch (e) {
      Alert.alert('Error', 'Could not save feast.');
    } finally {
      setSaving(false);
    }
  }

  function goToEditFeast() {
    router.push({ pathname: '/EditFeast', params: { hallId, hallName, role, moderatorName } });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Add Feast</Text>
        <Text style={styles.pageSub}>Hall: {hallId} • {role === 'dining' ? 'Dining' : 'Canteen'}</Text>

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-03-20" placeholderTextColor="#9a9a8e" />

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Eid Special Feast" placeholderTextColor="#9a9a8e" />

        <Text style={styles.label}>Time Range</Text>
        <TextInput style={styles.input} value={timeRange} onChangeText={setTimeRange} placeholder="e.g. 8:00 PM - 9:00 PM" placeholderTextColor="#9a9a8e" />

        <Text style={styles.label}>Menu (comma separated)</Text>
        <TextInput style={[styles.input, styles.textArea]} value={menu} onChangeText={setMenu} placeholder="Polao, Roast, Beef curry, Salad..." placeholderTextColor="#9a9a8e" multiline />

        <Text style={styles.label}>Price (৳)</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="120" placeholderTextColor="#9a9a8e" keyboardType="numeric" />

        <TouchableOpacity style={styles.editBtn} onPress={goToEditFeast}>
          <Text style={styles.editBtnText}>Edit Feast</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Feast</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edeae3' },
  scroll: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginBottom: 4 },
  pageSub: { fontSize: 12, color: '#6b6b60', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#3a3a30', marginBottom: 8 },
  input: {
    backgroundColor: '#f5f2eb', borderRadius: 12,
    padding: 14, fontSize: 14, color: '#1a1a1a',
    borderWidth: 1, borderColor: '#d8d4c8', marginBottom: 16,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  editBtn: {
    backgroundColor: '#f5f2eb', borderRadius: 14, padding: 14,
    alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#d8d4c8',
  },
  editBtnText: { fontSize: 15, fontWeight: '700', color: '#3a3a30' },
  saveBtn: { backgroundColor: '#2d5a3d', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
