//! End-to-end checks of the `svelte2tsx()` entry point over hand-written
//! components. Fixture-level parity lives in `svelte2tsx_fixtures.rs`.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, SvelteVersion, svelte2tsx};

#[test]
fn test_svelte2tsx_simple_template() {
    let source = "<h1>hello</h1>";
    let result = svelte2tsx(source, Svelte2TsxOptions::default());
    assert!(
        result.is_ok(),
        "svelte2tsx should not fail: {:?}",
        result.err()
    );
    let result = result.unwrap();
    eprintln!("OUTPUT:\n{}", result.code);
    assert!(
        result.code.contains("///<reference types=\"svelte\" />"),
        "Should contain reference types"
    );
    assert!(
        result.code.contains("function $$render()"),
        "Should contain $$render function"
    );
    assert!(
        result.code.contains("svelteHTML.createElement(\"h1\","),
        "Should contain createElement(\"h1\")"
    );
    assert!(
        result.code.contains("async () => {"),
        "Should contain async wrapper"
    );
    assert!(
        result.code.contains("return { props:"),
        "Should contain return statement"
    );
    assert!(
        result.code.contains("__SvelteComponent_"),
        "Should contain component export"
    );
}

#[test]
fn test_svelte2tsx_template_with_expression() {
    let source = "<p>{count}</p>";
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
    eprintln!("OUTPUT:\n{}", result.code);
    assert!(
        result.code.contains("svelteHTML.createElement(\"p\","),
        "Should contain createElement(\"p\")"
    );
    // The expression tag `{count}` should be transformed to `count;`
    assert!(
        result.code.contains("count;"),
        "Should contain the expression as a statement"
    );
}

#[test]
fn test_svelte2tsx_element_with_attribute() {
    let source = "<div class=\"foo\">bar</div>";
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
    eprintln!("OUTPUT:\n{}", result.code);
    assert!(
        result.code.contains("svelteHTML.createElement(\"div\","),
        "Should contain createElement(\"div\")"
    );
    assert!(
        result.code.contains("\"class\""),
        "Should contain class attribute"
    );
}

#[test]
fn test_svelte2tsx_if_block() {
    let source = "{#if show}<p>visible</p>{/if}";
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
    eprintln!("OUTPUT:\n{}", result.code);
    assert!(
        result.code.contains("if(show)"),
        "Should contain if(show), got: {}",
        result.code
    );
}

#[test]
fn test_svelte2tsx_each_block() {
    let source = "{#each items as item}<p>{item}</p>{/each}";
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
    eprintln!("OUTPUT:\n{}", result.code);
    assert!(
        result.code.contains("__sveltets_2_ensureArray(items)"),
        "Should contain ensureArray, got: {}",
        result.code
    );
    assert!(
        result.code.contains("for(let item of"),
        "Should contain for loop, got: {}",
        result.code
    );
}

#[test]
fn test_svelte2tsx_component() {
    let source = "<Component />";
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
    eprintln!("OUTPUT:\n{}", result.code);
    assert!(
        result
            .code
            .contains("__sveltets_2_ensureComponent(Component)"),
        "Should contain ensureComponent, got: {}",
        result.code
    );
    assert!(
        result.code.contains("$$_tnenopmoC0C"),
        "Should contain reversed component name, got: {}",
        result.code
    );
}

#[test]
fn test_svelte2tsx_v5_export() {
    let source = "<h1>hello</h1>";
    let options = Svelte2TsxOptions {
        version: SvelteVersion::V5,
        ..Default::default()
    };
    let result = svelte2tsx(source, options).unwrap();
    assert!(
        result.code.contains("__sveltets_2_isomorphic_component"),
        "V5 should use isomorphic_component"
    );
}

#[test]
fn test_svelte2tsx_v4_export() {
    let source = "<h1>hello</h1>";
    let options = Svelte2TsxOptions {
        version: SvelteVersion::V4,
        ..Default::default()
    };
    let result = svelte2tsx(source, options).unwrap();
    assert!(
        result
            .code
            .contains("__sveltets_2_createSvelte2TsxComponent"),
        "V4 should use createSvelte2TsxComponent"
    );
    assert!(
        result.code.contains("export default class"),
        "V4 should use class export"
    );
}

#[test]
fn test_svelte2tsx_with_script() {
    let source = "<script>let x = 1;</script>\n<h1>{x}</h1>";
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
    eprintln!("OUTPUT:\n{}", result.code);
    assert!(
        result.code.contains("function $$render()"),
        "Should contain $$render function"
    );
    // Script content should be preserved in place
    assert!(
        result.code.contains("let x = 1;"),
        "Script content should be preserved"
    );
    assert!(
        result.code.contains("async () => {"),
        "Should contain async wrapper after script"
    );
}

