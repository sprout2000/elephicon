import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type Handler = (...args: unknown[]) => unknown;
type Values = Record<string, unknown>;

/** BrowserWindow の代わりに使う、イベントの登録先を覚えておくだけのウィンドウ */
class FakeWindow {
  static instances: FakeWindow[] = [];

  options: Values;
  events: Record<string, Handler> = {};
  webEvents: Record<string, Handler> = {};
  loadFile = vi.fn();
  show = vi.fn();
  getBounds = vi.fn(() => ({ x: 10, y: 20, width: 400, height: 340 }));
  once = vi.fn((event: string, handler: Handler) => {
    this.events[event] = handler;
  });
  webContents = {
    send: vi.fn(),
    openDevTools: vi.fn(),
    once: vi.fn((event: string, handler: Handler) => {
      this.webEvents[event] = handler;
    }),
  };

  constructor(options: Values) {
    this.options = options;
    FakeWindow.instances.push(this);
  }
}

const mocks = vi.hoisted(() => {
  const ipcHandlers = new Map<string, (...args: unknown[]) => unknown>();
  const appEvents = new Map<string, (...args: unknown[]) => unknown>();
  const updaterEvents = new Map<string, (...args: unknown[]) => unknown>();
  const store = {
    initial: {} as Record<string, unknown>,
    values: {} as Record<string, unknown>,
    options: undefined as unknown,
    set: vi.fn(),
  };

  return {
    ipcHandlers,
    appEvents,
    updaterEvents,
    store,
    lock: true,
    locale: "ja",
    app: {
      name: "Elephicon",
      requestSingleInstanceLock: vi.fn(),
      whenReady: vi.fn(),
      getLocale: vi.fn(),
      getPath: vi.fn(() => "/Users/me/Pictures"),
      getVersion: vi.fn(() => "4.3.1"),
      exit: vi.fn(),
      setAboutPanelOptions: vi.fn(),
      once: vi.fn((event: string, handler: (...args: unknown[]) => unknown) => {
        appEvents.set(event, handler);
      }),
    },
    nativeTheme: { shouldUseDarkColors: false, themeSource: "system" },
    ipcMain: {
      handle: vi.fn(
        (channel: string, handler: (...args: unknown[]) => unknown) => {
          ipcHandlers.set(channel, handler);
        },
      ),
    },
    dialog: { showOpenDialog: vi.fn(), showMessageBox: vi.fn() },
    menu: { popup: vi.fn() },
    setApplicationMenu: vi.fn(),
    autoUpdater: {
      logger: undefined as unknown,
      autoDownload: true,
      checkForUpdates: vi.fn(),
      downloadUpdate: vi.fn(),
      quitAndInstall: vi.fn(),
      on: vi.fn((event: string, handler: (...args: unknown[]) => unknown) => {
        updaterEvents.set(event, handler);
      }),
    },
    log: { log: vi.fn(), info: vi.fn() },
    installExtension: vi.fn(),
    createMenu: vi.fn(),
    setLocales: vi.fn(),
    checkPng: vi.fn(),
    mkico: vi.fn(),
    mkicns: vi.fn(),
  };
});

vi.mock("electron", () => ({
  app: mocks.app,
  BrowserWindow: FakeWindow,
  dialog: mocks.dialog,
  ipcMain: mocks.ipcMain,
  Menu: { setApplicationMenu: mocks.setApplicationMenu },
  nativeTheme: mocks.nativeTheme,
}));

vi.mock("electron-store", () => ({
  default: class {
    constructor(options: { defaults: Values }) {
      mocks.store.options = options;
      mocks.store.values = { ...options.defaults, ...mocks.store.initial };
    }

    get(key: string) {
      return mocks.store.values[key];
    }

    set(key: string | Values, value?: unknown) {
      if (typeof key === "string") {
        mocks.store.values[key] = value;
      } else {
        Object.assign(mocks.store.values, key);
      }
      mocks.store.set(key, value);
    }
  },
}));

vi.mock("electron-devtools-installer", () => ({
  installExtension: mocks.installExtension,
  REACT_DEVELOPER_TOOLS: "react-developer-tools",
}));
vi.mock("electron-log", () => ({ default: mocks.log }));
vi.mock("electron-updater", () => ({ autoUpdater: mocks.autoUpdater }));
vi.mock("i18next", () => ({ default: { t: (key: string) => key } }));
vi.mock("../../createMenu", () => ({ createMenu: mocks.createMenu }));
vi.mock("../../setLocales", () => ({ setLocales: mocks.setLocales }));
vi.mock("../../checkPng", () => ({ checkPng: mocks.checkPng }));
vi.mock("../../mkicons", () => ({ mkico: mocks.mkico, mkicns: mocks.mkicns }));

