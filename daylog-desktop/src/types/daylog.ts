export type PageKey = "record" | "details" | "projects" | "stats" | "calendar" | "recommend" | "settings";

export type MoodValue =
  | "very-unpleasant"
  | "unpleasant"
  | "slightly-unpleasant"
  | "neutral"
  | "slightly-pleasant"
  | "pleasant"
  | "very-pleasant";

export type CompletionValue = "excellent" | "progress" | "minimum" | "unplanned";
export type DdlType = "date" | "long-term" | "undecided";
export type ProjectProgress = "active" | "completed" | "paused";
export type ProjectLifecycle = "normal" | "merged" | "deleted";
export const appearanceValues = ["mist-paper", "earth-paper", "quiet-blue", "moss-paper", "lotus-paper", "ink-paper", "gold-paper"] as const;
export type Appearance = typeof appearanceValues[number];
export type ProjectColorScheme = "seasonal";
export const projectColorKeys = [
  "stone-blue",
  "cinnabar",
  "stone-green",
  "orpiment",
  "indigo",
  "ochre",
  "blue-green",
  "purple",
  "olive",
  "rouge",
  "smoke-blue",
  "tea-brown"
] as const;
export type ProjectColorKey = typeof projectColorKeys[number];
export const eventPeriods = ["清晨", "上午", "下午", "晚上"] as const;
export type EventPeriod = typeof eventPeriods[number];

export interface MoodEntry {
  id: string;
  date: string;
  createdAt: string;
  value: MoodValue;
}

export interface ThoughtEntry {
  id: string;
  date: string;
  createdAt: string;
  content: string;
}

export interface EventEntry {
  id: string;
  date: string;
  createdAt: string;
  period: EventPeriod;
  title: string;
  projectId: string | null;
  minutes: number;
  completion: CompletionValue;
  note: string;
}

export interface Project {
  id: string;
  name: string;
  ddlType: DdlType;
  ddlDate?: string;
  progress: ProjectProgress;
  lifecycle: ProjectLifecycle;
  createdAt: string;
  colorKey?: ProjectColorKey;
  mergedIntoId?: string;
  deletedAt?: string;
}

export interface AppSettings {
  schemaVersion: 1;
  vaultPath: string;
  lastOpenedAt: string;
  appearance: Appearance;
  projectColorScheme: ProjectColorScheme;
}

export interface ProjectHistoryEntry {
  id: string;
  projectId: string;
  createdAt: string;
  action: "created" | "updated" | "completed" | "paused" | "restarted" | "merged" | "deleted";
  note: string;
}

export interface DayLogData {
  version: 1;
  settings: AppSettings;
  projects: Project[];
  projectHistory: ProjectHistoryEntry[];
  moods: MoodEntry[];
  thoughts: ThoughtEntry[];
  events: EventEntry[];
}

export interface DailyRecordBundle {
  date: string;
  moods: MoodEntry[];
  thoughts: ThoughtEntry[];
  events: EventEntry[];
}
