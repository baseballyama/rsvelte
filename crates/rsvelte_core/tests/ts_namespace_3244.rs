//! Upstream's `remove_typescript_nodes` visits a `TSModuleDeclaration` whatever
//! wraps it and whatever modifier it carries: `declare` is never consulted (the
//! visitor keys only on whether the module has a body) and an `export` is walked
//! through. rsvelte dropped a `declare`d module to an `EmptyStatement` at
//! conversion time and turned an exported namespace into one unconditionally, so
//! three non-erasable shapes compiled.
//!
//! Every code, message and span below was read off the official compiler at the
//! pinned `submodules/svelte` revision, on all three entry points rsvelte has.

use rsvelte_core::{
    CompileOptions, GenerateMode, ModuleCompileOptions, compile, compile_module, compiler::CssMode,
};

fn compile_result(src: &str, generate: GenerateMode) -> Result<String, String> {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .map_err(|e| format!("{e:?}"))
}

fn compile_module_result(src: &str) -> Result<String, String> {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("Test.svelte.ts".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .map(|result| result.js.code)
    .map_err(|e| format!("{e:?}"))
}

/// The instance script; the reported node starts `body_offset` bytes into `body`.
fn instance(body: &str) -> String {
    format!("<script lang=\"ts\">\n{body}\nconst s = 1;\n</script>\n\n<p>{{s}}</p>\n")
}
const INSTANCE_OFFSET: usize = 19;

/// The module script — a second entry point into the same strip.
fn module_script(body: &str) -> String {
    format!("<script module lang=\"ts\">\n{body}\nexport const s = 1;\n</script>\n\n<p>{{s}}</p>\n")
}
const MODULE_SCRIPT_OFFSET: usize = 26;

/// `(body, offset of the reported node inside `body`)`.
const REJECTED: &[(&str, usize)] = &[
    ("namespace N { export const a = 1; }", 0),
    ("export namespace N { export const a = 1; }", 7),
    ("declare module \"x\" { export const a: number; }", 0),
    ("declare global { const g: number }", 0),
    ("declare namespace N { const a: number }", 0),
    ("module M { export const a = 1; }", 0),
    ("export module M { export const a = 1; }", 7),
];

/// Shapes the official compiler accepts. `export declare namespace` is here
/// because acorn-typescript gives the export `exportKind: 'type'`, so upstream
/// returns `b.empty` before the namespace is ever visited — the `declare` is not
/// what makes it legal, the export kind is. A `declare` module with an empty (or
/// absent) body is legal for the opposite reason: there is nothing to visit.
const ACCEPTED: &[&str] = &[
    "export declare namespace N { const a: number }",
    "export declare module \"x\" { const a: number }",
    "namespace N { }",
    "export namespace N { }",
    "namespace N { export type T = 1; }",
    "export namespace N { export type T = 1; }",
    "namespace N { interface I {} }",
    "export namespace N { interface I {} }",
    "declare module \"x\";",
    "declare module \"x\" { }",
    "declare global { }",
    "declare namespace N { }",
    "declare namespace N { type T = 1 }",
    "declare const dc: number;",
    "declare function df(): void;",
    "declare class DC {}",
];

#[test]
fn a_namespace_with_non_type_nodes_is_rejected_through_every_modifier() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for (wrap, offset) in [
            (instance as fn(&str) -> String, INSTANCE_OFFSET),
            (module_script as fn(&str) -> String, MODULE_SCRIPT_OFFSET),
        ] {
            for (body, node_offset) in REJECTED {
                let src = wrap(body);
                let err = match compile_result(&src, generate) {
                    Err(err) => err,
                    Ok(code) => panic!("{body:?} must not compile; emitted:\n{code}"),
                };
                assert!(
                    err.contains("typescript_invalid_feature"),
                    "expected typescript_invalid_feature for {body:?}, got: {err}"
                );
                assert!(
                    err.contains("namespaces with non-type nodes"),
                    "message must be upstream's for {body:?}, got: {err}"
                );
                let start = offset + node_offset;
                let end = offset + body.len();
                assert!(
                    err.contains(&format!("span: ({start}, {end})")),
                    "span must be ({start}, {end}) for {body:?}, got: {err}"
                );
            }
        }
    }
}

#[test]
fn the_erasable_neighbours_still_compile() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        for wrap in [
            instance as fn(&str) -> String,
            module_script as fn(&str) -> String,
        ] {
            for body in ACCEPTED {
                let src = wrap(body);
                if let Err(err) = compile_result(&src, generate) {
                    panic!("{body:?} must compile, got: {err}");
                }
            }
        }
    }
}

/// The third entry point. `compileModule` parses as JavaScript whatever the
/// filename says, so upstream answers every one of these with acorn's own
/// `js_parse_error` rather than `typescript_invalid_feature` — including the
/// shapes a component script accepts.
#[test]
fn compile_module_rejects_every_namespace_shape_as_a_js_parse_error() {
    for body in REJECTED.iter().map(|(body, _)| *body).chain(
        ACCEPTED
            .iter()
            .copied()
            .filter(|body| body.starts_with("namespace") || body.starts_with("export namespace")),
    ) {
        let src = format!("{body}\nexport const s = 1;\n");
        let err = match compile_module_result(&src) {
            Err(err) => err,
            Ok(code) => panic!("{body:?} must not compile as a module; emitted:\n{code}"),
        };
        assert!(
            err.contains("js_parse_error"),
            "expected js_parse_error for {body:?}, got: {err}"
        );
    }
}
