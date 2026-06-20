//! AST-based server code generation (Phase-3 rewrite).
//!
//! This is the additive, in-progress replacement for the string-surgery server
//! pipeline in [`super`]. It assembles the SSR output as a real `oxc` AST and
//! prints it ONCE with [`rsvelte_esrap::print`] — zero text processing.
//!
//! It mirrors the program-assembly shape of upstream's
//! `submodules/svelte/packages/svelte/src/compiler/phases/3-transform/server/transform-server.js`
//! (`server_component` / `server_module`). For now the template and script
//! bodies are STUBBED empty; only the program skeleton (namespace import,
//! sanitized-props / rest-props / slots prologue, and the exported component
//! function shell) is emitted. The per-node visitors live in [`visitors`] and
//! are ported incrementally.
//!
//! This module is NOT yet wired into [`super::transform_server`]; it exists so
//! the crate keeps compiling while the AST pipeline is built out.

pub mod visitors;

use crate::ast::template::Root;
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase3_transform::builders::B;
use oxc_allocator::Allocator;
use oxc_ast::ast::Statement;

/// Mutable state threaded through the AST-based server transform.
///
/// Holds the [`B`] builder (arena-backed), borrowed analysis, and the output
/// statement buffers that the program-assembly and (future) visitors append
/// to. Kept intentionally minimal but extensible — visitor ports will add
/// fields (e.g. `legacy_reactive_statements`, `init`, `template`) as needed.
pub struct ServerTransformState<'a> {
    /// The `b.*` oxc-AST builder layer (Copy; holds only an allocator ref).
    pub b: B<'a>,
    /// The Phase-2 analysis for the component being transformed.
    pub analysis: &'a ComponentAnalysis,
    /// Compile options (namespace, dev, compatibility, …).
    pub options: &'a CompileOptions,
    /// Top-level hoisted statements (namespace import, instance-script imports,
    /// `$$css`, etc.) — emitted before the component function.
    pub hoisted: Vec<Statement<'a>>,
    /// The component-function body statements (sanitized-props prologue +
    /// instance + template). Built up by the prologue assembly and visitors.
    pub body: Vec<Statement<'a>>,
}

impl<'a> ServerTransformState<'a> {
    /// Create a fresh state with the namespace import pre-seeded into
    /// [`Self::hoisted`] (mirrors upstream's `hoisted: [b.import_all('$', …)]`).
    pub fn new(
        analysis: &'a ComponentAnalysis,
        options: &'a CompileOptions,
        allocator: &'a Allocator,
    ) -> Self {
        let b = B::new(allocator);
        let hoisted = vec![b.import_all("$", "svelte/internal/server")];
        ServerTransformState {
            b,
            analysis,
            options,
            hoisted,
            body: Vec::new(),
        }
    }
}

/// Whether the component function takes `($$renderer, $$props)` rather than
/// just `($$renderer)` — mirrors upstream's `should_inject_props`.
fn should_inject_props(analysis: &ComponentAnalysis, options: &CompileOptions) -> bool {
    // `should_inject_context` in upstream is `dev || needs_context`; we conflate
    // it into the props decision here (the skeleton always injects when any
    // prop-related signal is set).
    let should_inject_context = options.dev || analysis.needs_context;
    should_inject_context
        || analysis.needs_props
        || analysis.uses_props
        || analysis.uses_rest_props
        || analysis.uses_slots
        || !analysis.slot_names.is_empty()
}

