// screens/IntakeStep2.js
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useCardLayout } from "../utils/layout";
import { getFixtureByKey } from "../data/fixtures";

// ⚠️ For production: move this to a backend proxy
const GEMINI_API_KEY = "AIzaSyDygltZYNFijegmc7wb6koNPalWGXTjIRE";

const palette = {
  bg: "#F6F8F7",
  card: "#FFFFFF",
  ink: "#24332F",
  inkSub: "#5B6B66",
  border: "#D5E1DD",
  brand: "#0E7C66",
};

/** Condition sets per fixture key */
const CONDITION_SETS = {
  refrigerator: ["Not cooling", "Leaking", "Ice buildup", "Noise", "Other"],
  range: ["Won’t heat", "Uneven heat", "Ignition issue", "Noise", "Other"],
  microwave: ["No power", "Not heating", "Door stuck", "Other"],
  dishwasher: ["Leak", "Won’t drain", "Not cleaning", "Other"],
  disposal: ["Jammed", "Won’t start", "Leaking", "Other"],
  washer: ["Leak", "No spin", "Noise", "Won’t start", "Other"],
  dryer: ["No heat", "Takes too long", "Noise", "Other"],
  ac: ["No cooling", "No heat", "Weak airflow", "Noise", "Other"],
  thermostat: ["No display", "Not responding", "Other"],
  toilet: ["Running", "Clogged", "Leak base", "Other"],
  shower: ["Low pressure", "Temperature issue", "Leak", "Other"],
  faucet: ["Leak", "Handle stuck", "Low pressure", "Other"],
  drain: ["Clogged", "Odor", "Leak", "Other"],
  smoke: ["Chirping", "False alarm", "No power", "Other"],
};

const PART_HINT = {
  washer: "New drain pipe / hose",
  dryer: "Belt or thermal fuse",
  ac: "Check filter & refrigerant",
  thermostat: "Batteries or wiring check",
  refrigerator: "Door gasket / condenser clean",
  dishwasher: "Inlet valve / drain check",
  range: "Element / igniter",
  faucet: "35mm cartridge",
  drain: "S-trap / gasket",
  toilet: "Fill valve / flapper",
  shower: "Cartridge / diverter",
  smoke: "9V battery replacement",
};

const SLOT_OPTS = ["8–10 AM", "10–12 PM", "1–3 PM", "3–5 PM", "5–7 PM", "7–9 PM"];

