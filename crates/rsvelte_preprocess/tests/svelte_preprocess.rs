//! Port of the in-scope `svelte-preprocess` fixtures
//! (`submodules/svelte-preprocess/test/transformers/{replace,globalStyle}.test.ts`).
//!
//! Covers the native subset: `replace` (markup) and `globalStyle` (style). The
//! language transforms requiring JS toolchains (typescript/tsc, postcss, less,
//! stylus, pug, coffeescript, babel) are out of native scope for v1 and tracked
//! as known failures. The two globalStyle `sourceMap` cases assert map-mapping
//! differences and are deferred with the source-map work.

#![cfg(feature = "svelte-preprocess")]

use regex::Regex;
use rsvelte_core::compiler::preprocess::preprocess;
use rsvelte_preprocess::svelte_preprocess::{
    AutoOptions, ReplaceRule, Replacement, ScssOptions, svelte_preprocess,
};

fn run(template: &str, opts: AutoOptions) -> String {
    let rt = tokio::runtime::Builder::new_current_thread()
        .build()
        .unwrap();
    rt.block_on(async {
        preprocess(
            template.to_string(),
            vec![svelte_preprocess(opts)],
            Some("/App.svelte".to_string()),
        )
        .await
        .expect("preprocess")
        .code
    })
}

fn rule(pattern: &str, replacement: &str) -> ReplaceRule {
    ReplaceRule::new(Regex::new(pattern).unwrap(), replacement)
}

// ─── replace ────────────────────────────────────────────────────────────────

