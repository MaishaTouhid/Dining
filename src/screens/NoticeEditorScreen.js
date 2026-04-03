import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { postNotice } from '../data/repository';

const NOTICE_TYPES = ['delay', 'shortage', 'closure', 'update', 'other'];

export default function NoticeEditorScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();

  const [type, setType] = useState('delay');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [expiresIn, setExpiresIn] = useState('6');
  const [saving, setSaving] = useState(false);

  async function handlePost() {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message.');
      return;
    }
    setSaving(true);
    try {
    await postNotice(String(hallId), String(hallName), String(role), {
  type: String(role), 
  noticeType: type,   
  title: title.trim(),
  message: message.trim(),
  expiresIn: Number(expiresIn) || 6,
  moderatorName: String(moderatorName),
});
      router.replace({
        pathname: '/SuccessScreen',
        params: { hallId, hallName, role, moderatorName },
      });
    } catch (e) {
      Alert.alert('Error', 'Could not post notice.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Post Notice</Text>
        <Text style={styles.pageSub}>Hall: {hallId} • {role === 'dining' ? 'Dining' : 'Canteen'}</Text>

        {/* Type */}
        <Text style={styles.label}>Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {NOTICE_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, type === t && styles.typeChipActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter notice title"
          placeholderTextColor="#9ca3af"
          value={title}
          onChangeText={setTitle}
        />

        {/* Message */}
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Write your notice here..."
          placeholderTextColor="#9ca3af"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />

        {/* Expires */}
        <Text style={styles.label}>Expires in (hours)</Text>
        <TextInput
          style={styles.input}
          value={expiresIn}
          onChangeText={setExpiresIn}
          keyboardType="numeric"
          placeholder="6"
          placeholderTextColor="#9ca3af"
        />

        <TouchableOpacity
          style={styles.postBtn}
          onPress={handlePost}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.postBtnText}>Post Notice</Text>
          }
        </TouchableOpacity>

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
  typeScroll: { marginBottom: 16 },
  typeChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e5e7eb',
    marginRight: 8,
  },
  typeChipActive: { backgroundColor: '#eef2ff', borderColor: '#6e96eb' },
  typeChipText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  typeChipTextActive: { color: '#6e96eb' },
  input: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 14, fontSize: 14, color: '#1a1a2e',
    borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  postBtn: {
    backgroundColor: '#6e96eb', borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  postBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});