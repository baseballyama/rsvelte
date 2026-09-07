//! A global block's body is not walked by the prune (#4089).
//!
//! Upstream's prune visits a global block's PRELUDE and nothing else
//! (`2-analyze/css/css-prune.js:133`), so a prefix like `.p` still scopes the
//! element it matches and no selector written inside the block scopes anything.
//! rsvelte read that decision off `metadata.is_global_block` — a key nothing in
//! the tree ever writes, so the short-circuit was unreachable and the body was
//! walked like any other nested rule. A `&` in the subject then reached
//! `nesting_matches_anything`, which matches every element, and `.p :global {
//! &.a { … } }` scoped `path`, `i` and `u` as well as the `svg` the prefix
//! matched.
//!
//! The rows are one parent prelude × one child selector, and every expectation
//! is the line `svelte.compile` emits for that source, read out of
//! `submodules/svelte`. The `plain` and `globalargs` parents are the controls:
//! they are not global blocks, so their bodies must go on being walked.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const MARKUP: &str =
    "<svg class=\"p q\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>\n";

fn source(parent: &str, child: &str) -> String {
    format!("{MARKUP}<style>\n\t{parent} {{\n\t\t{child} {{ opacity: 1; }}\n\t}}\n</style>")
}

fn server(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            generate: GenerateMode::Server,
            css: CssMode::External,
            filename: Some("x.svelte".to_string()),
            dev: false,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .map_err(|error| error.to_string())
}

/// `(name, parent prelude, child selector, the `$$renderer.push` line upstream emits)`.
const ACCEPTED: &[(&str, &str, &str, &str)] = &[
    (
        "bare__plain",
        ":global",
        ".a",
        "$$renderer.push(`<svg class=\"p q\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "bare__global_args",
        ":global",
        ":global(.a)",
        "$$renderer.push(`<svg class=\"p q\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "prefixed__plain",
        ".p :global",
        ".a",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "prefixed__amp_desc",
        ".p :global",
        "& .a",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "prefixed__amp_compound",
        ".p :global",
        "&.a",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "prefixed__amp_child",
        ".p :global",
        "& > .a",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "prefixed__global_args",
        ".p :global",
        ":global(.a)",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "prefixed__amp_subject_last",
        ".p :global",
        ".a &",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "prefixed__amp_alone",
        ".p :global",
        "&",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "prefixed__desc_amp",
        ".p :global",
        ".b &",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "plain__plain",
        ".p",
        ".a",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a svelte-1lj1c2o\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "plain__amp_desc",
        ".p",
        "& .a",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a svelte-1lj1c2o\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "plain__amp_compound",
        ".p",
        "&.a",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "plain__amp_child",
        ".p",
        "& > .a",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a svelte-1lj1c2o\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "plain__global_args",
        ".p",
        ":global(.a)",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "plain__amp_subject_last",
        ".p",
        ".a &",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "plain__amp_alone",
        ".p",
        "&",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "plain__desc_amp",
        ".p",
        ".b &",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "globalargs__plain",
        ":global(.p)",
        ".a",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a svelte-1lj1c2o\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "globalargs__amp_desc",
        ":global(.p)",
        "& .a",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a svelte-1lj1c2o\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "globalargs__amp_compound",
        ":global(.p)",
        "&.a",
        "$$renderer.push(`<svg class=\"p q\"><path class=\"a svelte-1lj1c2o\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "globalargs__amp_child",
        ":global(.p)",
        "& > .a",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a svelte-1lj1c2o\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "globalargs__global_args",
        ":global(.p)",
        ":global(.a)",
        "$$renderer.push(`<svg class=\"p q\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "globalargs__amp_subject_last",
        ":global(.p)",
        ".a &",
        "$$renderer.push(`<svg class=\"p q\"><path class=\"a svelte-1lj1c2o\"><i class=\"b svelte-1lj1c2o\"><u class=\"c svelte-1lj1c2o\"></u></i></path></svg>`);",
    ),
    (
        "globalargs__amp_alone",
        ":global(.p)",
        "&",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a svelte-1lj1c2o\"><i class=\"b svelte-1lj1c2o\"><u class=\"c svelte-1lj1c2o\"></u></i></path></svg>`);",
    ),
    (
        "globalargs__desc_amp",
        ":global(.p)",
        ".b &",
        "$$renderer.push(`<svg class=\"p q\"><path class=\"a\"><i class=\"b svelte-1lj1c2o\"><u class=\"c svelte-1lj1c2o\"></u></i></path></svg>`);",
    ),
];

