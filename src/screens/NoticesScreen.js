import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { getNotices } from '../data/repository';
import { formatTime } from '../data/date';

export default function NoticesScreen() {
  const [diningNotices, setDiningNotices] = useState([]);
  const [canteenNotices, setCanteenNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [d, c] = await Promise.all([
      getNotices('dining'),
      getNotices('canteen'),
    ]);
    setDiningNotices(d);
    setCanteenNotices(c);
    setLoading(false);
  }

  function toggle(key) {
    setExpanded(prev => prev === key ? null : key);
  }

  function renderNoticeList(list) {
    if (list.length === 0) {
      return (
        <Text style={styles.empty}>No notices available.</Text>
      );
    }
    return list.map((n, idx) => (
      <View key={n.id || idx} style={styles.noticeCard}>
        <Text style={styles.noticeHall}>{n.hallName}</Text>
        <Text style={styles.noticeMsg}>{n.message}</Text>
        <Text style={styles.noticeDate}>
          {formatTime(n.createdAt?.toDate?.() || n.createdAt)}
        </Text>
      </View>
    ));
  }

  const SECTIONS = [
    { key: 'dining',  title: 'Dining Notices',  list: diningNotices },
    { key: 'canteen', title: 'Canteen Notices',  list: canteenNotices },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Notice Updates</Text>

        {loading ? (
          <ActivityIndicator color="#6e96eb" style={{ marginTop: 40 }} />
        ) : (
          SECTIONS.map(section => (
            <View key={section.key} style={styles.section}>
              {/* Header */}
              <TouchableOpacity
                style={styles.sectionHeader}
                onPress={() => toggle(section.key)}
              >
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.chevron}>
                  {expanded === section.key ? '∧' : '∨'}
                </Text>
              </TouchableOpacity>

              {/* Content */}
              {expanded === section.key && (
                <View style={styles.sectionBody}>
                  {renderNoticeList(section.list)}
                </View>
              )}
            </View>
          ))
        )}

        {expanded === null && !loading && (
          <Text style={styles.tapHint}>
            Tap any button above to see notice details.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scroll: { padding: 16, paddingBottom: 40 },

  pageTitle: {
    fontSize: 22, fontWeight: '800',
    color: '#1a1a2e', marginBottom: 16,
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: '700', color: '#1a1a2e',
  },
  chevron: {
    fontSize: 14, color: '#9ca3af', fontWeight: '700',
  },
  sectionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },

  noticeCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  noticeHall: {
    fontSize: 13, fontWeight: '700',
    color: '#1a1a2e', marginBottom: 4,
  },
  noticeMsg: {
    fontSize: 13, color: '#4b5563',
    lineHeight: 18, marginBottom: 6,
  },
  noticeDate: {
    fontSize: 11, color: '#6e96eb', fontWeight: '600',
  },

  empty: {
    fontSize: 13, color: '#9ca3af',
    paddingVertical: 12,
  },
  tapHint: {
    textAlign: 'center',
    fontSize: 12, color: '#9ca3af',
    marginTop: 24,
  },
});