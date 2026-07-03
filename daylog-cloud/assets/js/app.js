// ============================================================
// 导入 & 初始化
// ============================================================
import cloudbase from '@cloudbase/js-sdk';

const ENV_ID = 'daylog-d3gkb5k6y8cbd1a32';
const WECHAT_ID = 'YKLSAC';

const app = cloudbase.init({ env: ENV_ID });
const auth = app.auth({ persistence: 'local' });
const db = app.database();
const MOOD_OPTIONS = [
  { value: 'very-unpleasant', label: '非常不愉快', emoji: '🥀', color: '#6c5b50', bg: 'rgba(232, 222, 212, 0.82)' },
  { value: 'unpleasant', label: '不愉快', emoji: '🌧️', color: '#5c6f83', bg: 'rgba(218, 228, 232, 0.82)' },
  { value: 'slightly-unpleasant', label: '有点不愉快', emoji: '☁️', color: '#6f897f', bg: 'rgba(230, 239, 229, 0.82)' },
  { value: 'neutral', label: '不悲不喜', emoji: '🌝', color: '#8a684f', bg: 'rgba(246, 238, 222, 0.86)' },
  { value: 'slightly-pleasant', label: '有点愉快', emoji: '🌤️', color: '#b87535', bg: 'rgba(255, 237, 210, 0.86)' },
  { value: 'pleasant', label: '愉快', emoji: '☀️', color: '#c45f32', bg: 'rgba(255, 226, 198, 0.88)' },
  { value: 'very-pleasant', label: '非常愉快', emoji: '🌻', color: '#d08b25', bg: 'rgba(255, 214, 148, 0.86)' }
];

// ============================================================
// DOM 引用
// ============================================================
const $ = id => document.getElementById(id);

const authGate = $('authGate');
const mainApp = $('mainApp');
const emailInput = $('authEmailInput');
const phoneInput = $('authPhoneInput');
const codeInput = $('authCodeInput');
const sendCodeBtn = $('sendAuthCodeBtn');
const loginBtn = $('loginAuthBtn');
const authMessage = $('authMessage');
const privacyPolicyBtn = $('privacyPolicyBtn');
const privacyAgreeInput = $('privacyAgreeInput');
const privacyDialog = $('privacyDialog');
const privacyPolicyContent = $('privacyPolicyContent');

const displayEmail = $('displayEmail');
const displayUid = $('displayUid');
const copyUidBtn = $('copyUidBtn');
const displayLoginAt = $('displayLoginAt');
const proBadge = $('proBadge');
const accountHint = $('accountHint');
const nicknameDisplay = $('nicknameDisplay');
const nicknameText = $('nicknameText');
const nicknameEditHint = $('nicknameEditHint');
const phoneDisplay = $('phoneDisplay');
const phoneText = $('phoneText');
const phoneEditHint = $('phoneEditHint');
const phoneRevealHint = $('phoneRevealHint');
const proPanel = $('proPanel');
const proMessage = $('proMessage');
const syncUploadBtn = $('syncUploadBtn');
const syncDownloadBtn = $('syncDownloadBtn');
const exportMarkdownBtn = $('exportMarkdownBtn');
const uploadTime = $('uploadTime');
const downloadTime = $('downloadTime');
const syncMessage = $('syncMessage');
const uploadHint = $('uploadHint');
const downloadHint = $('downloadHint');
const exportHint = $('exportHint');
const copyWechatBtn = $('copyWechatBtn');
const logoutBtn = $('logoutBtn');

const accountBtn = $('accountCenterBtn');
const drawer = $('accountDrawer');
const drawerBackdrop = $('accountBackdrop');
const drawerCloseBtn = $('drawerCloseBtn');

const topbar = $('topbar');
const calendarRangeTitle = $('calendarRangeTitle');
const calendarAllBtn = $('calendarAllBtn');
const calendarYearSelect = $('calendarYearSelect');
const calendarMonthSelect = $('calendarMonthSelect');
const projectRail = $('projectRail');
const addProjectBtn = $('addProjectBtn');
const manageProjectsBtn = $('manageProjectsBtn');
const projectActions = $('projectActions');
const taskTable = $('taskTable');
const taskHead = $('taskHead');
const taskBody = $('taskBody');
const emptyState = $('emptyState');
const addTaskBtn = $('addTaskBtn');
const totalCount = $('totalCount');
const doneCount = $('doneCount');
const doneRate = $('doneRate');
const pendingCount = $('pendingCount');
const unplannedCount = $('unplannedCount');
const focusTime = $('focusTime');
const resetSortBtn = $('resetSortBtn');
const showAllBtn = $('showAllBtn');
const dailyView = $('dailyView');
const calendarView = $('calendarView');
const calendarGrid = $('calendarGrid');
const rangeStart = $('rangeStart');
const rangeEnd = $('rangeEnd');
const todayRangeBtn = $('todayRangeBtn');
const weekRangeBtn = $('weekRangeBtn');
const allTimeBtn = $('allTimeBtn');
const greetingMessage = $('greetingMessage');
const statTasks = $('statTasks');
const statProjects = $('statProjects');
const statDayStates = $('statDayStates');
const statDays = $('statDays');
const projectHint = $('projectHint');
const stageReviewPanel = $('stageReviewPanel');
const stageReviewKicker = $('stageReviewKicker');
const stageReviewSummary = $('stageReviewSummary');
const stageReviewHint = $('stageReviewHint');
const openStageReviewBtn = $('openStageReviewBtn');

const dayStateStrip = $('dayStateStrip');
const moodSummary = $('moodSummary');
const thoughtSummary = $('thoughtSummary');
const openDayStateBtn = $('openDayStateBtn');
const dayStateDialog = $('dayStateDialog');
const dayStateForm = $('dayStateForm');
const dayStateTitle = $('dayStateTitle');
const moodPicker = $('moodPicker');
const thoughtText = $('thoughtText');
const thoughtList = $('thoughtList');
const dayStateCancelBtn = $('dayStateCancelBtn');
const noteDetailDialog = $('noteDetailDialog');
const noteDetailTitle = $('noteDetailTitle');
const noteDetailBody = $('noteDetailBody');
const noteDetailCloseBtn = $('noteDetailCloseBtn');
const projectListDialog = $('projectListDialog');
const projectListBody = $('projectListBody');
const projectListAddBtn = $('projectListAddBtn');
const projectMergePanel = $('projectMergePanel');
const mergeSourceProjects = $('mergeSourceProjects');
const mergeTargetProject = $('mergeTargetProject');
const mergeConfirmBtn = $('mergeConfirmBtn');
const mergeUndoBtn = $('mergeUndoBtn');
const timePieDialog = $('timePieDialog');
const pieChart = $('pieChart');
const pieTotal = $('pieTotal');
const pieLegend = $('pieLegend');
const timePieCloseBtn = $('timePieCloseBtn');

const projectDialog = $('projectDialog');
const projectForm = $('projectForm');
const projectName = $('projectName');
const projectDdl = $('projectDdl');
const projectCancelBtn = $('projectCancelBtn');

const taskDialog = $('taskDialog');
const taskForm = $('taskForm');
const taskStartTime = $('taskStartTime');
const taskText = $('taskText');
const taskProject = $('taskProject');
const taskDate = $('taskDate');
const taskMinutes = $('taskMinutes');
const taskRating = document.querySelectorAll('input[name="taskRating"]');
const taskNote = $('taskNote');

// ============================================================
// 状态
// ============================================================
let currentUser = null;
let tasks = [];
let projects = [];
let dayStates = [];
let selectedRating = 'all';
let selectedProjectId = '';
let currentView = 'daily';
let calendarFilterYear = '';
let calendarFilterMonth = '';
let taskSort = { key: 'default', direction: 'asc' };
let projectClickTimer = 0;
let editingProjectId = '';
let editingTaskId = '';
let projectListCollapsed = {};
let mergePanelOpen = false;
let lastMergeSnapshot = null;
let verificationInfo = null;
let loginAt = null;
let userPhone = '';
let isUserPro = false;
let cloudSaveTimer = null;
let editingDayStateDate = '';
const UNASSIGNED_PROJECT_ID = '__daylog_unassigned__';
const PREVIEW_DAY_STATE = {
  mood: 'pleasant',
  thought: '今天完成了两小时的脚本打磨，也给下一期选题留了三条备选方向。比起追求一次写完，更重要的是把灵感稳稳接住。'
};
const PREVIEW_REVIEW = {
  days: 5,
  thoughts: 9,
  tasks: 18,
  minutes: 1260,
  rows: [
    { id: 'preview-topic', name: '选题策划', minutes: 480, buckets: [120, 80, 120, 90, 70] },
    { id: 'preview-script', name: '脚本打磨', minutes: 330, buckets: [40, 90, 60, 80, 60] },
    { id: UNASSIGNED_PROJECT_ID, name: '待整理', minutes: 180, buckets: [30, 30, 20, 40, 60] },
    { id: 'preview-review', name: '发布复盘', minutes: 270, buckets: [60, 50, 70, 40, 50] }
  ],
  buckets: ['周一', '周二', '周三', '周四', '周五']
};

// ============================================================
// 辅助函数
// ============================================================
function setAuthMessage(msg, type = '') {
  authMessage.textContent = msg;
  authMessage.className = 'sync-message ' + type;
}
function setProMessage(msg, isError = false) {
  proMessage.textContent = msg;
  proMessage.className = 'sync-message ' + (isError ? 'error' : 'success');
}
function setSyncMessage(msg, isError = false) {
  syncMessage.textContent = msg;
  syncMessage.className = 'sync-message ' + (isError ? 'error' : 'success');
}

async function copyWechatForSponsor(target = null) {
  await copyText(WECHAT_ID);
  const nextText = '已复制微信';
  if (target) {
    const previous = target.textContent;
    target.textContent = nextText;
    window.setTimeout(() => { target.textContent = previous; }, 1400);
  }
  setProMessage('微信号已复制，请添加时备注“DayLog Pro”。', false);
}

function renderMarkdownInline(text = '') {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

function renderMarkdownTable(lines, startIndex) {
  const rows = [];
  let index = startIndex;
  while (index < lines.length && /^\s*\|.+\|\s*$/.test(lines[index])) {
    const rawCells = lines[index].trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
    rows.push(rawCells);
    index += 1;
  }
  if (rows.length < 2) return { html: '', nextIndex: startIndex };
  const alignRow = rows[1];
  const bodyRows = rows.slice(2);
  const valid = alignRow.every(cell => /^:?-{3,}:?$/.test(cell));
  if (!valid) return { html: '', nextIndex: startIndex };
  const head = rows[0].map(cell => `<th>${renderMarkdownInline(cell)}</th>`).join('');
  const body = bodyRows.map(row => `<tr>${row.map(cell => `<td>${renderMarkdownInline(cell)}</td>`).join('')}</tr>`).join('');
  return { html: `<table class="policy-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`, nextIndex: index };
}

function renderMarkdownLite(markdown = '') {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  for (let i = 0; i < lines.length; i += 1) {
    const text = lines[i].trim();
    if (!text) continue;
    if (/^\|.+\|$/.test(text)) {
      const table = renderMarkdownTable(lines, i);
      if (table.html) {
        html.push(table.html);
        i = table.nextIndex - 1;
        continue;
      }
    }
    if (text.startsWith('### ')) html.push(`<h4>${renderMarkdownInline(text.slice(4))}</h4>`);
    else if (text.startsWith('## ')) html.push(`<h3>${renderMarkdownInline(text.slice(3))}</h3>`);
    else if (text.startsWith('# ')) html.push(`<h2>${renderMarkdownInline(text.slice(2))}</h2>`);
    else if (/^>\s+/.test(text)) html.push(`<p class="policy-quote">${renderMarkdownInline(text.replace(/^>\s+/, ''))}</p>`);
    else if (/^[-*]\s+/.test(text)) html.push(`<p class="policy-list-item">${renderMarkdownInline(text.replace(/^[-*]\s+/, ''))}</p>`);
    else html.push(`<p>${renderMarkdownInline(text)}</p>`);
  }
  return html.join('');
}

async function openPrivacyPolicy() {
  if (!privacyDialog || !privacyPolicyContent) return;
  privacyPolicyContent.innerHTML = '<div class="empty compact">正在读取隐私政策...</div>';
  privacyDialog.showModal();
  try {
    const response = await fetch('data/privacy-policy.md', { cache: 'no-store' });
    if (!response.ok) throw new Error('privacy policy missing');
    const text = await response.text();
    privacyPolicyContent.innerHTML = renderMarkdownLite(text);
  } catch {
    privacyPolicyContent.innerHTML = '<div class="empty compact">隐私政策暂时无法读取，请稍后再试。</div>';
  }
}

function normalizeDialogChrome(dialog) {
  if (!dialog) return;
  const body = dialog.querySelector('.dialog-body') || dialog.querySelector('form') || dialog.firstElementChild;
  if (!body || body.dataset.chromeReady === 'true') return;
  body.classList.add('dialog-body');
  const title = body.querySelector(':scope > h2');
  const actions = body.querySelector(':scope > .dialog-actions');
  const titlebar = document.createElement('div');
  titlebar.className = 'dialog-titlebar';
  if (title) titlebar.append(title);
  else titlebar.append(document.createElement('span'));
  const closeButton = document.createElement('button');
  closeButton.className = 'dialog-close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-label', '关闭弹窗');
  closeButton.textContent = '×';
  closeButton.addEventListener('click', () => dialog.close());
  titlebar.append(closeButton);
  body.prepend(titlebar);

  const content = document.createElement('div');
  content.className = 'dialog-content';
  Array.from(body.children)
    .filter(child => child !== titlebar && child !== actions)
    .forEach(child => content.append(child));
  if (actions) body.insertBefore(content, actions);
  else body.append(content);
  body.dataset.chromeReady = 'true';
}
function makeDialogMovable(dialog) {
  if (!dialog || dialog.dataset.moveReady === 'true') return;
  dialog.dataset.moveReady = 'true';
  dialog.addEventListener('mousedown', event => {
    if (event.button !== 0) return;
    const handle = event.target.closest('.dialog-titlebar');
    if (!handle || event.target.closest('button, input, select, textarea, label')) return;
    const rect = dialog.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    let moved = false;
    const onMove = moveEvent => {
      if (Math.abs(moveEvent.clientX - event.clientX) + Math.abs(moveEvent.clientY - event.clientY) > 4) moved = true;
      if (!moved) return;
      const maxLeft = Math.max(8, window.innerWidth - dialog.offsetWidth - 8);
      const maxTop = Math.max(8, window.innerHeight - dialog.offsetHeight - 8);
      dialog.classList.add('is-dragged');
      dialog.style.left = `${Math.min(Math.max(8, moveEvent.clientX - offsetX), maxLeft)}px`;
      dialog.style.top = `${Math.min(Math.max(8, moveEvent.clientY - offsetY), maxTop)}px`;
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}
function makeDialogResizable(dialog) {
  if (!dialog || dialog.dataset.resizeReady === 'true') return;
  dialog.dataset.resizeReady = 'true';
  const nativeShowModal = dialog.showModal.bind(dialog);
  dialog.showModal = (...args) => {
    if (!dialog.dataset.userSized) {
      dialog.style.width = '';
      dialog.style.height = '';
    }
    nativeShowModal(...args);
  };
  dialog.addEventListener('mousedown', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX >= rect.right - 22 || event.clientY >= rect.bottom - 22) dialog.dataset.userSized = 'true';
  }, true);
}
function prepareDialog(dialog) {
  normalizeDialogChrome(dialog);
  makeDialogMovable(dialog);
  makeDialogResizable(dialog);
}

let tooltipTimer = 0;
let tooltipEl = null;
function setupDelayedTooltips() {
  document.querySelectorAll('.hover-tooltip').forEach(el => el.remove());
  tooltipEl = document.createElement('div');
  tooltipEl.className = 'hover-tooltip';
  document.body.appendChild(tooltipEl);
  document.addEventListener('mouseover', event => {
    const target = event.target.closest('[data-tooltip], [title]');
    if (!target) return;
    const text = target.dataset.tooltip || target.getAttribute('title') || '';
    if (!text.trim()) return;
    const overflows = target.scrollWidth > target.clientWidth || target.scrollHeight > target.clientHeight;
    if (!target.dataset.tooltip && !overflows) return;
    if (target.getAttribute('title')) {
      target.dataset.nativeTitle = target.getAttribute('title');
      target.removeAttribute('title');
    }
    clearTimeout(tooltipTimer);
    tooltipTimer = window.setTimeout(() => showTooltip(target, text), 720);
  });
  document.addEventListener('mousemove', event => {
    if (!tooltipEl?.classList.contains('visible')) return;
    positionTooltip(event.clientX, event.clientY);
  });
  document.addEventListener('mouseout', event => {
    if (!event.target.closest('[data-tooltip], [data-native-title]')) return;
    clearTimeout(tooltipTimer);
    hideTooltip();
    const target = event.target.closest('[data-native-title]');
    if (target) {
      target.setAttribute('title', target.dataset.nativeTitle);
      delete target.dataset.nativeTitle;
    }
  });
}

function showTooltip(target, text) {
  if (!tooltipEl) return;
  document.querySelectorAll('.hover-tooltip').forEach(el => {
    if (el !== tooltipEl) el.remove();
  });
  const activeDialog = target.closest('dialog[open]');
  const nextParent = activeDialog || document.body;
  if (tooltipEl.parentElement !== nextParent) nextParent.appendChild(tooltipEl);
  tooltipEl.textContent = text;
  tooltipEl.classList.add('visible');
  const rect = target.getBoundingClientRect();
  positionTooltip(rect.left + rect.width / 2, rect.top, true);
}

function positionTooltip(x, y, preferAbove = true) {
  if (!tooltipEl) return;
  const rect = tooltipEl.getBoundingClientRect();
  const left = Math.min(window.innerWidth - rect.width - 14, Math.max(14, x + 12));
  const above = y - rect.height - 12;
  const below = y + 12;
  const preferred = preferAbove && above >= 14 ? above : below;
  const top = Math.min(window.innerHeight - rect.height - 14, Math.max(14, preferred));
  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top = `${top}px`;
}

function hideTooltip() {
  tooltipEl?.classList.remove('visible');
}
function getToday() { return new Date().toISOString().slice(0, 10); }
function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function isValidDateString(value) { return /^\d{4}-\d{2}-\d{2}$/.test(value || ''); }
function parseLocalDate(value) { return new Date(`${value}T00:00:00`); }
function friendlyDate(value) {
  if (!isValidDateString(value)) return '';
  const date = parseLocalDate(value);
  return `${date.getMonth() + 1}月${date.getDate()}日周${'日一二三四五六'[date.getDay()]}`;
}
function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}
function escapeMarkdownCell(value = '') {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}
function formatDateTime(d) {
  if (!d) return '-';
  const date = new Date(d);
  return date.toLocaleString('zh-CN', { hour12: false });
}
function maskPhone(phone) {
  if (!phone || phone.length < 11) return phone || '';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}
