//! JavaScript early errors — syntactically shaped but illegal (#3243, #3217).
//!
//! Every shape here compiled, and in every case rsvelte's output was text no JS
//! parser accepts: the illegal construct was copied through verbatim. None is
//! decidable from the token stream, which is why OXC settles them in
//! `SemanticBuilder` and rsvelte — running only `Parser` — saw nothing.
//!
//! Two things this file has to establish that "the shape is rejected" does not:
//!
//!   * **one repro per allow-list entry, each failing on its own.** The table in
//!     `1_parse/read/early_errors.rs` keys on a substring of OXC's message, and
//!     an OXC bump that rewords one message makes that entry silently stop
//!     matching — the symptom is a check disappearing, not a wrong answer. A
//!     single "all eight are rejected" assertion cannot see that, because the
//!     other entries still count. `EARLY_ERRORS` is walked one row at a time and
//!     names the row it is on.
//!   * **the message and the position**, because acorn and OXC disagree about
//!     both: OXC labels the DECLARING occurrence of a redeclaration and acorn
//!     stops at the REDECLARING one, and OXC labels a jump's target where acorn
//!     stops at the `break` / `continue` keyword. A code-only assertion passes
//!     while every offset is wrong.
//!
//! Every expectation was measured with `svelte.compile` / `svelte.compileModule`
//! against `submodules/svelte`.

use rsvelte_core::{
    CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module, compiler::CssMode,
};

fn component(src: &str) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
}

fn module(src: &str) -> Result<String, String> {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".to_string()),
            generate: GenerateMode::Server,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .map_err(|e| format!("{e:?}"))
}

/// `|` marks the offset acorn stops at. The three entry points wrap the same
/// body, so one marker serves all of them.
struct Row {
    /// The allow-list entry this row exists to keep alive.
    entry: &'static str,
    body: &'static str,
    message: &'static str,
}

const EARLY_ERRORS: &[Row] = &[
    Row {
        entry: "Multiple constructor implementations",
        body: "class K { constructor() {} |constructor() {} }",
        message: "Duplicate constructor in the same class",
    },
    Row {
        entry: "Super calls are not permitted",
        body: "function f() { |super(); }",
        message: "'super' keyword outside a method",
    },
    Row {
        entry: "'super' can only be referenced",
        body: "function f() { |super.x; }",
        message: "'super' keyword outside a method",
    },
    Row {
        entry: "Illegal break statement",
        body: "function f() { |break; }",
        message: "Unsyntactic break",
    },
    Row {
        entry: "Illegal continue statement",
        body: "function f() { |continue; }",
        message: "Unsyntactic continue",
    },
    Row {
        entry: "Jump target cannot cross function boundary (break)",
        body: "function f() { |break nope; }",
        message: "Unsyntactic break",
    },
    Row {
        entry: "Jump target cannot cross function boundary (continue)",
        body: "function f() { |continue nope; }",
        message: "Unsyntactic continue",
    },
    Row {
        entry: "Label `x` has already been declared",
        body: "function f() { a: |a: for (;;) break a; }",
        message: "Label 'a' is already declared",
    },
    Row {
        entry: "must be declared in an enclosing class",
        body: "class K { m() { return this.|#nope; } }",
        message: "Private field '#nope' must be declared in an enclosing class",
    },
    Row {
        entry: "has already been declared (private name)",
        body: "class K { #a = 1; |#a = 2; }",
        message: "Identifier '#a' has already been declared",
    },
    Row {
        entry: "has already been declared (function/function)",
        body: "function f(){} function |f(){}",
        message: "Identifier 'f' has already been declared",
    },
    Row {
        entry: "has already been declared (function/let)",
        body: "function f(){} let |f = 1;",
        message: "Identifier 'f' has already been declared",
    },
    Row {
        entry: "has already been declared (let/let)",
        body: "let x = 1; let |x = 2;",
        message: "Identifier 'x' has already been declared",
    },
    Row {
        entry: "import declaration outside the top level",
        body: "function f() { |import './x.js'; }",
        message: "'import' and 'export' may only appear at the top level",
    },
    Row {
        entry: "export declaration outside the top level",
        body: "function f() { |export const a = 1; }",
        message: "'import' and 'export' may only appear at the top level",
    },
    Row {
        entry: "'use strict' with a non-simple parameter list (declaration)",
        body: "|function f(a = 1) { 'use strict'; }",
        message: "Illegal 'use strict' directive in function with non-simple parameter list",
    },
    Row {
        entry: "'use strict' with a non-simple parameter list (arrow)",
        body: "const g = |(a = 1) => { 'use strict'; };",
        message: "Illegal 'use strict' directive in function with non-simple parameter list",
    },
    Row {
        entry: "'use strict' with a non-simple parameter list (method)",
        body: "class K { m|(a = 1) { 'use strict'; } }",
        message: "Illegal 'use strict' directive in function with non-simple parameter list",
    },
    Row {
        entry: "'super' can only be referenced in a derived class",
        body: "class K { constructor() { |super(); } }",
        message: "super() call outside constructor of a subclass",
    },
    Row {
        entry: "The operand of a 'delete' operator cannot be a private identifier",
        body: "class K { #a = 1; m() { |delete this.#a; } }",
        message: "Private fields can not be deleted",
    },
];

