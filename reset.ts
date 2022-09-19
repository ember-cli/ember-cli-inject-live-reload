import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

export default function reset() {
  const testApps = resolve(__dirname, "test_apps");
  execFileSync("git", ["checkout", "-f", testApps]);
  execFileSync("git", ["clean", "-f", testApps]);
}
