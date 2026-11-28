//! The commands called from the window.

use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};

use tauri::{AppHandle, LogicalPosition, Manager, State, Window};

use crate::convert::{convert_file, ConvertOptions, ConvertResult, IconKind};
use crate::format;
use crate::menu::{self, MenuNode};
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
/// click in the window, in CSS pixels).
#[tauri::command]
pub fn show_context_menu(
    state: State<'_, AppState>,
    window: Window,
    x: f64,
    y: f64,
) -> Result<(), String> {
    // Showing the menu waits until it closes, so another right click could
    // call this command again while the menu is still in use, which makes
    // muda panic. Such clicks are ignored.
    let Some(_open) = MenuOpen::begin(&state.context_menu_open) else {
        return Ok(());
    };
    let menu = state.menu.lock().map_err(|err| err.to_string())?.clone();

    if let Some(menu) = menu {
        window
            .popup_menu_at(&menu, LogicalPosition::new(x, y))
            .map_err(|err| err.to_string())?;
    }

    Ok(())
}

/// The context menu for the window to draw on Linux.
#[tauri::command]
pub fn get_context_menu(state: State<'_, AppState>) -> Result<Vec<MenuNode>, String> {
    let settings = state
        .settings
        .lock()
        .map_err(|err| err.to_string())?
        .clone();

    Ok(menu::context_menu_model(&settings, &state.translator))
}

/// Runs an item chosen in the context menu drawn by the window.
#[tauri::command]
pub fn run_menu_action(app: AppHandle, id: String) {
    menu::handle_event(&app, &id);
}

/// Marks the context menu as open until it is dropped.
struct MenuOpen<'a>(&'a AtomicBool);

impl<'a> MenuOpen<'a> {
    /// Returns `None` when the menu is already open.
    fn begin(flag: &'a AtomicBool) -> Option<Self> {
        if flag.swap(true, Ordering::SeqCst) {
            None
        } else {
            Some(Self(flag))
        }
    }
}

impl Drop for MenuOpen<'_> {
    fn drop(&mut self) {
        self.0.store(false, Ordering::SeqCst);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ignores_the_context_menu_while_it_is_open() {
        let flag = AtomicBool::new(false);

        let open = MenuOpen::begin(&flag);
        assert!(open.is_some());
        assert!(MenuOpen::begin(&flag).is_none());

        drop(open);
        assert!(!flag.load(Ordering::SeqCst));
        assert!(MenuOpen::begin(&flag).is_some());
    }
}
