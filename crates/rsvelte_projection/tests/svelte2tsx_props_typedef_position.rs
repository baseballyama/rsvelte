//! Where the synthesised `;type $$ComponentProps = …;` is inserted. Upstream
//! uses `node.parent.pos`, and TypeScript's `pos` spans the declaration's LEADING
//! TRIVIA — so the insertion lands before any comment that precedes the `$props()`
//! declaration. rsvelte walks back from the `let`/`const` keyword, and only one of
//! the three branches that compute this offset walked back through comments; the
//! other two stopped at whitespace and appended the typedef onto a `//` line, where
//! the line comment swallowed it.
//!
//! `generics=` is on its own axis because it is what makes the offset reachable:
//! without it the typedef is hoisted out of `$$render` and no branch here runs.
//! Expectations are generated from official svelte2tsx.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn typedef_line(src: &str) -> String {
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "C.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    let i = code.find("$$ComponentProps").expect("no props typedef");
    let start = code[..i].rfind('\n').map_or(0, |n| n + 1);
    let end = code[i..].find('\n').map_or(code.len(), |n| n + i);
    code[start..end].to_string()
}

const CASES: &[(&str, &str, &str)] = &[
    (
        "with generics / inline object / no trivia",
        "<script lang=\"ts\" generics=\"T\">\n  const { a }: { a: T[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: T[] };",
    ),
    (
        "with generics / inline object / line comment",
        "<script lang=\"ts\" generics=\"T\">\n  // C\n  const { a }: { a: T[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: T[] };",
    ),
    (
        "with generics / inline object / two line comments",
        "<script lang=\"ts\" generics=\"T\">\n  // one\n  // two\n  const { a }: { a: T[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: T[] };",
    ),
    (
        "with generics / inline object / block comment",
        "<script lang=\"ts\" generics=\"T\">\n  /* C */\n  const { a }: { a: T[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: T[] };",
    ),
    (
        "with generics / inline object / jsdoc comment",
        "<script lang=\"ts\" generics=\"T\">\n  /** C */\n  const { a }: { a: T[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: T[] };",
    ),
    (
        "with generics / inline object / comment then blank",
        "<script lang=\"ts\" generics=\"T\">\n  // C\n\n  const { a }: { a: T[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: T[] };",
    ),
    (
        "with generics / intersection / no trivia",
        "<script lang=\"ts\" generics=\"T\">\n  interface Cfg { b?: number }\n  const { a }: { a: T[] } & Cfg = $props();\n</script>\n{a}",
        "  interface Cfg { b?: number };type $$ComponentProps =  { a: T[] } & Cfg;",
    ),
    (
        "with generics / intersection / line comment",
        "<script lang=\"ts\" generics=\"T\">\n  interface Cfg { b?: number }\n  // C\n  const { a }: { a: T[] } & Cfg = $props();\n</script>\n{a}",
        "  interface Cfg { b?: number };type $$ComponentProps =  { a: T[] } & Cfg;",
    ),
    (
        "with generics / intersection / two line comments",
        "<script lang=\"ts\" generics=\"T\">\n  interface Cfg { b?: number }\n  // one\n  // two\n  const { a }: { a: T[] } & Cfg = $props();\n</script>\n{a}",
        "  interface Cfg { b?: number };type $$ComponentProps =  { a: T[] } & Cfg;",
    ),
    (
        "with generics / intersection / block comment",
        "<script lang=\"ts\" generics=\"T\">\n  interface Cfg { b?: number }\n  /* C */\n  const { a }: { a: T[] } & Cfg = $props();\n</script>\n{a}",
        "  interface Cfg { b?: number };type $$ComponentProps =  { a: T[] } & Cfg;",
    ),
    (
        "with generics / intersection / jsdoc comment",
        "<script lang=\"ts\" generics=\"T\">\n  interface Cfg { b?: number }\n  /** C */\n  const { a }: { a: T[] } & Cfg = $props();\n</script>\n{a}",
        "  interface Cfg { b?: number };type $$ComponentProps =  { a: T[] } & Cfg;",
    ),
    (
        "with generics / intersection / comment then blank",
        "<script lang=\"ts\" generics=\"T\">\n  interface Cfg { b?: number }\n  // C\n\n  const { a }: { a: T[] } & Cfg = $props();\n</script>\n{a}",
        "  interface Cfg { b?: number };type $$ComponentProps =  { a: T[] } & Cfg;",
    ),
    (
        "with generics / union / no trivia",
        "<script lang=\"ts\" generics=\"T\">\n  const { a }: { a: T[] } | { a: T[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: T[] } | { a: T[] };",
    ),
    (
        "with generics / union / line comment",
        "<script lang=\"ts\" generics=\"T\">\n  // C\n  const { a }: { a: T[] } | { a: T[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: T[] } | { a: T[] };",
    ),
    (
        "with generics / union / two line comments",
        "<script lang=\"ts\" generics=\"T\">\n  // one\n  // two\n  const { a }: { a: T[] } | { a: T[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: T[] } | { a: T[] };",
    ),
    (
        "with generics / union / block comment",
        "<script lang=\"ts\" generics=\"T\">\n  /* C */\n  const { a }: { a: T[] } | { a: T[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: T[] } | { a: T[] };",
    ),
    (
        "with generics / union / jsdoc comment",
        "<script lang=\"ts\" generics=\"T\">\n  /** C */\n  const { a }: { a: T[] } | { a: T[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: T[] } | { a: T[] };",
    ),
    (
        "with generics / union / comment then blank",
        "<script lang=\"ts\" generics=\"T\">\n  // C\n\n  const { a }: { a: T[] } | { a: T[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: T[] } | { a: T[] };",
    ),
    (
        "without generics / inline object / no trivia",
        "<script lang=\"ts\">\n  const { a }: { a: number[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] };function $$render() {",
    ),
    (
        "without generics / inline object / line comment",
        "<script lang=\"ts\">\n  // C\n  const { a }: { a: number[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] };function $$render() {",
    ),
    (
        "without generics / inline object / two line comments",
        "<script lang=\"ts\">\n  // one\n  // two\n  const { a }: { a: number[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] };function $$render() {",
    ),
    (
        "without generics / inline object / block comment",
        "<script lang=\"ts\">\n  /* C */\n  const { a }: { a: number[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] };function $$render() {",
    ),
    (
        "without generics / inline object / jsdoc comment",
        "<script lang=\"ts\">\n  /** C */\n  const { a }: { a: number[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] };function $$render() {",
    ),
    (
        "without generics / inline object / comment then blank",
        "<script lang=\"ts\">\n  // C\n\n  const { a }: { a: number[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] };function $$render() {",
    ),
    (
        "without generics / intersection / no trivia",
        "<script lang=\"ts\">\n  interface Cfg { b?: number }\n  const { a }: { a: number[] } & Cfg = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] } & Cfg;function $$render() {",
    ),
    (
        "without generics / intersection / line comment",
        "<script lang=\"ts\">\n  interface Cfg { b?: number }\n  // C\n  const { a }: { a: number[] } & Cfg = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] } & Cfg;function $$render() {",
    ),
    (
        "without generics / intersection / two line comments",
        "<script lang=\"ts\">\n  interface Cfg { b?: number }\n  // one\n  // two\n  const { a }: { a: number[] } & Cfg = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] } & Cfg;function $$render() {",
    ),
    (
        "without generics / intersection / block comment",
        "<script lang=\"ts\">\n  interface Cfg { b?: number }\n  /* C */\n  const { a }: { a: number[] } & Cfg = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] } & Cfg;function $$render() {",
    ),
    (
        "without generics / intersection / jsdoc comment",
        "<script lang=\"ts\">\n  interface Cfg { b?: number }\n  /** C */\n  const { a }: { a: number[] } & Cfg = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] } & Cfg;function $$render() {",
    ),
    (
        "without generics / intersection / comment then blank",
        "<script lang=\"ts\">\n  interface Cfg { b?: number }\n  // C\n\n  const { a }: { a: number[] } & Cfg = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] } & Cfg;function $$render() {",
    ),
    (
        "without generics / union / no trivia",
        "<script lang=\"ts\">\n  const { a }: { a: number[] } | { a: number[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] } | { a: number[] };function $$render() {",
    ),
    (
        "without generics / union / line comment",
        "<script lang=\"ts\">\n  // C\n  const { a }: { a: number[] } | { a: number[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] } | { a: number[] };function $$render() {",
    ),
    (
        "without generics / union / two line comments",
        "<script lang=\"ts\">\n  // one\n  // two\n  const { a }: { a: number[] } | { a: number[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] } | { a: number[] };function $$render() {",
    ),
    (
        "without generics / union / block comment",
        "<script lang=\"ts\">\n  /* C */\n  const { a }: { a: number[] } | { a: number[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] } | { a: number[] };function $$render() {",
    ),
    (
        "without generics / union / jsdoc comment",
        "<script lang=\"ts\">\n  /** C */\n  const { a }: { a: number[] } | { a: number[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] } | { a: number[] };function $$render() {",
    ),
    (
        "without generics / union / comment then blank",
        "<script lang=\"ts\">\n  // C\n\n  const { a }: { a: number[] } | { a: number[] } = $props();\n</script>\n{a}",
        ";type $$ComponentProps =  { a: number[] } | { a: number[] };function $$render() {",
    ),
];

