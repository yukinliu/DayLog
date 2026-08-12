import { invoke } from "@tauri-apps/api/core";

export type TelemetryEvent =
  | "first_reflection_saved"
  | "first_event_saved"
  | "update_link_opened"
  | "feedback_link_opened";

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function startTelemetry(): void {
  void invoke("telemetry_startup", { localDate: localDateKey() }).catch(() => undefined);
}

export function trackTelemetryEvent(event: TelemetryEvent): void {
  void invoke("track_telemetry_event", { event, localDate: localDateKey() }).catch(() => undefined);
}
