import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4173",
    "--strictPort",
  ],
  { stdio: "pipe" },
);
let serverOutput = "";
server.stdout.on("data", (c) => (serverOutput += c));
server.stderr.on("data", (c) => (serverOutput += c));
process.on("exit", () => server.kill());
let ready = false;
for (let attempt = 0; attempt < 50; attempt++) {
  if (server.exitCode !== null)
    throw new Error("Preview server failed: " + serverOutput);
  try {
    ready = (await fetch("http://127.0.0.1:4173")).ok;
  } catch {}
  if (ready) break;
  await new Promise((resolve) => setTimeout(resolve, 100));
}
assert.ok(ready, "Production preview did not become ready");
await mkdir("test-results", { recursive: true });
const browser = await playwright.launch({
  executablePath: await chromium.executablePath(),
  args: chromium.args.filter((arg) => arg !== "--single-process"),
  headless: true,
  env: { ...process.env, XDG_CACHE_HOME: "/tmp/qpass-browser-cache" },
});
const errors = [];
const reports = [];
try {
  for (const width of [360, 390, 768, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of [
      "home",
      "tickets",
      "experiences",
      "restaurants",
      "hotel",
      "animals",
      "plan",
      "stadium",
      "experience/giraffe",
      "experience/stadium/bricks",
      "concerts",
      "balloons",
      "basket",
      "checkout",
      "pass",
    ]) {
      await page.goto("http://127.0.0.1:4173/#" + route);
      await page
        .locator("main")
        .waitFor({ timeout: 5000 })
        .catch((error) => {
          throw new Error(
            `Missing main at ${width}px ${route}: ${errors.join("; ")}: ${error.message}`,
          );
        });
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      assert.equal(
        overflow,
        false,
        `Horizontal overflow at ${width}px on ${route}`,
      );
      reports.push({ width, route, overflow });
    }
    if (width === 390) {
      await page.goto("http://127.0.0.1:4173/#tickets");
      await page
        .getByRole("button", { name: "Add to day", exact: true })
        .first()
        .click();
      await page.getByRole("button", { name: "Open booking drawer" }).click();
      await page.getByRole("dialog", { name: "Your booking drawer" }).waitFor();
      await page
        .getByRole("button", { name: "Add one Adult day pass" })
        .last()
        .click();
      await page.keyboard.press("Escape");
      assert.equal(await page.getByRole("dialog").count(), 0);
      await page
        .getByRole("button", { name: "View basket", exact: true })
        .last()
        .click();
      await page
        .getByRole("heading", { name: "A basket full of memories." })
        .waitFor();
      await page.getByRole("button", { name: "Continue to checkout" }).click();
      await page.getByLabel("Full name").fill("Sam Explorer");
      await page.getByLabel("Email address").fill("sam@example.com");
      await page.getByRole("checkbox").check();
      await page.getByRole("button", { name: "Complete demo booking" }).click();
      await page
        .getByRole("heading", { name: "Your day is all set." })
        .waitFor();
      assert.equal(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("qpass-booking")).total,
        ),
        300,
      );
      await page.reload();
      await page.getByText("Sam Explorer").waitFor();
      await page.screenshot({
        path: "test-results/pass-mobile.png",
        fullPage: true,
      });
      await page.getByRole("link", { name: "View souvenir ticket" }).click();
      await page
        .getByRole("heading", { name: "Some days stay with you." })
        .waitFor();
      await page.emulateMedia({ media: "print" });
      await page.pdf({
        path: "test-results/souvenir.pdf",
        format: "A4",
        printBackground: true,
      });
      await page.emulateMedia({ media: "screen" });
      await page.goto("http://127.0.0.1:4173/#animals");
      await page.getByRole("button", { name: "Forest", exact: true }).click();
      assert.equal(await page.locator(".animal-card").count(), 1);
      await page.getByRole("button", { name: /Forest Tiger/ }).click();
      await page.getByRole("dialog", { name: "Tiger" }).waitFor();
      await page.keyboard.press("Escape");
      await page.goto("http://127.0.0.1:4173/#experience/giraffe");
      await page
        .getByRole("button", {
          name: "Save Meet the gentle giants",
          exact: true,
        })
        .click();
      await page.goto("http://127.0.0.1:4173/#home");
      await page
        .getByRole("heading", { name: "Your someday collection." })
        .waitFor();
      await page
        .getByRole("heading", { name: "Still on your mind?" })
        .waitFor();
      await page.getByRole("button", { name: "A moment of nature" }).click();
      await page.locator("video").waitFor();
      await page.waitForFunction(
        () => {
          const video = document.querySelector("video");
          return video && video.readyState >= 2 && !video.error;
        },
        { timeout: 10000 },
      );
      await page.keyboard.press("Escape");
      await page.goto("http://127.0.0.1:4173/#plan");
      await page.getByRole("button", { name: /For the whole crew/ }).click();
      await page.getByRole("button", { name: "Build my day" }).click();
      await page
        .getByRole("button", { name: "Remove The garden picnic from plan" })
        .click();
      await page.getByRole("button", { name: "Make this my day" }).click();
      await page
        .getByRole("heading", { name: "A basket full of memories." })
        .waitFor();
      assert.deepEqual(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("qpass-cart")),
        ),
        { adult: 1, giraffe: 1 },
      );
      await page.goto("http://127.0.0.1:4173/#home");
      await page.screenshot({
        path: "test-results/home-mobile.png",
        fullPage: true,
      });
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        responsiveRoutes: reports.length,
        widths: [360, 390, 768, 1440],
        runtimeErrors: errors,
        verified: [
          "booking drawer",
          "quantity controls",
          "checkout",
          "booking reload",
          "QR pass",
          "souvenir PDF",
          "animal filtering & modal",
          "favourites",
          "recently viewed",
          "nature film",
          "day planner",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
  server.kill();
}
