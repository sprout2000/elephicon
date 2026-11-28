/** macOS uses a hidden title bar, so the window is moved by its content. */
export const isDarwin = navigator.userAgent.includes("Mac");

/** Linux shows the menu bar and has no context menu. */
export const isLinux =
  navigator.userAgent.includes("Linux") &&
  !navigator.userAgent.includes("Android");

/** Spread onto elements that should move the window on macOS. */
export const dragRegion: { "data-tauri-drag-region"?: true } = isDarwin
  ? { "data-tauri-drag-region": true }
  : {};
