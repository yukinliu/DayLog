# DayLog · 时光日志

一个本地优先的时光日志工具，用来记录已经完成的事件、投入时间、完成情况、项目归属、整体感受和想法。数据默认保存在用户自己的浏览器里，因此不同用户、不同浏览器之间的数据彼此独立。

## 产品信息

- 中文名：时光日志
- 英文名：DayLog
- Slogan：念起觉心，知深见己。
- 提供方：刘迷糊

随机问候语存放在 `docs/data/greetings.rtf`。每行一句，页面会自动去掉行首编号后随机显示。

## 在线页面

- 正式页：`docs/index.html`
- 测试页：`docs/test.html`
- 数据检查页：`docs/recover.html`

GitHub Pages 当前从 `docs/` 目录发布。

## GitHub 仓库结构

```text
DayLog/
├── README.md
├── .gitignore
└── docs/
    ├── .nojekyll
    ├── index.html
    ├── test.html
    ├── recover.html
    └── assets/
        ├── css/
        │   ├── index.css
        │   └── test.css
        └── js/
            ├── index.js
            └── test.js
```

## 文件说明

| 文件 | 作用 |
| --- | --- |
| `docs/index.html` | 正式页面的 HTML 结构，只保留稳定功能。 |
| `docs/assets/css/index.css` | 正式页面样式。 |
| `docs/assets/js/index.js` | 正式页面交互和本地数据逻辑。 |
| `docs/test.html` | 测试页面的 HTML 结构，用来验证新功能。 |
| `docs/assets/css/test.css` | 测试页面样式。 |
| `docs/assets/js/test.js` | 测试页面交互和实验逻辑。 |
| `docs/recover.html` | 本地数据检查与恢复页面。 |
| `docs/.nojekyll` | 告诉 GitHub Pages 不使用 Jekyll 处理静态文件。 |
| `.gitignore` | 排除本地临时文件、图标素材、旧单文件和桌面 App。 |

## 正式页与测试页

正式页和测试页已经拆分为两套资源：

- 正式页只引用 `assets/css/index.css` 和 `assets/js/index.js`。
- 测试页只引用 `assets/css/test.css` 和 `assets/js/test.js`。

这样测试功能不会误进入正式页，后续也方便先在测试页验证，再决定是否发布到正式页。

## 本地保留但不上 GitHub 的文件

这些文件保留在电脑本地，便于后续维护，但不会出现在 GitHub 仓库里：

- `daily-todo-table.html`：旧版本地单文件。
- `时光日志.app/`：本地桌面快捷入口。
- `daily-todo-icon.svg`、`daily-todo-icon.svg.png`：桌面图标素材。
- `clean-icon.iconset/`、`tmp-icon.iconset/`：macOS 图标资源目录。
- `scripts/`：本地图标生成脚本。
- `.DS_Store`、`.Rhistory`：系统或工具产生的临时文件。

## 开发检查

拆分文件后，可用下面命令检查 JS 是否能被解析：

```bash
node --check docs/assets/js/index.js
node --check docs/assets/js/test.js
```
