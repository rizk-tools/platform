// composables/useColors.ts

export type Color =
  | "indigo"
  | "cyan"
  | "zinc"
  | "purple"
  | "slate"
  | "gray"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "sky"
  | "blue"
  | "violet"
  | "fuchsia"
  | "pink"
  | "rose";

const predefinedColors: Color[] = [
  "indigo",
  "cyan",
  "zinc",
  "purple",
  "yellow",
  "red",
  "lime",
  "pink",
  "emerald",
  "teal",
  "fuchsia",
  "sky",
  "blue",
  "orange",
  "violet",
  "rose",
  "green",
  "amber",
  "slate",
  "gray",
  "neutral",
  "stone",
];

/**
 * Returns a random color from the predefined list.
 *
 * @returns A random Color.
 */
export function getRandomColor(): Color {
  return predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
}

/**
 * Returns an array of colors based on the provided categories. If the number of categories is
 * less than or equal to the number of predefined colors, it returns a slice of the predefined array.
 * Otherwise, it appends random colors until the length matches.
 *
 * @param categories - Array of category names.
 * @returns An array of Color values.
 */
export function getColorsForCategories(categories: string[]): Color[] {
  if (categories.length <= predefinedColors.length) {
    return predefinedColors.slice(0, categories.length);
  }
  // Clone the predefined colors to avoid mutating the original array
  const colors: Color[] = [...predefinedColors];
  while (colors.length < categories.length) {
    colors.push(getRandomColor());
  }
  return colors;
}

export default function useColors() {
  return {
    getRandomColor,
    getColorsForCategories,
  };
}
