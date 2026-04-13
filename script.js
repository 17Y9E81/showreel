const DATA_URL = 'data.json';
const KEYS = ["workExperience", "projectExperience", "techStack", "competitionExperience"];
const DEFAULTS = {
  workExperience: [],
  projectExperience: [],
  techStack: { title: '技术栈', content: '' },
  competitionExperience: { title: '竞赛经历', content: '' },
};

function getElement(id) {
  return document.getElementById(id);
}

async function loadData() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error('无法加载 data.json');
    }
    return await response.json();
  } catch (error) {
    console.warn('加载 data.json 失败，使用默认数据', error);
    return DEFAULTS;
  }
}

function formatSummary(value) {
  if (Array.isArray(value)) {
    const firstItem = value[0];
    if (!firstItem) return "点击查看详细内容";
    return firstItem.title || (typeof firstItem.content === 'string' ? firstItem.content.split("\n")[0] : "点击查看详细内容");
  }
  if (typeof value === 'object' && value !== null) {
    return value.title || (typeof value.content === 'string' ? value.content.split("\n")[0] : "点击查看详细内容");
  }
  if (typeof value === 'string') {
    const lines = value.trim().split("\n").filter(Boolean);
    if (!lines.length) {
      return "点击查看详细内容";
    }
    return lines[0].length > 45 ? `${lines[0].slice(0, 45)}...` : lines[0];
  }
  return "点击查看详细内容";
}

function splitEntries(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'object' && value !== null && typeof value.content === 'string') {
    return [value];
  }
  if (typeof value === 'string') {
    return value
      .split(/\n\s*\n/)
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => ({ title: chunk.split('\n')[0] || '', content: chunk }));
  }
  return [];
}

function renderItemList(value, containerId, sectionKey, defaultLabel) {
  const container = getElement(containerId);
  container.innerHTML = '';
  const items = splitEntries(value);
  if (!items.length) {
    container.innerHTML = `<p class="detail-link">暂无${defaultLabel}条目。</p>`;
    return;
  }
  items.forEach((item, index) => {
    const title = item.title || `${defaultLabel} ${index + 1}`;
    const duration = item.duration ? `<p class="item-duration">${item.duration}</p>` : '';
    const content = typeof item.content === 'string' ? item.content : '';
    const summary = content.replace(/\n/g, ' ').slice(0, 90) + (content.length > 90 ? '...' : '');
    const entry = document.createElement('div');
    entry.className = 'project-item';
    entry.innerHTML = `
      <h3>${title}</h3>
      ${duration}
      <p>${summary}</p>
      <p class="detail-link"><a class="detail-anchor" href="detail.html?section=${sectionKey}&item=${index + 1}">查看完整详情</a></p>
    `;
    container.appendChild(entry);
  });
}

function updateSection(key, value) {
  const summaryElement = getElement(`summary-${key}`);
  const detailContent = getElement(`content-${key}`);
  summaryElement.textContent = formatSummary(value);
  if (detailContent) {
    detailContent.textContent = typeof value === 'string' ? value : '';
  }
  if (key === 'projectExperience') {
    renderItemList(value, 'projectItems', key, '项目');
  }
  if (key === 'workExperience') {
    renderItemList(value, 'workItems', key, '工作经历');
  }
  if (key === 'competitionExperience') {
    renderItemList(value, 'competitionItems', key, '竞赛');
  }
}

function populateForm(data) {
  KEYS.forEach((key) => {
    updateSection(key, data[key]);
  });
}

function toggleDetail(key) {
  const detail = getElement(`detail-${key}`);
  const button = document.querySelector(`button.toggle-detail[data-key="${key}"]`);
  detail.classList.toggle("hidden");
  button.textContent = detail.classList.contains("hidden") ? "查看详情" : "收起详情";
}

async function init() {
  const data = await loadData();
  populateForm(data);
  document.querySelectorAll(".toggle-detail").forEach((button) => {
    button.addEventListener("click", () => toggleDetail(button.dataset.key));
  });
}

init();
