//! Pins the deliberate divergence recorded in
//! `compatibility/deliberate-divergences.md`: an update expression on a private
//! rune field reached through a receiver other than `this` lowers to
//! `$.update(...)` / `$.update_pre(...)`.
//!
//! The official compiler gates that helper on the receiver being literally
//! `this` (`3-transform/client/visitors/UpdateExpression.js:14-19`) while the
//! member visitor it falls through to does not check the receiver at all
//! (`MemberExpression.js:11-19`). Outside a constructor root the fallthrough
//! therefore produces `$.get(inst.#n)++` — a CallExpression in assignment
//! position, which no JavaScript parser accepts. Reproducing those bytes would
//! trade a valid module for an invalid one, so rsvelte keeps the helper form
//! for every receiver. Reported upstream as sveltejs/svelte#18621.
//!
//! Nothing else observes this: the three corpus ratchets are empty, the
//! generated matrix has no non-`this` receiver axis, and the three official
//! fixtures that do use one only assign to it or read it from a method body —
//! shapes that are plain parity.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn compile(src: &str, dev: bool) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("A.svelte.js".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn parse_errors(code: &str) -> Vec<String> {
    let allocator = oxc_allocator::Allocator::default();
    oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs())
        .parse()
        .diagnostics
        .iter()
        .map(|d| d.to_string())
        .collect()
}

#[track_caller]
fn assert_parses(code: &str, what: &str) {
    let errors = parse_errors(code);
    assert!(
        errors.is_empty(),
        "{what}: emitted JS does not parse: {errors:?}\n--- output ---\n{code}"
    );
}

/// The whole point of the divergence is that the alternative does not parse, so
/// the parse assertions below are only evidence if the checker rejects the
/// shape rsvelte declines to emit.
#[test]
fn the_upstream_shape_is_rejected_by_the_parser_used_here() {
    for shape in [
        "class R { #n; m(o) { $.get(o.#n)++; } }",
        "class R { #n; m(o) { ++$.get(o.#n); } }",
        "class R { #n; m(o) { $.get(o.#n)--; } }",
    ] {
        assert!(
            !parse_errors(shape).is_empty(),
            "the parser accepts {shape}, so it cannot witness this divergence"
        );
    }
}

const RECEIVERS: &str = "export class R {
\t#n = $state(0);

\tconstructor(o) {
\t\tconst inst = this;
\t\tinst.#n++;
\t\t--inst.#n;
\t\to.#n--;
\t\tconsole.log(inst.#n);
\t\t(() => {
\t\t\tinst.#n++;
\t\t})();
\t}

\tm(o) {
\t\tconst inst = this;
\t\tinst.#n++;
\t\t++inst.#n;
\t\to.#n--;
\t\treturn inst.#n;
\t}

\tstatic s(o) {
\t\to.#n++;
\t}
}
";

/// Every position upstream lowers to `$.get(x.#n)++` — a method body, a static
/// method, and a nested function inside a constructor.
#[test]
fn an_update_through_a_non_this_receiver_uses_the_update_helper() {
    for dev in [false, true] {
        let out = compile(RECEIVERS, dev);
        assert_parses(&out, if dev { "client-dev" } else { "client" });
        for expected in [
            "$.update(inst.#n);",
            "$.update_pre(inst.#n);",
            "$.update_pre(inst.#n, -1);",
            "$.update(o.#n);",
            "$.update(o.#n, -1);",
        ] {
            assert!(out.contains(expected), "missing {expected} in:\n{out}");
        }
        assert!(
            !out.contains("$.get(inst.#n)+") && !out.contains("$.get(o.#n)+"),
            "the update must not be left on a `$.get(...)` call:\n{out}"
        );
    }
}

/// A `this` receiver is plain parity with upstream and must not drift with the
/// divergence above.
#[test]
fn a_this_receiver_is_unaffected() {
    let out = compile(
        "export class R {
\t#n = $state(0);

\tm() {
\t\tthis.#n++;
\t\t--this.#n;
\t}
}
",
        false,
    );
    assert_parses(&out, "this receiver");
    assert!(
        out.contains("$.update(this.#n);") && out.contains("$.update_pre(this.#n, -1);"),
        "a `this` receiver keeps upstream's own lowering:\n{out}"
    );
}

/// Reads diverge in the other direction and are pinned here so the record and
/// the compiler cannot drift apart: upstream applies its constructor-root `.v`
/// shortcut to any receiver, rsvelte restricts it to `this` and reads a
/// non-`this` receiver through `$.get`.
#[test]
fn a_read_through_a_non_this_receiver_goes_through_get() {
    let out = compile(RECEIVERS, false);
    assert!(
        out.contains("console.log($.get(inst.#n));"),
        "a constructor-root read through an alias uses `$.get`:\n{out}"
    );
    assert!(
        out.contains("return $.get(inst.#n);"),
        "a method-body read through an alias uses `$.get`:\n{out}"
    );
    assert!(
        !out.contains("inst.#n.v"),
        "the `.v` shortcut stays restricted to a `this` receiver:\n{out}"
    );
}
