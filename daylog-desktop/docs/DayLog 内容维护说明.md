# DayLog 内容维护说明

## 你平时需要维护什么

运营内容统一在 `public/data/daylog-content.json`：

- `charge`：充能页标题、引导语和换一件小事按钮。
- `productsSection`、`products`：其他产品区标题、产品文案与飞书链接。
- `recommendation`：DayLog 推荐语与复制按钮文案。
- `greetings`：记录页顶部随机问候语。
- `links.productGuideUrl`：DayLog 产品说明飞书链接。
- `links.feedbackLabel`：设置页反馈入口名称。
- `links.feedbackUrl`：用户提交反馈与建议的飞书链接。
- `links.updateDownloadUrl`：用户下载最新版客户端的固定飞书页面。
- `release`：最新公开版本号、发布日期与简短更新内容。

100 件充能小事独立保存在 `public/data/energy-activities.json`，因为它是较长、较稳定的产品内容，不需要和每次版本发布一起修改。

## 首次配置远程内容

为了让已经安装的旧版本知道有新版，需要把 `daylog-content.json` 放在一个应用可以直接读取的 HTTPS 地址。这里的“公网”只表示客户端能够联网读取，不代表公开展示资料库，也不需要另建下载网站。

1. 准备一个能直接返回 JSON 文件内容的固定 HTTPS 地址。
2. 将该地址写入本地 `daylog-content.json` 的 `remoteContentUrl`。
3. 把同一份文件上传到该固定地址。
4. 构建并发布客户端。之后不要更换这个地址。

飞书继续承担客户端安装包下载。远程 JSON 只告诉应用“最新版本是多少、更新了什么、飞书下载页在哪里”，体积很小，不保存任何用户记录。

## 每次发布新版本

按下面顺序操作：

1. 修改 `src-tauri/tauri.conf.json` 的 `version`，这是客户端实际安装版本。
2. 构建新的 `.dmg`，完成安装测试。
3. 把新安装包上传到固定的飞书版本下载页。
4. 修改远程 `daylog-content.json` 的 `release`：

```json
"release": {
  "version": "0.2.0",
  "publishedAt": "2026-08-20",
  "notes": "优化明细与充能页"
}
```

5. 确认 `links.updateDownloadUrl` 仍指向固定飞书下载页，再上传 JSON。

应用每天最多在后台读取一次远程内容。没有更新时，“关于”只显示当前版本和更新状态；发现新版后才会显示飞书下载链接，并在左侧设置图标上显示提示点。

## 修改时的注意事项

- 版本号使用 `主版本.次版本.修订号`，例如 `0.2.0`。
- JSON 最后一项后面不要加逗号；链接与文案必须放在英文双引号内。
- 不要把用户资料库路径、记录内容或测试数据放进该文件。
- 远程文件短暂不可访问不会影响记录；应用会使用缓存或安装包内置内容。
