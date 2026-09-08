// Re-runs the two vendored-data generators and fails when the tree is not
// byte-identical afterwards.
//
//   node scripts/ci/check-vendored-lsp-data.mjs [--fix]
//
// `html_data/web.rs` and `css_data/web.rs` are vendored from
// `vscode-{html,css}-languageservice`, and each records the resolved version
// plus a SHA-256 per input file in its header. That header is a RECORD and
// nothing re-read it: the two vendored-data tests compare the Rust port against
// a JSON oracle THE SAME GENERATOR RUN writes, so a version bump in
// `submodules/language-tools` that nobody regenerates leaves the port and its
// oracle equally stale and both tests green forever (#4258).
//
// Running the generators is what makes the recorded SHA-256 load-bearing: the
// generator resolves the package from the language-tools lockfile and refuses
// to write if the resolved version disagrees, so a bump fails here on the PR
// that bumps it.
//
// The generators emit unformatted Rust, so `rustfmt` runs before the diff —
// exactly the two steps a human regeneration takes.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../../..");
const FIX = process.argv.includes("--fix");

const GENERATORS = [
  "scripts/dev/generate-html-data.mjs",
  "scripts/dev/generate-css-data.mjs",
];

// Everything the two generators write. A path missing from this list is a path
// the gate does not watch, so it is derived from the generators' own output
// assignments rather than remembered — see the self-test.
const GENERATED = [
  "crates/rsvelte_language_server/src/html_data/web.rs",
  "crates/rsvelte_language_server/src/html_data/svelte_html.rs",
  "crates/rsvelte_language_server/src/css_data/web.rs",
  "crates/rsvelte_language_server/src/css_data/svelte_css.rs",
  "crates/rsvelte_language_server/tests/data/html-documentation.json",
  "crates/rsvelte_language_server/tests/data/svelte-html-attributes.json",
  "crates/rsvelte_language_server/tests/data/css-documentation.json",
];

const run = (cmd, args) =>
  execFileSync(cmd, args, { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] })
    .toString()
    .trim();

function assertClean() {
  const dirty = run("git", ["status", "--porcelain", "--", ...GENERATED]);
  if (dirty) {
    console.error(
      "The generated files are already modified in the working tree, so this\n" +
        "gate cannot tell its own output from yours. Commit or stash first:\n" +
        dirty,
    );
    process.exit(2);
  }
}

function main() {
  for (const rel of GENERATED) {
    if (!fs.existsSync(path.join(ROOT, rel))) {
      console.error(`missing generated file: ${rel}`);
      process.exit(2);
    }
  }
  if (!FIX) assertClean();

  for (const generator of GENERATORS) {
    process.stderr.write(`[vendored-lsp-data] node ${generator}\n`);
    execFileSync("node", [generator], { cwd: ROOT, stdio: "inherit" });
  }

  const rust = GENERATED.filter((f) => f.endsWith(".rs"));
  process.stderr.write(`[vendored-lsp-data] rustfmt ${rust.length} files\n`);
  execFileSync("rustfmt", ["--edition", "2024", ...rust], {
    cwd: ROOT,
    stdio: "inherit",
  });

  const drifted = run("git", ["status", "--porcelain", "--", ...GENERATED]);
  if (!drifted) {
    console.log(
      `[vendored-lsp-data] OK — ${GENERATED.length} generated files reproduce byte-identically`,
    );
    return;
  }
  if (FIX) {
    console.log(`[vendored-lsp-data] regenerated:\n${drifted}`);
    return;
  }
  console.error(
    "\nThe vendored LSP data is stale. These files are not what the generators\n" +
      "produce from the currently pinned `submodules/language-tools`:\n\n" +
      drifted +
      "\n\nRegenerate with `pnpm run fix:vendored-lsp-data` and commit the result.\n" +
      "If the version moved, the header's `sha256` lines move with it — that is\n" +
      "the point: the record only means something because this gate re-reads it.\n",
  );
  console.error(run("git", ["diff", "--stat", "--", ...GENERATED]));
  process.exit(1);
}

main();
