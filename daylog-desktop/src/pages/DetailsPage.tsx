import { useEffect, useMemo, useRef, useState } from "react";
import { MousePointer2, Trash2 } from "lucide-react";
import { TimeDistribution } from "../components/TimeDistribution";
import { completionOptions } from "../lib/completion";
import { formatMinutes } from "../lib/format";
import { moodLabel, moodOptions } from "../lib/mood";
import { stableProjectColor } from "../lib/projectColor";
import { eventPeriods, type CompletionValue, type EventEntry, type MoodEntry, type Project, type ThoughtEntry } from "../types/daylog";

interface DetailsPageProps {
  projects: Project[];
  events: EventEntry[];
  moods: MoodEntry[];
  thoughts: ThoughtEntry[];
  onUpdateEvent: (event: EventEntry) => Promise<boolean>;
  onDeleteEvent: (id: string) => void;
  onUpdateThought: (thought: ThoughtEntry) => void;
  onDeleteThought: (id: string) => void;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

type ProjectFilter = { value: string | null } | null;
type EventSaveStatus = "idle" | "dirty" | "saving" | "saved" | "failed";
const periodOrder = eventPeriods;

function formatSlash(date: string) {
  return date.split("-").join("/");
}

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

function safeDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function normalizeEvent(event: EventEntry) {
  return {
    ...event,
    title: event.title.trim(),
    minutes: Math.max(0, Number(event.minutes) || 0),
    note: event.note.trim()
  };
}

export function DetailsPage({
  projects,
  events,
  moods,
  thoughts,
  onUpdateEvent,
  onDeleteEvent,
  onUpdateThought,
  onDeleteThought,
  selectedDate: selectedDateProp,
  onDateChange
}: DetailsPageProps) {
  const availableDates = useMemo(
    () => [...new Set([...events, ...moods, ...thoughts].map((entry) => entry.date))].sort(),
    [events, moods, thoughts]
  );
  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);
  const initialDate = availableDates[availableDates.length - 1] ?? toDateKey(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState(initialDate);
  const selectedDate = selectedDateProp ?? internalSelectedDate;
  const [projectFilter, setProjectFilter] = useState<ProjectFilter>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDraft, setEventDraft] = useState<EventEntry | null>(null);
  const [eventSaveStatus, setEventSaveStatus] = useState<EventSaveStatus>("idle");
  const [editingThoughtId, setEditingThoughtId] = useState<string | null>(null);
  const [thoughtDraft, setThoughtDraft] = useState("");
  const [deleteEventTarget, setDeleteEventTarget] = useState<EventEntry | null>(null);
  const calendarScrollRef = useRef<HTMLDivElement | null>(null);

  const dayEvents = useMemo(
    () => events
      .filter((event) => event.date === selectedDate)
      .sort((a, b) => {
        const periodDiff = periodOrder.indexOf(a.period) - periodOrder.indexOf(b.period);
        return periodDiff || a.createdAt.localeCompare(b.createdAt);
      }),
    [events, selectedDate]
  );
  const dayThoughts = thoughts
    .filter((thought) => thought.date === selectedDate)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const dayMoods = moods
    .filter((mood) => mood.date === selectedDate)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const lastMood = dayMoods[dayMoods.length - 1];
  const totalMinutes = dayEvents.reduce((sum, event) => sum + event.minutes, 0);
  const selectedEvent = dayEvents.find((event) => event.id === selectedEventId) ?? null;
  const visibleEvents = projectFilter
    ? dayEvents.filter((event) => event.projectId === projectFilter.value)
    : dayEvents;
  const normalProjects = projects.filter((project) => project.lifecycle === "normal");

  const projectName = (projectId: string | null) =>
    projectId ? projects.find((project) => project.id === projectId)?.name ?? "已删除项目" : "暂不设置项目";

  const projectTotals = [
    ...projects.map((project) => {
      const matched = dayEvents.filter((event) => event.projectId === project.id);
      return {
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        colorKey: project.colorKey,
        count: matched.length,
        minutes: matched.reduce((sum, event) => sum + event.minutes, 0)
      };
    }),
    {
      id: null,
      name: "暂不设置项目",
      count: dayEvents.filter((event) => !event.projectId).length,
      minutes: dayEvents.filter((event) => !event.projectId).reduce((sum, event) => sum + event.minutes, 0)
    }
  ].filter((item) => item.count > 0).sort((a, b) => b.minutes - a.minutes);

