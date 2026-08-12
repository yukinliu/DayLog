import { getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import type { ContentSource, ProductContent } from "./productContent";

export type UpdateCheckState =
  | { status: "idle" | "checking" | "unavailable"; currentVersion: string }
  | { status: "current"; currentVersion: string }
  | { status: "available"; currentVersion: string; release: ProductContent["release"] }
  | { status: "failed"; currentVersion: string };

function versionParts(version: string) {
  return version.replace(/^v/i, "").split("-")[0].split(".").map((part) => Number(part) || 0);
}

function isNewerVersion(candidate: string, current: string) {
  const next = versionParts(candidate);
  const installed = versionParts(current);
  const length = Math.max(next.length, installed.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (next[index] ?? 0) - (installed[index] ?? 0);
    if (difference !== 0) return difference > 0;
  }
  return false;
}

function compareRelease(currentVersion: string, content: ProductContent): UpdateCheckState {
  return isNewerVersion(content.release.version, currentVersion)
    ? { status: "available", currentVersion, release: content.release }
    : { status: "current", currentVersion };
}

export function useAppUpdate(
  content: ProductContent,
  source: ContentSource,
  remoteFailed: boolean
) {
  const [state, setState] = useState<UpdateCheckState>({ status: "idle", currentVersion: "" });

  useEffect(() => {
    let active = true;
    getVersion().then((currentVersion) => {
      if (!active) return;
      if (!content.remoteContentUrl) setState({ status: "unavailable", currentVersion });
      else if (remoteFailed && source === "local") setState({ status: "failed", currentVersion });
      else setState(compareRelease(currentVersion, content));
    }).catch(() => {
      if (active) setState({ status: "failed", currentVersion: "" });
    });
    return () => {
      active = false;
    };
  }, [content, source, remoteFailed]);

  return { state };
}
