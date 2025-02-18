const puppeteer = require("puppeteer");
const { loginTiktokSeller } = require("../function/login");
const addExposeFunctions = require("./expose-functions");

const DEFAULT_TIMEOUT = 60_000 * 1; // 1 minutes

const initializePage = async ({ chromePath, sellerBaseUrl }) => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: chromePath,
    args: ["--window-size=1366,768", "--disable-features=site-per-process"],
  });
  const page = await browser.newPage();

  page.setDefaultTimeout(DEFAULT_TIMEOUT);

  await addExposeFunctions(page);

  const authBotResponse = await loginTiktokSeller(page, browser, sellerBaseUrl);

  return { page, browser, authBotResponse };
};

module.exports = initializePage;