function isValidPhone(phone) { return /^\d{11}$/.test(phone); }
function getDuration(ms) {
  if (!ms) return '';
  const diff = Date.now() - new Date(ms).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return minutes + '分钟前';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + '小时前';
  return Math.floor(hours / 24) + '天前';
}
function cleanPhone(val) { return val.replace(/\D/g, ''); }
function normalizeThoughtItem(item, fallbackDate = '') {
  if (typeof item === 'string') {
    return { id: generateId(), text: item, createdAt: fallbackDate ? `${fallbackDate}T00:00:00` : new Date().toISOString() };
  }
  return {
    id: item?.id || generateId(),
    text: String(item?.text || '').trim(),
    createdAt: item?.createdAt || item?.created_at || new Date().toISOString()
  };
}
function normalizeMoodValue(value) {
  if (value === undefined || value === null || value === '') return null;
  const raw = String(value);
  if (MOOD_OPTIONS.some(option => option.value === raw)) return raw;
  const legacyMap = {
    '-3': 'very-unpleasant',
    '-2': 'unpleasant',
    '-1': 'slightly-unpleasant',
    '0': 'neutral',
    '1': 'slightly-pleasant',
    '2': 'pleasant',
    '3': 'very-pleasant'
  };
  return legacyMap[raw] || null;
}
function normalizeDayState(item = {}) {
  const date = item.date || getToday();
  const thoughts = Array.isArray(item.thoughts)
    ? item.thoughts.map(thought => normalizeThoughtItem(thought, date)).filter(thought => thought.text)
    : (item.thought && String(item.thought).trim()
      ? [normalizeThoughtItem({ text: item.thought, createdAt: item.updated_at || item.createdAt }, date)]
      : []);
  return {
    id: item.id || generateId(),
    date,
    mood: normalizeMoodValue(item.mood),
    thoughts,
    updated_at: item.updated_at || item.updatedAt || new Date().toISOString()
  };
}
function normalizeProject(item = {}) {
  const ddl = isValidDateString(item.ddl) ? item.ddl : '';
  const name = String(item.name || '未命名').trim() || '未命名';
  const mode = ddl ? 'dated' : (item.scheduleMode === 'plannedLater' || item.scheduleMode === 'planned' ? 'plannedLater' : 'empty');
  return {
    id: item.id || generateId(),
    name,
    ddl,
    scheduleMode: mode,
    createdAt: item.createdAt || item.created_at || new Date().toISOString()
  };
}
function normalizeTask(item = {}) {
  return {
    id: item.id || generateId(),
    text: item.text || item.name || '未命名',
    projectId: item.projectId || '',
    date: item.date || item.targetDate || getToday(),
    startTime: item.startTime || item.timeBucket || 'morning',
    minutes: Number(item.minutes ?? item.durationMinutes ?? 0) || 0,
    rating: item.rating || item.completionRating || 'full',
    note: item.note || '',
    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
    order: item.order || 9999
  };
}
function normalizeContent(content = {}) {
  return {
    projects: Array.isArray(content.projects) ? content.projects.map(normalizeProject) : [],
    tasks: Array.isArray(content.tasks) ? content.tasks.map(normalizeTask) : [],
    dayStates: Array.isArray(content.dayStates) ? content.dayStates.map(normalizeDayState) : []
  };
}
function hasBusinessData(content = {}) {
  const normalized = normalizeContent(content);
  return normalized.projects.length > 0 || normalized.tasks.length > 0 || normalized.dayStates.length > 0;
}
function toTimestamp(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}
function getSavedAtLabel(value) {
  return value ? formatDateTime(value) : '无记录';
}
function getWeekRange(date = new Date()) {
  const day = date.getDay() || 7;
  const start = new Date(date);
  start.setDate(date.getDate() - day + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: date.toISOString().slice(0, 10)
  };
}
function isDateInRange(date) {
  if (!date) return true;
  if (rangeStart?.value && !rangeEnd?.value) return date === rangeStart.value;
  if (rangeStart?.value && date < rangeStart.value) return false;
  if (rangeEnd?.value && date > rangeEnd.value) return false;
  return true;
}
function getVisibleTasks() {
  return tasks.filter(t => {
    const ratingMatched = selectedRating === 'all' || t.rating === selectedRating;
    const projectMatched = !selectedProjectId
      || (selectedProjectId === UNASSIGNED_PROJECT_ID ? !t.projectId : t.projectId === selectedProjectId);
    return ratingMatched && projectMatched && isDateInRange(t.date);
  });
}
function getVisibleDayStates() {
  const { start, end } = getDayStateRangeBounds();
  return dayStates
    .filter(d => isDateInStateRange(d.date, start, end) && ((d.thoughts || []).length || d.mood !== null))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}

function getDayStateRangeBounds() {
  if (currentView === 'calendar') return getCalendarDisplayRange();
  return { start: rangeStart?.value || '', end: rangeEnd?.value || '' };
}

function isDateInStateRange(date, start, end) {
  if (!date) return true;
  if (start && !end) return date === start;
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}
function getMoodLabel(value) {
  return getMoodOption(value).label;
}
function getMoodOption(value) {
  const mood = normalizeMoodValue(value);
  return MOOD_OPTIONS.find(option => option.value === mood) || { value: null, label: '未记录', emoji: '·', color: 'var(--muted)', bg: 'rgba(255, 250, 241, 0.9)' };
}
function getMoodScore(value) {
  const mood = normalizeMoodValue(value);
  const index = MOOD_OPTIONS.findIndex(option => option.value === mood);
  return index >= 0 ? index + 1 : null;
}
function hasThoughts(dayState) {
  return Array.isArray(dayState?.thoughts) && dayState.thoughts.length > 0;
}
function getDayState(date) {
  let item = dayStates.find(state => state.date === date);
  if (!item) {
    item = { id: generateId(), date, mood: null, thoughts: [], updated_at: new Date().toISOString() };
  }
  return item;
}
function isSingleDateRange() {
  return Boolean(rangeStart?.value) && (!rangeEnd?.value || rangeStart.value === rangeEnd.value);
}
function getActiveDate() {
  return rangeStart?.value || getToday();
}
function formatThoughtTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function getAllThoughts() {
  return dayStates.flatMap(state => (state.thoughts || []).map(thought => ({ ...thought, date: state.date, mood: state.mood })));
}
function formatUsageSpan(firstDate) {
  if (!firstDate) return '0天';
  const start = new Date(`${firstDate}T00:00:00`);
  const today = new Date(`${getToday()}T00:00:00`);
  const days = Math.max(1, Math.floor((today - start) / 86400000) + 1);
  if (days >= 365) {
    const years = Math.floor(days / 365);
    const rest = days % 365;
    return `${years}年${rest}天`;
  }
  if (days >= 90) {
    const months = Math.floor(days / 30);
    const rest = days % 30;
    return `${months}月${rest}天`;
  }
  return `${days}天`;
}
function getRatingMap() {
  return {
    full: { label: '圆满完成', emoji: '🎉' },
    partial: { label: '有所推进', emoji: '👏' },
    baseline: { label: '保底完成', emoji: '🤲' },
    unplanned: { label: '计划外', emoji: '✨' }
  };
}
function getCompletionRating(value) {
  return getRatingMap()[value] || getRatingMap().full;
}
function formatDuration(minutes) {
  const value = Number(minutes) || 0;
  if (value >= 60) {
    const h = Math.floor(value / 60);
    const m = value % 60;
    return m ? `${h}小时${m}分钟` : `${h}小时`;
  }
  return `${value}分钟`;
}
function formatCompactDuration(minutes) {
  const value = Number(minutes) || 0;
  if (value >= 60) return `${Math.floor(value / 60)}h${value % 60 ? `${value % 60}m` : ''}`;
  return `${value}m`;
}
function sumMinutes(list) {
  return list.reduce((sum, task) => sum + (Number(task.minutes) || 0), 0);
}
function getProjectName(id) {
  if (!id || id === UNASSIGNED_PROJECT_ID) return '待整理';
  return projects.find(project => project.id === id)?.name || '待整理';
}
function hasProjectDdl(project) {
  return isValidDateString(project.ddl);
}
function isDraftProject(project) {
  return !project.ddl && (project.name || '').trim() === '未命名';
}
function isFreshProject(project) {
  if (hasProjectDdl(project) || project.scheduleMode === 'plannedLater') return false;
  const createdAt = project.createdAt || project.created_at;
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}
function isPlannedLater(project) {
  return !hasProjectDdl(project) && !isDraftProject(project) && !isFreshProject(project);
}
function compareProjects(a, b) {
  const aDraft = isDraftProject(a);
  const bDraft = isDraftProject(b);
  if (aDraft !== bDraft) return aDraft ? -1 : 1;
  const aFresh = isFreshProject(a);
  const bFresh = isFreshProject(b);
  if (aFresh !== bFresh) return aFresh ? -1 : 1;
  const aHasDdl = hasProjectDdl(a);
  const bHasDdl = hasProjectDdl(b);
  if (aHasDdl !== bHasDdl) return aHasDdl ? -1 : 1;
  if (aHasDdl && a.ddl !== b.ddl) return a.ddl.localeCompare(b.ddl);
  const aPlanned = isPlannedLater(a);
  const bPlanned = isPlannedLater(b);
  if (aPlanned !== bPlanned) return aPlanned ? 1 : -1;
  return (a.name || '').localeCompare(b.name || '', 'zh-CN');
}
function getBaseTasksForRange() {
  return tasks.filter(t => isDateInRange(t.date) && (!selectedProjectId
    || (selectedProjectId === UNASSIGNED_PROJECT_ID ? !t.projectId : t.projectId === selectedProjectId)));
}

