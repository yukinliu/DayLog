use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    fs::{self, File},
    io::Write,
    path::{Component, Path, PathBuf},
    process::Command,
    sync::Mutex,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Emitter, Manager};
use uuid::Uuid;

const TELEMETRY_APP_ID: &str = "D8E956A7-C9C0-48FA-BE64-13D8FB9C0ACD";
const TELEMETRY_NAMESPACE: &str = "com.daylog";
const TELEMETRY_QUEUE_LIMIT: usize = 20;
static DEVICE_STATE_LOCK: Mutex<()> = Mutex::new(());

fn telemetry_state_key() -> &'static str {
    if cfg!(debug_assertions) {
        "telemetryDebug"
    } else {
        "telemetry"
    }
}

const DATA_FILES: [(&str, &str); 6] = [
    ("settings", "app-settings.json"),
    ("projects", "projects.json"),
    ("projectHistory", "project-history.json"),
    ("moods", "moods.json"),
    ("thoughts", "thoughts.json"),
    ("events", "events.json"),
];

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct LoadedVault {
    path: String,
    data: Value,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PlannedFile {
    relative_path: String,
    content: String,
}

#[derive(Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct PendingTelemetryEvent {
    id: String,
    event: String,
    local_date: String,
}

fn timestamp_millis() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}

fn app_state_file(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir()
        .map(|path| path.join("device-state.json"))
        .map_err(|error| format!("无法定位应用配置目录：{error}"))
}

fn remember_vault(app: &AppHandle, path: &Path) -> Result<(), String> {
    let _lock = DEVICE_STATE_LOCK
        .lock()
        .map_err(|_| "应用配置暂时不可用".to_string())?;
    let state_file = app_state_file(app)?;
    if let Some(parent) = state_file.parent() {
        fs::create_dir_all(parent).map_err(|error| format!("无法创建应用配置目录：{error}"))?;
    }
    let mut state = read_device_state(&state_file)?;
    state["recentVaultPath"] = json!(path.to_string_lossy());
    let content = serde_json::to_string_pretty(&state)
        .map_err(|error| format!("无法生成应用配置：{error}"))?;
    atomic_write(&state_file, &format!("{content}\n"))
}

fn read_recent_vault_path(app: &AppHandle) -> Result<Option<PathBuf>, String> {
    let _lock = DEVICE_STATE_LOCK
        .lock()
        .map_err(|_| "应用配置暂时不可用".to_string())?;
    let state_file = app_state_file(app)?;
    let value = read_device_state(&state_file)?;
    Ok(value
        .get("recentVaultPath")
        .and_then(Value::as_str)
        .map(PathBuf::from))
}

fn read_device_state(path: &Path) -> Result<Value, String> {
    if !path.exists() {
        return Ok(json!({}));
    }
    let content = fs::read_to_string(path).map_err(|error| format!("无法读取应用配置：{error}"))?;
    serde_json::from_str(&content).map_err(|error| format!("应用配置格式错误：{error}"))
}

fn write_device_state(path: &Path, value: &Value) -> Result<(), String> {
    let content = serde_json::to_string_pretty(value)
        .map_err(|error| format!("无法生成应用配置：{error}"))?;
    atomic_write(path, &format!("{content}\n"))
}

fn telemetry_event_type(event: &str) -> Option<&'static str> {
    match event {
        "activation" => Some("App.activated"),
        "daily_open" => Some("App.openedDaily"),
        "first_reflection_saved" => Some("Record.reflectionSavedFirst"),
        "first_event_saved" => Some("Record.eventSavedFirst"),
        "update_link_opened" => Some("Update.downloadLinkOpened"),
        "feedback_link_opened" => Some("Feedback.linkOpened"),
        _ => None,
    }
}

fn telemetry_marker(event: &str) -> Option<&'static str> {
    match event {
        "activation" => Some("activationTracked"),
        "first_reflection_saved" => Some("firstReflectionTracked"),
        "first_event_saved" => Some("firstEventTracked"),
        _ => None,
    }
}

