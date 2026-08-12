import type { CompletionValue, EventEntry, MoodValue } from "../types/daylog";

const storageKey = "daylog-record-drafts-v1";

export interface ReflectionDraft {
  date: string;
  mood: MoodValue;
  thought: string;
}

export interface EventDraft {
  date: string;
  period: EventEntry["period"];
  title: string;
  projectId: string;
  minutes: string;
  completion: CompletionValue;
  note: string;
}

interface StoredDrafts {
  reflection?: ReflectionDraft;
  event?: EventDraft;
}

export function loadRecordDrafts(): StoredDrafts {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey) ?? "{}") as StoredDrafts;
  } catch {
    return {};
  }
}

function writeDrafts(drafts: StoredDrafts) {
  if (!drafts.reflection && !drafts.event) {
    sessionStorage.removeItem(storageKey);
    return;
  }
  sessionStorage.setItem(storageKey, JSON.stringify(drafts));
}

export function saveReflectionDraft(draft: ReflectionDraft | null) {
  const drafts = loadRecordDrafts();
  if (draft) drafts.reflection = draft;
  else delete drafts.reflection;
  writeDrafts(drafts);
}

export function saveEventDraft(draft: EventDraft | null) {
  const drafts = loadRecordDrafts();
  if (draft) drafts.event = draft;
  else delete drafts.event;
  writeDrafts(drafts);
}

export function hasUnsavedRecordDraft(): boolean {
  const drafts = loadRecordDrafts();
  return Boolean(drafts.reflection || drafts.event);
}

export function clearRecordDrafts() {
  sessionStorage.removeItem(storageKey);
}
