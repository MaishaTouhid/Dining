import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ModeratorRoleScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🛡️</Text>
        </View>
        <Text style={styles.title}>Moderator Login</Text>
        <Text style={styles.sub}>Select your role to continue</Text>

        <TouchableOpacity
          style={[styles.roleCard, styles.diningCard]}
          onPress={() => router.push({ pathname: '/ModeratorLogin', params: { role: 'dining' } })}
          activeOpacity={0.88}
        >
          <Text style={styles.roleCardIcon}>🍽️</Text>
          <View style={styles.roleCardInfo}>
            <Text style={styles.roleCardTitle}>Dining Moderator</Text>
            <Text style={styles.roleCardDesc}>Manage breakfast, lunch & dinner menu</Text>
          </View>
          <Text style={styles.roleCardArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, styles.canteenCard]}
          onPress={() => router.push({ pathname: '/ModeratorLogin', params: { role: 'canteen' } })}
          activeOpacity={0.88}
        >
          <Text style={styles.roleCardIcon}>🛒</Text>
          <View style={styles.roleCardInfo}>
            <Text style={styles.roleCardTitle}>Canteen Moderator</Text>
            <Text style={styles.roleCardDesc}>Manage canteen items & availability</Text>
          </View>
          <Text style={styles.roleCardArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconBox: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: '#d8ead2',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  iconText: { fontSize: 34 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  sub: { fontSize: 14, color: '#888', marginBottom: 36 },
  roleCard: {
    width: '100%', borderRadius: 16, padding: 18, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  diningCard: { backgroundColor: '#fff', borderColor: '#2d6a4f' },
  canteenCard: { backgroundColor: '#fff', borderColor: '#7e57c2' },
  roleCardIcon: { fontSize: 26 },
  roleCardInfo: { flex: 1 },
  roleCardTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 3 },
  roleCardDesc: { fontSize: 12, color: '#888' },
  roleCardArrow: { fontSize: 24, color: '#ccc', fontWeight: '700' },
  backBtn: { marginTop: 24, paddingVertical: 8 },
  backText: { fontSize: 14, color: '#888', fontWeight: '600' },
});
