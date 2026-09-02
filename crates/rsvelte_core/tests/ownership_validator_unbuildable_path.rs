//! `$$ownership_validator` is declared for a prop mutation that was SEEN, not
//! only for one that could be wrapped.
//!
//! Upstream latches `analysis.needs_mutation_validation` before it builds the
//! mutation's property path (`shared/utils.js:406`), so a computed key it cannot
//! spell — anything but an identifier or a literal — leaves the mutation
//! unwrapped **and still emits the preamble**. rsvelte's instance-script pass
//! derived the flag from a text scan for `$$ownership_validator.mutation`, which
//! by construction can only find a mutation that *was* wrapped.
//!
//! The rule is ported twice. `expression_converter.rs` carries the latch and a
//! comment saying why; `prop_mutation_validation_ast.rs` carried neither.
//!
//! Two axes, crossed, and they are NOT independent — that was predicted and the
//! prediction was wrong, which is the reason the grid is worth keeping. The
//! **index** axis is upstream's own `Literal | Identifier` test, so `[key]`,
//! `["lit"]` and `[0]` wrap and the other five do not; those five are the
//! controls that must keep `wrap == 0` while `decl == 1`. The **root** axis is a
//! parenthesised object, and it sits UPSTREAM of the latch rather than beside
//! it: `props_transforms`'s scan builds `PropMutationSites`, which
//! `source_has_member_write` reads, which gates the latch. Ablating each half
//! separately measures the difference — the latch alone falls on 15 cells (the
//! five unspellable indices at every root, `decl=0 wrap=0`), while the root arm
//! alone falls on all 8 `paren` cells with `decl=0`, including the three whose
//! wrap the latch never touches. A fix for the index axis is dead on a
//! parenthesised root.
//!
//! Every expectation is the official compiler's own count for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `(root, index, declarations, wraps)`
const CELLS: &[(&str, &str, usize, usize)] = &[
    ("bare", "ident", 1, 1),
    ("bare", "nullish", 1, 0),
    ("bare", "logical-or", 1, 0),
    ("bare", "binary", 1, 0),
    ("bare", "string-lit", 1, 1),
    ("bare", "number-lit", 1, 1),
    ("bare", "call", 1, 0),
    ("bare", "ternary", 1, 0),
    ("as-any", "ident", 1, 1),
    ("as-any", "nullish", 1, 0),
    ("as-any", "logical-or", 1, 0),
    ("as-any", "binary", 1, 0),
    ("as-any", "string-lit", 1, 1),
    ("as-any", "number-lit", 1, 1),
    ("as-any", "call", 1, 0),
    ("as-any", "ternary", 1, 0),
    ("paren", "ident", 1, 1),
    ("paren", "nullish", 1, 0),
    ("paren", "logical-or", 1, 0),
    ("paren", "binary", 1, 0),
    ("paren", "string-lit", 1, 1),
    ("paren", "number-lit", 1, 1),
    ("paren", "call", 1, 0),
    ("paren", "ternary", 1, 0),
];

fn root_text(root: &str) -> &str {
    match root {
        "bare" => "object",
        "as-any" => "(object as any)",
        _ => "(object)",
    }
}

fn index_text(index: &str) -> &str {
    match index {
        "ident" => "key",
        "nullish" => "objectKey ?? key",
        "logical-or" => "objectKey || key",
        "binary" => "key + \"\"",
        "string-lit" => "\"lit\"",
        "number-lit" => "0",
        "call" => "f2()",
        _ => "key ? key : key",
    }
}