fn enqueue_telemetry_event(app: &AppHandle, event: &str, local_date: &str) -> Result<(), String> {
    if telemetry_event_type(event).is_none() {
        return Err("未知的统计事件".to_string());
    }
    let _lock = DEVICE_STATE_LOCK
        .lock()
        .map_err(|_| "应用配置暂时不可用".to_string())?;
    let state_file = app_state_file(app)?;
    let mut state = read_device_state(&state_file)?;
    let state_key = telemetry_state_key();
    let telemetry = state
        .as_object_mut()
        .ok_or_else(|| "应用配置格式错误".to_string())?
        .entry(state_key)
        .or_insert_with(|| json!({}));
    let telemetry = telemetry
        .as_object_mut()
        .ok_or_else(|| "统计配置格式错误".to_string())?;

    if let Some(marker) = telemetry_marker(event) {
        if telemetry
            .get(marker)
            .and_then(Value::as_bool)
            .unwrap_or(false)
        {
            return Ok(());
        }
        telemetry.insert(marker.to_string(), json!(true));
    }
    if event == "daily_open" {
        if telemetry.get("dailyOpenDate").and_then(Value::as_str) == Some(local_date) {
            return Ok(());
        }
        telemetry.insert("dailyOpenDate".to_string(), json!(local_date));
    }
    if !telemetry.contains_key("clientUser") {
        let digest = Sha256::digest(Uuid::new_v4().as_bytes());
        telemetry.insert("clientUser".to_string(), json!(format!("{digest:x}")));
    }
    let pending = telemetry.entry("pending").or_insert_with(|| json!([]));
    let pending = pending
        .as_array_mut()
        .ok_or_else(|| "统计队列格式错误".to_string())?;
    pending.push(json!(PendingTelemetryEvent {
        id: Uuid::new_v4().to_string(),
        event: event.to_string(),
        local_date: local_date.to_string(),
    }));
    if pending.len() > TELEMETRY_QUEUE_LIMIT {
        pending.drain(0..pending.len() - TELEMETRY_QUEUE_LIMIT);
    }
    write_device_state(&state_file, &state)
}

fn pending_telemetry(app: &AppHandle) -> Result<(String, Vec<PendingTelemetryEvent>), String> {
    let _lock = DEVICE_STATE_LOCK
        .lock()
        .map_err(|_| "应用配置暂时不可用".to_string())?;
    let state = read_device_state(&app_state_file(app)?)?;
    let telemetry = state
        .get(telemetry_state_key())
        .cloned()
        .unwrap_or_else(|| json!({}));
    let client_user = telemetry
        .get("clientUser")
        .and_then(Value::as_str)
        .unwrap_or_default()
        .to_string();
    let pending = serde_json::from_value(
        telemetry
            .get("pending")
            .cloned()
            .unwrap_or_else(|| json!([])),
    )
    .map_err(|error| format!("无法读取统计队列：{error}"))?;
    Ok((client_user, pending))
}

fn remove_pending_telemetry(app: &AppHandle, ids: &[String]) -> Result<(), String> {
    if ids.is_empty() {
        return Ok(());
    }
    let _lock = DEVICE_STATE_LOCK
        .lock()
        .map_err(|_| "应用配置暂时不可用".to_string())?;
    let state_file = app_state_file(app)?;
    let mut state = read_device_state(&state_file)?;
    let pointer = format!("/{}/pending", telemetry_state_key());
    if let Some(pending) = state.pointer_mut(&pointer).and_then(Value::as_array_mut) {
        pending.retain(|item| {
            !item
                .get("id")
                .and_then(Value::as_str)
                .is_some_and(|id| ids.iter().any(|sent| sent == id))
        });
    }
    write_device_state(&state_file, &state)
}

