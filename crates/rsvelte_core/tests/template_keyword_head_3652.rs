//! Regression tests for #3652 — `import.meta.url` in a template expression was
//! parsed as an ordinary member chain headed by an identifier named `import`.
//!
//! The template-expression fast path in `1_parse/read/expression.rs` scans an
//! identifier and then dots, so it built
//! `MemberExpression(MemberExpression(Identifier "import", meta), url)`. Every
//! downstream "is this pure" port then answered from the leftmost node: an
//! unbound identifier is a global and globals are assumed safe, so the read was
//! static. Official parses a `MetaProperty`, which is none of the shapes
//! `is_pure` accepts — hence `has_state`, `$.template_effect`, and (through
//! `is_safe_identifier`) `needs_context` with its `$.push` / `$.pop` pair.
//!
//! The axis is the LEADING TOKEN, not `import.meta`. `new.target` is the other
//! keyword the same scan spells as an identifier, and there rsvelte was
//! *accepting a program official rejects* — an over-acceptance no output
//! comparison of accepted programs could see.
//!
//! Every expectation is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn code(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// A member access on `import.meta` is dynamic on both targets.
#[test]
fn a_member_of_import_meta_is_dynamic() {
    const CASES: [(&str, &str, &str); 3] = [
        (
            "{import.meta.url}\n",
            "$.template_effect(() => $.set_text(text, import.meta.url));",
            "$$renderer.push(`<!---->${$.escape(import.meta.url)}`);",
        ),
        (
            "{import.meta.env.MODE}\n",
            "$.template_effect(() => $.set_text(text, import.meta.env.MODE));",
            "$$renderer.push(`<!---->${$.escape(import.meta.env.MODE)}`);",
        ),
        (
            "{true ? import.meta.url : ''}\n",
            "$.template_effect(() => $.set_text(text, true ? import.meta.url : ''));",
            "$$renderer.push(`<!---->${$.escape(true ? import.meta.url : '')}`);",
        ),
    ];
    for (src, client_line, server_line) in CASES {
        let client = code(src, GenerateMode::Client);
        assert!(client.contains(client_line), "{src:?} in:\n{client}");
        let server = code(src, GenerateMode::Server);
        assert!(server.contains(server_line), "{src:?} in:\n{server}");
    }
}

/// `is_safe_identifier` is the other half: a non-Identifier base is never safe,
/// so the component needs context. The client pushes props and the server wraps
/// the body in `$$renderer.component`.
#[test]
fn a_member_of_import_meta_needs_context() {
    let client = code("{import.meta.url}\n", GenerateMode::Client);
    for expected in [
        "export default function X($$anchor, $$props) {",
        "$.push($$props, false);",
        "$.init();",
        "$.pop();",
    ] {
        assert!(client.contains(expected), "{expected}\nin:\n{client}");
    }
    let server = code("{import.meta.url}\n", GenerateMode::Server);
    assert!(
        server.contains("export default function X($$renderer, $$props) {")
            && server.contains("$$renderer.component(($$renderer) => {"),
        "in:\n{server}"
    );
}

/// `import.meta` on its own is NOT a member expression, so it stays static —
/// and it is the row that made the defect invisible, because the old parse
/// reached the same verdict here by a different route.
#[test]
fn bare_import_meta_stays_static() {
    let client = code("{import.meta}\n", GenerateMode::Client);
    assert!(
        client.contains("text.nodeValue = import.meta;"),
        "in:\n{client}"
    );
    assert!(!client.contains("$.push($$props"), "in:\n{client}");
    let server = code("{import.meta}\n", GenerateMode::Server);
    assert!(
        server.contains("$$renderer.push(`<!---->${$.escape(import.meta)}`);"),
        "in:\n{server}"
    );
}

/// The control that names the cause: an ordinary member access on an unbound
/// name is pure in both compilers, so it must stay static. A fix that made
/// every member chain dynamic would move this row.
#[test]
fn an_unbound_member_chain_stays_static() {
    let client = code("{zzz.url}\n", GenerateMode::Client);
    assert!(
        client.contains("text.nodeValue = zzz.url;"),
        "in:\n{client}"
    );
    assert!(!client.contains("$.push($$props"), "in:\n{client}");
}

