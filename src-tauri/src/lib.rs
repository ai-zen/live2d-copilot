use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WebviewUrl, WebviewWindowBuilder,
};

mod gaze;
mod mouse_through;

const DESKTOP_PET_LABEL: &str = "desktop-pet";
const LOADING_LABEL: &str = "loading";

// ============================================================
// Tauri Commands
// ============================================================

/// 渲染进程通知：Live2D 加载完成，关闭加载窗口
#[tauri::command]
fn close_loading_window(app: tauri::AppHandle) {
    if let Some(win) = app.get_webview_window(LOADING_LABEL) {
        let _ = win.close();
    }
}

/// 打开模型管理窗口
#[tauri::command]
fn open_models_window(app: tauri::AppHandle) {
    create_or_show_window(&app, "models", "/models-window", "Models", 900.0, 640.0);
}

/// 打开设置窗口
#[tauri::command]
fn open_settings_window(app: tauri::AppHandle) {
    create_or_show_window(&app, "settings", "/settings-window", "Settings", 560.0, 480.0);
}

/// 打开插件窗口
#[tauri::command]
fn open_plugins_window(app: tauri::AppHandle) {
    create_or_show_window(&app, "plugins", "/plugins-window", "Plugins", 900.0, 640.0);
}

/// 窗口拖动（使用 Tauri 原生 API）
#[tauri::command]
fn drag_window(window: tauri::WebviewWindow) {
    let _ = window.start_dragging();
}

/// 退出应用
#[tauri::command]
fn quit_app(app: tauri::AppHandle) {
    app.exit(0);
}

// ============================================================
// Window Helpers
// ============================================================

/// 创建或聚焦一个普通窗口
fn create_or_show_window(
    app: &tauri::AppHandle,
    label: &str,
    url: &str,
    title: &str,
    width: f64,
    height: f64,
) {
    if let Some(win) = app.get_webview_window(label) {
        let _ = win.show();
        let _ = win.set_focus();
        return;
    }

    let win = WebviewWindowBuilder::new(app, label, WebviewUrl::App(url.into()))
        .title(title)
        .inner_size(width, height)
        .resizable(true)
        .minimizable(true)
        .maximizable(true)
        .decorations(true)
        .center()
        .build();

    if let Err(e) = win {
        eprintln!("Failed to create {} window: {}", label, e);
    }
}

/// 创建加载窗口（小窗口，居中）
fn create_loading_window(app: &tauri::AppHandle) {
    let win = WebviewWindowBuilder::new(app, LOADING_LABEL, WebviewUrl::App("/loading".into()))
        .title("Live2D Copilot")
        .inner_size(320.0, 180.0)
        .resizable(false)
        .center()
        .visible(true)
        .build();

    if let Err(e) = win {
        eprintln!("Failed to create loading window: {}", e);
    }
}

/// 创建桌宠主窗口（透明无边框）
fn create_desktop_pet_window(app: &tauri::AppHandle) {
    let win = WebviewWindowBuilder::new(
        app,
        DESKTOP_PET_LABEL,
        WebviewUrl::App("/desktop-pet".into()),
    )
    .title("Live2D Copilot")
    .inner_size(500.0, 600.0)
    .resizable(false)
    .decorations(false)
    .transparent(true)
    .always_on_top(true)
    .shadow(false)
    .center()
    .visible(true)
    .build();

    match win {
        Ok(w) => {
            #[cfg(debug_assertions)]
            {
                let _ = w.open_devtools();
            }
            gaze::start_gaze_tracking(w.clone());
            mouse_through::enable_mouse_through(w);
        }
        Err(e) => {
            eprintln!("Failed to create desktop pet window: {}", e);
        }
    }
}

// ============================================================
// System Tray
// ============================================================

fn create_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    let show = MenuItemBuilder::with_id("show", "Show / Hide").build(app)?;
    let models = MenuItemBuilder::with_id("models", "Models").build(app)?;
    let settings = MenuItemBuilder::with_id("settings", "Settings").build(app)?;
    let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;

    let menu = MenuBuilder::new(app)
        .item(&show)
        .item(&models)
        .item(&settings)
        .separator()
        .item(&quit)
        .build()?;

    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Live2D Copilot")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "show" => {
                if let Some(win) = app.get_webview_window(DESKTOP_PET_LABEL) {
                    if win.is_visible().unwrap_or(false) {
                        let _ = win.hide();
                    } else {
                        let _ = win.show();
                    }
                }
            }
            "models" => {
                open_models_window(app.clone());
            }
            "settings" => {
                open_settings_window(app.clone());
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(win) = app.get_webview_window(DESKTOP_PET_LABEL) {
                    if win.is_visible().unwrap_or(false) {
                        let _ = win.hide();
                    } else {
                        let _ = win.show();
                        let _ = win.set_focus();
                    }
                }
            }
        })
        .build(app)?;

    Ok(())
}

// ============================================================
// App Entry
// ============================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            close_loading_window,
            open_models_window,
            open_settings_window,
            open_plugins_window,
            quit_app,
            drag_window,
        ])
        .setup(|app| {
            // 1. 先显示加载窗口
            create_loading_window(app.handle());

            // 2. 创建桌宠主窗口（隐藏状态）
            create_desktop_pet_window(app.handle());

            // 3. 系统托盘
            let _ = create_tray(app.handle());

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