// ============================================================
// 数据持久化
// ============================================================
function getLocalData() {
  try { const raw = localStorage.getItem('daylog_data'); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function setLocalData(data) { localStorage.setItem('daylog_data', JSON.stringify(data)); }
function getLocalContent() {
  const data = getLocalData();
  return normalizeContent(data?.content);
}
function getLocalMeta() {
  try { const raw = localStorage.getItem('daylog_meta'); return raw ? JSON.parse(raw) : { nickname: '', phoneRevealed: false }; } catch { return { nickname: '', phoneRevealed: false }; }
}
function setLocalMeta(meta) { localStorage.setItem('daylog_meta', JSON.stringify(meta)); }

// ============================================================
// 云端操作
// ============================================================
async function loadFromCloud(uid) {
  try {
    const res = await db.collection('user_data').where({ _openid: uid }).get();
    if (res.data && res.data.length > 0) {
      const doc = res.data[0];
      return { content: normalizeContent(doc.content), saved_at: doc.saved_at || null, docId: doc._id };
    }
    return null;
  } catch (e) { console.warn('从云端加载数据失败:', e); return null; }
}
async function saveToCloud(uid, content) {
  try {
    const result = await app.callFunction({ name: 'saveUserData', data: { uid, content } });
    if (result.result && result.result.code === 0) {
      return result.result.data?.saved_at || new Date().toISOString();
    }
    throw new Error(result.result?.message || '保存失败');
  } catch (e) { console.error('保存到云端失败:', e); throw e; }
}
function queueCloudSave(content) {
  if (!currentUser) return;
  window.clearTimeout(cloudSaveTimer);
  cloudSaveTimer = window.setTimeout(async () => {
    try {
      const savedAt = await saveToCloud(currentUser.uid, normalizeContent(content));
      const localData = getLocalData();
      if (localData) {
        setLocalData({ content: normalizeContent(localData.content), saved_at: savedAt || localData.saved_at });
      }
      lastUploadTime = new Date().toISOString();
      localStorage.setItem('daylog_last_upload', lastUploadTime);
      updateSyncTimes();
    } catch (e) {
      console.warn('自动云同步失败:', e);
    }
  }, 700);
}

// ============================================================
// 渲染
// ============================================================
function applyData(content) {
  const normalized = normalizeContent(content);
  projects = normalized.projects;
  tasks = normalized.tasks;
  dayStates = normalized.dayStates;
  renderAll();
}

function renderAll() {
  mainApp?.classList.toggle('calendar-mode', currentView === 'calendar');
  renderTopbar();
  renderProjects();
  if (currentView === 'calendar') {
    calendarView.classList.remove('is-hidden');
    dailyView.classList.add('is-hidden');
  } else {
    calendarView.classList.add('is-hidden');
    dailyView.classList.remove('is-hidden');
    renderTasks();
    renderStats();
  }
  renderCalendar();
  renderDayStateStrip();
  renderStageReviewPanel();
  updateStatsBanner();
}

function renderTopbar() {
  topbar?.classList.toggle('calendar-mode', currentView === 'calendar');
  if (showAllBtn) showAllBtn.textContent = currentView === 'calendar' ? '返回' : '📅 日历';
  todayRangeBtn?.classList.toggle('active', rangeStart.value === getToday() && !rangeEnd.value);
  const week = getWeekRange();
  weekRangeBtn?.classList.toggle('active', rangeStart.value === week.start && rangeEnd.value === week.end);
  allTimeBtn?.classList.toggle('active', !rangeStart.value && !rangeEnd.value);
  renderCalendarFilterControls();
}

function renderCalendarFilterControls() {
  if (!calendarYearSelect || !calendarMonthSelect) return;
  const years = getCalendarAvailableYears();
  calendarAllBtn?.classList.toggle('active', !calendarFilterYear);
  calendarYearSelect.innerHTML = `<option value="">选择年份</option>` + years.map(year => `<option value="${year}" ${String(year) === calendarFilterYear ? 'selected' : ''}>${year}年</option>`).join('');
  calendarMonthSelect.innerHTML = `<option value="">全年</option>` + Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${String(i + 1) === calendarFilterMonth ? 'selected' : ''}>${i + 1}月</option>`).join('');
  calendarYearSelect.value = calendarFilterYear;
  calendarMonthSelect.value = calendarFilterMonth;
  calendarMonthSelect.disabled = !calendarFilterYear;
}

function getCalendarAvailableYears() {
  const dates = [...tasks.map(t => t.date), ...dayStates.map(d => d.date), getToday()].filter(isValidDateString).sort();
  const startYear = parseLocalDate(dates[0]).getFullYear();
  const endYear = parseLocalDate(dates[dates.length - 1]).getFullYear();
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
}

function renderProjects() {
  if (!projectRail) return;
  const sortedProjects = [...projects].sort(compareProjects);
  const hasUnassignedTasks = tasks.some(t => !t.projectId);
  const visibleProjects = hasUnassignedTasks ? [...sortedProjects, createUnassignedProjectCard()] : sortedProjects;
  projectHint.textContent = selectedProjectId ? `当前筛选：${getProjectName(selectedProjectId)}` : '';
  projectRail.closest('.project-rail-layout')?.classList.toggle('has-overflow', visibleProjects.length > 3);
  projectRail.closest('.project-rail-layout')?.classList.toggle('readonly-rail', currentView === 'calendar');
  projectRail.innerHTML = visibleProjects.map(projectCard).join('');
  if (projectActions) projectActions.hidden = currentView === 'calendar';
}

function createUnassignedProjectCard() {
  return {
    id: UNASSIGNED_PROJECT_ID,
    name: '待整理',
    ddl: '',
    scheduleMode: 'system',
    synthetic: 'unassigned'
  };
}

function projectCard(p) {
  const isUnassignedCard = p.synthetic === 'unassigned';
  const countdown = getDdlCountdown(p.ddl);
  const minutes = sumMinutes(tasks.filter(t => (isUnassignedCard ? !t.projectId : t.projectId === p.id) && isDateInRange(t.date)));
  const scheduleMarkup = hasProjectDdl(p)
    ? `<div class="project-countdown" data-project-field="ddl">
        <div class="days-left ${countdown.longRange ? 'long-range' : ''}">${countdown.label}</div>
        <div class="countdown-text">${countdown.longRange ? '长期项目' : `距离 ${friendlyDate(p.ddl)}`}</div>
      </div>`
    : `<div class="project-date-placeholder" data-project-field="ddl">${isUnassignedCard ? '临时归属' : (isDraftProject(p) || isFreshProject(p) ? '设置日期' : '待计划')}</div>`;
  const cardKind = isUnassignedCard ? 'tidy-project' : (hasProjectDdl(p) ? countdown.variant : (isDraftProject(p) || isFreshProject(p) ? 'draft-project' : 'waiting-project'));
  return `
    <div class="project-card ${hasProjectDdl(p) ? 'has-ddl' : ''} ${cardKind} ${selectedProjectId === p.id ? 'is-filtered' : ''}" data-project-id="${escapeHtml(p.id)}" data-project-filter-key="${escapeHtml(p.id)}">
      <div class="project-content">
        <div class="project-name" data-project-field="name" data-tooltip="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
        ${scheduleMarkup}
        <div class="project-time-total">累计 ${formatCompactDuration(minutes)}</div>
      </div>
    </div>
  `;
}

function getDdlCountdown(dateString) {
  if (!isValidDateString(dateString)) return { label: '', variant: 'waiting-project', longRange: false };
  const today = parseLocalDate(getToday());
  const ddl = parseLocalDate(dateString);
  const diff = Math.ceil((ddl - today) / 86400000);
  if (diff > 365) return { label: '一年后', variant: 'due-later', longRange: true };
  if (diff > 30) return { label: `${diff}<small>天</small>`, variant: 'due-later', longRange: false };
  return { label: `${Math.abs(diff)}<small>天</small>`, variant: 'due-soon', longRange: false };
}

function renderTasks() {
  if (!taskBody) return;
  const filtered = getSortedVisibleTasks();
  taskHead.innerHTML = `
    <tr>
      <th><button type="button" data-sort-key="startTime">时间 ${sortMark('startTime')}</button></th>
      <th><button type="button" data-sort-key="text">事件 ${sortMark('text')}</button></th>
      <th><button type="button" data-sort-key="projectId">项目 ${sortMark('projectId')}</button></th>
      <th><button type="button" data-sort-key="date">日期 ${sortMark('date')}</button></th>
      <th><button type="button" data-sort-key="minutes">投入时间 ${sortMark('minutes')}</button></th>
      <th><button type="button" data-sort-key="rating">完成情况 ${sortMark('rating')}</button></th>
      <th><button type="button" data-sort-key="note">备注 ${sortMark('note')}</button></th>
      <th>操作</th>
    </tr>`;
  taskBody.innerHTML = addTaskRow() + filtered.map(taskRow).join('');
  emptyState.style.display = filtered.length ? 'none' : 'block';
}

function sortMark(key) {
  if (taskSort.key !== key) return '↕';
  return taskSort.direction === 'asc' ? '↑' : '↓';
}

function getSortedVisibleTasks() {
  const list = [...getVisibleTasks()];
  if (taskSort.key === 'default') return list;
  const key = taskSort.key;
  const direction = taskSort.direction === 'asc' ? 1 : -1;
  return list.sort((a, b) => {
    const av = key === 'projectId' ? getProjectName(a.projectId) : (a[key] ?? '');
    const bv = key === 'projectId' ? getProjectName(b.projectId) : (b[key] ?? '');
    if (key === 'minutes') return ((Number(av) || 0) - (Number(bv) || 0)) * direction;
    return String(av).localeCompare(String(bv), 'zh-CN') * direction;
  });
}

function addTaskRow() {
  return `<tr class="add-row"><td colspan="8"><button class="add-todo" type="button" data-add-task title="记录事件">+</button></td></tr>`;
}

function taskRow(t) {
  const rating = getCompletionRating(t.rating);
  return `
    <tr class="task-row done" data-task-id="${escapeHtml(t.id)}">
      <td data-task-field="startTime"><span class="planned-time">${escapeHtml(getTimeBucketLabel(t.startTime))}</span></td>
      <td data-task-field="text"><div class="task-title" data-tooltip="${escapeHtml(t.text || '未命名')}">${escapeHtml(t.text || '未命名')}</div></td>
      <td data-task-field="projectId"><div class="chip">${escapeHtml(getProjectName(t.projectId))}</div></td>
      <td data-task-field="date">${escapeHtml(friendlyDate(t.date) || t.date || '')}</td>
      <td data-task-field="minutes"><span class="completion-record">${t.minutes ? formatDuration(t.minutes) : '未填写'}</span></td>
      <td data-task-field="rating"><span class="status">${rating.emoji} ${rating.label}</span></td>
      <td data-task-field="note"><div class="task-title task-remark" data-tooltip="${escapeHtml(t.note || '-')}">${escapeHtml(t.note || '-')}</div></td>
      <td><button class="icon-button action-danger" type="button" data-action="delete-task" data-id="${escapeHtml(t.id)}">×</button></td>
    </tr>`;
}

function getTimeBucketLabel(value) {
  if (value === 'afternoon') return '下午';
  if (value === 'evening') return '晚上';
  return '上午';
}

function renderStats() {
  const rangeTasks = tasks.filter(t => (!selectedProjectId
    || (selectedProjectId === UNASSIGNED_PROJECT_ID ? !t.projectId : t.projectId === selectedProjectId)) && isDateInRange(t.date));
  const visibleTasks = getVisibleTasks();
  const total = visibleTasks.length;
  const full = rangeTasks.filter(t => t.rating === 'full').length;
  const partial = rangeTasks.filter(t => t.rating === 'partial').length;
  const baseline = rangeTasks.filter(t => t.rating === 'baseline').length;
  const unplanned = rangeTasks.filter(t => t.rating === 'unplanned').length;
  const totalMin = visibleTasks.reduce((s, t) => s + (t.minutes || 0), 0);
  totalCount.textContent = total;
  doneCount.textContent = full;
  doneRate.textContent = partial;
  pendingCount.textContent = baseline;
  unplannedCount.textContent = unplanned;
  focusTime.textContent = totalMin > 0 ? (totalMin >= 60 ? Math.floor(totalMin / 60) + 'h' + totalMin % 60 + 'm' : totalMin + 'm') : '0m';
  document.querySelectorAll('.metric-button').forEach(btn => btn.classList.toggle('active', btn.dataset.rating === selectedRating));
}

function renderDayStateStrip() {
  if (!dayStateStrip) return;
  const single = currentView !== 'calendar' && isSingleDateRange();
  const locked = !isUserPro;
  dayStateStrip.classList.toggle('range-mode', !single);
  dayStateStrip.classList.toggle('is-locked', locked);
  dayStateStrip.classList.toggle('calendar-readonly', currentView === 'calendar');
  dayStateStrip.classList.toggle('preview-mode', locked);

  if (single) {
    const date = getActiveDate();
    const state = locked
      ? { date, mood: PREVIEW_DAY_STATE.mood, thoughts: [{ id: 'preview-thought', text: PREVIEW_DAY_STATE.thought, createdAt: new Date(`${date}T09:12:00`).toISOString() }] }
      : getDayState(date);
    const mood = getMoodOption(state.mood);
    const latest = state.thoughts?.[0];
    dayStateStrip.style.setProperty('--mood-bg', mood.bg);
    dayStateStrip.style.setProperty('--mood-color', mood.color);
    moodSummary.innerHTML = `<span>感受${locked ? '（示例）' : ''}</span><strong><span class="mood-emoji emoji-mark">${escapeHtml(mood.emoji)}</span>${escapeHtml(mood.label)}</strong>${locked ? '<small>记录后将呈现实际内容</small>' : ''}`;
    thoughtSummary.innerHTML = latest
      ? `<span>想法${locked ? '（示例）' : ''}</span><div class="thought-line" data-tooltip="${escapeHtml(latest.text)}"><time class="thought-time">${escapeHtml(formatThoughtTime(latest.createdAt))}</time><span class="thought-text" data-tooltip="${escapeHtml(latest.text)}">${escapeHtml(latest.text)}</span></div>${locked ? '<small>记录后将呈现实际内容</small>' : ''}`
      : `<span>想法</span><div class="thought-line"><span class="thought-text">今天还没有留下想法</span></div>`;
    openDayStateBtn.hidden = currentView === 'calendar';
    openDayStateBtn.textContent = locked ? '预览记录' : '记录自我觉察';
    return;
  }

  const visibleStates = locked ? getPreviewDayStatesForRange() : getVisibleDayStates();
  const thoughtDays = visibleStates.filter(state => hasThoughts(state)).length;
  const thoughtCount = visibleStates.reduce((sum, state) => sum + (state.thoughts?.length || 0), 0);
  dayStateStrip.style.setProperty('--mood-bg', 'rgba(255, 250, 241, 0.9)');
  dayStateStrip.style.setProperty('--mood-color', 'var(--accent)');
  moodSummary.innerHTML = `<span>感受${locked ? '（示例）' : ''}</span>${renderMoodCurve(visibleStates, { limit: 15, relative: locked })}${locked ? '<small>记录后将呈现实际内容</small>' : ''}`;
  thoughtSummary.innerHTML = `<span>想法${locked ? '（示例）' : ''}</span><div class="thought-line"><span class="thought-text">这期间你有 ${thoughtDays} 天记录了 ${thoughtCount} 条想法</span></div>${locked ? '<small>记录后将呈现实际内容</small>' : ''}`;
  openDayStateBtn.hidden = true;
}

function getPreviewDayStatesForRange() {
  const bounds = getDayStateRangeBounds();
  const start = bounds.start || shiftDate(getToday(), -4);
  const end = bounds.end || getToday();
  const total = Math.max(1, Math.min(5, daysBetween(start, end) + 1));
  const moods = ['slightly-unpleasant', 'neutral', 'slightly-pleasant', 'pleasant', 'slightly-pleasant'];
  const previewTexts = [
    ['上午把选题池重新分了三组：能马上写的、需要素材的、只是一个念头的。这样看起来没那么乱了。'],
    ['脚本第一段还是太用力，删掉了一些解释，把开头换成一个具体场景。', '晚上复看时发现标题不需要更大声，反而要更准确。'],
    ['今天主要在整理旧素材，剪掉重复的截图后，反而看清楚下一条内容应该讲什么。'],
    ['发布前有一点犹豫，但这次没有反复推翻，只做了必要的检查。', '记录一下：稳定输出不是每天都兴奋，而是低电量时也能留下一个小进度。'],
    ['复盘这一周，真正有效的是提前把任务拆小。下周继续保留这个节奏。']
  ];
  return Array.from({ length: total }, (_, index) => {
    const date = shiftDate(end, -(total - index - 1));
    const texts = previewTexts[index % previewTexts.length];
    return {
      id: `preview-${date}`,
      date,
      mood: moods[index % moods.length],
      thoughts: texts.map((text, thoughtIndex) => ({
        id: `preview-thought-${index}-${thoughtIndex}`,
        text,
        createdAt: new Date(`${date}T${String(9 + thoughtIndex * 9).padStart(2, '0')}:12:00`).toISOString()
      })),
      updated_at: new Date().toISOString()
    };
  });
}

function renderMoodCurve(states, options = {}) {
  const detailed = Boolean(options.detailed);
  const relative = Boolean(options.relative);
  const limit = options.limit || 0;
  let mooded = states
    .filter(state => state.mood !== null)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  if (limit && rangeStart?.value) {
    const bounds = getDayStateRangeBounds();
    const end = bounds.end || bounds.start || mooded[mooded.length - 1]?.date;
    const latestStart = shiftDate(end, -(limit - 1));
    mooded = mooded.filter(state => state.date >= latestStart && state.date <= end);
  }
  const visibleMooded = limit ? mooded.slice(-limit) : mooded;
  if (!visibleMooded.length) return '<div class="mood-curve empty-curve">未记录</div>';
  const width = detailed ? Math.max(760, visibleMooded.length * 92) : 520;
  const height = detailed ? 260 : 64;
  const padLeft = detailed ? 140 : 12;
  const padRight = detailed ? 28 : 12;
  const padTop = detailed ? 22 : 8;
  const padBottom = detailed ? 48 : 8;
  const innerWidth = width - padLeft - padRight;
  const innerHeight = height - padTop - padBottom;
  const yFor = score => padTop + ((7 - score) / 6) * innerHeight;
  const bounds = getDayStateRangeBounds();
  const startDate = relative ? visibleMooded[0].date : (bounds.start || visibleMooded[0].date);
  const endDate = relative ? visibleMooded[visibleMooded.length - 1].date : (bounds.end || (isSingleDateRange() ? startDate : visibleMooded[visibleMooded.length - 1].date));
  const spanDays = Math.max(1, daysBetween(startDate, endDate));
  const xForDate = date => padLeft + (daysBetween(startDate, date) / spanDays) * innerWidth;
  const guides = MOOD_OPTIONS.map((mood, index) => {
    const score = index + 1;
    const y = yFor(score).toFixed(1);
    const label = detailed ? `<text x="8" y="${Number(y) + 5}" fill="#7b6250" font-size="13">${escapeHtml(mood.emoji)} ${escapeHtml(mood.label)}</text>` : '';
    return `<line class="${score === 4 ? 'neutral-guide' : 'curve-guide'}" x1="${detailed ? padLeft : 8}" y1="${y}" x2="${width - padRight}" y2="${y}"></line>${label}`;
  }).join('');
  const points = visibleMooded.map((state, index) => {
    const x = visibleMooded.length === 1 ? padLeft + innerWidth / 2 : xForDate(state.date);
    const score = getMoodScore(state.mood) || 4;
    const y = yFor(score);
    return { x, y, state, mood: getMoodOption(state.mood) };
  });
  const path = points.length === 1
    ? ''
    : points.slice(1).map((point, index) => {
      const prev = points[index];
      const dx = Math.max(18, Math.abs(point.x - prev.x) * 0.42);
      return `M ${prev.x.toFixed(1)} ${prev.y.toFixed(1)} C ${(prev.x + dx).toFixed(1)} ${prev.y.toFixed(1)}, ${(point.x - dx).toFixed(1)} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }).join(' ');
  const xLabels = detailed ? points.map(point => `<text x="${point.x.toFixed(1)}" y="${height - 14}" text-anchor="middle" fill="#8a684f" font-size="12">${escapeHtml(point.state.date.slice(5).replace('-', '月'))}日</text>`).join('') : '';
  const single = points.length === 1 ? `<line class="curve-segment" x1="${Math.max(padLeft, points[0].x - 14)}" y1="${points[0].y.toFixed(1)}" x2="${Math.min(width - padRight, points[0].x + 14)}" y2="${points[0].y.toFixed(1)}"></line>` : '';
  return `<div class="mood-curve ${detailed ? 'mood-curve-detailed' : ''}"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="感受曲线">
    ${guides}
    ${path ? `<path class="curve-segment" d="${path}"></path>` : single}
    ${points.map(point => `<circle style="--point-color:${point.mood.color}" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${detailed ? 5 : 4}"><title>${escapeHtml(point.state.date)} ${escapeHtml(point.mood.label)}</title></circle>`).join('')}
    ${xLabels}
  </svg></div>`;
}

function shiftDate(dateString, offset) {
  const date = parseLocalDate(dateString);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function daysBetween(start, end) {
  return Math.max(0, Math.round((parseLocalDate(end) - parseLocalDate(start)) / 86400000));
}

function renderCalendar() {
  if (!calendarGrid) return;
  const { start, end } = getCalendarDisplayRange();
  calendarGrid.innerHTML = renderMonthCalendars(start, end);
}

function getCalendarDisplayRange() {
  const dates = [...tasks.map(t => t.date), ...dayStates.map(d => d.date)].filter(isValidDateString).sort();
  const today = getToday();
  const first = dates[0] || today;
  const year = Number(calendarFilterYear);
  const month = Number(calendarFilterMonth);
  if (!year) return { start: first, end: today };
  if (month) return { start: `${year}-${String(month).padStart(2, '0')}-01`, end: new Date(year, month, 0).toISOString().slice(0, 10) };
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

function renderMonthCalendars(start, end) {
  const months = [];
  const cursor = new Date(`${start.slice(0, 7)}-01T00:00:00`);
  const last = new Date(`${end.slice(0, 7)}-01T00:00:00`);
  while (cursor <= last) {
    months.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months.map(monthDate => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const first = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first.getDay(); i++) cells.push('<div class="day-card calendar-spacer"></div>');
    for (let day = 1; day <= lastDay; day++) {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push(dayCard(date, date >= start && date <= end));
    }
    return `<section class="month-section">
      <div class="month-title">${year}年${month + 1}月</div>
      <div class="weekday-row"><span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span></div>
      <div class="month-grid">${cells.join('')}</div>
    </section>`;
  }).join('');
}

function dayCard(date, inRange = true) {
  const dayTasks = tasks.filter(t => t.date === date);
  const groups = [...new Map(dayTasks.map(t => [t.projectId || '', { id: t.projectId || '', name: getProjectName(t.projectId), tasks: dayTasks.filter(x => (x.projectId || '') === (t.projectId || '')) }])).values()]
    .sort((a, b) => sumMinutes(b.tasks) - sumMinutes(a.tasks));
  const content = groups.length ? groups.map(group => `
    <div class="calendar-project ${selectedProjectId === group.id ? 'project-highlight' : ''}">
      <strong data-tooltip="${escapeHtml(group.name)}">${escapeHtml(group.name)}</strong>
      <span>${group.tasks.length} 条记录</span>
      <span>累计时间：${formatDuration(sumMinutes(group.tasks))}</span>
    </div>`).join('') : '<div class="empty">没有记录</div>';
  return `<article class="day-card ${date === getToday() ? 'today' : ''} ${inRange ? '' : 'outside-range'}" data-date="${date}" tabindex="0">
    <div class="day-head"><span>${friendlyDate(date)}</span><span>${dayTasks.length} 条</span></div>
    <div class="calendar-projects">${content}</div>
  </article>`;
}

function updateStatsBanner() {
  const total = tasks.length;
  const projectCount = projects.length;
  const thoughtCount = getAllThoughts().length;
  const dates = [
    ...tasks.map(t => t.date).filter(Boolean),
    ...dayStates.filter(d => d.date && ((d.thoughts || []).length || d.mood !== null)).map(d => d.date)
  ];
  const recordedDates = [...new Set(dates)].sort();
  statTasks.textContent = total;
  statProjects.textContent = projectCount;
  statDayStates.textContent = thoughtCount;
  statDays.textContent = formatUsageSpan(recordedDates[0]);
}

function renderStageReviewPanel() {
  if (!stageReviewPanel || !stageReviewSummary || !openStageReviewBtn) return;
  const preview = !isUserPro;
  const data = getStageReviewData(preview);
  stageReviewPanel.classList.toggle('preview-mode', preview);
  stageReviewKicker.textContent = preview ? '阶段复盘（示例）' : '阶段复盘';
  stageReviewSummary.textContent = `记录了 ${data.days} 天，${data.thoughts} 条想法，共 ${data.tasks} 条事件，累计投入 ${formatDuration(data.minutes)}`;
  stageReviewHint.textContent = preview ? '记录后将呈现实际内容。' : '';
  openStageReviewBtn.textContent = preview ? '预览复盘功能' : '阶段复盘详情';
}

function getStageReviewData(preview = false) {
  if (preview) {
    return {
      days: PREVIEW_REVIEW.days,
      thoughts: PREVIEW_REVIEW.thoughts,
      tasks: PREVIEW_REVIEW.tasks,
      minutes: PREVIEW_REVIEW.minutes,
      rows: PREVIEW_REVIEW.rows,
      buckets: PREVIEW_REVIEW.buckets,
      bounds: getStageReviewBounds(),
      preview: true
    };
  }
  const bounds = getStageReviewBounds();
  const rangeTasks = tasks.filter(t => isDateInStateRange(t.date, bounds.start, bounds.end));
  const rangeStates = getVisibleDayStates();
  const recordedDates = new Set([
    ...rangeTasks.map(t => t.date).filter(Boolean),
    ...rangeStates.filter(state => state.mood !== null || hasThoughts(state)).map(state => state.date)
  ]);
  const thoughts = rangeStates.reduce((sum, state) => sum + (state.thoughts?.length || 0), 0);
  const minutes = sumMinutes(rangeTasks);
  const buckets = getReviewBuckets(bounds, rangeTasks);
  return {
    days: recordedDates.size,
    thoughts,
    tasks: rangeTasks.length,
    minutes,
    rows: getReviewRows(rangeTasks, buckets),
    buckets: buckets.map(bucket => bucket.label),
    bounds,
    preview: false
  };
}

function getStageReviewBounds() {
  if (currentView === 'calendar') return getCalendarDisplayRange();
  const dated = [
    ...tasks.map(t => t.date).filter(isValidDateString),
    ...dayStates.map(state => state.date).filter(isValidDateString),
    getToday()
  ].sort();
  const start = rangeStart?.value || dated[0] || getToday();
  const end = rangeEnd?.value || (rangeStart?.value ? rangeStart.value : dated[dated.length - 1] || getToday());
  return { start, end };
}

function getReviewBuckets(bounds, rangeTasks = []) {
  const start = isValidDateString(bounds.start) ? bounds.start : getToday();
  const end = isValidDateString(bounds.end) && bounds.end >= start ? bounds.end : start;
  const span = daysBetween(start, end) + 1;
  if (start === end) return [createReviewBucket(start, end, start.replace(/-/g, '/'))];
  if (isCurrentWeekBounds(start, end)) return [createReviewBucket(start, end, `${start.replace(/-/g, '/')}-${end.replace(/-/g, '/')}`)];
  if (span <= 7) return buildDayBuckets(start, end);
  if (span <= 31) return buildWeekBuckets(start, end);
  if (span <= 365) return buildMonthBuckets(start, end);
  return buildYearBuckets(start, end, rangeTasks);
}

function createReviewBucket(start, end, label) {
  return { start, end, label };
}

function isCurrentWeekBounds(start, end) {
  const week = getWeekRange();
  return start === week.start && end === week.end;
}

function buildDayBuckets(start, end) {
  const buckets = [];
  let cursor = start;
  let guard = 0;
  while (cursor <= end && guard < 8) {
    buckets.push(createReviewBucket(cursor, cursor, cursor.replace(/-/g, '/')));
    cursor = shiftDate(cursor, 1);
    guard += 1;
  }
  return buckets;
}

function buildWeekBuckets(start, end) {
  const buckets = [];
  let cursor = start;
  let guard = 0;
  while (cursor <= end && guard < 8) {
    const date = parseLocalDate(cursor);
    const day = date.getDay() || 7;
    const weekEnd = shiftDate(cursor, 7 - day);
    const clippedEnd = weekEnd > end ? end : weekEnd;
    buckets.push(createReviewBucket(cursor, clippedEnd, `${cursor.replace(/-/g, '/')}-${clippedEnd.replace(/-/g, '/')}`));
    cursor = shiftDate(clippedEnd, 1);
    guard += 1;
  }
  return buckets;
}

function buildMonthBuckets(start, end) {
  const buckets = [];
  let cursor = `${start.slice(0, 7)}-01`;
  let guard = 0;
  while (cursor <= end && guard < 14) {
    const year = Number(cursor.slice(0, 4));
    const month = Number(cursor.slice(5, 7));
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) break;
    const monthEnd = new Date(year, month, 0).toISOString().slice(0, 10);
    const bucketStart = cursor < start ? start : cursor;
    const bucketEnd = monthEnd > end ? end : monthEnd;
    buckets.push(createReviewBucket(bucketStart, bucketEnd, `${year}年${month}月`));
    cursor = `${month === 12 ? year + 1 : year}-${String(month === 12 ? 1 : month + 1).padStart(2, '0')}-01`;
    guard += 1;
  }
  return buckets;
}

function buildYearBuckets(start, end) {
  const buckets = [];
  const startYear = Number(start.slice(0, 4));
  const endYear = Number(end.slice(0, 4));
  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) return [];
  for (let year = startYear; year <= endYear && buckets.length < 12; year++) {
    const bucketStart = `${year}-01-01` < start ? start : `${year}-01-01`;
    const bucketEnd = `${year}-12-31` > end ? end : `${year}-12-31`;
    buckets.push(createReviewBucket(bucketStart, bucketEnd, `${year}年`));
  }
  return buckets;
}

function getReviewRows(rangeTasks, buckets) {
  const groups = new Map();
  rangeTasks.forEach(task => {
    const id = task.projectId || UNASSIGNED_PROJECT_ID;
    if (!groups.has(id)) groups.set(id, { id, name: getProjectName(id), minutes: 0, buckets: Array(buckets.length).fill(0) });
    const group = groups.get(id);
    const minutes = Number(task.minutes) || 0;
    const bucketIndex = buckets.findIndex(bucket => task.date >= bucket.start && task.date <= bucket.end);
    group.minutes += minutes;
    if (bucketIndex >= 0) group.buckets[bucketIndex] += minutes;
  });
  const unassigned = groups.get(UNASSIGNED_PROJECT_ID);
  groups.delete(UNASSIGNED_PROJECT_ID);
  const regular = [...groups.values()].sort((a, b) => b.minutes - a.minutes);
  const top = regular.slice(0, 3);
  const rest = regular.slice(3);
  const rows = [...top];
  if (unassigned?.minutes) rows.push(unassigned);
  if (rest.length) {
    rows.push({
      id: 'other',
      name: '其他',
      minutes: rest.reduce((sum, item) => sum + (Number(item.minutes) || 0), 0),
      buckets: rest.reduce((acc, item) => acc.map((value, index) => value + (item.buckets[index] || 0)), Array(buckets.length).fill(0))
    });
  }
  return rows.sort((a, b) => b.minutes - a.minutes).slice(0, 5);
}

function renderStageReviewChart(data) {
  const rows = data.rows.slice(0, 5);
  const bucketLabels = data.buckets.slice(0, 12);
  const total = Math.max(1, rows.reduce((sum, row) => sum + row.minutes, 0));
  const bucketTotals = bucketLabels.map((_, index) => rows.reduce((sum, row) => sum + (Number(row.buckets[index]) || 0), 0));
  if (!rows.length) return '<div class="empty compact">当前范围还没有投入时间。</div>';
  return `<div class="review-chart matrix-review-chart" style="--bucket-count:${Math.max(1, bucketLabels.length)}">
    <div class="review-project-column">
      ${rows.map(row => `<div class="review-project-name" data-tooltip="${escapeHtml(row.name)}">${escapeHtml(row.name)}</div>`).join('')}
      <div class="review-axis-spacer"></div>
    </div>
    <div class="review-scroll-column">
      <div class="review-scroll-inner">
        ${rows.map(row => {
          const percent = Math.round((row.minutes / total) * 100);
          const buckets = row.buckets.slice(0, bucketLabels.length);
          return `<div class="review-bars" data-row-percent="${percent}">
            ${buckets.map((value, index) => {
              const bucketTotal = bucketTotals[index] || 0;
              const width = value > 0 && bucketTotal > 0 ? Math.max(6, Math.round((value / bucketTotal) * 100)) : 0;
              return `<span class="${value > 0 ? '' : 'is-empty'}" style="--bar-width:${width}%"></span>`;
            }).join('')}
          </div>`;
        }).join('')}
        <div class="review-axis">${bucketLabels.map(label => `<em>${escapeHtml(label)}</em>`).join('')}</div>
      </div>
    </div>
    <div class="review-percent-column">
      ${rows.map(row => `<div class="review-percent">${Math.round((row.minutes / total) * 100)}%</div>`).join('')}
      <div class="review-axis-spacer"></div>
    </div>
  </div>`;
}

function getStageReviewCopyText(data) {
  const bounds = data.bounds || getStageReviewBounds();
  const lines = [
    '# DayLog 阶段复盘材料',
    '',
    `时间范围：${bounds.start} 至 ${bounds.end}`,
    '',
    '## 复盘概览',
    `记录了 ${data.days} 天，${data.thoughts} 条想法，共 ${data.tasks} 条事件，累计投入 ${formatDuration(data.minutes)}。`,
    '',
    '## 项目时间分布',
    ...data.rows.map(row => `- ${row.name}：${formatDuration(row.minutes)}`),
    '',
    '## 想法记录',
    getThoughtsTextForCopy() || '当前范围没有想法记录。',
    '',
    '请基于以上内容，帮我分析这段时间的投入分布、状态线索，以及下一阶段可以关注的调整方向。'
  ];
  return lines.join('\n');
}

function openStageReviewDetail() {
  const preview = !isUserPro;
  const data = getStageReviewData(preview);
  noteDetailTitle.textContent = preview ? '阶段复盘详情（示例）' : '阶段复盘详情';
  noteDetailBody.innerHTML = `
    <section class="stage-review-detail ${preview ? 'preview-mode' : ''}" data-preview-review="${preview ? 'true' : 'false'}">
      <div class="review-overview">
        <strong>记录了 ${data.days} 天，${data.thoughts} 条想法，共 ${data.tasks} 条事件，累计投入 ${formatDuration(data.minutes)}</strong>
      </div>
      <div class="review-section-title">项目时间分布</div>
      ${renderStageReviewChart(data)}
      <div class="review-note">
        <span class="${preview ? 'preview-activate-hint' : ''}">${preview ? '激活 Pro 后，这里会呈现你的真实复盘内容。' : '你的记录值得被看见，都是与自己的对话。'}</span>
        <div class="review-actions">
          ${preview
      ? '<button class="primary sponsor-action" type="button" data-pro-sponsor="true">🌱 赞助项目，激活 Pro ✨</button>'
      : '<button class="ghost" type="button" data-review-action="copy-thoughts">一键复制想法</button><button class="primary" type="button" data-review-action="copy-all">一键复制全部</button>'}
        </div>
      </div>
    </section>
  `;
  noteDetailDialog.showModal();
}

async function loadGreetingMessage() {
  const fallback = '慢慢写，认真看见自己。';
  if (!greetingMessage) return;
  try {
    const response = await fetch('data/greetings.rtf', { cache: 'no-store' });
    if (!response.ok) throw new Error('greeting file not found');
    const raw = await response.text();
    const lines = extractGreetingLines(raw);
    const last = sessionStorage.getItem('daylog-last-greeting') || '';
    const candidates = lines.length > 1 ? lines.filter(line => line !== last) : lines;
    const message = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : fallback;
    sessionStorage.setItem('daylog-last-greeting', message);
    greetingMessage.textContent = message;
    greetingMessage.dataset.tooltip = message;
  } catch {
    greetingMessage.textContent = fallback;
    greetingMessage.dataset.tooltip = fallback;
  }
}

function extractGreetingLines(raw) {
  const plain = raw.includes('{\\rtf') ? rtfToPlainText(raw) : raw;
  return plain
    .split(/\r?\n/)
    .map(line => line.replace(/^\s*[\d０-９]+[\s.．、)）-]*/, '').replace(/\\+$/g, '').replace(/\s+/g, ' ').trim())
    .filter(line => line.length > 6 && /[\u4e00-\u9fff]/.test(line) && !/fonttbl|colortbl|cocoartf/i.test(line));
}

function rtfToPlainText(raw) {
  return raw
    .replace(/\\u(-?\d+)\s?/g, (_, code) => {
      const value = Number(code);
      return String.fromCharCode(value < 0 ? value + 65536 : value);
    })
    .replace(/\\'[0-9a-fA-F]{2}/g, '')
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\line/g, '\n')
    .replace(/\\[a-zA-Z*]+-?\d* ?/g, ' ')
    .replace(/\\/g, '')
    .replace(/[{}]/g, '\n');
}

// ============================================================
// 本地保存
// ============================================================
async function saveAndRenderLocal() {
  const content = normalizeContent({ projects, tasks, dayStates });
  const savedAt = new Date().toISOString();
  setLocalData({ content, saved_at: savedAt });
  renderAll();
  if (currentUser) queueCloudSave(content);
}

// ============================================================
// 登录
// ============================================================
phoneInput?.addEventListener('input', () => {
  phoneInput.value = cleanPhone(phoneInput.value).slice(0, 11);
});

async function ensureUserRecord(uid, email, phone = '') {
  const cleanedPhone = cleanPhone(phone).slice(0, 11);
  const existing = await findUserRecord(uid, email);
  if (existing) {
    const updates = { email, updated_at: new Date() };
    if (cleanedPhone) updates.phone = cleanedPhone;
    await db.collection('users').doc(existing._id).update(updates);
    return { ...existing, ...updates };
  }
  const added = await db.collection('users').add({
    _openid: uid,
    uid,
    email,
    phone: cleanedPhone,
    status: 'basic',
    created_at: new Date(),
    updated_at: new Date()
  });
  return { _id: added?.id || added?._id, _openid: uid, uid, email, phone: cleanedPhone, status: 'basic' };
}

async function findUserRecord(uid = currentUser?.uid, email = currentUser?.email || displayEmail?.textContent || '') {
  if (!uid && !email) return null;
  const queries = [];
  if (uid) {
    queries.push({ uid });
    queries.push({ _openid: uid });
  }
  const cleanEmail = (email || '').trim();
  if (cleanEmail && cleanEmail !== '-') queries.push({ email: cleanEmail });
  for (const query of queries) {
    const res = await db.collection('users').where(query).get();
    if (res.data && res.data.length > 0) return res.data[0];
  }
  return null;
}

sendCodeBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  if (!email) { setAuthMessage('请输入邮箱地址', 'error'); return; }
  try {
    setAuthMessage('正在发送验证码...');
    sendCodeBtn.disabled = true;
    verificationInfo = await auth.getVerification({ email });

    const phoneInput = document.getElementById('authPhoneInput');
    const phoneLabel = document.getElementById('authPhoneLabel');
    if (verificationInfo.is_user) {
      phoneInput.style.display = 'none';
      phoneLabel.style.display = 'none';
    } else {
      phoneInput.style.display = 'block';
      phoneLabel.style.display = 'block';
    }
    setAuthMessage(`邮件发送✅ 验证码已发送至 ${email}`, 'success');
  } catch (e) { setAuthMessage('❌ 发送失败：' + e.message, 'error'); }
  finally { sendCodeBtn.disabled = false; }
});

loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const code = codeInput.value.trim();
  const phone = cleanPhone(phoneInput.value.trim());

  if (!email) { setAuthMessage('请输入邮箱地址', 'error'); return; }
  if (!code) { setAuthMessage('请输入验证码', 'error'); return; }
  if (!verificationInfo) { setAuthMessage('请先发送验证码', 'error'); return; }
  if (privacyAgreeInput && !privacyAgreeInput.checked) { setAuthMessage('请先勾选隐私保护协议', 'error'); return; }
  if (phone && !isValidPhone(phone)) { setAuthMessage('手机号需要填写 11 位数字，或留空', 'error'); return; }

  try {
    setAuthMessage('正在验证...');
    loginBtn.disabled = true;
    const tokenRes = await auth.verify({
      verification_id: verificationInfo.verification_id,
      verification_code: code
    });

    if (verificationInfo.is_user) {
      await auth.signIn({ username: email, verification_token: tokenRes.verification_token });
      const user = auth.currentUser;
      if (user?.uid) await ensureUserRecord(user.uid, email, phone);
    } else {
      const signUpResult = await auth.signUp({
        email,
        verification_code: code,
        verification_token: tokenRes.verification_token,
        password: 'DayLog@2026'
      });

      const user = signUpResult?.user || signUpResult || auth.currentUser;
      if (user && user.uid) {
        await ensureUserRecord(user.uid, email, phone);
      } else {
        // 延迟重试
        await new Promise(resolve => setTimeout(resolve, 500));
        const retryUser = auth.currentUser;
        if (retryUser && retryUser.uid) {
          await ensureUserRecord(retryUser.uid, email, phone);
        }
      }
    }
    setAuthMessage('✅ 登录成功！', 'success');
    await onLoginSuccess();
  } catch (e) {
    setAuthMessage('❌ 登录失败：' + e.message, 'error');
  } finally {
    loginBtn.disabled = false;
  }
});

// ============================================================
// 登录成功
// ============================================================
async function onLoginSuccess() {
  const user = auth.currentUser;
  if (!user) return;
  currentUser = user;
  loginAt = new Date();

  authGate.style.display = 'none';
  mainApp.style.display = 'block';

  displayEmail.textContent = user.email || user.uid;
  displayUid.textContent = user.uid;
  displayLoginAt.textContent = formatDateTime(loginAt);

  const previousUid = localStorage.getItem('daylog_active_uid');
  if (previousUid && previousUid !== user.uid) {
    localStorage.removeItem('daylog_data');
  }
  localStorage.setItem('daylog_active_uid', user.uid);

  let localData = getLocalData();
  let localContent = normalizeContent(localData?.content);
  let contentToApply = localContent;

  const cloudData = await loadFromCloud(user.uid);
  if (cloudData && hasBusinessData(cloudData.content)) {
    const localSavedAt = toTimestamp(localData?.saved_at);
    const cloudSavedAt = toTimestamp(cloudData.saved_at);
    if (!localData || cloudSavedAt > localSavedAt) {
      const shouldRestore = !hasBusinessData(localContent)
        || confirm(`检测到云端数据较新（${getSavedAtLabel(cloudData.saved_at)}），是否恢复到本机？\n\n取消将保留当前本机数据。`);
      if (shouldRestore) {
        contentToApply = normalizeContent(cloudData.content);
        setLocalData({ content: contentToApply, saved_at: cloudData.saved_at || new Date().toISOString() });
        lastDownloadTime = new Date().toISOString();
        localStorage.setItem('daylog_last_download', lastDownloadTime);
      }
    } else if (hasBusinessData(localContent) && localSavedAt > cloudSavedAt) {
      const shouldUpload = confirm(`检测到本机数据较新（${getSavedAtLabel(localData.saved_at)}），是否上传到云端？\n\n取消将暂不覆盖云端数据。`);
      if (shouldUpload) {
        const savedAt = await saveToCloud(user.uid, localContent);
        setLocalData({ content: localContent, saved_at: savedAt || localData.saved_at });
        lastUploadTime = new Date().toISOString();
        localStorage.setItem('daylog_last_upload', lastUploadTime);
      }
    }
  } else if (hasBusinessData(localContent)) {
    const shouldUpload = confirm('当前账号云端还没有数据，是否上传本机数据作为云端备份？');
    if (shouldUpload) {
      const savedAt = await saveToCloud(user.uid, localContent);
      setLocalData({ content: localContent, saved_at: savedAt || localData?.saved_at || new Date().toISOString() });
      lastUploadTime = new Date().toISOString();
      localStorage.setItem('daylog_last_upload', lastUploadTime);
    }
  }

  applyData(contentToApply);

  await loadUserMeta(user.uid);
  await refreshPhoneDisplay();
  await updateProStatus(user.uid);
  renderAll();
  updateSyncTimes();
}

// ============================================================
// 用户元数据
// ============================================================
async function loadUserMeta(uid) {
  try {
    const res = await db.collection('user_meta').where({ _openid: uid }).get();
    let meta = getLocalMeta();
    if (res.data && res.data.length > 0) {
      meta.nickname = res.data[0].nickname || meta.nickname || '';
      meta.docId = res.data[0]._id;
    }
    setLocalMeta(meta);
    renderAccountInfo(meta);
  } catch (e) { console.warn('加载用户元数据失败:', e); }
}

async function saveUserMeta(uid, updates) {
  const meta = getLocalMeta();
  const newMeta = { ...meta, ...updates };
  setLocalMeta(newMeta);
  renderAccountInfo(newMeta);
  try {
    if (!uid) return;
    const res = await db.collection('user_meta').where({ _openid: uid }).get();
    if (res.data && res.data.length > 0) {
      await db.collection('user_meta').doc(res.data[0]._id).update({
        ...updates,
        updated_at: new Date()
      });
    } else {
      await db.collection('user_meta').add({
        _openid: uid,
        nickname: newMeta.nickname || '',
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  } catch (e) { console.warn('保存用户元数据失败:', e); }
}

function renderAccountInfo(meta) {
  const nick = meta.nickname?.trim() || '';
  nicknameDisplay.innerHTML = `
    <span id="nicknameText">${escapeHtml(nick || '给自己起个昵称吧')}</span>
    <span class="edit-hint" id="nicknameEditHint">✎</span>
  `;
}

// ============================================================
// 手机号
// ============================================================
function renderPhoneDisplay(phone = userPhone) {
  const meta = getLocalMeta();
  const revealed = meta.phoneRevealed || false;
  if (phone) {
    phoneDisplay.innerHTML = `
      <span id="phoneText">${escapeHtml(revealed ? phone : maskPhone(phone))}</span>
      <span class="view-hint" id="phoneRevealHint">${revealed ? '🙈' : '👁'}</span>
      <span class="edit-hint" id="phoneEditHint">✎</span>
    `;
  } else {
    phoneDisplay.innerHTML = `
      <span id="phoneText">用于找回账号</span>
      <span class="edit-hint" id="phoneEditHint">✎</span>
    `;
  }
}

async function refreshPhoneDisplay() {
  if (!currentUser) return;
  try {
    const meta = getLocalMeta();
    const userRecord = await findUserRecord();
    if (userRecord) {
      userPhone = userRecord.phone || meta.accountPhone || '';
      renderPhoneDisplay(userPhone);
    } else {
      userPhone = meta.accountPhone || '';
      renderPhoneDisplay(userPhone);
    }
  } catch (e) { console.warn('刷新手机号失败:', e); }
}

async function updateUserPhone(phone) {
  if (!currentUser) return;
  try {
    const email = currentUser.email || displayEmail?.textContent || '';
    let userRecord = await findUserRecord(currentUser.uid, email);
    if (!userRecord) {
      await ensureUserRecord(currentUser.uid, email, '');
      userRecord = await findUserRecord(currentUser.uid, email);
    }
    if (!userRecord?._id) throw new Error('未找到可更新的 users 账号记录');
    if (userRecord) {
      await db.collection('users').doc(userRecord._id).update({
        uid: currentUser.uid,
        email: email || userRecord.email || '',
        phone: phone || '',
        updated_at: new Date()
      });
    }
    const savedRecord = await findUserRecord(currentUser.uid, email);
    const savedPhone = savedRecord?.phone || '';
    if ((phone || '') && savedPhone !== phone) throw new Error('手机号未写入 users 表，请检查 CloudBase users 表写权限');
    userPhone = phone || '';
    setLocalMeta({ ...getLocalMeta(), accountPhone: userPhone });
    renderPhoneDisplay(userPhone);
    if (proMessage) setProMessage('', false);
  } catch (e) {
    console.warn('更新手机号失败:', e);
    if (proMessage) setProMessage('', true);
    await refreshPhoneDisplay();
    throw e;
  }
}

// ============================================================
// Pro 状态
// ============================================================
async function updateProStatus(uid) {
  try {
    const userData = await findUserRecord(uid);
    if (userData) {
      isUserPro = userData.status === 'pro';
      accountDrawer?.classList.toggle('is-pro', isUserPro);
      proBadge.textContent = isUserPro ? 'Pro' : '基础版';
      proBadge.className = 'account-status-badge ' + (isUserPro ? 'badge-pro' : 'badge-basic');
      accountHint.textContent = isUserPro ? 'Pro 已激活' : '基础版';

      renderProPanel(isUserPro, userData);
      updateDataManagementUI(isUserPro);
    } else {
      accountDrawer?.classList.remove('is-pro');
      proBadge.textContent = '基础版';
      proBadge.className = 'account-status-badge badge-basic';
      renderProPanel(false, null);
      updateDataManagementUI(false);
    }
  } catch (e) {
    console.warn('更新 Pro 状态失败:', e);
    accountDrawer?.classList.remove('is-pro');
    proBadge.textContent = '基础版';
    proBadge.className = 'account-status-badge badge-basic';
    renderProPanel(false, null);
    updateDataManagementUI(false);
  }
}

function renderProPanel(isPro, userData) {
  if (!proPanel) { console.warn('proPanel 元素不存在'); return; }
  proPanel.innerHTML = '';
  const rows = [
    ['项目与事件管理', '☑️', '☑️'],
    ['日期筛选与日历', '☑️', '☑️'],
    ['数据自动云同步', '☑️', '☑️'],
    ['自我觉察与趋势', '—', '☑️'],
    ['阶段汇总与复盘', '—', '☑️'],
    ['一键复制 AI 复盘材料', '—', '☑️'],
    ['导出本地 markdown', '—', '☑️']
  ];
  const table = `
    <div class="benefit-table ${isPro ? 'is-pro' : 'is-basic'}">
      <div class="benefit-head"><span>功能</span><span>基础版</span><span>Pro</span></div>
      ${rows.map(row => `
        <div class="benefit-row">
          <span>${row[0]}</span>
          <span>${row[1]}</span>
          <span>${row[2]}</span>
        </div>
      `).join('')}
    </div>`;

  if (isPro && userData) {
    const activatedAt = userData.activated_at ? formatDateTime(userData.activated_at) : '未知';
    const expireText = userData.pro_expire_at ? formatDateTime(userData.pro_expire_at) : '永久有效';
    proPanel.innerHTML = `
      ${table}
      <div class="pro-info">
        <p>激活：${activatedAt}</p>
        <p>有效期：<strong>${expireText}</strong></p>
        <button class="sync-action export-inline-action" type="button" id="exportMarkdownInlineBtn">
          <span class="action-label">导出本地 markdown</span>
          <span class="action-hint">保存一份本地复盘日志</span>
        </button>
      </div>
    `;
    setTimeout(() => document.getElementById('exportMarkdownInlineBtn')?.addEventListener('click', () => exportMarkdownBtn?.click()), 100);
  } else {
    proPanel.innerHTML = `
      ${table}
      <div class="pro-actions">
        <button class="pay-btn" id="payBtn">🌱 赞助项目，激活 Pro ✨</button>
        <div class="code-row">
          <input id="proCodeInput" type="text" placeholder="输入激活码" value="">
          <button id="activateProBtn">激活</button>
        </div>
      </div>
    `;
    setTimeout(() => {
      const payBtn = document.getElementById('payBtn');
      const activateBtn = document.getElementById('activateProBtn');
      if (payBtn) payBtn.addEventListener('click', () => copyWechatForSponsor(payBtn));
      if (activateBtn) {
        activateBtn.addEventListener('click', () => {
          const codeInput = document.getElementById('proCodeInput');
          const code = codeInput?.value || '';
          handleActivate(code);
        });
      }
    }, 100);
  }
}

function updateDataManagementUI(isPro) {
  if (!syncUploadBtn || !syncDownloadBtn || !exportMarkdownBtn) return;
  syncUploadBtn.disabled = false;
  syncDownloadBtn.disabled = false;
  exportMarkdownBtn.disabled = false;

  if (uploadHint) {
    uploadHint.textContent = '上传当前数据到云端备份';
  }
  if (downloadHint) {
    downloadHint.textContent = '下载前会再次确认覆盖风险';
  }
  if (exportHint) {
    exportHint.textContent = isPro ? '导出全部数据' : '🔒 仅 Pro 用户可用';
  }
  renderDayStateStrip();
}

async function loadPrice() {
  try {
    const res = await db.collection('pay_config').where({ key: 'pro_price' }).get();
    if (res.data && res.data.length > 0) {
      const price = res.data[0].amount || 9900;
      const priceEl = document.getElementById('payPrice');
      if (priceEl) priceEl.textContent = `¥${(price / 100).toFixed(2)}`;
    }
  } catch (e) { console.warn('读取价格失败:', e); }
}

// ============================================================
// Pro 激活
// ============================================================
async function handleActivate(code) {
  if (!currentUser) { setProMessage('请先登录', true); return; }
  if (!code || !code.trim()) { setProMessage('请输入激活码', true); return; }
  try {
    setProMessage('⏳ 激活中...');
    const result = await app.callFunction({
      name: 'activatePro',
      data: { uid: currentUser.uid, activationCode: code.trim() }
    });
    const res = result.result;
    if (res && res.code === 0) {
      setProMessage('✅ Pro 激活成功！');
      await updateProStatus(currentUser.uid);
      await refreshPhoneDisplay();
    } else {
      setProMessage('❌ ' + (res?.message || '激活失败'), true);
    }
  } catch (e) { setProMessage('❌ 调用失败：' + e.message, true); }
}

// ============================================================
// 支付（人工+激活码模式）
// ============================================================
async function handlePay() {
  if (!currentUser) {
    setProMessage('请先登录', true);
    return;
  }
  await copyWechatForSponsor();
}

// ============================================================
// 数据同步
// ============================================================
let lastUploadTime = localStorage.getItem('daylog_last_upload') || '';
let lastDownloadTime = localStorage.getItem('daylog_last_download') || '';

function updateSyncTimes() {
  uploadTime.textContent = lastUploadTime ? '上次上传：' + getDuration(lastUploadTime) : '';
  downloadTime.textContent = lastDownloadTime ? '上次下载：' + getDuration(lastDownloadTime) : '';
}

syncUploadBtn.addEventListener('click', async () => {
  if (!currentUser) { setSyncMessage('请先登录', true); return; }
  try {
    setSyncMessage('⏳ 上传中...');
    syncUploadBtn.disabled = true;
    const content = normalizeContent({ projects, tasks, dayStates });
    const savedAt = await saveToCloud(currentUser.uid, content);
    setLocalData({ content, saved_at: savedAt || new Date().toISOString() });
    lastUploadTime = new Date().toISOString();
    localStorage.setItem('daylog_last_upload', lastUploadTime);
    updateSyncTimes();
    setSyncMessage('✅ 上传成功');
  } catch (e) { setSyncMessage('❌ 上传失败：' + e.message, true); }
  finally { syncUploadBtn.disabled = false; }
});

syncDownloadBtn.addEventListener('click', async () => {
  if (!currentUser) { setSyncMessage('请先登录', true); return; }
  if (!confirm('下载云端数据将覆盖本地数据，确认？')) return;
  try {
    setSyncMessage('⏳ 下载中...');
    syncDownloadBtn.disabled = true;
    const cloudData = await loadFromCloud(currentUser.uid);
    if (!cloudData) { setSyncMessage('❌ 云端无数据', true); return; }
    const content = normalizeContent(cloudData.content);
    setLocalData({ content, saved_at: cloudData.saved_at });
    applyData(content);
    lastDownloadTime = new Date().toISOString();
    localStorage.setItem('daylog_last_download', lastDownloadTime);
    updateSyncTimes();
    setSyncMessage('✅ 下载成功');
  } catch (e) { setSyncMessage('❌ 下载失败：' + e.message, true); }
  finally { syncDownloadBtn.disabled = false; }
});

// ============================================================
// 导出 Markdown
// ============================================================
exportMarkdownBtn.addEventListener('click', async () => {
  if (!currentUser) { setSyncMessage('请先登录', true); return; }
  if (!requirePro('导出 Markdown 复盘日志')) return;
  try {
    setSyncMessage('⏳ 生成中...');
    const markdown = generateMarkdown();
    downloadFile(markdown, `DayLog-${getToday()}.md`, 'text/markdown');
    setSyncMessage('✅ 导出成功');
  } catch (e) { setSyncMessage('❌ 导出失败：' + e.message, true); }
});

function generateMarkdown() {
  const lines = [];
  lines.push('# DayLog 复盘日志\n');
  lines.push(`> 导出时间：${new Date().toLocaleString()}`);
  lines.push(`> 用户：${currentUser.email || currentUser.uid}\n`);
  const allDates = [...new Set([...tasks.map(t => t.date), ...dayStates.map(d => d.date)])].filter(Boolean).sort();
  if (allDates.length === 0) { lines.push('暂无记录。'); return lines.join('\n'); }
  const map = Object.fromEntries(projects.map(p => [p.id, p.name]));
  for (const date of allDates) {
    lines.push(`\n## ${date}\n`);
    const dayState = dayStates.find(d => d.date === date);
    if (dayState && (dayState.mood !== null || hasThoughts(dayState))) {
      lines.push(`### 自我觉察\n${getMoodLabel(dayState.mood)}\n`);
      for (const thought of dayState.thoughts || []) {
        lines.push(`- ${formatThoughtTime(thought.createdAt)} ${thought.text}`);
      }
      lines.push('');
    }
    const dayTasks = tasks.filter(t => t.date === date);
    if (dayTasks.length) {
      lines.push('### 事件记录\n');
      lines.push('| 时间 | 事件 | 项目 | 完成情况 | 投入时间 | 备注 |');
      lines.push('|------|------|------|----------|----------|------|');
      for (const t of dayTasks) {
        lines.push(`| ${escapeMarkdownCell(t.startTime || '')} | ${escapeMarkdownCell(t.text || '')} | ${escapeMarkdownCell(map[t.projectId] || '待整理')} | ${escapeMarkdownCell(t.rating || '')} | ${t.minutes ? t.minutes + 'm' : '-'} | ${escapeMarkdownCell(t.note || '')} |`);
      }
    }
  }
  return lines.join('\n');
}

