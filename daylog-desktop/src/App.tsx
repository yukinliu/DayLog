import { useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Shell, type ProductPanelKey } from "./components/Shell";
import { CalendarPage } from "./pages/CalendarPage";
import { DetailsPage } from "./pages/DetailsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { RecommendPage } from "./pages/RecommendPage";
import { RecordPage } from "./pages/RecordPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StatsPage } from "./pages/StatsPage";
import { todayInputSummary } from "./lib/daylogData";
import { chooseAndOpenVault, loadRecentVault, persistVault, showVaultInFinder, waitForPendingSaves, type PersistChange } from "./lib/persistence";
import { assignMissingProjectColors, defaultAppearance, nextProjectColorKey } from "./lib/projectColor";
import { clearRecordDrafts, hasUnsavedRecordDraft } from "./lib/recordDraft";
import { useAppUpdate } from "./lib/appUpdate";
import { useProductContent } from "./lib/productContent";
import { startTelemetry, trackTelemetryEvent } from "./lib/telemetry";
import type { AppSettings, CompletionValue, DayLogData, EventEntry, MoodValue, PageKey, Project, ThoughtEntry } from "./types/daylog";

type SaveStatus = "idle" | "saving" | "saved" | "failed";
type LoadStatus = "loading" | "needs-vault" | "ready" | "error";
const fallbackGreeting = "把今天发生的事情写下来，不急着评价它。";

function pickOpeningGreeting(lines: string[]) {
  const pool = lines.length ? lines : [fallbackGreeting];
  const previous = localStorage.getItem("jianji-greeting-text");
  const candidates = pool.length > 1 ? pool.filter((line) => line !== previous) : pool;
  const next = candidates[Math.floor(Math.random() * candidates.length)] ?? fallbackGreeting;
  localStorage.setItem("jianji-greeting-text", next);
  return next;
}

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function localIsoString(date = new Date()) {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
  const minutes = String(Math.abs(offset) % 60).padStart(2, "0");
  return `${localDateKey(date)}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}${sign}${hours}:${minutes}`;
}

