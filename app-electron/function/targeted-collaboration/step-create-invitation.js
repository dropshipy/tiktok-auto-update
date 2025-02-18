const handleDate = require("./handle-plan-date");
const {
  waitForTimeout,
  convertDateString,
  generateInputSelector,
} = require("../../helpers/utils");

const stepCreateInvitation = async (page, config) => {
  const {
    countryCode,
    planName,
    planLoopNumber,
    endDate,
    whatsappNumber,
    telegramNumber,
    lineNumber,
    facebookAccount,
    invitationMessage,
  } = config;
  await waitForTimeout(1000);

  const invitationNameInput = generateInputSelector("Invitation name");
  const invitationName = `${planName} ${planLoopNumber}`;
  await page.type(invitationNameInput, invitationName);
  await waitForTimeout(1000);

  const planEndDate = endDate.split("-").reverse().join("/");
  const customPlandEndDate = convertDateString(planEndDate);
  await handleDate(page, customPlandEndDate);
  await waitForTimeout(3000);

  const whatsappAccountInput = generateInputSelector(
    "Please enter a WhatsApp account number"
  );
  await page.click(whatsappAccountInput, { clickCount: 3 });
  await page.keyboard.down("Backspace");
  await waitForTimeout(500);
  await page.type(whatsappAccountInput, whatsappNumber);
  await waitForTimeout(1000);

  const telegramAccountInput = generateInputSelector(
    "Please enter a telegram number"
  );
  if (telegramNumber) {
    await page.click(telegramAccountInput, { clickCount: 3 });
    await page.keyboard.down("Backspace");

    await page.click(telegramAccountInput);
    await page.type(telegramAccountInput, telegramNumber);
    await waitForTimeout(1000);
  } else {
    await page.click(telegramAccountInput, { clickCount: 3 });
    await page.keyboard.down("Backspace");
  }

  if (countryCode === "ID") {
    const lineAccountInput = generateInputSelector(
      "Please enter a Line account number"
    );
    if (lineNumber) {
      await page.click(lineAccountInput, { clickCount: 3 });
      await page.keyboard.down("Backspace");

      await page.click(lineAccountInput);
      await page.type(lineAccountInput, lineNumber);
      await waitForTimeout(1000);
    } else {
      await page.click(lineAccountInput, { clickCount: 3 });
      await page.keyboard.down("Backspace");
    }
  } else {
    const facebookAccountInput = generateInputSelector(
      "Please enter an Facebook account"
    );
    if (facebookAccount) {
      await page.click(facebookAccountInput, { clickCount: 3 });
      await page.keyboard.down("Backspace");

      await page.click(facebookAccountInput);
      await page.type(facebookAccountInput, facebookAccount);
      await waitForTimeout(1000);
    } else {
      await page.click(facebookAccountInput, { clickCount: 3 });
      await page.keyboard.down("Backspace");
    }
  }

  const invitationMessageInput = await page.waitForSelector(
    "#target_complete_details_message_input"
  );
  await invitationMessageInput.click({ count: 3 });

  // const selectAllKey = process.platform === "darwin" ? "Command" : "Control";

  // Select all text using Ctrl+A (or Command+A on Mac)
  // await page.keyboard.down(selectAllKey);
  // await page.keyboard.press("a");
  // await page.keyboard.up(selectAllKey);

  // Delete the selected text
  await page.keyboard.press("Backspace");

  await waitForTimeout(1000);
  await invitationMessageInput.type(invitationMessage);
  await waitForTimeout(1000);
};

module.exports = stepCreateInvitation;