async fn flush_telemetry(app: &AppHandle) -> Result<(), String> {
    let (client_user, pending) = pending_telemetry(app)?;
    if client_user.is_empty() || pending.is_empty() {
        return Ok(());
    }
    let app_version = app.package_info().version.to_string();
    let platform = if cfg!(target_os = "macos") {
        "macOS"
    } else if cfg!(target_os = "windows") {
        "Windows"
    } else {
        "Other"
    };
    let body: Vec<Value> = pending
        .iter()
        .filter_map(|item| {
            telemetry_event_type(&item.event).map(|event_type| {
                json!({
                    "appID": TELEMETRY_APP_ID,
                    "clientUser": client_user,
                    "type": event_type,
                    "isTestMode": cfg!(debug_assertions),
                    "payload": {
                        "appVersion": app_version,
                        "platform": platform,
                        "DayLog.eventDate": item.local_date
                    }
                })
            })
        })
        .collect();
    if body.is_empty() {
        return Ok(());
    }
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()
        .map_err(|error| format!("无法初始化统计请求：{error}"))?;
    let response = client
        .post(format!(
            "https://nom.telemetrydeck.com/v2/namespace/{TELEMETRY_NAMESPACE}/"
        ))
        .json(&body)
        .send()
        .await
        .map_err(|error| format!("统计服务暂时不可用：{error}"))?;
    if !response.status().is_success() {
        return Err(format!("统计服务返回 {}", response.status()));
    }
    remove_pending_telemetry(
        app,
        &pending
            .iter()
            .map(|item| item.id.clone())
            .collect::<Vec<_>>(),
    )
}

#[tauri::command]
async fn telemetry_startup(app: AppHandle, local_date: String) -> Result<(), String> {
    enqueue_telemetry_event(&app, "activation", &local_date)?;
    enqueue_telemetry_event(&app, "daily_open", &local_date)?;
    flush_telemetry(&app).await
}

#[tauri::command]
async fn track_telemetry_event(
    app: AppHandle,
    event: String,
    local_date: String,
) -> Result<(), String> {
    enqueue_telemetry_event(&app, &event, &local_date)?;
    flush_telemetry(&app).await
}

fn atomic_write(path: &Path, content: &str) -> Result<(), String> {
    let parent = path
        .parent()
        .ok_or_else(|| "目标文件缺少父目录".to_string())?;
    fs::create_dir_all(parent).map_err(|error| format!("无法创建目录：{error}"))?;

    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| "目标文件名无效".to_string())?;
    let temporary = parent.join(format!(".{file_name}.{}.tmp", timestamp_millis()));
    let result = (|| -> Result<(), String> {
        let mut file =
            File::create(&temporary).map_err(|error| format!("无法创建临时文件：{error}"))?;
        file.write_all(content.as_bytes())
            .map_err(|error| format!("无法写入临时文件：{error}"))?;
        file.sync_all()
            .map_err(|error| format!("无法刷新临时文件：{error}"))?;
        fs::rename(&temporary, path).map_err(|error| format!("无法替换正式文件：{error}"))?;
        Ok(())
    })();

    if result.is_err() {
        let _ = fs::remove_file(&temporary);
    }
    result
}

fn is_safe_relative_path(relative: &Path) -> bool {
    if relative.is_absolute() {
        return false;
    }
    if relative
        .components()
        .any(|component| !matches!(component, Component::Normal(_)))
    {
        return false;
    }
    matches!(
        relative.components().next(),
        Some(Component::Normal(first)) if first == ".daylog" || first == "days"
    )
}

fn ensure_empty_or_daylog_folder(path: &Path) -> Result<(), String> {
    if !path.exists() {
        fs::create_dir_all(path).map_err(|error| format!("无法创建资料库目录：{error}"))?;
        return Ok(());
    }
    if !path.is_dir() {
        return Err("请选择文件夹作为见己资料库".to_string());
    }
    if path.join(".daylog").exists() {
        return Ok(());
    }
    let mut entries = fs::read_dir(path).map_err(|error| format!("无法读取所选文件夹：{error}"))?;
    if entries.next().is_some() {
        return Err("新资料库需要使用空文件夹；该文件夹中已有其他内容".to_string());
    }
    Ok(())
}

fn initial_settings(now_iso: &str) -> Value {
    json!({
        "schemaVersion": 1,
        "projectStatusModel": 2,
        "lastOpenedAt": now_iso,
        "appearance": "mist-paper",
        "projectColorScheme": "seasonal"
    })
}