fn instance(body: &str) -> String {
    format!("<script>\n\t{body}\n</script>\n\n<p>ok</p>\n")
}

fn svelte_js(body: &str) -> String {
    format!("{body}\n")
}

/// Each row on its own, on each entry point, asserted on code + message +
/// position. A row that stops firing fails here and names its table entry.
#[test]
fn every_early_error_is_rejected_where_acorn_rejects_it() {
    for row in EARLY_ERRORS {
        let body = row.body.replace('|', "");
        for (host, wrap, run) in [
            (
                "instance-script",
                instance as fn(&str) -> String,
                component as fn(&str) -> Result<String, String>,
            ),
            ("svelte-js", svelte_js as fn(&str) -> String, module as _),
        ] {
            let at = wrap(row.body)
                .find('|')
                .expect("the marker survives wrapping");
            let err = match run(&wrap(&body)) {
                Err(err) => err,
                Ok(code) => panic!(
                    "[{}] {body:?} must not compile in {host}; emitted:\n{code}",
                    row.entry
                ),
            };
            assert!(
                err.contains("js_parse_error"),
                "[{}] expected js_parse_error in {host}, got: {err}",
                row.entry
            );
            assert!(
                err.contains(row.message),
                "[{}] expected acorn's wording in {host}, got: {err}",
                row.entry
            );
            assert!(
                err.contains(&format!("span: ({at}, {at})")),
                "[{}] expected the error at {at} in {host}, got: {err}",
                row.entry
            );
        }
    }
}

/// The over-rejection direction. Each of these is the nearest legal neighbour of
/// a row above — the same construct in the context that makes it legal.
const LEGAL: &[&str] = &[
    "class K { constructor() {} m() {} }",
    "class A extends B { constructor() { super(); } }",
    "class A { m() { return super.x; } }",
    "const o = { m() { return super.x; } };",
    "for (;;) { break; }",
    "while (1) { continue; }",
    "switch (1) { case 1: break; }",
    "a: for (;;) break a;",
    "a: { break a; }",
    "a: for (;;) continue a;",
    "class K { #a = 1; m() { return this.#a; } }",
    "class K { #a = 1; } class L { #a = 2; }",
    "var a = 1; var a = 2;",
    "let a = 1; { let a = 2; }",
    "function f(a) { let b = a; }",
    "try {} catch (e) { let e2 = 1; }",
    "function f() { let a; } let a;",
    "export const a = 1;",
    // A 'use strict' directive is only illegal when the parameter list is not
    // simple AND the directive is in the prologue — both halves, both directions.
    "function f(a) { 'use strict'; }",
    "function f() { 'use strict'; }",
    "const g = (a = 1) => 1;",
    "function f(a = 1) { const x = 1; 'use strict'; }",
    "class K { #a = 1; m() { return delete this.a; } }",
];