function getThoughtsTextForCopy() {
  const visibleStates = getVisibleDayStates();
  const statesWithThoughts = visibleStates.filter(hasThoughts);
  if (!statesWithThoughts.length) return '';
  return getThoughtsTextForStates(statesWithThoughts);
}

function getThoughtsTextForStates(states) {
  return states
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .map(state => (state.thoughts || []).map(thought => formatThoughtForCopy(state, thought)).join('\n\n'))
    .filter(Boolean)
    .join('\n\n');
}

function formatThoughtForCopy(state, thought) {
  return [
    `日期：${state.date}`,
    `事件：${formatThoughtTime(thought.createdAt) || '-'}`,
    `想法：${thought.text}`
  ].join('\n');
}

async function copyText(text) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    prompt('复制以下内容：', text);
  }
}

function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================
// 昵称 & 手机号 inline 编辑
// ============================================================
nicknameDisplay.addEventListener('click', () => {
  const meta = getLocalMeta();
  const current = meta.nickname || '';
  startInlineEdit(nicknameDisplay, 'nickname', current);
});

phoneDisplay.addEventListener('click', async (event) => {
  const meta = getLocalMeta();
  const revealed = meta.phoneRevealed || false;
  if (event?.target?.closest('.edit-hint') || !userPhone) {
    startInlineEdit(phoneDisplay, 'phone', userPhone || '');
    return;
  }
  if (userPhone) {
    const newRevealed = !revealed;
    await saveUserMeta(currentUser.uid, { phoneRevealed: newRevealed });
    await refreshPhoneDisplay();
    return;
  }
});