fn initialize_vault(path: &Path, now_iso: &str) -> Result<(), String> {
    fs::create_dir_all(path.join(".daylog"))
        .map_err(|error| format!("无法创建资料库数据目录：{error}"))?;
    fs::create_dir_all(path.join("days"))
        .map_err(|error| format!("无法创建每日记录目录：{error}"))?;

    for (key, file_name) in DATA_FILES {
        let value = if key == "settings" {
            initial_settings(now_iso)
        } else {
            json!([])
        };
        let content = format!(
            "{}\n",
            serde_json::to_string_pretty(&value)
                .map_err(|error| format!("无法生成资料库初始数据：{error}"))?
        );
        atomic_write(&path.join(".daylog").join(file_name), &content)?;
    }
    Ok(())
}

fn load_vault_from_path(path: &Path) -> Result<LoadedVault, String> {
    if !path.is_dir() || !path.join(".daylog").is_dir() {
        return Err("所选文件夹不是有效的见己资料库".to_string());
    }

    let mut data = serde_json::Map::new();
    let mut settings_migration: Option<(String, String)> = None;
    data.insert("version".to_string(), json!(1));
    for (key, file_name) in DATA_FILES {
        let file_path = path.join(".daylog").join(file_name);
        let content = fs::read_to_string(&file_path)
            .map_err(|error| format!("无法读取 {file_name}：{error}"))?;
        let mut value: Value = serde_json::from_str(&content)
            .map_err(|error| format!("{file_name} 不是有效 JSON：{error}"))?;
        if key == "settings" {
            let settings = value
                .as_object_mut()
                .ok_or_else(|| "app-settings.json 必须是对象".to_string())?;
            let needs_migration =
                !settings.contains_key("schemaVersion") || settings.contains_key("vaultPath");
            match settings.get("schemaVersion").and_then(Value::as_u64) {
                Some(1) => {}
                None => {
                    settings.insert("schemaVersion".to_string(), json!(1));
                }
                Some(version) => {
                    return Err(format!(
                        "资料库版本 {version} 高于当前应用支持的版本 1，请升级见己后再打开"
                    ));
                }
            }
            settings.remove("vaultPath");
            settings
                .entry("lastOpenedAt")
                .or_insert_with(|| json!("1970-01-01T00:00:00Z"));
            settings
                .entry("appearance")
                .or_insert_with(|| json!("mist-paper"));
            settings
                .entry("projectColorScheme")
                .or_insert_with(|| json!("seasonal"));
            if needs_migration {
                let migrated = serde_json::to_string_pretty(&Value::Object(settings.clone()))
                    .map_err(|error| format!("无法迁移 app-settings.json：{error}"))?;
                settings_migration = Some((content.clone(), format!("{migrated}\n")));
            }
            settings.insert(
                "vaultPath".to_string(),
                json!(path.to_string_lossy().to_string()),
            );
        } else if !value.is_array() {
            return Err(format!("{file_name} 必须是数组"));
        }
        data.insert(key.to_string(), value);
    }

    if let Some((original, migrated)) = settings_migration {
        let daylog_dir = path.join(".daylog");
        let backup = daylog_dir.join("app-settings.v0.backup.json");
        if !backup.exists() {
            atomic_write(&backup, &original)?;
        }
        atomic_write(&daylog_dir.join("app-settings.json"), &migrated)?;
    }

    Ok(LoadedVault {
        path: path.to_string_lossy().to_string(),
        data: Value::Object(data),
    })
}

#[tauri::command]
fn open_recent_vault(app: AppHandle) -> Result<Option<LoadedVault>, String> {
    let Some(path) = read_recent_vault_path(&app)? else {
        return Ok(None);
    };
    if !path.exists() {
        return Ok(None);
    }
    load_vault_from_path(&path).map(Some)
}

