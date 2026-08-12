import { projectColorKeys, type Appearance, type Project, type ProjectColorKey, type ProjectColorScheme } from "../types/daylog";

export const defaultAppearance: Appearance = "mist-paper";
export const defaultProjectColorScheme: ProjectColorScheme = "seasonal";

export const appearanceOptions: Array<{
  value: Appearance;
  label: string;
  accent: string;
}> = [
  { value: "mist-paper", label: "石青", accent: "#4F727A" },
  { value: "moss-paper", label: "石绿", accent: "#5F7865" },
  { value: "earth-paper", label: "赭石", accent: "#94604C" },
  { value: "ink-paper", label: "朱砂", accent: "#9A574E" },
  { value: "quiet-blue", label: "绀青", accent: "#5D687F" },
  { value: "lotus-paper", label: "紫棠", accent: "#79677B" },
  { value: "gold-paper", label: "黄丹", accent: "#A8783C" }
];

export const projectColorOptions: ReadonlyArray<{ key: ProjectColorKey; label: string; color: string }> = [
  { key: "stone-blue", label: "石青", color: "#527984" },
  { key: "cinnabar", label: "朱砂", color: "#9B6254" },
  { key: "stone-green", label: "石绿", color: "#667D61" },
  { key: "orpiment", label: "黄丹", color: "#AA844B" },
  { key: "indigo", label: "绀青", color: "#5D6882" },
  { key: "ochre", label: "赭石", color: "#88664F" },
  { key: "blue-green", label: "青黛", color: "#4D7C70" },
  { key: "purple", label: "紫棠", color: "#7C6A80" },
  { key: "olive", label: "秋香", color: "#858155" },
  { key: "rouge", label: "胭脂", color: "#986875" },
  { key: "smoke-blue", label: "烟蓝", color: "#72889A" },
  { key: "tea-brown", label: "茶褐", color: "#75645B" }
];

const projectColorMap = new Map(projectColorOptions.map((item) => [item.key, item.color]));

function hashText(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function stableProjectColor(
  seed: string | null | undefined,
  _createdAt?: string,
  colorKey?: ProjectColorKey,
  _scheme: ProjectColorScheme = defaultProjectColorScheme
): string {
  if (!seed) return "#9aa09a";
  if (colorKey) return projectColorMap.get(colorKey) ?? "#9aa09a";
  return projectColorOptions[hashText(seed) % projectColorOptions.length].color;
}

function isUnfinished(project: Project) {
  return project.lifecycle === "normal" && project.progress !== "completed";
}

export function nextProjectColorKey(projects: Project[]): ProjectColorKey {
  const everUsed = new Set(projects.map((project) => project.colorKey).filter(Boolean));
  const occupied = new Set(projects.filter(isUnfinished).map((project) => project.colorKey).filter(Boolean));
  const neverUsed = projectColorKeys.find((key) => !everUsed.has(key));
  if (neverUsed) return neverUsed;
  const released = projectColorKeys.find((key) => !occupied.has(key));
  if (released) return released;
  const usage = new Map(projectColorKeys.map((key) => [key, 0]));
  projects.filter(isUnfinished).forEach((project) => {
    if (project.colorKey) usage.set(project.colorKey, (usage.get(project.colorKey) ?? 0) + 1);
  });
  return [...usage.entries()].sort((a, b) => a[1] - b[1])[0][0];
}

export function assignMissingProjectColors(projects: Project[]): Project[] {
  const sorted = [...projects].sort((a, b) => {
    const unfinishedDiff = Number(isUnfinished(b)) - Number(isUnfinished(a));
    return unfinishedDiff || a.createdAt.localeCompare(b.createdAt);
  });
  let assigned = [...projects];
  sorted.forEach((project) => {
    if (project.colorKey) return;
    const colorKey = nextProjectColorKey(assigned.filter((item) => item.id !== project.id));
    assigned = assigned.map((item) => item.id === project.id ? { ...item, colorKey } : item);
  });
  return projects.map((project) => assigned.find((item) => item.id === project.id) ?? project);
}
