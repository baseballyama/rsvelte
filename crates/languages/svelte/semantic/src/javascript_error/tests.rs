use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::source::document::Document;

/// The code, the first line of the message and the offset of the error compile reports first.
fn first_error(source: &str) -> (String, String, u32) {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document = Document::new("App.svelte".to_owned(), source.to_owned()).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    let error = super::fully_parsed(&context).expect_err(source);
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
