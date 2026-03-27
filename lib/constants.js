// lib/constants.js

export const DIVISIONS = [
  { name: "Deity", rankRange: "1800+", color: "#F5A623", icon: "👑", min: 1800, max: 9999 },
  { name: "Immortal", rankRange: "1600–1799", color: "#9B59B6", icon: "⚔️", min: 1600, max: 1799 },
  { name: "Emperor", rankRange: "1400–1599", color: "#3498DB", icon: "🛡️", min: 1400, max: 1599 },
  { name: "King", rankRange: "1200–1399", color: "#2ECC71", icon: "🏰", min: 1200, max: 1399 },
  { name: "Prince", rankRange: "< 1200", color: "#95A5A6", icon: "📜", min: 0, max: 1199 },
];

export const DEFAULT_RATING = 1500;

export const MAP_POOL = ["Pangaea", "Continents", "Fractal", "Archipelago"];

export function getDivisionInfo(name) {
  return DIVISIONS.find((d) => d.name === name) || DIVISIONS[4];
}

export function getDivisionForRating(rating) {
  return DIVISIONS.find((d) => rating >= d.min && rating <= d.max) || DIVISIONS[4];
}