#[test]
fn the_legal_neighbour_of_every_early_error_still_compiles() {
    for body in LEGAL {
        assert!(
            module(&svelte_js(body)).is_ok(),
            "{body:?} must compile as a module"
        );
        // `export` is only legal in the module script of a component.
        if !body.starts_with("export") {
            assert!(
                component(&instance(body)).is_ok(),
                "{body:?} must compile in an instance script"
            );
        }
    }
}

/// The reason the class is worth its own gate: the accepted output was not
/// JavaScript. "Differs from official" and "is not JavaScript" are two
/// questions, and no ratchet here can tell them apart.
///
/// **The oracle has to be chosen, not assumed.** The first version of this test
/// ran `oxc_parser` on the output and was satisfied by every row — including
/// with the whole check ablated — because `oxc_parser` is exactly the parser
/// that defers this class to `SemanticBuilder`. An oracle built from the
/// component that is blind to a defect measures nothing about it. Running the
/// real oracle instead — acorn, on the outputs this tree emitted with the check
/// ablated — rejects **24 of the 25** compiled cells:
///
/// | cell | acorn on the emitted output |
/// |---|---|
/// | every row except the one below, both entry points | `Unsyntactic break`, `Duplicate constructor in the same class`, `'super' keyword outside a method`, … |
/// | `function f(){} function f(){}` in an INSTANCE script | **parses** |
///
/// That single exception is not a gap in the oracle, it is JavaScript: the
/// instance script's statements are emitted inside the component function, and
/// two `function f(){}` declarations in one function body are legal. The same
/// input as a `.svelte.js` module puts them at the top level, where acorn
/// rejects it. So the output oracle is blind to exactly one of 25 cells, and
/// `every_early_error_is_rejected_where_acorn_rejects_it` is what covers it.
///
/// There are three ways a row is invisible here, and only the first is a fact
/// about JavaScript. The second is another check firing first — the five cells
/// the analyze phase rejected pre-fix emitted no output to inspect. The third
/// was not predicted: with the `'use strict'` entry ablated,
/// `function f(a = 1) { 'use strict'; }` compiles and rsvelte emits
/// `function f(a = 1) {}` — the directive is DROPPED, so the output is legal
/// JavaScript that silently does not run in strict mode. rsvelte deleting the
/// evidence is not something a parse oracle can ever see.
///
/// In-process this uses `Parser` + `SemanticBuilder`, which reproduces acorn's
/// verdict for this class. That shares a mechanism with the fix, so it is a
/// weaker control than the acorn run above and is recorded as such.
#[test]
fn no_accepted_script_emits_unparseable_output() {
    for row in EARLY_ERRORS {
        let body = row.body.replace('|', "");
        for (host, src) in [
            ("instance-script", instance(&body)),
            ("svelte-js", svelte_js(&body)),
        ] {
            let emitted = if host == "svelte-js" {
                module(&src)
            } else {
                component(&src)
            };
            let Ok(code) = emitted else { continue };
            let allocator = oxc_allocator::Allocator::default();
            let parsed =
                oxc_parser::Parser::new(&allocator, &code, oxc_span::SourceType::mjs()).parse();
            let semantic = oxc_semantic::SemanticBuilder::new_compiler().build(&parsed.program);
            assert!(
                parsed.diagnostics.is_empty() && semantic.diagnostics.is_empty(),
                "[{}] {host} accepted {body:?} and emitted text that is not JavaScript: {:?} {:?}\n{code}",
                row.entry,
                parsed.diagnostics,
                semantic.diagnostics,
            );
        }
    }
}

