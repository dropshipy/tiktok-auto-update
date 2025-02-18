export default async function ({ store }) {
  try {
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipResponse.json();

    const geoResponse = await fetch(
      `http://www.geoplugin.net/json.gp?ip=${ipData.ip}`
    );
    const geoData = await geoResponse.json();

    if (geoData && geoData.geoplugin_countryCode) {
      if (geoData.geoplugin_countryCode === "ID") {
        store.commit("SET_LANGUAGE", "ID");
      } else {
        store.commit("SET_LANGUAGE", "EN");
      }
    }
  } catch (error) {
    console.error("Failed to fetch user location:", error);
  }
}
