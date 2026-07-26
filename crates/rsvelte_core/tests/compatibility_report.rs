//! Compatibility report generator.
//!
//! This test generates a comprehensive compatibility report comparing
//! the Rust implementation against the official Svelte compiler.
//!
//! Run: cargo test --test compatibility_report -- --nocapture
//!
//! The report is saved to: fixtures/{commit}/compatibility-report.json

mod common;

use std::fs;

use common::{
    CategoryResult, CompatibilityReport, FixtureCoverage, SampleDetails, SampleResult, SkipReason,
    TestCategory, TestStatus, canonicalize_css, check_validator_error, compare_js,
    ensure_fixtures_exist, error_code_matches, fixtures_path, get_fixture_samples,
    get_svelte_test_samples, load_expected_validator_error, load_fixture_output, read_fixture_file,
    runtime_fixture_options, runtime_skip_names, svelte_path, validator_error_result,
    write_actual_output,
};
use rsvelte_core::{
    CompileOptions, ExperimentalOptions, GenerateMode, ModuleCompileOptions, ParseOptions, compile,
    compile_module, compiler::CssMode, convert_to_legacy, parse,
};

/// Grow-only per-category fixture floors, measured against the pinned Svelte
/// submodule. Every discovered sample must end up either compared or recorded
/// as a justified skip; these floors additionally catch a category quietly
/// shrinking. Raise them when upstream adds samples; lower one only together
/// with a documented skip-list entry, never to make CI green.
fn min_fixtures(category: &str) -> usize {
    match category {
        "parser-modern" => 27,
        "parser-legacy" => 81,
        "snapshot" => 30,
        "css" => 181,
        "validator" => 333,
        "compiler-errors" => 145,
        // The runtime floors sit below the sample count by exactly the
        // documented `runtime_skip_names` entries for the category.
        "runtime-runes" => 1007,
        "runtime-legacy" => 1206,
        "runtime-browser" => 32,
        "hydration" => 79,
        "server-side-rendering" => 99,
        "sourcemaps" => 29,
        "print" => 43,
        "preprocess" => 19,
        // Out-of-scope categories are reported as fully skipped.
        "migrate" => 0,
        other => panic!("no fixture floor recorded for category `{other}`"),
    }
}

// ============================================================================
// Parser Tests
// ============================================================================

fn run_parser_tests(category: TestCategory, modern: bool) -> CategoryResult {
    let svelte_dir = category.svelte_dir();
    let samples = get_svelte_test_samples(svelte_dir);
    let mut result = CategoryResult::new(svelte_dir);
    let mut coverage = FixtureCoverage::new(svelte_dir, samples.len());

    // Tests to skip for parser-legacy and parser-modern.
    //
    // `javascript-comments` is a long-standing acorn-vs-OXC comment-attachment
    // mismatch that has never been worth fixing — OXC drops standalone
    // comment statements that acorn surfaces via `leadingComments` /
    // `trailingComments` attachment.
    let skip_tests: &[&str] = if !modern {
        &["javascript-comments", "implicitly-closed-li-block"]
    } else {
        &[]
    };

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        // Check if should skip
        if skip_tests.contains(&name.as_str()) {
            let reason = if name == "javascript-comments" {
                "Known incompatibility with OXC parser"
            } else if name == "implicitly-closed-li-block" {
                "Upstream skips it (skip: true) — the official compiler errors block_unexpected_close; output.json is stale"
            } else {
                "Comments-in-tags (Svelte 5.53.0) not yet ported"
            };
            result.add_sample(SampleResult {
                name,
                status: TestStatus::Skipped,
                error: None,
                skip_reason: Some(reason.to_string()),
                details: None,
            });
            continue;
        }

        let input_path = sample_dir.join("input.svelte");
        let output_path = sample_dir.join("output.json");

        let input = match read_fixture_file(&input_path) {
            Some(s) => s,
            None => {
                coverage.skipped(&name, SkipReason::MissingInput("input.svelte"));
                continue;
            }
        };

        let expected = match read_fixture_file(&output_path) {
            Some(s) => s,
            None => {
                coverage.skipped(&name, SkipReason::MissingInput("output.json"));
                continue;
            }
        };

        let loose = name.contains("loose");

        let options = ParseOptions {
            modern: true,
            loose,
            // The AST-output comparison expects `leadingComments`/`trailingComments`
            // preserved on nodes, exactly as `tests/parser_fixtures.rs` does.
            capture_comments: true,
            ..Default::default()
        };

        match parse(&input, &oxc_allocator::Allocator::default(), options) {
            Ok(ast) => {
                let actual_json = if modern {
                    rsvelte_core::ast::arena::with_serialize_arena(&ast.arena, || {
                        serde_json::to_string_pretty(&ast).unwrap_or_default()
                    })
                } else {
                    // `convert_to_legacy` consumes the AST and installs the
                    // serialize arena itself.
                    let legacy_ast = convert_to_legacy(&input, ast);
                    serde_json::to_string_pretty(&legacy_ast).unwrap_or_default()
                };

                let mut actual_normalized = normalize_parser_json(&actual_json);
                let expected_normalized = normalize_parser_json(&expected);

                // Match upstream test logic: only compare the top-level
                // `comments` array when the fixture explicitly snapshots it.
                if modern
                    && let serde_json::Value::Object(expected_obj) = &expected_normalized
                    && !expected_obj.contains_key("comments")
                    && let serde_json::Value::Object(actual_obj) = &mut actual_normalized
                {
                    actual_obj.remove("comments");
                }

                if actual_normalized == expected_normalized {
                    result.add_sample(SampleResult {
                        name,
                        status: TestStatus::Passed,
                        error: None,
                        skip_reason: None,
                        details: None,
                    });
                } else {
                    // Write actual output for debugging
                    let actual_path = sample_dir.join("_actual.json");
                    let _ = fs::write(&actual_path, &actual_json);

                    result.add_sample(SampleResult {
                        name,
                        status: TestStatus::Failed,
                        error: Some("AST mismatch".to_string()),
                        skip_reason: None,
                        details: None,
                    });
                }
            }
            Err(e) => {
                result.add_sample(SampleResult {
                    name,
                    status: TestStatus::Error,
                    error: Some(format!("Parse error: {:?}", e)),
                    skip_reason: None,
                    details: None,
                });
            }
        }
    }

    assert_coverage(&mut coverage, &result, svelte_dir);
    result
}

