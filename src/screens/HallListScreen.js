import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, SafeAreaView, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { HALLS } from '../data/halls';
import { getTodayKey } from '../data/date';
import { getMenu } from '../data/repository';

export default function HallListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatedHalls, setUpdatedHalls] = useState(new Set());
  const today = getTodayKey();

  useEffect(() => {
    checkUpdatedHalls();
  }, []);

  async function checkUpdatedHalls() {
    // Check first 6 halls for performance
    const checks = await Promise.all(
      HALLS.map(async h => {
        const menu = await getMenu(h.id, today);
        return menu ? h.id : null;
      })
    );
    setUpdatedHalls(new Set(checks.filter(Boolean)));
  }

  const filtered = HALLS.filter(h => {
    const matchType = filter === 'all' || h.type === filter;
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>Hall List</Text>
        <Text style={styles.subDesc}>
          Search halls, filter by type, and check whether todays menu has been updated.
        </Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search hall name"
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        {['all', 'boys', 'girls'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f === 'boys' ? 'Boys' : 'Girls'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick links */}
      <View style={styles.quickLinks}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/Feast')}
        >
          <Text style={styles.quickIcon}>🎉</Text>
          <Text style={styles.quickTitle}>Feast</Text>
          <Text style={styles.quickDesc}>See feast date, menu, and price</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/Notices')}
        >
          <Text style={styles.quickIcon}>📢</Text>
          <Text style={styles.quickTitle}>Notice</Text>
          <Text style={styles.quickDesc}>View important hall dining updates</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.listTitle}>Available Halls</Text>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
        renderItem={({ item }) => {
          const isUpdated = updatedHalls.has(item.id);
          return (
            <TouchableOpacity
              style={styles.hallCard}
              onPress={() => router.push({
                pathname: '/HallDetail',
                params: { hallId: item.id, hallName: item.name }
              })}
            >
              <View style={styles.hallLeft}>
                <Text style={styles.hallName}>{item.name}</Text>
                <Text style={styles.hallDesc}>
                  Tap to view todays dining and canteen menu
                </Text>
                <Text style={styles.hallMeals}>Breakfast • Lunch • Dinner</Text>
              </View>

              <View style={styles.hallRight}>
                <View style={[
                  styles.typeBadge,
                  item.type === 'girls' ? styles.typeBadgeGirls : styles.typeBadgeBoys
                ]}>
                  <Text style={[
                    styles.typeText,
                    item.type === 'girls' ? styles.typeTextGirls : styles.typeTextBoys
                  ]}>
                    {item.type === 'girls' ? 'GIRLS' : 'BOYS'}
                  </Text>
                </View>

                {/* Updated today badge */}
                {isUpdated && (
                  <View style={styles.updatedBadge}>
                    <Text style={styles.updatedText}>Updated today</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  subHeader: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12,
  },
  subTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  subDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18 },
  searchBox: { marginHorizontal: 16, marginBottom: 10 },
  searchInput: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#1a1a2e',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 16,
    gap: 8, marginBottom: 14,
  },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  filterActive: { backgroundColor: '#6e96eb', borderColor: '#6e96eb' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  filterTextActive: { color: '#fff' },
  quickLinks: {
    flexDirection: 'row', paddingHorizontal: 16,
    gap: 10, marginBottom: 16,
  },
  quickCard: {
    flex: 1, backgroundColor: '#fff',
    borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  quickIcon: { fontSize: 20, marginBottom: 6 },
  quickTitle: { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 2 },
  quickDesc: { fontSize: 11, color: '#9ca3af', lineHeight: 15 },
  listTitle: {
    fontSize: 14, fontWeight: '800', color: '#1a1a2e',
    paddingHorizontal: 16, marginBottom: 10,
  },
  hallCard: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  hallLeft: { flex: 1 },
  hallName: { fontSize: 15, fontWeight: '800', color: '#1a1a2e', marginBottom: 4 },
  hallDesc: { fontSize: 12, color: '#6b7280', marginBottom: 6, lineHeight: 16 },
  hallMeals: { fontSize: 11, color: '#9ca3af' },
  hallRight: { alignItems: 'flex-end', gap: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeBoys: { backgroundColor: '#eff6ff' },
  typeBadgeGirls: { backgroundColor: '#fdf2f8' },
  typeText: { fontSize: 10, fontWeight: '800' },
  typeTextBoys: { color: '#3b82f6' },
  typeTextGirls: { color: '#ec4899' },
  updatedBadge: {
    backgroundColor: '#dcfce7',
    borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  updatedText: { fontSize: 10, fontWeight: '700', color: '#16a34a' },
});