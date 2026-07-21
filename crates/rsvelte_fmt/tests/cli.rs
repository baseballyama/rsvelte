//! Integration tests for the `rsvelte-fmt` CLI. The Svelte formatting path
//! and the batched `<style>` delegation path are exercised here; the latter
//! stands in a fake `oxfmt` (a `.cjs` run through `node`) so it needs no real
//! `oxfmt` on `$PATH`. Delegation of whole non-`.svelte` files to a real
//! `oxfmt` is covered by the corpus formatter-parity track (see
//! scripts/compat-corpus/README.md).

use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

fn bin() -> PathBuf {
    // Cargo sets CARGO_BIN_EXE_<bin-name> for integration tests so the test
    // doesn't have to guess where the binary lives — important under
    // cargo-llvm-cov, which uses target/llvm-cov-target/ instead of target/.
    PathBuf::from(env!("CARGO_BIN_EXE_rsvelte-fmt"))
}

/// A fake oxfmt that prepends `/*FMT*/` to every CSS file it formats. Handles
/// both explicit file arguments and the `<style>` staging directory the batch
/// hands it (basename `rsvelte-fmt-styles-*`, walked like real oxfmt walks a
/// directory). Any *other* directory argument — e.g. the project dir from the
/// non-`.svelte` delegation pass — is ignored, so it never touches the test's
/// own `.svelte`/`.cjs` files. Shared by the delegation and cache-output tests.
const MARKER_OXFMT: &str = r#"const fs = require('node:fs');
const path = require('node:path');
function fmtFile(p) { fs.writeFileSync(p, '/*FMT*/' + fs.readFileSync(p, 'utf8')); }
for (const p of process.argv.slice(2)) {
  if (p.startsWith('-') || p.startsWith('!')) continue;
  let st;
  try { st = fs.statSync(p); } catch { continue; }
  if (st.isFile()) fmtFile(p);
  else if (st.isDirectory() && path.basename(p).startsWith('rsvelte-fmt-styles-')) {
    for (const e of fs.readdirSync(p)) {
      const fp = path.join(p, e);
      if (fs.statSync(fp).isFile()) fmtFile(fp);
    }
  }
}
"#;

fn run_stdin(stdin: &str, args: &[&str]) -> (String, String, i32) {
    let mut child = Command::new(bin())
        .args(args)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("spawn rsvelte-fmt");
    child
        .stdin
        .as_mut()
        .unwrap()
        .write_all(stdin.as_bytes())
        .unwrap();
    let out = child.wait_with_output().unwrap();
    (
        String::from_utf8(out.stdout).unwrap(),
        String::from_utf8(out.stderr).unwrap(),
        out.status.code().unwrap_or(-1),
    )
}

#[test]
fn stdin_format_svelte_succeeds() {
    let (stdout, _stderr, code) = run_stdin(
        "<script>let x=1+2</script>\n<p>{ x }</p>",
        &["--stdin", "--stdin-filepath", "test.svelte"],
    );
    assert_eq!(code, 0);
    assert!(stdout.contains("let x = 1 + 2;"), "stdout:\n{stdout}");
    assert!(stdout.contains("<p>{x}</p>"), "stdout:\n{stdout}");
}

#[test]
fn stdin_check_returns_one_when_unformatted() {
    let (_stdout, _stderr, code) = run_stdin(
        "<script>let x=1+2</script>",
        &["--stdin", "--stdin-filepath", "test.svelte", "--check"],
    );
    assert_eq!(code, 1);
}

#[test]
fn stdin_check_returns_zero_when_formatted() {
    let (_stdout, _stderr, code) = run_stdin(
        "<script>\n  let x = 1 + 2;\n</script>\n",
        &["--stdin", "--stdin-filepath", "test.svelte", "--check"],
    );
    assert_eq!(code, 0);
}

#[test]
fn stdin_respects_use_tabs() {
    let (stdout, _stderr, code) = run_stdin(
        "<script>let x=1+2</script>",
        &["--stdin", "--stdin-filepath", "test.svelte", "--use-tabs"],
    );
    assert_eq!(code, 0);
    assert!(
        stdout.contains("\n\tlet x = 1 + 2;\n"),
        "expected tab indent:\n{stdout:?}"
    );
}