/// Fold a category's tallied results into its coverage ledger and enforce it.
fn assert_coverage(coverage: &mut FixtureCoverage, result: &CategoryResult, category: &str) {
    coverage.tally(
        result.stats.total - result.stats.skipped,
        result.stats.skipped,
    );
    coverage.assert(min_fixtures(category));
}

fn normalize_parser_json(json: &str) -> serde_json::Value {
    let mut value: serde_json::Value =
        serde_json::from_str(json).unwrap_or(serde_json::Value::Null);
    remove_parser_internal_fields(&mut value);
    value
}

fn remove_parser_internal_fields(value: &mut serde_json::Value) {
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
                remove_parser_internal_fields(v);
            }
        }
        serde_json::Value::Array(arr) => {
            for v in arr.iter_mut() {
                remove_parser_internal_fields(v);
            }
        }
        _ => {}
    }
}

// ============================================================================
// Compiler Snapshot Tests
// ============================================================================

fn run_snapshot_tests() -> CategoryResult {
    ensure_fixtures_exist();

    let samples = get_fixture_samples("snapshot");
    let mut result = CategoryResult::new("snapshot");
    let mut coverage = FixtureCoverage::new("snapshot", samples.len());

    // Snapshot fixtures intentionally skipped. These exercise codegen clusters
    // tracked elsewhere in this file (and in tests/runtime.rs):
    //   * `async-in-derived` — `$derived(await ...)` plus nested `@const`
    //     grouping in the same fragment; the runtime-side derived grouping
    //     pass is tracked separately. The 5.55.3 `@const` blocker port
    //     (this PR) flipped `async-const`.
    let skip_snapshot: &[&str] = &["async-in-derived"];

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        if skip_snapshot.contains(&name.as_str()) {
            result.add_sample(SampleResult {
                name,
                status: TestStatus::Skipped,
                error: None,
                skip_reason: Some(
                    "SSR static-attr inlining (Svelte 5.55.9) not yet ported".to_string(),
                ),
                details: None,
            });
            continue;
        }

        // Load input from Svelte test suite
        let input_path = svelte_path()
            .join("packages/svelte/tests/snapshot/samples")
            .join(&name)
            .join("index.svelte");

        // Check for unsupported options
        let config_path = svelte_path()
            .join("packages/svelte/tests/snapshot/samples")
            .join(&name)
            .join("_config.js");

        let (snapshot_has_async, snapshot_has_hmr) =
            if let Ok(config) = fs::read_to_string(&config_path) {
                (config.contains("async: true"), config.contains("hmr: true"))
            } else {
                (false, false)
            };

        let input = match read_fixture_file(&input_path) {
            Some(s) => s,
            None => {
                coverage.skipped(&name, SkipReason::MissingInput("index.svelte"));
                continue;
            }
        };

        let expected_client = load_fixture_output("snapshot", &name, "client.js");
        let expected_server = load_fixture_output("snapshot", &name, "server.js");

        // No generated output at all: the official compiler emitted none.
        if expected_client.is_none() && expected_server.is_none() {
            coverage.skipped(&name, SkipReason::Justified);
            continue;
        }

        let mut details = SampleDetails::default();
        let mut client_ok = true;
        let mut server_ok = true;
        let mut error_msg = None;

        // Use sample-dir-aware path so component name derives from parent directory
        // (e.g. `hello-world/index.svelte` → `Hello_world`), matching the official
        // compiler's get_component_name behavior in tests.
        let snapshot_filename = format!("{}/index.svelte", name);

        // Test client
        if let Some(expected) = &expected_client {
            let options = CompileOptions {
                generate: GenerateMode::Client,
                filename: Some(snapshot_filename.clone()),
                experimental: ExperimentalOptions {
                    r#async: snapshot_has_async,
                },
                hmr: snapshot_has_hmr,
                ..Default::default()
            };

            match compile(&input, options) {
                Ok(compile_result) => {
                    write_actual_output("snapshot", &name, "client.js", &compile_result.js.code);

                    if compare_js(&compile_result.js.code, expected) {
                        details.client_passed = Some(true);
                    } else {
                        details.client_passed = Some(false);
                        client_ok = false;
                        error_msg = Some("Client JS mismatch".to_string());
                    }
                }
                Err(e) => {
                    details.client_passed = Some(false);
                    client_ok = false;
                    error_msg = Some(format!("Client compilation error: {}", e));
                }
            }
        }

        // Test server
        if let Some(expected) = &expected_server {
            let options = CompileOptions {
                generate: GenerateMode::Server,
                filename: Some(snapshot_filename.clone()),
                experimental: ExperimentalOptions {
                    r#async: snapshot_has_async,
                },
                hmr: snapshot_has_hmr,
                ..Default::default()
            };

            match compile(&input, options) {
                Ok(compile_result) => {
                    write_actual_output("snapshot", &name, "server.js", &compile_result.js.code);

                    if compare_js(&compile_result.js.code, expected) {
                        details.server_passed = Some(true);
                    } else {
                        details.server_passed = Some(false);
                        server_ok = false;
                        if error_msg.is_none() {
                            error_msg = Some("Server JS mismatch".to_string());
                        }
                    }
                }
                Err(e) => {
                    details.server_passed = Some(false);
                    server_ok = false;
                    if error_msg.is_none() {
                        error_msg = Some(format!("Server compilation error: {}", e));
                    }
                }
            }
        }

        let status = if client_ok && server_ok {
            TestStatus::Passed
        } else {
            TestStatus::Failed
        };

        result.add_sample(SampleResult {
            name,
            status,
            error: error_msg,
            skip_reason: None,
            details: Some(details),
        });
    }

    assert_coverage(&mut coverage, &result, "snapshot");
    result
}

