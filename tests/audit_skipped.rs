//! Audit: for every fixture currently in the skip lists, run the same
//! compile-and-compare logic the compatibility report uses and report which
//! fixtures now pass. Run after every Svelte submodule bump to spot
//! "previously-broken but now passing" fixtures so the skip lists don't
//! accumulate dead entries.
//!
//! Run: `cargo test --release --test audit_skipped -- --nocapture`
//!
//! When this prints `NOW PASSING (N fixtures)` with N > 0, remove the listed
//! fixtures from `tests/compatibility_report.rs::runtime_skip_tests` and from
//! the matching `RUNTIME_*_SKIP_NAMES` / `HYDRATION_SKIP_NAMES` arrays in
//! `tests/runtime.rs` (or from the per-category `skip_*` arrays for parser /
//! css / print / svelte2tsx).

mod common;

use std::fs;

use common::{
    canonicalize_css, compare_js, ensure_fixtures_exist, load_fixture_output, svelte_path,
};
use svelte_compiler_rust::ast::arena::with_serialize_arena;
use svelte_compiler_rust::{
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

#[derive(Debug, Default)]
struct Outcome {
    client_pass: Option<bool>,
    server_pass: Option<bool>,
    error: Option<String>,
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
        return out;
    };

    let config_path = svelte_path()
        .join("packages/svelte/tests")
        .join(category)
        .join("samples")
        .join(name)
        .join("_config.js");

    let mut config_has_async = false;
    let mut config_has_hmr = false;
    if let Ok(config) = fs::read_to_string(&config_path) {
        let without_skip = config
            .replace("skip_no_async", "")
            .replace("skip_async", "");
        config_has_async = without_skip.contains("async: true");
        config_has_hmr = config.contains("hmr: true");
    }

    let expected_client = load_fixture_output(category, name, "client.js");
    let expected_server = load_fixture_output(category, name, "server.js");
    if expected_client.is_none() && expected_server.is_none() {
        out.error = Some("no expected client/server output".to_string());
        return out;
    }

    let is_runtime_runes = category == "runtime-runes";
    let use_async = is_runtime_runes || config_has_async;

    let is_legacy = category == "runtime-legacy";
    let use_accessors = if is_legacy {
        fs::read_to_string(&config_path)
            .map(|c| !c.contains("accessors: false") && !c.contains("accessors:false"))
            .unwrap_or(true)
    } else {
        false
    };

    if let Some(expected) = &expected_client {
        let options = CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            css: CssMode::External,
            experimental: ExperimentalOptions { r#async: use_async },
            hmr: config_has_hmr,
            accessors: use_accessors,
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
            experimental: ExperimentalOptions { r#async: use_async },
            hmr: config_has_hmr,
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
        return out;
    };
    let Ok(expected) = fs::read_to_string(&output_path) else {
        out.error = Some("output.json not found".to_string());
        return out;
    };

    let loose = name.contains("loose");
    let opts = ParseOptions {
        modern: true,
        loose,
        ..Default::default()
    };

    let parse_result =
        std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| parse(&input, opts)));
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
        return out;
    };
    let expected = load_fixture_output("css", name, "css.css");
    let Some(expected) = expected else {
        out.error = Some("no expected css".to_string());
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
    use svelte_compiler_rust::compiler::print::print_with_source;

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
        return out;
    };
    let Ok(expected) = fs::read_to_string(&expected_path) else {
        out.error = Some("output.svelte not found".to_string());
        return out;
    };

    let parse_opts = ParseOptions {
        modern: true,
        ..Default::default()
    };
    let parse_result =
        std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| parse(&input, parse_opts)));
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

    // Names lifted from the skip lists in tests/compatibility_report.rs and
    // tests/runtime.rs (excluding the always-out-of-scope migrate fixtures
    // and validator's `_config.js` opt-out). svelte2tsx `expected.error.json`
    // fixtures are now driven by `tests/common/svelte2tsx.rs` directly — they
    // execute as regular runs in the compatibility report rather than being
    // skipped — so they don't need to appear here.
    let runtime_skipped: &[(&str, &str)] = &[
        ("runtime-runes", "async-derived-indirect"),
        ("runtime-runes", "async-later-sync-overlaps"),
        ("runtime-runes", "async-style-after-await"),
        ("runtime-runes", "async-overlap-multiple-1"),
        ("runtime-runes", "async-overlap-multiple-2"),
        ("runtime-runes", "async-overlap-multiple-3"),
        ("runtime-runes", "async-overlap-multiple-4"),
        ("runtime-runes", "async-overlap-multiple-5"),
        ("runtime-runes", "async-overlap-multiple-6"),
        ("runtime-runes", "async-overlap-multiple-7"),
        ("runtime-runes", "async-if-block-unskip"),
        ("runtime-runes", "async-derived-const-blocker"),
        ("runtime-runes", "async-reactivity-loss-no-false-positive-1"),
        ("runtime-runes", "async-reactivity-loss-no-false-positive-2"),
        ("runtime-runes", "async-reactivity-loss-no-false-positive-3"),
        ("runtime-runes", "async-reactivity-loss-async-after-sync"),
        ("runtime-runes", "async-flushsync-in-effect"),
        ("runtime-runes", "async-stale-derived-4"),
        ("runtime-runes", "async-eager-block"),
        ("runtime-runes", "async-dont-rebase-new-batch-1"),
        ("runtime-runes", "async-dont-rebase-new-batch-2"),
        ("runtime-runes", "async-dont-rebase-new-batch-3"),
        ("runtime-runes", "async-dont-rebase-new-batch-4"),
        ("runtime-runes", "async-debug-awaited-expression"),
        ("runtime-runes", "async-state-updates-microtask-separated"),
        ("runtime-runes", "async-await-block-2"),
        ("runtime-runes", "async-duplicate-dependencies"),
        ("runtime-runes", "async-boundary-nav-race"),
        ("runtime-runes", "async-if-else"),
    ];

    let parser_legacy_skipped = &["javascript-comments"];
    let parser_modern_skipped: &[&str] = &[];
    let css_skipped: &[&str] = &[];
    let print_skipped = &["css-keyframes-percent"];

    let mut now_passing: Vec<(String, String)> = Vec::new();
    let mut still_failing: Vec<(String, String, String)> = Vec::new();

    for (cat, name) in runtime_skipped {
        let outcome = audit_runtime(cat, name);
        if outcome.passed() {
            now_passing.push((cat.to_string(), name.to_string()));
        } else {
            still_failing.push((cat.to_string(), name.to_string(), outcome.summary()));
        }
    }
    for name in parser_legacy_skipped {
        let outcome = audit_parser(name, false);
        if outcome.passed() {
            now_passing.push(("parser-legacy".to_string(), name.to_string()));
        } else {
            still_failing.push((
                "parser-legacy".to_string(),
                name.to_string(),
                outcome.summary(),
            ));
        }
    }
    for name in parser_modern_skipped {
        let outcome = audit_parser(name, true);
        if outcome.passed() {
            now_passing.push(("parser-modern".to_string(), name.to_string()));
        } else {
            still_failing.push((
                "parser-modern".to_string(),
                name.to_string(),
                outcome.summary(),
            ));
        }
    }
    for name in css_skipped {
        let outcome = audit_css(name);
        if outcome.passed() {
            now_passing.push(("css".to_string(), name.to_string()));
        } else {
            still_failing.push(("css".to_string(), name.to_string(), outcome.summary()));
        }
    }
    for name in print_skipped {
        let outcome = audit_print(name);
        if outcome.passed() {
            now_passing.push(("print".to_string(), name.to_string()));
        } else {
            still_failing.push(("print".to_string(), name.to_string(), outcome.summary()));
        }
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
}
