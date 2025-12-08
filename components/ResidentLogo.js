// components/ResidentLogo.js
import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function ResidentLogo({ style }) {
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", gap: 14 }, style]}>
      {/* Left: gradient tile with home icon + two lines */}
      <LinearGradient
        colors={["#0E7C66", "#0B5B4C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 180,
          height: 180,
          borderRadius: 24,
          padding: 18,
          justifyContent: "space-between",
        }}
      >
        <Ionicons name="home" size={36} color="#fff" />
        <View>
          <Text style={{ color: "#fff", fontSize: 22, fontWeight: "600" }}>
            Resident Portal
          </Text>
          <Text style={{ color: "#E9F7F2", fontSize: 16, marginTop: 2 }}>
            Property Services
          </Text>
        </View>
      </LinearGradient>

      {/* Right: wordmark */}
      <Text
        accessibilityRole="header"
        style={{
          fontSize: 44,
          fontWeight: "800",
          color: "#2E6B5F",
          letterSpacing: 1,
        }}
      >
        AptFix
      </Text>
    </View>
  );
}
