import { appearanceValues, eventPeriods, projectColorKeys, type DayLogData, type DdlType, type EventEntry, type Project } from "../types/daylog";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
const ddlTypes: DdlType[] = ["date", "long-term", "undecided"];
const completionValues = ["excellent", "progress", "minimum", "unplanned"];
const moodValues = [
  "very-unpleasant",
  "unpleasant",
  "slightly-unpleasant",
  "neutral",
  "slightly-pleasant",
  "pleasant",
  "very-pleasant"
];

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireString(source: Record<string, unknown>, key: string, errors: string[], scope: string) {
  if (typeof source[key] !== "string" || source[key] === "") {
    errors.push(`${scope}.${key} must be a non-empty string`);
  }
}

function validateProject(project: unknown, index: number, errors: string[]) {
  const scope = `projects[${index}]`;
  if (!isRecord(project)) {
    errors.push(`${scope} must be an object`);
    return;
  }

  requireString(project, "id", errors, scope);
  requireString(project, "name", errors, scope);
  requireString(project, "createdAt", errors, scope);
  if (typeof project.createdAt === "string" && !isoPattern.test(project.createdAt)) {
    errors.push(`${scope}.createdAt must be an ISO-like datetime`);
  }

  if (!ddlTypes.includes(project.ddlType as DdlType)) {
    errors.push(`${scope}.ddlType is invalid`);
  }
  if (project.ddlType === "date" && (typeof project.ddlDate !== "string" || !datePattern.test(project.ddlDate))) {
    errors.push(`${scope}.ddlDate must be yyyy-mm-dd when ddlType is date`);
  }
  if (!["active", "completed", "paused"].includes(String(project.progress))) {
    errors.push(`${scope}.progress is invalid`);
  }
  if (!["normal", "merged", "deleted"].includes(String(project.lifecycle))) {
    errors.push(`${scope}.lifecycle is invalid`);
  }
  if (project.colorKey !== undefined && !projectColorKeys.includes(project.colorKey as typeof projectColorKeys[number])) {
    errors.push(`${scope}.colorKey is invalid`);
  }
}

function validateEvent(event: unknown, index: number, projects: Project[], errors: string[]) {
  const scope = `events[${index}]`;
  if (!isRecord(event)) {
    errors.push(`${scope} must be an object`);
    return;
  }

  requireString(event, "id", errors, scope);
  requireString(event, "date", errors, scope);
  requireString(event, "createdAt", errors, scope);
  requireString(event, "title", errors, scope);

  if (typeof event.date === "string" && !datePattern.test(event.date)) {
    errors.push(`${scope}.date must be yyyy-mm-dd`);
  }
  if (typeof event.createdAt === "string" && !isoPattern.test(event.createdAt)) {
    errors.push(`${scope}.createdAt must be an ISO-like datetime`);
  }
  if (!eventPeriods.includes(event.period as typeof eventPeriods[number])) {
    errors.push(`${scope}.period is invalid`);
  }
  if (typeof event.minutes !== "number" || event.minutes < 0 || !Number.isFinite(event.minutes)) {
    errors.push(`${scope}.minutes must be a finite non-negative number`);
  }
  if (typeof event.note !== "string") {
    errors.push(`${scope}.note must be a string`);
  }
  if (!completionValues.includes(String(event.completion))) {
    errors.push(`${scope}.completion is invalid`);
  }
  if (event.projectId !== null && typeof event.projectId !== "string") {
    errors.push(`${scope}.projectId must be null or string`);
  }
  if (typeof event.projectId === "string" && !projects.some((project) => project.id === event.projectId)) {
    errors.push(`${scope}.projectId points to a missing project`);
  }
}

export function validateDayLogData(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isRecord(data)) {
    return { ok: false, errors: ["data must be an object"] };
  }
  if (data.version !== 1) {
    errors.push("version must be 1");
  }
  if (!isRecord(data.settings)) {
    errors.push("settings must be an object");
  } else {
    if (data.settings.schemaVersion !== 1) {
      errors.push("settings.schemaVersion must be 1");
    }
    requireString(data.settings, "vaultPath", errors, "settings");
    requireString(data.settings, "lastOpenedAt", errors, "settings");
    if (typeof data.settings.appearance !== "string" || !appearanceValues.includes(data.settings.appearance as typeof appearanceValues[number])) {
      errors.push("settings.appearance is invalid");
    }
    if (data.settings.projectColorScheme !== "seasonal") {
      errors.push("settings.projectColorScheme is invalid");
    }
  }

  const projects = Array.isArray(data.projects) ? (data.projects as Project[]) : [];
  if (!Array.isArray(data.projects)) errors.push("projects must be an array");
  projects.forEach((project, index) => validateProject(project, index, errors));

  if (!Array.isArray(data.moods)) {
    errors.push("moods must be an array");
  } else {
    data.moods.forEach((mood, index) => {
      const scope = `moods[${index}]`;
      if (!isRecord(mood)) {
        errors.push(`${scope} must be an object`);
        return;
      }
      requireString(mood, "id", errors, scope);
      requireString(mood, "date", errors, scope);
      requireString(mood, "createdAt", errors, scope);
      if (typeof mood.date === "string" && !datePattern.test(mood.date)) errors.push(`${scope}.date must be yyyy-mm-dd`);
      if (typeof mood.createdAt === "string" && !isoPattern.test(mood.createdAt)) errors.push(`${scope}.createdAt must be an ISO-like datetime`);
      if (!moodValues.includes(String(mood.value))) errors.push(`${scope}.value is invalid`);
    });
  }

  if (!Array.isArray(data.thoughts)) {
    errors.push("thoughts must be an array");
  } else {
    data.thoughts.forEach((thought, index) => {
      const scope = `thoughts[${index}]`;
      if (!isRecord(thought)) {
        errors.push(`${scope} must be an object`);
        return;
      }
      requireString(thought, "id", errors, scope);
      requireString(thought, "date", errors, scope);
      requireString(thought, "createdAt", errors, scope);
      requireString(thought, "content", errors, scope);
      if (typeof thought.date === "string" && !datePattern.test(thought.date)) errors.push(`${scope}.date must be yyyy-mm-dd`);
      if (typeof thought.createdAt === "string" && !isoPattern.test(thought.createdAt)) errors.push(`${scope}.createdAt must be an ISO-like datetime`);
    });
  }

  if (!Array.isArray(data.events)) {
    errors.push("events must be an array");
  } else {
    data.events.forEach((event, index) => validateEvent(event as EventEntry, index, projects, errors));
  }

  if (!Array.isArray(data.projectHistory)) {
    errors.push("projectHistory must be an array");
  } else {
    data.projectHistory.forEach((entry, index) => {
      const scope = `projectHistory[${index}]`;
      if (!isRecord(entry)) {
        errors.push(`${scope} must be an object`);
        return;
      }
      requireString(entry, "id", errors, scope);
      requireString(entry, "projectId", errors, scope);
      requireString(entry, "createdAt", errors, scope);
      requireString(entry, "note", errors, scope);
      if (!['created', 'updated', 'completed', 'paused', 'restarted', 'merged', 'deleted'].includes(String(entry.action))) {
        errors.push(`${scope}.action is invalid`);
      }
      if (typeof entry.createdAt === "string" && !isoPattern.test(entry.createdAt)) errors.push(`${scope}.createdAt must be an ISO-like datetime`);
    });
  }

  return { ok: errors.length === 0, errors };
}
