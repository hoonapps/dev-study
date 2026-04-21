import { chromium } from "playwright";

const BASE = "https://hoonapps.github.io/dev-study/";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const errors = [];
  const responses = [];
  page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text()}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 400) responses.push(`${r.status()} ${r.url()}`);
  });

  console.log(`\n=== Testing HOME: ${BASE} ===`);
  const homeResp = await page.goto(BASE, { waitUntil: "networkidle" });
  console.log(`HOME status: ${homeResp.status()}`);
  console.log(`URL after load: ${page.url()}`);

  // Get all tab links
  const links = await page.$$eval("nav a", (as) =>
    as.map((a) => ({ href: a.href, text: a.textContent.trim() }))
  );
  console.log(`\nNavigation links found:`);
  links.forEach((l) => console.log(`  ${l.text}: ${l.href}`));

  // Try clicking Cards tab
  console.log(`\n=== Clicking Cards tab ===`);
  const cardsLink = links.find((l) => l.text.includes("Cards"));
  if (cardsLink) {
    const resp = await page.goto(cardsLink.href, { waitUntil: "networkidle" });
    console.log(`Cards status: ${resp.status()}`);
    console.log(`URL: ${page.url()}`);
    const title = await page.title();
    console.log(`Title: ${title}`);
    const body = await page.$eval("body", (b) => b.textContent.slice(0, 200));
    console.log(`Body preview: ${body}`);
  }

  console.log(`\n=== Errors ===`);
  if (errors.length === 0) console.log("No errors");
  else errors.forEach((e) => console.log(e));

  console.log(`\n=== 4xx/5xx responses ===`);
  if (responses.length === 0) console.log("All OK");
  else responses.forEach((r) => console.log(r));

  await browser.close();
})();
