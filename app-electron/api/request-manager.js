require("dotenv").config({ path: __dirname + "/../.env" });

const axios = require("axios");
const ElectronStore = require("electron-store");
const { getApiBaseUrl } = require("../helpers/api-url");

const store = new ElectronStore();
const BASE_URL = getApiBaseUrl();

async function postData(endpoint = "", data = {}, options = {}, headers = {}) {
  try {
    const url = BASE_URL + endpoint;
    const response = await axios.post(url, data, {
      ...options,
      headers: { ...headers, Cookie: store.get("cookies-app") },
    });
    return response;
  } catch (error) {
    console.log(error?.message || error);

    return error.response;
  }
}

async function getData(endpoint = "", options = {}, Honeybadger) {
  try {
    const url = BASE_URL + endpoint;
    const response = await axios.get(url, {
      ...options,
      headers: { Cookie: store.get("cookies-app") },
    });
    return response;
  } catch (error) {
    console.log(error?.message || error);
  }
}

async function patchData(endpoint = "", data = {}, options = {}, Honeybadger) {
  try {
    const url = BASE_URL + endpoint;
    const response = await axios.patch(url, data, {
      ...options,
      headers: { Cookie: store.get("cookies-app") },
    });

    return response;
  } catch (error) {
    console.log(error?.message || error);
    return error.response;
  }
}

async function deleteData(endpoint = "", options = {}) {
  try {
    const url = BASE_URL + endpoint;
    const response = await axios.delete(url, {
      ...options,
      headers: { Cookie: store.get("cookies-app") },
    });
    return response;
  } catch (error) {
    console.log(error?.message || error);
  }
}

async function postDataTiktok(endpoint = "", data = {}, options = {}) {
  try {
    const response = await axios.post(endpoint, data, options);
    return response;
  } catch (error) {
    console.log(error?.message || error);
    return error.response;
  }
}

module.exports = {
  postData,
  getData,
  patchData,
  deleteData,
  postDataTiktok,
};
