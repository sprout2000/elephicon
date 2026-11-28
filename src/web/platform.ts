/** macOS uses a hidden title bar, so the window is moved by its content. */
export const isDarwin = navigator.userAgent.includes("Mac");

/**
 * On Linux (Wayland), GTK cannot place a native context menu opened from a
 * command, so the window draws the context menu itself.
 */
export const isLinux =
  navigator.userAgent.includes("Linux") &&
  !navigator.userAgent.includes("Android");

/** Spread onto elements that should move the window on macOS. */
export const dragRegion: { "data-tauri-drag-region"?: true } = isDarwin
  ? { "data-tauri-drag-region": true }
  : {};