// ============================================================================
// CSS Tests
// ============================================================================

fn run_css_tests() -> CategoryResult {
    ensure_fixtures_exist();

    let samples = get_fixture_samples("css");
    let mut result = CategoryResult::new("css");
    let mut coverage = FixtureCoverage::new("css", samples.len());

    // CSS samples that exercise pruning/scoping edge cases rsvelte doesn't
    // fully match upstream on yet. Empty for now — the previous
    // `css-prune-edge-cases` skip (Svelte 5.53.7, upstream `0965028d3`)
    // was lifted once the deep descendant-chain prune walker became
    // generalised and `:where(...)` started scoping its inner selector list
    // like `:is()`/`:has()`/`:not()`.
    let skip_css: &[&str] = &[];

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        if skip_css.contains(&name.as_str()) {
            result.add_sample(SampleResult {
                name,
                status: TestStatus::Skipped,
                error: None,
                skip_reason: Some(
                    "CSS pruning edge cases (Svelte 5.53.7) not yet ported".to_string(),
                ),
                details: None,
            });
            continue;
        }

        let input_path = svelte_path()
            .join("packages/svelte/tests/css/samples")
            .join(&name)
            .join("input.svelte");

        let input = match read_fixture_file(&input_path) {
            Some(s) => s,
            None => {
                coverage.skipped(&name, SkipReason::MissingInput("input.svelte"));
                continue;
            }
        };

        let expected_css = load_fixture_output("css", &name, "css.css");

        // Use timeout for CSS compilation
        let (tx, rx) = std::sync::mpsc::channel();
        let input_clone = input.clone();
        let name_clone = name.clone();

        std::thread::spawn(move || {
            let compile_result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                let options = CompileOptions {
                    generate: GenerateMode::Client,
                    filename: Some("input.svelte".to_string()),
                    css: CssMode::External,
                    ..Default::default()
                };
                compile(&input_clone, options)
            }));
            let _ = tx.send((name_clone, compile_result));
        });

        let compile_result = match rx.recv_timeout(std::time::Duration::from_secs(5)) {
            Ok((_, r)) => r,
            Err(_) => {
                result.add_sample(SampleResult {
                    name,
                    status: TestStatus::Error,
                    error: Some("Test timed out after 5 seconds".to_string()),
                    skip_reason: None,
                    details: None,
                });
                continue;
            }
        };

        match compile_result {
            Err(_) => {
                result.add_sample(SampleResult {
                    name,
                    status: TestStatus::Error,
                    error: Some("Compilation panicked".to_string()),
                    skip_reason: None,
                    details: None,
                });
            }
            Ok(compile_result) => match compile_result {
                Ok(output) => {
                    let actual_css = output.css.map(|c| c.code).unwrap_or_default();
                    write_actual_output("css", &name, "css.css", &actual_css);

                    let mut details = SampleDetails::default();

                    if let Some(expected) = &expected_css {
                        let matches = canonicalize_css(&actual_css) == canonicalize_css(expected);
                        details.css_passed = Some(matches);

                        if matches {
                            result.add_sample(SampleResult {
                                name,
                                status: TestStatus::Passed,
                                error: None,
                                skip_reason: None,
                                details: Some(details),
                            });
                        } else {
                            result.add_sample(SampleResult {
                                name,
                                status: TestStatus::Failed,
                                error: Some("CSS mismatch".to_string()),
                                skip_reason: None,
                                details: Some(details),
                            });
                        }
                    } else {
                        // No expected output, just check compilation
                        result.add_sample(SampleResult {
                            name,
                            status: TestStatus::Passed,
                            error: None,
                            skip_reason: None,
                            details: None,
                        });
                    }
                }
                Err(e) => {
                    result.add_sample(SampleResult {
                        name,
                        status: TestStatus::Error,
                        error: Some(format!("Compilation error: {:?}", e)),
                        skip_reason: None,
                        details: None,
                    });
                }
            },
        }
    }

    assert_coverage(&mut coverage, &result, "css");
    result
}

// ============================================================================
// Validator Tests
// ============================================================================

