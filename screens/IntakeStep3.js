// screens/IntakeStep3.js
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FIXTURE_CATALOG, getFixtureByKey } from "../data/fixtures";

// ⚠️ For production: move this to a backend proxy, don't expose in client code
const GEMINI_API_KEY = "AIzaSyDygltZYNFijegmc7wb6koNPalWGXTjIRE";

async function fetchAISummary(draft) {
  // Look up the fixture details from the catalog
  const fixture = getFixtureByKey(draft?.areaKey);
  
  // Build a string representation of the full catalog for context
  const catalogContext = Object.entries(FIXTURE_CATALOG)
    .map(([category, items]) => 
      `${category}: ${items.map(f => `${f.label} (${f.model})`).join(", ")}`
    )
    .join("\n");

  // Build issue description from conditions and otherText
  const conditionsList = draft?.conditions?.length 
    ? draft.conditions.join(", ") 
    : "Not specified";
  const additionalNotes = draft?.otherText?.trim() || "";
  const issueDescription = additionalNotes 
    ? `${conditionsList}. Additional details: ${additionalNotes}`
    : conditionsList;

  const prompt = `You are a helpful maintenance assistant for apartment residents.

A tenant has reported an issue with their ${fixture?.label || "appliance"} (Model: ${fixture?.model || "unknown"}) in the ${fixture?.category || "unknown"} area.

Reported conditions: ${issueDescription}
Unit: ${draft?.unit || "unknown"}
Suggested parts: ${draft?.partHint || "To be diagnosed"}

Based on this ${fixture?.model} model and the reported conditions, provide 2-3 brief, safe troubleshooting tips the tenant can try before the maintenance technician arrives. 

Keep responses friendly and concise. If the issue involves gas, electricity, or water leaks, emphasize safety first and recommend waiting for professional help. ONLY RESPOND WITH THE STEPS NOTHING ELSE (RESPONSE AS A NUMBERED LIST)`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API Error:", response.status, errorText); // Full error in console only
    throw new Error("Unable to get tips right now. Please try again later.");
  }

  const data = await response.json();
  // Extract the text from Gemini's response structure
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

const palette = {
  bg: "#F6F8F7",
  card: "#FFFFFF",
  ink: "#24332F",
  inkSub: "#5B6B66",
  border: "#D5E1DD",
  brand: "#0E7C66",
};

const cardWidth = () => Math.min(Dimensions.get("window").width - 32, 420);

// Parse YYYY-MM-DD as a *local* date (avoid UTC shift)
function parseLocalYMD(ymd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(ymd))) return null;
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d); // local midnight
}

// Build a human label from any of: dateLabel, dateKey, date
function makePrettyDate(draft) {
  const raw = draft?.dateLabel || draft?.date || draft?.dateKey || "";
  if (!raw) return "—";
  // If already a human label (e.g., "Nov 26"), just return it
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(raw))) return String(raw);
  // Otherwise format local YYYY-MM-DD
  const local = parseLocalYMD(raw);
  if (!local) return String(raw);
  return local.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Field({ label, children }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: palette.inkSub, marginBottom: 6 }}>{label}</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>{children}</View>
    </View>
  );
}

function Tag({ children }) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: "#FAFCFB",
      }}
    >
      <Text style={{ color: palette.ink }}>{children}</Text>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: palette.border, marginVertical: 12 }} />;
}