  const completionTotals = completionOptions
    .map((item) => ({ ...item, count: dayEvents.filter((event) => event.completion === item.value).length }))
    .filter((item) => item.count > 0);

  const calendarMonths = useMemo(() => {
    const firstDate = availableDates[0] ?? selectedDate;
    const start = new Date(safeDate(firstDate).getFullYear(), safeDate(firstDate).getMonth(), 1);
    const now = new Date();
    const latestAvailable = safeDate(availableDates[availableDates.length - 1] ?? selectedDate);
    const endSource = latestAvailable > now ? latestAvailable : now;
    const end = new Date(endSource.getFullYear(), endSource.getMonth(), 1);
    const months = [];
    for (let current = new Date(end); current >= start; current = new Date(current.getFullYear(), current.getMonth() - 1, 1)) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      const daysInMonth = new Date(year, month, 0).getDate();
      const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7;
      const dates = Array.from({ length: daysInMonth }, (_, index) => {
        const date = `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
        return { day: index + 1, date, hasData: availableDateSet.has(date) };
      });
      months.push({ year, month, firstWeekday, dates });
    }
    return months;
  }, [availableDateSet, availableDates, selectedDate]);

  const draftIsDirty = Boolean(eventDraft && selectedEvent && JSON.stringify(eventDraft) !== JSON.stringify(selectedEvent));

  const saveEventDraft = async (draft: EventEntry) => {
    const normalized = normalizeEvent(draft);
    if (!normalized.title || !normalized.date) {
      setEventSaveStatus("dirty");
      return false;
    }
    setEventSaveStatus("saving");
    const saved = await onUpdateEvent(normalized);
    setEventSaveStatus(saved ? "saved" : "failed");
    if (saved) window.setTimeout(() => setEventSaveStatus("idle"), 1400);
    return saved;
  };

  const flushEventDraft = () => {
    if (eventDraft && draftIsDirty) void saveEventDraft(eventDraft);
  };

  const startThoughtEdit = (thought: ThoughtEntry) => {
    setEditingThoughtId(thought.id);
    setThoughtDraft(thought.content);
  };

  const cancelThoughtEdit = () => {
    setEditingThoughtId(null);
    setThoughtDraft("");
  };

  const saveThoughtEdit = (thought: ThoughtEntry) => {
    const content = thoughtDraft.trim();
    if (!content) return;
    if (content !== thought.content) onUpdateThought({ ...thought, content });
    cancelThoughtEdit();
  };

  useEffect(() => {
    const monthKey = selectedDate.slice(0, 7);
    const target = calendarScrollRef.current?.querySelector<HTMLElement>(`[data-month="${monthKey}"]`);
    target?.scrollIntoView({ block: "nearest" });
  }, [selectedDate]);

  useEffect(() => {
    setEventDraft(selectedEvent ? { ...selectedEvent } : null);
    setEventSaveStatus("idle");
  }, [selectedEvent?.id]);

  useEffect(() => {
    if (!eventDraft || !draftIsDirty) return;
    setEventSaveStatus("dirty");
    if (!eventDraft.title.trim() || !eventDraft.date) return;
    const timer = window.setTimeout(() => void saveEventDraft(eventDraft), 800);
    return () => window.clearTimeout(timer);
  }, [eventDraft, draftIsDirty]);

  useEffect(() => {
    if (!deleteEventTarget) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDeleteEventTarget(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [deleteEventTarget]);

  const changeSelectedDate = (date: string) => {
    if (!availableDateSet.has(date)) return;
    flushEventDraft();
    if (onDateChange) onDateChange(date);
    else setInternalSelectedDate(date);
    setProjectFilter(null);
    setSelectedEventId(null);
    cancelThoughtEdit();
  };

  const selectProject = (id: string | null) => {
    flushEventDraft();
    if (projectFilter?.value === id) {
      setProjectFilter(null);
      setSelectedEventId(null);
      return;
    }
    setProjectFilter({ value: id });
    setSelectedEventId(null);
  };

  const selectEvent = (id: string) => {
    flushEventDraft();
    setSelectedEventId(id);
  };

  return (
    <section className="details-layout">
      <aside className="mini-calendar">
        <div className="week-row sticky-week">
          {["一", "二", "三", "四", "五", "六", "日"].map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="continuous-months" ref={calendarScrollRef}>
          {calendarMonths.map((month) => (
            <div className="continuous-month" data-month={`${month.year}-${String(month.month).padStart(2, "0")}`} key={`${month.year}-${month.month}`}>
              <h2>{month.year} 年 {month.month} 月</h2>
              <div className="calendar-grid compact-grid">
                {Array.from({ length: month.firstWeekday }, (_, index) => <span className="compact-ghost" key={index} />)}
                {month.dates.map((item) => (
                  <button className={`${item.date === selectedDate ? "active" : ""} ${item.hasData ? "has-data" : ""}`} key={item.date} type="button" disabled={!item.hasData} onClick={() => changeSelectedDate(item.date)}>
                    {item.day}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="details-main">
        <div className="range-toolbar single-day">
          <div><strong>{formatSlash(selectedDate)}</strong></div>
          <span className="inline-pill">事实经历 {dayEvents.length} 条 · 想法 {dayThoughts.length} 条 · {formatMinutes(totalMinutes)}</span>
        </div>

        <section className={`inner-day-panel ${!dayThoughts.length ? "is-empty" : ""}`}>
          <article className="details-mood-card">
            <p>自我觉察</p>
            {lastMood ? (
              <div className="mood-center"><span>{moodOptions.find((item) => item.value === lastMood.value)?.emoji ?? ""}</span><strong>{moodLabel(lastMood.value)}</strong></div>
            ) : (
              <div className="mood-center empty"><span>·</span><strong>未记录</strong></div>
            )}
          </article>
          <article className={`thought-detail-panel details-thought-card ${!dayThoughts.length ? "is-empty" : ""}`}>
            <div className="thought-list">
              {dayThoughts.map((thought) => {
                const isEditing = editingThoughtId === thought.id;
                return (
                  <div className={`thought-row ${isEditing ? "editing" : ""}`} key={thought.id}>
                    <span>{thought.createdAt.slice(11, 16)}</span>
                    {isEditing ? (
                      <div className="thought-inline-editor">
                        <textarea value={thoughtDraft} onChange={(event) => setThoughtDraft(event.target.value)} autoFocus />
                        <div>
                          <button type="button" onClick={cancelThoughtEdit}>取消</button>
                          <button className="thought-save-button" type="button" disabled={!thoughtDraft.trim()} onClick={() => saveThoughtEdit(thought)}>保存</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button className="thought-content-button" type="button" onClick={() => startThoughtEdit(thought)}>{thought.content}</button>
                        <button type="button" onClick={() => { if (window.confirm("确认删除这条想法吗？删除后无法撤销。")) onDeleteThought(thought.id); }} aria-label="删除想法"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                );
              })}
              {!dayThoughts.length && <div className="inner-empty-state"><strong>这一天还没有想法记录</strong><span>有些日子只需要被经过，不必勉强留下结论。</span></div>}
            </div>
          </article>
        </section>

        <section className="outer-day-panel">
          <div className="outer-day-heading">
            <div><p>事实经历</p><strong>{dayEvents.length ? `${dayEvents.length} 条事件，共 ${formatMinutes(totalMinutes)}` : "这一天还没有事实经历"}</strong></div>
            <div className="completion-chips">
              {completionTotals.map((item) => <span key={item.value}>{item.emoji} {item.label} {item.count} · {percent(item.count, dayEvents.length)}%</span>)}
            </div>
          </div>
          <div className="outer-day-content">
            <article className="outer-time-column">
              <p>时间去向</p>
              <TimeDistribution
                activeId={projectFilter?.value}
                items={projectTotals}
                totalMinutes={totalMinutes}
                onSelect={selectProject}
              />
              <div className="project-event-picker">
                <div className="picker-heading"><span>{projectFilter ? projectName(projectFilter.value) : "当日全部事件"}</span><strong>{visibleEvents.length} 条事件</strong></div>
                {visibleEvents.map((event) => {
                      const project = projects.find((item) => item.id === event.projectId);
                      return (
                        <button className={selectedEventId === event.id ? "active" : ""} key={event.id} type="button" onClick={() => selectEvent(event.id)}>
                          <i style={{ background: stableProjectColor(event.projectId, project?.createdAt, project?.colorKey) }} />
                          <span>{event.period}</span>
                          <strong>{event.title}</strong>
                          <em>{formatMinutes(event.minutes)}</em>
                        </button>
                      );
                    })}
                {!visibleEvents.length && <span className="muted-text">这个范围还没有事实经历。</span>}
              </div>
            </article>

            <article className="event-editor direct-event-editor">
              {eventDraft ? (
                <>
                  <div className="detail-head">
                    <div>
                      <p>事件详情</p>
                      <h2>{eventDraft.title || "未命名事件"}</h2>
                    </div>
                    <div className="direct-editor-actions">
                      <span className={`event-save-state ${eventSaveStatus}`}>{eventSaveStatus === "dirty" ? "有未保存修改" : eventSaveStatus === "saving" ? "保存中…" : eventSaveStatus === "saved" ? "已保存" : eventSaveStatus === "failed" ? "保存失败" : ""}</span>
                      <button className="event-delete-trigger" type="button" onClick={() => setDeleteEventTarget(eventDraft)}>
                        <Trash2 size={14} />
                        删除事件
                      </button>
                    </div>
                  </div>
                  <div className="field-row">
                    <label className="field"><span>时间段</span><select value={eventDraft.period} onChange={(event) => setEventDraft({ ...eventDraft, period: event.target.value as EventEntry["period"] })}>{periodOrder.map((period) => <option key={period}>{period}</option>)}</select></label>
                    <label className="field"><span>日期</span><input type="date" value={eventDraft.date} onChange={(event) => setEventDraft({ ...eventDraft, date: event.target.value })} /></label>
                  </div>
                  <label className="field"><span>事件名称</span><input aria-invalid={!eventDraft.title.trim()} value={eventDraft.title} onChange={(event) => setEventDraft({ ...eventDraft, title: event.target.value })} />{!eventDraft.title.trim() && <small className="field-error">事件名称不能为空</small>}</label>
                  <div className="field-row">
                    <label className="field"><span>项目</span><select value={eventDraft.projectId ?? ""} onChange={(event) => setEventDraft({ ...eventDraft, projectId: event.target.value || null })}><option value="">暂不设置项目</option>{normalProjects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
                    <label className="field"><span>投入分钟</span><input type="number" min="0" value={eventDraft.minutes} onChange={(event) => setEventDraft({ ...eventDraft, minutes: Number(event.target.value) })} /></label>
                  </div>
                  <label className="field"><span>完成状态</span><select value={eventDraft.completion} onChange={(event) => setEventDraft({ ...eventDraft, completion: event.target.value as CompletionValue })}>{completionOptions.map((item) => <option key={item.value} value={item.value}>{item.emoji} {item.label}</option>)}</select></label>
                  <label className="field"><span>事实补充</span><textarea value={eventDraft.note} onChange={(event) => setEventDraft({ ...eventDraft, note: event.target.value })} /></label>
                </>
              ) : <div className="event-detail-empty"><MousePointer2 size={20} /><strong>选择一条事件查看详情</strong><span>从左侧事件清单中选择，也可以先按项目筛选。</span></div>}
            </article>
          </div>
        </section>
      </div>
      {deleteEventTarget && (
        <div className="action-dialog-backdrop" role="presentation" onMouseDown={() => setDeleteEventTarget(null)}>
          <section className="action-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-event-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="action-dialog-heading danger">
              <i><Trash2 size={18} /></i>
              <div>
                <h3 id="delete-event-title">删除事实经历</h3>
                <p>确认删除「{deleteEventTarget.title}」吗？这条事实经历及其投入时间将被移除，删除后无法恢复。</p>
              </div>
            </div>
            <div className="dialog-actions">
              <button className="secondary-button" type="button" onClick={() => setDeleteEventTarget(null)}>取消</button>
              <button className="primary-button compact danger-button" type="button" onClick={() => {
                onDeleteEvent(deleteEventTarget.id);
                setSelectedEventId(null);
                setDeleteEventTarget(null);
              }}>确认删除</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
