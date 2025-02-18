const { postGetCreatorList } = require("../../api/interface");

const getCreatorList = async ({ endpoint, header, config }) => {
  try {
    const limit = 12;
    const { filterParams } = config;
    const payloadPostGetCreatorV2 = {
      query: "",
      pagination: { size: limit, page: 0 },
      algorithm: 1,
    };

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

    const getCreatorListRes = await postGetCreatorList(
      endpointPostGetV2,
      payloadPostGetCreatorV2,
      {
        headers: header,
      }
    );

    const list = getCreatorListRes?.data?.creator_profile_list;

    return list || [];
  } catch (error) {
    console.log("eror get creator list:", error.message);
  }
};

module.exports = getCreatorList;
