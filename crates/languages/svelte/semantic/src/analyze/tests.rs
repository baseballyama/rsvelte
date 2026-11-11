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