/// Build the SSR program for a component as a real oxc AST and print it once.
///
/// Mirrors upstream `server_component`'s final program shape, but with EMPTY
/// template/script bodies (the visitors are not ported yet). What it emits:
///
/// - `import * as $ from 'svelte/internal/server';` (the namespace import)
/// - the sanitized-props / rest-props / slots prologue (`$$sanitized_props`,
///   `$$restProps`, `$$slots`) when the corresponding analysis flags are set
///   (upstream lines 274-301) — these don't need the template, so they're real.
/// - `export default function <Name>($$renderer, $$props) { <prologue> }`
///
/// Returns `Some(printed_code)`, or `None` only if assembly is impossible
/// (currently never — kept as `Option` to match the seam's future fallibility).
pub fn server_component_ast<'a>(
    analysis: &'a ComponentAnalysis,
    _ast: &Root,
    _source: &str,
    options: &'a CompileOptions,
    allocator: &'a Allocator,
) -> Option<String> {
    let mut state = ServerTransformState::new(analysis, options, allocator);
    let b = state.b;

    // -- component-function body: sanitized-props prologue ------------------
    //
    // Upstream `unshift`es these in this order (so the printed order is the
    // reverse of the unshift sequence): `$$slots`, then `$$sanitized_props`,
    // then `$$restProps`. We build the body top-down to the same final order:
    //   1. $$slots          (if uses_slots)
    //   2. $$sanitized_props (if uses_props || uses_rest_props)
    //   3. $$restProps       (if uses_rest_props)
    // Then the (currently empty) instance + template bodies.

    if analysis.uses_slots {
        // const $$slots = $.sanitize_slots($$props);
        state
            .body
            .push(b.const_id("$$slots", b.call("$.sanitize_slots", vec![b.id("$$props")])));
    }

    if analysis.uses_props || analysis.uses_rest_props {
        // const $$sanitized_props = $.sanitize_props($$props);
        state.body.push(b.const_id(
            "$$sanitized_props",
            b.call("$.sanitize_props", vec![b.id("$$props")]),
        ));
    }

    if analysis.uses_rest_props {
        // const $$restProps = $.rest_props($$sanitized_props, [<named props>]);
        let mut named: Vec<String> = analysis
            .exports
            .iter()
            .map(|e| e.alias.clone().unwrap_or_else(|| e.name.clone()))
            .collect();
        // bindable-prop names (prop_alias ?? name) are also excluded from rest;
        // the skeleton uses the export list as the conservative source. (The
        // bindable-prop walk is added when the scope-binding visitor lands.)
        named.sort();
        named.dedup();
        let elems: Vec<Option<oxc_ast::ast::Expression<'a>>> =
            named.iter().map(|n| Some(b.string(n))).collect();
        state.body.push(b.const_id(
            "$$restProps",
            b.call(
                "$.rest_props",
                vec![b.id("$$sanitized_props"), b.array(elems)],
            ),
        ));
    }

    // TODO(visitors): instance-body statements, template body, bind_props,
    // store-subs cleanup, props_id, $$renderer.component wrapper, etc.
    // Empty for the skeleton.

    // -- component function declaration -------------------------------------
    let component_name = analysis.name.as_str();
    let params = if should_inject_props(analysis, options) {
        b.params(vec![b.id_pat("$$renderer"), b.id_pat("$$props")], None)
    } else {
        b.params(vec![b.id_pat("$$renderer")], None)
    };
    let fn_body = b.body(std::mem::take(&mut state.body));
    let component_fn = b.function_declaration(component_name, params, fn_body, false);

    // -- program assembly ---------------------------------------------------
    // body = [...hoisted, export default function <Name> { ... }]
    let mut program_body = std::mem::take(&mut state.hoisted);
    program_body.push(b.export_default_fn(component_fn));

    let program = b.program(program_body);
    Some(rsvelte_esrap::print(&program, ""))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ParseOptions;
    use crate::compiler::phases::phase1_parse;
    use crate::compiler::phases::phase2_analyze;

    /// Run the real Phase-1 (parse) + Phase-2 (analyze) pipeline on `source`
    /// and invoke the AST-based server skeleton. This mirrors the relevant
    /// prefix of [`crate::compiler::compile`] (lazy-expression resolution,
    /// deferred-script parsing, TS removal, analyze) so the inputs are exactly
    /// what `transform_server` receives at runtime.
    fn run(source: &str) -> String {
        let parse_options = ParseOptions {
            modern: true,
            loose: false,
            skip_expression_loc: true,
            defer_script_parse: true,
            force_typescript: false,
            lenient_script: false,
        };
        let mut ast = phase1_parse::parse(source, parse_options).expect("parse");

        // The serialize-arena guard is required by the analyze pipeline.
        let _guard = unsafe { crate::ast::arena::SerializeArenaGuard::new(&ast.arena as *const _) };

        phase1_parse::resolve_lazy::resolve_lazy_expressions(&mut ast, source);

        let line_offsets = phase1_parse::compute_line_offsets(source, false);
        if let Some(instance) = ast.instance.as_mut() {
            phase1_parse::read::script::ensure_script_parsed(
                &ast.arena,
                instance,
                source,
                &line_offsets,
            );
        }
        if let Some(module) = ast.module.as_mut() {
            phase1_parse::read::script::ensure_script_parsed(
                &ast.arena,
                module,
                source,
                &line_offsets,
            );
        }

        let options = CompileOptions {
            filename: Some("App.svelte".to_string()),
            ..CompileOptions::default()
        };
        let analysis =
            phase2_analyze::analyze_component(&mut ast, source, &options).expect("analyze");

        let allocator = Allocator::default();
        server_component_ast(&analysis, &ast, source, &options, &allocator).expect("ast output")
    }

    #[test]
    fn trivial_component_skeleton() {
        let out = run("<p>hello</p>");
        assert!(
            out.contains("import * as $ from 'svelte/internal/server';"),
            "missing namespace import:\n{out}"
        );
        assert!(
            out.contains("export default function App"),
            "missing exported component shell:\n{out}"
        );
    }

    #[test]
    fn props_prologue_emitted() {
        // Legacy `$$props` access sets `uses_props` -> `$$sanitized_props`
        // prologue and a 2-arg `($$renderer, $$props)` signature.
        let out = run("<p>{$$props.x}</p>");
        assert!(
            out.contains("const $$sanitized_props = $.sanitize_props($$props);"),
            "missing sanitize_props prologue:\n{out}"
        );
        assert!(
            out.contains("function App($$renderer, $$props)"),
            "missing 2-arg component signature:\n{out}"
        );
    }
}
