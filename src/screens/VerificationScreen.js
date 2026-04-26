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

  const updatedBy = role === 'dining' ? menu?.diningUpdatedBy : menu?.canteenUpdatedBy;
  const updatedAt = role === 'dining' ? menu?.diningUpdatedAt : menu?.canteenUpdatedAt;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Verification Details</Text>
        <Text style={styles.pageSub}>
          Hall: {hallId} • {role === 'dining' ? 'Dining' : 'Canteen'} • Date: {today}
        </Text>

        {loading ? (
          <ActivityIndicator color="#2d5a3d" style={{ marginTop: 40 }} />
        ) : (
          <>
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
                  {updatedAt ? formatTime(updatedAt?.toDate?.() || updatedAt) : 'Not updated today'}
                </Text>
              </View>
              <View style={[styles.row, { borderBottomWidth: 0 }]}>
                <Text style={styles.rowLabel}>Verification status</Text>
                <View style={[styles.statusBadge, updatedBy ? styles.statusPending : styles.statusNone]}>
                  <Text style={[styles.statusText, { color: updatedBy ? '#8b6a2f' : '#7a7a6e' }]}>
                    {updatedBy ? 'Pending' : 'Not Updated'}
                  </Text>
                </View>
              </View>
            </View>

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
  container: { flex: 1, backgroundColor: '#edeae3' },
  scroll: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginBottom: 4 },
  pageSub: { fontSize: 12, color: '#6b6b60', marginBottom: 20 },
  card: {
    backgroundColor: '#f5f2eb', borderRadius: 16, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#d8d4c8',
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 14 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#e8e4dc',
  },
  rowLabel: { fontSize: 13, color: '#7a7a6e' },
  rowValue: { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusPending: { backgroundColor: '#f5ecd4' },
  statusNone: { backgroundColor: '#e8e4dc' },
  statusText: { fontSize: 12, fontWeight: '700' },
  historyItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e8e4dc' },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  historyName: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  historyTime: { fontSize: 11, color: '#7a7a6e' },
  historyAction: { fontSize: 12, color: '#6b6b60' },
  emptyHint: { fontSize: 13, color: '#7a7a6e', paddingVertical: 8 },
});
