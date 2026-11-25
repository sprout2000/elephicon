//! Finds out the format of an input file from its contents, so that a file
//! with a wrong extension is not converted by mistake.

use std::fs::File;
use std::io::{self, Read};
use std::path::Path;

use image::ImageFormat;

/// The image formats Elephicon can make icons from.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum InputFormat {
    Png,
    Jpeg,
    WebP,
    Bmp,
    Gif,
    Tiff,
    Svg,
}

/// How many bytes to read to find out the format. An SVG file may start
/// with an XML declaration and comments before the `<svg` tag.
const HEAD_SIZE: usize = 4096;

pub const READ_ERROR_MESSAGE: &str = "Could not read the file.";

impl InputFormat {
    pub const ALL: [InputFormat; 7] = [
        InputFormat::Png,
        InputFormat::Jpeg,
        InputFormat::WebP,
        InputFormat::Bmp,
        InputFormat::Gif,
        InputFormat::Tiff,
        InputFormat::Svg,
    ];

    /// The name with "a" or "an", as in "a PNG image" or "an SVG image".
    pub fn name_with_article(self) -> &'static str {
        match self {
            InputFormat::Png => "a PNG",
            InputFormat::Jpeg => "a JPEG",
            InputFormat::WebP => "a WebP",
            InputFormat::Bmp => "a BMP",
            InputFormat::Gif => "a GIF",
            InputFormat::Tiff => "a TIFF",
            InputFormat::Svg => "an SVG",
        }
    }

    /// The file extensions, in lowercase.
    pub fn extensions(self) -> &'static [&'static str] {
        match self {
            InputFormat::Png => &["png"],
            InputFormat::Jpeg => &["jpg", "jpeg"],
            InputFormat::WebP => &["webp"],
            InputFormat::Bmp => &["bmp"],
            InputFormat::Gif => &["gif"],
            InputFormat::Tiff => &["tif", "tiff"],
            InputFormat::Svg => &["svg"],
        }
    }

    /// Every supported extension, for the file dialog.
    pub fn all_extensions() -> Vec<&'static str> {
        Self::ALL
            .iter()
            .flat_map(|format| format.extensions().iter().copied())
            .collect()
    }

    /// The format for the image crate, or `None` for SVG.
    pub fn image_format(self) -> Option<ImageFormat> {
        match self {
            InputFormat::Png => Some(ImageFormat::Png),
            InputFormat::Jpeg => Some(ImageFormat::Jpeg),
            InputFormat::WebP => Some(ImageFormat::WebP),
            InputFormat::Bmp => Some(ImageFormat::Bmp),
            InputFormat::Gif => Some(ImageFormat::Gif),
            InputFormat::Tiff => Some(ImageFormat::Tiff),
            InputFormat::Svg => None,
        }
    }

    /// Finds out the format from the first bytes of a file.
    pub fn detect(head: &[u8]) -> Option<Self> {
        if head.starts_with(&[0x89, b'P', b'N', b'G', 0x0d, 0x0a, 0x1a, 0x0a]) {
            Some(InputFormat::Png)
        } else if head.starts_with(&[0xff, 0xd8, 0xff]) {
            Some(InputFormat::Jpeg)
        } else if head.len() >= 12 && head.starts_with(b"RIFF") && &head[8..12] == b"WEBP" {
            Some(InputFormat::WebP)
        } else if head.starts_with(b"BM") {
            Some(InputFormat::Bmp)
        } else if head.starts_with(b"GIF87a") || head.starts_with(b"GIF89a") {
            Some(InputFormat::Gif)
        } else if head.starts_with(b"II*\0") || head.starts_with(b"MM\0*") {
            Some(InputFormat::Tiff)
        } else if is_svg(head) {
            Some(InputFormat::Svg)
        } else {
            None
        }
    }

    /// Finds out the format from the extension of a path.
    pub fn from_extension(path: &Path) -> Option<Self> {
        let extension = path.extension()?.to_str()?.to_ascii_lowercase();

        Self::ALL
            .into_iter()
            .find(|format| format.extensions().contains(&extension.as_str()))
    }
}

