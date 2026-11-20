//! `props_illegal_name`: a `$$` key of `$props()` or a `$$` member of a rest prop. The errors
//! and their UTF-8 offsets are svelte 5.57.3's on both targets.

use rsvelte_svelte_compile::Target;

use super::compile_at;

type Expected = Option<(&'static str, u32, u32)>;

/// Each source, and the code and UTF-8 span of the error it raises.
const CASES: &[(&str, Expected)] = &[
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "console.log(rest.$$slots);\n",
            "</script>\n"
        ),
        Some(("props_illegal_name", 57, 64)),
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "console.log(rest.$$host);\n",
            "</script>\n"
        ),
        Some(("props_illegal_name", 57, 63)),
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "console.log(rest.$$events, rest.$$legacy);\n",
            "</script>\n"
        ),
        Some(("props_illegal_name", 57, 65)),
    ),
    (
        "<script>\nlet { a, ...rest } = $props();\n\n</script>\n{rest.$$slots}\n",
        Some(("props_illegal_name", 57, 64)),
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "\n",
            "</script>\n",
            "<button onclick={() => rest.$$x}>x</button>\n"
        ),
        Some(("props_illegal_name", 79, 82)),
    ),
    (
        "<script>\nlet { a, ...rest } = $props();\nrest.$$x = 1;\n</script>\n",
        Some(("props_illegal_name", 45, 48)),
    ),
    (
        "<script>\nlet { a, ...rest } = $props();\nrest.$$x++;\n</script>\n",
        Some(("props_illegal_name", 45, 48)),
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "console.log(rest.$$x.y);\n",
            "</script>\n"
        ),
        Some(("props_illegal_name", 57, 60)),
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "console.log(rest.a.$$x);\n",
            "</script>\n"
        ),
        None,
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "console.log(rest?.$$x);\n",
            "</script>\n"
        ),
        Some(("props_illegal_name", 58, 61)),
    ),
    (
        "<script>\nlet { a, ...rest } = $props();\nrest.$$x();\n</script>\n",
        Some(("props_illegal_name", 45, 48)),
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "console.log(rest['$$x']);\n",
            "</script>\n"
        ),
        None,
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "const $$k = 1;\n",
            "console.log(rest[$$k]);\n",
            "</script>\n"
        ),
        Some(("dollar_prefix_invalid", 46, 49)),
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "function f($$k) { return rest[$$k]; }\n",
            "f;\n",
            "</script>\n"
        ),
        Some(("props_illegal_name", 70, 73)),
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "console.log(rest.$x);\n",
            "</script>\n"
        ),
        None,
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "\n",
            "</script>\n",
            "<input bind:value={rest.$$x} />\n"
        ),
        Some(("props_illegal_name", 75, 78)),
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "function f(rest) { return rest.$$x; }\n",
            "f;\n",
            "</script>\n"
        ),
        None,
    ),
    (
        "<script>\nlet props = $props();\nconsole.log(props.$$slots);\n</script>\n",
        Some(("props_illegal_name", 49, 56)),
    ),
    (
        "<script>\nlet props = $props();\n</script>\n{props.$$slots}\n",
        Some(("props_illegal_name", 48, 55)),
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "console.log(a.$$x);\n",
            "</script>\n"
        ),
        None,
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "console.log(rest.$$a, rest.$$b);\n",
            "</script>\n"
        ),
        Some(("props_illegal_name", 57, 60)),
    ),
    (
        "<script>\nlet { $$x } = $props();\n</script>\n",
        Some(("dollar_prefix_invalid", 15, 18)),
    ),
    (
        "<script>\nlet { $$x: y } = $props();\ny;\n</script>\n",
        Some(("props_illegal_name", 15, 21)),
    ),
    (
        "<script>\nlet { $$x = 1 } = $props();\n</script>\n",
        Some(("dollar_prefix_invalid", 15, 18)),
    ),
    (
        "<script>\nlet { '$$x': y } = $props();\ny;\n</script>\n",
        None,
    ),
    (
        "<script>\nlet { $$a: { b } } = $props();\n</script>\n",
        Some(("props_illegal_name", 15, 25)),
    ),
    (
        "<script>\nconst k = \"a\";\nlet { [k]: z, $$a } = $props();\n</script>\n",
        Some(("dollar_prefix_invalid", 38, 41)),
    ),
    (
        "<script>\nlet { a: { b }, $$c } = $props();\n</script>\n",
        Some(("dollar_prefix_invalid", 25, 28)),
    ),
    (
        "<script>\nlet { $$x, ...rest } = $props();\nrest.$$y;\n</script>\n",
        Some(("dollar_prefix_invalid", 15, 18)),
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "console.log(rest.$$props);\n",
            "</script>\n"
        ),
        Some(("props_illegal_name", 57, 64)),
    ),
    (
        concat!(
            "<script lang=\"ts\">\n",
            "let { a, ...rest }: { a: number; [k: string]: unknown } = $props();\n",
            "console.log(rest.$$slots as number);\n",
            "</script>\n"
        ),
        Some(("props_illegal_name", 104, 111)),
    ),
    (
        concat!(
            "<script lang=\"ts\">\n",
            "let { a, ...rest }: any = $props();\n",
            "console.log(rest!.$$slots);\n",
            "</script>\n"
        ),
        Some(("props_illegal_name", 73, 80)),
    ),
    (
        concat!(
            "<script>\n",
            "let { a, ...rest } = $props();\n",
            "console.log((rest).$$slots);\n",
            "</script>\n"
        ),
        Some(("props_illegal_name", 59, 66)),
    ),
];

#[test]
fn a_dollar_dollar_prop_or_rest_member_raises_upstreams_first_error() {
    for &(source, expected) in CASES {
        for target in [Target::Client, Target::Server] {
            let found = compile_at(source, target).err();
            let found = found
                .as_ref()
                .map(|(code, (start, end))| (code.as_str(), *start, *end));
            assert_eq!(found, expected, "{source} on {target:?}");
        }
    }
}