#[test]
fn test_svelte2tsx_comment_removed() {
    let source = "<!-- comment --><h1>hello</h1>";
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
    eprintln!("OUTPUT:\n{}", result.code);
    assert!(
        !result.code.contains("<!-- comment -->"),
        "Comments should be removed"
    );
}

#[test]
fn test_svelte2tsx_module_and_script_inline() {
    let source = "<script context=\"module\">let b = 5;</script><h1>hello {world}</h1><script>export let world = \"name\"</script>\n";
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
    eprintln!("OUTPUT:\n{}", result.code);
    assert!(
        result.code.contains("svelteHTML.createElement(\"h1\","),
        "Should contain h1 element in output, got:\n{}",
        result.code
    );
}

#[test]
fn test_svelte2tsx_nested_elements() {
    let source = "<div><span>text</span></div>";
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
    eprintln!("OUTPUT:\n{}", result.code);
    assert!(
        result.code.contains("svelteHTML.createElement(\"div\","),
        "Should contain outer div"
    );
    assert!(
        result.code.contains("svelteHTML.createElement(\"span\","),
        "Should contain inner span"
    );
}

// =============================================================================
// Runes-mode detection tests
//
// Ground truth: empirically verified against the official svelte2tsx tool.
// RUNES components emit `__sveltets_2_fn_component`.
// LEGACY components emit `__sveltets_2_isomorphic_component`.
// Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
//   `isRunesMode() { return this.hasRunesGlobals || this.hasPropsRune() || this.isRunes; }`
// =============================================================================

fn run_svelte2tsx_v5(source: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Test.svelte".to_string(),
        ..Default::default()
    };
    svelte2tsx(source, opts)
        .unwrap_or_else(|e| panic!("svelte2tsx failed: {e:?}"))
        .code
}

// --- RUNES cases (must emit fn_component) ---

/// `$state(0)` in a variable declaration → hasRunesGlobals ($state is undeclared).
#[test]
fn test_runes_state_var_decl() {
    let code = run_svelte2tsx_v5("<script>let x=$state(0)</script>{x}");
    assert!(
        code.contains("__sveltets_2_fn_component"),
        "$state() var-decl should be runes mode; got:\n{code}"
    );
}

/// `$props()` usage → hasPropsRune.
#[test]
fn test_runes_props_rune() {
    let code = run_svelte2tsx_v5("<script>let {a}=$props()</script>{a}");
    assert!(
        code.contains("__sveltets_2_fn_component"),
        "$props() should be runes mode; got:\n{code}"
    );
}

/// `$derived(1)` in a variable declaration → hasRunesGlobals.
#[test]
fn test_runes_derived_var_decl() {
    let code = run_svelte2tsx_v5("<script>let x=$derived(1)</script>{x}");
    assert!(
        code.contains("__sveltets_2_fn_component"),
        "$derived() var-decl should be runes mode; got:\n{code}"
    );
}

/// `$effect(() => {})` as a standalone ExpressionStatement → hasRunesGlobals.
/// This was previously missed (only VariableDeclarations were checked).
#[test]
fn test_runes_effect_expr_stmt() {
    let code = run_svelte2tsx_v5("<script>$effect(()=>{})</script>x");
    assert!(
        code.contains("__sveltets_2_fn_component"),
        "$effect() expr-stmt should be runes mode; got:\n{code}"
    );
}

/// Top-level `await` in the instance script → isRunes (async components are runes-only).
#[test]
fn test_runes_top_level_await_script() {
    let code = run_svelte2tsx_v5("<script>const x=await fetch(1)</script>{x}");
    assert!(
        code.contains("__sveltets_2_fn_component"),
        "top-level await in script should be runes mode; got:\n{code}"
    );
}

/// `await` inside a template expression tag → isRunes.
#[test]
fn test_runes_await_in_template_expr() {
    let code = run_svelte2tsx_v5("<script>const t=getTime()</script>{await t}");
    assert!(
        code.contains("__sveltets_2_fn_component"),
        "await in template expression should be runes mode; got:\n{code}"
    );
}

// --- LEGACY cases (must emit isomorphic_component) ---

/// No script at all → legacy.
#[test]
fn test_legacy_no_script() {
    let code = run_svelte2tsx_v5("<p>hi</p>");
    assert!(
        code.contains("__sveltets_2_isomorphic_component"),
        "no-script should be legacy mode; got:\n{code}"
    );
}

