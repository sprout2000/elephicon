//! The menu. On macOS it is the app menu; on Windows the window has no menu
//! bar (as in the Electron version) and the menu is only shown as the context
//! menu. It is the context menu on macOS too.
//!
//! On Linux (Wayland), GTK cannot place a native context menu opened from a
//! command, so the window draws the context menu itself from
//! [`context_menu_model`] and runs the chosen item with [`handle_event`].

use serde::Serialize;
use tauri::menu::{
    AboutMetadata, CheckMenuItemBuilder, Menu, MenuBuilder, MenuItemBuilder, PredefinedMenuItem,
    SubmenuBuilder,
};
use tauri::{AppHandle, Emitter, Manager, Runtime, Wry};
use tauri_plugin_dialog::{DialogExt, FileDialogBuilder, MessageDialogKind};
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
    /// Show the about dialog (Linux, where the menu is drawn by the window).
    About,
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
        "about" => return MenuAction::About,
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

/// Builds the menu with check marks that match the settings.
pub fn build<R: Runtime>(
    app: &AppHandle<R>,
    settings: &Settings,
    t: &Translator,
) -> tauri::Result<Menu<R>> {
    let is_mac = cfg!(target_os = "macos");
    let check = |id: &str, label: String, checked: bool| {
        CheckMenuItemBuilder::with_id(id, label)
            .checked(checked)
            .build(app)
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
        .item(&check(
            "quality-low",
            t.t("Low"),
            settings.quality == Quality::Low,
        )?)
        .item(&check(
            "quality-medium",
            t.t("Medium"),
            settings.quality == Quality::Medium,
        )?)
        .item(&check(
            "quality-high",
            t.t("High"),
            settings.quality == Quality::High,
        )?)
        .build()?;
    let ico = SubmenuBuilder::new(app, "ICO")
        .item(&check(
            "bmp",
            t.t("Use BMP format for the smaller icon sizes"),
            settings.bmp,
        )?)
        .item(&check(
            "png",
            t.t("Use PNG for each icon in the created ICO file"),
            !settings.bmp,
        )?)
        .build()?;
    let destination = SubmenuBuilder::new(app, t.t("Destination"))
        .item(&check("desktop", t.t("Desktop"), settings.desktop)?)
        .item(&check(
            "current",
            t.t("Same folder as the input images"),
            !settings.desktop,
        )?)
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

    menu.item(&file).item(&settings_menu).item(&help).build()
}

/// An entry of the context menu drawn by the window on Linux.
#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum MenuNode {
    Submenu {
        label: String,
        items: Vec<MenuNode>,
    },
    Item {
        id: String,
        label: String,
    },
    Check {
        id: String,
        label: String,
        checked: bool,
    },
    Separator,
}

fn item(id: &str, label: String) -> MenuNode {
    MenuNode::Item {
        id: id.to_string(),
        label,
    }
}

fn check(id: &str, label: String, checked: bool) -> MenuNode {
    MenuNode::Check {
        id: id.to_string(),
        label,
        checked,
    }
}

/// The same items as the native context menu on Windows, with check marks
/// that match the settings. The ids are handled by [`apply`].
pub fn context_menu_model(settings: &Settings, t: &Translator) -> Vec<MenuNode> {
    vec![
        MenuNode::Submenu {
            label: t.t("File"),
            items: vec![
                item("open", t.t("Open...")),
                MenuNode::Separator,
                item("quit", t.t("Quit Elephicon")),
            ],
        },
        MenuNode::Submenu {
            label: t.t("Settings"),
            items: vec![
                MenuNode::Submenu {
                    label: t.t("Quality"),
                    items: vec![
                        check("quality-low", t.t("Low"), settings.quality == Quality::Low),
                        check(
                            "quality-medium",
                            t.t("Medium"),
                            settings.quality == Quality::Medium,
                        ),
                        check(
                            "quality-high",
                            t.t("High"),
                            settings.quality == Quality::High,
                        ),
                    ],
                },
                MenuNode::Submenu {
                    label: "ICO".to_string(),
                    items: vec![
                        check(
                            "bmp",
                            t.t("Use BMP format for the smaller icon sizes"),
                            settings.bmp,
                        ),
                        check(
                            "png",
                            t.t("Use PNG for each icon in the created ICO file"),
                            !settings.bmp,
                        ),
                    ],
                },
                MenuNode::Submenu {
                    label: t.t("Destination"),
                    items: vec![
                        check("desktop", t.t("Desktop"), settings.desktop),
                        check(
                            "current",
                            t.t("Same folder as the input images"),
                            !settings.desktop,
                        ),
                    ],
                },
            ],
        },
        MenuNode::Submenu {
            label: t.t("Help"),
            items: vec![
                item("about", t.t("About Elephicon")),
                MenuNode::Separator,
                item("support", t.t("Support URL...")),
            ],
        },
    ]
}

