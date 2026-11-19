use crate::parse::parse;
use crate::syntax_tree::{Component, Range, TemplateNode};

/// The elements of `children`, each written `name(children)`.
fn elements(c: &Component, source: &str, children: Range) -> String {
    let mut out = Vec::new();
    for &child in c.children(children) {
        if let TemplateNode::Element { name, children, .. } = *c.node(child) {
            let inner = elements(c, source, children);
            out.push(format!("{}({inner})", name.text(source)));
        }
    }
    out.join(" ")
}

fn tree(source: &str) -> String {
    let c = parse(source).expect("parses");
    elements(&c, source, c.root)
}

#[test]
fn a_start_tag_closes_only_the_element_it_is_in() {
    // Svelte 5.57.3 checks a start tag against its parent once, and opens it in the grandparent.
    assert_eq!(
        tree("<select><optgroup><option>a<optgroup><option>b</select>"),
        "select(optgroup(option() optgroup(option())))"
    );
    assert_eq!(
        tree("<table><tr><td>a<tr><td>b</table>"),
        "table(tr(td() tr(td())))"
    );
    // Siblings close one another in turn.
    assert_eq!(tree("<ul><li>a<li>b<li>c</ul>"), "ul(li() li() li())");
    assert_eq!(tree("<div><p>a<div>b</div></div>"), "div(p() div())");
}

#[test]
fn only_a_regular_element_is_left_open_as_an_element() {
    // Svelte 5.57.3's code and offset for each; everything but upstream's `RegularElement` is
    // a block left open.
    for (source, code, at) in [
        ("<svelte:options runes>", "block_unclosed", 0),
        ("<svelte:options runes>\n<p>x</p>", "block_unclosed", 0),
        ("<svelte:head>", "block_unclosed", 0),
        ("<Foo>", "block_unclosed", 0),
        ("<slot>", "block_unclosed", 0),
        ("<svelte:head><title>", "block_unclosed", 13),
        ("<div>", "element_unclosed", 0),
        ("<svelte:head><div><title>", "element_unclosed", 18),
        (
            "<template shadowrootmode=\"open\"><slot>",
            "element_unclosed",
            32,
        ),
        ("<div><slot></div>", "element_invalid_closing_tag", 11),
        (
            "<svelte:head><title></svelte:head>",
            "element_invalid_closing_tag",
            20,
        ),
        // Upstream reads the whole end tag and rejects a void name before it pops anything.
        ("<div><slot></br></div>", "void_element_invalid_content", 11),
        ("<div><slot></div x>", "expected_token", 17),
        ("<div><slot></div", "expected_token", 16),
        ("<div><slot></ div>", "expected_token", 14),
        ("<Foo></br>", "void_element_invalid_content", 5),
        ("<Foo></div x>", "expected_token", 11),
        ("<Foo></input>", "void_element_invalid_content", 5),
        (
            "<svelte:head><title></br></svelte:head>",
            "void_element_invalid_content",
            20,
        ),
        ("<svelte:head><title></svelte:head x>", "expected_token", 34),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(
            (&*error.code, error.span.start_offset),
            (code, at),
            "{source}"
        );
    }
    assert_eq!(
        tree("<template shadowrootmode=\"open\"><div><slot></div></template>"),
        "template(div(slot()))"
    );
}