/// `new.target` is illegal outside a function, and official rejects it. rsvelte
/// spelled it as `new` + `.target` and compiled it.
#[test]
fn new_target_in_a_template_is_rejected() {
    let err = compile(
        "{new.target}\n",
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect_err("must be rejected");
    assert!(
        format!("{err:?}").contains("js_parse_error"),
        "unexpected error: {err:?}"
    );
}

/// `new.target` was two words of a closed domain. Every reserved word the fast
/// path would spell as an identifier is the same over-acceptance.
///
/// `await` and `super` are absent for a reason that is not this defect: the
/// real parser accepts them too, so handing the expression over does not reject
/// them. That residual is #3694, and it lives in `acorn_only_violation`.
#[test]
fn every_reserved_word_head_is_rejected() {
    const WORDS: [&str; 30] = [
        "break",
        "case",
        "catch",
        "class",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "export",
        "extends",
        "finally",
        "for",
        "function",
        "if",
        "in",
        "instanceof",
        "return",
        "switch",
        "throw",
        "try",
        "typeof",
        "void",
        "while",
        "with",
        "yield",
        "let",
        "static",
    ];
    for word in WORDS {
        for src in [format!("{{{word}}}\n"), format!("{{{word}.x}}\n")] {
            let err = compile(
                &src,
                CompileOptions {
                    filename: Some("X.svelte".to_string()),
                    generate: GenerateMode::Client,
                    ..Default::default()
                },
            )
            .expect_err("must be rejected");
            assert!(
                format!("{err:?}").contains("js_parse_error"),
                "{src:?}: {err:?}"
            );
        }
    }
}

/// `this` is the same shape one node type over: the fast path built an
/// `Identifier` named `this`, so the base was an unbound global and the read
/// came out static. Official parses a `ThisExpression`, which no `is_pure` port
/// accepts.
#[test]
fn a_member_of_this_is_dynamic_and_needs_context() {
    let client = code("{this.x}\n", GenerateMode::Client);
    assert!(
        client.contains("$.template_effect(() => $.set_text(text, this.x));"),
        "in:\n{client}"
    );
    assert!(client.contains("$.push($$props, false);"), "in:\n{client}");
    let server = code("{this.x}\n", GenerateMode::Server);
    assert!(
        server.contains("$$renderer.component(($$renderer) => {")
            && server.contains("$$renderer.push(`<!---->${$.escape(this.x)}`);"),
        "in:\n{server}"
    );
}

/// The other half of handing these to the real parser: `ImportExpression`,
/// `MetaProperty` and `ThisExpression` are node types the client's reactivity
/// walk had never seen, and its fallback calls an unknown node reactive.
/// Upstream has no visitor for any of them, so all three are static.
#[test]
fn a_leaf_keyword_node_stays_static() {
    const CASES: [(&str, &str); 2] = [
        ("{import(\"./x\")}\n", "text.nodeValue = import(\"./x\");"),
        ("{this}\n", "text.nodeValue = this;"),
    ];
    for (src, expected) in CASES {
        let client = code(src, GenerateMode::Client);
        assert!(client.contains(expected), "{src:?} in:\n{client}");
        assert!(
            !client.contains("$.template_effect"),
            "{src:?} in:\n{client}"
        );
    }
}

/// A keyword is legal as a PROPERTY name, and the gate bails on the whole
/// expression rather than on the head — so `obj.class` must still compile.
/// `props.class` is ordinary Svelte.
#[test]
fn a_keyword_in_property_position_still_compiles() {
    let client = code(
        "<script>const obj = { class: 3 };</script>{obj.class}\n",
        GenerateMode::Client,
    );
    assert!(
        client.contains("$.template_effect(() => $.set_text(text, obj.class));"),
        "in:\n{client}"
    );
}

/// The literals the fast path builds are not reserved words and must not be
/// handed off: `{undefined}` still folds to the empty string.
#[test]
fn the_literal_fast_path_is_unchanged() {
    let client = code("{undefined}\n", GenerateMode::Client);
    assert!(client.contains("text.nodeValue = '';"), "in:\n{client}");
}

/// The script path was already right, and stays right: the same expression in a
/// `<script>` goes through the oxc converter, not the template fast path.
#[test]
fn the_script_path_is_unchanged() {
    let client = code(
        "<script>const u = import.meta.url;</script>{u}\n",
        GenerateMode::Client,
    );
    assert!(
        client.contains("const u = import.meta.url;"),
        "in:\n{client}"
    );
}
