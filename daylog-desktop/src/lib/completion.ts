import type { CompletionValue } from "../types/daylog";

export const completionOptions: Array<{ value: CompletionValue; label: string; emoji: string }> = [
  { value: "excellent", label: "圆满完成", emoji: "🎉" },
  { value: "progress", label: "有所推进", emoji: "🌱" },
  { value: "minimum", label: "保底完成", emoji: "🤲" },
  { value: "unplanned", label: "计划外", emoji: "✨" }
];

export function completionLabel(value: CompletionValue): string {
  const option = completionOptions.find((item) => item.value === value);
  return option ? `${option.emoji} ${option.label}` : "未填写";
}
