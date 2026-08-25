use super::*;

#[test]
fn retained_instance_statements_match_a_normalized_script_after_import_hoisting() {
    let source =
        "\n\timport { onMount } from 'svelte';\n\n\tonMount(() => {\n\t\tconsole.log(42);\n\t});\n";
    let retained = crate::ast::oxc_program::RetainedProgram::parse(source, false);
    let normalized = normalize_js_with_oxc("onMount(() => {\n\t\tconsole.log(42);\n\t});", 1);

    assert_eq!(
        retained_instance_statement_indices(&retained, source, &normalized),
        Some(vec![1])
    );
}

#[test]
fn retained_instance_script_preserves_identifier_and_literal_source_map_spans() {
    let source =
        "<script>\nimport dependency from 'dependency';\nconst answer = 42;\n</script>\n<p>ok</p>";
    let result = crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            filename: Some("retained-source-map.svelte".to_string()),
            enable_sourcemap: true,
            ..Default::default()
        },
    )
    .expect("compiles");
    let map: serde_json::Value =
        serde_json::from_str(result.js.map.as_deref().expect("map")).expect("valid source map");
    let mappings = crate::compiler::phases::phase3_transform::js_ast::codegen::decode_vlq_mappings(
        map["mappings"].as_str().expect("VLQ mappings"),
    );

    assert!(
        result
            .js
            .code
            .contains("import dependency from 'dependency';"),
        "hoisted import must retain its normal output: {}",
        result.js.code
    );
    let generated_line = result
        .js
        .code
        .lines()
        .position(|line| line.contains("const answer = 42;"))
        .expect("retained script is printed") as i64;
    let generated = result.js.code.lines().nth(generated_line as usize).unwrap();
    let answer_column = generated.find("answer").unwrap() as i64;
    let literal_column = generated.find("42").unwrap() as i64;

    let line = &mappings[generated_line as usize];
    assert!(
        line.iter()
            .any(|segment| segment.as_slice() == [answer_column, 0, 2, 6]),
        "answer must retain its original token span; generated={generated:?}, segments={line:?}"
    );
    assert!(
        line.iter()
            .any(|segment| segment.as_slice() == [literal_column, 0, 2, 15]),
        "literal must retain its original token span; generated={generated:?}, segments={line:?}"
    );
}

#[test]
fn own_line_comments_in_template_arrow_bodies_stay_with_the_following_statement() {
    let source = r#"<Story play={async () => {
	// first
	await first();

	// second
	await second();
}} />"#;
    let result = crate::compiler::compile(source, Default::default()).expect("compiles");

    assert!(
        result.js.code.contains("// first\n\t\t\tawait first();"),
        "{}",
        result.js.code
    );
    assert!(
        result.js.code.contains("// second\n\t\t\tawait second();"),
        "{}",
        result.js.code
    );

    let allocator = oxc_allocator::Allocator::default();
    let parsed =
        oxc_parser::Parser::new(&allocator, &result.js.code, oxc_span::SourceType::mjs()).parse();
    assert!(parsed.diagnostics.is_empty(), "{}", result.js.code);
}

#[test]
fn story_play_comments_do_not_make_client_output_unparseable() {
    let source = r#"<script module>
	const { Story } = defineMeta({});
</script>

<Story play={async ({ args, canvas, userEvent }) => {
	// Simulate a user filling out the form
	await userEvent.type(canvas.getByTestId('email'), 'email@provider.com');
	await userEvent.type(canvas.getByTestId('password'), 'a-random-password');
	await userEvent.click(canvas.getByRole('button'));

	// Run assertions
	await expect(args.onSubmit).toHaveBeenCalledTimes(1);
	await expect(canvas.getByText('You’re in!')).toBeInTheDocument();
}} />"#;
    let result = crate::compiler::compile(source, Default::default()).expect("compiles");

    assert!(
        result
            .js
            .code
            .contains("// Run assertions\n\t\t\tawait expect(args.onSubmit)"),
        "{}",
        result.js.code
    );

    let allocator = oxc_allocator::Allocator::default();
    let parsed =
        oxc_parser::Parser::new(&allocator, &result.js.code, oxc_span::SourceType::mjs()).parse();
    assert!(parsed.diagnostics.is_empty(), "{}", result.js.code);
}

#[test]
fn comments_in_removed_props_declarations_are_retained() {
    let source = r#"<script lang="ts">
	let {
		children,
		handle, // query
		close,
	} = $props();

	let left = $state(0);
	$effect(() => {});
</script>
<section>{@render children()}</section>"#;
    let result = crate::compiler::compile(source, Default::default()).expect("compiles");
    assert!(
        result.js.code.contains("// query\n\tlet left ="),
        "{}",
        result.js.code
    );
}

#[test]
fn snapshot_ignore_survives_an_intervening_comment() {
    assert!(has_snapshot_ignore_before(
        "// svelte-ignore state_snapshot_uncloneable\n/* inserted } comment */"
    ));
    assert!(!has_snapshot_ignore_before("let value = 1;\n/* comment */"));
}

#[test]
fn shadowed_state_scan_ignores_comment_braces() {
    let script = "let value = 0;\nconst factory = () => {\n  let value = $state(1);\n  /* } comment */\n  return value;\n};";
    assert!(extract_shadowed_state_names(script).contains("value"));
}

#[test]
fn same_line_legacy_export_declaration_does_not_consume_the_next_statement() {
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    let result = crate::compiler::compile(
        "<script>export let name = 'x'; let n = 0;</script><h1>{name}{n}</h1>",
        crate::compiler::CompileOptions {
            filename: Some("same-line-export.svelte".to_string()),
            runes: Some(false),
            ..Default::default()
        },
    )
    .unwrap();

    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, &result.js.code, SourceType::mjs()).parse();
    assert!(
        !parsed.panicked && parsed.diagnostics.is_empty(),
        "generated client output must parse:\n{}",
        result.js.code
    );
    assert!(result.js.code.contains("let n = 0;"));
}

