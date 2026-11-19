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

#[test]
fn without_as_the_block_goes_on_from_the_end_of_its_expression() {
    // Svelte 5.57.3 fails each of these at the offset given, with `expected_token` `}`.
    for (source, at) in [
        ("{#each items /* as item */}x{/each}", 13),
        ("{#each items // c\n}x{/each}", 13),
        ("{#each a.b /* c */}x{/each}", 11),
        ("{#each (items)}x{/each}", 13),
        ("{#each (items /* c */)}x{/each}", 14),
        ("{#each (items), i}x{/each}", 13),
        ("{#each (a), b}x{/each}", 9),
        ("{#each (a, b)}x{/each}", 12),
        ("{#each (a, f(x))}x{/each}", 15),
        (
            "<script lang=\"ts\">let a: number[] = [];</script>{#each (a as number[]), i}x{/each}",
            67,
        ),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(
            (&*error.code, error.span.start_offset),
            ("expected_token", at),
            "{source}"
        );
    }
    // A comment before `as`, on its line or the one before, is the expression's; for JavaScript
    // and TypeScript alike.
    for source in [
        "{#each items // c\n as item}{item}{/each}",
        "{#each items // c\nas item}{item}{/each}",
        "{#each items /* c */\n as item}{item}{/each}",
        "{#each items\n/* c */ as item}{item}{/each}",
        "{#each items /* a */ // b\n as item}{item}{/each}",
        "{#each items // c\n /* d */ as item}{item}{/each}",
        "{#each f(x) // c\n as item}{item}{/each}",
        "{#each (items) // c\n as item}{item}{/each}",
        "{#each items // c\n as item, i (item)}{item}{/each}",
    ] {
        for script in ["", "<script lang=\"ts\"></script>"] {
            let source = format!("{script}{source}");
            let each = each(&source);
            assert_eq!(each.len(), 1, "{source}");
            assert_eq!(each[0].1.as_deref(), Some("item"), "{source}");
        }
    }
    // A comment before `as` is the expression's.
    assert_eq!(
        each("{#each items /* c */ as item}{item}{/each}"),
        [("items".to_owned(), Some("item".to_owned()), None)]
    );
    assert_eq!(
        each("{#each items, i}{i}{/each}"),
        [("items".to_owned(), None, Some("i".to_owned()))]
    );
}
