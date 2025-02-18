const {
  postCreatorTiktok,
  postSubscriptionCreator,
} = require("../api/interface");
const {
  waitForTimeout,
  clickSubcategory,
  spanContainsSingleText,
  generateCustomSelector,
  replaceString,
  clickByText,
  waitForXPath,
} = require("./utils");

const addExposeFunctions = async (page) => {
  await page.exposeFunction("hoverAway", async () => {
    const randomHoverSelector =
      "#content-container > main > div > div > div > div > div.mb-36.rounded-8 > div > div > div";
    const randomHoverElement = await page.waitForSelector(randomHoverSelector);

    if (randomHoverElement) {
      await randomHoverElement.hover();
    }
  });

  await page.exposeFunction("selectCategory", async (config) => {
    console.log("select category...");
    await waitForTimeout(1000);

    if (config.mainCategory) {
      const mainCategoryBtnSelector = `//div[contains(text(), "${config.mainCategory}")]`;
      const mainCategoryBtn = await waitForXPath(page, mainCategoryBtnSelector);

      const hasSubCategories =
        config.subCategories && config.subCategories.length > 0;

      if (config.mainCategory && hasSubCategories) {
        await mainCategoryBtn.hover();
        await waitForTimeout(1000);

        for (const subCategory of config.subCategories) {
          await clickSubcategory(page, subCategory);
        }
      } else if (config.mainCategory) {
        await mainCategoryBtn.click();
      }

      await waitForTimeout(500);
      await page.evaluate(() => {
        hoverAway();
      });
    }
    await page.evaluate(async () => {
      await hoverAway();
    });

    await waitForTimeout(1000);
  });

  await page.exposeFunction("selectCreatorAttributes", async (config) => {
    console.log("select creator attributes...");
    await waitForTimeout(1000);

    const creatorScore = config?.creatorScore;
    const agencyManaged = config?.isAgencyManaged;

    if (creatorScore && creatorScore !== "Semua") {
      const creatorScoreSelector = spanContainsSingleText("Skor kreator");
      const creatorScoreBtn = await waitForXPath(page, creatorScoreSelector);
      const creatorScoreBtnText = await creatorScoreBtn.evaluate(
        (el) => el.textContent
      );
      const creatorScoreSelected = await creatorScoreBtnText?.split(": ")?.[1];

      if (!creatorScoreSelected || creatorScoreSelected !== creatorScore) {
        await creatorScoreBtn.click();
        await waitForTimeout(1000);

        const creatorScoreChoice = await waitForXPath(
          page,
          spanContainsSingleText(creatorScore)
        );
        await creatorScoreChoice.click();
        await waitForTimeout(1000);
      }
    }

    await page.evaluate(async () => {
      await hoverAway();
    });

    await page.evaluate(async () => {
      await hoverAway();
    });

    const agencyManagedSelector =
      "#content-container > main > div > div > div > div > div.mb-36.rounded-8 > div > div > div > div:nth-child(3) > div > label";
    if (agencyManaged === true) {
      await page.click(agencyManagedSelector);
    }

    await waitForTimeout(1000);
  });

  await page.exposeFunction("selectFollowersProfile", async (config) => {
    console.log("select followers profile...");
    await waitForTimeout(1000);

    const followers = config?.followerCount;
    const followerAge = replaceString(config?.followerAge);
    const followerGender = config?.followerGender;

    if (followers && followers !== "Semua") {
      const followerCountXPath = generateCustomSelector("span", "Pengikut");
      const followerCountEl = await waitForXPath(page, followerCountXPath);
      console.log("followerCountEl", followerCountEl);
      if (followerCountEl) {
        // click follower count button
        await page.click(
          "#content-container > main > div > div > div > div > div.mb-36.rounded-8 > div > div > div > div:nth-child(4) > div > div.relative"
        );
      }
      await waitForTimeout(1000);
      const followersChoice = generateCustomSelector("span", followers);
      if (followersChoice) {
        clickByText(page, followers);
      }

      await waitForTimeout(1000);
    }

    await page.evaluate(async () => {
      await hoverAway();
    });

    // handle click follower age
    if (followerAge && followerAge !== "Semua") {
      await clickByText(page, "Umur pengikut");
      await waitForTimeout(1000);
      if (followerAge == "18-24") {
        // hardcode copy selector from dropwon follower age
        const itemSelector =
          "#content-container > main > div > div > div > div > div.mb-36.rounded-8 > div > div > div > div:nth-child(4) > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > span > div > div > div:nth-child(2)";
        await page.waitForSelector(itemSelector);
        await page.click(itemSelector);
      } else if (followerAge == "25-34") {
        // hardcode copy selector from  dropwon follower age
        const itemSelector =
          "#content-container > main > div > div > div > div > div.mb-36.rounded-8 > div > div > div > div:nth-child(4) > div > div:nth-child(2) > div > div > div > div > div:nth-child(2) > span > div > div > div:nth-child(3)";
        await page.waitForSelector(itemSelector);
        await page.click(itemSelector);
      } else {
        await clickByText(page, followerAge);
      }
    }
    await page.evaluate(async () => {
      await hoverAway();
    });

    // handle click follower gender
    if (followerGender && followerGender !== "Semua") {
      await clickByText(page, "Gender pengikut");
      await waitForTimeout(1000);
      await clickByText(page, followerGender);
    }
    await waitForTimeout(1000);
    await page.evaluate(async () => {
      await hoverAway();
    });
  });

  await page.exposeFunction(
    "sendCreatorData",
    async ({ creator, sessionId }) => {
      await postCreatorTiktok(creator, {
        headers: {
          Cookie: "connect.sid=" + sessionId,
        },
      });
    }
  );

  await page.exposeFunction(
    "sendSubscriptionCreatorData",
    async ({ creator, sessionId }) => {
      const postCreator = await postSubscriptionCreator(creator, {
        headers: {
          Cookie: "connect.sid=" + sessionId,
        },
      });
      console.log("postCreator = ", postCreator.data);
    }
  );
};

module.exports = addExposeFunctions;
