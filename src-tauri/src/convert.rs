//! Creates Microsoft ICO and Apple ICNS files from PNG data.

use std::fmt;
use std::fs;
use std::io;
use std::path::Path;
use std::sync::{Arc, OnceLock};

use icns::{IconFamily, IconType};
use image::imageops::{self, FilterType};
use image::RgbaImage;
use resvg::{tiny_skia, usvg};
use serde::{Deserialize, Serialize};

use crate::format::InputFormat;

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
    /// The data is not in a supported image format.
    Unsupported,
    Decode(image::ImageError),
    Svg(usvg::Error),
    Encode(io::Error),
}

impl fmt::Display for ConvertError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ConvertError::Unsupported => write!(f, "Unsupported format: Unknown"),
            ConvertError::Decode(err) => write!(f, "Could not read the image: {err}"),
            ConvertError::Svg(err) => write!(f, "Could not read the SVG image: {err}"),
            ConvertError::Encode(err) => write!(f, "Could not create the icon: {err}"),
        }
    }
}

impl std::error::Error for ConvertError {}

/// The system fonts, loaded once for the text in SVG files.
fn fonts() -> Arc<usvg::fontdb::Database> {
    static FONTS: OnceLock<Arc<usvg::fontdb::Database>> = OnceLock::new();

    FONTS
        .get_or_init(|| {
            let mut fonts = usvg::fontdb::Database::new();
            fonts.load_system_fonts();
            Arc::new(fonts)
        })
        .clone()
}

/// An image read from an input file, ready to be drawn at each icon size.
pub enum Source {
    /// A raster image, centered on a transparent square canvas so that icons
    /// can also be made from images that are not square.
    Raster(RgbaImage),
    /// An SVG image, drawn directly at each size instead of being resized.
    Svg(usvg::Tree),
}

impl Source {
    /// Reads the image. `resources_dir` is where an SVG file looks for the
    /// images it links to.
    pub fn load(data: &[u8], resources_dir: Option<&Path>) -> Result<Self, ConvertError> {
        let format = InputFormat::detect(data).ok_or(ConvertError::Unsupported)?;

        match format.image_format() {
            Some(image_format) => {
                let image = image::load_from_memory_with_format(data, image_format)
                    .map_err(ConvertError::Decode)?
                    .to_rgba8();

                Ok(Source::Raster(to_square(image)))
            }
            None => {
                let options = usvg::Options {
                    resources_dir: resources_dir.map(Path::to_path_buf),
                    fontdb: fonts(),
                    ..usvg::Options::default()
                };
                let tree = usvg::Tree::from_data(data, &options).map_err(ConvertError::Svg)?;

                Ok(Source::Svg(tree))
            }
        }
    }

    /// Draws the image as a `size` x `size` icon.
    pub fn render(&self, size: u32, quality: Quality) -> RgbaImage {
        match self {
            Source::Raster(square) if square.width() == size => square.clone(),
            Source::Raster(square) => imageops::resize(square, size, size, quality.filter()),
            Source::Svg(tree) => render_svg(tree, size),
        }
    }
}

fn to_square(image: RgbaImage) -> RgbaImage {
    let (width, height) = image.dimensions();

    if width == height {
        return image;
    }

    let side = width.max(height);
    let mut canvas = RgbaImage::new(side, side);
    imageops::overlay(
        &mut canvas,
        &image,
        i64::from((side - width) / 2),
        i64::from((side - height) / 2),
    );

    canvas
}

/// Draws the SVG centered on a transparent square, keeping its aspect ratio.
fn render_svg(tree: &usvg::Tree, size: u32) -> RgbaImage {
    let svg_size = tree.size();
    let (width, height) = (svg_size.width(), svg_size.height());
    let side = size as f32;
    let scale = side / width.max(height);
    let transform = tiny_skia::Transform::from_row(
        scale,
        0.0,
        0.0,
        scale,
        (side - width * scale) / 2.0,
        (side - height * scale) / 2.0,
    );

    let mut pixmap = tiny_skia::Pixmap::new(size, size).expect("icon sizes are not zero");
    resvg::render(tree, transform, &mut pixmap.as_mut());

    // tiny-skia keeps premultiplied colors, while icons need straight alpha
    let data = pixmap
        .pixels()
        .iter()
        .flat_map(|pixel| {
            let color = pixel.demultiply();
            [color.red(), color.green(), color.blue(), color.alpha()]
        })
        .collect();

    RgbaImage::from_raw(size, size, data).expect("the pixmap has size x size pixels")
}

