//! Audit: for every fixture currently in the skip lists, run the same
//! compile-and-compare logic the compatibility report uses and fail when a
//! skipped fixture now passes. Run after every Svelte submodule bump so the
//! skip lists don't accumulate dead entries that hide real coverage.
//!
//! Run: `cargo test --release --test audit_skipped -- --nocapture`
//!
//! When this fails with `STALE SKIP ENTRIES`, remove the listed fixtures from
//! the `RUNTIME_*_SKIP_NAMES` / `HYDRATION_SKIP_NAMES` / `SSR_SKIP_NAMES`
//! arrays in `tests/common/mod.rs` (or from the per-category `skip_*` arrays
//! for parser / css / print).
//!
//! The runtime names come straight from those shared constants; the remaining
//! per-suite lists are parsed out of the sibling test sources rather than
//! duplicated here, so the audit cannot silently drift away from the lists it
//! polices.

mod common;

use std::fs;

use common::{
    HYDRATION_SKIP_NAMES, RUNTIME_LEGACY_SKIP_NAMES, RUNTIME_RUNES_SKIP_NAMES, SSR_SKIP_NAMES,
    canonicalize_css, compare_js, ensure_fixtures_exist, load_fixture_output,
    runtime_fixture_options, svelte_path,
};
use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{
    CompileOptions, ExperimentalOptions, GenerateMode, ParseOptions, compile, compile_module,
    compiler::CssMode, convert_to_legacy, parse,
};

fn parser_normalize_json(json: &str) -> serde_json::Value {
    let mut value: serde_json::Value =
        serde_json::from_str(json).unwrap_or(serde_json::Value::Null);
    remove_internal_fields(&mut value);
    value
}

fn remove_internal_fields(value: &mut serde_json::Value) {
    match value {
        serde_json::Value::Object(map) => {
            map.remove("metadata");
            fn remove_character_from_loc(loc: &mut serde_json::Value) {
                if let serde_json::Value::Object(loc_map) = loc {
                    if let Some(serde_json::Value::Object(start)) = loc_map.get_mut("start") {
                        start.remove("character");
                    }
                    if let Some(serde_json::Value::Object(end)) = loc_map.get_mut("end") {
                        end.remove("character");
                    }
                }
            }
            if let Some(loc) = map.get_mut("loc") {
                remove_character_from_loc(loc);
            }
            if let Some(name_loc) = map.get_mut("name_loc") {
                remove_character_from_loc(name_loc);
            }
            for (_, v) in map.iter_mut() {
                remove_internal_fields(v);
            }
        }
        serde_json::Value::Array(arr) => {
            for v in arr.iter_mut() {
                remove_internal_fields(v);
            }
        }
        _ => {}
    }
}

/// Skip entries that already pass under this audit but have not been unskipped
/// yet. Shrink-only in both directions: a new stale entry fails, and an entry
/// that stops applying must be dropped from the list. Empty is the goal state —
/// a fixture that passes belongs off the skip list, not on this ratchet.
const KNOWN_STALE_SKIPS: &[(&str, &str)] = &[];

/// Sibling test sources are embedded so the audited names come from the real
/// skip lists instead of a hand-copied duplicate that silently rots.
const PRINT_SRC: &str = include_str!("print.rs");
const CSS_SRC: &str = include_str!("css.rs");
const REPORT_SRC: &str = include_str!("../../rsvelte_devtools/tests/compatibility_report.rs");

/// Returns the string literals of the `&[…]` literal that follows `marker`.
/// Panics when the marker is gone — a renamed skip list must fail loudly here
/// rather than turn the audit into a no-op.
fn skip_list(src: &str, what: &str, marker: &str) -> Vec<String> {
    let head = src
        .find(marker)
        .unwrap_or_else(|| panic!("{what}: `{marker}` not found — skip list renamed or moved?"));
    let rest = &src[head + marker.len()..];
    let open = rest
        .find("&[")
        .unwrap_or_else(|| panic!("{what}: no `&[` after `{marker}`"));
    // Entries are documented with prose that contains quotes and brackets, so
    // line comments go before anything else is located.
    let code: String = rest[open + 2..]
        .lines()
        .map(|line| line.split("//").next().unwrap_or(""))
        .collect::<Vec<_>>()
        .join("\n");
    let close = code
        .find(']')
        .unwrap_or_else(|| panic!("{what}: unterminated array after `{marker}`"));

    let mut names = Vec::new();
    for line in code[..close].lines() {
        let mut rest = line;
        while let Some(start) = rest.find('"') {
            let after = &rest[start + 1..];
            let Some(end) = after.find('"') else { break };
            names.push(after[..end].to_string());
            rest = &after[end + 1..];
        }
    }
    names
}

