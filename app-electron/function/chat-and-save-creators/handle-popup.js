const {
  generateCustomSelector,
  waitForElementWithText,
  clickByText,
} = require("../../helpers/utils");

async function handlePopupChatCreator({
  page,
  isFirstRun,
  isShowCreatorActionModal,
}) {
  page.setDefaultTimeout(10_000);

  let isFirst = isFirstRun;
  let isShowActionModal = isShowCreatorActionModal;

  try {
    try {
      if (isFirstRun) {
        // Title: Kelola pesan
        const modalUnreadMessage = generateCustomSelector(
          "div",
          "Manage messages"
        );

        if (modalUnreadMessage) {
          await clickByText(page, "Skip");
        }

        isFirst = false;
      }
    } catch (error) {
      console.log(error);
    }
    try {
      const contactIconSelector =
        // "#workbench-container > div.index-module__mainContent--GVCbU > div.index-module__profileContainer--x1dqx > div.index-module__basicInfoContainer--KA2LH > div > div.relative.flex-c > div.inline-block > div";
        "#arco-tabs-0-panel-0 > div > div > div.index-module__basicInfoContainer--KA2LH > div:nth-child(5) > div.relative.flex-c > div.inline-block > div:nth-child(1)";
      const contactIcon = await page.waitForSelector(contactIconSelector, {
        timeout: 5000,
      });
      if (contactIcon) {
        await page.click(contactIconSelector);
        // Wait until the contact info appears
        await waitForElementWithText(page, "span", "Contact Info");
        await page.waitForSelector(
          "#workbench-container > div:nth-child(2) > span > div.arco-popover-content.arco-popover-content-bottom > div > div > div.arco-popover-inner-content > div > div > div > div.text-right.mt-16 > button"
        );
      }
    } catch (error) {}

    try {
      if (isShowCreatorActionModal) {
        const modalGoToCreatorRelatedActions = generateCustomSelector(
          "div",
          "Go to creator related actions"
        );

        if (modalGoToCreatorRelatedActions) {
          const okButtonEl =
            "#___reactour > div:nth-child(4) > div > div.sc-gsFSXq.hvizvp > div:nth-child(2) > span > span > button > span";
          await page.waitForSelector(okButtonEl, {
            timeout: 5000,
          });
          await page.click(okButtonEl);
          isShowActionModal = true;
        }
      }
    } catch (error) {
      console.log({ error });
    }
    return { isFirstRun, isShowActionModal };
  } catch (error) {
    console.log("error handle popup in chat creator:", error);
  }
}

module.exports = handlePopupChatCreator;
