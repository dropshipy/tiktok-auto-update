require("dotenv").config({ path: __dirname + "/../.env" });

const { app, BrowserWindow, ipcMain, dialog } = require("electron");

const path = require("node:path");

const express = require("express");
const { authenticateUserApp } = require("./function/browser/authenticate-app");
const ElectronStore = require("electron-store");
const {
  updateTikblastConfig,
  getTikblastConfig,
  getTikblastSubscriptions,
  postTikblastConfig,
  getTikblastTargetedConfig,
  updateTikblastTargetedConfig,
  postTikblastTargetedConfig,
  getCreatorTiktok,
  getWhatsappTemplate,
  updateWhatsappTemplate,
  postWhatsappTemplate,
  getEmailTemplate,
  updateEmailTemplate,
  postEmailTemplate,
  postWishListCreator,
  getWishListCreators,
  deleteWishListCreator,
  getSubscriptionCreator,
  getTiktokBuyers,
  getProductsByBuyer,
  getTiktokBuyersAdmin,
} = require("./api/interface");
const initializePage = require("./helpers/initialize-page");
const filterCreatorList = require("./function/chat-and-save-creators/filter-creator-list");
const chatAndSaveCreators = require("./function/chat-and-save-creators");
// const targetedCollaboration = require("./function/targeted-collaboration/targeted-collaboration");
const targetedCollaboration = require("./function/targeted-collaboration/targeted-collaboration-v2");
const replyReviews = require("./function/reply-reviews/reply-reviews");
const qrcode = require("qrcode");
const { Client, LocalAuth, NoAuth } = require("whatsapp-web.js");
const puppeteer = require("puppeteer-core");
const { exportDataToExcel } = require("./function/export-data-to-excel");
const buyerInfo = require("./function/adds-on/buyer-info");
const {
  COUNTRY_CODE,
  SELLER_BASE_URL,
  AFFILIATE_BASE_URL,
} = require("../constants/store.constant");

const store = new ElectronStore();

// determine chrome location
let chromePath = "invalid_os";
let isDev = process.resourcesPath.includes("node_modules");
let chromePathBasePath = process.resourcesPath;

if (isDev) {
  chromePathBasePath = "resources";
}

let arch = process.arch;

const selectedBrowser = store.get("browser-choice");

if (selectedBrowser && !selectedBrowser?.isChromium) {
  chromePath = selectedBrowser.browserPath;
} else {
  if (process.platform == "darwin") {
    if (arch == "arm64") {
      chromePath = path.join(
        chromePathBasePath,
        `chrome/chrome-mac-arm/Chromium.app/Contents/MacOS/Chromium`
        // `chrome/mac_arm-121.0.6167.85/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
      );
    } else {
      chromePath = path.join(
        chromePathBasePath,
        `chrome/mac-133.0.6859.0/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`
      );
    }
  } else if (process.platform == "win32") {
    chromePath = path.join(
      chromePathBasePath,
      `chrome/win64-130.0.6723.116/chrome-win64/chrome.exe`
    );
  }
}

console.log("Chromium executable path:", chromePath);

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      webSecurity: false,
      preload: path.join(__dirname, "preload.js"),
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["self"],
          scriptSrc: ["self"],
          styleSrc: ["self"],
        },
      },
    },
  });
  if (process.env.ENTRY_SOURCE === "dev_server") {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
    mainWindow.setFullScreen(true);
  } else {
    const appServer = express();

    // Specify the directory you want to serve files from
    const directoryPath = path.join(__dirname, "dist");

    // Serve all files in the specified directory
    appServer.use(express.static(directoryPath));

    // Start the server on a specific port (e.g., 9999)
    const PORT = process.env.PORT || 9999;
    appServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    mainWindow.loadURL("http://localhost:9999");
  }
}