fn counts(root: &str, index: &str) -> (usize, usize) {
    let src = format!(
        "<script lang=\"ts\">\nexport let object: Record<string, any>;\nexport let key: string;\nexport let objectKey: string | undefined = undefined;\nfunction f2(){{ return key; }}\nfunction f(v: any){{ {}[{}] = v; }}\n</script>{{f}}",
        root_text(root),
        index_text(index)
    );
    let code = compile(
        &src,
        CompileOptions {
            filename: Some("P.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    (
        code.matches("create_ownership_validator").count(),
        code.matches("$$ownership_validator.mutation(").count(),
    )
}

#[test]
fn every_cell_agrees_with_the_oracle() {
    let mut failures = Vec::new();
    for (root, index, decl, wrap) in CELLS {
        let (got_decl, got_wrap) = counts(root, index);
        if got_decl != *decl || got_wrap != *wrap {
            failures.push(format!(
                "{root}/{index}: official decl={decl} wrap={wrap}, rsvelte decl={got_decl} wrap={got_wrap}"
            ));
        }
    }
    assert!(failures.is_empty(), "\n{}", failures.join("\n"));
}

/// The mirror direction of the grid above. Every cell writes through a member
/// of a NAME that is a prop, in a scope where that name is bound to something
/// else — so upstream's `scope.get(name)` answers with the shadowing binding and
/// declares nothing. The two `CONTROL` rows are the cells that must keep
/// `decl=1` / `decl=0` without any shadowing at all: a grid whose every cell
/// moves one way cannot report an over-correction.
///
/// `(mode, form, declarations, wraps)` — every expectation is the official
/// compiler's own count for the same source.
const SHADOW_CELLS: &[(&str, &str, usize, usize)] = &[
    ("legacy", "for-of", 0, 0),
    ("legacy", "arrow-param", 0, 0),
    ("legacy", "arrow-destr", 0, 0),
    ("legacy", "fn-param", 0, 0),
    ("legacy", "fn-expr-param", 0, 0),
    ("legacy", "block-let", 0, 0),
    ("legacy", "catch-param", 0, 0),
    ("legacy", "CONTROL-write", 1, 1),
    ("legacy", "CONTROL-none", 0, 0),
    ("runes", "for-of", 0, 0),
    ("runes", "arrow-param", 0, 0),
    ("runes", "arrow-destr", 0, 0),
    ("runes", "fn-param", 0, 0),
    ("runes", "fn-expr-param", 0, 0),
    ("runes", "block-let", 0, 0),
    ("runes", "catch-param", 0, 0),
    ("runes", "CONTROL-write", 1, 1),
    ("runes", "CONTROL-none", 0, 0),
];

fn shadow_body(form: &str) -> &str {
    match form {
        "for-of" => "for (const p of list) { p.x = 1; }",
        "arrow-param" => "list.forEach((p) => { p.x = 1; });",
        "arrow-destr" => "const g = ({ p }) => { p.x = 1; }; g(list[0]);",
        "fn-param" => "function h(p) { p.x = 1; } h(list[0]);",
        "fn-expr-param" => "list.map(function (p) { p.x = 1; });",
        "block-let" => "{ let p = list[0]; p.x = 1; }",
        "catch-param" => "try { null; } catch (p) { p.x = 1; }",
        "CONTROL-write" => "p.x = 1;",
        _ => "const q = p;",
    }
}

fn shadow_counts(mode: &str, form: &str) -> (usize, usize) {
    let body = shadow_body(form);
    let src = if mode == "legacy" {
        format!("<script>\n\texport let p;\n\tlet list = [];\n\t{body}\n</script>\n{{p}}{{list}}")
    } else {
        format!(
            "<script>\n\tlet {{ p }} = $props();\n\tlet list = $state([]);\n\t{body}\n</script>\n{{p}}{{list}}"
        )
    };
    let code = compile(
        &src,
        CompileOptions {
            filename: Some("P.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    (
        code.matches("create_ownership_validator").count(),
        code.matches("$$ownership_validator.mutation(").count(),
    )
}

#[test]
fn a_shadowed_prop_name_declares_no_validator() {
    let mut failures = Vec::new();
    for (mode, form, decl, wrap) in SHADOW_CELLS {
        let (got_decl, got_wrap) = shadow_counts(mode, form);
        if got_decl != *decl || got_wrap != *wrap {
            failures.push(format!(
                "{mode}/{form}: official decl={decl} wrap={wrap}, rsvelte decl={got_decl} wrap={got_wrap}"
            ));
        }
    }
    assert!(failures.is_empty(), "\n{}", failures.join("\n"));
}
