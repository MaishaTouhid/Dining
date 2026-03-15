import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ModeratorRoleScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Moderator</Text>
        <Text style={styles.sub}>Select your responsibility</Text>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push({
            pathname: '/ModeratorLogin',
            params: { role: 'dining' }
          })}
        >
          <Text style={styles.btnPrimaryText}>Dining Moderator</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push({
            pathname: '/ModeratorLogin',
            params: { role: 'canteen' }
          })}
        >
          <Text style={styles.btnSecondaryText}>Canteen Moderator</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 28, fontWeight: '800',
    color: '#1a1a2e', marginBottom: 8,
  },
  sub: {
    fontSize: 14, color: '#6b7280',
    marginBottom: 40,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: '#6e96eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPrimaryText: {
    color: '#fff', fontWeight: '800', fontSize: 16,
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  btnSecondaryText: {
    color: '#1a1a2e', fontWeight: '700', fontSize: 16,
  },
  backBtn: { marginTop: 8 },
  backText: {
    fontSize: 14, color: '#6b7280', fontWeight: '600',
  },
});