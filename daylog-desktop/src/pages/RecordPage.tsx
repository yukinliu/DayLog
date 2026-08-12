import { useEffect, useState, type FormEvent } from "react";
import { NotebookPen, Sparkles } from "lucide-react";
import { completionOptions } from "../lib/completion";
import { formatMinutes } from "../lib/format";
import { moodOptions } from "../lib/mood";
import { loadRecordDrafts, saveEventDraft, saveReflectionDraft } from "../lib/recordDraft";
import { eventPeriods, type CompletionValue, type EventEntry, type MoodValue, type Project } from "../types/daylog";

interface RecordPageProps {
  projects: Project[];
  greetings: string[];
  summary: {
    lastMood?: { value: MoodValue };
    thoughtCount: number;
    eventCount: number;
    minutes: number;
  };
  onSaveReflection: (input: { date: string; mood: MoodValue; thought: string }) => Promise<boolean>;
  onSaveEvent: (input: {
    date: string;
    period: EventEntry["period"];
    title: string;
    projectId: string | null;
    minutes: number;
    completion: CompletionValue;
    note: string;
  }) => Promise<boolean>;
}

const fallbackGreeting = "把今天发生的事情写下来，不急着评价它。";

function pickGreeting(lines: string[]) {
  const pool = lines.length ? lines : [fallbackGreeting];
  const previous = sessionStorage.getItem("daylog-desktop-last-greeting");
  const candidates = pool.length > 1 ? pool.filter((line) => line !== previous) : pool;
  const next = candidates[Math.floor(Math.random() * candidates.length)] ?? fallbackGreeting;
  sessionStorage.setItem("daylog-desktop-last-greeting", next);
  return next;
}

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

type SubmitStatus = "idle" | "saving" | "saved" | "failed";