app.on("ready", () => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  ipcMain.on("post-cookies-app", async (event, payload) => {
    await authenticateUserApp(payload);
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("get-subscription-info", async () => {
  try {
    const res = await getTikblastSubscriptions();
    const dataSubscription = store.get("account-subscription") || {};
    store.set("account-subscription", {
      ...dataSubscription,
      subscription: res.data?.data[0]?.code,
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching subscription info:", error);
    // Function to show a simple alert dialog
    dialog.showMessageBox({
      type: "info",
      title: "Error",
      message: error,
      buttons: ["OK"],
    });
    throw error;
  }
});

ipcMain.handle("get-tikblast-config", async (_, subscriptionId) => {
  try {
    const res = await getTikblastConfig(subscriptionId);
    return res.data;
  } catch (error) {
    console.error("Error fetching tikblast config:", error);
    dialog.showMessageBox({
      message: error,
      buttons: ["OK"],
    });
    throw error;
  }
});

ipcMain.handle("create-tikblast-config", async (_, config) => {
  try {
    const res = await postTikblastConfig(config);
    return res.data;
  } catch (error) {
    console.error("Error creating tikblast config:", error);
    dialog.showMessageBox({
      message: error,
      buttons: ["OK"],
    });
    throw error;
  }
});

ipcMain.handle("update-tikblast-config", async (_, config) => {
  try {
    const res = await updateTikblastConfig(config);
    return res.data;
  } catch (error) {
    console.error("Error updating tikblast config:", error);
    dialog.showMessageBox({
      message: error,
      buttons: ["OK"],
    });
    throw error;
  }
});

ipcMain.handle("get-creator-tiktok", async (_, data) => {
  try {
    const res = await getCreatorTiktok({ params: data });
    return res.data;
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

ipcMain.handle("export-data-to-excel", async (event, data) => {
  try {
    console.log(data);
    const { fileName, endpoint, params } = data;
    const resData = await exportDataToExcel(fileName, endpoint, params);
    return resData;
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

ipcMain.handle(
  "get-subscription-creator-tiktok",
  async (_, { subscriptionId, ...data }) => {
    try {
      const res = await getSubscriptionCreator(subscriptionId, {
        params: data,
      });
      return res.data;
    } catch (error) {
      console.log(error);
      dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    }
  }
);

ipcMain.handle("get-whatsapp-template", async (_, subscriptionId) => {
  try {
    const res = await getWhatsappTemplate(subscriptionId);
    return res.data;
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

ipcMain.handle("update-whatsapp-template", async (_, payload) => {
  try {
    const res = await updateWhatsappTemplate(payload);
    return res.data;
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

ipcMain.handle("create-whatsapp-template", async (_, payload) => {
  try {
    const res = await postWhatsappTemplate(payload);
    return res.data;
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

ipcMain.handle("get-email-template", async (_, subscriptionId) => {
  try {
    const res = await getEmailTemplate(subscriptionId);
    return res.data;
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

ipcMain.handle("update-email-template", async (_, payload) => {
  try {
    const res = await updateEmailTemplate(payload);
    return res.data;
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

ipcMain.handle("create-email-template", async (_, payload) => {
  try {
    const res = await postEmailTemplate(payload);
    return res.data;
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

ipcMain.handle(
  "create-wishlist-creator",
  async (_, { subscriptionId, ...payload }) => {
    try {
      const res = await postWishListCreator(subscriptionId, payload);
      return res.data;
    } catch (error) {
      console.log(error);
      dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    }
  }
);

ipcMain.handle("get-wishlist-creators", async (_, payload) => {
  try {
    const res = await getWishListCreators(payload);
    return res.data;
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

ipcMain.handle("delete-wishlist-creator", async (_, id) => {
  try {
    const res = await deleteWishListCreator(id);
    return res.data;
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

ipcMain.handle("chat-and-save-creators", async (_, config) => {
  try {
    const countryCode = store.get(COUNTRY_CODE).value;
    const affiliateBaseUrl = store.get(AFFILIATE_BASE_URL);
    const sellerBaseUrl = store.get(SELLER_BASE_URL);

    const { page, authBotResponse } = await initializePage({
      chromePath,
      sellerBaseUrl,
    });

    const requestData = {
      url: null,
      requestHeaders: null,
      requestPostData: null,
    };

    await page.setRequestInterception(true);

    page.on("request", async (request) => {
      if (
        request
          .url()
          .startsWith(
            `${affiliateBaseUrl}/api/v1/oec/affiliate/creator/marketplace`
          )
      ) {
        requestData.url = request.url();
        requestData.requestHeaders = request.headers();
        requestData.requestPostData = request.postData();
        request.continue();
      } else request.continue();
    });

    const shopId = await filterCreatorList({
      page,
      affiliateBaseUrl,
      countryCode,
      config,
    });

    while (requestData.url === null) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const listInvitedCreator = await chatAndSaveCreators({
      config,
      page,
      affiliateBaseUrl,
      countryCode,
      requestData,
      shopId,
      sessionId: authBotResponse?.sessionId,
    });
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
});

ipcMain.handle("start-replying-to-reviews", async (_, config) => {
  try {
    const sellerBaseUrl = store.get(SELLER_BASE_URL);

    const { page, authBotResponse } = await initializePage({
      chromePath,
      sellerBaseUrl,
    });

    const runReplyReviews = await replyReviews({
      config,
      page,
      sellerBaseUrl,
      sessionId: authBotResponse?.sessionId,
    });
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
});

ipcMain.handle("targeted-collaboration", async (_, config) => {
  try {
    const countryCode = store.get(COUNTRY_CODE).value;
    const affiliateBaseUrl = store.get(AFFILIATE_BASE_URL);
    const sellerBaseUrl = store.get(SELLER_BASE_URL);
    const { page } = await initializePage({ chromePath, sellerBaseUrl });

    page.on("dialog", async (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);

      try {
        if (dialog.message() === "") {
          await dialog.accept();
        }
      } catch (error) {
        console.log("Error accepting dialog:", error);
      }
    });

    await targetedCollaboration({
      page,
      affiliateBaseUrl,
      countryCode,
      config,
    });
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
});

// Order and Buyers info
ipcMain.handle("start-get-buyers-info", async (_, config) => {
  try {
    const sellerBaseUrl = store.get(SELLER_BASE_URL);
    const targetCreated = [
      `${sellerBaseUrl}/order/return?`,
      `${sellerBaseUrl}/chat?`,
    ];
    const { page, browser } = await initializePage({
      chromePath,
      sellerBaseUrl,
    });

    browser.on("targetcreated", async (target) => {
      const newPage = await target.page();
      if (newPage) {
        const url = newPage.url();
        console.log(`Open new Tab: ${url}`);

        if (url.includes(targetCreated[0])) {
          console.log('Closing "Order Return page"');
          await newPage.close();
          await page.goBack();
          await page.goForward();
        } else if (url.includes(targetCreated[1])) {
          await newPage.close();
          console.log('Closing "Chat page"');
        }
      }
    });

    const res = await buyerInfo({ page, browser, sellerBaseUrl, ...config });
    console.log("Result :", res.data);
    console.log("Result length:", res.data.length);
    return res;
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
});

ipcMain.handle("get-buyers-info", async (_, data) => {
  const dataBuyers = await getTiktokBuyers(data);
  return dataBuyers.data;
});

ipcMain.handle("get-buyers-admin", async (_, data) => {
  const dataBuyers = await getTiktokBuyersAdmin(data);
  return dataBuyers.data;
});

ipcMain.handle("get-buyer-products", async (_, tiktokBuyerId) => {
  try {
    const res = await getProductsByBuyer(tiktokBuyerId);
    return res.data;
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
});

// Whatsapp
let waClient;
let clientReadyPromise;
let isAuthenticated = false;
const wwebVersion = "2.2412.54";

const getBrowserWSEndpoint = async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: chromePath,
    });

    const endpoint = browser.wsEndpoint();
    return endpoint;
  } catch (error) {
    console.log(error);
  }
};

const addEventListeners = async () => {
  try {
    waClient.on("qr", (qr) => {
      console.log("QR RECEIVED", qr);
      qrcode.toDataURL(qr, (err, url) => {
        mainWindow.webContents.send("wa-qr", url);
      });
    });
    waClient.on("authenticated", () => {
      isAuthenticated = true;
      console.log("WhatsApp client is authenticated.");
      mainWindow.webContents.send("wa-authenticated", true);
    });

    waClient.on("auth_failure", (msg) => {
      isAuthenticated = false;
      console.error("Authentication failure:", msg);
      mainWindow.webContents.send("wa-authenticated", false);
    });

    waClient.on("disconnected", () => {
      isAuthenticated = false;
      console.log("WhatsApp client disconnected.");
      mainWindow.webContents.send("wa-authenticated", false);
    });
    clientReadyPromise = new Promise((resolve) => {
      waClient.on("ready", () => {
        console.log("Client is ready!");
        resolve();
      });
    });
  } catch (error) {
    console.log("error in addEventListeners", error);
  }
};

ipcMain.handle("wa-check-auth-status", async () => {
  try {
    console.log("wa-check-auth-status");
    const browserWSEndpoint = await getBrowserWSEndpoint();
    waClient = new Client({
      authStrategy: new NoAuth(),
      puppeteer: {
        // browserWSEndpoint: browserWSEndpoint,
        args: [
          "--no-sandbox",
          "--no-first-run",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--single-process",
          "--no-zygote",
        ],
      },
      // webVersionCache: {
      //   type: "remote",
      //   remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
      // },
    });
    const state = async () => {
      try {
        const state = await waClient.getState();
        console.log({ state });
      } catch (error) {
        console.log("error state :", error);
      }
    };
    if (state === "CONNECTED") {
      return true;
    } else return false;
  } catch (error) {
    console.log({ error });
    return error;
  }
});

ipcMain.handle("wa-initialize-client", async (event) => {
  console.log("Initializing WhatsApp client... test", waClient);

  try {
    const browserWSEndpoint = await getBrowserWSEndpoint();
    waClient = new Client({
      authStrategy: new NoAuth(),
      puppeteer: {
        browserWSEndpoint: browserWSEndpoint,
        args: [
          "--no-sandbox",
          "--no-first-run",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--single-process",
          "--no-zygote",
        ],
      },
      webVersionCache: {
        type: "remote",
        remotePath: `https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/${wwebVersion}.html`,
      },
    });
    waClient.initialize();
    addEventListeners();
  } catch (error) {
    console.error("Error:", error);
  }
});

ipcMain.handle("wa-send-message", async (event, { phoneNumber, message }) => {
  try {
    await clientReadyPromise;

    console.log({ phoneNumber, message });

    const chatId = `${phoneNumber}@c.us`;

    waClient.sendMessage(chatId, message);
    return { status: "success", message: "Pesan terkirim" };
  } catch (error) {
    console.error("Error sending message:", error);
    return { status: "error", message: "Gagal mengirim pesan" };
  }
});

ipcMain.handle("wa-logout", async () => {
  try {
    const state = await waClient?.getState();
    if (state === "CONNECTED") {
      await waClient.logout();
    }
    isAuthenticated = false;
    return { status: "success", message: "Berhasil logout" };
  } catch (error) {
    console.error("Error logging out:", error);
    return { status: "error", message: "Gagal logout" };
  }
});
