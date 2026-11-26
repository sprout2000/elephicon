//! The commands called from the window.

use std::path::Path;

use tauri::{AppHandle, LogicalPosition, Manager, State, Window};

use crate::convert::{convert_file, ConvertOptions, ConvertResult, IconKind};
use crate::format;
use crate::menu;
use crate::AppState;

/// Returns `None` for a supported image, or the error message to show.
#[tauri::command]
pub fn check_image(path: String) -> Option<String> {
    format::check_image(Path::new(&path))
}

async fn convert(
    app: &AppHandle,
    state: &AppState,
    path: String,
    kind: IconKind,
) -> Result<ConvertResult, String> {
    let settings = state
        .settings
        .lock()
        .map_err(|err| err.to_string())?
        .clone();
    let desktop = if settings.desktop {
        let dir = app
            .path()
            .desktop_dir()
            .map_err(|err| format!("Could not find the desktop folder: {err}"))?;
        Some(dir)
    } else {
        None
    };

    tauri::async_runtime::spawn_blocking(move || {
        convert_file(
            Path::new(&path),
            &ConvertOptions {
                kind,
                quality: settings.quality,
                bmp: settings.bmp,
                output_dir: desktop.as_deref(),
            },
        )
    })
    .await
    .map_err(|err| err.to_string())?
}

#[tauri::command]
pub async fn make_ico(
    app: AppHandle,
    state: State<'_, AppState>,
    path: String,
) -> Result<ConvertResult, String> {
    convert(&app, &state, path, IconKind::Ico).await
}

#[tauri::command]
pub async fn make_icns(
    app: AppHandle,
    state: State<'_, AppState>,
    path: String,
) -> Result<ConvertResult, String> {
    convert(&app, &state, path, IconKind::Icns).await
}

/// Opens the file dialog and returns the chosen path, or `None` when canceled.
#[tauri::command]
pub async fn open_file_dialog(app: AppHandle) -> Option<String> {
    menu::file_dialog(&app)
        .blocking_pick_file()
        .and_then(|path| path.into_path().ok())
        .map(|path| path.to_string_lossy().into_owned())
}

/// Shows the menu as the context menu at `x`, `y` (the position of the
/// click in the window, in CSS pixels). Wayland needs the position and the
/// parent window, so the menu is not shown just "at the pointer".
#[tauri::command]
pub fn show_context_menu(
    state: State<'_, AppState>,
    window: Window,
    x: f64,
    y: f64,
) -> Result<(), String> {
    let menu = state.menu.lock().map_err(|err| err.to_string())?.clone();

    if let Some(menu) = menu {
        let (offset_x, offset_y) = content_offset(&window);
        window
            .popup_menu_at(&menu, LogicalPosition::new(x + offset_x, y + offset_y))
            .map_err(|err| err.to_string())?;
    }

    Ok(())
}

/// Where the contents start in the window. On Linux, GTK draws the title bar
/// (and the shadow) inside the window, and the menu is placed from the
/// window's corner, so the click position is moved by this much.
#[cfg(target_os = "linux")]
fn content_offset(window: &Window) -> (f64, f64) {
    use gtk::prelude::WidgetExt;

    let (Ok(gtk_window), Ok(contents)) = (window.gtk_window(), window.default_vbox()) else {
        return (0.0, 0.0);
    };

    contents
        .translate_coordinates(&gtk_window, 0, 0)
        .map(|(x, y)| (f64::from(x), f64::from(y)))
        .unwrap_or((0.0, 0.0))
}

/// On macOS and Windows the position is already relative to the contents.
#[cfg(not(target_os = "linux"))]
fn content_offset(_window: &Window) -> (f64, f64) {
    (0.0, 0.0)
}
