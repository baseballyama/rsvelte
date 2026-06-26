// JS-fallback bridge for the `less` compiler, invoked by `rsvelte_preprocess`'s
// less port. Reads a JSON `{ content, filename, options }` request on stdin and
// writes a JSON response on stdout:
//   { ok: { css, map, imports } }                    — success
//   { renderError: { message, line, column, index, extract } } — less threw
//   { bridgeError: "…" }                             — `less` not installed
//
// `less` is resolved from the process working directory (the user's project),
// matching how `svelte-preprocess-less` resolves its peer dependency.
import { createRequire } from 'module';

const require = createRequire(process.cwd() + '/');

let input = '';
for await (const chunk of process.stdin) input += chunk;

const { content, filename, options } = JSON.parse(input);

let less;
try {
  less = require('less');
} catch {
  process.stdout.write(
    JSON.stringify({
      bridgeError:
        "Cannot find module 'less'. Install it in your project to use the less preprocessor.",
    }),
  );
  process.exit(0);
}

try {
  const result = await less.render(
    content,
    Object.assign({ filename, sourceMap: {} }, options || {}),
  );
  process.stdout.write(
    JSON.stringify({
      ok: {
        css: result.css,
        map: result.map ?? null,
        imports: result.imports ?? [],
      },
    }),
  );
} catch (err) {
  process.stdout.write(
    JSON.stringify({
      renderError: {
        message: err.message ?? String(err),
        line: err.line ?? null,
        column: err.column ?? null,
        index: err.index ?? null,
        extract: err.extract ?? null,
      },
    }),
  );
}
