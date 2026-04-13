# 后端开发作品集展示页面

这是一个简洁的个人作品集页面示例，基于静态 HTML/CSS/JavaScript 构建。项目用于展示个人工作经历、项目经历、技术栈与竞赛经历，支持摘要展示、详情展开、项目排序与跳转按钮。

## 目录结构

- `index.html` - 主页展示个人简介和各个模块概览。包含按钮跳转到 GitHub 和 CSDN。
- `detail.html` - 详情页，用于展示某一条工作/项目/竞赛的完整内容。
- `data.json` - 数据源，包含 `workExperience`、`projectExperience`、`techStack`、`competitionExperience` 等字段。
- `script.js` - 主页业务逻辑：加载数据、生成摘要、排序项目、渲染列表、控制详情展开。
- `detail.js` - 详情页逻辑：根据 URL 参数读取对应条目并渲染完整内容。
- `styles.css` - 页面样式。
- `LICENSE` - 开源许可证。

## 功能说明

- 自动从 `data.json` 加载简历内容。
- `projectExperience` 按时间倒序显示，最近项目排在最前。
- 项目/竞赛摘要仅取前两条并以 `；` 连接，最多显示 80 字。
- 列表预览内容统一截断为 80 字。
- 点击“查看详情”可展开每个模块或跳转到详情页。
- 主页支持个人 GitHub 与 CSDN 链接按钮。

## 运行方式

1. 直接双击 `index.html` 在浏览器中打开即可。
2. 若浏览器限制本地 `fetch` 跨域，可使用简单静态服务器运行：

```bash
cd showreel
python -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 编辑数据

- 将个人简历内容写入 `data.json`。
- `projectExperience` 与 `competitionExperience` 为数组，每个条目可包含 `title`、`duration`、`summary`、`content`。
- `techStack` 是对象，包含 `title` 和 `content`。

## 自定义链接

在 `index.html` 中，将按钮链接替换为你的真实地址：

- GitHub: `https://github.com/your-github`
- CSDN: `https://blog.csdn.net/your-csdn`

## 备注

本项目适合作为静态个人作品集或简历展示页面基础，可根据需要继续扩展更多模块、动画效果或主题样式。