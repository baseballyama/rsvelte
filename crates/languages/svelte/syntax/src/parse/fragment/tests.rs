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
