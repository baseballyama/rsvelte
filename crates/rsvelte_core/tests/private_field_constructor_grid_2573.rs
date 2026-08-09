//! The private-class-field grid: rune kind × receiver × position × operator.
//!
//! Two things no other suite here does.
//!
//! 1. **Every cell's output is fed to a parser.** Every ratchet in this repo
//!    scores match/mismatch, and a mismatch cannot distinguish "wrong text"
//!    from "text that is not JavaScript". #2467 (`$.get(inst.#n) ??= s`) and
//!    #2573 (`$.get(this.#d)++`) were both the latter: a CallExpression in
//!    assignment position, which acorn, `oxc_parser` and Rolldown all reject.
//! 2. **The cells the generated matrix cannot carry.** `matrix/axes.mjs`'s
//!    `private-field` family compares rsvelte's bytes against the official
//!    compiler's, so it has to omit `++`/`--` through a non-`this` receiver —
//!    a recorded deliberate divergence (`compatibility/deliberate-divergences.md`).
//!    Those cells are pinned here instead, on rsvelte's own form.
//!
//! The grid is duplicated in `scripts/compat-corpus/matrix/axes.mjs` rather than
//! shared: that one needs the official compiler to say what the bytes should be,
//! this one needs neither a submodule nor a NAPI build.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

const KINDS: &[(&str, &str)] = &[
    ("state", "$state(0)"),
    ("state-raw", "$state.raw({})"),
    ("derived", "$derived(this.#s * 2)"),
    ("derived-by", "$derived.by(() => this.#s * 2)"),
];

const RECEIVERS: &[(&str, &str)] = &[("this", "this.#f"), ("alias", "inst.#f"), ("param", "o.#f")];

const POSITIONS: &[(&str, &str)] = &[
    (
        "ctor-root",
        "\tconstructor(o) {\n\t\tconst inst = this;\n\t\t%s\n\t}",
    ),
    (
        "ctor-block",
        "\tconstructor(o) {\n\t\tconst inst = this;\n\t\tif (o) {\n\t\t\t%s\n\t\t}\n\t}",
    ),
    (
        "ctor-nested-fn",
        "\tconstructor(o) {\n\t\tconst inst = this;\n\t\tsetTimeout(() => {\n\t\t\t%s\n\t\t});\n\t}",
    ),
    ("method", "\tm(o) {\n\t\tconst inst = this;\n\t\t%s\n\t}"),
];

const OPERATORS: &[(&str, &str)] = &[
    ("assign-object", "%r = { a: 1 };"),
    ("assign-primitive", "%r = 5;"),
    ("add-assign", "%r += 1;"),
    ("sub-assign", "%r -= 1;"),
    ("div-assign", "%r /= 2;"),
    ("exp-assign", "%r **= 2;"),
    ("and-assign", "%r &= 5;"),
    ("ushr-assign", "%r >>>= 5;"),
    ("logical-or-assign", "%r ||= 5;"),
    ("logical-and-assign", "%r &&= 5;"),
    ("nullish-assign", "%r ??= 5;"),
    ("read-call", "log(%r);"),
    ("read-declaration", "const a = %r;"),
    ("read-member", "const b = %r.foo;"),
    ("read-optional", "const c = %r?.bar;"),
];

/// `%r` is the receiver expression; each entry is (name, statement, expected
/// helper call for the field `#f`).
const UPDATE_OPERATORS: &[(&str, &str, &str)] = &[
    ("post-increment", "%r++;", "$.update(%r);"),
    ("post-decrement", "%r--;", "$.update(%r, -1);"),
    ("pre-increment", "++%r;", "$.update_pre(%r);"),
    ("pre-decrement", "--%r;", "$.update_pre(%r, -1);"),
];

fn source(field: &str, position: &str, statement: &str, receiver: &str) -> String {
    let body = position.replace("%s", &statement.replace("%r", receiver));
    format!("export class R {{\n\t#s = $state(1);\n\t#f = {field};\n\n{body}\n}}\n")
}

fn compile(src: &str, generate: GenerateMode, dev: bool) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("A.svelte.js".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compile_module should succeed")
    .js
    .code
}

const TARGETS: &[(&str, GenerateMode, bool)] = &[
    ("client", GenerateMode::Client, false),
    ("client-dev", GenerateMode::Client, true),
    ("server", GenerateMode::Server, false),
];

