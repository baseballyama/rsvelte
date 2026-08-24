//! Regression (#3257): `export namespace` keeps its `export`, and an export
//! nested in a namespace / module body is lifted the way upstream lifts it.
//!
//! Upstream's instance-script walk is `ts.forEachChild` over the WHOLE AST, and
//! it removes the `export` keyword only from the three node kinds it has a
//! handler for (`handleVariableStatement`, `handleExportFunctionOrClass` for a
//! function and a class, `handleExportDeclaration` for `export { … }`). rsvelte
//! stripped `export` from every declaration kind and visited top-level
//! statements only, so `export namespace N` lost its `export` while the
//! namespace-body export was left alone.
//!
//! Every expectation below is the byte the pinned official `svelte2tsx`
//! produces for the same source.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn to_tsx(src: &str) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Probe.svelte".to_string(),
        is_ts_file: true,
        ..Default::default()
    };
    svelte2tsx(src, opts).expect("svelte2tsx").code
}

fn instance(body: &str) -> String {
    to_tsx(&format!(
        "<script lang=\"ts\">\n{body}\n</script>\n<div></div>\n"
    ))
}

#[track_caller]
fn assert_contains(out: &str, needle: &str) {
    assert!(out.contains(needle), "expected {needle:?} in:\n{out}");
}

#[test]
fn a_non_value_declaration_keeps_its_export_keyword() {
    // Upstream has no handler for a module / enum declaration, so the keyword
    // survives into `$$render()` untouched.
    assert_contains(
        &instance("export namespace N { const a = 1; }\nvoid N;"),
        "export namespace N { const a = 1; }",
    );
    assert_contains(
        &instance("export enum E { A }\nvoid E;"),
        "export enum E { A }",
    );
    assert_contains(
        &instance("export const enum CE { A }\nvoid CE;"),
        "export const enum CE { A }",
    );
    // The type-only forms already behaved this way; pin them to the same rule.
    assert_contains(
        &instance("export type T = number;"),
        "export type T = number;",
    );
    assert_contains(
        &instance("export interface I { a: number }"),
        "export interface I { a: number }",
    );
}

#[test]
fn a_value_declaration_still_loses_its_export_keyword() {
    let out = instance("export let l = 1;");
    assert!(
        !out.contains("export let l"),
        "`export let` must still be stripped:\n{out}"
    );
    let out = instance("export function f() {}\nvoid f;");
    assert!(
        !out.contains("export function f"),
        "`export function` must still be stripped:\n{out}"
    );
    let out = instance("export class C {}\nvoid C;");
    assert!(
        !out.contains("export class C"),
        "`export class` must still be stripped:\n{out}"
    );
}

#[test]
fn a_namespace_body_export_is_lifted_into_the_component_surface() {
    let out = instance("namespace N { export const a = 1; }\nvoid N;");
    assert_contains(&out, "namespace N {  const a = 1; }");
    assert_contains(&out, "props: {a: a} as {a?: typeof a}");
    assert_contains(&out, "exports: {} as any as { a: typeof a }");

    let out = instance("namespace N { export function nf() {} }\nvoid N;");
    assert_contains(&out, "namespace N {  function nf() {} }");
    assert_contains(&out, "exports: {} as any as { nf: typeof nf }");

    let out = instance("namespace N { export class NC {} }\nvoid N;");
    assert_contains(&out, "namespace N {  class NC {} }");

    // `export { … }` inside a namespace: the whole statement goes.
    let out = instance("namespace N { const q = 1; export { q }; }\nvoid N;");
    assert_contains(&out, "namespace N { const q = 1;  }");
    assert_contains(&out, "props: {q: q} as {q?: typeof q}");
}

#[test]
fn the_outer_export_and_the_inner_lift_are_independent() {
    let out = instance("export namespace N { export const a = 1; }\nvoid N;");
    assert_contains(&out, "export namespace N {  const a = 1; }");
    assert_contains(&out, "props: {a: a} as {a?: typeof a}");
}

#[test]
fn nested_namespaces_and_ambient_modules_are_walked_too() {
    let out = instance("namespace N { export namespace M { export const z = 1; } }\nvoid N;");
    assert_contains(&out, "namespace N { export namespace M {  const z = 1; } }");
    assert_contains(&out, "props: {z: z} as {z?: typeof z}");

    let out = instance("declare module 'foo' { export const a: number; }");
    assert_contains(&out, "declare module 'foo' {  const a: number; }");
    assert_contains(&out, "props: {a: a} as {a: number}");
}

#[test]
fn an_export_without_an_initializer_is_a_required_prop() {
    // Official `handleExportedVariableDeclarationList` sets
    // `required = !node.initializer`, independent of `let`/`const`/`var`, so a
    // non-`let` export with no initializer must NOT be optional.
    assert_contains(
        &instance("export declare const dc: number;"),
        "props: {dc: dc} as {dc: number}",
    );
    assert_contains(
        &instance("export let l = 1;"),
        "props: {l: l} as {l?: typeof l}",
    );

    // A named alias is added with `required = false` by official, even when
    // the aliased declaration itself had no initializer.
    assert_contains(
        &instance("export let formModal: number; export { formModal as controller };"),
        "controller?: typeof formModal",
    );

    // A non-exported declaration is first recorded as a possible export.
    // Official carries that declaration's required bit into its later alias.
    assert_contains(
        &instance(
            "type RequestStatus = { state: string }; let incomingRequestState: RequestStatus['state'] | undefined; export { incomingRequestState as requestState };",
        ),
        "requestState: RequestStatus['state'] | undefined",
    );
}
