import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView,  TextInput,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getFeasts, updateFeast, deleteFeast } from '../data/repository';

export default function EditFeastScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feastId, setFeastId] = useState(null);

  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [menu, setMenu] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => { fetchLatestFeast(); }, []);

  async function fetchLatestFeast() {
    setLoading(true);
    try {
      const all = await getFeasts(String(role));
      const hallFeasts = all.filter(f => f.hallId === String(hallId));
      if (hallFeasts.length === 0) {
        Alert.alert('No Feast', 'No feast found for this hall. Add one first.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        setLoading(false);
        return;
      }
      // Sort by createdAt descending to get latest
      const sorted = hallFeasts.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
      const latest = sorted[0];
      setFeastId(latest.id);
      setDate(latest.date || '');
      setTitle(latest.title || '');
      setTimeRange(latest.timeRange || '');
      setMenu(Array.isArray(latest.menu) ? latest.menu.join(', ') : (latest.menu || ''));
      setPrice(String(latest.price || ''));
    } catch (e) {
      console.error('Fetch feast error:', e);
      Alert.alert('Error', 'Could not load feast.');
      router.back();
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!date || !title) {
      Alert.alert('Error', 'Please enter date and title.');
      return;
    }
    setSaving(true);
    try {
      const menuItems = menu.split(',').map(s => s.trim()).filter(Boolean);
      await updateFeast(String(feastId), {
        date,
        title: title.trim(),
        timeRange: timeRange.trim(),
        menu: menuItems,
        price: Number(price) || 0,
      });
      Alert.alert('✅ Updated!', 'Feast updated successfully.', [
        {
          text: 'OK',
          onPress: () => router.replace({
            pathname: '/ModeratorDashboard',
            params: { hallId, hallName, role, moderatorName },
          }),
        },
      ]);
    } catch (e) {
      console.error('Save feast error:', e);
      Alert.alert('Error', 'Could not save changes. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!feastId) {
      Alert.alert('Error', 'No feast selected.');
      return;
    }
    Alert.alert(
      'Delete Feast',
      'Are you sure you want to delete this feast?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteFeast(String(feastId));
              Alert.alert('🗑️ Deleted!', 'Feast deleted successfully.', [
                {
                  text: 'OK',
                  onPress: () => router.replace({
                    pathname: '/ModeratorDashboard',
                    params: { hallId, hallName, role, moderatorName },
                  }),
                },
              ]);
            } catch (e) {
              console.error('Delete feast error:', e);
              Alert.alert('Error', 'Could not delete feast. Try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
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
        <Text style={styles.pageTitle}>Edit Feast</Text>
        <Text style={styles.pageSub}>
          Hall: {hallId} • {role === 'dining' ? 'Dining' : 'Canteen'}
        </Text>

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="2026-03-20"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Eid Special Feast"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Time Range</Text>
        <TextInput
          style={styles.input}
          value={timeRange}
          onChangeText={setTimeRange}
          placeholder="e.g. 8:00 PM - 9:00 PM"
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Menu (comma separated)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={menu}
          onChangeText={setMenu}
          placeholder="Polao, Roast, Beef curry, Salad..."
          placeholderTextColor="#9ca3af"
          multiline
        />

        <Text style={styles.label}>Price (৳)</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="120"
          placeholderTextColor="#9ca3af"
          keyboardType="numeric"
        />

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
            disabled={deleting || saving}
          >
            {deleting
              ? <ActivityIndicator color="#ef4444" />
              : <Text style={styles.deleteBtnText}>Delete</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={saving || deleting}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveBtnText}>Save Changes</Text>
            }
          </TouchableOpacity>
        </View>

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
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  deleteBtn: {
    flex: 1, borderRadius: 14, padding: 16,
    alignItems: 'center', backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: '#fca5a5',
  },
  deleteBtnText: { color: '#ef4444', fontWeight: '800', fontSize: 15 },
  saveBtn: {
    flex: 1, backgroundColor: '#6e96eb',
    borderRadius: 14, padding: 16, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});