/// Cells upstream rejects. They are here so the fix is measured in both
/// directions: a prune that stops walking a global block's body must not also
/// stop the analyzer that raises these.
const REJECTED: &[(&str, &str, &str, &str)] = &[
    (
        "bare__amp_desc",
        ":global",
        "& .a",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "bare__amp_compound",
        ":global",
        "&.a",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "bare__amp_child",
        ":global",
        "& > .a",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "bare__amp_subject_last",
        ":global",
        ".a &",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "bare__amp_alone",
        ":global",
        "&",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "bare__desc_amp",
        ":global",
        ".b &",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "modstart__plain",
        ":global.x",
        ".a",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "modstart__amp_desc",
        ":global.x",
        "& .a",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "modstart__amp_compound",
        ":global.x",
        "&.a",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "modstart__amp_child",
        ":global.x",
        "& > .a",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "modstart__global_args",
        ":global.x",
        ":global(.a)",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "modstart__amp_subject_last",
        ":global.x",
        ".a &",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "modstart__amp_alone",
        ":global.x",
        "&",
        "css_global_block_invalid_modifier_start",
    ),
    (
        "modstart__desc_amp",
        ":global.x",
        ".b &",
        "css_global_block_invalid_modifier_start",
    ),
];

#[test]
fn a_global_block_scopes_only_what_its_prelude_matches() {
    for (name, parent, child, expected) in ACCEPTED {
        let code = server(&source(parent, child))
            .unwrap_or_else(|rendered| panic!("{name}: rejected with {rendered}"));
        assert!(
            code.lines().any(|line| line.trim() == *expected),
            "{name}: expected {expected:?}\n--- got ---\n{code}"
        );
    }
}

#[test]
fn the_analyzer_still_rejects_what_upstream_rejects() {
    for (name, parent, child, expected) in REJECTED {
        match server(&source(parent, child)) {
            Ok(code) => panic!("{name}: accepted, expected {expected}\n--- got ---\n{code}"),
            Err(rendered) => assert!(
                rendered.contains(expected),
                "{name}: expected {expected}, got {rendered}"
            ),
        }
    }
}

/// The two cells the fix moves, spelled on their own so a run that reports
/// `a_global_block_scopes_only_what_its_prelude_matches` green cannot be
/// satisfied by rows that were already passing. `&.a` and a lone `&` are the
/// only children whose subject carries a `&` and which upstream accepts under a
/// global-block prelude.
#[test]
fn an_ampersand_subject_inside_a_global_block_scopes_nothing() {
    for child in ["&.a", "&"] {
        let code = server(&source(".p :global", child)).expect("accepted");
        let line = code
            .lines()
            .find(|line| line.contains("$$renderer.push"))
            .unwrap_or_default();
        assert!(
            line.contains("<path class=\"a\">") && line.contains("<i class=\"b\">"),
            "child {child:?}: the block's body scoped an element\n{line}"
        );
    }
}

/// `:global.x` is a global block too — upstream opens one on any relative
/// selector whose FIRST simple selector is a bare `:global`, so the predicate
/// cannot be "the relative selector is exactly `:global`". These four are only
/// legal where a `:global.x` is not the first relative selector of a root rule,
/// which is why they carry their own nesting rather than joining the table
/// above. `(name, style body, the `$$renderer.push` line upstream emits)`.
const MODIFIER_START: &[(&str, &str, &str)] = &[
    (
        "nested-modstart-amp",
        ".p {\n\t\t:global.q {\n\t\t\t&.a { opacity: 1; }\n\t\t}\n\t}",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "nested-modstart-plain",
        ".p {\n\t\t:global.q {\n\t\t\t.a { opacity: 1; }\n\t\t}\n\t}",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "nested-modstart-alone",
        ".p {\n\t\t:global.q {\n\t\t\t& { opacity: 1; }\n\t\t}\n\t}",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
    (
        "descendant-modstart-amp",
        ".p :global.q {\n\t\t&.a { opacity: 1; }\n\t}",
        "$$renderer.push(`<svg class=\"p q svelte-1lj1c2o\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>`);",
    ),
];

#[test]
fn a_global_block_opened_by_a_modifier_start_is_one_too() {
    for (name, body, expected) in MODIFIER_START {
        let src = format!("{MARKUP}<style>\n\t{body}\n</style>");
        let code =
            server(&src).unwrap_or_else(|rendered| panic!("{name}: rejected with {rendered}"));
        assert!(
            code.lines().any(|line| line.trim() == *expected),
            "{name}: expected {expected:?}\n--- got ---\n{code}"
        );
    }
}
