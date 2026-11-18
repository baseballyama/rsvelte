use crate::warnings::tests::{compiled, texts};

#[test]
fn the_selectors_of_a_global_block_are_used() {
    let source = "<div></div>\n<style>\n  div :global:is(html.x *) { color: red; }\n</style>\n";
    assert_eq!(texts("css_unused_selector", source), Vec::<String>::new());
}

#[test]
fn a_cast_attribute_value_selects_as_its_value() {
    let source = "<script lang=\"ts\">\n\t//\n</script>\n\n<div data-active={false as \
        true}>\n\t<span></span>\n</div>\n\n\
                  <style>\n\t[data-active='true'] > span {\n\t\tbackground-color: \
                      red;\n\t}\n</style>\n";
    let codes: Vec<String> = compiled(source)
        .into_iter()
        .map(|(code, ..)| code)
        .collect();
    assert_eq!(codes, ["css_unused_selector"]);
}
