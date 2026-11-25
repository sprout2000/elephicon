/** macOS uses a hidden title bar, so the window is moved by its content. */
export const isDarwin = navigator.userAgent.includes("Mac");

/** Spread onto elements that should move the window on macOS. */
export const dragRegion: { "data-tauri-drag-region"?: true } = isDarwin
  ? { "data-tauri-drag-region": true }
  : {};
