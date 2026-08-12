import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import type { DayLogData } from "../types/daylog";
import { validateDayLogData } from "./validation";
import { buildIncrementalVaultWritePlan, type DataFileKey } from "./vaultContract";

interface LoadedVault {
  path: string;
  data: DayLogData;
}

export interface PersistChange {
  dataKeys: DataFileKey[];
  affectedDates?: string[];
}

let saveQueue: Promise<void> = Promise.resolve();

function validateLoadedVault(loaded: LoadedVault): LoadedVault {
  const validation = validateDayLogData(loaded.data);
  if (!validation.ok) {
    throw new Error(`资料库数据不完整：${validation.errors.join("；")}`);
  }
  return loaded;
}

export async function loadRecentVault(): Promise<LoadedVault | null> {
  const loaded = await invoke<LoadedVault | null>("open_recent_vault");
  return loaded ? validateLoadedVault(loaded) : null;
}

export async function chooseAndOpenVault(create: boolean): Promise<LoadedVault | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: create ? "选择一个空文件夹作为见己资料库" : "选择已有见己资料库"
  });
  if (!selected || Array.isArray(selected)) return null;
  const loaded = await invoke<LoadedVault>("open_vault", { path: selected, create, nowIso: new Date().toISOString() });
  return validateLoadedVault(loaded);
}

export async function persistVault(data: DayLogData, change: PersistChange): Promise<void> {
  const plan = buildIncrementalVaultWritePlan(
    data,
    change.dataKeys,
    change.affectedDates ?? []
  );
  const files = [...plan.dataFiles, ...plan.markdownFiles].map((file) => ({
    relativePath: file.relativePath,
    content: file.content
  }));

  const nextSave = saveQueue
    .catch(() => undefined)
    .then(() => invoke<void>("save_vault", {
      vaultPath: data.settings.vaultPath,
      files,
      deleteRelativePaths: plan.deleteRelativePaths
    }));
  saveQueue = nextSave;
  return nextSave;
}

export function waitForPendingSaves(): Promise<void> {
  return saveQueue;
}

export function showVaultInFinder(path: string): Promise<void> {
  return invoke<void>("show_in_finder", { path });
}

export function openExternalUrl(url: string): Promise<void> {
  return invoke<void>("open_external_url", { url });
}