/// `export let` props → legacy.
#[test]
fn test_legacy_export_let() {
    let code = run_svelte2tsx_v5("<script>export let a</script>{a}");
    assert!(
        code.contains("__sveltets_2_isomorphic_component"),
        "export-let should be legacy mode; got:\n{code}"
    );
}

/// Plain `let a = 1` (no rune) → legacy.
#[test]
fn test_legacy_plain_let() {
    let code = run_svelte2tsx_v5("<script>let a=1</script>{a}");
    assert!(
        code.contains("__sveltets_2_isomorphic_component"),
        "plain let should be legacy mode; got:\n{code}"
    );
}

// =============================================================================
// Rune-global-in-template detection tests
//
// A component with NO `<script>` but with `$state.eager(x)` / `$derived(...)` /
// `$effect(...)` in a template expression must be treated as RUNES because
// `implicitStoreValues.getGlobals()` collects those identifiers and
// `checkGlobalsForRunes` fires.
//
// Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/index.ts
//   `exportedNames.checkGlobalsForRunes(implicitStoreValues.getGlobals())`
// =============================================================================

/// `$state.eager(pathname)` referenced in a template attribute expression and
/// NO `<script>` → must be runes mode (fn_component), not legacy.
///
/// Ground truth: official svelte2tsx classifies this as RUNES because
/// `$state` is an undeclared global collected by `implicitStoreValues`.
///
/// Concrete example from corpus: `…/02-$state.md/12.svelte`
///   `<nav><a href="/" aria-current={$state.eager(pathname)==='/'?'page':null}>home</a></nav>`
#[test]
fn test_runes_state_eager_in_template_attr() {
    let code = run_svelte2tsx_v5(
        "<nav><a href=\"/\" aria-current={$state.eager(pathname) === '/' ? 'page' : null}>home</a></nav>",
    );
    assert!(
        code.contains("__sveltets_2_fn_component"),
        "$state.eager() in template attribute must be runes mode; got:\n{code}"
    );
    assert!(
        !code.contains("__sveltets_2_isomorphic_component"),
        "$state.eager() in template attribute must NOT be legacy mode; got:\n{code}"
    );
}

/// `$state(x)` as a direct call in a template expression tag → runes.
#[test]
fn test_runes_state_direct_in_template_expr() {
    let code = run_svelte2tsx_v5("<p>{$state(0)}</p>");
    assert!(
        code.contains("__sveltets_2_fn_component"),
        "$state() in template expression must be runes mode; got:\n{code}"
    );
}

/// `$derived(a + b)` in a template expression tag and NO `<script>` → runes.
#[test]
fn test_runes_derived_in_template_expr() {
    let code = run_svelte2tsx_v5("<p>{$derived(a + b)}</p>");
    assert!(
        code.contains("__sveltets_2_fn_component"),
        "$derived() in template expression must be runes mode; got:\n{code}"
    );
}

/// `$effect.pre(...)` in a template expression → runes (member-call variant).
#[test]
fn test_runes_effect_pre_in_template_expr() {
    let code = run_svelte2tsx_v5("<p>{$effect.pre(() => {})}</p>");
    assert!(
        code.contains("__sveltets_2_fn_component"),
        "$effect.pre() in template expression must be runes mode; got:\n{code}"
    );
}

/// `{@attach $effect(() => {})}` — rune global nested inside an arrow function
/// body of an AttachTag expression → must be runes mode (fn_component).
///
/// Ground truth: official svelte2tsx collects `$effect` as an undeclared global
/// via `implicitStoreValues` even when it appears inside a nested function body
/// passed to `{@attach ...}`.
#[test]
fn test_runes_effect_nested_in_attach_tag() {
    let code = run_svelte2tsx_v5("<div {@attach $effect(() => {})}></div>");
    assert!(
        code.contains("__sveltets_2_fn_component"),
        "$effect() nested in {{@attach}} must be runes mode; got:\n{code}"
    );
    assert!(
        !code.contains("__sveltets_2_isomorphic_component"),
        "$effect() in {{@attach}} must NOT be legacy mode; got:\n{code}"
    );
}

/// `use:action={() => $state(0)}` — rune global inside arrow function body
/// of a `use:` directive → must be runes mode.
#[test]
fn test_runes_state_nested_in_use_directive() {
    let code = run_svelte2tsx_v5("<div use:action={() => $state(0)}></div>");
    assert!(
        code.contains("__sveltets_2_fn_component"),
        "$state() nested in use: directive must be runes mode; got:\n{code}"
    );
}

