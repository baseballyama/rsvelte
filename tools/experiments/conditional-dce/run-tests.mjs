import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { report, hashSources } from "./report.mjs";

async function run(file) {
  const child = spawn(
    process.execPath,
    [new URL(file, import.meta.url).pathname],
    { stdio: ["ignore", "pipe", "inherit"] },
  );
  let output = "";
  child.stdout.on("data", (data) => {
    output += data.toString();
    process.stdout.write(data);
  });
  await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${file} exited with ${code}`)),
    );
  });
  const records = output
    .split("\n")
    .filter((line) => line.startsWith("{"))
    .map((line) => JSON.parse(line));
  const artifact = records.find((record) => record.artifacts)?.artifacts;
  if (!artifact) throw new Error(`Missing artifact path: ${file}`);
  return artifact;
}
const initialSources = await hashSources();
const browser = await run("test.mjs");
const hydration = await run("hydration.test.mjs");
const guards = await run("guards.test.mjs");
assert.deepEqual(
  await hashSources(),
  initialSources,
  "Prototype sources changed during the run.",
);
await report(
  browser,
  hydration,
  guards,
  new URL("./results", import.meta.url).pathname,
);