const originalPlatform = process.platform;
const originalConsoleLog = console.log;

const setPlatform = (platform: NodeJS.Platform) => {
  Object.defineProperty(process, "platform", {
    value: platform,
    configurable: true,
  });
};

const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

type LoadOptions = {
  platform?: NodeJS.Platform;
  lock?: boolean;
  store?: Values;
  dark?: boolean;
};

/** main.ts は読み込んだ時点で起動処理を行うので、条件を決めてから毎回読み込み直す */
const load = async (options: LoadOptions = {}) => {
  setPlatform(options.platform ?? "linux");
  mocks.app.requestSingleInstanceLock.mockReturnValue(options.lock ?? true);
  mocks.store.initial = options.store ?? {};
  mocks.nativeTheme.shouldUseDarkColors = options.dark ?? false;

  vi.resetModules();
  await import("../../main");
  await flush();

  return FakeWindow.instances[0];
};

const getHandler = (handlers: Map<string, Handler>, name: string) => {
  const handler = handlers.get(name);
  if (!handler) throw new Error(`handler not registered: ${name}`);
  return handler;
};

const invoke = (channel: string, ...args: unknown[]) =>
  getHandler(mocks.ipcHandlers, channel)({}, ...args);

const emitApp = (event: string) => getHandler(mocks.appEvents, event)();

const emitUpdater = (event: string) => getHandler(mocks.updaterEvents, event)();

beforeEach(() => {
  FakeWindow.instances = [];
  mocks.ipcHandlers.clear();
  mocks.appEvents.clear();
  mocks.updaterEvents.clear();

  mocks.app.whenReady.mockResolvedValue(undefined);
  mocks.app.getLocale.mockReturnValue("ja");
  mocks.createMenu.mockReturnValue(mocks.menu);
  mocks.autoUpdater.logger = undefined;
  mocks.autoUpdater.autoDownload = true;
  mocks.nativeTheme.themeSource = "system";

  Object.defineProperty(process, "resourcesPath", {
    value: "/Applications/Elephicon.app/Contents/Resources",
    configurable: true,
  });
});

