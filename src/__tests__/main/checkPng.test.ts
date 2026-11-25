import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { checkPng, hasPngSignature } from "../../checkPng";

const PNG_HEADER = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const PNG_DATA = Buffer.concat([PNG_HEADER, Buffer.from("IHDR...")]);
const JPEG_DATA = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46,
]);

let dir: string;

const write = (name: string, data: Buffer) => {
  const filepath = path.join(dir, name);
  fs.writeFileSync(filepath, data);
  return filepath;
};

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "elephicon-checkpng-"));
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("hasPngSignature", () => {
  it("returns true when the file starts with the PNG signature", async () => {
    await expect(hasPngSignature(write("real.png", PNG_DATA))).resolves.toBe(
      true,
    );
  });

  it("returns true for exactly the 8-byte signature", async () => {
    await expect(
      hasPngSignature(write("header-only.png", PNG_HEADER)),
    ).resolves.toBe(true);
  });

  it("returns false for other formats", async () => {
    await expect(hasPngSignature(write("photo.jpg", JPEG_DATA))).resolves.toBe(
      false,
    );
  });

  it("returns false for files shorter than the signature", async () => {
    await expect(
      hasPngSignature(write("short.png", PNG_HEADER.subarray(0, 4))),
    ).resolves.toBe(false);
  });

  it("returns false for empty files", async () => {
    await expect(
      hasPngSignature(write("empty.png", Buffer.alloc(0))),
    ).resolves.toBe(false);
  });

  it("rejects when the file does not exist", async () => {
    await expect(
      hasPngSignature(path.join(dir, "missing.png")),
    ).rejects.toThrow();
  });
});

describe("checkPng", () => {
  it("returns null for a real PNG file", async () => {
    await expect(checkPng(write("ok.png", PNG_DATA))).resolves.toBeNull();
  });

  it("returns null for PNG data even if the extension is not .png", async () => {
    await expect(checkPng(write("renamed.jpg", PNG_DATA))).resolves.toBeNull();
  });

  it("detects a spoofed .png extension", async () => {
    await expect(checkPng(write("spoofed.png", JPEG_DATA))).resolves.toBe(
      "This file has a .png extension, but it is not a PNG image.",
    );
  });

  it("detects a spoofed extension regardless of letter case", async () => {
    await expect(checkPng(write("SPOOFED.PNG", JPEG_DATA))).resolves.toBe(
      "This file has a .png extension, but it is not a PNG image.",
    );
  });

  it("reports the format guessed from the extension", async () => {
    await expect(checkPng(write("photo.jpeg", JPEG_DATA))).resolves.toBe(
      "Unsupported format: image/jpeg",
    );
  });

  it("reports Unknown when the extension is missing", async () => {
    await expect(checkPng(write("no-extension", JPEG_DATA))).resolves.toBe(
      "Unsupported format: Unknown",
    );
  });

  it("reports a read error when the file does not exist", async () => {
    await expect(checkPng(path.join(dir, "missing.png"))).resolves.toBe(
      "Could not read the file.",
    );
  });

  it("reports a read error for a directory", async () => {
    const sub = path.join(dir, "folder.png");
    fs.mkdirSync(sub);

    await expect(checkPng(sub)).resolves.toBe("Could not read the file.");
  });
});
