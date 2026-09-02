//! Where a `{#snippet}` body sits in the DOM is decided twice in this tree. The
//! pruning half (`3_transform/css.rs`) was fixed first; this file pins the
//! ancestor-scoping half (`2_analyze/css_scoping.rs`), whose subject is the
//! TEMPLATE — which elements carry the scope class — and not the CSS text. Its
//! `RenderTag` arm used to compute a name, test a map and do nothing, so an
//! element whose only matching descendant lives in a rendered snippet was left
//! unscoped while the CSS rule was kept: two halves of one answer disagreeing
//! inside a single output.
//!
//! Every expectation below is the official compiler's output for the same
//! source, spelled out here rather than compared to it at run time.

use rsvelte_core::{CompileOptions, CssMode, GenerateMode, compile};

struct Out {
    js: String,
    css: String,
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
    Out {
        js: result.js.code,
        css: result
            .css
            .map(|c| c.code)
            .unwrap_or_default()
            .split_whitespace()
            .collect::<Vec<_>>()
            .join(" "),
    }
}

/// The hash is a function of the source, so the tests name the shape rather than
/// the digest: an element is scoped when its `class` gains a `svelte-` token.
fn scoped(out: &Out, class_attr: &str) -> bool {
    out.js.contains(&format!("class=\"{class_attr} svelte-"))
}

fn bare_element_scoped(out: &Out, tag: &str) -> bool {
    out.js.contains(&format!("<{tag} class=\"svelte-"))
}

const ANCESTOR_ONLY_RENDER: &str = "{#snippet row()}<span>x</span>{/snippet}\n\
     <div class=\"wrap\">{@render row()}</div>\n\
     <style>.wrap span { color: red; }</style>\n";

#[test]
fn an_ancestor_whose_only_matching_descendant_is_in_a_rendered_snippet_is_scoped() {
    let out = build(ANCESTOR_ONLY_RENDER);
    assert!(
        scoped(&out, "wrap"),
        "`.wrap` holds no `<span>` lexically; its match is reached through the render tag: {}",
        out.js
    );
    assert!(bare_element_scoped(&out, "span"), "{}", out.js);
    assert!(
        !out.css.contains("(unused)"),
        "official keeps the rule: {}",
        out.css
    );
}

const NESTED_RENDER: &str = "{#snippet inner()}<span>x</span>{/snippet}\n\
     {#snippet outer()}{@render inner()}{/snippet}\n\
     <div class=\"wrap\">{@render outer()}</div>\n\
     <style>.wrap span { color: red; }</style>\n";

#[test]
fn a_renderer_written_inside_a_snippet_inherits_that_snippets_own_sites() {
    // `inner`'s only site is inside `outer`'s body, which has no ancestors of its
    // own until `outer`'s sites are resolved — so the chain is transitive.
    let out = build(NESTED_RENDER);
    assert!(scoped(&out, "wrap"), "{}", out.js);
    assert!(bare_element_scoped(&out, "span"), "{}", out.js);
}

const TWO_SITES: &str = "{#snippet row()}<span>x</span>{/snippet}\n\
     <div class=\"wrap\">{@render row()}</div>\n\
     <div class=\"other\">{@render row()}</div>\n\
     <style>.wrap span { color: red; }</style>\n";

#[test]
fn one_snippet_rendered_at_two_sites_keeps_the_mark_either_site_earns() {
    // The body is walked once per site, so the second site's answer must not
    // unset the first's. `.other` is the control in the same file: it matches no
    // selector and stays unscoped, which "mark everything reachable" would break.
    let out = build(TWO_SITES);
    assert!(scoped(&out, "wrap"), "{}", out.js);
    assert!(bare_element_scoped(&out, "span"), "{}", out.js);
    assert!(
        !scoped(&out, "other"),
        "`.other` matches no selector: {}",
        out.js
    );
}

const ATTR_PASSED: &str = "<script>import Comp from './Comp.svelte';</script>\n\
     {#snippet row()}<span>x</span>{/snippet}\n\
     <div class=\"wrap\"><Comp foo={row} /></div>\n\
     <style>.wrap span { color: red; }</style>\n";

#[test]
fn a_component_handed_a_snippet_by_attribute_is_a_render_site() {
    // Upstream's `get_descendant_elements` special-cases only `RenderTag`, but a
    // component's `snippet_renderers` entry is the same relation and the body is
    // a descendant of the component's position.
    let out = build(ATTR_PASSED);
    assert!(scoped(&out, "wrap"), "{}", out.js);
    assert!(bare_element_scoped(&out, "span"), "{}", out.js);
}

const NEVER_RENDERED: &str = "{#snippet row()}<span>x</span>{/snippet}\n\
     <div class=\"wrap\"></div>\n\
     <style>.wrap span { color: red; }</style>\n";

#[test]
fn a_snippet_nothing_renders_lends_no_ancestors() {
    // The negative control the positives need: an empty site set is an answer,
    // so nothing here is scoped and official prunes the rule.
    let out = build(NEVER_RENDERED);
    assert!(!scoped(&out, "wrap"), "{}", out.js);
    assert!(!bare_element_scoped(&out, "span"), "{}", out.js);
    assert!(
        out.css.contains("/* (unused) .wrap span"),
        "official prunes: {}",
        out.css
    );
}

const MUTUAL_RECURSION: &str = "<script>import Comp from './Comp.svelte';</script>\n\
     {#snippet entry(route)}\n\
       <li>\n\
         <Comp>\n\
           {#snippet body()}\n\
             <ul>{@render entry(route)}</ul>\n\
           {/snippet}\n\
         </Comp>\n\
       </li>\n\
     {/snippet}\n\
     <nav class=\"drawer-nav\"><ul>{@render entry(1)}</ul></nav>\n\
     <style>nav.drawer-nav { ul { color: red; ul { color: blue; } } }</style>\n";

#[test]
fn a_snippet_reached_only_through_a_cycle_still_resolves_its_own_ancestors() {
    // `entry` and `body` render each other, so resolving either one hits the
    // recursion bound. The bounded answer depends on which snippet the walk
    // started from, so caching one under its own key makes whichever snippet is
    // resolved first decide the other's ancestors.
    let out = build(MUTUAL_RECURSION);
    assert!(
        !out.js.contains("<ul>"),
        "both `<ul>`s sit under `nav.drawer-nav ul`: {}",
        out.js
    );
    assert!(bare_element_scoped(&out, "ul"), "{}", out.js);
    assert!(
        out.js.contains("<li>"),
        "no rule matches `<li>`, so it stays unscoped: {}",
        out.js
    );
}
