//! The settings chosen in the menu, saved as JSON in the app config folder.

use std::fs;
use std::io;
use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::convert::Quality;

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(default)]
pub struct Settings {
    /// Save icons on the desktop instead of next to the input file.
    pub desktop: bool,
    pub quality: Quality,
    /// Store the ICO images smaller than 256x256 as BMP.
    pub bmp: bool,
    /// The language code of the menu, or `None` to follow the system.
    pub language: Option<String>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            desktop: true,
            quality: Quality::High,
            bmp: true,
            language: None,
        }
    }
}

impl Settings {
    /// Loads the settings, or returns the defaults when the file is missing
    /// or broken.
    pub fn load(path: &Path) -> Self {
        fs::read_to_string(path)
            .ok()
            .and_then(|json| serde_json::from_str(&json).ok())
            .unwrap_or_default()
    }

    pub fn save(&self, path: &Path) -> io::Result<()> {
        if let Some(dir) = path.parent() {
            fs::create_dir_all(dir)?;
        }
        let json = serde_json::to_string_pretty(self).map_err(io::Error::other)?;

        fs::write(path, json)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn has_the_same_defaults_as_the_electron_version() {
        let settings = Settings::default();

        assert!(settings.desktop);
        assert_eq!(settings.quality, Quality::High);
        assert!(settings.bmp);
        assert_eq!(settings.language, None);
    }

    #[test]
    fn saves_and_loads_the_settings() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("config").join("settings.json");
        let settings = Settings {
            desktop: false,
            quality: Quality::Low,
            bmp: false,
            language: Some("ja".to_string()),
        };

        settings.save(&path).unwrap();

        assert_eq!(Settings::load(&path), settings);
    }

    #[test]
    fn uses_the_defaults_for_a_missing_or_broken_file() {
        let dir = tempfile::tempdir().unwrap();
        let broken = dir.path().join("broken.json");
        fs::write(&broken, "{ not json").unwrap();

        assert_eq!(
            Settings::load(&dir.path().join("missing.json")),
            Settings::default()
        );
        assert_eq!(Settings::load(&broken), Settings::default());
    }

    #[test]
    fn fills_in_missing_keys_with_the_defaults() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("settings.json");
        fs::write(&path, r#"{ "quality": "medium" }"#).unwrap();

        assert_eq!(
            Settings::load(&path),
            Settings {
                quality: Quality::Medium,
                ..Settings::default()
            }
        );
    }
}
