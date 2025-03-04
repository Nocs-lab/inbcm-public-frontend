import { defineConfig } from "vite"
import MillionLint from "@million/lint"
import react from "@vitejs/plugin-react-swc"
import UnoCSS from "unocss/vite"
import Pages from "vite-plugin-pages"
import basicSsl from "@vitejs/plugin-basic-ssl"
import { transformerCompileClass } from "unocss"

export default defineConfig({
  plugins: [
    MillionLint.vite(),
    react(),
    UnoCSS({ transformers: [transformerCompileClass()] }),
    Pages({ extensions: ["tsx"] }),
    basicSsl()
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