export function RecordPage({ projects, greetings, summary, onSaveReflection, onSaveEvent }: RecordPageProps) {
  const [greeting, setGreeting] = useState(fallbackGreeting);
  const today = localDateKey();
  const [initialDrafts] = useState(loadRecordDrafts);
  const [reflectionDate, setReflectionDate] = useState(initialDrafts.reflection?.date ?? today);
  const [moodValue, setMoodValue] = useState<MoodValue>(initialDrafts.reflection?.mood ?? "neutral");
  const [thought, setThought] = useState(initialDrafts.reflection?.thought ?? "");
  const [eventDate, setEventDate] = useState(initialDrafts.event?.date ?? today);
  const [period, setPeriod] = useState<EventEntry["period"]>(initialDrafts.event?.period ?? "上午");
  const [minutes, setMinutes] = useState(initialDrafts.event?.minutes ?? "");
  const [title, setTitle] = useState(initialDrafts.event?.title ?? "");
  const [projectId, setProjectId] = useState(initialDrafts.event?.projectId ?? "");
  const [completion, setCompletion] = useState<CompletionValue>(initialDrafts.event?.completion ?? "progress");
  const [note, setNote] = useState(initialDrafts.event?.note ?? "");
  const [reflectionDirty, setReflectionDirty] = useState(Boolean(initialDrafts.reflection));
  const [eventDirty, setEventDirty] = useState(Boolean(initialDrafts.event));
  const [reflectionSubmit, setReflectionSubmit] = useState<SubmitStatus>("idle");
  const [eventSubmit, setEventSubmit] = useState<SubmitStatus>("idle");
  const [eventError, setEventError] = useState("");
  const lastMoodOption = summary.lastMood ? moodOptions.find((item) => item.value === summary.lastMood?.value) : null;
  const normalProjects = projects.filter((project) => project.lifecycle === "normal");

  useEffect(() => {
    setGreeting(pickGreeting(greetings));
  }, [greetings]);

  useEffect(() => {
    saveReflectionDraft(reflectionDirty ? { date: reflectionDate, mood: moodValue, thought } : null);
  }, [reflectionDate, moodValue, thought, reflectionDirty]);

  useEffect(() => {
    saveEventDraft(eventDirty ? { date: eventDate, period, title, projectId, minutes, completion, note } : null);
  }, [eventDate, period, title, projectId, minutes, completion, note, eventDirty]);

  const settleSubmitStatus = (setter: (status: SubmitStatus) => void) => {
    window.setTimeout(() => setter("idle"), 1400);
  };

  const submitReflection = async (event: FormEvent) => {
    event.preventDefault();
    if (!reflectionDate || reflectionSubmit === "saving") return;
    setReflectionSubmit("saving");
    const saved = await onSaveReflection({ date: reflectionDate, mood: moodValue, thought });
    if (!saved) {
      setReflectionSubmit("failed");
      return;
    }
    setThought("");
    setReflectionDirty(false);
    setReflectionSubmit("saved");
    settleSubmitStatus(setReflectionSubmit);
  };

  const submitEvent = async (event: FormEvent) => {
    event.preventDefault();
    if (eventSubmit === "saving") return;
    if (!eventDate) {
      setEventError("请选择归属日期");
      return;
    }
    if (!title.trim()) {
      setEventError("请先写下发生了什么");
      return;
    }
    setEventError("");
    setEventSubmit("saving");
    const saved = await onSaveEvent({
      date: eventDate,
      period,
      title,
      projectId: projectId || null,
      minutes: Number(minutes) || 0,
      completion,
      note
    });
    if (!saved) {
      setEventSubmit("failed");
      setEventError("保存失败，请检查资料库后重试");
      return;
    }
    setTitle("");
    setMinutes("");
    setNote("");
    setEventDirty(false);
    setEventSubmit("saved");
    settleSubmitStatus(setEventSubmit);
  };

  return (
    <section className="page-grid record-page">
      <div className="record-intro">
        <div>
          <span>今天 · {today.split("-").join("/")}</span>
          <strong>念起觉心，知深见己。</strong>
        </div>
        <p>{greeting}</p>
      </div>

      <div className="record-inline-summary">
        <span>今日已记录</span>
        <strong>{lastMoodOption ? `${lastMoodOption.emoji} ${lastMoodOption.label}` : "还没有感受记录"}</strong>
        <i />
        <span>想法 {summary.thoughtCount} 条</span>
        <span>事实经历 {summary.eventCount} 条</span>
        <span>投入 {formatMinutes(summary.minutes)}</span>
      </div>

      <div className="record-columns">
        <form className="record-panel reflection-panel" onSubmit={submitReflection}>
          <div className="panel-heading">
            <div>
              <p>自我觉察</p>
              <h2>感受与想法</h2>
              <span className="panel-description">不用想得完整，先把此刻真实的感受留在这里。</span>
            </div>
            <Sparkles size={20} />
          </div>
          <label className="field">
            <span>归属日期</span>
            <input type="date" value={reflectionDate} onChange={(event) => { setReflectionDate(event.target.value); setReflectionDirty(true); }} />
          </label>
          <div className="mood-picker" aria-label="今日感受">
            {moodOptions.map((mood) => (
              <button
                className={`mood-option ${mood.value === moodValue ? "selected" : ""}`}
                key={mood.value}
                type="button"
                onClick={() => { setMoodValue(mood.value); setReflectionDirty(true); }}
              >
                <span>{mood.emoji}</span>
                <strong>{mood.label}</strong>
              </button>
            ))}
          </div>
          <label className="field">
            <span>此刻有什么感受或念头？</span>
            <textarea className="reflection-textarea" value={thought} onChange={(event) => { setThought(event.target.value); setReflectionDirty(true); }} placeholder="写下一句话、一个念头，或此刻身体和情绪的变化。" />
          </label>
          <div className="panel-actions">
            <button
              className={`quiet-save-button ${reflectionDirty ? "ready" : ""}`}
              type="submit"
              disabled={!reflectionDirty || reflectionSubmit === "saving"}
            >
              {reflectionSubmit === "saving" ? "保存中…" : reflectionSubmit === "saved" ? "已保存" : reflectionSubmit === "failed" ? "保存失败，重试" : "保存"}
            </button>
          </div>
        </form>

        <form className="record-panel fact-panel" onSubmit={submitEvent}>
          <div className="panel-heading">
            <div>
              <p>事实经历</p>
              <h2>事件和投入</h2>
            </div>
            <NotebookPen size={20} />
          </div>
          <div className="field-row three">
            <label className="field">
              <span>归属日期</span>
              <input type="date" value={eventDate} onChange={(event) => { setEventDate(event.target.value); setEventDirty(true); }} />
            </label>
            <label className="field">
              <span>时间段</span>
              <select value={period} onChange={(event) => { setPeriod(event.target.value as EventEntry["period"]); setEventDirty(true); }}>
                {eventPeriods.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="field">
              <span>投入分钟</span>
              <input value={minutes} onChange={(event) => { setMinutes(event.target.value); setEventDirty(true); }} inputMode="numeric" placeholder="0" />
            </label>
          </div>
          <label className="field">
            <span>发生了什么？</span>
            <input
              aria-invalid={Boolean(eventError && !title.trim())}
              value={title}
              onChange={(event) => { setTitle(event.target.value); setEventDirty(true); setEventError(""); }}
              placeholder="用一句话写下真实发生的事情"
            />
            {eventError && <small className="field-error">{eventError}</small>}
          </label>
          <div className="field-row">
            <label className="field">
              <span>项目</span>
              <select value={projectId} onChange={(event) => { setProjectId(event.target.value); setEventDirty(true); }}>
                <option value="">暂不设置项目</option>
                {normalProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>完成度</span>
              <select value={completion} onChange={(event) => { setCompletion(event.target.value as CompletionValue); setEventDirty(true); }}>
                {completionOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.emoji} {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span>事实补充（可选）</span>
            <textarea className="event-note-textarea" value={note} onChange={(event) => { setNote(event.target.value); setEventDirty(true); }} placeholder="补充客观背景、结果或需要记住的细节" />
          </label>
          <div className="panel-actions">
            <button
              className={`quiet-save-button ${eventDirty ? "ready" : ""}`}
              type="submit"
              disabled={!eventDirty || eventSubmit === "saving"}
            >
              {eventSubmit === "saving" ? "保存中…" : eventSubmit === "saved" ? "已保存" : eventSubmit === "failed" ? "保存失败，重试" : "保存"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