#[derive(Debug, Default)]
struct Outcome {
    client_pass: Option<bool>,
    server_pass: Option<bool>,
    error: Option<String>,
    /// The fixture (or its expected output) is gone — the skip entry cannot be
    /// verified at all, which is itself a stale-skip signal.
    missing: bool,
}

impl Outcome {
    fn passed(&self) -> bool {
        self.error.is_none() && self.client_pass.unwrap_or(true) && self.server_pass.unwrap_or(true)
    }

    fn summary(&self) -> String {
        if let Some(e) = &self.error {
            return format!("ERROR: {}", e);
        }
        let mut parts = Vec::new();
        if let Some(c) = self.client_pass {
            parts.push(format!("client={}", if c { "OK" } else { "FAIL" }));
        }
        if let Some(s) = self.server_pass {
            parts.push(format!("server={}", if s { "OK" } else { "FAIL" }));
        }
        if parts.is_empty() {
            return "no-expected-output".to_string();
        }
        parts.join(" ")
    }
}

fn audit_runtime(category: &str, name: &str) -> Outcome {
    let mut out = Outcome::default();

    let input_path = svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples")
        .join(name)
        .join("main.svelte");

    let Ok(input) = fs::read_to_string(&input_path) else {
        out.error = Some(format!("input not found: {:?}", input_path));
        out.missing = true;
        return out;
    };

    let fixture_options = runtime_fixture_options(category, name);

    let expected_client = load_fixture_output(category, name, "client.js");
    let expected_server = load_fixture_output(category, name, "server.js");
    if expected_client.is_none() && expected_server.is_none() {
        out.error = Some("no expected client/server output".to_string());
        out.missing = true;
        return out;
    }

    if let Some(expected) = &expected_client {
        let options = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            dev: fixture_options.dev,
            experimental: ExperimentalOptions {
                r#async: fixture_options.r#async,
            },
            hmr: fixture_options.hmr,
            accessors: fixture_options.accessors,
            ..Default::default()
        };
        match std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| compile(&input, options))) {
            Ok(Ok(result)) => out.client_pass = Some(compare_js(&result.js.code, expected)),
            Ok(Err(e)) => {
                out.error = Some(format!("client compile error: {}", e));
                out.client_pass = Some(false);
            }
            Err(_) => {
                out.error = Some("client compile panic".to_string());
                out.client_pass = Some(false);
            }
        }
    }

    if let Some(expected) = &expected_server {
        let options = CompileOptions {
            generate: GenerateMode::Server,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            experimental: ExperimentalOptions {
                r#async: fixture_options.r#async,
            },
            hmr: fixture_options.hmr,
            ..Default::default()
        };
        match std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| compile(&input, options))) {
            Ok(Ok(result)) => out.server_pass = Some(compare_js(&result.js.code, expected)),
            Ok(Err(e)) => {
                if out.error.is_none() {
                    out.error = Some(format!("server compile error: {}", e));
                }
                out.server_pass = Some(false);
            }
            Err(_) => {
                if out.error.is_none() {
                    out.error = Some("server compile panic".to_string());
                }
                out.server_pass = Some(false);
            }
        }
    }

    out
}

fn audit_parser(name: &str, modern: bool) -> Outcome {
    let mut out = Outcome::default();
    let category = if modern {
        "parser-modern"
    } else {
        "parser-legacy"
    };
    let input_path = svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples")
        .join(name)
        .join("input.svelte");
    let output_path = svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples")
        .join(name)
        .join("output.json");

    let Ok(input) = fs::read_to_string(&input_path) else {
        out.error = Some("input not found".to_string());
        out.missing = true;
        return out;
    };
    let Ok(expected) = fs::read_to_string(&output_path) else {
        out.error = Some("output.json not found".to_string());
        out.missing = true;
        return out;
    };

    let loose = name.contains("loose");
    let opts = ParseOptions {
        modern: true,
        loose,
        ..Default::default()
    };

    let parse_result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        parse(&input, &oxc_allocator::Allocator::default(), opts)
    }));
    match parse_result {
        Ok(Ok(ast)) => {
            let actual_json = if modern {
                with_serialize_arena(&ast.arena, || serde_json::to_string_pretty(&ast).unwrap())
            } else {
                let legacy_ast = convert_to_legacy(&input, ast);
                serde_json::to_string_pretty(&legacy_ast).unwrap()
            };
            let a = parser_normalize_json(&actual_json);
            let b = parser_normalize_json(&expected);
            out.client_pass = Some(a == b);
        }
        Ok(Err(e)) => {
            out.error = Some(format!("parse error: {}", e));
            out.client_pass = Some(false);
        }
        Err(_) => {
            out.error = Some("parse panic".to_string());
            out.client_pass = Some(false);
        }
    }
    out
}

