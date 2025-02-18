const os = require("os");
const { authenticateBot } = require("../api/interface");
const ElectronStore = require("electron-store");
const store = new ElectronStore();
const { updateSubscriptionStatus } = require("../api/interface");
const { dialog } = require("electron");
const { handleLanguage } = require("./handle-language");
const {
  TIKTOK_ACCOUNT_STORE_KEY,
  TIKTOK_COOKIES_ACCOUNT_STORE_KEY,
} = require("../constants/store.constant");
const { waitForTimeout } = require("../helpers/utils");

async function saveCookies(page, account) {
  const cookiesTiktok = store.get(TIKTOK_COOKIES_ACCOUNT_STORE_KEY) || [];
  const cookies = await page.cookies();

  if (!account || !account.email) {
    console.error("Email akun tidak ditemukan!");
  } else {
    const payload = { email: account.email, cookie: cookies };

    const emailExists = cookiesTiktok.some(
      (item) => item.email === account.email
    );

    if (!emailExists) {
      cookiesTiktok.push(payload);
      store.set(TIKTOK_COOKIES_ACCOUNT_STORE_KEY, cookiesTiktok);
      console.log("Cookie baru ditambahkan untuk:", account.email);
    } else {
      console.log(
        "Email sudah ada dalam daftar cookies, tidak ditambahkan ulang."
      );
    }
  }
}

async function loadCookiesTiktok(page, account) {
  await page.setCookie(...account.cookie);
}

async function authenticateBotStatus(page, browser) {
  const accountSubscription = store.get("account-subscription");
  console.log({ accountSubscription });

  // fetch fingerprint
  const osVersion = os.version();
  const osArch = os.arch();
  const osPlatform = os.platform();
  const osType = os.type();
  const osRelease = os.release();
  const osHostName = os.hostname();
  const osHomeDir = os.homedir();
  const osCpus = JSON.stringify(
    os.cpus().map((o) => ({ model: o.model, speed: o.speed }))
  );
  const osTotalMem = os.totalmem();
  const osUserInfo = JSON.stringify(os.userInfo());
  const osEndianess = os.endianness();
  if (accountSubscription) {
    const payloadAuthBot = {
      email: accountSubscription.email,
      password: accountSubscription.password,
      subscriptionCode: accountSubscription.subscription,
      device_info: osVersion,
      fingerprint: {
        architecture: osArch,
        platform: osPlatform,
        release: osRelease,
        hostName: osHostName,
        homeDir: osHomeDir,
      },
      fingerprintV2: {
        osArch: osArch,
        osPlatform: osPlatform,
        osType: osType,
        osCpus: osCpus,
        osTotalMem: osTotalMem,
        osEndianess: osEndianess,
        osUserInfo: osUserInfo,
      },
    };
    try {
      const authenticateBotCookie = store.get("cookies-app");
      const authenticateBotRes = await authenticateBot(payloadAuthBot, {
        headers: {
          Cookie: authenticateBotCookie,
        },
      });

      if (authenticateBotRes?.status == 405) {
        await page.evaluate(() => {
          window.alert("The account is already connected to another device.");
        });
        await browser.close();
      } else if (authenticateBotRes?.status == 404) {
        await page.evaluate(() => {
          window.alert("Email not found.");
        });
        await browser.close();
      } else if (authenticateBotRes?.status == 403) {
        await page.evaluate(() => {
          window.alert(
            "Incorrect email/password. Check the user info data again on the application account page."
          );
        });
        await browser.close();
      } else {
        const subscriptionData = authenticateBotRes.user.subscription;
        const authenticateBotResponse = {
          sessionId: authenticateBotRes?.sessionId,
          subscriptionData: authenticateBotRes.user,
        };

        if (subscriptionData.status !== "active") {
          await page.evaluate((subscriptionData) => {
            window.alert(
              `Subscription status ${subscriptionData.code} is inactive. Check subscription status in the dashboard menu or contact the admin.`
            );
          }, subscriptionData);
          await browser.close();
        } else if (subscriptionData.expiredAt) {
          const today = new Date();
          const expiryDate = new Date(subscriptionData.expiredAt);
          const data = {
            status: "inactive",
          };
          if (subscriptionData.status === "active" && today > expiryDate) {
            await updateSubscriptionStatus(data, {
              headers: {
                Cookie: "connect.sid=" + authenticateBotResponse.sessionId,
              },
              params: {
                id: subscriptionData.id,
              },
            });
            await page.evaluate((subscriptionData) => {
              window.alert(
                `Subscription ID ${subscriptionData.code} has expired. Contact the admin if you want to continue subscribing.`
              );
            }, subscriptionData);
            await browser.close();
          }
        }
        return authenticateBotResponse;
      }
    } catch (error) {
      console.log({ error });
      dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
      await page.evaluate(() => {
        window.alert("Failed to connect");
      });
      await browser.close();
      console.log(error);
    }
  } else {
    await page.evaluate(() => {
      window.alert("Subscription data not found. Try logging in again.");
    });
    await browser.close();
  }
}

