const path = require("node:path");
const fs = require("fs");

function waitForTimeout(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}
function parseCookieHeader(header) {
  // Split the header into individual name-value pairs
  const pairs = header.split(";");

  // Create an object to store the cookies
  const cookies = {};

  // Loop through the name-value pairs and store them in the object
  for (let i = 0; i < pairs.length; i++) {
    const nameValue = pairs[i].split("=");
    cookies[nameValue[0].trim()] = nameValue[1];
  }

  // Return the object
  return cookies;
}
async function saveCookies(path, config) {
  console.log({ path });
  fs.writeFileSync(path, JSON.stringify(config));
}
async function loadCookies(path) {
  if (fs.existsSync(path)) {
    const cookies = JSON.parse(fs.readFileSync(path, "utf-8"));
    return cookies;
  }
}

// example : generateCustomSelector('div','test)
const generateCustomSelector = (element, text) =>
  `//${element}[contains(text(),'${text}')]`;

const waitForElementWithText = async (
  page,
  element,
  text,
  timeout = 30_000
) => {
  const selector = generateCustomSelector(element, text);

  try {
    const element = await waitForXPath(page, selector, { timeout });
    return element;
  } catch (error) {
    console.error(`Error: Element with text '${text}' not found`);
    return null;
  }
};

// example   clickByText(page, "test");
const clickByText = async (page, text) => {
  const xpath = `// *[contains(text(), '${text}')]`;
  try {
    await waitForXPath(page, xpath);
    const element = await waitForXPath(page, xpath);
    if (element) {
      await waitForTimeout(1000);
      await element.click();
    } else {
      console.error(`Element with text '${text}' not found`);
    }
  } catch (error) {
    console.error(`Error while waiting for XPath: ${error}`);
  }
};
/**
 * @param {object} page - The page object library Puppeteer.
 * @param {string[]} texts - An array of text strings to search for in the page.
 */
const clickByMultipleText = async (page, texts) => {
  for (const text of texts) {
    const xpath = `//*[contains(text(), '${text}')]`;
    try {
      await waitForXPath(page, xpath);
      const element = await waitForXPath(page, xpath);

      if (element) {
        await waitForTimeout(1000);
        await element.click();
        return;
      }
    } catch (error) {
      console.error(
        `Error while waiting for XPath with text '${text}': ${error}`
      );
    }
  }

  console.error(`None of the elements with the provided texts were found`);
};

async function waitForLocalStorageData(page, key) {
  await page.waitForFunction(
    (key) => {
      return localStorage.getItem(key) !== null;
    },
    {},
    key
  );
}

async function getLocalStorageData(page, key) {
  return page.evaluate((key) => {
    return localStorage.getItem(key);
  }, key);
}

