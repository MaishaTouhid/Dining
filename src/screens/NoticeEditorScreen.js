import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, TextInput,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addFeast, getFeasts, updateFeast, deleteFeast } from '../data/repository';
import { getTodayKey } from '../data/date';

export default function FeastEditorScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();
  const today = getTodayKey();

  const [myFeasts, setMyFeasts] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form fields
  const [date, setDate] = useState(today);
  const [title, setTitle] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [menu, setMenu] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => { fetchMyFeasts(); }, []);

  async function fetchMyFeasts() {
    setLoadingList(true);
    const all = await getFeasts(String(role));
    // Show only this hall's feasts
    setMyFeasts(all.filter(f => f.hallId === String(hallId)));
    setLoadingList(false);
  }

  function resetForm() {
    setEditingId(null);
    setDate(today);
    setTitle('');
    setTimeRange('');
    setMenu('');
    setPrice('');
  }

  function startEdit(feast) {
    setEditingId(feast.id);
    setDate(feast.date || today);
    setTitle(feast.title || '');
    setTimeRange(feast.timeRange || '');
    setMenu(Array.isArray(feast.menu) ? feast.menu.join(', ') : (feast.menu || ''));
    setPrice(feast.price ? String(feast.price) : '');
  }

  async function handleSave() {
    if (!date || !title) {
      Alert.alert('Error', 'Please enter date and title.');
      return;
    }
    setSaving(true);
    try {
      const menuItems = menu.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        date,
        title: title.trim(),
        timeRange: timeRange.trim(),
        menu: menuItems,
        price: Number(price) || 0,
        moderatorName: String(moderatorName),
      };

      if (editingId) {
        await updateFeast(editingId, payload);
      } else {
        await addFeast(String(hallId), String(hallName), String(role), payload);
      }

      resetForm();
      await fetchMyFeasts();
      Alert.alert('Saved!', editingId ? 'Feast updated.' : 'Feast added.');
    } catch (e) {
      Alert.alert('Error', 'Could not save feast.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(feastId, feastTitle) {
    Alert.alert(
      'Delete Feast',
      `Delete "${feastTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await deleteFeast(feastId);
              if (editingId === feastId) resetForm();
              await fetchMyFeasts();
            } catch (e) {
              Alert.alert('Error', 'Could not delete.');
            }
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>
          {editingId ? 'Edit Feast' : 'Add Feast'}
        </Text>
        <Text style={styles.pageSub}>
          Hall: {hallId} • {role === 'dining' ? 'Dining' : 'Canteen'}
        </Text>

        {/* Form */}
        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input} value={date} onChangeText={setDate}
          placeholder="2026-03-20" placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input} value={title} onChangeText={setTitle}
          placeholder="e.g. Eid Special Feast" placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Time Range</Text>
        <TextInput
          style={styles.input} value={timeRange} onChangeText={setTimeRange}
          placeholder="e.g. 8:00 PM - 9:00 PM" placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Menu (comma separated)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={menu} onChangeText={setMenu}
          placeholder="Polao, Roast, Beef curry, Salad..."
          placeholderTextColor="#9ca3af" multiline
        />

        <Text style={styles.label}>Price (৳)</Text>
        <TextInput
          style={styles.input} value={price} onChangeText={setPrice}
          placeholder="120" placeholderTextColor="#9ca3af" keyboardType="numeric"
        />

        <View style={styles.btnRow}>
          {editingId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.saveBtn, editingId && { flex: 1 }]}
            onPress={handleSave} disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>
                  {editingId ? 'Update Feast' : 'Save Feast'}
                </Text>
            }
          </TouchableOpacity>
        </View>

        {/* Existing feasts list */}
        <Text style={styles.sectionTitle}>My Halls Feasts</Text>
        {loadingList ? (
          <ActivityIndicator color="#6e96eb" style={{ marginTop: 12 }} />
        ) : myFeasts.length === 0 ? (
          <Text style={styles.emptyHint}>No feasts added yet.</Text>
        ) : (
          myFeasts.map(f => (
            <View key={f.id} style={[styles.feastCard, editingId === f.id && styles.feastCardEditing]}>
              <View style={styles.feastInfo}>
                <Text style={styles.feastTitle}>{f.title}</Text>
                <Text style={styles.feastDate}>{f.date}</Text>
                <Text style={styles.feastMenu}>
                  {Array.isArray(f.menu) ? f.menu.join(', ') : f.menu}
                </Text>
                {f.price ? <Text style={styles.feastPrice}>৳{f.price}</Text> : null}
              </View>
              <View style={styles.feastActions}>
                <TouchableOpacity
                  style={styles.editBtn} onPress={() => startEdit(f)}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn} onPress={() => confirmDelete(f.id, f.title)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scroll: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#1a1a2e', marginBottom: 4 },
  pageSub: { fontSize: 12, color: '#6b7280', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 14, fontSize: 14, color: '#1a1a2e',
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 28 },
  saveBtn: {
    flex: 1, backgroundColor: '#6e96eb', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelBtn: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14,
    padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  cancelBtnText: { color: '#374151', fontWeight: '700', fontSize: 15 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a2e', marginBottom: 12 },
  emptyHint: { fontSize: 13, color: '#9ca3af', textAlign: 'center', paddingVertical: 16 },
  feastCard: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  feastCardEditing: { borderColor: '#6e96eb', backgroundColor: '#f0f4ff' },
  feastInfo: { flex: 1 },
  feastTitle: { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 2 },
  feastDate: { fontSize: 11, color: '#6e96eb', fontWeight: '600', marginBottom: 4 },
  feastMenu: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  feastPrice: { fontSize: 12, fontWeight: '800', color: '#16a34a' },
  feastActions: { gap: 8 },
  editBtn: {
    backgroundColor: '#eef2ff', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  editBtnText: { fontSize: 12, fontWeight: '700', color: '#6e96eb' },
  deleteBtn: {
    backgroundColor: '#fee2e2', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  deleteBtnText: { fontSize: 12, fontWeight: '700', color: '#ef4444' },
});