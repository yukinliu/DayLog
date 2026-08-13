import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, CalendarClock, CircleCheck, CirclePause, GitMerge, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { formatMinutes } from "../lib/format";
import { stableProjectColor } from "../lib/projectColor";
import type { EventEntry, Project } from "../types/daylog";

interface ProjectsPageProps {
  projects: Project[];
  events: EventEntry[];
  onCreateProject: () => Project;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string, options?: { targetProjectId?: string | null }) => void;
  onMergeProject: (id: string, targetId: string) => void;
}

type ProjectView = "all" | "dueSoon" | "recent" | "overdue";
type ProjectStatus = Project["progress"];

function createdTime(project: Project) {
  const value = new Date(project.createdAt).getTime();
  return Number.isFinite(value) ? value : 0;
}

function isUnnamedProject(project: Project) {
  return project.lifecycle === "normal"
    && (project.progress === "active" || project.progress === "planned")
    && project.name.trim().startsWith("未命名");
}

function localDateKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isOverdue(project: Project) {
  return project.ddlType === "date"
    && Boolean(project.ddlDate && project.ddlDate < localDateKey())
    && (project.progress === "active" || project.progress === "planned");
}

function isDueSoon(project: Project) {
  if (project.ddlType !== "date" || !project.ddlDate) return false;
  if (project.progress !== "active" && project.progress !== "planned") return false;
  const today = new Date(`${localDateKey()}T00:00:00`);
  const deadline = new Date(`${project.ddlDate}T00:00:00`);
  const days = Math.round((deadline.getTime() - today.getTime()) / 86_400_000);
  return days >= 0 && days <= 30;
}

function isRecent(project: Project) {
  const age = Date.now() - createdTime(project);
  return age >= 0 && age <= 24 * 60 * 60 * 1000;
}

function matchesView(project: Project, view: ProjectView) {
  if (view === "dueSoon") return isDueSoon(project);
  if (view === "recent") return isRecent(project);
  if (view === "overdue") return isOverdue(project);
  return true;
}

function ddlSortValue(project: Project) {
  if (project.ddlType === "date" && project.ddlDate) {
    const value = new Date(`${project.ddlDate}T00:00:00`).getTime();
    return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
  }
  if (project.ddlType === "long-term") return Number.MAX_SAFE_INTEGER - 1;
  return Number.MAX_SAFE_INTEGER;
}

function sortProjects(projects: Project[]) {
  return [...projects].sort((a, b) => {
    const freshDiff = Number(isUnnamedProject(b)) - Number(isUnnamedProject(a));
    if (freshDiff) return freshDiff;
    const ddlDiff = ddlSortValue(a) - ddlSortValue(b);
    if (ddlDiff) return ddlDiff;
    const createdDiff = createdTime(b) - createdTime(a);
    if (createdDiff) return createdDiff;
    return a.name.localeCompare(b.name, "zh-Hans-CN");
  });
}

function projectDdlLabel(project: Project) {
  if (project.ddlType === "date") return project.ddlDate ?? "未设置日期";
  if (project.ddlType === "long-term") return "长期有效";
  return "暂未确定";
}

function progressLabel(project: Project) {
  if (project.progress === "completed") return "已完成";
  if (project.progress === "paused") return "已暂停";
  if (project.progress === "planned") return "待计划";
  return "进行中";
}

function viewLabel(view: ProjectView) {
  if (view === "dueSoon") return "临期";
  if (view === "recent") return "新增";
  if (view === "overdue") return "逾期";
  return "全部";
}