function startInlineEdit(container, field, currentValue) {
  const isPhone = field === 'phone';
  let finished = false;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'inline-edit-input';
  input.value = currentValue;
  if (isPhone) input.placeholder = '输入 11 位手机号';
  else input.placeholder = '输入昵称';

  const actions = document.createElement('span');
  actions.className = 'inline-edit-actions';
  const saveBtn = document.createElement('button');
  saveBtn.textContent = '✓';
  saveBtn.className = 'save-btn';
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = '✕';
  cancelBtn.className = 'cancel-btn';
  actions.append(saveBtn, cancelBtn);
  container.replaceChildren(input, actions);
  input.focus();
  input.select();

  const finish = async (save) => {
    if (finished) return;
    if (save) {
      const val = input.value.trim();
      if (isPhone) {
        const cleaned = cleanPhone(val);
        if (val && !isValidPhone(cleaned)) {
          alert('请输入 11 位手机号');
          return;
        }
        finished = true;
        try {
          await updateUserPhone(cleaned);
        } catch {
          finished = false;
          return;
        }
      } else {
        finished = true;
        await saveUserMeta(currentUser?.uid, { nickname: val });
        const meta = getLocalMeta();
        renderAccountInfo(meta);
      }
    }
    finished = true;
    if (!isPhone) {
      const meta = getLocalMeta();
      renderAccountInfo(meta);
    } else {
      renderPhoneDisplay(userPhone);
    }
  };

  saveBtn.addEventListener('click', () => finish(true));
  cancelBtn.addEventListener('click', () => finish(false));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
  });
  input.addEventListener('blur', () => {
    setTimeout(() => finish(true), 300);
  });
}

