const openDrawerCreator = require("./open-drawer-creator");
const {
  clickByText,
  waitForTimeout,
  waitForElementWithText,
  waitForElementToDisappear,
} = require("../../helpers/utils");

// creatorsInCurrentIteration for pick creator less than 50
const stepSelectCreator = async (
  page,
  creatorsInCurrentIteration,
  conflictUsers,
  creatorStartPage
) => {
  let currentIndex = 1;
  let tempCreatorsLeft = creatorsInCurrentIteration;
  let currentPage = creatorStartPage ? creatorStartPage : 1;
  let isLastRowDrawer = false;

  page.on("response", async (response) => {
    if (
      response.url().includes("/invitation_group/conflict_check") ||
      response.url().includes("/invitation_group/create")
    ) {
      const responseData = await response.json();
      if (responseData.data?.conflict_list) {
        const conflictUsersNew = [
          ...new Set(
            responseData.data.conflict_list
              .flatMap(({ creator_id_list }) => creator_id_list)
              .map(({ base_info }) => base_info.user_name)
          ),
        ];

        conflictUsers = [...new Set([...conflictUsers, ...conflictUsersNew])];

        isCheckingConflict = false;
      }
    }
  });

  //SECTION - select creator step 1
  await waitForTimeout(1000);
  if (currentIndex === 1) {
    await clickByText(page, "Choose creators");
  }
  await waitForTimeout(1000);

  while (tempCreatorsLeft > 0) {
    try {
      while (tempCreatorsLeft > 0) {
        // let creatorStartPage = Math.floor(tempModalCreatorCounter / 50) + 1;
        console.log("tempCreatorsLeft top: ", tempCreatorsLeft);

        const addCreatorButton = await waitForElementWithText(
          page,
          "button",
          "Add pre-selected creators"
        );
        if (!addCreatorButton) {
          throw new Error('"Add pre-selected creators" button not found');
        }
        await waitForTimeout(1000);
        await addCreatorButton.evaluate((b) => b.click());
        await waitForTimeout(1000);

        await page.waitForSelector(
          ".m4b-drawer-header-title:not(.m4b-drawer-header-noclose)"
        );

        const sidePanelTitleElement = await page.$eval(
          ".m4b-drawer-header-title:not(.m4b-drawer-header-noclose)",
          (el) => el.textContent.trim()
        );

        if (sidePanelTitleElement !== "Add pre-selected creators") {
          throw new Error(
            'Side panel "Add pre-selected creators" tidak ditemukan'
          );
        }

        await waitForTimeout(1000);

        // click not invited in last 90 days
        const notInvitedInLast90DaysCheckbox = await waitForElementWithText(
          page,
          "span",
          "Not invited in past 90 days"
        );
        if (!notInvitedInLast90DaysCheckbox) {
          throw new Error('"Not invited in past 90 days" checkbox not found');
        }
        await waitForTimeout(1000);
        await notInvitedInLast90DaysCheckbox.evaluate((el) => el.click());
        await page.waitForResponse((response) =>
          response.url().includes("creator/target_collaboration/list")
        );
        await waitForTimeout(1500);

        const container = await page.$('div[data-e2e="f142d5df-7538-fbb9"]');

        // Cari dropdown untuk ukuran Page
        const dropdownSelector = '.arco-pagination-option div[role="combobox"]';
        const dropdown = await container.$(dropdownSelector);
        if (!dropdown) {
          throw new Error("Dropdown ukuran Page tidak ditemukan.");
        }

        // Klik dropdown untuk membuka opsi
        await dropdown.click();
        await waitForTimeout(3000); // Tunggu dropdown muncul

        // Cari elemen dengan teks "50/Page"
        const optionSelector = 'li[role="option"]';
        const options = await container.$$(optionSelector);

        // Iterasi opsi dan klik opsi dengan teks "50/Page"
        let found = false;
        for (const option of options) {
          const textContent = await option.evaluate((el) =>
            el.textContent.trim()
          );
          if (textContent === "50/Page") {
            await option.click();
            found = true;
            break;
          }
        }

        if (!found) {
          throw new Error('Opsi "50/Page" tidak ditemukan dalam dropdown.');
        }

        await waitForElementToDisappear(page, ".arco-spin-loading");
        await waitForTimeout(1000);

        // handle pagination
        let targetPage = null;
        const containerDrawer = await page.$(
          'div[data-e2e="c7e2ab6d-a451-e62e"]'
        );
        const tableDrawerSelector =
          "div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > table:nth-child(1) ";

        while (!targetPage) {
          let paginationContainer = await containerDrawer.$(
            ":scope > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > ul:nth-child(1)"
          );
          if (!paginationContainer) {
            throw new Error('Opsi "paginationContainer" tidak ditemukan.');
          }

          let paginationPages = await paginationContainer.$$("li");
          for (const pageElement of paginationPages) {
            const pageNumber = await pageElement.evaluate((el) =>
              el.textContent.trim()
            );
            if (pageNumber == currentPage) {
              targetPage = pageElement;
              await pageElement.click();
              await waitForTimeout(2000); // Wait for the page to load
              break;
            }
          }

          if (!targetPage) {
            const dotPage = paginationPages[paginationPages.length - 3];
            if (dotPage) {
              await dotPage.click();
              await waitForTimeout(3000);
            }
          }
        }

        await waitForElementToDisappear(page, ".arco-spin-loading");
        await waitForTimeout(1000);

        if (tempCreatorsLeft == 50) {
          const selectAllCheckbox = await containerDrawer.$(
            `:scope > ${tableDrawerSelector} > thead:nth-child(2) > tr:nth-child(1) > th:nth-child(1) > div:nth-child(1) > label:nth-child(1) > span:nth-child(2) > div:nth-child(1)`
          );
          if (selectAllCheckbox) {
            await selectAllCheckbox.click();
          }
          isLastRowDrawer = true;
          await waitForTimeout(1000);
        } else {
          // loop for creator cards in the page
          const tbodySelector = `:scope > ${tableDrawerSelector} > tbody:nth-child(3)`;
          const tbody = await containerDrawer.$(tbodySelector);
          const rows = await tbody.$$("tr");

          let selectedCounter = 0;
          console.log("conflict length: ", conflictUsers.length);
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            isLastRowDrawer = i === rows.length - 1;

            if (selectedCounter < tempCreatorsLeft) {
              const checkbox = await row.$(
                "td:nth-child(1) > span:nth-child(1) > label:nth-child(1) > span:nth-child(2) > div:nth-child(1)"
              );
              const userName = await row.$eval(
                "td:nth-child(2) > div > span > div > div:nth-child(2) > span > span > span",
                (el) => el.textContent.trim()
              );

              let isAlreadyInvite = conflictUsers.includes(userName);

              if (checkbox && !isAlreadyInvite) {
                await checkbox.click();
                selectedCounter++;
              }
            }
          }
          await waitForTimeout(500);
        }

        // click button 'Tambahkan'
        await page.click(
          "body > div.arco-drawer-wrapper > div.arco-drawer.m4b-drawer.bg-neutral-bg3.slideRight-enter-done > div > span > div > div.arco-drawer-footer > div > div > div.space-x-12 > button.arco-btn.arco-btn-primary.arco-btn-size-default.arco-btn-shape-square.m4b-button"
        );

        // conflictUsers = [];
        let isCheckingConflict = true;
        let timeoutCheckConflict = 0;

        while (isCheckingConflict) {
          await waitForTimeout(1000);
          timeoutCheckConflict++;
          if (timeoutCheckConflict >= 5) {
            break;
          }
        }

        // check is invitation exist
        const isInvitationExist = await waitForElementWithText(
          page,
          "span",
          "Duplicate invitations",
          6500
        );

        if (isInvitationExist) {
          console.log(
            "Konflik kreator, sudah diundang: ",
            conflictUsers.length
          );
          await clickByText(page, "OK");
          await waitForTimeout(1000);
        } else {
          console.log("Semua kreator bisa diundang");
        }

        await waitForTimeout(1000);
        await waitForElementToDisappear(page, ".arco-icon-loading");
        await waitForTimeout(3000);

        const spanSelector = "div.my-16 > div:nth-child(1) > span:nth-child(1)";
        const spanElement = await page.$(spanSelector);

        if (spanElement) {
          const spanText = await spanElement.evaluate((el) =>
            el.textContent.trim()
          );
          const firstHalfText = spanText.split("/")[0];
          tempCreatorsLeft = creatorsInCurrentIteration - Number(firstHalfText);
        }
        // if (tempCreatorsLeft > 0) {
        //   // currentPage++;
        // }
        if (isLastRowDrawer) {
          currentPage++;
          conflictUsers = [];
          console.log({ currentPage });
        }
      }

      //SECTION -  handle modal after submit to
      const handleSendInvitation = async (creatorsInCurrentIteration) => {
        console.log("handleSendInvitation");
        try {
          const submitBtn = await page.waitForSelector(
            'button[data-e2e="140f8059-efa6-4618"]'
          );

          console.log("klik submit button");
          await submitBtn.click();
          await waitForTimeout(2000);

          try {
            const isInvitationExist = await waitForElementWithText(
              page,
              "span",
              "Duplicate invitations",
              8000
            );
            if (isInvitationExist) {
              console.log(
                "Konflik kreator, sudah diundang: ",
                conflictUsers.length
              );
              await waitForTimeout(2500);
              await clickByText(page, "OK");
              await waitForTimeout(2000);
            }

            if (isInvitationExist && conflictUsers.length > 0) {
              const paginationOption = await page.$(
                "div.arco-pagination-option:nth-child(3) > div:nth-child(1) > div:nth-child(1) > span:nth-child(1) > span:nth-child(2)"
              );
              if (paginationOption) {
                await paginationOption.click();
                await waitForTimeout(1000);

                const container = await page.$(".arco-select-popup");

                const optionSelector = 'li[role="option"]';
                const options = await container.$$(optionSelector);

                // Iterasi opsi dan klik opsi dengan teks "50/Page"
                let found = false;
                for (const option of options) {
                  const textContent = await option.evaluate((el) =>
                    el.textContent.trim()
                  );
                  if (textContent === "50/Page") {
                    await option.click();
                    found = true;
                    break;
                  }
                }

                if (!found) {
                  throw new Error(
                    'Ops "50/Page" tidak ditemukan dalam dropdown.'
                  );
                }
              }

              const containerTableCreator = await page.$(
                ".mt-16 > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > table:nth-child(1) > tbody:nth-child(3)"
              );

              const rows = await containerTableCreator.$$("tr");

              console.log("creator length", rows.length);

              for (const row of rows) {
                const nickname = await row.$("div.arco-typography");
                const nicknameText = await nickname.evaluate((el) =>
                  el.textContent.trim()
                );

                if (conflictUsers.includes(nicknameText)) {
                  console.log("Removing creator:", nicknameText);

                  const checkbox = await row.$("div.arco-checkbox-mask");
                  if (checkbox) {
                    await checkbox.click();
                  }
                }
              }

              const removeCreatorButton = await page.$(
                "button.arco-btn-secondary:nth-child(3)"
              );
              console.log("removeCreatorButton", removeCreatorButton);

              if (removeCreatorButton) {
                await removeCreatorButton.click();
                await waitForTimeout(1000);
              } else {
                throw new Error("Secondary button not found");
              }

              waitForTimeout(3000);

              // check creators left after remove conflicts
              const spanSelector =
                "div.my-16 > div:nth-child(1) > span:nth-child(1)";
              const spanElement = await page.$(spanSelector);

              let finalCreatorsLeft = 0;
              if (spanElement) {
                const spanText = await spanElement.evaluate((el) =>
                  el.textContent.trim()
                );
                const firstHalfText = spanText.split("/")[0];
                finalCreatorsLeft =
                  creatorsInCurrentIteration - Number(firstHalfText);
              } else {
                finalCreatorsLeft = creatorsInCurrentIteration;
              }

              console.log("tempCreatorsLeft after remove", finalCreatorsLeft);

              return finalCreatorsLeft;
            }
          } catch (error) {
            // IF modal conflict not found stop while submit button, targeted-collaboration is success
            console.log("error in submit final", error);
            console.log("conflict creator length :", conflictUsers.length);

            return;
          }
        } catch (error) {
          console.log("error submit button");
          console.log(error);
        }
      };
      tempCreatorsLeft = await handleSendInvitation(creatorsInCurrentIteration);

      console.log("tempCreatorsLeft after submit", tempCreatorsLeft);

      if (tempCreatorsLeft == 0) {
        break;
      }
      // else if (isLastRowDrawer) {
      //   conflictUsers = [];
      //   currentPage++;
      // }

      console.log("====================================");
      // targeted-collaboration is success
    } catch (error) {
      currentIndex += creatorsInCurrentIteration;
      console.log("error in main step-selec-creator :", error);
    }
  }

  console.log("success, conflict creator length :", conflictUsers.length);
  return {
    conflictUsers: conflictUsers,
    currentPage: currentPage,
  };
};

module.exports = stepSelectCreator;
