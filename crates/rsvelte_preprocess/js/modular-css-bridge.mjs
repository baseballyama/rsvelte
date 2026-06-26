// JS-fallback bridge for @modular-css/svelte. Reads `{ content, filename,
// options }` on stdin and writes `{ ok: { code, css, dependencies } }` /
// `{ renderError }` / `{ bridgeError }`.
//
// `options.testNamer === true` installs the deterministic `mc_<name>` namer the
// modular-css test suite uses (a namer is a JS function and can't be sent as
// JSON).
import { createRequire } from 'module';

const require = createRequire(process.cwd() + '/');

let input = '';
for await (const chunk of process.stdin) input += chunk;
const { content, filename, options } = JSON.parse(input);

let plugin;
try {
  plugin = require('@modular-css/svelte');
} catch {
  process.stdout.write(
    JSON.stringify({
      bridgeError:
        "Cannot find module '@modular-css/svelte'. Install it to use the modular-css preprocessor.",
    }),
  );
  process.exit(0);
}

const opts = { ...(options || {}) };
if (opts.testNamer) {
  opts.namer = (file, selector) => `mc_${selector}`;
  delete opts.testNamer;
}

try {
  const { processor, preprocess } = plugin(opts);
  const res = await preprocess.markup({ content, filename });
  let css = '';
  try {
    const out = await processor.output();
    css = out.css;
  } catch {
    /* no aggregated output (e.g. no-op) */
  }
  process.stdout.write(
    JSON.stringify({
      ok: { code: res.code, css, dependencies: res.dependencies || [] },
    }),
  );
} catch (err) {
  process.stdout.write(JSON.stringify({ renderError: (err && err.message) || String(err) }));
}
