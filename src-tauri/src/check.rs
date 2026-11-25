//! Checks that a file really is a PNG image before converting it.

use std::fs::File;
use std::io::{self, Read};
use std::path::Path;

/// The 8 bytes that every PNG file starts with.
pub const PNG_SIGNATURE: [u8; 8] = [0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a];

pub const SPOOFED_MESSAGE: &str = "This file has a .png extension, but it is not a PNG image.";
pub const READ_ERROR_MESSAGE: &str = "Could not read the file.";

/// Returns whether the file starts with the PNG signature.
pub fn has_png_signature(path: &Path) -> io::Result<bool> {
    let mut file = File::open(path)?;
    let mut buf = [0u8; PNG_SIGNATURE.len()];
    let mut filled = 0;

    while filled < buf.len() {
        match file.read(&mut buf[filled..])? {
            0 => break,
            n => filled += n,
        }
    }

    Ok(filled == buf.len() && buf == PNG_SIGNATURE)
}

/// Returns `None` for a real PNG file, or the error message to show in the
/// window. The message is always in English.
pub fn check_png(path: &Path) -> Option<String> {
    match has_png_signature(path) {
        Ok(true) => None,
        Ok(false) => Some(not_png_message(path)),
        Err(_) => Some(READ_ERROR_MESSAGE.to_string()),
    }
}

fn not_png_message(path: &Path) -> String {
    match mime_guess::from_path(path).first() {
        Some(mime) if mime == mime_guess::mime::IMAGE_PNG => SPOOFED_MESSAGE.to_string(),
        Some(mime) => format!("Unsupported format: {mime}"),
        None => "Unsupported format: Unknown".to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    const JPEG_DATA: [u8; 10] = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, b'J', b'F', b'I', b'F'];

    fn write(dir: &Path, name: &str, data: &[u8]) -> std::path::PathBuf {
        let path = dir.join(name);
        fs::write(&path, data).unwrap();
        path
    }

    fn png_data() -> Vec<u8> {
        let mut data = PNG_SIGNATURE.to_vec();
        data.extend_from_slice(b"IHDR...");
        data
    }

    #[test]
    fn detects_the_png_signature() {
        let dir = tempfile::tempdir().unwrap();

        assert!(has_png_signature(&write(dir.path(), "real.png", &png_data())).unwrap());
        assert!(has_png_signature(&write(dir.path(), "header.png", &PNG_SIGNATURE)).unwrap());
    }

    #[test]
    fn rejects_other_and_short_files() {
        let dir = tempfile::tempdir().unwrap();

        assert!(!has_png_signature(&write(dir.path(), "photo.jpg", &JPEG_DATA)).unwrap());
        assert!(!has_png_signature(&write(dir.path(), "short.png", &PNG_SIGNATURE[..4])).unwrap());
        assert!(!has_png_signature(&write(dir.path(), "empty.png", &[])).unwrap());
    }

    #[test]
    fn fails_for_a_missing_file() {
        let dir = tempfile::tempdir().unwrap();

        assert!(has_png_signature(&dir.path().join("missing.png")).is_err());
    }

    #[test]
    fn accepts_png_data_whatever_the_extension() {
        let dir = tempfile::tempdir().unwrap();

        assert_eq!(check_png(&write(dir.path(), "ok.png", &png_data())), None);
        assert_eq!(
            check_png(&write(dir.path(), "renamed.jpg", &png_data())),
            None
        );
    }

    #[test]
    fn detects_a_spoofed_extension() {
        let dir = tempfile::tempdir().unwrap();

        assert_eq!(
            check_png(&write(dir.path(), "spoofed.png", &JPEG_DATA)).as_deref(),
            Some(SPOOFED_MESSAGE)
        );
        assert_eq!(
            check_png(&write(dir.path(), "SPOOFED.PNG", &JPEG_DATA)).as_deref(),
            Some(SPOOFED_MESSAGE)
        );
    }

    #[test]
    fn reports_the_format_guessed_from_the_extension() {
        let dir = tempfile::tempdir().unwrap();

        assert_eq!(
            check_png(&write(dir.path(), "photo.jpeg", &JPEG_DATA)).as_deref(),
            Some("Unsupported format: image/jpeg")
        );
        assert_eq!(
            check_png(&write(dir.path(), "no-extension", &JPEG_DATA)).as_deref(),
            Some("Unsupported format: Unknown")
        );
    }

    #[test]
    fn reports_read_errors() {
        let dir = tempfile::tempdir().unwrap();
        let folder = dir.path().join("folder.png");
        fs::create_dir(&folder).unwrap();

        assert_eq!(
            check_png(&dir.path().join("missing.png")).as_deref(),
            Some(READ_ERROR_MESSAGE)
        );
        assert_eq!(check_png(&folder).as_deref(), Some(READ_ERROR_MESSAGE));
    }
}