/// Creates an ICO file. With `bmp`, the images smaller than 256x256 are
/// stored as BMP and the rest as PNG; otherwise every image is PNG.
pub fn make_ico(source: &Source, quality: Quality, bmp: bool) -> Result<Vec<u8>, ConvertError> {
    let mut dir = ico::IconDir::new(ico::ResourceType::Icon);

    for size in ICO_SIZES {
        let image =
            ico::IconImage::from_rgba_data(size, size, source.render(size, quality).into_raw());
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
pub fn make_icns(source: &Source, quality: Quality) -> Result<Vec<u8>, ConvertError> {
    let mut family = IconFamily::new();

    for icon_type in ICNS_TYPES {
        let size = icon_type.pixel_width();
        let image = icns::Image::from_data(
            icns::PixelFormat::RGBA,
            size,
            size,
            source.render(size, quality).into_raw(),
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

/// Reads the image file, creates the icon and writes it next to the input
/// file or into `output_dir`, with the same name as the input.
pub fn convert_file(input: &Path, options: &ConvertOptions) -> Result<ConvertResult, String> {
    let data = fs::read(input).map_err(|err| format!("Could not read the file: {err}"))?;
    let source = Source::load(&data, input.parent()).map_err(|err| err.to_string())?;
    let icon = match options.kind {
        IconKind::Ico => make_ico(&source, options.quality, options.bmp),
        IconKind::Icns => make_icns(&source, options.quality),
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

    use image::{DynamicImage, ImageFormat, Rgba};

    /// Encodes an image filled with opaque red in the given format.
    fn encode(width: u32, height: u32, format: ImageFormat) -> Vec<u8> {
        let image = RgbaImage::from_pixel(width, height, Rgba([255, 0, 0, 255]));
        let image = match format {
            // JPEG has no alpha channel
            ImageFormat::Jpeg => DynamicImage::ImageRgb8(DynamicImage::ImageRgba8(image).to_rgb8()),
            _ => DynamicImage::ImageRgba8(image),
        };
        let mut data = Vec::new();
        image.write_to(&mut Cursor::new(&mut data), format).unwrap();
        data
    }

    fn png(width: u32, height: u32) -> Vec<u8> {
        encode(width, height, ImageFormat::Png)
    }

    /// A red rectangle of `width` x `height`.
    fn svg(width: u32, height: u32) -> Vec<u8> {
        format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}"><rect width="{width}" height="{height}" fill="red"/></svg>"#
        )
        .into_bytes()
    }

    fn load(data: &[u8]) -> Source {
        Source::load(data, None).unwrap()
    }

    fn read_ico(data: &[u8]) -> ico::IconDir {
        ico::IconDir::read(Cursor::new(data)).unwrap()
    }

    /// The alpha value of a pixel in the 16x16 image of an ICO file.
    fn alpha_16(ico_data: &[u8], x: u32, y: u32) -> u8 {
        let dir = read_ico(ico_data);
        let entry = dir.entries().iter().find(|e| e.width() == 16).unwrap();
        let image = entry.decode().unwrap();
        let i = ((y * image.width() + x) * 4) as usize;
        image.rgba_data()[i + 3]
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
        let dir = read_ico(&make_ico(&load(&png(512, 512)), Quality::High, true).unwrap());
        let sizes: Vec<u32> = dir.entries().iter().map(|entry| entry.width()).collect();

        assert_eq!(sizes, ICO_SIZES);
        for entry in dir.entries() {
            assert_eq!(entry.width(), entry.height());
        }
    }

    #[test]
    fn ico_uses_bmp_for_small_sizes_when_bmp_is_on() {
        let dir = read_ico(&make_ico(&load(&png(256, 256)), Quality::Medium, true).unwrap());

        for entry in dir.entries() {
            assert_eq!(entry.is_png(), entry.width() >= 256, "{}", entry.width());
        }
    }

    #[test]
    fn ico_uses_png_for_every_size_when_bmp_is_off() {
        let dir = read_ico(&make_ico(&load(&png(256, 256)), Quality::Low, false).unwrap());

        assert!(dir.entries().iter().all(|entry| entry.is_png()));
    }

    #[test]
    fn icns_has_every_icon() {
        let data = make_icns(&load(&png(1024, 1024)), Quality::High).unwrap();
        let family = IconFamily::read(Cursor::new(data)).unwrap();
        let available = family.available_icons();

        for icon_type in ICNS_TYPES {
            assert!(available.contains(&icon_type), "{icon_type:?}");
        }
    }

    #[test]
    fn centers_images_that_are_not_square() {
        // 200x100: the top and bottom quarters become transparent
        let data = make_ico(&load(&png(200, 100)), Quality::Low, false).unwrap();

        assert_eq!(alpha_16(&data, 8, 0), 0, "top edge is transparent");
        assert_eq!(alpha_16(&data, 8, 8), 255, "center is opaque");
        assert_eq!(alpha_16(&data, 8, 15), 0, "bottom edge is transparent");
    }

    #[test]
    fn reads_every_raster_format() {
        for format in [
            ImageFormat::Png,
            ImageFormat::Jpeg,
            ImageFormat::WebP,
            ImageFormat::Bmp,
            ImageFormat::Gif,
            ImageFormat::Tiff,
        ] {
            let source = load(&encode(64, 64, format));
            let dir = read_ico(&make_ico(&source, Quality::High, true).unwrap());

            assert_eq!(dir.entries().len(), ICO_SIZES.len(), "{format:?}");
            assert!(make_icns(&source, Quality::High).is_ok(), "{format:?}");
        }
    }

    #[test]
    fn draws_svg_at_each_size() {
        let source = load(&svg(64, 64));

        assert!(matches!(source, Source::Svg(_)));
        for size in [16, 256, 1024] {
            let image = source.render(size, Quality::Low);
            assert_eq!(image.dimensions(), (size, size));
            assert_eq!(image.get_pixel(size / 2, size / 2).0, [255, 0, 0, 255]);
        }
    }

    #[test]
    fn centers_svg_that_is_not_square() {
        let data = make_ico(&load(&svg(200, 100)), Quality::High, true).unwrap();

        assert_eq!(alpha_16(&data, 8, 0), 0, "top edge is transparent");
        assert_eq!(alpha_16(&data, 8, 8), 255, "center is opaque");
        assert_eq!(alpha_16(&data, 8, 15), 0, "bottom edge is transparent");
    }

    #[test]
    fn makes_icns_from_svg() {
        let data = make_icns(&load(&svg(32, 32)), Quality::High).unwrap();
        let family = IconFamily::read(Cursor::new(data)).unwrap();

        assert_eq!(family.available_icons().len(), ICNS_TYPES.len());
    }

    #[test]
    fn fails_for_unsupported_or_broken_data() {
        assert!(matches!(
            Source::load(b"not an image", None),
            Err(ConvertError::Unsupported)
        ));
        assert!(matches!(
            Source::load(b"\x89PNG\r\n\x1a\nbroken", None),
            Err(ConvertError::Decode(_))
        ));
        assert!(matches!(
            Source::load(b"<svg xmlns=\"http://www.w3.org/2000/svg\"><rect", None),
            Err(ConvertError::Svg(_))
        ));
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
        assert_eq!(error, "Unsupported format: Unknown");
        assert!(!dir.path().join("broken.ico").exists());
    }

    #[test]
    fn converts_an_svg_file() {
        let dir = tempfile::tempdir().unwrap();
        let input = dir.path().join("logo.svg");
        fs::write(&input, svg(48, 48)).unwrap();

        let result = convert_file(
            &input,
            &ConvertOptions {
                kind: IconKind::Ico,
                quality: Quality::High,
                bmp: false,
                output_dir: None,
            },
        )
        .unwrap();

        assert_eq!(result.log, "logo.ico");
        assert!(dir.path().join("logo.ico").exists());
    }

    #[test]
    fn uses_the_right_extension() {
        assert_eq!(IconKind::Ico.extension(), "ico");
        assert_eq!(IconKind::Icns.extension(), "icns");
    }
}
