const {
  waitForTimeout,
  waitForElementWithText,
  waitForElementToDisappear,
} = require("../../helpers/utils");

/**
 * @param { Object } page - Puppeteer page object
 */
const openDrawerCreator = async (page) => {
  try {
    const addCreatorButton = await waitForElementWithText(
      page,
      "button",
      "Add pre-selected creators"
    );
    if (!addCreatorButton) {
      throw new Error('"Add pre-selected creators" button not found');
    }
    await waitForTimeout(1000);
    await addCreatorButton.evaluate((b) => b.click());
    await waitForTimeout(1000);

    await page.waitForSelector(
      ".m4b-drawer-header-title:not(.m4b-drawer-header-noclose)"
    );

    const sidePanelTitleElement = await page.$eval(
      ".m4b-drawer-header-title:not(.m4b-drawer-header-noclose)",
      (el) => el.textContent.trim()
    );

    if (sidePanelTitleElement !== "Add pre-selected creators") {
      throw new Error('Side panel "Add pre-selected creators" tidak ditemukan');
    }

    await waitForTimeout(1000);

    // click not invited in last 90 days
    const notInvitedInLast90DaysCheckbox = await waitForElementWithText(
      page,
      "span",
      "Not invited in past 90 days"
    );
    if (!notInvitedInLast90DaysCheckbox) {
      throw new Error('"Not invited in past 90 days" checkbox not found');
    }
    await waitForTimeout(1000);
    await notInvitedInLast90DaysCheckbox.evaluate((el) => el.click());
    await page.waitForResponse((response) =>
      response.url().includes("creator/target_collaboration/list")
    );
    await waitForTimeout(1500);

    const container = await page.$('div[data-e2e="f142d5df-7538-fbb9"]');

    // Cari dropdown untuk ukuran Page
    const dropdownSelector = '.arco-pagination-option div[role="combobox"]';
    const dropdown = await container.$(dropdownSelector);
    if (!dropdown) {
      throw new Error("Dropdown ukuran Page tidak ditemukan.");
    }

    // Klik dropdown untuk membuka opsi
    await dropdown.click();
    await waitForTimeout(3000); // Tunggu dropdown muncul

    // Cari elemen dengan teks "50/Page"
    const optionSelector = 'li[role="option"]';
    const options = await container.$$(optionSelector);

    // Iterasi opsi dan klik opsi dengan teks "50/Page"
    let found = false;
    for (const option of options) {
      const textContent = await option.evaluate((el) => el.textContent.trim());
      if (textContent === "50/Page") {
        await option.click();
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error('Opsi "50/Page" tidak ditemukan dalam dropdown.');
    }

    await waitForElementToDisappear(page, ".arco-spin-loading");
    await waitForTimeout(1000);
  } catch (error) {
    console.log("Error in main openDrawerCreator, msg :", error);
  }
};

module.exports = openDrawerCreator;