/// A plain template with NO rune globals must remain legacy.
#[test]
fn test_legacy_template_no_rune_globals() {
    // `pathname` is just a regular identifier — not a rune global.
    let code = run_svelte2tsx_v5(
        "<nav><a href=\"/\" aria-current={pathname === '/' ? 'page' : null}>home</a></nav>",
    );
    assert!(
        code.contains("__sveltets_2_isomorphic_component"),
        "template with no rune globals must be legacy mode; got:\n{code}"
    );
}

// =============================================================================
// svelte:boundary snippet-as-implicit-prop tests
//
// Upstream `SnippetBlock.ts::hoistSnippetBlock` returns early for
// `SvelteBoundary`, treating it exactly like `InlineComponent`: direct
// `{#snippet}` children become implicit properties of the element's
// `createElement` attrs object instead of standalone `const` declarations.
// =============================================================================

/// `{#snippet pending()}` inside `<svelte:boundary>` must be emitted as an
/// implicit property of the `createElement` call, not as a standalone `const`.
///
/// Ground truth: upstream svelte2tsx output for
///   `<svelte:boundary><p>{await x}</p>{#snippet pending()}<p>loading</p>{/snippet}</svelte:boundary>`
/// is:
///   `svelteHTML.createElement("svelte:boundary", { pending: () => { async () => { ... }; return __sveltets_2_any(0); }, });`
///   followed by the non-snippet `<p>` child OUTSIDE the createElement call.
#[test]
fn test_boundary_pending_snippet_as_implicit_prop() {
    // The canonical boundary/2.svelte example from the corpus.
    let source = "<svelte:boundary>\n\t<p>child</p>\n\t{#snippet pending()}\n\t\t<p>loading</p>\n\t{/snippet}\n</svelte:boundary>";
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
    let code = &result.code;
    eprintln!("BOUNDARY SNIPPET OUTPUT:\n{code}");

    // The snippet must appear as an implicit prop INSIDE the createElement attrs.
    // Note: rsvelte emits `pending:()` (no space); oxfmt normalizes to `pending: ()`.
    assert!(
        code.contains("pending:() => {"),
        "pending snippet must be an implicit attr prop (not a standalone const); got:\n{code}"
    );
    // There must be NO standalone `const pending = ...` declaration.
    assert!(
        !code.contains("const pending"),
        "snippet must NOT also appear as a standalone const; got:\n{code}"
    );
    // The snippet body must close with return __sveltets_2_any(0)},
    // (the trailing comma makes it an object property value).
    assert!(
        code.contains("return __sveltets_2_any(0)},"),
        "snippet body must end with `return __sveltets_2_any(0)}},`; got:\n{code}"
    );
    // The non-snippet <p>child</p> element must still appear (emitted AFTER `});`).
    assert!(
        code.contains("svelteHTML.createElement(\"p\","),
        "non-snippet child <p> must still be emitted; got:\n{code}"
    );
    // Sanity: createElement for the boundary element must be present.
    assert!(
        code.contains("svelteHTML.createElement(\"svelte:boundary\","),
        "boundary createElement call must be present; got:\n{code}"
    );
}

/// `{#snippet failed(error, reset)}` (with parameters) inside `<svelte:boundary>`.
#[test]
fn test_boundary_failed_snippet_with_params() {
    let source = "<svelte:boundary>\n\t<Component />\n\t{#snippet failed(error, reset)}\n\t\t<button onclick={reset}>retry</button>\n\t{/snippet}\n</svelte:boundary>";
    let result = svelte2tsx(source, Svelte2TsxOptions::default()).unwrap();
    let code = &result.code;
    eprintln!("BOUNDARY FAILED SNIPPET OUTPUT:\n{code}");

    // Note: rsvelte emits `failed:(error, reset)` (no space); oxfmt normalizes spacing.
    assert!(
        code.contains("failed:(error, reset) => {"),
        "failed snippet with params must be an implicit attr prop; got:\n{code}"
    );
    assert!(
        !code.contains("const failed"),
        "snippet must NOT appear as a standalone const; got:\n{code}"
    );
    // The Component child must still be emitted after the createElement closes.
    assert!(
        code.contains("__sveltets_2_ensureComponent(Component)"),
        "non-snippet Component child must still be emitted; got:\n{code}"
    );
}

// =============================================================================
// Async component (top-level await) tests
//
// Reference: createRenderFunction.ts (async keyword on $$render) and
//            addComponentExport.ts (`renderCall` / `awaitDeclaration`).
// =============================================================================