#[tauri::command]
fn open_vault(
    app: AppHandle,
    path: String,
    create: bool,
    now_iso: String,
) -> Result<LoadedVault, String> {
    let path = PathBuf::from(path);
    if create {
        ensure_empty_or_daylog_folder(&path)?;
        if !path.join(".daylog").exists() {
            initialize_vault(&path, &now_iso)?;
        }
    }
    let loaded = load_vault_from_path(&path)?;
    remember_vault(&app, &path)?;
    Ok(loaded)
}

#[tauri::command]
fn save_vault(
    vault_path: String,
    files: Vec<PlannedFile>,
    delete_relative_paths: Vec<String>,
) -> Result<(), String> {
    let vault = PathBuf::from(vault_path);
    if !vault.join(".daylog").is_dir() {
        return Err("当前资料库路径无效，请重新选择资料库".to_string());
    }

    for planned in files {
        let relative = Path::new(&planned.relative_path);
        if !is_safe_relative_path(relative) {
            return Err(format!(
                "拒绝写入资料库之外的路径：{}",
                planned.relative_path
            ));
        }
        atomic_write(&vault.join(relative), &planned.content)?;
    }

    for relative_path in delete_relative_paths {
        let relative = Path::new(&relative_path);
        if !is_safe_relative_path(relative) {
            return Err(format!("拒绝删除资料库之外的路径：{relative_path}"));
        }
        let target = vault.join(relative);
        if target.exists() {
            fs::remove_file(&target).map_err(|error| format!("无法删除过期 Markdown：{error}"))?;
        }
    }
    Ok(())
}

#[tauri::command]
fn show_in_finder(path: String) -> Result<(), String> {
    let path = PathBuf::from(path);
    if !path.exists() {
        return Err("资料库文件夹不存在".to_string());
    }
    open_with_system(path.as_os_str()).map_err(|error| format!("无法打开资料库文件夹：{error}"))?;
    Ok(())
}

#[tauri::command]
fn open_external_url(url: String) -> Result<(), String> {
    if !(url.starts_with("https://") || url.starts_with("http://")) {
        return Err("只允许打开 http 或 https 链接".to_string());
    }
    open_with_system(std::ffi::OsStr::new(&url))
        .map_err(|error| format!("无法打开外部链接：{error}"))?;
    Ok(())
}

#[tauri::command]
fn close_main_window(app: AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "无法找到主窗口".to_string())?;
    #[cfg(target_os = "macos")]
    {
        window
            .hide()
            .map_err(|error| format!("无法关闭窗口：{error}"))?;
    }
    #[cfg(not(target_os = "macos"))]
    {
        window
            .destroy()
            .map_err(|error| format!("无法退出应用：{error}"))?;
    }
    Ok(())
}

#[cfg(target_os = "macos")]
fn open_with_system(target: &std::ffi::OsStr) -> std::io::Result<()> {
    Command::new("open").arg(target).spawn().map(|_| ())
}

#[cfg(target_os = "windows")]
fn open_with_system(target: &std::ffi::OsStr) -> std::io::Result<()> {
    Command::new("explorer.exe").arg(target).spawn().map(|_| ())
}

