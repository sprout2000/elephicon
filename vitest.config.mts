import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/__tests__/**/*.test.{ts,tsx}"],
    setupFiles: ["src/__tests__/setup.ts"],
    // CSS だけのパッケージを Vite 経由で読み込み、中身を空にする
    server: { deps: { inline: ["typeface-roboto"] } },
    coverage: {
      provider: "v8",
      // テストのないファイルも 0% として表に出す
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/__tests__/**", "src/@types/**"],
      reporter: ["text", "html"],
    },
  },
});
