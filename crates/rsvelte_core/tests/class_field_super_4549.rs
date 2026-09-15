//! `super` was rejected wherever acorn's `SCOPE_SUPER` is entered by something
//! other than a method: a class field initializer, a class static block, and an
//! object literal getter/setter (#4549, reported against `compileModule` and
//! `compile` alike).
//!
//! `expression.rs`'s `Scan` is the site — OXC's `SemanticBuilder` reports
//! nothing for any of these, so the allow-list in `early_errors.rs` was never
//! involved. The rows below are enumerated from acorn 8.18.0's own list of the
//! places that enter the scope (`parseMethod`, `parseClassField` — the
//! initializer only — and `parseClassStaticBlock`) rather than from the shapes
//! the report happened to carry, and every expected value is official Svelte
//! 5.57.0's answer for the same source.

use rsvelte_core::{CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module};

const BASE: &str = "class B { load(){} constructor(){} }\n";

/// `None` = accepted; `Some(message)` = the `js_parse_error` official raises.
struct Row {
    what: &'static str,
    body: String,
    expected: Option<&'static str>,
}

const OUTSIDE_METHOD: &str = "'super' keyword outside a method";
const OUTSIDE_CTOR: &str = "super() call outside constructor of a subclass";

fn rows() -> Vec<Row> {
    let row = |what: &'static str, body: String, expected: Option<&'static str>| Row {
        what,
        body,
        expected,
    };
    vec![
        // Entered the scope before this change and must still.
        row(
            "class method",
            format!("{BASE}class C extends B {{ m(){{ super.load(); }} }}"),
            None,
        ),
        row(
            "derived ctor super()",
            format!("{BASE}class C extends B {{ constructor(){{ super(); }} }}"),
            None,
        ),
        row(
            "arrow in derived ctor super()",
            format!("{BASE}class C extends B {{ constructor(){{ (() => {{ super(); }})(); }} }}"),
            None,
        ),
        row(
            "object literal method",
            "const o = { m(){ super.toString(); } };".into(),
            None,
        ),
        // Newly entered.
        row(
            "field initializer, arrow",
            format!("{BASE}class C extends B {{ f = () => super.load(); }}"),
            None,
        ),
        row(
            "field initializer, no arrow",
            format!("{BASE}class C extends B {{ f = super.load; }}"),
            None,
        ),
        row(
            "static field initializer",
            format!("{BASE}class C extends B {{ static f = () => super.load(); }}"),
            None,
        ),
        row(
            "static block",
            format!("{BASE}class C extends B {{ static {{ super.load(); }} }}"),
            None,
        ),
        row(
            "object literal getter",
            "const o = { get m(){ return super.toString(); } };".into(),
            None,
        ),
        row(
            "object literal setter",
            "const o = { set m(v){ super.toString(); } };".into(),
            None,
        ),
        // `SCOPE_DIRECT_SUPER` is NOT entered with it, so `super()` stays illegal
        // — and with a different message from a bare `super` in the same place.
        row(
            "field initializer super()",
            format!("{BASE}class C extends B {{ f = () => {{ super(); }}; }}"),
            Some(OUTSIDE_CTOR),
        ),
        row(
            "static block super()",
            format!("{BASE}class C extends B {{ static {{ super(); }} }}"),
            Some(OUTSIDE_CTOR),
        ),
        row(
            "non-derived ctor super()",
            "class C { constructor(){ super(); } }".into(),
            Some(OUTSIDE_CTOR),
        ),
        // Rejections that must survive: the cells a blanket "allow super in a
        // class" rule would wrongly accept.
        row(
            "computed key",
            format!("{BASE}class C extends B {{ [super.load()] = 1; }}"),
            Some(OUTSIDE_METHOD),
        ),
        row(
            "object literal plain property",
            "const o = { m: super.toString };".into(),
            Some(OUTSIDE_METHOD),
        ),
        row(
            "function expression in a field initializer",
            format!("{BASE}class C extends B {{ f = function(){{ super.load(); }}; }}"),
            Some(OUTSIDE_METHOD),
        ),
        row(
            "function expression returned from a field initializer's arrow",
            format!("{BASE}class C extends B {{ f = () => function(){{ super.load(); }}; }}"),
            Some(OUTSIDE_METHOD),
        ),
        row(
            "function expression in a static block",
            format!("{BASE}class C extends B {{ static {{ (function(){{ super.load(); }}); }} }}"),
            Some(OUTSIDE_METHOD),
        ),
        row(
            "function expression in a method",
            format!("{BASE}class C extends B {{ m(){{ return function(){{ super.load(); }}; }} }}"),
            Some(OUTSIDE_METHOD),
        ),
        row(
            "top level",
            "super.toString();".into(),
            Some(OUTSIDE_METHOD),
        ),
    ]
}

fn module_verdict(src: &str) -> Option<String> {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("m.svelte.js".into()),
            ..Default::default()
        },
    )
    .err()
    .map(|e| format!("{e:?}"))
}

fn component_verdict(body: &str) -> Option<String> {
    compile(
        &format!("<script>\n{body}\n</script>\n<i>x</i>\n"),
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .err()
    .map(|e| format!("{e:?}"))
}

fn check(what: &str, entry: &str, expected: Option<&str>, actual: Option<String>) -> bool {
    match (expected, &actual) {
        (None, None) => true,
        (Some(message), Some(text)) if text.contains(message) => true,
        _ => {
            println!(
                "  MISMATCH {entry:9} {what}\n    expected {expected:?}\n    actual   {actual:?}"
            );
            false
        }
    }
}

/// Both entry points are asserted: the report names `compileModule` and
/// `compile`, and the module surface is a separate code path with almost no
/// corpus population.
#[test]
fn super_is_legal_exactly_where_acorn_enters_scope_super() {
    let mut bad = 0;
    let all = rows();
    for row in &all {
        if !check(row.what, "module", row.expected, module_verdict(&row.body)) {
            bad += 1;
        }
        if !check(
            row.what,
            "component",
            row.expected,
            component_verdict(&row.body),
        ) {
            bad += 1;
        }
    }
    assert_eq!(bad, 0, "{bad} of {} cells diverge", all.len() * 2);
}
