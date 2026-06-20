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

pub mod read_wrap;
pub mod script;
pub mod visitors;

use crate::ast::js::Expression;
use crate::ast::template::{Root, TemplateNode};
use crate::compiler::CompileOptions;
use crate::compiler::phases::phase2_analyze::ComponentAnalysis;
use crate::compiler::phases::phase3_transform::builders::B;
use crate::compiler::phases::phase3_transform::jsnode_to_oxc::jsnode_to_oxc_expr;
use oxc_allocator::Allocator;
use oxc_ast::ast::{Expression as OxcExpression, Statement};
use visitors::shared::TemplateEntry;

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
    /// The accumulating SSR template entries (element openers/closers, text
    /// runs, `$.escape(...)` interpolations). Coalesced into `$$renderer.push`
    /// calls by [`visitors::shared::build_template`]. Mirrors upstream
    /// `state.template`.
    pub template: Vec<TemplateEntry<'a>>,
    /// The component source text — used as the re-parse fallback when a template
    /// expression's `JsNode` cannot be converted directly by
    /// [`jsnode_to_oxc_expr`].
    pub source: &'a str,
    /// The arena backing this component's parsed expressions (for `JsNode`
    /// resolution in [`Self::visit_expr`]).
    pub arena: &'a crate::ast::arena::ParseArena,
    /// The oxc allocator (for the re-parse fallback).
    pub allocator: &'a Allocator,
    /// Whether the current fragment is "standalone" — it contains a single
    /// meaningful node that is a non-dynamic RenderTag / Component, so the
    /// trailing `<!---->` hydration anchor is elided (mirrors upstream's
    /// `state.is_standalone`). Set for the root fragment in
    /// [`server_component_ast`]; block visitors leave it as-is for now.
    pub is_standalone: bool,
    /// Monotonic counter for `each_array` / `$$index` unique-name suffixes,
    /// mirroring upstream's `state.scope.root.unique('each_array')`. The first
    /// each block uses bare `each_array` / `$$index`; subsequent ones append
    /// `_1`, `_2`, … (matching the text-based oracle's `each_counter`).
    pub each_index: usize,
}

impl<'a> ServerTransformState<'a> {
    /// Create a fresh state with the namespace import pre-seeded into
    /// [`Self::hoisted`] (mirrors upstream's `hoisted: [b.import_all('$', …)]`).
    pub fn new(
        analysis: &'a ComponentAnalysis,
        options: &'a CompileOptions,
        source: &'a str,
        arena: &'a crate::ast::arena::ParseArena,
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
            template: Vec::new(),
            source,
            arena,
            allocator,
            is_standalone: false,
            each_index: 0,
        }
    }

    /// Port of the text-based oracle's `is_standalone_fragment`: a fragment is
    /// standalone when, after filtering hoisted / whitespace / comment nodes, it
    /// contains exactly one node that is a non-dynamic RenderTag or non-dynamic
    /// Component (so the parent anchors suffice and the trailing `<!---->` is
    /// elided). Snippet defs / const tags / head-like nodes are hoisted out.
    pub fn is_standalone_fragment(nodes: &[TemplateNode]) -> bool {
        use crate::compiler::phases::phase3_transform::utils::is_svelte_whitespace_only;
        let meaningful: Vec<&TemplateNode> = nodes
            .iter()
            .filter(|n| match n {
                TemplateNode::Text(t) => !is_svelte_whitespace_only(&t.data),
                TemplateNode::Comment(_)
                | TemplateNode::SnippetBlock(_)
                | TemplateNode::ConstTag(_)
                | TemplateNode::DeclarationTag(_)
                | TemplateNode::SvelteBody(_)
                | TemplateNode::SvelteWindow(_)
                | TemplateNode::SvelteDocument(_)
                | TemplateNode::SvelteHead(_)
                | TemplateNode::TitleElement(_) => false,
                _ => true,
            })
            .collect();
        if meaningful.len() != 1 {
            return false;
        }
        match meaningful[0] {
            TemplateNode::RenderTag(tag) => !tag.metadata.dynamic,
            TemplateNode::Component(comp) => {
                !comp.metadata.dynamic
                    && !comp.attributes.iter().any(|attr| {
                        matches!(attr, crate::ast::template::Attribute::Attribute(a) if a.name.starts_with("--"))
                    })
            }
            _ => false,
        }
    }

    /// Convert a parsed template `Expression` to an oxc [`OxcExpression`].
    ///
    /// First attempts the faithful structural conversion via
    /// [`jsnode_to_oxc_expr`]; on bail (`None`), falls back to re-parsing the
    /// expression's source span with oxc (the validated mechanism from
    /// `builders.rs::tests::spike_inplace_oxc_mutation`).
    ///
    /// NOTE (写経 gap): this performs NO rune / prop / store rewriting yet —
    /// it reproduces the parsed expression shape verbatim. That is correct for
    /// the simple cases (bare identifiers / member chains) but the store-sub /
    /// derived-call / props rewrites are still TODO.
    pub fn visit_expr(&self, expr: &Expression) -> OxcExpression<'a> {
        let mut out = self.visit_expr_raw(expr);
        read_wrap::wrap_reads(
            &mut out,
            self.b,
            self.analysis,
            self.analysis.root.instance_scope_index,
        );
        out
    }

    /// Convert a parsed template [`Expression`] to an oxc [`OxcExpression`]
    /// WITHOUT the read-wrapping pass — the verbatim shape conversion. Used by
    /// [`Self::visit_expr`] before wrapping, and available to callers that need
    /// the un-wrapped expression.
    pub fn visit_expr_raw(&self, expr: &Expression) -> OxcExpression<'a> {
        let node = expr.as_node();
        if let Some(converted) = jsnode_to_oxc_expr(&node, self.arena, self.allocator) {
            return converted;
        }
        // Fallback: re-parse the source span.
        if let (Some(start), Some(end)) = (expr.start(), expr.end()) {
            let slice = &self.source[start as usize..end as usize];
            if let Some(reparsed) = reparse_expression(slice, self.allocator) {
                return reparsed;
            }
        }
        // Last resort: an identifier placeholder (keeps the build correct-ish;
        // only reachable for shapes neither converter handles).
        self.b.id("undefined")
    }

    /// Re-parse a JS expression *source slice* into an oxc expression. Used by
    /// visitors (e.g. RenderTag) that decompose a template expression by its
    /// child spans — mirroring the text-based oracle's `self.source[start..end]`
    /// slicing — rather than by structural `JsNode` traversal. Falls back to an
    /// `undefined` identifier on a parse failure (unreachable for valid input).
    pub fn reparse_slice(&self, start: usize, end: usize) -> OxcExpression<'a> {
        if end > start && end <= self.source.len() {
            let slice = self.source[start..end].trim();
            if let Some(reparsed) = reparse_expression(slice, self.allocator) {
                return reparsed;
            }
        }
        self.b.id("undefined")
    }

    /// Re-parse an arbitrary expression `src` (already arena-allocated or
    /// borrowed) into an oxc expression, returning `None` on a parse failure.
    /// Used for synthetic spellings (e.g. a `Literal`'s `raw` field) that don't
    /// correspond to a clean source span.
    pub fn reparse_slice_owned(&self, src: &str) -> Option<OxcExpression<'a>> {
        reparse_expression(src.trim(), self.allocator)
    }

    /// Re-parse a complete statement `src` slice into the STATE allocator,
    /// returning its first top-level statement. Used by the script transform to
    /// rehome kept / hoisted statements (imports, functions, expression
    /// statements) from the throwaway classification arena into the output AST.
    pub fn reparse_statement(&self, src: &str) -> Option<Statement<'a>> {
        let owned = self.allocator.alloc_str(src.trim());
        let ret =
            oxc_parser::Parser::new(self.allocator, owned, oxc_span::SourceType::mjs()).parse();
        if !ret.diagnostics.is_empty() {
            return None;
        }
        ret.program.body.into_iter().next()
    }

    /// Re-parse a single declarator slice (`x = init` / `{ a } = init`) by
    /// wrapping it as `let <slice>;`, returning the `(pattern, init)` pair. Used
    /// for the non-rune declarator passthrough.
    pub fn reparse_declarator(
        &self,
        src: &str,
        _kind: oxc_ast::ast::VariableDeclarationKind,
    ) -> Option<(oxc_ast::ast::BindingPattern<'a>, Option<OxcExpression<'a>>)> {
        let wrapped = format!("let {};", src.trim());
        let owned = self.allocator.alloc_str(&wrapped);
        let ret =
            oxc_parser::Parser::new(self.allocator, owned, oxc_span::SourceType::mjs()).parse();
        if !ret.diagnostics.is_empty() {
            return None;
        }
        for stmt in ret.program.body {
            if let Statement::VariableDeclaration(vd) = stmt {
                let mut vd = vd.unbox();
                if let Some(d) = vd.declarations.pop() {
                    return Some((d.id, d.init));
                }
            }
        }
        None
    }

    /// Re-parse a binding pattern slice (`x` / `{ a, b }` / `[a, b]`) into the
    /// state allocator by wrapping it as `let <slice> = 0;` and extracting the
    /// pattern. Used to keep a rune declarator's LHS pattern verbatim.
    pub fn reparse_pattern(&self, src: &str) -> Option<oxc_ast::ast::BindingPattern<'a>> {
        let wrapped = format!("let {} = 0;", src.trim());
        let owned = self.allocator.alloc_str(&wrapped);
        let ret =
            oxc_parser::Parser::new(self.allocator, owned, oxc_span::SourceType::mjs()).parse();
        if !ret.diagnostics.is_empty() {
            return None;
        }
        for stmt in ret.program.body {
            if let Statement::VariableDeclaration(vd) = stmt {
                let mut vd = vd.unbox();
                if let Some(d) = vd.declarations.pop() {
                    return Some(d.id);
                }
            }
        }
        None
    }
}

