/**
 * Single source of truth for all class names used across the system.
 * Import this in every model, controller, or utility that needs a class list.
 */

export const CLASS_LIST = [
  "Pre-Nursery",
  "Nursery",
  "LKG",
  "UKG",
  "1", "2", "3", "4", "5",
  "6", "7", "8", "9", "10",
];

/** Human-readable label — use in frontend dropdowns */
export const CLASS_LABELS = CLASS_LIST.map((c) =>
  ["Pre-Nursery", "Nursery", "LKG", "UKG"].includes(c) ? c : `Class ${c}`
);

/** Map: "Class 5" → "5", "Nursery" → "Nursery" */
export const labelToValue = (label) => {
  if (label.startsWith("Class ")) return label.replace("Class ", "");
  return label;
};

/** Map: "5" → "Class 5", "Nursery" → "Nursery" */
export const valueToLabel = (value) => {
  if (["Pre-Nursery", "Nursery", "LKG", "UKG"].includes(value)) return value;
  return `Class ${value}`;
};