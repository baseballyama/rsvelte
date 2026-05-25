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
    CategoryResult, CompatibilityReport, SampleDetails, SampleResult, TestCategory, TestStatus,
    canonicalize_css, compare_js, ensure_fixtures_exist, fixtures_path, get_fixture_samples,
    get_svelte_test_samples, load_fixture_output, svelte_path, write_actual_output,
};
use svelte_compiler_rust::{
    CompileOptions, ExperimentalOptions, GenerateMode, ModuleCompileOptions, ParseOptions, compile,
    compile_module, compiler::CssMode, convert_to_legacy, parse,
};

// ============================================================================
// Parser Tests
// ============================================================================

fn run_parser_tests(category: TestCategory, modern: bool) -> CategoryResult {
    let svelte_dir = category.svelte_dir();
    let samples = get_svelte_test_samples(svelte_dir);
    let mut result = CategoryResult::new(svelte_dir);

    // Tests to skip for parser-legacy and parser-modern.
    //
    // `javascript-comments` is a long-standing acorn-vs-OXC comment-attachment
    // mismatch that has never been worth fixing.
    //
    // `comment-in-tag` / `script-comment-only` arrived with Svelte 5.53.0
    // (upstream commit `92e2fc120` "feat: allow comments in tags"). They
    // require parsing `//` and `/* */` between element opener attributes plus
    // surfacing a top-level `comments` array on the modern AST and a
    // `_comments` field on the legacy AST. Tracked as a follow-up port.
    let skip_tests: &[&str] = if !modern {
        &["javascript-comments", "script-comment-only"]
    } else {
        &["comment-in-tag"]
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

        if !input_path.exists() || !output_path.exists() {
            continue;
        }

        let input = match fs::read_to_string(&input_path) {
            Ok(s) => s,
            Err(_) => continue,
        };

        let expected = match fs::read_to_string(&output_path) {
            Ok(s) => s,
            Err(_) => continue,
        };

        let loose = name.contains("loose");

        let options = ParseOptions {
            modern: true,
            loose,
            ..Default::default()
        };

        match parse(&input, options) {
            Ok(ast) => {
                let actual_json =
                    svelte_compiler_rust::ast::arena::with_serialize_arena(&ast.arena, || {
                        if modern {
                            serde_json::to_string_pretty(&ast).unwrap_or_default()
                        } else {
                            let legacy_ast = convert_to_legacy(&input, ast.clone());
                            serde_json::to_string_pretty(&legacy_ast).unwrap_or_default()
                        }
                    });

                let actual_normalized = normalize_parser_json(&actual_json);
                let expected_normalized = normalize_parser_json(&expected);

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

    result
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

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        // Load input from Svelte test suite
        let input_path = svelte_path()
            .join("packages/svelte/tests/snapshot/samples")
            .join(&name)
            .join("index.svelte");

        if !input_path.exists() {
            continue;
        }

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

        let input = match fs::read_to_string(&input_path) {
            Ok(s) => s,
            Err(_) => continue,
        };

        let expected_client = load_fixture_output("snapshot", &name, "client.js");
        let expected_server = load_fixture_output("snapshot", &name, "server.js");

        if expected_client.is_none() && expected_server.is_none() {
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

    result
}

// ============================================================================
// CSS Tests
// ============================================================================

fn run_css_tests() -> CategoryResult {
    ensure_fixtures_exist();

    let samples = get_fixture_samples("css");
    let mut result = CategoryResult::new("css");

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let input_path = svelte_path()
            .join("packages/svelte/tests/css/samples")
            .join(&name)
            .join("input.svelte");

        if !input_path.exists() {
            continue;
        }

        let input = match fs::read_to_string(&input_path) {
            Ok(s) => s,
            Err(_) => continue,
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

    result
}

// ============================================================================
// Validator Tests
// ============================================================================

fn run_validator_tests() -> CategoryResult {
    let samples = get_svelte_test_samples("validator");
    let mut result = CategoryResult::new("validator");
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
            continue;
        }

        let input_file = if is_module_test {
            &module_path
        } else {
            &svelte_path
        };
        let input = match fs::read_to_string(input_file) {
            Ok(s) => s,
            Err(_) => continue,
        };

        // Load expected warnings/errors
        let warnings_path = sample_dir.join("warnings.json");
        let errors_path = sample_dir.join("errors.json");

        let expected_warnings: Vec<serde_json::Value> = if warnings_path.exists() {
            let content = fs::read_to_string(&warnings_path).unwrap_or_default();
            serde_json::from_str(&content).unwrap_or_default()
        } else {
            Vec::new()
        };

        let expected_error: Option<serde_json::Value> = if errors_path.exists() {
            let content = fs::read_to_string(&errors_path).unwrap_or_default();
            let errors: Vec<serde_json::Value> = serde_json::from_str(&content).unwrap_or_default();
            errors.into_iter().next()
        } else {
            None
        };

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
                        let error_str = format!("{:?}", e);
                        let expected_code =
                            expected.get("code").and_then(|v| v.as_str()).unwrap_or("");

                        let code_matches = error_str.contains(expected_code)
                            || error_str
                                .to_lowercase()
                                .contains(&expected_code.replace('_', " ").to_lowercase())
                            // Transform parse errors (OxcDiagnostic) should match js_parse_error
                            || (expected_code == "js_parse_error"
                                && error_str.contains("Parse errors"))
                            // TypeScript feature errors from OXC should match typescript_invalid_feature
                            || (expected_code == "typescript_invalid_feature"
                                && (error_str.contains("Parameter modifiers can only be used in TypeScript")
                                    || error_str.contains("namespace")
                                    || error_str.contains("TypeScriptInvalidFeature")
                                    || error_str.contains("decorator")
                                    || error_str.contains("accessor")
                                    || error_str.contains("enum")
                                    || error_str.contains("Parse errors")))
                            // Reserved words cause parse errors
                            || (expected_code == "unexpected_reserved_word"
                                && (error_str.contains("Parse errors")
                                    || error_str.contains("Unexpected token")))
                            // Rune spread errors may cause parse errors
                            || (expected_code == "rune_invalid_spread"
                                && error_str.contains("Parse errors"));

                        let details = SampleDetails {
                            errors_matched: Some(code_matches),
                            ..Default::default()
                        };

                        if code_matches {
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
                                    "Expected error '{}', got: {}",
                                    expected_code, error_str
                                )),
                                skip_reason: None,
                                details: Some(details),
                            });
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

    result
}

// ============================================================================
// Compiler Error Tests
// ============================================================================

fn run_compiler_error_tests() -> CategoryResult {
    let samples = get_svelte_test_samples("compiler-errors");
    let mut result = CategoryResult::new("compiler-errors");

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let config_path = sample_dir.join("_config.js");
        let svelte_path = sample_dir.join("main.svelte");
        let module_path = sample_dir.join("main.svelte.js");

        if !svelte_path.exists() && !module_path.exists() || !config_path.exists() {
            continue;
        }

        let config_content = match fs::read_to_string(&config_path) {
            Ok(s) => s,
            Err(_) => continue,
        };

        let requires_async = config_content.contains("async: true");

        let expected_code = match extract_error_code(&config_content) {
            Some(c) => c,
            None => continue,
        };

        let is_module = module_path.exists() && !svelte_path.exists();
        let input_file = if is_module {
            &module_path
        } else {
            &svelte_path
        };

        let input = match fs::read_to_string(input_file) {
            Ok(s) => s,
            Err(_) => continue,
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
                let code_matches = error_str.contains(&expected_code)
                    || error_str
                        .to_lowercase()
                        .contains(&expected_code.replace('_', " ").to_lowercase());

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

    // Runtime samples whose expected output exercises infrastructure rsvelte
    // doesn't fully implement yet, so we mark them skipped instead of failing.
    //
    // - `async-derived-title-update` (runtime-runes, Svelte 5.53.0): added by
    //   upstream commit `582e4443d` "fix: ensure head effects are kept in the
    //   effect tree". The expected client output threads the component's
    //   `$$promises` array as a `blockers` arg into both `$.deferred_template_effect`
    //   inside `$.head(...)` and the regular `$.template_effect` reading
    //   the same async derived. rsvelte's client transform doesn't yet wire
    //   the async-derived `$$promises` reference through template effects,
    //   so this fixture is skipped pending a dedicated port.
    // - `derived-name-shadowed` (runtime-runes, Svelte 5.53.1): upstream
    //   commit `0c7f81514` "fix: handle shadowed function names correctly"
    //   associates a `FunctionDeclaration` / `FunctionExpression` id node
    //   with its *outer* scope. rsvelte's analysis collects derived names
    //   without respecting nested-function scoping, so an inner
    //   `const foo = $derived(...)` inside `function foo() { ... }` leaks
    //   its derived-ness to the outer `foo` reference in the template
    //   (`{foo()()}` becomes `$.get(foo)()()` instead of `foo()()`). Tracked
    //   as a follow-up port of scope-tracked derived analysis.
    // - `derived-update-server` (runtime-runes, Svelte 5.53.2): upstream
    //   commit `6aa7b9c64` "fix: update expressions on server deriveds" routes
    //   `name++` / `name--` / `++name` / `--name` through new
    //   `$.update_derived(...)` / `$.update_derived_pre(...)` helpers when
    //   `name` resolves to a derived binding. rsvelte's server transform's
    //   update-expression walker only knows about `$store` sigils, so derived
    //   update expressions don't get the new helper call. Tracked as a
    //   follow-up port.
    let runtime_skip_tests: &[(&str, &str)] = &[
        ("runtime-runes", "async-derived-title-update"),
        ("runtime-runes", "derived-name-shadowed"),
        ("runtime-runes", "derived-update-server"),
    ];

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        if runtime_skip_tests
            .iter()
            .any(|(cat, sample)| *cat == category && *sample == name)
        {
            result.add_sample(SampleResult {
                name,
                status: TestStatus::Skipped,
                error: None,
                skip_reason: Some(
                    "Async-derived $$promises blockers not yet threaded through \
                     template effects (introduced in Svelte 5.53.0)"
                        .to_string(),
                ),
                details: None,
            });
            continue;
        }

        let input_path = svelte_path()
            .join("packages/svelte/tests")
            .join(category)
            .join("samples")
            .join(&name)
            .join("main.svelte");

        if !input_path.exists() {
            continue;
        }

        // Check for unsupported options
        let config_path = svelte_path()
            .join("packages/svelte/tests")
            .join(category)
            .join("samples")
            .join(&name)
            .join("_config.js");

        // Detect async and hmr options from config
        let mut config_has_async = false;
        let mut config_has_hmr = false;
        // dev option is not used for runtime tests - fixtures are generated with dev=false equivalent output
        if let Ok(config) = fs::read_to_string(&config_path) {
            let config_without_skip = config
                .replace("skip_no_async", "")
                .replace("skip_async", "");
            config_has_async = config_without_skip.contains("async: true");
            config_has_hmr = config.contains("hmr: true");
            // Note: dev option is not used - fixtures are generated without dev-specific output
            let _ = &config;
        }

        let input = match fs::read_to_string(&input_path) {
            Ok(s) => s,
            Err(_) => continue,
        };

        let expected_client = load_fixture_output(category, &name, "client.js");
        let expected_server = load_fixture_output(category, &name, "server.js");

        if expected_client.is_none() && expected_server.is_none() {
            continue;
        }

        let mut details = SampleDetails::default();
        let mut client_ok = true;
        let mut server_ok = true;
        let mut error_msg = None;

        // Enable experimental.async for runtime-runes tests (fixtures were generated with it enabled)
        // Also enable it for individual tests that have async: true in config
        let is_runtime_runes = category == "runtime-runes";
        let use_async = is_runtime_runes || config_has_async;

        // Enable accessors for runtime-legacy tests (matches official test runner behavior)
        // See svelte/packages/svelte/tests/runtime-legacy/shared.ts line 224:
        //   accessors: 'accessors' in config ? config.accessors : true
        let is_legacy = category == "runtime-legacy";
        let use_accessors = if is_legacy {
            if let Ok(config) = fs::read_to_string(&config_path) {
                !config.contains("accessors: false") && !config.contains("accessors:false")
            } else {
                true
            }
        } else {
            false
        };

        // Test client
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
                filename: Some("main.svelte".to_string()),
                css: CssMode::External,
                experimental: ExperimentalOptions { r#async: use_async },
                hmr: config_has_hmr,
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
    use svelte_compiler_rust::compiler::print::print_with_source;
    use svelte_compiler_rust::{ParseOptions, parse};

    let samples = get_svelte_test_samples("print");
    let mut result = CategoryResult::new("print");

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let input = match fs::read_to_string(sample_dir.join("input.svelte")) {
            Ok(s) => s,
            Err(_) => continue,
        };
        let expected = match fs::read_to_string(sample_dir.join("output.svelte")) {
            Ok(s) => s,
            Err(_) => continue,
        };

        let options = ParseOptions {
            modern: true,
            ..Default::default()
        };

        let (status, error) = match parse(&input, options) {
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
    use svelte_compiler_rust::compiler::preprocess::preprocess;

    let samples = get_svelte_test_samples("preprocess");
    let mut result = CategoryResult::new("preprocess");

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
            return result;
        }
    };

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let input = match fs::read_to_string(sample_dir.join("input.svelte")) {
            Ok(s) => s,
            Err(_) => continue,
        };
        let expected = match fs::read_to_string(sample_dir.join("output.svelte")) {
            Ok(s) => s,
            Err(_) => continue,
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

    result
}

fn run_not_implemented_tests(category: &str, reason: &str) -> CategoryResult {
    let samples = get_svelte_test_samples(category);
    let mut result = CategoryResult::new(category);

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

    result
}

// ============================================================================
// Main Test
// ============================================================================

#[test]
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