/// Keeps the menu for the context menu, and on macOS sets it as the app menu.
pub fn install(app: &AppHandle, menu: Menu<Wry>) -> tauri::Result<()> {
    if cfg!(target_os = "macos") {
        app.set_menu(menu.clone())?;
    }
    *app.state::<AppState>().menu.lock().unwrap() = Some(menu);

    Ok(())
}

/// Rebuilds the menu so that the check marks match the saved settings.
pub fn refresh(app: &AppHandle) {
    let state = app.state::<AppState>();
    let settings = state.settings.lock().unwrap().clone();
    let menu = build(app, &settings, &state.translator);

    if let Err(err) = menu.and_then(|menu| install(app, menu)) {
        eprintln!("Failed to update the menu: {err}");
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

fn show_about(app: &AppHandle) {
    let version = app.package_info().version.to_string();

    app.dialog()
        .message(format!(
            "Elephicon v{version}\n© 2020-present sprout2000\n{SUPPORT_URL}"
        ))
        .title("Elephicon")
        .kind(MessageDialogKind::Info)
        .show(|_| {});
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
        MenuAction::About => show_about(app),
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
    fn open_about_quit_and_support_do_not_change_the_settings() {
        let mut settings = Settings::default();

        assert_eq!(apply("open", &mut settings), MenuAction::Open);
        assert_eq!(apply("about", &mut settings), MenuAction::About);
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

    fn ids(nodes: &[MenuNode]) -> Vec<String> {
        nodes
            .iter()
            .flat_map(|node| match node {
                MenuNode::Submenu { items, .. } => ids(items),
                MenuNode::Item { id, .. } | MenuNode::Check { id, .. } => vec![id.clone()],
                MenuNode::Separator => vec![],
            })
            .collect()
    }

    fn checked(nodes: &[MenuNode]) -> Vec<String> {
        nodes
            .iter()
            .flat_map(|node| match node {
                MenuNode::Submenu { items, .. } => checked(items),
                MenuNode::Check {
                    id, checked: true, ..
                } => vec![id.clone()],
                _ => vec![],
            })
            .collect()
    }

    fn english() -> Translator {
        Translator::new(crate::i18n::resolve("en"))
    }

    #[test]
    fn the_model_has_every_item_of_the_native_menu() {
        let model = context_menu_model(&Settings::default(), &english());

        assert_eq!(
            ids(&model),
            [
                "open",
                "quit",
                "quality-low",
                "quality-medium",
                "quality-high",
                "bmp",
                "png",
                "desktop",
                "current",
                "about",
                "support",
            ]
        );
    }

    #[test]
    fn every_item_of_the_model_is_handled() {
        for id in ids(&context_menu_model(&Settings::default(), &english())) {
            let mut settings = Settings::default();

            assert_ne!(apply(&id, &mut settings), MenuAction::Nothing, "{id}");
        }
    }

    #[test]
    fn the_model_checks_the_current_settings() {
        let settings = Settings {
            desktop: false,
            quality: Quality::Medium,
            bmp: false,
        };

        assert_eq!(
            checked(&context_menu_model(&settings, &english())),
            ["quality-medium", "png", "current"]
        );
        assert_eq!(
            checked(&context_menu_model(&Settings::default(), &english())),
            ["quality-high", "bmp", "desktop"]
        );
    }

    #[test]
    fn the_model_is_translated() {
        let japanese = Translator::new(crate::i18n::resolve("ja"));
        let model = context_menu_model(&Settings::default(), &japanese);

        let MenuNode::Submenu { label, .. } = &model[0] else {
            panic!("the first entry is the File menu");
        };
        assert_eq!(label, "ファイル");
    }

    #[test]
    fn the_model_is_serialized_with_a_type() {
        let json =
            serde_json::to_value(context_menu_model(&Settings::default(), &english())).unwrap();

        assert_eq!(json[0]["type"], "submenu");
        assert_eq!(json[0]["label"], "File");
        assert_eq!(
            json[0]["items"][0],
            serde_json::json!({ "type": "item", "id": "open", "label": "Open..." })
        );
        assert_eq!(
            json[0]["items"][1],
            serde_json::json!({ "type": "separator" })
        );
        assert_eq!(json[1]["items"][0]["items"][2]["checked"], true);
    }
}
