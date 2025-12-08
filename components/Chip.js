import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { colors, radius } from "../styles/tokens";

export default function Chip({ label, selected, onPress, size="md" }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        size==="sm" && styles.sm,
        selected ? styles.on : styles.off
      ]}>
      <Text style={[styles.text, selected && {color: colors.chipOn}]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base:{
    borderWidth:1, borderColor: colors.chipBD,
    backgroundColor: colors.chipBG,
    paddingVertical:10, paddingHorizontal:14,
    borderRadius: radius.md
  },
  sm:{ paddingVertical:8, paddingHorizontal:12 },
  on:{ backgroundColor: colors.chipOnBG, borderColor: colors.chipOn },
  off:{},
  text:{ color: colors.textSec, fontSize:14 }
});
