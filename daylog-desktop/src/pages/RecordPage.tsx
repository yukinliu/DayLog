import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, ChevronDown, Trash2 } from "lucide-react";
import { completionOptions } from "../lib/completion";
import { formatMinutes } from "../lib/format";
import { moodOptions } from "../lib/mood";
import { loadRecordDrafts, saveEventDraft, saveReflectionDraft } from "../lib/recordDraft";
import { eventPeriods, type CompletionValue, type EventEntry, type MoodEntry, type MoodValue, type Project, type ThoughtEntry } from "../types/daylog";

interface RecordPageProps {
  projects: Project[];
  moods: MoodEntry[];
  thoughts: ThoughtEntry[];
  events: EventEntry[];
  greeting: string;
  openingSequence: number;
  openingVisible: boolean;
  openingStarted: boolean;
  onOpeningReady: () => void;
  onDismissOpening: () => void;
  summary: {
    lastMood?: { value: MoodValue };
    thoughtCount: number;
    eventCount: number;
    minutes: number;
  };
  onSaveReflection: (input: { date: string; mood?: MoodValue; thought: string }) => Promise<boolean>;
  onDeleteMood: (date: string) => Promise<boolean>;
  onDeleteThought: (id: string) => Promise<boolean>;
  onDeleteEvent: (id: string) => Promise<boolean>;
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

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function recordDateLabel(date: string, today: string) {
  if (date === today) return "记录今天";
  const [, month, day] = date.split("-");
  return `补记 · ${Number(month)}月${Number(day)}日`;
}

function feedbackDateLabel(date: string) {
  const [, month, day] = date.split("-");
  return `${Number(month)}月${Number(day)}日 · 已记录`;
}

function lastItem<T>(items: T[]) {
  return items[items.length - 1];
}

type SubmitStatus = "idle" | "saving" | "saved" | "failed";
type PendingDelete = { kind: "mood" | "thought" | "event"; id: string } | null;

function InlineDeleteAction({
  pending,
  deleting,
  onRequest,
  onCancel,
  onConfirm,
  actionLabel = "删除"
}: {
  pending: boolean;
  deleting: boolean;
  onRequest: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  actionLabel?: "删除" | "清除";
}) {
  if (pending) {
    return (
      <span className="inline-delete-confirm">
        <span>确认{actionLabel}？</span>
        <button type="button" onClick={onCancel} disabled={deleting}>取消</button>
        <button type="button" className="confirm" onClick={onConfirm} disabled={deleting}>{deleting ? `${actionLabel}中…` : actionLabel}</button>
      </span>
    );
  }
  return (
    <button type="button" className="record-row-delete" onClick={onRequest} aria-label={`${actionLabel}记录`}>
      <Trash2 size={12} />
      <span>{actionLabel}</span>
    </button>
  );
}

function previousRecordSummary(today: string, moods: MoodEntry[], thoughts: ThoughtEntry[], events: EventEntry[]) {
  const yesterdayDate = new Date(`${today}T00:00:00`);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = localDateKey(yesterdayDate);
  const dates = [...new Set([...moods, ...thoughts, ...events].map((entry) => entry.date))]
    .filter((date) => date < today)
    .sort();
  const target = dates.includes(yesterday) ? yesterday : dates[dates.length - 1];
  if (!target) return "不必急着整理生活，先留下此刻真实发生的事。";
  const targetThoughts = thoughts.filter((entry) => entry.date === target).length;
  const targetEvents = events.filter((entry) => entry.date === target);
  const targetMoods = moods.filter((entry) => entry.date === target).length;
  const minutes = targetEvents.reduce((sum, event) => sum + event.minutes, 0);
  const parts = [
    targetMoods ? "一份感受" : "",
    targetEvents.length ? `${targetEvents.length} 条事实经历` : "",
    targetThoughts ? `${targetThoughts} 个想法` : "",
    minutes ? `投入 ${formatMinutes(minutes)}` : ""
  ].filter(Boolean);
  const dateLabel = target === yesterday ? "昨天" : `上一次记录（${Number(target.slice(5, 7))}月${Number(target.slice(8, 10))}日）`;
  return `${dateLabel}，你留下了${parts.join("、")}。`;
}

export function RecordPage({ projects, moods, thoughts, events, greeting, openingSequence, openingVisible, openingStarted, onOpeningReady, onDismissOpening, summary, onSaveReflection, onDeleteMood, onDeleteThought, onDeleteEvent, onSaveEvent }: RecordPageProps) {
  const [greetingLanding, setGreetingLanding] = useState(false);
  const today = localDateKey();
  const [initialDrafts] = useState(loadRecordDrafts);
  const [reflectionDate, setReflectionDate] = useState(initialDrafts.reflection?.date ?? today);
  const initialReflectionDate = initialDrafts.reflection?.date ?? today;
  const initialSavedMoods = moods
    .filter((entry) => entry.date === initialReflectionDate)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const initialSavedMood = lastItem(initialSavedMoods)?.value ?? null;
  const [moodValue, setMoodValue] = useState<MoodValue | null>(initialDrafts.reflection?.mood ?? initialSavedMood);
  const [thought, setThought] = useState(initialDrafts.reflection?.thought ?? "");
  const [eventDate, setEventDate] = useState(initialDrafts.event?.date ?? today);
  const [period, setPeriod] = useState<EventEntry["period"]>(initialDrafts.event?.period ?? "上午");
  const [minutes, setMinutes] = useState(initialDrafts.event?.minutes ?? "");
  const [title, setTitle] = useState(initialDrafts.event?.title ?? "");
  const [projectId, setProjectId] = useState(initialDrafts.event?.projectId ?? "");
  const [completion, setCompletion] = useState<CompletionValue>(initialDrafts.event?.completion ?? "progress");
  const [note, setNote] = useState(initialDrafts.event?.note ?? "");
  const [moodDirty, setMoodDirty] = useState(Boolean(initialDrafts.reflection?.mood));
  const [eventDirty, setEventDirty] = useState(Boolean(initialDrafts.event));
  const [reflectionSubmit, setReflectionSubmit] = useState<SubmitStatus>("idle");
  const [eventSubmit, setEventSubmit] = useState<SubmitStatus>("idle");
  const [eventError, setEventError] = useState("");
  const [eventDetailsExpanded, setEventDetailsExpanded] = useState(Boolean(initialDrafts.event?.projectId || initialDrafts.event?.note));
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const lastMoodOption = summary.lastMood ? moodOptions.find((item) => item.value === summary.lastMood?.value) : null;
  const normalProjects = projects.filter((project) => project.lifecycle === "normal");
  const reflectionThoughts = useMemo(
    () => thoughts.filter((entry) => entry.date === reflectionDate).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [thoughts, reflectionDate]
  );
  const eventDateEvents = useMemo(
    () => events.filter((entry) => entry.date === eventDate).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [events, eventDate]
  );
  const reflectionMoods = useMemo(
    () => moods.filter((entry) => entry.date === reflectionDate).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [moods, reflectionDate]
  );
  const savedMood = lastItem(reflectionMoods) ?? null;
  const reflectionDirty = moodDirty || Boolean(thought.trim());
  const openingSummary = useMemo(
    () => previousRecordSummary(today, moods, thoughts, events),
    [today, moods, thoughts, events]
  );

  useEffect(() => {
    if (!openingVisible || openingStarted) return;
    const frame = window.requestAnimationFrame(onOpeningReady);
    return () => window.cancelAnimationFrame(frame);
  }, [openingStarted, openingVisible, onOpeningReady]);

  useEffect(() => {
    if (openingVisible) {
      setGreetingLanding(false);
      return;
    }
    if (!openingSequence) return;
    setGreetingLanding(true);
    const timer = window.setTimeout(() => setGreetingLanding(false), 950);
    return () => window.clearTimeout(timer);
  }, [openingSequence, openingVisible]);

  useEffect(() => {
    saveReflectionDraft(reflectionDirty
      ? { date: reflectionDate, mood: moodDirty && moodValue ? moodValue : undefined, thought }
      : null);
  }, [reflectionDate, moodDirty, moodValue, thought, reflectionDirty]);

  useEffect(() => {
    if (!moodDirty) setMoodValue(savedMood?.value ?? null);
  }, [moodDirty, savedMood?.id, savedMood?.value]);

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
    if (!reflectionDirty) return;
    const saved = await onSaveReflection({
      date: reflectionDate,
      mood: moodDirty && moodValue ? moodValue : undefined,
      thought
    });
    if (!saved) {
      setReflectionSubmit("failed");
      return;
    }
    setThought("");
    setMoodDirty(false);
    setReflectionSubmit("saved");
    settleSubmitStatus(setReflectionSubmit);
  };

