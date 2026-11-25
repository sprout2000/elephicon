import type {
  BrowserWindow,
  MenuItemConstructorOptions as Item,
} from "electron";
import type Store from "electron-store";
import i18next from "i18next";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { createMenu } from "../../createMenu";
import { languages } from "../../languages";
import en from "../../locales/en.json";

const mocks = vi.hoisted(() => ({
  buildFromTemplate: vi.fn((template: unknown) => template),
  showOpenDialog: vi.fn(),
  showMessageBox: vi.fn(),
  openExternal: vi.fn(),
  relaunch: vi.fn(),
  exit: vi.fn(),
  showAboutPanel: vi.fn(),
  getPath: vi.fn(() => "/Users/me/Pictures"),
}));

vi.mock("electron", () => ({
  app: {
    getPath: mocks.getPath,
    relaunch: mocks.relaunch,
    exit: mocks.exit,
    showAboutPanel: mocks.showAboutPanel,
  },
  dialog: {
    showOpenDialog: mocks.showOpenDialog,
    showMessageBox: mocks.showMessageBox,
  },
  Menu: { buildFromTemplate: mocks.buildFromTemplate },
  shell: { openExternal: mocks.openExternal },
}));

const originalPlatform = process.platform;

const setPlatform = (platform: NodeJS.Platform) => {
  Object.defineProperty(process, "platform", {
    value: platform,
    configurable: true,
  });
};

const createStore = (values: Partial<StoreType>) => {
  const set = vi.fn();
  const store = {
    get: (key: keyof StoreType) => values[key],
    set,
  } as unknown as Store<StoreType>;

  return { store, set };
};

const send = vi.fn();
const win = { webContents: { send } } as unknown as BrowserWindow;

const build = (values: Partial<StoreType> = {}) => {
  const { store, set } = createStore({
    quality: 2,
    bmp: true,
    desktop: true,
    language: "en",
    ...values,
  });
  const template = createMenu(win, store) as unknown as Item[];

  return { template, set };
};

const flatten = (items: Item[]): Item[] =>
  items.flatMap((item) => [
    item,
    ...(Array.isArray(item.submenu) ? flatten(item.submenu) : []),
  ]);

const findById = (template: Item[], id: string) => {
  const item = flatten(template).find((i) => i.id === id);
  if (!item) throw new Error(`menu item not found: ${id}`);
  return item;
};

const findByLabel = (template: Item[], label: string) => {
  const item = flatten(template).find((i) => i.label === label);
  if (!item) throw new Error(`menu item not found: ${label}`);
  return item;
};

const click = (item: Item) => (item.click as unknown as () => unknown)();

const flushImmediate = () =>
  new Promise<void>((resolve) => setImmediate(resolve));

beforeAll(async () => {
  await i18next.init({ lng: "en", resources: { en: { translation: en } } });
});