fn run_validator_tests() -> CategoryResult {
    let samples = get_svelte_test_samples("validator");
    let mut result = CategoryResult::new("validator");
    let mut coverage = FixtureCoverage::new("validator", samples.len());
    let warning_code_re = regex::Regex::new(r"'(\w+)'").unwrap();

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let svelte_path = sample_dir.join("input.svelte");
        let module_path = sample_dir.join("input.svelte.js");

        // Skip tests that have `skip: true` in _config.js
        let config_path = sample_dir.join("_config.js");
        if config_path.exists()
            && let Ok(config) = fs::read_to_string(&config_path)
            && (config.contains("skip: true") || config.contains("skip:true"))
        {
            result.add_sample(SampleResult {
                name,
                status: TestStatus::Skipped,
                error: None,
                skip_reason: Some("Skipped via _config.js".to_string()),
                details: None,
            });
            continue;
        }

        let is_module_test = module_path.exists() && !svelte_path.exists();

        if !svelte_path.exists() && !module_path.exists() {
            coverage.skipped(&name, SkipReason::MissingInput("input.svelte(.js)"));
            continue;
        }

        let input_file = if is_module_test {
            &module_path
        } else {
            &svelte_path
        };
        let input = match read_fixture_file(input_file) {
            Some(s) => s,
            None => {
                coverage.skipped(
                    &name,
                    SkipReason::MissingInput("readable input.svelte(.js)"),
                );
                continue;
            }
        };

        // Load expected warnings/errors
        let warnings_path = sample_dir.join("warnings.json");
        let errors_path = sample_dir.join("errors.json");

        let expected_warnings: Vec<serde_json::Value> = if warnings_path.exists() {
            let content = read_fixture_file(&warnings_path).unwrap_or_default();
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            Vec::new()
        };

        let expected_error = load_expected_validator_error(&errors_path)
            .unwrap_or_else(|e| panic!("{}: {e}", sample_dir.display()));

        // Parse compileOptions and warningFilter from _config.js
        let mut warning_filter_codes: Vec<String> = Vec::new();
        let mut config_runes: Option<bool> = None;
        let mut config_custom_element = false;

        if config_path.exists()
            && let Ok(config) = fs::read_to_string(&config_path)
        {
            // Extract warningFilter codes
            if config.contains("warningFilter") {
                // Extract warning codes from patterns like:
                // !['code1', 'code2'].includes(warning.code)
                for cap in warning_code_re.captures_iter(&config) {
                    let code = cap[1].to_string();
                    // Skip non-warning-code strings like common JS identifiers
                    if code.contains("a11y")
                        || code.contains("css")
                        || code.contains("state")
                        || code.starts_with("unused")
                        || code == "test"
                    {
                        warning_filter_codes.push(code);
                    }
                }
            }

            // Extract runes option from compileOptions
            if config.contains("runes: false") || config.contains("runes:false") {
                config_runes = Some(false);
            } else if config.contains("runes: true") || config.contains("runes:true") {
                config_runes = Some(true);
            }

            // Extract customElement option from compileOptions
            if config.contains("customElement: true") || config.contains("customElement:true") {
                config_custom_element = true;
            }
        }

        let compile_result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            if is_module_test {
                let options = ModuleCompileOptions {
                    generate: GenerateMode::Client,
                    filename: Some(format!("{}/input.svelte.js", name)),
                    ..Default::default()
                };
                compile_module(&input, options)
            } else {
                let options = CompileOptions {
                    generate: GenerateMode::Client,
                    filename: Some(format!("{}/input.svelte", name)),
                    runes: config_runes,
                    custom_element: config_custom_element,
                    ..Default::default()
                };
                compile(&input, options)
            }
        }));

        match compile_result {
            Err(_) => {
                result.add_sample(SampleResult {
                    name,
                    status: TestStatus::Error,
                    error: Some("Compilation panicked".to_string()),
                    skip_reason: None,
                    details: None,
                });
            }
            Ok(compile_result) => match compile_result {
                Ok(output) => {
                    if expected_error.is_some() {
                        result.add_sample(SampleResult {
                            name,
                            status: TestStatus::Failed,
                            error: Some("Expected error but compilation succeeded".to_string()),
                            skip_reason: None,
                            details: None,
                        });
                    } else {
                        // Apply warningFilter if present - filter out warnings whose code
                        // is in the exclusion list
                        let actual_count = if !warning_filter_codes.is_empty() {
                            output
                                .warnings
                                .iter()
                                .filter(|w| !warning_filter_codes.contains(&w.code))
                                .count()
                        } else {
                            output.warnings.len()
                        };
                        let warnings_match = actual_count == expected_warnings.len();
                        let details = SampleDetails {
                            warnings_matched: Some(warnings_match),
                            ..Default::default()
                        };

                        if warnings_match {
                            result.add_sample(SampleResult {
                                name,
                                status: TestStatus::Passed,
                                error: None,
                                skip_reason: None,
                                details: Some(details),
                            });
                        } else {
                            result.add_sample(SampleResult {
                                name,
                                status: TestStatus::Failed,
                                error: Some(format!(
                                    "Expected {} warnings, got {}",
                                    expected_warnings.len(),
                                    actual_count
                                )),
                                skip_reason: None,
                                details: Some(details),
                            });
                        }
                    }
                }
                Err(e) => {
                    if let Some(expected) = &expected_error {
                        let verdict = check_validator_error(expected, &e);
                        let outcome = validator_error_result(&name, verdict);
                        let details = SampleDetails {
                            errors_matched: Some(outcome.is_ok()),
                            ..Default::default()
                        };

                        match outcome {
                            Ok(()) => result.add_sample(SampleResult {
                                name,
                                status: TestStatus::Passed,
                                error: None,
                                skip_reason: None,
                                details: Some(details),
                            }),
                            Err(detail) => result.add_sample(SampleResult {
                                name,
                                status: TestStatus::Failed,
                                error: Some(detail),
                                skip_reason: None,
                                details: Some(details),
                            }),
                        }
                    } else {
                        result.add_sample(SampleResult {
                            name,
                            status: TestStatus::Error,
                            error: Some(format!("Unexpected compilation error: {:?}", e)),
                            skip_reason: None,
                            details: None,
                        });
                    }
                }
            },
        }
    }

    assert_coverage(&mut coverage, &result, "validator");
    result
}

// ============================================================================
// Compiler Error Tests
// ============================================================================