afterEach(() => {
  setPlatform(originalPlatform);
  console.log = originalConsoleLog;
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("startup", () => {
  it("quits when another instance is running on Windows and Linux", async () => {
    const win = await load({ lock: false });

    expect(mocks.app.exit).toHaveBeenCalled();
    expect(mocks.app.whenReady).not.toHaveBeenCalled();
    expect(win).toBeUndefined();
  });

  it("keeps running without the lock on macOS", async () => {
    const win = await load({ platform: "darwin", lock: false });

    expect(mocks.app.exit).not.toHaveBeenCalled();
    expect(win).toBeDefined();
  });

  it("creates the store with the default settings", async () => {
    await load();

    expect(mocks.store.options).toEqual({
      defaults: {
        ico: true,
        desktop: true,
        x: undefined,
        y: undefined,
        quality: 2,
        bmp: true,
        ask: true,
      },
    });
  });

  it("sends console.log output to electron-log", async () => {
    await load();

    expect(console.log).toBe(mocks.log.log);
    expect(mocks.log.info).toHaveBeenCalledWith("App starting...");
  });

  it("uses the saved language", async () => {
    await load({ store: { language: "de" } });

    expect(mocks.setLocales).toHaveBeenCalledWith("de");
    expect(mocks.app.getLocale).not.toHaveBeenCalled();
  });

  it("uses the system language and saves it on first launch", async () => {
    mocks.app.getLocale.mockReturnValue("fr");
    await load();

    expect(mocks.setLocales).toHaveBeenCalledWith("fr");
    expect(mocks.store.set).toHaveBeenCalledWith("language", "fr");
  });

  it("sets the about panel options on Windows and Linux", async () => {
    await load();

    expect(mocks.app.setAboutPanelOptions).toHaveBeenCalledWith({
      applicationName: "Elephicon",
      applicationVersion: `v4.3.1 (Electron v${process.versions.electron})`,
      version: `Electron v${process.versions.electron}`,
      iconPath: path.join(
        "/Applications/Elephicon.app/Contents/Resources",
        "app.asar.unpacked",
        "dist",
        "images/icon.png",
      ),
      copyright: `© 2020-${new Date().getFullYear()} sprout2000`,
    });
  });

  it("shows only the app version in the about panel on macOS", async () => {
    await load({ platform: "darwin" });

    expect(mocks.app.setAboutPanelOptions).toHaveBeenCalledWith(
      expect.objectContaining({ applicationVersion: "4.3.1" }),
    );
  });

  it("quits when all windows are closed", async () => {
    await load();

    emitApp("window-all-closed");

    expect(mocks.app.exit).toHaveBeenCalled();
  });
});

describe("main window", () => {
  it("uses the Windows and Linux window size and the saved position", async () => {
    const win = await load({ store: { x: 100, y: 200 } });

    expect(win.options).toEqual(
      expect.objectContaining({
        x: 100,
        y: 200,
        width: 400,
        height: 340,
        show: false,
        titleBarStyle: "default",
        resizable: false,
      }),
    );
    expect(win.options.webPreferences).toEqual({
      safeDialogs: true,
      devTools: false,
      preload: expect.stringMatching(/preload\.js$/),
    });
  });

  it("uses the macOS window size and a hidden title bar", async () => {
    const win = await load({ platform: "darwin" });

    expect(win.options).toEqual(
      expect.objectContaining({
        width: 360,
        height: 320,
        titleBarStyle: "hidden",
      }),
    );
  });

  it.each([
    [false, "light"],
    [true, "dark"],
  ])("follows the system theme (dark: %s)", async (dark, theme) => {
    await load({ dark });

    expect(mocks.nativeTheme.themeSource).toBe(theme);
  });

  it("loads the page and shows the window when it is ready", async () => {
    const win = await load();

    expect(win.loadFile).toHaveBeenCalledWith("dist/index.html");
    expect(win.show).not.toHaveBeenCalled();

    win.events["ready-to-show"]();

    expect(win.show).toHaveBeenCalled();
    expect(win.webContents.openDevTools).not.toHaveBeenCalled();
  });

  it("sends the destination setting after the page loads", async () => {
    const win = await load({ store: { desktop: false } });

    win.webEvents["did-finish-load"]();

    expect(win.webContents.send).toHaveBeenCalledWith("set-desktop", false);
  });

  it("saves the window position when it closes", async () => {
    const win = await load();

    win.events.close();

    expect(mocks.store.set).toHaveBeenCalledWith({ x: 10, y: 20 }, undefined);
  });

  it("sets the application menu", async () => {
    const win = await load();

    expect(mocks.createMenu).toHaveBeenCalledWith(win, expect.anything());
    expect(mocks.setApplicationMenu).toHaveBeenCalledWith(mocks.menu);
  });
});

describe("IPC handlers", () => {
  it("checks PNG files", async () => {
    mocks.checkPng.mockResolvedValue(null);
    await load();

    await expect(invoke("png-check", "/Users/me/icon.png")).resolves.toBeNull();
    expect(mocks.checkPng).toHaveBeenCalledWith("/Users/me/icon.png");
  });

  it.each([
    ["make-ico", "mkico"],
    ["make-icns", "mkicns"],
  ] as const)("%s calls %s with the store", async (channel, name) => {
    const result = { type: "success", log: "icon", desktop: true };
    mocks[name].mockResolvedValue(result);
    await load();

    await expect(invoke(channel, "/Users/me/icon.png")).resolves.toBe(result);
    expect(mocks[name]).toHaveBeenCalledWith(
      "/Users/me/icon.png",
      expect.objectContaining({ get: expect.any(Function) }),
    );
  });

  it("returns the file chosen in the open dialog", async () => {
    mocks.dialog.showOpenDialog.mockResolvedValue({
      canceled: false,
      filePaths: ["/Users/me/icon.png"],
    });
    const win = await load();

    await expect(invoke("open-file-dialog")).resolves.toBe(
      "/Users/me/icon.png",
    );
    expect(mocks.dialog.showOpenDialog).toHaveBeenCalledWith(
      win,
      expect.objectContaining({
        defaultPath: "/Users/me/Pictures",
        properties: ["openFile"],
        filters: [{ name: "PNG file", extensions: ["png"] }],
      }),
    );
  });

  it("returns undefined when the open dialog is canceled", async () => {
    mocks.dialog.showOpenDialog.mockResolvedValue({
      canceled: true,
      filePaths: [],
    });
    await load();

    await expect(invoke("open-file-dialog")).resolves.toBeUndefined();
  });

  it("logs the error when the open dialog fails", async () => {
    const error = new Error("dialog failed");
    mocks.dialog.showOpenDialog.mockRejectedValue(error);
    await load();

    await expect(invoke("open-file-dialog")).resolves.toBeUndefined();
    expect(mocks.log.log).toHaveBeenCalledWith(error);
  });

  it("shows the context menu", async () => {
    await load();

    invoke("show-context-menu");

    expect(mocks.menu.popup).toHaveBeenCalled();
  });
});

describe("auto update on macOS", () => {
  it("is not used on Windows and Linux", async () => {
    await load();

    expect(mocks.autoUpdater.checkForUpdates).not.toHaveBeenCalled();
    expect(mocks.autoUpdater.on).not.toHaveBeenCalled();
  });

  it("checks for updates without downloading automatically", async () => {
    await load({ platform: "darwin" });

    expect(mocks.autoUpdater.logger).toBe(mocks.log);
    expect(mocks.autoUpdater.autoDownload).toBe(false);
    expect(mocks.autoUpdater.checkForUpdates).toHaveBeenCalled();
  });

  it("does not check when notifications were turned off", async () => {
    await load({ platform: "darwin", store: { ask: false } });

    expect(mocks.autoUpdater.checkForUpdates).not.toHaveBeenCalled();
  });

  it("downloads the update when OK is chosen", async () => {
    mocks.dialog.showMessageBox.mockResolvedValue({
      response: 1,
      checkboxChecked: false,
    });
    await load({ platform: "darwin" });

    emitUpdater("update-available");

    await vi.waitFor(() =>
      expect(mocks.autoUpdater.downloadUpdate).toHaveBeenCalled(),
    );
  });

  it("stops asking when the user turns off notifications", async () => {
    mocks.dialog.showMessageBox.mockResolvedValue({
      response: 0,
      checkboxChecked: true,
    });
    await load({ platform: "darwin" });

    emitUpdater("update-available");

    await vi.waitFor(() =>
      expect(mocks.store.set).toHaveBeenCalledWith("ask", false),
    );
    expect(mocks.autoUpdater.downloadUpdate).not.toHaveBeenCalled();
  });

  it("keeps asking when the update is only postponed", async () => {
    mocks.dialog.showMessageBox.mockResolvedValue({
      response: 0,
      checkboxChecked: false,
    });
    await load({ platform: "darwin" });

    emitUpdater("update-available");
    await flush();

    expect(mocks.store.set).not.toHaveBeenCalledWith("ask", false);
    expect(mocks.autoUpdater.downloadUpdate).not.toHaveBeenCalled();
  });

  it("logs when no update is available", async () => {
    await load({ platform: "darwin" });

    emitUpdater("update-not-available");

    expect(mocks.log.info).toHaveBeenCalledWith("No updates available.");
  });

  it("installs the downloaded update after the message is closed", async () => {
    mocks.dialog.showMessageBox.mockResolvedValue({ response: 0 });
    await load({ platform: "darwin" });

    emitUpdater("update-downloaded");

    await vi.waitFor(() =>
      expect(mocks.autoUpdater.quitAndInstall).toHaveBeenCalled(),
    );
  });

  it("logs the error when the install message fails", async () => {
    mocks.dialog.showMessageBox.mockRejectedValue(new Error("failed"));
    await load({ platform: "darwin" });

    emitUpdater("update-downloaded");

    await vi.waitFor(() =>
      expect(mocks.log.info).toHaveBeenCalledWith(
        "Updater Error: Error: failed",
      ),
    );
    expect(mocks.autoUpdater.quitAndInstall).not.toHaveBeenCalled();
  });
});

describe("development mode", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "development");
  });

  it("enables DevTools and opens them when the window is ready", async () => {
    const win = await load();

    expect(win.options.webPreferences).toEqual(
      expect.objectContaining({ devTools: true }),
    );

    win.events["ready-to-show"]();

    expect(win.webContents.openDevTools).toHaveBeenCalledWith({
      mode: "detach",
    });
  });

  it("installs React Developer Tools", async () => {
    await load();

    expect(mocks.installExtension).toHaveBeenCalledWith(
      "react-developer-tools",
      { loadExtensionOptions: { allowFileAccess: true } },
    );
  });

  it("reads the icon from the dist folder", async () => {
    await load();

    expect(mocks.app.setAboutPanelOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        iconPath: path.join(process.cwd(), "dist", "images/icon.png"),
      }),
    );
  });
});
