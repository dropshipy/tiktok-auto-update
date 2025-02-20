require("dotenv").config({ path: __dirname + "/../.env" });

const axios = require("axios");
const ElectronStore = require("electron-store");
const { getApiBaseUrl } = require("../../helpers/api-url");
const store = new ElectronStore();

const BASE_URL = getApiBaseUrl();

function handleCookies(payload) {
  // Simulate an authentication request and return the obtained cookie
  return new Promise((resolve, reject) => {
    // Your authentication logic here, for example using axios
    axios
      .post(`${BASE_URL}/users/authenticate`, payload)
      .then((response) => {
        // Assuming the authentication endpoint returns a 'Set-Cookie' header
        const setCookieHeader = response.headers["set-cookie"];
        if (setCookieHeader) {
          // Check if setCookieHeader is an array (multiple cookies) or a string (single cookie)
          const cookies = Array.isArray(setCookieHeader)
            ? setCookieHeader
            : [setCookieHeader];

          // Extract the first cookie
          const cookie = cookies[0].split(";")[0];

          resolve(cookie);
        } else {
          reject(new Error("Authentication failed."));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function authenticateUserApp(payload) {
  try {
    // Simulate successful authentication and obtain a cookie
    handleCookies(payload)
      .then((cookie) => {
        // Store the obtained authentication cookie
        store.set("cookies-app", cookie);
      })

      .catch((error) => {
        store.set("console-auth", error.message);
        console.error("Authentication Error:", error.message);
      });
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({ message: error.message, buttons: ["OK"] });
  }
}
module.exports = { authenticateUserApp };