// ============================================================
// 退出登录
// ============================================================
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    if (!confirm('确认退出登录？')) return;
    await auth.signOut();
    localStorage.removeItem('daylog_data');
    window.location.reload();
  });
}

// ============================================================
// 个人中心抽屉
// ============================================================
async function openAccountDrawer(message = '') {
  drawer.classList.add('open');
  drawerBackdrop.classList.remove('hidden');
  if (currentUser) {
    await updateProStatus(currentUser.uid);
    await refreshPhoneDisplay();
    updateSyncTimes();
  }
  if (message) setProMessage(message, false);
}

function requirePro(featureName = '该功能') {
  if (isUserPro) return true;
  copyWechatForSponsor();
  setProMessage(`${featureName}为 Pro 权益，微信号已复制。`, false);
  return false;
}

accountBtn.addEventListener('click', () => openAccountDrawer());
copyUidBtn?.addEventListener('click', async () => {
  const uid = displayUid?.textContent?.trim();
  if (!uid || uid === '-') return;
  await copyText(uid);
  const previous = copyUidBtn.textContent;
  copyUidBtn.textContent = '✓';
  window.setTimeout(() => { copyUidBtn.textContent = previous; }, 900);
});
privacyPolicyBtn?.addEventListener('click', openPrivacyPolicy);

drawerCloseBtn.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);

function closeDrawer() {
  drawer.classList.remove('open');
  drawerBackdrop.classList.add('hidden');
}

// ============================================================
// 业务操作
// ============================================================
addProjectBtn.addEventListener('click', createDefaultProject);
manageProjectsBtn?.addEventListener('click', openProjectList);
projectRail?.addEventListener('click', handleProjectRailClick);
projectRail?.addEventListener('dblclick', editProjectField);
projectRail?.addEventListener('contextmenu', editProjectField);

projectForm.addEventListener('submit', saveProjectFromDialog);
projectCancelBtn?.addEventListener('click', () => projectDialog.close());

taskBody?.addEventListener('click', handleTaskClick);
taskForm.addEventListener('submit', saveTaskFromDialog);
taskTable?.addEventListener('dblclick', editTaskFromRow);
taskHead?.addEventListener('click', handleTaskSortClick);
focusTimeBtn?.addEventListener('click', openTimePie);
timePieCloseBtn?.addEventListener('click', () => timePieDialog.close());

projectListBody?.addEventListener('click', handleProjectListClick);
projectListBody?.addEventListener('dblclick', editProjectField);
projectListBody?.addEventListener('contextmenu', editProjectField);
projectListAddBtn?.addEventListener('click', () => {
  mergePanelOpen = !mergePanelOpen;
  renderProjectListDialog();
});
mergeConfirmBtn?.addEventListener('click', mergeProjects);
mergeUndoBtn?.addEventListener('click', undoLastMerge);

calendarGrid?.addEventListener('click', e => {
  const card = e.target.closest('.day-card[data-date]');
  if (!card) return;
  rangeStart.value = card.dataset.date;
  rangeEnd.value = card.dataset.date;
  currentView = 'daily';
  renderAll();
});

function createDefaultProject() {
  if (projects.some(isDraftProject) && !confirm('还有未命名项目未处理，仍要继续添加吗？')) return;
  const project = { id: generateId(), name: '未命名', ddl: '', scheduleMode: 'empty', createdAt: new Date().toISOString() };
  projects.push(project);
  saveAndRenderLocal();
  requestAnimationFrame(() => startProjectNameEdit(project.id));
}

function handleProjectRailClick(event) {
  const card = event.target.closest('[data-project-filter-key]');
  if (!card || event.target.closest('input, select, textarea')) return;
  clearTimeout(projectClickTimer);
  projectClickTimer = window.setTimeout(() => {
    selectedProjectId = selectedProjectId === card.dataset.projectFilterKey ? '' : card.dataset.projectFilterKey;
    selectedRating = 'all';
    renderAll();
  }, 220);
}

function editProjectField(event) {
  if (currentView === 'calendar' && event.target.closest('#projectListDialog')) return;
  clearTimeout(projectClickTimer);
  const fieldEl = event.target.closest('[data-project-field]');
  const card = event.target.closest('[data-project-id]');
  if (!fieldEl || !card) return;
  if (card.dataset.projectId === UNASSIGNED_PROJECT_ID) return;
  event.preventDefault();
  const project = projects.find(p => p.id === card.dataset.projectId);
  if (!project) return;
  if (fieldEl.dataset.projectField === 'ddl') {
    startScheduleEdit(fieldEl, project);
  } else {
    startInlineEditElement(fieldEl, project.name, value => {
      project.name = value.trim() || '未命名';
      saveAndRenderLocal();
      if (projectListDialog?.open) renderProjectListDialog();
    });
  }
}

