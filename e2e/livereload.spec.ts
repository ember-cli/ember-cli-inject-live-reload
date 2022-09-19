import { expect } from "@playwright/test";
import type { ElementHandle, Page } from "@playwright/test";
import * as fs from "node:fs/promises";
import { resolve, relative } from "node:path";
import { test } from "./test";

test("test live reload updates page after mutation", async ({
  appDir,
  page,
}) => {
  await page.goto("/");
  await waitForSelector(page, "#ember-welcome-page-id-selector", async (el) => {
    expect(await el.textContent()).toContain("welcome");
  });
  const appTemplate = resolve(appDir, "app/templates/application.hbs");
  await waitForLastModified(appTemplate);
  void (await Promise.all([
    page.waitForNavigation({
      waitUntil: "load",
    }),
    test.step(`modify ${appTemplate}`, () =>
      fs.writeFile(appTemplate, `<div id="hello">hello world</div>`)),
  ]));
  await waitForSelector(page, "#hello", async (el) => {
    expect(await el.textContent()).toContain("hello world");
  });
  await waitForLastModified(appTemplate);
  void (await Promise.all([
    page.waitForNavigation(),
    test.step(`modify ${appTemplate}`, () =>
      fs.writeFile(appTemplate, `<WelcomePage />\n`)),
  ]));
  await waitForSelector(page, "#ember-welcome-page-id-selector", async (el) => {
    expect(await el.textContent()).toContain("welcome");
  });
});

/**
 * Ensure we are a second away from the last modified timestamp
 */
function waitForLastModified(filename: string) {
  return test.step(`wait for last modified ${relative(
    ".",
    filename
  )}`, async () => {
    const stat = await fs.stat(filename);
    const lastModified = Math.floor(stat.mtime.getTime() / 1000) * 1000;
    const delta = Date.now() - lastModified;
    if (delta > 1000) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000 - delta));
  });
}

async function waitForSelector<T>(
  page: Page,
  selector: string,
  callback: (el: ElementHandle<HTMLElement | SVGElement>) => PromiseLike<T> | T
) {
  const el = await page.waitForSelector(selector);
  try {
    return await callback(el);
  } finally {
    await el.dispose();
  }
}
