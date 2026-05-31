const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const realtimeShim = path.resolve(__dirname, "src/services/realtime-web-shim.ts");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force zustand CJS build — ESM build uses import.meta which Metro can't handle
  if (moduleName === "zustand" || moduleName.startsWith("zustand/")) {
    const sub = moduleName === "zustand" ? "index" : moduleName.slice("zustand/".length);
    return {
      type: "sourceFile",
      filePath: path.resolve(__dirname, "node_modules/zustand", `${sub}.js`),
    };
  }

  if (platform === "web" && moduleName.startsWith("@supabase/realtime-js")) {
    return { type: "sourceFile", filePath: realtimeShim };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