function startProjectNameEdit(projectId) {
  const card = projectRail.querySelector(`[data-project-id="${projectId}"]`);
  const fieldEl = card?.querySelector('[data-project-field="name"]');
  const project = projects.find(p => p.id === projectId);
  if (!fieldEl || !project) return;
  startInlineEditElement(fieldEl, project.name, value => {
    project.name = value.trim() || '未命名';
    saveAndRenderLocal();
  });
}

function startInlineEditElement(fieldEl, value, onSave) {
  if (fieldEl.querySelector('input')) return;
  const input = document.createElement('input');
  input.className = 'inline-input';
  input.value = value || '';
  fieldEl.replaceChildren(input);
  input.focus();
  input.select();
  let done = false;
  const finish = save => {
    if (done) return;
    done = true;
    if (save) onSave(input.value);
    else renderAll();
  };
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
  });
  input.addEventListener('blur', () => finish(true));
}

function startScheduleEdit(fieldEl, project) {
  if (fieldEl.querySelector('select')) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'schedule-editor';
  wrapper.innerHTML = `
    <select class="inline-select">
      <option value="plannedLater">还没想好</option>
      <option value="dated">指定日期</option>
    </select>
    <input type="date" class="inline-date" value="${escapeHtml(project.ddl || getToday())}">
  `;
  const mode = wrapper.querySelector('select');
  const date = wrapper.querySelector('input');
  mode.value = project.ddl ? 'dated' : 'plannedLater';
  date.hidden = mode.value !== 'dated';
  const save = () => {
    if (mode.value === 'dated') {
      project.ddl = date.value || getToday();
      project.scheduleMode = 'dated';
    } else {
      project.ddl = '';
      project.scheduleMode = 'plannedLater';
    }
    saveAndRenderLocal();
    if (projectListDialog?.open) renderProjectListDialog();
  };
  mode.addEventListener('change', () => {
    date.hidden = mode.value !== 'dated';
    if (mode.value !== 'dated') save();
  });
  date.addEventListener('change', save);
  wrapper.addEventListener('keydown', e => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') renderAll();
  });
  wrapper.addEventListener('focusout', () => setTimeout(() => {
    if (!wrapper.contains(document.activeElement)) save();
  }));
  fieldEl.replaceChildren(wrapper);
  mode.focus();
}

function saveProjectFromDialog(e) {
  e.preventDefault();
  const name = projectName.value.trim() || '未命名';
  const project = editingProjectId ? projects.find(p => p.id === editingProjectId) : null;
  if (project) {
    project.name = name;
    project.ddl = projectDdl.value || '';
    project.scheduleMode = project.ddl ? 'dated' : project.scheduleMode || 'empty';
  } else {
    projects.push({ id: generateId(), name, ddl: projectDdl.value || '', scheduleMode: projectDdl.value ? 'dated' : 'empty', createdAt: new Date().toISOString() });
  }
  editingProjectId = '';
  projectDialog.close();
  saveAndRenderLocal();
}

function openTaskDialog(task = null) {
  editingTaskId = task?.id || '';
  taskText.value = task?.text || '';
  taskStartTime.value = task?.startTime || getCurrentTimeBucket();
  taskDate.value = task?.date || getDefaultRecordDate();
  taskMinutes.value = task?.minutes || '';
  taskNote.value = task?.note || '';
  const selectableProjects = projects.slice().sort(compareProjects).filter(project => !isDraftProject(project));
  taskProject.innerHTML = `<option value="">待整理</option>` + selectableProjects.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
  taskProject.value = task?.projectId || (selectedProjectId === UNASSIGNED_PROJECT_ID ? '' : selectedProjectId) || '';
  taskRating.forEach(input => input.checked = input.value === (task?.rating || 'full'));
  taskDialog.showModal();
  taskText.focus();
}

function getDefaultRecordDate() {
  return isSingleDateRange() ? getActiveDate() : getToday();
}

function getCurrentTimeBucket() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

function saveTaskFromDialog(e) {
  e.preventDefault();
  const editing = tasks.find(t => t.id === editingTaskId);
  const task = editing || { id: generateId(), createdAt: new Date().toISOString(), order: 9999 };
  task.text = taskText.value.trim() || '未命名';
  task.projectId = taskProject.value || '';
  task.date = taskDate.value || getToday();
  task.startTime = taskStartTime.value || 'morning';
  task.minutes = Math.max(0, parseInt(taskMinutes.value || '0', 10) || 0);
  task.rating = [...taskRating].find(input => input.checked)?.value || 'full';
  task.note = taskNote.value.trim();
  if (!editing) tasks.unshift(task);
  editingTaskId = '';
  taskDialog.close();
  saveAndRenderLocal();
}

function handleTaskClick(event) {
  if (event.target.closest('[data-add-task]')) {
    openTaskDialog();
    return;
  }
  const deleteBtn = event.target.closest('[data-action="delete-task"]');
  if (deleteBtn) {
    if (!confirm('删除后这条事件会从复盘记录中移除。确认删除吗？')) return;
    tasks = tasks.filter(t => t.id !== deleteBtn.dataset.id);
    saveAndRenderLocal();
  }
}

function handleTaskSortClick(event) {
  const button = event.target.closest('[data-sort-key]');
  if (!button) return;
  const key = button.dataset.sortKey;
  taskSort = taskSort.key === key
    ? { key, direction: taskSort.direction === 'asc' ? 'desc' : 'asc' }
    : { key, direction: 'asc' };
  renderTasks();
}

function editTaskFromRow(event) {
  const row = event.target.closest('[data-task-id]');
  if (!row) return;
  const task = tasks.find(t => t.id === row.dataset.taskId);
  const cell = event.target.closest('[data-task-field]');
  if (!task || !cell) return;
  event.preventDefault();
  editTaskField(cell, task, cell.dataset.taskField);
}

function editTaskField(cell, task, field) {
  if (cell.querySelector('input, select, textarea')) return;
  if (field === 'text' || field === 'note') {
    openTaskFieldDialog(task, field);
    return;
  }
  const editor = document.createElement('span');
  editor.className = 'inline-task-editor';
  if (field === 'startTime') {
    editor.innerHTML = `<select class="inline-select"><option value="morning">上午</option><option value="afternoon">下午</option><option value="evening">晚上</option></select>`;
    editor.querySelector('select').value = task.startTime || 'morning';
  } else if (field === 'projectId') {
    const selectableProjects = projects.slice().sort(compareProjects).filter(project => !isDraftProject(project));
    editor.innerHTML = `<select class="inline-select"><option value="">待整理</option>${selectableProjects.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}</select>`;
    editor.querySelector('select').value = task.projectId || '';
  } else if (field === 'rating') {
    editor.innerHTML = `<select class="inline-select">${Object.entries(getRatingMap()).map(([value, item]) => `<option value="${value}">${item.emoji} ${item.label}</option>`).join('')}</select>`;
    editor.querySelector('select').value = task.rating || 'full';
  } else if (field === 'date') {
    editor.innerHTML = `<input class="inline-date" type="date" value="${escapeHtml(task.date || getToday())}">`;
  } else if (field === 'minutes') {
    editor.innerHTML = `<input class="inline-input" type="number" min="0" value="${Number(task.minutes) || 0}">`;
  }
  const control = editor.querySelector('input, select');
  const original = cell.innerHTML;
  cell.replaceChildren(editor);
  control.focus();
  const save = () => {
    if (field === 'minutes') task.minutes = Math.max(0, parseInt(control.value || '0', 10) || 0);
    else task[field] = control.value;
    saveAndRenderLocal();
  };
  control.addEventListener('change', save);
  control.addEventListener('keydown', e => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') {
      cell.innerHTML = original;
    }
  });
  control.addEventListener('blur', () => setTimeout(save, 120));
}

function openTaskFieldDialog(task, field) {
  const dialog = document.createElement('dialog');
  dialog.className = 'task-field-dialog';
  dialog.innerHTML = `
    <form class="dialog-body">
      <h2>${field === 'text' ? '事件' : '备注'}</h2>
      <textarea class="task-field-textarea" rows="8">${escapeHtml(task[field] || '')}</textarea>
      <div class="dialog-actions">
        <button type="submit" class="primary">保存</button>
      </div>
    </form>`;
  document.body.appendChild(dialog);
  prepareDialog(dialog);
  const form = dialog.querySelector('form');
  const textarea = dialog.querySelector('textarea');
  form.addEventListener('submit', e => {
    e.preventDefault();
    task[field] = textarea.value.trim();
    dialog.close();
    saveAndRenderLocal();
  });
  dialog.addEventListener('close', () => dialog.remove());
  dialog.showModal();
  textarea.focus();
}

function openProjectList() {
  renderProjectListDialog();
  projectListDialog.showModal();
}

function renderProjectListDialog() {
  if (!projectListBody) return;
  const groups = getProjectListGroups();
  projectListBody.innerHTML = projects.length ? groups.map(projectListGroup).join('') : '<div class="empty">还没有项目。</div>';
  renderMergePanel();
  projectListDialog?.classList.toggle('readonly-project-list', currentView === 'calendar');
}

function getProjectListGroups() {
  const today = getToday();
  return [
    { key: 'draft', title: '新建', hint: '24 小时内待处理项目', projects: projects.filter(p => isDraftProject(p) || isFreshProject(p)).sort(compareProjects) },
    { key: 'active', title: '进行中', hint: '有 DDL 的项目', projects: projects.filter(p => hasProjectDdl(p) && p.ddl >= today).sort(compareProjects) },
    { key: 'unplanned', title: '待计划', hint: '未设置 DDL / 还没想好', projects: projects.filter(isPlannedLater).sort(compareProjects) },
    { key: 'completed', title: '已完成', hint: 'DDL 已经过了', projects: projects.filter(p => hasProjectDdl(p) && p.ddl < today).sort(compareProjects) }
  ].filter(group => group.projects.length || group.key !== 'draft');
}

function projectListGroup(group) {
  const collapsed = Boolean(projectListCollapsed[group.key]);
  return `<section class="project-list-group">
    <button class="project-list-heading" type="button" data-project-group-toggle="${group.key}" aria-expanded="${!collapsed}">
      <span class="heading-main"><span>${collapsed ? '▶' : '▼'}</span><strong>${group.title}</strong></span>
      <span>${group.projects.length} 个 · ${group.hint}</span>
    </button>
    ${collapsed ? '' : (group.projects.length ? group.projects.map(projectListItem).join('') : '<div class="empty">暂无项目</div>')}
  </section>`;
}

function projectListItem(project) {
  const ddl = hasProjectDdl(project) ? friendlyDate(project.ddl) : (isDraftProject(project) ? '设置日期' : '待计划');
  return `<div class="project-list-item" data-project-id="${escapeHtml(project.id)}">
    <div class="project-name" data-project-field="name" data-tooltip="${escapeHtml(project.name)}">${escapeHtml(project.name)}</div>
    <div class="project-ddl" data-project-field="ddl">${escapeHtml(ddl)}</div>
    <div class="project-card-actions" ${currentView === 'calendar' ? 'hidden' : ''}>
      <button class="icon-button" type="button" data-project-action="delete">×</button>
    </div>
  </div>`;
}

function handleProjectListClick(event) {
  if (currentView === 'calendar') {
    const heading = event.target.closest('[data-project-group-toggle]');
    if (heading) {
      projectListCollapsed[heading.dataset.projectGroupToggle] = !projectListCollapsed[heading.dataset.projectGroupToggle];
      renderProjectListDialog();
    }
    return;
  }
  const heading = event.target.closest('[data-project-group-toggle]');
  if (heading) {
    projectListCollapsed[heading.dataset.projectGroupToggle] = !projectListCollapsed[heading.dataset.projectGroupToggle];
    renderProjectListDialog();
    return;
  }
  const button = event.target.closest('[data-project-action="delete"]');
  const row = event.target.closest('[data-project-id]');
  if (!button || !row) return;
  const project = projects.find(p => p.id === row.dataset.projectId);
  if (!project) return;
  if (tasks.some(t => t.projectId === project.id) && !confirm(`项目“${project.name}”下有事件记录。删除项目后，这些记录会归入“待整理”。确认删除吗？`)) return;
  tasks.forEach(t => { if (t.projectId === project.id) t.projectId = ''; });
  projects = projects.filter(p => p.id !== project.id);
  if (selectedProjectId === project.id) selectedProjectId = '';
  saveAndRenderLocal();
  renderProjectListDialog();
}

function renderMergePanel() {
  if (!projectMergePanel) return;
  projectMergePanel.hidden = currentView === 'calendar' || !mergePanelOpen;
  if (projectListAddBtn) projectListAddBtn.hidden = currentView === 'calendar';
  if (currentView === 'calendar') return;
  projectListAddBtn.textContent = mergePanelOpen ? '收起合并' : '合并项目';
  const options = projects.slice().sort(compareProjects).map(project => `<option value="${project.id}">${escapeHtml(project.name)}</option>`).join('');
  mergeSourceProjects.innerHTML = options;
  mergeTargetProject.innerHTML = `<option value="">选择目标项目</option>${options}`;
  mergeUndoBtn.disabled = !lastMergeSnapshot;
}

function mergeProjects() {
  const targetId = mergeTargetProject.value;
  const sourceIds = [...mergeSourceProjects.selectedOptions].map(option => option.value).filter(id => id && id !== targetId);
  const target = projects.find(p => p.id === targetId);
  if (!target || !sourceIds.length) {
    alert('请选择要合并的项目和目标项目。');
    return;
  }
  lastMergeSnapshot = {
    projects: projects.filter(p => sourceIds.includes(p.id)).map(p => ({ ...p })),
    taskProjects: tasks.filter(t => sourceIds.includes(t.projectId)).map(t => ({ id: t.id, projectId: t.projectId }))
  };
  tasks.forEach(t => { if (sourceIds.includes(t.projectId)) t.projectId = targetId; });
  projects = projects.filter(p => !sourceIds.includes(p.id));
  saveAndRenderLocal();
  renderProjectListDialog();
}

function undoLastMerge() {
  if (!lastMergeSnapshot) return;
  lastMergeSnapshot.projects.forEach(project => {
    if (!projects.some(p => p.id === project.id)) projects.push(project);
  });
  lastMergeSnapshot.taskProjects.forEach(item => {
    const task = tasks.find(t => t.id === item.id);
    if (task) task.projectId = item.projectId;
  });
  lastMergeSnapshot = null;
  saveAndRenderLocal();
  renderProjectListDialog();
}

function openTimePie() {
  const baseTasks = getBaseTasksForRange();
  const total = sumMinutes(baseTasks);
  pieTotal.textContent = formatDuration(total);
  if (!total) {
    pieChart.style.background = 'conic-gradient(rgba(227,200,155,.45) 0 100%)';
    pieLegend.innerHTML = '<div class="empty compact">当前范围还没有投入时间。</div>';
  } else {
    const grouped = projects.map(project => {
      const minutes = sumMinutes(baseTasks.filter(t => t.projectId === project.id));
      return { name: project.name, minutes };
    }).filter(item => item.minutes > 0);
    const unassigned = sumMinutes(baseTasks.filter(t => !t.projectId));
    if (unassigned) grouped.push({ name: '待整理', minutes: unassigned });
    const colors = ['#5b9a89', '#d08a63', '#c7a95e', '#86a98b', '#b77b51', '#9a8c7a'];
    let start = 0;
    const segments = grouped.map((item, index) => {
      const end = start + (item.minutes / total) * 100;
      const segment = `${colors[index % colors.length]} ${start}% ${end}%`;
      start = end;
      return segment;
    });
    pieChart.style.background = `conic-gradient(${segments.join(',')})`;
    pieLegend.innerHTML = grouped.map((item, index) => `<div><span class="legend-dot" style="background:${colors[index % colors.length]}"></span><strong>${escapeHtml(item.name)}</strong><span>${formatDuration(item.minutes)}</span></div>`).join('');
  }
  timePieDialog.showModal();
}
document.querySelectorAll('.metric-button').forEach(btn => {
  btn.addEventListener('click', () => {
    selectedRating = btn.dataset.rating || 'all';
    renderAll();
  });
});

