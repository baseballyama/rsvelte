use rsvelte_svelte_syntax::parse::parse;
use rsvelte_svelte_syntax::syntax_tree::{Component, ElementEnd, Range, TemplateNode};

fn element_names<'a>(component: &Component, children: Range, source: &'a str) -> Vec<&'a str> {
    component
        .children(children)
        .iter()
        .map(|&node| {
            let TemplateNode::Element { name, .. } = component.nodes[node as usize] else {
                panic!("an element");
            };
            name.text(source)
        })
        .collect()
}

#[test]
fn optional_closing_rules_keep_siblings_and_nested_elements() {
    for (source, expected) in [
        ("<div><p>前<div>内</div></div>", vec!["p", "div"]),
        ("<ul><li>一<li>二</li></ul>", vec!["li", "li"]),
        ("<dl><dt>名前<dd>値</dd></dl>", vec!["dt", "dd"]),
        ("<div><div>内</div></div>", vec!["div"]),
        (
            "<div><UI.Button/><Ω/><div/></div>",
            vec!["UI.Button", "Ω", "div"],
        ),
    ] {
        let component = parse(source).expect("element boundaries");
        component.tokens.check_lossless(source).expect("all bytes");
        let [root] = component.children(component.root) else {
            panic!("one root element");
        };
        let TemplateNode::Element { children, .. } = component.nodes[*root as usize] else {
            panic!("a root element");
        };
        assert_eq!(element_names(&component, children, source), expected);
    }
}

#[test]
fn closing_names_keep_unicode_whitespace_and_error_positions() {
    for source in [
        "<Ω>日本語</Ω \n>",
        "<UI.Button>text</UI.Button\t>",
        "<!DOCTYPE html><input disabled/><div></div>",
        "<script>let value = 1;</script><style>p { color: red }</style>",
    ] {
        let component = parse(source).expect("closing name");
        component.tokens.check_lossless(source).expect("all bytes");
    }
    let source = "<UI.Button></UI.Other>";
    let error = parse(source).expect_err("mismatched component closing name");
    assert_eq!(
        error.message,
        "`</UI.Other>` attempted to close an element that was not open\n\
         https://svelte.dev/e/element_invalid_closing_tag"
    );
    assert_eq!(
        error.span.start_offset as usize,
        source.find("</").expect("closing tag")
    );
}

#[test]
fn an_element_records_what_ended_it() {
    use ElementEnd::{AncestorEndTag, AutoClosedEndTag, EndTag, NextStartTag, StartTag};
    let source = "<div><p>a \
        <b>x</b><div>y</div></div><ul><li>one<li>two</ul><br><i/><textarea>t</textarea><svelte:hea\
        d><script>s</script></svelte:head><p>a<p>b</p><div><p><span>x</p></div>";
    let component = parse(source).expect("elements");
    let mut ends: Vec<(u32, &str, ElementEnd)> = component
        .nodes
        .iter()
        .filter_map(|node| match *node {
            TemplateNode::Element { name, end, .. } => {
                Some((name.start_offset, name.text(source), end))
            }
            _ => None,
        })
        .collect();
    ends.sort_unstable_by_key(|&(at, ..)| at);
    let ends: Vec<_> = ends.into_iter().map(|(_, name, end)| (name, end)).collect();
    assert_eq!(
        ends,
        [
            ("div", EndTag),
            ("p", NextStartTag),
            ("b", EndTag),
            ("div", EndTag),
            ("ul", EndTag),
            ("li", NextStartTag),
            ("li", AncestorEndTag),
            ("br", StartTag),
            ("i", StartTag),
            ("textarea", EndTag),
            ("svelte:head", EndTag),
            ("script", EndTag),
            ("p", NextStartTag),
            ("p", EndTag),
            ("div", EndTag),
            ("p", EndTag),
            // `</p>` follows the `<p>` that `<p>` closed, so upstream does not warn about
            // `<span>`.
            ("span", AutoClosedEndTag),
        ]
    );
}

/// Each code and offset is the official compiler's.
#[test]
fn parse_time_checks_report_upstreams_code_and_point() {
    for (source, code, offset) in [
        ("<div></div>\n</\n", "unexpected_eof", 14),
        ("<Foo>\n  </\n", "unexpected_eof", 10),
        ("<\n", "unexpected_eof", 1),
        ("<script lang=\"", "unexpected_eof", 14),
        ("{#nope}x{/nope}", "expected_block_type", 2),
        ("<svelte:component />", "svelte_component_missing_this", 0),
        (
            "<svelte:component this=\"Child\" />",
            "svelte_component_invalid_this",
            18,
        ),
        ("{#await p}w{:then }d{/await}", "expected_pattern", 18),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(
            (&*error.code, error.span.start_offset),
            (code, offset),
            "{source}"
        );
    }
    parse("<svelte:component this=\"{foo}\" />").expect("one expression");
}

/// Upstream's parser reads `<svelte:options>` once the template is parsed.
#[test]
fn the_options_are_checked_at_parse_time() {
    for (source, code) in [
        (
            r#"<svelte:options customElement="Element"/>"#,
            "svelte_options_invalid_tagname",
        ),
        (
            r#"<svelte:options customElement="font-face"/>"#,
            "svelte_options_reserved_tagname",
        ),
        (
            r#"<svelte:options customElement={{props:{value:{type:"Date"}}}}/>"#,
            "svelte_options_invalid_customelement_props",
        ),
        (
            r#"<svelte:options customElement={{shadow:"closed"}}/>"#,
            "svelte_options_invalid_customelement_shadow",
        ),
        (
            r#"<svelte:options tag="my-el" />"#,
            "svelte_options_deprecated_tag",
        ),
        (
            r#"<svelte:options runes="true" />"#,
            "svelte_options_invalid_attribute_value",
        ),
        (
            "<svelte:options runes>\n</svelte:options>",
            "svelte_meta_invalid_content",
        ),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(&*error.code, code, "{source}");
    }
    parse(r#"<svelte:options runes customElement={null} css="injected" />"#).expect("valid");
    // Every attribute is read before the compiler refuses legacy mode.
    let error = parse("<svelte:options runes={false} bogus />").expect_err("unknown");
    assert_eq!(
        (&*error.code, error.span.start_offset, error.span.end_offset),
        ("svelte_options_unknown_attribute", 30, 35)
    );
}

/// svelte2tsx blanks the scripts, so only the markup's syntax decides whether it parses.
#[test]
fn a_parse_without_scripts_reads_only_the_markup() {
    use rsvelte_svelte_syntax::parse::parse_without_scripts;
    let source = "<script>let a = ;</script>\n<p>{a}</p>";
    parse(source).expect_err("the script does not parse");
    let component = parse_without_scripts(source).expect("the markup parses");
    let instance = component.instance.as_ref().expect("an instance script");
    assert_eq!(instance.content.text(source), "let a = ;");
    assert!(
        component
            .javascript
            .get_program(instance.program)
            .body
            .is_empty()
    );
    parse_without_scripts("<script>let a = ;</script>\n<p>{a +}</p>").expect_err("the markup");
}

/// Upstream reports an object's invalid `tag` at no position; this parser points at the property.
#[test]
fn an_invalid_tag_in_the_options_object_is_reported_at_its_property() {
    let source = "<svelte:options customElement={{ tag: 1 }} />";
    let error = parse(source).expect_err("an invalid tag");
    assert_eq!(&*error.code, "svelte_options_invalid_tagname");
    assert_eq!(error.span.text(source), "tag: 1");
}
