//! Creates Microsoft ICO and Apple ICNS files from PNG data.

use std::fmt;
use std::fs;
use std::io;
use std::path::Path;

use icns::{IconFamily, IconType};
use image::imageops::{self, FilterType};
use image::{ImageFormat, RgbaImage};
use serde::{Deserialize, Serialize};

/// The sizes embedded in an ICO file.
pub const ICO_SIZES: [u32; 9] = [16, 24, 32, 48, 64, 72, 96, 128, 256];

/// The icons embedded in an ICNS file (16x16 to 512x512@2x).
pub const ICNS_TYPES: [IconType; 10] = [
    IconType::RGBA32_16x16,
    IconType::RGBA32_16x16_2x,
    IconType::RGBA32_32x32,
    IconType::RGBA32_32x32_2x,
    IconType::RGBA32_128x128,
    IconType::RGBA32_128x128_2x,
    IconType::RGBA32_256x256,
    IconType::RGBA32_256x256_2x,
    IconType::RGBA32_512x512,
    IconType::RGBA32_512x512_2x,
];

/// ICO images smaller than this are stored as BMP when the BMP setting is on.
const PNG_ONLY_SIZE: u32 = 256;

/// The resampling quality chosen in the Quality menu.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Quality {
    Low,
    Medium,
    #[default]
    High,
}

impl Quality {
    fn filter(self) -> FilterType {
        match self {
            Quality::Low => FilterType::Nearest,
            Quality::Medium => FilterType::CatmullRom,
            Quality::High => FilterType::Lanczos3,
        }
    }
}

/// The kind of icon file to create.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum IconKind {
    Ico,
    Icns,
}

impl IconKind {
    pub fn extension(self) -> &'static str {
        match self {
            IconKind::Ico => "ico",
            IconKind::Icns => "icns",
        }
    }
}

#[derive(Debug)]
pub enum ConvertError {
    Decode(image::ImageError),
    Encode(io::Error),
}

impl fmt::Display for ConvertError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ConvertError::Decode(err) => write!(f, "Could not read the PNG image: {err}"),
            ConvertError::Encode(err) => write!(f, "Could not create the icon: {err}"),
        }
    }
}

impl std::error::Error for ConvertError {}

/// Decodes the PNG data and centers it on a transparent square canvas, so
/// that icons can also be made from images that are not square.
fn to_square(png: &[u8]) -> Result<RgbaImage, ConvertError> {
    let image = image::load_from_memory_with_format(png, ImageFormat::Png)
        .map_err(ConvertError::Decode)?
        .to_rgba8();
    let (width, height) = image.dimensions();

    if width == height {
        return Ok(image);
    }

    let side = width.max(height);
    let mut canvas = RgbaImage::new(side, side);
    imageops::overlay(
        &mut canvas,
        &image,
        i64::from((side - width) / 2),
        i64::from((side - height) / 2),
    );

    Ok(canvas)
}

fn resized(square: &RgbaImage, size: u32, quality: Quality) -> RgbaImage {
    if square.width() == size {
        return square.clone();
    }

    imageops::resize(square, size, size, quality.filter())
}

/// Creates an ICO file. With `bmp`, the images smaller than 256x256 are
/// stored as BMP and the rest as PNG; otherwise every image is PNG.
pub fn make_ico(png: &[u8], quality: Quality, bmp: bool) -> Result<Vec<u8>, ConvertError> {
    let square = to_square(png)?;
    let mut dir = ico::IconDir::new(ico::ResourceType::Icon);

    for size in ICO_SIZES {
        let image =
            ico::IconImage::from_rgba_data(size, size, resized(&square, size, quality).into_raw());
        let entry = if bmp && size < PNG_ONLY_SIZE {
            ico::IconDirEntry::encode_as_bmp(&image)
        } else {
            ico::IconDirEntry::encode_as_png(&image)
        }
        .map_err(ConvertError::Encode)?;

        dir.add_entry(entry);
    }

    let mut out = Vec::new();
    dir.write(&mut out).map_err(ConvertError::Encode)?;

    Ok(out)
}