#[test]
fn write_mode_updates_svelte_file_on_disk() {
    let dir = tempdir();
    let file = dir.join("App.svelte");
    std::fs::write(&file, "<script>let x=1+2</script>").unwrap();

    let status = Command::new(bin())
        .args([file.to_str().unwrap(), "--write"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let after = std::fs::read_to_string(&file).unwrap();
    assert!(after.contains("let x = 1 + 2;"), "{after}");
}

/// With no path argument, `rsvelte-fmt` formats the current directory in place
/// (write is the default), matching `oxfmt`'s "if not provided, current working
/// directory is used" behavior (#1432).
#[test]
fn no_paths_defaults_to_cwd_and_writes() {
    let dir = tempdir();
    let file = dir.join("App.svelte");
    std::fs::write(&file, "<script>let x=1+2</script>").unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--oxfmt-bin", "true"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .output()
        .unwrap();
    assert_eq!(out.status.code(), Some(0), "should default to cwd + write");

    let after = std::fs::read_to_string(&file).unwrap();
    assert!(after.contains("let x = 1 + 2;"), "{after}");
}

/// `--check` with no path checks the current directory and never writes, exiting
/// non-zero when a file would be reformatted — same as `oxfmt --check`.
#[test]
fn no_paths_check_does_not_write() {
    let dir = tempdir();
    let file = dir.join("App.svelte");
    std::fs::write(&file, "<script>let x=1+2</script>").unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--check", "--oxfmt-bin", "true"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();
    assert_eq!(
        out.status.code(),
        Some(1),
        "unformatted cwd must fail --check"
    );

    let after = std::fs::read_to_string(&file).unwrap();
    assert_eq!(
        after, "<script>let x=1+2</script>",
        "--check must not write"
    );
}

/// The cwd default applies only to the file-walk path: `--stdin` still reads
/// stdin and leaves on-disk files untouched even with no path argument.
#[test]
fn stdin_ignores_cwd_default() {
    let dir = tempdir();
    let file = dir.join("App.svelte");
    std::fs::write(&file, "<script>let x=1+2</script>").unwrap();

    let mut child = Command::new(bin())
        .current_dir(&dir)
        .args(["--stdin", "--stdin-filepath", "In.svelte"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .unwrap();
    child
        .stdin
        .as_mut()
        .unwrap()
        .write_all(b"<script>let y=3+4</script>\n<p>{ y }</p>")
        .unwrap();
    let out = child.wait_with_output().unwrap();
    assert_eq!(out.status.code(), Some(0));

    let stdout = String::from_utf8(out.stdout).unwrap();
    assert!(stdout.contains("let y = 3 + 4;"), "stdout:\n{stdout}");
    // The on-disk file must be left untouched — stdin mode doesn't walk the cwd.
    let after = std::fs::read_to_string(&file).unwrap();
    assert_eq!(
        after, "<script>let x=1+2</script>",
        "stdin must not touch cwd"
    );
}

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

/// #693: inline `<script>` formatting must honor the project `.oxfmtrc`.
/// The script body is formatted in-process (no `oxfmt` needed), so a config
/// with `singleQuote: true` should keep the string single-quoted instead of
/// flipping it to oxc_formatter's double-quote default.
#[test]
fn inline_script_respects_oxfmtrc_single_quote() {
    let dir = tempdir();
    let cfg = dir.join(".oxfmtrc.json");
    std::fs::write(&cfg, r#"{ "singleQuote": true }"#).unwrap();

    let (stdout, _stderr, code) = run_stdin(
        "<script>const x = \"hello\"</script>\n<p>{x}</p>\n",
        &[
            "--stdin",
            "--stdin-filepath",
            "x.svelte",
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0);
    assert!(
        stdout.contains("const x = 'hello';"),
        "expected single quotes from .oxfmtrc:\n{stdout}"
    );
    assert!(
        !stdout.contains("\"hello\""),
        "string should not be double-quoted:\n{stdout}"
    );
}

/// Without a config, the in-process default is oxc_formatter's double quotes —
/// confirms the config layer is what flips quote style, not something else.
#[test]
fn inline_script_defaults_to_double_quote_without_config() {
    let (stdout, _stderr, code) = run_stdin(
        "<script>const x = 'hello'</script>\n",
        &["--stdin", "--stdin-filepath", "x.svelte"],
    );
    assert_eq!(code, 0);
    assert!(
        stdout.contains("const x = \"hello\";"),
        "expected double-quote default:\n{stdout}"
    );
}

/// #1430: `oxfmt.config.ts` must be honored exactly like `.oxfmtrc.json` for
/// the in-process inline `<script>` path — same assertion as
/// `inline_script_respects_oxfmtrc_single_quote`, just with a statically
/// evaluated TS config instead of JSON.
#[test]
fn inline_script_respects_oxfmt_config_ts_single_quote() {
    let dir = tempdir();
    let cfg = dir.join("oxfmt.config.ts");
    std::fs::write(&cfg, "export default { singleQuote: true };").unwrap();

    let (stdout, stderr, code) = run_stdin(
        "<script>const x = \"hello\"</script>\n<p>{x}</p>\n",
        &[
            "--stdin",
            "--stdin-filepath",
            "x.svelte",
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0, "stderr:\n{stderr}");
    assert!(
        stdout.contains("const x = 'hello';"),
        "expected single quotes from oxfmt.config.ts:\n{stdout}"
    );
    assert!(
        !stdout.contains("\"hello\""),
        "string should not be double-quoted:\n{stdout}"
    );
}

/// `defineConfig(...)` — oxfmt's identity-function config helper — must
/// evaluate the same as a plain object default export.
#[test]
fn inline_script_respects_oxfmt_config_ts_via_define_config() {
    let dir = tempdir();
    let cfg = dir.join("oxfmt.config.ts");
    std::fs::write(
        &cfg,
        "import { defineConfig } from \"oxfmt\";\nexport default defineConfig({ semi: false });",
    )
    .unwrap();

    let (stdout, stderr, code) = run_stdin(
        "<script>const x = 1</script>\n",
        &[
            "--stdin",
            "--stdin-filepath",
            "x.svelte",
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0, "stderr:\n{stderr}");
    assert!(
        stdout.contains("const x = 1\n"),
        "expected no trailing semicolon from `semi: false`:\n{stdout}"
    );
}

/// `.oxfmtrc` discovery must also find `oxfmt.config.ts` (no explicit
/// `--config`) and apply its `ignorePatterns` to the `.svelte` walk, mirroring
/// `check_excludes_svelte_via_oxfmtrc_ignore_patterns` for the JSON config.
#[test]
fn oxfmt_config_ts_is_discovered_and_ignore_patterns_apply() {
    let dir = tempdir();
    std::fs::write(
        dir.join("oxfmt.config.ts"),
        "export default { ignorePatterns: [\"ignored/**/*.svelte\"] };",
    )
    .unwrap();
    std::fs::create_dir_all(dir.join("ignored")).unwrap();
    std::fs::create_dir_all(dir.join("kept")).unwrap();
    std::fs::write(
        dir.join("ignored").join("skip.svelte"),
        "<script>let x=1+2</script>",
    )
    .unwrap();
    std::fs::write(
        dir.join("kept").join("keep.svelte"),
        "<script>let x=1+2</script>",
    )
    .unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--check", ".", "--oxfmt-bin", "true"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();
    let stdout = String::from_utf8(out.stdout).unwrap();
    let stderr = String::from_utf8(out.stderr).unwrap();

    assert!(
        stdout.contains("keep.svelte"),
        "kept file must be checked:\n{stdout}\nstderr:\n{stderr}"
    );
    assert!(
        !stdout.contains("skip.svelte"),
        "ignored file must be excluded:\n{stdout}"
    );
    assert_eq!(out.status.code(), Some(1));
}

/// A discovered `oxfmt.config.ts` containing a dynamic expression the static
/// evaluator can't run must fail the whole invocation with a clear message —
/// unlike `.oxfmtrc.json`'s "ignore what we can't parse" policy, a `.ts`
/// config is a deliberate choice, so a silent partial read would be worse
/// than an explicit error.
#[test]
fn dynamic_oxfmt_config_ts_is_a_clear_error() {
    let dir = tempdir();
    std::fs::write(
        dir.join("oxfmt.config.ts"),
        "export default { printWidth: computeWidth() };",
    )
    .unwrap();
    let file = dir.join("App.svelte");
    std::fs::write(&file, "<script>let x=1+2</script>").unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args([".", "--check"])
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .output()
        .unwrap();
    assert_ne!(out.status.code(), Some(0));
    let stderr = String::from_utf8(out.stderr).unwrap();
    assert!(
        stderr.contains("statically"),
        "expected a static-evaluation error:\n{stderr}"
    );
}

/// A directory holding both `.oxfmtrc.json` and `oxfmt.config.ts` is a
/// conflict oxfmt itself refuses to resolve (only one config file is allowed
/// per directory) — rsvelte-fmt must mirror that instead of silently picking
/// one.
#[test]
fn conflicting_json_and_ts_configs_in_one_directory_is_an_error() {
    let dir = tempdir();
    std::fs::write(dir.join(".oxfmtrc.json"), r#"{ "singleQuote": true }"#).unwrap();
    std::fs::write(
        dir.join("oxfmt.config.ts"),
        "export default { semi: true };",
    )
    .unwrap();
    let file = dir.join("App.svelte");
    std::fs::write(&file, "<script>let x=1+2</script>").unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args([".", "--check"])
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .output()
        .unwrap();
    assert_ne!(out.status.code(), Some(0));
    let stderr = String::from_utf8(out.stderr).unwrap();
    assert!(
        stderr.to_lowercase().contains("multiple"),
        "expected a config-conflict error:\n{stderr}"
    );
}

/// An explicit `--config foo.cjs` must be accepted and its `module.exports =
/// {...}` (CommonJS's equivalent of an ESM default export) statically
/// evaluated, mirroring oxfmt's own `is_js_config_path` accepting
/// `.js`/`.mjs`/`.cjs` (not just `.ts`/`.mts`) for an explicit `--config`.
/// Auto-discovery still only ever finds `oxfmt.config.ts`/`.mts`, so this
/// requires an explicit flag.
#[test]
fn inline_script_respects_explicit_cjs_config() {
    let dir = tempdir();
    let cfg = dir.join("oxfmt.config.cjs");
    std::fs::write(&cfg, "module.exports = { singleQuote: true };").unwrap();

    let (stdout, stderr, code) = run_stdin(
        "<script>const x = \"hello\"</script>\n",
        &[
            "--stdin",
            "--stdin-filepath",
            "x.svelte",
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0, "stderr:\n{stderr}");
    assert!(
        stdout.contains("const x = 'hello';"),
        "expected single quotes from oxfmt.config.cjs:\n{stdout}"
    );
}

/// `--config foo.cjs` using the incremental `exports.foo = ...` style (as
/// opposed to a full `module.exports = {...}` replacement) must also drive
/// inline `<script>` formatting — real Node honors this form too, so
/// rsvelte-fmt's static evaluator accumulates it into an object.
#[test]
fn inline_script_respects_explicit_cjs_config_exports_property_style() {
    let dir = tempdir();
    let cfg = dir.join("oxfmt.config.cjs");
    std::fs::write(&cfg, "exports.singleQuote = true;\nexports.semi = false;").unwrap();

    let (stdout, stderr, code) = run_stdin(
        "<script>const x = \"hello\"</script>\n",
        &[
            "--stdin",
            "--stdin-filepath",
            "x.svelte",
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0, "stderr:\n{stderr}");
    assert!(
        stdout.contains("const x = 'hello'\n"),
        "expected single quotes (exports.singleQuote) and no trailing semicolon \
         (exports.semi = false):\n{stdout}"
    );
}

/// `--config foo.js` must accept either dialect the file happens to use —
/// oxfmt (via Node's CJS/ESM interop) decides by content, not extension, so
/// rsvelte-fmt's static evaluator must too. This covers the ESM form; the CJS
/// form is covered by `ts_config::tests::js_extension_accepts_commonjs_module_exports`.
#[test]
fn inline_script_respects_explicit_js_config_esm_form() {
    let dir = tempdir();
    let cfg = dir.join("oxfmt.config.js");
    std::fs::write(&cfg, "export default { semi: false };").unwrap();

    let (stdout, stderr, code) = run_stdin(
        "<script>const x = 1</script>\n",
        &[
            "--stdin",
            "--stdin-filepath",
            "x.svelte",
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0, "stderr:\n{stderr}");
    assert!(
        stdout.contains("const x = 1\n"),
        "expected no trailing semicolon from `semi: false`:\n{stdout}"
    );
}

/// Fake oxfmt that proves the `-c` flag it receives is a *materialized JSON*
/// file, never the `oxfmt.config.ts` source: it `JSON.parse`s whatever `-c`
/// points at (which throws on non-JSON, e.g. if the `.ts` path leaked
/// through) and stamps every formatted file with the parsed `singleQuote`
/// value, so the test can assert the evaluated TS config's content actually
/// reached the child process.
const CONFIG_ECHO_OXFMT: &str = r#"const fs = require('node:fs');
const path = require('node:path');
const args = process.argv.slice(2);
const cIdx = args.indexOf('-c');
if (cIdx === -1) { throw new Error('expected a -c flag'); }
const configPath = args[cIdx + 1];
const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const marker = `/*SQ:${cfg.singleQuote}*/`;
function fmtFile(p) { fs.writeFileSync(p, marker + fs.readFileSync(p, 'utf8')); }
for (const p of args) {
  if (p.startsWith('-') || p.startsWith('!') || p === configPath) continue;
  let st;
  try { st = fs.statSync(p); } catch { continue; }
  if (st.isFile()) fmtFile(p);
  else if (st.isDirectory() && path.basename(p).startsWith('rsvelte-fmt-styles-')) {
    for (const e of fs.readdirSync(p)) {
      const fp = path.join(p, e);
      if (fs.statSync(fp).isFile()) fmtFile(fp);
    }
  }
}
"#;

/// End-to-end: `--no-native-css` delegates inline `<style>` bodies to a child
/// `oxfmt` via the batched staging-directory path
/// (`batched_style_delegation_maps_each_block_to_its_file`'s path), forcing
/// `-c`. With a discovered `oxfmt.config.ts`, that flag must point at the
/// materialized JSON (see `OxfmtConfig::oxfmt_arg_path`) carrying the
/// statically-evaluated config — not the `.ts` file itself, which the
/// pure-Rust `oxfmt` CLI can't evaluate.
#[test]
fn oxfmt_config_ts_delegates_materialized_json_to_child_oxfmt() {
    let dir = tempdir();
    std::fs::write(
        dir.join("oxfmt.config.ts"),
        "export default { singleQuote: true };",
    )
    .unwrap();
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(&fake, CONFIG_ECHO_OXFMT).unwrap();
    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let status = Command::new(bin())
        .current_dir(&dir)
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-native-css",
            "--no-style-cache",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::inherit())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("/*SQ:true*/"),
        "expected the materialized-JSON marker (proves `-c` carried the \
         evaluated TS config, not the .ts path itself):\n{out}"
    );
}

/// #694: a directory input is delegated to a single `oxfmt` invocation that
/// covers the full supported set (not a hard-coded extension list), with
/// `.svelte` excluded for the in-process pass. We stand in a fake `oxfmt` that
/// logs the exact argv it received so we can assert the delegation contract:
/// the directory is passed through, `.svelte` is excluded, and unmatched
/// patterns don't error.
#[test]
fn directory_delegates_full_set_to_oxfmt_with_svelte_excluded() {
    let dir = tempdir();

    // Fake oxfmt: append its received argv (one per line) to $FAKE_OXFMT_LOG.
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(
        &fake,
        r#"const fs = require('node:fs');
fs.appendFileSync(process.env.FAKE_OXFMT_LOG, process.argv.slice(2).join('\n') + '\n');
"#,
    )
    .unwrap();

    let log = dir.join("argv.log");
    std::fs::write(&log, "").unwrap();
    // A `.svelte` file (in-process) plus a non-`.svelte` file so the dir isn't
    // svelte-only.
    std::fs::write(dir.join("a.svelte"), "<p>{x}</p>\n").unwrap();
    std::fs::write(dir.join("readme.md"), "# x\n").unwrap();

    let status = Command::new(bin())
        .args([
            dir.to_str().unwrap(),
            "--write",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .env("FAKE_OXFMT_LOG", log.to_str().unwrap())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let argv = std::fs::read_to_string(&log).unwrap();
    let args: Vec<&str> = argv.lines().collect();
    assert!(
        args.contains(&"!**/*.svelte"),
        "oxfmt should be told to exclude .svelte; argv:\n{argv}"
    );
    assert!(
        args.contains(&"--no-error-on-unmatched-pattern"),
        "oxfmt should not error on unmatched patterns; argv:\n{argv}"
    );
    assert!(
        args.contains(&dir.to_str().unwrap()),
        "the directory itself should be delegated to oxfmt; argv:\n{argv}"
    );
    // We must NOT enumerate individual non-svelte files — the directory is
    // handed off whole so oxfmt's own walker decides coverage.
    assert!(
        !args.iter().any(|a| a.ends_with("readme.md")),
        "individual files should not be enumerated; argv:\n{argv}"
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
        r#"const fs = require('node:fs');
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
"#,
    )
    .unwrap();
    fake
}

fn oxfmt_call_count(log: &std::path::Path) -> usize {
    std::fs::read_to_string(log)
        .map(|s| s.lines().count())
        .unwrap_or(0)
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

/// `.oxfmtrc` `ignorePatterns` must exclude matching `.svelte` files from the
/// in-process walk, mirroring what `oxfmt` does for the non-`.svelte` files it
/// walks. The dummy `--oxfmt-bin true` keeps the delegated directory pass a
/// no-op so the test needs no real `oxfmt`.
#[test]
fn check_excludes_svelte_via_oxfmtrc_ignore_patterns() {
    let dir = tempdir();
    std::fs::write(
        dir.join(".oxfmtrc.json"),
        r#"{ "ignorePatterns": ["ignored/**/*.svelte"] }"#,
    )
    .unwrap();
    std::fs::create_dir_all(dir.join("ignored")).unwrap();
    std::fs::create_dir_all(dir.join("kept")).unwrap();
    // Both files are unformatted, so only ignore rules decide who is reported.
    std::fs::write(
        dir.join("ignored").join("skip.svelte"),
        "<script>let x=1+2</script>",
    )
    .unwrap();
    std::fs::write(
        dir.join("kept").join("keep.svelte"),
        "<script>let x=1+2</script>",
    )
    .unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--check", ".", "--oxfmt-bin", "true"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();
    let stdout = String::from_utf8(out.stdout).unwrap();

    assert!(
        stdout.contains("keep.svelte"),
        "kept file must be checked:\n{stdout}"
    );
    assert!(
        !stdout.contains("skip.svelte"),
        "ignored file must be excluded:\n{stdout}"
    );
    assert_eq!(out.status.code(), Some(1));
}

/// `.prettierignore` (oxfmt's default formatter ignore file) must also exclude
/// matching `.svelte` files from the in-process walk.
#[test]
fn check_excludes_svelte_via_prettierignore() {
    let dir = tempdir();
    std::fs::write(dir.join(".prettierignore"), "ignored/\n").unwrap();
    std::fs::create_dir_all(dir.join("ignored")).unwrap();
    std::fs::create_dir_all(dir.join("kept")).unwrap();
    std::fs::write(
        dir.join("ignored").join("skip.svelte"),
        "<script>let x=1+2</script>",
    )
    .unwrap();
    std::fs::write(
        dir.join("kept").join("keep.svelte"),
        "<script>let x=1+2</script>",
    )
    .unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--check", ".", "--oxfmt-bin", "true"])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();
    let stdout = String::from_utf8(out.stdout).unwrap();

    assert!(
        stdout.contains("keep.svelte"),
        "kept file must be checked:\n{stdout}"
    );
    assert!(
        !stdout.contains("skip.svelte"),
        "ignored file must be excluded:\n{stdout}"
    );
    assert_eq!(out.status.code(), Some(1));
}

// ─── Batched `<style>` re-indentation + per-width parity (#1166) ──────────

/// An identity fake oxfmt: in `<style>` staging mode it leaves the (already
/// dedented) bodies untouched, and in the stdin per-block mode it copies stdin
/// to stdout verbatim. This isolates the *re-embedding* (re-indent + trailing
/// newline handling) the dispatcher does around oxfmt, so the batch (`--write`)
/// path and the single-block (`--stdin`) path must produce identical output.
const IDENTITY_OXFMT: &str = r#"const fs = require('node:fs');
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
"#;

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
        r#"const fs = require('node:fs');
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
"#,
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

// ─── native `.ts`/`.js` path ──────────────────────────────────────────────

/// A `.ts` file is formatted in-process via `oxc_formatter` — no `oxfmt`
/// subprocess needed (here `--oxfmt-bin true` is a no-op, proving the `.ts`
/// never reached oxfmt).
#[test]
fn native_ts_file_formatted_in_process() {
    let dir = tempdir();
    let file = dir.join("a.ts");
    std::fs::write(&file, "const x={a:1,b:2}\n").unwrap();

    let status = Command::new(bin())
        .args([file.to_str().unwrap(), "--write", "--oxfmt-bin", "true"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert_eq!(
        out, "const x = { a: 1, b: 2 };\n",
        "native TS not formatted:\n{out}"
    );
}

/// `--no-native-js` routes `.ts` back to oxfmt (the fake marker proves oxfmt
/// handled it instead of the in-process path).
#[test]
fn no_native_js_delegates_ts_to_oxfmt() {
    let dir = tempdir();
    let fake = dir.join("marker-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();
    let file = dir.join("a.ts");
    std::fs::write(&file, "const x = 1;\n").unwrap();

    // Pass the file explicitly: the fake oxfmt formats explicit file args (it
    // ignores plain directory inputs by design).
    let status = Command::new(bin())
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-native-js",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success());
    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("/*FMT*/"),
        "ts should be delegated to oxfmt:\n{out}"
    );
}

/// With the native path on, oxfmt must NOT touch `.ts` files: the fake marker
/// must be absent (the directory's `.ts` is handled in-process, excluded from
/// the oxfmt delegation).
#[test]
fn native_path_excludes_ts_from_oxfmt() {
    let dir = tempdir();
    let fake = dir.join("marker-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();
    let file = dir.join("a.ts");
    std::fs::write(&file, "const x = 1;\n").unwrap();

    let status = Command::new(bin())
        .args([
            dir.to_str().unwrap(),
            "--write",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success());
    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        !out.contains("/*FMT*/"),
        "native .ts must not be re-formatted by oxfmt:\n{out}"
    );
    assert_eq!(out, "const x = 1;\n");
}

/// `.oxfmtrc` `overrides` apply per-file: a wide line that overflows the base
/// print width stays flat when an override raises `printWidth` for that file.
#[test]
fn native_js_respects_override_print_width() {
    let dir = tempdir();
    std::fs::write(
        dir.join(".oxfmtrc.json"),
        r#"{ "printWidth": 80, "overrides": [{ "files": ["wide.ts"], "options": { "printWidth": 200 } }] }"#,
    )
    .unwrap();
    // ~106-col call that wraps at 80 but fits at 200.
    let long = "someFunction(argumentNumberOne, argumentNumberTwo, argumentNumberThree, argumentNumberFour, argumentFive);\n";
    std::fs::write(dir.join("wide.ts"), long).unwrap();
    std::fs::write(dir.join("narrow.ts"), long).unwrap();

    let status = Command::new(bin())
        .current_dir(&dir)
        .args([".", "--write", "--oxfmt-bin", "true"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success());

    let wide = std::fs::read_to_string(dir.join("wide.ts")).unwrap();
    let narrow = std::fs::read_to_string(dir.join("narrow.ts")).unwrap();
    assert!(
        !wide.contains("\n  "),
        "override printWidth 400 should keep `wide.ts` on one line:\n{wide}"
    );
    assert!(
        narrow.contains("\n  "),
        "base printWidth 80 should wrap `narrow.ts`:\n{narrow}"
    );
}

// ─── native JSON path ─────────────────────────────────────────────────────

/// A `.json` file is formatted in-process via `oxc_formatter_json` — `--oxfmt-bin
/// true` is a no-op, so the formatting proves it never reached oxfmt.
#[test]
fn native_json_formatted_in_process() {
    let dir = tempdir();
    let file = dir.join("data.json");
    std::fs::write(&file, "{\"b\":1,\"a\":[1,2,3]}").unwrap();

    let status = Command::new(bin())
        .args([file.to_str().unwrap(), "--write", "--oxfmt-bin", "true"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert_eq!(
        out, "{ \"b\": 1, \"a\": [1, 2, 3] }\n",
        "native JSON not formatted:\n{out}"
    );
}

/// `package.json` is delegated to `oxfmt` (it needs `sortPackageJson`, which
/// isn't in oxc), while a sibling `data.json` is formatted natively. A fake
/// oxfmt that marks the files it touches proves the split: `package.json` gets
/// the marker, `data.json` does not.
#[test]
fn package_json_delegated_to_oxfmt() {
    let dir = tempdir();
    let fake = dir.join("marker-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();

    let pkg = dir.join("package.json");
    let data = dir.join("data.json");
    std::fs::write(&pkg, "{ \"name\": \"x\" }\n").unwrap();
    std::fs::write(&data, "{\"b\":1}").unwrap();

    let status = Command::new(bin())
        .args([
            dir.to_str().unwrap(),
            "--write",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let pkg_out = std::fs::read_to_string(&pkg).unwrap();
    let data_out = std::fs::read_to_string(&data).unwrap();
    assert!(
        pkg_out.contains("/*FMT*/"),
        "package.json should be delegated to oxfmt:\n{pkg_out}"
    );
    assert!(
        !data_out.contains("/*FMT*/"),
        "data.json should be formatted natively (no oxfmt marker):\n{data_out}"
    );
    assert_eq!(data_out, "{ \"b\": 1 }\n", "data.json native output wrong");
}

// ─── native CSS path ──────────────────────────────────────────────────────

/// A standalone `.css` file is formatted in-process via `oxc_formatter_css` —
/// `--oxfmt-bin true` is a no-op, so the formatting proves it never reached oxfmt.
#[test]
fn native_css_file_formatted_in_process() {
    let dir = tempdir();
    let file = dir.join("a.css");
    std::fs::write(&file, ".foo{color:red;background:blue}\n").unwrap();

    let status = Command::new(bin())
        .args([file.to_str().unwrap(), "--write", "--oxfmt-bin", "true"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert_eq!(
        out, ".foo {\n  color: red;\n  background: blue;\n}\n",
        "native CSS not formatted:\n{out}"
    );
}

/// An embedded `<style>` block is formatted in-process by default — no oxfmt
/// subprocess. `--oxfmt-bin true` (inert) would leave the block untouched if the
/// callback still delegated, so the formatted output pins it to the native path.
#[test]
fn native_style_block_formatted_in_process() {
    let dir = tempdir();
    let file = dir.join("C.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let status = Command::new(bin())
        .args([file.to_str().unwrap(), "--write", "--oxfmt-bin", "true"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert_eq!(
        out, "<div></div>\n\n<style>\n  .a {\n    color: red;\n  }\n</style>\n",
        "native <style> not formatted:\n{out}"
    );
}

/// `--no-native-css` excludes `.css` from the in-process pass: the fake oxfmt
/// marker must be present, proving the file was delegated to oxfmt instead.
#[test]
fn no_native_css_delegates_css_to_oxfmt() {
    let dir = tempdir();
    let fake = dir.join("marker-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();
    let file = dir.join("a.css");
    std::fs::write(&file, ".a{color:red}\n").unwrap();

    let status = Command::new(bin())
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-native-css",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success());
    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("/*FMT*/"),
        "css should be delegated to oxfmt under --no-native-css:\n{out}"
    );
}

/// With native CSS on (default), oxfmt must NOT touch `.css` files in a directory
/// walk: the fake marker must be absent (the `.css` is handled in-process and
/// excluded from the oxfmt delegation).
#[test]
fn native_path_excludes_css_from_oxfmt() {
    let dir = tempdir();
    let fake = dir.join("marker-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();
    let file = dir.join("a.css");
    std::fs::write(&file, ".a {\n  color: red;\n}\n").unwrap();

    let status = Command::new(bin())
        .args([
            dir.to_str().unwrap(),
            "--write",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success());
    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        !out.contains("/*FMT*/"),
        "native .css must not be re-formatted by oxfmt:\n{out}"
    );
    assert_eq!(out, ".a {\n  color: red;\n}\n");
}

/// Standalone `.scss` on stdin formats in-process (nested rules flattened per
/// the SCSS dialect), with `--oxfmt-bin true` proving no subprocess is used.
#[test]
fn native_scss_stdin_formatted_in_process() {
    let (stdout, _stderr, code) = run_stdin(
        ".a{.b{color:red}}\n",
        &[
            "--stdin",
            "--stdin-filepath",
            "x.scss",
            "--oxfmt-bin",
            "true",
        ],
    );
    assert_eq!(code, 0);
    assert_eq!(
        stdout, ".a {\n  .b {\n    color: red;\n  }\n}\n",
        "native SCSS stdin output wrong:\n{stdout}"
    );
}

// ─── oxfmt daemon (#1179 follow-up) ───────────────────────────────────────

/// `node` on `$PATH`, or `None` to skip a daemon test on a host without it.
fn node_bin() -> Option<PathBuf> {
    let ok = Command::new("node")
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false);
    ok.then(|| PathBuf::from("node"))
}

/// Absolute path to the shipped daemon bundle, from this crate's manifest dir.
fn daemon_bundle() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../apps/npm/fmt/daemon/daemon.mjs")
}

/// Stand up a fake `oxfmt` npm package the daemon will `import()`: its `format()`
/// prefixes `/*DMON*/` so we can prove the daemon (not the spawn fallback)
/// formatted the block. `bin/oxfmt` is an inert stub — if the daemon path failed
/// and we fell back to spawning it, it would format nothing (no marker), so the
/// marker's presence pins the result to the daemon.
fn write_fake_oxfmt_pkg(dir: &std::path::Path) -> PathBuf {
    let pkg = dir.join("oxfmt");
    std::fs::create_dir_all(pkg.join("bin")).unwrap();
    std::fs::write(
        pkg.join("package.json"),
        r#"{ "name": "oxfmt", "type": "module", "exports": { ".": { "default": "./index.mjs" } }, "bin": { "oxfmt": "bin/oxfmt" } }"#,
    )
    .unwrap();
    std::fs::write(
        pkg.join("index.mjs"),
        "export async function format(fileName, content, options) {\n  return { code: '/*DMON*/' + content, errors: [] };\n}\n",
    )
    .unwrap();
    // Inert stub launcher (spawn fallback would run this and format nothing).
    std::fs::write(pkg.join("bin").join("oxfmt"), "process.exit(0)\n").unwrap();
    pkg.join("bin").join("oxfmt")
}

/// The daemon path formats inline `<style>` blocks: with `RSVELTE_FMT_NODE` +
/// the bundle set and a fake oxfmt package, the binary connects to (spawns) the
/// daemon and the fake `format()` marker lands in the file.
#[test]
fn daemon_formats_inline_style() {
    let Some(node) = node_bin() else {
        eprintln!("skipping: no node on PATH");
        return;
    };
    let dir = tempdir();
    let oxfmt_bin = write_fake_oxfmt_pkg(&dir);

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let status = Command::new(bin())
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-style-cache",
            "--no-native-css",
            "--oxfmt-bin",
            oxfmt_bin.to_str().unwrap(),
        ])
        .env("RSVELTE_FMT_NODE", &node)
        .env("RSVELTE_FMT_DAEMON_BUNDLE", daemon_bundle())
        .env_remove("RSVELTE_FMT_NO_DAEMON")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("/*DMON*/"),
        "daemon-formatted marker missing — daemon path not taken:\n{out}"
    );
    assert!(out.contains(".a"), "selector lost:\n{out}");
}

/// `RSVELTE_FMT_NO_DAEMON` forces the spawn path: with the inert stub oxfmt the
/// block is left unformatted (no daemon marker), proving the escape hatch
/// bypasses the daemon entirely.
#[test]
fn no_daemon_env_forces_spawn_path() {
    let Some(node) = node_bin() else {
        eprintln!("skipping: no node on PATH");
        return;
    };
    let dir = tempdir();
    let oxfmt_bin = write_fake_oxfmt_pkg(&dir);

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let status = Command::new(bin())
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-style-cache",
            "--no-native-css",
            "--oxfmt-bin",
            oxfmt_bin.to_str().unwrap(),
        ])
        .env("RSVELTE_FMT_NODE", &node)
        .env("RSVELTE_FMT_DAEMON_BUNDLE", daemon_bundle())
        .env("RSVELTE_FMT_NO_DAEMON", "1")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        !out.contains("/*DMON*/"),
        "daemon marker present — NO_DAEMON should have bypassed the daemon:\n{out}"
    );
}

// ─── native-direct install (runtime sidecar) ─────────────────────────────

/// When the binary is installed native-direct (the npm JS launcher replaced by
/// the platform binary), it has no `--oxfmt-bin` / `RSVELTE_FMT_NODE` from a
/// launcher. Instead it reads `rsvelte-fmt.runtime.json` next to itself for the
/// consumer's oxfmt launcher + Node. Copy the binary beside such a sidecar
/// (pointing oxfmt at a fake `.cjs`) and confirm `<style>` delegation still
/// reaches oxfmt — proving the sidecar drives resolution with no flags.
#[test]
fn runtime_sidecar_drives_oxfmt_resolution() {
    let dir = tempdir();

    // Copy the binary so `current_exe()` resolves next to our sidecar.
    let exe = dir.join("rsvelte-fmt");
    std::fs::copy(bin(), &exe).unwrap();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&exe, std::fs::Permissions::from_mode(0o755)).unwrap();
    }

    // Fake oxfmt (marks every CSS file) + a sidecar pointing at it. `node` is
    // the bare command so the binary runs the `.cjs` through `$PATH` node, the
    // same way the existing fake-oxfmt tests do.
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();
    let sidecar = dir.join("rsvelte-fmt.runtime.json");
    std::fs::write(
        &sidecar,
        format!(
            r#"{{ "node": "node", "oxfmtBin": {:?} }}"#,
            fake.to_str().unwrap()
        ),
    )
    .unwrap();

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    // No `--oxfmt-bin`, no `RSVELTE_FMT_NODE` — resolution must come from the
    // sidecar. Clear the env var in case the harness set it.
    let status = Command::new(&exe)
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-style-cache",
            "--no-native-css",
        ])
        .env_remove("RSVELTE_FMT_NODE")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("/*FMT*/"),
        "sidecar oxfmt was not used (no marker):\n{out}"
    );
    assert!(out.contains(".a"), "selector lost:\n{out}");
}

/// A user-supplied `--oxfmt-bin` must win over the sidecar (explicit override).
#[test]
fn explicit_oxfmt_bin_overrides_sidecar() {
    let dir = tempdir();
    let exe = dir.join("rsvelte-fmt");
    std::fs::copy(bin(), &exe).unwrap();
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        std::fs::set_permissions(&exe, std::fs::Permissions::from_mode(0o755)).unwrap();
    }

    // Sidecar points at an oxfmt that would CRASH if used (nonexistent path).
    let sidecar = dir.join("rsvelte-fmt.runtime.json");
    std::fs::write(
        &sidecar,
        r#"{ "node": "node", "oxfmtBin": "/nonexistent/should-not-run.cjs" }"#,
    )
    .unwrap();

    // Explicit --oxfmt-bin points at a working fake; it must take precedence.
    let fake = dir.join("real-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();

    let file = dir.join("c.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let status = Command::new(&exe)
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-style-cache",
            "--no-native-css",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .env_remove("RSVELTE_FMT_NODE")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("/*FMT*/"),
        "explicit --oxfmt-bin should have formatted via the working fake:\n{out}"
    );
}

/// `sortTailwindcss` with a stock `@import "tailwindcss";` stylesheet sorts the
/// static `class` attribute natively.
#[test]
fn sort_tailwindcss_default_config_sorts_classes() {
    let dir = tempdir();
    std::fs::write(dir.join("app.css"), "@import \"tailwindcss\";\n").unwrap();
    let cfg = dir.join(".oxfmtrc.json");
    std::fs::write(
        &cfg,
        r#"{ "sortTailwindcss": { "stylesheet": "./app.css" } }"#,
    )
    .unwrap();

    let (stdout, stderr, code) = run_stdin(
        "<div class=\"p-4 m-2 flex\"></div>\n",
        &[
            "--stdin",
            "--stdin-filepath",
            dir.join("x.svelte").to_str().unwrap(),
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0, "stderr: {stderr}");
    assert!(
        stdout.contains("class=\"m-2 flex p-4\""),
        "classes should be sorted:\n{stdout}"
    );
    assert!(
        !stderr.contains("warning"),
        "no warning expected for a default setup:\n{stderr}"
    );
}

/// A value with `{expr}` interpolation is not statically known, so it is left
/// untouched even with sorting on.
#[test]
fn sort_tailwindcss_leaves_dynamic_class_untouched() {
    let dir = tempdir();
    std::fs::write(dir.join("app.css"), "@import \"tailwindcss\";\n").unwrap();
    let cfg = dir.join(".oxfmtrc.json");
    std::fs::write(&cfg, r#"{ "sortTailwindcss": true }"#).unwrap();

    let (stdout, _stderr, code) = run_stdin(
        "<div class=\"p-4 m-2 {x} flex\"></div>\n",
        &[
            "--stdin",
            "--stdin-filepath",
            dir.join("x.svelte").to_str().unwrap(),
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0);
    assert!(
        stdout.contains("class=\"p-4 m-2 {x} flex\""),
        "interpolated class value must be left as-is:\n{stdout}"
    );
}

/// A custom stylesheet (here with a `@plugin`) is not reproducible natively, so
/// the CLI warns and leaves classes unsorted.
#[test]
fn sort_tailwindcss_custom_config_warns_and_skips() {
    let dir = tempdir();
    std::fs::write(
        dir.join("app.css"),
        "@import \"tailwindcss\";\n@plugin \"@tailwindcss/typography\";\n",
    )
    .unwrap();
    let cfg = dir.join(".oxfmtrc.json");
    std::fs::write(
        &cfg,
        r#"{ "sortTailwindcss": { "stylesheet": "./app.css" } }"#,
    )
    .unwrap();

    let (stdout, stderr, code) = run_stdin(
        "<div class=\"p-4 m-2 flex\"></div>\n",
        &[
            "--stdin",
            "--stdin-filepath",
            dir.join("x.svelte").to_str().unwrap(),
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0);
    assert!(
        stdout.contains("class=\"p-4 m-2 flex\""),
        "classes must be left unsorted for a custom setup:\n{stdout}"
    );
    assert!(
        stderr.contains("sortTailwindcss") && stderr.contains("left unapplied"),
        "expected a skip warning:\n{stderr}"
    );
}

/// A stand-in `oxfmt` that mirrors just the one behavior this file's no-match
/// tests need: real oxfmt only reports "Expected at least one target file…"
/// (exit 2) when `--no-error-on-unmatched-pattern` is *not* on its argv. Since
/// `rsvelte-fmt` always used to pass that flag unconditionally (masking a
/// genuinely empty tree as a false success), whether the flag is present is
/// exactly what proves the fix: it must be omitted once every in-process pass
/// (Svelte, native JS/JSON/CSS) also found nothing.
const NO_MATCH_ECHO_OXFMT: &str = r#"const argv = process.argv.slice(2);
if (!argv.includes('--no-error-on-unmatched-pattern')) {
  process.stderr.write('Expected at least one target file. All matched files may have been excluded by ignore rules.\n');
  process.exit(2);
}
"#;

/// An empty directory (no files at all, so not even `oxfmt`'s own delegated
/// share has a target) must exit like real `oxfmt` does when it hits "no
/// target file" unsuppressed — exit 2 with its exact message — not a false
/// success from the `--no-error-on-unmatched-pattern` flag `rsvelte-fmt`
/// always used to pass.
#[test]
fn empty_directory_exits_two_with_oxfmt_message() {
    // The fake oxfmt script lives next to (not inside) the target directory —
    // it's a `.cjs` file, so placing it inside would make the tree not
    // actually empty (the native-JS pass would pick it up as a real target).
    let holder = tempdir();
    let fake = holder.join("fake-oxfmt.cjs");
    std::fs::write(&fake, NO_MATCH_ECHO_OXFMT).unwrap();
    let dir = holder.join("empty");
    std::fs::create_dir(&dir).unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--oxfmt-bin", fake.to_str().unwrap()])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();

    assert_eq!(out.status.code(), Some(2), "empty directory must exit 2");
    assert!(out.stdout.is_empty(), "stdout:\n{:?}", out.stdout);
    assert_eq!(
        String::from_utf8(out.stderr).unwrap(),
        "Expected at least one target file. All matched files may have been excluded by ignore rules.\n",
    );
}

/// Same as `empty_directory_exits_two_with_oxfmt_message`, but with `--check`
/// — the no-match error takes priority over `--check`'s own "would reformat"
/// exit-1 convention, matching oxfmt (which also exits 2, not 1, here).
#[test]
fn empty_directory_check_exits_two_with_oxfmt_message() {
    let holder = tempdir();
    let fake = holder.join("fake-oxfmt.cjs");
    std::fs::write(&fake, NO_MATCH_ECHO_OXFMT).unwrap();
    let dir = holder.join("empty");
    std::fs::create_dir(&dir).unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--check", "--oxfmt-bin", fake.to_str().unwrap()])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();

    assert_eq!(
        out.status.code(),
        Some(2),
        "empty directory must exit 2 even under --check"
    );
    assert!(out.stdout.is_empty(), "stdout:\n{:?}", out.stdout);
    assert_eq!(
        String::from_utf8(out.stderr).unwrap(),
        "Expected at least one target file. All matched files may have been excluded by ignore rules.\n",
    );
}

/// A directory containing only a `.svelte` file legitimately leaves oxfmt's
/// own delegated share empty — that must stay a clean no-op (the
/// `--no-error-on-unmatched-pattern` flag still applied), not the no-match
/// error above. Regression guard for the `in_process_empty` gate added
/// alongside `empty_directory_exits_two_with_oxfmt_message`.
#[test]
fn svelte_only_directory_is_not_treated_as_no_match() {
    let dir = tempdir();
    let fake = dir.join("fake-oxfmt.cjs");
    std::fs::write(&fake, NO_MATCH_ECHO_OXFMT).unwrap();
    std::fs::write(dir.join("App.svelte"), "<script>let x=1+2</script>").unwrap();

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--oxfmt-bin", fake.to_str().unwrap()])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();

    assert!(
        out.status.success(),
        "svelte-only tree must still succeed: exit {:?}, stderr:\n{}",
        out.status.code(),
        String::from_utf8_lossy(&out.stderr)
    );
}

// ─── real-oxfmt no-match parity (#1636) ──────────────────────────────────
//
// The tests above exercise `rsvelte-fmt`'s own decision logic against a fake
// oxfmt; the tests below replay the same scenarios end-to-end against the
// real vendored `oxfmt` binary, since the whole point of this fix is exact
// exit-code/message parity with it. No-op (with a notice) when that binary
// isn't present/runnable, matching this crate's other real-oxfmt-dependent
// tests (see `svelte_dev_markdown.rs`).

fn real_oxfmt_bin() -> PathBuf {
    if let Ok(p) = std::env::var("OXFMT_BIN") {
        return PathBuf::from(p);
    }
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../node_modules/.bin/oxfmt")
}

fn real_oxfmt_runnable(oxfmt: &Path) -> bool {
    Command::new(oxfmt)
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false)
}

/// Runs `rsvelte-fmt <dir>` against the real `oxfmt` binary and asserts both
/// exit 2 and oxfmt's exact "no target file" message — the scenario is set up
/// by `setup` beforehand.
fn assert_real_oxfmt_no_match(setup: impl FnOnce(&Path)) {
    let oxfmt = real_oxfmt_bin();
    if !real_oxfmt_runnable(&oxfmt) {
        eprintln!(
            "[fmt-no-match] real oxfmt not runnable at {} (set OXFMT_BIN); skipping.",
            oxfmt.display()
        );
        return;
    }

    let dir = tempdir();
    setup(&dir);

    let out = Command::new(bin())
        .current_dir(&dir)
        .args(["--oxfmt-bin", oxfmt.to_str().unwrap()])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .unwrap();

    assert_eq!(
        out.status.code(),
        Some(2),
        "expected exit 2 against real oxfmt; stderr:\n{}",
        String::from_utf8_lossy(&out.stderr)
    );
    assert_eq!(
        String::from_utf8(out.stderr).unwrap(),
        "Expected at least one target file. All matched files may have been excluded by ignore rules.\n",
    );
}

/// Case A: a fully empty directory.
#[test]
fn real_oxfmt_empty_directory_is_no_match() {
    assert_real_oxfmt_no_match(|_dir| {});
}

/// Case E: an empty subdirectory only — no files anywhere in the tree.
#[test]
fn real_oxfmt_empty_subdirectory_only_is_no_match() {
    assert_real_oxfmt_no_match(|dir| {
        std::fs::create_dir(dir.join("sub")).unwrap();
    });
}

/// Case B: a `.js` file exists but is excluded via `.gitignore`.
#[test]
fn real_oxfmt_gitignored_js_is_no_match() {
    assert_real_oxfmt_no_match(|dir| {
        let status = Command::new("git")
            .arg("init")
            .arg("-q")
            .arg(dir)
            .status()
            .unwrap();
        assert!(status.success(), "git init failed");
        std::fs::write(dir.join(".gitignore"), "a.js\n").unwrap();
        std::fs::write(dir.join("a.js"), "const x=1\n").unwrap();
    });
}

/// Case C: a `.js` file exists but is excluded via `.prettierignore`.
#[test]
fn real_oxfmt_prettierignored_js_is_no_match() {
    assert_real_oxfmt_no_match(|dir| {
        std::fs::write(dir.join(".prettierignore"), "a.js\n").unwrap();
        std::fs::write(dir.join("a.js"), "const x=1\n").unwrap();
    });
}

/// Case D: only a `.txt` file, which no pass (native or oxfmt) formats.
#[test]
fn real_oxfmt_unsupported_extension_only_is_no_match() {
    assert_real_oxfmt_no_match(|dir| {
        std::fs::write(dir.join("note.txt"), "hello\n").unwrap();
    });
}

fn tempdir() -> PathBuf {
    let mut dir = std::env::temp_dir();
    dir.push(format!(
        "rsvelte_fmt_test_{}_{}",
        std::process::id(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_nanos(),
    ));
    std::fs::create_dir_all(&dir).unwrap();
    dir
}
