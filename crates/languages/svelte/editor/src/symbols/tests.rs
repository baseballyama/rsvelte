use super::{Symbol, symbols};

/// Each symbol as the official server lists it: name, the name it is in, and its lines.
fn listed(text: &str) -> Vec<(String, String, u32, u32)> {
    let component = rsvelte_svelte_syntax::parse::parse(text).expect("parses");
    let lines = rsvelte_kernel::source::positions::LineIndex::new(text);
    let mut listed = Vec::new();
    let mut walk = Vec::from_iter(
        symbols(&component, text)
            .into_iter()
            .rev()
            .map(|s| (s, String::new())),
    );
    while let Some((
        Symbol {
            name,
            span,
            children,
        },
        container,
    )) = walk.pop()
    {
        let line = |byte| lines.line(byte) - 1;
        listed.push((
            name.clone(),
            container,
            line(span.start_offset),
            line(span.end_offset),
        ));
        walk.extend(
            children
                .into_iter()
                .rev()
                .map(|child| (child, name.clone())),
        );
    }
    listed
}

fn symbol(name: &str, container: &str, start: u32, end: u32) -> (String, String, u32, u32) {
    (name.to_owned(), container.to_owned(), start, end)
}

// Each expectation is what svelte-language-server 0.18.6 lists.

#[test]
fn an_element_is_named_by_its_tag_id_and_classes() {
    let text = "<script lang=\"ts\" id=\"s\">\n\tlet a = 1;\n</script>\n\
                <div id=\"main\" class=\"a  b\">\n\t<span class={x}>é</span>\n</div>\n\
                <style>\n\tp{}\n</style>\n";
    assert_eq!(
        listed(text),
        [
            symbol("script#s", "", 0, 2),
            symbol("div#main.a.b", "", 3, 5),
            symbol("span.{x}", "div#main.a.b", 4, 4),
            symbol("style", "", 6, 8),
        ]
    );
}

#[test]
fn quotes_go_and_an_empty_value_still_counts() {
    let text = "{#if a}\n\t<ul class=\"x {y ? \"p\" : \"q\"}\">\n\t\t<li {id}>x</li>\n\t</ul>\n{/if}\n\
                <Foo.Bar id=\"\" class=\" c\" />\n";
    assert_eq!(
        listed(text),
        [
            symbol("ul.x.{y.?.p.:.q}", "", 1, 3),
            symbol("li#{id}", "ul.x.{y.?.p.:.q}", 2, 2),
            symbol("Foo.Bar#..c", "", 5, 5),
        ]
    );
}

#[test]
fn directives_name_nothing() {
    let text = "<input id=main class:on={a}>\n<svelte:head><title>x</title></svelte:head>\n\
                <img alt=\"\">\n";
    assert_eq!(
        listed(text),
        [
            symbol("input#main", "", 0, 0),
            symbol("svelte:head", "", 1, 1),
            symbol("title", "svelte:head", 1, 1),
            symbol("img", "", 2, 2),
        ]
    );
}
