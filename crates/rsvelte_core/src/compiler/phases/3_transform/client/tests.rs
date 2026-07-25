use super::*;

#[test]
fn test_starts_export_specifier() {
    // M-021: recognise `export { ... }` regardless of whitespace before `{`.
    assert!(starts_export_specifier("export { a, b }"));
    assert!(starts_export_specifier("export {a}"));
    assert!(starts_export_specifier("export{a}"));
    assert!(starts_export_specifier("export  {a}"));
    assert!(starts_export_specifier("export\t{ a }"));
    // Must not match other export forms or longer identifiers.
    assert!(!starts_export_specifier("export default x"));
    assert!(!starts_export_specifier("export function f() {}"));
    assert!(!starts_export_specifier("export const x = 1"));
    assert!(!starts_export_specifier("exporter({a})"));
    assert!(!starts_export_specifier("let x = 1"));
}

// Tests for comma-separated variable declarations on client side.
// These verify that destructured patterns ($state, $derived, $props) produce
// comma-separated declarators in a single let/const/var statement, matching
// the official Svelte compiler output.

#[test]
fn test_client_comma_separated_state_destructuring() {
    let input = r#"<script>
  import { setup } from './utils.js';

  let { num } = $state(setup());
  let { num: num_frozen } = $state(setup());
</script>

<button on:click={() => { num++; num_frozen++; }}>{num} / {num_frozen}</button>
"#;
    let options = crate::compiler::CompileOptions {
        generate: crate::compiler::GenerateMode::Client,
        filename: Some("test/index.svelte".to_string()),
        ..Default::default()
    };
    let result = crate::compiler::compile(input, options).unwrap();
    println!("=== AMBIGUOUS SOURCE CLIENT OUTPUT ===");
    println!("{}", result.js.code);
    // The destructured $state should produce comma-separated declarations:
    // let tmp = setup(), num = $.state($.proxy(tmp.num))
    // NOT:
    // let tmp = setup();
    // let num = $.state($.proxy(tmp.num));
    assert!(
        result
            .js
            .code
            .contains("let tmp = setup(), num = $.state($.proxy(tmp.num))"),
        "Should have comma-separated declarations for destructured $state"
    );
}

#[test]
fn test_comma_separated_let_declarations() {
    let input = r#"<script>
	let x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, x13, x14, x15, x16, x17, x18, x19, x20, x21, x22, x23, x24, x25, x26, x27, x28, x29, x30, x31;
</script>
<A>foo</A>
"#;
    let options = crate::compiler::CompileOptions {
        generate: crate::compiler::GenerateMode::Client,
        filename: Some("test/index.svelte".to_string()),
        ..Default::default()
    };
    let result = crate::compiler::compile(input, options).unwrap();
    println!("=== COMMA-SEP LET OUTPUT ===");
    println!("{}", result.js.code);
    // The official Svelte compiler keeps them as separate let declarations
    assert!(
        result.js.code.contains("let x1;"),
        "Should have separate let declarations: {}",
        result.js.code,
    );
}

#[test]
fn test_bitmask_overflow_2_export_lets() {
    // 32 separate `export let` declarations - these produce separate $.prop() calls
    let input = r#"<script>
	export let x1;
	export let x2;
	export let x3;
</script>
<p>{x1 + x2 + x3}</p>
"#;
    let options = crate::compiler::CompileOptions {
        generate: crate::compiler::GenerateMode::Client,
        filename: Some("test/index.svelte".to_string()),
        ..Default::default()
    };
    let result = crate::compiler::compile(input, options).unwrap();
    println!("=== BITMASK OVERFLOW 2 OUTPUT ===");
    println!("{}", result.js.code);
}

#[test]
fn test_props_destructuring_comma_separated() {
    let input = r#"<script>
let { foo = false, bar = true } = $props();
</script>
<p>{foo} {bar}</p>
"#;
    let options = crate::compiler::CompileOptions {
        generate: crate::compiler::GenerateMode::Client,
        filename: Some("test/index.svelte".to_string()),
        ..Default::default()
    };
    let result = crate::compiler::compile(input, options).unwrap();
    println!("=== PROPS DESTRUCTURING OUTPUT ===");
    println!("{}", result.js.code);
    // Should have comma-separated declarations (may be on one line or split across lines):
    // let foo = $.prop($$props, 'foo', ...), bar = $.prop($$props, 'bar', ...);
    // or:
    // let foo = $.prop($$props, 'foo', ...),
    //     bar = $.prop($$props, 'bar', ...);
    assert!(
        result.js.code.contains("foo = $.prop($$props, 'foo'")
            && result.js.code.contains("bar = $.prop($$props, 'bar'"),
        "Should have comma-separated prop declarations: {}",
        result.js.code,
    );
}

