import assert from "node:assert/strict";
import { mkdtemp, realpath, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, extname } from "node:path";
import { pathToFileURL } from "node:url";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { chromium } from "playwright";
import { certifiedBuild } from "./build.mjs";
const root = await realpath(
  await mkdtemp(join(tmpdir(), "rsvelte-certified-hydration-")),
);
await symlink(
  new URL("./node_modules", import.meta.url).pathname,
  join(root, "node_modules"),
);
console.log(JSON.stringify({ artifacts: root }));
const cases = [
  { name: "primary", variant: "primary", inputs: [{}] },
  { name: "danger", variant: "danger", inputs: [{}] },
  {
    name: "runtime",
    variant: null,
    inputs: [{ variant: "primary" }, { variant: "danger" }],
  },
];
const http = createServer(async (req, res) => {
  try {
    const p = new URL(req.url, "http://localhost").pathname;
    assert(!p.includes(".."));
    res.setHeader(
      "Content-Type",
      extname(p) === ".html"
        ? "text/html"
        : extname(p) === ".css"
          ? "text/css"
          : "text/javascript",
    );
    res.end(await readFile(join(root, p)));
  } catch {
    res.statusCode = 404;
    res.end();
  }
});
await new Promise((r) => http.listen(0, "127.0.0.1", r));
const address = `http://127.0.0.1:${http.address().port}`;
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ??
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const rows = [];
await writeFile(
  join(root, "ssr-runner.mjs"),
  'import{pathToFileURL}from"node:url";const module=await import(pathToFileURL(process.argv[2]));console.log(JSON.stringify(JSON.parse(process.argv[3]).map(props=>module.run(props))));',
);
try {
  for (const f of cases) {
    const dir = join(root, "hydration-cases", f.name);
    await mkdir(dir, { recursive: true });
    await writeFile(
      join(dir, "Button.svelte"),
      '<script>let {variant}=$props();</script>{#if variant==="danger"}<p class="danger">Danger</p>{:else}<p class="primary">Primary</p>{/if}<style>.danger{color:red}.primary{color:blue}</style>',
    );
    await writeFile(
      join(dir, "App.svelte"),
      `<script>import Button from './Button.svelte';${f.variant === null ? "let {variant}=$props();" : ""}</script><Button ${f.variant === null ? "{variant}" : `variant="${f.variant}"`}/>`,
    );
    await writeFile(
      join(dir, "server.js"),
      'import {render} from "svelte/server";import App from "./App.svelte";export function run(props){return render(App,{props}).body;}',
    );
    await writeFile(
      join(dir, "client.js"),
      'import {hydrate,unmount,flushSync} from "svelte";import App from "./App.svelte";window.run=async(body,props)=>{const target=document.getElementById("app");target.innerHTML=body;const app=hydrate(App,{target,props,recover:false});flushSync();const result={html:target.innerHTML,color:getComputedStyle(target.querySelector("p")).color};await unmount(app);return result;};',
    );
    await writeFile(
      join(dir, "index.html"),
      '<html><body><div id="app"></div><script type="module" src="./client.js"></script></body></html>',
    );
    const arms = [];
    for (const enabled of [false, true]) {
      const targets = {};
      for (const target of ["server", "client"]) {
        const button = join(dir, "Button.svelte");
        const certified = await certifiedBuild({
          targets: [button],
          enabled,
          config: {
            root: dir,
            base: "./",
            configFile: false,
            publicDir: false,
            logLevel: "error",
            build: {
              write: false,
              minify: "oxc",
              ssr: target === "server" ? join(dir, "server.js") : false,
              rolldownOptions: {
                output: {
                  comments: true,
                  entryFileNames:
                    target === "server" ? "server.mjs" : "[name]-[hash].js",
                },
              },
            },
          },
        });
        const result = certified.output,
          decision = certified.decisions[button],
          removed = certified.removed;
        const outputs = Array.isArray(result)
          ? result.flatMap((r) => r.output)
          : result.output;
        const out = join(dir, enabled ? "optimized" : "baseline", target);
        await mkdir(out, { recursive: true });
        for (const o of outputs) {
          await mkdir(dirname(join(out, o.fileName)), { recursive: true });
          await writeFile(
            join(out, o.fileName),
            o.type === "chunk" ? o.code : o.source,
          );
        }
        targets[target] = { out, decision, removed };
      }
      const bodies = JSON.parse(
        execFileSync(
          process.execPath,
          [
            join(root, "ssr-runner.mjs"),
            join(targets.server.out, "server.mjs"),
            JSON.stringify(f.inputs),
          ],
          { encoding: "utf8", timeout: 60000 },
        ),
      );
      const page = await browser.newPage(),
        errors = [],
        warnings = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "warning") warnings.push(m.text());
      });
      await page.goto(
        address + targets.client.out.slice(root.length) + "/index.html",
      );
      await page.waitForFunction(() => typeof window.run === "function");
      const hydrated = [];
      for (let i = 0; i < f.inputs.length; i++)
        hydrated.push(
          await page.evaluate(({ body, props }) => window.run(body, props), {
            body: bodies[i],
            props: f.inputs[i],
          }),
        );
      await page.close();
      assert.deepEqual(errors, []);
      assert.deepEqual(warnings, []);
      arms.push({ targets, bodies, hydrated, errors, warnings });
    }
    assert.deepEqual(arms[0].bodies, arms[1].bodies);
    assert.deepEqual(arms[0].hydrated, arms[1].hydrated);
    rows.push({ case: f.name, baseline: arms[0], optimized: arms[1] });
    await writeFile(
      join(root, "hydration-results.json"),
      JSON.stringify(rows, null, 2),
    );
    assert.equal(arms[1].targets.client.removed > 0, f.name === "primary");
    assert.equal(arms[1].targets.server.removed > 0, f.name === "primary");
    console.log(
      JSON.stringify({
        case: f.name,
        status: "SSR and hydration equal",
        removed: [
          arms[1].targets.server.removed,
          arms[1].targets.client.removed,
        ],
      }),
    );
  }
} finally {
  await browser.close();
  await new Promise((r) => http.close(r));
}
