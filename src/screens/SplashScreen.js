import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();
  const [dot, setDot] = useState(0);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDot(d => (d + 1) % 3);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Navigate after 2s
  /* useEffect(() => {
    const timer = setTimeout(async () => {
      try {
       // router.replace('/Onboarding');
        const seen = await AsyncStorage.getItem('onboarding_done');
        if (seen) {
          router.replace('/Home');
        } else {
          router.replace('/Onboarding');
        }
      } catch {
        router.replace('/Onboarding');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []); */
  useEffect(() => {
  const timer = setTimeout(() => {
    router.replace('/Onboarding');
  }, 2000);

  return () => clearTimeout(timer);
}, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>RU</Text>
        </View>

        <Text style={styles.appName}>HallMenu RU</Text>
        <Text style={styles.tagline}>Daily menu • Availability • Feast</Text>

        {/* Dots */}
        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[styles.dot, i <= dot && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <Text style={styles.footer}>Rajshahi University • Hall Dining</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#edeae3',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 80,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBox: {
    width: 90, height: 90,
    borderRadius: 22,
    backgroundColor: '#2d5a3d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#2d5a3d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 32, fontWeight: '800',
    color: '#fff', letterSpacing: 1,
  },
  appName: {
    fontSize: 28, fontWeight: '700',
    color: '#1a1a1a', marginBottom: 8,
  },
  tagline: {
    fontSize: 14, color: '#7a7a6e',
    marginBottom: 36,
  },
  dots: {
    flexDirection: 'row', gap: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#c8c4b4',
  },
  dotActive: {
    backgroundColor: '#2d5a3d',
  },
  footer: {
    fontSize: 13, color: '#7a7a6e',
  },
});