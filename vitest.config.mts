import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "main",
          environment: "node",
          include: ["src/__tests__/main/**/*.test.ts"],
        },
      },
      {
        test: {
          name: "renderer",
          environment: "jsdom",
          include: ["src/__tests__/renderer/**/*.test.tsx"],
          setupFiles: ["src/__tests__/renderer/setup.ts"],
          // CSS だけのパッケージを Vite 経由で読み込み、中身を空にする
          server: { deps: { inline: ["typeface-roboto"] } },
        },
      },
    ],
  },
});
