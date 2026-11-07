use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::{CompileOptions, GenerateMode, ParseOptions, compile, parse};

#[test]
fn an_unclosed_snippet_parameter_list_requires_the_closing_paren() {
    let error = compile(
        "{#snippet children(hi{/snippet}\n",
        CompileOptions {
            filename: Some("X.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("the snippet parameter list is not closed");

    let text = format!("{error:?}");
    assert!(text.contains("expected_token"), "{text}");
    assert!(text.contains("Expected token )"), "{text}");
    assert!(text.contains("span: (31, 31)"), "{text}");
}

fn compile_client(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .map(|out| out.js.code)
    .map_err(|error| format!("{error:?}"))
}

const TYPED_ROW: &str = "<script lang=\"ts\">\n  const x = 1;\n</script>\n\n{#snippet row({\n  name,\n}: {\n__COMMENT__  name: string;\n})}\n  <p>{name}{x}</p>\n{/snippet}\n\n{@render row({ name: 'a' })}\n";

// The upstream parser counts parentheses without reading strings or comments,
// so an apostrophe in a comment of the parameter types is just text: the
// component compiles exactly as it does with the apostrophe spelled out.
#[test]
fn an_apostrophe_in_a_parameter_comment_is_not_a_string() {
    let with_apostrophe =
        compile_client(&TYPED_ROW.replace("__COMMENT__", "  // it's a comment\n")).unwrap();
    let without =
        compile_client(&TYPED_ROW.replace("__COMMENT__", "  // it s a comment\n")).unwrap();
    assert_eq!(with_apostrophe.replace("it's", "it s"), without);
}

const TS: &str = "<script lang=\"ts\"></script>\n";

/// `(code, first message line, start)` of the error, or `None` when it compiles.
fn header_error(src: &str) -> Option<(String, String, u32)> {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .err()
    .map(|error| {
        let d = error.diagnostic();
        (
            d.code.unwrap_or_default(),
            d.message.lines().next().unwrap_or_default().to_string(),
            d.span.map_or(u32::MAX, |(start, _)| start),
        )
    })
}

fn assert_cells(cells: &[(&str, &str, Option<(&str, &str, u32)>)]) {
    let mut failures = Vec::new();
    for &(prefix, body, expected) in cells {
        let src = format!("{prefix}{body}");
        let actual = header_error(&src);
        let expected =
            expected.map(|(code, message, start)| (code.to_string(), message.to_string(), start));
        if actual != expected {
            failures.push(format!(
                "{src:?}\n  expected {expected:?}\n  actual   {actual:?}"
            ));
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}

// Expected values are `svelte.compile` from `submodules/svelte` (5.57.3) on the
// same sources. Upstream's paren count stops at the first `)` at depth one
// wherever it is, then parses `${header} => {}`; when the count stopped inside
// a literal or comment that parse fails, in both language modes.
#[test]
fn a_paren_count_that_stops_inside_a_literal_or_comment_is_a_js_parse_error() {
    const BT: &str = "`";
    let tpl = format!("{{#snippet row(a = {BT}){BT})}}<p>{{a}}</p>{{/snippet}}");
    assert_cells(&[
        (
            "",
            "{#snippet row(a = \")\")}<p>{a}</p>{/snippet}",
            Some(("js_parse_error", "Unterminated string constant", 18)),
        ),
        (
            TS,
            "{#snippet row(a = \")\")}<p>{a}</p>{/snippet}",
            Some(("js_parse_error", "Unterminated string constant", 46)),
        ),
        (
            TS,
            "{#snippet row(a = ')')}<p>{a}</p>{/snippet}",
            Some(("js_parse_error", "Unterminated string constant", 46)),
        ),
        (
            "",
            &tpl,
            Some(("js_parse_error", "Unterminated template", 19)),
        ),
        (
            TS,
            &tpl,
            Some(("js_parse_error", "Unterminated template", 47)),
        ),
        (
            "",
            "{#snippet row(a = /\\)/)}<p>{a}</p>{/snippet}",
            Some(("js_parse_error", "Unterminated regular expression", 19)),
        ),
        (
            TS,
            "{#snippet row(a = /\\)/)}<p>{a}</p>{/snippet}",
            Some(("js_parse_error", "Unterminated regular expression", 47)),
        ),
        (
            "",
            "{#snippet row(a /* ) */)}<p>{a}</p>{/snippet}",
            Some(("js_parse_error", "Unterminated comment", 16)),
        ),
        (
            TS,
            "{#snippet row(a /* ) */)}<p>{a}</p>{/snippet}",
            Some(("js_parse_error", "Unterminated comment", 44)),
        ),
        // The `//` comment swallows the ` => {}` upstream appends.
        (
            "",
            "{#snippet row(a // )\n)}<p>{a}</p>{/snippet}",
            Some(("js_parse_error", "Unexpected token", 26)),
        ),
        (
            TS,
            "{#snippet row(a // )\n)}<p>{a}</p>{/snippet}",
            Some(("js_parse_error", "Unexpected token", 54)),
        ),
        (
            TS,
            "{#snippet row(a: ')' | 'b')}<p>{a}</p>{/snippet}",
            Some(("js_parse_error", "Unterminated string constant", 45)),
        ),
        (
            TS,
            "{#snippet row(cb: (x: ')') => void)}<p>{cb}</p>{/snippet}",
            Some(("js_parse_error", "Unexpected token", 60)),
        ),
        // A `(` in a string leaves the count open to the end of the input.
        (
            "",
            "{#snippet row(a = \"(\")}<p>{a}</p>{/snippet}",
            Some(("expected_token", "Expected token )", 43)),
        ),
    ]);
}

// The controls: the same constructs where the count still ends at the real `)`.
#[test]
fn balanced_literals_and_comments_in_a_header_compile() {
    for prefix in ["", TS] {
        assert_cells(&[
            (
                prefix,
                "{#snippet row(a = \"()\")}<p>{a}</p>{/snippet}",
                None,
            ),
            (
                prefix,
                "{#snippet row(a /* it's */)}<p>{a}</p>{/snippet}",
                None,
            ),
            (
                prefix,
                "{#snippet row(a // note\n)}<p>{a}</p>{/snippet}",
                None,
            ),
            (
                prefix,
                "{#snippet row(a = (1 + 2) * (3))}<p>{a}</p>{/snippet}",
                None,
            ),
            (
                prefix,
                "{#snippet row({ a = 1, b: [c = (2)] } = {})}<p>{a}{c}</p>{/snippet}",
                None,
            ),
        ]);
    }
    assert_cells(&[(
        TS,
        "{#snippet row(a: () => void, b: (x: number) => string)}<p>{a}</p>{/snippet}",
        None,
    )]);
}

// Not a TypeScript annotation in plain JS: acorn reads `c ? …` as a
// conditional and fails at the `:`.
#[test]
fn an_optional_parameter_marker_without_lang_ts_fails_after_the_question_mark() {
    assert_cells(&[
        (
            "",
            "{#snippet row(c?: number = 5)}<p>{c}</p>{/snippet}",
            Some(("js_parse_error", "Unexpected token", 16)),
        ),
        (
            "",
            "{#snippet row(a b = \")\")}<p>{a}</p>{/snippet}",
            Some(("js_parse_error", "Unexpected token", 16)),
        ),
    ]);
}

// Upstream reads type parameters with `match_bracket(…, pointy_bois)`: after
// optional whitespace, skipping quoted text (backticks included), and failing
// on a quote that never closes.
#[test]
fn type_parameters_are_matched_as_upstream() {
    const BT: &str = "`";
    let backtick_gt =
        format!("{{#snippet foo<T extends {BT}>{BT}>(x: T)}}<p>{{x}}</p>{{/snippet}}");
    let backtick_open =
        format!("{{#snippet foo<T extends {BT}abc>(x: T)}}<p>{{x}}</p>{{/snippet}}");
    assert_cells(&[
        (TS, "{#snippet foo <T> (x: T)}<p>{x}</p>{/snippet}", None),
        (TS, &backtick_gt, None),
        (
            TS,
            "{#snippet foo<T extends '>'>(x: T)}<p>{x}</p>{/snippet}",
            None,
        ),
        (
            TS,
            "{#snippet foo<T extends \"abc>(x: T)}<p>{x}</p>{/snippet}",
            Some((
                "unterminated_string_constant",
                "Unterminated string constant",
                53,
            )),
        ),
        (
            TS,
            &backtick_open,
            Some((
                "unterminated_string_constant",
                "Unterminated string constant",
                53,
            )),
        ),
        (
            TS,
            "{#snippet foo<T",
            Some(("unexpected_eof", "Unexpected end of input", 43)),
        ),
        (
            TS,
            "{#snippet foo<T  \n\n",
            Some(("unexpected_eof", "Unexpected end of input", 43)),
        ),
    ]);
}

// Upstream's `typeParams` is the raw text between the brackets, untrimmed.
#[test]
fn type_params_keep_their_inner_whitespace() {
    let source = format!("{TS}{{#snippet foo< T >(x: T)}}<p>{{x}}</p>{{/snippet}}");
    let ast = parse(
        &source,
        &oxc_allocator::Allocator::default(),
        ParseOptions {
            modern: true,
            ..Default::default()
        },
    )
    .expect("parses");
    let json = with_serialize_arena(&ast.arena, || serde_json::to_value(&ast).unwrap());
    let snippet = json["fragment"]["nodes"]
        .as_array()
        .and_then(|nodes| nodes.iter().find(|n| n["type"] == "SnippetBlock"))
        .expect("snippet");
    assert_eq!(snippet["typeParams"], " T ");
}