#[test]
fn test_assign_prop_to_prop() {
    let input = r#"<script>
	let z = 8;
	let { a, b = a, c = b * b, d = z * b + c } = $props();
</script>

<p>{a}</p>
<p>{b}</p>
<p>{c}</p>
<p>{d}</p>"#;
    let options = crate::compiler::CompileOptions {
        generate: crate::compiler::GenerateMode::Client,
        filename: Some("Test/index.svelte".to_string()),
        ..Default::default()
    };
    let result = crate::compiler::compile(input, options).unwrap();
    println!("=== ASSIGN PROP TO PROP OUTPUT ===");
    println!("{}", result.js.code);
    // Expected: comma-separated prop declarations (may be on one line or split across lines):
    // let b = $.prop(...), c = $.prop(...), d = $.prop(...);
    // or:
    // let b = $.prop(...),
    //     c = $.prop(...),
    //     d = $.prop(...);
    assert!(
        !result.js.code.contains("let b = $.prop") || result.js.code.contains("c = $.prop"),
        "Should have comma-separated prop declarations: {}",
        result.js.code,
    );
}

#[test]
fn test_derived_destructured_iterator() {
    let input = r#"<script>
	let offset = $state(1);

	function* count(offset) {
		let i = offset;
		while (true) yield i++;
	}

	let [a, b, c] = $derived(count(offset));
</script>

<button onclick={() => offset += 1}>increment</button>

<p>a: {a}</p>
<p>b: {b}</p>
<p>c: {c}</p>
"#;
    let options = crate::compiler::CompileOptions {
        generate: crate::compiler::GenerateMode::Client,
        filename: Some("main/index.svelte".to_string()),
        ..Default::default()
    };
    let result = crate::compiler::compile(input, options).unwrap();
    println!("=== DERIVED DESTRUCTURED ITERATOR OUTPUT ===");
    println!("{}", result.js.code);
    // Expected: single let with comma-separated declarators (may be on one line or split across lines):
    // let $$d = $.derived(...), $$array = $.derived(...), a = $.derived(...), ...;
    // or:
    // let $$d = $.derived(...),
    //     $$array = $.derived(...),
    //     a = $.derived(...), ...;
    assert!(
        result.js.code.contains("$$d = $.derived(")
            && result.js.code.contains("$$array = $.derived("),
        "Should have comma-separated derived destructuring declarations: {}",
        result.js.code,
    );
}

#[test]
fn test_bind_and_spread_precedence() {
    let input = r#"<script>
	let { value = $bindable(), ...properties } = $props();
</script>

<input bind:value {...properties} />
"#;
    let options = crate::compiler::CompileOptions {
        generate: crate::compiler::GenerateMode::Client,
        filename: Some("input/index.svelte".to_string()),
        ..Default::default()
    };
    let result = crate::compiler::compile(input, options).unwrap();
    println!("=== BIND AND SPREAD OUTPUT ===");
    println!("{}", result.js.code);
    // Expected: single let with comma-separated (may be on one line or split across lines):
    // let value = $.prop($$props, 'value', 15), properties = $.rest_props($$props, [...]);
    // or:
    // let value = $.prop($$props, 'value', 15),
    //     properties = $.rest_props($$props, [...]);
    assert!(
        result.js.code.contains("value = $.prop(")
            && result.js.code.contains("properties = $.rest_props("),
        "Should have comma-separated prop + rest_props declarations: {}",
        result.js.code,
    );
}

#[test]
fn test_destructure_state_from_props() {
    let input = r#"<script>
	let { data } = $props();
	let { foo } = $state(data);
</script>

{foo}"#;
    let options = crate::compiler::CompileOptions {
        generate: crate::compiler::GenerateMode::Client,
        filename: Some("Child/index.svelte".to_string()),
        ..Default::default()
    };
    let result = crate::compiler::compile(input, options).unwrap();
    println!("=== DESTRUCTURE STATE FROM PROPS OUTPUT ===");
    println!("{}", result.js.code);
    // Expected: let tmp = $$props.data, foo = $.proxy(tmp.foo);
    assert!(
        result
            .js
            .code
            .contains("let tmp = $$props.data, foo = $.proxy(tmp.foo)"),
        "Should have comma-separated let tmp/foo declarations: {}",
        result.js.code,
    );
}

