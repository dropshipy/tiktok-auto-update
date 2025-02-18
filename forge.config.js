require("dotenv").config();
const { join } = require("path");

module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: [join(__dirname, "resources", "chrome")],
    icon: `./app-electron/assets/icons/logo-tiksender.png`, // "tiksender" || "supportseller"
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32", "darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
  ],
  electronUpdater: {
    provider: "github",
    owner: "dropshipy", // Ganti dengan username GitHub kamu
    repo: "tiktok-auto-update", // Ganti dengan nama repository GitHub kamu
    updateCheckInterval: "1 minute",
  },
};
