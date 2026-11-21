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

#[test]
fn an_end_tag_for_an_element_a_start_tag_closed_says_so_until_its_parent_closes() {
    // Svelte 5.57.3's code and offset for each.
    let autoclosed = "element_invalid_closing_tag_autoclosed";
    let not_open = "element_invalid_closing_tag";
    for (source, code, at) in [
        ("<p>a<div>b</div></p>", autoclosed, 16),
        ("<Foo><p>a<div>b</div></p></Foo>", autoclosed, 21),
        ("{#if x}<p>a<div>b</div></p>{/if}", autoclosed, 23),
        (
            "<div><slot><p>a<div>b</div></p></slot></div>",
            autoclosed,
            27,
        ),
        ("<p>a<div>b</div><span></span></p>", autoclosed, 29),
        ("<p>a<p>b<div></div></p>", autoclosed, 19),
        ("{#if x}<p>a<div>b</div>{/if}</p>", autoclosed, 28),
        (
            "<div>{#if x}y{:else if z}<p>a<div></div></p>{/if}</div>",
            autoclosed,
            40,
        ),
        ("<p>a<div>b<p>c<span>d</span></p></div></p>", autoclosed, 38),
        ("<li>a<li>b</li></li>", autoclosed, 15),
        // An end tag that closes the auto-closed element's parent forgets it.
        ("<div><p>a<div>b</div></div></p>", not_open, 27),
        ("<div><p>a<div>b</div></div><span></span></p>", not_open, 40),
        ("<ul><li>a<li>b</ul></li>", not_open, 19),
        ("<Foo><p>a<div></div></Foo></p>", not_open, 26),
        (
            "<div>{#if x}<p>a<div></div>{:else if y}z{/if}</div></p>",
            not_open,
            51,
        ),
        ("<p>a<div>b</div></P>", not_open, 16),
        ("<p>a<div>b</div></br>", "void_element_invalid_content", 16),
        ("<p>a<div>b</div></p x>", "expected_token", 20),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(
            (&*error.code, error.span.start_offset),
            (code, at),
            "{source}"
        );
    }
    let error = parse("<p>a<p>b<div></div></p>").expect_err("autoclosed");
    assert!(
        error.message.starts_with(
            "`</p>` attempted to close element that was already automatically closed by `<div>` \
             (cannot nest `<div>` inside `<p>`)"
        ),
        "{}",
        error.message
    );
}

#[test]
fn a_comment_ends_at_the_first_closer_after_its_opener() {
    // The comments and errors of svelte 5.57.3: the `-->` and the `*/` are read after the `<!--`
    // and the `/*`, so `<!-->` and `/*/` open a comment.
    for (source, data) in [
        ("<!---->", ""),
        ("<!--> -->", "> "),
        ("<!-->a-->", ">a"),
        ("<!--->a-->", "->a"),
        ("<!--a--!>b-->", "a--!>b"),
    ] {
        let c = parse(source).expect(source);
        let comments: Vec<&str> = (c.children(c.root).iter())
            .filter_map(|&child| match *c.node(child) {
                TemplateNode::Comment { data, .. } => Some(data.text(source)),
                _ => None,
            })
            .collect();
        assert_eq!(comments, [data], "{source}");
    }
    for (source, code, at) in [
        ("<!-->", "expected_token", 5),
        ("<!-->a", "expected_token", 6),
        ("<!--->", "expected_token", 6),
        ("<!--><div></div>", "expected_token", 16),
        ("<div><!--></div>", "expected_token", 16),
        ("<!--", "unexpected_eof", 4),
        ("<!--a", "expected_token", 5),
        ("<div /*/ a=\"1\"></div>", "unexpected_eof", 21),
    ] {
        let error = parse(source).expect_err(source);
        assert_eq!(
            (&*error.code, error.span.start_offset),
            (code, at),
            "{source}"
        );
    }
    parse("<div /*/ */ a=\"1\"></div>").expect("the `*/` after the `/*` closes the comment");
}