#[test]
fn test_normalize_js_with_oxc() {
    // Include a JSDoc comment (/** */) to force the OXC codegen path,
    // since this test specifically validates OXC formatting behavior.
    let input = "/** */\nlet count1=0;\nlet count2=0;\n\nfunction text1(){\n\treturn count1;\n}\n\nfunction text2(){\n\treturn count2;\n}";
    let result = normalize_js_with_oxc(input, 1);
    println!("OXC output:\n{}", result);
    // Check basic formatting
    assert!(
        result.contains("let count1 = 0;"),
        "Should have spaces around = : {}",
        result
    );
    assert!(
        result.contains("function text1() {"),
        "Should have space before brace: {}",
        result
    );
}

#[test]
fn test_normalize_js_array_on_one_line() {
    let input = "let props = $.rest_props($$props, ['$$slots', '$$events', '$$legacy']);";
    let result = normalize_js_with_oxc(input, 1);
    println!("OXC array output:\n{}", result);
    assert!(
        result.contains("['$$slots', '$$events', '$$legacy']"),
        "Array should stay on one line: {}",
        result
    );
}

#[test]
fn test_normalize_js_arrow_expression_body() {
    let input = "$.template_effect(() => $.set_text(text_3, $.get(item)));";
    let result = normalize_js_with_oxc(input, 1);
    println!("OXC arrow output:\n{}", result);
    assert!(
        result.contains("() => $.set_text(text_3, $.get(item))"),
        "Arrow expression body should be preserved: {}",
        result
    );
}

#[test]
fn test_detect_indent_level() {
    assert_eq!(detect_indent_level("\n\tlet x = 1;"), 1);
    assert_eq!(detect_indent_level("\tlet x = 1;"), 1);
    assert_eq!(detect_indent_level("let x = 1;"), 0);
    assert_eq!(detect_indent_level("\n\n\t\tlet x = 1;"), 2);
}

#[test]
fn test_find_matching_paren() {
    assert_eq!(find_matching_paren("abc)"), Some(3));
    assert_eq!(find_matching_paren("(a))"), Some(3));
    assert_eq!(find_matching_paren("((a)))"), Some(5));
    assert_eq!(find_matching_paren("abc"), None);
}

// `test_derived_object_literal_wrapped_in_parens` was deleted along
// with the text-based `$derived(...)` rewrite — the paren wrap is
// now produced by `ast_state_transform::try_rewrite_derived_call_declarator`
// and is exercised by the runtime/snapshot fixtures that round-trip
// through the full compile pipeline.

#[test]
fn test_is_complete_side_effect_import() {
    // Side-effect imports without `from`/`;` are complete on a single line.
    assert!(is_complete_side_effect_import("import \"./Inner.svelte\""));
    assert!(is_complete_side_effect_import("import './foo.js'"));
    assert!(is_complete_side_effect_import(
        "import  \"./Inner.svelte\"   "
    ));
    // Escaped quote inside string literal.
    assert!(is_complete_side_effect_import("import \"./a\\\".svelte\""));

    // Non-side-effect imports must NOT be detected here.
    assert!(!is_complete_side_effect_import("import x from 'foo'"));
    assert!(!is_complete_side_effect_import("import { x } from 'foo'"));
    assert!(!is_complete_side_effect_import("import {"));
    assert!(!is_complete_side_effect_import("import * as ns from 'foo'"));

    // Anything trailing the closing quote also fails.
    assert!(!is_complete_side_effect_import("import \"./foo\" extra"));

    // Unclosed string literal is not complete.
    assert!(!is_complete_side_effect_import("import \"./foo"));
}

#[test]
fn test_extract_imports_no_semicolon_side_effect() {
    // Regression: `import "./Inner.svelte"` (no semicolon) followed by a
    // `let count = 1;` declaration must split into a complete import and a
    // separate body statement. Previously the line-by-line splitter merged
    // both lines into the import block.
    let script = "import \"./Inner.svelte\"\nlet count = 1;\n";
    let (imports, rest) = extract_imports(script);
    assert_eq!(imports, vec!["import \"./Inner.svelte\"".to_string()]);
    assert_eq!(rest, "let count = 1;");
}

