// screens/EditOrder.js
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useCardLayout } from "../utils/layout";

const palette = {
  bg: "#F6F8F7",
  card: "#FFFFFF",
  ink: "#24332F",
  inkSub: "#5B6B66",
  border: "#D5E1DD",
  brand: "#0E7C66",
};

const SLOT_OPTS = ["8–10 AM", "10–12 PM", "1–3 PM", "3–5 PM", "5–7 PM", "7–9 PM"];

function next7Dates() {
  const out = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    out.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    });
  }
  return out;
}

export default function EditOrder({ order, onBack, onSave, onCancelOrder }) {
  const { screenPad, cardStyle } = useCardLayout();

  const dateChoices = useMemo(() => {
    const base = next7Dates();
    if (order?.date && !base.some((d) => d.key === order.date)) {
      // ensure existing date is still selectable
      base.unshift({
        key: order.date,
        label: new Date(order.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      });
    }
    return base;
  }, [order]);

  const [dateSel, setDateSel] = useState(order?.date || dateChoices[0]?.key);
  const [slotSel, setSlotSel] = useState(order?.slot || SLOT_OPTS[1]);
  const [swapOK, setSwapOK] = useState(!!order?.swapOK);
  const [swapPref, setSwapPref] = useState(order?.swapPref || "Early");
  const [remindOn, setRemindOn] = useState(
    order?.remindOn === undefined ? true : !!order.remindOn
  );

  const canSave = !!dateSel && !!slotSel;

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <ScrollView contentContainerStyle={{ padding: screenPad }}>
        <View
          style={[
            cardStyle,
            {
              backgroundColor: palette.card,
              padding: 16,
              borderColor: palette.border,
              borderWidth: 1,
            },
          ]}
        >
          {/* Header */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: palette.ink, fontSize: 18, fontWeight: "700" }}>
              Edit booking
            </Text>
            <Text style={{ color: palette.inkSub, marginTop: 4 }}>
              Adjust time, swap preference, or cancel this order.
            </Text>
          </View>

          {/* Read-only summary */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: palette.border,
              padding: 12,
              backgroundColor: "#FAFCFB",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontWeight: "700", color: palette.ink, marginBottom: 2 }}>
              Order {order?.orderNo || "—"}
            </Text>
            <Text style={{ color: palette.inkSub, fontSize: 13, marginBottom: 2 }}>
              {order?.areaLabel || "Area"} · {order?.unit || "Unit"}
            </Text>
          </View>

          {/* Date selector */}
          <Text style={{ color: palette.inkSub, marginBottom: 6 }}>Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: "row", gap: 8, marginBottom: 16 }}
          >
            {dateChoices.map((d) => {
              const active = dateSel === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  onPress={() => setDateSel(d.key)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? palette.brand : palette.border,
                    backgroundColor: active ? "#E7F3F0" : "#FAFCFB",
                  }}
                >
                  <Text
                    style={{
                      color: active ? palette.brand : palette.inkSub,
                      fontWeight: "600",
                    }}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Time slot */}
          <Text style={{ color: palette.inkSub, marginBottom: 6 }}>Time slot</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {SLOT_OPTS.map((s) => {
              const active = slotSel === s;
              return (
                <TouchableOpacity
                  key={s}
                  onPress={() => setSlotSel(s)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: active ? palette.brand : palette.border,
                    backgroundColor: active ? "#E7F3F0" : "#FAFCFB",
                  }}
                >
                  <Text
                    style={{
                      color: active ? palette.brand : palette.inkSub,
                      fontWeight: "600",
                    }}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Swap preference */}
          <Text style={{ color: palette.inkSub, marginBottom: 6 }}>Swap preference</Text>
          <View
            style={{
              height: 44,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: palette.border,
              paddingHorizontal: 12,
              backgroundColor: "#FAFCFB",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Switch value={swapOK} onValueChange={setSwapOK} />
              <Text style={{ color: palette.inkSub }}>Allow swaps with neighbors</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            {["Early", "Late"].map((val) => {
              const active = swapOK && swapPref === val;
              return (
                <TouchableOpacity
                  key={val}
                  disabled={!swapOK}
                  onPress={() => swapOK && setSwapPref(val)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? palette.brand : palette.border,
                    backgroundColor: active ? "#E7F3F0" : "#FAFCFB",
                    alignItems: "center",
                    opacity: swapOK ? 1 : 0.5,
                  }}
                >
                  <Text
                    style={{
                      color: active ? palette.brand : palette.inkSub,
                      fontWeight: "600",
                    }}
                  >
                    {val} window
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Reminder */}
          <Text style={{ color: palette.inkSub, marginBottom: 6 }}>30 mins reminder</Text>
          <View
            style={{
              height: 44,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: palette.border,
              paddingHorizontal: 12,
              backgroundColor: "#FAFCFB",
              alignItems: "flex-end",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <Switch value={remindOn} onValueChange={setRemindOn} />
          </View>

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <TouchableOpacity
              onPress={onBack}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: "#FFFFFF",
              }}
            >
              <Text style={{ color: palette.ink, fontWeight: "600" }}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!canSave}
              onPress={() => {
                if (!canSave) return;
                const updated = {
                  ...order,
                  date: dateSel,
                  slot: slotSel,
                  swapOK,
                  swapPref,
                  remindOn,
                };
                onSave?.(updated);
                Alert.alert("Updated", "Your booking has been updated.");
              }}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: canSave ? palette.brand : "#BFD6CF",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Save changes</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Cancel booking",
                "Are you sure you want to cancel this booking?",
                [
                  { text: "Keep booking", style: "cancel" },
                  {
                    text: "Cancel booking",
                    style: "destructive",
                    onPress: () => onCancelOrder?.(order?.id),
                  },
                ]
              );
            }}
            style={{
              height: 44,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#E58B8B",
              backgroundColor: "#FDECEC",
              marginTop: 4,
            }}
          >
            <Text style={{ color: "#B3261E", fontWeight: "600" }}>Cancel this order</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