#[test]
fn block_comment_after_final_inspect_precedes_generated_element_variable() {
    let result = crate::compiler::compile(
        "<script>\n\tlet a = 1;\n\t$inspect(a); /* c */\n</script>\n\n<p>{a}</p>\n",
        crate::compiler::CompileOptions {
            filename: Some("inspect-trailing-block.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(
        result.js.code.contains(";; /* c */\n\n\tvar p = root();"),
        "the comment must trail the `;;` hole, ahead of the generated declaration:\n{}",
        result.js.code
    );
    assert!(
        !result.js.code.contains("var /* c */"),
        "a comment must not be placed between `var` and its declarator:\n{}",
        result.js.code
    );
}

#[test]
fn invalidation_single_dependency_keeps_sequence_parentheses() {
    let result = crate::compiler::compile(
        "<script>let list = [1];</script>{#each list as item}<input bind:value={item}>{/each}",
        crate::compiler::CompileOptions {
            filename: Some("each-sequence.svelte".to_string()),
            runes: Some(false),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(
        result
            .js
            .code
            .contains("$.invalidate_inner_signals(() => (")
    );
    assert!(!result.js.code.contains("__rsvelte_seq1"));
}

#[test]
fn is_argument_inherits_later_complex_scope_bump() {
    let result = crate::compiler::compile(
        "<div class=\"a\"><div class=\"b\"></div></div><style>:is(.a) > .b { color: red; }</style>",
        crate::compiler::CompileOptions {
            filename: Some("is-specificity.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let css = result.css.unwrap().code;

    assert!(
        css.starts_with(":is(.a:where(.svelte-"),
        "the :is() argument must inherit the later scope bump:\n{css}"
    );
}

#[test]
fn is_unused_branch_keeps_its_source_position() {
    let result = crate::compiler::compile(
        "<div class=\"b\"></div><style>:is(.a, .b) { color: red; }</style>",
        crate::compiler::CompileOptions {
            filename: Some("is-unused.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let css = result.css.unwrap().code;

    assert!(
        css.starts_with(":is(/* (unused) .a,*/ .b"),
        "the leading unused branch must stay before the surviving branch:\n{css}"
    );
}

#[test]
fn functional_pseudo_compound_gets_an_outer_scope_class() {
    let result = crate::compiler::compile(
        "<div class=\"a b\"></div><style>:is(.a):is(.b) { color: red; }</style>",
        crate::compiler::CompileOptions {
            filename: Some("functional-pseudo.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(
        result.css.unwrap().code.starts_with(".svelte-"),
        "a compound of functional pseudo-classes must receive an outer scope class"
    );
}

#[test]
fn root_has_compound_scopes_its_matching_element() {
    let result = crate::compiler::compile(
        "<div class=\"a\"></div><style>:root.x:has(.a) { color: red; }</style>",
        crate::compiler::CompileOptions {
            filename: Some("root-has.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(
        result.js.code.contains("a svelte-"),
        "the :has() argument element must receive the scope class:\n{}",
        result.js.code
    );
}

#[test]
fn nonreactive_each_collection_does_not_invalidate_inner_signals() {
    let result = crate::compiler::compile(
        "{#each [1, 2] as item}<input bind:value={item}>{/each}",
        crate::compiler::CompileOptions {
            filename: Some("each-static.svelte".to_string()),
            runes: Some(false),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(!result.js.code.contains("$.invalidate_inner_signals"));
}

#[test]
fn reactive_each_collection_still_invalidates_inner_signals() {
    let result = crate::compiler::compile(
        "<script>let list = [1, 2];</script>{#each list as item}<input bind:value={item}>{/each}",
        crate::compiler::CompileOptions {
            filename: Some("each-reactive.svelte".to_string()),
            runes: Some(false),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(result.js.code.contains("$.invalidate_inner_signals"));
}

#[test]
fn event_handler_identifier_stays_unwrapped_with_source_span() {
    let result = crate::compiler::compile(
        "<script>function run() {} let value = 0; switch (value) { case 1: break; }</script><button onclick={run}>run</button>",
        crate::compiler::CompileOptions {
            filename: Some("event-handler-identifier.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(
        result
            .js
            .code
            .contains("$.delegated('click', button, run);"),
        "{}",
        result.js.code
    );
}

#[test]
fn block_comment_before_binary_rhs_keeps_the_rhs_in_the_initializer() {
    let result = crate::compiler::compile(
        "<script>let g = 1;\nlet x = g + /* ; ) } c */\n\th;</script>",
        crate::compiler::CompileOptions::default(),
    )
    .unwrap();

    assert!(
        !result.js.code.contains("g + /* ; ) } c */)"),
        "binary RHS was cut off by the block comment:\n{}",
        result.js.code
    );
}

#[test]
fn template_iife_keeps_a_class_declaration() {
    let result = crate::compiler::compile(
        "<p>{(() => { class T {} return new T(); })()}</p>",
        crate::compiler::CompileOptions::default(),
    )
    .unwrap();
    assert!(result.js.code.contains("class T"), "{}", result.js.code);
}

#[test]
fn retained_module_program_avoids_comment_reparse() {
    MODULE_COMMENT_REPARSES.with(|count| count.set(0));
    let source = r#"<script module>
// omitted
export const answer = 42;

export function nested() {
    // kept
    return answer;
}
</script>

<p>{answer}</p>
"#;
    let result = crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("retained/index.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(!result.js.code.contains("// omitted"));
    assert!(result.js.code.contains("// kept"));
    MODULE_COMMENT_REPARSES.with(|count| assert_eq!(count.get(), 0));
}

#[test]
fn module_comments_after_a_located_body_survive() {
    let source = r#"<script module>
class Counter {
    n = $state(0);
    static {
        // kept-static
    }
}
// kept-after-class
{
    // kept-in-block
}
// kept-after-block
export const answer = 42;
</script>

<p>{answer}</p>
"#;
    let result = crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            ..Default::default()
        },
    )
    .unwrap();

    for kept in [
        "// kept-static",
        "// kept-after-class",
        "// kept-in-block",
        "// kept-after-block",
    ] {
        assert!(result.js.code.contains(kept), "{kept}\n{}", result.js.code);
    }
}

#[test]
fn a_script_comment_maps_before_the_template_expression_it_precedes() {
    let source = r#"<script>
  // "data" prop contains property "result"
  let { data } = $props();
</script>
{data.result}
"#;
    let result = crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            ..Default::default()
        },
    )
    .unwrap();

    assert!(
        result.js.code.contains(
            "$.set_text(\n\t\ttext,\n\t\t// \"data\" prop contains property \"result\"\n\t\t$$props.data.result\n\t)"
        ),
        "{}",
        result.js.code
    );
}

#[test]
fn a_snippet_shadowing_a_prop_still_reads_the_prop_statically() {
    // The read transform receives the identifier inside its span wrapper, and a
    // member property is chosen by variant: `$$props[children]` is what an
    // unrecognised wrapper prints as, and it is a different program.
    let source = r#"<script>
	import Canvas from './Canvas.svelte';
	let { children, ...restProps } = $props();
</script>

<Canvas {...restProps}>
	{#snippet children(props)}
		{@render children?.(props)}
	{/snippet}
</Canvas>
"#;
    let result = crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            ..Default::default()
        },
    )
    .unwrap();

    assert!(
        result.js.code.contains("$$props.children?.("),
        "{}",
        result.js.code
    );
    assert!(
        !result.js.code.contains("$$props[children]"),
        "{}",
        result.js.code
    );
}

#[test]
fn retained_instance_program_avoids_state_transform_reparse() {
    AST_STATE_REPARSES.with(|count| count.set(0));
    AST_STATE_RETAINED_USES.with(|count| count.set(0));
    let source = r#"<script>
import { noop } from 'helpers';

let count = $state(0);
const read = () => count;
noop(read);
</script>

<button onclick={() => count++}>{count}</button>
"#;
    let result = crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("retained-state/index.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(result.js.code.contains("let count = $.state(0)"));
    assert!(result.js.code.contains("() => $.get(count)"));
    AST_STATE_RETAINED_USES.with(|count| assert_eq!(count.get(), 1));
    AST_STATE_REPARSES.with(|count| assert_eq!(count.get(), 0));
}

#[test]
fn retained_typescript_program_avoids_reparse_when_stripping_is_a_noop() {
    AST_STATE_REPARSES.with(|count| count.set(0));
    AST_STATE_RETAINED_USES.with(|count| count.set(0));
    let source = r#"<script lang="ts">
let count = $state(0);
const read = () => count;
</script>

<button onclick={() => count++}>{read()}</button>
"#;
    let result = crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("retained-state-typescript-js-subset/index.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(result.js.code.contains("let count = $.state(0)"));
    assert!(result.js.code.contains("() => $.get(count)"));
    AST_STATE_RETAINED_USES.with(|count| assert_eq!(count.get(), 1));
    AST_STATE_REPARSES.with(|count| assert_eq!(count.get(), 0));
}

#[test]
fn retained_typescript_program_avoids_analysis_strip_reparse() {
    use crate::compiler::phases::phase2_analyze::types::STRIP_TYPESCRIPT_REPARSES;

    STRIP_TYPESCRIPT_REPARSES.with(|count| count.set(0));
    let source = r#"<script lang="ts">
interface Props { initial: number }
let count: number = $state<number>(0);
</script>

<button onclick={() => count++}>{count}</button>
"#;
    let result = crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("retained-typescript-strip/index.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(result.js.code.contains("let count = $.state(0)"));
    STRIP_TYPESCRIPT_REPARSES.with(|count| assert_eq!(count.get(), 0));
}

#[test]
fn retained_typescript_projection_avoids_state_transform_reparse() {
    AST_STATE_REPARSES.with(|count| count.set(0));
    AST_STATE_RETAINED_USES.with(|count| count.set(0));
    let source = r#"<script lang="ts">
import type { Widget } from './types';
import { noop } from './helpers';
let count: number = $state(0);
const read = (value: Widget & { count: number }) => count + value.count;
noop(read);
</script>

<button onclick={() => count++}>{count}</button>
"#;
    let result = crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("retained-state-typescript-projection/index.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(result.js.code.contains("let count = $.state(0)"));
    assert!(result.js.code.contains("=> $.get(count) + value.count"));
    AST_STATE_RETAINED_USES.with(|count| assert_eq!(count.get(), 1));
    AST_STATE_REPARSES.with(|count| assert_eq!(count.get(), 0));
}

#[test]
fn projected_replacement_crossing_removed_typescript_falls_back() {
    AST_STATE_REPARSES.with(|count| count.set(0));
    AST_STATE_RETAINED_USES.with(|count| count.set(0));
    let source = r#"<script lang="ts">
let count = $state<number>(0);
</script>

<button onclick={() => count++}>{count}</button>
"#;
    let result = crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("retained-state-typescript-partial/index.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(result.js.code.contains("let count = $.state(0)"));
    AST_STATE_RETAINED_USES.with(|count| assert_eq!(count.get(), 0));
    AST_STATE_REPARSES.with(|count| assert_eq!(count.get(), 1));
}

#[test]
fn projected_typescript_semantic_assignment_falls_back() {
    AST_STATE_REPARSES.with(|count| count.set(0));
    AST_STATE_RETAINED_USES.with(|count| count.set(0));
    let source = r#"<script lang="ts">
let next: number = 1;
let count: number = $state(0);
count = next;
</script>

<p>{count}</p>
"#;
    let result = crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("retained-state-typescript-semantic/index.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(result.js.code.contains("$.set(count, next)"));
    AST_STATE_RETAINED_USES.with(|count| assert_eq!(count.get(), 0));
    AST_STATE_REPARSES.with(|count| assert_eq!(count.get(), 1));
}

#[test]
fn projected_typescript_wrapped_rune_initializer_falls_back() {
    AST_STATE_REPARSES.with(|count| count.set(0));
    AST_STATE_RETAINED_USES.with(|count| count.set(0));
    let source = r#"<script lang="ts">
let count = $state(1)!;
let double = $derived(count! * 2)!;
</script>

<p>{count} {double}</p>
"#;
    let result = crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("retained-state-typescript-wrapped-rune/index.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(result.js.code.contains("let count = 1"));
    assert!(result.js.code.contains("$.derived(() => count * 2)"));
    AST_STATE_RETAINED_USES.with(|count| assert_eq!(count.get(), 0));
    AST_STATE_REPARSES.with(|count| assert_eq!(count.get(), 1));
}

#[test]
fn projected_typescript_assertion_update_falls_back() {
    AST_STATE_REPARSES.with(|count| count.set(0));
    AST_STATE_RETAINED_USES.with(|count| count.set(0));
    let result = crate::compiler::compile(
        r#"<script lang="ts">
let count: number = $state(0);
function increment() { count!++; }
</script>

<button onclick={increment}>{count}</button>
"#,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("retained-state-typescript-assertion-update/index.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(result.js.code.contains("$.update(count)"));
    assert!(!result.js.code.contains("$.get(count)++"));
    AST_STATE_RETAINED_USES.with(|count| assert_eq!(count.get(), 0));
    AST_STATE_REPARSES.with(|count| assert_eq!(count.get(), 1));
}

#[test]
fn projected_fallback_restores_generated_name_counters() {
    AST_STATE_REPARSES.with(|count| count.set(0));
    AST_STATE_RETAINED_USES.with(|count| count.set(0));
    let result = crate::compiler::compile(
        r#"<script lang="ts">
let { a }: { a: string } = $state({});
let { b }: { b: string } = $derived(a);
let [c]: [number] = $derived([1]);
</script>

<button onclick={() => a++}>{b}{c}</button>
"#,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("retained-state-typescript-counter-rollback/index.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(!result.js.code.contains("tmp_1"));
    assert!(!result.js.code.contains("$$d_1"));
    assert!(!result.js.code.contains("$$array_1"));

    let code_wrapper = crate::compiler::compile(
        r#"<script lang="ts">
interface Props {
    children?: unknown;
    codeblock?: unknown;
    innerClass?: string;
    class?: string;
}
let { children, codeblock, innerClass, class: classname }: Props = $props();
const { base, inner } = $derived(codewrapper());
</script>

<div class={base({ class: classname })}>{innerClass}</div>
"#,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("flowbite-code-wrapper-counter-rollback/index.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    assert!(!code_wrapper.js.code.contains("$$d_1"));
    AST_STATE_RETAINED_USES.with(|count| assert_eq!(count.get(), 0));
    AST_STATE_REPARSES.with(|count| assert_eq!(count.get(), 2));
}

#[test]
fn retained_typescript_projection_reduces_fixture_reparses_from_five_to_one() {
    AST_STATE_REPARSES.with(|count| count.set(0));
    AST_STATE_RETAINED_USES.with(|count| count.set(0));
    let projected_sources = [
        r#"<script lang="ts">
	const p = { m: 1 } satisfies Record<string, number>;
	let count = $state(0);
</script>
<button onclick={() => count++}>{count}{p.m}</button>"#,
        r#"<script module lang="ts">
	export const K = 1;
</script>
<script>
	const p = { m: 1 } satisfies Record<string, number>;
	let count = $state(0);
</script>
<button onclick={() => count++}>{count}{p.m}</button>"#,
        r#"<script lang="ts">
	function f(a: boolean): boolean;
	function f(a: string): number;
	function f(a: any): any { return a; }
	let count = $state(0);
	const r = f(true);
</script>
<button onclick={() => count++}>{r}{count}</button>"#,
        r#"<script lang="ts">
	function f(a: number): number { return a + 1; }
	let count = $state(0);
	const r = f(1);
</script>
<button onclick={() => count++}>{r}{count}</button>"#,
    ];

    for (index, source) in projected_sources.iter().enumerate() {
        crate::compiler::compile(
            source,
            crate::compiler::CompileOptions {
                generate: crate::compiler::GenerateMode::Client,
                filename: Some(format!("retained-typescript-fixture-{index}.svelte")),
                ..Default::default()
            },
        )
        .unwrap();
    }
    AST_STATE_RETAINED_USES.with(|count| assert_eq!(count.get(), 4));
    AST_STATE_REPARSES.with(|count| assert_eq!(count.get(), 0));

    crate::compiler::compile(
        r#"<script lang="ts">
	let count = $state<number | null>(0);
</script>
<button onclick={() => { count = count! + 1; }}>{count}</button>"#,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("retained-typescript-fallback-fixture.svelte".to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    AST_STATE_RETAINED_USES.with(|count| assert_eq!(count.get(), 4));
    AST_STATE_REPARSES.with(|count| assert_eq!(count.get(), 1));
}

#[test]
fn retained_instance_program_is_repeatable() {
    let source = "<script>let count = $state(0); const read = () => count;</script><p>{read()}</p>";
    let mut prepared = crate::toolchain::Toolchain::new()
        .prepare(
            source,
            crate::compiler::CompileOptions {
                generate: crate::compiler::GenerateMode::Client,
                filename: Some("retained-state-repeat/index.svelte".to_string()),
                ..Default::default()
            },
        )
        .unwrap();
    AST_STATE_REPARSES.with(|count| count.set(0));
    AST_STATE_RETAINED_USES.with(|count| count.set(0));

    let first = prepared
        .compile(crate::toolchain::RuntimeTarget::Client)
        .unwrap();
    let second = prepared
        .compile(crate::toolchain::RuntimeTarget::Client)
        .unwrap();

    assert_eq!(first.js.code, second.js.code);
    AST_STATE_RETAINED_USES.with(|count| assert_eq!(count.get(), 2));
    AST_STATE_REPARSES.with(|count| assert_eq!(count.get(), 0));
}

#[test]
fn changed_instance_source_falls_back_to_state_transform_reparse() {
    let filename = "retained-state-class/index.svelte";
    let source = "<script>class Counter { value = $state(0); } let count = $state(0);</script><p>{count + new Counter().value}</p>";
    AST_STATE_REPARSES.with(|count| count.set(0));
    AST_STATE_RETAINED_USES.with(|count| count.set(0));
    crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some(filename.to_string()),
            ..Default::default()
        },
    )
    .unwrap();

    AST_STATE_RETAINED_USES.with(|count| assert_eq!(count.get(), 0, "{filename}"));
    AST_STATE_REPARSES.with(|count| assert_eq!(count.get(), 1, "{filename}"));
}

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

/// An import-attributes clause continues the statement wherever it is written:
/// ASI cannot end an `import` before a `with`, and the clause's own `}` — not
/// the module specifier — is then the statement's end.
#[test]
fn extract_imports_keeps_an_import_attributes_clause() {
    // The clause starts on the next line, with and without a terminating `;`.
    for script in [
        "import d from \"./d.json\"\n\twith { type: \"json\" };\nlet z = d;\n",
        "import d from \"./d.json\"\n\twith { type: \"json\" }\nlet z = d\n",
    ] {
        let (imports, rest) = extract_imports(script);
        assert_eq!(imports.len(), 1, "{script:?}");
        assert!(imports[0].contains("with { type: \"json\" }"), "{script:?}");
        assert!(rest.starts_with("let z = d"), "{script:?} -> {rest:?}");
    }

    // Same line, but semicolon-free: the line ends inside the clause, so the
    // statement's end is the clause's `}` and not the specifier.
    let (imports, rest) =
        extract_imports("import d from \"./d.json\" with { type: \"json\" }\nlet z = d\n");
    assert_eq!(
        imports,
        vec!["import d from \"./d.json\" with { type: \"json\" }".to_string()]
    );
    assert_eq!(rest, "let z = d");

    // The clause itself spans lines: `"json"` ends a line inside it, which the
    // ASI rule would otherwise read as a module specifier.
    let (imports, rest) =
        extract_imports("import d from \"./d.json\" with {\n\ttype: \"json\"\n};\nlet z = d;\n");
    assert_eq!(imports.len(), 1);
    assert_eq!(rest, "let z = d;");

    // Control: `with` is only a clause when a `{` follows it. A call to a
    // function named `assert`, or the word inside a string, must not extend the
    // statement over the next line.
    let (imports, rest) = extract_imports("import d from \"./d.json\"\nwith_it(d)\n");
    assert_eq!(imports, vec!["import d from \"./d.json\"".to_string()]);
    assert_eq!(rest, "with_it(d)");
    let (imports, rest) =
        extract_imports("import d from \"./d.json\"\nconst s = \"with { a: 'b' }\";\n");
    assert_eq!(imports, vec!["import d from \"./d.json\"".to_string()]);
    assert_eq!(rest, "const s = \"with { a: 'b' }\";");
}

#[test]
fn projected_import_extraction_preserves_legacy_output() {
    for script in [
        "",
        "let count = 1;\n",
        "let count = 1;\r",
        "import { x } from 'x';\nlet count = x;\n",
        "import { x } from 'x';\r\n\r\nlet count = x;\r\n",
        "import a from 'a';import b from 'b'; const value = a + b;",
        "import {\n  first,\n  second\n} from 'pkg'; const value = first + second;",
        "const text = `not an import\\nimport x from 'x'`;\nlet value = 1;",
        "/*\nimport x from 'x';\n*/\nlet value = 1;",
        // The two ports have to agree about the attributes clause as well —
        // nothing else in the tree compares them to each other.
        "import d from './d.json'\n\twith { type: 'json' };\nlet z = d;\n",
        "import d from './d.json'\r\n\twith { type: 'json' };\r\nlet z = d;\r\n",
        "import d from './d.json' with {\n\ttype: 'json'\n};\nlet z = d;\n",
        "import d from './d.json'\nlet z = d\n",
    ] {
        let expected = extract_imports(script);
        let (imports, body, copied_chunks) = extract_imports_with_projection(script);
        assert_eq!((imports, body.clone()), expected, "{script:?}");
        for chunk in copied_chunks {
            assert_eq!(
                &script[chunk.source.start as usize..chunk.source.end as usize],
                &body[chunk.output.start as usize..chunk.output.end as usize],
                "{script:?}"
            );
        }
    }
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

#[cfg(feature = "measure-prop-reads")]
#[test]
fn prop_read_rewriter_uses_the_ast_path_for_complete_expressions() {
    crate::measure_prop_reads::reset();
    let props = vec!["a".to_string(), "b".to_string(), "c".to_string()];

    assert_eq!(
        transform_prop_reads_in_expr("a + b + c", &props),
        "a() + b() + c()"
    );

    let (_, _, _, _, _, scanned_chars, vec_char_elems, _, _) =
        crate::measure_prop_reads::snapshot();
    assert_eq!(scanned_chars, 0);
    assert_eq!(vec_char_elems, 0);
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
    let result = prop_source_reads_ast::wrap_prop_source_reads_ast(
        input,
        &prop_vars,
        &[],
        prop_source_reads_ast::ParseGoal::Expression,
    )
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
    let result = prop_source_reads_ast::wrap_prop_source_reads_ast(
        input,
        &prop_vars,
        &[],
        prop_source_reads_ast::ParseGoal::Expression,
    )
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
    let result = prop_source_reads_ast::wrap_prop_source_reads_ast(
        input,
        &prop_vars,
        &[],
        prop_source_reads_ast::ParseGoal::Expression,
    )
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
    let result = prop_source_reads_ast::wrap_prop_source_reads_ast(
        input,
        &prop_vars,
        &[],
        prop_source_reads_ast::ParseGoal::Expression,
    )
    .unwrap_or_else(|| input.to_string());
    assert!(
        !result.contains("value() ??= 100"),
        "value on LHS of ??= should NOT be wrapped: {}",
        result
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
fn dev_public_rune_field_keeps_a_leading_block_comment_in_the_tag_call() {
    let result = crate::compiler::compile(
        "<script>\nexport class C {\n\t/* c */\n\tn = $state(0);\n}\n</script>",
        crate::compiler::CompileOptions {
            dev: true,
            generate: crate::compiler::GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile should succeed");
    let code = result.js.code;
    assert!(
        code.contains("#n = $.tag(\n\t\t\t/* c */\n\t\t\t$.state(0),\n\t\t\t'C.n'\n\t\t);"),
        "comment should be an infix argument to $.tag:\n{code}"
    );
}

#[test]
fn dev_public_derived_field_keeps_jsdoc_in_its_synthesized_arrow() {
    let result = crate::compiler::compile(
        "<script lang=\"ts\">\nexport class C {\n\t/** c */\n\tn = $derived(1);\n}\n</script>",
        crate::compiler::CompileOptions {
            dev: true,
            generate: crate::compiler::GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile should succeed");
    assert!(
        result.js.code.contains(
            "#n = $.tag(\n\t\t\t$.derived((/** c */\n\t\t\t) => 1),\n\t\t\t'C.n'\n\t\t);"
        ),
        "JSDoc should stay with the synthesized derived arrow:\n{}",
        result.js.code
    );
}

#[test]
fn server_public_derived_field_keeps_jsdoc_in_its_synthesized_arrow() {
    let result = crate::compiler::compile(
        "<script lang=\"ts\">\nexport class C {\n\t/** c */\n\tn = $derived(1);\n}\n</script>",
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Server,
            ..Default::default()
        },
    )
    .expect("compile should succeed");
    assert!(
        result
            .js
            .code
            .contains("\n\t\t#n = $.derived((/** c */\n\t\t) => 1);"),
        "JSDoc should stay with the synthesized derived arrow:\n{}",
        result.js.code
    );
}

#[test]
fn rehomes_derived_jsdoc_without_consuming_the_following_code() {
    let input =
        "\t#one = $.derived(() => /** one */\n\t1);\n\t#two = $.derived(() => /** two */\n\t2);";
    assert_eq!(
        super::rehome_derived_jsdoc(input),
        "\t#one = $.derived((/** one */\n\t) => 1);\n\t#two = $.derived((/** two */\n\t) => 2);"
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
fn test_module_state_with_logical_and_gets_proxy() {
    let source = r#"
export function resource(initialValue, lazy) {
  let loading = $state(initialValue === undefined && !lazy);
  return { get loading() { return loading; } };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            filename: Some("test.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    assert!(
        code.contains("$.proxy(initialValue === undefined && !lazy)"),
        "$state(a && b) should be wrapped with $.proxy(): {}",
        code
    );
}

#[test]
fn test_module_state_with_bitwise_and_no_proxy() {
    // `&` is a BinaryExpression, which upstream `should_proxy` never proxies.
    let source = r#"
export function useFlags(a, b) {
  let flags = $state(a & b);
  return { get flags() { return flags; } };
}
"#;

    let result = crate::compiler::compile_module(
        source,
        crate::compiler::ModuleCompileOptions {
            filename: Some("test.svelte.js".to_string()),
            ..Default::default()
        },
    )
    .unwrap();
    let code = &result.js.code;

    assert!(
        !code.contains("$.proxy("),
        "$state(a & b) must not be wrapped with $.proxy(): {}",
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
fn module_async_derived_instruments_its_thunk_in_dev() {
    let mut options = crate::compiler::ModuleCompileOptions {
        dev: true,
        filename: Some("test.svelte.js".to_string()),
        ..Default::default()
    };
    options.experimental.r#async = true;
    let result =
        crate::compiler::compile_module("const value = $derived(await load());", options).unwrap();
    let code = &result.js.code;

    assert!(
        code.contains("$.async_derived(async () => (await $.track_reactivity_loss(load()))(), 'value', 'test.svelte.js:1:14')"),
        "await instrumentation must stay inside the async-derived thunk: {code}"
    );
    assert!(
        !code.contains("await $.track_reactivity_loss($.async_derived"),
        "the outer async-derived await must not be instrumented: {code}"
    );
}

#[test]
fn module_class_derived_only_rehomes_the_first_public_field_jsdoc() {
    let source = "let wc_state = $state.raw({ base: '', error: null });\nexport const adapter_state = new (class {\n\t/** URL to the web container instance. */\n\tbase = $derived(wc_state.base);\n\t/** Errors from within the web container instance. */\n\terror = $derived(wc_state.error);\n})();\nexport function update(module) { wc_state = module.state; }";
    for dev in [false, true] {
        let result = crate::compiler::compile(
            &format!("<script module>\n{source}\n</script>"),
            crate::compiler::CompileOptions {
                filename: Some("adapter.svelte.ts".to_string()),
                dev,
                ..Default::default()
            },
        )
        .unwrap();

        assert!(
            result
                .js
                .code
                .contains("$.derived((/** URL to the web container instance. */"),
            "the first public field JSDoc must stay on its derived arrow (dev={dev}):\n{}",
            result.js.code
        );
        assert!(
            !result
                .js
                .code
                .contains("Errors from within the web container instance."),
            "later public field JSDoc has no generated source anchor (dev={dev}):\n{}",
            result.js.code
        );
        assert!(
            result.js.code.contains("$.set(wc_state, module.state)"),
            "raw state setters must not request proxying (dev={dev}):\n{}",
            result.js.code
        );
        assert!(
            !result
                .js
                .code
                .contains("$.set(wc_state, module.state, true)"),
            "raw state setters must not request proxying (dev={dev}):\n{}",
            result.js.code
        );
    }
}

#[test]
fn compile_module_class_derived_only_rehomes_the_first_public_field_jsdoc() {
    let source = "let wc_state = $state.raw({ base: '', error: null });\nexport const adapter_state = new (class {\n\t/** URL to the web container instance. */\n\tbase = $derived(wc_state.base);\n\t/** Errors from within the web container instance. */\n\terror = $derived(wc_state.error);\n})();\nexport function update(module) { wc_state = module.state; }";
    for dev in [false, true] {
        let result = crate::compiler::compile_module(
            source,
            crate::compiler::ModuleCompileOptions {
                filename: Some("adapter.svelte.ts".to_string()),
                dev,
                ..Default::default()
            },
        )
        .unwrap();

        assert!(
            result
                .js
                .code
                .contains("$.derived((/** URL to the web container instance. */"),
            "the first public field JSDoc must stay on its derived arrow (dev={dev}):\n{}",
            result.js.code
        );
        assert!(
            !result
                .js
                .code
                .contains("Errors from within the web container instance."),
            "later public field JSDoc has no generated source anchor (dev={dev}):\n{}",
            result.js.code
        );
        assert!(
            result.js.code.contains("$.set(wc_state, module.state)"),
            "raw state setters must not request proxying (dev={dev}):\n{}",
            result.js.code
        );
        assert!(
            !result
                .js
                .code
                .contains("$.set(wc_state, module.state, true)"),
            "raw state setters must not request proxying (dev={dev}):\n{}",
            result.js.code
        );
    }
}

#[test]
fn module_async_derived_prelude_does_not_reorder_console_analysis() {
    let mut options = crate::compiler::ModuleCompileOptions {
        dev: true,
        filename: Some("test.svelte.js".to_string()),
        ..Default::default()
    };
    options.experimental.r#async = true;
    let result = crate::compiler::compile_module(
        "const state = $state(0);\nconst value = $derived(await load());\nconsole.log(state);",
        options,
    )
    .unwrap();
    assert!(
        result.js.code.contains("console.log(state);"),
        "console instrumentation must retain its normal module analysis order: {}",
        result.js.code
    );
    assert!(
        !result.js.code.contains("log_if_contains_state"),
        "console instrumentation must not run before module state lowering: {}",
        result.js.code
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

/// The `rest_excludes` hoist is placed relative to the template factory, and in
/// dev the factory sits inside `$.add_locations(...)`. Matching only the bare
/// factory silently moved the hoist below `var root` for every dev component
/// (#2020), so pin both shapes.
#[test]
fn template_factory_matches_through_the_dev_add_locations_wrapper() {
    use super::super::js_ast::JsArena;
    use super::super::js_ast::builders as b;

    let arena = JsArena::new();
    let factory = || {
        b::call(
            &arena,
            b::member_path(&arena, "$.from_html"),
            vec![b::string("<p></p>")],
        )
    };

    let prod = b::var_decl(&arena, "root", Some(factory()));
    assert!(is_client_template_factory(&arena, &prod));

    let dev = b::var_decl(
        &arena,
        "root",
        Some(b::call(
            &arena,
            b::member_path(&arena, "$.add_locations"),
            vec![
                factory(),
                b::member_path(&arena, "Root.$.FILENAME"),
                b::array(vec![b::array(vec![b::number(1.0), b::number(0.0)])]),
            ],
        )),
    );
    assert!(is_client_template_factory(&arena, &dev));

    let unrelated = b::var_decl(
        &arena,
        "x",
        Some(b::call(&arena, b::member_path(&arena, "$.derived"), vec![])),
    );
    assert!(!is_client_template_factory(&arena, &unrelated));

    // The text-statement path carries the same shapes.
    assert!(is_client_template_factory(
        &arena,
        &JsStatement::Raw(
            "var root = $.add_locations($.from_html(`<p></p>`), Root[$.FILENAME], [[1, 0]]);"
                .into()
        )
    ));
    assert!(!is_client_template_factory(
        &arena,
        &JsStatement::Raw("var x = $.derived(() => 1);".into())
    ));
}

/// `svelte-ignore await_reactivity_loss` has no corpus coverage, so pin both
/// directions here. The suppression also has to survive an unrelated
/// `svelte-ignore` line sitting between it and the statement.
///
/// Runes mode throughout: the instrumentation rides the runes-only AST pass, so
/// a legacy instance script is not instrumented at all (a known gap).
#[test]
fn await_reactivity_loss_is_wrapped_unless_ignored() {
    let compile = |body: &str| {
        crate::compiler::compile(
            &format!("<script>\nlet n = $state(0);\n{body}\n</script>\n<p>{{n}}</p>\n"),
            crate::compiler::CompileOptions {
                generate: crate::compiler::GenerateMode::Client,
                dev: true,
                filename: Some("await/index.svelte".to_string()),
                ..Default::default()
            },
        )
        .unwrap()
        .js
        .code
    };

    let wrapped = compile("async function f() {\n\tconst a = await load();\n}");
    assert!(
        wrapped.contains("(await $.track_reactivity_loss(load()))()"),
        "expected the await to be wrapped:\n{wrapped}"
    );

    let ignored = compile(
        "async function f() {\n\t// svelte-ignore await_reactivity_loss\n\tconst a = await load();\n}",
    );
    assert!(
        !ignored.contains("track_reactivity_loss") && ignored.contains("await load()"),
        "expected the await to stay bare:\n{ignored}"
    );

    let stacked = compile(
        "async function f() {\n\t// svelte-ignore await_reactivity_loss\n\t// svelte-ignore state_referenced_locally\n\tconst a = await load();\n}",
    );
    assert!(
        !stacked.contains("track_reactivity_loss"),
        "an unrelated svelte-ignore line must not end the scan:\n{stacked}"
    );
}

#[test]
fn module_derived_name_containing_dollar_is_unwrapped() {
    let source = r#"
export function useInterval(callback, delay) {
	const delay$ = $derived(typeof delay === 'function' ? delay() : delay);
	let intervalId;
	function start() { intervalId = setInterval(callback, delay$); }
	return { start };
}
"#;

    let compile = |generate| {
        crate::compiler::compile_module(
            source,
            crate::compiler::ModuleCompileOptions {
                generate,
                filename: Some("use-interval.svelte.js".to_string()),
                ..Default::default()
            },
        )
        .unwrap()
        .js
        .code
    };

    let client = compile(crate::compiler::GenerateMode::Client);
    assert!(
        client.contains("setInterval(callback, $.get(delay$))"),
        "derived read should be unwrapped on the client:\n{client}"
    );

    let server = compile(crate::compiler::GenerateMode::Server);
    assert!(
        server.contains("setInterval(callback, delay$())"),
        "derived read should be called on the server:\n{server}"
    );
}

#[test]
fn shadowed_state_updates_do_not_rewrite_literal_tokens() {
    let output = apply_local_state_transforms(
        r#"{
const sample = "multiplier++";
return {
	prefix: () => ++multiplier,
	post: () => multiplier++
};
}"#,
        "multiplier",
        true,
    );
    assert!(output.contains(r#"const sample = "multiplier++";"#));
    assert!(output.contains("$.update_pre(multiplier)"));
    assert!(output.contains("$.update(multiplier)"));
}

/// A `}` or `)` inside a comment is comment text. Read as a bracket it drops the
/// scan's depth to 0 inside a `$:` block body, so the block's own `bar = []`
/// reads as a top-level assignment and the `{`-prefixed left-hand side that
/// produces is what reaches the destructure expansion.
#[test]
fn find_assignment_position_ignores_delimiters_inside_comments() {
    use super::state_transforms::find_assignment_position;

    assert_eq!(
        find_assignment_position("{\n\t\t// } c\n\t\tbar = []\n\t}"),
        None
    );
    assert_eq!(
        find_assignment_position("{\n\t\t// ) c\n\t\tbar = []\n\t}"),
        None
    );
    assert_eq!(
        find_assignment_position("{\n\t\t/* } c */\n\t\tbar = []\n\t}"),
        None
    );
    // A real top-level assignment is still found.
    assert_eq!(find_assignment_position("bar = []"), Some(4));
}

/// A private field whose name continues past the one being transformed must be
/// left alone. `א` (`D7 90`) is the discriminating case: `0xD7` is the lead byte
/// of the whole Hebrew block and is the one lead byte whose Latin-1 image (`×`)
/// is not alphanumeric, so the byte scan saw a word boundary in the middle of an
/// identifier and appended `.v` there — `this.#c.vא`.
#[test]
fn a_private_state_read_stops_at_a_non_ascii_identifier_character() {
    use super::class_transforms::{ClassStateField, transform_constructor_private_reads};

    let field = |rune: &str| ClassStateField {
        name: "c".to_string(),
        is_private: true,
        rune_type: rune.to_string(),
        value: "0".to_string(),
        private_backing_name: "c".to_string(),
        constructor_declared: false,
        had_class_body_decl: false,
        trailing_comment: None,
        init_prefix: String::new(),
    };

    for rune in ["$state", "$derived"] {
        // Control: an ASCII continuation was already rejected.
        assert_eq!(
            transform_constructor_private_reads("log(this.#cx);", &[field(rune)]),
            "log(this.#cx);"
        );
        assert_eq!(
            transform_constructor_private_reads("log(this.#c\u{5D0});", &[field(rune)]),
            "log(this.#c\u{5D0});"
        );
    }
}

/// The `$derived` and standalone-read paths both spliced `$.get(...)` in the
/// middle of the identifier, which is not JavaScript at all: `log($.get(this.#c)א)`.
#[test]
fn a_standalone_private_read_stops_at_a_non_ascii_identifier_character() {
    use super::class_transforms::wrap_standalone_private_reads;

    assert_eq!(
        wrap_standalone_private_reads("log(this.#cx);", "this.#c"),
        "log(this.#cx);"
    );
    assert_eq!(
        wrap_standalone_private_reads("log(this.#c\u{5D0});", "this.#c"),
        "log(this.#c\u{5D0});"
    );
    // Control on the other side: a real standalone read is still wrapped.
    assert_eq!(
        wrap_standalone_private_reads("log(this.#c);", "this.#c"),
        "log($.get(this.#c));"
    );
}

/// `obj.#cא` is a read of a different field, so `obj` is not a prefix of `#c`.
#[test]
fn a_private_field_prefix_is_not_collected_across_a_non_ascii_continuation() {
    use super::class_transforms::find_private_field_prefixes;

    assert_eq!(find_private_field_prefixes("obj.#cx = 1;", "c"), ["this"]);
    assert_eq!(
        find_private_field_prefixes("obj.#c\u{5D0} = 1;", "c"),
        ["this"]
    );
    // Control on the other side: a real prefix is still collected.
    assert_eq!(
        find_private_field_prefixes("obj.#c = 1;", "c"),
        ["obj", "this"]
    );
}

/// `U+3000` and NBSP separate a parameter from its `)` exactly as a space does.
/// The scan used an ASCII whitelist, so it decided the pattern was a prefix of a
/// longer name, blanked the `f` of `function` and left the shadowing scope — and
/// therefore the shadowed identifier — in the body it hands to dependency analysis.
#[test]
fn a_shadowing_scope_is_stripped_across_non_ascii_whitespace() {
    use super::state_transforms::strip_function_scopes_that_shadow;

    for body in [
        "function (a ) { a }",
        "function (a\u{3000}) { a }",
        "function (a\u{A0}) { a }",
    ] {
        let stripped = strip_function_scopes_that_shadow(body, "a");
        assert!(
            stripped.trim().is_empty(),
            "body {body:?} left {stripped:?}"
        );
    }
    for body in ["(a ) => a", "(a\u{3000}) => a"] {
        let stripped = strip_function_scopes_that_shadow(body, "a");
        assert!(
            stripped.trim().is_empty(),
            "body {body:?} left {stripped:?}"
        );
    }
    // Control: a body that does not shadow `a` is untouched.
    assert_eq!(
        strip_function_scopes_that_shadow("function (b) { a }", "a"),
        "function (b) { a }"
    );
}

/// `名$c` is one identifier, so `$c` is not an arrow parameter there. The byte
/// before `$c` is `名`'s trailing `0x8D`, a C1 control that no identifier
/// predicate accepts — so the scan saw a word boundary inside a name.
#[test]
fn a_store_name_inside_a_longer_non_ascii_identifier_is_not_a_parameter() {
    use super::store_transforms::is_function_parameter_in_statement;

    // Control: the ASCII form was already rejected.
    assert!(!is_function_parameter_in_statement("x$c => 1", "$c"));
    assert!(!is_function_parameter_in_statement("\u{540D}$c => 1", "$c"));
    assert!(!is_function_parameter_in_statement("\u{5D0}$c => 1", "$c"));
    // Control on the other side: a real arrow parameter is still recognised.
    assert!(is_function_parameter_in_statement("$c => 1", "$c"));
}

/// The trailing side of the same check: `U+3000` before `=>` is whitespace, and
/// its lead byte `0xE3` Latin-1-decodes to `ã`, which is alphanumeric — so the
/// parameter looked like the prefix of a longer name and was not recognised.
#[test]
fn a_store_parameter_is_recognised_across_non_ascii_whitespace() {
    use super::store_transforms::is_function_parameter_in_statement;

    assert!(is_function_parameter_in_statement("$c => 1", "$c"));
    assert!(is_function_parameter_in_statement("$c\u{3000}=> 1", "$c"));
    assert!(is_function_parameter_in_statement("$c\u{A0}=> 1", "$c"));
    // Control: a longer name is still not the parameter.
    assert!(!is_function_parameter_in_statement("$c\u{5D0} => 1", "$c"));
}

/// `x名$c` is one identifier, so the getter call must not be inserted into it.
/// The first `$c(1)` is there because the cheap pre-check that guards this
/// transform is character-correct already — without it the loop is never reached
/// and the test cannot see the branch it is about.
#[test]
fn a_store_call_is_not_inserted_into_a_longer_non_ascii_identifier() {
    use super::store_transforms::transform_store_sub_calls;

    let subs = ["$c".to_string()];
    assert_eq!(
        transform_store_sub_calls("$c(1); xy$c(2)", &subs),
        "$c()(1); xy$c(2)"
    );
    assert_eq!(
        transform_store_sub_calls("$c(1); x\u{540D}$c(2)", &subs),
        "$c()(1); x\u{540D}$c(2)"
    );
    assert_eq!(
        transform_store_sub_calls("$c(1); x\u{E0}$c(2)", &subs),
        "$c()(1); x\u{E0}$c(2)"
    );
}

/// `$: {a=b}` and `$: { a = b }` are the same program, so they must order the
/// same. The assignment scan feeding the topological sort matched the literal
/// `" = "`, so the unspaced form was credited with assigning nothing, lost its
/// ordering edge, and ran before the statement it depends on.
#[test]
fn reactive_statement_order_ignores_whitespace_around_the_assignment() {
    fn effect_order(source: &str) -> Vec<String> {
        let js = crate::compiler::compile(
            source,
            crate::compiler::CompileOptions {
                generate: crate::compiler::GenerateMode::Client,
                filename: Some("order/index.svelte".to_string()),
                ..Default::default()
            },
        )
        .unwrap()
        .js
        .code;
        js.lines()
            .filter(|l| l.contains("$.set(mid,") || l.contains("$.set(out,"))
            .map(|l| l.trim().to_string())
            .collect()
    }

    let unspaced = effect_order(
        "<script>\nexport let seed = 1;\nlet mid = 0;\nlet out = 0;\n$: out = mid + 1;\n$: {mid=seed*2}\n</script>\n\n<p>{out}</p>\n",
    );
    let spaced = effect_order(
        "<script>\nexport let seed = 1;\nlet mid = 0;\nlet out = 0;\n$: out = mid + 1;\n$: { mid = seed * 2 }\n</script>\n\n<p>{out}</p>\n",
    );

    // `out` reads `mid`, so the statement assigning `mid` has to come first.
    assert!(
        unspaced[0].contains("$.set(mid,"),
        "unspaced ran out of order: {unspaced:?}"
    );
    // The spaced form is the control: it was already correct and must stay so.
    assert!(
        spaced[0].contains("$.set(mid,"),
        "spaced ran out of order: {spaced:?}"
    );
    assert_eq!(unspaced, spaced);
}

#[test]
fn scoped_static_class_keeps_its_hash_when_the_expression_is_spanned() {
    let result = crate::compiler::compile(
        "<section class={\"draggable\"}></section><style>.draggable { color: red; }</style>",
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("spanned-static-class.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("compiles");

    assert!(
        result.js.code.contains("draggable svelte-"),
        "the scoped class must be folded into the static value: {}",
        result.js.code
    );
    assert!(
        !result.js.code.contains("'draggable', 'svelte-"),
        "the CSS hash must not become a separate dynamic argument: {}",
        result.js.code
    );
}

fn globals_fold_client_code(source: &str) -> String {
    crate::compiler::compile(
        source,
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("globals-fold.svelte".to_string()),
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code
}

/// Upstream's `globals` table folds a call to a known-pure global over known
/// arguments, so an element whose only child is such a value keeps the
/// `textContent` fast path. Every row was read off svelte 5.56.9.
#[test]
fn pure_global_call_over_known_arguments_keeps_the_text_content_fast_path() {
    let with_derived = |expr: &str| {
        globals_fold_client_code(&format!(
            "<script>\n\tlet n = $state(1);\n\tconst user = (x) => x;\n\tconst d = $derived({expr});\n</script>\n<b>{{d}}</b>\n"
        ))
    };

    for expr in [
        // `Math.*` names the hand-rolled table did not carry
        "Math.sign(n)",
        "Math.trunc(n)",
        "Math.atan2(n, 2)",
        "Math.imul(n, 2)",
        "Math.clz32(n)",
        "Math.fround(n)",
        "Math.cbrt(n)",
        "Math.log2(n)",
        // names it carried, but which a reference to a binding used to bail on
        "Math.max(n, 2)",
        "Math.abs(n)",
        "Math.round(n)",
        // the two constructors and a `Number.*` member
        "String(n)",
        "Number(n)",
        "Number.isInteger(n)",
        "String(\"a\")",
        // the other `is_expression_known_json` arms that reach the same fold
        "Math.max(Math.abs(n), 2)",
        "`${Math.abs(n)}`",
        "Math.abs(n) || 2",
        "Math.abs(n) ? 'a' : 'b'",
        "Math.abs(n) + 1",
        "-Math.abs(n)",
    ] {
        let code = with_derived(expr);
        assert!(
            code.contains(".textContent = "),
            "`{expr}` must keep the textContent fast path: {code}"
        );
    }

    // Controls: upstream declines each of these, so rsvelte must too.
    for expr in [
        "Boolean(n)",        // not in the globals table
        "parseInt(n)",       // ditto (bare `parseInt`, not `Number.parseInt`)
        "JSON.stringify(n)", // ditto
        "Math.hypot(n, 2)",  // a `Math.` name the table does not list
        "Math.random()",     // listed, but with no computable fn
        "BigInt(n)",         // ditto
        "user(n)",           // a local function
        "n.toFixed(1)",      // a method on a value
    ] {
        let code = with_derived(expr);
        assert!(
            !code.contains(".textContent = "),
            "`{expr}` must NOT get the textContent fast path: {code}"
        );
    }

    // A written `$state` argument keeps the whole expression unknown.
    let reactive = globals_fold_client_code(
        "<script>\n\tlet n = $state(1);\n\tconst d = $derived(Math.abs(n));\n\tfunction bump() { n += 1; }\n</script>\n<b>{d}</b>\n<button onclick={bump}>+</button>\n",
    );
    assert!(
        !reactive.contains(".textContent = "),
        "a written `$state` argument must stay reactive: {reactive}"
    );

    // A local binding of the name is not the global — upstream's
    // `get_global_keypath` returns null once `scope.get(name)` resolves.
    for shadow in [
        "<script>\n\tconst Math = { abs: (x) => x };\n\tlet n = $state(1);\n\tconst d = $derived(Math.abs(n));\n</script>\n<b>{d}</b>\n",
        "<script>\n\tconst String = (x) => 'nope';\n\tlet n = $state(1);\n\tconst d = $derived(String(n));\n</script>\n<b>{d}</b>\n",
    ] {
        let code = globals_fold_client_code(shadow);
        assert!(
            !code.contains(".textContent = "),
            "a shadowed global must not be folded: {code}"
        );
    }

    // `arguments.every((arg) => arg.type !== 'SpreadElement')` upstream.
    let spread = globals_fold_client_code(
        "<script>\n\tconst a = [1, 2];\n\tconst d = $derived(Math.max(...a));\n</script>\n<b>{d}</b>\n",
    );
    assert!(
        !spread.contains(".textContent = "),
        "a spread argument must not be folded: {spread}"
    );
}

#[test]
fn expression_blocked_after_await_skips_the_text_content_fast_path() {
    let code = crate::compiler::compile(
        "<script>\nawait 0;\nlet message = $derived('hello');\n</script>\n<p>{message}</p>\n",
        crate::compiler::CompileOptions {
            generate: crate::compiler::GenerateMode::Client,
            filename: Some("async-static-derived-after-await.svelte".to_string()),
            experimental: crate::compiler::ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code;

    assert!(!code.contains(".textContent = "), "{code}");
    assert!(code.contains("[$$promises[1]]"), "{code}");
}

/// The folded VALUE comes from the server's table rather than a second
/// implementation of it: JS `Math.round` is half-UP (`Math.round(-0.5)` is
/// `-0`), which Rust's `f64::round` (half away from zero) gets wrong.
#[test]
fn client_global_call_fold_uses_the_server_js_semantics() {
    for (expr, expected) in [
        ("Math.round(-0.5)", "'0'"),
        ("Math.round(-1.5)", "'-1'"),
        ("String('a')", "'a'"),
        ("Number('12')", "'12'"),
        ("Math.trunc(4.9)", "'4'"),
        ("Number.isInteger(4)", "'true'"),
        ("Math.imul(3, 4)", "'12'"),
        ("Math.clz32(1)", "'31'"),
    ] {
        let code = globals_fold_client_code(&format!("<b>{{{expr}}}</b>\n"));
        assert!(
            code.contains(&format!(".textContent = {expected};")),
            "`{expr}` must fold to {expected}: {code}"
        );
    }
}

/// `global_constants` is eight `Math.*` keypaths; every other member of `Math`
/// or `Number` evaluates to UNKNOWN upstream.
#[test]
fn only_the_listed_global_constants_are_known_members() {
    let with_derived = |expr: &str| {
        globals_fold_client_code(&format!(
            "<script>\n\tconst d = $derived({expr});\n</script>\n<b>{{d}}</b>\n"
        ))
    };

    for expr in ["Math.PI", "Math.E", "Math.SQRT2"] {
        let code = with_derived(expr);
        assert!(
            code.contains(".textContent = "),
            "`{expr}` is a listed global constant: {code}"
        );
    }
    for expr in ["Number.MAX_VALUE", "Math.NOPE", "Number.EPSILON"] {
        let code = with_derived(expr);
        assert!(
            !code.contains(".textContent = "),
            "`{expr}` is not in `global_constants`: {code}"
        );
    }
}
