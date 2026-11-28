//! The menu. On macOS it is the app menu and on Linux the menu bar of the
//! window. On Windows the window has no menu bar (as in the Electron version)
//! and the menu is only shown as the context menu. It is the context menu on
//! macOS too; Linux has no context menu, since GTK cannot place one opened
//! from a command on Wayland.

use tauri::menu::{
    AboutMetadata, CheckMenuItem, CheckMenuItemBuilder, Menu, MenuBuilder, MenuItemBuilder,
    PredefinedMenuItem, SubmenuBuilder,
};
use tauri::{AppHandle, Emitter, Manager, Runtime, Wry};
use tauri_plugin_dialog::{DialogExt, FileDialogBuilder};
use tauri_plugin_opener::OpenerExt;

use crate::convert::Quality;
use crate::format::InputFormat;
use crate::i18n::Translator;
use crate::settings::Settings;
use crate::AppState;

pub const SUPPORT_URL: &str = "https://github.com/sprout2000/elephicon/#readme";

/// The event sent to the window with the path chosen from File > Open.
pub const MENU_OPEN_EVENT: &str = "menu-open";

/// What to do after a menu item is clicked.
#[derive(Debug, PartialEq, Eq)]
pub enum MenuAction {
    Open,
    /// Quit on Windows, by closing the window.
    Quit,
    Support,
    /// The settings were updated; save them and refresh the check marks.
    SettingsChanged,
    Nothing,
}

/// Applies a click on the menu item `id` to the settings.
///
/// Clicking a check item toggles its check mark, so the menu is refreshed
/// even when the setting stays the same.
pub fn apply(id: &str, settings: &mut Settings) -> MenuAction {
    match id {
        "open" => return MenuAction::Open,
        "quit" => return MenuAction::Quit,
        "support" => return MenuAction::Support,
        "quality-low" => settings.quality = Quality::Low,
        "quality-medium" => settings.quality = Quality::Medium,
        "quality-high" => settings.quality = Quality::High,
        "bmp" => settings.bmp = true,
        "png" => settings.bmp = false,
        "desktop" => settings.desktop = true,
        "current" => settings.desktop = false,
        _ => return MenuAction::Nothing,
    }

    MenuAction::SettingsChanged
}

fn about_metadata<R: Runtime>(app: &AppHandle<R>) -> AboutMetadata<'static> {
    AboutMetadata {
        name: Some("Elephicon".to_string()),
        version: Some(app.package_info().version.to_string()),
        copyright: Some("© 2020-present sprout2000".to_string()),
        website: Some(SUPPORT_URL.to_string()),
        ..Default::default()
    }
}

/// Whether the check item `id` is checked for the settings, or `None` when
/// `id` is not a check item.
pub fn is_checked(id: &str, settings: &Settings) -> Option<bool> {
    match id {
        "quality-low" => Some(settings.quality == Quality::Low),
        "quality-medium" => Some(settings.quality == Quality::Medium),
        "quality-high" => Some(settings.quality == Quality::High),
        "bmp" => Some(settings.bmp),
        "png" => Some(!settings.bmp),
        "desktop" => Some(settings.desktop),
        "current" => Some(!settings.desktop),
        _ => None,
    }
}

/// The menu and its check items, kept to update the check marks.
pub struct BuiltMenu<R: Runtime> {
    pub menu: Menu<R>,
    pub checks: Vec<CheckMenuItem<R>>,
}

