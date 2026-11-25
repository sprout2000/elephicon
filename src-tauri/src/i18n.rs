//! The languages of the app menu.

use std::collections::HashMap;

pub struct Language {
    /// The language code saved in the settings.
    pub code: &'static str,
    /// The name shown in the Language menu.
    pub label: &'static str,
    /// The contents of `locales/{code}.json`.
    pub json: &'static str,
    /// Regional codes that use the same translation (e.g. "de-AT"), following
    /// https://source.chromium.org/chromium/chromium/src/+/main:ui/base/l10n/l10n_util.cc
    pub aliases: &'static [&'static str],
}

macro_rules! locale {
    ($file:literal) => {
        include_str!(concat!("../locales/", $file))
    };
}

/// The languages Elephicon is translated into, in the order of the Language
/// menu. To add a language, create locales/{code}.json and add it here.
/// Credits for each translation are kept next to it.
pub const LANGUAGES: &[Language] = &[
    // https://github.com/sprout2000/elephicon/pull/241 by thepoladov13
    Language {
        code: "az",
        label: "Azərbaycan",
        json: locale!("az.json"),
        aliases: &[],
    },
    // https://github.com/sprout2000/elephicon/pull/108 by DrDeee
    Language {
        code: "de",
        label: "Deutsch",
        json: locale!("de.json"),
        aliases: &["de-AT", "de-CH", "de-DE", "de-LI"],
    },
    Language {
        code: "en",
        label: "English",
        json: locale!("en.json"),
        aliases: &[
            "en-AU", "en-CA", "en-GB", "en-IN", "en-NZ", "en-US", "en-ZA",
        ],
    },
    // https://github.com/sprout2000/elephicon/pull/240 by kant
    Language {
        code: "es",
        label: "Español",
        json: locale!("es.json"),
        aliases: &[
            "es-419", "es-AR", "es-CL", "es-CO", "es-CR", "es-ES", "es-HN", "es-MX", "es-PE",
            "es-US", "es-UY", "es-VE",
        ],
    },
    // https://github.com/sprout2000/elephicon/issues/243 by logounet
    Language {
        code: "fr",
        label: "Français",
        json: locale!("fr.json"),
        aliases: &["fr-CA", "fr-CH", "fr-FR"],
    },
    // https://github.com/sprout2000/elephicon/pull/140 by LightwithoutLisonlyight
    Language {
        code: "it",
        label: "Italiano",
        json: locale!("it.json"),
        aliases: &["it-CH", "it-IT"],
    },
    Language {
        code: "ja",
        label: "日本語",
        json: locale!("ja.json"),
        aliases: &[],
    },
    // https://github.com/sprout2000/elephicon/pull/163 by aerocyber
    Language {
        code: "ml",
        label: "Malayalam",
        json: locale!("ml.json"),
        aliases: &[],
    },
    // https://github.com/sprout2000/elephicon/pull/136 by godrix
    Language {
        code: "pt",
        label: "Português",
        json: locale!("pt.json"),
        aliases: &["pt-BR", "pt-PT"],
    },
    // https://github.com/sprout2000/elephicon/pull/135 by kitt3911
    Language {
        code: "ru",
        label: "Русский",
        json: locale!("ru.json"),
        aliases: &[],
    },
    // https://github.com/sprout2000/elephicon/pull/159 by umitseyhan75
    Language {
        code: "tr",
        label: "Türkçe",
        json: locale!("tr.json"),
        aliases: &[],
    },
    // https://github.com/sprout2000/elephicon/pull/223 by whitebear60
    Language {
        code: "uk",
        label: "Українська",
        json: locale!("uk.json"),
        aliases: &[],
    },
    // https://github.com/sprout2000/elephicon/pull/151 by ArcherGu
    Language {
        code: "zh-CN",
        label: "简体中文",
        json: locale!("zh_cn.json"),
        aliases: &["zh"],
    },
];

const FALLBACK_CODE: &str = "en";

fn find(code: &str) -> Option<&'static Language> {
    LANGUAGES.iter().find(|language| {
        language.code.eq_ignore_ascii_case(code)
            || language
                .aliases
                .iter()
                .any(|alias| alias.eq_ignore_ascii_case(code))
    })
}

