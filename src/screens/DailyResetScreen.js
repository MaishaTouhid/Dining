import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
   ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { duplicateYesterday, upsertMenu } from '../data/repository';
import { getTodayKey } from '../data/date';

export default function DailyResetScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();
  const today = getTodayKey();

  const [duplicating, setDuplicating] = useState(false);
  const [clearing, setClearing] = useState(false);

  async function handleDuplicate() {
    Alert.alert(
      'Duplicate Yesterday',
      "Copy yesterday's menu as today's starting point?",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Duplicate',
          onPress: async () => {
            setDuplicating(true);
            try {
              const success = await duplicateYesterday(
                String(hallId), today, String(role)
              );
              if (success) {
                Alert.alert('✅ Done!', "Yesterday's menu copied to today.", [
                  { text: 'OK', onPress: () => router.back() }
                ]);
              } else {
                Alert.alert('No Data', "No yesterday's menu found to duplicate.");
              }
            } catch (e) {
              Alert.alert('Error', 'Could not duplicate. Try again.');
            } finally {
              setDuplicating(false);
            }
          }
        }
      ]
    );
  }

  async function handleClear() {
    Alert.alert(
      'Clear Everything',
      'This will remove all menu items for today. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear', style: 'destructive',
          onPress: async () => {
            setClearing(true);
            try {
              if (role === 'dining') {
                await upsertMenu(String(hallId), today, {
                  dining: {
                    breakfast: { items: [], time: '', note: '' },
                    lunch:     { items: [], time: '', note: '' },
                    dinner:    { items: [], time: '', note: '' },
                  }
                });
              } else {
                await upsertMenu(String(hallId), today, {
                  canteen: { items: [] }
                });
              }
              Alert.alert('✅ Cleared!', 'Menu cleared for today.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (e) {
              Alert.alert('Error', 'Could not clear. Try again.');
            } finally {
              setClearing(false);
            }
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Start New Day</Text>
        <Text style={styles.pageSub}>Hall: {hallId} • Date: {today}</Text>

        {/* Duplicate */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Duplicate Yesterday Menu</Text>
          <Text style={styles.cardDesc}>
            Copy yesterdays menu as a starting point for today.
          </Text>
          <TouchableOpacity
            style={styles.duplicateBtn}
            onPress={handleDuplicate}
            disabled={duplicating}
          >
            {duplicating
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.duplicateBtnText}>Duplicate Yesterday</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Clear */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clear All For Today</Text>
          <Text style={styles.cardDesc}>
            Remove all previous menu items and start with an empty menu.
          </Text>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClear}
            disabled={clearing}
          >
            {clearing
              ? <ActivityIndicator color="#ef4444" />
              : <Text style={styles.clearBtnText}>Clear Everything</Text>
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scroll: { padding: 20, paddingBottom: 40 },
  pageTitle: {
    fontSize: 24, fontWeight: '900',
    color: '#1a1a2e', marginBottom: 4,
  },
  pageSub: { fontSize: 12, color: '#6b7280', marginBottom: 24 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16, padding: 20,
    marginBottom: 16,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 17, fontWeight: '800',
    color: '#1a1a2e', marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13, color: '#6b7280',
    lineHeight: 18, marginBottom: 16,
  },
  duplicateBtn: {
    backgroundColor: '#6e96eb',
    borderRadius: 12, padding: 14,
    alignItems: 'center',
  },
  duplicateBtnText: {
    color: '#fff', fontWeight: '800', fontSize: 15,
  },
  clearBtn: {
    backgroundColor: '#fff',
    borderRadius: 12, padding: 14,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fca5a5',
  },
  clearBtnText: {
    color: '#ef4444', fontWeight: '800', fontSize: 15,
  },
});