fn run_compiler_error_tests() -> CategoryResult {
    let samples = get_svelte_test_samples("compiler-errors");
    let mut result = CategoryResult::new("compiler-errors");
    let mut coverage = FixtureCoverage::new("compiler-errors", samples.len());

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let config_path = sample_dir.join("_config.js");
        let svelte_path = sample_dir.join("main.svelte");
        let module_path = sample_dir.join("main.svelte.js");

        if !svelte_path.exists() && !module_path.exists() {
            coverage.skipped(&name, SkipReason::MissingInput("main.svelte(.js)"));
            continue;
        }

        let config_content = match fs::read_to_string(&config_path) {
            Ok(s) => s,
            Err(_) => {
                coverage.skipped(&name, SkipReason::MissingInput("_config.js"));
                continue;
            }
        };

        let requires_async = config_content.contains("async: true");

        let expected_code = match extract_error_code(&config_content) {
            Some(c) => c,
            None => {
                coverage.skipped(&name, SkipReason::MissingInput("error code in _config.js"));
                continue;
            }
        };

        let is_module = module_path.exists() && !svelte_path.exists();
        let input_file = if is_module {
            &module_path
        } else {
            &svelte_path
        };

        let input = match read_fixture_file(input_file) {
            Some(s) => s,
            None => {
                coverage.skipped(&name, SkipReason::MissingInput("readable main.svelte(.js)"));
                continue;
            }
        };

        let compile_result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            if is_module {
                let options = ModuleCompileOptions {
                    generate: GenerateMode::Client,
                    filename: Some(format!("{}/main.svelte.js", name)),
                    ..Default::default()
                };
                compile_module(&input, options)
            } else {
                let options = CompileOptions {
                    generate: GenerateMode::Client,
                    filename: Some(format!("{}/main.svelte", name)),
                    experimental: ExperimentalOptions {
                        r#async: requires_async,
                    },
                    ..Default::default()
                };
                compile(&input, options)
            }
        }));

        match compile_result {
            Err(_) => {
                result.add_sample(SampleResult {
                    name,
                    status: TestStatus::Error,
                    error: Some("Compilation panicked".to_string()),
                    skip_reason: None,
                    details: None,
                });
            }
            Ok(Ok(_)) => {
                result.add_sample(SampleResult {
                    name,
                    status: TestStatus::Failed,
                    error: Some(format!(
                        "Expected error '{}' but compilation succeeded",
                        expected_code
                    )),
                    skip_reason: None,
                    details: None,
                });
            }
            Ok(Err(e)) => {
                let error_str = format!("{:?}", e);
                let display_str = format!("{}", e);
                let code_matches = error_code_matches(&expected_code, &[&error_str, &display_str]);

                if code_matches {
                    result.add_sample(SampleResult {
                        name,
                        status: TestStatus::Passed,
                        error: None,
                        skip_reason: None,
                        details: None,
                    });
                } else {
                    result.add_sample(SampleResult {
                        name,
                        status: TestStatus::Failed,
                        error: Some(format!(
                            "Expected error '{}', got: {}",
                            expected_code, error_str
                        )),
                        skip_reason: None,
                        details: None,
                    });
                }
            }
        }
    }

    assert_coverage(&mut coverage, &result, "compiler-errors");
    result
}

fn extract_error_code(config_content: &str) -> Option<String> {
    let patterns = ["code: '", "code: \"", "code:'", "code:\""];

    for pattern in &patterns {
        if let Some(start) = config_content.find(pattern) {
            let quote_char = if pattern.ends_with('\'') { '\'' } else { '"' };
            let value_start = start + pattern.len();
            let rest = &config_content[value_start..];

            let mut value = String::new();
            let mut escaped = false;

            for c in rest.chars() {
                if escaped {
                    value.push(c);
                    escaped = false;
                } else if c == '\\' {
                    escaped = true;
                } else if c == quote_char {
                    break;
                } else {
                    value.push(c);
                }
            }

            return Some(value);
        }
    }

    None
}

// ============================================================================
// Runtime Tests (shared implementation)
// ============================================================================