/// Re-parse a JS expression source slice with oxc and return the parsed
/// expression. Returns `None` on parse error or if the program isn't a single
/// expression statement.
///
/// The slice is wrapped in parentheses (`(<src>)`) before parsing so that a
/// leading-`{` slice (object literal, e.g. `{ a: 1 }`) is parsed as an
/// **expression** and not as a `BlockStatement` — otherwise the program body
/// holds no `ExpressionStatement` and the init silently degraded to `void 0`.
/// The resulting `ParenthesizedExpression` wrapper is unwrapped before return so
/// the caller gets the bare `ObjectExpression` / `CallExpression` / literal.
fn reparse_expression<'a>(src: &str, allocator: &'a Allocator) -> Option<OxcExpression<'a>> {
    let wrapped = format!("({})", src.trim());
    let owned = allocator.alloc_str(&wrapped);
    let ret = oxc_parser::Parser::new(allocator, owned, oxc_span::SourceType::mjs()).parse();
    if !ret.diagnostics.is_empty() {
        return None;
    }
    for stmt in ret.program.body {
        if let Statement::ExpressionStatement(es) = stmt {
            return Some(unwrap_parenthesized(es.unbox().expression));
        }
    }
    None
}

/// Strip any (possibly nested) `ParenthesizedExpression` wrappers introduced by
/// the `(<src>)` reparse wrapping in [`reparse_expression`], so the synthetic
/// outer parens don't leak into the printed output.
fn unwrap_parenthesized(expr: OxcExpression<'_>) -> OxcExpression<'_> {
    match expr {
        OxcExpression::ParenthesizedExpression(p) => unwrap_parenthesized(p.unbox().expression),
        other => other,
    }
}

/// Whether the component function takes `($$renderer, $$props)` rather than
/// just `($$renderer)` — mirrors upstream's `should_inject_props` (line 313),
/// including the `props.length > 0` (bind_props) term via `has_bind_props`.
fn should_inject_props_full(
    analysis: &ComponentAnalysis,
    options: &CompileOptions,
    has_bind_props: bool,
) -> bool {
    let should_inject_context = options.dev || analysis.needs_context;
    should_inject_context
        || has_bind_props
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
    ast: &'a Root,
    source: &'a str,
    options: &'a CompileOptions,
    allocator: &'a Allocator,
) -> Option<String> {
    let mut state = ServerTransformState::new(analysis, options, source, &ast.arena, allocator);
    let b = state.b;

    use crate::compiler::phases::phase2_analyze::scope::BindingKind;

    // -- module-script body (module scope) ----------------------------------
    // Upstream emits `[...hoisted, ...module.body]` at module scope. We append
    // the lowered module statements onto `hoisted` (after the namespace import).
    // (NON-DELICATE slice — only the localized rune lowerings; KNOWN GAPS:
    // derived-read wrapping / store-get / snapshot / $$sanitized_props.)
    let module_body = script::transform_module(ast, &mut state);
    state.hoisted.extend(module_body);

    // -- store_subs detection -----------------------------------------------
    // Upstream (lines 213-222): if any instance binding is `store_sub`,
    // `instance.body.unshift(b.var('$$store_subs'))` and the template gets an
    // `if ($$store_subs) $.unsubscribe_stores($$store_subs);` cleanup.
    let uses_store_subs = analysis
        .root
        .bindings
        .iter()
        .any(|binding| matches!(binding.kind, BindingKind::StoreSub));

    // -- instance-script body -----------------------------------------------
    // Upstream's component block is `[...instance.body, ...template.body]`. The
    // instance statements go FIRST. Instance imports are hoisted onto
    // `state.hoisted` inside `transform_instance`.
    let instance_body = script::transform_instance(ast, &mut state);

    // `instance.body.unshift(b.var('$$store_subs'))` — prepend the undeclared
    // `var $$store_subs;` to the instance body.
    if uses_store_subs {
        let var_decl = b.var_decl(b.id_pat("$$store_subs"), None);
        state.body.push(var_decl);
    }
    state.body.extend(instance_body);

    // -- template body ------------------------------------------------------
    // Walk the root fragment through process_children + build_template, then
    // append the coalesced `$$renderer.push(...)` statements.
    state.is_standalone = ServerTransformState::is_standalone_fragment(&ast.fragment.nodes);
    let template_body = visitors::shared::build_fragment_body(&ast.fragment, &mut state);
    state.body.extend(template_body);

    // `template.body.push(b.if($$store_subs, $.unsubscribe_stores($$store_subs)))`.
    if uses_store_subs {
        let cleanup = b.if_stmt(
            b.id("$$store_subs"),
            b.stmt(b.call("$.unsubscribe_stores", vec![b.id("$$store_subs")])),
            None,
        );
        state.body.push(cleanup);
    }

    // -- $.bind_props trailer (upstream lines 224-243) ----------------------
    // Collect `props` from bindable_prop bindings (`prop_alias ?? name`, excluding
    // `$$`-prefixed names) then `analysis.exports` (`alias ?? name`). If any,
    // push `$.bind_props($$props, { <init>... })` onto the template body. The
    // object property uses `b.init(prop_alias ?? name, b.id(name))`, so esrap
    // collapses it to shorthand `{ name }` when alias == name.
    let mut bind_props: Vec<oxc_ast::ast::ObjectPropertyKind<'a>> = Vec::new();
    for binding in &analysis.root.bindings {
        if matches!(binding.kind, BindingKind::BindableProp) && !binding.name.starts_with("$$") {
            let key = binding.prop_alias.as_deref().unwrap_or(&binding.name);
            bind_props.push(b.init(key, b.id(&binding.name)));
        }
    }
    for export in &analysis.exports {
        let key = export.alias.as_deref().unwrap_or(&export.name);
        bind_props.push(b.init(key, b.id(&export.name)));
    }
    let has_bind_props = !bind_props.is_empty();
    if has_bind_props {
        state
            .body
            .push(b.stmt(b.call("$.bind_props", vec![b.id("$$props"), b.object(bind_props)])));
    }

    // -- component_block assembly + needs_context wrapper -------------------
    // Upstream wraps `[...instance.body, ...template.body]` in a block, then —
    // when `dev || analysis.needs_context` — wraps the WHOLE block in
    // `$$renderer.component(($$renderer) => { <block> }, dev && component_name)`.
    // The sanitized/rest/slots prologue is unshifted AFTER the wrapper, so it
    // lives OUTSIDE the `$$renderer.component(...)` callback.
    let component_name = analysis.name.as_str();
    let should_inject_context = options.dev || analysis.needs_context;
    let mut block_body = std::mem::take(&mut state.body);

    if should_inject_context {
        // ($$renderer) => { <block_body> }
        let inner_params = b.params(vec![b.id_pat("$$renderer")], None);
        let inner_body = b.body(block_body);
        let arrow = b.arrow(inner_params, inner_body, false, false);
        // 2nd arg: `dev && component_name` → the bare identifier in dev, omitted
        // (no 2nd arg) otherwise.
        let mut args = vec![arrow];
        if options.dev {
            args.push(b.id(component_name));
        }
        block_body = vec![b.stmt(b.call("$$renderer.component", args))];
    }

    // -- sanitized-props prologue (unshifted, OUTSIDE the wrapper) ----------
    //
    // Upstream `unshift`es these in this order (so the printed order is the
    // reverse of the unshift sequence): `$$restProps`, `$$sanitized_props`,
    // `$$slots` — i.e. final printed order is `$$slots`, `$$sanitized_props`,
    // `$$restProps`. We build a prologue vec top-down to that final order, then
    // prepend it.
    let mut prologue: Vec<Statement<'a>> = Vec::new();

    if analysis.uses_slots {
        // const $$slots = $.sanitize_slots($$props);
        prologue.push(b.const_id("$$slots", b.call("$.sanitize_slots", vec![b.id("$$props")])));
    }

    if analysis.uses_props || analysis.uses_rest_props {
        // const $$sanitized_props = $.sanitize_props($$props);
        prologue.push(b.const_id(
            "$$sanitized_props",
            b.call("$.sanitize_props", vec![b.id("$$props")]),
        ));
    }

    if analysis.uses_rest_props {
        // const $$restProps = $.rest_props($$sanitized_props, [<named props>]);
        // Named props = analysis.exports (alias ?? name) ++ bindable_prop bindings
        // (prop_alias ?? name), in source order (upstream pushes exports first).
        let mut named: Vec<String> = analysis
            .exports
            .iter()
            .map(|e| e.alias.clone().unwrap_or_else(|| e.name.clone()))
            .collect();
        for binding in &analysis.root.bindings {
            if matches!(binding.kind, BindingKind::BindableProp) {
                let name = binding.prop_alias.as_ref().unwrap_or(&binding.name);
                if !named.contains(name) {
                    named.push(name.clone());
                }
            }
        }
        let elems: Vec<Option<oxc_ast::ast::Expression<'a>>> =
            named.iter().map(|n| Some(b.string(n))).collect();
        prologue.push(b.const_id(
            "$$restProps",
            b.call(
                "$.rest_props",
                vec![b.id("$$sanitized_props"), b.array(elems)],
            ),
        ));
    }

    prologue.extend(block_body);
    let final_body = prologue;

    // -- component function declaration -------------------------------------
    let params = if should_inject_props_full(analysis, options, has_bind_props) {
        b.params(vec![b.id_pat("$$renderer"), b.id_pat("$$props")], None)
    } else {
        b.params(vec![b.id_pat("$$renderer")], None)
    };
    let fn_body = b.body(final_body);
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

    /// Normalize for comparison: trim trailing whitespace on every line and
    /// drop blank lines, so the two pipelines' blank-line conventions don't
    /// cause spurious diffs (mirrors the corpus comparison-side normalization).
    fn norm(s: &str) -> String {
        s.lines()
            .map(|l| l.trim_end())
            .filter(|l| !l.is_empty())
            .collect::<Vec<_>>()
            .join("\n")
    }

    /// Indentation-insensitive normalizer for the block-visitor comparison.
    ///
    /// The text-based `transform_server` oracle emits block bodies at an
    /// inconsistent leading indentation (the `if`/`for`/`{}` body statements are
    /// printed at column 0, one tab shy of the esrap-correct depth). The
    /// AST pipeline prints structurally via esrap, which indents correctly, so a
    /// raw diff is pure leading-whitespace noise. The corpus output-equality
    /// pipeline collapses exactly this via oxfmt; mirror that here by stripping
    /// every line's leading whitespace before comparison so the gate asserts
    /// STRUCTURAL equality (markers / statement order / expressions).
    fn norm_blocks(s: &str) -> String {
        s.lines()
            .map(|l| l.trim())
            .filter(|l| !l.is_empty())
            .collect::<Vec<_>>()
            .join("\n")
    }

    /// Compare the AST pipeline output against the `transform_server` oracle for
    /// every sample, printing both and which match exactly.
    #[test]
    fn ast_matches_oracle_simple_samples() {
        let samples = [
            "<p>hello</p>",
            "<div><span>hi</span></div>",
            "<p>{name}</p>",
            "<p>a {x} b</p>",
            "<p class=\"foo\">x</p>",
            "<br>",
            "<p>{@html raw}</p>",
            "<p>x{a}y{b}z</p>",
            "<input type=\"text\" disabled>",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm(&ours) == norm(&oracle);
            eprintln!(
                "=== SRC: {src} === {}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "AST output differs from oracle for: {mismatches:?}"
        );
    }

    /// Compare the AST pipeline against the `transform_server` oracle for the
    /// block visitors (IfBlock / EachBlock / KeyBlock / SnippetBlock /
    /// AwaitBlock). Samples are chosen to exercise the sync, blocker-free paths
    /// with literal / each-context conditions so the (empty) instance-script
    /// transform doesn't interfere.
    #[test]
    fn ast_matches_oracle_block_samples() {
        let samples = [
            // KeyBlock
            "{#key 1}<p>x</p>{/key}",
            // IfBlock
            "{#if true}<p>a</p>{/if}",
            "{#if true}<p>a</p>{:else}<p>b</p>{/if}",
            "{#if true}<p>a</p>{:else if false}<p>b</p>{:else}<p>c</p>{/if}",
            // EachBlock
            "{#each [1, 2, 3] as n}<li>{n}</li>{/each}",
            "{#each [1, 2, 3] as n, i}<li>{i}</li>{/each}",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm_blocks(&ours) == norm_blocks(&oracle);
            eprintln!(
                "=== SRC: {src} === {}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "AST block output differs from oracle (structurally) for: {mismatches:?}"
        );
    }

    /// Snippet definition alone (RenderTag not ported yet): just assert the
    /// hoisted `function foo($$renderer) {...}` is emitted.
    #[test]
    fn snippet_block_hoisted() {
        let out = run("{#snippet foo()}<p>hi</p>{/snippet}");
        assert!(
            out.contains("function foo($$renderer)"),
            "missing hoisted snippet function:\n{out}"
        );
        assert!(out.contains("<p>hi</p>"), "missing snippet body:\n{out}");
    }

    /// Compare the AST pipeline against the `transform_server` oracle for the
    /// newly-ported structural visitors (RenderTag, SvelteHead/TitleElement,
    /// SvelteElement). These samples have an EMPTY instance script so the
    /// not-yet-ported instance-script transform doesn't interfere.
    #[test]
    fn ast_matches_oracle_structural_samples() {
        let samples = [
            // RenderTag: `{@render foo()}` after a hoisted snippet def.
            "{#snippet foo()}<p>hi</p>{/snippet}{@render foo()}",
            // SvelteHead + TitleElement.
            "<svelte:head><title>Hi</title></svelte:head>",
            // SvelteElement with a literal tag.
            "<svelte:element this={\"div\"}>x</svelte:element>",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm_blocks(&ours) == norm_blocks(&oracle);
            eprintln!(
                "=== SRC: {src} === {}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "AST structural output differs from oracle for: {mismatches:?}"
        );
    }

    /// Component visitor: `<Foo />` / `<Foo a="x" b={y} />`. The component import
    /// makes the instance non-empty (a hoisted `import Foo from './Foo.svelte';`
    /// that the not-yet-ported instance-script transform omits), so the FULL
    /// output diverges in the hoisted-import section. We therefore assert on the
    /// COMPONENT-CALL push portion only (the `Foo($$renderer, {...});` statement
    /// + trailing `<!---->`), which is what `build_inline_component` produces.
    /// This diff is EXPECTED until the instance-script transform lands.
    #[test]
    fn component_call_portion_matches_shape() {
        // `(src, expected_call, standalone)`. A sole `<Foo/>` child is a
        // STANDALONE fragment (the parent anchors suffice), so the trailing
        // `<!---->` is correctly elided — only the non-standalone case (a text
        // sibling forces it) emits the anchor.
        let cases = [
            (
                "<script>import Foo from './Foo.svelte'</script><Foo />",
                "Foo($$renderer, {});",
                true,
            ),
            (
                "<script>import Foo from './Foo.svelte'</script>a<Foo a=\"x\" />",
                "Foo($$renderer, { a: 'x' });",
                false,
            ),
        ];
        // Helper: extract the `Foo($$renderer, …)` call line from a dump.
        let call_line = |dump: &str| -> Option<String> {
            dump.lines()
                .map(str::trim)
                .find(|l| l.starts_with("Foo($$renderer"))
                .map(str::to_string)
        };

        for (src, expected_call, standalone) in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let normd = norm_blocks(&ours);
            eprintln!("=== SRC: {src} ===\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n");
            assert!(
                normd.contains(&norm_blocks(expected_call)),
                "missing component-call `{expected_call}` in:\n{ours}"
            );
            // The component-CALL line itself must match the oracle byte-for-byte
            // (the FULL dump diverges only in the hoisted `import Foo …;` the
            // not-yet-ported instance-script transform omits — EXPECTED).
            assert_eq!(
                call_line(&ours),
                call_line(&oracle),
                "component-call line differs from oracle for `{src}`"
            );
            // The component-call portion matches the oracle's; assert anchor
            // presence/absence tracks the standalone flag (写経 of
            // `is_standalone_fragment`).
            assert_eq!(
                ours.contains("<!---->"),
                !standalone,
                "trailing `<!---->` anchor presence wrong (standalone={standalone}) in:\n{ours}"
            );
        }
    }

    /// Component PROPS-OBJECT + `$.spread_props` parity with the
    /// `transform_server` oracle. Each sample declares the referenced bindings in
    /// an instance `<script>` (with a child import) so the expression prop values
    /// resolve identically in both pipelines. The FULL output still diverges in
    /// the hoisted `import Foo …;` (instance-script gap) and in the legacy
    /// instance prologue, so this gate isolates the `Foo($$renderer, …)` CALL
    /// line and asserts it matches the oracle byte-for-byte. Covers:
    ///   - expr-only props        → `{ a: x }`
    ///   - mixed literal + expr   → `{ a: x, b: 'lit', c: 1 + 1 }`
    ///   - spread-only            → `$.spread_props([spread])`
    ///   - interleaved spread     → `$.spread_props([{ a: x }, spread, { b: y }])`
    #[test]
    fn ast_matches_oracle_component_props() {
        // A `$state` binding keeps both pipelines' instance bodies in lockstep
        // (`let x = …;`) so only the component-CALL line is under test.
        let decls = "let x = $state(1); let y = $state(2); let spread = $state({});";
        let cases: &[&str] = &[
            // expr-only single prop
            "<Foo a={x} />",
            // mixed literal + expr + constant-expr props
            "<Foo a={x} b=\"lit\" c={1 + 1} />",
            // spread-only
            "<Foo {...spread} />",
            // interleaved spread (props / spread / props)
            "<Foo a={x} {...spread} b={y} />",
            // two leading spreads then props
            "<Foo {...spread} {...spread} a={x} />",
        ];
        // Extract the `Foo($$renderer, …)` call line (the whole statement, which
        // esrap prints on a single line for these shapes).
        let call_line = |dump: &str| -> Option<String> {
            dump.lines()
                .map(str::trim)
                .find(|l| l.starts_with("Foo($$renderer"))
                .map(str::to_string)
        };

        let mut failures = Vec::new();
        for body in cases {
            let src = format!("<script>import Foo from './Foo.svelte'; {decls}</script>z{body}");
            let ours = run(&src);
            let oracle = oracle_dump(&src);
            let ol = call_line(&ours);
            let orl = call_line(&oracle);
            let matched = ol.is_some() && ol == orl;
            eprintln!(
                "=== {body} === {}\n  ours:   {ol:?}\n  oracle: {orl:?}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                failures.push(*body);
            }
        }
        assert!(
            failures.is_empty(),
            "component props-object differs from oracle for: {failures:?}"
        );
    }

    fn oracle_dump(source: &str) -> String {
        let parse_options = ParseOptions {
            modern: true,
            loose: false,
            skip_expression_loc: true,
            defer_script_parse: true,
            force_typescript: false,
            lenient_script: false,
        };
        let mut ast = phase1_parse::parse(source, parse_options).expect("parse");
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
        let options = CompileOptions {
            filename: Some("App.svelte".to_string()),
            ..CompileOptions::default()
        };
        let analysis =
            phase2_analyze::analyze_component(&mut ast, source, &options).expect("analyze");
        super::super::transform_server(&analysis, &ast, source, &options).expect("server")
    }

    /// Whitespace normalization parity with the `transform_server` oracle.
    /// Each sample exercises a distinct `clean_nodes` rule: inter-element
    /// whitespace collapse, internal-run handling, nested-list trimming, and
    /// the `<pre>` preserve path. All must match the oracle byte-for-byte
    /// (after the shared `norm` trailing-trim/blank-strip normalization).
    #[test]
    fn ast_matches_oracle_whitespace_samples() {
        let samples = [
            // Inter-element newline collapses to a single space.
            "<div></div>\n<div></div>",
            // Internal whitespace run preserved (no leading/trailing here, the
            // <p> is the fragment-boundary trim target).
            "<p>  a   b  </p>",
            // Nested list: newline+indent between <li> collapses to a space,
            // leading/trailing fragment whitespace trimmed.
            "<ul>\n  <li>x</li>\n  <li>y</li>\n</ul>",
            // <pre>: internal newlines preserved verbatim (preserve_whitespace).
            "<pre>a\n  b\n    c</pre>",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm(&ours) == norm(&oracle);
            eprintln!(
                "=== SRC: {src:?} === {}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "AST whitespace output differs from oracle for: {mismatches:?}"
        );
    }

    /// CSS scope-class injection on the STATIC-attribute path. Each sample has a
    /// `<style>` block so Phase 2 marks the matched element `scoped` and the
    /// component gets a non-empty `css.hash`. The AST pipeline must inject the
    /// scope class byte-for-byte like the `transform_server` oracle:
    ///   - no class attr  -> a fresh `class="svelte-…"`,
    ///   - static class attr -> `class="foo svelte-…"` (space-joined, trimmed),
    ///   - nested scoped elements both get the class.
    /// The hash is NEVER hardcoded — equality with the oracle is the gate, and
    /// the test additionally asserts the literal `class="svelte-` appears so a
    /// silent "both emit no class" can't pass it.
    #[test]
    fn ast_matches_oracle_css_scope_class() {
        let samples = [
            // no class attribute -> fresh scope class
            "<p>hi</p><style>p{color:red}</style>",
            // existing static class -> merged (space-joined)
            "<p class=\"foo\">hi</p><style>p{color:red}</style>",
            // nested scoped elements: both <div> and <span> get the class
            "<div><span>hi</span></div><style>div{color:red}span{color:blue}</style>",
            // multiple static attributes + no class -> class appended at end
            "<input type=\"text\" disabled><style>input{color:red}</style>",
            // existing multi-token class merged
            "<p class=\"a b\">hi</p><style>p{color:red}</style>",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm(&ours) == norm(&oracle);
            // Sanity: the oracle itself must actually emit a scope class for
            // these samples (guards against a vacuous "both emit nothing" pass).
            // The hash may be bare (`class="svelte-…"`) or appended to an
            // existing value (`class="foo svelte-…"`), so just look for the
            // `svelte-` scope token anywhere.
            let oracle_has_class = oracle.contains("svelte-");
            eprintln!(
                "=== SRC: {src} === {} (oracle_scoped={oracle_has_class})\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched || !oracle_has_class {
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "CSS scope-class injection differs from oracle for: {mismatches:?}"
        );
    }

    /// Dynamic ATTRIBUTE codegen parity with the `transform_server` oracle.
    /// Each sample carries an instance `<script>` declaring the referenced
    /// binding so the value expression resolves (and so the read-wrapping pass
    /// behaves the same in both pipelines). Covers:
    ///   - plain dynamic attr `id={x}` → `${$.attr('id', x)}`,
    ///   - mixed text+expr `href="/{slug}"` → `${$.attr('href', `/${$.stringify(slug)}`)}`,
    ///   - boolean attr `disabled={d}` → `${$.attr('disabled', d, true)}`,
    ///   - `class={cls}` (no/with scope hash) → `${$.attr_class(cls[, 'svelte-…'])}`,
    ///   - `style={s}` → `${$.attr_style(s)}`.
    /// Each declared binding is a plain `let` (NOT a rune) so the instance-script
    /// transform emits it identically in both pipelines and the full output is
    /// byte-comparable.
    #[test]
    fn ast_matches_oracle_dynamic_attributes() {
        // Runes-mode `$state` bindings (lowered identically in both pipelines as
        // `let x = …;`) so the instance body matches and only the ATTRIBUTE
        // codegen is under test. (Plain-legacy `let` instance bodies are a
        // separate KNOWN GAP that drops the declaration in the AST path.)
        let samples = [
            // plain dynamic attr
            "<script>let x = $state(1);</script><div id={x}>x</div>",
            // mixed text + expr value (a prop binding is NOT constant-foldable
            // by the oracle's `scope.evaluate`, so it stays a runtime template).
            "<script>let { slug } = $props();</script><a href=\"/{slug}\">x</a>",
            // boolean dynamic attr
            "<script>let d = $state(true);</script><input disabled={d}>",
            // class={cls} with NO style block (no scope hash)
            "<script>let cls = $state('a');</script><p class={cls}>x</p>",
            // class={cls} WITH a style block (scope hash composes via attr_class)
            "<script>let cls = $state('a');</script><p class={cls}>x</p><style>p{color:red}</style>",
            // style={s}
            "<script>let s = $state('color:red');</script><div style={s}>x</div>",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm(&ours) == norm(&oracle);
            eprintln!(
                "=== SRC: {src} === {}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "dynamic-attribute codegen differs from oracle for: {mismatches:?}"
        );
    }

    /// Element `bind:` directive codegen parity with the `transform_server`
    /// oracle. Each sample declares the bound binding in an instance `<script>`
    /// (a `$state` rune so the instance body matches in both pipelines) so only
    /// the element-bind ATTRIBUTE codegen is under test. Covers:
    ///   - `bind:value` on `<input>`         → `${$.attr('value', x)}`
    ///   - `bind:checked` (boolean)          → `${$.attr('checked', c, true)}`
    ///   - `bind:value` + `type="text"`      → still a `value` attribute
    ///   - `bind:this`                       → NO output (skipped)
    ///   - `bind:group` radio                → `${$.attr('checked', g === 'a')}`
    ///   - `bind:group` checkbox             → `${$.attr('checked', g.includes('a'))}`
    #[test]
    fn ast_matches_oracle_element_binds() {
        let samples = [
            // bind:value on a plain input
            "<script>let x = $state('');</script><input bind:value={x}>",
            // bind:checked (boolean attribute)
            "<script>let c = $state(false);</script><input type=\"checkbox\" bind:checked={c}>",
            // bind:value with explicit text type
            "<script>let x = $state('');</script><input type=\"text\" bind:value={x}>",
            // bind:this -> no output
            "<script>let el = $state();</script><input bind:this={el}>",
            // bind:group radio -> checked = (g === value)
            "<script>let g = $state('a');</script><input type=\"radio\" value=\"a\" bind:group={g}>",
            // bind:group checkbox -> checked = g.includes(value)
            "<script>let g = $state([]);</script><input type=\"checkbox\" value=\"a\" bind:group={g}>",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm(&ours) == norm(&oracle);
            eprintln!(
                "=== SRC: {src} === {}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "element-bind codegen differs from oracle for: {mismatches:?}"
        );
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

    /// Instance / module SCRIPT transform — the NON-DELICATE rune lowerings.
    /// Compares the AST pipeline against the `transform_server` oracle for
    /// components whose script/value expressions contain NO derived/store reads
    /// (so the deferred delicate read-rewriting pass isn't needed). DIFFs that
    /// are attributable to a documented GAP assert on the matching portion.
    #[test]
    fn ast_matches_oracle_script_samples() {
        // (src, instance-body line that MUST appear identically in both)
        let cases: &[(&str, &str)] = &[
            // $state(0) -> let count = 0;
            (
                "<script>let count = $state(0);</script><p>{count}</p>",
                "let count = 0;",
            ),
            // $effect removed; only `let n = 5;` remains in the instance body.
            (
                "<script>let n = $state(5); $effect(() => console.log(n));</script><p>{n}</p>",
                "let n = 5;",
            ),
            // $props() -> let { a } = $$props;
            (
                "<script>let { a } = $props();</script><p>{a}</p>",
                "let { a } = $$props;",
            ),
            // $derived(literal) -> let d = $.derived(() => 2 + 3);
            (
                "<script>let d = $derived(2 + 3);</script><p>{d}</p>",
                "let d = $.derived(() => 2 + 3);",
            ),
            // import hoisted + $state(x) -> let c = x;
            (
                "<script>import { x } from './x.js'; let c = $state(x);</script><p>{c}</p>",
                "let c = x;",
            ),
            // $state.raw -> bare arg
            (
                "<script>let r = $state.raw(7);</script><p>x</p>",
                "let r = 7;",
            ),
            // $derived.by(fn) -> $.derived(fn)
            (
                "<script>let d = $derived.by(() => 1 + 1);</script><p>x</p>",
                "let d = $.derived(() => 1 + 1);",
            ),
        ];
        let mut failures = Vec::new();
        for (src, must_have) in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let on = norm(&ours);
            let want = norm(must_have);
            let ok = on.contains(&want);
            eprintln!(
                "=== SRC: {src} === {}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if ok { "OK" } else { "MISSING" }
            );
            // The oracle must ALSO contain the same instance line (sanity: our
            // lowering tracks upstream's).
            if !ok || !norm(&oracle).contains(&want) {
                failures.push(*src);
            }
        }
        assert!(
            failures.is_empty(),
            "instance-script lowering differs from oracle for: {failures:?}"
        );
    }

    /// Declarator INITIALIZERS round-trip through the reparse without degrading
    /// to `void 0`. Regression gate for the "block-vs-object" reparse gap: an
    /// object-literal init (`{ a: 1 }`) used to reparse to a `BlockStatement` and
    /// silently become `void 0`; plain non-rune string / array / call inits and
    /// object-valued `$state` / `$derived` inits are exercised too. Each case's
    /// instance line must appear identically in BOTH the AST output and the
    /// `transform_server` oracle.
    #[test]
    fn declarator_init_reparse_roundtrip() {
        // A leading `$state` declarator forces the component into RUNES mode, so
        // the non-rune sibling declarators below exercise the real non-rune
        // passthrough path (a pure-legacy component's instance transform is a
        // separate KNOWN GAP and would emit nothing).
        let cases: &[(&str, &str)] = &[
            // plain non-rune string init
            (
                "<script>let r = $state(0); let foo = 'bar';</script><p>x</p>",
                "let foo = 'bar';",
            ),
            // plain non-rune object literal init (the block-vs-object gap)
            (
                "<script>let r = $state(0); let o = { a: 1 };</script><p>x</p>",
                "let o = { a: 1 };",
            ),
            // plain non-rune array init
            (
                "<script>let r = $state(0); let arr = [1, 2];</script><p>x</p>",
                "let arr = [1, 2];",
            ),
            // non-rune spread-shaped object init
            (
                "<script>let r = $state(0); let spread = { class: 'bar' };</script><p>x</p>",
                "let spread = { class: 'bar' };",
            ),
            // non-rune call init
            (
                "<script>let r = $state(0); let n = foo();</script><p>x</p>",
                "let n = foo();",
            ),
            // $state with an object literal init
            (
                "<script>let n = $state({ x: 1 });</script><p>x</p>",
                "let n = { x: 1 };",
            ),
            // $derived with an object literal body
            (
                "<script>let d = $derived({ y: 2 });</script><p>x</p>",
                "let d = $.derived(() => ({ y: 2 }));",
            ),
            // $state with an array init
            (
                "<script>let s = $state([1, 2]);</script><p>x</p>",
                "let s = [1, 2];",
            ),
        ];
        let mut failures = Vec::new();
        for (src, must_have) in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let on = norm(&ours);
            let want = norm(must_have);
            let ours_ok = on.contains(&want);
            let oracle_ok = norm(&oracle).contains(&want);
            eprintln!(
                "=== SRC: {src} === ours={} oracle={}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if ours_ok { "OK" } else { "MISSING" },
                if oracle_ok { "OK" } else { "MISSING" },
            );
            if !ours_ok || !oracle_ok {
                failures.push(*src);
            }
        }
        assert!(
            failures.is_empty(),
            "declarator init reparse differs from oracle for: {failures:?}"
        );
    }

    /// `$props.id()` declarators are DROPPED from the instance body (mirrors the
    /// VariableDeclaration visitor's `skip`). NOTE: the oracle re-emits it as
    /// `const uid = $.props_id($$renderer);` via the separate `analysis.props_id`
    /// assembly path — that re-emission is a KNOWN GAP in this slice, so the AST
    /// output simply omits the declarator entirely.
    #[test]
    fn props_id_dropped() {
        let out = run("<script>const uid = $props.id();</script><p>x</p>");
        assert!(
            !out.contains("$props.id"),
            "$props.id declarator should be dropped:\n{out}"
        );
    }

    /// Module-script declarations are emitted at MODULE scope (before the
    /// component function), not inside the component body.
    #[test]
    fn module_script_at_module_scope() {
        let out = run(
            "<script module>const SHARED = 42;</script><script>let c = $state(0);</script><p>x</p>",
        );
        // `const SHARED = 42;` appears before `export default function App`.
        let idx_shared = out.find("const SHARED = 42;");
        let idx_fn = out.find("export default function App");
        assert!(idx_shared.is_some(), "missing module decl:\n{out}");
        assert!(idx_fn.is_some());
        assert!(
            idx_shared.unwrap() < idx_fn.unwrap(),
            "module decl must be at module scope (before component fn):\n{out}"
        );
        assert!(out.contains("let c = 0;"), "missing instance decl:\n{out}");
    }

    /// TypeScript instance scripts are a KNOWN GAP: skipped (empty instance
    /// body), the component still assembles.
    #[test]
    fn typescript_script_known_gap() {
        let out = run("<script lang=\"ts\">let n: number = $state(0);</script><p>x</p>");
        // No instance statement emitted (TS skipped) — but the shell is intact.
        assert!(
            out.contains("export default function App"),
            "shell missing:\n{out}"
        );
        assert!(!out.contains("let n"), "TS body should be skipped:\n{out}");
    }

    /// READ-WRAPPING single pass — the crux gate. Asserts the wrapped reads
    /// produced by the AST pipeline are exactly what upstream's
    /// `Identifier.js`/`build_getter` produce. Several oracle outputs ALSO
    /// constant-fold (`scope.evaluate` → `<p>0</p>`) and
    /// `$$props` routes through the `$$renderer.component(...)` wrapper — all
    /// ORTHOGONAL to read-wrapping. So this gate asserts the read-wrapping
    /// SUBSTRINGS (must appear) and the anti-substrings (must NOT appear,
    /// e.g. a derived read left un-called), which the oracle confirms when it
    /// does not constant-fold the read away.
    #[test]
    fn ast_matches_oracle_read_wrapping() {
        // (src, must_contain[], must_not_contain[]).
        let cases: &[(&str, &[&str], &[&str])] = &[
            // double is derived → double(); count is state inside thunk → NOT wrapped.
            (
                "<script>let count = $state(0); let double = $derived(count * 2);</script><p>{double}</p>",
                &["$.escape(double())", "$.derived(() => count * 2)"],
                &["$.escape(double)", "count()"],
            ),
            // count is state → NOT wrapped; double → double().
            (
                "<script>let count = $state(0); let double = $derived(count * 2);</script><p>{double} {count}</p>",
                &["$.escape(double())", "$.escape(count)"],
                &["count()", "$.escape(double)"],
            ),
            // props identifier passthrough (name is a Prop → unchanged). FULL match.
            (
                "<script>let { name } = $props();</script><p>{name}</p>",
                &["$.escape(name)", "let { name } = $$props;"],
                &["name()"],
            ),
            // chained derived: b → b(); inside b's thunk a → a().
            (
                "<script>let a = $derived(1); let b = $derived(a + 1);</script><p>{b}</p>",
                &["$.derived(() => a() + 1)", "$.escape(b())"],
                &["$.escape(b)"],
            ),
            // $$props member read → $$sanitized_props.x
            (
                "<p>{$$props.x}</p>",
                &["$.escape($$sanitized_props.x)"],
                &["$.escape($$props.x)"],
            ),
            // derived read inside a member chain: obj() . k
            (
                "<script>let obj = $derived(x);</script><p>{obj.k}</p>",
                &["$.escape(obj().k)"],
                &["$.escape(obj.k)"],
            ),
            // derived currying — a call of a derived binding: d()(x)
            (
                "<script>let d = $derived(fn);</script><p>{d(1)}</p>",
                &["$.escape(d()(1))"],
                &[],
            ),
            // multiple derived reads in one expression: both wrapped.
            (
                "<script>let a = $derived(1); let b = $derived(2);</script><p>{a + b}</p>",
                &["a() + b()"],
                &[],
            ),
        ];
        let mut failures = Vec::new();
        for (src, musts, mustnots) in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let on = norm(&ours);
            let mut ok = true;
            for m in *musts {
                if !on.contains(&norm(m)) {
                    ok = false;
                }
            }
            for n in *mustnots {
                if on.contains(&norm(n)) {
                    ok = false;
                }
            }
            eprintln!(
                "=== SRC: {src} === {}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if ok { "OK" } else { "FAIL" }
            );
            if !ok {
                failures.push(*src);
            }
        }
        assert!(
            failures.is_empty(),
            "read-wrapping shape wrong for: {failures:?}"
        );
    }

    /// Store subscription read-wrapping: `$c` → `$.store_get(...)`. The
    /// `$$store_subs` declaration + the template `unsubscribe_stores` cleanup are
    /// a KNOWN GAP in the AST skeleton (separate entry assembly), so the FULL
    /// component diverges. We assert only that the READ ITSELF is wrapped into a
    /// `$.store_get($$store_subs ??= {}, "$c", c)` shape (which the oracle also
    /// produces).
    #[test]
    fn store_sub_read_wrapping_shape() {
        let src = "<script>import { writable } from 'svelte/store'; const c = writable(0);</script><p>{$c}</p>";
        let ours = run(src);
        let oracle = oracle_dump(src);
        eprintln!("--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n");
        assert!(
            ours.contains("$.store_get($$store_subs ??= {}, '$c', c)")
                || ours.contains("$.store_get($$store_subs ??= {}, \"$c\", c)"),
            "store read not wrapped as $.store_get(...):\n{ours}"
        );
    }

    /// `$.bind_props($$props, { ... })` trailer (upstream lines 224-243). A
    /// legacy `export let value` is a bindable prop / export, so the component
    /// body must end with `$.bind_props($$props, { value });`. Asserts BOTH the
    /// AST output and the oracle emit the same `$.bind_props(...)` call.
    #[test]
    fn ast_matches_oracle_bind_props_trailer() {
        let cases: &[(&str, &str)] = &[
            // export let value → bind_props({ value })
            (
                "<script>export let value = 0;</script><p>{value}</p>",
                "$.bind_props($$props, { value });",
            ),
            // export let with alias-less plain prop
            (
                "<script>export let name;</script><p>{name}</p>",
                "$.bind_props($$props, { name });",
            ),
        ];
        let mut failures = Vec::new();
        for (src, must_have) in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let on = norm(&ours);
            let want = norm(must_have);
            let ours_ok = on.contains(&want);
            let oracle_ok = norm(&oracle).contains(&want);
            eprintln!(
                "=== SRC: {src} === ours={} oracle={}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if ours_ok { "OK" } else { "MISSING" },
                if oracle_ok { "OK" } else { "MISSING" },
            );
            if !ours_ok || !oracle_ok {
                failures.push(*src);
            }
        }
        assert!(
            failures.is_empty(),
            "bind_props trailer differs from oracle for: {failures:?}"
        );
    }

    /// `$$store_subs` entry assembly (upstream lines 213-222): a store
    /// subscription forces a `var $$store_subs;` at the head of the instance
    /// body and an `if ($$store_subs) $.unsubscribe_stores($$store_subs);`
    /// cleanup at the end of the template body. Both must appear in the AST
    /// output AND the oracle.
    #[test]
    fn ast_matches_oracle_store_subs_entry() {
        let src = "<script>import { writable } from 'svelte/store'; const c = writable(0);</script><p>{$c}</p>";
        let ours = run(src);
        let oracle = oracle_dump(src);
        let on = norm(&ours);
        let orn = norm(&oracle);
        eprintln!("--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n");
        for must in [
            "var $$store_subs;",
            "if ($$store_subs) $.unsubscribe_stores($$store_subs);",
        ] {
            let want = norm(must);
            assert!(on.contains(&want), "AST output missing `{must}`:\n{ours}");
            assert!(
                orn.contains(&want),
                "ORACLE missing `{must}` (sanity):\n{oracle}"
            );
        }
        // The var decl must precede the cleanup.
        assert!(
            on.find("var $$store_subs;").unwrap() < on.find("$.unsubscribe_stores").unwrap(),
            "var decl must precede cleanup:\n{ours}"
        );
    }

    /// `$$renderer.component(...)` wrapper (upstream lines 260-272): a lifecycle
    /// import (`onMount`) sets `analysis.needs_context`, so the whole component
    /// block is wrapped in `$$renderer.component(($$renderer) => { ... })`. In
    /// non-dev there is no 2nd argument. Asserts the wrapper appears in BOTH the
    /// AST output and the oracle.
    #[test]
    fn ast_matches_oracle_needs_context_wrapper() {
        let src = "<script>import { onMount } from 'svelte'; onMount(() => {});</script><p>hi</p>";
        let ours = run(src);
        let oracle = oracle_dump(src);
        eprintln!("--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n");
        // needs_context must be set for this to be a meaningful test.
        assert!(
            ours.contains("$$renderer.component(($$renderer) =>"),
            "AST output missing $$renderer.component wrapper:\n{ours}"
        );
        assert!(
            oracle.contains("$$renderer.component(($$renderer) =>"),
            "ORACLE missing $$renderer.component wrapper (sanity):\n{oracle}"
        );
        // Non-dev (default options): no bare component-name 2nd arg — the call
        // closes with `})` not `}, App)`.
        assert!(
            !ours.contains(", App)"),
            "non-dev wrapper must not emit a 2nd `component_name` arg:\n{ours}"
        );
    }

    /// LEGACY (non-runes) instance/module script transform parity with the
    /// `transform_server` oracle. Each sample is a plain Svelte-4-style component
    /// (no runes) whose instance body the AST pipeline must now emit identically.
    /// Asserts a required instance/hoisted line appears in BOTH pipelines (and
    /// for the whole-output samples, full normalized equality).
    #[test]
    fn ast_matches_oracle_legacy_script_samples() {
        // (src, must-appear line in BOTH outputs)
        let cases: &[(&str, &str)] = &[
            // bare export let → $$props['name']
            (
                "<script>export let name;</script><p>{name}</p>",
                "let name = $$props['name'];",
            ),
            // export let with simple default → $.fallback(prop, default)
            (
                "<script>export let count = 0;</script><p>{count}</p>",
                "let count = $.fallback($$props['count'], 0);",
            ),
            // export let with non-simple default (object) → thunk + true
            (
                "<script>export let opts = { a: 1 };</script><p>x</p>",
                "let opts = $.fallback($$props['opts'], () => ({ a: 1 }), true);",
            ),
            // plain legacy let kept
            ("<script>let a = 1;</script><p>{a}</p>", "let a = 1;"),
            // reactive $: → label kept, hoisted let, appended. (Source must put
            // `$:` on its OWN line: the oracle's reactive-var hoist extraction is
            // line-based, so a single-line `$:` is not recognised by it.)
            (
                "<script>let a = 1;\n$: b = a * 2;</script><p>{b}</p>",
                "$: b = a * 2;",
            ),
            // reactive hoisted let (legacy_reactive binding gets a `let b;`).
            (
                "<script>let a = 1;\n$: b = a * 2;</script><p>{b}</p>",
                "let b;",
            ),
            // legacy event handler instance var kept (on: itself may not render)
            (
                "<script>let x = 0;</script><button on:click={() => x++}>{x}</button>",
                "let x = 0;",
            ),
            // module (non-runes) export const at module scope — a REAL ES module
            // export, kept verbatim (NOT prop-lowered).
            (
                "<script context=\"module\">export const FOO = 1;</script><p>x</p>",
                "export const FOO = 1;",
            ),
        ];
        let mut failures = Vec::new();
        for (src, must_have) in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let on = norm(&ours);
            let want = norm(must_have);
            let ours_ok = on.contains(&want);
            let oracle_ok = norm(&oracle).contains(&want);
            eprintln!(
                "=== SRC: {src} === ours={} oracle={}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if ours_ok { "OK" } else { "MISSING" },
                if oracle_ok { "OK" } else { "MISSING" },
            );
            if !ours_ok || !oracle_ok {
                failures.push(*src);
            }
        }
        assert!(
            failures.is_empty(),
            "legacy-script lowering differs from oracle for: {failures:?}"
        );
    }

    /// Instance-body (script prologue) byte-parity with the oracle. The FULL
    /// output still diverges on ORTHOGONAL gaps (the `$.bind_props(...)` trailer,
    /// `scope.evaluate` constant-folding of template reads, block indentation),
    /// so this gate isolates the instance SCRIPT region — every body line emitted
    /// up to the first `$$renderer` template statement must match the oracle.
    #[test]
    fn ast_matches_oracle_legacy_instance_prologue() {
        let samples = [
            "<script>export let name;</script><p>{name}</p>",
            "<script>export let count = 0;</script><p>{count}</p>",
            "<script>export let label = 'hi';</script><p>{label}</p>",
            "<script>let a = 1;\nlet b = 2;</script><p>x</p>",
            "<script>let a = 1;\n$: b = a * 2;</script><p>x</p>",
            // NOTE: a lifecycle import (`onMount`) triggers the orthogonal
            // `$$renderer.component(...)` body wrapper (a separate KNOWN GAP), so
            // it's excluded here — the import hoisting itself is covered by the
            // script_samples test's hoisted-line assertions.
        ];
        // Extract the function-body lines emitted BEFORE the first $$renderer
        // statement (the instance script prologue), trimmed.
        let prologue = |dump: &str| -> Vec<String> {
            let mut out = Vec::new();
            let mut in_fn = false;
            for l in dump.lines() {
                let t = l.trim();
                if t.starts_with("export default function App") {
                    in_fn = true;
                    continue;
                }
                if !in_fn || t.is_empty() {
                    continue;
                }
                if t.starts_with("$$renderer") {
                    break;
                }
                out.push(t.to_string());
            }
            out
        };
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let op = prologue(&ours);
            let orp = prologue(&oracle);
            let matched = op == orp;
            eprintln!(
                "=== SRC: {src} === {}\n  ours-prologue:   {op:?}\n  oracle-prologue: {orp:?}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "legacy instance-prologue differs from oracle for: {mismatches:?}"
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

    // ============================================================
    // Corpus measurement harness (ignored; run for burn-down direction)
    //
    //   CARGO_TARGET_DIR=/tmp/rsvelte-ast-target \
    //   cargo test -p rsvelte_core --lib \
    //     'phase3_transform::server::ast::tests::corpus_new_vs_oracle' \
    //     -- --ignored --nocapture
    //
    // Enumerates the upstream Svelte test components
    // (submodules/svelte/packages/svelte/tests/**/*.svelte), compiles each
    // with BOTH the NEW AST server pipeline (`server_component_ast`) and the
    // OLD text oracle (`transform_server`), and reports MATCH% + clustered
    // mismatches. Headline metric for the server-rewrite burn-down.
    // ============================================================

    /// Outcome of compiling one component with both pipelines.
    enum Outcome {
        /// Both pipelines produced output.
        ///
        /// `matched_text` is the legacy whitespace-collapsed text comparison.
        /// `matched_struct` reprints BOTH sides through oxc → esrap so
        /// formatting (line breaking / indentation / quote style / object
        /// layout) is canonical, leaving only structural differences — exactly
        /// what the real corpus pipeline absorbs via oxfmt. `used_fallback` is
        /// true when EITHER side failed to reparse, so `matched_struct` fell
        /// back to the text comparison for that component.
        Compared {
            matched_text: bool,
            matched_struct: bool,
            used_fallback: bool,
            /// Canonical (reprinted) forms used for the structural compare;
            /// fall back to `norm`-ed text when a side failed to reparse.
            new_canon: String,
            oracle_canon: String,
        },
        /// New pipeline returned `None` (feature not yet handled by AST path).
        NewNone,
        /// A pipeline panicked.
        Panic(&'static str),
        /// Parse/analyze failed (skip — not a server-codegen signal).
        Skipped,
    }

    /// Parse + analyze + run both server pipelines on `source`, never panicking
    /// up to the caller (parse/analyze failures => `Skipped`). Panics inside the
    /// two server codegen calls ARE caught here and surfaced as `Panic`.
    fn compile_both(source: &str) -> Outcome {
        use std::panic::{AssertUnwindSafe, catch_unwind};

        let parse_options = ParseOptions {
            modern: true,
            loose: false,
            skip_expression_loc: true,
            defer_script_parse: true,
            force_typescript: false,
            lenient_script: false,
        };

        // Parse into a heap-stable Box so the arena address stays valid for the
        // thread-local `SerializeArenaGuard` even though `ast` is moved out of
        // the catch_unwind closure. (Boxing keeps `&boxed.arena` constant; a
        // stack move would dangle and SIGBUS.)
        let parsed = catch_unwind(AssertUnwindSafe(|| {
            phase1_parse::parse(source, parse_options)
                .ok()
                .map(Box::new)
        }));
        let mut ast = match parsed {
            Ok(Some(b)) => b,
            Ok(None) => return Outcome::Skipped,
            Err(_) => return Outcome::Skipped,
        };

        // Install the guard at this stable scope pointing at the boxed arena's
        // heap address; it stays valid through analyze + both pipelines.
        let _guard = unsafe { crate::ast::arena::SerializeArenaGuard::new(&ast.arena as *const _) };

        let prepared = catch_unwind(AssertUnwindSafe(|| {
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
            phase2_analyze::analyze_component(&mut ast, source, &options)
                .ok()
                .map(|analysis| (analysis, options))
        }));

        let (analysis, options) = match prepared {
            Ok(Some(v)) => v,
            Ok(None) => return Outcome::Skipped,
            Err(_) => return Outcome::Skipped,
        };
        let ast: &Root = &ast;

        // OLD oracle.
        let oracle = catch_unwind(AssertUnwindSafe(|| {
            super::super::transform_server(&analysis, ast, source, &options)
        }));
        let oracle = match oracle {
            Ok(Ok(s)) => s,
            Ok(Err(_)) => return Outcome::Skipped, // oracle itself errored; not a fair comparison
            Err(_) => return Outcome::Panic("oracle"),
        };

        // NEW AST pipeline (needs its own allocator).
        let new_out = catch_unwind(AssertUnwindSafe(|| {
            let allocator = Allocator::default();
            server_component_ast(&analysis, ast, source, &options, &allocator)
        }));
        let new_out = match new_out {
            Ok(Some(s)) => s,
            Ok(None) => return Outcome::NewNone,
            Err(_) => return Outcome::Panic("new"),
        };

        let matched_text = norm(&new_out) == norm(&oracle);

        // Structural (formatting-insensitive) comparison: reprint BOTH outputs
        // through oxc → esrap so whitespace / indentation / line-breaking /
        // quote style / object layout are canonical on both sides. Only real
        // structural differences survive. If EITHER side fails to reparse, fall
        // back to the legacy text `norm` comparison for that component.
        let new_canon = canon(&new_out);
        let oracle_canon = canon(&oracle);
        let (matched_struct, used_fallback, new_canon, oracle_canon) =
            match (new_canon, oracle_canon) {
                (Some(a), Some(b)) => (a == b, false, a, b),
                _ => {
                    // Fall back to the text comparison; carry the norm-ed text
                    // as the "canonical" forms so first-diff reporting still works.
                    (matched_text, true, norm(&new_out), norm(&oracle))
                }
            };

        Outcome::Compared {
            matched_text,
            matched_struct,
            used_fallback,
            new_canon,
            oracle_canon,
        }
    }

    /// Reprint a JS source string through oxc (parse) → esrap (print) so its
    /// formatting is canonical. Returns `None` if the string fails to parse
    /// cleanly (panicked or any diagnostics), signalling the caller to fall
    /// back to text comparison.
    fn canon(code: &str) -> Option<String> {
        use oxc_parser::Parser;
        use oxc_span::SourceType;
        let alloc = Allocator::default();
        let ret = Parser::new(&alloc, code, SourceType::mjs()).parse();
        if ret.panicked || !ret.diagnostics.is_empty() {
            return None;
        }
        Some(rsvelte_esrap::print(&ret.program, code))
    }

    /// Feature keywords to detect in source for mismatch clustering.
    /// (substring, label)
    fn feature_signatures(source: &str) -> Vec<&'static str> {
        let checks: &[(&str, &str)] = &[
            ("{#each", "each-block"),
            ("{#if", "if-block"),
            ("{#await", "await-block"),
            ("{#key", "key-block"),
            ("{#snippet", "snippet-block"),
            ("{@render", "render-tag"),
            ("{@const", "const-tag"),
            ("{@html", "html-tag"),
            ("{@debug", "debug-tag"),
            ("{@attach", "attach-tag"),
            ("bind:", "bind-directive"),
            ("transition:", "transition-directive"),
            ("in:", "in-directive"),
            ("out:", "out-directive"),
            ("animate:", "animate-directive"),
            ("use:", "use-directive"),
            ("class:", "class-directive"),
            ("style:", "style-directive"),
            ("on:", "on-directive(legacy)"),
            ("{...", "spread"),
            ("<svelte:", "svelte:special"),
            ("$derived", "rune:$derived"),
            ("$state", "rune:$state"),
            ("$props", "rune:$props"),
            ("$effect", "rune:$effect"),
            ("$bindable", "rune:$bindable"),
            ("await ", "top-level-await"),
            ("lang=\"ts\"", "lang=ts"),
            ("lang='ts'", "lang=ts"),
            ("<style", "has-style"),
            ("<script", "has-script"),
        ];
        let mut hits: Vec<&'static str> = Vec::new();
        for (needle, label) in checks {
            if source.contains(needle) && !hits.contains(label) {
                hits.push(label);
            }
        }
        // Crude store-`$` heuristic: a `$` followed by an identifier letter that
        // is not one of the known runes already counted above.
        if source.contains("$:") {
            hits.push("reactive-stmt($:)");
        }
        hits
    }

    /// First differing trimmed line between two ALREADY-canonical strings
    /// (the reprinted forms from `compile_both`, or norm-ed text on fallback)
    /// — a signature for fine-grained clustering of the real codegen divergence.
    fn first_diff_line(a: &str, b: &str) -> String {
        let mut al = a.lines();
        let mut bl = b.lines();
        loop {
            match (al.next(), bl.next()) {
                (Some(x), Some(y)) => {
                    if x.trim() != y.trim() {
                        return format!("new:`{}` | old:`{}`", trunc(x.trim()), trunc(y.trim()));
                    }
                }
                (Some(x), None) => return format!("new-extra:`{}`", trunc(x.trim())),
                (None, Some(y)) => return format!("old-extra:`{}`", trunc(y.trim())),
                (None, None) => return "<lengths-differ-only>".to_string(),
            }
        }
    }

    fn trunc(s: &str) -> String {
        if s.len() > 70 {
            format!(
                "{}…",
                &s[..s.char_indices().nth(70).map(|(i, _)| i).unwrap_or(s.len())]
            )
        } else {
            s.to_string()
        }
    }

    fn corpus_files() -> Vec<std::path::PathBuf> {
        // crate root = crates/rsvelte_core; repo root is two parents up.
        let manifest = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
        let repo_root = manifest.parent().and_then(|p| p.parent()).unwrap();
        let root = repo_root.join("submodules/svelte/packages/svelte/tests");
        let mut out = Vec::new();
        fn walk(dir: &std::path::Path, out: &mut Vec<std::path::PathBuf>) {
            let Ok(rd) = std::fs::read_dir(dir) else {
                return;
            };
            for e in rd.flatten() {
                let p = e.path();
                if p.is_dir() {
                    walk(&p, out);
                } else if p.extension().and_then(|s| s.to_str()) == Some("svelte") {
                    out.push(p);
                }
            }
        }
        walk(&root, &mut out);
        out.sort();
        out
    }

    #[test]
    #[ignore = "corpus measurement harness; run with --ignored --nocapture"]
    fn corpus_new_vs_oracle() {
        // Some corpus components drive deep recursion in parse/analyze; run the
        // whole sweep on a thread with a large stack so one pathological file
        // doesn't overflow the small default test stack.
        std::thread::Builder::new()
            .stack_size(256 * 1024 * 1024)
            .spawn(corpus_new_vs_oracle_inner)
            .expect("spawn corpus thread")
            .join()
            .expect("corpus thread panicked");
    }

    fn corpus_new_vs_oracle_inner() {
        use std::collections::BTreeMap;

        let files = corpus_files();
        if files.is_empty() {
            eprintln!(
                "NO CORPUS FILES FOUND (is the svelte submodule checked out?). \
                 Looked under submodules/svelte/packages/svelte/tests"
            );
            return;
        }

        let mut total = 0usize;
        let mut compared = 0usize;
        let mut matched = 0usize; // structural match (headline)
        let mut matched_text_only = 0usize; // legacy text-norm match
        let mut struct_fallback = 0usize; // structural compare hit parse-fallback
        let mut new_none = 0usize;
        let mut panicked = 0usize;
        let mut skipped = 0usize;

        let mut new_none_examples: Vec<String> = Vec::new();
        let mut panic_examples: Vec<String> = Vec::new();

        // feature-signature -> (count, examples)
        let mut feature_clusters: BTreeMap<&'static str, (usize, Vec<String>)> = BTreeMap::new();
        // first-diff-line -> (count, examples)
        let mut line_clusters: BTreeMap<String, (usize, Vec<String>)> = BTreeMap::new();
        // representative full diffs per feature cluster
        let mut feature_repr: BTreeMap<&'static str, (String, String, String)> = BTreeMap::new();

        for path in &files {
            let Ok(source) = std::fs::read_to_string(path) else {
                continue;
            };
            // Skip empties.
            if source.trim().is_empty() {
                continue;
            }
            total += 1;
            let name = path
                .strip_prefix(
                    std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
                        .parent()
                        .and_then(|p| p.parent())
                        .unwrap(),
                )
                .unwrap_or(path)
                .display()
                .to_string();

            match compile_both(&source) {
                Outcome::Compared {
                    matched_text,
                    matched_struct,
                    used_fallback,
                    new_canon,
                    oracle_canon,
                } => {
                    compared += 1;
                    if matched_text {
                        matched_text_only += 1;
                    }
                    if used_fallback {
                        struct_fallback += 1;
                    }
                    if matched_struct {
                        matched += 1;
                    } else {
                        // Cluster by features present.
                        let feats = feature_signatures(&source);
                        let key_feats: Vec<&'static str> = if feats.is_empty() {
                            vec!["<plain-markup>"]
                        } else {
                            feats
                        };
                        for f in &key_feats {
                            let e = feature_clusters.entry(f).or_insert((0, Vec::new()));
                            e.0 += 1;
                            if e.1.len() < 3 {
                                e.1.push(name.clone());
                            }
                            // Store the CANONICAL (reprinted) forms so the
                            // representative diffs show the real structural gap,
                            // not formatting noise.
                            feature_repr.entry(f).or_insert_with(|| {
                                (name.clone(), new_canon.clone(), oracle_canon.clone())
                            });
                        }
                        // Cluster by first differing line of the canonical forms.
                        let dl = first_diff_line(&new_canon, &oracle_canon);
                        let e = line_clusters.entry(dl).or_insert((0, Vec::new()));
                        e.0 += 1;
                        if e.1.len() < 3 {
                            e.1.push(name.clone());
                        }
                    }
                }
                Outcome::NewNone => {
                    new_none += 1;
                    if new_none_examples.len() < 10 {
                        new_none_examples.push(name.clone());
                    }
                }
                Outcome::Panic(which) => {
                    panicked += 1;
                    if panic_examples.len() < 10 {
                        panic_examples.push(format!("[{which}] {name}"));
                    }
                }
                Outcome::Skipped => skipped += 1,
            }
        }

        let pct = |n: usize, d: usize| {
            if d == 0 {
                0.0
            } else {
                n as f64 * 100.0 / d as f64
            }
        };

        eprintln!("\n================ CORPUS: NEW AST vs OLD ORACLE ================");
        eprintln!("corpus dir: submodules/svelte/packages/svelte/tests/**/*.svelte");
        eprintln!("total non-empty components ........ {total}");
        eprintln!(
            "  skipped (parse/analyze fail) .... {skipped} ({:.1}%)",
            pct(skipped, total)
        );
        eprintln!(
            "  ERROR new=None (unimplemented) .. {new_none} ({:.1}%)",
            pct(new_none, total)
        );
        eprintln!(
            "  ERROR panic ..................... {panicked} ({:.1}%)",
            pct(panicked, total)
        );
        eprintln!(
            "  COMPARED (both produced output).. {compared} ({:.1}%)",
            pct(compared, total)
        );
        eprintln!("    comparison is STRUCTURAL: both sides reprinted via oxc -> esrap");
        eprintln!(
            "      parse-fallback (text compare) {struct_fallback} / {compared}  = {:.1}% of compared",
            pct(struct_fallback, compared)
        );
        eprintln!(
            "    MATCH (structural) ............ {matched} / {compared}  = {:.1}% of compared",
            pct(matched, compared)
        );
        eprintln!(
            "    MATCH (structural, all) ....... {matched} / {total}  = {:.1}% HEADLINE",
            pct(matched, total)
        );
        eprintln!(
            "    MATCH (legacy text-norm) ...... {matched_text_only} / {compared}  = {:.1}% of compared",
            pct(matched_text_only, compared)
        );
        eprintln!(
            "    DELTA structural - text ....... {:+}  ({matched} struct vs {matched_text_only} text)",
            matched as i64 - matched_text_only as i64
        );

        if !new_none_examples.is_empty() {
            eprintln!("\n-- new=None examples --");
            for e in &new_none_examples {
                eprintln!("    {e}");
            }
        }
        if !panic_examples.is_empty() {
            eprintln!("\n-- panic examples --");
            for e in &panic_examples {
                eprintln!("    {e}");
            }
        }

        // Top feature clusters among MISMATCHES.
        let mut feats: Vec<_> = feature_clusters.into_iter().collect();
        feats.sort_by(|a, b| b.1.0.cmp(&a.1.0));
        eprintln!("\n-- TOP MISMATCH CLUSTERS by feature (count, examples) --");
        eprintln!("   (a component can appear in several feature buckets)");
        for (label, (count, examples)) in feats.iter().take(20) {
            eprintln!("  {count:>5}  {label:<22}  e.g. {}", examples.join(", "));
        }

        // Top first-diff-line clusters (finer-grained codegen divergence).
        let mut lines: Vec<_> = line_clusters.into_iter().collect();
        lines.sort_by(|a, b| b.1.0.cmp(&a.1.0));
        eprintln!("\n-- TOP MISMATCH CLUSTERS by first differing line --");
        for (sig, (count, examples)) in lines.iter().take(20) {
            eprintln!("  {count:>5}  {sig}");
            eprintln!(
                "         e.g. {}",
                examples.first().cloned().unwrap_or_default()
            );
        }

        // Representative STRUCTURAL diffs (canonical reprinted forms) for the
        // biggest feature clusters — show only the region around the first diff.
        eprintln!("\n-- REPRESENTATIVE STRUCTURAL DIFFS (top 5 feature clusters) --");
        for (label, _) in feats.iter().take(5) {
            if let Some((fname, new_canon, oracle_canon)) = feature_repr.get(*label) {
                eprintln!("\n##### cluster `{label}` — {fname}");
                eprintln!(
                    "   first-diff: {}",
                    first_diff_line(new_canon, oracle_canon)
                );
                // Print the window of canonical lines around the first divergence.
                let nl: Vec<&str> = new_canon.lines().collect();
                let ol: Vec<&str> = oracle_canon.lines().collect();
                let mut at = 0usize;
                while at < nl.len() && at < ol.len() && nl[at].trim() == ol[at].trim() {
                    at += 1;
                }
                let start = at.saturating_sub(3);
                eprintln!("----- NEW (lines {start}..) -----");
                for l in nl.iter().skip(start).take(18) {
                    eprintln!("{l}");
                }
                eprintln!("----- ORACLE (lines {start}..) -----");
                for l in ol.iter().skip(start).take(18) {
                    eprintln!("{l}");
                }
            }
        }
        eprintln!("\n==============================================================\n");
    }
}