/// Finds the language for a locale such as "ja", "de-AT" or "ja_JP". An
/// unlisted regional code falls back to its base language, and an unknown
/// language falls back to English.
pub fn resolve(locale: &str) -> &'static Language {
    let locale = locale.trim().replace('_', "-");
    let base = locale.split('-').next().unwrap_or_default();

    find(&locale)
        .or_else(|| find(base))
        .or_else(|| find(FALLBACK_CODE))
        .expect("English is always available")
}

fn parse(json: &str) -> HashMap<String, String> {
    serde_json::from_str(json).expect("locale files are valid JSON")
}

/// Translates the menu labels, falling back to English and then to the key.
pub struct Translator {
    strings: HashMap<String, String>,
    fallback: HashMap<String, String>,
}

impl Translator {
    pub fn new(language: &Language) -> Self {
        let fallback = resolve(FALLBACK_CODE);

        Self {
            strings: parse(language.json),
            fallback: parse(fallback.json),
        }
    }

    pub fn t(&self, key: &str) -> String {
        self.strings
            .get(key)
            .or_else(|| self.fallback.get(key))
            .cloned()
            .unwrap_or_else(|| key.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;
    use std::fs;
    use std::path::Path;

    fn keys(json: &str) -> Vec<String> {
        let mut keys: Vec<String> = parse(json).into_keys().collect();
        keys.sort();
        keys
    }

    #[test]
    fn has_no_duplicated_codes_including_the_regional_ones() {
        let codes: Vec<String> = LANGUAGES
            .iter()
            .flat_map(|language| {
                std::iter::once(language.code)
                    .chain(language.aliases.iter().copied())
                    .map(str::to_ascii_lowercase)
            })
            .collect();
        let unique: HashSet<&String> = codes.iter().collect();

        assert_eq!(unique.len(), codes.len());
    }

    #[test]
    fn uses_each_locale_file_exactly_once() {
        let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("locales");
        let files: Vec<String> = fs::read_dir(dir)
            .unwrap()
            .map(|entry| entry.unwrap().path())
            .filter(|path| path.extension().is_some_and(|ext| ext == "json"))
            .map(|path| fs::read_to_string(path).unwrap())
            .collect();

        // adding a file to locales/ without adding it to LANGUAGES fails here
        assert_eq!(files.len(), LANGUAGES.len());
        for json in &files {
            let count = LANGUAGES.iter().filter(|l| l.json == json.as_str()).count();
            assert_eq!(count, 1, "{json}");
        }
    }

    #[test]
    fn every_locale_has_the_same_keys_as_english() {
        let english = keys(resolve("en").json);

        for language in LANGUAGES {
            assert_eq!(keys(language.json), english, "{}", language.code);
        }
    }

    #[test]
    fn every_translation_and_label_is_filled_in() {
        for language in LANGUAGES {
            assert!(!language.label.trim().is_empty(), "{}", language.code);
            for (key, value) in parse(language.json) {
                assert!(!value.trim().is_empty(), "{}: {key}", language.code);
            }
        }
    }

    #[test]
    fn resolves_codes_and_regional_codes() {
        assert_eq!(resolve("ja").code, "ja");
        assert_eq!(resolve("de-AT").code, "de");
        assert_eq!(resolve("es-419").code, "es");
        assert_eq!(resolve("pt-BR").code, "pt");
        assert_eq!(resolve("zh").code, "zh-CN");
        assert_eq!(resolve("zh-CN").code, "zh-CN");
        assert_eq!(resolve("en-us").code, "en");
    }

    #[test]
    fn falls_back_to_the_base_language_and_then_english() {
        assert_eq!(resolve("ja-JP").code, "ja");
        assert_eq!(resolve("ja_JP").code, "ja");
        assert_eq!(resolve("zh-Hans-CN").code, "zh-CN");
        assert_eq!(resolve("xx").code, "en");
        assert_eq!(resolve("").code, "en");
    }

    #[test]
    fn translates_with_fallbacks() {
        let japanese = Translator::new(resolve("ja"));

        assert_eq!(japanese.t("File"), "ファイル");
        assert_eq!(japanese.t("No such key"), "No such key");
        assert_eq!(Translator::new(resolve("en")).t("File"), "File");
    }
}
