const DATA_URL = 'data.json';
const PARAM_KEY = 'section';
const DEFAULTS = {
  workExperience: [],
  projectExperience: [],
  techStack: { title: '技术栈', content: '' },
  competitionExperience: { title: '竞赛经历', content: '' },
};

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function getElement(id) {
  return document.getElementById(id);
}

const SECTION_TITLES = {
  workExperience: '工作经历',
  projectExperience: '项目经历',
  techStack: '技术栈',
  competitionExperience: '竞赛经历',
};

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

function formatDetailContent(content) {
  if (typeof content !== 'string') {
    return '';
  }
  return content.replace(/\n/g, '<br>');
}

function renderDetail(sectionKey, itemNumber, data) {
  const savedValue = data[sectionKey];
  let title = SECTION_TITLES[sectionKey] || '详细内容';
  let content;
  let selectedItem = null;
  if ((sectionKey === 'projectExperience' || sectionKey === 'workExperience' || sectionKey === 'competitionExperience') && itemNumber) {
    const items = splitEntries(savedValue);
    const index = Number(itemNumber) - 1;
    if (!items[index]) {
      content = '未找到对应的条目，请返回首页选择其它详情。';
    } else {
      selectedItem = items[index];
      content = typeof selectedItem === 'string' ? selectedItem : selectedItem.content || '';
      title = typeof selectedItem === 'object' && selectedItem !== null && selectedItem.title
        ? selectedItem.title
        : `${title} - 第 ${itemNumber} 条`;
    }
  } else if (Array.isArray(savedValue)) {
    content = savedValue
      .map((item, index) => {
        const itemTitle = item.title ? `【${item.title}】\n` : `【条目 ${index + 1}】\n`;
        return itemTitle + (item.content || '');
      })
      .join('\n\n');
  } else {
    content = typeof savedValue === 'string' ? savedValue : savedValue?.content || '当前模块无详细内容。';
  }
  getElement('detailTitle').textContent = title;
  const durationElement = getElement('detailDuration');
  durationElement.textContent = selectedItem && selectedItem.duration ? selectedItem.duration : '';
  getElement('detailContent').innerHTML = formatDetailContent(content);
}

async function init() {
  const sectionKey = getQueryParam(PARAM_KEY);
  const itemNumber = getQueryParam('item');
  const data = await loadData();
  renderDetail(sectionKey, itemNumber, data);
}

init();
