import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { colors, radius } from "../styles/tokens";

export default function AptButton({ title, onPress, kind="primary", disabled }) {
  const s = [styles.base];
  if (kind === "primary") s.push(styles.primary);
  if (kind === "secondary") s.push(styles.secondary);
  if (disabled) s.push(styles.disabled);
  return (
    <Pressable style={s} onPress={onPress} disabled={disabled}>
      <Text style={[styles.txt, (kind!=="secondary") && {color:"#fff"}]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base:{ paddingVertical:14, borderRadius: radius.md, alignItems:"center", justifyContent:"center" },
  txt:{ fontWeight:"600", color: colors.text },
  primary:{ backgroundColor: colors.green },
  secondary:{ backgroundColor:"#fff", borderWidth:1, borderColor: colors.line },
  disabled:{ backgroundColor:"#D1D5DB" }
});
