use crate::parse::{parse, parse_as_svelte_eslint_parser};

#[test]
fn a_self_closing_block_at_the_root_is_an_element_to_svelte_eslint_parser() {
    for source in [
        "<style />",
        "<p>x</p>\n<style lang=\"scss\" />",
        "<script foo=\"b\"/>",
        "<script lang=\"ts\" />",
        "<script a='/>' b=c />",
    ] {
        parse(source).expect_err(source);
        let component = parse_as_svelte_eslint_parser(source).expect(source);
        assert!(
            component.instance.is_none() && component.style.is_none(),
            "{source}"
        );
    }
}

#[test]
fn a_block_svelte_eslint_parser_does_not_rewrite_stays_one() {
    // Without whitespace after the name it does not match the tag at all.
    parse_as_svelte_eslint_parser("<style/>").expect_err("throws");
    let component =
        parse_as_svelte_eslint_parser("<script>let a = '<style />';</script>").expect("parses");
    assert!(component.instance.is_some());
    let component = parse_as_svelte_eslint_parser("<style a=\"/>\"></style>").expect("parses");
    assert!(component.style.is_some());
}