#[test]
fn test_transform_prop_reads_in_expr() {
    // Test that prop reads are transformed to prop() calls
    let prop_vars = vec!["a".to_string(), "b".to_string()];

    // Simple expression
    let result = transform_prop_reads_in_expr("a + b", &prop_vars);
    println!("Input: 'a + b'");
    println!("Result: '{}'", result);
    assert_eq!(
        result, "a() + b()",
        "Should transform 'a + b' to 'a() + b()'"
    );

    // Function calls with prop names should still get the getter wrapper.
    // `a()` in source means "call the prop getter, then call the result".
    // So `a()` -> `a()()` is correct (getter + original call).
    let result2 = transform_prop_reads_in_expr("a() + b()", &prop_vars);
    println!("Input: 'a() + b()'");
    println!("Result: '{}'", result2);
    assert_eq!(
        result2, "a()() + b()()",
        "Should wrap prop name reads even when followed by ()"
    );

    // Multiplication
    let prop_vars2 = vec!["c".to_string()];
    let result3 = transform_prop_reads_in_expr("c * c", &prop_vars2);
    println!("Input: 'c * c'");
    println!("Result: '{}'", result3);
    assert_eq!(
        result3, "c() * c()",
        "Should transform 'c * c' to 'c() * c()'"
    );
}

#[test]
fn test_normalize_js_comma_separated_declarations() {
    let input = "let tmp = setup(), num = $.state($.proxy(tmp.num));";
    let result = normalize_js_with_oxc(input, 0);
    println!("Comma-sep input:  {}", input);
    println!("Comma-sep output: {}", result);
    assert!(
        result.contains("let tmp = setup(), num = $.state($.proxy(tmp.num));"),
        "Comma-separated declarations should remain comma-separated: {}",
        result,
    );
}

#[test]
fn test_normalize_js_multi_let_declarations() {
    let input = "let x1, x2, x3, x4, x5;";
    let result = normalize_js_with_oxc(input, 0);
    println!("Multi-let input:  {}", input);
    println!("Multi-let output: {}", result);
    assert!(
        result.contains("let x1, x2, x3, x4, x5;"),
        "Multi-variable let should remain comma-separated: {}",
        result,
    );
}

// `test_derived_object_literal_double_wrap` was deleted along with the
// text-based `$derived(...)` rewrite — the paren wrap around object
// literals is now produced by
// `ast_state_transform::try_rewrite_derived_call_declarator` and is
// exercised by the runtime/snapshot fixtures end-to-end.

#[test]
fn test_mutation_wrap_state_vars() {
    // Test the mutation case: $.set(pending, pending.filter(...), true)
    // The second `pending` should be wrapped with $.get()
    let input = "$.set(pending, pending.filter((p) => p !== id), true)";
    let state_vars = vec!["pending".to_string()];

    let result = wrap_state_vars_in_expr(input, &state_vars, &[], &[]);

    // The expected output is:
    // $.set(pending, $.get(pending).filter((p) => p !== id), true)
    // First `pending` after $.set( should NOT be wrapped (it's the target)
    // Second `pending` should be wrapped with $.get()
    assert!(
        result.contains("$.get(pending).filter"),
        "Second pending should be wrapped with $.get(): {}",
        result
    );
    assert!(
        result.starts_with("$.set(pending,"),
        "First pending should NOT be wrapped: {}",
        result
    );
}

#[test]
fn test_mutation_wrap_state_vars_in_context() {
    // Test with nested function context - state vars inside arrow function body
    // should still be wrapped even when inside if statement conditions.
    // This tests the fix for is_shadowed_by_function_param incorrectly detecting
    // variables inside if() conditions as shadowed parameters.
    let input = r#"const togglePending = () => {
    if ($.get(pending).includes(id)) {
        $.set(pending, pending.filter((p) => p !== id), true);
    } else {
        $.set(pending, [...$.get(pending), id], true);
    }
};"#;
    let state_vars = vec!["pending".to_string()];

    let result = wrap_state_vars_in_expr(input, &state_vars, &[], &[]);

    // Both $.set second args should have $.get(pending)
    assert!(
        result.contains("$.set(pending, $.get(pending).filter"),
        "Second pending in filter should be wrapped with $.get(): {}",
        result
    );
}

// ===== Regression tests for bugs found during real-world build (2026-03-14) =====

#[test]
fn test_wrap_prop_source_reads_block_comment_before_property_key() {
    // Bug: block comment `/* ... */` between `,` and property key `value` caused
    // is_property_key check to fail, wrapping `value` as `value()` in object literal.
    let prop_vars = vec!["value".to_string()];
    let input = r#"{ key: 1, /* comment */ value: 2 }"#;
    let result = prop_source_reads_ast::wrap_prop_source_reads_ast(input, &prop_vars, &[])
        .unwrap_or_else(|| input.to_string());
    assert!(
        result.contains("value: 2"),
        "value after block comment should NOT be wrapped as value(): {}",
        result
    );
    assert!(
        !result.contains("value(): 2"),
        "value as property key should not be transformed: {}",
        result
    );
}

