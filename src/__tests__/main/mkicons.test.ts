import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import type Store from "electron-store";
import {
  BEZIER,
  BICUBIC,
  clearCache,
  createICNS,
  createICO,
  NEAREST_NEIGHBOR,
} from "png2icons";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { mkicns, mkico } from "../../mkicons";

const mocks = vi.hoisted(() => ({ getPath: vi.fn() }));

vi.mock("electron", () => ({ app: { getPath: mocks.getPath } }));

vi.mock("png2icons", () => ({
  NEAREST_NEIGHBOR: 0,
  BICUBIC: 2,
  BEZIER: 3,
  clearCache: vi.fn(),
  setLogger: vi.fn(),
  createICO: vi.fn(),
  createICNS: vi.fn(),
}));

const createStore = (values: Partial<StoreType>) =>
  ({
    get: (key: keyof StoreType, defaultValue?: unknown) =>
      key in values ? values[key] : defaultValue,
  }) as unknown as Store<StoreType>;

const INPUT = Buffer.from("input png data");
const ICO = Buffer.from("ico data");
const ICNS = Buffer.from("icns data");

let workDir: string;
let desktopDir: string;
let input: string;

beforeEach(() => {
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), "elephicon-mkicons-"));
  desktopDir = path.join(workDir, "Desktop");
  fs.mkdirSync(desktopDir);

  input = path.join(workDir, "icon.png");
  fs.writeFileSync(input, INPUT);

  mocks.getPath.mockImplementation((name: string) => {
    if (name === "desktop") return desktopDir;
    throw new Error(`unexpected path name: ${name}`);
  });

  vi.mocked(createICO).mockReturnValue(ICO);
  vi.mocked(createICNS).mockReturnValue(ICNS);
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  fs.rmSync(workDir, { recursive: true, force: true });
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("mkico", () => {
  it("writes the ICO file to the desktop by default", async () => {
    const result = await mkico(input, createStore({}));

    expect(result).toEqual({ type: "success", log: "icon.ico", desktop: true });
    expect(fs.readFileSync(path.join(desktopDir, "icon.ico"))).toEqual(ICO);
    expect(clearCache).toHaveBeenCalled();
  });

  it("writes the ICO file next to the input when desktop is off", async () => {
    const result = await mkico(input, createStore({ desktop: false }));

    expect(result).toEqual({
      type: "success",
      log: "icon.ico",
      desktop: false,
    });
    expect(fs.readFileSync(path.join(workDir, "icon.ico"))).toEqual(ICO);
    expect(fs.existsSync(path.join(desktopDir, "icon.ico"))).toBe(false);
  });

  it("uses the high quality and BMP settings by default", async () => {
    await mkico(input, createStore({}));

    expect(createICO).toHaveBeenCalledWith(INPUT, BEZIER, 0, false, true);
  });

  it("passes the quality and PNG settings from the store", async () => {
    await mkico(input, createStore({ quality: 0, bmp: false }));
    expect(createICO).toHaveBeenLastCalledWith(
      INPUT,
      NEAREST_NEIGHBOR,
      0,
      true,
      false,
    );

    await mkico(input, createStore({ quality: 1 }));
    expect(createICO).toHaveBeenLastCalledWith(INPUT, BICUBIC, 0, false, true);
  });

  it("rejects and writes nothing when the conversion fails", async () => {
    vi.mocked(createICO).mockReturnValue(null);

    await expect(mkico(input, createStore({}))).rejects.toThrow();
    expect(fs.existsSync(path.join(desktopDir, "icon.ico"))).toBe(false);
  });

  it("rejects when the input file does not exist", async () => {
    await expect(
      mkico(path.join(workDir, "missing.png"), createStore({})),
    ).rejects.toThrow();
    expect(createICO).not.toHaveBeenCalled();
  });
});

describe("mkicns", () => {
  it("writes the ICNS file to the desktop by default", async () => {
    const result = await mkicns(input, createStore({}));

    expect(result).toEqual({
      type: "success",
      log: "icon.icns",
      desktop: true,
    });
    expect(fs.readFileSync(path.join(desktopDir, "icon.icns"))).toEqual(ICNS);
    expect(clearCache).toHaveBeenCalled();
  });

  it("writes the ICNS file next to the input when desktop is off", async () => {
    await mkicns(input, createStore({ desktop: false }));

    expect(fs.readFileSync(path.join(workDir, "icon.icns"))).toEqual(ICNS);
  });

  it("passes the quality setting from the store", async () => {
    await mkicns(input, createStore({}));
    expect(createICNS).toHaveBeenLastCalledWith(INPUT, BEZIER, 0);

    await mkicns(input, createStore({ quality: 0 }));
    expect(createICNS).toHaveBeenLastCalledWith(INPUT, NEAREST_NEIGHBOR, 0);
  });

  it("rejects and writes nothing when the conversion fails", async () => {
    vi.mocked(createICNS).mockReturnValue(null);

    await expect(mkicns(input, createStore({}))).rejects.toThrow();
    expect(fs.existsSync(path.join(desktopDir, "icon.icns"))).toBe(false);
  });
});