/// Walks every cell and calls `check` with `(kind, receiver, position,
/// operator, target, output)`.
fn for_every_cell(mut check: impl FnMut(&str, &str, &str, &str, &str, &str)) {
    let mut cells = 0usize;
    for (kind_name, field) in KINDS {
        for (receiver_name, receiver) in RECEIVERS {
            for (position_name, position) in POSITIONS {
                for (operator_name, statement) in OPERATORS
                    .iter()
                    .map(|(n, s)| (n, s))
                    .chain(UPDATE_OPERATORS.iter().map(|(n, s, _)| (n, s)))
                {
                    let src = source(field, position, statement, receiver);
                    for (target, generate, dev) in TARGETS {
                        check(
                            kind_name,
                            receiver_name,
                            position_name,
                            operator_name,
                            target,
                            &compile(&src, *generate, *dev),
                        );
                    }
                    cells += 1;
                }
            }
        }
    }
    // A grid that silently stopped expanding would satisfy every assertion in
    // this file.
    assert_eq!(cells, 4 * 3 * 4 * 19, "the grid stopped expanding");
}

/// The cells where rsvelte reproduces upstream's own invalid server output. A
/// private `$derived` field is a callable there, and upstream wraps the write
/// target instead of unwrapping it: `this.#f()++`, `inst.#f() += 1`. rsvelte
/// follows rather than inventing a form upstream never emits — the client
/// analogue of that decision is #2483.
///
/// A plain `=` through a non-`this` receiver is deliberately NOT in the set:
/// upstream emits `inst.#f() = v`, which does not parse, and rsvelte leaves the
/// assignment alone, which does.
fn reproduces_upstreams_invalid_server_output(
    kind: &str,
    receiver: &str,
    operator: &str,
    target: &str,
) -> bool {
    if target != "server" || !kind.starts_with("derived") {
        return false;
    }
    if UPDATE_OPERATORS.iter().any(|(n, _, _)| *n == operator) {
        return true;
    }
    let is_compound = !operator.starts_with("read-") && !operator.starts_with("assign-");
    is_compound && receiver != "this"
}

#[test]
fn every_cell_emits_javascript() {
    // Without a positive control the parse assertion below could be vacuous —
    // a canonicalizer that accepted anything would pass the whole grid.
    assert!(
        rsvelte_ast_equiv::canonicalize("$.get(o.#n)++;").is_err(),
        "the oracle must reject a call expression in assignment position"
    );

    let mut unexpected = Vec::new();
    let mut closed = Vec::new();
    for_every_cell(|kind, receiver, position, operator, target, out| {
        let parses = rsvelte_ast_equiv::canonicalize(out).is_ok();
        let id = format!("{kind}__{receiver}__{position}__{operator} ({target})");
        match reproduces_upstreams_invalid_server_output(kind, receiver, operator, target) {
            false if !parses => unexpected.push(id),
            true if parses => closed.push(id),
            _ => {}
        }
    });
    assert!(
        unexpected.is_empty(),
        "{} cell(s) emitted output no parser accepts:\n  {}",
        unexpected.len(),
        unexpected.join("\n  ")
    );
    // Two-sided: the recorded set shrinking is the good news that has to be
    // written down, not absorbed.
    assert!(
        closed.is_empty(),
        "{} cell(s) now parse that the record says do not — update \
         `reproduces_upstreams_invalid_server_output`, `matrix/generate.mjs` and \
         compatibility/deliberate-divergences.md:\n  {}",
        closed.len(),
        closed.join("\n  ")
    );
}

#[test]
fn a_derived_field_written_through_this_is_a_setter_call_on_the_server() {
    // A private `$derived` field holds a callable on the server. Before the
    // fix the read-wrapping pass classified the operator by the byte after
    // `this.#f`, saw `+` rather than `=`, and wrapped the assignment TARGET:
    // `this.#f() += 1`, which is not JavaScript. A plain `=` outside a
    // constructor was the quiet half — it parsed, and overwrote the callable.
    for field in ["$derived(this.#s * 2)", "$derived.by(() => this.#s * 2)"] {
        for position in POSITIONS {
            let out = compile(
                &source(field, position.1, "%r += 1;", "this.#f"),
                GenerateMode::Server,
                false,
            );
            assert!(
                out.contains("this.#f(this.#f() + 1);"),
                "{}: expected a setter call in:\n{out}",
                position.0
            );
            let out = compile(
                &source(field, position.1, "%r = 5;", "this.#f"),
                GenerateMode::Server,
                false,
            );
            assert!(
                out.contains("this.#f(5);"),
                "{}: expected a setter call in:\n{out}",
                position.0
            );
        }
    }
}

