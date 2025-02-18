const { clickByText, waitForTimeout } = require("../../helpers/utils");

async function handleDate(page, planEndDate) {
  try {
    // svg date picker
    await page.click(
      "#target_complete_details_until > div > div > div.arco-picker-input > input"
    );
    await waitForTimeout(2000);
    // wait for the modal date and click on the header value
    const datePickerHeader =
      "body > div span div div.arco-panel-date div div.arco-picker-header div.arco-picker-header-value";
    await page.waitForSelector(datePickerHeader);
    await page.click(datePickerHeader);
    await clickByText(page, planEndDate.year);
    const monthName = getMonthName(planEndDate.month);
    await waitForTimeout(1000);

    await page.evaluate((dateToSelect) => {
      const dates = document.querySelectorAll(
        `.arco-picker-cell:not(.arco-picker-cell-disabled) .arco-picker-date-value`
      );
      const selectedElement = Array.from(dates).find(
        (e) => e.textContent.trim() === dateToSelect
      );

      if (selectedElement) {
        selectedElement.click();
      } else {
        window.alert("Month was not found");
      }
    }, monthName);
    await waitForTimeout(1000);

    await page.evaluate((dateToSelect) => {
      const dates = document.querySelectorAll(
        `.arco-picker-cell:not(.arco-picker-cell-disabled) .arco-picker-date-value`
      );
      const selectedElement = Array.from(dates).find(
        (e) => e.textContent.trim() === dateToSelect.replace(/^0+/, "")
      );

      if (selectedElement) {
        selectedElement.click();
      } else {
        window.alert("Date not found");
      }
    }, planEndDate.date);

    await waitForTimeout(1000);
  } catch (error) {
    console.log(error);
  }
}

function getMonthName(monthNumber) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  if (monthNumber >= 1 && monthNumber <= 12) {
    return monthNames[monthNumber - 1];
  } else {
    console.error("Nomor bulan tidak valid.");
    return null;
  }
}

module.exports = handleDate;
