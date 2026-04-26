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
    const filterActive = (list) => list.filter(f => f.date >= today);
    setDiningFeasts(filterActive(d));
    setCanteenFeasts(filterActive(c));
    setLoading(false);
  }

  function toggle(key) {
    setExpanded(prev => prev === key ? null : key);
  }

  function renderFeastList(list) {
    if (list.length === 0) {
      return (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyText}>No upcoming feasts announced yet.</Text>
        </View>
      );
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

        {f.menu && f.menu.length > 0 ? (
          <Text style={styles.feastMenu}>
            Feast menu: {Array.isArray(f.menu) ? f.menu.join(', ') : f.menu}
          </Text>
        ) : null}

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
        <Text style={styles.pageTitle}>Feast Updates</Text>
        <Text style={styles.pageSub}>Showing upcoming & todays feasts only</Text>

        {loading ? (
          <ActivityIndicator color="#2d5a3d" style={{ marginTop: 40 }} />
        ) : (
          SECTIONS.map(section => (
            <View key={section.key} style={styles.section}>
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggle(section.key)}
              >
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionRight}>
                  {section.list.length > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{section.list.length}</Text>
                    </View>
                  )}
                  <Text style={styles.chevron}>
                    {expanded === section.key ? '∧' : '∨'}
                  </Text>
                </View>
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
            Tap any section to see feast details.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edeae3' },
  scroll: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  pageSub: { fontSize: 12, color: '#7a7a6e', marginBottom: 16 },

  section: {
    backgroundColor: '#f5f2eb', borderRadius: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#d8d4c8', overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countBadge: {
    backgroundColor: '#2d5a3d', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  countBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  chevron: { fontSize: 14, color: '#7a7a6e', fontWeight: '700' },

  sectionBody: {
    paddingHorizontal: 14, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: '#e8e4dc',
  },

  emptyBox: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 13, color: '#7a7a6e' },

  feastCard: {
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#e8e4dc',
  },
  feastTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  feastHall: { fontSize: 13, fontWeight: '700', color: '#1a1a1a', flex: 1 },
  countdownBadge: {
    backgroundColor: '#e8e4dc', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  countdownToday: { backgroundColor: '#f5ecd4' },
  countdownText: { fontSize: 10, fontWeight: '700', color: '#6b6b60' },
  countdownTodayText: { color: '#8b6a2f' },
  feastTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  feastMenu: { fontSize: 13, color: '#4b5563', lineHeight: 18, marginBottom: 8 },
  feastBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  feastDate: { fontSize: 11, color: '#2d5a3d', fontWeight: '600' },
  feastPrice: { fontSize: 13, fontWeight: '800', color: '#2d5a3d' },
  feastTime: { fontSize: 11, color: '#7a7a6e', marginTop: 4 },
  tapHint: { textAlign: 'center', fontSize: 12, color: '#7a7a6e', marginTop: 24 },
});