use std::process::{Command, Stdio};

use crate::common::{bin, run_stdin, tempdir};

/// #693: inline `<script>` formatting must honor the project `.oxfmtrc`.
/// The script body is formatted in-process (no `oxfmt` needed), so a config
/// with `singleQuote: true` should keep the string single-quoted instead of
/// flipping it to `oxc_formatter`'s double-quote default.
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

/// Without a config, the in-process default is `oxc_formatter`'s double quotes —
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
/// {...}` (`CommonJS`'s equivalent of an ESM default export) statically
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
const CONFIG_ECHO_OXFMT: &str = r"const fs = require('node:fs');
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
";

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
