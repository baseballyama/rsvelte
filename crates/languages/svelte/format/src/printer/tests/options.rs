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

const OBJECTS: &str = "<script>\n\tconst p = {\n\t\ta: 1, \"b-c\": 2 };\n</script>\n\n<p>\n\t\
    {firstValueWithLongName + secondValueWithLongName * thirdValueWithLongName - \
    fourthValueWithLongName}\n\t\
    {f({\n\t\ta: 1, b: 2 })}\n</p>\n{@const o = { a: 1, \"b-c\": 2 }}\n";

#[test]
fn quote_props_reaches_the_script_and_leaves_what_the_plugin_leaves() {
    // Expected output from oxfmt 0.75.0 with `"svelte": true`.
    assert_eq!(
        formatted_with(OBJECTS, &options(r#"{"quoteProps": "consistent"}"#)),
        "<script>\n  const p = {\n    \"a\": 1,\n    \"b-c\": 2,\n  };\n</script>\n\n<p>\n  \
         {firstValueWithLongName +\n    secondValueWithLongName * thirdValueWithLongName -\n    \
         fourthValueWithLongName}\n  {f({\n    a: 1,\n    b: 2,\n  })}\n</p>\n\
         {@const o = { \"a\": 1, \"b-c\": 2 }}\n"
    );
}

#[test]
fn object_wrap_collapses_the_objects_of_every_part() {
    // Expected output from oxfmt 0.75.0 with `"svelte": true`.
    assert_eq!(
        formatted_with(OBJECTS, &options(r#"{"objectWrap": "collapse"}"#)),
        "<script>\n  const p = { a: 1, \"b-c\": 2 };\n</script>\n\n<p>\n  \
         {firstValueWithLongName +\n    secondValueWithLongName * thirdValueWithLongName -\n    \
         fourthValueWithLongName}\n  {f({ a: 1, b: 2 })}\n</p>\n{@const o = { a: 1, \"b-c\": 2 }}\n"
    );
}

#[test]
fn operator_position_reaches_the_template_expressions() {
    // Expected output from oxfmt 0.75.0 with `"svelte": true`.
    assert_eq!(
        formatted_with(
            OBJECTS,
            &options(r#"{"experimentalOperatorPosition": "start"}"#)
        ),
        "<script>\n  const p = {\n    a: 1,\n    \"b-c\": 2,\n  };\n</script>\n\n<p>\n  \
         {firstValueWithLongName\n    + secondValueWithLongName * thirdValueWithLongName\n    \
         - fourthValueWithLongName}\n  {f({\n    a: 1,\n    b: 2,\n  })}\n</p>\n\
         {@const o = { a: 1, \"b-c\": 2 }}\n"
    );
}
