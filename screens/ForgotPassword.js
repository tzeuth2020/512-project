// screens/ForgotPassword.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { makeResetTicket } from "../utils/reset"; 

export default function ForgotPassword({ onBack, onDone }) {
  const [unit, setUnit] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneLast4, setPhoneLast4] = useState("");
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    try {
      const t = makeResetTicket({ unit, lastName, phoneLast4 });
      setTicket(t);
    } catch (e) {
      setTicket(null);
      setError(e.message || "Unable to create temporary password.");
    }
  };

  const CopyTemp = () => {
    if (!ticket) return null;
    return (
      <View
        style={{
          marginTop: 12,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#D5E1DD",
          backgroundColor: "#FAFCFB",
          padding: 12,
        }}
      >
        <Text style={{ color: "#33413D", fontSize: 14, marginBottom: 6 }}>
          Temporary password
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0E7C66" }}>
            {ticket.code}
          </Text>

        </View>
        <Text style={{ color: "#5B6B66", fontSize: 12, marginTop: 8 }}>
          This temporary password will expire in {Math.max(1, Math.ceil((ticket.expiresAt - Date.now())/60000))} minutes.
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F8F7", padding: 20 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <TouchableOpacity
          onPress={onBack}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#D5E1DD",
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ color: "#2E6B5F", fontWeight: "600" }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ marginLeft: 12, fontSize: 18, fontWeight: "700", color: "#24332F" }}>
          Reset your password
        </Text>
      </View>

      {/* Card */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 16,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        {!ticket ? (
          <>
            <Text style={{ color: "#5B6B66", marginBottom: 12 }}>
              Enter the details we have on file to receive a temporary password.
            </Text>

            <Text style={{ fontSize: 14, color: "#33413D", marginBottom: 6 }}>Unit</Text>
            <TextInput
              value={unit}
              onChangeText={setUnit}
              placeholder="e.g., 204A"
              placeholderTextColor="#8FA6A0"
              autoCapitalize="characters"
              style={{
                height: 46, borderRadius: 10, borderWidth: 1, borderColor: "#D5E1DD",
                paddingHorizontal: 12, backgroundColor: "#FAFCFB", marginBottom: 12,
              }}
            />

            <Text style={{ fontSize: 14, color: "#33413D", marginBottom: 6 }}>Last name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="e.g.,Chen"
              placeholderTextColor="#8FA6A0"
              autoCapitalize="words"
              style={{
                height: 46, borderRadius: 10, borderWidth: 1, borderColor: "#D5E1DD",
                paddingHorizontal: 12, backgroundColor: "#FAFCFB", marginBottom: 12,
              }}
            />

            <Text style={{ fontSize: 14, color: "#33413D", marginBottom: 6 }}>Phone (last 4)</Text>
            <TextInput
              value={phoneLast4}
              onChangeText={(t) => setPhoneLast4(t.replace(/[^0-9]/g, "").slice(0, 4))}
              placeholder="5308"
              placeholderTextColor="#8FA6A0"
              keyboardType="number-pad"
              style={{
                height: 46, borderRadius: 10, borderWidth: 1, borderColor: "#D5E1DD",
                paddingHorizontal: 12, backgroundColor: "#FAFCFB", marginBottom: 14,
              }}
            />

            {!!error && (
              <Text style={{ color: "#B00020", marginBottom: 8 }}>{error}</Text>
            )}

            <TouchableOpacity
              onPress={submit}
              disabled={!unit || !lastName || phoneLast4.length !== 4}
              style={{
                height: 48, borderRadius: 10,
                backgroundColor: !unit || !lastName || phoneLast4.length !== 4 ? "#BFD6CF" : "#0E7C66",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                Get temporary password
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={{ color: "#24332F", fontSize: 16, fontWeight: "600" }}>
              Temporary password created
            </Text>
            <Text style={{ color: "#5B6B66", marginTop: 6 }}>
              Use this temporary password to sign in. You can change your password later in settings.
            </Text>

            <CopyTemp />



            <TouchableOpacity
              onPress={onBack}
              style={{
                height: 46, borderRadius: 10, marginTop: 10,
                borderWidth: 1, borderColor: "#D5E1DD",
                alignItems: "center", justifyContent: "center",
                backgroundColor: "#fff",
              }}
            >
              <Text style={{ color: "#2E6B5F", fontWeight: "600" }}>Back to sign in</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
