//! Comprehensive test suite for the print module.
//!
//! These tests verify that the print module can accurately convert AST nodes back to source code
//! by comparing against the official Svelte compiler's print output.
//!
//! Test structure mirrors svelte/packages/svelte/tests/print/samples/

use std::fs;
use std::path::PathBuf;
use svelte_compiler_rust::compiler::print::print;
use svelte_compiler_rust::{ParseOptions, parse};

/// Helper function to test a print sample
fn test_print_sample(sample_name: &str) {
    let base_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let input_path = base_path.join(format!(
        "svelte/packages/svelte/tests/print/samples/{}/input.svelte",
        sample_name
    ));
    let output_path = base_path.join(format!(
        "svelte/packages/svelte/tests/print/samples/{}/output.svelte",
        sample_name
    ));

    // Read input and expected output
    let input = fs::read_to_string(&input_path)
        .unwrap_or_else(|_| panic!("Failed to read input file: {:?}", input_path));
    let expected = fs::read_to_string(&output_path)
        .unwrap_or_else(|_| panic!("Failed to read output file: {:?}", output_path));

    // Parse and print
    let parse_options = ParseOptions {
        modern: true,
        ..Default::default()
    };
    let ast = parse(&input, parse_options)
        .unwrap_or_else(|e| panic!("Failed to parse {}: {:?}", sample_name, e));
    let result =
        print(&ast, None).unwrap_or_else(|e| panic!("Failed to print {}: {:?}", sample_name, e));

    // Normalize line endings and trim
    let result_code = result.code.trim().replace("\r\n", "\n");
    let expected_code = expected.trim().replace("\r\n", "\n");

    // Compare
    if result_code != expected_code {
        eprintln!("\n=== Test failed: {} ===", sample_name);
        eprintln!("\nExpected:\n{}", expected_code);
        eprintln!("\nGot:\n{}", result_code);
        eprintln!("\n=== Diff ===");

        // Show line-by-line diff
        let expected_lines: Vec<&str> = expected_code.lines().collect();
        let result_lines: Vec<&str> = result_code.lines().collect();
        let max_lines = expected_lines.len().max(result_lines.len());

        for i in 0..max_lines {
            let exp = expected_lines.get(i).unwrap_or(&"<missing>");
            let res = result_lines.get(i).unwrap_or(&"<missing>");
            if exp != res {
                eprintln!("Line {}: Expected: {:?}", i + 1, exp);
                eprintln!("Line {}: Got:      {:?}", i + 1, res);
            }
        }
        eprintln!("=================\n");
    }

    assert_eq!(
        result_code, expected_code,
        "Print output mismatch for {}",
        sample_name
    );
}

// Directive Tests
#[test]
fn test_print_animate_directive() {
    test_print_sample("animate-directive");
}

#[test]
fn test_print_bind_directive() {
    test_print_sample("bind-directive");
}

#[test]
fn test_print_class_directive() {
    test_print_sample("class-directive");
}

#[test]
fn test_print_let_directive() {
    test_print_sample("let-directive");
}

#[test]
fn test_print_on_directive() {
    test_print_sample("on-directive");
}

#[test]
fn test_print_style_directive() {
    test_print_sample("style-directive");
}

#[test]
fn test_print_transition_directive() {
    test_print_sample("transition-directive");
}

#[test]
fn test_print_use_directive() {
    test_print_sample("use-directive");
}

// Block Tests
#[test]
fn test_print_await_block() {
    test_print_sample("await-block");
}

#[test]
fn test_print_each_block() {
    test_print_sample("each-block");
}

#[test]
fn test_print_if_block() {
    test_print_sample("if-block");
}

#[test]
fn test_print_key_block() {
    test_print_sample("key-block");
}

#[test]
fn test_print_snippet_block() {
    test_print_sample("snippet-block");
}

#[test]
fn test_print_block() {
    test_print_sample("block");
}

// Tag Tests
#[test]
fn test_print_attach_tag() {
    test_print_sample("attach-tag");
}

#[test]
fn test_print_const_tag() {
    test_print_sample("const-tag");
}

#[test]
fn test_print_expression_tag() {
    test_print_sample("expression-tag");
}

