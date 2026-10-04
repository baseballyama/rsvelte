import { compile, parse } from "svelte/compiler";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { mkdtemp, symlink, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { dirname, join, extname } from "node:path";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { chromium } from "playwright";
import { build } from "vite";
import { javascript, nodes as walk } from "./ast.mjs";
import { cases } from "./cases.mjs";
import MagicString from "magic-string";
import { certifiedBuild } from "./build.mjs";
const require = createRequire(import.meta.url);
const { TraceMap, originalPositionFor } = require("@jridgewell/trace-mapping");
const root = await realpath(
  await mkdtemp(join(tmpdir(), "rsvelte-certified-dce-")),
);
await symlink(
  new URL("./node_modules", import.meta.url).pathname,
  join(root, "node_modules"),
);
console.log(JSON.stringify({ artifacts: root }));

function nodes(value) {
  return walk(value).map(({ node }) => node);
}
function ast(code, id) {
  return { program: javascript(code, id) };
}
function modifyCall(code, id, mode) {
  const parsed = ast(code, id);
  const edit = new MagicString(code);
  let count = 0;
  for (const node of nodes(parsed.program)) {
    if (
      node.type !== "CallExpression" ||
      node.callee.type !== "Identifier" ||
      node.arguments.length !== 2
    )
      continue;
    const props = node.arguments[1];
    if (props.type !== "ObjectExpression") continue;
    const v = props.properties.find(
      (p) =>
        p.type === "Property" &&
        p.key.name === "variant" &&
        p.value.type === "Literal" &&
        p.value.value === "primary",
    );
    if (!v) continue;
    if (mode === "duplicate")
      edit.appendLeft(props.end - 1, ', variant:"danger"');
    else edit.overwrite(v.value.start, v.value.end, '"danger"');
    count++;
  }
  assert(count > 0);
  return {
    code: edit.toString(),
    map: edit.generateMap({ hires: true, source: id, includeContent: true }),
  };
}
async function prepare(f) {
  const dir = join(root, "cases", f.name);
  await mkdir(dir, { recursive: true });
  const button = `<script>let { variant } = $props();${f.localWrite ? 'variant = "danger";' : ""}${f.sideEffect ? "let counter = 0;" : ""}</script>\n{#if ${f.sideEffect ? "(counter += 1, variant)" : "variant"} === 'danger'}<span class="danger">${f.multiline ? "危険\nDanger\n" : "Danger"}</span>{:else}<span class="primary">Primary${f.sideEffect ? " {counter}" : ""}${f.templateEffect ? '{eval("globalThis.templateProbe=(globalThis.templateProbe??0)+1")}' : ""}</span>{/if}${f.sharedClass ? '<p class="danger">Always</p>' : ""}\n<style>.danger{color:red;animation:dangerPulse 1s;${f.asset ? "background-image:url(./danger.svg);" : ""}}.primary{color:blue;${f.animationVariable ? "animation:var(--shared-animation) 30s infinite;" : ""}}.danger,.primary{font-weight:bold}@keyframes dangerPulse{from{opacity:.1}to{opacity:1}}</style>`;
  await writeFile(join(dir, "Button.svelte"), button);
  if (f.asset)
    await writeFile(
      join(dir, "danger.svg"),
      '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="red"/></svg>',
    );
  let animationName;
  if (f.animationVariable) {
    const css = compile(button, {
      filename: join(dir, "Button.svelte"),
      dev: false,
    }).css.code;
    const parsed = parse(`<style>${css}</style>`, { modern: true });
    const frame = parsed.css.children.find(
      (node) => node.type === "Atrule" && node.name === "keyframes",
    );
    assert(frame);
    assert.equal(typeof frame.prelude, "string");
    animationName = f.fixedScope ? "svelte-audit-dangerPulse" : frame.prelude;
  }
  await writeFile(
    join(dir, "Aux.svelte"),
    f.twoComponents
      ? '<script>let {kind}=$props();</script>{#if kind==="danger"}<p>Other Danger</p>{:else}<p>Other Primary</p>{/if}'
      : `<p class="${f.sharedScope ? "danger aux" : "aux"}">Aux</p><style>.aux{${f.sharedScope ? "font-weight:bold" : "color:green"}}${f.animationVariable ? ` :global(:root){--shared-animation:${animationName}}` : ""}</style>`,
  );
  await writeFile(
    join(dir, "barrel.js"),
    'export { default as Button } from "./Button.svelte";',
  );
  await writeFile(join(dir, "shared.js"), 'export const label="shared";');
  await writeFile(
    join(dir, "Lazy.svelte"),
    `<script>import Button from './Button.svelte';${f.shared ? 'import {label} from "./shared.js";' : ""}${f.newCss ? 'import Aux from "./Aux.svelte";' : ""}</script><Button variant="${f.lazy ?? "primary"}"/>${f.shared ? "{label}" : ""}${f.newCss ? "<Aux/>" : ""}`,
  );
  const imports = f.imports ?? "import Button from './Button.svelte';";
  const extra =
    (f.aux ? 'import Aux from "./Aux.svelte";' : "") +
    (f.virtual ? 'import VirtualCaller from "virtual:caller";' : "") +
    (f.shared ? 'import {label} from "./shared.js";' : "");
  await writeFile(
    join(dir, "App.svelte"),
    `<script>${imports}${extra}${f.script ?? ""}</script>${f.markup ?? '<Button variant="primary"/>'}${f.aux ? "<Aux/>" : ""}${f.virtual ? "<VirtualCaller/>" : ""}${f.shared ? "{label}" : ""}`,
  );
  await writeFile(
    join(dir, "client.js"),
    `import {mount,unmount,flushSync} from 'svelte';import App from './App.svelte';window.run=async(props={})=>{const target=document.getElementById('app');let Component=App;${f.lazy || f.shared ? 'const lazy=await import("./Lazy.svelte"); Component=lazy.default;' : ""}const app=mount(Component,{target,props});flushSync();const result={html:target.innerHTML,colors:[...target.querySelectorAll('span,p')].map(n=>getComputedStyle(n).color),probe:globalThis.annotationProbeReader?.()??globalThis.annotationProbe??0,animations:[...target.querySelectorAll("span,p")].map(n=>n.getAnimations().length)};await unmount(app);return result;};${f.publicEntry ? 'window.mountExternal=async(path)=>{const {default:Button}=await import(path);const target=document.getElementById("app");const app=mount(Button,{target,props:{variant:"danger"}});flushSync();const result={html:target.innerHTML,color:getComputedStyle(target.querySelector("span")).color};await unmount(app);return result;};' : ""}`,
  );
  await writeFile(
    join(dir, "index.html"),
    '<html><body><div id="app"></div><script type="module" src="./client.js"></script></body></html>',
  );
  return dir;
}
async function bundle(f, dir, enabled) {
  const button = join(dir, "Button.svelte"),
    app = join(dir, "App.svelte");
  const downstream = {
    name: "adversarial-transform",
    enforce: "post",
    transform(code, id) {
      if (f.duplicate && id === app) return modifyCall(code, id, "duplicate");
      if (f.componentTransform && id === button) {
        const edit = new MagicString(code);
        let count = 0;
        for (const n of nodes(ast(code, id).program)) {
          if (
            n.type === "MemberExpression" &&
            n.property.type === "Identifier" &&
            n.property.name === "variant"
          ) {
            edit.overwrite(n.property.start, n.property.end, "other");
            count++;
          }
        }
        assert(count > 0);
        return {
          code: edit.toString(),
          map: edit.generateMap({
            hires: true,
            source: id,
            includeContent: true,
          }),
        };
      }
      if (f.drift && id === button) {
        const p = ast(code, id),
          edit = new MagicString(code);
        const decl = p.program.body.find(
          (n) => n.type === "VariableDeclaration",
        );
        assert(decl);
        edit.appendLeft(
          decl.start,
          "const annotationSideEffect=(globalThis.annotationProbe=(globalThis.annotationProbe??0)+1);globalThis.annotationProbeReader=()=>annotationSideEffect;\n",
        );
        return {
          code: edit.toString(),
          map: edit.generateMap({
            hires: true,
            source: id,
            includeContent: true,
          }),
        };
      }
      return null;
    },
  };
  if (f.late)
    downstream.renderChunk = (code, chunk) => {
      try {
        return modifyCall(code, chunk.fileName, "replace");
      } catch (e) {
        if (e.code === "ERR_ASSERTION") return null;
        throw e;
      }
    };
  const virtual = {
    name: "virtual-caller",
    resolveId(id) {
      if (id === "virtual:caller") return "\0virtual:caller";
    },
    load(id) {
      if (id === "\0virtual:caller")
        return `import Button from ${JSON.stringify(button)};export default function(anchor){return Button(anchor,{variant:"danger"});}`;
    },
  };
  const cssPlugin = {
    name: "css-semantic-plugin",
    enforce: "pre",
    transform(code, id) {
      if (!f.cssTransform || !id.includes("type=style")) return null;
      const edit = new MagicString(code);
      edit.append("\n.primary{color:green!important}");
      return {
        code: edit.toString(),
        map: edit.generateMap({
          hires: true,
          source: id,
          includeContent: true,
        }),
      };
    },
  };
  const config = {
    root: dir,
    base: "./",
    configFile: false,
    publicDir: false,
    logLevel: "error",
    build: {
      write: false,
      assetsInlineLimit: 0,
      cssCodeSplit: f.cssSplit ?? true,
      minify: "oxc",
      cssMinify: true,
      sourcemap: true,
      manifest: true,
      rolldownOptions: {
        input: f.publicEntry
          ? { page: join(dir, "index.html"), button }
          : join(dir, "index.html"),
        preserveEntrySignatures: "strict",
        output: { comments: true, entryFileNames: "[name]-[hash].js" },
      },
    },
  };
  const result = await certifiedBuild({
    config,
    plugins: [virtual, downstream, cssPlugin],
    targets: [button],
    enabled,
    compiler: {
      compilerOptions:
        f.fixedScope || f.sharedScope
          ? { cssHash: () => "svelte-audit" }
          : undefined,
      preprocess: f.preprocess
        ? {
            markup: ({ content, filename }) => {
              const edit = new MagicString(content);
              if (filename === app) edit.append('<Button variant="danger"/>');
              return {
                code: edit.toString(),
                map: edit.generateMap({
                  hires: true,
                  source: filename,
                  includeContent: true,
                }),
              };
            },
          }
        : undefined,
    },
  });
  const outputs = Array.isArray(result.output)
    ? result.output.flatMap((r) => r.output)
    : result.output.output;
  const out = join(dir, enabled ? "optimized" : "baseline");
  await mkdir(out, { recursive: true });
  for (const o of outputs) {
    await mkdir(dirname(join(out, o.fileName)), { recursive: true });
    await writeFile(
      join(out, o.fileName),
      o.type === "chunk" ? o.code : o.source,
    );
  }
  const manifest = JSON.parse(
    String(outputs.find((o) => o.fileName === ".vite/manifest.json").source),
  );
  for (const item of result.cssArtifacts) {
    const source = await readFile(item.id, "utf8");
    const selector = item.id.endsWith("/Button.svelte") ? ".primary" : ".aux";
    const index = item.code.indexOf(selector);
    if (index < 0) continue;
    const before = item.code.slice(0, index).split("\n");
    const position = originalPositionFor(new TraceMap(item.map), {
      line: before.length,
      column: before.at(-1).length,
    });
    const expected = source.slice(0, source.indexOf(selector)).split("\n");
    assert(
      position.source?.endsWith(item.id.split("/").at(-1)),
      JSON.stringify(position),
    );
    assert.equal(position.line, expected.length);
    assert.equal(position.column, expected.at(-1).length);
  }
  const names = new Set(outputs.map((o) => o.fileName));
  for (const chunk of outputs.filter((o) => o.type === "chunk")) {
    for (const file of chunk.viteMetadata?.importedCss ?? [])
      assert(names.has(file), file);
  }
  for (const entry of Object.values(manifest)) {
    assert(names.has(entry.file), entry.file);
    for (const file of entry.css ?? []) assert(names.has(file), file);
  }
  const external = f.publicEntry ? manifest["Button.svelte"].file : null;
  const css = outputs.filter(
    (o) => o.type === "asset" && o.fileName.endsWith(".css"),
  );
  return {
    out,
    decision: result.decisions[button],
    removed: result.removed,
    builds: result.builds,
    external,
    files: outputs.map((o) => o.fileName),
    jsBytes: outputs
      .filter((o) => o.type === "chunk")
      .reduce((n, o) => n + Buffer.byteLength(o.code), 0),
    css: css.map((o) => ({
      name: o.fileName,
      bytes: Buffer.byteLength(o.source),
      code: String(o.source),
    })),
  };
}
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const path = decodeURIComponent(url.pathname);
    assert(!path.includes(".."));
    const file = join(root, path === "/" ? "empty" : path);
    const data = await readFile(file);
    res.setHeader(
      "Content-Type",
      extname(file) === ".html"
        ? "text/html"
        : extname(file) === ".css"
          ? "text/css"
          : extname(file) === ".js"
            ? "text/javascript"
            : "application/octet-stream",
    );
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end("missing");
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const address = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  executablePath:
    process.env.CHROME_PATH ??
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
await writeFile(
  join(root, "browser-meta.json"),
  JSON.stringify({ version: browser.version() }),
);
const rows = [];
try {
  for (const f of cases.filter(
    (f) =>
      !process.env.AUDIT_CASES ||
      process.env.AUDIT_CASES.split(",").includes(f.name),
  )) {
    const dir = await prepare(f);
    const results = [];
    for (const enabled of [false, true]) {
      try {
        const b = await bundle(f, dir, enabled);
        if (process.env.DCE_TRACE)
          console.log(
            JSON.stringify({
              phase: "built",
              case: f.name,
              enabled,
              decision: b.decision,
            }),
          );
        const page = await browser.newPage();
        const errors = [],
          requests = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("response", (r) => {
          if (r.status() >= 400)
            requests.push({ url: r.url(), status: r.status() });
        });
        const relative = b.out.slice(root.length);
        await page.goto(address + relative + "/index.html");
        await page.waitForFunction(
          () => typeof window.run === "function",
          undefined,
          { timeout: 10000 },
        );
        const runtime = [];
        for (const input of f.inputs ?? [{}])
          runtime.push(await page.evaluate((p) => window.run(p), input));
        if (f.publicEntry)
          runtime.push(
            await page.evaluate(
              (path) => window.mountExternal(path),
              address + relative + "/" + b.external,
            ),
          );
        await page.close();
        results.push({ ...b, runtime, errors, failedRequests: requests });
      } catch (e) {
        results.push({ error: e.stack });
      }
    }
    let status;
    if (!results[0].error && results[1].error) status = "counterexample";
    else if (results.some((r) => r.error)) status = "build-or-runtime-error";
    else if (
      JSON.stringify(results[0].runtime) !== JSON.stringify(results[1].runtime)
    )
      status = "counterexample";
    else status = results[1].removed ? "removed-and-equal" : "kept-and-equal";
    assert(
      !results[0].error,
      `${f.name}: baseline must work: ${results[0].error}`,
    );
    const expectedStatus =
      f.expected === "counterexample"
        ? "counterexample"
        : f.expected === "remove"
          ? "removed-and-equal"
          : "kept-and-equal";
    assert.equal(
      status,
      expectedStatus,
      JSON.stringify({ case: f.name, results }),
    );
    for (const result of results.filter((r) => !r.error)) {
      assert.deepEqual(result.failedRequests, [], f.name);
      assert.deepEqual(result.errors, [], f.name);
    }
    if (f.name === "primary") {
      assert(results[1].jsBytes < results[0].jsBytes);
      assert(
        results[1].css.reduce((n, c) => n + c.bytes, 0) <
          results[0].css.reduce((n, c) => n + c.bytes, 0),
      );
      assert.notDeepEqual(
        results[1].css.map((c) => c.name),
        results[0].css.map((c) => c.name),
      );
    }
    if (f.animationVariable)
      assert.deepEqual(results[1].runtime[0].animations, [1, 0]);
    if (f.sharedClass)
      assert.deepEqual(results[1].runtime[0].colors, [
        "rgb(0, 0, 255)",
        "rgb(255, 0, 0)",
      ]);
    const row = {
      case: f.name,
      expected: f.expected,
      status,
      baseline: results[0],
      optimized: results[1],
    };
    rows.push(row);
    await writeFile(
      join(root, "browser-results.json"),
      JSON.stringify(rows, null, 2),
    );
    console.log(
      JSON.stringify({
        case: f.name,
        status,
        decision: results[1].decision,
        bytes: results.map((r) => [
          r.jsBytes,
          r.css?.reduce((n, c) => n + c.bytes, 0),
        ]),
      }),
    );
  }
} finally {
  await browser.close();
  await new Promise((r) => server.close(r));
}
