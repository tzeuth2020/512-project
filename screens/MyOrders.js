// screens/MyOrders.js
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useCardLayout } from "../utils/layout";

const palette = {
  bg: "#F6F8F7",
  card: "#FFFFFF",
  ink: "#24332F",
  inkSub: "#5B6B66",
  border: "#D5E1DD",
  brand: "#0E7C66",
};

// Helpers to pretty-print the date from YYYY-MM-DD (same idea as IntakeStep3)
function parseLocalYMD(ymd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(ymd))) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function prettyDate(order) {
  const raw = order?.date || "";
  if (!raw) return "—";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(raw))) return String(raw);
  const d = parseLocalYMD(raw);
  if (!d) return String(raw);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function MyOrders({ orders = [], onBack, onNew, onEdit }) {
  const { screenPad, cardStyle } = useCardLayout();

  const hasOrders = orders.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      {/* Header actions */}
      <View
        style={{
          paddingHorizontal: screenPad,
          paddingTop: screenPad,
          paddingBottom: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={onBack}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: palette.border,
            backgroundColor: "#fff",
          }}
        >
          <Text style={{ color: "#2E6B5F", fontWeight: "600" }}>Sign out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNew}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 999,
            backgroundColor: palette.brand,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>New request</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ padding: screenPad, paddingTop: 0 }}>
        <View style={[cardStyle, { padding: 16, backgroundColor: palette.card, borderColor: palette.border, borderWidth: 1 }]}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: palette.ink, marginBottom: 4 }}>
            My orders
          </Text>
          <Text style={{ color: palette.inkSub, marginBottom: 12 }}>
            View and adjust your existing maintenance bookings.
          </Text>

          {!hasOrders && (
            <View
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: "#FAFCFB",
                padding: 12,
                marginTop: 6,
              }}
            >
              <Text style={{ color: palette.inkSub }}>
                You don’t have any orders yet. Tap{" "}
                <Text style={{ fontWeight: "600", color: palette.ink }}>New request</Text> to book
                your first maintenance visit.
              </Text>
            </View>
          )}

          {hasOrders &&
            orders.map((order) => (
              <View
                key={order.id || order.orderNo}
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: palette.border,
                  backgroundColor: "#FAFCFB",
                }}
              >
                {/* Top row: order number + status-ish tag */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: palette.ink, fontWeight: "700" }}>
                    Order {order.orderNo || "—"}
                  </Text>
                  <Text
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      fontSize: 11,
                      color: "#155E4B",
                      backgroundColor: "#E7F3F0",
                      fontWeight: "600",
                    }}
                  >
                    Scheduled
                  </Text>
                </View>

                {/* Area + unit */}
                <Text style={{ color: palette.inkSub, fontSize: 13, marginBottom: 4 }}>
                  {order.areaLabel || "Area"} · {order.unit || "Unit"}
                </Text>

                {/* Time info */}
                <Text style={{ color: palette.ink, fontSize: 14, marginBottom: 4 }}>
                  {prettyDate(order)} · {order.slot || "–"}
                </Text>

                {/* Small meta row */}
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {order.swapOK && (
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: palette.border,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <Text style={{ color: palette.inkSub, fontSize: 11 }}>
                        Swap: {order.swapPref || "Early"}
                      </Text>
                    </View>
                  )}
                  {order.remindOn && (
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: palette.border,
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <Text style={{ color: palette.inkSub, fontSize: 11 }}>
                        30 min reminder ON
                      </Text>
                    </View>
                  )}
                </View>

                {/* Edit button */}
                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
                  <TouchableOpacity
                    onPress={() => onEdit?.(order)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: palette.brand,
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <Text style={{ color: palette.brand, fontWeight: "600" }}>Edit booking</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}
