import { test as base } from "@playwright/test";
import { on, once } from "node:events";
import { spawn } from "node:child_process";

export type TestOptions = {
  appDir: string;
};

type TextContext = {
  baseURL: string;
  emberServe: {};
};

export const test = base.extend<TestOptions & TextContext>({
  appDir: ["", { option: true }],
  baseURL: async ({}, use, testInfo) => {
    await use(`http://localhost:${4200 + testInfo.workerIndex}`);
  },
  emberServe: [
    async ({ appDir, baseURL }, use) => {
      const { port } = new URL(baseURL);
      const child = spawn(
        "./node_modules/.bin/ember",
        ["serve", "--port", "" + port],
        {
          cwd: appDir,
          stdio: ["ignore", "pipe", "ignore"],
        }
      );

      try {
        child.stdout.setEncoding("utf8");

        for await (const [chunk] of on(child.stdout, "data")) {
          console.log(chunk);

          if (chunk.toString().indexOf("Serving") !== -1) {
            break;
          }
        }

        await use({});
      } finally {
        child.kill();
        await once(child, "exit");
      }
    },
    {
      auto: true,
    },
  ],
});
