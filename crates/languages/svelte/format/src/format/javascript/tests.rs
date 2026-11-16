use crate::format::{format, rejected};
use crate::options::Options;

fn formatted(source_text: &str) -> String {
    let c = rsvelte_svelte_syntax::parse::parse(source_text).expect("parses");
    format(
        &c,
        source_text,
        &Options::default(),
        rejected(&c, source_text).as_ref(),
    )
    .expect("prints")
}

#[test]
fn await_is_an_operator_in_a_script_and_in_the_template() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    assert_eq!(
        formatted("<script lang=\"ts\">\nconst r = await\np;\n</script>\n"),
        "<script lang=\"ts\">\n  const r = await p;\n</script>\n"
    );
    assert_eq!(
        formatted("<script>\nconst r = await\np;\n</script>\n"),
        "<script>\n  const r = await p;\n</script>\n"
    );
    assert_eq!(
        formatted("<script lang=\"ts\"></script>\n{await a}\n"),
        "<script lang=\"ts\"></script>\n\n{await a}\n"
    );
}

#[test]
fn a_line_comment_in_a_block_header_ends_its_line_inside_the_header() {
    // Prettier 3.9.10 with prettier-plugin-svelte 4.1.1 prints `//comment` after `{/each}`, as
    // text in the markup; the header keeps it here.
    assert_eq!(
        formatted("{#each Array(1, //comment\n2) as i}{i}{/each}\n"),
        "{#each Array(1, //comment\n  2) as i}{i}{/each}\n"
    );
    // The plugin prints `)` at the header's column; the break stays inside the arguments' indent.
    assert_eq!(
        formatted("{#each Array(//comment\n) as i}{i}{/each}\n"),
        "{#each Array(//comment\n  ) as i}{i}{/each}\n"
    );
    for output in [
        "{#each Array(1, //comment\n  2) as i}{i}{/each}\n",
        "{#each Array(//comment\n  ) as i}{i}{/each}\n",
    ] {
        assert_eq!(formatted(output), output);
    }
}

// Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1, whose typescript
// parser lets each error pass.
const RECOVERED: [(u32, &str, &str); 18] = [
    (
        1015,
        "function f(a?: number = 1) {}",
        "<script lang=\"ts\">\n  function f(a?: number = 1) {}\n</script>\n",
    ),
    (
        1016,
        "function f(a?: number, b: number) {}",
        "<script lang=\"ts\">\n  function f(a?: number, b: number) {}\n</script>\n",
    ),
    (
        1029,
        "class C { readonly static a = 1; }",
        "<script lang=\"ts\">\n  class C {\n    static readonly a = 1;\n  }\n</script>\n",
    ),
    (
        1038,
        "declare namespace N { declare const a: number; }",
        "<script lang=\"ts\">\n  declare namespace N {\n    declare const a: number;\n  }\n\
            </script>\n",
    ),
    (
        1039,
        "class K { declare a = 1; }",
        "<script lang=\"ts\">\n  class K {\n    declare a = 1;\n  }\n</script>\n",
    ),
    (
        1049,
        "class C { set x(a: number, b: number) {} }",
        "<script lang=\"ts\">\n  class C {\n    set x(a: number, b: number) {}\n  }\n</script>\n",
    ),
    (
        1051,
        "class C { set x(a?: number) {} }",
        "<script lang=\"ts\">\n  class C {\n    set x(a?: number) {}\n  }\n</script>\n",
    ),
    (
        1093,
        "class C { constructor(): void {} }",
        "<script lang=\"ts\">\n  class C {\n    constructor(): void {}\n  }\n</script>\n",
    ),
    (
        1094,
        "class C { get x<T>() { return 1; } }",
        "<script lang=\"ts\">\n  class C {\n    get x<T>() {\n      return 1;\n    }\n  }\n\
            </script>\n",
    ),
    (
        1095,
        "class C { set x(a: number): void {} }",
        "<script lang=\"ts\">\n  class C {\n    set x(a: number): void {}\n  }\n</script>\n",
    ),
    (
        1147,
        "namespace N { import a = require(\"a\"); }",
        "<script lang=\"ts\">\n  namespace N {\n    import a = require(\"a\");\n  }\n</script>\n",
    ),
    (
        1194,
        "namespace N { export * from \"a\"; }",
        "<script lang=\"ts\">\n  namespace N {\n    export * from \"a\";\n  }\n</script>\n",
    ),
    (
        1222,
        "class C { *m(); }",
        "<script lang=\"ts\">\n  class C {\n    *m();\n  }\n</script>\n",
    ),
    (
        1257,
        "type T = [a?: string, b: string];",
        "<script lang=\"ts\">\n  type T = [a?: string, b: string];\n</script>\n",
    ),
    (
        1308,
        "class A { x = await f(); }",
        "<script lang=\"ts\">\n  class A {\n    x = await f();\n  }\n</script>\n",
    ),
    (
        2368,
        "type T<number> = number;",
        "<script lang=\"ts\">\n  type T<number> = number;\n</script>\n",
    ),
    (
        2681,
        "class C { constructor(this: C) {} }",
        "<script lang=\"ts\">\n  class C {\n    constructor(this: C) {}\n  }\n</script>\n",
    ),
    (
        18010,
        "class C { private #a = 1; }",
        "<script lang=\"ts\">\n  class C {\n    private #a = 1;\n  }\n</script>\n",
    ),
];

#[test]
fn a_program_oxc_recovers_whole_prints_as_prettier_prints_the_code() {
    for (code, text, expected) in RECOVERED {
        assert!(super::RECOVERED_WHOLE.contains(&code), "{code}");
        let source_text = format!("<script lang=\"ts\">\n{text}\n</script>\n");
        let printed = crate::task::format(&source_text, &Options::default());
        assert_eq!(printed.as_deref().ok(), Some(expected), "{code}: {text:?}");
    }
    assert_eq!(RECOVERED.len(), super::RECOVERED_WHOLE.len());
}

#[test]
fn a_program_oxc_recovers_with_code_missing_is_refused() {
    // oxc's tree holds one index signature parameter and no `declare` on an accessor.
    for text in [
        "interface I { [a: string, b: string]: number }",
        "class C { declare accessor a; }",
    ] {
        let source_text = format!("<script lang=\"ts\">\n{text}\n</script>\n");
        let refused = crate::task::format(&source_text, &Options::default()).expect_err(text);
        assert_eq!(
            refused.message,
            "not supported by the formatter yet: code that oxc's formatter does not format",
            "{text:?}"
        );
    }
}
