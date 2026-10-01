const { chromium } = require("playwright");

// ============================================================
// CONFIG
// ============================================================

// তোমার AFK Rewards page URL এখানে বসাও
const WEBSITE = "https://dash.drexhost.in/afk";

// আলাদা browser profile.
// প্রথমবার এখানে Discord login হবে এবং পরেরবার session থাকবে।
const PROFILE = "./browser-profile";


// ============================================================
// START BOT
// ============================================================

(async () => {

  console.log("");
  console.log("============================================");
  console.log("       AFK REWARDS TEST BOT");
  console.log("============================================");
  console.log("");

  // ----------------------------------------------------------
  // OPEN CHROMIUM
  // ----------------------------------------------------------

  const context = await chromium.launchPersistentContext(
    PROFILE,
    {
      headless: false,

      viewport: {
        width: 1280,
        height: 900
      }
    }
  );

  let pages = context.pages();

  const page =
    pages.length > 0
      ? pages[0]
      : await context.newPage();


  // ----------------------------------------------------------
  // OPEN WEBSITE
  // ----------------------------------------------------------

  console.log("Opening AFK Rewards page...");

  await page.goto(WEBSITE, {
    waitUntil: "domcontentloaded"
  });

  console.log("Website opened.");
  console.log("");


  // ----------------------------------------------------------
  // LOGIN
  // ----------------------------------------------------------

  console.log("============================================");
  console.log("LOGIN");
  console.log("============================================");
  console.log("");
  console.log("Browser-এ Discord দিয়ে login করো।");
  console.log("Login complete হলে VS Code terminal-এ ENTER চাপো.");
  console.log("");

  await new Promise(resolve => {
    process.stdin.once("data", resolve);
  });


  // ----------------------------------------------------------
  // START AFK
  // ----------------------------------------------------------

  console.log("");
  console.log("Looking for AFK button...");

  // তোমার site-এ running অবস্থায় "Stop AFK" দেখা যায়।
  // তাই প্রথমে Start AFK খুঁজছি।

  const startAFK = page.getByRole("button", {
    name: "Start AFK",
    exact: true
  });

  if (await startAFK.count() > 0) {

    if (await startAFK.first().isVisible()) {

      console.log("Start AFK found.");

      await startAFK.first().click();

      console.log("AFK started.");

    }

  } else {

    // যদি আগে থেকেই AFK running থাকে
    const stopAFK = page.getByRole("button", {
      name: "Stop AFK",
      exact: true
    });

    if (await stopAFK.count() > 0) {

      console.log(
        "AFK is already running."
      );

    } else {

      console.log(
        "Start AFK button পাওয়া যায়নি."
      );

      await page.screenshot({
        path: "afk-error.png",
        fullPage: true
      });

      await context.close();

      return;
    }
  }


  console.log("");
  console.log("============================================");
  console.log("AFK SESSION ACTIVE");
  console.log("============================================");
  console.log("");


  // ----------------------------------------------------------
  // GAME LOOP
  // ----------------------------------------------------------

  let round = 0;

  while (true) {

    round++;

    console.log("--------------------------------------------");
    console.log(`ROUND ${round}`);
    console.log("--------------------------------------------");

    try {

      // ------------------------------------------------------
      // CHECK YOUR TURN
      // ------------------------------------------------------

      const yourTurn = page.getByText(
        "Your turn (X)",
        {
          exact: true
        }
      );

      if (!(await yourTurn.isVisible())) {

        console.log(
          "Waiting for Your turn (X)..."
        );

        await page.waitForTimeout(700);

        continue;
      }


      console.log(
        "Your turn detected."
      );


      // ------------------------------------------------------
      // FIND ALL 9 CELLS
      // ------------------------------------------------------

      const cells = page.locator(
        'button[aria-label^="Cell "]'
      );

      const count = await cells.count();

      console.log(
        `Found ${count} Tic-Tac-Toe cells.`
      );


      if (count !== 9) {

        console.log(
          "Expected 9 cells."
        );

        await page.waitForTimeout(1000);

        continue;
      }


      // ------------------------------------------------------
      // FIND ENABLED CELL
      // ------------------------------------------------------

      let clicked = false;

      for (let i = 1; i <= 9; i++) {

        const cell = page.getByRole("button", {
          name: `Cell ${i}`,
          exact: true
        });

        const visible =
          await cell.isVisible();

        const enabled =
          await cell.isEnabled();

        if (!visible || !enabled) {
          continue;
        }


        console.log(
          `Clicking Cell ${i}...`
        );

        await cell.click();

        console.log(
          `Cell ${i} clicked.`
        );

        clicked = true;

        break;
      }


      // ------------------------------------------------------
      // NO CELL AVAILABLE
      // ------------------------------------------------------

      if (!clicked) {

        console.log(
          "No enabled cell available."
        );

        await page.waitForTimeout(1000);

        continue;
      }


      // ------------------------------------------------------
      // WAIT FOR BOT
      // ------------------------------------------------------

      console.log(
        "Waiting for bot move..."
      );

      await page.waitForTimeout(1200);


      // ------------------------------------------------------
      // CHECK IF RESTART IS AVAILABLE
      // ------------------------------------------------------

      const restart = page.getByRole("button", {
        name: "Restart",
        exact: true
      });


      if (
        await restart.count() > 0 &&
        await restart.first().isVisible()
      ) {

        console.log(
          "Restart button found."
        );

        await restart.first().click();

        console.log(
          "Game restarted."
        );

      } else {

        console.log(
          "Restart not available yet."
        );
      }


      // ------------------------------------------------------
      // WAIT BEFORE NEXT ROUND
      // ------------------------------------------------------

      await page.waitForTimeout(1000);

    } catch (error) {

      console.log("");
      console.log("ROUND ERROR");
      console.log("--------------------------------------------");
      console.log(error.message);
      console.log("--------------------------------------------");
      console.log("");

      await page.waitForTimeout(2000);
    }
  }

})();