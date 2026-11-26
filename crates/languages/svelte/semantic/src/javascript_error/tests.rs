use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;

/// The code, the first line of the message and the offset of the error compile reports first.
fn first_error(source: &str) -> (String, String, u32) {
    with_context(source, |context| {
        super::fully_parsed(context).expect_err(source)
    })
}

/// The code, the first line of the message and the offset of the first JavaScript error the
/// parser raises in a component it reads to the end.
fn first_javascript_error(source: &str) -> (String, String, u32) {
    with_context(source, |context| {
        super::of_document(context, |_| true).expect(source)
    })
}

fn with_context(
    source: &str,
    error: impl FnOnce(&DocumentContext<'_>) -> rsvelte_kernel::diagnostics::Diagnostic,
) -> (String, String, u32) {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = Document::new("App.svelte".to_owned(), source.to_owned()).expect("small");
    let error = error(&DocumentContext::new(&document, registry.artifacts()));
    let message = error.message.lines().next().unwrap_or_default().to_owned();
    (error.code.to_string(), message, error.span.start_offset)
}

#[test]
fn acorn_throws_in_a_part_before_the_parser_raises_its_own_error() {
    let deleting = "Deleting local variable in strict mode";
    let declared = "Identifier 'a' has already been declared";
    // From svelte 5.57.3's `compile`: the parser stops later in the template, or reads the
    // options or meets the style sheet after the part.
    for (source, message, at) in [
        ("<div>{delete x}", deleting, 6),
        ("{#if a}{delete x}", deleting, 8),
        ("<div>{delete x}</div><p>", deleting, 6),
        ("<div>{let;}", "The keyword 'let' is reserved", 6),
        ("{let;}", "The keyword 'let' is reserved", 1),
        ("{@const a = delete x}<div>", deleting, 12),
        ("{(a, a) => 1}<div>", "Argument name clash", 5),
        (
            "{#snippet s(a, a)}{/snippet}<div>",
            "Argument name clash",
            15,
        ),
        ("{() => { let a; let a; }}<div>", declared, 20),
        ("{@const f = () => { let a; let a; }}<div>", declared, 31),
        ("<script>delete x</script><div>", deleting, 8),
        ("<script>let a; let a;</script><div>", declared, 19),
        ("<svelte:options foo />{delete x}", deleting, 23),
        ("{delete x}<svelte:options foo />", deleting, 1),
        ("<svelte:options customElement={delete x} />", deleting, 31),
        ("{delete x}<style>a{</style>", deleting, 1),
        ("<script>delete x</script><style>a{</style>", deleting, 8),
        (
            "<script>delete x</script><style>a{</style><div>",
            deleting,
            8,
        ),
    ] {
        assert_eq!(
            first_error(source),
            ("js_parse_error".to_owned(), message.to_owned(), at),
            "{source}"
        );
    }
}

#[test]
fn the_parsers_error_stands_where_acorn_throws_in_no_part_before_it() {
    for (source, code, at) in [
        ("<div></span>{delete x}", "element_invalid_closing_tag", 5),
        ("<style>a{</style>{delete x}", "css_expected_identifier", 9),
        (
            "<style>a{</style>{delete x}<div>",
            "css_expected_identifier",
            9,
        ),
        // Upstream raises a sheet's error as it reads the `<style>` element, so a script after
        // it never runs, wherever the CSS parser stopped.
        (
            "<style>a{</style><script>delete x</script>",
            "unexpected_eof",
            42,
        ),
        (
            "<style>a{</style><p>x</p><script>delete x</script>",
            "unexpected_eof",
            50,
        ),
        (
            "<style>a{color:red</style><script>delete x</script>",
            "unexpected_eof",
            51,
        ),
        (
            "<style>/* x</style><script>delete x</script>",
            "expected_token",
            44,
        ),
        (
            "<style>a{</style><p>x</p><script>delete x</script><div>",
            "unexpected_eof",
            55,
        ),
        // Names the template declares twice are upstream's `declaration_duplicate`, later.
        ("{#each a as [b, b]}{/each}<div>", "element_unclosed", 26),
        ("{@const [a, a] = x}<div>", "element_unclosed", 19),
        (
            "<script module>let a</script><script>let a</script><div>",
            "element_unclosed",
            51,
        ),
    ] {
        let (found, _, offset) = first_error(source);
        assert_eq!((found.as_str(), offset), (code, at), "{source}");
    }
}

#[test]
fn the_first_error_in_the_document_wins_over_every_later_one() {
    let deleting = "Deleting local variable in strict mode";
    // From svelte 5.57.3's `compile`: acorn reads the parts in the order of the document, and a
    // name the template declares twice is raised only after the parser.
    for (source, message, at) in [
        ("{@const [a, a] = x}{delete y}", deleting, 20),
        ("{#if 1}{@const [a, a] = x}{delete y}{/if}", deleting, 27),
        ("{delete y}{@const [a, a] = x}", deleting, 1),
        (
            "{@const [a, a] = x}{(() => { with (o) {} })()}",
            "'with' in strict mode",
            29,
        ),
        (
            "{@const [a, a] = x}{'\\07'}",
            "Octal literal in strict mode",
            21,
        ),
        ("{delete y}<script>delete x</script>", deleting, 1),
        ("<script>delete x</script>{delete y}", deleting, 8),
        ("{delete y}<script>let a; let a;</script>", deleting, 1),
        ("{delete y}<script module>delete x</script>", deleting, 1),
        ("{delete y}<script>'\\07'</script>", deleting, 1),
        (
            "<div title={delete y}></div><script>delete x</script>",
            deleting,
            12,
        ),
        (
            "{(() => { with (o) {} })()}<script>delete x</script>",
            "'with' in strict mode",
            10,
        ),
        (
            "<script>delete x</script><script module>delete y</script>",
            deleting,
            8,
        ),
        (
            "<script module>delete y</script><script>delete x</script>",
            deleting,
            15,
        ),
    ] {
        assert_eq!(
            first_javascript_error(source),
            ("js_parse_error".to_owned(), message.to_owned(), at),
            "{source}"
        );
    }
}

#[test]
fn acorn_checks_a_functions_parameters_only_when_it_reaches_the_body() {
    let deleting = "Deleting local variable in strict mode";
    let clash = "Argument name clash";
    // From svelte 5.57.3's `compile`: a parameter's name at the start of a block body or after an
    // expression body, and a function expression's own at the start of its body.
    for (source, message, at) in [
        ("{(a, a) => delete a}", deleting, 11),
        ("{(a, a) => { delete a }}", clash, 5),
        ("{(a, a) => (b) => delete b}", deleting, 18),
        ("{(a, a = delete b) => {}}", deleting, 9),
        ("{(eval) => delete a}", deleting, 11),
        ("{(eval) => { delete a }}", "Binding eval in strict mode", 2),
        ("{(a, a) => 0}{delete b}", clash, 5),
        (
            "<script>const f = (a, a) => delete a;</script>",
            deleting,
            28,
        ),
        (
            "<script>const f = (a, a) => function () { with (a) {} };</script>",
            "'with' in strict mode",
            42,
        ),
        ("<script>function f(a, a) { delete a }</script>", clash, 22),
        (
            "<script>function f(a, a = delete b) {}</script>",
            deleting,
            26,
        ),
        (
            "<script>const f = (a, a) => (b) => { delete c };</script>",
            deleting,
            37,
        ),
        (
            "<script>const f = (b) => (a, a) => delete c;</script>",
            deleting,
            35,
        ),
        (
            "<script>const f = (a = (eval) => 0, b = delete c) => 0;</script>",
            "Binding eval in strict mode",
            24,
        ),
        (
            "<script lang=\"ts\">const f = (a: number, a: number) => delete a;</script>",
            deleting,
            54,
        ),
        (
            "<script>const f = function eval(b = delete z) {};</script>",
            deleting,
            36,
        ),
        (
            "<script>const f = function eval() { delete z };</script>",
            "Binding eval in strict mode",
            27,
        ),
        (
            "<script>function eval(b = delete z) {}</script>",
            "Binding eval in strict mode",
            17,
        ),
    ] {
        assert_eq!(
            first_javascript_error(source),
            ("js_parse_error".to_owned(), message.to_owned(), at),
            "{source}"
        );
    }
}

/// svelte 5.59.1's `compile` with `runes: true` on a word acorn rejects as it reads it, or `None`
/// where it accepts the component.
const UNRESERVED_WORDS: &[(&str, Option<(&str, u32)>)] = &[
    (
        "<script>(() => yield) = 1;</script>",
        Some(("The keyword 'yield' is reserved", 15)),
    ),
    (
        "<script>(() => { yield }) = 1;</script>",
        Some(("The keyword 'yield' is reserved", 17)),
    ),
    (
        "<script>(function () { yield }) = 1;</script>",
        Some(("The keyword 'yield' is reserved", 23)),
    ),
    (
        "<script>[(() => yield)] = o;</script>",
        Some(("The keyword 'yield' is reserved", 16)),
    ),
    (
        "<script>(() => yield)++;</script>",
        Some(("The keyword 'yield' is reserved", 15)),
    ),
    (
        "<script>(class { x = arguments }) = 1;</script>",
        Some(("Cannot use 'arguments' in class field initializer", 21)),
    ),
    (
        "<script>(class { x = () => arguments }) = 1;</script>",
        Some(("Cannot use 'arguments' in class field initializer", 27)),
    ),
    (
        "<script>[(class { x = arguments })] = o;</script>",
        Some(("Cannot use 'arguments' in class field initializer", 22)),
    ),
    (
        "<script>(class { x = arguments })++;</script>",
        Some(("Cannot use 'arguments' in class field initializer", 21)),
    ),
    (
        "<script>class A { static { (() => arguments) = 1; } }</script>",
        Some(("Assigning to rvalue", 28)),
    ),
    (
        "<script>class A { static { arguments; } }</script>",
        Some((
            "Cannot use arguments in class static initialization block",
            27,
        )),
    ),
    (
        "<script>class A { static { (arguments) = 1; } }</script>",
        Some((
            "Cannot use arguments in class static initialization block",
            28,
        )),
    ),
    (
        "<script>class A { static { [(() => arguments)] = o; } }</script>",
        Some(("Assigning to rvalue", 28)),
    ),
    (
        "<script>function* g() { (() => yield) = 1; }</script>",
        Some(("The keyword 'yield' is reserved", 31)),
    ),
    (
        "<script>function f() { (class { x = arguments }) = 1; }</script>",
        Some(("Cannot use 'arguments' in class field initializer", 36)),
    ),
    (
        "<script>class A { x = arguments }</script>",
        Some(("Cannot use 'arguments' in class field initializer", 22)),
    ),
    (
        "<script>class A { x = () => arguments }</script>",
        Some(("Cannot use 'arguments' in class field initializer", 28)),
    ),
    (
        "<script>class A { x = function () { arguments } }</script>",
        None,
    ),
    (
        "<script>class A { static { function f() { arguments } } }</script>",
        None,
    ),
    (
        "<script>class A { static { class B { x = arguments } } }</script>",
        Some(("Cannot use 'arguments' in class field initializer", 41)),
    ),
    (
        "<script>class A { x = class { static { arguments } } }</script>",
        Some((
            "Cannot use arguments in class static initialization block",
            39,
        )),
    ),
    (
        "<script>let a = yield;</script>",
        Some(("The keyword 'yield' is reserved", 16)),
    ),
    (
        "<script>function* g() { () => yield; }</script>",
        Some(("The keyword 'yield' is reserved", 30)),
    ),
    (
        "<script>(class { x = arguments; y = yield }) = 1;</script>",
        Some(("Cannot use 'arguments' in class field initializer", 21)),
    ),
    (
        "<script>({ a: () => yield } = o);</script>",
        Some(("The keyword 'yield' is reserved", 20)),
    ),
    (
        "<script>for ((() => yield) of o);</script>",
        Some(("The keyword 'yield' is reserved", 20)),
    ),
    (
        "<script>(() => yield, 1) = 2;</script>",
        Some(("The keyword 'yield' is reserved", 15)),
    ),
    (
        "<script>class A { static { [arguments] = o; } }</script>",
        Some((
            "Cannot use arguments in class static initialization block",
            28,
        )),
    ),
];

#[test]
fn a_word_acorn_rejects_as_it_reads_it_is_the_first_error() {
    let failures: Vec<_> = UNRESERVED_WORDS
        .iter()
        .filter_map(|&(source, expected)| {
            let first = first_error_if_any(source);
            let expected = expected.map(|(message, at)| (message.to_owned(), at));
            (first != expected).then(|| format!("{source}: {first:?}"))
        })
        .collect();
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}

/// Every rejection acorn raises as svelte 5.59.1's `parse` reads a component, with the message
/// and offset `parse` reports: in each kind of script and in the template.
const PARSE_REJECTIONS: &[(&str, Option<(&str, u32)>)] = &[
    (
        "<script lang=\"ts\">\ndeclare const a = f();\n</script>\n",
        Some((
            "A 'const' initializer in an ambient context must be a string or numeric literal or literal enum reference.",
            37,
        )),
    ),
    (
        "<script lang=\"ts\">\ndeclare let a: number = 1;\n</script>\n",
        Some(("Initializers are not allowed in ambient contexts.", 43)),
    ),
    (
        "<script>\nclass A { x = arguments }\n</script>\n",
        Some(("Cannot use 'arguments' in class field initializer", 23)),
    ),
    (
        "<script module>\nclass A { x = arguments }\n</script>\n",
        Some(("Cannot use 'arguments' in class field initializer", 30)),
    ),
    (
        "<script lang=\"ts\">\nclass A { x = arguments }\n</script>\n",
        Some(("Cannot use 'arguments' in class field initializer", 33)),
    ),
    (
        "{(class { x = arguments })}\n",
        Some(("Cannot use 'arguments' in class field initializer", 14)),
    ),
    (
        "<script>\nclass A { static { arguments; } }\n</script>\n",
        Some((
            "Cannot use arguments in class static initialization block",
            28,
        )),
    ),
    (
        "<script module>\nclass A { static { arguments; } }\n</script>\n",
        Some((
            "Cannot use arguments in class static initialization block",
            35,
        )),
    ),
    (
        "<script lang=\"ts\">\nclass A { static { arguments; } }\n</script>\n",
        Some((
            "Cannot use arguments in class static initialization block",
            38,
        )),
    ),
    (
        "<script lang=\"ts\">\nclass A { @d x = 1 }\n</script>\n",
        None,
    ),
    (
        "<script>\n(class { static { await 0 } });\n</script>\n",
        Some(("Cannot use await in class static initialization block", 27)),
    ),
    (
        "<script module>\n(class { static { await 0 } });\n</script>\n",
        Some(("Cannot use await in class static initialization block", 34)),
    ),
    (
        "<script lang=\"ts\">\n(class { static { await 0 } });\n</script>\n",
        Some(("Cannot use await in class static initialization block", 37)),
    ),
    (
        "{(class { static { await 0 } })}\n",
        Some(("Cannot use await in class static initialization block", 19)),
    ),
    (
        "<script>\nfunction f(a, a) {}\n</script>\n",
        Some(("Argument name clash", 23)),
    ),
    (
        "<script module>\nfunction f(a, a) {}\n</script>\n",
        Some(("Argument name clash", 30)),
    ),
    (
        "<script lang=\"ts\">\nfunction f(a, a) {}\n</script>\n",
        Some(("Argument name clash", 33)),
    ),
    (
        "<script lang=\"ts\">\nexport declare global { }\n</script>\n",
        Some((
            "'export declare' must be followed by an ambient declaration.",
            34,
        )),
    ),
    (
        "<script>\nclass A { # }\n</script>\n",
        Some(("Unexpected character ' '", 20)),
    ),
    (
        "<script module>\nclass A { # }\n</script>\n",
        Some(("Unexpected character ' '", 27)),
    ),
    (
        "<script lang=\"ts\">\nclass A { # }\n</script>\n",
        Some(("Unexpected character ' '", 30)),
    ),
    (
        "<script>\nlet a = '\\08';\n</script>\n",
        Some(("Octal literal in strict mode", 18)),
    ),
    (
        "<script module>\nlet a = '\\08';\n</script>\n",
        Some(("Octal literal in strict mode", 25)),
    ),
    (
        "<script lang=\"ts\">\nlet a = '\\08';\n</script>\n",
        Some(("Octal literal in strict mode", 28)),
    ),
    (
        "<script>\nlet a = 010;\n</script>\n",
        Some(("Invalid number", 17)),
    ),
    (
        "<script module>\nlet a = 010;\n</script>\n",
        Some(("Invalid number", 24)),
    ),
    (
        "<script lang=\"ts\">\nlet a = 010;\n</script>\n",
        Some(("Invalid number", 27)),
    ),
    (
        "<script>\nlet a =\u{85}1;\n</script>\n",
        Some(("Unexpected character '\u{85}'", 16)),
    ),
    (
        "<script module>\nlet a =\u{85}1;\n</script>\n",
        Some(("Unexpected character '\u{85}'", 23)),
    ),
    (
        "<script lang=\"ts\">\nlet a =\u{85}1;\n</script>\n",
        Some(("Unexpected character '\u{85}'", 26)),
    ),
    (
        "<script lang=\"ts\">\nclass A { override x = 1 }\n</script>\n",
        Some((
            "This member cannot have an 'override' modifier because its containing class does not extend another class.",
            29,
        )),
    ),
    (
        "<script>\nlet a; let a;\n</script>\n",
        Some(("Identifier 'a' has already been declared", 20)),
    ),
    (
        "<script module>\nlet a; let a;\n</script>\n",
        Some(("Identifier 'a' has already been declared", 27)),
    ),
    (
        "<script lang=\"ts\">\nlet a; let a;\n</script>\n",
        Some(("Identifier 'a' has already been declared", 30)),
    ),
    (
        "<script lang=\"ts\">\ndeclare let interface: number;\n</script>\n",
        Some(("The keyword 'interface' is reserved", 31)),
    ),
    (
        "<script>\nlet eval = 1;\n</script>\n",
        Some(("Binding eval in strict mode", 13)),
    ),
    (
        "<script module>\nlet eval = 1;\n</script>\n",
        Some(("Binding eval in strict mode", 20)),
    ),
    (
        "<script lang=\"ts\">\nlet eval = 1;\n</script>\n",
        Some(("Binding eval in strict mode", 23)),
    ),
    (
        "<script>\nfunction f(arguments) {}\n</script>\n",
        Some(("Binding arguments in strict mode", 20)),
    ),
    (
        "<script module>\nfunction f(arguments) {}\n</script>\n",
        Some(("Binding arguments in strict mode", 27)),
    ),
    (
        "<script lang=\"ts\">\nfunction f(arguments) {}\n</script>\n",
        Some(("Binding arguments in strict mode", 30)),
    ),
    (
        "<script>\nlet a = yield;\n</script>\n",
        Some(("The keyword 'yield' is reserved", 17)),
    ),
    (
        "<script module>\nlet a = yield;\n</script>\n",
        Some(("The keyword 'yield' is reserved", 24)),
    ),
    (
        "<script lang=\"ts\">\nlet a = yield;\n</script>\n",
        Some(("The keyword 'yield' is reserved", 27)),
    ),
    ("{yield}\n", Some(("The keyword 'yield' is reserved", 1))),
    (
        "<script>\nlet a =\u{200b}1;\n</script>\n",
        Some(("Unexpected character '\u{200b}'", 16)),
    ),
    (
        "<script module>\nlet a =\u{200b}1;\n</script>\n",
        Some(("Unexpected character '\u{200b}'", 23)),
    ),
    (
        "<script lang=\"ts\">\nlet a =\u{200b}1;\n</script>\n",
        Some(("Unexpected character '\u{200b}'", 26)),
    ),
];

#[test]
fn every_rejection_svelte_parse_raises_is_the_first_error() {
    let failures: Vec<_> = PARSE_REJECTIONS
        .iter()
        .filter_map(|&(source, expected)| {
            let first = first_error_if_any(source);
            let expected = expected.map(|(message, at)| (message.to_owned(), at));
            (first != expected).then(|| format!("{source:?}: {first:?}"))
        })
        .collect();
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}

/// The first line of the message and the offset of the error compile reports first, if any.
fn first_error_if_any(source: &str) -> Option<(String, u32)> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = Document::new("App.svelte".to_owned(), source.to_owned()).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    let parsed = super::fully_parsed(&context).err();
    let error = parsed.or_else(|| super::of_document(&context, |_| true))?;
    let message = error.message.lines().next().unwrap_or_default().to_owned();
    Some((message, error.span.start_offset))
}