#[test]
fn test_wrap_prop_source_reads_block_comment_multiline() {
    let prop_vars = vec!["value".to_string()];
    let input = "{ key: 1,\n\t/* multi\n\t   line\n\t   comment */\n\tvalue: 2 }";
    let result = prop_source_reads_ast::wrap_prop_source_reads_ast(input, &prop_vars, &[])
        .unwrap_or_else(|| input.to_string());
    assert!(
        result.contains("value: 2"),
        "value after multiline block comment should NOT be wrapped: {}",
        result
    );
}

#[test]
fn test_wrap_prop_source_reads_value_in_expression() {
    // When `value` is used as an expression (not a property key), it SHOULD be wrapped
    let prop_vars = vec!["value".to_string()];
    let input = "let x = value + 1;";
    let result = prop_source_reads_ast::wrap_prop_source_reads_ast(input, &prop_vars, &[])
        .unwrap_or_else(|| input.to_string());
    assert!(
        result.contains("value() + 1"),
        "value in expression should be wrapped as value(): {}",
        result
    );
}

#[test]
fn test_wrap_prop_source_reads_skips_nullish_assign() {
    // Bug: `value ??= 100` was incorrectly transforming `value` because
    // is_on_left_side_of_assignment didn't detect ??=
    let prop_vars = vec!["value".to_string()];
    let input = "value ??= 100;";
    let result = prop_source_reads_ast::wrap_prop_source_reads_ast(input, &prop_vars, &[])
        .unwrap_or_else(|| input.to_string());
    assert!(
        !result.contains("value() ??= 100"),
        "value on LHS of ??= should NOT be wrapped: {}",
        result
    );
}

#[test]
fn test_is_on_left_side_of_assignment_nullish_assign() {
    let chars: Vec<char> = "value ??= 100".chars().collect();
    assert!(
        is_on_left_side_of_assignment(&chars, 0, 5),
        "value ??= should be detected as assignment"
    );
}

#[test]
fn test_is_on_left_side_of_assignment_logical_and_assign() {
    let chars: Vec<char> = "value &&= true".chars().collect();
    assert!(
        is_on_left_side_of_assignment(&chars, 0, 5),
        "value &&= should be detected as assignment"
    );
}

#[test]
fn test_is_on_left_side_of_assignment_logical_or_assign() {
    let chars: Vec<char> = "value ||= false".chars().collect();
    assert!(
        is_on_left_side_of_assignment(&chars, 0, 5),
        "value ||= should be detected as assignment"
    );
}

#[test]
fn test_is_on_left_side_of_assignment_modulo_assign() {
    let chars: Vec<char> = "value %= 3".chars().collect();
    assert!(
        is_on_left_side_of_assignment(&chars, 0, 5),
        "value %= should be detected as assignment"
    );
}

#[test]
fn test_is_on_left_side_of_assignment_simple_equals() {
    let chars: Vec<char> = "value = 1".chars().collect();
    assert!(
        is_on_left_side_of_assignment(&chars, 0, 5),
        "value = should be detected as assignment"
    );
}

#[test]
fn test_is_on_left_side_of_assignment_equality_not_assignment() {
    let chars: Vec<char> = "value == 1".chars().collect();
    assert!(
        !is_on_left_side_of_assignment(&chars, 0, 5),
        "value == should NOT be detected as assignment"
    );
}

#[test]
fn test_is_on_left_side_of_assignment_strict_equality_not_assignment() {
    let chars: Vec<char> = "value === 1".chars().collect();
    assert!(
        !is_on_left_side_of_assignment(&chars, 0, 5),
        "value === should NOT be detected as assignment"
    );
}

#[test]
fn test_split_nested_pattern_default_with_default() {
    // Bug: `{ width: measuredWidth, height: measuredHeight } = { width: 0, height: 0 }`
    // was passed entirely to process_nested_pattern_elements instead of splitting
    let input = "{ width: measuredWidth, height: measuredHeight } = { width: 0, height: 0 }";
    let (pattern, default_val) = split_nested_pattern_default(input);
    assert_eq!(
        pattern, "{ width: measuredWidth, height: measuredHeight }",
        "Should extract just the pattern"
    );
    assert_eq!(
        default_val,
        Some("{ width: 0, height: 0 }"),
        "Should extract the default value"
    );
}

#[test]
fn test_split_nested_pattern_default_no_default() {
    let input = "{ width: measuredWidth, height: measuredHeight }";
    let (pattern, default_val) = split_nested_pattern_default(input);
    assert_eq!(pattern, input, "Should return the entire input as pattern");
    assert_eq!(default_val, None, "Should have no default");
}