/// Builds the menu with check marks that match the settings.
pub fn build<R: Runtime>(
    app: &AppHandle<R>,
    settings: &Settings,
    t: &Translator,
) -> tauri::Result<BuiltMenu<R>> {
    let is_mac = cfg!(target_os = "macos");
    let mut checks = Vec::new();
    let mut check = |id: &str, label: String| -> tauri::Result<CheckMenuItem<R>> {
        let item = CheckMenuItemBuilder::with_id(id, label)
            .checked(is_checked(id, settings).unwrap_or(false))
            .build(app)?;
        checks.push(item.clone());
        Ok(item)
    };
    let about = PredefinedMenuItem::about(
        app,
        Some(t.t("About Elephicon").as_str()),
        Some(about_metadata(app)),
    )?;

    let open = MenuItemBuilder::with_id("open", t.t("Open..."))
        .accelerator("CmdOrCtrl+O")
        .build(app)?;
    let file = SubmenuBuilder::new(app, t.t("File"))
        .item(&open)
        .separator();
    let file = if is_mac {
        file.item(&PredefinedMenuItem::close_window(
            app,
            Some(t.t("Close").as_str()),
        )?)
    } else {
        // Closing the window lets WebView2 shut down before the app exits
        file.item(&MenuItemBuilder::with_id("quit", t.t("Quit Elephicon")).build(app)?)
    }
    .build()?;

    let quality = SubmenuBuilder::new(app, t.t("Quality"))
        .item(&check("quality-low", t.t("Low"))?)
        .item(&check("quality-medium", t.t("Medium"))?)
        .item(&check("quality-high", t.t("High"))?)
        .build()?;
    let ico = SubmenuBuilder::new(app, "ICO")
        .item(&check(
            "bmp",
            t.t("Use BMP format for the smaller icon sizes"),
        )?)
        .item(&check(
            "png",
            t.t("Use PNG for each icon in the created ICO file"),
        )?)
        .build()?;
    let destination = SubmenuBuilder::new(app, t.t("Destination"))
        .item(&check("desktop", t.t("Desktop"))?)
        .item(&check("current", t.t("Same folder as the input images"))?)
        .build()?;
    let settings_menu = SubmenuBuilder::new(app, t.t("Settings"))
        .item(&quality)
        .item(&ico)
        .item(&destination)
        .build()?;

    let support = MenuItemBuilder::with_id("support", t.t("Support URL...")).build(app)?;
    let mut help = SubmenuBuilder::new(app, t.t("Help"));
    if !is_mac {
        help = help.item(&about).separator();
    }
    let help = help.item(&support).build()?;

    let mut menu = MenuBuilder::new(app);
    if is_mac {
        let app_menu = SubmenuBuilder::new(app, "Elephicon")
            .item(&about)
            .separator()
            .item(&PredefinedMenuItem::hide(
                app,
                Some(t.t("Hide Elephicon").as_str()),
            )?)
            .item(&PredefinedMenuItem::hide_others(
                app,
                Some(t.t("Hide Others").as_str()),
            )?)
            .item(&PredefinedMenuItem::show_all(
                app,
                Some(t.t("Show All").as_str()),
            )?)
            .separator()
            .item(&PredefinedMenuItem::quit(
                app,
                Some(t.t("Quit Elephicon").as_str()),
            )?)
            .build()?;
        menu = menu.item(&app_menu);
    }

    let menu = menu.item(&file).item(&settings_menu).item(&help).build()?;

    Ok(BuiltMenu { menu, checks })
}

/// Keeps the menu for the context menu, and on macOS and Linux sets it as
/// the app menu (the menu bar of the window on Linux).
pub fn install(app: &AppHandle, built: BuiltMenu<Wry>) -> tauri::Result<()> {
    if cfg!(any(target_os = "macos", target_os = "linux")) {
        app.set_menu(built.menu.clone())?;
    }
    let state = app.state::<AppState>();
    *state.menu.lock().unwrap() = Some(built.menu);
    *state.checks.lock().unwrap() = built.checks;

    Ok(())
}

/// Updates the check marks to match the saved settings. The menu is not
/// built again, which would also reinstall its keyboard shortcuts.
pub fn refresh(app: &AppHandle) {
    let state = app.state::<AppState>();
    let settings = state.settings.lock().unwrap().clone();

    for item in state.checks.lock().unwrap().iter() {
        let Some(checked) = is_checked(item.id().as_ref(), &settings) else {
            continue;
        };
        if let Err(err) = item.set_checked(checked) {
            eprintln!("Failed to update the check mark: {err}");
        }
    }
}

/// The dialog for choosing an image, opened in the Pictures folder.
pub fn file_dialog<R: Runtime>(app: &AppHandle<R>) -> FileDialogBuilder<R> {
    let state = app.state::<AppState>();
    let dialog = app
        .dialog()
        .file()
        .set_title(state.translator.t("Select an Image"))
        .add_filter("Images", &InputFormat::all_extensions());

    match app.path().picture_dir() {
        Ok(dir) => dialog.set_directory(dir),
        Err(_) => dialog,
    }
}

fn open_from_menu<R: Runtime>(app: &AppHandle<R>) {
    let handle = app.clone();

    file_dialog(app).pick_file(move |path| {
        let Some(path) = path.and_then(|path| path.into_path().ok()) else {
            return;
        };
        if let Err(err) = handle.emit(MENU_OPEN_EVENT, path.to_string_lossy().into_owned()) {
            eprintln!("Failed to send the file to the window: {err}");
        }
    });
}

