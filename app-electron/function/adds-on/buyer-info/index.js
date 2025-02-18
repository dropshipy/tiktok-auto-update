const { postTiktokBuyer } = require("../../../api/interface");
const { waitForTimeout } = require("../../../helpers/utils");
const { showSnackbar } = require("../../../helpers/snackbar");
const { scrappingProducts } = require("./scrapping-products");
const { scrappingBuyer } = require("./scrapping-buyer");

async function buyerInfo({
  page,
  browser,
  sellerBaseUrl,
  startIndex,
  selectedSort,
}) {
  try {
    const buyerData = [];

    let loopingPage = true;
    let isFirstIteration = true;
    let loopingPageIndexTarget = Math.ceil(startIndex / 50);
    let loopingPageIndexNow = 1;

    while (loopingPage) {
      /* Take the order list number */
      await page.goto(
        `${sellerBaseUrl}/order?selected_sort=${selectedSort}&tab=shipped`
      );
      console.log("pagination index target :", loopingPageIndexTarget);

      try {
        // pagination button
        await page
          .waitForSelector(
            '#root #GEC-main > div[data-log_page_name="orders_list"] > div[data-log_module_name="order_list"] .theme-arco-select.theme-arco-select-single.theme-arco-select-size-default.theme-m4b-select.theme-m4b-select-has-tooltip-error',
            { timeout: 30000 }
          )
          .then((el) => el.click());
        await waitForTimeout(1500);
        // pagination option " 50 "
        await page
          .waitForSelector(
            '#root #GEC-main > div[data-log_page_name="orders_list"] > div[data-log_module_name="order_list"] > div > div:nth-child(2) > div > div > div > div:nth-child(2) > span > div > div:nth-child(1) > div > div > li:nth-child(3)'
          )
          .then((el) => el.click());

        while (loopingPageIndexTarget > loopingPageIndexNow) {
          const nextPaginationSelector =
            'div[data-log_module_name="order_list"] .theme-arco-pagination-item.theme-arco-pagination-item-next';
          try {
            await page.waitForSelector(nextPaginationSelector, {
              visible: true,
            });
            const nextPaginationElement = await page.$(nextPaginationSelector);
            await waitForTimeout(5000);
            if (nextPaginationElement) {
              const isDisabled = await page.evaluate(
                (element) =>
                  element.classList.contains(
                    "theme-arco-pagination-item-disabled"
                  ),
                nextPaginationElement
              );

              if (isDisabled) {
                throw "FINAL LOOP";
              }

              await nextPaginationElement.click();
              loopingPageIndexNow++;
            }
          } catch (error) {
            if (error == "FINAL LOOP") {
              throw "FINAL LOOP";
            }
            console.error("Error next pagination button:", error);
          }
          console.log("in pagination :", loopingPageIndexNow);
          console.log("target pagination :", loopingPageIndexTarget);
        }
      } catch (err) {
        // end of data scrapping, when there is no more next pagination
        console.log("Something wrong in pagination");
        console.log(err);
        console.log("There are no more next page that need to be done.");
        loopingPage = false;
        break;
      }

      // for next pagination
      loopingPageIndexTarget++;
      loopingPageIndexNow = 1;

      // get orderNo list
      const listOrderResponse = await page.waitForResponse((response) =>
        response.url().includes("/api/v1/trade/orders/buyer")
      );
      const listOrderJson = await listOrderResponse.json();
      const orderNo = Object.keys(listOrderJson.data.buyer_info);
      console.log("orderNo :", orderNo);
      console.log("orderNo length :", orderNo.length);

      if (orderNo) {
        let no = isFirstIteration
          ? (startIndex % 50) - 1 === -1
            ? 49 // example startIndex(-1) = 100, 250, 50
            : (startIndex % 50) - 1
          : 0;

        console.log("startIndex :", no);
        while (no < orderNo.length) {
          console.log(`Order ke : ${no + 1}`);
          await page.goto(
            `${sellerBaseUrl}/order/detail?order_no=${orderNo[no]}`
          );
          await page.waitForResponse((response) =>
            response
              .url()
              .includes(`${sellerBaseUrl}/api/v1/fulfillment/order/history?`)
          );

          // check bug, if page auto redirect to chat tiktok url
          const orderDetailPage = await page.$(
            '#root #GEC-main > div[data-log_page_name="order_detail"]'
          );
          if (!orderDetailPage) {
            console.log("Blank page detected");
            await page.close();
            page.continue;
          }

          // SCRAPPING
          const buyer = await scrappingBuyer(page);
          const data = {
            username: buyer.username || "",
            name: buyer.name || "",
            phone: buyer.phone || "",
            address: buyer.address || "",
            products: [],
          };
          const products = await scrappingProducts(page);
          data.products.push({
            skuId: products.productId,
            name: products.productName,
          });

          console.log({ data });
          if (!data.phone) {
            await browser.close();
            return {
              data: buyerData,
              status: "limit",
            };
          }
          await postTiktokBuyer(data);
          buyerData.push(data);

          console.log("data tiktok buyers :", data);
          await showSnackbar({
            page,
            message: `Berhasil mengambil ${buyerData.length} data`,
          });
          no++;
          await waitForTimeout(1000);
        }
      }
      isFirstIteration = false;
    }
    await page.evaluate(() => {
      window.alert(`Program Has Been Completed`);
    });
    await showSnackbar({
      page,
      message: `Program Has Been Completed`,
    });
    return {
      data: buyerData,
      status: "succes",
    };
  } catch (error) {
    console.log(`Error in buyer-info ${error}`);
    return {
      data: {},
      status: "failed",
    };
  }
}

module.exports = buyerInfo;