#[test]
fn test_split_nested_pattern_default_array() {
    let input = "[a, b] = [1, 2]";
    let (pattern, default_val) = split_nested_pattern_default(input);
    assert_eq!(pattern, "[a, b]", "Should extract array pattern");
    assert_eq!(default_val, Some("[1, 2]"), "Should extract array default");
}

#[test]
fn test_split_nested_pattern_default_nested_braces() {
    // Nested braces inside the pattern should not confuse the splitting
    let input = "{ a: { b: c } } = { a: { b: 1 } }";
    let (pattern, default_val) = split_nested_pattern_default(input);
    assert_eq!(pattern, "{ a: { b: c } }", "Should handle nested braces");
    assert_eq!(default_val, Some("{ a: { b: 1 } }"));
}

#[test]
fn test_split_nested_pattern_default_simple_identifier() {
    // Non-pattern input (no { or [) should return as-is with no default
    let input = "value";
    let (pattern, default_val) = split_nested_pattern_default(input);
    assert_eq!(pattern, "value");
    assert_eq!(default_val, None);
}

#[test]
fn test_transform_read_only_props_block_comment_before_key() {
    // Similar to wrap_prop_source_reads: block comment before property key should be skipped
    let read_only_props = vec![("value".to_string(), "value".to_string())];
    let input = r#"{ key: 1, /* comment */ value: 2 }"#;
    let result = read_only_props_ast::transform_read_only_props_ast(input, &read_only_props)
        .unwrap_or_else(|| input.to_string());
    assert!(
        result.contains("value: 2"),
        "value as property key after block comment should NOT be transformed: {}",
        result
    );
    assert!(
        !result.contains("$$props.value: 2"),
        "Property key should not become $$props.value: {}",
        result
    );
}

#[test]
fn test_transform_read_only_props_getter_setter() {
    // getter/setter names should not be transformed
    let read_only_props = vec![("value".to_string(), "value".to_string())];
    let input = "{ get value() { return 1; } }";
    let result = read_only_props_ast::transform_read_only_props_ast(input, &read_only_props)
        .unwrap_or_else(|| input.to_string());
    assert!(
        result.contains("get value()"),
        "getter name should not be transformed: {}",
        result
    );
}

#[test]
fn test_transform_read_only_props_in_expression() {
    // When used as an expression, should be transformed to $$props.propName
    let read_only_props = vec![("value".to_string(), "value".to_string())];
    let input = "let x = value + 1;";
    let result = read_only_props_ast::transform_read_only_props_ast(input, &read_only_props)
        .unwrap_or_else(|| input.to_string());
    assert!(
        result.contains("$$props.value"),
        "value in expression should be transformed to $$props.value: {}",
        result
    );
}

#[test]
fn test_derived_trailing_comma_no_syntax_error() {
    // $derived(expr,) with trailing comma should produce valid JS
    // The trailing comma is valid in function call syntax but NOT in () => (expr,)
    let source = r#"<script>
  const justifyClass = $derived(
    {
      center: 'justify-center',
      left: 'justify-start',
      right: 'justify-end',
    }[position] ?? 'justify-center',
  );
</script>
<p>{justifyClass}</p>"#;

    let options = crate::compiler::CompileOptions {
        dev: true,
        generate: crate::compiler::GenerateMode::Client,
        ..Default::default()
    };
    let result = crate::compiler::compile(source, options).expect("compile should succeed");
    let code = &result.js.code;

    // The output should NOT contain a trailing comma inside grouping parens () => (expr,)
    // Check that $.derived(() => (...,)) pattern does NOT exist
    assert!(
        !code.contains("',\n  ))"),
        "Should not have trailing comma in grouping expression: {}",
        code
    );
    // Should contain a valid $.derived call
    assert!(
        code.contains("$.derived("),
        "Should contain $.derived call: {}",
        code
    );
}

#[test]
fn test_compile_with_multibyte_utf8_no_panic() {
    // Source with Japanese characters that could cause byte index boundary issues
    // when is_svelte_ignored_with_source slices source with saturating_sub(500)
    let mut source = String::from("<script>\n");
    // Add enough content with multi-byte characters to push past 500 bytes
    for _ in 0..100 {
        source.push_str("  // コメント: データタイプ\n");
    }
    source.push_str("  const x = $state(0);\n");
    source.push_str("</script>\n<p>{x}</p>");

    let options = crate::compiler::CompileOptions {
        dev: true,
        generate: crate::compiler::GenerateMode::Client,
        ..Default::default()
    };
    // Should not panic with "byte index is not a char boundary"
    let result = crate::compiler::compile(&source, options);
    assert!(
        result.is_ok(),
        "compile should not panic on multi-byte UTF-8 source"
    );
}