fn run_runtime_category_tests(category: &str) -> CategoryResult {
    ensure_fixtures_exist();

    let samples = get_fixture_samples(category);
    let mut result = CategoryResult::new(category);
    let mut coverage = FixtureCoverage::new(category, samples.len());

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        // The documented skip lists live in `tests/common/mod.rs` so this
        // report and the gate that actually blocks CI (`tests/runtime.rs`,
        // `tests/ssr.rs`) can never disagree about what is skipped.
        if runtime_skip_names(category).contains(&name.as_str()) {
            result.add_sample(SampleResult {
                name,
                status: TestStatus::Skipped,
                error: None,
                skip_reason: Some(
                    "On the documented runtime skip list in tests/common/mod.rs".to_string(),
                ),
                details: None,
            });
            continue;
        }

        // Most categories name their entry point `main.svelte`; the
        // `sourcemaps` samples use `input.svelte`. Hardcoding `main.svelte`
        // used to drop all 29 sourcemap samples silently (`Sourcemaps 0/0`).
        let sample_root = svelte_path()
            .join("packages/svelte/tests")
            .join(category)
            .join("samples")
            .join(&name);
        let input_path = ["main.svelte", "input.svelte"]
            .iter()
            .map(|entry| sample_root.join(entry))
            .find(|path| path.exists());
        let input_path = match input_path {
            Some(path) => path,
            None => {
                coverage.skipped(
                    &name,
                    SkipReason::MissingInput("main.svelte / input.svelte"),
                );
                continue;
            }
        };
        // The fixtures were generated with the sample's own entry-point name,
        // and `filename` reaches the generated code (component name, css hash),
        // so it has to follow the resolved entry point rather than be hardcoded.
        let input_filename = input_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("main.svelte")
            .to_string();

        // The very options the fixture was generated with, shared with the
        // gates so the report cannot measure something else than they do.
        let fixture_options = runtime_fixture_options(category, &name);

        let input = match read_fixture_file(&input_path) {
            Some(s) => s,
            None => {
                coverage.skipped(&name, SkipReason::MissingInput("readable entry point"));
                continue;
            }
        };

        let expected_client = load_fixture_output(category, &name, "client.js");
        let expected_server = load_fixture_output(category, &name, "server.js");

        // No generated output at all: the official compiler errored on this
        // sample, so the fixture holds only `warnings.json` / `error.json`.
        if expected_client.is_none() && expected_server.is_none() {
            coverage.skipped(&name, SkipReason::Justified);
            continue;
        }

        let mut details = SampleDetails::default();
        let mut client_ok = true;
        let mut server_ok = true;
        let mut error_msg = None;

        // Test client
        if let Some(expected) = &expected_client {
            let options = CompileOptions {
                generate: GenerateMode::Client,
                filename: Some(input_filename.clone()),
                css: CssMode::External,
                experimental: ExperimentalOptions {
                    r#async: fixture_options.r#async,
                },
                hmr: fixture_options.hmr,
                accessors: fixture_options.accessors,
                ..Default::default()
            };

            match compile(&input, options) {
                Ok(compile_result) => {
                    write_actual_output(category, &name, "client.js", &compile_result.js.code);

                    if compare_js(&compile_result.js.code, expected) {
                        details.client_passed = Some(true);
                    } else {
                        details.client_passed = Some(false);
                        client_ok = false;
                        error_msg = Some("Client JS mismatch".to_string());
                    }
                }
                Err(e) => {
                    details.client_passed = Some(false);
                    client_ok = false;
                    error_msg = Some(format!("Client compilation error: {}", e));
                }
            }
        }

        // Test server
        if let Some(expected) = &expected_server {
            let options = CompileOptions {
                generate: GenerateMode::Server,
                filename: Some(input_filename.clone()),
                css: CssMode::External,
                experimental: ExperimentalOptions {
                    r#async: fixture_options.r#async,
                },
                hmr: fixture_options.hmr,
                ..Default::default()
            };

            match compile(&input, options) {
                Ok(compile_result) => {
                    write_actual_output(category, &name, "server.js", &compile_result.js.code);

                    if compare_js(&compile_result.js.code, expected) {
                        details.server_passed = Some(true);
                    } else {
                        details.server_passed = Some(false);
                        server_ok = false;
                        if error_msg.is_none() {
                            error_msg = Some("Server JS mismatch".to_string());
                        }
                    }
                }
                Err(e) => {
                    details.server_passed = Some(false);
                    server_ok = false;
                    if error_msg.is_none() {
                        error_msg = Some(format!("Server compilation error: {}", e));
                    }
                }
            }
        }

        let status = if client_ok && server_ok {
            TestStatus::Passed
        } else {
            TestStatus::Failed
        };

        result.add_sample(SampleResult {
            name,
            status,
            error: error_msg,
            skip_reason: None,
            details: Some(details),
        });
    }

    assert_coverage(&mut coverage, &result, category);
    result
}

// ============================================================================
// Not Yet Implemented Tests
// ============================================================================

/// Run the `print` category by re-parsing each `input.svelte` and asking the
/// `print` API to emit it back, then comparing against the official
/// `output.svelte`. Mirrors `tests/print.rs::test_print` so the
/// compatibility-report stays in sync with the standalone test.
fn run_print_tests() -> CategoryResult {
    use rsvelte_core::compiler::print::print_with_source;
    use rsvelte_core::{ParseOptions, parse};

    let samples = get_svelte_test_samples("print");
    let mut result = CategoryResult::new("print");
    let mut coverage = FixtureCoverage::new("print", samples.len());

    // Print samples whose upstream re-formatter changed in Svelte 5.55.8
    // (upstream commit `ca3f35bf7` "fix(print): handle svelte:body and fix
    // keyframe percentage double-printing"). rsvelte's CSS pretty-printer
    // doesn't re-format the bodies of selectors / `@keyframes` blocks the
    // way upstream does (multi-line block normalisation, percentage handling).
    // Tracked as a follow-up port.
    let skip_print: &[&str] = &["css-keyframes-percent"];

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        if skip_print.contains(&name.as_str()) {
            result.add_sample(SampleResult {
                name,
                status: TestStatus::Skipped,
                error: None,
                skip_reason: Some(
                    "CSS print re-formatter (Svelte 5.55.8) not yet ported".to_string(),
                ),
                details: None,
            });
            continue;
        }

        let input = match read_fixture_file(&sample_dir.join("input.svelte")) {
            Some(s) => s,
            None => {
                coverage.skipped(&name, SkipReason::MissingInput("input.svelte"));
                continue;
            }
        };
        let expected = match read_fixture_file(&sample_dir.join("output.svelte")) {
            Some(s) => s,
            None => {
                coverage.skipped(&name, SkipReason::MissingInput("output.svelte"));
                continue;
            }
        };

        let options = ParseOptions {
            modern: true,
            ..Default::default()
        };

        let (status, error) = match parse(&input, &oxc_allocator::Allocator::default(), options) {
            Ok(ast) => match print_with_source(&ast, None, Some(&input)) {
                Ok(printed) => {
                    if normalize_print_output(&printed.code) == normalize_print_output(&expected) {
                        (TestStatus::Passed, None)
                    } else {
                        (TestStatus::Failed, Some("Output mismatch".to_string()))
                    }
                }
                Err(e) => (TestStatus::Failed, Some(format!("Print error: {:?}", e))),
            },
            Err(e) => (TestStatus::Failed, Some(format!("Parse error: {:?}", e))),
        };

        result.add_sample(SampleResult {
            name,
            status,
            error,
            skip_reason: None,
            details: None,
        });
    }

    assert_coverage(&mut coverage, &result, "print");
    result
}

