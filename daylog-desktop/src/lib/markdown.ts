import type { EventEntry, MoodEntry, Project, ThoughtEntry } from "../types/daylog";
import { formatMinutes } from "./format";
import { moodLabel } from "./mood";
import { completionLabel } from "./completion";

function escapeTableCell(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\r?\n/g, "<br>");
}

export function buildDailyMarkdown(params: {
  date: string;
  moods: MoodEntry[];
  thoughts: ThoughtEntry[];
  events: EventEntry[];
  projects: Project[];
}): string {
  const { date, moods, thoughts, events, projects } = params;
  const sortedMoods = [...moods].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const lastMood = sortedMoods[sortedMoods.length - 1];
  const projectName = (id: string | null) => projects.find((project) => project.id === id)?.name ?? "暂不设置项目";
  const totalByProject = events.reduce<Record<string, number>>((acc, event) => {
    const name = projectName(event.projectId);
    acc[name] = (acc[name] ?? 0) + event.minutes;
    return acc;
  }, {});

  return [
    `# ${date} · 见己`,
    "",
    "## 感受体验",
    "",
    "### 情绪状态",
    lastMood ? moodLabel(lastMood.value) : "未记录",
    "",
    "### 想法",
    thoughts.length
      ? thoughts.map((thought) => `- ${thought.createdAt.slice(11, 16)} ${thought.content}`).join("\n")
      : "- 未记录",
    "",
    "## 事实经历",
    "",
    "| 时间 | 事件 | 项目 | 投入 | 完成 | 备注 |",
    "|---|---|---|---:|---|---|",
    events.length
      ? events
          .map(
            (event) =>
              `| ${event.period} | ${escapeTableCell(event.title)} | ${escapeTableCell(projectName(event.projectId))} | ${event.minutes}m | ${completionLabel(event.completion)} | ${escapeTableCell(event.note || "-")} |`
          )
          .join("\n")
      : "| - | 未记录 | - | 0m | - | - |",
    "",
    "## 当日投入",
    "",
    ...Object.entries(totalByProject).map(([name, minutes]) => `- ${name}：${formatMinutes(minutes)}`)
  ].join("\n");
}
