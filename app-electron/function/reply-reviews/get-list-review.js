const axios = require("axios");

async function getListReview({ page, config, currentPage, context }) {
  const { productName, rating, typeAssessment } = config;

  const handlePayload = () => {
    let payload = {
      page: currentPage,
      size: 50,
      is_replied: false,
    };
    if (productName) {
      payload = {
        ...payload,
        fuzzy_param: productName,
      };
    }
    if (rating.length > 0) {
      payload = {
        ...payload,
        star_level: rating,
      };
    }
    if (typeAssessment.length > 0) {
      payload = {
        ...payload,
        ...Object.assign({}, ...typeAssessment),
      };
    }
    return payload;
  };

  const payload = handlePayload();

  const requestOptions = {
    method: "POST",
    headers: context.headers,
    body: JSON.stringify(payload),
  };

  const getListReview = await fetch(context.url, requestOptions)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("There was an error!", error);
    });
  // console.log("listReviewer from get", listReviewer.data.list);
  if (!getListReview?.data?.list) {
    await page.evaluate(() => {
      window.alert("No reviews found");
    });
    return { listReviewer: [] };
  } else {
    const listReviewer = getListReview.data.list.map((item) => {
      return {
        id: item.main_review_id,
        username: item.user_name,
      };
    });
    return { listReviewer };
  }
  // const testSend = {
  //   review_id: "7218151585418069766",
  //   text: "Terimakasih sudah memili di toko kami...",
  // };
  // const requestOptions2 = {
  //   method: "POST",
  //   headers: context.headers,
  //   body: JSON.stringify(testSend),
  // };
  // fetch(context.url.replace("/list?", "/reply?"), requestOptions2)
  //   .then((response) => {
  //     if (!response.ok) {
  //       throw new Error("Network response was not ok");
  //     }
  //     return response.json();
  //   })
  //   .then((data) => {
  //     console.log("Response fetch:", data);
  //   })
  //   .catch((error) => {
  //     console.error("There was an error!", error);
  //   });
}
module.exports = getListReview;
