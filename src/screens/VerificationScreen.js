import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet,
   ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { getMenu, getUpdateHistory } from '../data/repository';
import { getTodayKey, formatTime } from '../data/date';

export default function VerificationScreen() {
  const { hallId, role, moderatorName } = useLocalSearchParams();
  const today = getTodayKey();

  const [menu, setMenu] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [m, h] = await Promise.all([
      getMenu(String(hallId), today),
      getUpdateHistory(String(hallId), today),
    ]);
    setMenu(m);
    setHistory(h);
    setLoading(false);
  }

  const updatedBy = role === 'dining'
    ? menu?.diningUpdatedBy
    : menu?.canteenUpdatedBy;

  const updatedAt = role === 'dining'
    ? menu?.diningUpdatedAt
    : menu?.canteenUpdatedAt;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Verification Details</Text>
        <Text style={styles.pageSub}>
          Hall: {hallId} • {role === 'dining' ? 'Dining' : 'Canteen'} • Date: {today}
        </Text>

        {loading ? (
          <ActivityIndicator color="#6e96eb" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Current Record */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Current Record</Text>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Updated by</Text>
                <Text style={styles.rowValue}>{updatedBy || '—'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Role</Text>
                <Text style={styles.rowValue}>
                  {role === 'dining' ? 'Dining Moderator' : 'Canteen Moderator'}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Last updated</Text>
                <Text style={styles.rowValue}>
                  {updatedAt
                    ? formatTime(updatedAt?.toDate?.() || updatedAt)
                    : 'Not updated today'}
                </Text>
              </View>
              <View style={[styles.row, { borderBottomWidth: 0 }]}>
                <Text style={styles.rowLabel}>Verification status</Text>
                <View style={[
                  styles.statusBadge,
                  updatedBy ? styles.statusPending : styles.statusNone,
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: updatedBy ? '#b45309' : '#6b7280' },
                  ]}>
                    {updatedBy ? 'Pending' : 'Not Updated'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Update History */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Update History</Text>
              {history.length === 0 ? (
                <Text style={styles.emptyHint}>No update history yet.</Text>
              ) : (
                history.map((h, idx) => (
                  <View key={h.id || idx} style={styles.historyItem}>
                    <View style={styles.historyTop}>
                      <Text style={styles.historyName}>{h.moderatorName || '—'}</Text>
                      <Text style={styles.historyTime}>
                        {formatTime(h.timestamp?.toDate?.() || h.timestamp)}
                      </Text>
                    </View>
                    <Text style={styles.historyAction}>{h.action}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scroll: { padding: 16, paddingBottom: 40 },
  pageTitle: {
    fontSize: 22, fontWeight: '900',
    color: '#1a1a2e', marginBottom: 4,
  },
  pageSub: { fontSize: 12, color: '#6b7280', marginBottom: 20 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16, padding: 16,
    marginBottom: 16,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 16, fontWeight: '800',
    color: '#1a1a2e', marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowLabel: { fontSize: 13, color: '#9ca3af' },
  rowValue: { fontSize: 13, fontWeight: '700', color: '#1a1a2e' },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  statusPending: { backgroundColor: '#fef9c3' },
  statusNone: { backgroundColor: '#f3f4f6' },
  statusText: { fontSize: 12, fontWeight: '700' },

  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyName: {
    fontSize: 14, fontWeight: '700', color: '#1a1a2e',
  },
  historyTime: { fontSize: 11, color: '#9ca3af' },
  historyAction: { fontSize: 12, color: '#6b7280' },
  emptyHint: { fontSize: 13, color: '#9ca3af', paddingVertical: 8 },
});