import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

/**
 * Opargo Admin MFE (port 3005)
 * Consumes sharedUi as a file: library — does NOT duplicate SharedUI components/services.
 *
 * Shell remotes.opargoAdmin → http://localhost:3005/remoteEntry.js → exposes ./OpargoAdminApp
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const OPARGO_PROXY_TARGET =
    env.VITE_OPARGO_PROXY_TARGET || "http://192.167.50.163:8091";

  return {
    plugins: [
      federation({
        name: "opargoAdmin",
        dts: false,
        filename: "remoteEntry.js",
        exposes: {
          "./OpargoAdminApp": "./src/App.jsx",
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: "^19.2.7",
          },
          "react-dom": {
            singleton: true,
            requiredVersion: "^19.2.7",
          },
          "react-router-dom": {
            singleton: true,
            requiredVersion: "^7.18.1",
          },
        },
      }),
      react(),
    ],

    server: {
      host: "0.0.0.0",
      port: 3005,
      strictPort: true,
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      proxy: {
        "/opargoapp": {
          target: OPARGO_PROXY_TARGET,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    preview: {
      host: "0.0.0.0",
      port: 3005,
      strictPort: true,
      cors: true,
    },

    build: {
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
  };
});