#[test]
fn an_update_through_a_non_this_receiver_uses_the_helper() {
    // The cells `matrix/axes.mjs` omits: upstream lowers these to `.v++` at a
    // constructor root and to the unparseable `$.get(o.#n)++` everywhere else,
    // and rsvelte deliberately emits the helper for all of them.
    for (kind_name, field) in KINDS {
        for (receiver_name, receiver) in RECEIVERS.iter().filter(|(n, _)| *n != "this") {
            for (position_name, position) in POSITIONS {
                for (operator_name, statement, expected) in UPDATE_OPERATORS {
                    let src = source(field, position, statement, receiver);
                    let out = compile(&src, GenerateMode::Client, false);
                    let needle = expected.replace("%r", receiver);
                    assert!(
                        out.contains(&needle),
                        "{kind_name}__{receiver_name}__{position_name}__{operator_name}: \
                         expected `{needle}` in:\n{out}"
                    );
                }
            }
        }
    }
}

#[test]
fn a_derived_field_written_at_a_constructor_root_matches_official() {
    // #2573's own table, verbatim from `submodules/svelte` 5.56.8. Every row
    // reads through `$.get` — the `.v` shortcut is `$state` / `$state.raw` only
    // — and none carries the `, true` proxy flag.
    for field in ["$derived(this.#a * 2)", "$derived.by(() => this.#a * 2)"] {
        let out = compile(
            &format!(
                "export class R {{\n\t#a = $state(1);\n\t#d = {field};\n\n\tconstructor() {{\n\t\t\
                 this.#d++;\n\t\tthis.#d--;\n\t\t++this.#d;\n\t\t--this.#d;\n\t\tthis.#d &= 5;\n\t\t\
                 this.#d >>>= 5;\n\t\tthis.#d ??= 5;\n\t\tthis.#d ||= 5;\n\t\tthis.#d = 3;\n\t\t\
                 log(this.#d);\n\t}}\n}}\n"
            ),
            GenerateMode::Client,
            false,
        );
        for needle in [
            "$.update(this.#d);",
            "$.update(this.#d, -1);",
            "$.update_pre(this.#d);",
            "$.update_pre(this.#d, -1);",
            "$.set(this.#d, $.get(this.#d) & 5);",
            "$.set(this.#d, $.get(this.#d) >>> 5);",
            "$.set(this.#d, $.get(this.#d) ?? 5);",
            "$.set(this.#d, $.get(this.#d) || 5);",
            "$.set(this.#d, 3);",
            "log($.get(this.#d));",
        ] {
            assert!(out.contains(needle), "expected `{needle}` in:\n{out}");
        }
        assert!(
            !out.contains("$.get(this.#d).v"),
            "`.v` off a call result is always undefined:\n{out}"
        );
        assert!(
            !out.contains(", true)"),
            "a `$derived` field never proxies:\n{out}"
        );
    }
}

#[test]
fn a_state_field_read_at_a_constructor_root_takes_upstreams_shortcut() {
    // The control for #2629, answered in `compatibility/deliberate-divergences.md`:
    // reads follow upstream for every receiver, so a fix that widened the update
    // divergence to reads would fail here.
    let out = compile(
        "export class R {\n\t#n = $state(0);\n\t#r = $state.raw({});\n\t#d = $derived(this.#n * 2);\
         \n\n\tconstructor(o) {\n\t\tconst inst = this;\n\t\tlog(this.#n);\n\t\tlog(inst.#n);\n\t\t\
         log(o.#r);\n\t\tlog(o.#d);\n\t}\n}\n",
        GenerateMode::Client,
        false,
    );
    for needle in [
        "log(this.#n.v);",
        "log(inst.#n.v);",
        "log(o.#r.v);",
        "log($.get(o.#d));",
    ] {
        assert!(out.contains(needle), "expected `{needle}` in:\n{out}");
    }
}
