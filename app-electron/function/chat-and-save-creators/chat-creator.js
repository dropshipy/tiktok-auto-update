const { waitForTimeout } = require("../../helpers/utils");
const { showSnackbar } = require("../../helpers/snackbar");

/**
 * @returns {string[]} contactCreator - An array containing the creator's contact information,
 */
async function chatCreator(context) {
  const contactCreator = [];
  const {
    page,
    affiliateBaseUrl,
    shopId,
    creator,
    isFirstRun,
    isShowCreatorActionModal,
    config,
    loopIndex,
  } = context;

  try {
    await page.goto(
      `${affiliateBaseUrl}/seller/im?shop_id=${shopId}&creator_id=${creator.creator_oecuid.value}&enter_from=affiliate_creator_details`
    );

    try {
      const textAreaSelector = 'textarea[placeholder="Send a message"]';
      await page.waitForSelector(textAreaSelector);

      await page.click(textAreaSelector);

      let isAlreadySent = false;
      try {
        await page.waitForSelector("div.chatd-bubble-main", {
          timeout: 1000,
        });
      } catch (error) {
        isAlreadySent = false;
      }

      const recentChat = ".index-module__content--fNRjR";

      let retrieveTextFromPreviousChat = [];

      const isTextFound = await page.evaluate((searchText) => {
        const elements = document.querySelectorAll(
          ".index-module__content--fNRjR"
        );
        const result = [];
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];

          if (element.childNodes.length > 0) {
            for (let j = 0; j < element.childNodes.length; j++) {
              const childNode = element.childNodes[j];
              result.push(childNode.textContent);
            }
          }
        }
        return result;
      }, config.invitationMessage);

      retrieveTextFromPreviousChat = await isTextFound;

      if (retrieveTextFromPreviousChat.length > 0) {
        retrieveTextFromPreviousChat = retrieveTextFromPreviousChat.map(
          (teks) => deleteNewLineAndSpaces(teks)
        );

        const invitationMessage = deleteNewLineAndSpaces(
          config.invitationMessage
        );

        const checkWhetherItHasBeenSent =
          retrieveTextFromPreviousChat.includes(invitationMessage);

        if (checkWhetherItHasBeenSent) {
          isAlreadySent = true;
        }
      }

      if (!isAlreadySent) {
        const messageLines = config.invitationMessage.split("\n");
        await page.waitForSelector(textAreaSelector, { visible: true });
        await page.evaluate(
          (selector, text) => {
            const textarea = document.querySelector(selector);
            textarea.value = text;
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
          },
          textAreaSelector,
          config.invitationMessage
        );
        await page.keyboard.press("Space");
        await page.keyboard.press("Enter");
        await showSnackbar({
          page,
          message: `Creator ke-${loopIndex + 1} : ${creator.handle.value}`,
        });
      } else {
      }

      await waitForTimeout(2000);
      const contactIconSelector =
        "#arco-tabs-0-panel-0 > div > div > div.index-module__basicInfoContainer--KA2LH > div:nth-child(5) > div.relative.flex-c > div.inline-block";
      const isContact = (await page.$(contactIconSelector)) !== null;
      // console.log("isContact:", isContact);

      if (isContact) {
        const contactIcon = await page.$(contactIconSelector);
        await contactIcon.click();

        // const contactElement = .flex.flex-col.mt-8.w-full .text-body-l-medium div
        const contactElement =
          "span.arco-trigger.arco-popover > div.arco-popover-content > .arco-popover-content-inner > .arco-popover-inner > .arco-popover-inner-content > div > div > div > .flex.flex-col.mt-8.w-full .text-body-l-medium > div > div";
        await page.waitForSelector(contactElement, { timeout: 5000 });
        const contactSelector = await page.$$(contactElement);
        for (const element of contactSelector) {
          const text = await element.evaluate((el) => el.textContent.trim());
          contactCreator.push(text);
        }
      } else {
        console.log("Kontak tidak tersedia");
      }

      await waitForTimeout(1000);
    } catch (error) {
      console.log(error);
    }
    // if (config.isCollectData) {
    //   await wait(1000);
    //   const ctx = { creator: creatorPayload, sessionId };
    //   await page.evaluate(async (_ctx) => {
    //     await window.sendCreatorData(_ctx);
    //   }, ctx);
    // } else {
    // }

    return contactCreator;
  } catch (error) {
    console.log("error chat creator:", error);
  }
}

const deleteNewLineAndSpaces = function (teks) {
  return teks.replace(/[\n\s]/g, "");
};

module.exports = chatCreator;
