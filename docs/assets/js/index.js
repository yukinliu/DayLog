    const STORAGE_KEY = location.pathname.endsWith("/test.html") ? "daylog-test-v1" : "daylog-v1";
    const LEGACY_STORAGE_KEYS = location.pathname.endsWith("/test.html") ? ["daily-review-test-v1"] : ["daily-todo-table-v1", "daily-review-v1"];
    const UNASSIGNED_PROJECT = "未归类";

    const state = loadData();
    state.selectedDate = formatDate(new Date());
    state.rangeStart = state.selectedDate;
    state.rangeEnd = "";
    state.viewMode = "date";
    state.todoListView = "time";
    state.projectListCollapsed = parseStoredJson("daily-project-list-collapsed-v3", {});
    state.editingProjectId = null;
    state.editingTaskId = null;
    state.ratingFilter = "all";
    state.sortKey = "";
    state.sortDir = "asc";
    state.draggingTaskId = null;
    state.draggingProjectKey = null;
    state.mergePanelOpen = false;
    state.lastMergeSnapshot = null;
    state.editingDayStateDate = "";
    state.calendarAnchorDate = "";
    state.calendarFilterYear = "";
    state.calendarFilterMonth = "";
    state.preCalendarContext = null;
    state.projectFilterKey = "";
    state.projectClickTimer = 0;

    const els = {
      topbar: document.querySelector("#topbar"),
      greetingMessage: document.querySelector("#greetingMessage"),
      calendarRangeTitle: document.querySelector("#calendarRangeTitle"),
      calendarAllBtn: document.querySelector("#calendarAllBtn"),
      calendarYearSelect: document.querySelector("#calendarYearSelect"),
      calendarMonthSelect: document.querySelector("#calendarMonthSelect"),
      todayBtn: document.querySelector("#todayBtn"),
      tomorrowBtn: document.querySelector("#tomorrowBtn"),
      rangeStart: document.querySelector("#rangeStart"),
      rangeEnd: document.querySelector("#rangeEnd"),
      allTimeBtn: document.querySelector("#allTimeBtn"),
      showAllBtn: document.querySelector("#showAllBtn"),
      projectHint: document.querySelector("#projectHint"),
      manageProjectsBtn: document.querySelector("#manageProjectsBtn"),
      projectRail: document.querySelector("#projectRail"),
      addProjectBtn: document.querySelector("#addProjectBtn"),
      dailyView: document.querySelector("#dailyView"),
      dayStateStrip: document.querySelector("#dayStateStrip"),
      stateStripTitle: document.querySelector("#stateStripTitle"),
      moodSummary: document.querySelector("#moodSummary"),
      thoughtSummary: document.querySelector("#thoughtSummary"),
      openDayStateBtn: document.querySelector("#openDayStateBtn"),
      dayStateDialog: document.querySelector("#dayStateDialog"),
      dayStateForm: document.querySelector("#dayStateForm"),
      dayStateTitle: document.querySelector("#dayStateTitle"),
      moodPicker: document.querySelector("#moodPicker"),
      thoughtText: document.querySelector("#thoughtText"),
      thoughtList: document.querySelector("#thoughtList"),
      noteDetailDialog: document.querySelector("#noteDetailDialog"),
      noteDetailTitle: document.querySelector("#noteDetailTitle"),
      noteDetailBody: document.querySelector("#noteDetailBody"),
      thoughtPreviewDialog: document.querySelector("#thoughtPreviewDialog"),
      thoughtPreviewTitle: document.querySelector("#thoughtPreviewTitle"),
      thoughtPreviewMeta: document.querySelector("#thoughtPreviewMeta"),
      thoughtPreviewContent: document.querySelector("#thoughtPreviewContent"),
      calendarView: document.querySelector("#calendarView"),
      calendarTitle: document.querySelector("#calendarTitle"),
      calendarGrid: document.querySelector("#calendarGrid"),
      totalCount: document.querySelector("#totalCount"),
      pendingCount: document.querySelector("#pendingCount"),
      unplannedCount: document.querySelector("#unplannedCount"),
      doneCount: document.querySelector("#doneCount"),
      doneRate: document.querySelector("#doneRate"),
      metricButtons: document.querySelectorAll("[data-rating-filter]"),
      focusTimeBtn: document.querySelector("#focusTimeBtn"),
      focusTime: document.querySelector("#focusTime"),
      resetSortBtn: document.querySelector("#resetSortBtn"),
      toggleTodoViewBtn: document.querySelector("#toggleTodoViewBtn"),
      taskTable: document.querySelector("#taskTable"),
      taskHead: document.querySelector("#taskHead"),
      taskBody: document.querySelector("#taskBody"),
      emptyState: document.querySelector("#emptyState"),
      hiddenNote: document.querySelector("#hiddenNote"),
      hoverTooltip: document.querySelector("#hoverTooltip"),
      projectDialog: document.querySelector("#projectDialog"),
      projectForm: document.querySelector("#projectForm"),
      projectDialogTitle: document.querySelector("#projectDialogTitle"),
      projectName: document.querySelector("#projectName"),
      projectDdl: document.querySelector("#projectDdl"),
      projectCancelBtn: document.querySelector("#projectCancelBtn"),
      projectListDialog: document.querySelector("#projectListDialog"),
      projectListBody: document.querySelector("#projectListBody"),
      projectListAddBtn: document.querySelector("#projectListAddBtn"),
      projectMergePanel: document.querySelector("#projectMergePanel"),
      mergeSourceProjects: document.querySelector("#mergeSourceProjects"),
      mergeTargetProject: document.querySelector("#mergeTargetProject"),
      mergeConfirmBtn: document.querySelector("#mergeConfirmBtn"),
      mergeUndoBtn: document.querySelector("#mergeUndoBtn"),
      taskDialog: document.querySelector("#taskDialog"),
      taskForm: document.querySelector("#taskForm"),
      taskDialogTitle: document.querySelector("#taskDialogTitle"),
      taskText: document.querySelector("#taskText"),
      taskProject: document.querySelector("#taskProject"),
      taskStartTime: document.querySelector("#taskStartTime"),
      taskDate: document.querySelector("#taskDate"),
      taskMinutes: document.querySelector("#taskMinutes"),
      taskRating: document.querySelectorAll('input[name="taskRating"]'),
      taskNote: document.querySelector("#taskNote"),
      taskCancelBtn: document.querySelector("#taskCancelBtn"),
      timePieDialog: document.querySelector("#timePieDialog"),
      timePieTitle: document.querySelector("#timePieTitle"),
      pieChart: document.querySelector("#pieChart"),
      pieTotal: document.querySelector("#pieTotal"),
      pieLegend: document.querySelector("#pieLegend"),
      timePieCloseBtn: document.querySelector("#timePieCloseBtn")
    };

    init();

    function attachBackdropClose(dialog) {
      if (!dialog) return;
    }

    function normalizeDialogChrome(dialog) {
      if (!dialog) return;
      const body = dialog.querySelector(".dialog-body");
      if (!body || body.dataset.chromeReady === "true") return;
      const title = body.querySelector(":scope > h2");
      const actions = body.querySelector(":scope > .dialog-actions");
      const titlebar = document.createElement("div");
      titlebar.className = "dialog-titlebar";
      if (dialog.id === "thoughtPreviewDialog") titlebar.classList.add("is-titleless");
      if (title) {
        titlebar.append(title);
      } else {
        const spacer = document.createElement("span");
        titlebar.append(spacer);
      }
      const closeButton = document.createElement("button");
      closeButton.className = "dialog-close";
      closeButton.type = "button";
      closeButton.setAttribute("aria-label", "关闭弹窗");
      closeButton.textContent = "×";
      closeButton.addEventListener("click", () => dialog.close());
      titlebar.append(closeButton);
      body.prepend(titlebar);

      const content = document.createElement("div");
      content.className = "dialog-content";
      const children = Array.from(body.children).filter((child) => child !== titlebar && child !== actions);
      children.forEach((child) => content.append(child));
      if (actions) body.insertBefore(content, actions);
      else body.append(content);
      body.dataset.chromeReady = "true";
    }

    function makeDialogMovable(dialog) {
      if (!dialog) return;
      dialog.addEventListener("mousedown", (event) => {
        if (event.button !== 0) return;
        const handle = event.target.closest(".dialog-titlebar");
        if (!handle || event.target.closest("button, input, select, textarea, label")) return;
        const rect = dialog.getBoundingClientRect();
        const startX = event.clientX;
        const startY = event.clientY;
        const offsetX = startX - rect.left;
        const offsetY = startY - rect.top;
        let moved = false;
        function onMove(moveEvent) {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
          if (!moved) return;
          const maxLeft = Math.max(8, window.innerWidth - dialog.offsetWidth - 8);
          const maxTop = Math.max(8, window.innerHeight - dialog.offsetHeight - 8);
          const nextLeft = Math.min(Math.max(8, moveEvent.clientX - offsetX), maxLeft);
          const nextTop = Math.min(Math.max(8, moveEvent.clientY - offsetY), maxTop);
          dialog.classList.add("is-dragged");
          dialog.style.left = `${nextLeft}px`;
          dialog.style.top = `${nextTop}px`;
        }
        function onUp() {
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);
        }
        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      });
    }

    function prepareDialog(dialog) {
      normalizeDialogChrome(dialog);
      attachBackdropClose(dialog);
      makeDialogMovable(dialog);
      makeDialogResizable(dialog);
    }

    function makeDialogResizable(dialog) {
      if (!dialog || dialog.dataset.resizeReady === "true") return;
      dialog.dataset.resizeReady = "true";
      const nativeShowModal = dialog.showModal.bind(dialog);
      dialog.showModal = (...args) => {
        nativeShowModal(...args);
        requestAnimationFrame(() => {
          const rect = dialog.getBoundingClientRect();
          const maxWidth = Math.max(320, window.innerWidth - 28);
          const maxHeight = Math.max(220, window.innerHeight - 28);
          if (!dialog.dataset.userSized) {
            dialog.style.width = `${Math.min(rect.width, maxWidth)}px`;
            dialog.style.height = `${Math.min(rect.height, maxHeight)}px`;
          }
        });
      };
      dialog.addEventListener("mousedown", (event) => {
        const rect = dialog.getBoundingClientRect();
        const nearRight = event.clientX >= rect.right - 22;
        const nearBottom = event.clientY >= rect.bottom - 22;
        if (nearRight || nearBottom) dialog.dataset.userSized = "true";
      }, true);
    }

    function init() {
      els.rangeStart.value = state.selectedDate;

      loadGreetingMessage();

      els.todayBtn.addEventListener("click", () => selectSingleDate(formatDate(new Date())));
      els.tomorrowBtn.addEventListener("click", selectWeekToDate);
      els.rangeStart.addEventListener("change", updateDateControls);
      els.rangeEnd.addEventListener("change", updateDateControls);
      els.allTimeBtn.addEventListener("click", selectAllTime);
      els.showAllBtn.addEventListener("click", toggleCalendarView);
      els.calendarAllBtn.addEventListener("click", selectCalendarAll);
      els.calendarYearSelect.addEventListener("change", handleCalendarYearChange);
      els.calendarMonthSelect.addEventListener("change", handleCalendarMonthChange);
      els.openDayStateBtn.addEventListener("click", openDayStateDialog);
      els.moodSummary.addEventListener("click", handleMoodSummaryClick);
      els.thoughtSummary.addEventListener("click", handleThoughtSummaryClick);
      els.thoughtSummary.addEventListener("mouseover", scheduleHoverTooltip);
      els.thoughtSummary.addEventListener("mousemove", moveHoverTooltip);
      els.thoughtSummary.addEventListener("mouseout", hideHoverTooltip);
      if (els.greetingMessage) {
        els.greetingMessage.addEventListener("mouseover", scheduleHoverTooltip);
        els.greetingMessage.addEventListener("mousemove", moveHoverTooltip);
        els.greetingMessage.addEventListener("mouseout", hideHoverTooltip);
      }
      els.dayStateForm.addEventListener("submit", saveDayState);
      els.thoughtList.addEventListener("click", handleThoughtListAction);
      els.thoughtList.addEventListener("dblclick", handleThoughtInlineEdit);
      els.thoughtList.addEventListener("contextmenu", handleThoughtInlineEdit);
      els.noteDetailBody.addEventListener("click", handleThoughtListAction);
      els.noteDetailBody.addEventListener("mouseover", scheduleHoverTooltip);
      els.noteDetailBody.addEventListener("mousemove", moveHoverTooltip);
      els.noteDetailBody.addEventListener("mouseout", hideHoverTooltip);
      prepareDialog(els.dayStateDialog);
      prepareDialog(els.noteDetailDialog);
      prepareDialog(els.thoughtPreviewDialog);
      prepareDialog(els.projectDialog);
      prepareDialog(els.taskDialog);
      prepareDialog(els.timePieDialog);

      els.projectRail.addEventListener("click", handleProjectRailClick);
      els.projectRail.addEventListener("dblclick", editProjectField);
      els.projectRail.addEventListener("contextmenu", editProjectField);
      els.addProjectBtn.addEventListener("click", createDefaultProject);
      els.manageProjectsBtn.addEventListener("click", openProjectList);
      els.projectForm.addEventListener("submit", saveProject);
      els.projectCancelBtn.addEventListener("click", () => els.projectDialog.close());
      els.projectListBody.addEventListener("click", handleProjectListClick);
      els.projectListBody.addEventListener("dblclick", editProjectField);
      els.projectListBody.addEventListener("contextmenu", editProjectField);
      prepareDialog(els.projectListDialog);
      els.projectListAddBtn.addEventListener("click", () => {
        state.mergePanelOpen = !state.mergePanelOpen;
        renderProjectListDialog();
      });
      els.mergeConfirmBtn.addEventListener("click", mergeProjects);
      els.mergeUndoBtn.addEventListener("click", undoLastMerge);

      if (els.toggleTodoViewBtn) els.toggleTodoViewBtn.addEventListener("click", toggleTodoListView);
      els.taskHead.addEventListener("click", handleHeaderSort);
      els.taskBody.addEventListener("click", handleTaskClick);
      els.taskBody.addEventListener("mouseover", scheduleHoverTooltip);
      els.taskBody.addEventListener("mousemove", moveHoverTooltip);
      els.taskBody.addEventListener("mouseout", hideHoverTooltip);
      els.taskBody.addEventListener("dblclick", editTaskField);
      els.taskBody.addEventListener("contextmenu", editTaskField);
      els.resetSortBtn.addEventListener("click", resetDefaultSort);
      els.taskForm.addEventListener("submit", saveTask);
      if (els.taskCancelBtn) els.taskCancelBtn.addEventListener("click", () => els.taskDialog.close());
      els.metricButtons.forEach((button) => button.addEventListener("click", () => setRatingFilter(button.dataset.ratingFilter || "all")));
      els.focusTimeBtn.addEventListener("click", openTimePie);
      els.timePieCloseBtn.addEventListener("click", () => els.timePieDialog.close());
      els.calendarGrid.addEventListener("click", handleCalendarDayOpen);
      els.calendarGrid.addEventListener("keydown", handleCalendarDayKeydown);

      render();
    }


    async function loadGreetingMessage() {
      const fallback = "慢慢写，认真看见自己。";
      if (!els.greetingMessage) return;
      try {
        const response = await fetch("data/greetings.rtf", { cache: "no-store" });
        if (!response.ok) throw new Error("greeting file not found");
        const raw = await response.text();
        const lines = extractGreetingLines(raw);
        const message = lines.length ? lines[Math.floor(Math.random() * lines.length)] : fallback;
        setGreetingMessage(message);
      } catch {
        setGreetingMessage(fallback);
      }
    }

    function setGreetingMessage(message) {
      if (!els.greetingMessage) return;
      els.greetingMessage.textContent = message;
      els.greetingMessage.dataset.tooltip = message;
    }

    function extractGreetingLines(raw) {
      const text = raw.includes("{\\rtf")
        ? extractRtfListItems(raw).join("\n") || rtfToPlainText(raw)
        : raw;
      return text.split(/\r?\n/)
        .map((line) => line.replace(/^\s*[\d０-９]+[\s.．、)）-]*/, "").trim())
        .filter((line) => line && !line.startsWith("#"));
    }

    function extractRtfListItems(raw) {
      const items = [];
      const pattern = /\\strokec2\s+([\s\S]*?)(?=\\ls1\\ilvl0|\\pard|\n\})/g;
      let match;
      while ((match = pattern.exec(raw))) {
        const text = decodeRtfFragment(match[1]);
        if (text) items.push(text);
      }
      return items;
    }

    function rtfToPlainText(raw) {
      return decodeRtfFragment(raw)
        .replace(/\n{2,}/g, "\n")
        .trim();
    }

    function decodeRtfFragment(fragment) {
      const hexMap = {
        91: "‘",
        92: "’",
        93: "“",
        94: "”",
        97: "—",
        a0: " ",
        b7: "·",
        d7: "×"
      };
      return fragment
        .replace(/\{\\listtext[\s\S]*?\}/g, "")
        .replace(/\\u(-?\d+)\?? ?/g, (_, value) => {
          let code = Number(value);
          if (code < 0) code += 65536;
          return String.fromCharCode(code);
        })
        .replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) => hexMap[hex.toLowerCase()] || String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\par[d]?/g, "\n")
        .replace(/\\line/g, "\n")
        .replace(/\\[a-zA-Z]+-?\d* ?/g, "")
        .replace(/\\[^a-zA-Z0-9]/g, "")
        .replace(/[{}]/g, "")
        .replace(/[\t ]+/g, " ")
        .replace(/\s*\n\s*/g, "\n")
        .trim();
    }

    function maskCode(code) {
      if (!code) return "";
      return code.length <= 4 ? "****" : `${"*".repeat(Math.max(4, code.length - 4))}${code.slice(-4)}`;
    }

    function getPlatformLabel() {
      const ua = navigator.userAgent || "";
      const os = /Mac/i.test(ua) ? "macOS" : (/Windows/i.test(ua) ? "Windows" : (/iPhone|iPad/i.test(ua) ? "iOS/iPadOS" : "浏览器"));
      const browser = /Chrome/i.test(ua) ? "Chrome" : (/Safari/i.test(ua) ? "Safari" : "Browser");
      return `${browser} / ${os}`;
    }

    function formatDateTime(value) {
      if (!value) return "暂无";
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "暂无";
      return `${date.getFullYear()}/${String(date.getMonth()+1).padStart(2,"0")}/${String(date.getDate()).padStart(2,"0")} ${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`;
    }

    function timeAgo(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "暂无";
      const diff = Date.now() - date.getTime();
      const minutes = Math.max(0, Math.round(diff / 60000));
      if (minutes < 1) return "刚刚";
      if (minutes < 60) return `${minutes} 分钟前`;
      const hours = Math.round(minutes / 60);
      if (hours < 24) return `${hours} 小时前`;
      return `${Math.round(hours / 24)} 天前`;
    }

    function updateDateControls() {
      if (!els.rangeStart.value) return;

      state.rangeStart = els.rangeStart.value;
      state.rangeEnd = els.rangeEnd.value;
      state.selectedDate = els.rangeStart.value;

      if (state.rangeEnd && state.rangeEnd < state.rangeStart) {
        [state.rangeStart, state.rangeEnd] = [state.rangeEnd, state.rangeStart];
        els.rangeStart.value = state.rangeStart;
        els.rangeEnd.value = state.rangeEnd;
      }

      state.ratingFilter = "all";
      state.viewMode = state.rangeEnd ? "range" : "date";
      state.preCalendarContext = null;
      render();
    }

    function selectSingleDate(date) {
      state.selectedDate = date;
      state.rangeStart = date;
      state.rangeEnd = "";
      state.ratingFilter = "all";
      state.viewMode = "date";
      state.preCalendarContext = null;
      els.rangeStart.value = date;
      els.rangeEnd.value = "";
      render();
    }

    function selectWeekToDate() {
      const today = formatDate(new Date());
      const start = getWeekStart(today);
      state.selectedDate = today;
      state.rangeStart = start;
      state.rangeEnd = today;
      state.ratingFilter = "all";
      state.viewMode = "range";
      state.preCalendarContext = null;
      els.rangeStart.value = start;
      els.rangeEnd.value = today;
      render();
    }

    function getWeekStart(dateString) {
      const date = new Date(`${dateString}T00:00:00`);
      const day = date.getDay() || 7;
      date.setDate(date.getDate() - day + 1);
      return formatDate(date);
    }

    function setRatingFilter(filter) {
      state.ratingFilter = filter;
      render();
    }

    function selectAllTime() {
      const today = formatDate(new Date());
      const firstDate = getFirstRecordDate(today);
      state.rangeStart = firstDate;
      state.rangeEnd = today;
      state.selectedDate = today;
      state.ratingFilter = "all";
      state.viewMode = firstDate === today ? "date" : "range";
      state.preCalendarContext = null;
      els.rangeStart.value = state.rangeStart;
      els.rangeEnd.value = firstDate === today ? "" : state.rangeEnd;
      render();
    }

    function toggleCalendarView() {
      if (state.viewMode === "calendar") {
        const context = state.preCalendarContext;
        if (context) {
          state.selectedDate = context.selectedDate;
          state.rangeStart = context.rangeStart;
          state.rangeEnd = context.rangeEnd;
          state.viewMode = context.viewMode;
          els.rangeStart.value = state.rangeStart;
          els.rangeEnd.value = state.rangeEnd;
        } else {
          selectSingleDate(formatDate(new Date()));
          return;
        }
        state.preCalendarContext = null;
        state.ratingFilter = "all";
        render();
        return;
      }

      const today = formatDate(new Date());
      state.preCalendarContext = {
        selectedDate: state.selectedDate,
        rangeStart: state.rangeStart,
        rangeEnd: state.rangeEnd,
        viewMode: state.viewMode
      };
      state.rangeStart = getFirstRecordDate(today);
      state.rangeEnd = today;
      state.selectedDate = today;
      state.calendarAnchorDate = "";
      state.calendarFilterYear = String(new Date(`${today}T00:00:00`).getFullYear());
      state.calendarFilterMonth = String(new Date(`${today}T00:00:00`).getMonth() + 1);
      state.ratingFilter = "all";
      state.viewMode = "calendar";
      els.rangeStart.value = state.rangeStart;
      els.rangeEnd.value = state.rangeEnd;
      render();
    }

    function getFirstRecordDate(fallback) {
      const dates = getAllRecordDates().filter((date) => date <= fallback);
      return dates[0] || fallback;
    }

    function getAllRecordDates() {
      const dates = [
        ...state.tasks.map((task) => task.targetDate).filter(isValidDateString),
        ...Object.entries(state.dailyNotes || {})
          .filter(([date, note]) => isValidDateString(date) && (note.mood || (note.thoughts || []).length))
          .map(([date]) => date)
      ];
      return [...new Set(dates)].sort();
    }

    function handleProjectRailClick(event) {
      const button = event.target.closest("button[data-project-action]");
      const card = event.target.closest("[data-project-id]");
      const filterCard = event.target.closest("[data-project-filter-key]");

      if (button && card) {
        const project = findProject(card.dataset.projectId);
        if (!project) return;
        if (button.dataset.projectAction === "delete") deleteProject(project);
        return;
      }

      if (filterCard && !event.target.closest("input, select, textarea") && !event.target.closest("button[data-project-action]") && !event.target.closest("[data-project-field] select")) {
        const key = filterCard.dataset.projectFilterKey || "";
        clearTimeout(state.projectClickTimer);
        state.projectClickTimer = setTimeout(() => {
          state.projectFilterKey = state.projectFilterKey === key ? "" : key;
          state.ratingFilter = "all";
          render();
        }, 220);
      }
    }

    function editProjectField(event) {
      clearTimeout(state.projectClickTimer);
      if (state.viewMode === "calendar") return;
      if (event.target.closest("button")) return;
      const fieldEl = event.target.closest("[data-project-field]");
      const card = event.target.closest("[data-project-id]");
      if (!fieldEl || !card) return;
      const project = findProject(card.dataset.projectId);
      if (!project) return;
      event.preventDefault();

      const field = fieldEl.dataset.projectField;
      if (field === "ddl") {
        startScheduleEdit(fieldEl, project);
        return;
      }

      startInlineEdit(fieldEl, {
        type: "text",
        value: project.name,
        save: (value) => { project.name = value.trim() || "未命名"; }
      }, () => {
        saveData();
        render();
        if (els.projectListDialog.open) renderProjectListDialog();
      });
    }

    function startScheduleEdit(fieldEl, project) {
      if (fieldEl.querySelector("input, select")) return;
      const wrapper = document.createElement("div");
      wrapper.className = "schedule-editor";
      const modeSelect = document.createElement("select");
      modeSelect.className = "inline-select";
      modeSelect.innerHTML = `
        <option value="" disabled hidden>选择安排</option>
        <option value="plannedLater">还没想好</option>
        <option value="dated">指定日期</option>
      `;
      const currentMode = getProjectScheduleMode(project);
      modeSelect.value = currentMode === "dated" || currentMode === "plannedLater" ? currentMode : "";

      const dateEditor = createDatePartsEditor(project.ddl || "", {
        className: "inline-date-editor project-date-editor",
        startYear: new Date().getFullYear() - 1,
        endYear: new Date().getFullYear() + 30
      });
      dateEditor.el.hidden = modeSelect.value !== "dated";

      let finished = false;
      const save = () => {
        if (finished) return;
        finished = true;
        if (modeSelect.value === "plannedLater") {
          project.scheduleMode = "plannedLater";
          project.ddl = "";
        } else if (!modeSelect.value) {
          project.scheduleMode = "empty";
          project.ddl = "";
        } else {
          const value = dateEditor.getValue();
          if (value) {
            project.scheduleMode = "dated";
            project.ddl = value;
          } else {
            project.scheduleMode = "empty";
            project.ddl = "";
          }
        }
        saveData();
        render();
        if (els.projectListDialog.open) renderProjectListDialog();
      };

      modeSelect.addEventListener("change", () => {
        dateEditor.el.hidden = modeSelect.value !== "dated";
        if (modeSelect.value === "dated") dateEditor.focus();
        else save();
      });
      wrapper.addEventListener("keydown", (event) => {
        if (event.key === "Enter") save();
        if (event.key === "Escape") {
          finished = true;
          render();
          if (els.projectListDialog.open) renderProjectListDialog();
        }
      });
      wrapper.addEventListener("focusout", () => setTimeout(() => {
        if (!wrapper.contains(document.activeElement)) save();
      }));

      wrapper.append(modeSelect, dateEditor.el);
      fieldEl.replaceChildren(wrapper);
      modeSelect.focus();
    }

    function startProjectNameEdit(projectId) {
      const project = findProject(projectId);
      const card = Array.from(els.projectRail.querySelectorAll("[data-project-id]"))
        .find((item) => item.dataset.projectId === projectId);
      const fieldEl = card ? card.querySelector('[data-project-field="name"]') : null;
      if (!project || !fieldEl) return;
      startInlineEdit(fieldEl, {
        type: "text",
        value: project.name,
        save: (value) => { project.name = value.trim() || "未命名"; }
      }, () => {
        saveData();
        render();
        if (els.projectListDialog.open) renderProjectListDialog();
      });
    }

    function createDefaultProject() {
      if (state.viewMode === "calendar") return null;
      const hasUnnamed = state.projects.some(isUnnamedProject);
      if (hasUnnamed && !window.confirm("还有未命名项目未处理，仍要继续添加吗？")) return null;
      const project = {
        id: crypto.randomUUID ? crypto.randomUUID() : `project-${Date.now()}`,
        name: "未命名",
        ddl: "",
        scheduleMode: "empty",
        createdAt: new Date().toISOString()
      };
      state.projects.push(project);
      saveData();
      render();
      requestAnimationFrame(() => startProjectNameEdit(project.id));
      return project;
    }

    function openProjectDialog(project = null) {
      state.editingProjectId = project ? project.id : null;
      els.projectDialogTitle.textContent = project ? "修改项目" : "添加项目";
      els.projectName.value = project ? project.name : "";
      els.projectDdl.value = project ? project.ddl || "" : "";
      els.projectDialog.showModal();
      els.projectName.focus();
    }

    function saveProject(event) {
      event.preventDefault();
      const name = els.projectName.value.trim() || "未命名";
      const ddl = els.projectDdl.value;

      if (state.editingProjectId) {
        const project = findProject(state.editingProjectId);
        if (project) {
          project.name = name;
          project.ddl = ddl;
          project.scheduleMode = ddl ? "dated" : (project.scheduleMode === "plannedLater" ? "plannedLater" : "empty");
        }
      } else {
        state.projects.push({
          id: crypto.randomUUID ? crypto.randomUUID() : `project-${Date.now()}`,
          name,
          ddl,
          scheduleMode: ddl ? "dated" : "empty",
          createdAt: new Date().toISOString()
        });
      }

      state.editingProjectId = null;
      els.projectDialog.close();
      saveData();
      render();
      renderProjectListDialog();
    }

    function openProjectList() {
      renderProjectListDialog();
      els.projectListDialog.showModal();
    }

    function renderProjectListDialog() {
      const viewOnly = state.viewMode === "calendar";
      els.projectListDialog.classList.toggle("is-view-only", viewOnly);
      const draftProjects = state.projects.filter(isDraftProject).sort(compareProjects);
      const groups = getProjectListGroups();
      setDefaultProjectListCollapse(draftProjects.length);
      const draftMarkup = draftProjects.length
        ? projectListGroup({ key: "draft", title: "未命名", hint: "待处理项目", projects: draftProjects })
        : "";
      els.projectListBody.innerHTML = state.projects.length
        ? draftMarkup + groups.map(projectListGroup).join("")
        : `<div class="empty">还没有项目。</div>`;
      renderMergePanel();
    }

    function getProjectListGroups() {
      const today = formatDate(new Date());
      const completed = state.projects
        .filter((project) => !isDraftProject(project) && hasProjectDdl(project) && project.ddl < today)
        .sort(compareProjects);
      const active = state.projects
        .filter((project) => !isDraftProject(project) && hasProjectDdl(project) && project.ddl >= today)
        .sort(compareProjects);
      const unplanned = state.projects
        .filter((project) => isPlannedLater(project))
        .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
      return [
        { key: "active", title: "进行中", hint: "有 DDL 的项目", projects: active },
        { key: "unplanned", title: "待计划", hint: "还没想好", projects: unplanned },
        { key: "completed", title: "已完成", hint: "DDL 已经过了", projects: completed }
      ];
    }

    function setDefaultProjectListCollapse(draftCount) {
      const defaults = {
        active: true,
        unplanned: true,
        completed: true,
        draft: draftCount > 3
      };
      Object.entries(defaults).forEach(([key, value]) => {
        if (typeof state.projectListCollapsed[key] !== "boolean") state.projectListCollapsed[key] = value;
      });
    }

    function projectListGroup(group) {
      const collapsed = Boolean(state.projectListCollapsed[group.key]);
      return `
        <section class="project-list-group">
          <button class="project-list-heading" type="button" data-project-group-toggle="${group.key}" aria-expanded="${!collapsed}">
            <span class="heading-main"><span class="chevron">${collapsed ? "▶" : "▼"}</span><strong>${group.title}</strong></span>
            <span>${group.projects.length} 个 · ${group.hint}</span>
          </button>
          ${collapsed ? "" : (group.projects.length ? group.projects.map(projectListItem).join("") : `<div class="empty">暂无项目</div>`)}
        </section>
      `;
    }

    function projectListItem(project) {
      const viewOnly = state.viewMode === "calendar";
      const ddl = hasProjectDdl(project) ? friendlyDate(project.ddl) : (getProjectScheduleMode(project) === "plannedLater" ? "还没想好" : "设置日期");
      return `
        <div class="project-list-item ${viewOnly ? "is-readonly" : ""}" data-project-id="${project.id}" title="${viewOnly ? "查看项目" : "双击或右键修改项目"}">
          <div class="project-name" data-project-field="name" title="${viewOnly ? "查看项目名称" : "双击或右键修改项目名称"}">${escapeHtml(project.name)}</div>
          <div class="project-ddl" data-project-field="ddl" title="${viewOnly ? "查看 DDL" : "双击或右键修改 DDL"}">${ddl}</div>
          ${viewOnly ? "" : `<div class="project-card-actions">
            <button class="icon-button" type="button" data-project-action="delete" title="删除项目" aria-label="删除项目">×</button>
          </div>`}
        </div>
      `;
    }

    function renderMergePanel() {
      const viewOnly = state.viewMode === "calendar";
      if (viewOnly) state.mergePanelOpen = false;
      els.projectMergePanel.hidden = viewOnly || !state.mergePanelOpen;
      els.projectListAddBtn.hidden = viewOnly;
      if (viewOnly) return;
      els.projectListAddBtn.textContent = state.mergePanelOpen ? "收起合并" : "合并项目";
      const options = state.projects
        .slice()
        .sort(compareProjects)
        .map((project) => `<option value="${project.id}">${escapeHtml(project.name)}</option>`)
        .join("");
      els.mergeSourceProjects.innerHTML = options;
      els.mergeTargetProject.innerHTML = `<option value="">选择目标项目</option>${options}`;
      els.mergeUndoBtn.disabled = !state.lastMergeSnapshot;
    }

    function mergeProjects() {
      const targetId = els.mergeTargetProject.value;
      const sourceIds = [...els.mergeSourceProjects.selectedOptions].map((option) => option.value).filter((id) => id && id !== targetId);
      const target = findProject(targetId);
      const sources = sourceIds.map(findProject).filter(Boolean);
      if (!target || !sources.length) {
        window.alert("请选择至少一个要合并的项目，并选择合并到哪个目标项目。");
        return;
      }
      const linkedCount = state.tasks.filter((task) => sourceIds.includes(task.projectId)).length;
      const ok = window.confirm(`确认把 ${sources.length} 个项目合并到“${target.name}”吗？${linkedCount ? `
将迁移 ${linkedCount} 条事件记录。` : ""}`);
      if (!ok) return;
      state.lastMergeSnapshot = {
        projects: sources.map((project) => ({ ...project })),
        taskProjects: state.tasks
          .filter((task) => sourceIds.includes(task.projectId))
          .map((task) => ({ id: task.id, projectId: task.projectId }))
      };
      state.tasks.forEach((task) => {
        if (sourceIds.includes(task.projectId)) task.projectId = targetId;
      });
      state.projects = state.projects.filter((project) => !sourceIds.includes(project.id));
      saveData();
      render();
      renderProjectListDialog();
    }

    function undoLastMerge() {
      const snapshot = state.lastMergeSnapshot;
      if (!snapshot) return;
      snapshot.projects.forEach((project) => {
        if (!findProject(project.id)) state.projects.push(project);
      });
      snapshot.taskProjects.forEach((item) => {
        const task = state.tasks.find((entry) => entry.id === item.id);
        if (task) task.projectId = item.projectId;
      });
      state.lastMergeSnapshot = null;
      saveData();
      render();
      renderProjectListDialog();
    }

    function handleProjectListClick(event) {
      const heading = event.target.closest("[data-project-group-toggle]");
      if (heading) {
        const key = heading.dataset.projectGroupToggle;
        state.projectListCollapsed[key] = !state.projectListCollapsed[key];
        localStorage.setItem("daily-project-list-collapsed-v3", JSON.stringify(state.projectListCollapsed));
        renderProjectListDialog();
        return;
      }

      if (state.viewMode === "calendar") return;
      const button = event.target.closest("button[data-project-action]");
      const row = event.target.closest("[data-project-id]");
      if (!button || !row) return;
      const project = findProject(row.dataset.projectId);
      if (!project) return;

      if (button.dataset.projectAction === "delete") {
        deleteProject(project, true);
      }
    }

    function deleteProject(project, refreshList = false) {
      const linkedTasks = state.tasks.filter((task) => task.projectId === project.id);
      if (linkedTasks.length) {
        const ok = window.confirm(`项目“${project.name}”下有 ${linkedTasks.length} 条复盘记录。删除项目后，这些记录不会被删除，但会归入“未归类”。确认删除项目吗？`);
        if (!ok) return;
      }
      state.tasks.forEach((task) => {
        if (task.projectId === project.id) task.projectId = "";
      });
      state.projects = state.projects.filter((item) => item.id !== project.id);
      saveData();
      render();
      if (refreshList) renderProjectListDialog();
    }

    function handleTaskClick(event) {
      const addButton = event.target.closest("[data-add-task]");
      if (addButton) {
        openTaskDialog();
        return;
      }

      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const task = state.tasks.find((item) => item.id === button.dataset.id);
      if (!task) return;

      if (button.dataset.action === "delete") {
        const minutes = Number(task.durationMinutes) || 0;
        const warning = minutes
          ? `删除后这条事件和 ${formatDuration(minutes)} 投入时间都会从统计中移除。确认删除吗？`
          : "删除后这条事件会从复盘记录中移除。确认删除吗？";
        if (!window.confirm(warning)) return;
        state.tasks = state.tasks.filter((item) => item.id !== task.id);
      }

      saveData();
      render();
    }

    function openTaskDialog(task = null) {
      state.editingTaskId = task ? task.id : null;
      els.taskDialogTitle.textContent = task ? "修改事件" : "记录事件";
      els.taskText.value = task ? task.text : "";
      els.taskStartTime.value = task ? getTaskDisplayBucket(task) : getCurrentTimeBucket();
      els.taskDate.value = task ? task.targetDate : getDefaultRecordDate();
      els.taskMinutes.value = task && task.durationMinutes ? task.durationMinutes : "";
      els.taskNote.value = task ? task.note || "" : "";
      els.taskRating.forEach((input) => {
        input.checked = input.value === (task ? task.completionRating || "full" : "full");
      });
      renderProjectOptions(els.taskProject, task ? task.projectId || "" : getDefaultTaskProjectId());
      els.taskDialog.showModal();
      els.taskText.focus();
    }

    function saveTask(event) {
      event.preventDefault();
      const editing = state.tasks.find((item) => item.id === state.editingTaskId);
      const task = editing || {
        id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        manualOrder: false,
        order: nextOrder(),
        projectManualOrder: false,
        projectOrder: 9999
      };

      task.text = els.taskText.value.trim() || "未命名";
      task.note = els.taskNote.value.trim();
      task.projectId = els.taskProject.value || "";
      task.plannedStart = "";
      task.timeBucket = normalizeTimeBucket(els.taskStartTime.value) || getCurrentTimeBucket();
      task.targetDate = isValidDateString(els.taskDate.value) ? els.taskDate.value : formatDate(new Date());
      task.durationMinutes = Math.max(0, Number.parseInt(els.taskMinutes.value || "0", 10) || 0);
      task.completionRating = [...els.taskRating].find((input) => input.checked)?.value || "full";
      task.done = true;
      task.completedAt = task.completedAt || new Date().toISOString();
      task.completedDate = task.targetDate;
      if (!task.manualOrder) task.order = nextOrder();

      if (!editing) state.tasks.unshift(task);
      state.editingTaskId = null;
      els.taskDialog.close();
      saveData();
      render();
    }

    function getDefaultRecordDate() {
      if (state.viewMode === "date") return state.selectedDate;
      return formatDate(new Date());
    }

    function getDefaultTaskProjectId() {
      return state.projectFilterKey && state.projectFilterKey !== "__planned_later__" && findProject(state.projectFilterKey)
        ? state.projectFilterKey
        : "";
    }

    function getCurrentTimeBucket() {
      const hour = new Date().getHours();
      if (hour < 12) return "morning";
      if (hour < 18) return "afternoon";
      return "evening";
    }

    function normalizeTimeBucket(value) {
      return ["morning", "afternoon", "evening"].includes(value) ? value : "";
    }

    let tooltipTimer = null;
    let tooltipTarget = null;

    function scheduleHoverTooltip(event) {
      const target = event.target.closest("[data-tooltip]");
      const inTooltipArea = els.taskBody.contains(target) || els.thoughtSummary.contains(target) || els.noteDetailBody.contains(target) || (els.greetingMessage && els.greetingMessage.contains(target));
      if (!target || !inTooltipArea || !shouldShowHoverTooltip(target)) return;
      tooltipTarget = target;
      clearTimeout(tooltipTimer);
      tooltipTimer = setTimeout(() => {
        if (tooltipTarget !== target || !shouldShowHoverTooltip(target)) return;
        const tooltipHost = els.noteDetailBody.contains(target) ? els.noteDetailDialog.querySelector(".dialog-body") : document.body;
        if (tooltipHost && els.hoverTooltip.parentElement !== tooltipHost) tooltipHost.appendChild(els.hoverTooltip);
        els.hoverTooltip.textContent = target.dataset.tooltip;
        els.hoverTooltip.hidden = false;
        positionHoverTooltip(event);
        requestAnimationFrame(() => els.hoverTooltip.classList.add("visible"));
      }, 700);
    }

    function isTextOverflowing(element) {
      return element.scrollWidth > element.clientWidth + 1;
    }

    function shouldShowHoverTooltip(element) {
      if (element.dataset.tooltipAlways) return true;
      if (isTextOverflowing(element)) return true;
      if (element.dataset.tooltipThought) return (element.textContent || "").trim().length > 28;
      return false;
    }

    function moveHoverTooltip(event) {
      if (!els.hoverTooltip.hidden) positionHoverTooltip(event);
    }

    function hideHoverTooltip(event) {
      const target = event.target.closest("[data-tooltip]");
      if (!target) return;
      const related = event.relatedTarget;
      if (related && target.contains(related)) return;
      clearTimeout(tooltipTimer);
      tooltipTarget = null;
      els.hoverTooltip.classList.remove("visible");
      els.hoverTooltip.hidden = true;
    }

    function positionHoverTooltip(event) {
      const offset = 12;
      const tooltipRect = els.hoverTooltip.getBoundingClientRect();
      const target = tooltipTarget || event.target;
      const targetRect = target && target.getBoundingClientRect ? target.getBoundingClientRect() : null;
      let left;
      let top;

      if (targetRect && els.noteDetailBody.contains(target)) {
        const dialogRect = els.noteDetailDialog.getBoundingClientRect();
        const minLeft = dialogRect.left + 18;
        const maxLeft = dialogRect.right - tooltipRect.width - 18;
        const minTop = dialogRect.top + 18;
        const maxTop = dialogRect.bottom - tooltipRect.height - 18;
        left = Math.min(Math.max(targetRect.left, minLeft), Math.max(minLeft, maxLeft));
        const below = targetRect.bottom + offset;
        const above = targetRect.top - tooltipRect.height - offset;
        top = below <= maxTop ? below : Math.min(Math.max(above, minTop), Math.max(minTop, maxTop));
      } else {
        left = event.clientX + offset;
        top = event.clientY + offset;
        if (top + tooltipRect.height > window.innerHeight - 12) top = event.clientY - tooltipRect.height - offset;
      }

      if (left + tooltipRect.width > window.innerWidth - 12) left = window.innerWidth - tooltipRect.width - 12;
      els.hoverTooltip.style.left = `${Math.max(12, left)}px`;
      els.hoverTooltip.style.top = `${Math.max(12, top)}px`;
    }

    function editTaskField(event) {
      if (event.target.closest("button, input, select, textarea")) return;
      const fieldEl = event.target.closest("[data-task-field]");
      const row = event.target.closest("tr[data-task-id]");
      if (!fieldEl || !row) return;
      const task = state.tasks.find((item) => item.id === row.dataset.taskId);
      if (!task) return;
      const field = fieldEl.dataset.taskField;
      event.preventDefault();

      const configByField = {
        text: { type: "textarea", label: "事件", rows: 5, value: task.text || "", save: (value) => { task.text = value.trim() || "未命名"; } },
        note: { type: "textarea", label: "备注", rows: 6, value: task.note || "", save: (value) => { task.note = value.trim(); } },
        projectId: { type: "project", label: "归属项目", width: 300, value: task.projectId || "", save: (value) => { task.projectId = value; } },
        timeBucket: { type: "timeBucket", label: "时间", width: 220, value: getTaskDisplayBucket(task), save: (value) => { task.timeBucket = normalizeTimeBucket(value) || "morning"; task.plannedStart = ""; task.manualOrder = false; } },
        targetDate: { type: "date", label: "日期", value: task.targetDate || formatDate(new Date()), save: (value) => { task.targetDate = isValidDateString(value) ? value : formatDate(new Date()); task.completedDate = task.targetDate; } },
        durationMinutes: { type: "duration", label: "投入时间", width: 260, value: task.durationMinutes || "", save: (value) => { task.durationMinutes = Math.max(0, Number.parseInt(value || "0", 10) || 0); } },
        completionRating: { type: "rating", label: "完成情况", width: 280, value: task.completionRating || "full", save: (value) => { task.completionRating = value || "full"; } }
      };
      const config = configByField[field];
      if (!config) return;

      const afterSave = () => {
        saveData();
        render();
      };

      if (["textarea", "date"].includes(config.type)) {
        openTaskFieldDialog(config, afterSave);
      } else {
        openTaskQuickMenu(fieldEl, config, afterSave);
      }
    }

    function getTaskFieldDialog() {
      let dialog = document.getElementById("taskFieldDialog");
      if (dialog) return dialog;
      dialog = document.createElement("dialog");
      dialog.id = "taskFieldDialog";
      dialog.className = "task-field-dialog";
      dialog.innerHTML = `
        <form class="dialog-body" id="taskFieldForm" novalidate>
          <h2 id="taskFieldTitle">修改</h2>
          <div id="taskFieldBody"></div>
          <div class="dialog-actions"><button class="primary" type="submit">保存</button></div>
        </form>
      `;
      document.body.append(dialog);
      prepareDialog(dialog);
      dialog.addEventListener("close", () => {
        const body = dialog.querySelector("#taskFieldBody");
        body?.replaceChildren();
      });
      return dialog;
    }

    function openTaskFieldDialog(config, afterSave) {
      closeTaskFieldPopover();
      const dialog = getTaskFieldDialog();
      const title = dialog.querySelector(".dialog-titlebar h2") || dialog.querySelector("#taskFieldTitle");
      const body = dialog.querySelector("#taskFieldBody");
      const form = dialog.querySelector("#taskFieldForm");
      if (!title || !body || !form) return;
      title.textContent = config.label || "修改";
      body.replaceChildren();

      let getValue;
      let focusTarget;
      if (config.type === "date") {
        const currentYear = new Date().getFullYear();
        const editor = createDatePartsEditor(config.value || formatDate(new Date()), {
          className: "inline-date-editor task-date-editor",
          startYear: currentYear - 10,
          endYear: currentYear + 10
        });
        body.append(editor.el);
        getValue = editor.getValue;
        focusTarget = () => editor.focus();
      } else {
        const control = document.createElement("textarea");
        control.className = "field-edit-control";
        control.rows = config.rows || 5;
        control.value = config.value || "";
        control.placeholder = config.label || "输入";
        body.append(control);
        getValue = () => control.value;
        focusTarget = () => {
          control.focus();
          control.select();
        };
      }

      form.onsubmit = (event) => {
        event.preventDefault();
        config.save(getValue());
        afterSave();
        dialog.close();
      };

      if (!dialog.open) dialog.showModal();
      requestAnimationFrame(() => focusTarget?.());
    }

    function closeTaskFieldPopover() {
      const popover = document.querySelector(".field-edit-popover");
      if (!popover) return;
      popover.remove();
      document.removeEventListener("mousedown", handleTaskPopoverOutside, true);
      document.removeEventListener("keydown", handleTaskPopoverKeydown, true);
      window.removeEventListener("resize", handleTaskPopoverViewportChange);
      window.removeEventListener("scroll", handleTaskPopoverViewportChange, true);
    }

    function handleTaskPopoverViewportChange() {
      closeTaskFieldPopover();
    }

    function handleTaskPopoverKeydown(event) {
      if (event.key === "Escape") closeTaskFieldPopover();
    }

    function handleTaskPopoverOutside(event) {
      const popover = document.querySelector(".field-edit-popover");
      if (!popover || popover.contains(event.target) || event.target.closest("[data-task-field]")) return;
      closeTaskFieldPopover();
    }

    function openTaskQuickMenu(fieldEl, config, afterSave) {
      closeTaskFieldPopover();
      const popover = document.createElement("div");
      popover.className = "field-edit-popover quick-menu";
      popover.style.setProperty("--popover-width", `${config.width || 280}px`);

      const saveAndClose = (value) => {
        config.save(value);
        closeTaskFieldPopover();
        afterSave();
      };

      const label = document.createElement("label");
      label.textContent = config.label || "修改";
      popover.append(label);

      if (config.type === "timeBucket") {
        [
          ["morning", "上午"],
          ["afternoon", "下午"],
          ["evening", "晚上"]
        ].forEach(([value, text]) => popover.append(createQuickOption(text, value, value === config.value, saveAndClose)));
      } else if (config.type === "project") {
        getProjectQuickOptions(config.value).forEach((option) => {
          popover.append(createQuickOption(option.label, option.value, option.value === config.value, saveAndClose, option.meta));
        });
      } else if (config.type === "rating") {
        Object.entries(getRatingMap()).forEach(([value, rating]) => {
          popover.append(createQuickOption(`${rating.emoji} ${rating.label}`, value, value === config.value, saveAndClose));
        });
      } else if (config.type === "duration") {
        const grid = document.createElement("div");
        grid.className = "quick-duration-grid";
        ["", 15, 30, 45, 60, 90, 120].forEach((minutes) => {
          const label = minutes === "" ? "未填写" : formatDuration(minutes);
          grid.append(createQuickOption(label, String(minutes), String(minutes) === String(config.value || ""), saveAndClose));
        });
        popover.append(grid);

        const custom = document.createElement("div");
        custom.className = "quick-custom";
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.step = "1";
        input.inputMode = "numeric";
        input.placeholder = "输入分钟";
        input.value = config.value || "";
        const ok = document.createElement("button");
        ok.type = "button";
        ok.className = "primary";
        ok.textContent = "确定";
        const submitCustom = () => saveAndClose(input.value);
        ok.addEventListener("click", submitCustom);
        input.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            submitCustom();
          }
        });
        custom.append(input, ok);
        popover.append(custom);
      }

      document.body.append(popover);
      positionTaskFieldPopover(popover, fieldEl);
      setTimeout(() => {
        document.addEventListener("mousedown", handleTaskPopoverOutside, true);
        document.addEventListener("keydown", handleTaskPopoverKeydown, true);
      }, 0);
      window.addEventListener("resize", handleTaskPopoverViewportChange);
      window.addEventListener("scroll", handleTaskPopoverViewportChange, true);
      const firstSelected = popover.querySelector(".quick-option.is-selected") || popover.querySelector(".quick-option") || popover.querySelector("input");
      firstSelected?.focus();
    }

    function createQuickOption(label, value, selected, onSelect, meta = "") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `quick-option${selected ? " is-selected" : ""}`;
      const labelSpan = document.createElement("span");
      labelSpan.textContent = label;
      button.append(labelSpan);
      if (meta) {
        const metaSpan = document.createElement("span");
        metaSpan.className = "quick-meta";
        metaSpan.textContent = meta;
        button.append(metaSpan);
      }
      button.addEventListener("click", () => onSelect(value));
      return button;
    }

    function getProjectQuickOptions(selectedValue = "") {
      const select = document.createElement("select");
      select.innerHTML = projectOptionsHtml(selectedValue);
      return Array.from(select.options).map((option) => ({
        value: option.value,
        label: option.textContent || UNASSIGNED_PROJECT,
        meta: option.value ? "" : "默认"
      }));
    }

    function positionTaskFieldPopover(popover, fieldEl) {
      const rect = fieldEl.getBoundingClientRect();
      const popRect = popover.getBoundingClientRect();
      const gap = 8;
      let left = rect.left;
      let top = rect.bottom + gap;
      if (left + popRect.width > window.innerWidth - 14) left = window.innerWidth - popRect.width - 14;
      if (top + popRect.height > window.innerHeight - 14) top = rect.top - popRect.height - gap;
      popover.style.left = `${Math.max(14, left)}px`;
      popover.style.top = `${Math.max(14, top)}px`;
    }

    function startTimePartsEdit(fieldEl, config, afterSave) {
      const editor = createTimePartsEditor(config.value || "");
      let finished = false;
      const finish = (shouldSave) => {
        if (finished) return;
        finished = true;
        if (shouldSave) {
          config.save(editor.getValue());
          afterSave();
        } else {
          render();
        }
      };
      editor.el.addEventListener("keydown", (event) => {
        if (event.key === "Enter") finish(true);
        if (event.key === "Escape") finish(false);
      });
      editor.el.addEventListener("focusout", () => setTimeout(() => {
        if (!editor.el.contains(document.activeElement)) finish(true);
      }));
      fieldEl.replaceChildren(editor.el);
      editor.focus();
    }

    function startDatePartsEdit(fieldEl, config, afterSave) {
      const currentYear = new Date().getFullYear();
      const editor = createDatePartsEditor(config.value || formatDate(new Date()), {
        className: "inline-date-editor task-date-editor",
        startYear: currentYear - 10,
        endYear: currentYear + 10
      });
      let finished = false;
      const finish = (shouldSave) => {
        if (finished) return;
        finished = true;
        if (shouldSave) {
          config.save(editor.getValue() || config.value || formatDate(new Date()));
          afterSave();
        } else {
          render();
        }
      };
      editor.el.addEventListener("keydown", (event) => {
        if (event.key === "Enter") finish(true);
        if (event.key === "Escape") finish(false);
      });
      editor.el.addEventListener("focusout", () => setTimeout(() => {
        if (!editor.el.contains(document.activeElement)) finish(true);
      }));
      fieldEl.replaceChildren(editor.el);
      editor.focus();
    }

    function createTimePartsEditor(value) {
      const safe = isValidTimeString(value) ? value : "";
      const [selectedHour = "", selectedMinute = "00"] = safe ? safe.split(":") : ["", "00"];
      const wrapper = document.createElement("div");
      wrapper.className = "inline-time-editor";
      const hourSelect = document.createElement("select");
      const minuteSelect = document.createElement("select");
      hourSelect.innerHTML = `<option value="">未安排</option>` + Array.from({ length: 24 }, (_, hour) => {
        const value = String(hour).padStart(2, "0");
        return `<option value="${value}">${value}</option>`;
      }).join("");
      minuteSelect.innerHTML = Array.from({ length: 12 }, (_, index) => {
        const value = String(index * 5).padStart(2, "0");
        return `<option value="${value}">${value}</option>`;
      }).join("");
      hourSelect.value = selectedHour;
      minuteSelect.value = selectedMinute;
      minuteSelect.disabled = !selectedHour;
      hourSelect.addEventListener("change", () => {
        minuteSelect.disabled = !hourSelect.value;
        if (hourSelect.value && !minuteSelect.value) minuteSelect.value = "00";
      });
      wrapper.append(hourSelect, document.createTextNode(":"), minuteSelect);
      return {
        el: wrapper,
        focus: () => hourSelect.focus(),
        getValue: () => hourSelect.value ? `${hourSelect.value}:${minuteSelect.value || "00"}` : ""
      };
    }

    function createDatePartsEditor(value, options = {}) {
      const currentYear = new Date().getFullYear();
      const safeValue = isValidDateString(value) ? value : formatDate(new Date());
      const date = parseDateParts(safeValue);
      const startYear = Math.min(options.startYear || currentYear - 5, date.year);
      const endYear = Math.max(options.endYear || currentYear + 10, date.year);
      const wrapper = document.createElement("div");
      wrapper.className = options.className || "inline-date-editor";
      const yearSelect = document.createElement("select");
      const monthSelect = document.createElement("select");
      const daySelect = document.createElement("select");
      yearSelect.innerHTML = rangeOptions(startYear, endYear, date.year, "年");
      monthSelect.innerHTML = rangeOptions(1, 12, date.month, "月");
      const syncDays = () => {
        const maxDay = daysInMonth(Number(yearSelect.value), Number(monthSelect.value));
        const currentDay = Math.min(Number(daySelect.value) || date.day, maxDay);
        daySelect.innerHTML = rangeOptions(1, maxDay, currentDay, "日");
      };
      yearSelect.addEventListener("change", syncDays);
      monthSelect.addEventListener("change", syncDays);
      syncDays();
      wrapper.append(yearSelect, monthSelect, daySelect);
      return {
        el: wrapper,
        focus: () => yearSelect.focus(),
        getValue: () => {
          const year = Number(yearSelect.value);
          const month = Number(monthSelect.value);
          const day = Number(daySelect.value);
          const value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          return isValidDateString(value) ? value : "";
        }
      };
    }

    function rangeOptions(start, end, selected, suffix = "") {
      return Array.from({ length: end - start + 1 }, (_, index) => {
        const value = start + index;
        return `<option value="${value}"${value === Number(selected) ? " selected" : ""}>${value}${suffix}</option>`;
      }).join("");
    }

    function startInlineEdit(fieldEl, config, afterSave) {
      if (fieldEl.querySelector("input, select")) return;
      if (config.type === "time") {
        startTimePartsEdit(fieldEl, config, afterSave);
        return;
      }
      if (config.type === "date") {
        startDatePartsEdit(fieldEl, config, afterSave);
        return;
      }
      const editor = document.createElement(config.type === "select" ? "select" : "input");
      editor.className = config.type === "select" ? "inline-select" : "inline-input";
      if (config.type !== "select") editor.type = config.type;
      if (config.type === "select") editor.innerHTML = config.optionsHtml || projectOptionsHtml(config.value);
      editor.value = config.value || "";

      let finished = false;
      const finish = (shouldSave) => {
        if (finished) return;
        finished = true;
        if (shouldSave) {
          config.save(editor.value);
          afterSave();
        } else {
          render();
          if (els.projectListDialog.open) renderProjectListDialog();
        }
      };

      editor.addEventListener("keydown", (event) => {
        if (event.key === "Enter") finish(true);
        if (event.key === "Escape") finish(false);
      });
      editor.addEventListener("blur", () => finish(true));
      if (["select", "date", "time"].includes(config.type)) {
        editor.addEventListener("change", () => finish(true));
      }

      fieldEl.replaceChildren(editor);
      editor.focus();
      if (editor.select && config.type === "text") editor.select();
    }

    function resetDefaultSort() {
      state.sortKey = "";
      state.sortDir = "asc";
      getBaseVisibleTasks().forEach((task, index) => {
        task.manualOrder = false;
        task.order = index + 1;
        task.projectManualOrder = false;
        task.projectOrder = 9999;
      });
      saveData();
      render();
    }

    function handleDragStart(event) {
      const row = event.target.closest("tr[data-task-id]");
      if (!row) return;
      state.draggingTaskId = row.dataset.taskId;
      state.draggingProjectKey = row.dataset.projectKey || "";
      row.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", row.dataset.taskId);
    }

    function handleDragOver(event) {
      const row = event.target.closest("tr[data-task-id]");
      if (!row) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = canDropOnRow(row) ? "move" : "none";
    }

    function canDropOnRow(row) {
      const source = state.tasks.find((task) => task.id === state.draggingTaskId);
      const target = state.tasks.find((task) => task.id === row.dataset.taskId);
      if (!source || !target) return false;
      const sourceSection = getTaskDragSection(source);
      const targetSection = getTaskDragSection(target);
      return source.targetDate === target.targetDate && sourceSection === targetSection;
    }

    function getTaskDragSection(task) {
      return getTaskDisplaySection(task);
    }

    function handleDrop(event) {
      const row = event.target.closest("tr[data-task-id]");
      if (!row || !state.draggingTaskId || row.dataset.taskId === state.draggingTaskId) return;
      event.preventDefault();
      if (!canDropOnRow(row)) {
        handleDragEnd();
        return;
      }
      assignDraggedTaskBucket(state.draggingTaskId, row.dataset.taskId);
      reorderVisibleTasks(state.draggingTaskId, row.dataset.taskId);
      saveData();
      render();
    }

    function handleDragEnd() {
      state.draggingTaskId = null;
      state.draggingProjectKey = null;
      document.querySelectorAll(".dragging").forEach((item) => item.classList.remove("dragging"));
    }

    function assignDraggedTaskBucket(sourceId, targetId) {
      const source = state.tasks.find((task) => task.id === sourceId);
      const target = state.tasks.find((task) => task.id === targetId);
      if (!source || !target) return;
      const targetSection = getTaskDisplaySection(target);
      if (targetSection === "上午") source.timeBucket = "morning";
      else if (targetSection === "下午") source.timeBucket = "afternoon";
      else source.timeBucket = "evening";
      source.plannedStart = "";
    }

    function reorderVisibleTasks(sourceId, targetId) {
      const visible = getVisibleTasks();
      const sourceIndex = visible.findIndex((task) => task.id === sourceId);
      const targetIndex = visible.findIndex((task) => task.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return;

      const [source] = visible.splice(sourceIndex, 1);
      visible.splice(targetIndex, 0, source);
      visible.forEach((task, index) => {
        task.order = index + 1;
        task.manualOrder = true;
      });
    }

    function reorderProjectGroups(sourceKey, targetKey) {
      if (!sourceKey || !targetKey || sourceKey === targetKey) return;
      const visible = getVisibleTasks();
      const keys = [...new Set(visible.map(getTaskProjectKey))];
      const sourceIndex = keys.indexOf(sourceKey);
      const targetIndex = keys.indexOf(targetKey);
      if (sourceIndex < 0 || targetIndex < 0) return;
      const [source] = keys.splice(sourceIndex, 1);
      keys.splice(targetIndex, 0, source);
      keys.forEach((key, index) => {
        state.tasks.forEach((task) => {
          if (getTaskProjectKey(task) === key) {
            task.projectOrder = index + 1;
            task.projectManualOrder = true;
          }
        });
      });
    }

    function getBaseVisibleTasks() {
      const visible = state.tasks.filter((task) => {
        if (state.viewMode === "all") return true;
        if (state.viewMode === "calendar" || state.viewMode === "range") return task.targetDate >= state.rangeStart && task.targetDate <= state.rangeEnd;
        return task.targetDate === state.selectedDate;
      });
      return sortVisibleTasks(applyProjectFilter(visible));
    }

    function getVisibleTasks() {
      return applyRatingFilter(getBaseVisibleTasks());
    }

    function applyProjectFilter(tasks) {
      if (!state.projectFilterKey) return tasks;
      return tasks.filter(taskMatchesProjectFilter);
    }

    function taskMatchesProjectFilter(task) {
      if (!state.projectFilterKey) return true;
      if (state.projectFilterKey === "__planned_later__") {
        const project = findProject(task.projectId);
        return project ? isPlannedLater(project) : false;
      }
      return task.projectId === state.projectFilterKey;
    }

    function projectMatchesCalendarFilter(project) {
      if (!state.projectFilterKey) return false;
      if (state.projectFilterKey === "__planned_later__") return isPlannedLater(project);
      return project.id === state.projectFilterKey;
    }

    function sortVisibleTasks(tasks) {
      return [...tasks].sort((a, b) => {
        if (state.sortKey) return compareTasksByHeader(a, b);
        return compareTasks(a, b);
      });
    }


    function render() {
      renderTopbar();
      renderProjects();
      renderDayStateStrip();

      if (state.viewMode === "calendar") {
        els.dailyView.classList.add("is-hidden");
        els.calendarView.classList.remove("is-hidden");
        renderCalendar();
        return;
      }

      els.calendarView.classList.add("is-hidden");
      els.dailyView.classList.remove("is-hidden");
      renderDaily();
    }

    function renderDayStateStrip() {
      const notes = getNotesInCurrentRange();
      const isSingle = isSingleDateContext();
      if (isSingle) {
        const note = getDayNote(state.selectedDate);
        const mood = getMoodOption(note.mood);
        const latest = note.thoughts[0];
        els.dayStateStrip.classList.remove("range-mode");
        els.dayStateStrip.style.setProperty("--mood-bg", mood.bg);
        els.dayStateStrip.style.setProperty("--mood-color", mood.color);
        els.stateStripTitle.innerHTML = "";
        els.moodSummary.innerHTML = `<span>感受</span><strong><span class="mood-emoji emoji-mark">${mood.emoji}</span>${mood.label}</strong>`;
        if (latest) {
          const tooltip = note.thoughts.map((item) => `${formatThoughtTime(item.createdAt)} · ${item.text}`).join("\n");
          els.thoughtSummary.dataset.tooltip = tooltip;
          els.thoughtSummary.dataset.tooltipAlways = "true";
          els.thoughtSummary.innerHTML = `
            <span>想法</span>
            <div class="thought-line"><time class="thought-time">${escapeHtml(formatThoughtTime(latest.createdAt))}</time><span class="thought-text">${escapeHtml(latest.text)}</span></div>
          `;
        } else {
          delete els.thoughtSummary.dataset.tooltip;
          delete els.thoughtSummary.dataset.tooltipAlways;
          els.thoughtSummary.innerHTML = `<span>想法</span><div class="thought-line"><span class="thought-text">今天还没有留下想法</span></div>`;
        }
        els.openDayStateBtn.hidden = false;
        els.openDayStateBtn.textContent = "记录";
        return;
      }

      const mooded = notes.filter((note) => note.mood);
      const thoughtDays = notes.filter((note) => note.thoughts.length).length;
      els.dayStateStrip.classList.add("range-mode");
      els.dayStateStrip.style.setProperty("--mood-bg", "rgba(255, 250, 241, 0.9)");
      els.dayStateStrip.style.setProperty("--mood-color", "var(--accent-strong)");
      els.stateStripTitle.innerHTML = "";
      els.moodSummary.innerHTML = `<span>感受</span>${renderMoodCurve(getRecentMoodNotes(notes))}`;
      delete els.thoughtSummary.dataset.tooltip;
      delete els.thoughtSummary.dataset.tooltipAlways;
      els.thoughtSummary.innerHTML = `<span>想法</span><div class="thought-line"><span class="thought-text">这期间你有 ${thoughtDays} 天记录了自己的想法</span></div>`;
      els.openDayStateBtn.hidden = true;
    }

    function isSingleDateContext() {
      return state.viewMode === "date" || !state.rangeEnd || state.rangeStart === state.rangeEnd;
    }

    function renderTopbar() {
      const today = formatDate(new Date());
      const weekStart = getWeekStart(today);

      const firstDate = getFirstRecordDate(today);
      els.topbar.classList.toggle("calendar-mode", state.viewMode === "calendar");
      if (state.viewMode === "calendar") renderCalendarFilterControls();
      els.todayBtn.classList.toggle("active", state.viewMode === "date" && state.selectedDate === today);
      els.tomorrowBtn.classList.toggle("active", state.viewMode === "range" && state.rangeStart === weekStart && state.rangeEnd === today);
      els.allTimeBtn.classList.toggle("active", state.viewMode !== "calendar" && state.rangeStart === firstDate && (state.rangeEnd === today || (firstDate === today && !state.rangeEnd)));
      els.showAllBtn.textContent = state.viewMode === "calendar" ? "返回" : "日历";
    }

    function renderCalendarFilterControls() {
      const years = getCalendarAvailableYears();
      const selectedYear = state.calendarFilterYear || "";
      const selectedMonth = state.calendarFilterMonth || "";
      els.calendarAllBtn.classList.toggle("active", !selectedYear);
      els.calendarYearSelect.innerHTML = `<option value="" ${selectedYear ? "" : "selected"}>选择年份</option>`
        + years.map((year) => `<option value="${year}" ${String(year) === selectedYear ? "selected" : ""}>${year}年</option>`).join("");
      els.calendarYearSelect.value = selectedYear;
      els.calendarMonthSelect.innerHTML = `<option value="" ${selectedMonth ? "" : "selected"}>全年</option>`
        + Array.from({ length: 12 }, (_, index) => {
          const month = String(index + 1);
          return `<option value="${month}" ${month === selectedMonth ? "selected" : ""}>${index + 1}月</option>`;
        }).join("");
      els.calendarMonthSelect.disabled = !selectedYear;
    }

    function selectCalendarAll() {
      state.calendarFilterYear = "";
      state.calendarFilterMonth = "";
      render();
    }

    function handleCalendarYearChange() {
      state.calendarFilterYear = els.calendarYearSelect.value || "";
      state.calendarFilterMonth = "";
      render();
    }

    function handleCalendarMonthChange() {
      if (!state.calendarFilterYear) return;
      state.calendarFilterMonth = els.calendarMonthSelect.value || "";
      render();
    }

    function getCalendarAvailableYears() {
      const today = formatDate(new Date());
      const first = getFirstRecordDate(today);
      const startYear = new Date(`${first}T00:00:00`).getFullYear();
      const endYear = new Date(`${today}T00:00:00`).getFullYear();
      return Array.from({ length: Math.max(1, endYear - startYear + 1) }, (_, index) => startYear + index);
    }

    function getCalendarDisplayRange() {
      const today = formatDate(new Date());
      const first = getFirstRecordDate(today);
      const year = Number(state.calendarFilterYear);
      const month = Number(state.calendarFilterMonth);
      if (!year) return { start: first, end: today };

      if (month) {
        return {
          start: `${year}-${String(month).padStart(2, "0")}-01`,
          end: formatDate(new Date(year, month, 0))
        };
      }
      return { start: `${year}-01-01`, end: `${year}-12-31` };
    }

    function getCalendarMonthRangeLabel() {
      const { start, end } = getCalendarDisplayRange();
      const startDate = new Date(`${start}T00:00:00`);
      const endDate = new Date(`${end || start}T00:00:00`);
      const startText = `${startDate.getFullYear()}年${startDate.getMonth() + 1}月`;
      const endText = `${endDate.getFullYear()}年${endDate.getMonth() + 1}月`;
      return startText === endText ? startText : `${startText} - ${endText}`;
    }

    function renderProjects() {
      const calendarMode = state.viewMode === "calendar";
      const railLayout = els.projectRail.closest(".project-rail-layout");
      els.manageProjectsBtn.hidden = false;
      els.addProjectBtn.hidden = calendarMode;
      railLayout.classList.toggle("readonly-rail", calendarMode);
      const draftProjects = [...state.projects]
        .filter(isDraftProject)
        .sort(compareProjects);
      const ddlProjects = [...state.projects]
        .filter((project) => !isDraftProject(project) && hasProjectDdl(project))
        .sort(compareProjects);
      const plannedLaterCount = state.projects.filter((project) => isPlannedLater(project)).length;
      const cardCount = draftProjects.length + ddlProjects.length + (plannedLaterCount ? 1 : 0);
      els.projectHint.textContent = cardCount > 3 ? "左右滑动查看更多" : "";
      railLayout.classList.toggle("has-overflow", cardCount > 3);
      els.projectRail.innerHTML = draftProjects.map(projectCard).join("")
        + ddlProjects.map(projectCard).join("")
        + (plannedLaterCount ? otherProjectCard(plannedLaterCount) : "");
    }

    function projectCard(project) {
      const mode = getProjectScheduleMode(project);
      const draft = isDraftProject(project);
      const countdown = hasProjectDdl(project) ? getDdlCountdown(project.ddl) : { label: "", variant: "waiting-project", longRange: false };
      const scheduleText = mode === "plannedLater" ? "还没想好" : "设置日期";
      const timeTotal = sumMinutes(getProjectRailTasksForCurrentRange().filter((task) => task.projectId === project.id));
      const timeMarkup = `<div class="project-time-total">累计 ${formatCompactDuration(timeTotal)}</div>`;
      const scheduleMarkup = hasProjectDdl(project)
        ? `<div class="project-countdown" data-project-field="ddl" title="双击或右键修改 DDL">
              <div class="days-left ${countdown.longRange ? "long-range" : ""}">${countdown.label}</div>
              <div class="countdown-text">${countdown.longRange ? "长期项目" : `距离 ${friendlyDate(project.ddl)}`}</div>
            </div>`
        : `<div class="project-date-placeholder" data-project-field="ddl" title="双击或右键设置日期或待计划">${scheduleText}</div>`;
      return `
        <div class="project-card has-ddl ${draft ? "waiting-project" : countdown.variant} ${state.projectFilterKey === project.id ? "is-filtered" : ""}" data-project-id="${project.id}" data-project-filter-key="${project.id}" data-schedule-mode="${mode}">
          <div class="project-content">
            <div class="project-name" data-project-field="name" title="双击或右键修改项目名称">${escapeHtml(project.name)}</div>
            ${scheduleMarkup}
            ${timeMarkup}
          </div>
        </div>
      `;
    }

    function otherProjectCard(count) {
      const plannedIds = new Set(state.projects.filter((project) => isPlannedLater(project)).map((project) => project.id));
      const timeTotal = sumMinutes(getProjectRailTasksForCurrentRange().filter((task) => plannedIds.has(task.projectId)));
      return `
        <button class="project-card other-card ${state.projectFilterKey === "__planned_later__" ? "is-filtered" : ""}" type="button" data-project-filter-key="__planned_later__">
          <span>待计划</span>
          <span class="other-count">${count} 个还没想好的项目</span>
          <span class="project-time-total">累计 ${formatCompactDuration(timeTotal)}</span>
        </button>
      `;
    }

    function getProjectRailTasksForCurrentRange() {
      if (state.viewMode === "calendar") {
        const { start, end } = getCalendarDisplayRange();
        return state.tasks.filter((task) => task.targetDate >= start && task.targetDate <= end);
      }
      return getBaseTasksForCurrentRange();
    }

    function addProjectCard() {
      return `
        <button class="project-card add-card" type="button" data-add-project>
          <span>+ 添加项目</span>
        </button>
      `;
    }

    function getDdlCountdown(dateString) {
      if (!isValidDateString(dateString)) return { label: "", variant: "waiting-project", longRange: false };
      const today = new Date(`${formatDate(new Date())}T00:00:00`);
      const ddl = new Date(`${dateString}T00:00:00`);
      const diff = Math.ceil((ddl - today) / 86400000);
      if (diff > 365) return { label: "一年后", variant: "due-later", longRange: true };
      if (diff > 30) return { label: `${diff}<small>天</small>`, variant: "due-later", longRange: false };
      if (diff >= 0) return { label: `${diff}<small>天</small>`, variant: "due-soon", longRange: false };
      return { label: `${Math.abs(diff)}<small>天</small>`, variant: "due-soon", longRange: false };
    }

    function renderDaily() {
      const baseTasks = getBaseVisibleTasks();
      const visibleTasks = applyRatingFilter(baseTasks);
      const ratingCounts = countRatings(baseTasks);
      const total = baseTasks.length;

      els.totalCount.textContent = total;
      els.doneCount.textContent = ratingCounts.full;
      els.doneRate.textContent = ratingCounts.partial;
      els.pendingCount.textContent = ratingCounts.baseline;
      els.unplannedCount.textContent = ratingCounts.unplanned;
      els.focusTime.textContent = formatCompactDuration(sumMinutes(baseTasks));
      els.metricButtons.forEach((button) => button.classList.toggle("active", (button.dataset.ratingFilter || "all") === state.ratingFilter));
      renderTaskHeader();

      els.taskBody.innerHTML = addTaskRow() + renderTaskRows(visibleTasks);
      els.emptyState.hidden = visibleTasks.length > 0;
      els.hiddenNote.textContent = state.ratingFilter === "all" ? "" : `当前仅显示：${getCompletionRating(state.ratingFilter).label}`;
    }

    function countRatings(tasks) {
      return tasks.reduce((counts, task) => {
        const key = task.completionRating || "full";
        if (counts[key] !== undefined) counts[key] += 1;
        return counts;
      }, { full: 0, partial: 0, baseline: 0, unplanned: 0 });
    }

    function applyRatingFilter(tasks) {
      if (state.ratingFilter === "all") return tasks;
      return tasks.filter((task) => (task.completionRating || "full") === state.ratingFilter);
    }

    function renderTaskHeader() {
      const projectView = false;
      els.taskTable.classList.toggle("project-table-view", false);
      const columns = [["timeBucket", "时间"], ["text", "事件"], ["project", "项目"], ["targetDate", "日期"], ["durationMinutes", "投入时间"], ["completionRating", "完成情况"], ["note", "备注"]];
      const headers = columns.map(([key, label]) => {
        const active = state.sortKey === key;
        const mark = active && state.sortDir === "desc" ? "↓" : "↑";
        return `<th><button class="sort-header ${active ? "active" : ""}" type="button" data-sort-key="${key}" data-mark="${mark}" title="按${label}排序">${label}</button></th>`;
      }).join("");
      els.taskHead.innerHTML = `<tr>${headers}<th>操作</th></tr>`;
    }

    function handleHeaderSort(event) {
      const button = event.target.closest("[data-sort-key]");
      if (!button) return;
      const key = button.dataset.sortKey;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = defaultSortDirection(key);
      }
      renderDaily();
    }

    function defaultSortDirection(key) {
      return ["durationMinutes"].includes(key) ? "desc" : "asc";
    }

    function compareTasksByHeader(a, b) {
      const key = state.sortKey;
      let diff = 0;
      if (key === "targetDate") diff = (a.targetDate || "").localeCompare(b.targetDate || "");
      if (key === "timeBucket") diff = getSectionRank(a) - getSectionRank(b);
      if (key === "durationMinutes") diff = (Number(a.durationMinutes) || 0) - (Number(b.durationMinutes) || 0);
      if (key === "project") diff = getProjectForTask(a).name.localeCompare(getProjectForTask(b).name, "zh-CN");
      if (key === "completionRating") diff = getRatingRank(a.completionRating) - getRatingRank(b.completionRating);
      if (key === "text") diff = (a.text || "").localeCompare(b.text || "", "zh-CN");
      if (key === "note") diff = (a.note || "").localeCompare(b.note || "", "zh-CN");
      if (!diff) diff = getSectionRank(a) - getSectionRank(b) || compareTaskDate(a, b) || new Date(b.createdAt) - new Date(a.createdAt);
      return state.sortDir === "desc" ? -diff : diff;
    }

    function getRatingRank(value) {
      return { baseline: 1, partial: 2, full: 3, unplanned: 4 }[value || "full"] || 3;
    }

    function toggleTodoListView() {
      state.todoListView = state.todoListView === "project" ? "time" : "project";
      state.sortKey = "";
      state.sortDir = "asc";
      localStorage.setItem("daily-todo-list-view", state.todoListView);
      render();
    }

    function renderTaskRows(tasks) {
      let currentSection = "";
      return tasks.map((task) => {
        const section = getTaskDisplaySection(task);
        const divider = section !== currentSection
          ? timeSectionRow(section)
          : "";
        currentSection = section;
        return divider + taskRow(task);
      }).join("");
    }

    function timeSectionRow(section) {
      return `<tr class="time-section-row" aria-hidden="true"><td colspan="8"></td></tr>`;
    }

    function projectSectionRow(task, tasks) {
      const project = getProjectForTask(task);
      const minutes = getProjectTaskMinutes(getTaskProjectKey(task), tasks);
      return `<tr class="project-section-row" aria-hidden="true"><td colspan="8"><span>所属项目 · ${escapeHtml(project.name)} · ${formatCompactDuration(minutes)}</span></td></tr>`;
    }

    function getTaskDisplaySection(task) {
      const bucket = getTaskDisplayBucket(task);
      if (bucket === "morning") return "上午";
      if (bucket === "afternoon") return "下午";
      return "晚上";
    }

    function getTaskDisplayBucket(task) {
      if (normalizeTimeBucket(task.timeBucket)) return task.timeBucket;
      if (task.plannedStart) {
        const section = getTimeSection(task.plannedStart);
        if (section === "上午") return "morning";
        if (section === "下午") return "afternoon";
        if (section === "晚上") return "evening";
      }
      return "morning";
    }

    function getTimeSection(time) {
      if (!time) return "";
      if (time < "12:00") return "上午";
      if (time < "18:00") return "下午";
      return "晚上";
    }

    function getSectionRank(task) {
      const section = getTaskDisplaySection(task);
      if (section === "上午") return 1;
      if (section === "下午") return 2;
      return 3;
    }

    function addTaskRow() {
      return `
        <tr class="add-row">
          <td colspan="8">
            <button class="add-todo" type="button" data-add-task title="记录一件完成的事" aria-label="记录一件完成的事">+</button>
          </td>
        </tr>
      `;
    }

    function taskRow(task) {
      const project = getProjectForTask(task);
      const text = task.text || "未命名";
      const note = task.note || "";
      const rating = getCompletionRating(task.completionRating || "full");
      const projectCell = `<div class="chip" data-task-field="projectId" title="双击或右键修改项目">${escapeHtml(project.name)}</div>`;
      const titleCell = `<div class="task-title" data-task-field="text" data-tooltip="${escapeHtml(text)}" aria-label="${escapeHtml(text)}">${escapeHtml(text)}</div>`;
      const timeCell = `<span class="planned-time" data-task-field="timeBucket" title="双击或右键修改时间">${getTaskDisplaySection(task)}</span>`;
      const dateCell = `<span data-task-field="targetDate" title="双击或右键修改日期">${friendlyDate(task.targetDate)}</span>`;
      const durationCell = `<span class="completion-record" data-task-field="durationMinutes" title="双击或右键修改投入时间">${task.durationMinutes ? formatDuration(task.durationMinutes) : "未填写"}</span>`;
      const ratingCell = `<span class="status" data-task-field="completionRating" title="双击或右键修改完成情况">${rating.emoji} ${rating.label}</span>`;
      const noteCell = `<div class="task-title task-remark" data-task-field="note" data-tooltip="${escapeHtml(note)}" aria-label="${escapeHtml(note)}">${note ? escapeHtml(note) : "-"}</div>`;
      const actionCell = `
          <td>
            <div class="actions single-action">
              <button class="icon-button action-danger" type="button" data-action="delete" data-id="${task.id}" title="删除事件" aria-label="删除事件">×</button>
            </div>
          </td>`;
      const orderedCells = `<td>${timeCell}</td><td>${titleCell}</td><td>${projectCell}</td><td>${dateCell}</td><td>${durationCell}</td><td>${ratingCell}</td><td>${noteCell}</td>${actionCell}`;
      return `
        <tr class="task-row done" data-task-id="${task.id}" data-project-key="${getTaskProjectKey(task)}">
          ${orderedCells}
        </tr>
      `;
    }

    function renderCalendar() {
      const { start, end } = getCalendarDisplayRange();
      els.calendarTitle.textContent = getCalendarMonthRangeLabel();
      els.calendarGrid.innerHTML = renderMonthCalendars(start, end);
      const anchorDate = state.calendarAnchorDate;
      if (anchorDate) {
        const anchor = els.calendarGrid.querySelector(`[data-date="${anchorDate}"]`);
        if (anchor) setTimeout(() => anchor.scrollIntoView({ block: "center", inline: "nearest" }), 0);
        state.calendarAnchorDate = "";
      }
    }

    function handleCalendarDayOpen(event) {
      const card = event.target.closest(".day-card[data-date]");
      if (!card) return;
      selectSingleDate(card.dataset.date);
    }

    function handleCalendarDayKeydown(event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      const card = event.target.closest(".day-card[data-date]");
      if (!card) return;
      event.preventDefault();
      selectSingleDate(card.dataset.date);
    }

    function dayCard(date, inSelectedRange = true) {
      const today = formatDate(new Date());
      const tasks = state.tasks.filter((task) => task.targetDate === date);
      const projectGroups = groupTasksByProject(tasks);
      const content = projectGroups.length
        ? projectGroups.map(calendarProject).join("")
        : `<div class="empty">没有记录</div>`;

      return `
        <article class="day-card ${date === today ? "today" : ""} ${inSelectedRange ? "" : "outside-range"}" data-date="${date}" tabindex="0" role="button" aria-label="查看 ${friendlyDate(date)} 的复盘记录">
          <div class="day-head">
            <span>${friendlyDate(date)}</span>
            <span class="day-count">${tasks.length} 条</span>
          </div>
          <div class="calendar-projects">${content}</div>
        </article>
      `;
    }

    function renderMonthCalendars(start, end) {
      const months = enumerateMonths(start, end);
      return months.map((monthDate) => {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0);
        const cells = [];
        for (let i = 0; i < first.getDay(); i += 1) cells.push(`<div class="day-card calendar-spacer" aria-hidden="true"></div>`);
        for (let day = 1; day <= last.getDate(); day += 1) {
          const date = formatDate(new Date(year, month, day));
          cells.push(dayCard(date, date >= start && date <= end));
        }
        return `
          <section class="month-section">
            <div class="month-title">${year}年${month + 1}月</div>
            <div class="weekday-row"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>
            <div class="month-grid">${cells.join("")}</div>
          </section>
        `;
      }).join("");
    }

    function calendarProject(group) {
      const minutes = sumMinutes(group.tasks);
      const className = `${group.project.id ? "calendar-project" : "calendar-project unassigned"} ${projectMatchesCalendarFilter(group.project) ? "project-highlight" : ""}`;
      return `
        <div class="${className}">
          <strong title="${escapeHtml(group.project.name)}">${escapeHtml(group.project.name)}${group.project.id ? "" : " · 待整理"}</strong>
          <span>${group.tasks.length} 条记录</span>
          <span>累计时间：${formatDuration(minutes)}</span>
        </div>
      `;
    }

    function groupTasksByProject(tasks) {
      const map = new Map();
      tasks.forEach((task) => {
        const project = getProjectForTask(task);
        if (!map.has(project.id)) {
          map.set(project.id, {
            project,
            tasks: []
          });
        }
        map.get(project.id).tasks.push(task);
      });

      return [...map.values()].sort((a, b) => {
        return sumMinutes(b.tasks) - sumMinutes(a.tasks) || compareProjects(a.project, b.project);
      });
    }

    function renderProjectOptions(select, selectedValue = "") {
      select.innerHTML = projectOptionsHtml(selectedValue);
      select.value = state.projects.some((project) => project.id === selectedValue) ? selectedValue : "";
    }

    function timeBucketOptionsHtml(selectedValue = "") {
      const options = [
        ["morning", "上午"],
        ["afternoon", "下午"],
        ["evening", "晚上"]
      ];
      return options.map(([value, label]) => `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${label}</option>`).join("");
    }

    function ratingOptionsHtml(selectedValue = "") {
      return Object.entries(getRatingMap()).map(([value, rating]) => `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${rating.emoji} ${rating.label}</option>`).join("");
    }

    function projectOptionsHtml(selectedValue = "") {
      const today = formatDate(new Date());
      const projects = [...state.projects]
        .filter((project) => project.id === selectedValue || !hasProjectDdl(project) || project.ddl >= today)
        .sort(compareProjects);
      return [`<option value="" ${selectedValue ? "" : "selected"}>${UNASSIGNED_PROJECT}</option>`]
        .concat(projects.map((project) => `<option value="${project.id}" ${project.id === selectedValue ? "selected" : ""}>${escapeHtml(project.name)}</option>`))
        .join("");
    }

    function compareProjectViewTasks(a, b, tasks) {
      const projectDiff = compareTaskProjects(a, b, tasks);
      if (projectDiff) return projectDiff;
      const sectionDiff = getSectionRank(a) - getSectionRank(b);
      if (sectionDiff) return sectionDiff;
      const dateDiff = compareTaskDate(a, b);
      if (dateDiff) return dateDiff;
      return compareTaskWithinProject(a, b);
    }

    function compareTaskProjects(a, b, tasks) {
      const aKey = getTaskProjectKey(a);
      const bKey = getTaskProjectKey(b);
      if (aKey === bKey) return 0;
      const aManual = getProjectManualOrder(aKey, tasks);
      const bManual = getProjectManualOrder(bKey, tasks);
      if (aManual !== null || bManual !== null) {
        if (aManual === null) return 1;
        if (bManual === null) return -1;
        return aManual - bManual;
      }
      const minuteDiff = getProjectTaskMinutes(bKey, tasks) - getProjectTaskMinutes(aKey, tasks);
      if (minuteDiff) return minuteDiff;
      const countDiff = getProjectTaskCount(bKey, tasks) - getProjectTaskCount(aKey, tasks);
      if (countDiff) return countDiff;
      return compareProjects(getProjectForTask(a), getProjectForTask(b));
    }

    function compareTaskWithinProject(a, b) {
      const sectionDiff = getSectionRank(a) - getSectionRank(b);
      if (sectionDiff) return sectionDiff;
      if (a.manualOrder && b.manualOrder) return (a.order || 0) - (b.order || 0) || new Date(b.createdAt) - new Date(a.createdAt);
      if (a.manualOrder !== b.manualOrder) return a.manualOrder ? -1 : 1;
      const minuteDiff = (Number(b.durationMinutes) || 0) - (Number(a.durationMinutes) || 0);
      if (minuteDiff) return minuteDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    function getProjectTaskCount(projectKey, tasks) {
      return tasks.filter((task) => getTaskProjectKey(task) === projectKey).length;
    }

    function getProjectTaskMinutes(projectKey, tasks) {
      return sumMinutes(tasks.filter((task) => getTaskProjectKey(task) === projectKey));
    }

    function getProjectTaskCountOnDate(projectKey, tasks, date) {
      return tasks.filter((task) => getTaskProjectKey(task) === projectKey && task.targetDate === date).length;
    }

    function getProjectTaskMinutesOnDate(projectKey, tasks, date) {
      return sumMinutes(tasks.filter((task) => getTaskProjectKey(task) === projectKey && task.targetDate === date));
    }

    function getProjectManualOrder(projectKey, tasks) {
      const orders = tasks
        .filter((task) => getTaskProjectKey(task) === projectKey && task.projectManualOrder)
        .map((task) => task.projectOrder || 9999);
      return orders.length ? Math.min(...orders) : null;
    }

    function getTaskProjectKey(task) {
      return task.projectId || "__unassigned__";
    }

    function compareTaskDate(a, b) {
      return (a.targetDate || "").localeCompare(b.targetDate || "");
    }

    function compareTasks(a, b) {
      const sectionDiff = getSectionRank(a) - getSectionRank(b);
      if (sectionDiff) return sectionDiff;
      const projectDiff = compareTaskProjects(a, b, getBaseTasksForCurrentRange());
      if (projectDiff) return projectDiff;
      const dateDiff = compareTaskDate(a, b);
      if (dateDiff) return dateDiff;
      if (a.manualOrder && b.manualOrder) {
        return (a.order || 0) - (b.order || 0) || new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (a.manualOrder !== b.manualOrder) return a.manualOrder ? -1 : 1;
      const minuteDiff = (Number(b.durationMinutes) || 0) - (Number(a.durationMinutes) || 0);
      if (minuteDiff) return minuteDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    function getBaseTasksForCurrentRange() {
      return state.tasks.filter((task) => {
        if (state.viewMode === "all") return true;
        if (state.viewMode === "calendar" || state.viewMode === "range") return task.targetDate >= state.rangeStart && task.targetDate <= state.rangeEnd;
        return task.targetDate === state.selectedDate;
      });
    }

    function compareProjects(a, b) {
      const aDraft = isDraftProject(a);
      const bDraft = isDraftProject(b);
      if (aDraft !== bDraft) return aDraft ? -1 : 1;
      const aHasDdl = hasProjectDdl(a);
      const bHasDdl = hasProjectDdl(b);
      if (aHasDdl !== bHasDdl) return aHasDdl ? -1 : 1;
      if (aHasDdl && a.ddl !== b.ddl) return a.ddl.localeCompare(b.ddl);
      return a.name.localeCompare(b.name, "zh-CN");
    }

    function isUnnamedProject(project) {
      const name = (project.name || "").trim();
      return name === "未命名" || name === "未命名项目";
    }

    function getProjectScheduleMode(project) {
      if (project.scheduleMode) return project.scheduleMode;
      if (project.ddl) return "dated";
      return "empty";
    }

    function isDraftProject(project) {
      return getProjectScheduleMode(project) === "empty" || isUnnamedProject(project);
    }

    function hasProjectDdl(project) {
      return getProjectScheduleMode(project) === "dated" && isValidDateString(project.ddl);
    }

    function isPlannedLater(project) {
      return getProjectScheduleMode(project) === "plannedLater" && !isDraftProject(project);
    }

    function findProject(id) {
      return state.projects.find((project) => project.id === id);
    }

    function getProjectForTask(task) {
      return findProject(task.projectId) || {
        id: "",
        name: UNASSIGNED_PROJECT,
        ddl: ""
      };
    }

    function nextOrder() {
      return Math.max(0, ...state.tasks.map((task) => task.order || 0)) + 1;
    }

    function enumerateMonths(start, end) {
      const months = [];
      const cursor = new Date(`${start}T00:00:00`);
      cursor.setDate(1);
      const last = new Date(`${end}T00:00:00`);
      last.setDate(1);
      while (cursor <= last) {
        months.push(new Date(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
      }
      return months;
    }

    function enumerateDates(start, end) {
      const dates = [];
      let cursor = new Date(`${start}T00:00:00`);
      const last = new Date(`${end}T00:00:00`);
      while (cursor <= last) {
        dates.push(formatDate(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      return dates;
    }

    function parseStoredJson(key, fallback) {
      try {
        const value = JSON.parse(localStorage.getItem(key));
        return value && typeof value === "object" ? value : fallback;
      } catch {
        return fallback;
      }
    }

    function loadData() {
      try {
        let raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          const legacyKey = LEGACY_STORAGE_KEYS.find((key) => localStorage.getItem(key));
          if (legacyKey) {
            raw = localStorage.getItem(legacyKey);
            localStorage.setItem(STORAGE_KEY, raw);
          }
        }
        const saved = JSON.parse(raw);
        if (Array.isArray(saved)) return migrateArrayData(saved);

        const data = saved || {};
        const projects = (Array.isArray(data.projects) ? data.projects : [])
          .map(normalizeProject)
          .filter(Boolean);
        const tasks = (Array.isArray(data.tasks) ? data.tasks : []).map((task, index) => normalizeTask({
          ...task,
          projectId: task.projectId || migrateProject(projects, task.project, task.projectDdl),
          order: task.order || index + 1
        }));

        return {
          tasks,
          projects,
          dailyNotes: normalizeDailyNotes(data.dailyNotes),
          lastReviewDate: data.lastReviewDate || ""
        };
      } catch {
        return {
          tasks: [],
          projects: [],
          dailyNotes: {},
          lastReviewDate: ""
        };
      }
    }

    function migrateArrayData(oldTasks) {
      const projects = [];
      const tasks = oldTasks.map((task, index) => normalizeTask({
        ...task,
        projectId: migrateProject(projects, task.project, task.projectDdl),
        order: task.order || index + 1
      }));
      return {
        tasks,
        projects,
        dailyNotes: {},
        lastReviewDate: ""
      };
    }

    function migrateProject(projects, projectName, projectDdl) {
      const name = projectName || projectName === "" ? String(projectName).trim() : "";
      const safeName = name && name !== "未分类" ? name : UNASSIGNED_PROJECT;
      if (safeName === UNASSIGNED_PROJECT) return "";

      let project = projects.find((item) => item.name === safeName);
      if (!project) {
        project = {
          id: crypto.randomUUID ? crypto.randomUUID() : `project-${Date.now()}-${projects.length}`,
          name: safeName,
          ddl: projectDdl || "",
          scheduleMode: projectDdl ? "dated" : "plannedLater",
          createdAt: new Date().toISOString()
        };
        projects.push(project);
      }
      if (projectDdl && !project.ddl) {
        project.ddl = projectDdl;
        project.scheduleMode = "dated";
      }
      return project.id;
    }

    function isValidDateString(value) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
      const { year, month, day } = parseDateParts(value);
      if (year < 1900 || year > 2200) return false;
      const date = new Date(`${value}T00:00:00`);
      return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
    }

    function parseDateParts(value) {
      const [year, month, day] = String(value || "").split("-").map((part) => Number.parseInt(part, 10));
      return { year, month, day };
    }

    function daysInMonth(year, month) {
      return new Date(year, month, 0).getDate();
    }

    function isValidTimeString(value) {
      if (!/^\d{2}:\d{2}$/.test(String(value || ""))) return false;
      const [hour, minute] = value.split(":").map((part) => Number.parseInt(part, 10));
      return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 55 && minute % 5 === 0;
    }

    function normalizeDailyNotes(notes) {
      if (!notes || typeof notes !== "object") return {};
      return Object.fromEntries(Object.entries(notes).filter(([date]) => isValidDateString(date)).map(([date, note]) => [date, {
        mood: getMoodOption(note && note.mood) ? note.mood : "",
        thoughts: Array.isArray(note && note.thoughts)
          ? note.thoughts.filter((item) => item && String(item.text || "").trim()).map((item) => ({
              id: item.id || (crypto.randomUUID ? crypto.randomUUID() : `thought-${Date.now()}`),
              text: String(item.text || "").trim(),
              createdAt: item.createdAt || new Date().toISOString()
            }))
          : []
      }]));
    }

    function normalizeTask(task) {
      const targetDate = isValidDateString(task.targetDate) ? task.targetDate : formatDate(new Date());
      const plannedStart = isValidTimeString(task.plannedStart) ? task.plannedStart : "";
      let timeBucket = normalizeTimeBucket(task.timeBucket);
      if (!timeBucket && plannedStart) {
        const section = getTimeSection(plannedStart);
        timeBucket = section === "上午" ? "morning" : (section === "下午" ? "afternoon" : "evening");
      }
      return {
        id: task.id || (crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`),
        text: task.text || "",
        note: task.note || "",
        projectId: task.projectId || "",
        plannedStart,
        timeBucket: timeBucket || "morning",
        targetDate,
        done: true,
        createdAt: task.createdAt || new Date().toISOString(),
        completedAt: task.completedAt || new Date().toISOString(),
        completedDate: targetDate,
        durationMinutes: Math.max(0, Number.parseInt(task.durationMinutes || "0", 10) || 0),
        completionRating: getCompletionRating(task.completionRating) ? task.completionRating : "full",
        manualOrder: Boolean(task.manualOrder),
        order: task.order || 9999,
        projectManualOrder: Boolean(task.projectManualOrder),
        projectOrder: task.projectOrder || 9999
      };
    }

    function normalizeProject(project) {
      if (!project || !project.name) return null;
      const name = project.name === "未命名项目" ? "未命名" : project.name;
      const ddl = isValidDateString(project.ddl) ? project.ddl : "";
      const scheduleMode = project.scheduleMode === "dated" && !ddl
        ? "empty"
        : (project.scheduleMode || (ddl ? "dated" : "empty"));
      return {
        id: project.id || (crypto.randomUUID ? crypto.randomUUID() : `project-${Date.now()}`),
        name,
        ddl,
        scheduleMode,
        createdAt: project.createdAt || new Date().toISOString()
      };
    }

    function formatPlannedTime(time) {
      if (!isValidTimeString(time)) return "未安排";
      const [hour, minute] = time.split(":");
      return `${hour}:${minute}`;
    }

    function getMoodOptions() {
      return [
        { value: "very-unpleasant", label: "非常不愉快", emoji: "🥀", color: "#6c5b50", bg: "rgba(232, 222, 212, 0.82)" },
        { value: "unpleasant", label: "不愉快", emoji: "🌧️", color: "#5c6f83", bg: "rgba(218, 228, 232, 0.82)" },
        { value: "slightly-unpleasant", label: "有点不愉快", emoji: "☁️", color: "#6f897f", bg: "rgba(230, 239, 229, 0.82)" },
        { value: "neutral", label: "不悲不喜", emoji: "🌝", color: "#8a684f", bg: "rgba(246, 238, 222, 0.86)" },
        { value: "slightly-pleasant", label: "有点愉快", emoji: "🌤️", color: "#b87535", bg: "rgba(255, 237, 210, 0.86)" },
        { value: "pleasant", label: "愉快", emoji: "☀️", color: "#c45f32", bg: "rgba(255, 226, 198, 0.88)" },
        { value: "very-pleasant", label: "非常愉快", emoji: "🌻", color: "#d08b25", bg: "rgba(255, 214, 148, 0.86)" }
      ];
    }

    function getMoodOption(value) {
      return getMoodOptions().find((item) => item.value === value) || { value: "", label: "未记录", emoji: "·", color: "#7a6148", bg: "rgba(255, 250, 241, 0.9)" };
    }

    function getRatingMap() {
      return {
        baseline: { label: "保底完成", emoji: "🤲" },
        partial: { label: "有所推进", emoji: "👏" },
        full: { label: "圆满完成", emoji: "🎉" },
        unplanned: { label: "计划外", emoji: "✨" }
      };
    }

    function getCompletionRating(value) {
      return getRatingMap()[value] || null;
    }

    function sumMinutes(tasks) {
      return tasks.reduce((total, task) => total + (Number(task.durationMinutes) || 0), 0);
    }

    function formatDuration(minutes) {
      const total = Math.max(0, Number(minutes) || 0);
      const hours = Math.floor(total / 60);
      const mins = total % 60;
      if (hours && mins) return `${hours}小时${mins}分钟`;
      if (hours) return `${hours}小时`;
      return `${mins}分钟`;
    }

    function formatCompactDuration(minutes) {
      const total = Math.max(0, Number(minutes) || 0);
      const hours = Math.floor(total / 60);
      const mins = total % 60;
      if (hours && mins) return `${hours}h${mins}m`;
      if (hours) return `${hours}h`;
      return `${mins}m`;
    }

    function getDayNote(date) {
      if (!state.dailyNotes) state.dailyNotes = {};
      if (!state.dailyNotes[date]) state.dailyNotes[date] = { mood: "", thoughts: [] };
      return state.dailyNotes[date];
    }

    function getNotesInCurrentRange() {
      const start = state.rangeStart || state.selectedDate;
      const end = state.rangeEnd || state.selectedDate;
      const dates = enumerateDates(start, end);
      return dates.map((date) => ({ date, ...getDayNote(date) }));
    }

    function renderMoodDots(notes) {
      return `<div class="mood-dots">${notes.map((note) => {
        const mood = getMoodOption(note.mood);
        return `<span class="mood-dot ${note.mood ? "" : "empty"}" style="--dot-color:${mood.color}" title="${friendlyDate(note.date)} ${mood.label}"></span>`;
      }).join("")}</div>`;
    }

    function formatThoughtTime(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "";
      return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
    }

    function getMoodScore(value) {
      const map = {
        "very-unpleasant": 1,
        unpleasant: 2,
        "slightly-unpleasant": 3,
        neutral: 4,
        "slightly-pleasant": 5,
        pleasant: 6,
        "very-pleasant": 7
      };
      return map[value] || 0;
    }

    function getRecentMoodNotes(notes, limit = 7) {
      return notes.slice(Math.max(0, notes.length - limit));
    }

    function renderMoodCurve(notes, detailed = false) {
      const options = getMoodOptions();
      const scored = notes
        .map((note, index) => ({ ...note, index, score: getMoodScore(note.mood), mood: getMoodOption(note.mood) }))
        .filter((note) => note.score);
      const width = detailed ? Math.max(620, notes.length * 104) : 460;
      const height = detailed ? 260 : 86;
      const padLeft = detailed ? 18 : 12;
      const padRight = detailed ? 26 : 12;
      const padTop = detailed ? 20 : 10;
      const padBottom = detailed ? 34 : 12;
      const innerWidth = width - padLeft - padRight;
      const innerHeight = height - padTop - padBottom;
      const span = Math.max(1, notes.length - 1);
      const xFor = (index) => padLeft + (index / span) * innerWidth;
      const yFor = (score) => padTop + ((7 - score) / 6) * innerHeight;
      const neutralY = yFor(4).toFixed(1);
      const empty = !scored.length;
      const guides = detailed
        ? options.map((mood, index) => {
            const score = index + 1;
            const y = yFor(score).toFixed(1);
            const guideClass = score === 4 ? "neutral-guide" : "curve-guide";
            return `<line class="${guideClass}" x1="${padLeft}" y1="${y}" x2="${width - padRight}" y2="${y}"></line>`;
          }).join("")
        : `<line class="neutral-guide" x1="${padLeft}" y1="${neutralY}" x2="${width - padRight}" y2="${neutralY}"></line>`;
      const chartStyle = detailed ? ` style="--chart-width:${width}px"` : "";
      const yAxis = detailed ? `<div class="mood-y-axis"><svg viewBox="0 0 112 ${height}" aria-hidden="true">${options.map((mood, index) => {
        const score = index + 1;
        const y = yFor(score).toFixed(1);
        return `<text x="8" y="${Number(y) + 4}" fill="${score === 4 ? "#7b6250" : "#9a826f"}" font-size="11">${mood.label}</text>`;
      }).join("")}</svg></div>` : "";
      const wrapChart = (svg) => detailed
        ? `<div class="mood-chart-shell">${yAxis}<div class="mood-curve mood-chart"${chartStyle}>${svg}</div></div>`
        : `<div class="mood-curve"${chartStyle}>${svg}</div>`;
      if (empty) return wrapChart(`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="暂无状态曲线">${guides}</svg>`);
      const segments = scored.length === 1 ? "" : scored.slice(1).map((note, index) => {
        const prev = scored[index];
        if (note.index - prev.index !== 1) return "";
        const avg = (prev.score + note.score) / 2;
        const color = avg > 4 ? "#c68138" : avg < 4 ? "#5f857d" : "#8a684f";
        const x1 = xFor(prev.index);
        const y1 = yFor(prev.score);
        const x2 = xFor(note.index);
        const y2 = yFor(note.score);
        const dx = Math.max(18, Math.abs(x2 - x1) * 0.42);
        const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${(x1 + dx).toFixed(1)} ${y1.toFixed(1)}, ${(x2 - dx).toFixed(1)} ${y2.toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`;
        return `<path class="curve-segment" style="--segment-color:${color}" d="${d}"></path>`;
      }).join("");
      const singlePoint = scored.length === 1 ? `<line class="curve-segment" style="--segment-color:${scored[0].mood.color}" x1="${Math.max(padLeft, xFor(scored[0].index) - 14)}" y1="${yFor(scored[0].score).toFixed(1)}" x2="${Math.min(width - padRight, xFor(scored[0].index) + 14)}" y2="${yFor(scored[0].score).toFixed(1)}"></line>` : "";
      const circles = scored.map((note) => `<circle style="--point-color:${note.mood.color}" cx="${xFor(note.index).toFixed(1)}" cy="${yFor(note.score).toFixed(1)}" r="${detailed ? 5 : 4}"><title>${friendlyDate(note.date)} ${note.mood.label}</title></circle>`).join("");
      const labelIndexes = new Set();
      if (detailed) {
        labelIndexes.add(0);
        labelIndexes.add(notes.length - 1);
        notes.forEach((note, index) => { if (note.mood) labelIndexes.add(index); });
        if (labelIndexes.size > 14) {
          const moodIndexes = notes.map((note, index) => note.mood ? index : -1).filter((index) => index >= 0);
          const step = Math.ceil(moodIndexes.length / 10);
          labelIndexes.clear();
          labelIndexes.add(0);
          labelIndexes.add(notes.length - 1);
          moodIndexes.forEach((index, order) => { if (order % step === 0 || order === moodIndexes.length - 1) labelIndexes.add(index); });
        }
      }
      const labels = detailed ? notes.map((note, index) => {
        if (!labelIndexes.has(index)) return "";
        return `<text x="${xFor(index).toFixed(1)}" y="${height - 7}" text-anchor="middle" fill="#8a684f" font-size="10">${friendlyDate(note.date).replace(/周.*/, "")}</text>`;
      }).join("") : "";
      return wrapChart(`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="整体状态曲线">${guides}${segments}${singlePoint}${circles}${labels}</svg>`);
    }

    function handleMoodSummaryClick() {
      if (!isSingleDateContext()) openMoodDetailDialog();
    }

    function handleThoughtSummaryClick() {
      openThoughtDetailDialog();
    }

    function openMoodDetailDialog() {
      const notes = getNotesInCurrentRange();
      els.noteDetailTitle.textContent = "整体趋势";
      els.noteDetailBody.innerHTML = renderMoodCurve(notes, true);
      els.noteDetailDialog.showModal();
      requestAnimationFrame(() => {
        const chart = els.noteDetailBody.querySelector(".mood-chart");
        if (chart) chart.scrollLeft = chart.scrollWidth;
      });
    }

    function openThoughtDetailDialog() {
      const notes = isSingleDateContext() ? [{ date: state.selectedDate, ...getDayNote(state.selectedDate) }] : getNotesInCurrentRange();
      const withThoughts = notes.filter((note) => note.thoughts.length);
      els.noteDetailTitle.textContent = "想法记录";
      els.noteDetailBody.innerHTML = withThoughts.length
        ? withThoughts.map((note) => `
          <details class="thought-day" open>
            <summary><span>${friendlyDate(note.date)}</span><span>${note.thoughts.length} 条</span></summary>
            <div class="thought-list">${note.thoughts.map((item) => thoughtItemHtml(item, { date: note.date, editable: false })).join("")}</div>
          </details>
        `).join("")
        : `<div class="empty">这个范围还没有想法记录。</div>`;
      els.noteDetailDialog.showModal();
    }

    function openDayStateDialog() {
      const date = state.viewMode === "date" ? state.selectedDate : (state.rangeEnd || state.selectedDate);
      state.editingDayStateDate = date;
      const note = getDayNote(date);
      els.dayStateTitle.textContent = `${friendlyDate(date)} · 整体状态`;
      els.moodPicker.innerHTML = `<legend>感受</legend>` + getMoodOptions().map((mood) => `
        <label style="--mood-option-bg:${mood.bg};--mood-option-color:${mood.color}">
          <input type="radio" name="dayMood" value="${mood.value}" ${note.mood === mood.value ? "checked" : ""}>
          ${mood.emoji}<br>${mood.label}
        </label>
      `).join("");
      els.thoughtText.value = "";
      renderThoughtList(note);
      els.dayStateDialog.showModal();
      els.thoughtText.focus();
    }

    function renderThoughtList(note) {
      els.thoughtList.innerHTML = note.thoughts.length
        ? note.thoughts.map((item) => thoughtItemHtml(item, { date: state.editingDayStateDate || state.selectedDate, editable: true })).join("")
        : `<div class="empty">还没有想法记录。</div>`;
    }

    function thoughtItemHtml(item, options = {}) {
      const editable = options.editable !== false;
      const date = options.date || state.editingDayStateDate || state.selectedDate;
      const actions = editable
        ? `<button class="thought-action" type="button" data-thought-action="delete" title="删除">×</button>`
        : `<button class="thought-action" type="button" data-thought-action="copy" title="复制">⧉</button>`;
      return `<div class="thought-item" data-date="${escapeHtml(date)}" data-thought-id="${escapeHtml(item.id)}"><time>${formatThoughtTime(item.createdAt)}</time><div class="thought-text-field" data-thought-action="edit" data-tooltip="${escapeHtml(item.text)}" data-tooltip-thought="true" aria-label="${escapeHtml(item.text)}">${escapeHtml(item.text)}</div><div class="thought-actions">${actions}</div></div>`;
    }

    function handleThoughtInlineEdit(event) {
      const field = event.target.closest('[data-thought-action="edit"]');
      const row = event.target.closest('.thought-item');
      if (!field || !row || !els.dayStateDialog.open || !els.thoughtList.contains(row)) return;
      event.preventDefault();
      startThoughtInlineEdit(row);
    }

    function handleThoughtListAction(event) {
      const actionEl = event.target.closest('[data-thought-action]');
      if (!actionEl) return;
      const action = actionEl.dataset.thoughtAction;
      const row = event.target.closest('.thought-item');
      if (!row) return;
      const date = row.dataset.date;
      const note = getDayNote(date);
      const thought = note.thoughts.find((item) => item.id === row.dataset.thoughtId);
      if (!thought) return;
      if (event.target.closest(".thought-edit-input")) return;
      if (action === "edit") {
        if (els.dayStateDialog.open && els.thoughtList.contains(row)) {
          startThoughtInlineEdit(row);
        } else {
          openThoughtPreview(date, thought);
        }
        return;
      }
      if (action === "copy") {
        copyText(thought.text);
        return;
      }
      if (action === "delete") {
        if (!window.confirm("确认删除这条想法记录吗？")) return;
        note.thoughts = note.thoughts.filter((item) => item.id !== thought.id);
        saveData();
        if (els.dayStateDialog.open) renderThoughtList(note);
        if (els.noteDetailDialog.open) {
          els.noteDetailDialog.close();
          openThoughtDetailDialog();
        }
        render();
      }
    }

    function openThoughtPreview(date, thought) {
      clearTimeout(tooltipTimer);
      els.hoverTooltip.classList.remove("visible");
      els.hoverTooltip.hidden = true;
      els.thoughtPreviewTitle.textContent = "";
      els.thoughtPreviewMeta.textContent = `${friendlyDate(date)} · ${formatThoughtTime(thought.createdAt)}`;
      els.thoughtPreviewContent.textContent = thought.text;
      els.thoughtPreviewDialog.showModal();
    }

    function startThoughtInlineEdit(row) {
      const date = row.dataset.date;
      const note = getDayNote(date);
      const thought = note.thoughts.find((item) => item.id === row.dataset.thoughtId);
      const field = row.querySelector('.thought-text-field');
      if (!thought || !field || field.querySelector('input, textarea')) return;
      const input = document.createElement('textarea');
      input.className = 'thought-edit-input';
      input.value = thought.text;
      row.classList.add('editing');
      field.replaceChildren(input);
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
      let done = false;
      const finish = (save) => {
        if (done) return;
        done = true;
        if (save) {
          thought.text = input.value.trim() || thought.text;
          saveData();
        }
        row.classList.remove('editing');
        renderThoughtList(note);
        render();
      };
      input.addEventListener('keydown', (event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') finish(true);
        if (event.key === 'Escape') finish(false);
      });
      input.addEventListener('blur', () => finish(true));
    }

    function copyText(text) {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).catch(() => window.prompt("复制这条想法", text));
      } else {
        window.prompt("复制这条想法", text);
      }
    }

    function saveDayState(event) {
      event.preventDefault();
      const date = state.editingDayStateDate || state.selectedDate;
      const note = getDayNote(date);
      const checked = els.dayStateForm.querySelector('input[name="dayMood"]:checked');
      note.mood = checked ? checked.value : note.mood;
      const text = els.thoughtText.value.trim();
      if (text) {
        note.thoughts.unshift({
          id: crypto.randomUUID ? crypto.randomUUID() : `thought-${Date.now()}`,
          text,
          createdAt: new Date().toISOString()
        });
      }
      saveData();
      els.dayStateDialog.close();
      render();
    }

    function getCurrentRangeLabel() {
      if (state.viewMode === "all") return "全部记录";
      if ((state.viewMode === "range" || state.viewMode === "calendar") && state.rangeEnd) return `${friendlyDate(state.rangeStart)} - ${friendlyDate(state.rangeEnd)}`;
      return friendlyDate(state.selectedDate);
    }

    function openTimePie() {
      const tasks = getBaseVisibleTasks().filter((task) => (Number(task.durationMinutes) || 0) > 0);
      const groups = groupTasksByProject(tasks);
      const total = sumMinutes(tasks);
      els.timePieTitle.textContent = `${getCurrentRangeLabel()} 时间分布 · ${formatDuration(total)}`;

      els.pieTotal.textContent = formatDuration(total);
      if (!total) {
        els.pieChart.style.setProperty("--pie", "#f2eadb");
        els.pieLegend.innerHTML = `<div class="empty">当前范围还没有记录投入时间。</div>`;
        els.timePieDialog.showModal();
        return;
      }

      const colors = ["#4f8f76", "#d6a24a", "#b96844", "#2f7f78", "#a37a2d", "#7e6b56"];
      let cursor = 0;
      const slices = groups.map((group, index) => {
        const minutes = sumMinutes(group.tasks);
        const start = cursor;
        const end = cursor + (minutes / total) * 100;
        cursor = end;
        return `${colors[index % colors.length]} ${start}% ${end}%`;
      });
      els.pieChart.style.setProperty("--pie", `conic-gradient(${slices.join(", ")})`);
      els.pieLegend.innerHTML = groups.map((group, index) => {
        const minutes = sumMinutes(group.tasks);
        const percent = Math.round((minutes / total) * 100);
        return `
          <div class="legend-item">
            <span class="legend-color" style="background:${colors[index % colors.length]}"></span>
            <span>${escapeHtml(group.project.name)}</span>
            <strong>${formatDuration(minutes)} · ${percent}%</strong>
          </div>
        `;
      }).join("");
      els.timePieDialog.showModal();
    }

    function saveData() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tasks: state.tasks,
        projects: state.projects,
        dailyNotes: state.dailyNotes || {},
        lastReviewDate: state.lastReviewDate || ""
      }));
    }

    function formatDate(date) {
      const value = date instanceof Date ? date : new Date(date);
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    function addDays(dateString, days) {
      const date = new Date(`${dateString}T00:00:00`);
      date.setDate(date.getDate() + days);
      return formatDate(date);
    }

    function friendlyDate(dateString) {
      if (!isValidDateString(dateString)) return "未设置日期";
      const date = new Date(`${dateString}T00:00:00`);
      return date.toLocaleDateString("zh-CN", {
        month: "long",
        day: "numeric",
        weekday: "short"
      });
    }

    function escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }
