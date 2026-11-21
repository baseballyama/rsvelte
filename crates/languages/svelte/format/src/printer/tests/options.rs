//! The script options Prettier hands every JavaScript part, which the plugin passes on whole.

use super::*;

const SOURCE: &str = "<script>\n\tlet a = \"x\"\n\t;[a].forEach(f)\n</script>\n\n\
    <p class=\"a {a ? \"b\" : \"c\"}\" onclick={() => { f(\"y\"); g(); }}>\
    {\"it's\"} {h(\"z\")}</p>\n\
    {#if a}{@const b = \"w\"}{b}{/if}\n\n<style>\n\tp::before { content: \"q\"; }\n</style>\n";

#[test]
fn semi_reaches_the_script_and_the_template_statements() {
    // Expected output from oxfmt 0.75.0 with `"svelte": true`.
    assert_eq!(
        formatted_with(SOURCE, &options(r#"{"semi": false}"#)),
        "<script>\n  let a = \"x\"\n  ;[a].forEach(f)\n</script>\n\n\
         <p\n  class=\"a {a ? 'b' : 'c'}\"\n  onclick={() => {\n    f(\"y\")\n    g()\n  }}\n>\n  \
         {\"it's\"}\n  {h(\"z\")}\n</p>\n{#if a}{@const b = \"w\"}{b}{/if}\n\n\
         <style>\n  p::before {\n    content: \"q\";\n  }\n</style>\n"
    );
}

#[test]
fn single_quote_reaches_every_part_and_keeps_a_string_holding_one() {
    // Expected output from oxfmt 0.75.0 with `"svelte": true`.
    assert_eq!(
        formatted_with(SOURCE, &options(r#"{"singleQuote": true}"#)),
        "<script>\n  let a = 'x';\n  [a].forEach(f);\n</script>\n\n\
         <p\n  class=\"a {a ? 'b' : 'c'}\"\n  onclick={() => {\n    f('y');\n    g();\n  }}\n>\n  \
         {\"it's\"}\n  {h('z')}\n</p>\n{#if a}{@const b = 'w'}{b}{/if}\n\n\
         <style>\n  p::before {\n    content: 'q';\n  }\n</style>\n"
    );
}