export default function App() {
  const productContentState = useProductContent();
  const productContent = productContentState.content;
  const appUpdate = useAppUpdate(
    productContent,
    productContentState.source,
    productContentState.remoteFailed
  );
  const [activePage, setActivePage] = useState<PageKey>("record");
  const [activeProductPanel, setActiveProductPanel] = useState<ProductPanelKey | null>(null);
  const [data, setData] = useState<DayLogData | null>(null);
  const dataRef = useRef<DayLogData | null>(null);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("loading");
  const [loadError, setLoadError] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState("");
  const [detailsDate, setDetailsDate] = useState(localDateKey());
  const [openingSequence, setOpeningSequence] = useState(0);
  const [openingVisible, setOpeningVisible] = useState(false);
  const [openingStarted, setOpeningStarted] = useState(false);
  const [openingGreeting, setOpeningGreeting] = useState(fallbackGreeting);
  const greetingsRef = useRef(productContent.greetings);
  const initialOpeningHandled = useRef(false);
  const saveRevision = useRef(0);
  const lastFailedSave = useRef<{ data: DayLogData; change: PersistChange } | null>(null);

  greetingsRef.current = productContent.greetings;

  useEffect(() => {
    startTelemetry();
  }, []);

  const acceptLoadedData = (loaded: { data: DayLogData }) => {
    const needsStatusMigration = loaded.data.settings.projectStatusModel !== 2;
    const legacyNormalizedProjects = needsStatusMigration
      ? loaded.data.projects.map((project) => (
          project.progress === "active" && project.ddlType === "undecided"
            ? { ...project, progress: "planned" as const }
            : project
        ))
      : loaded.data.projects;
    const projects = assignMissingProjectColors(legacyNormalizedProjects);
    const colorsChanged = projects.some((project, index) => project !== loaded.data.projects[index]);
    const normalizedData = needsStatusMigration || colorsChanged
      ? {
          ...loaded.data,
          settings: { ...loaded.data.settings, projectStatusModel: 2 as const },
          projects
        }
      : loaded.data;
    lastFailedSave.current = null;
    dataRef.current = normalizedData;
    setData(normalizedData);
    if (normalizedData !== loaded.data) {
      void persistVault(normalizedData, { dataKeys: needsStatusMigration ? ["settings", "projects"] : ["projects"] });
    }
    const dates = [...normalizedData.events, ...normalizedData.moods, ...normalizedData.thoughts]
      .map((entry) => entry.date)
      .sort();
    setDetailsDate(dates[dates.length - 1] ?? localDateKey());
    setLoadError("");
    setLoadStatus("ready");
    setSaveStatus("idle");
  };

  useEffect(() => {
    if (loadStatus !== "ready") return;
    let unlisten: (() => void) | undefined;
    let disposed = false;
    if (!initialOpeningHandled.current) {
      initialOpeningHandled.current = true;
      setOpeningGreeting(pickOpeningGreeting(greetingsRef.current));
      setOpeningSequence((current) => current + 1);
      setOpeningVisible(true);
      setOpeningStarted(false);
    }
    listen("main-window-opened", () => {
      setActivePage("record");
      setActiveProductPanel(null);
      setOpeningGreeting(pickOpeningGreeting(greetingsRef.current));
      setOpeningSequence((current) => current + 1);
      setOpeningVisible(true);
      setOpeningStarted(false);
    }).then((stopListening) => {
      if (disposed) stopListening();
      else unlisten = stopListening;
    });
    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [loadStatus]);

  useEffect(() => {
    let active = true;
    loadRecentVault()
      .then((loaded) => {
        if (!active) return;
        if (loaded) acceptLoadedData(loaded);
        else setLoadStatus("needs-vault");
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error instanceof Error ? error.message : String(error));
        setLoadStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const appWindow = getCurrentWindow();
    let unlisten: (() => void) | undefined;
    let disposed = false;

    appWindow.onCloseRequested(async (event) => {
      event.preventDefault();
      try {
        await waitForPendingSaves();
      } catch {
        if (!window.confirm("最近一次保存失败，仍要退出并放弃未保存的更改吗？")) return;
      }
      if (hasUnsavedRecordDraft() && !window.confirm("记录页还有未保存的草稿，仍要退出吗？")) return;
      await invoke("close_main_window");
    }).then((stopListening) => {
      if (disposed) stopListening();
      else unlisten = stopListening;
    });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    if (saveStatus !== "saved") return;
    const timer = window.setTimeout(() => setSaveStatus("idle"), 1600);
    return () => window.clearTimeout(timer);
  }, [saveStatus]);

  const selectVault = async (create: boolean) => {
    let shouldClearDrafts = false;
    if (data) {
      try {
        await waitForPendingSaves();
      } catch {
        if (!window.confirm("最近一次保存失败，更换资料库会放弃未保存的更改。仍要继续吗？")) return;
      }
      if (hasUnsavedRecordDraft()) {
        if (!window.confirm("更换资料库会清空记录页中未保存的草稿。仍要继续吗？")) return;
        shouldClearDrafts = true;
      }
    }
    setLoadStatus("loading");
    setLoadError("");
    try {
      const loaded = await chooseAndOpenVault(create);
      if (loaded) {
        if (shouldClearDrafts) clearRecordDrafts();
        acceptLoadedData(loaded);
      }
      else setLoadStatus(data ? "ready" : "needs-vault");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (data) {
        setSaveError(message);
        setSaveStatus("failed");
        setLoadStatus("ready");
      } else {
        setLoadError(message);
        setLoadStatus("error");
      }
    }
  };

  if (loadStatus !== "ready" || !data) {
    return (
      <main className="vault-gate">
        <section className="vault-gate-card">
          <span className="vault-mark"><img src="/assets/jianji-logo.png" alt="" />见己</span>
          <h1>{loadStatus === "loading" ? "正在打开资料库…" : "选择你的见己资料库"}</h1>
          <p>记录保存在你选择的本地文件夹中，不需要登录。</p>
          {loadError && <div className="vault-error">{loadError}</div>}
          {loadStatus !== "loading" && (
            <div className="vault-gate-actions">
              <button className="primary-button" type="button" onClick={() => selectVault(true)}>新建资料库</button>
              <button className="secondary-button" type="button" onClick={() => selectVault(false)}>打开已有资料库</button>
            </div>
          )}
        </section>
      </main>
    );
  }

  const recordSummary = todayInputSummary({
    createdDate: localDateKey(),
    moods: data.moods,
    thoughts: data.thoughts,
    events: data.events
  });

  const commitData = (update: DayLogData | ((current: DayLogData) => DayLogData), change: PersistChange) => {
    const previous = dataRef.current ?? data;
    const next = typeof update === "function" ? update(previous) : update;
    dataRef.current = next;
    setData(next);
    setSaveStatus("saving");
    setSaveError("");
    const revision = ++saveRevision.current;
    return persistVault(next, change)
      .then(() => {
        if (revision === saveRevision.current) {
          lastFailedSave.current = null;
          setSaveStatus("saved");
        }
        return true;
      })
      .catch((error) => {
        if (revision === saveRevision.current) {
          lastFailedSave.current = { data: next, change };
          if (dataRef.current === next) dataRef.current = previous;
          setData((current) => current === next ? previous : current);
          setSaveError(error instanceof Error ? error.message : String(error));
          setSaveStatus("failed");
        }
        return false;
      });
  };

  const retrySave = () => {
    const failed = lastFailedSave.current;
    if (!failed) return;
    commitData(failed.data, failed.change);
  };

  const updateEvent = (nextEvent: EventEntry) => {
    const current = dataRef.current ?? data;
    return commitData((latest) => ({
      ...latest,
      events: latest.events.map((event) => event.id === nextEvent.id ? nextEvent : event)
    }), { dataKeys: ["events"], affectedDates: [current.events.find((event) => event.id === nextEvent.id)?.date ?? nextEvent.date, nextEvent.date] });
  };

  const deleteEvent = (eventId: string) => {
    const current = dataRef.current ?? data;
    const deleted = current.events.find((event) => event.id === eventId);
    commitData((latest) => ({
      ...latest,
      events: latest.events.filter((event) => event.id !== eventId)
    }), { dataKeys: ["events"], affectedDates: deleted ? [deleted.date] : [] });
  };

  const updateThought = (nextThought: ThoughtEntry) => {
    commitData((latest) => ({
      ...latest,
      thoughts: latest.thoughts.map((thought) => thought.id === nextThought.id ? nextThought : thought)
    }), { dataKeys: ["thoughts"], affectedDates: [nextThought.date] });
  };

  const deleteThought = (thoughtId: string) => {
    const current = dataRef.current ?? data;
    const deleted = current.thoughts.find((thought) => thought.id === thoughtId);
    commitData((latest) => ({
      ...latest,
      thoughts: latest.thoughts.filter((thought) => thought.id !== thoughtId)
    }), { dataKeys: ["thoughts"], affectedDates: deleted ? [deleted.date] : [] });
  };

  const saveReflection = async (input: { date: string; mood: MoodValue; thought: string }) => {
    if (!input.date) return false;
    const now = localIsoString();
    const thoughtContent = input.thought.trim();
    const saved = await commitData((latest) => ({
      ...latest,
      moods: [
        ...latest.moods,
        {
          id: createId("mood"),
          date: input.date,
          createdAt: now,
          value: input.mood
        }
      ],
      thoughts: thoughtContent
        ? [
            ...latest.thoughts,
            {
              id: createId("thought"),
              date: input.date,
              createdAt: now,
              content: thoughtContent
            }
          ]
        : latest.thoughts
    }), { dataKeys: thoughtContent ? ["moods", "thoughts"] : ["moods"], affectedDates: [input.date] });
    if (saved) trackTelemetryEvent("first_reflection_saved");
    return saved;
  };

  const saveEvent = async (input: {
    date: string;
    period: EventEntry["period"];
    title: string;
    projectId: string | null;
    minutes: number;
    completion: CompletionValue;
    note: string;
  }) => {
    const title = input.title.trim();
    if (!title || !input.date) return false;
    const saved = await commitData((latest) => ({
      ...latest,
      events: [
        ...latest.events,
        {
          id: createId("event"),
          date: input.date,
          createdAt: localIsoString(),
          period: input.period,
          title,
          projectId: input.projectId,
          minutes: Math.max(0, Number(input.minutes) || 0),
          completion: input.completion,
          note: input.note.trim()
        }
      ]
    }), { dataKeys: ["events"], affectedDates: [input.date] });
    if (saved) trackTelemetryEvent("first_event_saved");
    return saved;
  };

  const createProject = () => {
    const now = localIsoString();
    const current = dataRef.current ?? data;
    const project: Project = {
      id: `project-${Date.now()}`,
      name: "未命名项目",
      ddlType: "long-term",
      progress: "active",
      lifecycle: "normal",
      createdAt: now,
      colorKey: nextProjectColorKey(current.projects)
    };
    commitData((latest) => ({
      ...latest,
      projects: [project, ...latest.projects],
      projectHistory: [
        ...latest.projectHistory,
        {
          id: `history-${Date.now()}`,
          projectId: project.id,
          createdAt: now,
          action: "created",
          note: "新增项目"
        }
      ]
    }), { dataKeys: ["projects", "projectHistory"] });
    return project;
  };

  const updateProject = (nextProject: Project) => {
    const now = localIsoString();
    const current = dataRef.current ?? data;
    const previous = current.projects.find((project) => project.id === nextProject.id);
    const action = previous?.progress !== nextProject.progress
      ? nextProject.progress === "completed"
        ? "completed"
        : nextProject.progress === "paused"
          ? "paused"
          : "restarted"
      : "updated";
    const reopenedWithOccupiedColor = previous?.progress === "completed"
      && (nextProject.progress === "active" || nextProject.progress === "planned")
      && nextProject.colorKey
      && current.projects.some((project) => project.id !== nextProject.id
        && project.lifecycle === "normal"
        && project.progress !== "completed"
        && project.colorKey === nextProject.colorKey);
    const projectToSave = reopenedWithOccupiedColor
      ? { ...nextProject, colorKey: nextProjectColorKey(current.projects.filter((project) => project.id !== nextProject.id)) }
      : nextProject;
    const affectedDates = previous?.name !== projectToSave.name
      ? current.events.filter((event) => event.projectId === nextProject.id).map((event) => event.date)
      : [];
    commitData((latest) => ({
      ...latest,
      projects: latest.projects.map((project) => project.id === projectToSave.id ? projectToSave : project),
      projectHistory: [
        ...latest.projectHistory,
        {
          id: `history-${Date.now()}`,
          projectId: projectToSave.id,
          createdAt: now,
          action,
          note: "更新项目"
        }
      ]
    }), { dataKeys: ["projects", "projectHistory"], affectedDates });
  };

  const deleteProject = (projectId: string, options?: { targetProjectId?: string | null }) => {
    const now = localIsoString();
    const targetProjectId = options?.targetProjectId ?? null;
    const current = dataRef.current ?? data;
    const affectedDates = current.events.filter((event) => event.projectId === projectId).map((event) => event.date);
    commitData((latest) => ({
      ...latest,
      projects: latest.projects.map((project) => project.id === projectId
        ? { ...project, lifecycle: "deleted", deletedAt: now }
        : project),
      events: latest.events.map((event) => event.projectId === projectId ? { ...event, projectId: targetProjectId } : event),
      projectHistory: [
        ...latest.projectHistory,
        {
          id: `history-${Date.now()}`,
          projectId,
          createdAt: now,
          action: "deleted",
          note: targetProjectId ? `删除项目，关联记录合并至 ${targetProjectId}` : "删除项目，关联记录暂不设置项目"
        }
      ]
    }), { dataKeys: ["projects", "events", "projectHistory"], affectedDates });
  };

  const mergeProject = (projectId: string, targetId: string) => {
    const now = localIsoString();
    const current = dataRef.current ?? data;
    const affectedDates = current.events.filter((event) => event.projectId === projectId).map((event) => event.date);
    commitData((latest) => ({
      ...latest,
      projects: latest.projects.map((project) => project.id === projectId
        ? { ...project, lifecycle: "merged", mergedIntoId: targetId }
        : project),
      events: latest.events.map((event) => event.projectId === projectId ? { ...event, projectId: targetId } : event),
      projectHistory: [
        ...latest.projectHistory,
        {
          id: `history-${Date.now()}`,
          projectId,
          createdAt: now,
          action: "merged",
          note: `合并至 ${targetId}`
        }
      ]
    }), { dataKeys: ["projects", "events", "projectHistory"], affectedDates });
  };

  const updateSettings = (patch: Partial<AppSettings>) => {
    commitData((latest) => ({
      ...latest,
      settings: {
        ...latest.settings,
        ...patch
      }
    }), { dataKeys: ["settings"] });
  };

  const resetAppearance = () => {
    updateSettings({ appearance: defaultAppearance, projectColorScheme: "seasonal" });
  };

  const navigatePage = (page: PageKey) => {
    setOpeningVisible(false);
    if (page === "details") setDetailsDate(localDateKey());
    setActivePage(page);
    setActiveProductPanel(null);
  };

  const markOpeningReady = () => setOpeningStarted(true);
  const dismissOpening = () => setOpeningVisible(false);

  const toggleProductPanel = (panel: ProductPanelKey) => {
    setActiveProductPanel((current) => current === panel ? null : panel);
  };

  return (
    <Shell
      activePage={activePage}
      onNavigate={navigatePage}
      activeProductPanel={activeProductPanel}
      onToggleProductPanel={toggleProductPanel}
      onDismissProductPanel={() => setActiveProductPanel(null)}
      appearance={data.settings.appearance}
      saveStatus={saveStatus}
      saveError={saveError}
      onRetrySave={lastFailedSave.current ? retrySave : undefined}
      updateAvailable={appUpdate.state.status === "available"}
      productPanel={activeProductPanel === "discover"
        ? <RecommendPage content={productContent} />
        : activeProductPanel === "settings"
          ? (
              <SettingsPage
                settings={data.settings}
                onUpdateSettings={updateSettings}
                onResetAppearance={resetAppearance}
                onChangeVault={() => selectVault(false)}
                onShowInFinder={() => showVaultInFinder(data.settings.vaultPath)}
                updateState={appUpdate.state}
                content={productContent}
                onUpdateLinkOpen={() => trackTelemetryEvent("update_link_opened")}
                onFeedbackLinkOpen={() => trackTelemetryEvent("feedback_link_opened")}
              />
            )
          : null}
    >
      {activePage === "record" && (
        <RecordPage
          projects={data.projects}
          moods={data.moods}
          thoughts={data.thoughts}
          events={data.events}
          summary={recordSummary}
          onSaveReflection={saveReflection}
          onSaveEvent={saveEvent}
          greeting={openingGreeting}
          openingSequence={openingSequence}
          openingVisible={openingVisible}
          openingStarted={openingStarted}
          onOpeningReady={markOpeningReady}
          onDismissOpening={dismissOpening}
        />
      )}
      {activePage === "details" && (
        <DetailsPage
          projects={data.projects}
          events={data.events}
          moods={data.moods}
          thoughts={data.thoughts}
          onUpdateEvent={updateEvent}
          onDeleteEvent={deleteEvent}
          onUpdateThought={updateThought}
          onDeleteThought={deleteThought}
          selectedDate={detailsDate}
          onDateChange={setDetailsDate}
        />
      )}
      {activePage === "projects" && (
        <ProjectsPage
          projects={data.projects}
          events={data.events}
          onCreateProject={createProject}
          onUpdateProject={updateProject}
          onDeleteProject={deleteProject}
          onMergeProject={mergeProject}
        />
      )}
      {activePage === "stats" && <StatsPage projects={data.projects} events={data.events} moods={data.moods} thoughts={data.thoughts} />}
      {activePage === "calendar" && (
        <CalendarPage
          projects={data.projects}
          events={data.events}
          recordDates={[...data.events, ...data.moods, ...data.thoughts].map((entry) => entry.date)}
          onSelectDate={(date) => {
            setDetailsDate(date);
            setActivePage("details");
            setActiveProductPanel(null);
          }}
        />
      )}
    </Shell>
  );
}
