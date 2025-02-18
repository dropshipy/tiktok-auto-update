const { waitForTimeout, clickByText } = require("../helpers/utils");

async function handleLanguage(page) {
  try {
    const navigationProfile = await page.waitForSelector(
      'div[data-tid="workbench.topbar.user"] > div > div'
    );
    await navigationProfile.click();
    await waitForTimeout(1500);

    const optionModalProfil = await page.$$(
      '#WB-GEC-nav-bar > div:nth-child(2) div[role="menu"]'
    );
    const buttonShowLang = await optionModalProfil[1];
    await buttonShowLang.click();
    await waitForTimeout(1000);

    const languageDropdown = ".theme-m4b-menu-item-children";

    await page.waitForSelector(languageDropdown, {
      visible: true,
    });

    const languageList = await page.$$(languageDropdown);

    for (const el of languageList) {
      const text = await page.evaluate((el) => el.textContent?.trim(), el);
      if (text?.includes("US English")) {
        await waitForTimeout(500);
        await el.click();
        await page.waitForResponse(
          (response) =>
            response
              .url()
              .startsWith(
                "https://seller-id.tokopedia.com/api/v1/seller/account/update?locale="
              ) && response.status() === 200,
          { timeout: 12000 }
        );
        break;
      }
    }

    // full response language adjustments:
    // https://starling-oversea.byteoversea.com/text/838439d00f6011eb878e89d52866df17/fe/en
    try {
      await waitForTimeout(500);
    } catch {}
  } catch (err) {
    console.log(err);
  }
}

module.exports = { handleLanguage };
