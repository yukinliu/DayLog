import { Check, Copy, ExternalLink, FolderOpen, MessageCircle, Monitor, Palette, RefreshCw, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { UpdateCheckState } from "../lib/appUpdate";
import { appearanceOptions } from "../lib/projectColor";
import { openExternalUrl } from "../lib/persistence";
import type { ProductContent } from "../lib/productContent";
import type { AppSettings } from "../types/daylog";

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onResetAppearance: () => void;
  onChangeVault: () => void;
  onShowInFinder: () => void;
  updateState: UpdateCheckState;
  content: ProductContent;
}

export function SettingsPage({ settings, onUpdateSettings, onResetAppearance, onChangeVault, onShowInFinder, updateState, content }: SettingsPageProps) {
  const vaultPath = settings.vaultPath;
  const vaultName = vaultPath.split(/[\\/]/).filter(Boolean).pop() ?? "见己";
  const [pathCopied, setPathCopied] = useState(false);

  const copyVaultPath = async () => {
    try {
      await navigator.clipboard.writeText(vaultPath);
      setPathCopied(true);
      window.setTimeout(() => setPathCopied(false), 1400);
    } catch {
      setPathCopied(false);
    }
  };

  const downloadUrl = updateState.status === "available"
    ? updateState.release.downloadPageUrl || content.links.updateDownloadUrl
    : content.links.updateDownloadUrl;
  const versionStatus = updateState.status === "current"
    ? "已是最新版"
    : updateState.status === "available"
      ? `发现 v${updateState.release.version}`
      : "";

  return (
    <section className="settings-page">
      <article className="settings-card">
        <div className="panel-heading">
          <h2>资料库</h2>
          <FolderOpen size={20} />
        </div>
        <button className="path-box" type="button" onClick={copyVaultPath} title={vaultPath}>
          <strong>{vaultName}</strong>
          <span>{vaultPath}</span>
          <em>{pathCopied ? <Check size={12} /> : <Copy size={12} />}{pathCopied ? "已复制" : "复制路径"}</em>
        </button>
        <div className="button-row">
          <button className="settings-action" type="button" onClick={onChangeVault}><RefreshCw size={14} />更换资料库</button>
          <button className="settings-action" type="button" onClick={onShowInFinder}><FolderOpen size={14} />打开资料库文件夹</button>
        </div>
      </article>
      <article className="settings-card">
        <div className="panel-heading">
          <h2>外观</h2>
          <Palette size={20} />
        </div>
        <div className="appearance-options" aria-label="主题色">
          {appearanceOptions.map((option) => (
            <button
              className={`appearance-option ${settings.appearance === option.value ? "selected" : ""}`}
              key={option.value}
              type="button"
              onClick={() => onUpdateSettings({ appearance: option.value })}
              aria-label={option.label}
              title={option.label}
            >
              <i style={{ background: option.accent }} />
            </button>
          ))}
        </div>
        <div className="palette-note">
          <button className="settings-action compact" type="button" onClick={onResetAppearance}>
            <RotateCcw size={15} />
            恢复默认
          </button>
        </div>
      </article>
      <article className="settings-card">
        <div className="panel-heading">
          <h2>关于</h2>
          <Monitor size={20} />
        </div>
        <div className={`version-status-row ${updateState.status}`}>
          <span>当前版本</span>
          <strong>v{updateState.currentVersion || "…"}</strong>
          {versionStatus ? <em>{versionStatus}</em> : null}
        </div>
        {updateState.status === "available" && (
          <button className="available-download-row" type="button" onClick={() => openExternalUrl(downloadUrl)}>
            <span>
              <strong>前往飞书下载新版本</strong>
              {updateState.release.notes ? <small>{updateState.release.notes}</small> : null}
            </span>
            <ExternalLink size={15} />
          </button>
        )}
        <button className="product-guide-row" type="button" onClick={() => openExternalUrl(content.links.productGuideUrl)}>
          <span>{content.links.productGuideLabel}</span>
          <ExternalLink size={16} />
        </button>
        <button className="product-guide-row feedback-row" type="button" onClick={() => openExternalUrl(content.links.feedbackUrl)}>
          <span>
            <MessageCircle size={15} />
            <span>
              <strong>{content.links.feedbackLabel}</strong>
              <small>遇到问题，或有想告诉我们的想法</small>
            </span>
          </span>
          <ExternalLink size={16} />
        </button>
      </article>
    </section>
  );
}