/// Trim trailing whitespace per line and ensure a single trailing newline,
/// matching the helper in `tests/print.rs`.
fn normalize_print_output(s: &str) -> String {
    let mut output = s
        .lines()
        .map(|line| line.trim_end())
        .collect::<Vec<_>>()
        .join("\n");
    if !output.ends_with('\n') {
        output.push('\n');
    }
    output
}

/// Run the `preprocess` category by feeding each official Svelte fixture
/// through the rsvelte `preprocess` API with hand-ported preprocessor
/// closures (see `tests/common/preprocess_fixtures.rs`). Mirrors
/// `tests/preprocess.rs` so the compat dashboard stays in lock-step.
fn run_preprocess_tests() -> CategoryResult {
    use rsvelte_core::compiler::preprocess::preprocess;

    let samples = get_svelte_test_samples("preprocess");
    let mut result = CategoryResult::new("preprocess");
    let mut coverage = FixtureCoverage::new("preprocess", samples.len());

    let runtime = match tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
    {
        Ok(rt) => rt,
        Err(e) => {
            // Mark every fixture as errored and bail; this should never
            // happen in practice but the report should still be writable.
            for sample_dir in &samples {
                let name = sample_dir
                    .file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("unknown")
                    .to_string();
                result.add_sample(SampleResult {
                    name,
                    status: TestStatus::Error,
                    error: Some(format!("tokio runtime build failed: {}", e)),
                    skip_reason: None,
                    details: None,
                });
            }
            assert_coverage(&mut coverage, &result, "preprocess");
            return result;
        }
    };

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let input = match read_fixture_file(&sample_dir.join("input.svelte")) {
            Some(s) => s,
            None => {
                coverage.skipped(&name, SkipReason::MissingInput("input.svelte"));
                continue;
            }
        };
        let expected = match read_fixture_file(&sample_dir.join("output.svelte")) {
            Some(s) => s,
            None => {
                coverage.skipped(&name, SkipReason::MissingInput("output.svelte"));
                continue;
            }
        };

        let preprocessors = match common::preprocess_fixtures::build_preprocessors(&name) {
            Some(g) => g,
            None => {
                result.add_sample(SampleResult {
                    name,
                    status: TestStatus::Failed,
                    error: Some("no Rust preprocessor wired up".to_string()),
                    skip_reason: None,
                    details: None,
                });
                continue;
            }
        };
        let filename = common::preprocess_fixtures::filename_for(&name);

        let (status, error) = match runtime.block_on(preprocess(input, preprocessors, filename)) {
            Ok(processed) => {
                if processed.code == expected {
                    (TestStatus::Passed, None)
                } else {
                    (TestStatus::Failed, Some("Output mismatch".to_string()))
                }
            }
            Err(e) => (
                TestStatus::Failed,
                Some(format!("preprocess error: {:?}", e)),
            ),
        };

        result.add_sample(SampleResult {
            name,
            status,
            error,
            skip_reason: None,
            details: None,
        });
    }

    assert_coverage(&mut coverage, &result, "preprocess");
    result
}

fn run_not_implemented_tests(category: &str, reason: &str) -> CategoryResult {
    let samples = get_svelte_test_samples(category);
    let mut result = CategoryResult::new(category);
    let mut coverage = FixtureCoverage::new(category, samples.len());

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        result.add_sample(SampleResult {
            name,
            status: TestStatus::Skipped,
            error: None,
            skip_reason: Some(reason.to_string()),
            details: None,
        });
    }

    assert_coverage(&mut coverage, &result, category);
    result
}

// ============================================================================
// Main Test
// ============================================================================

