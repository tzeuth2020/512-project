// screens/IntakeStep1.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useCardLayout } from "../utils/layout";
import { FIXTURE_CATALOG, CATEGORIES } from "../data/fixtures";

const palette = {
  bg: "#F6F8F7",
  card: "#FFFFFF",
  ink: "#24332F",
  inkSub: "#5B6B66",
  border: "#D5E1DD",
  brand: "#0E7C66",
};

// 🔁 add onViewOrders here
export default function IntakeStep1({ onNext, onCancel, onViewOrders }) {
  const { screenPad, cardStyle, gridSize } = useCardLayout();

  const unit = "Unit 204A"; // Hardcoded unit
  const [category, setCategory] = useState("");
  const [fixture, setFixture] = useState(null); // {key,label,model}
  const [photos, setPhotos] = useState([]); // [{id, uri}]

  const addPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow photo library access.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
        allowsMultipleSelection: true,
        selectionLimit: 4 - photos.length, // Only allow selecting up to remaining slots
      });
      if (!result.canceled && result.assets?.length > 0) {
        // Add all selected photos (up to max 4 total)
        const newPhotos = result.assets.map((asset, index) => ({
          id: String(Date.now()) + index,
          uri: asset.uri,
        }));
        setPhotos((p) => {
          const combined = [...p, ...newPhotos];
          return combined.slice(0, 4); // Ensure max 4 photos
        });
      }
    } catch (e) {
      console.warn(e);
      Alert.alert("Error", "Unable to add photo.");
    }
  };

  const removeLast = () => setPhotos((p) => p.slice(0, -1));
  const canNext = !!fixture && photos.length >= 2;

  const thumb = gridSize(2, 10); // responsive thumbnail width

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
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: palette.ink, fontSize: 18, fontWeight: "700" }}>
                Step 1 · Evidence first
              </Text>

              {onViewOrders && (
                <TouchableOpacity
                  onPress={onViewOrders}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: palette.border,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <Text
                    style={{
                      color: palette.brand,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    My orders
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: i === 1 ? palette.brand : "#E5E7EB",
                  }}
                />
              ))}
            </View>
          </View>

          {/* Unit (fixed) */}
          <Text style={{ color: palette.inkSub, marginBottom: 6 }}>Unit</Text>
          <View
            style={{
              height: 44,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: palette.border,
              paddingHorizontal: 12,
              backgroundColor: "#FAFCFB",
              marginBottom: 14,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: palette.ink, fontWeight: "600" }}>{unit}</Text>
          </View>

          {/* Category */}
          <Text style={{ color: palette.inkSub, marginBottom: 6 }}>Maintenance area</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setCategory(cat);
                    setFixture(null);
                  }}
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
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Fixture chooser */}
          {!!category && (
            <>
              <Text style={{ color: palette.inkSub, marginTop: 14, marginBottom: 6 }}>
                Select appliance / fixture
              </Text>
              <View style={{ gap: 8 }}>
                {FIXTURE_CATALOG[category].map((f) => {
                  const active = fixture?.key === f.key;
                  return (
                    <TouchableOpacity
                      key={f.key}
                      onPress={() => setFixture(f)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: active ? palette.brand : palette.border,
                        backgroundColor: active ? "#E7F3F0" : palette.card,
                      }}
                    >
                      <Text style={{ color: palette.ink, fontWeight: "700", marginBottom: 2 }}>
                        {f.label}
                      </Text>
                      <Text style={{ color: palette.inkSub, fontSize: 12 }}>{f.model}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Photos */}
          <View style={{ marginTop: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text style={{ color: palette.inkSub }}>Photos (min 2)</Text>
              <Text
                style={{
                  color: photos.length >= 2 ? palette.brand : "#B00020",
                  fontWeight: "700",
                }}
              >
                {photos.length}/2
              </Text>
            </View>

            <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
              {photos.map((p) => (
                <View
                  key={p.id}
                  style={{
                    width: thumb,
                    height: 96,
                    borderRadius: 12,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: palette.border,
                    backgroundColor: "#F0F4F3",
                  }}
                >
                  <Image source={{ uri: p.uri }} style={{ width: "100%", height: "100%" }} />
                </View>
              ))}

              {photos.length < 4 && (
                <TouchableOpacity
                  onPress={addPhoto}
                  style={{
                    width: thumb,
                    height: 96,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderStyle: "dashed",
                    borderColor: palette.border,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: palette.card,
                  }}
                >
                  <Text style={{ color: palette.inkSub }}>+ Add photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {!!photos.length && (
              <TouchableOpacity
                onPress={removeLast}
                style={{ marginTop: 8, alignSelf: "flex-start", padding: 8 }}
              >
                <Text style={{ color: palette.inkSub }}>Remove last photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Actions */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <TouchableOpacity
              onPress={onCancel}
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
              <Text style={{ color: palette.ink, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={!canNext}
              onPress={() =>
                onNext?.({
                  unit,
                  areaLabel: `${category} · ${fixture?.label ?? ""}`,
                  areaKey: fixture?.key,
                  photos: photos.map((x) => x.uri),
                  photosCount: photos.length,
                })
              }
              style={{
                flex: 1,
                height: 48,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: canNext ? palette.brand : "#BFD6CF",
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
