const postData = require("./request-manager.js").postData;
const getData = require("./request-manager.js").getData;
const patchData = require("./request-manager.js").patchData;
const { parseCookieHeader } = require("../helpers/utils.js");
const { deleteData, postDataTiktok } = require("./request-manager.js");

const authenticateBot = async (data, options) => {
  const response = await postData("/users/authenticate-bot", data, options);
  if (response?.status == 405 || response?.status == 403) {
    return response;
  }

  let cookies = {};

  if (response.headers["set-cookie"]) {
    for (let cookieStr of response.headers["set-cookie"]) {
      const cookie = parseCookieHeader(cookieStr);
      cookies = {
        ...cookies,
        ...cookie,
      };
    }
  }

  return { ...response.data, sessionId: cookies["connect.sid"] };
};

const getTikblastSubscriptions = async (options) => {
  return await getData("/tikblast-subscriptions/v2", options);
};

const getTikblastConfig = async (subscriptionId, options) => {
  return await getData(`/tikblast-config/${subscriptionId}`, options);
};

const postTikblastConfig = async (data, options) => {
  return await postData("/tikblast-config", data, options);
};

const updateTikblastConfig = async (data, options) => {
  return await patchData(`/tikblast-config/${data.configId}`, data, options);
};

const getTikblastTargetedConfig = async (subscriptionId, options) => {
  return await getData(`/tikblast-targeted-config/${subscriptionId}`, options);
};

const postTikblastTargetedConfig = async (data, options) => {
  return await postData("/tikblast-targeted-config", data, options);
};

const updateTikblastTargetedConfig = async (data, options) => {
  return await patchData(
    `/tikblast-targeted-config/${data.configId}`,
    data,
    options
  );
};

const getCreatorTiktok = async (options) => {
  return await getData("/tikblast-creators", options);
};

const postCreatorTiktok = async (data, options) => {
  return await postData("/tikblast-creators", data, options);
};

const getSubscriptionCreator = async (subscriptionId, options) => {
  return await getData(
    `/tikblast-subscription-creators/${subscriptionId}`,
    options
  );
};

const postSubscriptionCreator = async (data, options) => {
  return await postData(
    `/tikblast-subscription-creators/${data.subscriptionId}`,
    data,
    options
  );
};

const getWhatsappTemplate = async (subscriptionId) => {
  return await getData(`/tikblast-whatsapp-templates/${subscriptionId}`);
};

const updateWhatsappTemplate = async (data) => {
  return await patchData(`/tikblast-whatsapp-templates/${data.templateId}`, {
    content: data.content,
  });
};

const postWhatsappTemplate = async (payload) => {
  const formData = new FormData();
  formData.append("content", payload.content);
  formData.append("file", null);

  return await postData(
    `/tikblast-whatsapp-templates/${payload.subscriptionId}`,
    formData,
    {},
    {
      "Content-Type": "multipart/form-data",
    }
  );
};

const getEmailTemplate = async (subscriptionId) => {
  return await getData(`/tikblast-email-templates/${subscriptionId}`);
};

const updateEmailTemplate = async (data) => {
  return await patchData(`/tikblast-email-templates/${data.templateId}`, {
    content: data.content,
  });
};

const postEmailTemplate = async (payload) => {
  const formData = new FormData();
  formData.append("content", payload.content);
  formData.append("file", null);

  return await postData(
    `/tikblast-email-templates/${payload.subscriptionId}`,
    formData,
    {},
    {
      "Content-Type": "multipart/form-data",
    }
  );
};

const postWishListCreator = async (subscriptionId, payload) => {
  return await postData(
    `/tikblast-wishlist-creators/${subscriptionId}`,
    payload
  );
};

const getWishListCreators = async ({ subscriptionId, ...params }) => {
  return await getData(`/tikblast-wishlist-creators/${subscriptionId}`, {
    params,
  });
};

const deleteWishListCreator = async (wishlistId) => {
  return await deleteData(`/tikblast-wishlist-creators/${wishlistId}`);
};

const postGetCreatorList = async (endpoint, data, options) => {
  return await postDataTiktok(endpoint, data, options);
};

const updateSubscriptionStatus = async (data, options) => {
  const { params } = options;
  return await patchData(
    `/tikblast-subscriptions/${params.id}/status`,
    data,
    options
  );
};

const getTargetedCreatorList = async ({
  subscriptionId,
  sessionId,
  params,
}) => {
  return await getData(
    `/tikblast-subscription-creators/${subscriptionId}/bot`,
    {
      params,
      headers: {
        Cookie: "connect.sid=" + sessionId,
      },
    }
  );
};

const postSaveCreatorManagement = async ({
  affiliateBaseUrl,
  countryCode,
  shopId,
  creatorId,
  headers,
}) => {
  const endpoint = `${affiliateBaseUrl}/api/v1/oec/affiliate/crm/creator/create?oec_seller_id=${shopId}&shop_region=${countryCode}`;
  return await postDataTiktok(
    endpoint,
    { oec_id: creatorId, source: 1 },
    { headers }
  );
};

const getTiktokBuyers = async (data) => {
  return await getData(`/tiktok-buyers`, data);
};
const getTiktokBuyersAdmin = async (data) => {
  return await getData(
    `/admin/tiktok-buyers?page=${data.page}&limit=${data.limit}`
  );
};
const postTiktokBuyer = async (data) => {
  return await postData("/tiktok-buyers", data);
};
const getProductsByBuyer = async (tiktokBuyerId) => {
  return await getData(`/tiktok-buyers/${tiktokBuyerId}/products`);
};

module.exports = {
  getTikblastSubscriptions,
  getTikblastConfig,
  postTikblastConfig,
  updateTikblastConfig,
  getTikblastTargetedConfig,
  postTikblastTargetedConfig,
  updateTikblastTargetedConfig,
  getCreatorTiktok,
  postCreatorTiktok,
  getSubscriptionCreator,
  postSubscriptionCreator,
  getWhatsappTemplate,
  updateWhatsappTemplate,
  postWhatsappTemplate,
  getEmailTemplate,
  updateEmailTemplate,
  postEmailTemplate,
  postWishListCreator,
  getWishListCreators,
  deleteWishListCreator,
  getTargetedCreatorList,
  postGetCreatorList,
  authenticateBot,
  updateSubscriptionStatus,
  postSaveCreatorManagement,
  getTiktokBuyers,
  getTiktokBuyersAdmin,
  postTiktokBuyer,
  getProductsByBuyer,
};