#[test]
fn replace_string_patterns_in_markup() {
    let rules = vec![
        rule(r"(?im)@if\s*\((.*?)\)$", "{#if ${1}}"),
        rule(r"(?im)@elseif\s*\((.*?)\)$", "{:else if ${1}}"),
        rule(r"(?im)@else$", "{:else}"),
        rule(r"(?im)@endif$", "{/if}"),
        rule(r"(?im)@each\s*\((.*?)\)$", "{#each ${1}}"),
        rule(r"(?im)@endeach$", "{/each}"),
        rule(r"(?im)@await\s*\((.*?)\)$", "{#await ${1}}"),
        rule(r"(?im)@then\s*(?:\((.*?)\))?$", "{:then ${1}}"),
        rule(r"(?im)@catch\s*(?:\((.*?)\))?$", "{:catch ${1}}"),
        rule(r"(?im)@endawait$", "{/await}"),
        rule(r"(?im)@debug\s*\((.*?)\)$", "{@debug ${1}}"),
        rule(r"(?im)@html\s*\((.*?)\)$", "{@html ${1}}"),
    ];

    let template = r#"<script>
  let foo = 1
</script>

@debug(foo)
@html(foo)

@if (foo && bar)
    <div>hey</div>
@elseif (baz < 0 && (baz || bar))
    <div>yo</div>
@endif

@each(expression as name, index (key))
    <li>foo</li>
@else
    <div>foo</div>
@endeach

@await(promise)
    awaiting
@then
    then
@then(value)
    then value
@catch
    catch
@endawait"#
        .repeat(2);

    let expected = r#"<script>
  let foo = 1
</script>

{@debug foo}
{@html foo}

{#if foo && bar}
    <div>hey</div>
{:else if baz < 0 && (baz || bar)}
    <div>yo</div>
{/if}

{#each expression as name, index (key)}
    <li>foo</li>
{:else}
    <div>foo</div>
{/each}

{#await promise}
    awaiting
{:then }
    then
{:then value}
    then value
{:catch }
    catch
@endawait<script>
  let foo = 1
</script>

{@debug foo}
{@html foo}

{#if foo && bar}
    <div>hey</div>
{:else if baz < 0 && (baz || bar)}
    <div>yo</div>
{/if}

{#each expression as name, index (key)}
    <li>foo</li>
{:else}
    <div>foo</div>
{/each}

{#await promise}
    awaiting
{:then }
    then
{:then value}
    then value
{:catch }
    catch
{/await}"#;

    let opts = AutoOptions {
        replace: rules,
        ..Default::default()
    };
    assert_eq!(run(&template, opts), expected);
}

#[test]
fn replace_with_a_function() {
    // SAFETY: single-threaded test runtime; matches the vitest NODE_ENV=test env.
    unsafe { std::env::set_var("NODE_ENV", "test") };

    let func = Replacement::Func(std::sync::Arc::new(|caps: &regex::Captures| {
        let value = std::env::var(&caps[1]).unwrap_or_default();
        format!("\"{value}\"")
    }));

    let template =
        "<script>\n      let isDEV = process.env.NODE_ENV === 'development';\n    </script>";
    let expected = "<script>\n      let isDEV = \"test\" === 'development';\n    </script>";

    let opts = AutoOptions {
        replace: vec![ReplaceRule {
            regex: Regex::new(r"process\.env\.(\w+)").unwrap(),
            replacement: func,
        }],
        ..Default::default()
    };
    assert_eq!(run(template, opts), expected);
}

// ─── globalStyle ──────────────────────────────────────────────────────────────

fn gs(template: &str) -> String {
    run(template, AutoOptions::default())
}

#[test]
fn global_attr_wraps_selector() {
    assert!(
        gs("<style global>div{color:red}.test{}</style>")
            .contains(":global(div){color:red}:global(.test){}")
    );
}

#[test]
fn global_attr_wraps_only_if_needed() {
    assert!(
        gs("<style global>.test{}:global(.foo){}</style>")
            .contains(":global(.test){}:global(.foo){}")
    );
}

#[test]
fn global_attr_prefixes_keyframes() {
    let out = gs(
        "<style global>\n@keyframes a {from{} to{}}@keyframes -global-b {from{} to{}}\n</style>",
    );
    assert!(
        out.contains("@keyframes -global-a {from{} to{}}@keyframes -global-b {from{} to{}}"),
        "{out}"
    );
}

#[test]
fn global_attr_supports_prefixed_keyframes() {
    let out = gs(
        "<style global>\n@-webkit-keyframes a {from{} to{}}@-webkit-keyframes -global-b {from{} to{}}\n</style>",
    );
    assert!(
        out.contains(
            "@-webkit-keyframes -global-a {from{} to{}}@-webkit-keyframes -global-b {from{} to{}}"
        ),
        "{out}"
    );
}

#[test]
fn global_attr_local_at_beginning() {
    assert!(gs("<style global>:local(div) .test{}</style>").contains("div :global(.test){}"));
}

#[test]
fn global_attr_local_in_middle() {
    assert!(
        gs("<style global>.test :local(div) .test{}</style>")
            .contains(":global(.test) div :global(.test){}")
    );
}

#[test]
fn global_attr_local_at_end() {
    assert!(gs("<style global>.test :local(div){}</style>").contains(":global(.test) div{}"));
}

#[test]
fn global_attr_local_rest_local() {
    let out = gs(
        "<style global>\n      .test :local div *::before {}\n      .test :local div + a:hover {}\n      </style>",
    );
    assert!(out.contains(":global(.test) div *::before {}"), "{out}");
    assert!(out.contains(":global(.test) div + a:hover {}"), "{out}");
}

#[test]
fn global_attr_local_until_next_global() {
    let out = gs(
        "<style global>\n      .test :local main > :global section div::before {}\n      .test :local div > .potato :global(p) a:hover {}\n      </style>",
    );
    assert!(
        out.contains(":global(.test) main > :global(section) :global(div::before) {}"),
        "{out}"
    );
    assert!(
        out.contains(":global(.test) div > .potato :global(p) :global(a:hover) {}"),
        "{out}"
    );
}

#[test]
fn global_selector_wraps() {
    assert!(
        gs("<style>:global div{color:red}:global .test{}</style>")
            .contains(":global(div){color:red}:global(.test){}")
    );
}

#[test]
fn global_selector_wraps_only_if_needed() {
    assert!(
        gs("<style>:global .test{}:global :global(.foo){}</style>")
            .contains(":global(.test){}:global(.foo){}")
    );
}

#[test]
fn global_selector_multiple_levels() {
    let out = gs("<style>:global div .cls{}</style>");
    let re = Regex::new(r"(:global\(div .cls\)\{\}|:global\(div\) :global\(\.cls\)\{\})").unwrap();
    assert!(re.is_match(&out), "{out}");
}

#[test]
fn global_selector_multiple_levels_in_middle() {
    let out = gs("<style>div div :global span .cls{}</style>");
    let re = Regex::new(r"div div (:global\(span .cls\)\{\}|:global\(span\) :global\(\.cls\)\{\})")
        .unwrap();
    assert!(re.is_match(&out), "{out}");
}

#[test]
fn global_selector_does_not_break_at_end() {
    assert!(gs("<style>span :global{}</style>").contains("span{}"));
}

#[test]
fn global_selector_collapsed_nesting() {
    let out = gs("<style>div :global span :global .cls{}</style>");
    let re =
        Regex::new(r"div (:global\(span .cls\)\{\}|:global\(span\) :global\(\.cls\)\{\})").unwrap();
    assert!(re.is_match(&out), "{out}");
}

#[test]
fn global_selector_does_not_interfere() {
    assert!(gs("<style>div :global(span){}</style>").contains("div :global(span){}"));
}

#[test]
fn global_selector_allows_mixing() {
    let out = gs("<style>div :global(span) :global .cls{}</style>");
    let re =
        Regex::new(r"div (:global\(span .cls\)\{\}|:global\(span\) :global\(\.cls\)\{\})").unwrap();
    assert!(re.is_match(&out), "{out}");
}

#[test]
fn global_selector_removes_global_only_rules() {
    assert!(
        gs("<style>:global{/*comment*/}:global,div{/*comment*/}</style>")
            .contains("<style>div{/*comment*/}</style>")
    );
}

#[test]
fn global_selector_unwraps_global_in_font_face() {
    assert!(
        gs("<style>@font-face{:global{font-family:Helvetica}}</style>")
            .contains("<style>@font-face{font-family:Helvetica}</style>")
    );
}

// ─── scss (native subset) ─────────────────────────────────────────────────────

#[test]
fn scss_prepend_data() {
    // Port of `should prepend scss content via 'data' option property`.
    let opts = AutoOptions {
        scss: Some(ScssOptions {
            prepend_data: Some("$color:blue;div{color:$color}".to_string()),
            ..Default::default()
        }),
        ..Default::default()
    };
    assert!(run(r#"<style lang="scss"></style>"#, opts).contains("blue"));
}

#[test]
fn scss_compiles_basic_block() {
    let out = gs("<style lang=\"scss\">$c: red;\nb { color: $c }</style>");
    assert!(out.contains("color: red;"), "{out}");
}