beforeEach(() => {
  setPlatform("linux");
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  setPlatform(originalPlatform);
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("createMenu", () => {
  it("builds File, Settings and Help menus on Windows and Linux", () => {
    const { template } = build();

    expect(template.map((item) => item.label)).toEqual([
      "File",
      "Settings",
      "Help",
    ]);
    expect(findByLabel(template, "About Elephicon").accelerator).toBe("Ctrl+I");
    expect(findByLabel(template, "Quit Elephicon").role).toBe("quit");
  });

  it("shows the about panel from the Help menu on Windows and Linux", () => {
    const { template } = build();

    click(findByLabel(template, "About Elephicon"));

    expect(mocks.showAboutPanel).toHaveBeenCalled();
  });

  it("adds the app menu on macOS", () => {
    setPlatform("darwin");
    const { template } = build();

    expect(template.map((item) => item.label)).toEqual([
      "Elephicon",
      "File",
      "Settings",
      "Help",
    ]);
    expect(findByLabel(template, "Close").role).toBe("close");
    expect(findByLabel(template, "About Elephicon").role).toBe("about");
  });

  it("checks the radio items that match the store", () => {
    const { template } = build({
      quality: 1,
      bmp: false,
      desktop: false,
      language: "ja",
    });

    expect(findById(template, "mid").checked).toBe(true);
    expect(findById(template, "high").checked).toBe(false);
    expect(findById(template, "png").checked).toBe(true);
    expect(findById(template, "bmp").checked).toBe(false);
    expect(findById(template, "current").checked).toBe(true);
    expect(findById(template, "desktop").checked).toBe(false);
    expect(findById(template, "language-ja").checked).toBe(true);
    expect(findById(template, "language-en").checked).toBe(false);
  });

  it("lists every language in the order of languages.ts", () => {
    const { template } = build();
    const items = flatten(template).filter((item) =>
      item.id?.startsWith("language-"),
    );

    expect(items.map((item) => [item.id, item.label])).toEqual(
      languages.map(({ code, label }) => [`language-${code}`, label]),
    );
  });

  it("saves the quality and ICO format settings", () => {
    const { template, set } = build();

    click(findById(template, "low"));
    expect(set).toHaveBeenLastCalledWith("quality", 0);

    click(findById(template, "mid"));
    expect(set).toHaveBeenLastCalledWith("quality", 1);

    click(findById(template, "high"));
    expect(set).toHaveBeenLastCalledWith("quality", 2);

    click(findById(template, "png"));
    expect(set).toHaveBeenLastCalledWith("bmp", false);

    click(findById(template, "bmp"));
    expect(set).toHaveBeenLastCalledWith("bmp", true);
  });

  it("saves the destination and notifies the renderer", () => {
    const { template, set } = build();

    click(findById(template, "current"));
    expect(set).toHaveBeenLastCalledWith("desktop", false);
    expect(send).toHaveBeenLastCalledWith("set-desktop", false);

    click(findById(template, "desktop"));
    expect(set).toHaveBeenLastCalledWith("desktop", true);
    expect(send).toHaveBeenLastCalledWith("set-desktop", true);
  });

  it("restarts the app after changing the language when OK is chosen", async () => {
    mocks.showMessageBox.mockResolvedValue({ response: 0 });
    const { template, set } = build();

    click(findById(template, "language-de"));

    expect(set).toHaveBeenCalledWith("language", "de");
    await vi.waitFor(() => expect(mocks.relaunch).toHaveBeenCalled());
    expect(mocks.exit).toHaveBeenCalledWith(0);
  });

  it("does not restart when Later is chosen", async () => {
    mocks.showMessageBox.mockResolvedValue({ response: 1 });
    const { template, set } = build();

    click(findById(template, "language-de"));
    await flushImmediate();
    await flushImmediate();

    expect(set).toHaveBeenCalledWith("language", "de");
    expect(mocks.relaunch).not.toHaveBeenCalled();
  });

  it("does nothing when the current language is chosen", () => {
    const { template, set } = build({ language: "en" });

    click(findById(template, "language-en"));

    expect(set).not.toHaveBeenCalled();
    expect(mocks.showMessageBox).not.toHaveBeenCalled();
  });

  it("sends the chosen file to the renderer from File > Open", async () => {
    mocks.showOpenDialog.mockResolvedValue({
      canceled: false,
      filePaths: ["/Users/me/icon.png"],
    });
    const { template } = build();

    await click(findByLabel(template, "Open..."));

    expect(mocks.showOpenDialog).toHaveBeenCalledWith(
      win,
      expect.objectContaining({ defaultPath: "/Users/me/Pictures" }),
    );
    expect(send).toHaveBeenCalledWith("menu-open", "/Users/me/icon.png");
  });

  it("sends nothing when the open dialog is canceled", async () => {
    mocks.showOpenDialog.mockResolvedValue({ canceled: true, filePaths: [] });
    const { template } = build();

    await click(findByLabel(template, "Open..."));

    expect(send).not.toHaveBeenCalled();
  });

  it("logs the error when the open dialog fails", async () => {
    const error = new Error("dialog failed");
    mocks.showOpenDialog.mockRejectedValue(error);
    const { template } = build();

    await click(findByLabel(template, "Open..."));

    expect(console.log).toHaveBeenCalledWith(error);
    expect(send).not.toHaveBeenCalled();
  });

  it("opens the support page", () => {
    const { template } = build();

    click(findByLabel(template, "Support URL..."));

    expect(mocks.openExternal).toHaveBeenCalledWith(
      "https://github.com/sprout2000/elephicon/#readme",
    );
  });
});
