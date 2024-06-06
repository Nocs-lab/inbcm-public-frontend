import { defineConfig } from "vite"
// import million from "million/compiler"
// import MillionLint from "@million/lint"
import react from "@vitejs/plugin-react-swc"
import UnoCSS from "unocss/vite"
import Pages from "vite-plugin-pages"
import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"
import { comlink } from "vite-plugin-comlink"
import basicSsl from "@vitejs/plugin-basic-ssl"
import wasmPack from "vite-plugin-wasm-pack"

export default defineConfig({
  plugins: [
    // MillionLint.vite(),
    // million.vite({ auto: true }),
    react(),
    comlink(),
    wasm(),
    topLevelAwait(),
    UnoCSS(),
    Pages({ extensions: ["tsx"] }),
    basicSsl(),
    wasmPack("./parse-xlsx")
  ],
  worker: {
    plugins: () => ([
      comlink(),
      wasm(),
      topLevelAwait()
    ])
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true }
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000"
    }
  }
})
