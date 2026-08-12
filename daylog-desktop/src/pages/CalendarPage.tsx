import { useMemo, useState } from "react";
import { formatMinutes } from "../lib/format";
import { stableProjectColor } from "../lib/projectColor";
import type { EventEntry, Project, ProjectColorKey } from "../types/daylog";

interface CalendarPageProps {
  projects: Project[];
  events: EventEntry[];
  recordDates: string[];
  onSelectDate: (date: string) => void;
}

export function CalendarPage({ projects, events, recordDates, onSelectDate }: CalendarPageProps) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const availableYears = useMemo(() => {
    const years = [...new Set([new Date().getFullYear(), ...events.map((event) => Number(event.date.slice(0, 4))), ...recordDates.map((date) => Number(date.slice(0, 4)))])].sort((a, b) => a - b);
    return years.length ? years : [new Date().getFullYear()];
  }, [events, recordDates]);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const projectById = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, EventEntry[]>();
    events.forEach((event) => {
      const current = grouped.get(event.date) ?? [];
      current.push(event);
      grouped.set(event.date, current);
    });
    return grouped;
  }, [events]);
  const recordDateSet = useMemo(() => new Set(recordDates), [recordDates]);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = eventsByDate.get(date) ?? [];
    const summaryByProject = dayEvents.reduce<Map<string, { count: number; minutes: number }>>((summaries, event) => {
      const key = event.projectId ?? "__unassigned__";
      const current = summaries.get(key) ?? { count: 0, minutes: 0 };
      current.count += 1;
      current.minutes += event.minutes;
      summaries.set(key, current);
      return summaries;
    }, new Map());
    const projectSummaries: Array<{ id: string | null; name: string; count: number; minutes: number; createdAt?: string; colorKey?: ProjectColorKey }> = [...summaryByProject.entries()]
      .map(([id, summary]) => {
        const project = id === "__unassigned__" ? null : projectById.get(id);
        return {
          id: project?.id ?? null,
          name: project?.name ?? "暂不设置项目",
          count: summary.count,
          minutes: summary.minutes,
          createdAt: project?.createdAt,
          colorKey: project?.colorKey
        };
      })
      .sort((a, b) => b.minutes - a.minutes);
    const namedProjects = projectSummaries.filter((project) => project.id);
    const topProjects = namedProjects.slice(0, 3);
    const topProjectIds = new Set(topProjects.map((project) => project.id));
    const restProjects = projectSummaries.filter((project) => !project.id || !topProjectIds.has(project.id));
    const restProjectCount = restProjects.length;
    const restMinutes = restProjects.reduce((sum, project) => sum + project.minutes, 0);
    return { day, date, dayEvents, hasAnyRecord: recordDateSet.has(date), topProjects, restProjectCount, restMinutes };
  });

  return (
    <section className="calendar-page">
      <div className="calendar-head">
        <div>
          <h2>{year} 年 {month} 月</h2>
        </div>
        <div className="calendar-controls">
          <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {availableYears.map((item) => <option key={item} value={item}>{item} 年</option>)}
          </select>
          <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
            {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => <option key={item} value={item}>{item} 月</option>)}
          </select>
        </div>
      </div>
      <div className="month-board">
        {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
          <strong className="weekday" key={day}>{day}</strong>
        ))}
        {Array.from({ length: firstWeekday }, (_, index) => <span className="month-cell ghost" key={`blank-${index}`} />)}
        {days.map((day) => (
          <button
            className={`month-cell ${day.hasAnyRecord ? "has-data" : ""} ${day.date === todayKey ? "today" : ""}`}
            aria-current={day.date === todayKey ? "date" : undefined}
            disabled={!day.hasAnyRecord}
            key={day.day}
            type="button"
            onClick={() => day.hasAnyRecord && onSelectDate(day.date)}
          >
            <span>{day.day}</span>
            {day.dayEvents.length ? (
              <div className="calendar-day-projects">
                {day.topProjects.map((project) => (
                  <span
                    key={project.id}
                    style={{
                      borderColor: `${stableProjectColor(project.id, project.createdAt, project.colorKey)}66`,
                      borderLeftColor: stableProjectColor(project.id, project.createdAt, project.colorKey),
                      borderLeftWidth: 3,
                      background: `${stableProjectColor(project.id, project.createdAt, project.colorKey)}18`
                    }}
                  >
                    <strong>{project.name}</strong>
                    <em>{formatMinutes(project.minutes)}</em>
                  </span>
                ))}
                {day.restProjectCount > 0 && (
                  <em className="more-summary">更多 {day.restProjectCount} 项 · {formatMinutes(day.restMinutes)}</em>
                )}
              </div>
            ) : day.hasAnyRecord ? (
              <small>有记录</small>
            ) : null}
          </button>
        ))}
      </div>
    </section>
  );
}
