async function saveCreator({
  page,
  subscriptionId,
  creatorPayload,
  sessionId,
}) {
  try {
    const ctx = { creator: creatorPayload, sessionId };
    await page.evaluate(async (_ctx) => {
      await window.sendSubscriptionCreatorData(_ctx);
    }, ctx);

    const resetCreatorPayload = {
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
    return resetCreatorPayload;
  } catch (error) {
    console.log("error save creator:", error);
  }
}
module.exports = saveCreator;