function SwapButton({ active, disabled, onPress, label }) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={{
        flex: 1,
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: active ? palette.brand : palette.border,
        backgroundColor: active ? "#E7F3F0" : "#FAFCFB",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ color: active ? palette.brand : palette.ink, fontWeight: "600" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function IntakeConfirm({ draft, onBack, onFinish }) {
  const width = cardWidth();
  const prettyDate = useMemo(() => makePrettyDate(draft), [draft]);
  const slot = draft?.slot || "—";
  const areaLabel = draft?.areaLabel || "Area";

  const swapEnabled = !!draft?.swapOK;
  const [swapPref, setSwapPref] = useState(draft?.swapPref || "Early");
  const [remindOn, setRemindOn] = useState(true);

  // AI Summary state
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setAiLoading(true);
      setAiError(null);
      try {
        const summary = await fetchAISummary(draft);
        if (!cancelled) setAiSummary(summary);
      } catch (err) {
        if (!cancelled) setAiError(err.message);
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    }

    loadSummary();
    return () => { cancelled = true; };
  }, [draft]);

  // simple demo order number
  const orderNo = useMemo(() => {
    const base =
      Math.abs((draft?.areaKey || "x").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) +
      (Date.now() % 100000);
    return String(50000 + (base % 50000)) + " " + String(100000 + (base % 900000)).slice(0, 6);
  }, [draft]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg, alignItems: "center" }}>
      <ScrollView contentContainerStyle={{ padding: 16, width: "100%", alignItems: "center" }}>
        <View
          style={{
            width,
            backgroundColor: palette.card,
            borderRadius: 16,
            padding: 16,
            borderColor: palette.border,
            borderWidth: 1,
          }}
        >
          {/* Header + stepper */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: palette.ink, fontSize: 18, fontWeight: "700" }}>Step 3 · Confirm</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={{ flex: 1, height: 8, borderRadius: 999, backgroundColor: palette.brand }} />
              ))}
            </View>
          </View>

          <Text style={{ color: palette.ink, fontWeight: "700", marginBottom: 8 }}>Order confirmed!</Text>

          <Field label="Time">
            <Tag>{prettyDate}</Tag>
            <Tag>{slot}</Tag>
          </Field>

          <Divider />

          <Field label="Area">
            <Tag>{areaLabel}</Tag>
          </Field>

          <Divider />

          {/* AI Summary Section */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: palette.inkSub, marginBottom: 6 }}>💡 Tips while you wait</Text>
            <View
              style={{
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: "#FAFCFB",
                minHeight: 60,
              }}
            >
              {aiLoading && (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator size="small" color={palette.brand} />
                  <Text style={{ color: palette.inkSub }}>Getting tips...</Text>
                </View>
              )}
              {aiError && (
                <Text style={{ color: "#B00020" }}>Unable to load tips: {aiError}</Text>
              )}
              {aiSummary && !aiLoading && (
                <Text style={{ color: palette.ink, lineHeight: 20 }}>{aiSummary}</Text>
              )}
            </View>
          </View>

          <Divider />

          <Field label="Order Number">
            <View
              style={{
                height: 44,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: palette.border,
                paddingHorizontal: 12,
                justifyContent: "center",
                backgroundColor: "#FAFCFB",
              }}
            >
              <Text style={{ color: palette.ink }}>{orderNo}</Text>
            </View>
          </Field>

          <Divider />
          
          <Text style={{ color: palette.inkSub, marginBottom: 6 }}>Time swap</Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
            <SwapButton
              active={swapEnabled && swapPref === "Early"}
              disabled={!swapEnabled}
              onPress={() => swapEnabled && setSwapPref("Early")}
              label="Early"
            />
            <SwapButton
              active={swapEnabled && swapPref === "Late"}
              disabled={!swapEnabled}
              onPress={() => swapEnabled && setSwapPref("Late")}
              label="Late"
            />
          
          </View>
          {!swapEnabled && (
            <Text style={{ color: palette.inkSub, fontSize: 12, marginTop: -6, marginBottom: 10 }}>
              You didn’t enable swapping in the previous step.
            </Text>
          )}

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
              marginBottom: 16,
            }}
          >
            <Switch value={remindOn} onValueChange={setRemindOn} />
          </View>

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 10 }}>
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
              onPress={() => {
                Alert.alert("Submitted", "Your request has been submitted.");
                onFinish?.({ ...draft, swapPref, remindOn, orderNo });
              }}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: palette.brand,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Finish</Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: palette.inkSub, fontSize: 12, marginTop: 12, textAlign: "center" }}>
            Save a screenshot for your records. You can show this page to maintenance staff.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
