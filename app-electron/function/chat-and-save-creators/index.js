const { translateCategoryToIdn } = require("../../helpers/utils");
const getCreatorList = require("./get-creator-list");
const chatCreator = require("./chat-creator");
const saveCreator = require("./save-creator");
const { showSnackbar } = require("../../helpers/snackbar");
const { postSaveCreatorManagement } = require("../../api/interface");
const ElectronStore = require("electron-store");
const collectionData = require("./collection-data");

async function chatAndSaveCreators({
  page,
  affiliateBaseUrl,
  countryCode,
  config,
  requestData,
  shopId,
  sessionId,
}) {
  const store = new ElectronStore();
  const liveReport = [];
  const { subscriptionId } = config;
  const endpoint = requestData?.url;
  const header = requestData?.requestHeaders;

  const iteration = config.iteration;

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
    if (
      response
        .url()
        .includes(
          `${affiliateBaseUrl}/api/v1/affiliate/lux/creator/auth_profiles`
        )
    ) {
      // Get Creator with Chat Creator feat
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

      if (data.category && data.category.value.length > 0) {
        data?.category?.value.forEach((category) => {
          creatorPayload?.relatedCategories?.push(
            translateCategoryToIdn(category.name)
          );
        });
      }
    } else if (
      response
        .url()
        .includes(
          `${affiliateBaseUrl}/api/v1/oec/affiliate/creator/marketplace/profile`
        )
    ) {
      // Get Creator with Collection Data feat
      const responseData = await response.json();
      if (responseData.creator_connect_info) {
        const data = responseData.creator_profile;

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

        if (data.category && data.category.value.length > 0) {
          data?.category?.value.forEach((category) => {
            creatorPayload?.relatedCategories?.push(
              translateCategoryToIdn(category.name)
            );
          });
        }
      } else {
      }
    }
    // else if (
    //   response
    //     .url()
    //     .includes(
    //       `${affiliateBaseUrl}/api_sens/v1/affiliate/cmp/contact`
    //     )
    // ) {
    //
    // }
  });

  //watch tiktok api response to get shop id

  let loopIndex = 0;
  while (loopIndex < iteration) {
    let currentCreator = 0;
    const creatorList = await getCreatorList({ endpoint, header, config });

    const totalCreator = creatorList.length;
    if (totalCreator < 1) {
      await page.evaluate(() => {
        window.alert("Creator not found");
      });
      break;
    }

    while (loopIndex < iteration && currentCreator < totalCreator) {
      let creator = creatorList[currentCreator];
      const context = {
        page,
        affiliateBaseUrl,
        shopId,
        creator,
        config,
        config,
        loopIndex,
      };

      const addContactPayload = (contactCreator) => {
        for (let i = 0; i < contactCreator.length; i++) {
          const contact = contactCreator[i];

          if (contact.includes("@")) {
            creatorPayload.email = contact;
          } else {
            creatorPayload.phoneNumber = contact;
            creatorPayload.whatsappNumber = contact;
          }
        }
      };
      if (config.isCollectingData) {
        const contactCreator = await collectionData(context);
        addContactPayload(contactCreator);
      } else {
        const contactCreator = await chatCreator(context);
        addContactPayload(contactCreator);
      }

      console.log("creatorPayload :", creatorPayload);
      creatorPayload = await saveCreator({
        page,
        subscriptionId,
        creatorPayload,
        sessionId,
      });

      const invitedCreator = {
        index: loopIndex + 1,
        name: creator.handle.value,
      };
      liveReport.push(invitedCreator);
      store.set("invitedCreator", liveReport);

      if (config.isSaveToCreatorManagement) {
        const saveCreatorRes = await postSaveCreatorManagement({
          affiliateBaseUrl,
          countryCode,
          shopId,
          creatorId: creator.creator_oecuid.value,
          headers: header,
        });

        console.log("Save creator management: ", saveCreatorRes.data?.message);
      }

      currentCreator++;
      loopIndex++;
    }
  }
  await page.evaluate(() => {
    window.alert(`Program Has Been Completed`);
  });
  await showSnackbar({
    page,
    message: `Program Has Been Completed`,
  });
}

module.exports = chatAndSaveCreators;