#[test]
fn the_props_typedef_is_inserted_before_the_declarations_leading_comments() {
    let mut failures = Vec::new();
    for (label, source, expected) in CASES {
        let actual = typedef_line(source);
        if actual != *expected {
            failures.push(format!(
                "{label}\n  expected {expected:?}\n  actual   {actual:?}"
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{} of {} cells diverge from official:\n{}",
        failures.len(),
        CASES.len(),
        failures.join("\n")
    );
}

fn head_through_render(src: &str) -> String {
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "C.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    let end = code.find("function $$render").expect("render function") + "function $$render".len();
    code[..end].to_string()
}

/// `moveHoistableInterfaces` prepends `\n` to the alias whether or not imports
/// were hoisted in front of it, so after an import chunk (which ends at a line
/// start) the alias follows a blank line. Expectations are official svelte2tsx
/// (language-tools f0eda319c400), up to `function $$render`.
const AFTER_IMPORTS: &[(&str, &str, &str)] = &[
    (
        "import then inline object",
        "<script lang=\"ts\">\n  import type { X } from 'x';\n  let { a }: { a: X } = $props();\n</script>\n{a}",
        "///<reference types=\"svelte\" />\n;\n  import type { X } from 'x';\n\n;type $$ComponentProps =  { a: X };function $$render",
    ),
    (
        "two imports, statement between alias and props",
        "<script lang=\"ts\">\n  import type { X } from 'x';\n  import y from 'y';\n  let z = y;\n  let { a }: { a: X } = $props();\n</script>\n{a}",
        "///<reference types=\"svelte\" />\n;\n  import type { X } from 'x';\n  import y from 'y';\n\n;type $$ComponentProps =  { a: X };function $$render",
    ),
    (
        "import then inline object, CRLF",
        "<script lang=\"ts\">\r\n  import type { X } from 'x';\r\n  let { a }: { a: X } = $props();\r\n</script>\r\n{a}",
        "///<reference types=\"svelte\" />\n;\n  import type { X } from 'x';\r\n\n;type $$ComponentProps =  { a: X };function $$render",
    ),
    (
        "import, hoisted type alias, inline object",
        "<script lang=\"ts\">\n  import type { X } from 'x';\n  type Item = { n: number };\n  let { a }: { a: X; i: Item } = $props();\n</script>\n{a}",
        "///<reference types=\"svelte\" />\n;\n  import type { X } from 'x';\n;\n  type Item = { n: number };;\n;type $$ComponentProps =  { a: X; i: Item };function $$render",
    ),
    (
        "import, hoistable snippet, inline object",
        "<script lang=\"ts\">\n  import type { X } from 'x';\n  let { a }: { a: X } = $props();\n</script>\n{#snippet foo()}<p>hi</p>{/snippet}\n{@render foo()}{a}",
        "///<reference types=\"svelte\" />\n;\n  import type { X } from 'x';\n\n;type $$ComponentProps =  { a: X };function $$render",
    ),
    (
        "no import, inline object",
        "<script lang=\"ts\">\n  let { a }: { a: number } = $props();\n</script>\n{a}",
        "///<reference types=\"svelte\" />\n;\n;type $$ComponentProps =  { a: number };function $$render",
    ),
];

#[test]
fn the_props_typedef_follows_hoisted_imports_after_a_blank_line() {
    let mut failures = Vec::new();
    for (label, source, expected) in AFTER_IMPORTS {
        let actual = head_through_render(source);
        if actual != *expected {
            failures.push(format!(
                "{label}\n  expected {expected:?}\n  actual   {actual:?}"
            ));
        }
    }
    assert!(
        failures.is_empty(),
        "{} of {} cells diverge from official:\n{}",
        failures.len(),
        AFTER_IMPORTS.len(),
        failures.join("\n")
    );
}