// `#[ignore]` by default: this is a *reporting* artifact, not a correctness
// gate. It re-runs every category (parser, css, validator, runtime, …) purely
// to assemble `compatibility-report.json`, and it deliberately never fails on
// output mismatches (see the comment at the end of the body) — it does still
// fail when a category loses coverage, because a silently empty category
// invalidates the whole report. Those categories are each already
// gated by their own dedicated test binaries (tests/runtime.rs, tests/css.rs,
// tests/validator.rs, …), so running this in the default `cargo test` /
// `cargo nextest run` only duplicates ~all of the suite (it was the single
// slowest "test" by a wide margin). The dedicated `Compatibility Report` CI
// job — and `pnpm run compatibility-report` — opt back in via `--ignored`.
#[test]
#[ignore = "reporting-only; run explicitly via `pnpm run compatibility-report` (re-runs every category, asserts nothing)"]
fn generate_compatibility_report() {
    let mut report = CompatibilityReport::new();

    println!("\n=== Generating Compatibility Report ===\n");
    println!("Svelte commit: {}", report.svelte_short_hash);
    println!();

    // Parser tests
    print!("Running parser-modern tests... ");
    let parser_modern = run_parser_tests(TestCategory::ParserModern, true);
    println!(
        "{}/{} passed ({:.1}%)",
        parser_modern.stats.passed,
        parser_modern.stats.run_count(),
        parser_modern.stats.pass_percentage()
    );
    report.add_category(parser_modern);

    print!("Running parser-legacy tests... ");
    let parser_legacy = run_parser_tests(TestCategory::ParserLegacy, false);
    println!(
        "{}/{} passed ({:.1}%)",
        parser_legacy.stats.passed,
        parser_legacy.stats.run_count(),
        parser_legacy.stats.pass_percentage()
    );
    report.add_category(parser_legacy);

    // Compiler tests
    print!("Running snapshot tests... ");
    let snapshot = run_snapshot_tests();
    println!(
        "{}/{} passed ({:.1}%)",
        snapshot.stats.passed,
        snapshot.stats.run_count(),
        snapshot.stats.pass_percentage()
    );
    report.add_category(snapshot);

    // CSS tests
    print!("Running css tests... ");
    let css = run_css_tests();
    println!(
        "{}/{} passed ({:.1}%)",
        css.stats.passed,
        css.stats.run_count(),
        css.stats.pass_percentage()
    );
    report.add_category(css);

    // Validator tests
    print!("Running validator tests... ");
    let validator = run_validator_tests();
    println!(
        "{}/{} passed ({:.1}%)",
        validator.stats.passed,
        validator.stats.run_count(),
        validator.stats.pass_percentage()
    );
    report.add_category(validator);

    // Compiler error tests
    print!("Running compiler-errors tests... ");
    let compiler_errors = run_compiler_error_tests();
    println!(
        "{}/{} passed ({:.1}%)",
        compiler_errors.stats.passed,
        compiler_errors.stats.run_count(),
        compiler_errors.stats.pass_percentage()
    );
    report.add_category(compiler_errors);

    // Runtime tests
    for category in &[
        "runtime-runes",
        "runtime-legacy",
        "runtime-browser",
        "hydration",
        "server-side-rendering",
    ] {
        print!("Running {} tests... ", category);
        let result = run_runtime_category_tests(category);
        println!(
            "{}/{} passed ({:.1}%)",
            result.stats.passed,
            result.stats.run_count(),
            result.stats.pass_percentage()
        );
        report.add_category(result);
    }

    // Sourcemaps (from fixtures)
    print!("Running sourcemaps tests... ");
    let sourcemaps = run_runtime_category_tests("sourcemaps");
    println!(
        "{}/{} passed ({:.1}%)",
        sourcemaps.stats.passed,
        sourcemaps.stats.run_count(),
        sourcemaps.stats.pass_percentage()
    );
    report.add_category(sourcemaps);

    // Print category — implemented and tested standalone in tests/print.rs.
    // Wire it into the compatibility report so the dashboard reflects reality.
    print!("Running print tests... ");
    let print = run_print_tests();
    println!(
        "{}/{} passed ({:.1}%)",
        print.stats.passed,
        print.stats.run_count(),
        print.stats.pass_percentage()
    );
    report.add_category(print);

    // Preprocess category — implemented in `src/compiler/preprocess` and
    // exercised standalone in `tests/preprocess.rs`. Each fixture's
    // `_config.js` JS preprocessor is hand-ported in
    // `tests/common/preprocess_fixtures.rs`.
    print!("Running preprocess tests... ");
    let pre = run_preprocess_tests();
    println!(
        "{}/{} passed ({:.1}%)",
        pre.stats.passed,
        pre.stats.run_count(),
        pre.stats.pass_percentage()
    );
    report.add_category(pre);

    // svelte2tsx category — wave 1 of the ecosystem port. The same
    // runner that powers `tests/svelte2tsx_fixtures.rs` is invoked here
    // via `tests/common/svelte2tsx.rs` so this dashboard and the
    // standalone runner stay in lockstep.
    print!("Running svelte2tsx tests... ");
    if let Some(svelte2tsx_result) = common::svelte2tsx::run_as_category() {
        println!(
            "{}/{} passed ({:.1}%)",
            svelte2tsx_result.stats.passed,
            svelte2tsx_result.stats.run_count(),
            svelte2tsx_result.stats.pass_percentage()
        );
        report.add_category(svelte2tsx_result);
    } else {
        println!("skipped (language-tools submodule not available)");
    }

    // Migrate (Svelte 4 → 5 migrator) is intentionally out of scope for
    // rsvelte — the project is a port of the Svelte 5 compiler, not a
    // migration tool, so its 76 fixtures are reported as skipped rather
    // than as implementation gaps. They do not count against the
    // 100% implemented-passing total.
    print!("Running migrate tests... ");
    let migrate = run_not_implemented_tests(
        "migrate",
        "Migrate (Svelte 4 → 5 migrator) is out of scope for rsvelte",
    );
    println!("all {} skipped (out of scope)", migrate.stats.total);
    report.add_category(migrate);

    // Finalize and save
    report.finalize();

    let report_path = fixtures_path().join("compatibility-report.json");
    if let Err(e) = report.save_to_file(report_path.to_str().unwrap()) {
        eprintln!("Warning: Failed to save report: {}", e);
    }

    // Print summary
    println!("\n=== Summary ===\n");
    println!(
        "Total tests: {} ({} run, {} skipped)",
        report.summary.total_tests,
        report.summary.total_tests - report.summary.total_skipped,
        report.summary.total_skipped
    );
    println!(
        "Passed: {} ({:.1}%)",
        report.summary.total_passed, report.summary.overall_percentage
    );
    println!("Failed: {}", report.summary.total_failed);
    println!("Errors: {}", report.summary.total_errors);

    println!("\n=== Category Breakdown ===\n");
    let mut categories: Vec<_> = report.categories.iter().collect();
    categories.sort_by(|a, b| a.0.cmp(b.0));

    for (name, result) in categories {
        let pct = result.stats.pass_percentage();
        let bar_len = 20;
        let filled = (pct / 100.0 * bar_len as f64) as usize;
        let bar: String = std::iter::repeat_n('=', filled)
            .chain(std::iter::repeat_n('-', bar_len - filled))
            .collect();
        println!(
            "{:30} [{bar}] {:>5.1}% ({}/{})",
            name,
            pct,
            result.stats.passed,
            result.stats.run_count()
        );
    }

    println!(
        "\nReport saved to: {}",
        report_path.to_str().unwrap_or("unknown")
    );

    // Don't fail the test - this is for reporting only
}

/// Quick test to list all available test categories and counts.
#[test]
fn list_test_categories() {
    println!("\n=== Available Test Categories ===\n");

    for category in TestCategory::all() {
        let count = category.sample_count();
        let status = if category.is_implemented() {
            "implemented"
        } else {
            "not implemented"
        };
        println!(
            "{:30} {:>5} samples ({})",
            category.display_name(),
            count,
            status
        );
    }
}
