use rsvelte_svelte_syntax::parse::parse;

// Each verdict was checked against svelte 5's `compile`, which parses with acorn-typescript.
#[test]
fn rules_acorn_does_not_check_parse_in_every_host() {
    for source in [
        // TS2368 in the script, an attribute, a block's head and a `{@const}`.
        "<script lang=\"ts\">const f = <string>() => 1;</script>",
        "<script lang=\"ts\">let a: any;</script><p title={<string>() => a}>x</p>",
        "<script lang=\"ts\">let a: any;</script>{#if (<string>() => a)}y{/if}",
        "<script lang=\"ts\">let a: any;</script>{#if 1}{@const c = <string>() => a}{c}{/if}",
        // TS1263 and TS5085.
        "<script lang=\"ts\">let x!: number = 1;</script>",
        "<script lang=\"ts\">type T = [...a?: string[]];</script>",
        // TS1308, which the compiler raises where acorn reads the `await`; a script is a module.
        "<script lang=\"ts\">enum E { A = await (f()) }</script>",
        "<script lang=\"ts\">function g() { await (f()); }</script>",
        "<script>function g() { await (f()); }</script>",
    ] {
        assert!(parse(source).is_ok(), "{source}");
    }
}

#[test]
fn rules_acorn_checks_stay_errors() {
    for source in [
        // TS1028, TS1049 and TS1257, and an optional rest parameter of a function with a body.
        "<script lang=\"ts\">class C { public public x = 1; }</script>",
        "<script lang=\"ts\">function f(...p?: string[]) {}</script>",
        "<script lang=\"ts\">class C { set x() {} }</script>",
        "<script lang=\"ts\">type T = [a?: string, b: string];</script>",
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(error.code, "js_parse_error", "{source}");
    }
}

#[test]
fn an_unchecked_rule_does_not_hide_a_later_error() {
    let source = "<script lang=\"ts\">let x!: number = 1; class C { set x() {} }</script>";
    let error = parse(source).expect_err("the setter has no parameter");
    assert_eq!(error.code, "js_parse_error");
    let class = source.find("class").expect("class");
    assert!(error.span.start_offset as usize > class);
}

// svelte 5.59.1 reads `?:` in a block's type annotation and an arrow type in a snippet's type
// parameters. Each expected text is the annotation, or the list between the angle brackets, that
// its `parse` gives, and the offset is its `compile`'s.
#[test]
fn template_type_annotations_read_as_svelte_reads_them() {
    use rsvelte_svelte_syntax::syntax_tree::TemplateNode;
    let script = "<script lang=\"ts\">let items: any[] = [];</script>";
    for (template, expected) in [
        (
            "{#each items as item: { id: number; a?: string } (item.id)}{item.a}{/each}",
            ": { id: number; a?: string }",
        ),
        (
            "{#each items as item: { a?: string }, i (i)}{i}{/each}",
            ": { a?: string }",
        ),
        (
            "{#each items as { id }: { id?: number } (id)}{id}{/each}",
            ": { id?: number }",
        ),
        (
            "{#each items as row}{@const first: { a?: string } = row[0]}{first.a}{/each}",
            ": { a?: string }",
        ),
        (
            "{#await items then v: { a?: string }}{v.a}{/await}",
            ": { a?: string }",
        ),
        (
            "{#snippet s<T extends () => void>(x: T)}{typeof x}{/snippet}",
            "T extends () => void",
        ),
        (
            concat!(
                "{#snippet s<T extends (a: number) => string, U = Array<T>>(x: T, y: U)}",
                "{x}{y}{/snippet}",
            ),
            "T extends (a: number) => string, U = Array<T>",
        ),
    ] {
        let source = format!("{script}{template}");
        let component = parse(&source).expect(&source);
        let tree = &component.javascript;
        let read: Vec<(u32, u32)> = (component.nodes.iter())
            .filter_map(|node| match node {
                TemplateNode::Each {
                    context: Some(p), ..
                }
                | TemplateNode::Await { value: Some(p), .. } => {
                    let span = tree.get_pattern(*p).type_annotation.as_ref()?.span;
                    Some((span.start, span.end))
                }
                TemplateNode::Const { declaration, .. } => {
                    let declarator = tree.get_declaration(*declaration).declarations.first()?;
                    let span = declarator.type_annotation.as_ref()?.span;
                    Some((span.start, span.end))
                }
                TemplateNode::Snippet {
                    type_parameters: Some(span),
                    generics: Some(_),
                    ..
                } => Some((span.start_offset + 1, span.end_offset - 1)),
                _ => None,
            })
            .collect();
        let texts: Vec<&str> = read
            .iter()
            .map(|&(start, end)| &source[start as usize..end as usize])
            .collect();
        assert_eq!(texts, [expected], "{source}");
    }
    let source = "<script lang=\"ts\"></script>{#snippet s<T extends a >= b>(x: T)}{x}{/snippet}";
    let error = parse(source).expect_err(source);
    assert_eq!(
        (&*error.code, error.span.start_offset),
        ("expected_token", 52)
    );
}
