//! Upstream keys `SnippetBlock.metadata.sites` on the block NODE, reached through
//! `binding.initial`, and fills it in one pass over `analysis.snippet_renderers`
//! (`2-analyze/index.js:847`): a renderer that resolves to a local snippet is a
//! site of that one, a renderer that resolves to nothing is a site of EVERY
//! snippet, and a renderer that resolves outside the component is a site of none.
//!
//! rsvelte keyed the same map by NAME and had no notion of an unresolved
//! renderer, so two snippets sharing a name merged, and "no sites" was read as
//! "unknown" (conservative) and then, briefly, as "never rendered" — the second
//! of which deletes CSS the user wrote. Every expectation below is the official
//! compiler's output for the same source, spelled out here rather than compared
//! to it at run time.

use rsvelte_core::{CompileOptions, CssMode, GenerateMode, compile};

struct Out {
    css: String,
    warnings: Vec<String>,
}

fn build(source: &str) -> Out {
    let result = compile(
        source,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .unwrap_or_else(|e| panic!("compile: {e:?}"));
    let css = result
        .css
        .map(|c| c.code)
        .unwrap_or_default()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ");
    Out {
        warnings: result.warnings.iter().map(|w| w.code.clone()).collect(),
        css,
    }
}

fn is_pruned(out: &Out, selector: &str) -> bool {
    out.css.contains(&format!("/* (unused) {selector}"))
}

/// Two `{#snippet row()}` in different scopes and a third passed to a component.
/// Only the one rendered inside `.wrap` may lend its body `.wrap` as an ancestor.
const SHADOWED: &str = "<script>\n\timport Comp from './Comp.svelte';\n</script>\n\
     {#snippet row()}<span>outer</span>{/snippet}\n\
     <div class=\"wrap\">{#snippet row()}<b>inner</b>{/snippet}{@render row()}</div>\n\
     <Comp>{#snippet row()}<i>passed</i>{/snippet}</Comp>\n\
     <style>\n\t.wrap span { color: red; }\n\t.wrap b { color: green; }\n\t.wrap i { color: blue; }\n</style>\n";

#[test]
fn a_render_site_belongs_to_one_snippet_node_not_to_every_snippet_of_that_name() {
    let out = build(SHADOWED);
    assert!(
        is_pruned(&out, ".wrap span"),
        "the OUTER `row` is shadowed at the render site and so is never rendered:\n{}",
        out.css
    );
    assert!(
        !is_pruned(&out, ".wrap b"),
        "the INNER `row` is the one `{{@render row()}}` resolves to:\n{}",
        out.css
    );
    assert!(
        is_pruned(&out, ".wrap i"),
        "the component-passed `row` renders at `<Comp>`, outside `.wrap`:\n{}",
        out.css
    );
    assert_eq!(
        out.warnings,
        vec![
            "css_unused_selector".to_string(),
            "css_unused_selector".to_string()
        ],
        "exactly the two pruned rules warn"
    );
}

/// `alias` is an ordinary local binding, so upstream cannot say which snippet
/// `{@render alias()}` runs — `is_resolved_snippet` is false and the site is
/// handed to every snippet. Reading that as "unknown" is a different answer, and
/// reading it as "no sites" deletes the rule.
const UNRESOLVED: &str = "<script>\n\tlet alias = row;\n</script>\n\
     {#snippet row()}<span>x</span>{/snippet}\n\
     <div class=\"aliased\">{@render alias()}</div>\n\
     <div class=\"never\"></div>\n\
     <style>\n\t.aliased span { color: red; }\n\t.never span { color: blue; }\n</style>\n";

#[test]
fn an_unresolved_renderer_is_a_site_of_every_snippet() {
    let out = build(UNRESOLVED);
    assert!(
        !is_pruned(&out, ".aliased span"),
        "`row` is rendered through an unresolvable callee, so `.aliased` is one of its sites:\n{}",
        out.css
    );
    assert!(
        is_pruned(&out, ".never span"),
        "`.never` is a site of nothing — the control that separates this from \
         'every selector is used':\n{}",
        out.css
    );
}

/// A snippet no renderer names has an empty site set, which is knowledge: its
/// body contributes no ancestors at all. The control is the sibling that IS
/// rendered, so a rule that prunes everything cannot pass.
const ORPHANED: &str = "{#snippet shown()}<span>a</span>{/snippet}\n\
     {#snippet orphan()}<b>b</b>{/snippet}\n\
     <div class=\"wrap\">{@render shown()}</div>\n\
     <style>\n\t.wrap span { color: red; }\n\t.wrap b { color: green; }\n</style>\n";

#[test]
fn a_snippet_nothing_renders_contributes_no_ancestors() {
    let out = build(ORPHANED);
    assert!(
        is_pruned(&out, ".wrap b"),
        "`orphan` is never rendered, so its `<b>` is not inside `.wrap`:\n{}",
        out.css
    );
    assert!(
        !is_pruned(&out, ".wrap span"),
        "`shown` is rendered inside `.wrap`:\n{}",
        out.css
    );
}

/// Upstream keeps a component `resolved` when an expression attribute is an
/// identifier that resolves to a snippet — it knows exactly which one. Treating
/// every non-literal attribute as unresolved hands the component's position to
/// every snippet, which is why the never-rendered sibling is needed to see it.
const ATTR_PASSED: &str = "<script>\n\timport Comp from './Comp.svelte';\n</script>\n\
     {#snippet row()}<b>y</b>{/snippet}\n\
     {#snippet other()}<span>x</span>{/snippet}\n\
     <div class=\"wrap\"><Comp foo={row} /></div>\n\
     <style>\n\t.wrap span { color: red; }\n</style>\n";

#[test]
fn an_identifier_attribute_naming_a_snippet_keeps_the_component_resolved() {
    let out = build(ATTR_PASSED);
    assert!(
        is_pruned(&out, ".wrap span"),
        "`<Comp foo={{row}} />` renders `row`, never `other`, so `other`'s `<span>` \
         is not inside `.wrap`:\n{}",
        out.css
    );
}

/// The registration for a snippet declared directly inside a component tested
/// `path.last()`, but `visit_node` pushes the node *before* dispatching, so
/// inside the SnippetBlock visitor that is the snippet itself and the branch was
/// never taken. Nothing noticed while "no sites" meant "unknown, stay
/// conservative"; the moment an empty set became an answer, the body stopped
/// being inside the component. The assertion has to be the POSITIVE direction —
/// a cell where official prunes cannot tell a registered site from a dead branch.
const COMPONENT_PASSED: &str = "<script>\n\timport Comp from './Comp.svelte';\n</script>\n\
     <div class=\"wrap\"><Comp>{#snippet row()}<span>x</span>{/snippet}</Comp></div>\n\
     <style>\n\t.wrap span { color: red; }\n</style>\n";

#[test]
fn a_snippet_declared_inside_a_component_is_rendered_at_that_component() {
    let out = build(COMPONENT_PASSED);
    assert!(
        !is_pruned(&out, ".wrap span"),
        "`<Comp>`'s own position is the site of the snippet it was handed:\n{}",
        out.css
    );
    assert!(
        out.warnings.is_empty(),
        "no rule is unused here: {:?}",
        out.warnings
    );
}
