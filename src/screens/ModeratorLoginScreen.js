import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { getModeratorData } from "../data/repository";
import { HALLS } from "../data/halls";

export default function ModeratorLoginScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams();

  const [selectedHall, setSelectedHall] = useState(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const roleLabel = role === "dining" ? "Dining" : "Canteen";

  // Show first 6 halls as quick select
  const quickHalls = HALLS.slice(0, 6);

  async function handleLogin() {
    if (!phone || !password) {
      Alert.alert("Error", "Please enter phone/email and password.");
      return;
    }
    setLoading(true);
    try {
      const email = phone.includes("@") ? phone : `${phone}@rudining.com`;
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const modData = await getModeratorData(cred.user.uid);

      if (!modData) {
        Alert.alert("Error", "Moderator account not found.");
        setLoading(false);
        return;
      }

      if (modData.role !== role) {
        Alert.alert("Error", `This account is not a ${roleLabel} moderator.`);
        setLoading(false);
        return;
      }

      router.replace({
        pathname: "/ModeratorDashboard",
        params: {
          hallId: modData.hallId,
          hallName: modData.hallName,
          role: modData.role,
          moderatorName: modData.name || "",
        },
      });
    } catch (e) {
      Alert.alert("Login Failed", "Invalid credentials. Try again.");
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{roleLabel} Moderator Login</Text>
        <Text style={styles.roleBadge}>
          Role locked: {roleLabel.toUpperCase()}
        </Text>

        {/* Hall quick select */}
        <Text style={styles.label}>Select Hall</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.hallScroll}
        >
          {quickHalls.map((h) => {
            const initials = h.name
              .split(" ")
              .filter((w) => w.length > 2)
              .slice(0, 2)
              .map((w) => w[0].toUpperCase())
              .join("");
            return (
              <TouchableOpacity
                key={h.id}
                style={[
                  styles.hallChip,
                  selectedHall === h.id && styles.hallChipActive,
                ]}
                onPress={() => setSelectedHall(h.id)}
              >
                <Text
                  style={[
                    styles.hallChipText,
                    selectedHall === h.id && styles.hallChipTextActive,
                  ]}
                >
                  {initials || h.name.slice(0, 2).toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Phone */}
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          placeholder="017xxxxxxxx"
          placeholderTextColor="#9ca3af"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          autoCapitalize="none"
        />

        {/* Password */}
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Login btn */}
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginBtnText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  scroll: { padding: 24, paddingBottom: 40 },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1a1a2e",
    marginBottom: 6,
  },
  roleBadge: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 28,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },

  // Hall chips
  hallScroll: { marginBottom: 20 },
  hallChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  hallChipActive: {
    backgroundColor: "#eef2ff",
    borderColor: "#6e96eb",
  },
  hallChipText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6b7280",
  },
  hallChipTextActive: { color: "#6e96eb" },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#1a1a2e",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },

  loginBtn: {
    backgroundColor: "#6e96eb",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  backText: {
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
});
