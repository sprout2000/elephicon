//! The commands called from the window.

use std::path::Path;

use tauri::{AppHandle, Manager, State, Window};

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

/// Shows the app menu as the context menu.
#[tauri::command]
pub fn show_context_menu(app: AppHandle, window: Window) -> Result<(), String> {
    if let Some(menu) = app.menu() {
        window.popup_menu(&menu).map_err(|err| err.to_string())?;
    }

    Ok(())
}
