import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: null,
    showLogo: true,
    title: 'Welcome to HallMenu RU',
    desc: 'Your simple dining helper for Rajshahi University halls. Check meals and updates anytime from your phone.',
  },
  {
    id: '2',
    icon: '🍽️',
    showLogo: false,
    title: 'See Daily Meals',
    desc: 'View breakfast, lunch, and dinner menu easily. Know what is available before going to the dining hall.',
  },
  {
    id: '3',
    icon: '🔔',
    showLogo: false,
    title: 'Stay Updated',
    desc: 'Get updates about food availability, special feast menus, and important hall dining notices in one place.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const flatRef = useRef(null);

  async function finish() {
    await AsyncStorage.setItem('onboarding_done', 'true');
    router.replace('/Home');
  }

  function goTo(index) {
    flatRef.current?.scrollToIndex({ index, animated: true });
    setCurrent(index);
  }

  function next() {
    if (current < SLIDES.length - 1) {
      goTo(current + 1);
    } else {
      finish();
    }
  }

  function back() {
    if (current > 0) goTo(current - 1);
  }

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      {/* Icon area */}
      <View style={styles.iconArea}>
        {item.showLogo ? (
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>RU</Text>
          </View>
        ) : (
          <Text style={styles.slideIcon}>{item.icon}</Text>
        )}
      </View>

      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDesc}>{item.desc}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip */}
      {current < SLIDES.length - 1 && (
        <TouchableOpacity style={styles.skipBtn} onPress={finish}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        keyExtractor={i => i.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={renderSlide}
        style={{ flex: 1 }}
      />

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, current === i && styles.dotActive]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        {current > 0 ? (
          <TouchableOpacity style={styles.backBtn} onPress={back}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <TouchableOpacity style={styles.nextBtn} onPress={next}>
          <Text style={styles.nextBtnText}>
            {current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Rajshahi University • Hall Dining</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef0f7',
    paddingBottom: 32,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  skipText: {
    fontSize: 14, color: '#8a8fa8', fontWeight: '600',
  },

  slide: {
    width,
    paddingHorizontal: 32,
    paddingTop: 20,
    alignItems: 'flex-start',
  },
  iconArea: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoBox: {
    width: 72, height: 72,
    borderRadius: 18,
    backgroundColor: '#7b8fd4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7b8fd4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: {
    fontSize: 26, fontWeight: '800', color: '#fff',
  },
  slideIcon: {
    fontSize: 56,
  },
  slideTitle: {
    fontSize: 28, fontWeight: '700',
    color: '#1a1a2e', marginBottom: 16,
    lineHeight: 36,
  },
  slideDesc: {
    fontSize: 15, color: '#5a6080',
    lineHeight: 24,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 24,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#c5c9e0',
  },
  dotActive: {
    backgroundColor: '#7b8fd4',
    width: 20,
  },

  btnRow: {
    flexDirection: 'row',
    paddingHorizontal: 32,
    gap: 12,
    marginBottom: 16,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#e0e4f0',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 15, fontWeight: '700', color: '#5a6080',
  },
  nextBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#6e96eb',
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 15, fontWeight: '700', color: '#fff',
  },

  footer: {
    textAlign: 'center',
    fontSize: 12, color: '#8a8fa8',
  },
});