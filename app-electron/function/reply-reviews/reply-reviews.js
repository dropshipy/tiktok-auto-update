const getListReview = require("./get-list-review");
const { showSnackbar } = require("../../helpers/snackbar");
const { waitForTimeout } = require("../../helpers/utils");

async function replyReviews({ page, sellerBaseUrl, config }) {
  try {
    let context = null;
    await page.setRequestInterception(true);
    page.on("request", async (request) => {
      if (
        request.url().startsWith(
          // `${sellerBaseUrl}/api/v1/review/biz_backend/list?locale=id-ID&language=id&oec_seller_id=` //NOTE old version - gak bisa di cek karena tidak ada product ratings
          `${sellerBaseUrl}/api/v1/review/biz_backend/list`
        )
      ) {
        context = {
          url: request.url(),
          headers: request.headers(),
        };
        request.continue();
      } else request.continue();
    });

    // await page.goto(`${sellerBaseUrl}/product/rating?shop_region=ID`, { //NOTE old version - gak bisa di cek karena tidak ada product ratings
    await page.goto(`${sellerBaseUrl}/product/rating`, {
      waitUntil: "networkidle2",
    });

    while (context === null) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const { iteration, message } = config;
    let currentPage = 1;
    let indexLoop = 1;
    while (iteration >= indexLoop) {
      const { listReviewer } = await getListReview({
        config,
        page,
        currentPage,
        context,
      });
      if (listReviewer.length < 1) {
        break;
      }
      let postReplyIndex = 0;
      while (postReplyIndex < listReviewer.length && iteration >= indexLoop) {
        const payload = {
          review_id: listReviewer[postReplyIndex].id,
          text: message,
        };

        const requestOptions = {
          method: "POST",
          headers: context.headers,
          body: JSON.stringify(payload),
        };
        try {
          const response = await fetch(
            context.url.replace("/list?", "/reply?"),
            requestOptions
          );

          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          if (response.status == 200) {
            await showSnackbar({
              page,
              message: `Berhasil membalas ulasan ke-${indexLoop} : ${listReviewer[postReplyIndex].username}`,
            });
            await waitForTimeout(1500);
          }
          console.log("Response fetch:", data);
        } catch (error) {
          console.log(error);
        }
        postReplyIndex++;
        indexLoop++;
      }
      currentPage++;
    }
    await page.evaluate(() => {
      window.alert("Program Completed");
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = replyReviews;
