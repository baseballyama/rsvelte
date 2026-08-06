use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

#[cfg(unix)]
use crate::common::{real_oxfmt_bin, real_oxfmt_runnable};
use crate::common::{run_stdin, run_stdin_in, tempdir};

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

// ─── sortTailwindcss JS sidecar (custom config) ────────────────────────────
//
// These gate on a directory that resolves both `tailwindcss` and
// `prettier-plugin-tailwindcss` — set `RSVELTE_FMT_TW_TEST_DIR` to one (e.g. a
// throwaway `npm i tailwindcss prettier-plugin-tailwindcss@<insiders>` project),
// and `OXFMT_BIN` to a real oxfmt. Absent either, they no-op, matching the
// other real-oxfmt-dependent tests. The oracle is real `oxfmt` sorting the same
// `.svelte`, so a pass is byte-for-byte parity with the plugin oxfmt bundles.

fn repo_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../..")
}

fn sidecar_script() -> PathBuf {
    repo_root().join("apps/npm/fmt/lib/tailwind-sort.mjs")
}

/// A directory whose `node_modules` resolves both Tailwind packages, or `None`.
fn tw_test_dir() -> Option<PathBuf> {
    let has = |dir: &Path| {
        dir.join("node_modules/tailwindcss/package.json").is_file()
            && dir
                .join("node_modules/prettier-plugin-tailwindcss/package.json")
                .is_file()
    };
    if let Ok(d) = std::env::var("RSVELTE_FMT_TW_TEST_DIR") {
        let d = PathBuf::from(d);
        if has(&d) {
            return Some(d);
        }
    }
    None
}

fn node_runnable() -> bool {
    let ok = Command::new("node")
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map(|s| s.success())
        .unwrap_or(false);
    // Only a job that promised Node may fail on its absence.
    assert!(
        ok || std::env::var_os("RSVELTE_REQUIRE_PREREQS").is_none(),
        "no `node` on $PATH in a job that declares RSVELTE_REQUIRE_PREREQS — the Tailwind sidecar \
         assertions would be silently skipped."
    );
    ok
}

/// Build a fixture project (custom v4 stylesheet + `node_modules` symlinked from
/// the resolved Tailwind env) and return `(dir, sidecar_in_dir, oxfmt)`. The
/// sidecar is copied into the fixture so Node resolves the plugin from there.
#[cfg(unix)]
fn tw_fixture(css: &str) -> Option<(PathBuf, PathBuf, PathBuf)> {
    let tw_dir = tw_test_dir()?;
    let oxfmt = real_oxfmt_bin();
    if !real_oxfmt_runnable(&oxfmt) || !node_runnable() || !sidecar_script().is_file() {
        return None;
    }
    let dir = tempdir();
    std::os::unix::fs::symlink(tw_dir.join("node_modules"), dir.join("node_modules")).unwrap();
    std::fs::create_dir_all(dir.join("src")).unwrap();
    std::fs::write(dir.join("src/app.css"), css).unwrap();
    let sidecar = dir.join("tailwind-sort.mjs");
    std::fs::copy(sidecar_script(), &sidecar).unwrap();
    Some((dir, sidecar, oxfmt))
}

