import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const errors = [];
const warnings = [];

const packageJson = readJson("package.json");
const tauriConfig = readJson("src-tauri/tauri.conf.json");
const content = readJson("public/data/daylog-content.json");
const activities = readJson("public/data/energy-activities.json");
const cargoToml = fs.readFileSync(path.join(root, "src-tauri/Cargo.toml"), "utf8");
const cargoVersion = cargoToml.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
const versions = new Map([
  ["package.json", packageJson.version],
  ["tauri.conf.json", tauriConfig.version],
  ["Cargo.toml", cargoVersion],
  ["daylog-content.json", content.release?.version]
]);

if (new Set(versions.values()).size !== 1) {
  errors.push(`版本号不一致：${[...versions].map(([file, version]) => `${file}=${version ?? "缺失"}`).join("，")}`);
}
if (!/^https:\/\//.test(content.remoteContentUrl ?? "")) {
  errors.push("daylog-content.json.remoteContentUrl 尚未配置为可直接读取的 HTTPS JSON 地址");
}
if (!/^https:\/\//.test(content.links?.updateDownloadUrl ?? "")) {
  errors.push("飞书版本下载页不是有效的 HTTPS 地址");
}
if (!/^https:\/\//.test(content.links?.productGuideUrl ?? "")) {
  errors.push("产品说明不是有效的 HTTPS 地址");
}
if (!Array.isArray(activities) || activities.length !== 100) {
  errors.push(`充能小事应为 100 件，当前为 ${Array.isArray(activities) ? activities.length : "无效格式"}`);
} else {
  if (new Set(activities.map((item) => item.id)).size !== activities.length) errors.push("充能小事存在重复 id");
  if (new Set(activities.map((item) => item.title)).size !== activities.length) warnings.push("充能小事存在重复标题");
}
for (const icon of tauriConfig.bundle?.icon ?? []) {
  if (!fs.existsSync(path.join(root, "src-tauri", icon))) errors.push(`打包图标不存在：src-tauri/${icon}`);
}
if (!tauriConfig.bundle?.icon?.length) errors.push("Tauri 尚未配置打包图标");

console.log(`见己发布检查 · v${tauriConfig.version ?? "未知"}`);
warnings.forEach((message) => console.warn(`警告：${message}`));
if (errors.length) {
  errors.forEach((message) => console.error(`阻塞：${message}`));
  process.exitCode = 1;
} else {
  console.log("配置、版本和内容文件检查通过。");
}
