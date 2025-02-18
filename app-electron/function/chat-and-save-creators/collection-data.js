const { waitForTimeout } = require("../../helpers/utils");

/**
 * @returns {string[]} contactCreator - An array containing the creator's contact information,
 */
async function collectionData(context) {
  const { page, shopId, creator, config, loopIndex } = context;
  const contactCreator = [];

  try {
    // go to detail profile creator
    await page.goto(
      `${affiliateBaseUrl}/connection/creator/detail?cid=${creator.creator_oecuid.value}&enter_from=affiliate_find_creators`
    );
    const profileElement = "#creator-detail-profile-container";
    await page.waitForSelector(profileElement);
    await waitForTimeout(2000);

    const contactIconSelector = `div.inline-block > .flex.space-x-8`;
    const isContact = (await page.$(contactIconSelector)) !== null;

    if (isContact) {
      const contactIcon = await page.$(contactIconSelector);
      await contactIcon.click();
      await waitForTimeout(2000);

      const contactElement =
        ".arco-popover-inner-content .arco-spin-children .flex.flex-col.mt-8.w-full > div > div.flex-c > div.text-body-l-medium";
      await page.waitForSelector(contactElement);
      const contactSelector = await page.$$(contactElement);
      for (const element of contactSelector) {
        const text = await element.evaluate((el) => el.textContent.trim());
        contactCreator.push(text);
      }
    }

    await waitForTimeout(1000);
    return contactCreator;
  } catch (error) {
    console.log("error collection-data :", error);
  }
}

module.exports = collectionData;