/// Creates an ICNS file.
pub fn make_icns(png: &[u8], quality: Quality) -> Result<Vec<u8>, ConvertError> {
    let square = to_square(png)?;
    let mut family = IconFamily::new();

    for icon_type in ICNS_TYPES {
        let size = icon_type.pixel_width();
        let image = icns::Image::from_data(
            icns::PixelFormat::RGBA,
            size,
            size,
            resized(&square, size, quality).into_raw(),
        )
        .map_err(ConvertError::Encode)?;

        family
            .add_icon_with_type(&image, icon_type)
            .map_err(ConvertError::Encode)?;
    }

    let mut out = Vec::new();
    family.write(&mut out).map_err(ConvertError::Encode)?;

    Ok(out)
}

/// The result sent to the window after a successful conversion.
#[derive(Clone, Debug, PartialEq, Eq, Serialize)]
pub struct ConvertResult {
    #[serde(rename = "type")]
    pub kind: &'static str,
    /// The name of the created file.
    pub log: String,
    /// Whether the file was saved on the desktop.
    pub desktop: bool,
}

/// Where to save the created file and how to make it.
pub struct ConvertOptions<'a> {
    pub kind: IconKind,
    pub quality: Quality,
    pub bmp: bool,
    /// Save to this folder, or next to the input file when `None`.
    pub output_dir: Option<&'a Path>,
}

