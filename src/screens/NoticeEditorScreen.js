import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { postNotice } from '../data/repository';

const NOTICE_TYPES = ['delay', 'shortage', 'closure', 'update', 'other'];
const TYPE_ICONS = { delay: '🕐', shortage: '⚠️', closure: '🔒', update: '📋', other: '📌' };

export default function NoticeEditorScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();

  const [type, setType] = useState('delay');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [expiresIn, setExpiresIn] = useState('6');
  const [saving, setSaving] = useState(false);

  async function handlePost() {
    if (!message.trim()) { Alert.alert('Error', 'Please enter a message.'); return; }
    setSaving(true);
    try {
      await postNotice(String(hallId), String(hallName), String(role), {
        type: String(role), noticeType: type,
        title: title.trim(), message: message.trim(),
        expiresIn: Number(expiresIn) || 6,
        moderatorName: String(moderatorName),
      });
      router.replace({ pathname: '/SuccessScreen', params: { hallId, hallName, role, moderatorName } });
    } catch (e) {
      Alert.alert('Error', 'Could not post notice.');
    } finally {
      setSaving(false);
    }
  }

  function goToEditNotice() {
    router.push({ pathname: '/EditNotice', params: { hallId, hallName, role, moderatorName } });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Post Notice</Text>
        <Text style={styles.pageSub}>Hall: {hallId} • {role === 'dining' ? 'Dining' : 'Canteen'}</Text>

        <Text style={styles.label}>Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {NOTICE_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, type === t && styles.typeChipActive]}
              onPress={() => setType(t)}
            >
              <Text style={styles.typeChipIcon}>{TYPE_ICONS[t]}</Text>
              <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.selectedTypeBox}>
          <Text style={styles.selectedTypeIcon}>{TYPE_ICONS[type]}</Text>
          <Text style={styles.selectedTypeText}>{type.charAt(0).toUpperCase() + type.slice(1)} Notice</Text>
        </View>

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} placeholder="Enter notice title" placeholderTextColor="#9a9a8e" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Message</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Write your notice here..." placeholderTextColor="#9a9a8e" value={message} onChangeText={setMessage} multiline numberOfLines={4} />

        <Text style={styles.label}>Expires in (hours)</Text>
        <TextInput style={styles.input} value={expiresIn} onChangeText={setExpiresIn} keyboardType="numeric" placeholder="6" placeholderTextColor="#9a9a8e" />

        <TouchableOpacity style={styles.editBtn} onPress={goToEditNotice}>
          <Text style={styles.editBtnText}>Edit Notice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.postBtn} onPress={handlePost} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.postBtnText}>Post Notice</Text>}
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
  typeScroll: { marginBottom: 12 },
  typeChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#f5f2eb',
    borderWidth: 1, borderColor: '#d8d4c8', marginRight: 8, gap: 6,
  },
  typeChipActive: { backgroundColor: '#e8ede9', borderColor: '#2d5a3d' },
  typeChipIcon: { fontSize: 14 },
  typeChipText: { fontSize: 13, fontWeight: '600', color: '#6b6b60' },
  typeChipTextActive: { color: '#2d5a3d' },
  selectedTypeBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5ecd4', borderRadius: 10,
    padding: 12, marginBottom: 16, gap: 8,
    borderWidth: 1, borderColor: '#e8d4a0',
  },
  selectedTypeIcon: { fontSize: 18 },
  selectedTypeText: { fontSize: 14, fontWeight: '700', color: '#8b6a2f' },
  input: {
    backgroundColor: '#f5f2eb', borderRadius: 12,
    padding: 14, fontSize: 14, color: '#1a1a1a',
    borderWidth: 1, borderColor: '#d8d4c8', marginBottom: 16,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  editBtn: {
    backgroundColor: '#f5f2eb', borderRadius: 14, padding: 14,
    alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#d8d4c8',
  },
  editBtnText: { fontSize: 15, fontWeight: '700', color: '#3a3a30' },
  postBtn: { backgroundColor: '#2d5a3d', borderRadius: 14, padding: 16, alignItems: 'center' },
  postBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
