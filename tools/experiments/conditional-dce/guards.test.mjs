import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, realpath, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import MagicString from "magic-string";
import { javascript, nodes } from "./ast.mjs";
import { certifiedBuild } from "./build.mjs";

const root = await realpath(
  await mkdtemp(join(tmpdir(), "rsvelte-proof-guards-")),
);
await symlink(
  new URL("./node_modules", import.meta.url).pathname,
  join(root, "node_modules"),
);
const rows = [];
const buttonSource =
  '<script>let {variant}=$props();</script>{#if variant==="danger"}<p class="danger">Danger</p>{:else}<p class="primary">Primary</p>{/if}<style>.danger{color:red}.primary{color:blue}</style>';

async function fixture(name) {
  const dir = join(root, name);
  await mkdir(dir);
  await writeFile(join(dir, "Button.svelte"), buttonSource);
  await writeFile(join(dir, "Other.svelte"), buttonSource);
  await writeFile(
    join(dir, "Aux.svelte"),
    '<p class="aux">Aux</p><style>.aux{color:green}</style>',
  );
  await writeFile(
    join(dir, "App.svelte"),
    '<script>import Button from "./Button.svelte";import Other from "./Other.svelte";import Aux from "./Aux.svelte";</script><Button variant="primary"/><Other variant="danger"/><Aux/>',
  );
  await writeFile(
    join(dir, "main.js"),
    'import App from "./App.svelte";export default App;',
  );
  const config = {
    root: dir,
    configFile: false,
    publicDir: false,
    logLevel: "error",
    build: {
      minify: "oxc",
      lib: {
        entry: join(dir, "main.js"),
        formats: ["es"],
        cssFileName: "style",
      },
    },
  };
  return { dir, config, targets: [join(dir, "Button.svelte")] };
}

for (const name of [
  "source-revision",
  "caller-revision",
  "css-revision",
  "compiler-output-revision",
]) {
  const f = await fixture(name);
  let pass = 0;
  const plugin = {
    name: "revision-control",
    enforce: "post",
    buildStart() {
      pass++;
    },
    transform(code, id) {
      if (pass !== 2) return null;
      if (name === "caller-revision" && id === join(f.dir, "App.svelte")) {
        const edit = new MagicString(code);
        let count = 0;
        for (const { node } of nodes(javascript(code, id))) {
          if (
            node.type === "Property" &&
            node.key.name === "variant" &&
            node.value.type === "Literal" &&
            node.value.value === "primary"
          ) {
            edit.overwrite(node.value.start, node.value.end, '"danger"');
            count++;
          }
        }
        assert.equal(count, 1);
        return {
          code: edit.toString(),
          map: edit.generateMap({
            hires: true,
            source: id,
            includeContent: true,
          }),
        };
      }
      if (name === "compiler-output-revision" && id === f.targets[0])
        return { code: code + "\nglobalThis.outputChanged = true;", map: null };
      return null;
    },
  };
  let markup = 0;
  let style = 0;
  const compiler = {
    preprocess: {
      markup({ content, filename }) {
        if (name === "source-revision" && filename === f.targets[0])
          return { code: content + (markup++ ? " " : "") };
      },
      style({ content, filename }) {
        if (name === "css-revision" && filename === join(f.dir, "Aux.svelte"))
          return { code: style++ ? " .aux{color:red}" : content };
      },
    },
  };
  await assert.rejects(
    certifiedBuild({ ...f, plugins: [plugin], compiler }),
    /changed|revision/i,
  );
  rows.push({ case: name, status: "rejected before output publication" });
  console.log(JSON.stringify(rows.at(-1)));
}
const f = await fixture("partial");
const result = await certifiedBuild({
  ...f,
  targets: [...f.targets, join(f.dir, "Other.svelte")],
});
assert.equal(result.removed, 1);
assert.equal(result.proofCount, 1);
assert.deepEqual(result.decisions[join(f.dir, "Other.svelte")].values, [
  "danger",
]);
rows.push({
  case: "partial",
  status: "one component removed; one component kept",
});
const custom = await fixture("custom-element");
await writeFile(
  custom.targets[0],
  '<svelte:options customElement="x-audit-button"/>' + buttonSource,
);
const customResult = await certifiedBuild({
  ...custom,
  compiler: { compilerOptions: { customElement: true } },
});
assert.equal(customResult.removed, 0);
assert(customResult.decisions[custom.targets[0]].unknown);
rows.push({ case: "custom-element", status: "public custom element retained" });
const configured = await fixture("config-hook");
const configuredResult = await certifiedBuild({
  ...configured,
  plugins: [
    {
      name: "external-config",
      config() {
        return {};
      },
    },
  ],
});
assert.equal(configuredResult.removed, 0);
assert(configuredResult.decisions[configured.targets[0]].unknown);
rows.push({
  case: "config-hook",
  status: "uncontracted configuration hook retained",
});
const emitted = await fixture("emitted-style");
const emittedResult = await certifiedBuild({
  ...emitted,
  plugins: [
    {
      name: "style-emission",
      buildStart() {
        this.emitFile({
          type: "asset",
          fileName: "extra.css",
          source: ".primary{color:red}",
        });
      },
    },
  ],
});
assert.equal(emittedResult.removed, 0);
assert(emittedResult.decisions[emitted.targets[0]].unknown);
rows.push({
  case: "emitted-style",
  status: "uncontracted emitted style retained",
});
await writeFile(join(root, "results.json"), JSON.stringify(rows, null, 2));
console.log(JSON.stringify({ artifacts: root, passed: rows.length }));
