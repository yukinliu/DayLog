import { formatMinutes } from "../lib/format";
import { stableProjectColor } from "../lib/projectColor";
import type { ProjectColorKey } from "../types/daylog";

export interface TimeDistributionItem {
  id: string | null;
  name: string;
  minutes: number;
  createdAt?: string;
  colorKey?: ProjectColorKey;
}

interface TimeDistributionProps {
  items: TimeDistributionItem[];
  totalMinutes: number;
  activeId?: string | null;
  onSelect?: (id: string | null) => void;
  aggregateAtPercent?: number;
  singleAsBar?: boolean;
  showPercent?: boolean;
  hideSliceLabels?: boolean;
}

const otherProjectId = "__other__";

function itemColor(item: TimeDistributionItem) {
  return item.id === otherProjectId ? "#9da39f" : stableProjectColor(item.id, item.createdAt, item.colorKey);
}

function aggregateItems(items: TimeDistributionItem[], totalMinutes: number, threshold?: number) {
  if (!threshold || items.length <= 1 || totalMinutes <= 0) return items;
  const sorted = [...items].sort((a, b) => b.minutes - a.minutes);
  let accumulated = 0;
  let visibleCount = 0;
  while (visibleCount < sorted.length && accumulated / totalMinutes < threshold) {
    accumulated += sorted[visibleCount].minutes;
    visibleCount += 1;
  }
  const rest = sorted.slice(visibleCount);
  if (!rest.length) return sorted;
  return [
    ...sorted.slice(0, visibleCount),
    { id: otherProjectId, name: "其他", minutes: rest.reduce((sum, item) => sum + item.minutes, 0) }
  ];
}

function compactDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function buildConic(items: TimeDistributionItem[], totalMinutes: number) {
  if (!totalMinutes || !items.length) {
    return "conic-gradient(rgba(231, 217, 196, 0.6) 0 100%)";
  }

  let cursor = 0;
  const stops = items.map((item) => {
    const next = cursor + (item.minutes / totalMinutes) * 100;
    const color = itemColor(item);
    const segment = `${color} ${cursor}% ${next}%`;
    cursor = next;
    return segment;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

function buildSlices(items: TimeDistributionItem[], totalMinutes: number) {
  if (!totalMinutes) return [];

  let cursor = 0;
  return items.map((item) => {
    const percentValue = (item.minutes / totalMinutes) * 100;
    const start = cursor;
    const end = cursor + percentValue;
    const mid = (start + end) / 2;
    cursor = end;

    const angle = (mid / 100) * 360 - 90;
    const radians = (angle * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const roundedPercent = Math.round(percentValue);

    return {
      key: item.id ?? item.name,
      percent: roundedPercent,
      showLabel: roundedPercent > 0,
      lineStart: { x: 90 + cos * 59, y: 90 + sin * 59 },
      lineEnd: { x: 90 + cos * 74, y: 90 + sin * 74 },
      text: { x: 90 + cos * 80, y: 90 + sin * 80 },
      anchor: (cos >= 0 ? "start" : "end") as "start" | "end"
    };
  });
}

export function TimeDistribution({
  items,
  totalMinutes,
  activeId,
  onSelect,
  aggregateAtPercent,
  singleAsBar = false,
  showPercent = false,
  hideSliceLabels = false
}: TimeDistributionProps) {
  const canSelect = Boolean(onSelect);
  const visibleItems = aggregateItems(items, totalMinutes, aggregateAtPercent);
  const slices = buildSlices(visibleItems, totalMinutes);

  if (singleAsBar && visibleItems.length === 1) {
    const item = visibleItems[0];
    return (
      <div className="single-distribution">
        <div className="single-distribution-track">
          <i style={{ background: itemColor(item) }} />
        </div>
        <div>
          <span><i style={{ background: itemColor(item) }} />{item.name}</span>
          <strong>{formatMinutes(item.minutes)}</strong>
          <em>100%</em>
        </div>
      </div>
    );
  }

  return (
    <div className="time-distribution">
      <div className="donut-stage">
        <div className="donut" style={{ background: buildConic(visibleItems, totalMinutes) }}>
          <div>
            <strong>{compactDuration(totalMinutes)}</strong>
          </div>
        </div>
        {!hideSliceLabels && slices.length > 0 && (
          <svg className="donut-labels" viewBox="0 0 180 180" aria-hidden="true">
            {slices.filter((slice) => slice.showLabel).map((slice) => (
              <g key={slice.key}>
                <line x1={slice.lineStart.x} x2={slice.lineEnd.x} y1={slice.lineStart.y} y2={slice.lineEnd.y} />
                <text x={slice.text.x} y={slice.text.y} textAnchor={slice.anchor}>
                  {slice.percent}%
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
      <div className={`legend-list ${canSelect ? "clickable-list" : ""}`}>
        {visibleItems.map((item) => {
          const content = (
            <>
              <i style={{ background: itemColor(item) }} />
              <span>{item.name}</span>
              <strong>{formatMinutes(item.minutes)}</strong>
              {showPercent && <em>{totalMinutes ? Math.round((item.minutes / totalMinutes) * 100) : 0}%</em>}
            </>
          );

          return canSelect ? (
            <button
              className={activeId === item.id ? "active" : ""}
              key={item.id ?? item.name}
              type="button"
              onClick={() => onSelect?.(item.id)}
            >
              {content}
            </button>
          ) : (
            <div key={item.id ?? item.name}>{content}</div>
          );
        })}
        {!items.length && <span className="muted-text">这个范围还没有投入记录</span>}
      </div>
    </div>
  );
}
