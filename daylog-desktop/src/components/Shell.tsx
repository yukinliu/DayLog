import {
  BarChart3,
  CalendarDays,
  ScanEye,
  FolderKanban,
  ListChecks,
  PenLine,
  Settings
} from "lucide-react";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import type { Appearance, PageKey } from "../types/daylog";

interface ShellProps {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  activeProductPanel: ProductPanelKey | null;
  onToggleProductPanel: (panel: ProductPanelKey) => void;
  onDismissProductPanel: () => void;
  appearance: Appearance;
  saveStatus: "idle" | "saving" | "saved" | "failed";
  saveError?: string;
  onRetrySave?: () => void;
  updateAvailable?: boolean;
  children: ReactNode;
  productPanel?: ReactNode;
}

export type ProductPanelKey = "discover" | "settings";

const functionNav: Array<{ key: PageKey; label: string; icon: ReactNode }> = [
  { key: "record", label: "记录", icon: <PenLine size={22} /> },
  { key: "details", label: "明细", icon: <ListChecks size={22} /> },
  { key: "projects", label: "项目", icon: <FolderKanban size={22} /> },
  { key: "stats", label: "统计", icon: <BarChart3 size={22} /> },
  { key: "calendar", label: "日历", icon: <CalendarDays size={22} /> }
];

const productNav: Array<{ key: ProductPanelKey; label: string; icon: ReactNode }> = [
  { key: "discover", label: "观照", icon: <ScanEye size={21} /> },
  { key: "settings", label: "设置", icon: <Settings size={21} /> }
];

export function Shell({
  activePage,
  onNavigate,
  activeProductPanel,
  onToggleProductPanel,
  onDismissProductPanel,
  appearance,
  saveStatus,
  saveError,
  onRetrySave,
  updateAvailable = false,
  children,
  productPanel
}: ShellProps) {
  const productPanelRef = useRef<HTMLDivElement>(null);

  const startWindowDrag = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 0 || (event.target as Element).closest("button")) return;
    void getCurrentWindow().startDragging();
  };

  useEffect(() => {
    if (!activeProductPanel) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (productPanelRef.current?.contains(target)) return;
      if ((target as Element).closest?.("[data-product-panel-trigger]")) return;
      onDismissProductPanel();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismissProductPanel();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeProductPanel, onDismissProductPanel]);

  return (
    <div className="app-frame" data-appearance={appearance}>
      <header className="native-titlebar" data-tauri-drag-region onMouseDown={startWindowDrag}>
        <div className="native-titlebar-brand" aria-label="刘迷糊 DayLog 见己" data-tauri-drag-region>
          <strong>刘迷糊 DayLog</strong>
          <span>· 见己</span>
        </div>
        {saveStatus !== "idle" && (
          <div className={`save-indicator ${saveStatus}`} title={saveError || undefined}>
            {saveStatus === "saving" && "保存中"}
            {saveStatus === "saved" && "已保存到本地"}
            {saveStatus === "failed" && "保存失败"}
            {saveStatus === "failed" && onRetrySave && (
              <button type="button" onClick={onRetrySave}>重试</button>
            )}
          </div>
        )}
      </header>
      <aside className="side-rail" aria-label="见己导航">
        <div className="rail-brand" aria-label="见己">
          <img src="/assets/jianji-logo.png" alt="" />
        </div>
        <nav className="rail-group" aria-label="功能区">
          {functionNav.map((item) => (
            <button
              className={`rail-button ${activePage === item.key ? "active" : ""}`}
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              aria-current={activePage === item.key ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <nav className="rail-group rail-bottom" aria-label="产品区">
          {productNav.map((item) => (
            <button
              className={`rail-button ${activeProductPanel === item.key ? "active" : ""}`}
              key={item.key}
              type="button"
              data-product-panel-trigger
              onClick={() => onToggleProductPanel(item.key)}
              aria-pressed={activeProductPanel === item.key}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.key === "settings" && updateAvailable ? <i className="rail-update-dot" aria-label="有新版本" /> : null}
            </button>
          ))}
        </nav>
      </aside>
      <main className="workspace">
        <div className="workspace-panel">{children}</div>
      </main>
      {productPanel ? <div className="product-popover-shell" ref={productPanelRef}>{productPanel}</div> : null}
    </div>
  );
}
