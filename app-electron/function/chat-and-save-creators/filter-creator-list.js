// const {
//   waitForTimeout,
//   generateCustomSelector,
//   clickByText,
//   waitAndClick,
//   spanContainsMultipleTexts,
//   waitForXPath,
// } = require("../../helpers/utils");

async function filterCreatorList({
  page,
  affiliateBaseUrl,
  countryCode,
  config,
}) {
  let shopId = null;

  page.on("response", async (response) => {
    if (
      response
        .url()
        .startsWith(
          `${affiliateBaseUrl}/api/v1/affiliate/account/info?account_type=`
        )
    ) {
      // Extract the response body as JSON
      const responseData = await response.json();
      const getShopId = responseData.user_id;

      if (getShopId) {
        shopId = getShopId;
      }
    }
  });

  await page.goto(
    `${affiliateBaseUrl}/connection/creator?enter_from=seller_center_entry&shop_region=${countryCode}`,
    {
      waitUntil: "networkidle2",
    }
  );

  try {
    const modalCaptcha = await page.waitForSelector(
      "#captcha_container > div",
      { timeout: 5000 }
    );
    if (modalCaptcha) {
      await page.waitForSelector("#captcha_container > div", {
        hidden: true,
        timeout: 15000,
      });
    }
  } catch (_) {
    console.log("Tidak ada modal captcha");
  }

  while (shopId === null) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return shopId;
}

module.exports = filterCreatorList;
