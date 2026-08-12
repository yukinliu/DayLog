import { useMemo, useState } from "react";
import { TimeDistribution } from "../components/TimeDistribution";
import { completionOptions } from "../lib/completion";
import { formatMinutes } from "../lib/format";
import { moodOptions } from "../lib/mood";
import type { EventEntry, MoodEntry, Project, ThoughtEntry } from "../types/daylog";

interface StatsPageProps {
  projects: Project[];
  events: EventEntry[];
  moods: MoodEntry[];
  thoughts: ThoughtEntry[];
}

function toDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatSlash(date: string) {
  return date.split("-").join("/");
}

function formatChineseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

const moodScale = moodOptions.map((item) => item.value);

function MoodTrend({ moods }: { moods: MoodEntry[] }) {
  const latestByDate = [...moods]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .reduce<Record<string, MoodEntry>>((acc, mood) => {
      acc[mood.date] = mood;
      return acc;
    }, {});
  const points = Object.values(latestByDate).sort((a, b) => a.date.localeCompare(b.date));
  const width = Math.max(560, points.length * 86);
  const height = 156;
  const top = 20;
  const bottom = 30;
  const usableHeight = height - top - bottom;
  const yForMood = (value: MoodEntry["value"]) => {
    const index = moodScale.indexOf(value);
    return top + ((moodScale.length - 1 - index) / (moodScale.length - 1)) * usableHeight;
  };
  const xForIndex = (index: number) => points.length <= 1 ? width / 2 : 40 + (index / (points.length - 1)) * (width - 80);
  const neutralY = yForMood("neutral");
  const pointCoords = points.map((mood, index) => ({
    mood,
    x: xForIndex(index),
    y: yForMood(mood.value)
  }));
  const trendPath = pointCoords.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = pointCoords[index - 1];
    const controlX = (previous.x + point.x) / 2;
    return `${path} C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
  }, "");

  if (!points.length) {
    return <div className="mood-trend-empty">这个区间还没有感受记录</div>;
  }

  if (points.length === 1) {
    const mood = points[0];
    const option = moodOptions.find((item) => item.value === mood.value);
    return (
      <div className="single-mood-summary">
        <time>{formatChineseDate(mood.date)}</time>
        <span>{option?.emoji ?? "·"}</span>
        <strong>{option?.label ?? "已记录"}</strong>
      </div>
    );
  }

  return (
    <div className="mood-trend-scroll">
      <svg className="mood-trend-chart" width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="感受体验趋势">
        {[0, 1, 2, 3, 4, 5, 6].map((line) => {
          const y = top + (line / 6) * usableHeight;
          return <line className="trend-grid-line" key={line} x1="24" x2={width - 24} y1={y} y2={y} />;
        })}
        <line className="trend-neutral-line" x1="24" x2={width - 24} y1={neutralY} y2={neutralY} />
        {pointCoords.length > 1 && <path className="trend-path" d={trendPath} />}
        {pointCoords.map(({ mood, x, y }) => {
          const option = moodOptions.find((item) => item.value === mood.value);
          return (
            <g key={mood.id}>
              <text className="trend-emoji" x={x} y={y + 7} textAnchor="middle">{option?.emoji ?? "·"}</text>
              <text className="trend-date" x={x} y={height - 10} textAnchor="middle">{mood.date.slice(5).replace("-", "/")}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function StatsPage({ projects, events, moods, thoughts }: StatsPageProps) {
  const availableDates = useMemo(
    () => [...new Set([...events, ...moods, ...thoughts].map((entry) => entry.date))].sort(),
    [events, moods, thoughts]
  );
  const latestDate = availableDates[availableDates.length - 1] ?? toDateKey(new Date());
  const earliestDate = availableDates[0] ?? latestDate;
  const today = toDateKey(new Date());
  const [rangeMode, setRangeMode] = useState<"week" | "month" | "custom" | "all">("week");
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(today);

  const baseDate = toDate(today);
  const weekStart = addDays(baseDate, -((baseDate.getDay() + 6) % 7));
  const monthStart = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const range = (() => {
    if (rangeMode === "week") return { start: toDateKey(weekStart), end: toDateKey(addDays(weekStart, 6)), title: "本周" };
    if (rangeMode === "month") return { start: toDateKey(monthStart), end: toDateKey(new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0)), title: "本月" };
    if (rangeMode === "custom") return { start: customStart <= customEnd ? customStart : customEnd, end: customStart <= customEnd ? customEnd : customStart, title: "自定义" };
    return { start: earliestDate, end: latestDate, title: "全部" };
  })();
  const inRange = (date: string) => date >= range.start && date <= range.end;
  const selectedEvents = events.filter((event) => inRange(event.date));
  const selectedMoods = moods.filter((mood) => inRange(mood.date));
  const selectedThoughts = thoughts.filter((thought) => inRange(thought.date));
  const thoughtSummaries = [...selectedThoughts.reduce<Map<string, number>>((summaries, thought) => {
    summaries.set(thought.date, (summaries.get(thought.date) ?? 0) + 1);
    return summaries;
  }, new Map()).entries()].sort(([dateA], [dateB]) => dateB.localeCompare(dateA));
  const recordedDays = new Set([...selectedEvents, ...selectedMoods, ...selectedThoughts].map((entry) => entry.date)).size;
  const thoughtDays = new Set(selectedThoughts.map((thought) => thought.date)).size;
  const totalMinutes = selectedEvents.reduce((sum, event) => sum + event.minutes, 0);

  const projectById = new Map(projects.map((project) => [project.id, project]));
  const minutesByProject = selectedEvents.reduce<Map<string, number>>((totals, event) => {
    const key = event.projectId ?? "__unassigned__";
    totals.set(key, (totals.get(key) ?? 0) + event.minutes);
    return totals;
  }, new Map());
  const projectTotals = [...minutesByProject.entries()]
    .map(([id, minutes]) => {
      const project = id === "__unassigned__" ? null : projectById.get(id);
      return {
        id: project?.id ?? null,
        name: project?.name ?? "暂不设置项目",
        createdAt: project?.createdAt,
        colorKey: project?.colorKey,
        minutes
      };
    })
    .sort((a, b) => b.minutes - a.minutes);

  const completionTotals = completionOptions
    .map((item) => ({
      ...item,
      count: selectedEvents.filter((event) => event.completion === item.value).length
    }));
  const rangeLabel = range.start === range.end ? formatSlash(range.start) : `${formatSlash(range.start)} 至 ${formatSlash(range.end)}`;

  return (
    <section className="stats-layout stats-only">
      <div className="stats-main">
        <div className="range-toolbar single-day">
          <div>
            <strong>{range.title} · {rangeLabel}</strong>
          </div>
          <div className="range-actions" aria-label="区间选择">
            {[
              ["week", "本周"],
              ["month", "本月"],
              ["custom", "自定义"],
              ["all", "全部"]
            ].map(([mode, label]) => (
              <button
                className={rangeMode === mode ? "active" : ""}
                key={mode}
                type="button"
                onClick={() => setRangeMode(mode as typeof rangeMode)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {rangeMode === "custom" && (
          <div className="custom-range-row">
            <label>
              <span>开始</span>
              <input type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
            </label>
            <label>
              <span>结束</span>
              <input type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
            </label>
          </div>
        )}

        <div className="metric-grid">
          <div className="metric-card">
            <span>记录天数</span>
            <strong>{recordedDays} 天</strong>
          </div>
          <div className="metric-card">
            <span>想法</span>
            <strong>{selectedThoughts.length} 条</strong>
          </div>
          <div className="metric-card">
            <span>事实经历</span>
            <strong>{selectedEvents.length} 条</strong>
          </div>
          <div className="metric-card">
            <span>累计投入</span>
            <strong>{formatMinutes(totalMinutes)}</strong>
          </div>
        </div>

        <div className="stats-content-grid">
          <article className="soft-panel stat-mood">
            <p>感受体验</p>
            <h2>{selectedMoods.length} 条 · {new Set(selectedMoods.map((mood) => mood.date)).size} 天</h2>
            <MoodTrend moods={selectedMoods} />
          </article>

          <article className="soft-panel stat-thoughts">
            <p>想法</p>
            <h2>{selectedThoughts.length} 条 · {thoughtDays} 天</h2>
            <div className="thought-summary-list">
              {thoughtSummaries.map(([date, count]) => (
                <div key={date}>
                  <span>{formatChineseDate(date)}</span>
                  <strong>{count} 条</strong>
                </div>
              ))}
              {!thoughtSummaries.length && <span className="muted-text">这个区间还没有想法记录</span>}
            </div>
          </article>

          <article className="soft-panel stat-time">
            <p>时间分布</p>
            <TimeDistribution
              items={projectTotals}
              totalMinutes={totalMinutes}
              aggregateAtPercent={0.8}
              showPercent
            />
          </article>

          <article className="soft-panel stat-completion">
            <p>完成状态</p>
            <div className="legend-list completion-list">
              {completionTotals.map((item) => (
                <div key={item.value}>
                  <span>{item.emoji} {item.label}</span>
                  <strong>{item.count} 条 · {percent(item.count, selectedEvents.length)}%</strong>
                </div>
              ))}
              {!completionTotals.length && <span className="muted-text">这个区间还没有完成状态</span>}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
