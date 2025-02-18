const handleDate = require("./handle-plan-date");

const {
  clickByText,
  waitForTimeout,
  waitForElementWithText,
  generateInputSelector,
  generateAllSelector,
  waitForElementToDisappear,
  waitForXPath,
  convertDateString,
} = require("../../helpers/utils");

async function targetedCollaboration({
  page,
  affiliateBaseUrl,
  config,
  initialCreatorPage = 1,
}) {
  try {
    const {
      iteration,
      planNumber,
      comissionRate,
      planName,
      endDate,
      whatsappNumber,
      telegramNumber,
      lineNumber,
      invitationMessage,
    } = config;

    const totalInvitations = Math.ceil(iteration / 50);

    let creatorsLeft = iteration;
    let planLoopNumber = planNumber;
    let creatorPage = initialCreatorPage;

    console.log("\n\n");
    console.log("===========================");
    console.log("Jumlah kreator: ", iteration);
    console.log("Total Undangan: ", totalInvitations);
    console.log("Creator Page: ", creatorPage);
    console.log("===========================");

    for (let i = 0; i < totalInvitations; i++) {
      console.log("Mulai looping...");
      console.log("Undangan ke: ", i + 1);
      console.log("Sisa kreator: ", creatorsLeft);

      const urlTargetedPlan = `${affiliateBaseUrl}/connection/target-invitation/create?enter_from=target_invitation_list`;
      await page.goto(urlTargetedPlan, {
        waitUntil: "networkidle2",
        timeout: 0,
      });

      // --- STEP 1: Pilih kreator --- //
      await waitForTimeout(1000);

      await clickByText(page, "Pilih kreator");

      console.log('Klik "Tambah dari Kelola kreator"');
      const addCreatorButton = await waitForElementWithText(
        page,
        "button",
        "Tambah kreator yang sudah dipilih"
      );
      if (!addCreatorButton) {
        throw new Error('"Tambah dari Kelola kreator" button not found');
      }
      await waitForTimeout(1000);
      await addCreatorButton.click();

      await waitForTimeout(1000);

      const sidePanelTitleElement = await page.$(".m4b-drawer-header-title");

      if (sidePanelTitleElement) {
        const text = await page.evaluate(
          (el) => el.textContent,
          sidePanelTitleElement
        );
        if (text.trim() !== "Tambah dari Kelola kreator") {
          throw new Error("Side panel pilih kreator tidak ditemukan");
        }
      }

      await waitForTimeout(1000);

      console.log('Klik "Tidak diundang dalam 90 hari terakhir"');
      // click not invited in last 90 days
      const notInvitedInLast90DaysCheckbox = await waitForElementWithText(
        page,
        "span",
        "Tidak diundang dalam 90 hari terakhir"
      );
      if (!notInvitedInLast90DaysCheckbox) {
        throw new Error(
          '"Tidak diundang dalam 90 hari terakhir" checkbox not found'
        );
      }
      await waitForTimeout(1000);
      await notInvitedInLast90DaysCheckbox.click();
      await waitForTimeout(1000);

      // click pagination page size
      const defaultPaginationSizeOption = "20/Halaman";
      const defaultPaginationSizeXPath = generateAllSelector(
        defaultPaginationSizeOption
      );
      await waitForXPath(page, defaultPaginationSizeXPath);
      await clickByText(page, defaultPaginationSizeOption);

      // change pagination page size
      const paginationSizeOption = "50/Halaman";
      const paginationSizeOptionXPath = generateAllSelector("50/Halaman");
      await waitForXPath(page, paginationSizeOptionXPath);
      await clickByText(page, paginationSizeOption);

      if (creatorPage > 1) {
        for (let i = 1; i < creatorPage; i++) {
          await waitForTimeout(1000);
          await waitForElementToDisappear(page, ".arco-spin-loading");
          await waitForTimeout(500);
          const nextPage = i + 1;
          const paginationItemSelector = `.arco-pagination-item[aria-label="Halaman ${nextPage}"]`;
          const pageItem = await page.waitForSelector(paginationItemSelector);
          await pageItem.click(paginationItemSelector);
          console.log("Ke table kreator halaman: ", nextPage);
          await waitForTimeout(1000);
        }
      } else {
        await waitForElementToDisappear(page, ".arco-spin-loading");
      }

      if (creatorsLeft < 50) {
        console.log(`Pilih ${creatorsLeft} kreator`);
        // click product checkbox
        for (let j = 0; j < creatorsLeft; j++) {
          await waitForTimeout(500);
          const currentRow = j + 1;
          console.log("Pilih kreator baris ke: ", currentRow);
          const selectCreatorCheckbox = await page.waitForSelector(
            `body > div.arco-drawer-wrapper.index-module__drawerWrapper--cuQ24 > div.arco-drawer.m4b-drawer.bg-neutral-bg3.slideRight-enter-done > div > span > div > div.arco-drawer-content > div > div > div > div:nth-child(2) > div > div > div > div.arco-table-container > div > div > table > tbody > tr:nth-child(${currentRow}) > td.arco-table-td.arco-table-operation.arco-table-checkbox > label`
          );
          await selectCreatorCheckbox.click();
          await waitForTimeout(500);
        }

        creatorsLeft = 0;
      } else {
        console.log("Pilih semua kreator (50)");
        // click all product checkbox
        const selectAllCreatorCheckbox = await page.waitForSelector(
          "body > div.arco-drawer-wrapper.index-module__drawerWrapper--cuQ24 > div.arco-drawer.m4b-drawer.bg-neutral-bg3.slideRight-enter-done > div > span > div > div.arco-drawer-content > div > div > div > div:nth-child(2) > div > div > div > div.arco-table-container > div > div > table > thead > tr > th.arco-table-th.arco-table-operation.arco-table-checkbox > div > label"
        );
        await waitForTimeout(1000);
        await selectAllCreatorCheckbox.click();

        creatorsLeft = creatorsLeft - 50;
      }
      await waitForTimeout(1000);

      // click button 'Tambahkan'
      await page.click(
        "body > div.arco-drawer-wrapper.index-module__drawerWrapper--cuQ24 > div.arco-drawer.m4b-drawer.bg-neutral-bg3.slideRight-enter-done > div > span > div > div.arco-drawer-footer > div > div > div.space-x-12 > button.arco-btn.arco-btn-primary.arco-btn-size-default.arco-btn-shape-square.m4b-button"
      );

      // --- STEP 2: Pilih produk --- //

      await clickByText(page, "Pilih produk");
      await waitForTimeout(1000);
      await clickByText(page, "Tambahkan produk");

      const statusProductEl = generateAllSelector("Memenuhi syarat");
      await waitForXPath(page, statusProductEl);
      const rowsBefore = await page.$$(".arco-table-tr");
      const totalRowsBefore = rowsBefore.length;
      if (totalRowsBefore >= 20) {
        await waitForTimeout(1000);

        // click button pagination
        await page.click(
          "body > div.arco-drawer-wrapper > div.arco-drawer.m4b-drawer.slideRight-appear-done.slideRight-enter-done > div > span > div > div.arco-drawer-content > div > div > div.sc-koXPp.bKxjih > div > div > div > div.arco-pagination.arco-pagination-size-default.m4b-pagination > div > div"
        );
        const paginationPerPageEl = generateAllSelector("100/Halaman");
        await waitForXPath(page, paginationPerPageEl);
        await clickByText(page, "100/Halaman");
      }
      await waitForElementToDisappear(page, ".arco-spin-loading");

      // checkbox product
      const checkboxProduct =
        "body > div.arco-drawer-wrapper > div.arco-drawer.m4b-drawer.slideRight-appear-done.slideRight-enter-done > div > span > div > div.arco-drawer-content > div > div > div.sc-koXPp.bKxjih > div > div > div > div.arco-table-container > div > div > table > thead > tr > th.arco-table-th.arco-table-operation.arco-table-checkbox > div > label";

      await waitForTimeout(1000);
      await page.click(checkboxProduct);
      await waitForTimeout(1000);

      // tambahkan btn
      await page.click(
        "body > div.arco-drawer-wrapper > div.arco-drawer.m4b-drawer.slideRight-appear-done.slideRight-enter-done > div > span > div > div.arco-drawer-footer > div > div > div.space-x-12 > button.arco-btn.arco-btn-primary.arco-btn-size-default.arco-btn-shape-square.m4b-button"
      );

      // check is invitation exist
      const isInvitationExist = await waitForElementWithText(
        page,
        "span",
        "Undangan sudah ada",
        10000
      );
      if (isInvitationExist) {
        console.log(
          `Undangan sudah ada, ulangi proses dari pilih kreator di halaman ${
            creatorPage + 1
          }`
        );

        await targetedCollaboration({
          page,
          config,
          initialCreatorPage: creatorPage + 1,
        });

        return;
      } else {
        console.log("Undangan tidak ada, lanjutkan proses...");
      }

      await waitForElementToDisappear(page, ".opacity-50.pointer-events-none");
      await waitForTimeout(1000);

      // click button pagination
      await page.click(
        "#content-container > main > div > div > div > div > div.arco-spin.m4b-loading.sc-aXZVg.jtPlra.w-full.h-full > div > form > div > div > div.flex.flex-col.flex-grow.space-y-16 > div.arco-collapse.arco-collapse-borderless.m4b-collapse.m4b-collapse-title-default.sc-jsJBEP.kJvXgJ > div:nth-child(2) > div > div > div.arco-collapse-item-content.arco-collapse-item-content-expanded > div > div.sc-iHGNWf.fFdGkU > div > div > div > div > div.arco-pagination.arco-pagination-size-default.m4b-pagination > div > div > div"
      );

      await clickByText(page, "50/Halaman");
      await waitForTimeout(1500);

      // click checkbox all product
      await page.click(
        "#content-container > main > div > div > div > div > div.arco-spin.m4b-loading.sc-aXZVg.jtPlra.w-full.h-full > div > form > div > div > div.flex.flex-col.flex-grow.space-y-16 > div.arco-collapse.arco-collapse-borderless.m4b-collapse.m4b-collapse-title-default.sc-jsJBEP.kJvXgJ > div:nth-child(2) > div > div > div.arco-collapse-item-content.arco-collapse-item-content-expanded > div > div.sc-iHGNWf.fFdGkU > div > div > div > div > div.arco-table-container > div > div > div.arco-table-header > table > thead > tr > th.arco-table-th.arco-table-operation.arco-table-checkbox > div > label"
      );

      await waitForTimeout(1000);

      try {
        const selectAllBtnXPath =
          '//button[contains(@class, "arco-btn-primary-text") and .//span[contains(text(), "Pilih semua")]]';

        const buttonElement = await waitForXPath(page, selectAllBtnXPath, {
          timeout: 5000,
        });
        await buttonElement.click();
      } catch (error) {
        console.error("Tombol pilih semua tidak ditemukan");
      }

      await waitForTimeout(1000);

      await clickByText(page, "Ubah massal komisi");
      const commissionInputRate = generateInputSelector("1.00-80.00");
      await page.click(commissionInputRate);
      await page.type(commissionInputRate, comissionRate);
      await waitForTimeout(1500);

      // click add button commission
      await page.click(
        "#content-container > main > div > div > div > div > div.arco-spin.m4b-loading.sc-aXZVg.jtPlra.w-full.h-full > div > form > div > div > div.flex.flex-col.flex-grow.space-y-16 > div.arco-collapse.arco-collapse-borderless.m4b-collapse.m4b-collapse-title-default.sc-jsJBEP.kJvXgJ > div:nth-child(2) > div > div > div.arco-collapse-item-content.arco-collapse-item-content-expanded > div > div.flex.items-center.justify-between.mb-16 > div:nth-child(2) > div > button.arco-btn.arco-btn-secondary.arco-btn-size-default.arco-btn-shape-square.m4b-button.mr-8.p-12"
      );

      // --- STEP 3: Buat undangan --- //
      await clickByText(page, "Buat undangan");
      await waitForTimeout(1500);

      const invitationNameInput = generateInputSelector("Nama undangan");
      const invitationName = `${planName} ${planLoopNumber}`;
      await page.type(invitationNameInput, invitationName);
      await waitForTimeout(1000);

      const planEndDate = endDate.split("-").reverse().join("/");
      const customPlandEndDate = convertDateString(planEndDate);
      await handleDate(page, customPlandEndDate);
      await waitForTimeout(3000);

      const whatsappAccountInput = generateInputSelector(
        "Masukkan nomor akun WhatsApp"
      );
      await page.click(whatsappAccountInput, { clickCount: 3 });
      await page.keyboard.down("Backspace");
      await waitForTimeout(500);
      await page.type(whatsappAccountInput, whatsappNumber);
      await waitForTimeout(1000);

      const telegramAccountInput = generateInputSelector(
        "Mohon masukkan nomor telegram"
      );
      if (telegramNumber) {
        await page.click(telegramAccountInput, { clickCount: 3 });
        await page.keyboard.down("Backspace");

        await page.click(telegramAccountInput);
        await page.type(telegramAccountInput, telegramNumber);
        await waitForTimeout(1000);
      } else {
        await page.click(telegramAccountInput, { clickCount: 3 });
        await page.keyboard.down("Backspace");
      }

      const lineAccountInput = generateInputSelector(
        "Please enter a Line account number"
      );
      if (lineNumber) {
        await page.click(lineAccountInput, { clickCount: 3 });
        await page.keyboard.down("Backspace");

        await page.click(lineAccountInput);
        await page.type(lineAccountInput, lineNumber);
        await waitForTimeout(1000);
      } else {
        await page.click(lineAccountInput, { clickCount: 3 });
        await page.keyboard.down("Backspace");
      }

      const invitationMessageInput = await page.waitForSelector(
        "#target_complete_details_message_input"
      );
      await invitationMessageInput.click();

      const selectAllKey = process.platform === "darwin" ? "Meta" : "Control";

      // Select all text using Ctrl+A (or Command+A on Mac)
      await page.keyboard.down(selectAllKey);
      await page.keyboard.press("a");
      await page.keyboard.up(selectAllKey);

      // Delete the selected text
      await page.keyboard.press("Backspace");

      await waitForTimeout(1000);
      await invitationMessageInput.type(invitationMessage);
      await waitForTimeout(500);

      // send button
      await page.click(
        "#content-container > main > div > div > div > div > div.arco-spin.m4b-loading.sc-aXZVg.jtPlra.w-full.h-full > div > form > div > div > div.flex.flex-col.flex-grow.space-y-16 > div.self-end.space-x-12 > button.arco-btn.arco-btn-primary.arco-btn-size-default.arco-btn-shape-square.m4b-button"
      );

      // wait until the invitation is successfully sent
      await waitForElementWithText(page, "div", "Selamat.");
      await waitForTimeout(3000);
      await clickByText(page, "Lihat undangan");

      creatorPage++;
      planLoopNumber++;
    }

    await page.evaluate(() => {
      window.alert("Program Selesai");
    });
  } catch (error) {
    console.log("Error targetedCollaboration: ", error);
  }
}

module.exports = targetedCollaboration;