/// Reads the PNG file, creates the icon and writes it next to the input
/// file or into `output_dir`, with the same name as the input.
pub fn convert_file(input: &Path, options: &ConvertOptions) -> Result<ConvertResult, String> {
    let png = fs::read(input).map_err(|err| format!("Could not read the file: {err}"))?;
    let icon = match options.kind {
        IconKind::Ico => make_ico(&png, options.quality, options.bmp),
        IconKind::Icns => make_icns(&png, options.quality),
    }
    .map_err(|err| err.to_string())?;

    let dir = match options.output_dir {
        Some(dir) => dir,
        None => input
            .parent()
            .ok_or_else(|| "Could not find the folder of the file.".to_string())?,
    };
    let stem = input
        .file_stem()
        .ok_or_else(|| "Could not find the file name.".to_string())?
        .to_string_lossy();
    let name = format!("{stem}.{}", options.kind.extension());

    fs::write(dir.join(&name), icon).map_err(|err| format!("Could not save {name}: {err}"))?;

    Ok(ConvertResult {
        kind: "success",
        log: name,
        desktop: options.output_dir.is_some(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Cursor;

    use image::{DynamicImage, Rgba};

    /// Creates PNG data filled with opaque red.
    fn png(width: u32, height: u32) -> Vec<u8> {
        let image = RgbaImage::from_pixel(width, height, Rgba([255, 0, 0, 255]));
        let mut data = Vec::new();
        DynamicImage::ImageRgba8(image)
            .write_to(&mut Cursor::new(&mut data), ImageFormat::Png)
            .unwrap();
        data
    }

    fn read_ico(data: &[u8]) -> ico::IconDir {
        ico::IconDir::read(Cursor::new(data)).unwrap()
    }

    #[test]
    fn quality_maps_to_a_filter() {
        assert_eq!(Quality::Low.filter(), FilterType::Nearest);
        assert_eq!(Quality::Medium.filter(), FilterType::CatmullRom);
        assert_eq!(Quality::High.filter(), FilterType::Lanczos3);
        assert_eq!(Quality::default(), Quality::High);
    }

    #[test]
    fn ico_has_every_size() {
        let dir = read_ico(&make_ico(&png(512, 512), Quality::High, true).unwrap());
        let sizes: Vec<u32> = dir.entries().iter().map(|entry| entry.width()).collect();

        assert_eq!(sizes, ICO_SIZES);
        for entry in dir.entries() {
            assert_eq!(entry.width(), entry.height());
        }
    }

    #[test]
    fn ico_uses_bmp_for_small_sizes_when_bmp_is_on() {
        let dir = read_ico(&make_ico(&png(256, 256), Quality::Medium, true).unwrap());

        for entry in dir.entries() {
            assert_eq!(entry.is_png(), entry.width() >= 256, "{}", entry.width());
        }
    }

    #[test]
    fn ico_uses_png_for_every_size_when_bmp_is_off() {
        let dir = read_ico(&make_ico(&png(256, 256), Quality::Low, false).unwrap());

        assert!(dir.entries().iter().all(|entry| entry.is_png()));
    }

    #[test]
    fn icns_has_every_icon() {
        let data = make_icns(&png(1024, 1024), Quality::High).unwrap();
        let family = IconFamily::read(Cursor::new(data)).unwrap();
        let available = family.available_icons();

        for icon_type in ICNS_TYPES {
            assert!(available.contains(&icon_type), "{icon_type:?}");
        }
    }

    #[test]
    fn centers_images_that_are_not_square() {
        // 200x100: the top and bottom quarters become transparent
        let dir = read_ico(&make_ico(&png(200, 100), Quality::Low, false).unwrap());
        let entry = dir.entries().iter().find(|e| e.width() == 16).unwrap();
        let image = entry.decode().unwrap();
        let pixel = |x: u32, y: u32| {
            let i = ((y * image.width() + x) * 4) as usize;
            image.rgba_data()[i + 3]
        };

        assert_eq!(pixel(8, 0), 0, "top edge is transparent");
        assert_eq!(pixel(8, 8), 255, "center is opaque");
        assert_eq!(pixel(8, 15), 0, "bottom edge is transparent");
    }

    #[test]
    fn fails_for_data_that_is_not_png() {
        assert!(matches!(
            make_ico(b"not a png", Quality::High, true),
            Err(ConvertError::Decode(_))
        ));
        assert!(make_icns(b"not a png", Quality::High).is_err());
    }

    #[test]
    fn writes_the_icon_next_to_the_input() {
        let dir = tempfile::tempdir().unwrap();
        let input = dir.path().join("icon.png");
        fs::write(&input, png(64, 64)).unwrap();

        let result = convert_file(
            &input,
            &ConvertOptions {
                kind: IconKind::Ico,
                quality: Quality::High,
                bmp: true,
                output_dir: None,
            },
        )
        .unwrap();

        assert_eq!(
            result,
            ConvertResult {
                kind: "success",
                log: "icon.ico".to_string(),
                desktop: false
            }
        );
        assert!(
            read_ico(&fs::read(dir.path().join("icon.ico")).unwrap())
                .entries()
                .len()
                == ICO_SIZES.len()
        );
    }

    #[test]
    fn writes_the_icon_into_the_output_folder() {
        let dir = tempfile::tempdir().unwrap();
        let desktop = tempfile::tempdir().unwrap();
        let input = dir.path().join("app.png");
        fs::write(&input, png(64, 64)).unwrap();

        let result = convert_file(
            &input,
            &ConvertOptions {
                kind: IconKind::Icns,
                quality: Quality::Low,
                bmp: true,
                output_dir: Some(desktop.path()),
            },
        )
        .unwrap();

        assert_eq!(result.log, "app.icns");
        assert!(result.desktop);
        assert!(desktop.path().join("app.icns").exists());
        assert!(!dir.path().join("app.icns").exists());
    }

    #[test]
    fn reports_errors_as_text() {
        let dir = tempfile::tempdir().unwrap();
        let options = ConvertOptions {
            kind: IconKind::Ico,
            quality: Quality::High,
            bmp: true,
            output_dir: None,
        };

        let missing = convert_file(&dir.path().join("missing.png"), &options).unwrap_err();
        assert!(missing.starts_with("Could not read the file"), "{missing}");

        let broken = dir.path().join("broken.png");
        fs::write(&broken, b"not a png").unwrap();
        let error = convert_file(&broken, &options).unwrap_err();
        assert!(error.starts_with("Could not read the PNG image"), "{error}");
        assert!(!dir.path().join("broken.ico").exists());
    }

    #[test]
    fn uses_the_right_extension() {
        assert_eq!(IconKind::Ico.extension(), "ico");
        assert_eq!(IconKind::Icns.extension(), "icns");
    }
}
