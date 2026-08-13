# DayLog 内容维护说明

## 你平时需要维护什么

运营内容统一在 `public/data/daylog-content.json`：

- `charge`：关照页标题、引导语和换一件小事按钮。
- `productsSection`、`products`：预留的其他产品内容。当前客户端不展示该区域，保留数据不会影响关照页。
- `recommendation`：DayLog 推荐语与复制按钮文案。
- `greetings`：记录页顶部随机问候语。
- `links.productGuideUrl`：DayLog 产品说明飞书链接。
- `links.feedbackLabel`：设置页反馈入口名称。
- `links.feedbackUrl`：用户提交反馈与建议的飞书链接。
- `links.updateDownloadUrl`：用户下载最新版客户端的固定飞书页面。
- `release`：最新公开版本号、发布日期与简短更新内容。

100 件关照小事独立保存在 `public/data/energy-activities.json`，因为它是较长、较稳定的产品内容，不需要和每次版本发布一起修改。

## 首次配置远程内容

为了让已经安装的旧版本知道有新版，需要把 `daylog-content.json` 放在一个应用可以直接读取的 HTTPS 地址。这里的“公网”只表示客户端能够联网读取，不代表公开展示资料库，也不需要另建下载网站。

1. 准备一个能直接返回 JSON 文件内容的固定 HTTPS 地址。
2. 将该地址写入本地 `daylog-content.json` 的 `remoteContentUrl`。
3. 把同一份文件上传到该固定地址。
4. 构建并发布客户端。之后不要更换这个地址。

飞书继续承担客户端安装包下载。远程 JSON 只告诉应用“最新版本是多少、更新了什么、飞书下载页在哪里”，体积很小，不保存任何用户记录。

## 每次发布新版本

按下面顺序操作：

1. 在项目根目录 `CHANGELOG.md` 顶部追加本次面向用户的版本记录。
2. 同步修改 `package.json` 和 `src-tauri/tauri.conf.json` 的 `version`，后者是客户端实际安装版本。
3. 构建 macOS 与 Windows 安装包，完成安装测试。
4. 把新安装包上传到固定的飞书版本下载页。
5. 修改远程 `daylog-content.json` 的 `release`：

```json
"release": {
  "version": "0.2.0",
  "publishedAt": "2026-08-20",
  "notes": "优化明细与关照页"
}
```

6. 确认 `links.updateDownloadUrl` 仍指向固定飞书下载页，再上传 JSON。

应用每次启动时都会读取一次远程内容。没有更新时，“关于”只显示当前版本和更新状态；发现新版后才会显示飞书下载链接，并在左侧设置图标上显示提示点。

## 修改时的注意事项

- 版本号使用 `主版本.次版本.修订号`，例如 `0.2.0`。
- JSON 最后一项后面不要加逗号；链接与文案必须放在英文双引号内。
- 不要把用户资料库路径、记录内容或测试数据放进该文件。
- 远程文件短暂不可访问不会影响记录；应用会使用最近一次成功读取的缓存，首次使用且没有缓存时则使用安装包内置内容。

## 匿名使用统计

见己通过 TelemetryDeck 了解内测使用情况。统计配置固定在客户端代码中，不需要在 `daylog-content.json` 中维护。

- App ID：`D8E956A7-C9C0-48FA-BE64-13D8FB9C0ACD`
- Namespace：`com.daylog`
- 仅记录首次激活、每日首次打开、首次保存自我觉察、首次保存事实经历、打开更新链接和打开反馈链接。
- 随事件发送应用版本、操作系统和日期；匿名安装标识会先在本地哈希。
- 不发送感受、想法、事件、项目、资料库路径或任何文件内容。
- 网络失败不影响使用，待发送事件最多在应用配置目录保留 20 条并于下次启动重试。
