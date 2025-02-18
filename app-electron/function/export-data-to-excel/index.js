const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const { waitForTimeout } = require("../../helpers/utils");
const { getData } = require("../../api/request-manager");

async function exportDataToExcel(fileName, endpoint, params) {
  let totalPages;
  let numberHeader = 0;
  let page = 1;
  const limit = 500;
  const tiktokCreatorData = [];

  do {
    try {
      const res = await getData(endpoint, {
        params: { page, limit, ...params },
      });

      if (!res?.data?.data || !Array.isArray(res.data.data)) {
        throw new Error("Error while fetching data");
      }

      const allKeys = new Set();
      res.data.data.forEach((item) => {
        Object.keys(item).forEach((key) => allKeys.add(key));
      });

      const processedData = await Promise.all(
        res.data.data.map(async (item) => {
          numberHeader++;
          const newItem = { No: numberHeader };

          for (const key of allKeys) {
            if (
              ["id", "createdBy", "createdAt", "modifiedAt", "userId"].includes(
                key
              )
            )
              continue;

            if (
              fileName.includes("buyer") &&
              key === "tiktokBuyerId" &&
              item[key]
            ) {
              try {
                const productRes = await getData(
                  `/tiktok-buyers/${item[key]}/products`
                );
                const productNames =
                  productRes?.data?.data?.map((p) => p.name) ?? [];
                newItem["Products"] =
                  productNames.length > 0 ? productNames.join(", ") : "";
              } catch (error) {
                console.log(
                  `Gagal fetch products untuk tiktokBuyerId ${item[key]}:`,
                  error
                );
                newItem["Products"] = "Failed to fetch";
              }
            } else {
              newItem[key] = item[key] ?? "";
            }
          }

          return newItem;
        })
      );

      tiktokCreatorData.push(...processedData);

      if (!totalPages) {
        // totalPages = 3;
        totalPages = res.data.pagination.totalPages;
      }
    } catch (err) {
      console.log(err);
    }

    page++;
    await waitForTimeout(3000);
  } while (page <= totalPages);

  const filePath = path.join(__dirname, `${fileName}-data.xlsx`);

  let existingData = [];
  if (fs.existsSync(filePath)) {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets["Sheet1"];
    existingData = XLSX.utils.sheet_to_json(worksheet);
  }

  const combinedData = [...existingData];
  tiktokCreatorData.forEach((newItem) => {
    const isDuplicate = existingData.some((existingItem) =>
      Object.keys(existingItem).every(
        (key) => existingItem[key] === newItem[key]
      )
    );

    if (!isDuplicate) {
      combinedData.push(newItem);
    }
  });

  const ws = XLSX.utils.json_to_sheet(combinedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, filePath);

  console.log("File is already updated:", filePath);
  return { success: true, filePath };
}

module.exports = { exportDataToExcel };