/// A TypeScript overload set is the shape the analyze-phase exemption exists
/// for, and it must survive the parse-phase check: acorn-typescript rejects a
/// duplicate function *implementation* but accepts a signature set.
#[test]
fn typescript_declaration_merging_still_compiles() {
    for body in [
        "function f(a: number): void;\nfunction f(a: string): void;\nfunction f(a: any): void {}",
        "interface I { a: number }\ninterface I { b: number }",
        "class K {\n\tconstructor(a: number);\n\tconstructor(a: any) {}\n}",
        "declare function g(a: number): void;\nfunction g(a: any) {}",
        "class C {}\ninterface C { a: number }",
        // An overload signature repeats the member's name without defining it,
        // so it must not read as a second constructor or a private-name clash.
        "class K { #m(a: string): void; #m(a: any) {} }",
        "class K { m(a: string): void; m(a: any) {} }",
    ] {
        let src = format!("<script lang=\"ts\">\n{body}\n</script>\n\n<p>ok</p>\n");
        assert!(
            component(&src).is_ok(),
            "{body:?} must compile in a lang=\"ts\" script"
        );
    }
}

/// The classes that survive into a TypeScript script, with acorn-typescript's
/// own wording for a duplicate type alias.
#[test]
fn early_errors_reach_a_typescript_script_too() {
    for (body, message) in [
        (
            "let x = 1;\nlet x = 2;",
            "Identifier 'x' has already been declared",
        ),
        (
            "class K { constructor() {} constructor() {} }",
            "Duplicate constructor in the same class",
        ),
        (
            "function f() { super(); }",
            "'super' keyword outside a method",
        ),
        ("function f() { continue; }", "Unsyntactic continue"),
        (
            "class K { m() { return this.#nope; } }",
            "Private field '#nope' must be declared in an enclosing class",
        ),
        (
            "type T = number;\ntype T = string;",
            "type 'T' has already been declared.",
        ),
    ] {
        let src = format!("<script lang=\"ts\">\n{body}\n</script>\n\n<p>ok</p>\n");
        let err = component(&src).expect_err("must not compile");
        assert!(
            err.contains("js_parse_error") && err.contains(message),
            "expected {message:?} for {body:?}, got: {err}"
        );
    }
}

/// The analyze-phase `declaration_duplicate` is what upstream uses for a
/// TEMPLATE declaration and for a collision ACROSS the two scripts — acorn
/// parses each script separately, so it never sees the second. Raising the
/// parse-phase error must not have taken those over.
#[test]
fn the_analyze_phase_duplicate_check_is_still_reachable() {
    let across_scripts = "<script module>\n\timport { FOO } from './dummy.svelte';\n</script>\n\n<script>\n\tlet FOO;\n</script>\n\n<p>{FOO}</p>\n";
    let err = component(across_scripts).expect_err("a cross-script collision is still an error");
    assert!(
        err.contains("declaration_duplicate"),
        "expected the analyze-phase check across scripts, got: {err}"
    );

    let const_tag = "<script>\n\tlet items = [1];\n</script>\n\n{#each items as item}{@const a = item}{@const a = item}{/each}\n";
    let err = component(const_tag).expect_err("a duplicate {@const} is still an error");
    assert!(
        err.contains("declaration_duplicate"),
        "expected the analyze-phase check for a template declaration, got: {err}"
    );
}

/// A statement inside a `namespace` is not at the top level of a module, so a
/// naive top-level `import` / `export` check fires there and REPLACES the
/// diagnostic upstream gives. It must stay `typescript_invalid_feature`.
#[test]
fn a_namespace_still_answers_typescript_invalid_feature() {
    let src =
        "<script lang=\"ts\">\n\tnamespace N { export const a = 1; }\n</script>\n\n<p>ok</p>\n";
    let err = component(src).expect_err("a namespace with a value member is rejected");
    assert!(
        err.contains("typescript_invalid_feature"),
        "the parse-phase check must not take this over, got: {err}"
    );
}
