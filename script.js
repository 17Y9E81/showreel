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
    const data = await response.json();
    if (Array.isArray(data.projectExperience)) {
      data.projectExperience = sortByDurationDesc(data.projectExperience);
    }
    return data;
  } catch (error) {
    console.warn('加载 data.json 失败，使用默认数据', error);
    return DEFAULTS;
  }
}

function parseDuration(duration) {
  if (typeof duration !== 'string') return null;
  const range = duration.split(/[-–—]/).map((part) => part.trim());
  const endPart = range[range.length - 1];
  if (/至今|now|present|ongoing/i.test(endPart)) {
    return '9999-12';
  }
  const match = /^(\d{4})(?:[.\-](\d{1,2}))?/.exec(endPart);
  if (!match) return null;
  const year = match[1];
  const month = match[2] ? match[2].padStart(2, '0') : '12';
  return `${year}-${month}`;
}

function sortByDurationDesc(entries) {
  return [...entries].sort((a, b) => {
    const aEnd = parseDuration(a.duration);
    const bEnd = parseDuration(b.duration);
    if (aEnd && bEnd && aEnd !== bEnd) {
      return bEnd.localeCompare(aEnd);
    }
    if (aEnd && !bEnd) return -1;
    if (!aEnd && bEnd) return 1;
    const aStart = parseDuration((a.duration || '').split(/[-–—]/)[0]);
    const bStart = parseDuration((b.duration || '').split(/[-–—]/)[0]);
    if (aStart && bStart) {
      return bStart.localeCompare(aStart);
    }
    return 0;
  });
}

function formatSummary(value, sectionKey) {
  if (Array.isArray(value)) {
    if (!value.length) return "点击查看详细内容";
    const summaries = value
      .map((item) => (item.summary || item.title || '').replace(/[。．\.]+$/, ''))
      .filter(Boolean)
      .slice(0, 2);
    if (summaries.length) {
      const combined = summaries.join('； ');
      return combined.length > 80 ? `${combined.slice(0, 77)}...` : combined;
    }
    const firstItem = value[0];
    if (firstItem.summary) {
      return firstItem.summary;
    }
    const title = firstItem.title || '';
    const duration = firstItem.duration ? ` · ${firstItem.duration}` : '';
    if (sectionKey === 'competitionExperience') {
      const content = typeof firstItem.content === 'string' ? firstItem.content.split("\n")[0] : '';
      return `${title}${content ? ` · ${content}` : ''}`.trim() || "点击查看详细内容";
    }
    return `${title}${duration}`.trim() || (typeof firstItem.content === 'string' ? firstItem.content.split("\n")[0] : "点击查看详细内容");
  }
  if (typeof value === 'object' && value !== null) {
    if (value.summary) {
      return value.summary;
    }
    const title = value.title || '';
    const content = typeof value.content === 'string' ? value.content.split("\n")[0] : '';
    if (sectionKey === 'techStack') {
      return content || title || "点击查看详细内容";
    }
    return title || content || "点击查看详细内容";
  }
  if (typeof value === 'string') {
    const lines = value.trim().split("\n").filter(Boolean);
    if (!lines.length) {
      return "点击查看详细内容";
    }
    const first = lines[0];
    return first.length > 80 ? `${first.slice(0, 80)}...` : first;
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
    const preview = content.replace(/\n/g, ' ').trim();
    const summary = preview.length > 80 ? `${preview.slice(0, 80)}...` : preview;
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
  summaryElement.textContent = formatSummary(value, key);
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
