use oxc_span::GetSpan;

use crate::parse::parse;
use crate::syntax_tree::TemplateNode;

/// The text of each `{#each}`'s expression, context and index.
fn each(source: &str) -> Vec<(String, Option<String>, Option<String>)> {
    let component = parse(source).expect("parses");
    let tree = &component.javascript;
    let text = |span: oxc_span::Span| source[span.start as usize..span.end as usize].to_owned();
    component
        .nodes
        .iter()
        .filter_map(|node| match *node {
            TemplateNode::Each {
                expression,
                context,
                index,
                ..
            } => Some((
                text(tree.get_expression(expression).span()),
                context.map(|p| text(tree.get_pattern(p).span())),
                index.map(|p| text(tree.get_pattern(p).span())),
            )),
            _ => None,
        })
        .collect()
}

#[test]
fn the_as_that_ends_a_typescript_expression_is_the_blocks() {
    let script = "<script lang=\"ts\">let a: number[] = [];</script>";
    let owned = |e: &str, c: &str, i: Option<&str>| {
        (e.to_owned(), Some(c.to_owned()), i.map(str::to_owned))
    };
    assert_eq!(
        each(&format!("{script}{{#each a || [] as x, i}}{{x}}{{/each}}")),
        [owned("a || []", "x", Some("i"))]
    );
    assert_eq!(
        each(&format!("{script}{{#each a ?? [] as x}}{{x}}{{/each}}")),
        [owned("a ?? []", "x", None)]
    );
    assert_eq!(
        each(&format!("{script}{{#each c ? a : [] as x}}{{x}}{{/each}}")),
        [owned("c ? a : []", "x", None)]
    );
    // A parenthesized assertion is the expression's own.
    assert_eq!(
        each(&format!(
            "{script}{{#each (a as number[]) as x}}{{x}}{{/each}}"
        )),
        [owned("a as number[]", "x", None)]
    );
}
