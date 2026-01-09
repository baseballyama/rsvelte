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
    ensure_fixtures_exist, fixtures_path, format_js_with_oxfmt, get_fixture_samples,
    get_svelte_test_samples, load_fixture_output, normalize_css, svelte_path, write_actual_output,
};
use svelte_compiler_rust::{
    CompileOptions, GenerateMode, ParseOptions, compile, compiler::CssMode, convert_to_legacy,
    parse,
};

// ============================================================================
// Parser Tests
// ============================================================================

fn run_parser_tests(category: TestCategory, modern: bool) -> CategoryResult {
    let svelte_dir = category.svelte_dir();
    let samples = get_svelte_test_samples(svelte_dir);
    let mut result = CategoryResult::new(svelte_dir);

    // Tests to skip for parser-legacy
    let skip_tests: &[&str] = if !modern {
        &["javascript-comments"]
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
            result.add_sample(SampleResult {
                name,
                status: TestStatus::Skipped,
                error: None,
                skip_reason: Some("Known incompatibility with OXC parser".to_string()),
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
            filename: Some(name.clone()),
        };

        match parse(&input, options) {
            Ok(ast) => {
                let actual_json = if modern {
                    serde_json::to_string_pretty(&ast).unwrap_or_default()
                } else {
                    let legacy_ast = convert_to_legacy(&input, ast);
                    serde_json::to_string_pretty(&legacy_ast).unwrap_or_default()
                };

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

        if let Ok(config) = fs::read_to_string(&config_path) {
            if config.contains("async: true")
                || config.contains("hmr: true")
                || config.contains("fragments:")
            {
                result.add_sample(SampleResult {
                    name,
                    status: TestStatus::Skipped,
                    error: None,
                    skip_reason: Some("Requires unsupported compile options".to_string()),
                    details: None,
                });
                continue;
            }
        }

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

        // Test client
        if let Some(expected) = &expected_client {
            let options = CompileOptions {
                generate: GenerateMode::Client,
                filename: Some("index.svelte".to_string()),
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
                filename: Some("index.svelte".to_string()),
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
                        let matches = normalize_css(&actual_css) == normalize_css(expected);
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

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

        let svelte_path = sample_dir.join("input.svelte");
        let module_path = sample_dir.join("input.svelte.js");

        // Skip module tests
        if module_path.exists() && !svelte_path.exists() {
            result.add_sample(SampleResult {
                name,
                status: TestStatus::Skipped,
                error: None,
                skip_reason: Some("Module compilation not implemented".to_string()),
                details: None,
            });
            continue;
        }

        if !svelte_path.exists() {
            continue;
        }

        let input = match fs::read_to_string(&svelte_path) {
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

        let compile_result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            let options = CompileOptions {
                generate: GenerateMode::Client,
                filename: Some(format!("{}/input.svelte", name)),
                ..Default::default()
            };
            compile(&input, options)
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
                        let warnings_match = output.warnings.len() == expected_warnings.len();
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
                                    output.warnings.len()
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
                                .contains(&expected_code.replace('_', " ").to_lowercase());

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

        // Skip module tests
        if module_path.exists() && !svelte_path.exists() {
            result.add_sample(SampleResult {
                name,
                status: TestStatus::Skipped,
                error: None,
                skip_reason: Some("Module compilation not implemented".to_string()),
                details: None,
            });
            continue;
        }

        // Skip CSS tests
        if name.starts_with("css") {
            result.add_sample(SampleResult {
                name,
                status: TestStatus::Skipped,
                error: None,
                skip_reason: Some("CSS error tests not yet supported".to_string()),
                details: None,
            });
            continue;
        }

        if !svelte_path.exists() || !config_path.exists() {
            continue;
        }

        let config_content = match fs::read_to_string(&config_path) {
            Ok(s) => s,
            Err(_) => continue,
        };

        // Skip async tests
        if config_content.contains("async: true") {
            result.add_sample(SampleResult {
                name,
                status: TestStatus::Skipped,
                error: None,
                skip_reason: Some("Async compilation not supported".to_string()),
                details: None,
            });
            continue;
        }

        let expected_code = match extract_error_code(&config_content) {
            Some(c) => c,
            None => continue,
        };

        let input = match fs::read_to_string(&svelte_path) {
            Ok(s) => s,
            Err(_) => continue,
        };

        let compile_result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            let options = CompileOptions {
                generate: GenerateMode::Client,
                filename: Some(format!("{}/main.svelte", name)),
                ..Default::default()
            };
            compile(&input, options)
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

    for sample_dir in &samples {
        let name = sample_dir
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("unknown")
            .to_string();

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

        if let Ok(config) = fs::read_to_string(&config_path) {
            if config.contains("async: true") || config.contains("hmr: true") {
                result.add_sample(SampleResult {
                    name,
                    status: TestStatus::Skipped,
                    error: None,
                    skip_reason: Some("Requires unsupported compile options".to_string()),
                    details: None,
                });
                continue;
            }
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

        // Test client
        if let Some(expected) = &expected_client {
            let options = CompileOptions {
                generate: GenerateMode::Client,
                filename: Some("main.svelte".to_string()),
                css: CssMode::External,
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
// Utility Functions
// ============================================================================

/// Compare two JavaScript outputs using oxfmt for formatting.
fn compare_js(actual: &str, expected: &str) -> bool {
    let formatted_actual = format_js_with_oxfmt(actual);
    let formatted_expected = format_js_with_oxfmt(expected);
    formatted_actual == formatted_expected
}

// Legacy normalization function (kept for reference, but no longer used)
#[allow(dead_code)]
fn normalize_js(js: &str) -> String {
    let js = normalize_quotes(js);
    let js = collapse_multiline_constructs(&js);

    js.lines()
        .filter(|line| !line.trim().is_empty())
        .map(|line| line.trim_end())
        .map(normalize_spacing)
        .collect::<Vec<_>>()
        .join("\n")
}

#[allow(dead_code)]
fn normalize_quotes(js: &str) -> String {
    let mut result = String::new();
    let chars: Vec<char> = js.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        let c = chars[i];
        if c == '"' && (i == 0 || chars[i - 1] != '\\') {
            result.push('\'');
        } else {
            result.push(c);
        }
        i += 1;
    }

    result
}

#[allow(dead_code)]
fn collapse_multiline_constructs(js: &str) -> String {
    let mut result = String::new();
    let mut depth = 0;
    let mut in_template = false;
    let mut in_string = false;
    let mut string_char = ' ';
    let chars: Vec<char> = js.chars().collect();
    let mut i = 0;

    while i < chars.len() {
        let c = chars[i];

        if !in_string && c == '`' && (i == 0 || chars[i - 1] != '\\') {
            in_template = !in_template;
        }
        if !in_template && (c == '\'' || c == '"') && (i == 0 || chars[i - 1] != '\\') {
            if !in_string {
                in_string = true;
                string_char = c;
            } else if c == string_char {
                in_string = false;
            }
        }

        if !in_string && !in_template {
            if c == '[' || c == '{' {
                depth += 1;
            } else if c == ']' || c == '}' {
                depth -= 1;
            }
        }

        if (c == '\n' || c == '\r') && depth > 0 && !in_template {
            while i + 1 < chars.len()
                && (chars[i + 1] == ' '
                    || chars[i + 1] == '\t'
                    || chars[i + 1] == '\n'
                    || chars[i + 1] == '\r')
            {
                i += 1;
            }
            let last_char = result.chars().last();
            let next_char = chars.get(i + 1);
            if last_char != Some('[')
                && last_char != Some('{')
                && next_char != Some(&']')
                && next_char != Some(&'}')
            {
                result.push(' ');
            }
        } else {
            result.push(c);
        }
        i += 1;
    }

    result
}

#[allow(dead_code)]
fn normalize_spacing(line: &str) -> String {
    let line = line.replace(",...", ", ...");
    let mut result = String::new();
    let mut last_was_space = false;
    for c in line.chars() {
        if c == ' ' {
            if !last_was_space {
                result.push(c);
            }
            last_was_space = true;
        } else {
            result.push(c);
            last_was_space = false;
        }
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

    // Not yet implemented categories
    for (category, reason) in &[
        ("preprocess", "Preprocess API not implemented"),
        ("print", "Print API not implemented"),
        ("migrate", "Migrate API not implemented"),
    ] {
        print!("Running {} tests... ", category);
        let result = run_not_implemented_tests(category, reason);
        println!("all {} skipped", result.stats.total);
        report.add_category(result);
    }

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
