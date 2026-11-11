use rsvelte_svelte_syntax::parse::parse;

use crate::compiler_syntax_tree::{NodeKind, lower};
use crate::resolve::resolve;

/// Whether each argument of each `{@render}` tag in `source` has a call, in document order.
fn render_calls(source: &str) -> Vec<Vec<bool>> {
    let component = parse(source).expect("parses");
    let lowered = lower(&component, source);
    let res = resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        None,
        &lowered,
    );
    let input = crate::svelte_input(&component, &lowered, source, "App.svelte");
    let analysis = super::analyze(&input, &res);
    lowered
        .nodes
        .iter()
        .filter_map(|node| match node.kind {
            NodeKind::Render { expression } => Some(
                analysis
                    .render_arguments(expression)
                    .iter()
                    .map(|m| m.has_call)
                    .collect(),
            ),
            _ => None,
        })
        .collect()
}

#[test]
fn each_render_argument_has_its_own_metadata() {
    let source = "<script>let { f, y } = $props();</script>\n\
                  {#snippet row(a, b)}{a}{b}{/snippet}\n\
                  {@render row(f(y), y)}\n{@render row?.(y, f(y))}";
    assert_eq!(render_calls(source), [vec![true, false], vec![false, true]]);
}

#[test]
fn a_render_tag_needs_no_context_for_its_call() {
    let source = "<script>let { children, f } = $props();</script>{@render children?.()}";
    let component = parse(source).expect("parses");
    let lowered = lower(&component, source);
    let res = resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        None,
        &lowered,
    );
    let input = crate::svelte_input(&component, &lowered, source, "App.svelte");
    assert!(!super::analyze(&input, &res).needs_context);
    let with_call = "<script>let { children, f } = $props();</script>{@render children(f())}";
    let component = parse(with_call).expect("parses");
    let lowered = lower(&component, with_call);
    let res = resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        None,
        &lowered,
    );
    let input = crate::svelte_input(&component, &lowered, with_call, "App.svelte");
    assert!(super::analyze(&input, &res).needs_context);
}

#[test]
fn a_global_block_scopes_no_element_and_uses_its_rules() {
    let source = "<div class=\"tabs\"><a>x</a></div><p class=\"x\">y</p>\n\
                  <style>:global { .tabs { & > a { color: red } } } .x { color: red }</style>";
    let component = parse(source).expect("parses");
    let lowered = lower(&component, source);
    let res = resolve(&component.javascript, None, None, &lowered);
    let input = crate::svelte_input(&component, &lowered, source, "App.svelte");
    let analysis = super::analyze(&input, &res);
    let scoped: Vec<&str> = lowered
        .nodes
        .iter_enumerated()
        .filter(|&(identifier, _)| analysis.scoped[identifier])
        .map(|(_, node)| {
            &source[node.span.start_offset as usize..node.span.start_offset as usize + 2]
        })
        .collect();
    assert_eq!(scoped, ["<p"]);
    assert!(analysis.stylesheet_used.iter().all(|&used| used));
}

#[test]
fn a_call_in_a_template_default_needs_context() {
    let needs = |source: &str| {
        let component = parse(source).expect("parses");
        let lowered = lower(&component, source);
        let res = resolve(
            &component.javascript,
            component.instance.as_ref().map(|s| s.program),
            None,
            &lowered,
        );
        let input = crate::svelte_input(&component, &lowered, source, "App.svelte");
        super::analyze(&input, &res).needs_context
    };
    let script = "<script>let { f, xs } = $props();</script>";
    assert!(!needs(&format!(
        "{script}{{#snippet s(v = 1)}}{{v}}{{/snippet}}{{@render s()}}"
    )));
    assert!(needs(&format!(
        "{script}{{#snippet s(v = f())}}{{v}}{{/snippet}}{{@render s()}}"
    )));
    assert!(needs(&format!(
        "{script}{{#each xs as {{ v = f() }}}}{{v}}{{/each}}"
    )));
}

#[test]
fn a_store_subscription_is_state_and_asks_of_its_store() {
    // Each template expression's text with its metadata, and whether the component needs context.
    let analyzed = |source: &str| {
        let component = parse(source).expect("parses");
        let lowered = lower(&component, source);
        let res = resolve(
            &component.javascript,
            component.instance.as_ref().map(|s| s.program),
            None,
            &lowered,
        );
        let input = crate::svelte_input(&component, &lowered, source, "App.svelte");
        let analysis = super::analyze(&input, &res);
        let mut metas: Vec<(String, bool, bool, bool)> = component
            .javascript
            .expressions()
            .filter_map(|(identifier, e)| {
                let meta = analysis.expressions.get(&identifier)?;
                let span = oxc_span::GetSpan::span(e);
                let text = source[span.start as usize..span.end as usize].to_owned();
                Some((
                    text,
                    meta.has_state,
                    meta.has_call,
                    meta.first_store_subscription.is_some(),
                ))
            })
            .collect();
        metas.sort();
        (metas, analysis.needs_context)
    };
    // Whether svelte 5.57.3 pushes a context for each, in runes mode.
    let local = "<script>const f = { subscribe: (fn) => { fn(() => 1); return () => {}; } };\
                 </script><p>{$f()}</p>";
    assert_eq!(
        analyzed(local),
        (vec![("$f()".to_owned(), true, true, true)], false)
    );
    // A prop's subscription is unsafe as the prop is, so calling it needs context.
    let prop = "<script>let { f } = $props();</script><p>{$f()}</p>";
    assert_eq!(
        analyzed(prop),
        (vec![("$f()".to_owned(), true, true, true)], true)
    );
    let prop_read = "<script>let { f } = $props();</script><p>{$f}</p>";
    assert_eq!(
        analyzed(prop_read),
        (vec![("$f".to_owned(), true, false, true)], false)
    );
    let import = "<script>import { writable } from 'svelte/store'; const count = writable(0);\
                  </script><p>{$count}</p>";
    assert_eq!(
        analyzed(import),
        (vec![("$count".to_owned(), true, false, true)], true)
    );
}

#[test]
fn no_selector_matches_an_element_inside_svelte_head() {
    // From the official compiler: `*` scopes only the `<p>`, `meta` is unused, and `.x` scopes
    // only the `<p>`, even through an `{#if}` inside the head.
    for (style, scoped, used) in [
        ("* { color: red }", &["<p"][..], true),
        ("meta { color: red }", &[][..], false),
        (".x { color: red }", &["<p"][..], true),
    ] {
        let source = format!(
            "<svelte:head><meta class=\"x\" />{{#if a}}<span class=\"x\"></span>{{/if}}</svelte:head>\
             <p class=\"x\"></p><style>{style}</style>"
        );
        let component = parse(&source).expect("parses");
        let lowered = lower(&component, &source);
        let res = resolve(&component.javascript, None, None, &lowered);
        let input = crate::svelte_input(&component, &lowered, &source, "App.svelte");
        let analysis = super::analyze(&input, &res);
        let actual: Vec<&str> = lowered
            .nodes
            .iter_enumerated()
            .filter(|&(identifier, _)| analysis.scoped[identifier])
            .map(|(_, node)| {
                &source[node.span.start_offset as usize..node.span.start_offset as usize + 2]
            })
            .collect();
        assert_eq!(actual, scoped, "{style}");
        assert_eq!(analysis.stylesheet_used, [used], "{style}");
    }
}
