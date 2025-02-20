require("dotenv").config({ path: __dirname + "/../.env" });

const fs = require("fs");
const path = require("node:path");
const axios = require("axios");
const { getApiBaseUrl } = require("../helpers/api-url");
const COOKIES_APP = path.join(__dirname, "../store/cookies-app.json");

const BASE_URL = getApiBaseUrl();

async function saveCookies(cookies) {
  fs.writeFileSync(COOKIES_APP, JSON.stringify(cookies));
}

function authenticateUser(payload) {
  // Simulate an authentication request and return the obtained cookie
  return new Promise((resolve, reject) => {
    // Your authentication logic here, for example using axios
    axios
      .post(`${BASE_URL}/users/authenticate`, payload)
      .then((response) => {
        console.log(response);
        // Assuming the authentication endpoint returns a 'Set-Cookie' header
        const setCookieHeader = response.headers["set-cookie"];
        console.log(setCookieHeader);
        if (setCookieHeader) {
          // Check if setCookieHeader is an array (multiple cookies) or a string (single cookie)
          const cookies = Array.isArray(setCookieHeader)
            ? setCookieHeader
            : [setCookieHeader];

          // Extract the first cookie
          const cookie = cookies[0].split(";")[0];
          saveCookies(cookie);
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
module.exports = { authenticateUser };
