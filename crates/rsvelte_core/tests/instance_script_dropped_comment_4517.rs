//! The control for the instance-script comment the located flush cannot reach.
//!
//! Under split coordinates a real source offset sits *below* `loc_base`, so
//! `Printer::has_loc` reads it as "no location" and the located flush declines
//! it — a comment with no comment-space node after it is then never emitted at
//! all. `print_split` recovers exactly those by printing once and printing
//! again only when the first pass dropped something.
//!
//! The pair is what makes this discriminating. `drop_*` are comments the first
//! pass loses, so they exercise the recovery; `keep_*` and `plain_element` are
//! comments the first pass already places, and a rule that claimed those too
//! would *move* a comment that was already correct — which no corpus gate can
//! observe, because `ast_equiv_batch` runs under `CommentPolicy::Ignore` and
//! scores any comment-only divergence a pass (`verify.mjs:607-611`). Unit tests
//! are the only guard this class has.
//!
//! `keep_selfclose` is the other half of the same issue and is deliberately
//! pinned to rsvelte's own bytes: the comment is emitted *after* the call where
//! official emits it before. The first pass does write it, so it is a
//! relocation rather than a loss and this recovery declines it on purpose.
//! When that half is fixed the expectation here becomes official's.
//!
//! Every other expectation is the official compiler's bytes (client, prod),
//! taken from `submodules/svelte/packages/svelte/src/compiler/index.js` — not
//! the npm build, which disagrees with it on other shapes.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(script: &str, template: &str) -> String {
    let src = format!("<script>\n{script}\n</script>\n{template}\n");
    let code = compile(
        &src,
        CompileOptions {
            filename: Some("C.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let lines: Vec<&str> = code
        .lines()
        .filter(|line| !line.trim().is_empty())
        .collect();
    let start = lines
        .iter()
        .position(|line| line.starts_with("export default function"))
        .expect("component function");
    lines[start..].join("\n")
}

const CHILDREN_CALL: &str = "\tX($$anchor, {\n\
     \t\tchildren: ($$anchor, $$slotProps) => {\n\
     \t\t\t$.next();\n\
     \t\t\tvar text = $.text('t');\n\
     \t\t\t$.append($$anchor, text);\n\
     \t\t},\n\
     \t\t$$slots: { default: true }\n\
     \t});";

#[test]
fn a_comment_alone_in_the_instance_script_precedes_the_component_call() {
    assert_eq!(
        client("\t// c", "<X>t</X>"),
        format!("export default function C($$anchor) {{\n\t// c\n{CHILDREN_CALL}\n}}")
    );
}

#[test]
fn a_comment_after_the_last_statement_precedes_the_component_call() {
    assert_eq!(
        client("\tlet a = 1;\n\t// c", "<X>t</X>"),
        format!(
            "export default function C($$anchor) {{\n\tlet a = 1;\n\t// c\n{CHILDREN_CALL}\n}}"
        )
    );
}

/// A comment the located flush already places must not move: it is followed by
/// a statement, so the first pass writes it and the recovery declines it.
#[test]
fn a_comment_before_a_statement_stays_where_the_located_flush_put_it() {
    assert_eq!(
        client("\t// c\n\tlet a = 1;", "<X>t</X>"),
        format!(
            "export default function C($$anchor) {{\n\t// c\n\tlet a = 1;\n{CHILDREN_CALL}\n}}"
        )
    );
}

/// An element template reaches a different lowering, and official itself writes
/// the comment inside the declarator. Nothing here may change that.
#[test]
fn a_plain_element_template_keeps_officials_declarator_placement() {
    assert_eq!(
        client("\t// c", "<p>x</p>"),
        "export default function C($$anchor) {\n\tvar // c\n\tp = root();\n\t$.append($$anchor, p);\n}"
    );
}

/// The unfixed half of the issue. Official emits `// c` *before* the call; the
/// first pass writes it after, so this is a relocation and out of scope here.
/// A recovery that claimed relocations too would pass this by accident while
/// breaking the `keep_*` cells above.
#[test]
fn a_self_closing_component_still_trails_its_comment() {
    assert_eq!(
        client("\t// c", "<X />"),
        "export default function C($$anchor) {\n\tX($$anchor, {});\n\t// c\n}"
    );
}
