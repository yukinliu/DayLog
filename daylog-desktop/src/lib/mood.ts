import type { MoodValue } from "../types/daylog";

export const moodOptions: Array<{ value: MoodValue; label: string; emoji: string; tone: string }> = [
  { value: "very-unpleasant", label: "非常不愉快", emoji: "🥀", tone: "earth" },
  { value: "unpleasant", label: "不愉快", emoji: "🌧️", tone: "blue" },
  { value: "slightly-unpleasant", label: "有点不愉快", emoji: "☁️", tone: "moss" },
  { value: "neutral", label: "不悲不喜", emoji: "🌝", tone: "paper" },
  { value: "slightly-pleasant", label: "有点愉快", emoji: "🌤️", tone: "gold" },
  { value: "pleasant", label: "愉快", emoji: "☀️", tone: "clay" },
  { value: "very-pleasant", label: "非常愉快", emoji: "🌻", tone: "sun" }
];

export function moodLabel(value: MoodValue): string {
  return moodOptions.find((item) => item.value === value)?.label ?? "未记录";
}
