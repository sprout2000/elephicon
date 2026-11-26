mod commands;
mod convert;
mod format;
mod i18n;
mod menu;
mod settings;

use std::path::PathBuf;
use std::sync::Mutex;

use tauri::menu::Menu;
use tauri::{Manager, Wry};
use tauri_plugin_window_state::StateFlags;

use crate::i18n::Translator;
use crate::settings::Settings;

/// The state shared by the menu and the commands.
pub struct AppState {
    pub settings: Mutex<Settings>,
    pub settings_path: PathBuf,
    /// Translates the menu into the system language.
    pub translator: Translator,
    /// The menu shown as the context menu (and as the app menu on macOS).
    pub menu: Mutex<Option<Menu<Wry>>>,
}

pub fn run() {
    let builder = tauri::Builder::default();

    // Only one Elephicon runs at a time; macOS already does this for apps.
    #[cfg(not(target_os = "macos"))]
    let builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.unminimize();
            let _ = window.set_focus();
        }
    }));

    builder
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(StateFlags::POSITION)
                .build(),
        )
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let settings_path = app.path().app_config_dir()?.join("settings.json");
            let settings = Settings::load(&settings_path);
            let locale = sys_locale::get_locale().unwrap_or_default();
            let translator = Translator::new(i18n::resolve(&locale));
            let menu = menu::build(app.handle(), &settings, &translator)?;
            app.manage(AppState {
                settings: Mutex::new(settings),
                settings_path,
                translator,
                menu: Mutex::new(None),
            });
            menu::install(app.handle(), menu)?;

            Ok(())
        })
        .on_menu_event(|app, event| menu::handle_event(app, event.id().as_ref()))
        .invoke_handler(tauri::generate_handler![
            commands::check_image,
            commands::make_ico,
            commands::make_icns,
            commands::open_file_dialog,
            commands::show_context_menu,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Elephicon");
}
