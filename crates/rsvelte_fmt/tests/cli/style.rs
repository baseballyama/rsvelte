use std::path::PathBuf;
use std::process::{Command, Stdio};

use crate::common::{MARKER_OXFMT, bin, run_stdin, tempdir};

/// Batched `<style>` delegation: every `.svelte` file's `<style>` body is
/// collected and formatted in a single `oxfmt` invocation, then mapped back
/// to its own file. We stand in a fake `oxfmt` (a `.cjs` the binary runs
/// through `node`, so this is cross-platform) that prefixes each file it's
/// given with a marker — proving (a) the batch path runs and (b) each block
/// lands back in the correct file, not mixed across files.
#[test]
fn batched_style_delegation_maps_each_block_to_its_file() {
    let dir = tempdir();

    // Fake oxfmt: prepend `/*FMT*/` to every real *file* it receives (in
    // place). Skips flags (`--…`) and exclude globs (`!…`). It walks the
    // `<style>` staging directory (`rsvelte-fmt-styles-*`) the batch now hands
    // it (#707), mirroring real oxfmt's directory walk, but ignores any *other*
    // directory — so the project dir from the non-`.svelte` delegation pass
    // (`--no-error-on-unmatched-pattern !**/*.svelte <dir>`) is left alone (real
    // oxfmt covers that tree via its own walker + the .svelte exclude).
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();

    let c1 = dir.join("c1.svelte");
    let c2 = dir.join("c2.svelte");
    let c3 = dir.join("c3.svelte"); // no <style> — callback must never fire
    std::fs::write(&c1, "<div></div>\n<style>.sel_one{color:red}</style>\n").unwrap();
    std::fs::write(&c2, "<div></div>\n<style>.sel_two{color:blue}</style>\n").unwrap();
    std::fs::write(&c3, "<p>{x}</p>\n").unwrap();

    let status = Command::new(bin())
        .args([
            dir.to_str().unwrap(),
            "--write",
            // Exercise the oxfmt-subprocess batch path (default is native CSS).
            "--no-native-css",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out1 = std::fs::read_to_string(&c1).unwrap();
    let out2 = std::fs::read_to_string(&c2).unwrap();
    let out3 = std::fs::read_to_string(&c3).unwrap();

    // Each file got the fake formatter applied to its own <style> body.
    assert!(out1.contains("/*FMT*/"), "c1 missing marker:\n{out1}");
    assert!(
        out1.contains(".sel_one"),
        "c1 missing its selector:\n{out1}"
    );
    assert!(out2.contains("/*FMT*/"), "c2 missing marker:\n{out2}");
    assert!(
        out2.contains(".sel_two"),
        "c2 missing its selector:\n{out2}"
    );

    // Critically: no cross-contamination between batched files.
    assert!(!out1.contains(".sel_two"), "c1 leaked c2's css:\n{out1}");
    assert!(!out2.contains(".sel_one"), "c2 leaked c1's css:\n{out2}");

    // A file with no <style> never invokes the formatter, so no marker.
    assert!(!out3.contains("/*FMT*/"), "c3 should be untouched:\n{out3}");

    // The placeholder must never survive into output.
    assert!(
        !out1.contains("RSVELTE_FMT_STYLE"),
        "placeholder leaked:\n{out1}"
    );
}

// ─── Inline `<style>` cache (#703) ───────────────────────────────────────

/// A fake oxfmt that records one line in `$FAKE_OXFMT_LOG` per *batch*
/// invocation (any run that receives a real file argument), and otherwise
/// leaves the staged CSS files unchanged (identity format). Counting log lines
/// tells us how many times the `<style>` batch actually reached oxfmt.
fn write_counting_oxfmt(dir: &std::path::Path) -> PathBuf {
    let fake = dir.join("counting-oxfmt.cjs");
    std::fs::write(
        &fake,
        r"const fs = require('node:fs');
const path = require('node:path');
let touchedFile = false;
for (const p of process.argv.slice(2)) {
  if (p.startsWith('-') || p.startsWith('!')) continue;
  let st;
  try { st = fs.statSync(p); } catch { continue; }
  if (st.isFile()) touchedFile = true; // identity: leave content as-is
  else if (st.isDirectory() && path.basename(p).startsWith('rsvelte-fmt-styles-')) {
    for (const e of fs.readdirSync(p)) {
      if (fs.statSync(path.join(p, e)).isFile()) touchedFile = true;
    }
  }
}
if (touchedFile && process.env.FAKE_OXFMT_LOG) {
  fs.appendFileSync(process.env.FAKE_OXFMT_LOG, 'call\n');
}
",
    )
    .unwrap();
    fake
}

fn oxfmt_call_count(log: &std::path::Path) -> usize {
    std::fs::read_to_string(log).map_or(0, |s| s.lines().count())
}

/// A warm cache serves an unchanged `<style>` body without touching oxfmt: the
/// first `--check` populates the cache (one batch call), the second hits it
/// (zero further calls).
#[test]
fn style_cache_skips_oxfmt_on_warm_run() {
    let dir = tempdir();
    let cache = dir.join("cache");
    let log = dir.join("calls.log");
    std::fs::write(&log, "").unwrap();
    let fake = write_counting_oxfmt(&dir);

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let check = || {
        Command::new(bin())
            .args([
                file.to_str().unwrap(),
                "--check",
                "--no-native-css",
                "--oxfmt-bin",
                fake.to_str().unwrap(),
            ])
            .env("RSVELTE_FMT_CACHE_DIR", &cache)
            .env("FAKE_OXFMT_LOG", &log)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .unwrap();
    };

    check(); // cold — populates the cache
    assert_eq!(
        oxfmt_call_count(&log),
        1,
        "cold run should invoke oxfmt once"
    );
    check(); // warm — should be served from cache
    assert_eq!(
        oxfmt_call_count(&log),
        1,
        "warm run should NOT invoke oxfmt again (served from cache)"
    );
}

/// `--no-style-cache` opts out: oxfmt is invoked on every run.
#[test]
fn no_style_cache_flag_always_invokes_oxfmt() {
    let dir = tempdir();
    let cache = dir.join("cache");
    let log = dir.join("calls.log");
    std::fs::write(&log, "").unwrap();
    let fake = write_counting_oxfmt(&dir);

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let check = || {
        Command::new(bin())
            .args([
                file.to_str().unwrap(),
                "--check",
                "--no-style-cache",
                "--no-native-css",
                "--oxfmt-bin",
                fake.to_str().unwrap(),
            ])
            .env("RSVELTE_FMT_CACHE_DIR", &cache)
            .env("FAKE_OXFMT_LOG", &log)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .unwrap();
    };

    check();
    check();
    assert_eq!(
        oxfmt_call_count(&log),
        2,
        "--no-style-cache should invoke oxfmt on every run"
    );
}

/// `RSVELTE_FMT_NO_CACHE` disables the cache the same way the flag does.
#[test]
fn env_disables_style_cache() {
    let dir = tempdir();
    let cache = dir.join("cache");
    let log = dir.join("calls.log");
    std::fs::write(&log, "").unwrap();
    let fake = write_counting_oxfmt(&dir);

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let check = || {
        Command::new(bin())
            .args([
                file.to_str().unwrap(),
                "--check",
                "--no-native-css",
                "--oxfmt-bin",
                fake.to_str().unwrap(),
            ])
            .env("RSVELTE_FMT_CACHE_DIR", &cache)
            .env("RSVELTE_FMT_NO_CACHE", "1")
            .env("FAKE_OXFMT_LOG", &log)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .unwrap();
    };

    check();
    check();
    assert_eq!(
        oxfmt_call_count(&log),
        2,
        "RSVELTE_FMT_NO_CACHE should disable the cache"
    );
}

/// Cache hits must be byte-identical to a fresh (uncached) format. A fake oxfmt
/// that prefixes each `<style>` body with a marker formats two identical files;
/// one run uses the cache, the other disables it — the written output must match.
#[test]
fn style_cache_output_matches_uncached() {
    let dir = tempdir();
    let cache = dir.join("cache");
    let fake = dir.join("marker-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();

    let body = "<div></div>\n<style>.a{color:red}</style>\n";
    let cached = dir.join("cached.svelte");
    let uncached = dir.join("uncached.svelte");
    std::fs::write(&cached, body).unwrap();
    std::fs::write(&uncached, body).unwrap();

    let fmt = |file: &std::path::Path, no_cache: bool| {
        let mut args = vec![
            file.to_str().unwrap().to_string(),
            "--write".to_string(),
            "--no-native-css".to_string(),
            "--oxfmt-bin".to_string(),
            fake.to_str().unwrap().to_string(),
        ];
        if no_cache {
            args.push("--no-style-cache".to_string());
        }
        Command::new(bin())
            .args(&args)
            .env("RSVELTE_FMT_CACHE_DIR", &cache)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .unwrap();
    };

    // Warm the cache by formatting the cached file once, then re-create it and
    // format again (this second format is served from cache).
    fmt(&cached, false);
    std::fs::write(&cached, body).unwrap();
    fmt(&cached, false);

    fmt(&uncached, true);

    let a = std::fs::read_to_string(&cached).unwrap();
    let b = std::fs::read_to_string(&uncached).unwrap();
    assert_eq!(a, b, "cached output must equal uncached output");
    assert!(
        a.contains("/*FMT*/"),
        "marker missing — oxfmt result not applied:\n{a}"
    );
}

// ─── Batched `<style>` re-indentation + per-width parity (#1166) ──────────

/// An identity fake oxfmt: in `<style>` staging mode it leaves the (already
/// dedented) bodies untouched, and in the stdin per-block mode it copies stdin
/// to stdout verbatim. This isolates the *re-embedding* (re-indent + trailing
/// newline handling) the dispatcher does around oxfmt, so the batch (`--write`)
/// path and the single-block (`--stdin`) path must produce identical output.
const IDENTITY_OXFMT: &str = r"const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
// Mimic the surrounding-whitespace normalization a real CSS formatter applies:
// strip a leading blank line and trailing whitespace, end with one newline. The
// dispatcher hands oxfmt the *dedented* body (which has a leading empty line from
// the newline after `<style>`); a real oxfmt drops it, so identity must too.
const norm = (s) => s.replace(/^[ \t]*\n/, '').replace(/\s+$/, '') + '\n';
if (args.includes('--stdin-filepath')) {
  process.stdout.write(norm(fs.readFileSync(0, 'utf8')));
} else {
  for (const p of args) {
    if (p.startsWith('-') || p.startsWith('!')) continue;
    let st; try { st = fs.statSync(p); } catch { continue; }
    if (st.isFile() && !p.endsWith('.json')) fs.writeFileSync(p, norm(fs.readFileSync(p, 'utf8')));
    else if (st.isDirectory() && path.basename(p).startsWith('rsvelte-fmt-styles-')) {
      for (const e of fs.readdirSync(p)) { const fp = path.join(p, e); if (fs.statSync(fp).isFile()) fs.writeFileSync(fp, norm(fs.readFileSync(fp, 'utf8'))); }
    }
  }
}
";

/// Regression: the batched `--write` path must re-indent a multi-line `<style>`
/// body one level under the tag — not leave lines 2..N at column 0 with a stray
/// blank line before `</style>` (the bug behind ~33% of a real corpus diverging).
#[test]
fn write_path_reindents_multiline_style_body() {
    let dir = tempdir();
    let fake = dir.join("identity-oxfmt.cjs");
    std::fs::write(&fake, IDENTITY_OXFMT).unwrap();

    let file = dir.join("C.svelte");
    std::fs::write(
        &file,
        "<div>x</div>\n\n<style>\n  .a {\n    color: red;\n    background: blue;\n  }\n</style>\n",
    )
    .unwrap();

    let status = Command::new(bin())
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-style-cache",
            // #1166 is a batch-path (placeholder re-embed) regression; exercise
            // the oxfmt-subprocess path, not the native CSS default.
            "--no-native-css",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    let want =
        "<div>x</div>\n\n<style>\n  .a {\n    color: red;\n    background: blue;\n  }\n</style>\n";
    assert_eq!(
        out, want,
        "style body not re-indented under the tag:\n{out}"
    );
}

/// The batched `--write` path and the single-block `--stdin` path must be
/// byte-identical for the same `<style>` file: both dedent the body, run it
/// through oxfmt, and re-embed with the same re-indentation.
#[test]
fn write_and_stdin_paths_agree_on_style() {
    let dir = tempdir();
    let fake = dir.join("identity-oxfmt.cjs");
    std::fs::write(&fake, IDENTITY_OXFMT).unwrap();

    let src = "<section>\n  <p>hi</p>\n</section>\n\n<style>\n  .a {\n    color: red;\n  }\n\n  .b > .c {\n    margin: 0;\n  }\n</style>\n";

    // stdin path → stdout
    let (stdout, _stderr, code) = run_stdin(
        src,
        &[
            "--stdin",
            "--stdin-filepath",
            "x.svelte",
            "--no-native-css",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0, "stdin path failed");

    // write path → file
    let file = dir.join("x.svelte");
    std::fs::write(&file, src).unwrap();
    let status = Command::new(bin())
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-style-cache",
            "--no-native-css",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success());
    let written = std::fs::read_to_string(&file).unwrap();

    assert_eq!(written, stdout, "write and stdin paths diverged");
}

/// Each `<style>` block must be formatted at its own print width (global width
/// minus its indentation), so a top-level block and a deeper nested block reach
/// oxfmt with *different* `printWidth` configs — even when batched together.
/// A fake oxfmt stamps the `printWidth` it was handed via `-c`.
#[test]
fn batched_styles_format_at_per_block_width() {
    let dir = tempdir();
    let fake = dir.join("width-oxfmt.cjs");
    std::fs::write(
        &fake,
        r"const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
let width = '?';
const ci = args.indexOf('-c');
if (ci >= 0 && args[ci + 1]) {
  try { const j = JSON.parse(fs.readFileSync(args[ci + 1], 'utf8')); if (j.printWidth != null) width = String(j.printWidth); } catch {}
}
function stamp(p) { fs.writeFileSync(p, `/*W=${width}*/ ` + fs.readFileSync(p, 'utf8')); }
for (const p of args) {
  if (p.startsWith('-') || p.startsWith('!')) continue;
  let st; try { st = fs.statSync(p); } catch { continue; }
  if (st.isFile() && !p.endsWith('.json')) stamp(p);
  else if (st.isDirectory() && path.basename(p).startsWith('rsvelte-fmt-styles-')) {
    for (const e of fs.readdirSync(p)) { const fp = path.join(p, e); if (fs.statSync(fp).isFile()) stamp(fp); }
  }
}
",
    )
    .unwrap();

    // Top-level <style> renders at body indent 2 (width 100-2=98); the nested
    // <style> inside <div> renders deeper at body indent 4 (width 100-4=96).
    let file = dir.join("W.svelte");
    std::fs::write(
        &file,
        "<div>\n  <style>.x {\n    color: red;\n  }</style>\n</div>\n\n<style>.y {\n  color: blue;\n}</style>\n",
    )
    .unwrap();

    let status = Command::new(bin())
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-style-cache",
            // Per-block `-c printWidth` only exists on the oxfmt-subprocess path.
            "--no-native-css",
            "--print-width",
            "100",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("/*W=98*/"),
        "top-level block width wrong:\n{out}"
    );
    assert!(out.contains("/*W=96*/"), "nested block width wrong:\n{out}");
}