  const changeReflectionDate = (date: string) => {
    setReflectionDate(date);
    setPendingDelete(null);
    const dateMoods = moods
      .filter((entry) => entry.date === date)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const mood = lastItem(dateMoods);
    setMoodValue(mood?.value ?? null);
    setMoodDirty(false);
  };

  const confirmInlineDelete = async () => {
    if (!pendingDelete) return;
    const key = `${pendingDelete.kind}:${pendingDelete.id}`;
    setDeletingKey(key);
    const deleted = pendingDelete.kind === "mood"
      ? await onDeleteMood(pendingDelete.id)
      : pendingDelete.kind === "thought"
        ? await onDeleteThought(pendingDelete.id)
        : await onDeleteEvent(pendingDelete.id);
    setDeletingKey(null);
    if (!deleted) return;
    if (pendingDelete.kind === "mood") {
      setMoodValue(null);
      setMoodDirty(false);
    }
    setPendingDelete(null);
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
    <section
      className={`page-grid record-page ${greetingLanding ? "greeting-landing" : ""}`}
      onPointerDownCapture={(event) => {
        if (openingVisible && (event.target as Element).closest("button, input, select, textarea")) onDismissOpening();
      }}
      onKeyDownCapture={() => openingVisible && onDismissOpening()}
    >
      <div className="record-intro">
        <div>
          <span>今天 · {today.split("-").join("/")}</span>
          <strong>念起觉心，知深见己。</strong>
        </div>
        <p>{greeting}</p>
      </div>

      {openingVisible && openingStarted && (
        <div className="opening-overlay" role="status" aria-live="polite" onPointerDown={onDismissOpening}>
          <div className="opening-glass">
            <p>{greeting}</p>
            <span>{openingSummary}</span>
          </div>
        </div>
      )}

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
          <div className="record-form-body reflection-form-body">
            <div className="panel-heading record-panel-heading">
              <div>
                <p>自我觉察</p>
                <h2>感受与想法</h2>
                <span className="panel-description">记录此刻的感受和想法，在一次次回看中更了解自己。</span>
              </div>
              <label className="record-date-control" title="选择归属日期，可补记过去的记录">
                <CalendarDays size={13} aria-hidden="true" />
                <span>{recordDateLabel(reflectionDate, today)}</span>
                <ChevronDown size={12} aria-hidden="true" />
                <input
                  aria-label="选择自我觉察归属日期，可补记过去的记录"
                  type="date"
                  max={today}
                  value={reflectionDate}
                  onChange={(event) => changeReflectionDate(event.target.value)}
                />
              </label>
            </div>

            <div className="mood-section">
              <div className="mood-picker" aria-label="选择感受">
                {moodOptions.map((mood) => (
                  <button
                    className={`mood-option ${mood.value === moodValue ? "selected" : ""}`}
                    key={mood.value}
                    type="button"
                    onClick={() => {
                      setMoodValue(mood.value);
                      setMoodDirty(mood.value !== savedMood?.value);
                    }}
                  >
                    <span>{mood.emoji}</span>
                    <strong>{mood.label}</strong>
                  </button>
                ))}
              </div>
            </div>

            <label className="field reflection-writing-field">
              <textarea
                aria-label="记录感受和想法"
                className="reflection-textarea"
                value={thought}
                onChange={(event) => setThought(event.target.value)}
                placeholder="写下一句话、一个念头，或此刻身体和情绪的变化。"
              />
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
          </div>

          <div className="record-recall reflection-recall" aria-label={`${reflectionDate} 已保存的自我觉察`}>
            <div className="record-feedback-heading">{feedbackDateLabel(reflectionDate)}</div>
            <div className="record-feedback-list">
              {savedMood && (() => {
                const option = moodOptions.find((item) => item.value === savedMood.value);
                return option ? (
                  <div className="recall-row mood-recall">
                    <span>{option.emoji}</span>
                    <strong>{option.label}</strong>
                    <InlineDeleteAction
                      actionLabel="清除"
                      pending={pendingDelete?.kind === "mood" && pendingDelete.id === reflectionDate}
                      deleting={deletingKey === `mood:${reflectionDate}`}
                      onRequest={() => setPendingDelete({ kind: "mood", id: reflectionDate })}
                      onCancel={() => setPendingDelete(null)}
                      onConfirm={confirmInlineDelete}
                    />
                  </div>
                ) : null;
              })()}
              {reflectionThoughts.map((entry) => (
                <div className="recall-row" key={entry.id}>
                  <time>{entry.createdAt.slice(11, 16)}</time>
                  <span>{entry.content}</span>
                  <InlineDeleteAction
                    pending={pendingDelete?.kind === "thought" && pendingDelete.id === entry.id}
                    deleting={deletingKey === `thought:${entry.id}`}
                    onRequest={() => setPendingDelete({ kind: "thought", id: entry.id })}
                    onCancel={() => setPendingDelete(null)}
                    onConfirm={confirmInlineDelete}
                  />
                </div>
              ))}
            </div>
          </div>
        </form>

        <form className="record-panel fact-panel" onSubmit={submitEvent}>
          <div className="record-form-body fact-form-body">
            <div className="panel-heading record-panel-heading">
              <div>
                <p>事实经历</p>
                <h2>事件和投入</h2>
              </div>
              <label className="record-date-control" title="选择归属日期，可补记过去的记录">
                <CalendarDays size={13} aria-hidden="true" />
                <span>{recordDateLabel(eventDate, today)}</span>
                <ChevronDown size={12} aria-hidden="true" />
                <input
                  aria-label="选择事实经历归属日期，可补记过去的记录"
                  type="date"
                  max={today}
                  value={eventDate}
                  onChange={(event) => {
                    setEventDate(event.target.value);
                    setPendingDelete(null);
                    setEventDirty(Boolean(title.trim() || minutes || projectId || note.trim()));
                  }}
                />
              </label>
            </div>

            <label className="field event-title-field">
              <span>发生了什么？</span>
              <input
                aria-invalid={Boolean(eventError && !title.trim())}
                value={title}
                onChange={(event) => { setTitle(event.target.value); setEventDirty(true); setEventError(""); }}
                placeholder="用一句话写下真实发生的事情"
              />
              {eventError && <small className="field-error">{eventError}</small>}
            </label>
            <div className="field-row event-quick-fields">
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

            <button className={`event-details-toggle ${eventDetailsExpanded ? "expanded" : ""}`} type="button" onClick={() => setEventDetailsExpanded((current) => !current)}>
              <span>补充项目、完成状态与更多细节</span>
              <ChevronDown size={15} />
            </button>

            {eventDetailsExpanded && (
              <div className="event-extra-fields">
                <div className="field-row">
                  <label className="field">
                    <span>项目</span>
                    <select value={projectId} onChange={(event) => { setProjectId(event.target.value); setEventDirty(true); }}>
                      <option value="">暂不设置项目</option>
                      {normalProjects.map((project) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>完成度</span>
                    <select value={completion} onChange={(event) => { setCompletion(event.target.value as CompletionValue); setEventDirty(true); }}>
                      {completionOptions.map((item) => (
                        <option key={item.value} value={item.value}>{item.emoji} {item.label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="field">
                  <span>事实补充（可选）</span>
                  <textarea className="event-note-textarea" value={note} onChange={(event) => { setNote(event.target.value); setEventDirty(true); }} placeholder="补充客观背景、结果或需要记住的细节" />
                </label>
              </div>
            )}

            <div className="panel-actions">
              <button
                className={`quiet-save-button ${eventDirty ? "ready" : ""}`}
                type="submit"
                disabled={!eventDirty || eventSubmit === "saving"}
              >
                {eventSubmit === "saving" ? "保存中…" : eventSubmit === "saved" ? "已保存" : eventSubmit === "failed" ? "保存失败，重试" : "保存"}
              </button>
            </div>
          </div>

          <div className="record-recall event-recall" aria-label={`${eventDate} 已保存的事实经历`}>
            <div className="record-feedback-heading">{feedbackDateLabel(eventDate)}</div>
            <div className="record-feedback-list">
              {eventDateEvents.map((entry) => (
                <div className="recall-row" key={entry.id}>
                  <time>{entry.period}</time>
                  <span>{entry.title}</span>
                  <span className="recall-row-tail">
                    <em>{formatMinutes(entry.minutes)}</em>
                    <InlineDeleteAction
                      pending={pendingDelete?.kind === "event" && pendingDelete.id === entry.id}
                      deleting={deletingKey === `event:${entry.id}`}
                      onRequest={() => setPendingDelete({ kind: "event", id: entry.id })}
                      onCancel={() => setPendingDelete(null)}
                      onConfirm={confirmInlineDelete}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