/// An SVG file is text that starts with a tag (after an optional byte order
/// mark and whitespace) and has an `<svg` tag near the start.
fn is_svg(head: &[u8]) -> bool {
    let head = head.strip_prefix(b"\xef\xbb\xbf").unwrap_or(head);
    let text = String::from_utf8_lossy(head);

    text.trim_start().starts_with('<') && text.to_ascii_lowercase().contains("<svg")
}

fn read_head(path: &Path) -> io::Result<Vec<u8>> {
    let mut head = Vec::with_capacity(HEAD_SIZE);
    File::open(path)?
        .take(HEAD_SIZE as u64)
        .read_to_end(&mut head)?;

    Ok(head)
}

/// Returns `None` for a supported image, or the error message to show in
/// the window. The message is always in English.
pub fn check_image(path: &Path) -> Option<String> {
    let head = match read_head(path) {
        Ok(head) => head,
        Err(_) => return Some(READ_ERROR_MESSAGE.to_string()),
    };

    if InputFormat::detect(&head).is_some() {
        return None;
    }

    if let Some(format) = InputFormat::from_extension(path) {
        let extension = path
            .extension()
            .map(|ext| ext.to_string_lossy().to_ascii_lowercase())
            .unwrap_or_default();

        return Some(format!(
            "This file has a .{extension} extension, but it is not {} image.",
            format.name_with_article()
        ));
    }

    Some(match mime_guess::from_path(path).first() {
        Some(mime) => format!("Unsupported format: {mime}"),
        None => "Unsupported format: Unknown".to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use std::path::PathBuf;

    const PNG_DATA: &[u8] = b"\x89PNG\r\n\x1a\nIHDR...";
    const JPEG_DATA: &[u8] = b"\xff\xd8\xff\xe0\x00\x10JFIF";
    const PDF_DATA: &[u8] = b"%PDF-1.7\n";

    fn write(dir: &Path, name: &str, data: &[u8]) -> PathBuf {
        let path = dir.join(name);
        fs::write(&path, data).unwrap();
        path
    }

    #[test]
    fn detects_raster_formats_from_their_signatures() {
        assert_eq!(InputFormat::detect(PNG_DATA), Some(InputFormat::Png));
        assert_eq!(InputFormat::detect(JPEG_DATA), Some(InputFormat::Jpeg));
        assert_eq!(
            InputFormat::detect(b"RIFF\x24\x00\x00\x00WEBPVP8L"),
            Some(InputFormat::WebP)
        );
        assert_eq!(InputFormat::detect(b"BM\x36\x00"), Some(InputFormat::Bmp));
        assert_eq!(
            InputFormat::detect(b"GIF87a\x01\x00"),
            Some(InputFormat::Gif)
        );
        assert_eq!(
            InputFormat::detect(b"GIF89a\x01\x00"),
            Some(InputFormat::Gif)
        );
        assert_eq!(InputFormat::detect(b"II*\0\x08\0"), Some(InputFormat::Tiff));
        assert_eq!(InputFormat::detect(b"MM\0*\0\0"), Some(InputFormat::Tiff));
    }

    #[test]
    fn detects_svg_text() {
        for svg in [
            "<svg xmlns=\"http://www.w3.org/2000/svg\"/>",
            "<?xml version=\"1.0\"?>\n<svg xmlns=\"http://www.w3.org/2000/svg\"/>",
            "\u{feff}  <!-- logo -->\n<svg/>",
            "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"\">\n<SVG/>",
        ] {
            assert_eq!(
                InputFormat::detect(svg.as_bytes()),
                Some(InputFormat::Svg),
                "{svg}"
            );
        }
    }

    #[test]
    fn does_not_detect_other_data() {
        assert_eq!(InputFormat::detect(PDF_DATA), None);
        assert_eq!(
            InputFormat::detect(b"<html><body>hello</body></html>"),
            None
        );
        assert_eq!(InputFormat::detect(b"just text mentioning <svg"), None);
        assert_eq!(InputFormat::detect(b"RIFF\x24\x00\x00\x00WAVE"), None);
        assert_eq!(InputFormat::detect(b"\x89PNG"), None);
        assert_eq!(InputFormat::detect(b""), None);
    }

    #[test]
    fn finds_the_format_from_the_extension() {
        assert_eq!(
            InputFormat::from_extension(Path::new("a.PNG")),
            Some(InputFormat::Png)
        );
        assert_eq!(
            InputFormat::from_extension(Path::new("a.jpeg")),
            Some(InputFormat::Jpeg)
        );
        assert_eq!(
            InputFormat::from_extension(Path::new("a.tif")),
            Some(InputFormat::Tiff)
        );
        assert_eq!(
            InputFormat::from_extension(Path::new("a.svg")),
            Some(InputFormat::Svg)
        );
        assert_eq!(InputFormat::from_extension(Path::new("a.pdf")), None);
        assert_eq!(InputFormat::from_extension(Path::new("no-extension")), None);
    }

    #[test]
    fn lists_every_extension_for_the_dialog() {
        assert_eq!(
            InputFormat::all_extensions(),
            ["png", "jpg", "jpeg", "webp", "bmp", "gif", "tif", "tiff", "svg"]
        );
    }

    #[test]
    fn uses_the_image_crate_for_raster_formats_only() {
        for format in InputFormat::ALL {
            assert_eq!(format.image_format().is_none(), format == InputFormat::Svg);
        }
    }

    #[test]
    fn accepts_images_whatever_the_extension() {
        let dir = tempfile::tempdir().unwrap();

        assert_eq!(check_image(&write(dir.path(), "ok.png", PNG_DATA)), None);
        assert_eq!(
            check_image(&write(dir.path(), "photo.jpg", JPEG_DATA)),
            None
        );
        assert_eq!(
            check_image(&write(dir.path(), "renamed.jpg", PNG_DATA)),
            None
        );
        assert_eq!(
            check_image(&write(
                dir.path(),
                "logo.svg",
                b"<svg xmlns=\"http://www.w3.org/2000/svg\"/>"
            )),
            None
        );
    }

    #[test]
    fn detects_a_spoofed_extension() {
        let dir = tempfile::tempdir().unwrap();

        assert_eq!(
            check_image(&write(dir.path(), "spoofed.png", PDF_DATA)).as_deref(),
            Some("This file has a .png extension, but it is not a PNG image.")
        );
        assert_eq!(
            check_image(&write(dir.path(), "SPOOFED.PNG", PDF_DATA)).as_deref(),
            Some("This file has a .png extension, but it is not a PNG image.")
        );
        assert_eq!(
            check_image(&write(dir.path(), "photo.jpeg", PDF_DATA)).as_deref(),
            Some("This file has a .jpeg extension, but it is not a JPEG image.")
        );
        assert_eq!(
            check_image(&write(dir.path(), "logo.svg", b"plain text")).as_deref(),
            Some("This file has a .svg extension, but it is not an SVG image.")
        );
    }

    #[test]
    fn reports_the_format_guessed_from_the_extension() {
        let dir = tempfile::tempdir().unwrap();

        assert_eq!(
            check_image(&write(dir.path(), "document.pdf", PDF_DATA)).as_deref(),
            Some("Unsupported format: application/pdf")
        );
        assert_eq!(
            check_image(&write(dir.path(), "no-extension", PDF_DATA)).as_deref(),
            Some("Unsupported format: Unknown")
        );
    }

    #[test]
    fn reports_read_errors() {
        let dir = tempfile::tempdir().unwrap();
        let folder = dir.path().join("folder.png");
        fs::create_dir(&folder).unwrap();

        assert_eq!(
            check_image(&dir.path().join("missing.png")).as_deref(),
            Some(READ_ERROR_MESSAGE)
        );
        assert_eq!(check_image(&folder).as_deref(), Some(READ_ERROR_MESSAGE));
    }
}
