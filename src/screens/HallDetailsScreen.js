import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getMenu } from '../data/repository';
import { getTodayKey, formatTime } from '../data/date';
import { STATUS_CONFIG, MEAL_LABELS } from '../data/types';

const MENU_TYPES = [
  {
    key: 'dining',
    title: 'Hall Dining',
    desc: 'See breakfast, lunch, and dinner menu',
  },
  {
    key: 'canteen',
    title: 'Hall Canteen',
    desc: 'See available canteen food items',
  },
];

export default function HallDetailsScreen() {
  const { hallId, hallName } = useLocalSearchParams();
  const router = useRouter();
  const today = getTodayKey();

  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // 'dining' | 'canteen'
  const [activeMeal, setActiveMeal] = useState('breakfast');

  useEffect(() => {
    fetchMenu();
  }, []);

  async function fetchMenu() {
    setLoading(true);
    const data = await getMenu(String(hallId), today);
    setMenu(data);
    setLoading(false);
  }

  function toggleExpand(key) {
    setExpanded(prev => prev === key ? null : key);
    if (key === 'dining') setActiveMeal('breakfast');
  }

  // ── Dining meal tab content ──
  function renderDiningContent() {
    const dining = menu?.dining;
    return (
      <View style={styles.expandBody}>
        {/* Meal tabs */}
        <View style={styles.mealTabs}>
          {['breakfast', 'lunch', 'dinner'].map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.mealTab, activeMeal === m && styles.mealTabActive]}
              onPress={() => setActiveMeal(m)}
            >
              <Text style={[styles.mealTabText, activeMeal === m && styles.mealTabTextActive]}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meal content */}
        {!dining?.[activeMeal] ? (
          <View style={styles.notUpdated}>
            <View style={styles.notUpdatedBadge}>
              <Text style={styles.notUpdatedText}>NOT UPDATED</Text>
            </View>
            <Text style={styles.notUpdatedDesc}>
              {activeMeal.charAt(0).toUpperCase() + activeMeal.slice(1)} menu has not been updated yet.
            </Text>
            <Text style={styles.noteLabel}>NOTE</Text>
            <Text style={styles.noteText}>No {activeMeal} items added yet.</Text>
          </View>
        ) : (
          <View>
            {/* Time */}
            {dining[activeMeal]?.time ? (
              <Text style={styles.mealTime}>
                Time: {dining[activeMeal].time}
              </Text>
            ) : null}

            {/* Items */}
            {(dining[activeMeal]?.items || []).map((item, idx) => {
              const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
              return (
                <View key={idx} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      ৳{item.price || 0} • Remaining: {item.count ?? '—'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>
                      {s.label}
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Note */}
            {dining[activeMeal]?.note ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>NOTE</Text>
                <Text style={styles.noteText}>{dining[activeMeal].note}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    );
  }

  // ── Canteen content ──
  function renderCanteenContent() {
    const items = menu?.canteen?.items || [];
    return (
      <View style={styles.expandBody}>
        {items.length === 0 ? (
          <View style={styles.notUpdated}>
            <View style={styles.notUpdatedBadge}>
              <Text style={styles.notUpdatedText}>NOT UPDATED</Text>
            </View>
            <Text style={styles.notUpdatedDesc}>
              Canteen menu has not been updated yet.
            </Text>
            <Text style={styles.noteLabel}>NOTE</Text>
            <Text style={styles.noteText}>No canteen items added yet.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.mealTime}>All day items</Text>
            {items.map((item, idx) => {
              const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
              return (
                <View key={idx} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      ৳{item.price || 0} • Remaining: {item.count ?? '—'}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.statusText, { color: s.color }]}>
                      {s.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Back button 
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity> */}

        {/* Hall info card */}
        <View style={styles.infoCard}>
          <Text style={styles.hallName}>{hallName}</Text>
          <Text style={styles.infoRow}>Hall ID: {hallId}</Text>
          <Text style={styles.infoRow}>Date: {today}</Text>
          <Text style={styles.infoRow}>
            Last updated: {menu?.updatedAt ? formatTime(menu.updatedAt?.toDate?.() || menu.updatedAt) : 'Not updated today'}
          </Text>
          <Text style={styles.infoRow}>
            Verified by: {menu?.diningUpdatedBy || 'Not verified yet'}
          </Text>
        </View>

        {/* Select Menu Type */}
        {expanded === null && (
          <Text style={styles.selectLabel}>Select Menu Type</Text>
        )}

        {/* Menu type cards */}
        {MENU_TYPES.map(type => (
          <View key={type.key}>
            <TouchableOpacity
              style={[
                styles.menuTypeCard,
                expanded === type.key && styles.menuTypeCardActive,
              ]}
              onPress={() => toggleExpand(type.key)}
            >
              <View style={styles.menuTypeLeft}>
                <Text style={styles.menuTypeTitle}>{type.title}</Text>
                <Text style={styles.menuTypeDesc}>{type.desc}</Text>
              </View>
              <Text style={styles.menuTypeChevron}>
                {expanded === type.key ? '∧' : '∨'}
              </Text>
            </TouchableOpacity>

            {/* Expanded content */}
            {expanded === type.key && (
              type.key === 'dining'
                ? renderDiningContent()
                : renderCanteenContent()
            )}
          </View>
        ))}

        {expanded === null && (
          <Text style={styles.tapHint}>Tap any option to view menu details</Text>
        )}

      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6e96eb" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scroll: { padding: 16, paddingBottom: 40 },


  // Info card
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  hallName: {
    fontSize: 18, fontWeight: '800',
    color: '#1a1a2e', marginBottom: 10,
  },
  infoRow: {
    fontSize: 12, color: '#6b7280',
    marginBottom: 4,
  },

  selectLabel: {
    fontSize: 14, fontWeight: '700',
    color: '#1a1a2e', marginBottom: 10,
  },

  // Menu type card
  menuTypeCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuTypeCardActive: {
    borderColor: '#6e96eb',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  menuTypeLeft: { flex: 1 },
  menuTypeTitle: {
    fontSize: 15, fontWeight: '800',
    color: '#1a1a2e', marginBottom: 3,
  },
  menuTypeDesc: {
    fontSize: 12, color: '#6b7280',
  },
  menuTypeChevron: {
    fontSize: 16, color: '#9ca3af', fontWeight: '700',
  },

  // Expanded body
  expandBody: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#6e96eb',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  // Meal tabs
  mealTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  mealTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  mealTabActive: {
    backgroundColor: '#6e96eb',
    borderColor: '#6e96eb',
  },
  mealTabText: {
    fontSize: 12, fontWeight: '700', color: '#6b7280',
  },
  mealTabTextActive: { color: '#fff' },

  mealTime: {
    fontSize: 12, color: '#9ca3af',
    marginBottom: 10,
  },

  // Item row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemLeft: { flex: 1 },
  itemName: {
    fontSize: 14, fontWeight: '700',
    color: '#1a1a2e', marginBottom: 2,
  },
  itemPrice: {
    fontSize: 11, color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10, fontWeight: '800',
  },

  // Note
  noteBox: {
    marginTop: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 10,
  },
  noteLabel: {
    fontSize: 10, fontWeight: '800',
    color: '#9ca3af', marginBottom: 3,
    letterSpacing: 0.5,
  },
  noteText: {
    fontSize: 12, color: '#6b7280',
  },

  // Not updated
  notUpdated: {
    paddingVertical: 10,
  },
  notUpdatedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  notUpdatedText: {
    fontSize: 10, fontWeight: '800', color: '#9ca3af',
  },
  notUpdatedDesc: {
    fontSize: 12, color: '#6b7280',
    marginBottom: 10,
  },

  tapHint: {
    textAlign: 'center',
    fontSize: 12, color: '#9ca3af',
    marginTop: 16,
  },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});

 {/* backBtn: { paddingVertical: 8, paddingHorizontal: 4, marginBottom: 8 },
  backText: { fontSize: 16, color: '#6e96eb', fontWeight: '700' }, */}