async function loginTiktokSeller(page, browser, sellerBaseUrl) {
  const resBotStatus = await authenticateBotStatus(page, browser);
  try {
    const cookiesTiktok = store.get(TIKTOK_COOKIES_ACCOUNT_STORE_KEY) || [];
    const account = store.get(TIKTOK_ACCOUNT_STORE_KEY);

    const accountCookie = cookiesTiktok.find(
      (item) => item.email === account.email
    );

    if (accountCookie) {
      try {
        console.log("Cookies found. Logging in...");
        await loadCookiesTiktok(page, accountCookie);

        // await Promise.all([
        //   page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 0 }),
        //   page.goto(sellerBaseUrl, {
        //     waitUntil: "networkidle2",
        //     timeout: 0,
        //   }),
        // ]);
        await page.goto(sellerBaseUrl);
        await waitForTimeout(4000);

        const currentUrl = await page.url();
        if (currentUrl.includes("/register")) {
          await page.evaluate(() => {
            window.alert(
              "Cookies/Account are useless in current countrie, please adjust your account and country.\nIf it still doesn't work, try deleting your current account login session."
            );
          });
          await browser.close();
          console.log("Cookies tidak sesuai dengan negara");
        } else {
          await handleLanguage(page);
        }
      } catch (error) {
        dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
        console.log(error);
      }
    } else {
      console.log("No cookies found. Logging in...");

      try {
        await page.goto(`${sellerBaseUrl}/account/login`, {
          timeout: 0,
        });
        await page.waitForSelector("#TikTok_Ads_SSO_Login_Email_Panel_Button");
        await page.evaluate(() => {
          const loginWithEmailButton = document.querySelector(
            "#TikTok_Ads_SSO_Login_Email_Panel_Button"
          );
          if (loginWithEmailButton) {
            loginWithEmailButton.click();
          } else {
            throw new Error("can't find login with email button");
          }
        });

        await page.waitForSelector("#TikTok_Ads_SSO_Login_Btn");

        const inputEmailSelector = "#TikTok_Ads_SSO_Login_Email_Input";
        await page.focus(inputEmailSelector);
        await page.type(inputEmailSelector, account.email, {
          delay: 100,
        });

        const inputPasswordSelector = "#TikTok_Ads_SSO_Login_Pwd_Input";
        await page.focus(inputPasswordSelector);
        await page.type(inputPasswordSelector, account.password, {
          delay: 100,
        });

        const loginSellerWithEmailButton = await page.$(
          "#TikTok_Ads_SSO_Login_Btn"
        );

        if (loginSellerWithEmailButton) {
          await loginSellerWithEmailButton.click();
        }

        await page.waitForNavigation({
          waitUntil: "networkidle2",
          timeout: 0,
        });
        await handleLanguage(page);

        console.log("Logged in successfully. Saving cookies...");
        await saveCookies(page, account);
      } catch (error) {
        console.error("Error during login:", error);
      }
    }
    return resBotStatus;
  } catch (error) {
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
    console.error("Error in the main process:", error);
  }
}

module.exports = { loginTiktokSeller };
