import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNotices } from '../data/repository';
import { formatTime } from '../data/date';

const TYPE_CONFIG = {
  delay:    { icon: '⏰', color: '#f59e0b', bg: '#fffbeb' },
  shortage: { icon: '⚠️', color: '#ef4444', bg: '#fef2f2' },
  closure:  { icon: '🔒', color: '#6b7280', bg: '#f9fafb' },
  update:   { icon: '📋', color: '#3b82f6', bg: '#eff6ff' },
  other:    { icon: '📌', color: '#8b5cf6', bg: '#f5f3ff' },
};

function isNoticeExpired(notice) {
  if (!notice.createdAt || !notice.expiresIn) return false;
  try {
    const created = notice.createdAt?.toDate
      ? notice.createdAt.toDate()
      : new Date(notice.createdAt);
    const expiresAt = new Date(created.getTime() + notice.expiresIn * 60 * 60 * 1000);
    return new Date() > expiresAt;
  } catch {
    return false;
  }
}

export default function NoticesScreen() {
  const [diningNotices, setDiningNotices] = useState([]);
  const [canteenNotices, setCanteenNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const router = useRouter();

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [d, c] = await Promise.all([
      getNotices('dining'),
      getNotices('canteen'),
    ]);
    // Auto-hide expired notices
    const filterActive = (list) => list.filter(n => !isNoticeExpired(n));
    setDiningNotices(filterActive(d));
    setCanteenNotices(filterActive(c));
    setLoading(false);
  }

  function toggle(key) {
    setExpanded(prev => prev === key ? null : key);
  }

  function renderNoticeList(list) {
    if (list.length === 0) {
      return (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📢</Text>
          <Text style={styles.emptyText}>No active notices right now.</Text>
        </View>
      );
    }
    return list.map((n, idx) => {
      const cfg = TYPE_CONFIG[n.noticeType] || TYPE_CONFIG.other;
      return (
        <View key={n.id || idx} style={styles.noticeCard}>
          <View style={[styles.typeBadge, { backgroundColor: cfg.bg }]}>
            <Text style={styles.typeBadgeIcon}>{cfg.icon}</Text>
            <Text style={[styles.typeBadgeText, { color: cfg.color }]}>
              {(n.noticeType || 'other').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.noticeHall}>{n.hallName}</Text>
          {n.title ? <Text style={styles.noticeTitle}>{n.title}</Text> : null}
          <Text style={styles.noticeMsg}>{n.message}</Text>
          <View style={styles.noticeFooter}>
            <Text style={styles.noticeDate}>
              {formatTime(n.createdAt?.toDate?.() || n.createdAt)}
            </Text>
            {n.expiresIn ? (
              <Text style={styles.noticeExpiry}>⏱ {n.expiresIn}h</Text>
            ) : null}
          </View>
        </View>
      );
    });
  }

  const SECTIONS = [
    { key: 'dining',  title: 'Dining Notices',  list: diningNotices },
    { key: 'canteen', title: 'Canteen Notices',  list: canteenNotices },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Notice Updates</Text>
        <Text style={styles.pageSub}>Showing active notices only</Text>

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
                  {renderNoticeList(section.list)}
                </View>
              )}
            </View>
          ))
        )}

        {expanded === null && !loading && (
          <Text style={styles.tapHint}>
            Tap any section to see notice details.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scroll: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  pageSub: { fontSize: 12, color: '#9ca3af', marginBottom: 16 },

  section: {
    backgroundColor: '#fff', borderRadius: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  sectionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countBadge: {
    backgroundColor: '#6e96eb', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  countBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  chevron: { fontSize: 14, color: '#9ca3af', fontWeight: '700' },

  sectionBody: {
    paddingHorizontal: 14, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: '#f3f4f6',
  },

  emptyBox: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 13, color: '#9ca3af' },

  noticeCard: {
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, marginBottom: 8,
  },
  typeBadgeIcon: { fontSize: 11 },
  typeBadgeText: { fontSize: 10, fontWeight: '800' },

  noticeHall: { fontSize: 13, fontWeight: '700', color: '#1a1a2e', marginBottom: 2 },
  noticeTitle: { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  noticeMsg: { fontSize: 13, color: '#4b5563', lineHeight: 18, marginBottom: 8 },
  noticeFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  noticeDate: { fontSize: 11, color: '#6e96eb', fontWeight: '600' },
  noticeExpiry: { fontSize: 11, color: '#9ca3af' },

  tapHint: { textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 24 },
});