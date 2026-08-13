import type { DailyRecordBundle, DayLogData, EventEntry, MoodEntry, ThoughtEntry } from "../types/daylog";
import { buildDailyMarkdown } from "./markdown";

export const dataFileNames = {
  settings: "app-settings.json",
  projects: "projects.json",
  projectHistory: "project-history.json",
  moods: "moods.json",
  thoughts: "thoughts.json",
  events: "events.json"
} as const;

export function createEmptyDayLogData(vaultPath: string, nowIso: string): DayLogData {
  return {
    version: 1,
    settings: {
      schemaVersion: 1,
      projectStatusModel: 2,
      vaultPath,
      lastOpenedAt: nowIso,
      appearance: "mist-paper",
      projectColorScheme: "seasonal"
    },
    projects: [],
    projectHistory: [],
    moods: [],
    thoughts: [],
    events: []
  };
}

export function groupRecordsByDate(data: DayLogData): DailyRecordBundle[] {
  const dateSet = new Set<string>();
  data.moods.forEach((entry) => dateSet.add(entry.date));
  data.thoughts.forEach((entry) => dateSet.add(entry.date));
  data.events.forEach((entry) => dateSet.add(entry.date));

  return [...dateSet].sort().map((date) => ({
    date,
    moods: data.moods.filter((entry) => entry.date === date),
    thoughts: data.thoughts.filter((entry) => entry.date === date),
    events: data.events.filter((entry) => entry.date === date)
  }));
}

export function buildMarkdownPlan(data: DayLogData): Array<{ date: string; relativePath: string; content: string }> {
  return groupRecordsByDate(data).map((bundle) => {
    const [year, month] = bundle.date.split("-");
    return {
      date: bundle.date,
      relativePath: `days/${year}/${month}/${bundle.date}.md`,
      content: buildDailyMarkdown({
        date: bundle.date,
        moods: bundle.moods,
        thoughts: bundle.thoughts,
        events: bundle.events,
        projects: data.projects
      })
    };
  });
}

export function buildMarkdownPlanForDates(
  data: DayLogData,
  dates: string[]
): {
  files: Array<{ date: string; relativePath: string; content: string }>;
  deleteRelativePaths: string[];
} {
  const uniqueDates = [...new Set(dates)].filter(Boolean).sort();
  const files: Array<{ date: string; relativePath: string; content: string }> = [];
  const deleteRelativePaths: string[] = [];

  uniqueDates.forEach((date) => {
    const [year, month] = date.split("-");
    const relativePath = `days/${year}/${month}/${date}.md`;
    const moods = data.moods.filter((entry) => entry.date === date);
    const thoughts = data.thoughts.filter((entry) => entry.date === date);
    const events = data.events.filter((entry) => entry.date === date);

    if (!moods.length && !thoughts.length && !events.length) {
      deleteRelativePaths.push(relativePath);
      return;
    }

    files.push({
      date,
      relativePath,
      content: buildDailyMarkdown({ date, moods, thoughts, events, projects: data.projects })
    });
  });

  return { files, deleteRelativePaths };
}

export function todayInputSummary(params: {
  createdDate: string;
  moods: MoodEntry[];
  thoughts: ThoughtEntry[];
  events: EventEntry[];
}) {
  const { createdDate, moods, thoughts, events } = params;
  const todayMoods = moods.filter((entry) => entry.date === createdDate);
  const todayThoughts = thoughts.filter((entry) => entry.date === createdDate);
  const todayEvents = events.filter((entry) => entry.date === createdDate);
  const sortedMoods = [...todayMoods].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return {
    lastMood: sortedMoods[sortedMoods.length - 1],
    thoughtCount: todayThoughts.length,
    eventCount: todayEvents.length,
    minutes: todayEvents.reduce((sum, event) => sum + event.minutes, 0)
  };
}
