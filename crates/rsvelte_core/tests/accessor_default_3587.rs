//! Regression tests for #3587 — the accessor setter's `$$value = <default>`
//! was the ESTree node, serialized.
//!
//! Upstream writes `setter.value.params[0].right = binding.initial`, an
//! expression NODE that esrap prints. rsvelte kept `binding.initial` as a
//! `String`, and that string is two different languages: a literal's raw source
//! text for the shapes `extract_literal_string_typed` handles, and a JSON dump
//! of the node for every other shape. The `$.prop(…, () => …)` fallback on the
//! line above is correct in the very same output, because it slices the source
//! instead — so the clean set was exactly the ESTree `Literal` nodes and
//! everything else (object, array, call, template, arrow, unary, binary)
//! leaked AST JSON. It parses, so no parse oracle can see it; a custom element
//! instantiated without the attribute silently got the node.
//!
//! The default now comes from the initializer's source span. A raw slice keeps
//! any TypeScript NESTED in the expression, which the node upstream prints does
//! not have, so a TS component strips the slice through the same parser the
//! rest of the pipeline uses.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

fn setter_line(code: &str) -> String {
    code.lines()
        .find(|l| l.trim_start().starts_with("set p("))
        .unwrap_or_else(|| panic!("no setter in:\n{code}"))
        .trim()
        .to_string()
}

fn ce(default: &str, lang: &str, extra: &str) -> String {
    format!(
        "<svelte:options customElement={{{{ tag: \"my-x\" }}}} />\n\n<script{lang}>\n{extra}\tlet {{ p = {default} }} = $props();\n</script>\n\n<b>{{typeof p}}</b>\n"
    )
}

/// Every non-`Literal` default. `null`, `undefined` and a regex are the control
/// group: they were already right, because they are the shapes the literal
/// extractor handles, so a fix that changed them would be changing something
/// that was not broken.
#[test]
fn a_non_literal_default_is_printed_as_source() {
    for (default, expected) in [
        ("0", "set p($$value = 0) {"),
        ("\"\"", "set p($$value = \"\") {"),
        ("null", "set p($$value = null) {"),
        ("undefined", "set p($$value = undefined) {"),
        ("/re/g", "set p($$value = /re/g) {"),
        ("{}", "set p($$value = {}) {"),
        ("[1]", "set p($$value = [1]) {"),
        ("{ a: { b: 1 } }", "set p($$value = { a: { b: 1 } }) {"),
        ("new Map()", "set p($$value = new Map()) {"),
        ("Symbol()", "set p($$value = Symbol()) {"),
        ("() => 1", "set p($$value = () => 1) {"),
        ("`t${1}`", "set p($$value = `t${1}`) {"),
        ("1 + 1", "set p($$value = 1 + 1) {"),
        ("-1", "set p($$value = -1) {"),
        ("1n", "set p($$value = 1n) {"),
        ("void 0", "set p($$value = void 0) {"),
        ("Math.max(1, 2)", "set p($$value = Math.max(1, 2)) {"),
        ("(1, 2)", "set p($$value = (1, 2)) {"),
    ] {
        assert_eq!(setter_line(&client(&ce(default, "", ""))), expected);
    }
}

/// `$bindable(<default>)` is the same rule one level in: upstream takes the
/// call's ARGUMENT, not the call.
#[test]
fn a_bindable_default_is_the_calls_argument() {
    for (default, expected) in [
        ("{ a: 1 }", "set p($$value = { a: 1 }) {"),
        ("() => 1", "set p($$value = () => 1) {"),
        ("1 + 1", "set p($$value = 1 + 1) {"),
    ] {
        assert_eq!(
            setter_line(&client(&ce(&format!("$bindable({default})"), "", ""))),
            expected
        );
    }
}

/// A source slice is not a printed node: TypeScript nested inside the default
/// survives it, and none of these shapes is reachable from the outermost
/// expression's own type (`1 as number` alone already worked, because the
/// erasure leaves the inner node's span behind).
#[test]
fn typescript_nested_in_the_default_is_erased() {
    let pre = "\tfunction f<T>(): any { return 1; }\n\tfunction g(x: any): any { return x; }\n";
    for (default, expected) in [
        ("1 as number", "set p($$value = 1) {"),
        ("new Map<string, number>()", "set p($$value = new Map()) {"),
        ("f<number>()", "set p($$value = f()) {"),
        ("(x: number) => x", "set p($$value = (x) => x) {"),
        ("{ a: 1 as const }", "set p($$value = { a: 1 }) {"),
        ("[1 as number]", "set p($$value = [1]) {"),
        ("g(1 as number)", "set p($$value = g(1)) {"),
    ] {
        assert_eq!(
            setter_line(&client(&ce(default, " lang=\"ts\"", pre))),
            expected,
            "for {default}"
        );
    }
}

/// The setter's default is normalized by the printer, not copied byte for byte
/// — which is what keeps a raw source slice a legal thing to hand it.
#[test]
fn the_slice_is_reprinted_not_pasted() {
    for (default, expected) in [
        ("1    +    2", "set p($$value = 1 + 2) {"),
        ("1 /* c */ + 2", "set p($$value = 1 + 2) {"),
        (
            "{\n\t\ta: 1,\n\t\tb: 2\n\t}",
            "set p($$value = { a: 1, b: 2 }) {",
        ),
        ("((1))", "set p($$value = 1) {"),
    ] {
        assert_eq!(
            setter_line(&client(&ce(default, "", ""))),
            expected,
            "for {default}"
        );
    }
}

/// The branches the fix must not swallow: a prop with no default still gets a
/// bare setter, and a legacy `accessors` prop does too — its default reaches
/// the same builder by a different route, `binding.initial` never having held a
/// node dump there.
#[test]
fn a_prop_with_no_default_and_a_legacy_accessor() {
    let src = "<svelte:options customElement={{ tag: \"my-x\" }} />\n\n<script>\n\tlet { p } = $props();\n</script>\n\n<b>{typeof p}</b>\n";
    assert_eq!(setter_line(&client(src)), "set p($$value) {");

    // `accessors` is a legacy-mode option, so in runes mode there is no
    // accessor at all — the row that keeps the two hosts distinguishable.
    let src = "<svelte:options accessors />\n\n<script>\n\tlet { p = { a: 1 } } = $props();\n</script>\n\n<b>{typeof p}</b>\n";
    assert!(!client(src).contains("set p("));

    let src = "<svelte:options accessors runes={false} />\n\n<script>\n\texport let p = { a: 1 };\n</script>\n\n<b>{typeof p}</b>\n";
    assert_eq!(setter_line(&client(src)), "set p($$value) {");
}
