// JS-fallback bridge for @nvl/sveltex. Reads `{ content, filename, options }`
// on stdin and writes `{ ok: { code, map } }` / `{ renderError }` /
// `{ bridgeError }`. `options` is sveltex's first (backends/config) argument.
let input = '';
for await (const chunk of process.stdin) input += chunk;
const { content, filename, options } = JSON.parse(input);

let sveltex;
try {
  ({ sveltex } = await import('@nvl/sveltex'));
} catch {
  process.stdout.write(
    JSON.stringify({
      bridgeError: "Cannot find module '@nvl/sveltex'. Install it to use the sveltex preprocessor.",
    }),
  );
  process.exit(0);
}

try {
  const pp = await sveltex(options || {}, {});
  const res = await pp.markup({ content, filename });
  const map = res && res.map ? (typeof res.map === 'string' ? res.map : JSON.stringify(res.map)) : null;
  process.stdout.write(
    JSON.stringify({ ok: { code: res && res.code != null ? res.code : content, map } }),
  );
} catch (err) {
  process.stdout.write(JSON.stringify({ renderError: (err && err.message) || String(err) }));
}
