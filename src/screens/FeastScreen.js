import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFeasts } from '../data/repository';
import { getTodayKey, formatDisplay, daysUntil } from '../data/date';

export default function FeastScreen() {
  const [diningFeasts, setDiningFeasts] = useState([]);
  const [canteenFeasts, setCanteenFeasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const today = getTodayKey();
  const router = useRouter();

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [d, c] = await Promise.all([
      getFeasts('dining'),
      getFeasts('canteen'),
    ]);
    setDiningFeasts(d);
    setCanteenFeasts(c);
    setLoading(false);
  }

  function toggle(key) {
    setExpanded(prev => prev === key ? null : key);
  }

  function renderFeastList(list) {
    if (list.length === 0) {
      return <Text style={styles.empty}>No feasts announced yet.</Text>;
    }
    return list.map((f, idx) => (
      <View key={f.id || idx} style={styles.feastCard}>
        <View style={styles.feastTop}>
          <Text style={styles.feastHall}>{f.hallName}</Text>
          <View style={[
            styles.countdownBadge,
            f.date === today && styles.countdownToday,
          ]}>
            <Text style={[
              styles.countdownText,
              f.date === today && styles.countdownTodayText,
            ]}>
              {daysUntil(f.date)}
            </Text>
          </View>
        </View>
        {f.title ? <Text style={styles.feastTitle}>{f.title}</Text> : null}
        <Text style={styles.feastMenu}>
          Feast menu: {Array.isArray(f.menu) ? f.menu.join(', ') : f.menu}
        </Text>
        <View style={styles.feastBottom}>
          <Text style={styles.feastDate}>{formatDisplay(f.date)}</Text>
          {f.price ? <Text style={styles.feastPrice}>৳{f.price}</Text> : null}
        </View>
        {f.timeRange ? <Text style={styles.feastTime}>{f.timeRange}</Text> : null}
      </View>
    ));
  }

  const SECTIONS = [
    { key: 'dining',  title: 'Hall Dining Feast',  list: diningFeasts },
    { key: 'canteen', title: 'Hall Canteen Feast',  list: canteenFeasts },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Back button 
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity> */}

        <Text style={styles.pageTitle}>Feast Updates</Text>

        {loading ? (
          <ActivityIndicator color="#6e96eb" style={{ marginTop: 40 }} />
        ) : (
          SECTIONS.map(section => (
            <View key={section.key} style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggle(section.key)}
              >
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.chevron}>
                  {expanded === section.key ? '∧' : '∨'}
                </Text>
              </TouchableOpacity>
              {expanded === section.key && (
                <View style={styles.sectionBody}>
                  {renderFeastList(section.list)}
                </View>
              )}
            </View>
          ))
        )}

        {expanded === null && !loading && (
          <Text style={styles.tapHint}>
            Tap any button above to see feast details.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scroll: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 16 },
  section: {
    backgroundColor: '#fff', borderRadius: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  chevron: { fontSize: 14, color: '#9ca3af', fontWeight: '700' },
  sectionBody: {
    paddingHorizontal: 14, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
  },
  feastCard: {
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  feastTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  feastHall: { fontSize: 13, fontWeight: '700', color: '#1a1a2e', flex: 1 },
  countdownBadge: {
    backgroundColor: '#f3f4f6', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  countdownToday: { backgroundColor: '#fef9c3' },
  countdownText: { fontSize: 10, fontWeight: '700', color: '#6b7280' },
  countdownTodayText: { color: '#b45309' },
  feastTitle: { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  feastMenu: { fontSize: 13, color: '#4b5563', lineHeight: 18, marginBottom: 8 },
  feastBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  feastDate: { fontSize: 11, color: '#6e96eb', fontWeight: '600' },
  feastPrice: { fontSize: 12, fontWeight: '800', color: '#16a34a' },
  feastTime: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  empty: { fontSize: 13, color: '#9ca3af', paddingVertical: 12 },
  tapHint: { textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 24 },
});

{/* backBtn: { paddingVertical: 8, paddingHorizontal: 4, marginBottom: 8 },
  backText: { fontSize: 16, color: '#6e96eb', fontWeight: '700' }, */}