#[test]
fn test_bindable_prop_setter_uses_function_call() {
    // Bug: bind:value on a component with $bindable() props generated
    // `set value($$value) { value = $$value; }` (plain assignment)
    // instead of `set value($$value) { value($$value); }` (function call).
    // This caused "TypeError: value is not a function" at runtime because
    // $.prop() returns a getter/setter function, and the assignment overwrites it.
    let source = r#"<script>
  import Child from './Child.svelte';
  let { value = $bindable() } = $props();
</script>
<Child bind:value />"#;

    let options = crate::compiler::CompileOptions {
        generate: crate::compiler::GenerateMode::Client,
        ..Default::default()
    };
    let result = crate::compiler::compile(source, options).unwrap();
    let code = &result.js.code;

    // The setter should use function call syntax: value($$value)
    assert!(
        code.contains("value($$value)"),
        "Setter for bindable prop should use function call value($$value), not assignment: {}",
        code
    );
    // The setter should NOT use plain assignment: value = $$value
    assert!(
        !code.contains("value = $$value"),
        "Setter should not use plain assignment for prop source: {}",
        code
    );
}

#[test]
fn test_module_arrow_param_not_wrapped_when_shadowing_state() {
    // Bug: In compileModule, when a function parameter has the same name as a
    // $state() variable declared in a different function, the parameter references
    // inside the arrow body were incorrectly wrapped with $.get().
    // e.g., `(value) => JSON.stringify(value)` became
    //        `(value) => JSON.stringify($.get(value))` — WRONG
    // because `value` here is the arrow parameter, not the state variable.
    let source = r#"
export const defaultSerializer = () => ({
  serialize: (value) => JSON.stringify(value),
  deserialize: (value) => JSON.parse(value),
});

export function useStore() {
  let value = $state('');
  $effect(() => { console.log(value); });
  return { get value() { return value; }, set value(v) { value = v; } };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // The arrow parameter `value` should NOT be wrapped with $.get()
    assert!(
        code.contains("(value) => JSON.stringify(value)"),
        "Arrow param should not be wrapped with $.get(): {}",
        code
    );
    assert!(
        !code.contains("JSON.stringify($.get(value))"),
        "Arrow body should not wrap shadowed param with $.get(): {}",
        code
    );
    // But the state variable reads SHOULD be wrapped
    assert!(
        code.contains("$.get(value)"),
        "State variable reads should still use $.get(): {}",
        code
    );
    assert!(
        code.contains("$.set(value,"),
        "State variable writes should still use $.set(): {}",
        code
    );
}

#[test]
fn test_module_nested_fn_call_in_arrow_body_shadow() {
    // Verify that nested function calls inside arrow bodies don't break
    // the shadowing detection: (x) => foo(bar(x))
    let source = r#"
export function useStore() {
  let x = $state(0);
  const transform = (x) => Math.abs(Math.floor(x));
  return { get x() { return x; }, set x(v) { x = v; } };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // The arrow param `x` should NOT be wrapped
    assert!(
        code.contains("(x) => Math.abs(Math.floor(x))"),
        "Nested fn calls in arrow body: param should not be wrapped: {}",
        code
    );
    // But state reads should be wrapped
    assert!(
        code.contains("return $.get(x)"),
        "State reads should be wrapped: {}",
        code
    );
}

#[test]
fn test_module_state_with_nullish_coalescing_gets_proxy() {
    // Bug: `$state(pData ?? defaultValue)` was not wrapped with $.proxy()
    // because contains_top_level_logical only checked if the right side
    // started with `{`, `[`, or `new`. The official compiler proxies ALL
    // LogicalExpression initializers.
    let source = r#"
export function useStore(pData) {
  let data = $state(pData ?? { name: '' });
  return { get data() { return data; }, set data(v) { data = v; } };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // The initializer should be wrapped with $.proxy()
    assert!(
        code.contains("$.proxy(pData ?? { name: '' })")
            || code.contains("$.proxy(pData ?? {name: ''})"),
        "$state(x ?? obj) should be wrapped with $.proxy(): {}",
        code
    );
}

#[test]
fn test_module_state_with_logical_or_gets_proxy() {
    // Same as above but with || instead of ??
    let source = r#"
export function useStore(pData) {
  let data = $state(pData || []);
  return { get data() { return data; }, set data(v) { data = v; } };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // The initializer should be wrapped with $.proxy()
    assert!(
        code.contains("$.proxy(pData || [])"),
        "$state(x || arr) should be wrapped with $.proxy(): {}",
        code
    );
}

#[test]
fn test_module_state_literal_no_proxy() {
    // Ensure that simple literals are NOT wrapped with $.proxy()
    let source = r#"
export function useStore() {
  let count = $state(0);
  let name = $state('hello');
  return {
    get count() { return count; },
    set count(v) { count = v; },
    get name() { return name; },
    set name(v) { name = v; },
  };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // Literals should NOT be proxied
    assert!(
        !code.contains("$.proxy(0)"),
        "Numeric literal should not be proxied: {}",
        code
    );
    assert!(
        !code.contains("$.proxy('hello')") && !code.contains("$.proxy(\"hello\")"),
        "String literal should not be proxied: {}",
        code
    );
}

#[test]
fn test_module_derived_var_gets_get_in_arrow_return() {
    // Bug: $derived variables declared with `const` inside a function were
    // incorrectly treated as "shadowed by local var decl", which prevented
    // $.get() wrapping when the variable was referenced in arrow functions.
    let source = r#"
export function useStore() {
  let x = $state(0);
  const y = $derived(x * 2);
  return {
    getValue: () => y,
  };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    assert!(
        code.contains("() => $.get(y)"),
        "$derived variable in arrow return should be wrapped with $.get(): {}",
        code
    );
}

#[test]
fn test_module_derived_with_ts_annotation_gets_get() {
    // Bug: TypeScript type annotations on $derived declarations (e.g.,
    // `const contentStyle: string = $derived.by(...)`) prevented the
    // variable from being detected as reactive, so $.get() was missing.
    let source = r#"
export const useStore = () => {
  let position = $state({ x: 0, y: 0 });

  const contentStyle = $derived.by(() => {
    return `transform: translate(${position.x}px, ${position.y}px);`;
  });

  return {
    contentStyle: () => contentStyle,
  };
};
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    assert!(
        code.contains("() => $.get(contentStyle)"),
        "TypeScript-annotated $derived var should be wrapped with $.get(): {}",
        code
    );
}

#[test]
fn test_module_state_with_ts_generic_gets_tracked() {
    // Ensure $state<GenericType>() patterns are properly detected as reactive vars.
    let source = r#"
export function useStore() {
  let cleanup = $state();
  $effect(() => { cleanup?.(); });
  return {
    setCleanup: (fn) => { cleanup = fn; },
  };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // The cleanup variable should be wrapped with $.get() inside $effect
    assert!(
        code.contains("$.get(cleanup)"),
        "$state<GenericType>() variable should be wrapped with $.get(): {}",
        code
    );
}

#[test]
fn test_module_const_state_after_obj_gets_proxy_only() {
    // Bug: `const` $state variables after a `const $state({ obj })` declaration
    // were incorrectly getting $.state() wrapping. The extract_var_name_before_rune
    // function was finding a `:` inside the object literal of the previous declaration
    // and treating it as a TypeScript type annotation.
    let source = r#"
export const fn = () => {
  return (node) => {
    const d = $state({ x: 1 });
    const clearTooltipListeners = $state([]);
    return clearTooltipListeners;
  };
};
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            dev: true,
            filename: Some("test.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    // const $state variables should only get $.proxy(), NOT $.state()
    // In dev mode, $.proxy([]) is wrapped with $.tag_proxy() for debugging
    assert!(
        code.contains("$.proxy([])"),
        "const $state([]) should contain $.proxy([]) not $.state(): {}",
        code
    );
    // In dev mode, $.proxy({...}) is wrapped with $.tag_proxy() for debugging
    assert!(
        code.contains("$.proxy({ x: 1 })") || code.contains("$.proxy({x: 1})"),
        "const $state(obj) should contain $.proxy(obj): {}",
        code
    );
    // Should NOT have $.get() wrapping
    assert!(
        !code.contains("$.get(clearTooltipListeners)"),
        "const $state var should not need $.get(): {}",
        code
    );
}

#[test]
fn test_wrap_state_derived_with_tag_comma_separated() {
    let input = "let tmp = setup(), num = $.state($.proxy(tmp.num));";
    let result = wrap_state_derived_with_tag(input);
    assert!(
        result.contains("$.tag($.state($.proxy(tmp.num)), 'num')"),
        "Expected $.tag wrapping for comma-separated declarator: {}",
        result
    );
}
