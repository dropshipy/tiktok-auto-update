async function scrappingProducts(page) {
  // Get data product
  try {
    const productContainerSelector =
      '#root #GEC-main > div[data-log_page_name="order_detail"] > .flex.space-x-16 > div:nth-child(1) > div:nth-child(2) > .flex.flex-col.gap-20 > div > div:nth-child(2)';
    const productContainer = await page.$(productContainerSelector);

    const productElements = await productContainer.$$(":scope > div");
    for (let i = 0; i < productElements.length; i++) {
      const productNameElement = await page.$(
        `${productContainerSelector}> div:nth-child(${
          i + 1
        }) > div >  div:nth-child(3) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)`
      );
      const productName = await page.evaluate(
        (el) => el.textContent,
        productNameElement
      );

      const productIdElement = await page.$(
        `${productContainerSelector}> div:nth-child(${
          i + 1
        }) > div >  div:nth-child(1) > span`
      );
      const productId = await page.evaluate(
        (el) => el.textContent.split(" ")[2],
        productIdElement
      );

      return {
        productId,
        productName,
      };
    }
  } catch (error) {
    console.log("Error in product info, get from element :", error);
  }
}

module.exports = { scrappingProducts };