async function waitAndClick(page, selector, options) {
  try {
    if (selector.match(/^\/\/|^\//)) {
      const element = await waitForXPath(page, selector, options);
      await element.click();
    } else {
      await page.waitForSelector(selector, options);
      await page.click(selector);
    }
  } catch (e) {
    console.log("waitAndClick: ", e?.message);
  }
}

const containsText = (element = "*", text, text2) =>
  `//${element}[contains(text(), "${text}")${
    text2 ? ` or contains(text(), "${text2}")` : ""
  }]`;

const spanContainsSingleText = (text) =>
  `//span[text()[contains(.,'${text}')]]`;

const spanContainsMultipleTexts = (text, text2) =>
  containsText("span", text, text2);

async function clickSubcategory(page, subcategory, Honeybadger) {
  try {
    const btnSelector = spanContainsSingleText(subcategory);
    const btn = await waitForXPath(page, btnSelector);
    if (btn) {
      await btn.click();
      await waitForTimeout(500);
    }
  } catch (error) {
    console.log("errorClickingSubcategory ", error);
  }
}

function replaceString(inputString) {
  // Replace "18-24" with "18-24"
  let modifiedString = inputString.replace(/18 - 24/g, "18-24");

  // Replace "24-34" with "24-34"
  modifiedString = modifiedString.replace(/25 - 34/g, "25-34");

  // Replace "35+" with "35 keatas"
  modifiedString = modifiedString.replace(/35\+/g, "35 keatas");

  return modifiedString;
}

// OLD: Category from main_industy atribute
// function translateCategoryToIdn(category) {
//   switch (category) {
//     case "Beauty":
//       return "Kecantikan";
//     case "Electronics":
//       return "Barang Elektronik";
//     case "Fashion":
//       return "Fashion";
//     case "Food":
//       return "Makanan";
//     case "Lifestyle":
//       return "Rumah & Gaya Hidup";
//     case "Mom & Babies":
//       return "Ibu dan Bayi";
//     case "Personal care & Health":
//       return "Perawatan & Kesehatan Pribadi";
//     default:
//       return "";
//   }
// }

// NEW: Category from category atribute
function translateCategoryToIdn(category) {
  switch (category) {
    case "Home Supplies":
      return "Perlengkapan Rumah";
    case "Kitchenware":
      return "Peralatan Dapur";
    case "Textiles & Soft Furnishings":
      return "Tekstil & Soft Furnishing";
    case "Household Appliances":
      return "Peralatan Rumah Tangga";
    case "Womenswear & Underwear":
      return "Pakaian & Pakaian Dalam Wanita";
    case "Muslim Fashion":
      return "Fashion Muslim";
    case "Shoes":
      return "Sepatu";
    case "Beauty & Personal Care":
      return "Perawatan & Kecantikan";
    case "Phones & Electronics":
      return "Telepon & Elektronik";
    case "Computers & Office Equipment":
      return "Komputer & Peralatan Kantor";
    case "Pet Supplies":
      return "Perlengkapan Hewan Peliharaan";
    case "Baby & Maternity":
      return "Bayi & Persalinan";
    case "Sports & Outdoor":
      return "Olahraga & Outdoor";
    case "Toys & Hobbies":
      return "Mainan & Hobi";
    case "Furniture":
      return "Furnitur";
    case "Tools & Hardware":
      return "Alat & Perangkat Keras";
    case "Home Improvement":
      return "Perbaikan Rumah";
    case "Automotive & Motorcycle":
      return "Mobil & Sepeda Motor";
    case "Fashion Accessories":
      return "Aksesoris Fashion";
    case "Food & Beverages":
      return "Makanan & Minuman";
    case "Health":
      return "Kesehatan";
    case "Books, Magazines & Audio":
      return "Buku, Majalah, & Audio";
    case "Kids' Fashion":
      return "Fashion Anak";
    case "Menswear & Underwear":
      return "Pakaian & Pakaian Dalam Pria";
    case "Luggage & Bags":
      return "Koper & Tas";
    case "Collectibles":
      return "Koleksi";
    case "Jewelry Accessories & Derivatives":
      return "Aksesori Perhiasan & Turunannya";
    default:
      return "";
  }
}

const generateInputSelector = (placeholder) =>
  `input[placeholder="${placeholder}"]`;

/**
 * @param {string} element
 * @param {string[]} placeholders
 */
const generateMultiSelectorPlaceholder = (element, placeholders) => {
  return placeholders
    .map((placeholder) => `${element}[placeholder="${placeholder}"]`)
    .join(", ");
};

const generateAllSelector = (text) => `//*[contains(text(),'${text}')]`;

const waitForElementToDisappear = async (page, selector) => {
  try {
    await page.waitForSelector(selector, { hidden: true, timeout: 10000 });
  } catch (error) {
    console.error(`Error while waiting for element to disappear: ${error}`);
  }
};

const waitForXPath = (page, xpath, opt = {}) => {
  return page.waitForSelector(`xpath/${xpath}`, opt);
};

const isElementPresent = async (page, selector) => {
  try {
    await page.waitForSelector(selector, { timeout: 3000 });
    return true;
  } catch (error) {
    return false;
  }
};

const convertDateString = (dateString) => {
  const match = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (match) {
    const convertDate = {
      date: match[1],
      month: match[2],
      year: match[3],
    };

    return convertDate;
  } else {
    return null;
  }
};

function randomDelay(minMilliseconds = 2000, maxMilliseconds = 4000) {
  const delay =
    Math.floor(Math.random() * (maxMilliseconds - minMilliseconds + 1)) +
    minMilliseconds;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

module.exports = {
  waitForTimeout,
  parseCookieHeader,
  saveCookies,
  loadCookies,
  generateCustomSelector,
  waitForElementWithText,
  waitAndClick,
  clickByText,
  waitForLocalStorageData,
  getLocalStorageData,
  spanContainsSingleText,
  spanContainsMultipleTexts,
  clickSubcategory,
  replaceString,
  translateCategoryToIdn,
  generateInputSelector,
  generateAllSelector,
  waitForElementToDisappear,
  waitForXPath,
  isElementPresent,
  convertDateString,
  clickByMultipleText,
  generateMultiSelectorPlaceholder,
  randomDelay,
};
