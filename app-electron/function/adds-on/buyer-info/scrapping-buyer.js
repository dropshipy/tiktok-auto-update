const { waitForTimeout, waitForXPath } = require("../../../helpers/utils");

async function scrappingBuyer(page) {
  const data = {
    username: "",
    name: "",
    phone: "",
    address: "",
  };

  // SECTION username
  const buyerUsernameElement = await page.waitForSelector(
    '#root #GEC-main div[data-log_page_name="order_detail"] > .flex.space-x-16 > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > div > div.font-regular.text-base.text-gray-1.mt-4'
  );
  if (!buyerUsernameElement) {
    console.log("Username element not found.");
  }
  const username = await page.evaluate(
    (el) => el.textContent,
    buyerUsernameElement
  );
  data.username = username;

  // SECTION name, phone, address
  const shippingAddressElement = await waitForXPath(
    page,
    "//div[contains(text(), 'Shipping address')]"
  );
  if (!shippingAddressElement) {
    throw new Error("Elemen dengan teks 'Shipping address' tidak ditemukan");
  }

  const parentElement = await shippingAddressElement.evaluateHandle(
    (el) => el.parentElement
  );
  if (!parentElement) {
    throw new Error("Parent element tidak ditemukan");
  }

  const containerHandle = await parentElement.evaluateHandle(
    (el) => el.children[1]
  );
  if (!containerHandle) {
    throw new Error("containerSelector tidak ditemukan");
  }

  const showHideElements = await containerHandle.$$(":scope > div > span");
  for (let i = 0; i < 3; i++) {
    try {
      await showHideElements[i].click();
      await waitForTimeout(500);
    } catch (err) {
      console.log(err);
    }
  }

  const buyerDataElements = await containerHandle.$$(":scope > div > div");
  for (let i in buyerDataElements) {
    try {
      const textElement = await waitForUncensoredTextBuyer(
        buyerDataElements[i]
      );

      if (i == 0) {
        data.name = textElement;
      } else if (i == 1) {
        data.phone = textElement;
      } else if (i >= 2) {
        data.address += " " + textElement;
      }
    } catch (err) {
      console.log(err);
    }
  }

  return data;
}

async function waitForUncensoredTextBuyer(
  element,
  maxRetries = 5,
  retryDelay = 2500
) {
  let retries = 0;
  while (retries < maxRetries) {
    const textContent = await element.evaluate((el) => el.textContent);
    if (!textContent.includes("*")) {
      return textContent;
    }
    console.log(
      `Text is still censored, retrying... (${retries + 1}/${maxRetries})`
    );
    retries++;
    await waitForTimeout(retryDelay);
  }
  throw new Error(`Text is still censored after ${maxRetries} retries.`);
}

module.exports = { scrappingBuyer };
