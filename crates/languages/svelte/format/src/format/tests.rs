use super::*;

fn refusal(source_text: &str) -> (&'static str, Option<&str>) {
    let c = rsvelte_svelte::syntax::parse::parse(source_text).expect("parses");
    let u = format(&c, source_text, &LineIndex::new(source_text)).expect_err("refused");
    (
        u.what,
        u.source_location.span().map(|s| s.text(source_text)),
    )
}

#[test]
fn a_refusal_points_at_the_construct() {
    assert_eq!(
        refusal("<p>a</p>\n<svelte:head><title>x</title></svelte:head>\n"),
        (
            "svelte: elements",
            Some("<svelte:head><title>x</title></svelte:head>")
        )
    );
    assert_eq!(
        refusal("<script>\n\tlet a = { 'b': 1 };\n</script>\n"),
        ("quoted or numeric property key", Some("'b'"))
    );
    assert_eq!(
        refusal("{#each xs as { a }}{a}{/each}\n"),
        ("destructuring in {#each}", Some("{ a }"))
    );
}