/// Direct top-level await (`const x = await fetch(1)`) must produce:
///   • `async function $$render() {` (the `async` keyword)
///   • `/*Ωignore_startΩ*/ const $$$render = await $$render(); /*Ωignore_endΩ*/`
///   • `const Foo__SvelteComponent_ = __sveltets_2_fn_component($$$render);`
#[test]
fn test_async_component_direct_await() {
    let source = "<script>const x = await fetch('/');</script>{x}";
    let options = Svelte2TsxOptions {
        version: SvelteVersion::V5,
        filename: "Foo.svelte".to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    let code = svelte2tsx(source, options).unwrap().code;
    eprintln!("ASYNC DIRECT:\n{code}");
    assert!(
        code.contains("async function $$render(") || code.contains(";async function $$render("),
        "component with direct top-level await must use `async function $$render`; got:\n{code}"
    );
    assert!(
        code.contains("const $$$render = await $$render()"),
        "component with top-level await must emit `const $$$render = await $$render()` declaration; got:\n{code}"
    );
    assert!(
        code.contains("__sveltets_2_fn_component($$$render)"),
        "component with top-level await must pass `$$$render` (not `$$render()`) to fn_component; got:\n{code}"
    );
    assert!(
        !code.contains("__sveltets_2_fn_component($$render())"),
        "fn_component must NOT use `$$render()` when top-level await is present; got:\n{code}"
    );
}

/// Nested top-level await inside `$derived(await x)` must also be detected.
///
/// This tests the deep recursive `expr_contains_await_deep` walk that the old
/// shallow `contains_await_expression` missed.  Ground truth: upstream
/// `processInstanceScriptContent.ts` sets `hasTopLevelAwait` for any
/// AwaitExpression at the root scope, including inside a CallExpression argument.
#[test]
fn test_async_component_nested_await_in_derived() {
    let source = "<script>let foo = $derived(await 1);</script>{foo}";
    let options = Svelte2TsxOptions {
        version: SvelteVersion::V5,
        filename: "Test.svelte".to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    let code = svelte2tsx(source, options).unwrap().code;
    eprintln!("ASYNC NESTED DERIVED:\n{code}");
    assert!(
        code.contains("async function $$render(") || code.contains(";async function $$render("),
        "$derived(await x) at top level must produce `async function $$render`; got:\n{code}"
    );
    assert!(
        code.contains("const $$$render = await $$render()"),
        "$derived(await x) must emit awaitDeclaration; got:\n{code}"
    );
    assert!(
        code.contains("__sveltets_2_fn_component($$$render)"),
        "$derived(await x) must pass `$$$render` to fn_component; got:\n{code}"
    );
}

/// A normal (non-async) component must keep `function $$render` (no `async`)
/// and use `$$render()` (not `$$$render`) in the export.
#[test]
fn test_non_async_component_no_await_declaration() {
    let source = "<script>let x = 1;</script>{x}";
    let options = Svelte2TsxOptions {
        version: SvelteVersion::V5,
        filename: "Normal.svelte".to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    let code = svelte2tsx(source, options).unwrap().code;
    eprintln!("NON-ASYNC:\n{code}");
    // The function header should NOT be async for a plain component
    assert!(
        !code.contains("async function $$render("),
        "non-async component must NOT use `async function $$render`; got:\n{code}"
    );
    // No awaitDeclaration
    assert!(
        !code.contains("$$$render"),
        "non-async component must NOT emit `$$$render`; got:\n{code}"
    );
}

/// `await` inside a function body at the top level must NOT trigger async.
/// Only awaits at the *component* scope (not inside an inner function) count.
#[test]
fn test_async_only_in_inner_function_is_not_top_level() {
    // The `await` is inside `async function c(a) { ... }` — its scope is
    // NOT the component root scope, so `hasTopLevelAwait` must stay false.
    let source = "<script>async function c(a) { return await Promise.resolve(a); }</script>{c(1)}";
    let options = Svelte2TsxOptions {
        version: SvelteVersion::V5,
        filename: "Inner.svelte".to_string(),
        is_ts_file: false,
        ..Default::default()
    };
    let code = svelte2tsx(source, options).unwrap().code;
    eprintln!("INNER ASYNC:\n{code}");
    assert!(
        !code.contains("async function $$render("),
        "await inside inner async function must NOT make $$render async; got:\n{code}"
    );
    assert!(
        !code.contains("$$$render"),
        "await inside inner async function must NOT emit $$$render; got:\n{code}"
    );
}
