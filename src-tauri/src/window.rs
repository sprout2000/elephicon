//! Sizes the main window on Windows.

use tauri::{AppHandle, LogicalSize, Manager, WebviewWindow};

/// The size of the whole window, including the frame and the title bar, as
/// in the Electron version. The window in tauri.conf.json sets the size of
/// the contents instead, so it is adjusted at startup.
pub const OUTER_SIZE: LogicalSize<f64> = LogicalSize {
    width: 400.0,
    height: 340.0,
};

/// The size of the contents that makes the whole window `outer`, given the
/// current outer and inner sizes of the window (their difference is the
/// frame and the title bar).
pub fn inner_size_for(
    outer: LogicalSize<f64>,
    current_outer: LogicalSize<f64>,
    current_inner: LogicalSize<f64>,
) -> LogicalSize<f64> {
    let frame_width = (current_outer.width - current_inner.width).max(0.0);
    let frame_height = (current_outer.height - current_inner.height).max(0.0);

    LogicalSize::new(
        (outer.width - frame_width).max(1.0),
        (outer.height - frame_height).max(1.0),
    )
}

fn fit(window: &WebviewWindow) -> tauri::Result<()> {
    let scale = window.scale_factor()?;
    let outer = window.outer_size()?.to_logical::<f64>(scale);
    let inner = window.inner_size()?.to_logical::<f64>(scale);

    window.set_size(inner_size_for(OUTER_SIZE, outer, inner))
}

/// Resizes the main window, which starts hidden, and then shows it.
pub fn fit_and_show(app: &AppHandle) -> tauri::Result<()> {
    let Some(window) = app.get_webview_window("main") else {
        return Ok(());
    };
    let fitted = fit(&window);

    // show the window even if resizing failed
    window.show()?;
    fitted
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn subtracts_the_frame_and_the_title_bar() {
        let inner = inner_size_for(
            OUTER_SIZE,
            LogicalSize::new(402.0, 372.0),
            LogicalSize::new(400.0, 340.0),
        );

        assert_eq!(inner, LogicalSize::new(398.0, 308.0));
    }

    #[test]
    fn keeps_the_size_without_a_frame() {
        let size = LogicalSize::new(400.0, 340.0);

        assert_eq!(inner_size_for(OUTER_SIZE, size, size), OUTER_SIZE);
    }

    #[test]
    fn never_returns_an_empty_or_negative_size() {
        let inner = inner_size_for(
            LogicalSize::new(10.0, 10.0),
            LogicalSize::new(100.0, 100.0),
            LogicalSize::new(0.0, 0.0),
        );
        let reversed = inner_size_for(
            OUTER_SIZE,
            LogicalSize::new(390.0, 330.0),
            LogicalSize::new(400.0, 340.0),
        );

        assert_eq!(inner, LogicalSize::new(1.0, 1.0));
        assert_eq!(reversed, OUTER_SIZE);
    }
}