pub fn handle_event(app: &AppHandle, id: &str) {
    let state = app.state::<AppState>();
    let action = {
        let mut settings = state.settings.lock().unwrap();
        let action = apply(id, &mut settings);

        if action == MenuAction::SettingsChanged {
            if let Err(err) = settings.save(&state.settings_path) {
                eprintln!("Failed to save the settings: {err}");
            }
        }
        action
    };

    match action {
        MenuAction::Open => open_from_menu(app),
        MenuAction::Quit => {
            if let Some(window) = app.get_webview_window("main") {
                if let Err(err) = window.close() {
                    eprintln!("Failed to close the window: {err}");
                }
            }
        }
        MenuAction::Support => {
            if let Err(err) = app.opener().open_url(SUPPORT_URL, None::<&str>) {
                eprintln!("Failed to open the support page: {err}");
            }
        }
        MenuAction::SettingsChanged => refresh(app),
        MenuAction::Nothing => {}
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn open_quit_and_support_do_not_change_the_settings() {
        let mut settings = Settings::default();

        assert_eq!(apply("open", &mut settings), MenuAction::Open);
        assert_eq!(apply("quit", &mut settings), MenuAction::Quit);
        assert_eq!(apply("support", &mut settings), MenuAction::Support);
        assert_eq!(settings, Settings::default());
    }

    #[test]
    fn changes_the_quality() {
        let mut settings = Settings::default();

        assert_eq!(
            apply("quality-low", &mut settings),
            MenuAction::SettingsChanged
        );
        assert_eq!(settings.quality, Quality::Low);
        apply("quality-medium", &mut settings);
        assert_eq!(settings.quality, Quality::Medium);
        apply("quality-high", &mut settings);
        assert_eq!(settings.quality, Quality::High);
    }

    #[test]
    fn changes_the_ico_format_and_destination() {
        let mut settings = Settings::default();

        apply("png", &mut settings);
        assert!(!settings.bmp);
        apply("bmp", &mut settings);
        assert!(settings.bmp);

        apply("current", &mut settings);
        assert!(!settings.desktop);
        apply("desktop", &mut settings);
        assert!(settings.desktop);
    }

    #[test]
    fn refreshes_even_when_the_setting_stays_the_same() {
        let mut settings = Settings::default();

        assert_eq!(
            apply("quality-high", &mut settings),
            MenuAction::SettingsChanged
        );
        assert_eq!(settings, Settings::default());
    }

    #[test]
    fn ignores_unknown_items() {
        let mut settings = Settings::default();

        assert_eq!(apply("language-ja", &mut settings), MenuAction::Nothing);
        assert_eq!(apply("unknown", &mut settings), MenuAction::Nothing);
        assert_eq!(settings, Settings::default());
    }

    #[test]
    fn checks_the_items_that_match_the_settings() {
        let settings = Settings {
            desktop: false,
            quality: Quality::Medium,
            bmp: false,
        };
        let checked: Vec<&str> = [
            "quality-low",
            "quality-medium",
            "quality-high",
            "bmp",
            "png",
            "desktop",
            "current",
        ]
        .into_iter()
        .filter(|id| is_checked(id, &settings) == Some(true))
        .collect();

        assert_eq!(checked, ["quality-medium", "png", "current"]);
    }

    #[test]
    fn checks_one_item_in_each_group() {
        for settings in [
            Settings::default(),
            Settings {
                desktop: false,
                quality: Quality::Low,
                bmp: false,
            },
        ] {
            for group in [
                &["quality-low", "quality-medium", "quality-high"][..],
                &["bmp", "png"],
                &["desktop", "current"],
            ] {
                let count = group
                    .iter()
                    .filter(|id| is_checked(id, &settings) == Some(true))
                    .count();
                assert_eq!(count, 1, "{group:?}");
            }
        }
    }

    #[test]
    fn is_checked_ignores_other_items() {
        for id in ["open", "quit", "support", "unknown"] {
            assert_eq!(is_checked(id, &Settings::default()), None, "{id}");
        }
    }

    #[test]
    fn every_check_item_changes_the_settings() {
        for id in [
            "quality-low",
            "quality-medium",
            "quality-high",
            "bmp",
            "png",
            "desktop",
            "current",
        ] {
            let mut settings = Settings::default();

            assert_eq!(apply(id, &mut settings), MenuAction::SettingsChanged);
            assert_eq!(is_checked(id, &settings), Some(true), "{id}");
        }
    }
}