/// Format `svelte_src` with the real `oxfmt` (`svelte: true` + `sortTailwindcss`)
/// and return its output — the parity oracle.
#[cfg(unix)]
fn oxfmt_oracle(dir: &Path, oxfmt: &Path, svelte_src: &str) -> String {
    let file = dir.join("src/Oracle.svelte");
    std::fs::write(&file, svelte_src).unwrap();
    let cfg = dir.join("oxfmt.oracle.json");
    std::fs::write(
        &cfg,
        r#"{ "svelte": true, "sortTailwindcss": { "stylesheet": "./src/app.css" } }"#,
    )
    .unwrap();
    let status = Command::new(oxfmt)
        .current_dir(dir)
        .args([
            "--write",
            "--config",
            cfg.to_str().unwrap(),
            file.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "oxfmt oracle failed");
    std::fs::read_to_string(&file).unwrap()
}

/// `strategy: "auto"` (the default) sorts a custom `@theme`/`@utility` config
/// through the JS sidecar, byte-identical to the oxfmt oracle.
#[cfg(unix)]
#[test]
fn sort_tailwindcss_custom_config_matches_oxfmt_via_js() {
    let css = "@import \"tailwindcss\";\n@theme {\n  --color-brand: #1a2b3c;\n}\n@utility tab-4 {\n  tab-size: 4;\n}\n";
    let Some((dir, sidecar, oxfmt)) = tw_fixture(css) else {
        eprintln!("[tw-js] no Tailwind env / oxfmt; skipping.");
        return;
    };
    let svelte_src = "<div class=\"text-brand p-4 tab-4 flex m-2 bg-brand\"></div>\n";
    let oracle = oxfmt_oracle(&dir, &oxfmt, svelte_src);

    let cfg = dir.join("rsvelte.oxfmtrc.json");
    std::fs::write(
        &cfg,
        r#"{ "sortTailwindcss": { "stylesheet": "./src/app.css" } }"#,
    )
    .unwrap();
    let (stdout, stderr, code) = run_stdin_in(
        svelte_src,
        &dir,
        &[("RSVELTE_FMT_TAILWIND_SIDECAR", sidecar.as_path())],
        &[
            "--stdin",
            "--stdin-filepath",
            dir.join("src/Foo.svelte").to_str().unwrap(),
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0, "stderr: {stderr}");
    assert!(!stderr.contains("warning"), "unexpected warning:\n{stderr}");
    assert_eq!(stdout, oracle, "must match the oxfmt oracle byte-for-byte");
}

/// `strategy: "js"` opts even a default `@import "tailwindcss";` config into the
/// JS oracle (so the native sorter's few edge cases can be bypassed).
#[cfg(unix)]
#[test]
fn sort_tailwindcss_strategy_js_forces_oracle_on_default() {
    let Some((dir, sidecar, oxfmt)) = tw_fixture("@import \"tailwindcss\";\n") else {
        eprintln!("[tw-js] no Tailwind env / oxfmt; skipping.");
        return;
    };
    let svelte_src = "<div class=\"p-4 m-2 flex\"></div>\n";
    let oracle = oxfmt_oracle(&dir, &oxfmt, svelte_src);

    let cfg = dir.join("rsvelte.oxfmtrc.json");
    std::fs::write(
        &cfg,
        r#"{ "sortTailwindcss": { "stylesheet": "./src/app.css", "strategy": "js" } }"#,
    )
    .unwrap();
    let (stdout, stderr, code) = run_stdin_in(
        svelte_src,
        &dir,
        &[("RSVELTE_FMT_TAILWIND_SIDECAR", sidecar.as_path())],
        &[
            "--stdin",
            "--stdin-filepath",
            dir.join("src/Foo.svelte").to_str().unwrap(),
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0, "stderr: {stderr}");
    assert_eq!(stdout, oracle, "strategy:js must match the oxfmt oracle");
}

/// `strategy: "native"` never uses JS: a custom config warns and leaves classes
/// unsorted even when a sidecar is available.
#[test]
fn sort_tailwindcss_strategy_native_skips_custom() {
    let dir = tempdir();
    std::fs::write(
        dir.join("app.css"),
        "@import \"tailwindcss\";\n@plugin \"@tailwindcss/typography\";\n",
    )
    .unwrap();
    let cfg = dir.join(".oxfmtrc.json");
    std::fs::write(
        &cfg,
        r#"{ "sortTailwindcss": { "stylesheet": "./app.css", "strategy": "native" } }"#,
    )
    .unwrap();

    let (stdout, stderr, code) = run_stdin_in(
        "<div class=\"p-4 m-2 flex\"></div>\n",
        &dir,
        &[("RSVELTE_FMT_TAILWIND_SIDECAR", sidecar_script().as_path())],
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
        "native strategy must not sort a custom config:\n{stdout}"
    );
    assert!(
        stderr.contains("left unapplied") && stderr.contains("native"),
        "expected a native-strategy skip warning:\n{stderr}"
    );
}

/// When a sidecar is present but the plugin can't be resolved from it, the run
/// warns once and leaves classes unsorted — never a wrong reorder or a crash.
/// The sidecar is copied into the temp dir (no ancestor `node_modules` with the
/// plugin), so the import reliably fails.
#[test]
fn sort_tailwindcss_js_plugin_unresolvable_falls_back() {
    if !node_runnable() || !sidecar_script().is_file() {
        eprintln!("[tw-js] no node / sidecar; skipping.");
        return;
    }
    let dir = tempdir();
    let sidecar = dir.join("tailwind-sort.mjs");
    std::fs::copy(sidecar_script(), &sidecar).unwrap();
    std::fs::write(
        dir.join("app.css"),
        "@import \"tailwindcss\";\n@theme {\n  --color-brand: #123;\n}\n",
    )
    .unwrap();
    let cfg = dir.join(".oxfmtrc.json");
    std::fs::write(
        &cfg,
        r#"{ "sortTailwindcss": { "stylesheet": "./app.css" } }"#,
    )
    .unwrap();

    let (stdout, stderr, code) = run_stdin_in(
        "<div class=\"p-4 m-2 flex\"></div>\n",
        &dir,
        &[("RSVELTE_FMT_TAILWIND_SIDECAR", sidecar.as_path())],
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
        "classes must be left unsorted on a sidecar failure:\n{stdout}"
    );
    assert!(
        stderr.contains("left unapplied"),
        "expected a fallback warning:\n{stderr}"
    );
}

// ─── sortTailwindcss functions (cn()/cva() call arguments) ─────────────────

/// `functions` sorts Tailwind classes inside a configured wrapper call in a
/// `<script>` body and in a `class={…}` mustache, on the native default-config
/// path (no Node needed). An unmatched function, a `class:` directive, and a
/// standalone `{expr}` are left untouched.
#[test]
fn sort_tailwindcss_functions_native() {
    let dir = tempdir();
    std::fs::write(dir.join("app.css"), "@import \"tailwindcss\";\n").unwrap();
    let cfg = dir.join(".oxfmtrc.json");
    std::fs::write(
        &cfg,
        r#"{ "sortTailwindcss": { "stylesheet": "./app.css", "functions": ["cn"] } }"#,
    )
    .unwrap();

    let src = "<script>\n  const a = cn(\"p-4 m-2 flex\");\n  const b = notcn(\"p-4 m-2 flex\");\n</script>\n\n<div class={cn(\"p-4 m-2 flex\")}></div>\n<div class:foo={cn(\"p-4 m-2 flex\")}></div>\n<p>{cn(\"p-4 m-2 flex\")}</p>\n";
    let (stdout, stderr, code) = run_stdin(
        src,
        &[
            "--stdin",
            "--stdin-filepath",
            dir.join("x.svelte").to_str().unwrap(),
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0, "stderr: {stderr}");
    assert!(!stderr.contains("warning"), "unexpected warning:\n{stderr}");
    // Matched call in the script and in the class mustache are sorted.
    assert!(
        stdout.contains("const a = cn(\"m-2 flex p-4\");"),
        "{stdout}"
    );
    assert!(stdout.contains("class={cn(\"m-2 flex p-4\")}"), "{stdout}");
    // Unmatched call, `class:` directive, and standalone `{expr}` are untouched.
    assert!(
        stdout.contains("const b = notcn(\"p-4 m-2 flex\");"),
        "{stdout}"
    );
    assert!(
        stdout.contains("class:foo={cn(\"p-4 m-2 flex\")}"),
        "{stdout}"
    );
    assert!(stdout.contains("<p>{cn(\"p-4 m-2 flex\")}</p>"), "{stdout}");
}

/// Without `functions`, a `<script>` `cn(...)` call is left alone, but a
/// `class={…}` mustache is still sorted (the mustache sort is not
/// function-gated — it mirrors oxfmt's `transformSvelte`).
#[test]
fn sort_tailwindcss_no_functions_leaves_script_calls() {
    let dir = tempdir();
    std::fs::write(dir.join("app.css"), "@import \"tailwindcss\";\n").unwrap();
    let cfg = dir.join(".oxfmtrc.json");
    std::fs::write(
        &cfg,
        r#"{ "sortTailwindcss": { "stylesheet": "./app.css" } }"#,
    )
    .unwrap();

    let src = "<script>\n  const a = cn(\"p-4 m-2 flex\");\n</script>\n\n<div class={cn(\"p-4 m-2 flex\")}></div>\n";
    let (stdout, stderr, code) = run_stdin(
        src,
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
        stdout.contains("const a = cn(\"p-4 m-2 flex\");"),
        "{stdout}"
    );
    assert!(stdout.contains("class={cn(\"m-2 flex p-4\")}"), "{stdout}");
}

/// A parity oracle that lets the caller supply the full `sortTailwindcss` config
/// (so `functions` can be injected), unlike `oxfmt_oracle`.
#[cfg(unix)]
fn oxfmt_oracle_cfg(dir: &Path, oxfmt: &Path, svelte_src: &str, sort_cfg: &str) -> String {
    let file = dir.join("src/Oracle.svelte");
    std::fs::write(&file, svelte_src).unwrap();
    let cfg = dir.join("oxfmt.oracle.json");
    std::fs::write(
        &cfg,
        format!(r#"{{ "svelte": true, "sortTailwindcss": {sort_cfg} }}"#),
    )
    .unwrap();
    let status = Command::new(oxfmt)
        .current_dir(dir)
        .args([
            "--write",
            "--config",
            cfg.to_str().unwrap(),
            file.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "oxfmt oracle failed");
    std::fs::read_to_string(&file).unwrap()
}

/// `functions` on the native default-config path is byte-identical to the oxfmt
/// oracle, for both a `<script>` call and a `class={…}` mustache.
#[cfg(unix)]
#[test]
fn sort_tailwindcss_functions_native_matches_oxfmt() {
    let Some((dir, _sidecar, oxfmt)) = tw_fixture("@import \"tailwindcss\";\n") else {
        eprintln!("[tw-js] no Tailwind env / oxfmt; skipping.");
        return;
    };
    let svelte_src = "<script>\n  const a = cn(\"text-lg p-8 m-4\");\n  const b = cn(`text-lg p-8 m-4 ${x}`);\n  const c = cn(`text-lg p-8 m-4${x}flex m-2 p-4`);\n</script>\n\n<div class={cn(\"text-lg p-8 m-4\")}></div>\n<div class={`text-lg p-8 m-4 ${x} flex m-2 p-4`}></div>\n<p>{cn(\"text-lg p-8 m-4\")}</p>\n";
    let sort_cfg = r#"{ "stylesheet": "./src/app.css", "functions": ["cn"] }"#;
    let oracle = oxfmt_oracle_cfg(&dir, &oxfmt, svelte_src, sort_cfg);

    let cfg = dir.join("rsvelte.oxfmtrc.json");
    std::fs::write(&cfg, format!(r#"{{ "sortTailwindcss": {sort_cfg} }}"#)).unwrap();
    let (stdout, stderr, code) = run_stdin_in(
        svelte_src,
        &dir,
        &[],
        &[
            "--stdin",
            "--stdin-filepath",
            dir.join("src/Foo.svelte").to_str().unwrap(),
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0, "stderr: {stderr}");
    assert!(!stderr.contains("warning"), "unexpected warning:\n{stderr}");
    assert_eq!(stdout, oracle, "must match the oxfmt oracle byte-for-byte");
}

/// `functions` through the JS sidecar (a custom `@theme`/`@utility` config) is
/// byte-identical to the oxfmt oracle in a `<script>` call and a mustache.
#[cfg(unix)]
#[test]
fn sort_tailwindcss_functions_js_matches_oxfmt() {
    let css = "@import \"tailwindcss\";\n@theme {\n  --color-brand: #1a2b3c;\n}\n@utility tab-4 {\n  tab-size: 4;\n}\n";
    let Some((dir, sidecar, oxfmt)) = tw_fixture(css) else {
        eprintln!("[tw-js] no Tailwind env / oxfmt; skipping.");
        return;
    };
    let svelte_src = "<script>\n  const a = cn(\"text-brand p-4 tab-4 flex m-2\");\n  const b = cn(`text-brand p-4 tab-4 ${x} flex m-2`);\n</script>\n\n<div class={cn(\"text-brand p-4 tab-4 flex m-2\")}></div>\n<div class={`text-brand p-4 tab-4 ${x} flex m-2`}></div>\n";
    let sort_cfg = r#"{ "stylesheet": "./src/app.css", "functions": ["cn"] }"#;
    let oracle = oxfmt_oracle_cfg(&dir, &oxfmt, svelte_src, sort_cfg);

    let cfg = dir.join("rsvelte.oxfmtrc.json");
    std::fs::write(&cfg, format!(r#"{{ "sortTailwindcss": {sort_cfg} }}"#)).unwrap();
    let (stdout, stderr, code) = run_stdin_in(
        svelte_src,
        &dir,
        &[("RSVELTE_FMT_TAILWIND_SIDECAR", sidecar.as_path())],
        &[
            "--stdin",
            "--stdin-filepath",
            dir.join("src/Foo.svelte").to_str().unwrap(),
            "--config",
            cfg.to_str().unwrap(),
        ],
    );
    assert_eq!(code, 0, "stderr: {stderr}");
    assert!(!stderr.contains("warning"), "unexpected warning:\n{stderr}");
    assert_eq!(stdout, oracle, "must match the oxfmt oracle byte-for-byte");
}
