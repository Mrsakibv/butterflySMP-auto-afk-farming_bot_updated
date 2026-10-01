const { chromium } = require("playwright");

const WEBSITE = "https://dash.drexhost.in/afk";

const PROFILE = "./browser-profile";

(async () => {
  const context = await chromium.launchPersistentContext(PROFILE, {
    headless: false,
    viewport: {
      width: 1280,
      height: 900
    }
  });

  const pages = context.pages();
  const page = pages.length ? pages[0] : await context.newPage();

  await page.goto(WEBSITE, {
    waitUntil: "domcontentloaded"
  });

  console.log("");
  console.log("========================================");
  console.log("INSPECT MODE");
  console.log("========================================");
  console.log("");
  console.log("1. Login করা থাকলে সরাসরি AFK Rewards page-এ যাও");
  console.log("2. Start AFK চাপো");
  console.log("3. Tic-Tac-Toe board যেন screen-এ দেখা যায়");
  console.log("4. তারপর VS Code terminal-এ ENTER চাপো");
  console.log("");

  await new Promise(resolve => {
    process.stdin.once("data", resolve);
  });

  console.log("");
  console.log("Scanning page...");
  console.log("");

  // ------------------------------------------
  // ALL BUTTONS
  // ------------------------------------------

  const buttons = await page.locator("button").evaluateAll(buttons => {
    return buttons.map((button, index) => ({
      index,

      text: button.innerText,

      ariaLabel: button.getAttribute("aria-label"),

      className:
        typeof button.className === "string"
          ? button.className
          : "",

      id: button.id,

      type: button.getAttribute("type"),

      disabled: button.disabled,

      dataAttributes: Array.from(button.attributes)
        .filter(attr => attr.name.startsWith("data-"))
        .reduce((obj, attr) => {
          obj[attr.name] = attr.value;
          return obj;
        }, {})
    }));
  });

  console.log("========================================");
  console.log("ALL BUTTONS");
  console.log("========================================");

  console.dir(buttons, {
    depth: null
  });

  // ------------------------------------------
  // ELEMENTS INSIDE TIC-TAC-TOE AREA
  // ------------------------------------------

  const textMatches = await page.locator("body").evaluate(() => {

    const elements = Array.from(
      document.querySelectorAll("*")
    );

    return elements
      .filter(el => {

        const text =
          (el.textContent || "")
            .trim()
            .toLowerCase();

        return (
          text === "tic-tac-toe" ||
          text.includes("your turn") ||
          text.includes("hard")
        );
      })
      .slice(0, 20)
      .map(el => ({
        tag: el.tagName,
        id: el.id,
        className:
          typeof el.className === "string"
            ? el.className
            : "",
        text:
          (el.textContent || "")
            .trim()
            .slice(0, 300)
      }));

  });

  console.log("");
  console.log("========================================");
  console.log("TIC-TAC-TOE RELATED ELEMENTS");
  console.log("========================================");

  console.dir(textMatches, {
    depth: null
  });

  // ------------------------------------------
  // SCREENSHOT
  // ------------------------------------------

  await page.screenshot({
    path: "inspect.png",
    fullPage: true
  });

  console.log("");
  console.log("========================================");
  console.log("DONE");
  console.log("========================================");
  console.log("");
  console.log("Screenshot saved:");
  console.log("inspect.png");
  console.log("");

})();