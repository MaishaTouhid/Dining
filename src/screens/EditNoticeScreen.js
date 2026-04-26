import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getNotices, updateNotice, deleteNotice } from '../data/repository';

const NOTICE_TYPES = ['delay', 'shortage', 'closure', 'update', 'other'];

export default function EditNoticeScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [noticeId, setNoticeId] = useState(null);

  const [type, setType] = useState('delay');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [expiresIn, setExpiresIn] = useState('6');

  useEffect(() => { fetchLatestNotice(); }, []);

  async function fetchLatestNotice() {
    setLoading(true);
    try {
      const all = await getNotices(String(role));
      const hallNotices = all.filter(n => n.hallId === String(hallId));
      if (hallNotices.length === 0) {
        Alert.alert('No Notice', 'No notice found for this hall. Post one first.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        setLoading(false);
        return;
      }
      const latest = hallNotices[0];
      setNoticeId(latest.id);
      setType(latest.noticeType || 'delay');
      setTitle(latest.title || '');
      setMessage(latest.message || '');
      setExpiresIn(String(latest.expiresIn || 6));
    } catch (e) {
      Alert.alert('Error', 'Could not load notice.');
      router.back();
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!message.trim()) { Alert.alert('Error', 'Please enter a message.'); return; }
    setSaving(true);
    try {
      await updateNotice(String(noticeId), {
        noticeType: type, title: title.trim(),
        message: message.trim(), expiresIn: Number(expiresIn) || 6,
      });
      Alert.alert('✅ Updated!', 'Notice updated successfully.', [
        { text: 'OK', onPress: () => router.replace({ pathname: '/ModeratorDashboard', params: { hallId, hallName, role, moderatorName } }) },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save changes. Try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!noticeId) { Alert.alert('Error', 'No notice selected.'); return; }
    Alert.alert('Delete Notice', 'Are you sure you want to delete this notice?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteNotice(String(noticeId));
            Alert.alert('🗑️ Deleted!', 'Notice deleted successfully.', [
              { text: 'OK', onPress: () => router.replace({ pathname: '/ModeratorDashboard', params: { hallId, hallName, role, moderatorName } }) },
            ]);
          } catch (e) {
            Alert.alert('Error', 'Could not delete notice. Try again.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#2d5a3d" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Edit Notice</Text>
        <Text style={styles.pageSub}>Hall: {hallId} • {role === 'dining' ? 'Dining' : 'Canteen'}</Text>

        <Text style={styles.label}>Type</Text>
        <TextInput style={styles.inputReadonly} value={type.charAt(0).toUpperCase() + type.slice(1)} editable={false} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {NOTICE_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, type === t && styles.typeChipActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} placeholder="Enter notice title" placeholderTextColor="#9a9a8e" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Message</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Write your notice here..." placeholderTextColor="#9a9a8e" value={message} onChangeText={setMessage} multiline numberOfLines={4} />

        <Text style={styles.label}>Expires in (hours)</Text>
        <TextInput style={styles.input} value={expiresIn} onChangeText={setExpiresIn} keyboardType="numeric" placeholder="6" placeholderTextColor="#9a9a8e" />

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleting || saving}>
            {deleting ? <ActivityIndicator color="#c0392b" /> : <Text style={styles.deleteBtnText}>Delete</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving || deleting}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
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
  typeScroll: { marginBottom: 16 },
  typeChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#f5f2eb',
    borderWidth: 1, borderColor: '#d8d4c8', marginRight: 8,
  },
  typeChipActive: { backgroundColor: '#e8ede9', borderColor: '#2d5a3d' },
  typeChipText: { fontSize: 13, fontWeight: '600', color: '#6b6b60' },
  typeChipTextActive: { color: '#2d5a3d' },
  inputReadonly: {
    backgroundColor: '#e8e4dc', borderRadius: 12,
    padding: 14, fontSize: 14, color: '#6b6b60',
    borderWidth: 1, borderColor: '#d8d4c8', marginBottom: 10,
  },
  input: {
    backgroundColor: '#f5f2eb', borderRadius: 12,
    padding: 14, fontSize: 14, color: '#1a1a1a',
    borderWidth: 1, borderColor: '#d8d4c8', marginBottom: 16,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  deleteBtn: {
    flex: 1, borderRadius: 14, padding: 16, alignItems: 'center',
    backgroundColor: '#f5f2eb', borderWidth: 1.5, borderColor: '#e8b4b0',
  },
  deleteBtnText: { color: '#c0392b', fontWeight: '800', fontSize: 15 },
  saveBtn: { flex: 1, backgroundColor: '#2d5a3d', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
