const { postGetCreatorList } = require("../../api/interface");
const {
  generateCustomSelector,
  waitForElementWithText,
  clickByText,
  translateCategoryToIdn,
  waitForTimeout,
  isElementPresent,
} = require("../../helpers/utils");

const { showSnackbar } = require("../../helpers/snackbar");
const ElectronStore = require("electron-store");

async function chatAndSaveCreatorsOld({
  page,
  config,
  requestData,
  sessionId,
}) {
  const store = new ElectronStore();

  const payload = JSON.parse(requestData.requestPostData);
  const endpoint = requestData?.url;
  const header = requestData?.requestHeaders;

  const liveReport = [];

  let creatorList = {
    list: [],
    // pagination: {},
  };
  const subscriptionId = config.subscriptionId;

  let shopId = null;
  // setup param get creator list
  let limit = 12;
  let listLength = 0; // total creator in current page
  const iteration = config.iteration; // looping number
  const startPoint = 0;
  let currentPage = Math.floor(startPoint / limit);
  let loopIndex = startPoint - currentPage * limit; // dynamic index for adapting api pagination
  let creatorIndex = startPoint + 1; // incremental index for user log terminal
  // payload.request.pagination.page = currentPage;

  const payloadPostGetCreatorV2 = {
    query: "",
    pagination: { size: limit, page: 0 },
    algorithm: 1,
  };

  const { filterParams } = config;

  if (Object.keys(filterParams).length > 0) {
    Object.assign(payloadPostGetCreatorV2, {
      filter_params: filterParams,
    });
  }

  let modifiedUrl = new URL(endpoint);
  let path = modifiedUrl.pathname;

  // path post get creator v2
  if (path === "/api/v1/oec/affiliate/creator/marketplace/recommendation") {
    modifiedUrl.pathname = "/api/v1/oec/affiliate/creator/marketplace/find";
  }
  let endpointPostGetV2 = modifiedUrl.toString();

  const getCreatorList = await postGetCreatorList(
    endpointPostGetV2,
    payloadPostGetCreatorV2,
    {
      headers: header,
    }
  );

  if (getCreatorList.data) {
    creatorList = {
      list: getCreatorList.data?.creator_profile_list,
      // pagination: getCreatorList.next_pagination,
    };
    if (creatorList.list && creatorList.list.length > 0) {
      listLength = creatorList.list.length;
      // payload.request.pagination.page = currentPage;
    } else {
      await page.evaluate(() => {
        window.alert("Creator with this filter was not found");
      });
    }
  } else {
    if (getCreatorList.data?.msg === "invalid params") {
      await page.evaluate((startPoint) => {
        window.alert(
          `Sequence creator ${
            startPoint + 1
          } not found or exceeds the number of filters.`
        );
      }, startPoint);
      // return 0;
    }
  }
  // define add creator api req body

  let creatorPayload = {
    subscriptionId: subscriptionId,
    username: "",
    email: null,
    name: "",
    phoneNumber: null,
    whatsappNumber: null,
    followerCount: null,
    creatorScore: null,
    affiliatedProductCount: null,
    relatedCategories: [],
  };

  // watch tiktok api response to get creator detail
  // store the response data to creatorPayload

  page.on("response", async (response) => {
    // Check if the URL matches your API request
    if (
      response
        .url()
        .includes(
          "https://affiliate-id.tokopedia.com/api/v1/affiliate/lux/creator/auth_profiles?shop_region=ID&oec_region=ID&oec_seller_id="
        )
    ) {
      // Extract the response body as JSON
      const responseData = await response.json();
      const data = responseData?.data[0];
      if (!data) {
        console.log("tiktok api response changed");
      }
      creatorPayload = {
        ...creatorPayload,
        username: data.handle?.value,
        name: data.nickname?.value,
        followerCount: data.follower_cnt?.value,
        creatorScore: 0,
        affiliatedProductCount: 0,
      };
      console.log({ creatorPayload });
      if (data.main_industry && data.main_industry.value.length > 0) {
        data.main_industry?.value.forEach((category) => {
          creatorPayload.relatedCategories.push(
            translateCategoryToIdn(category.name)
          );
        });
      }
    } else if (
      response
        .url()
        .includes(
          "https://affiliate-id.tokopedia.com/api_sens/v1/affiliate/cmp/contact"
        )
    ) {
      // Extract the response body as JSON
      const responseData = await response.json();
      if (responseData.contact_info && responseData.contact_info.length > 0) {
        responseData.contact_info.forEach((contact) => {
          if (contact.value.includes("@")) {
            creatorPayload = {
              ...creatorPayload,
              email: contact.value,
            };
          } else {
            creatorPayload = {
              ...creatorPayload,
              phoneNumber: contact.value,
              whatsappNumber: contact.value,
            };
          }
        });
      }
    }
  });

  //watch tiktok api response to get shop id
  page.on("response", async (response) => {
    if (
      response
        .url()
        .startsWith(
          "https://affiliate-id.tokopedia.com/api/v1/affiliate/account/info?account_type="
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

  // to handle the popup when it is first run
  let isFirstRun = true;
  let isShowCreatorActionModal = true;

  for (let i = 0; i < iteration; i++) {
    // if we reach the last creator from the filter
    // stop the program
    if (
      loopIndex === listLength &&
      !getCreatorList?.data?.creator_profile_list
    ) {
      await page.evaluate(() => {
        window.alert(
          "This is the final creator of your configuration filters. Program Completed"
        );
      });
    }
    // if we reach the last creator of current page
    // load the next page
    // reset loopIndex to 0
    if (loopIndex === listLength) {
      currentPage++;
      // payload.request.pagination.page = currentPage;
      const getCreatorList = await postGetCreatorList(
        endpointPostGetV2,
        payloadPostGetCreatorV2,
        {
          headers: header,
        }
      );

      console.log("getCreatorList data =", getCreatorList);

      if (getCreatorList.data) {
        creatorList = {
          list: getCreatorList.data?.creator_profile_list,
          // pagination: getCreatorList.data?.next_pagination,
        };
        listLength = creatorList.list.length;
        loopIndex = 0;
      } else {
        if (getCreatorList.data?.msg === "invalid params") {
          await page.evaluate((creatorIndex) => {
            window.alert(`Creator sequence ${creatorIndex} not found`);
          }, creatorIndex);
        }
      }
    }

    const creator = creatorList.list[loopIndex];

    async function wait(N) {
      return new Promise((resolve) => setTimeout(resolve, N));
    }
    //  consume api tiktok to get creator details
    const endpointGetDetailsCreator =
      "https://affiliate-id.tokopedia.com/api/v1/oec/affiliate/creator/marketplace/creator/profile/stats?user_language=id-ID&aid=4331&app_name=i18n_ecom_alliance&device_id=0&fp=verify_lqabhrf9_npMoSkxe_aZYU_4QQy_82dm_ra4r2Th28U1n&device_platform=web&cookie_enabled=true&screen_width=1440&screen_height=900&browser_language=en-US&browser_platform=MacIntel&browser_name=Mozilla&browser_version=5.0+(Macintosh%3B+Intel+Mac+OS+X+10_15_7)+AppleWebKit%2F537.36+(KHTML,+like+Gecko)+Chrome%2F120.0.0.0+Safari%2F537.36&browser_online=true&timezone_name=Asia%2FJakarta&shop_region=ID&msToken=eAtzaZSVz-JFcvh1c_ojrC4EX0InN8OGn3FxX_Rti1agnEor23gcNZuzE-L5qYP3I1Si1tL8nBtiLN-aWD-5ELsywPIrVGwIduKgT_tPE9UJKo0aDzURAwrWlK3rNFF2&X-Bogus=DFSzswVurKQqsBDttuu1VELNKBP7&_signature=_02B4Z6wo00001HGI1WAAAIDDI3f1e1tEo5xxiNHAAHkl6c";
    const payloadGetDetailsCreator = {
      request: {
        common_params: {
          time_selectors: [
            { period: 33, granularity: 32, start_timestamp: "1702814845" },
          ],
        },
        filters: [{ creator_oec_id: `${creator.creator_oecuid.value}` }],
      },
    };
    const resDetailsCreator = await postGetCreatorList(
      endpointGetDetailsCreator,
      payloadGetDetailsCreator,
      {
        headers: header,
      }
    );
    const dataDetailsCreator =
      resDetailsCreator.data?.data?.segments[0].stats[0].profile;
    if (dataDetailsCreator) {
      creatorPayload = {
        ...creatorPayload,
        username: dataDetailsCreator.handle?.value,
        name: dataDetailsCreator.nickname?.value,
        followerCount: dataDetailsCreator.follower_cnt?.value,
        creatorScore: dataDetailsCreator.creator_ec_level_score?.value,
        affiliatedProductCount: dataDetailsCreator.product_cnt?.value,
      };

      if (
        dataDetailsCreator?.main_industry &&
        dataDetailsCreator?.main_industry?.value?.length > 0
      ) {
        dataDetailsCreator.main_industry?.value.forEach((category) => {
          creatorPayload.relatedCategories.push(
            translateCategoryToIdn(category.name)
          );
        });
      }
    }
    //

    await page.goto(
      `https://affiliate-id.tokopedia.com/seller/im?shop_id=${shopId}&creator_id=${creator.creator_oecuid.value}&enter_from=affiliate_creator_details&shop_region=ID`
    );

    // if (!isFirstRun) {
    //   await waitForTimeout(300000);
    // }
    //  handle the popup when it is first run
    try {
      if (isFirstRun) {
        // Kelola pesan
        const modalUnreadMessage = generateCustomSelector(
          "div",
          "Kelola pesan"
        );

        if (modalUnreadMessage) {
          await clickByText(page, "Lewati");
        }

        isFirstRun = false;
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
        await waitForElementWithText(page, "span", "Info Kontak");
        await page.waitForSelector(
          "#workbench-container > div:nth-child(2) > span > div.arco-popover-content.arco-popover-content-bottom > div > div > div.arco-popover-inner-content > div > div > div > div.text-right.mt-16 > button"
        );
      }
    } catch (error) {}

    // close the creator related action modal

    try {
      if (isShowCreatorActionModal) {
        const modalGoToCreatorRelatedActions = generateCustomSelector(
          "div",
          "Buka tindakan terkait kreator"
        );
        if (modalGoToCreatorRelatedActions) {
          const okButtonEl =
            "#___reactour > div:nth-child(4) > div > div.sc-gsFSXq.hvizvp > div:nth-child(2) > span > span > button > span";
          await page.waitForSelector(okButtonEl, {
            timeout: 5000,
          });
          await page.click(okButtonEl);
          isShowCreatorActionModal = false;
        }
      }
    } catch (error) {
      console.log({ error });
      // .
    }

    if (config.isCollectData) {
      await wait(1000);
      const ctx = { creator: creatorPayload, sessionId };
      await page.evaluate(async (_ctx) => {
        await window.sendCreatorData(_ctx);
      }, ctx);
    } else {
      await wait(1000);
      const ctx = { creator: creatorPayload, sessionId };
      await page.evaluate(async (_ctx) => {
        await window.sendSubscriptionCreatorData(_ctx);
      }, ctx);
      try {
        const textAreaSelector = "#im_sdk_ui_sdk_chat_input > textarea";
        const textArea = await page.waitForSelector(textAreaSelector, {
          timeout: 3000,
        });

        await page.click(textAreaSelector);

        let isAlreadySent = false;
        try {
          await page.waitForSelector("div.chatd-bubble-main", {
            timeout: 1000,
          });
        } catch (error) {
          isAlreadySent = false;
        }

        const recentChat = ".index-module_content__9a00-";
        const isResentChatFound = await isElementPresent(page, recentChat);

        let retrieveTextFromPreviousChat = [];

        const isTextFound = await page.evaluate((searchText) => {
          const elements = document.querySelectorAll(
            ".index-module_content__9a00-"
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
          await page.evaluate(async (invitationMessage) => {
            await navigator.clipboard.writeText(invitationMessage);
          }, config.invitationMessage);

          await page.evaluate(
            (selector, text) => {
              const textarea = document.querySelector(selector);
              textarea.value = text;
              textarea.dispatchEvent(new Event("input", { bubbles: true }));
            },
            textAreaSelector,
            config.invitationMessage
          );

          // await page.keyboard.down("Control");
          await page.click(textAreaSelector);
          await page.keyboard.press("Space");
          await page.keyboard.press("Enter");
          // await page.keyboard.up("Control");
          // }

          // send btn
          await waitForTimeout(500);
          await page.keyboard.press("Enter");
          await showSnackbar({
            page,
            message: `Creator ke-${creatorIndex} : ${creator.handle.value}`,
          });
          await waitForTimeout(1000);
          // reset the payload data
          creatorPayload = {
            subscriptionId: subscriptionId,
            username: "",
            email: null,
            name: "",
            phoneNumber: null,
            whatsappNumber: null,
            followerCount: null,
            creatorScore: null,
            affiliatedProductCount: null,
            relatedCategories: [],
          };
        } else {
          // console.error("Textarea element not found");
        }
      } catch (error) {
        console.log(error);
      }
    }

    console.debug(`${creatorIndex} - ${creator.handle.value}`);
    const invitedCreator = {
      index: creatorIndex,
      name: creator.handle.value,
    };
    liveReport.push(invitedCreator);
    store.set("invitedCreator", liveReport);
    creatorIndex++;
    loopIndex++;

    await wait(2000);
  }
  await showSnackbar({
    page,
    message: `Program Has Been Completed
`,
  });
}

const deleteNewLineAndSpaces = function (teks) {
  return teks.replace(/[\n\s]/g, "");
};

module.exports = chatAndSaveCreatorsOld;
