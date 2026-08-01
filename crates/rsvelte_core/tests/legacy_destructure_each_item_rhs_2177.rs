//! Regression tests for issue #2177 — a legacy destructuring *assignment*
//! inside a template expression (event handler, etc.) whose right-hand side
//! is an each-block item.
//!
//! Upstream's `visit_assignment_expression`
//! (`3-transform/shared/assignments.js`) decides `should_cache` from the
//! *visited* right-hand side (`should_cache = value.type !== 'Identifier'`,
//! where `value = context.visit(node.right)`), so an each-item RHS — visited
//! form `$.get(item)`, a `CallExpression` — always caches into a `$$value`
//! IIFE. rsvelte's template-expression destructure lowering
//! (`try_destructure_assignment` in
//! `crates/rsvelte_core/src/compiler/phases/3_transform/client/visitors/expression_converter.rs`)
//! computed `should_cache` from the *unvisited* right-hand side instead, so an
//! object pattern stayed a plain sequence re-reading `$.get(item)` once per
//! target (no caching, and no IIFE at all), and an array pattern's always-IIFE
//! form still read `$.get(item)` directly in `$.to_array(...)` instead of the
//! IIFE's own parameter.
//!
//! Fixing `should_cache` surfaced a second, closely related gap: the IIFE
//! always appended a trailing `return $$value;`, on the (undocumented)
//! assumption that a destructure inside a template expression is never
//! standalone. Upstream's actual rule is `context.path.at(-1).type.endsWith
//! ('Statement')` — a destructure that IS the whole `ExpressionStatement`
//! (`({ a } = item);` alone in an event handler body) is standalone and gets
//! no `return`, exactly like the instance-script form.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn compile_client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Comp.svelte".to_string()),
            generate: GenerateMode::Client,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Collapse the sequence expression the printer spreads over several lines so a
/// single `assert!` can pin the whole lowering.
fn flat(code: &str) -> String {
    code.split_whitespace().collect::<Vec<_>>().join(" ")
}

/// The primary repro from the issue: an object pattern destructured from an
/// each-item must cache the visited RHS in a `$$value` IIFE, not stay a bare
/// sequence re-reading `$.get(item)` for every target. The destructure is the
/// whole statement here, so it is standalone — no trailing `return`.
#[test]
fn object_pattern_from_each_item_caches_in_dollar_dollar_value() {
    let src = r#"<script>
	let list = [{ a: 1, b: 2 }];
	let x, y;
</script>
{#each list as item}
	<button onclick={() => { ({ a: x, b: y } = item); }}>{item}</button>
{/each}
{x} {y}"#;
    let out = flat(&compile_client(src));
    assert!(
        out.contains("(($$value) => { $.set(x, $$value.a); $.set(y, $$value.b); })($.get(item));"),
        "in:\n{out}"
    );
}

/// An array pattern always caches into `$$array` via `$.to_array`, but the
/// `$.to_array(...)` base and the IIFE parameter must both be the cached
/// `$$value` — not a second, independent `$.get(item)` read. Standalone here
/// too, so no trailing `return`.
#[test]
fn array_pattern_from_each_item_reuses_the_cached_value_in_to_array() {
    let src = r#"<script>
	let list = [[1, 2], [3, 4]];
	let x, y;
</script>
{#each list as item}
	<button onclick={() => { [x, y] = item; }}>{item}</button>
{/each}
{x} {y}"#;
    let out = flat(&compile_client(src));
    // The `$.to_array(...)` base and the IIFE parameter are both the cached
    // `$$value`; `$.get(item)` appears exactly once here, as the IIFE's own
    // argument — not a second time inside `$.to_array(...)`.
    assert!(
        out.contains(
            "(($$value) => { var $$array = $.to_array($$value, 2); $.set(x, $$array[0]); $.set(y, $$array[1]); })($.get(item));"
        ),
        "in:\n{out}"
    );
}

/// When the destructure is NOT the whole statement — here it is the
/// right-hand side of an outer assignment — the IIFE must still return the
/// cached value so the outer assignment has something to read.
#[test]
fn non_standalone_each_item_destructure_still_returns_the_cached_value() {
    let src = r#"<script>
	let list = [{ a: 1, b: 2 }];
	let x, y, out;
</script>
{#each list as item}
	<button onclick={() => { out = ({ a: x, b: y } = item); }}>{item}</button>
{/each}
{x} {y} {JSON.stringify(out)}"#;
    let out = flat(&compile_client(src));
    assert!(
        out.contains(
            "$.set(out, (($$value) => { $.set(x, $$value.a); $.set(y, $$value.b); return $$value; })($.get(item)));"
        ),
        "in:\n{out}"
    );
}

/// A genuinely non-reactive RHS (a plain function parameter, not a state
/// var/each-item/prop/store) must NOT be cached — upstream's `should_cache`
/// stays false and the IIFE parameter reuses the RHS identifier verbatim.
#[test]
fn array_pattern_from_a_non_reactive_identifier_is_not_cached() {
    let src = r#"<script>
	let x, y;
	function f(pair) {
		[x, y] = pair;
	}
</script>
<button onclick={() => f([1, 2])}>{x} {y}</button>"#;
    let out = flat(&compile_client(src));
    assert!(
        out.contains(
            "((pair) => { var $$array = $.to_array(pair, 2); $.set(x, $$array[0]); $.set(y, $$array[1]); })(pair);"
        )
        // The instance-script form of this destructure runs through the
        // text-based pipeline (`destructure_transforms.rs`), which — being a
        // standalone statement — omits the trailing `return`.
        ,
        "in:\n{out}"
    );
    assert!(!out.contains("$$value"), "in:\n{out}");
}
