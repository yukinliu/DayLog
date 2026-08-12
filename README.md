# 刘迷糊 DayLog · 见己

见己是一款本地优先的个人时光记录与自我觉察工具。它帮助用户分别留下感受、想法与真实发生的事情，再通过明细、项目、统计和日历回看生活的连续性。

记录默认只保存在用户选择的本地资料库中，不需要账号，也不会上传个人记录或使用行为。

## 当前版本

当前持续开发的是 `daylog-desktop/`：基于 React、TypeScript 与 Tauri 2 的 macOS 桌面版。

主要能力包括：

- 感受体验与多条想法记录
- 事实经历、项目归属和投入时间记录
- 明细回看与原位修改
- 项目管理、统计和月历
- 本地 JSON 数据与每日 Markdown 双重保存
- 充能小事、其他自我探索产品与分享入口
- 通过远程内容文件检查新版本，并前往固定飞书页面下载

## 仓库结构

```text
DayLog/
├── daylog-desktop/       # 当前桌面版
│   ├── src/              # React 前端
│   ├── src-tauri/        # Tauri / Rust 桌面壳与本地资料库读写
│   ├── public/data/      # 可维护文案、版本信息和充能小事
│   ├── docs/             # 产品、视觉、开发与发布文档
│   └── design/           # 当前正式图标母版
└── docs/                 # 早期网页版本与历史测试页面
```

旧网页版本继续公开保留，用于记录产品演进，但不再作为当前桌面版的主要开发入口。

## 桌面版开发

环境要求：Node.js、Rust、macOS Command Line Tools。

```bash
cd daylog-desktop
npm install
npm run tauri:dev
```

完整检查：

```bash
npm run check
```

发布前检查：

```bash
npm run release:check
```

构建 macOS DMG：

```bash
npm run tauri:build
```

## 内容与版本维护

产品文案、问候语、其他产品链接和版本信息统一维护在：

`daylog-desktop/public/data/daylog-content.json`

旧客户端通过以下 Raw 地址检查更新：

`https://raw.githubusercontent.com/yukinliu/DayLog/main/daylog-desktop/public/data/daylog-content.json`

安装包仍由固定飞书下载页提供。发布新版时，应先上传安装包，再更新并推送 `release.version`。

## 数据与隐私

- 用户记录只写入其选择的本地资料库。
- `.daylog/*.json` 是应用数据源，`days/*.md` 是可阅读、可迁移的每日记录。
- 复制整个资料库即可备份或迁移。
- 仓库不包含用户测试资料、构建缓存、`node_modules` 或 Rust `target`。

## 版权

Copyright © 刘迷糊。源代码公开用于产品展示与协作测试；当前未声明开源许可证，保留所有权利。
