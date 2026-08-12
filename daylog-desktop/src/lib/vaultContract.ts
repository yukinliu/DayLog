import type { DayLogData } from "../types/daylog";
import { buildMarkdownPlan, buildMarkdownPlanForDates } from "./daylogData";
import { validateDayLogData } from "./validation";

export interface VaultWritePlan {
  dataFiles: Array<{ relativePath: string; content: string }>;
  markdownFiles: Array<{ relativePath: string; content: string }>;
}

export type DataFileKey = "settings" | "projects" | "projectHistory" | "moods" | "thoughts" | "events";

export interface IncrementalVaultWritePlan extends VaultWritePlan {
  deleteRelativePaths: string[];
}

function stringifyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function persistedSettings(data: DayLogData) {
  const { vaultPath: _runtimeVaultPath, ...settings } = data.settings;
  return settings;
}

const dataFileDefinitions: Record<DataFileKey, { relativePath: string; select: (data: DayLogData) => unknown }> = {
  settings: { relativePath: ".daylog/app-settings.json", select: persistedSettings },
  projects: { relativePath: ".daylog/projects.json", select: (data) => data.projects },
  projectHistory: { relativePath: ".daylog/project-history.json", select: (data) => data.projectHistory },
  moods: { relativePath: ".daylog/moods.json", select: (data) => data.moods },
  thoughts: { relativePath: ".daylog/thoughts.json", select: (data) => data.thoughts },
  events: { relativePath: ".daylog/events.json", select: (data) => data.events }
};

export function buildVaultWritePlan(data: DayLogData): VaultWritePlan {
  const validation = validateDayLogData(data);
  if (!validation.ok) {
    throw new Error(`DayLog data is invalid: ${validation.errors.join("; ")}`);
  }

  return {
    dataFiles: [
      { relativePath: ".daylog/app-settings.json", content: stringifyJson(persistedSettings(data)) },
      { relativePath: ".daylog/projects.json", content: stringifyJson(data.projects) },
      { relativePath: ".daylog/project-history.json", content: stringifyJson(data.projectHistory) },
      { relativePath: ".daylog/moods.json", content: stringifyJson(data.moods) },
      { relativePath: ".daylog/thoughts.json", content: stringifyJson(data.thoughts) },
      { relativePath: ".daylog/events.json", content: stringifyJson(data.events) }
    ],
    markdownFiles: buildMarkdownPlan(data)
  };
}

export function buildIncrementalVaultWritePlan(
  data: DayLogData,
  dataKeys: DataFileKey[],
  affectedDates: string[]
): IncrementalVaultWritePlan {
  const validation = validateDayLogData(data);
  if (!validation.ok) {
    throw new Error(`DayLog data is invalid: ${validation.errors.join("; ")}`);
  }

  const markdown = buildMarkdownPlanForDates(data, affectedDates);
  return {
    dataFiles: [...new Set(dataKeys)].map((key) => ({
      relativePath: dataFileDefinitions[key].relativePath,
      content: stringifyJson(dataFileDefinitions[key].select(data))
    })),
    markdownFiles: markdown.files,
    deleteRelativePaths: markdown.deleteRelativePaths
  };
}

export function describeStableWriteSequence(plan: VaultWritePlan): string[] {
  const files = [...plan.dataFiles, ...plan.markdownFiles];
  return [
    "Validate DayLogData before touching disk.",
    "Write every target file to a temporary sibling file first.",
    "Flush and close the temporary file.",
    "Rename the temporary file over the final file.",
    `Update ${files.length} files only after every content string has been prepared successfully.`
  ];
}
