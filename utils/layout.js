// utils/layout.js
import { useWindowDimensions } from "react-native";

export function useCardLayout() {
  const { width } = useWindowDimensions();

  // compact vs comfy padding
  const screenPad = width < 380 ? 12 : 16;

  // center the main card and cap its max width for readability
  const cardStyle = {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    borderRadius: 16,
  };

  // helper for grid tiles (e.g., photos)
  const gridSize = (cols = 2, gap = 10) => {
    const inner = Math.min(width, 480) - screenPad * 2 - gap * (cols - 1);
    return Math.floor(inner / cols);
  };

  return { screenPad, cardStyle, gridSize };
}
