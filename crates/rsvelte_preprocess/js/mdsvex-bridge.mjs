// JS-fallback bridge for mdsvex. Reads `{ content, filename, options }` on
// stdin and writes `{ ok: { code, map } }` / `{ renderError }` / `{ bridgeError }`.
let input = '';
for await (const chunk of process.stdin) input += chunk;
const { content, filename, options } = JSON.parse(input);

let mdsvex;
try {
  ({ mdsvex } = await import('mdsvex'));
} catch {
  process.stdout.write(
    JSON.stringify({
      bridgeError: "Cannot find module 'mdsvex'. Install it to use the mdsvex preprocessor.",
    }),
  );
  process.exit(0);
}

try {
  const pp = await mdsvex(options || {});
  const res = await pp.markup({ content, filename });
  const map = res && res.map ? (typeof res.map === 'string' ? res.map : JSON.stringify(res.map)) : null;
  process.stdout.write(
    JSON.stringify({ ok: { code: res && res.code != null ? res.code : content, map } }),
  );
} catch (err) {
  process.stdout.write(JSON.stringify({ renderError: (err && err.message) || String(err) }));
}
