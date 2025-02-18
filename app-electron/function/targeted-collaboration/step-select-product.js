const {
  clickByText,
  waitForTimeout,
  generateInputSelector,
  generateAllSelector,
  waitForElementToDisappear,
  waitForXPath,
  waitForElementWithText,
  clickByMultipleText,
} = require("../../helpers/utils");

/**
 * @param { Object } page - Puppeteer page object.
 * @param { Object } config.
 * @param { Number } config.comissionRate - Percentage do you want to share with the creator/
 */
const stepSelectProduct = async (page, config) => {
  const { comissionRate } = config;

  await clickByMultipleText(page, ["Choose products", "Select products"]);
  await waitForTimeout(1000);
  await clickByText(page, "Add products");

  const statusProductEl = generateAllSelector("Eligible");
  await waitForXPath(page, statusProductEl);
  const rowsBefore = await page.$$(".arco-table-tr");
  const totalRowsBefore = rowsBefore.length;
  if (totalRowsBefore >= 20) {
    await waitForTimeout(1000);

    // const modalaRatingExprienceCollab = waitForElementWithText(
    //   page,
    //   "div",
    //   'How much would you agree with the statement "managing Target Collaboration on Affiliate Center was extremely easy"?',
    //   3000
    // );

    // click button pagination
    await page.click(
      "body > div.arco-drawer-wrapper > div.arco-drawer.m4b-drawer.slideRight-appear-done.slideRight-enter-done > div > span > div > div.arco-drawer-content > div > div > div:nth-child(2) > div > div > div > div.arco-pagination.arco-pagination-size-default.m4b-pagination > div > div > div > span > span"
    );
    const paginationPerPageEl = generateAllSelector("100/Page");
    await waitForXPath(page, paginationPerPageEl);
    await clickByText(page, "100/Page");
  }
  await waitForElementToDisappear(page, ".arco-spin-loading");

  // checkbox product
  const checkboxProduct =
    "body > div.arco-drawer-wrapper > div.arco-drawer.m4b-drawer.slideRight-appear-done.slideRight-enter-done > div > span > div > div.arco-drawer-content > div > div > div:nth-child(2) > div > div > div > div.arco-table-container > div > div > table > thead > tr > th.arco-table-th.arco-table-operation.arco-table-checkbox > div > label > span > div";

  await waitForTimeout(1000);
  await page.click(checkboxProduct);
  await waitForTimeout(1000);

  // tambahkan btn
  await page.click(
    "body > div.arco-drawer-wrapper > div.arco-drawer.m4b-drawer.slideRight-appear-done.slideRight-enter-done > div > span > div > div.arco-drawer-footer > div > div > div.space-x-12 > button.arco-btn.arco-btn-primary.arco-btn-size-default.arco-btn-shape-square.m4b-button"
  );

  await waitForElementToDisappear(page, ".opacity-50.pointer-events-none");
  await waitForTimeout(1000);

  const containerProduct = await page.$('div[data-e2e="f709ba5a-b2fd-750f"]');
  await clickByText(containerProduct, "20/Page");
  await clickByText(containerProduct, "50/Page");
  await waitForTimeout(1500);

  // click checkbox all product
  await page.click(
    "th.arco-table-operation:nth-child(2) > div:nth-child(1) > label:nth-child(1) > span:nth-child(2) > div:nth-child(1)"
  );

  await waitForTimeout(1000);

  try {
    const selectAllBtnXPath =
      '//button[contains(@class, "arco-btn-primary-text") and .//span[contains(text(), "Select all")]]';

    const buttonElement = await waitForXPath(page, selectAllBtnXPath, {
      timeout: 5000,
    });
    await buttonElement.click();
  } catch (error) {
    console.error("Tombol pilih semua tidak ditemukan");
  }

  await waitForTimeout(1000);

  await clickByText(page, "Batch edit commission");
  await waitForTimeout(3000);
  const standardCommission = await page.$(
    'div[data-tid="m4b_dropdown_menu_item"]'
  );
  await standardCommission.click();

  const commissionInputRate = generateInputSelector("1.00-80.00");
  await page.click(commissionInputRate);
  await page.type(commissionInputRate, comissionRate.toString());
  await waitForTimeout(1500);

  await page.click(
    "#content-container > main > div > div > div > div > div.arco-spin.m4b-loading.sc-gEvEer.bfnzTC.w-full.h-full > div > form > div > div > div.flex.flex-col.flex-grow.space-y-16 > div.arco-collapse.arco-collapse-borderless > div:nth-child(2) > div > div > div.arco-collapse-item-content > div.arco-collapse-item-content-box > div.arco-col.arco-col-24 > div:nth-child(2) > div:nth-child(2) > div.flex.items-center > button.arco-btn.arco-btn-secondary.arco-btn-size-default.arco-btn-shape-square.m4b-button.mr-8.p-12"
  );
};

module.exports = stepSelectProduct;