#[test]
fn test_print_html_tag() {
    test_print_sample("html-tag");
}

#[test]
fn test_print_render_tag() {
    test_print_sample("render-tag");
}

// Element Tests
#[test]
fn test_print_regular_element() {
    test_print_sample("regular-element");
}

#[test]
fn test_print_component() {
    test_print_sample("component");
}

#[test]
fn test_print_slot_element() {
    test_print_sample("slot-element");
}

// Svelte Special Elements
#[test]
fn test_print_svelte_boundary() {
    test_print_sample("svelte-boundary");
}

#[test]
fn test_print_svelte_component() {
    test_print_sample("svelte-component");
}

#[test]
fn test_print_svelte_document() {
    test_print_sample("svelte-document");
}

#[test]
fn test_print_svelte_element() {
    test_print_sample("svelte-element");
}

#[test]
fn test_print_svelte_fragment() {
    test_print_sample("svelte-fragment");
}

#[test]
fn test_print_svelte_head() {
    test_print_sample("svelte-head");
}

#[test]
fn test_print_svelte_options() {
    test_print_sample("svelte-options");
}

#[test]
fn test_print_svelte_self() {
    test_print_sample("svelte-self");
}

#[test]
fn test_print_svelte_window() {
    test_print_sample("svelte-window");
}

// Other Tests
#[test]
fn test_print_attribute() {
    test_print_sample("attribute");
}

#[test]
fn test_print_comment() {
    test_print_sample("comment");
}

#[test]
fn test_print_formatting() {
    test_print_sample("formatting");
}

#[test]
fn test_print_html_document() {
    test_print_sample("html-document");
}

#[test]
fn test_print_script() {
    test_print_sample("script");
}

#[test]
fn test_print_spread_attribute() {
    test_print_sample("spread-attribute");
}

#[test]
fn test_print_style() {
    test_print_sample("style");
}

#[test]
fn test_print_text() {
    test_print_sample("text");
}

// Summary test that runs all tests and reports statistics
#[test]
#[ignore] // Run with: cargo test test_print_all_samples -- --ignored --nocapture
fn test_print_all_samples() {
    let samples = vec![
        "animate-directive",
        "attach-tag",
        "attribute",
        "await-block",
        "bind-directive",
        "block",
        "class-directive",
        "comment",
        "component",
        "const-tag",
        "each-block",
        "expression-tag",
        "formatting",
        "html-document",
        "html-tag",
        "if-block",
        "key-block",
        "let-directive",
        "on-directive",
        "regular-element",
        "render-tag",
        "script",
        "slot-element",
        "snippet-block",
        "spread-attribute",
        "style",
        "style-directive",
        "svelte-boundary",
        "svelte-component",
        "svelte-document",
        "svelte-element",
        "svelte-fragment",
        "svelte-head",
        "svelte-options",
        "svelte-self",
        "svelte-window",
        "text",
        "transition-directive",
        "use-directive",
    ];

    let mut passed = 0;
    let mut failed = 0;
    let mut failed_tests = Vec::new();

    println!("\n=== Running All Print Tests ===\n");

    for sample in &samples {
        print!("Testing {:<30} ... ", sample);

        match std::panic::catch_unwind(|| {
            test_print_sample(sample);
        }) {
            Ok(_) => {
                println!("PASS");
                passed += 1;
            }
            Err(_) => {
                println!("FAIL");
                failed += 1;
                failed_tests.push(*sample);
            }
        }
    }

    let total = samples.len();
    let pass_rate = (passed as f64 / total as f64) * 100.0;

    println!("\n=== Print Test Results ===");
    println!("Total tests: {}", total);
    println!("Passed: {}", passed);
    println!("Failed: {}", failed);
    println!("Pass rate: {:.1}%", pass_rate);

    if !failed_tests.is_empty() {
        println!("\nFailed tests:");
        for test in &failed_tests {
            println!("  - {}", test);
        }
    }

    println!("\n=========================\n");

    // Don't fail the test, just report
    if failed > 0 {
        println!(
            "Note: {} tests failed. Run individual tests for details.",
            failed
        );
    }
}