export function ProjectsPage({
  projects,
  events,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onMergeProject
}: ProjectsPageProps) {
  const [view, setView] = useState<ProjectView>("all");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<"merge" | "delete" | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState("");
  const [deleteMode, setDeleteMode] = useState<"unset" | "merge">("unset");
  const [deleteTargetId, setDeleteTargetId] = useState("");
  const [projectNameDraft, setProjectNameDraft] = useState("");
  const normalProjects = useMemo(
    () => projects.filter((project) => project.lifecycle === "normal"),
    [projects]
  );
  const projectMetrics = useMemo(() => {
    const metrics = new Map<string, { minutes: number; dates: Set<string> }>();
    events.forEach((event) => {
      if (!event.projectId) return;
      const current = metrics.get(event.projectId) ?? { minutes: 0, dates: new Set<string>() };
      current.minutes += event.minutes;
      current.dates.add(event.date);
      metrics.set(event.projectId, current);
    });
    return metrics;
  }, [events]);
  const projectCounts = useMemo(() => ({
    all: normalProjects.length,
    dueSoon: normalProjects.filter(isDueSoon).length,
    recent: normalProjects.filter(isRecent).length,
    overdue: normalProjects.filter(isOverdue).length
  }), [normalProjects]);
  const visibleProjects = useMemo(
    () => sortProjects(normalProjects.filter((project) => matchesView(project, view))),
    [normalProjects, view]
  );
  const selectedProject = normalProjects.find((project) => project.id === selectedProjectId) ?? null;

  useEffect(() => {
    if (selectedProjectId) return;
    setSelectedProjectId(visibleProjects[0]?.id ?? null);
  }, [selectedProjectId, visibleProjects]);

  useEffect(() => {
    setProjectNameDraft(selectedProject?.name ?? "");
  }, [selectedProject?.id, selectedProject?.name]);

  useEffect(() => {
    if (!actionDialog) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActionDialog(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [actionDialog]);

  const selectedEvents = selectedProject
    ? events.filter((event) => event.projectId === selectedProject.id)
    : [];
  const totalMinutes = selectedEvents.reduce((sum, event) => sum + event.minutes, 0);
  const recordDays = new Set(selectedEvents.map((event) => event.date)).size;
  const mergeTargets = selectedProject
    ? normalProjects.filter((project) => project.id !== selectedProject.id)
    : [];
  const selectedStatus = selectedProject?.progress ?? "active";

  const updateSelectedProject = (patch: Partial<Project>) => {
    if (!selectedProject) return;
    onUpdateProject({ ...selectedProject, ...patch });
  };

  const createNewProject = () => {
    if (normalProjects.some(isUnnamedProject) && !window.confirm("还有未命名项目未处理，仍要继续新增吗？")) return;
    const project = onCreateProject();
    setView("all");
    setSelectedProjectId(project.id);
  };

  const setProjectStatus = (nextStatus: ProjectStatus) => {
    if (!selectedProject) return;
    updateSelectedProject({ progress: nextStatus });
  };

  const openMergeDialog = () => {
    setMergeTargetId(mergeTargets[0]?.id ?? "");
    setActionDialog("merge");
  };

  const openDeleteDialog = () => {
    if (!selectedProject) return;
    setDeleteMode("unset");
    setDeleteTargetId(mergeTargets[0]?.id ?? "");
    setActionDialog("delete");
  };

  const confirmMerge = () => {
    if (!selectedProject || !mergeTargetId) return;
    onMergeProject(selectedProject.id, mergeTargetId);
    setSelectedProjectId(mergeTargetId);
    setActionDialog(null);
  };

  const confirmDelete = () => {
    if (!selectedProject) return;
    onDeleteProject(selectedProject.id, {
      targetProjectId: deleteMode === "merge" ? deleteTargetId : null
    });
    setSelectedProjectId(null);
    setActionDialog(null);
  };

  const closeMoreMenus = () => {
    const openMenus = document.querySelectorAll<HTMLDetailsElement>(".more-actions[open]");
    openMenus.forEach((item) => {
      item.open = false;
    });
  };

  const handleMoreAction = (action: "merge" | "delete") => {
    closeMoreMenus();
    if (action === "merge") {
      openMergeDialog();
    } else {
      openDeleteDialog();
    }
  };

  return (
    <section className="page-grid projects-page">
      <div className="toolbar-card">
        <div className="segmented">
          {(["all", "dueSoon", "recent", "overdue"] as ProjectView[]).map((item) => (
            <button
              className={view === item ? "active" : ""}
              key={item}
              type="button"
              onClick={() => {
                setView(item);
                const nextProjects = sortProjects(normalProjects.filter((project) => matchesView(project, item)));
                setSelectedProjectId(nextProjects[0]?.id ?? null);
              }}
            >
              {viewLabel(item)} {projectCounts[item]}
            </button>
          ))}
        </div>
        <button className="primary-button compact" type="button" onClick={createNewProject}>
          <Plus size={17} />
          新增项目
        </button>
      </div>

      <div className="split-view">
        <div className="project-list">
          {visibleProjects.map((project) => {
            const metrics = projectMetrics.get(project.id);
            const minutes = metrics?.minutes ?? 0;
            return (
              <button
                className={`project-row ${project.id === selectedProject?.id ? "selected" : ""}`}
                key={project.id}
                type="button"
                onClick={() => setSelectedProjectId(project.id)}
              >
                <i className="project-color-dot" style={{ background: stableProjectColor(project.id, project.createdAt, project.colorKey) }} />
                <div>
                  <strong>{project.name}</strong>
                  <span>{projectDdlLabel(project)} · {progressLabel(project)} · {metrics?.dates.size ?? 0} 天</span>
                </div>
                <em>{formatMinutes(minutes)}</em>
              </button>
            );
          })}
          {!visibleProjects.length && (
            <div className="empty-note">当前分类下还没有项目。</div>
          )}
        </div>

        <aside className="detail-panel">
          {selectedProject ? (
            <>
              <div className="detail-head">
                <div>
                  <p>项目详情</p>
                  <h2>{selectedProject.name}</h2>
                </div>
                <details className="more-actions">
                  <summary aria-label="更多操作">
                    <span>项目管理</span>
                    <MoreHorizontal size={21} />
                  </summary>
                  <div>
                    <button type="button" onClick={() => handleMoreAction("merge")} disabled={!mergeTargets.length}>
                      <GitMerge size={16} />
                      合并至
                    </button>
                    <button type="button" onClick={() => handleMoreAction("delete")}>
                      <Trash2 size={16} />
                      删除
                    </button>
                  </div>
                </details>
              </div>
              {!matchesView(selectedProject, view) && (
                <div className="project-moved-note">项目条件已经变化，你可以继续完成当前编辑；切换筛选后将按新结果定位。</div>
              )}
              <dl className="detail-metrics">
                <div>
                  <dt>累计投入</dt>
                  <dd>{formatMinutes(totalMinutes)}</dd>
                </div>
                <div>
                  <dt>记录天数</dt>
                  <dd>{recordDays} 天</dd>
                </div>
              </dl>
              <div className="project-edit-grid">
                <label className="field">
                  <span>项目名称</span>
                  <input
                    value={projectNameDraft}
                    onChange={(event) => setProjectNameDraft(event.target.value)}
                    onBlur={() => {
                      const name = projectNameDraft.trim();
                      if (!name) {
                        setProjectNameDraft(selectedProject.name);
                      } else if (name !== selectedProject.name) {
                        updateSelectedProject({ name });
                      }
                    }}
                  />
                </label>
                <label className="field">
                  <span>截止日期</span>
                  <select
                    value={selectedProject.ddlType}
                    onChange={(event) => {
                      const ddlType = event.target.value as Project["ddlType"];
                      updateSelectedProject({
                        ddlType,
                        ddlDate: ddlType === "date" ? (selectedProject.ddlDate ?? localDateKey()) : undefined
                      });
                    }}
                  >
                    <option value="long-term">长期有效</option>
                    <option value="undecided">暂未确定</option>
                    <option value="date">指定日期</option>
                  </select>
                </label>
                {selectedProject.ddlType === "date" && (
                  <label className="field">
                    <span>指定日期</span>
                    <input
                      type="date"
                      value={selectedProject.ddlDate ?? ""}
                      onChange={(event) => updateSelectedProject({ ddlDate: event.target.value || undefined })}
                    />
                  </label>
                )}
              </div>
              <div className="tag-row project-status-row">
                <button
                  className={`state-chip active-state ${selectedStatus === "active" ? "selected" : ""}`}
                  type="button"
                  onClick={() => setProjectStatus("active")}
                >
                  <Activity size={15} />
                  进行中
                </button>
                <button
                  className={`state-chip planned-state ${selectedStatus === "planned" ? "selected" : ""}`}
                  type="button"
                  onClick={() => setProjectStatus("planned")}
                >
                  <CalendarClock size={15} />
                  待计划
                </button>
                <button
                  className={`state-chip complete-state ${selectedStatus === "completed" ? "selected" : ""}`}
                  type="button"
                  onClick={() => setProjectStatus("completed")}
                >
                  <CircleCheck size={15} />
                  已完成
                </button>
                <button
                  className={`state-chip pause-state ${selectedStatus === "paused" ? "selected" : ""}`}
                  type="button"
                  onClick={() => setProjectStatus("paused")}
                >
                  <CirclePause size={15} />
                  暂停中
                </button>
              </div>
              <div className="section-title">关联事实经历</div>
              <div className="event-stack">
                {selectedEvents.map((event) => (
                  <div className="event-mini" key={event.id}>
                    <span>{event.date}</span>
                    <strong>{event.title}</strong>
                    <em>{formatMinutes(event.minutes)}</em>
                  </div>
                ))}
                {!selectedEvents.length && <span className="muted-text">这个项目下还没有事实经历。</span>}
              </div>
            </>
          ) : (
            <span className="muted-text">选择一个项目查看详情。</span>
          )}
        </aside>
      </div>
      {actionDialog && selectedProject && (
        <div className="action-dialog-backdrop" role="presentation" onMouseDown={() => setActionDialog(null)}>
          <section className="action-dialog" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            {actionDialog === "merge" ? (
              <>
                <div className="action-dialog-heading">
                  <i><GitMerge size={18} /></i>
                  <div><h3>合并到其他项目</h3><p>当前项目及其事实经历会一起转入目标项目。</p></div>
                </div>
                <div className="project-transfer-preview">
                  <span><small>当前项目</small><strong>{selectedProject.name}</strong></span>
                  <ArrowRight size={17} />
                  <span><small>转入项目</small><strong>{mergeTargets.find((project) => project.id === mergeTargetId)?.name ?? "请选择"}</strong></span>
                </div>
                <label className="field">
                  <span>选择目标项目</span>
                  <select value={mergeTargetId} onChange={(event) => setMergeTargetId(event.target.value)}>
                    {mergeTargets.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </label>
                <div className="dialog-actions">
                  <button className="secondary-button" type="button" onClick={() => setActionDialog(null)}>取消</button>
                  <button className="primary-button compact" type="button" disabled={!mergeTargetId} onClick={confirmMerge}>确认合并</button>
                </div>
              </>
            ) : (
              <>
                <div className="action-dialog-heading danger">
                  <i><Trash2 size={18} /></i>
                  <div>
                    <h3>删除项目</h3>
                    <p>{selectedEvents.length ? `「${selectedProject.name}」下有 ${selectedEvents.length} 条事实经历，请先决定如何保留。` : `删除「${selectedProject.name}」后将无法恢复。`}</p>
                  </div>
                </div>
                {selectedEvents.length > 0 && (
                  <div className="radio-stack">
                    <label className={`radio-card ${deleteMode === "unset" ? "selected" : ""}`}>
                      <input type="radio" checked={deleteMode === "unset"} onChange={() => setDeleteMode("unset")} />
                      <span><strong>保留全部事实经历</strong><small>这些记录改为“暂不设置项目”</small></span>
                    </label>
                    <label className={`radio-card ${deleteMode === "merge" ? "selected" : ""}`}>
                      <input type="radio" checked={deleteMode === "merge"} onChange={() => setDeleteMode("merge")} />
                      <span><strong>转移到其他项目</strong><small>事实经历会归入你选择的项目</small></span>
                    </label>
                  </div>
                )}
                {deleteMode === "merge" && selectedEvents.length > 0 && (
                  <label className="field">
                    <span>目标项目</span>
                    <select value={deleteTargetId} onChange={(event) => setDeleteTargetId(event.target.value)}>
                      {mergeTargets.map((project) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </label>
                )}
                <div className="dialog-actions">
                  <button className="secondary-button" type="button" onClick={() => setActionDialog(null)}>取消</button>
                  <button
                    className="primary-button compact danger-button"
                    type="button"
                    disabled={deleteMode === "merge" && !deleteTargetId}
                    onClick={confirmDelete}
                  >
                    确认删除
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