// AI function to get part suggestions
async function fetchAIPartHint(fixture, conditions, otherText) {
  const conditionsList = conditions.length > 0 ? conditions.join(", ") : "Not specified";
  const additionalInfo = otherText?.trim() || "";
  
  const prompt = `You are a maintenance parts specialist. Based on the following information, suggest what parts might need to be replaced or checked. Provide just the part names no explanaition).

Appliance: ${fixture?.label || "Unknown"} (Model: ${fixture?.model || "Unknown"})
Category: ${fixture?.category || "Unknown"}
Reported issues: ${conditionsList}${additionalInfo ? `. Additional details: ${additionalInfo}` : ""}

Respond with ONLY the parts/components that might need attention, no extra explanation.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "Technician to diagnose on-site";
}

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

export default function IntakeStep2({ draft, onBack, onNext }) {
  const { screenPad, cardStyle } = useCardLayout();

  const areaKey = (draft?.areaKey || "").trim() || "other";
  const areaLabel = draft?.areaLabel || "Area";

  const conditions = useMemo(
    () => CONDITION_SETS[areaKey] ?? ["Other"],
    [areaKey]
  );
  const dateChoices = useMemo(() => next7Dates(), []);

  const [selected, setSelected] = useState(new Set());
  const [otherText, setOtherText] = useState("");
  const [dateSel, setDateSel] = useState(dateChoices[0]?.key);
  const [slotSel, setSlotSel] = useState("");
  const [swapOK, setSwapOK] = useState(false);

  // AI-powered part hint
  const [partHint, setPartHint] = useState(PART_HINT[areaKey] || "Technician to diagnose on-site");
  const [partHintLoading, setPartHintLoading] = useState(false);
  
  // Get fixture details from catalog
  const fixture = useMemo(() => getFixtureByKey(areaKey), [areaKey]);

  // Fetch AI part hint when conditions change
  const fetchPartHint = useCallback(async () => {
    const conditionsArray = Array.from(selected);
    // Only fetch if we have conditions selected
    if (conditionsArray.length === 0 && !otherText.trim()) {
      setPartHint(PART_HINT[areaKey] || "Select conditions to get AI diagnosis");
      return;
    }

    setPartHintLoading(true);
    try {
      const aiHint = await fetchAIPartHint(fixture, conditionsArray, otherText);
      setPartHint(aiHint);
    } catch (error) {
      console.error("AI Part Hint Error:", error);
      setPartHint(PART_HINT[areaKey] || "Technician to diagnose on-site");
    } finally {
      setPartHintLoading(false);
    }
  }, [selected, otherText, fixture, areaKey]);

  // Debounce the AI call - wait 500ms after user stops selecting
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPartHint();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchPartHint]);

  const canContinue = useMemo(() => {
    const hasCondition =
      selected.size > 0 ||
      (conditions.includes("Other") && otherText.trim().length > 0);
    return !!dateSel && !!slotSel && hasCondition;
  }, [selected, otherText, dateSel, slotSel, conditions]);

  const toggle = (label) => {
    const next = new Set(selected);
    if (next.has(label)) next.delete(label);
    else next.add(label);
    setSelected(next);
  };

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
          {/* Header + stepper */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: palette.ink, fontSize: 18, fontWeight: "700" }}>
              Step 2 · Details & schedule
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: i <= 2 ? palette.brand : "#E5E7EB",
                  }}
                />
              ))}
            </View>
          </View>

          {/* Area */}
          <Text style={{ color: palette.inkSub, marginBottom: 6 }}>Area</Text>
          <View
            style={{
              height: 44,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: palette.border,
              paddingHorizontal: 12,
              justifyContent: "center",
              backgroundColor: "#FAFCFB",
              marginBottom: 14,
            }}
          >
            <Text style={{ color: palette.ink, fontWeight: "600" }}>{areaLabel}</Text>
          </View>

          {/* Conditions */}
          <Text style={{ color: palette.inkSub, marginBottom: 6 }}>Current condition</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {conditions.map((c) => {
              const active = selected.has(c);
              if (c === "Other") return null;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => toggle(c)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: active ? palette.brand : palette.border,
                    backgroundColor: active ? "#E7F3F0" : palette.card,
                  }}
                >
                  <Text
                    style={{
                      color: active ? palette.brand : palette.inkSub,
                      fontWeight: "600",
                    }}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Other */}
          {conditions.includes("Other") && (
            <TextInput
              value={otherText}
              onChangeText={setOtherText}
              placeholder="Describe other condition…"
              placeholderTextColor="#8FA6A0"
              style={{
                height: 44,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: palette.border,
                paddingHorizontal: 12,
                backgroundColor: "#FAFCFB",
                marginTop: 10,
                marginBottom: 14,
              }}
            />
          )}

          {/* Date / Time */}
          <Text style={{ color: palette.inkSub, marginBottom: 6 }}>Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
            style={{ marginBottom: 12 }}
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
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: active ? palette.brand : palette.border,
                    backgroundColor: active ? "#E7F3F0" : palette.card,
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

          <Text style={{ color: palette.inkSub, marginBottom: 6 }}>Time slot</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
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
                    backgroundColor: active ? "#E7F3F0" : palette.card,
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

          {/* Swap */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginTop: 8,
              marginBottom: 14,
            }}
          >
            <Switch value={swapOK} onValueChange={setSwapOK} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.ink, fontWeight: "600" }}>
                Swap with others if unavailable
              </Text>
              <Text style={{ color: palette.inkSub, fontSize: 12 }}>
                We may swap your appointment with a nearby tenant to speed up service.
              </Text>
            </View>
          </View>

          {/* AI hint */}
          <View
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: "#FAFCFB",
              padding: 12,
              minHeight: 60,
            }}
          >
            <Text style={{ color: palette.inkSub, fontSize: 12, marginBottom: 4 }}>
              Parts might need (AI-powered diagnostics)
            </Text>
            {partHintLoading ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ActivityIndicator size="small" color={palette.brand} />
                <Text style={{ color: palette.inkSub }}>Analyzing issue...</Text>
              </View>
            ) : (
              <Text style={{ color: palette.ink, fontWeight: "700" }}>{partHint}</Text>
            )}
          </View>

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <TouchableOpacity
              onPress={onBack}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: palette.border,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: palette.card,
              }}
            >
              <Text style={{ color: palette.ink, fontWeight: "600" }}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!canContinue}
              onPress={() =>
                onNext?.({
                  ...draft,
                  conditions: Array.from(selected),
                  otherText,
                  date: dateSel,
                  slot: slotSel,
                  swapOK,
                  partHint,
                })
              }
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: canContinue ? palette.brand : "#BFD6CF",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
