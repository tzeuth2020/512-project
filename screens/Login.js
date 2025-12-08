// screens/Login.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import ResidentLogo from "../components/ResidentLogo";

// Hardcoded user accounts for authentication
const USERS = {
  "admin@resident.com": {
    password: "admin123",
    name: "Admin User",
    unit: "Admin",
  },
  "john@example.com": {
    password: "password123",
    name: "John Smith",
    unit: "Unit 204A",
  },
  "jane@example.com": {
    password: "jane2024",
    name: "Jane Doe",
    unit: "Unit 512B",
  },
  "demo@test.com": {
    password: "demo",
    name: "Demo User",
    unit: "Unit 101",
  },
};

export default function Login({ onSignIn, onNavigate }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const canSignIn = !!email && !!pw;

  const handleSignIn = () => {
    setError(""); // Clear previous errors
    
    const normalizedEmail = email.toLowerCase().trim();
    const user = USERS[normalizedEmail];

    if (!user) {
      setError("Account not found. Please check your email.");
      return;
    }

    if (user.password !== pw) {
      setError("Incorrect password. Please try again.");
      return;
    }

    // Success! Pass user info to parent
    onSignIn?.({ email: normalizedEmail, ...user });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: "padding", android: undefined })}
      style={{ flex: 1, backgroundColor: "#F6F8F7" }}
    >
      <View style={{ flex: 1, padding: 20, alignItems: "center" }}>
        {/* Brand */}
        <ResidentLogo style={{ marginTop: 24, marginBottom: 16 }} />

        {/* Intro */}
        <Text style={{ marginTop: 8, fontSize: 20, fontWeight: "600", color: "#24332F" }}>
          Welcome to Resident Service
        </Text>
        <Text style={{ marginTop: 6, fontSize: 14, color: "#5B6B66", textAlign: "center" }}>
          Sign in to access your property maintenance portal
        </Text>

        {/* Form card */}
        <View
          style={{
            width: "100%",
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 16,
            marginTop: 18,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 2,
          }}
        >
          <Text style={{ fontSize: 14, color: "#33413D", marginBottom: 6 }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="name@domain.com"
            placeholderTextColor="#8FA6A0"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            style={{
              height: 46,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#D5E1DD",
              paddingHorizontal: 12,
              backgroundColor: "#FAFCFB",
              marginBottom: 14,
            }}
          />

          <Text style={{ fontSize: 14, color: "#33413D", marginBottom: 6 }}>Password</Text>
          <TextInput
            value={pw}
            onChangeText={setPw}
            placeholder="Enter your password"
            placeholderTextColor="#8FA6A0"
            secureTextEntry
            autoCapitalize="none"
            style={{
              height: 46,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#D5E1DD",
              paddingHorizontal: 12,
              backgroundColor: "#FAFCFB",
              marginBottom: 18,
            }}
          />

          {/* Error message */}
          {error ? (
            <View
              style={{
                backgroundColor: "#FEE2E2",
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
            >
              <Text style={{ color: "#B91C1C", fontSize: 13 }}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={!canSignIn}
            style={{
              height: 48,
              borderRadius: 10,
              backgroundColor: canSignIn ? "#0E7C66" : "#BFD6CF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Sign in</Text>
          </TouchableOpacity>

          {/* Forgot password link */}
          <TouchableOpacity
            style={{ marginTop: 12, alignSelf: "flex-start" }}
            onPress={() => onNavigate?.("forgot")}
          >
            <Text style={{ color: "#2E6B5F", fontSize: 13, fontWeight: "600" }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