fn audit_css(name: &str) -> Outcome {
    let mut out = Outcome::default();
    let input_path = svelte_path()
        .join("packages/svelte/tests/css/samples")
        .join(name)
        .join("input.svelte");
    let Ok(input) = fs::read_to_string(&input_path) else {
        out.error = Some("input not found".to_string());
        out.missing = true;
        return out;
    };
    let expected = load_fixture_output("css", name, "css.css");
    let Some(expected) = expected else {
        out.error = Some("no expected css".to_string());
        out.missing = true;
        return out;
    };

    let (tx, rx) = std::sync::mpsc::channel();
    let input_clone = input.clone();
    std::thread::spawn(move || {
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            let opts = CompileOptions {
                generate: GenerateMode::Client,
                filename: Some("input.svelte".to_string()),
                css: CssMode::External,
                ..Default::default()
            };
            compile(&input_clone, opts)
        }));
        let _ = tx.send(result);
    });

    match rx.recv_timeout(std::time::Duration::from_secs(10)) {
        Ok(Ok(Ok(result))) => {
            let actual = result.css.map(|c| c.code).unwrap_or_default();
            out.client_pass = Some(canonicalize_css(&actual) == canonicalize_css(&expected));
        }
        Ok(Ok(Err(e))) => {
            out.error = Some(format!("compile error: {}", e));
            out.client_pass = Some(false);
        }
        Ok(Err(_)) => {
            out.error = Some("panic".to_string());
            out.client_pass = Some(false);
        }
        Err(_) => {
            out.error = Some("timed out after 10s".to_string());
            out.client_pass = Some(false);
        }
    }
    out
}

fn audit_print(name: &str) -> Outcome {
    use rsvelte_core::compiler::print::print_with_source;

    let mut out = Outcome::default();
    let input_path = svelte_path()
        .join("packages/svelte/tests/print/samples")
        .join(name)
        .join("input.svelte");
    let expected_path = svelte_path()
        .join("packages/svelte/tests/print/samples")
        .join(name)
        .join("output.svelte");
    let Ok(input) = fs::read_to_string(&input_path) else {
        out.error = Some("input not found".to_string());
        out.missing = true;
        return out;
    };
    let Ok(expected) = fs::read_to_string(&expected_path) else {
        out.error = Some("output.svelte not found".to_string());
        out.missing = true;
        return out;
    };

    let parse_opts = ParseOptions {
        modern: true,
        ..Default::default()
    };
    let parse_result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        parse(&input, &oxc_allocator::Allocator::default(), parse_opts)
    }));
    match parse_result {
        Ok(Ok(ast)) => match print_with_source(&ast, None, Some(&input)) {
            Ok(actual) => {
                let normalize = |s: &str| {
                    let trimmed: Vec<String> =
                        s.lines().map(|l| l.trim_end().to_string()).collect();
                    let mut out = trimmed.join("\n");
                    if !out.ends_with('\n') {
                        out.push('\n');
                    }
                    out
                };
                out.client_pass = Some(normalize(&actual.code) == normalize(&expected));
            }
            Err(e) => {
                out.error = Some(format!("print error: {:?}", e));
                out.client_pass = Some(false);
            }
        },
        Ok(Err(e)) => {
            out.error = Some(format!("parse error: {}", e));
            out.client_pass = Some(false);
        }
        Err(_) => {
            out.error = Some("panic".to_string());
            out.client_pass = Some(false);
        }
    }
    out
}

