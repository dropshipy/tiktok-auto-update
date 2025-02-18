const stepCreateInvitation = require("./step-create-invitation");
const stepSelectProduct = require("./step-select-product");
const stepSelectCreator = require("./step-select-creator");
const {
  clickByText,
  waitForTimeout,
  waitForElementWithText,
} = require("../../helpers/utils");

async function targetedCollaboration({
  page,
  affiliateBaseUrl,
  countryCode,
  config,
}) {
  try {
    const {
      iteration,
      planNumber,
      comissionRate,
      planName,
      endDate,
      whatsappNumber,
      telegramNumber,
      lineNumber,
      facebookAccount,
      invitationMessage,
      creatorStartPage,
    } = config;
    let conflictUsers = [];
    let startPage = creatorStartPage ? creatorStartPage : 1;

    const creatorsPerIteration = 50;
    const totalInvitations = Math.ceil(iteration / creatorsPerIteration);

    let creatorsLeft = iteration;
    let planLoopNumber = planNumber;

    console.log("\n\n");
    console.log("===========================");
    console.log("Jumlah kreator: ", iteration);
    console.log("Total Undangan: ", totalInvitations);
    console.log("===========================");

    for (let i = 0; i < totalInvitations; i++) {
      const creatorsInCurrentIteration =
        creatorsLeft > creatorsPerIteration
          ? creatorsPerIteration
          : creatorsLeft;

      console.log("Mulai looping...");
      console.log("Undangan ke: ", i + 1);
      console.log("Total sisa kreator: ", creatorsLeft);
      console.log("Jumlah kreator diiterasi ini: ", creatorsInCurrentIteration);

      const urlTargetedPlan = `${affiliateBaseUrl}/connection/target-invitation/create?enter_from=target_invitation_list`;
      await page.goto(urlTargetedPlan, {
        waitUntil: "networkidle2",
        timeout: 0,
      });

      // SECTION: STEP 1
      await stepCreateInvitation(page, {
        countryCode,
        planName,
        planLoopNumber,
        endDate,
        whatsappNumber,
        telegramNumber,
        lineNumber,
        facebookAccount,
        invitationMessage,
      });

      try {
        const ratingModal = await page.$("#feelgood-questionnaire-content");
        if (!ratingModal) throw "rating modal not found.";

        console.log("rating modal found.");
        const parentRating = await ratingModal.evaluateHandle(
          (el) => el.parentElement
        );
        const buttonCloseRating = await parentRating.$(
          ":scope > div:nth-child(1) > span"
        );
        await buttonCloseRating.click();
      } catch {}

      // SECTION: STEP 2
      await stepSelectProduct(page, { comissionRate });

      // SECTION: STEP 3 disable free sample
      await waitForTimeout(2000);
      await clickByText(page, "Set up free samples");
      await waitForTimeout(1000);
      const toggleFreeSample = await page.$(
        'button[data-e2e="c57585ef-18ac-2cfa"]'
      );
      try {
        if (toggleFreeSample) {
          await toggleFreeSample.click();
          await waitForTimeout(1000);
        }
      } catch (er) {
        console.log("error fre sample :", er);
      }

      // SECTION: STEP 4 (FINAL) Select creator and submit invited collaboration
      const res = await stepSelectCreator(
        page,
        creatorsInCurrentIteration,
        conflictUsers,
        startPage
      );

      conflictUsers = res.conflictUsers;
      startPage = res.currentPage;

      // wait until the invitation is successfully sent
      await waitForElementWithText(page, "div", "Collab invite sent!");
      await waitForTimeout(3000);
      await clickByText(page, "View invitations");

      planLoopNumber++;
      creatorsLeft -= creatorsInCurrentIteration;
    }

    await page.evaluate(() => {
      window.alert("Program Completed");
    });
  } catch (error) {
    console.log("Error targetedCollaboration: ", error);
  }
}

module.exports = targetedCollaboration;
