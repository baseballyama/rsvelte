// JS-fallback bridge for svelte-preprocess-markdown (marked-based). Reads
// `{ content, filename, options }` on stdin and writes `{ ok: { code } }` /
// `{ renderError }` / `{ bridgeError }`.
let input = '';
for await (const chunk of process.stdin) input += chunk;
const { content, filename, options } = JSON.parse(input);

let markdown;
try {
  ({ markdown } = await import('svelte-preprocess-markdown'));
} catch {
  process.stdout.write(
    JSON.stringify({
      bridgeError:
        "Cannot find module 'svelte-preprocess-markdown'. Install it to use the markdown preprocessor.",
    }),
  );
  process.exit(0);
}

try {
  const pp = markdown(options || undefined);
  const res = await pp.markup({ content, filename });
  process.stdout.write(
    JSON.stringify({ ok: { code: res && res.code != null ? res.code : content } }),
  );
} catch (err) {
  process.stdout.write(JSON.stringify({ renderError: (err && err.message) || String(err) }));
}