#[test]
fn audit_skipped_fixtures() {
    let _ = compile_module;
    ensure_fixtures_exist();

    // The migrate fixtures (out of scope) and validator's `_config.js` opt-out
    // are not skip lists and stay out of the audit.
    // The runtime lists are shared constants, so they are used directly — a
    // rename breaks the build instead of silently emptying the audit.
    let mut runtime_skipped: Vec<(String, String)> = Vec::new();
    for (list, category) in [
        (RUNTIME_RUNES_SKIP_NAMES, "runtime-runes"),
        (RUNTIME_LEGACY_SKIP_NAMES, "runtime-legacy"),
        (HYDRATION_SKIP_NAMES, "hydration"),
        (SSR_SKIP_NAMES, "server-side-rendering"),
    ] {
        for name in list {
            runtime_skipped.push((category.to_string(), (*name).to_string()));
        }
    }

    // The parser skip list is a `if modern { … } else { … }` expression.
    const PARSER_MARKER: &str = "skip_tests: &[&str] = if modern {";
    let parser_modern_skipped = skip_list(
        REPORT_SRC,
        "rsvelte_devtools/tests/compatibility_report.rs",
        PARSER_MARKER,
    );
    let else_branch = &REPORT_SRC[REPORT_SRC.find(PARSER_MARKER).expect("parser skip list")..];
    let parser_legacy_skipped = skip_list(
        else_branch,
        "rsvelte_devtools/tests/compatibility_report.rs",
        "} else {",
    );
    let mut css_skipped = skip_list(CSS_SRC, "tests/css.rs", "CSS_SKIP_NAMES: &[&str] = ");
    for name in skip_list(
        REPORT_SRC,
        "rsvelte_devtools/tests/compatibility_report.rs",
        "skip_css: &[&str] = ",
    ) {
        if !css_skipped.contains(&name) {
            css_skipped.push(name);
        }
    }
    let print_skipped = skip_list(PRINT_SRC, "tests/print.rs", "PRINT_SKIP_NAMES: &[&str] = ");

    let mut now_passing: Vec<(String, String)> = Vec::new();
    let mut still_failing: Vec<(String, String, String)> = Vec::new();
    let mut unverifiable: Vec<(String, String, String)> = Vec::new();

    let mut record = |category: &str, name: &str, outcome: Outcome| {
        if outcome.missing {
            unverifiable.push((category.to_string(), name.to_string(), outcome.summary()));
        } else if outcome.passed() {
            now_passing.push((category.to_string(), name.to_string()));
        } else {
            still_failing.push((category.to_string(), name.to_string(), outcome.summary()));
        }
    };

    for (category, name) in &runtime_skipped {
        record(category, name, audit_runtime(category, name));
    }
    for name in &parser_legacy_skipped {
        record("parser-legacy", name, audit_parser(name, false));
    }
    for name in &parser_modern_skipped {
        record("parser-modern", name, audit_parser(name, true));
    }
    for name in &css_skipped {
        record("css", name, audit_css(name));
    }
    for name in &print_skipped {
        record("print", name, audit_print(name));
    }

    println!(
        "\n=== SKIP AUDIT: NOW PASSING ({} fixtures) ===",
        now_passing.len()
    );
    for (cat, name) in &now_passing {
        println!("  PASS  {}/{}", cat, name);
    }
    println!(
        "\n=== SKIP AUDIT: STILL FAILING ({} fixtures) ===",
        still_failing.len()
    );
    for (cat, name, why) in &still_failing {
        println!("  FAIL  {}/{}  ({})", cat, name, why);
    }

    assert!(
        unverifiable.is_empty(),
        "\n{} skip entries could not be verified — the fixture or its expected \
         output is gone, so the skip is stale (or `pnpm run generate-fixtures` \
         is out of date):\n{}",
        unverifiable.len(),
        unverifiable
            .iter()
            .map(|(cat, name, why)| format!("  - {cat}/{name}  ({why})"))
            .collect::<Vec<_>>()
            .join("\n"),
    );

    let new_stale: Vec<&(String, String)> = now_passing
        .iter()
        .filter(|(cat, name)| {
            !KNOWN_STALE_SKIPS
                .iter()
                .any(|(c, n)| *c == cat && *n == name)
        })
        .collect();
    assert!(
        new_stale.is_empty(),
        "\n{} STALE SKIP ENTRIES — these fixtures pass but are still skipped, \
         so they contribute no coverage. Remove them from the skip lists in \
         tests/runtime.rs, tests/css.rs, tests/print.rs and \
         rsvelte_devtools/tests/compatibility_report.rs:\n{}",
        new_stale.len(),
        new_stale
            .iter()
            .map(|(cat, name)| format!("  - {cat}/{name}"))
            .collect::<Vec<_>>()
            .join("\n"),
    );

    let dead_ratchet: Vec<&(&str, &str)> = KNOWN_STALE_SKIPS
        .iter()
        .filter(|(cat, name)| !now_passing.iter().any(|(c, n)| c == cat && n == name))
        .collect();
    assert!(
        dead_ratchet.is_empty(),
        "\n{} KNOWN_STALE_SKIPS entries no longer apply (unskipped, or failing \
         again) — drop them from the list:\n{}",
        dead_ratchet.len(),
        dead_ratchet
            .iter()
            .map(|(cat, name)| format!("  - {cat}/{name}"))
            .collect::<Vec<_>>()
            .join("\n"),
    );
}
