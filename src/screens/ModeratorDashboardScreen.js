import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getTodayKey } from '../data/date';

export default function ModeratorDashboardScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();
  const today = getTodayKey();
  const isDining = role === 'dining';

  const MENU_ITEMS = isDining ? [
    {
      label: 'Quick Status (Item-wise)',
      desc: 'Quickly update food availability status',
      icon: '⚡',
      route: '/QuickStatus',
      primary: true,
    },
    {
      label: 'Update Dining Menu',
      desc: 'Add or edit today\'s full dining menu',
      icon: '🍽️',
      route: '/MenuEditor',
    },
    {
      label: 'Post Notice',
      desc: 'Announce delays, changes or updates',
      icon: '📢',
      route: '/NoticeEditor',
    },
    {
      label: 'Add Feast',
      desc: 'Schedule a special feast event',
      icon: '🎉',
      route: '/FeastEditor',
    },
    {
      label: 'Daily Reset',
      desc: 'Duplicate yesterday or clear for today',
      icon: '🔄',
      route: '/DailyReset',
    },
    {
      label: 'Verification',
      desc: 'View update history and verify records',
      icon: '✅',
      route: '/Verification',
    },
  ] : [
    {
      label: 'Quick Canteen Status (Item-wise)',
      desc: 'Quickly update canteen item availability',
      icon: '⚡',
      route: '/CanteenQuickStatus',
      primary: true,
    },
    {
      label: 'Update Canteen Menu',
      desc: 'Add or edit today\'s canteen items',
      icon: '🛒',
      route: '/CanteenMenuEditor',
    },
    {
      label: 'Post Notice',
      desc: 'Announce delays, changes or updates',
      icon: '📢',
      route: '/NoticeEditor',
    },
    {
      label: 'Add Feast',
      desc: 'Schedule a special canteen feast',
      icon: '🎉',
      route: '/FeastEditor',
    },
    {
      label: 'Daily Reset',
      desc: 'Duplicate yesterday or clear for today',
      icon: '🔄',
      route: '/DailyReset',
    },
    {
      label: 'Verification',
      desc: 'View update history and verify records',
      icon: '✅',
      route: '/Verification',
    },
  ];

  function navigate(route) {
    router.push({
      pathname: route,
      params: { hallId, hallName, role, moderatorName },
    });
  }

async function handleLogout() {
  try {
    await signOut(auth);
    router.replace('/Home');
  } catch (e) {
    console.error(e);
    router.replace('/Home');
  }
}

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Top card */}
        <View style={styles.topCard}>
          <Text style={styles.hallName}>{hallName}</Text>
          <Text style={styles.roleText}>
            Hall: {hallId} • Role: {isDining ? 'Dining' : 'Canteen'} Moderator
          </Text>
          {moderatorName ? (
            <Text style={styles.modName}>👤 {moderatorName}</Text>
          ) : null}
          <Text style={styles.dateText}>📅 {today}</Text>
        </View>

        {/* Menu items */}
        {MENU_ITEMS.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.menuCard, item.primary && styles.menuCardPrimary]}
            onPress={() => navigate(item.route)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuInfo}>
              <Text style={[
                styles.menuLabel,
                item.primary && styles.menuLabelPrimary,
              ]}>
                {item.label}
              </Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Back to Home + Logout */}
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/Home')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scroll: { padding: 16, paddingBottom: 40 },

  // Top card
  topCard: {
    backgroundColor: '#6e96eb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  hallName: {
    fontSize: 24, fontWeight: '900',
    color: '#fff', marginBottom: 4,
    lineHeight: 30,
  },
  roleText: {
    fontSize: 12, color: 'rgba(255,255,255,0.8)',
    marginBottom: 6,
  },
  modName: {
    fontSize: 13, color: 'rgba(255,255,255,0.9)',
    marginBottom: 4, fontWeight: '600',
  },
  dateText: {
    fontSize: 12, color: 'rgba(255,255,255,0.75)',
  },

  // Menu cards
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  menuCardPrimary: {
    backgroundColor: '#6e96eb',
    borderColor: '#6e96eb',
  },
  menuIcon: {
    fontSize: 22, marginRight: 14,
  },
  menuInfo: { flex: 1 },
  menuLabel: {
    fontSize: 15, fontWeight: '800',
    color: '#1a1a2e', marginBottom: 2,
  },
  menuLabelPrimary: { color: '#fff' },
  menuDesc: {
    fontSize: 12, color: '#6b7280',
  },
  menuArrow: {
    fontSize: 22, color: '#9ca3af',
    fontWeight: '700',
  },

  homeBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  homeBtnText: {
    fontSize: 15, fontWeight: '700', color: '#374151',
  },

  logoutText: {
    textAlign: 'center',
    fontSize: 14, color: '#ef4444',
    fontWeight: '600',
  },
});