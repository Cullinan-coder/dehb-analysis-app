const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

const realtimeShim = path.resolve(__dirname, "src/services/realtime-web-shim.ts");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName.startsWith("@supabase/realtime-js")) {
    return { type: "sourceFile", filePath: realtimeShim };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