#[cfg(all(not(target_os = "macos"), not(target_os = "windows")))]
fn open_with_system(target: &std::ffi::OsStr) -> std::io::Result<()> {
    Command::new("xdg-open").arg(target).spawn().map(|_| ())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            open_recent_vault,
            open_vault,
            save_vault,
            show_in_finder,
            open_external_url,
            close_main_window,
            telemetry_startup,
            track_telemetry_event
        ])
        .build(tauri::generate_context!())
        .expect("error while building 见己")
        .run(|app, event| {
            #[cfg(target_os = "macos")]
            if let tauri::RunEvent::Reopen { .. } = event {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                    let _ = app.emit("main-window-opened", ());
                }
            }
        });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn telemetry_events_are_explicitly_allowlisted() {
        assert_eq!(telemetry_event_type("activation"), Some("App.activated"));
        assert_eq!(
            telemetry_event_type("first_event_saved"),
            Some("Record.eventSavedFirst")
        );
        assert_eq!(telemetry_event_type("record_content"), None);
        assert_eq!(telemetry_event_type("vault_path"), None);
    }

    #[test]
    fn telemetry_payload_does_not_serialize_record_content() {
        let item = PendingTelemetryEvent {
            id: "event-id".to_string(),
            event: "daily_open".to_string(),
            local_date: "2026-08-12".to_string(),
        };
        let value = serde_json::to_value(item).unwrap();
        assert_eq!(value["event"], "daily_open");
        assert!(value.get("content").is_none());
        assert!(value.get("vaultPath").is_none());
    }

    fn test_vault_path(name: &str) -> PathBuf {
        std::env::temp_dir().join(format!("daylog-{name}-{}", timestamp_millis()))
    }

    #[test]
    fn loads_optional_migrated_vaults() {
        let Ok(root) = std::env::var("DAYLOG_MIGRATION_TEST_ROOT") else {
            return;
        };
        let expected_count = std::env::var("DAYLOG_MIGRATION_EXPECTED_COUNT")
            .ok()
            .and_then(|value| value.parse::<usize>().ok())
            .unwrap_or(7);
        let root = PathBuf::from(root);
        let mut loaded_count = 0;
        for entry in fs::read_dir(&root).unwrap() {
            let path = entry.unwrap().path();
            if path.is_dir() && path.join(".daylog").is_dir() {
                let loaded = load_vault_from_path(&path).unwrap();
                assert_eq!(loaded.data["version"], 1);
                assert!(loaded.data["projects"].is_array());
                assert!(loaded.data["events"].is_array());
                assert!(loaded.data["moods"].is_array());
                assert!(loaded.data["thoughts"].is_array());
                loaded_count += 1;
            }
        }
        assert_eq!(loaded_count, expected_count);
    }

    #[test]
    fn initializes_loads_writes_and_deletes_a_vault() {
        let vault = test_vault_path("vault-flow");
        fs::create_dir_all(&vault).unwrap();
        initialize_vault(&vault, "2026-08-10T00:00:00+08:00").unwrap();

        let loaded = load_vault_from_path(&vault).unwrap();
        assert_eq!(loaded.data["version"], 1);
        assert_eq!(loaded.data["events"], json!([]));
        assert_eq!(loaded.data["settings"]["schemaVersion"], 1);
        assert_eq!(
            loaded.data["settings"]["vaultPath"],
            vault.to_string_lossy().to_string()
        );

        let stored_settings: Value = serde_json::from_str(
            &fs::read_to_string(vault.join(".daylog/app-settings.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(stored_settings["schemaVersion"], 1);
        assert!(stored_settings.get("vaultPath").is_none());

        save_vault(
            vault.to_string_lossy().to_string(),
            vec![PlannedFile {
                relative_path: "days/2026/08/2026-08-10.md".to_string(),
                content: "# 2026-08-10 · 见己\n".to_string(),
            }],
            vec![],
        )
        .unwrap();
        let markdown = vault.join("days/2026/08/2026-08-10.md");
        assert!(markdown.exists());

        save_vault(
            vault.to_string_lossy().to_string(),
            vec![],
            vec!["days/2026/08/2026-08-10.md".to_string()],
        )
        .unwrap();
        assert!(!markdown.exists());

        fs::remove_dir_all(vault).unwrap();
    }

    #[test]
    fn persists_create_edit_delete_and_restart_flow() {
        let vault = test_vault_path("record-flow");
        fs::create_dir_all(&vault).unwrap();
        initialize_vault(&vault, "2026-08-10T00:00:00+08:00").unwrap();

        let event = json!([{
            "id": "event-1",
            "date": "2026-08-10",
            "createdAt": "2026-08-10T09:00:00+08:00",
            "period": "上午",
            "title": "第一次记录",
            "projectId": null,
            "minutes": 30,
            "completion": "progress",
            "note": ""
        }]);
        save_vault(
            vault.to_string_lossy().to_string(),
            vec![
                PlannedFile {
                    relative_path: ".daylog/events.json".to_string(),
                    content: format!("{}\n", serde_json::to_string_pretty(&event).unwrap()),
                },
                PlannedFile {
                    relative_path: "days/2026/08/2026-08-10.md".to_string(),
                    content: "# 2026-08-10 · 见己\n\n第一次记录\n".to_string(),
                },
            ],
            vec![],
        )
        .unwrap();
        let restarted = load_vault_from_path(&vault).unwrap();
        assert_eq!(restarted.data["events"][0]["title"], "第一次记录");

        let edited_event = json!([{
            "id": "event-1",
            "date": "2026-08-10",
            "createdAt": "2026-08-10T09:00:00+08:00",
            "period": "上午",
            "title": "修改后的记录",
            "projectId": null,
            "minutes": 45,
            "completion": "excellent",
            "note": "已完成"
        }]);
        save_vault(
            vault.to_string_lossy().to_string(),
            vec![PlannedFile {
                relative_path: ".daylog/events.json".to_string(),
                content: format!("{}\n", serde_json::to_string_pretty(&edited_event).unwrap()),
            }],
            vec![],
        )
        .unwrap();
        assert_eq!(
            load_vault_from_path(&vault).unwrap().data["events"][0]["minutes"],
            45
        );

        save_vault(
            vault.to_string_lossy().to_string(),
            vec![PlannedFile {
                relative_path: ".daylog/events.json".to_string(),
                content: "[]\n".to_string(),
            }],
            vec!["days/2026/08/2026-08-10.md".to_string()],
        )
        .unwrap();
        assert_eq!(
            load_vault_from_path(&vault).unwrap().data["events"],
            json!([])
        );
        assert!(!vault.join("days/2026/08/2026-08-10.md").exists());

        fs::remove_dir_all(vault).unwrap();
    }

    #[test]
    fn rejects_a_newer_vault_schema() {
        let vault = test_vault_path("newer-schema");
        fs::create_dir_all(&vault).unwrap();
        initialize_vault(&vault, "2026-08-10T00:00:00+08:00").unwrap();
        atomic_write(
            &vault.join(".daylog/app-settings.json"),
            "{\"schemaVersion\":2,\"lastOpenedAt\":\"2026-08-10T00:00:00Z\",\"appearance\":\"mist-paper\",\"projectColorScheme\":\"seasonal\"}\n",
        )
        .unwrap();

        let error = load_vault_from_path(&vault).err().unwrap();
        assert!(error.contains("版本 2"));
        fs::remove_dir_all(vault).unwrap();
    }

    #[test]
    fn migrates_legacy_settings_and_keeps_one_backup() {
        let vault = test_vault_path("legacy-settings");
        fs::create_dir_all(&vault).unwrap();
        initialize_vault(&vault, "2026-08-10T00:00:00+08:00").unwrap();
        let legacy = format!(
            "{{\"vaultPath\":{:?},\"lastOpenedAt\":\"2026-08-10T00:00:00Z\",\"appearance\":\"mist-paper\",\"projectColorScheme\":\"seasonal\"}}\n",
            vault.to_string_lossy()
        );
        atomic_write(&vault.join(".daylog/app-settings.json"), &legacy).unwrap();

        let loaded = load_vault_from_path(&vault).unwrap();
        assert_eq!(loaded.data["settings"]["schemaVersion"], 1);
        assert_eq!(
            loaded.data["settings"]["vaultPath"],
            vault.to_string_lossy().to_string()
        );

        let migrated: Value = serde_json::from_str(
            &fs::read_to_string(vault.join(".daylog/app-settings.json")).unwrap(),
        )
        .unwrap();
        assert_eq!(migrated["schemaVersion"], 1);
        assert!(migrated.get("vaultPath").is_none());
        assert!(vault.join(".daylog/app-settings.v0.backup.json").exists());

        fs::remove_dir_all(vault).unwrap();
    }

    #[test]
    fn rejects_paths_outside_the_vault() {
        assert!(!is_safe_relative_path(Path::new("../outside.json")));
        assert!(!is_safe_relative_path(Path::new("other/file.json")));
        assert!(is_safe_relative_path(Path::new(".daylog/events.json")));
        assert!(is_safe_relative_path(Path::new("days/2026/08/day.md")));
    }
}
