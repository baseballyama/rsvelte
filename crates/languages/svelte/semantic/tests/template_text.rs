use rsvelte_svelte_semantic::compiler_syntax_tree;

#[test]
fn blank_text_is_what_javascript_trim_empties() {
    for (text, blank) in [
        (" \t\n", true),
        ("\u{feff}", true),
        ("\u{a0}\u{2028}", true),
        ("\u{85}", false),
        (" a ", false),
    ] {
        let source = format!("<div>{text}</div>");
        let component = rsvelte_svelte_syntax::parse::parse(&source).expect("parses");
        let tree = compiler_syntax_tree::lower(&component, &source);
        let (_, div) = tree.elements().next().expect("one element");
        let &child = tree.children(div.children).first().expect("one child");
        assert_eq!(
            tree.node(child).kind.is_blank_text(&source),
            blank,
            "{text:?}"
        );
    }
}