function renderMoodPicker(selectedMood) {
  if (!moodPicker) return;
  const selected = normalizeMoodValue(selectedMood);
  moodPicker.innerHTML = '<legend>今日感受</legend>' + MOOD_OPTIONS.map(option => `
    <label style="--mood-option-color:${option.color};--mood-option-bg:${option.bg};">
      <input type="radio" name="dayMood" value="${option.value}" ${option.value === selected ? 'checked' : ''}>
      <span class="mood-emoji">${option.emoji}</span>
      <span>${option.label}</span>
    </label>
  `).join('');
}

function renderThoughtListForDialog(state, options = {}) {
  if (!thoughtList) return;
  const readonly = Boolean(options.readonly);
  const thoughts = state.thoughts || [];
  thoughtList.innerHTML = thoughts.length
    ? thoughts.map(thought => `
      <div class="thought-item editable-thought" data-thought-id="${escapeHtml(thought.id)}">
        <time>${escapeHtml(formatThoughtTime(thought.createdAt))}</time>
        <span class="thought-text-field" data-tooltip="${escapeHtml(thought.text)}">${escapeHtml(thought.text)}</span>
        ${readonly ? '' : `<span class="thought-actions">
          <button class="thought-action" type="button" data-action="delete-thought" data-id="${escapeHtml(thought.id)}" aria-label="删除想法">×</button>
        </span>`}
      </div>
    `).join('')
    : '<div class="empty compact">今天还没有留下想法。</div>';
}

function setDayStateDialogPreviewMode(preview) {
  const saveButton = dayStateForm?.querySelector('.dialog-actions .primary[type="submit"]');
  let sponsorButton = dayStateForm?.querySelector('[data-pro-sponsor]');
  if (preview && !sponsorButton) {
    sponsorButton = document.createElement('button');
    sponsorButton.type = 'button';
    sponsorButton.className = 'primary sponsor-action';
    sponsorButton.dataset.proSponsor = 'true';
    sponsorButton.textContent = '🌱 赞助项目，激活 Pro ✨';
    dayStateForm?.querySelector('.dialog-actions')?.append(sponsorButton);
  }
  dayStateForm?.classList.toggle('preview-mode', preview);
  if (saveButton) saveButton.hidden = preview;
  if (sponsorButton) sponsorButton.hidden = !preview;
  thoughtText.disabled = preview;
  moodPicker.querySelectorAll('input').forEach(input => { input.disabled = preview; });
}

function openDayStateDialogFor(date) {
  if (!requirePro('记录自我觉察')) return;
  editingDayStateDate = date || getActiveDate();
  const state = getDayState(editingDayStateDate);
  dayStateTitle.textContent = `记录自我觉察 · ${editingDayStateDate}`;
  renderMoodPicker(state.mood);
  thoughtText.value = '';
  thoughtText.placeholder = '写点今天想留下的话，可以用 emoji';
  renderThoughtListForDialog(state);
  setDayStateDialogPreviewMode(false);
  dayStateDialog.showModal();
  thoughtText.focus();
}

function openDayStatePreviewDialog() {
  editingDayStateDate = getActiveDate();
  const previewState = {
    date: editingDayStateDate,
    mood: PREVIEW_DAY_STATE.mood,
    thoughts: [
      { id: 'preview-thought-main', text: PREVIEW_DAY_STATE.thought, createdAt: new Date(`${editingDayStateDate}T09:12:00`).toISOString() },
      { id: 'preview-thought-extra', text: '傍晚整理了素材库，把零散截图归到三个主题里。明天可以直接从“城市散步”这一组开始写。', createdAt: new Date(`${editingDayStateDate}T18:40:00`).toISOString() }
    ]
  };
  dayStateTitle.textContent = `记录自我觉察（示例） · ${editingDayStateDate}`;
  renderMoodPicker(previewState.mood);
  thoughtText.value = '';
  thoughtText.placeholder = '激活 Pro 后，可在这里记录当天的新想法。';
  renderThoughtListForDialog(previewState, { readonly: true });
  setDayStateDialogPreviewMode(true);
  dayStateDialog.showModal();
}

function upsertDayState(nextState) {
  const index = dayStates.findIndex(state => state.date === nextState.date);
  if (index >= 0) dayStates[index] = nextState;
  else dayStates.push(nextState);
}

dayStateForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!requirePro('记录自我觉察')) return;
  const date = editingDayStateDate || getActiveDate();
  const existing = getDayState(date);
  const selectedMood = dayStateForm.querySelector('input[name="dayMood"]:checked');
  const thought = thoughtText.value.trim();
  const thoughts = [...(existing.thoughts || [])];
  if (thought) {
    thoughts.unshift({ id: generateId(), text: thought, createdAt: new Date().toISOString() });
  }
  upsertDayState({
    ...existing,
    date,
    mood: selectedMood ? normalizeMoodValue(selectedMood.value) : existing.mood,
    thoughts,
    updated_at: new Date().toISOString()
  });
  thoughtText.value = '';
  dayStateDialog.close();
  saveAndRenderLocal();
});

dayStateForm?.addEventListener('click', async (e) => {
  const sponsor = e.target.closest('[data-pro-sponsor]');
  if (!sponsor) return;
  await copyWechatForSponsor(sponsor);
});

thoughtList?.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="delete-thought"]');
  const date = editingDayStateDate || getActiveDate();
  const existing = getDayState(date);
  if (btn) {
    e.stopPropagation();
    upsertDayState({
      ...existing,
      thoughts: (existing.thoughts || []).filter(thought => thought.id !== btn.dataset.id),
      updated_at: new Date().toISOString()
    });
    saveAndRenderLocal();
    renderThoughtListForDialog(getDayState(date));
    return;
  }
  const row = e.target.closest('[data-thought-id]');
  if (!row || row.classList.contains('editing')) return;
  const thought = (existing.thoughts || []).find(item => item.id === row.dataset.thoughtId);
  if (!thought) return;
  startThoughtInlineEdit(row, existing, thought);
});

function startThoughtInlineEdit(row, state, thought) {
  row.classList.add('editing');
  row.innerHTML = `
    <time>${escapeHtml(formatThoughtTime(thought.createdAt))}</time>
    <div class="thought-inline-editor">
      <textarea class="thought-edit-input">${escapeHtml(thought.text)}</textarea>
      <div class="thought-edit-actions">
        <button class="thought-action-save" type="button" data-action="save-thought">保存</button>
        <button class="thought-action-cancel" type="button" data-action="cancel-thought">取消</button>
      </div>
    </div>
  `;
  const textarea = row.querySelector('textarea');
  const save = () => {
    const next = textarea.value.trim();
    if (next) thought.text = next;
    state.updated_at = new Date().toISOString();
    upsertDayState(state);
    saveAndRenderLocal();
    renderThoughtListForDialog(getDayState(state.date));
  };
  row.querySelector('[data-action="save-thought"]')?.addEventListener('click', save);
  row.querySelector('[data-action="cancel-thought"]')?.addEventListener('click', () => renderThoughtListForDialog(getDayState(state.date)));
  textarea.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') save();
    if (event.key === 'Escape') renderThoughtListForDialog(getDayState(state.date));
  });
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

dayStateCancelBtn?.addEventListener('click', () => dayStateDialog.close());
noteDetailCloseBtn?.addEventListener('click', () => noteDetailDialog.close());

async function copyVisibleThoughts() {
  if (!requirePro('一键复制想法')) return;
  const text = getThoughtsTextForCopy();
  if (!text) {
    setSyncMessage('当前区间没有可复制的想法', true);
    return;
  }
  try {
    await copyText(text);
    setSyncMessage('✅ 已复制当前区间想法');
  } catch {
    setSyncMessage('复制失败，请重试', true);
  }
}

function openThoughtDetail() {
  const preview = !isUserPro;
  const states = (preview ? getPreviewDayStatesForRange() : getVisibleDayStates()).filter(hasThoughts);
  const single = currentView !== 'calendar' && isSingleDateRange();
  noteDetailTitle.textContent = preview ? '想法记录（示例）' : '想法记录';
  noteDetailBody.innerHTML = states.length
    ? states.map(state => `
      <details class="thought-day" open>
        <summary>
          <span>${escapeHtml(friendlyDate(state.date) || state.date)}</span>
          <span>${state.thoughts.length} 条</span>
          ${single || preview ? '' : `<button class="thought-action day-copy" type="button" data-thought-action="copy-day" data-date="${escapeHtml(state.date)}" aria-label="复制当天想法">⧉</button>`}
        </summary>
        <div class="thought-list">
          ${state.thoughts.map(thought => `
            <div class="thought-item" data-date="${escapeHtml(state.date)}" data-thought-id="${escapeHtml(thought.id)}">
              <time>${escapeHtml(formatThoughtTime(thought.createdAt))}</time>
              <span class="thought-text-field" data-tooltip="${escapeHtml(thought.text)}">${escapeHtml(thought.text)}</span>
              ${preview ? '' : `<span class="thought-actions">
                <button class="thought-action" type="button" data-thought-action="copy" aria-label="复制想法">⧉</button>
              </span>`}
            </div>
          `).join('')}
        </div>
      </details>
    `).join('') + (preview ? '<div class="preview-activate-hint">示例内容仅用于预览。激活 Pro 后，这里会呈现你的真实想法记录。</div><div class="review-actions"><button class="primary sponsor-action" type="button" data-pro-sponsor="true">🌱 赞助项目，激活 Pro ✨</button></div>' : '')
    : '<div class="empty compact">当前范围还没有想法记录。</div>';
  noteDetailDialog.showModal();
}

noteDetailBody?.addEventListener('click', async (event) => {
  const sponsor = event.target.closest('[data-pro-sponsor]');
  if (sponsor) {
    await copyWechatForSponsor(sponsor);
    return;
  }
  const reviewAction = event.target.closest('[data-review-action]');
  if (reviewAction) {
    if (!isUserPro) {
      await copyWechatForSponsor(reviewAction);
      return;
    }
    const data = getStageReviewData(false);
    if (reviewAction.dataset.reviewAction === 'copy-thoughts') {
      const text = getThoughtsTextForCopy();
      if (!text) {
        setSyncMessage('当前范围没有可复制的想法', true);
        return;
      }
      await copyText(text);
      reviewAction.textContent = '已复制';
      window.setTimeout(() => { reviewAction.textContent = '一键复制想法'; }, 1400);
      setSyncMessage('✅ 已复制想法');
      return;
    }
    if (reviewAction.dataset.reviewAction === 'copy-all') {
      await copyText(getStageReviewCopyText(data));
      reviewAction.textContent = '已复制';
      window.setTimeout(() => { reviewAction.textContent = '一键复制全部'; }, 1400);
      setSyncMessage('✅ 已复制阶段复盘材料');
      return;
    }
  }
  const action = event.target.closest('[data-thought-action]');
  if (!action) return;
  const row = event.target.closest('[data-thought-id]');
  const date = action.dataset.date || row?.dataset.date;
  const state = dayStates.find(item => item.date === date);
  if (!state) return;
  if (action.dataset.thoughtAction === 'copy-day') {
    event.preventDefault();
    event.stopPropagation();
    await copyText(getThoughtsTextForStates([state]));
    setSyncMessage('✅ 已复制当天想法');
    return;
  }
  const thought = state.thoughts.find(item => item.id === row?.dataset.thoughtId);
  if (!thought) return;
  if (action.dataset.thoughtAction === 'copy') {
    await copyText(formatThoughtForCopy(state, thought));
    setSyncMessage('✅ 已复制想法');
  }
});

function openMoodTrendDetail() {
  const preview = !isUserPro;
  const states = (preview ? getPreviewDayStatesForRange() : getVisibleDayStates()).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  noteDetailTitle.textContent = preview ? '整体趋势（示例）' : '整体趋势';
  noteDetailBody.innerHTML = states.some(state => state.mood !== null)
    ? `<div class="mood-chart-scroll ${preview ? 'preview-mode' : ''}">${renderMoodCurve(states, { detailed: true, relative: preview })}</div>${preview ? '<div class="preview-activate-hint">示例内容仅用于预览。激活 Pro 后，这里会呈现你的真实状态曲线。</div><div class="review-actions"><button class="primary sponsor-action" type="button" data-pro-sponsor="true">🌱 赞助项目，激活 Pro ✨</button></div>' : ''}`
    : '<div class="empty compact">当前范围还没有感受记录。</div>';
  noteDetailDialog.showModal();
}

openDayStateBtn?.addEventListener('click', () => {
  if (currentView !== 'calendar' && isSingleDateRange()) {
    if (isUserPro) openDayStateDialogFor(getActiveDate());
    else openDayStatePreviewDialog();
  }
});
moodSummary?.addEventListener('click', () => {
  if (currentView === 'calendar' || !isSingleDateRange()) openMoodTrendDetail();
});
thoughtSummary?.addEventListener('click', () => {
  openThoughtDetail();
});
openStageReviewBtn?.addEventListener('click', openStageReviewDetail);

showAllBtn.addEventListener('click', () => {
  currentView = currentView === 'calendar' ? 'daily' : 'calendar';
  if (currentView === 'calendar') {
    const today = parseLocalDate(getToday());
    calendarFilterYear = String(today.getFullYear());
    calendarFilterMonth = String(today.getMonth() + 1);
  }
  renderAll();
});
todayRangeBtn?.addEventListener('click', () => {
  const today = getToday();
  rangeStart.value = today;
  rangeEnd.value = '';
  currentView = 'daily';
  renderAll();
});
weekRangeBtn?.addEventListener('click', () => {
  const range = getWeekRange();
  rangeStart.value = range.start;
  rangeEnd.value = range.end;
  currentView = 'daily';
  renderAll();
});
allTimeBtn.addEventListener('click', () => { rangeStart.value = ''; rangeEnd.value = ''; currentView = 'daily'; renderAll(); });
rangeStart?.addEventListener('change', () => { currentView = 'daily'; renderAll(); });
rangeEnd?.addEventListener('change', () => {
  if (rangeStart.value && rangeEnd.value && rangeEnd.value < rangeStart.value) {
    const next = rangeEnd.value;
    rangeEnd.value = rangeStart.value;
    rangeStart.value = next;
  }
  currentView = 'daily';
  renderAll();
});
calendarAllBtn?.addEventListener('click', () => { calendarFilterYear = ''; calendarFilterMonth = ''; renderAll(); });
calendarYearSelect?.addEventListener('change', () => { calendarFilterYear = calendarYearSelect.value || ''; calendarFilterMonth = ''; renderAll(); });
calendarMonthSelect?.addEventListener('change', () => { calendarFilterMonth = calendarMonthSelect.value || ''; renderAll(); });
resetSortBtn.addEventListener('click', () => { taskSort = { key: 'default', direction: 'asc' }; renderTasks(); });

// ============================================================
// 联系开发者
// ============================================================
copyWechatBtn.addEventListener('click', () => {
  copyWechatForSponsor(copyWechatBtn);
});

// ============================================================
// 启动
// ============================================================
(async function init() {
  if (rangeStart && !rangeStart.value) rangeStart.value = getToday();
  [projectDialog, taskDialog, dayStateDialog, noteDetailDialog, projectListDialog, timePieDialog, privacyDialog].forEach(prepareDialog);
  setupDelayedTooltips();
  loadGreetingMessage();
  const user = auth.currentUser;
  if (user) {
    currentUser = user;
    await onLoginSuccess();
    updateSyncTimes();
  } else {
    authGate.style.display = 'grid';
    mainApp.style.display = 'none';
    setAuthMessage('首次使用将自动注册账号');
  }
})();

console.log('🚀 DayLog 已启动');
