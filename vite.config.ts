/// <reference types="vitest" />
import { defineConfig } from "vite"
// import million from "million/compiler"
// import MillionLint from "@million/lint"
import react from "@vitejs/plugin-react-swc"
import UnoCSS from "unocss/vite"
import Pages from "vite-plugin-pages"
import wasm from "vite-plugin-wasm"
import basicSsl from "@vitejs/plugin-basic-ssl"
import wasmPack from "vite-plugin-wasm-pack"

export default defineConfig({
  plugins: [
    // MillionLint.vite(),
    // million.vite({ auto: true }),
    react(),
    wasm(),
    UnoCSS(),
    Pages({ extensions: ["tsx"] }),
    basicSsl(),
    wasmPack("./parse-xlsx")
  ],
  build: {
    commonjsOptions: { transformMixedEsModules: true }
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000"
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupVitest.ts",
    coverage: {
      provider: "v8"
    },
    server: {
      deps: {
        inline: ["@govbr-ds/core"]
      }
    }
  }
})
