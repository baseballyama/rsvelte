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
use oxc_span::SPAN;
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
    /// Sticky whitespace-preservation flag (写经 upstream `state.preserve_whitespace`).
    /// Seeded from `options.preserve_whitespace` and turned ON (and never off
    /// again for the subtree) by an ancestor `<pre>` / `<textarea>`, so a nested
    /// `<span>` inside a `<pre>` keeps its inner whitespace. The element visitor
    /// saves/restores it around its children.
    pub preserve_whitespace: bool,
    /// Monotonic counter for `each_array` / `$$index` unique-name suffixes,
    /// mirroring upstream's `state.scope.root.unique('each_array')`. The first
    /// each block uses bare `each_array` / `$$index`; subsequent ones append
    /// `_1`, `_2`, … (matching the text-based oracle's `each_counter`).
    pub each_index: usize,
    /// Inputs to the `scope.evaluate` (SSR constant-folding) port. Computed
    /// once (via the proven legacy `ServerCodeGenerator::new` path) and reused
    /// by [`Self::eval_ctx`] when folding `{expr}` template chunks / dynamic
    /// attribute values. See [`server::evaluate::EvalCtx`].
    pub eval_inputs: EvalInputs,
    /// Monotonic counter for the `$$body` temporary used by element CONTENT
    /// binds (`<textarea>` value, contenteditable `innerHTML`/`innerText`/
    /// `textContent`). The first one is bare `$$body`, subsequent ones append
    /// `_1`, `_2`, … — mirroring the text oracle's `$$body` / `$$body_N` naming
    /// (upstream uses `state.scope.generate('$$body')`).
    pub body_counter: usize,
    /// The async `{@const}` accumulator for the CURRENT fragment, mirroring
    /// upstream's per-Fragment `state.async_consts` (`Fragment.js`,
    /// `DeclarationTag.js::add_async_declaration`). When a `{@const}` in a block
    /// has an awaited / blocker-dependent initializer, its assignment becomes a
    /// thunk in this group's `$$renderer.run([...])` declaration, and the bare
    /// `let <name>;` for each declared binding is collected into `let_decls`. The
    /// group is created lazily by the const visitor, prepended to the fragment
    /// body by [`visitors::shared::build_fragment_body`], and reset (save/restore)
    /// around each fragment so blocks don't leak consts to siblings.
    pub async_consts: Option<AsyncConstsGroup<'a>>,
    /// Per-fragment-scope const blocker map (binding name → blocker expression
    /// source, e.g. `"promises[1]"`). Mirrors the text oracle's
    /// `const_blocker_map` / upstream `Binding.blocker`: a template read of a
    /// binding registered here is routed through
    /// `$$renderer.async([<blocker>], …)`. Saved/restored around each fragment
    /// body (an inner block inherits the parent map but additions are local).
    pub const_blocker_map: rustc_hash::FxHashMap<String, String>,
    /// Monotonic counter for the `$$renderer.run([...])` group variable name —
    /// `promises`, `promises_1`, `promises_2`, … (mirrors the text oracle's
    /// `const_promises_counter`).
    pub const_promises_counter: usize,
    /// Component-body `init` slot for NON-hoistable snippet function declarations
    /// (写经 upstream `SnippetBlock.js`: `node.metadata.can_hoist ? state.hoisted
    /// : state.init`). A snippet that references instance-level state cannot be
    /// lifted to module scope, so its `function name($$renderer, …) { … }`
    /// declaration is collected here — regardless of how deeply it nests in the
    /// template — and prepended to the component-function body (ahead of the
    /// rendered template), matching upstream's shared component-level `state.init`.
    pub snippet_inits: Vec<Statement<'a>>,
    /// Monotonic counter for the `$$d` temp generated when expanding a
    /// destructured `$derived` / `$derived.by` whose base needs a single shared
    /// `$$d = <init>` binding (mirrors upstream `scope.generate('$$d')`). The
    /// first one is bare `$$d`, subsequent ones append `_1`, `_2`, …
    pub derived_d_counter: usize,
    /// Monotonic counter for the `$$derived_array` temp generated per
    /// `ArrayPattern` in a destructured `$derived` (mirrors upstream
    /// `scope.generate('$$derived_array')`). The first is bare `$$derived_array`,
    /// subsequent ones append `_1`, `_2`, …
    pub derived_array_counter: usize,
    /// Whether the CURRENT children run is the direct children of a
    /// RegularElement / TitleElement (`process_children` `parent.is_some()`).
    /// Mirrors upstream's `AwaitExpression` server visitor parent-walk: an inline
    /// `{await …}` / `{@html await …}` whose first metadata-bearing ancestor is a
    /// RegularElement (NOT a Fragment) gets `$.save`-wrapped. `process_children`
    /// saves/restores it around the element-children loop; block bodies leave it
    /// `false`. Drives the HtmlTag-async `$.save` decision (the inline
    /// ExpressionTag path already keys off the `parent` arg directly).
    pub in_element_children: bool,
    /// The CURRENT element's async-attribute optimiser (写经 RegularElement's
    /// per-element `PromiseOptimiser`). `Some` only while building an element
    /// whose attributes include an awaited / blocker value; the dynamic-value
    /// builders route their result through it (hoisting the await into a `$$N`
    /// const) and the element visitor wraps the whole element in
    /// `$$renderer.child`/`async`. `None` for sync elements (the fast path),
    /// keeping non-async output byte-identical.
    pub attr_optimiser: Option<visitors::shared::PromiseOptimiser<'a>>,
}

/// One per-fragment async `{@const}` group — the AST mirror of upstream's
/// `state.async_consts` (`DeclarationTag.js`). `name` is the `$$renderer.run`
/// result variable (`promises`); `thunks` are the (source, has_await) thunk
/// entries fed to `$$renderer.run([...])`; `let_decls` are the bare `let <name>;`
/// declarations that precede the run call.
pub struct AsyncConstsGroup<'a> {
    pub name: String,
    /// (thunk source text, is_async) — reparsed into the run array on flush.
    pub thunks: Vec<(String, bool)>,
    /// Bare `let <name>;` statements (one per declared binding) emitted before
    /// the `var promises = $$renderer.run([...])` declaration.
    pub let_decls: Vec<Statement<'a>>,
}

/// The precomputed inputs to the SSR constant-folding evaluator
/// ([`server::evaluate::EvalCtx`]). Mirrors exactly the fields the legacy
/// `ServerCodeGenerator` carries for `scope.evaluate`, so the two pipelines
/// fold identically.
#[derive(Default)]
pub struct EvalInputs {
    pub constant_vars: rustc_hash::FxHashMap<String, String>,
    pub use_async: bool,
    pub top_level_blocker_map: rustc_hash::FxHashMap<String, usize>,
    /// Lazily-built template-scope index set (see `evaluate_identifier`).
    pub template_scopes_cache: std::cell::OnceCell<rustc_hash::FxHashSet<usize>>,
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
            preserve_whitespace: options.preserve_whitespace,
            each_index: 0,
            eval_inputs: EvalInputs::default(),
            body_counter: 0,
            async_consts: None,
            const_blocker_map: rustc_hash::FxHashMap::default(),
            const_promises_counter: 0,
            snippet_inits: Vec::new(),
            derived_d_counter: 0,
            derived_array_counter: 0,
            in_element_children: false,
            attr_optimiser: None,
        }
    }

    /// Route a built attribute / prop value through the CURRENT element's
    /// async-attribute optimiser (写经 `optimiser.transform`). When an optimiser
    /// is active AND `value_text` carries an inline await / blocker, the built
    /// `value` is hoisted into a `$$N` const and replaced by the bare `$$N`
    /// identifier; otherwise the value is returned unchanged. The borrow is taken
    /// out of `self.attr_optimiser` and restored so the rest of `self` stays
    /// mutably usable inside `transform`.
    pub fn optimise_attr_value(
        &mut self,
        value_text: &str,
        value: oxc_ast::ast::Expression<'a>,
    ) -> oxc_ast::ast::Expression<'a> {
        if let Some(mut opt) = self.attr_optimiser.take() {
            let out = opt.transform(self, value_text, value);
            self.attr_optimiser = Some(opt);
            out
        } else {
            value
        }
    }

    /// Generate the next `$$d` temp name — `$$d`, `$$d_1`, `$$d_2`, …
    /// (mirrors upstream `scope.generate('$$d')`).
    pub fn next_derived_d_name(&mut self) -> String {
        let counter = self.derived_d_counter;
        self.derived_d_counter = counter + 1;
        if counter == 0 {
            "$$d".to_string()
        } else {
            format!("$$d_{counter}")
        }
    }

    /// Generate the next `$$derived_array` temp name — `$$derived_array`,
    /// `$$derived_array_1`, … (mirrors upstream `scope.generate('$$derived_array')`).
    pub fn next_derived_array_name(&mut self) -> String {
        let counter = self.derived_array_counter;
        self.derived_array_counter = counter + 1;
        if counter == 0 {
            "$$derived_array".to_string()
        } else {
            format!("$$derived_array_{counter}")
        }
    }

    /// Generate the next `$$renderer.run` group variable name — `promises`,
    /// `promises_1`, `promises_2`, … (写经 text oracle `generate_promises_name`).
    pub fn next_promises_name(&mut self) -> String {
        let counter = self.const_promises_counter;
        self.const_promises_counter = counter + 1;
        if counter == 0 {
            "promises".to_string()
        } else {
            format!("promises_{counter}")
        }
    }

    /// Build the [`EvalCtx`](server::evaluate::EvalCtx) for the SSR
    /// constant-folding port, borrowing this state's analysis / source and the
    /// precomputed [`EvalInputs`]. The `current_scope_index` is left `None` here
    /// (snippet-scope tracking is not yet threaded through the AST visitors); a
    /// `None` simply keeps the historical non-tracked behaviour in
    /// `template_binding_is_reachable`.
    pub(crate) fn eval_ctx(
        &self,
    ) -> crate::compiler::phases::phase3_transform::server::evaluate::EvalCtx<'_> {
        crate::compiler::phases::phase3_transform::server::evaluate::EvalCtx {
            analysis: Some(self.analysis),
            constant_vars: &self.eval_inputs.constant_vars,
            source: self.source,
            use_async: self.eval_inputs.use_async,
            top_level_blocker_map: &self.eval_inputs.top_level_blocker_map,
            current_scope_index: None,
            template_scopes_cache: &self.eval_inputs.template_scopes_cache,
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
    /// Return the source-text slice for an expression node (`expr.start()..end()`
    /// against `self.source`), or `None` when the span is missing / out of range.
    /// Used by async block visitors to drive the textual `$.save` await-wrap and
    /// blocker scan (`metadata.expression.has_await` / `.blockers()`), mirroring
    /// the text-oracle which slices the same source span.
    pub fn expr_source(&self, expr: &Expression) -> Option<&str> {
        let start = expr.start()? as usize;
        let end = expr.end()? as usize;
        if end <= start || end > self.source.len() {
            return None;
        }
        Some(&self.source[start..end])
    }

    pub fn visit_expr(&self, expr: &Expression) -> OxcExpression<'a> {
        let mut out = self.visit_expr_raw(expr);
        read_wrap::wrap_reads(
            &mut out,
            self.b,
            self.analysis,
            self.analysis.root.instance_scope_index,
        );
        // Lower value-position `$effect.tracking()` → `false`,
        // `$effect.root(…)` → `() => {}`, `$effect.pending()` → `0` inside the
        // template expression (写经 server `CallExpression` visitor).
        script::lower_effect_value_runes_expr(&mut out, self.b);
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

    /// Re-parse a whole program `src` into the state allocator, returning ALL
    /// its top-level statements. Used by the async instance-body transform to
    /// rehome the sync/async-split TEXT (`var …; var $$promises = …`) emitted by
    /// `transform_async_body` back into oxc statements. Returns an empty vec on
    /// a parse failure.
    pub fn reparse_program(&self, src: &str) -> Vec<Statement<'a>> {
        let owned = self.allocator.alloc_str(src.trim());
        let ret =
            oxc_parser::Parser::new(self.allocator, owned, oxc_span::SourceType::mjs()).parse();
        if !ret.diagnostics.is_empty() {
            return Vec::new();
        }
        ret.program.body.into_iter().collect()
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

    /// Re-parse a list of FORMAL-PARAMETER source strings (e.g.
    /// `["$$renderer", "{ count }", "id = default_arg()"]`) into an oxc
    /// [`FormalParameters`], by wrapping them as a throwaway arrow
    /// `(<p0>, <p1>, …) => {}` and stealing its parameter list. Used by the
    /// snippet visitor to emit destructuring / default-valued parameters
    /// verbatim — an `AssignmentPattern` default (`id = default_arg()`) and an
    /// `ObjectPattern` / `ArrayPattern` are only representable in
    /// FORMAL-PARAMETER position, so they cannot go through [`Self::reparse_pattern`]
    /// (which wraps `let <slice> = 0;`). Returns `None` on a parse failure.
    pub fn reparse_params(
        &self,
        param_srcs: &[String],
    ) -> Option<oxc_ast::ast::FormalParameters<'a>> {
        let joined = param_srcs.join(", ");
        let wrapped = format!("({joined}) => {{}}");
        let owned = self.allocator.alloc_str(&wrapped);
        let ret =
            oxc_parser::Parser::new(self.allocator, owned, oxc_span::SourceType::mjs()).parse();
        if !ret.diagnostics.is_empty() {
            return None;
        }
        for stmt in ret.program.body {
            if let Statement::ExpressionStatement(es) = stmt
                && let OxcExpression::ArrowFunctionExpression(arrow) = es.unbox().expression
            {
                return Some(arrow.unbox().params.unbox());
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

    // Precompute the SSR constant-folding inputs (`constant_vars` /
    // `use_async` / `top_level_blocker_map`) via the proven legacy
    // `ServerCodeGenerator::new` path, so the AST pipeline folds template
    // chunks byte-identically to the oracle. Cheap: only harvests the maps.
    {
        let instance_script = ast.instance.as_ref().map(|s| s.as_ref());
        let module_script = ast.module.as_ref().map(|s| s.as_ref());
        let legacy = super::ServerCodeGenerator::new(
            analysis.name.clone(),
            source.to_string(),
            instance_script,
            module_script,
            Some(analysis),
            options.experimental.r#async,
        );
        state.eval_inputs = EvalInputs {
            constant_vars: legacy.constant_vars,
            use_async: legacy.use_async,
            top_level_blocker_map: legacy.top_level_blocker_map,
            template_scopes_cache: std::cell::OnceCell::new(),
        };
    }

    // -- async flag import (upstream `transform-server.js`) -----------------
    // When `experimental.async` is on, the program opens with a side-effect
    // import `import 'svelte/internal/flags/async';` BEFORE the namespace
    // import. The namespace import was seeded as `hoisted[0]` in
    // `ServerTransformState::new`, so unshift the flags import ahead of it.
    if state.eval_inputs.use_async {
        state
            .hoisted
            .insert(0, state.b.imports(vec![], "svelte/internal/flags/async"));
    }

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
    // Root fragment: parent is the Fragment node itself, so it IS an
    // `is_text_first` parent (upstream `clean_nodes`/`Fragment`).
    // 写经 upstream `SnippetBlock.js`: NON-hoistable snippet function
    // declarations are emitted into the enclosing render scope's `state.init`.
    // `build_fragment_body` collects them per-fragment (see `state.snippet_inits`)
    // and prepends them to the front of each fragment body — so for the ROOT
    // fragment they already sit at the head of `template_body` (ahead of the
    // rendered template, after the instance body), and for block-nested snippets
    // they stay inside their block body. No extra splice is needed here.
    let template_body = visitors::shared::build_fragment_body(&ast.fragment, true, &mut state);

    // -- component-bindings settle-loop (upstream lines 178-211) ------------
    // If the component binds to a child (`<Child bind:value={v} />`), legacy
    // bindings may not be stable on the first render, so upstream wraps the
    // template body in a do-while settle loop that re-renders into a copied
    // renderer until `$$settled` stays true, then `subsume`s the inner result.
    //
    // Upstream separates top-level snippet FunctionDeclarations (`___snippet`)
    // from the `rest`, keeps the snippets ahead of the loop, and wraps only the
    // `rest`. In the AST pipeline, top-level snippet function declarations are
    // hoisted to `state.hoisted` (module scope) by `visit_snippet_block`, so
    // they are NOT present in `template_body` — the whole `template_body` IS the
    // `rest`, and the `snippets` prefix is empty here.
    let template_body = if analysis.uses_component_bindings {
        // function $$render_inner($$renderer) { <rest> }
        let inner_params = b.params(vec![b.id_pat("$$renderer")], None);
        let inner_fn_body = b.body(template_body);
        let render_inner_fn =
            b.function_declaration("$$render_inner", inner_params, inner_fn_body, false);

        // do { $$settled = true; $$inner_renderer = $$renderer.copy();
        //      $$render_inner($$inner_renderer); } while (!$$settled);
        let loop_body = b.block(vec![
            b.stmt(b.assignment(
                oxc_ast::ast::AssignmentOperator::Assign,
                b.id("$$settled"),
                b.bool(true),
            )),
            b.stmt(b.assignment(
                oxc_ast::ast::AssignmentOperator::Assign,
                b.id("$$inner_renderer"),
                b.call("$$renderer.copy", vec![]),
            )),
            b.stmt(b.call("$$render_inner", vec![b.id("$$inner_renderer")])),
        ]);
        let do_while = b.do_while(b.unary_not(b.id("$$settled")), loop_body);

        vec![
            b.let_id("$$settled", Some(b.bool(true))),
            b.let_id("$$inner_renderer", None),
            render_inner_fn,
            do_while,
            b.stmt(b.call("$$renderer.subsume", vec![b.id("$$inner_renderer")])),
        ]
    } else {
        template_body
    };

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

    // -- props_id (upstream lines 253-258) ----------------------------------
    // When `analysis.props_id` is set (a top-level `const <name> = $props.id()`
    // declaration, which the VariableDeclaration visitor DROPS from the body),
    // re-emit it as `const <name> = $.props_id($$renderer);` and unshift it onto
    // the component block. It must be the FIRST line of the component for
    // hydration, so this happens BEFORE the needs_context wrapper.
    if let Some(props_id_name) = analysis.props_id.as_deref() {
        block_body.insert(
            0,
            b.const_id(
                props_id_name,
                b.call("$.props_id", vec![b.id("$$renderer")]),
            ),
        );
    }

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

    // -- $$css injection (upstream lines 305-311) ---------------------------
    // When the component has scoped CSS AND `inject_styles` is on AND it is not
    // a custom element, upstream pushes `const $$css = { hash, code }` at module
    // scope and unshifts `$$renderer.global.css.add($$css)` as the FIRST line of
    // the component block (before the sanitized-props prologue).
    //
    // rsvelte has no `css.ast`; the oracle (server/mod.rs) gates the same
    // injection on `options.css == Injected && css.has_css && !hash.is_empty() &&
    // custom_element.is_none() && !options.custom_element`, rendering the code
    // via `render_stylesheet_minified` and requiring it to be non-empty. We
    // mirror that decision exactly so the AST path matches the oracle byte-for-byte.
    let mut css_const: Option<Statement<'a>> = None;
    if options.css == crate::compiler::CssMode::Injected
        && analysis.css.has_css
        && !analysis.css.hash.is_empty()
        && analysis.custom_element.is_none()
        && !options.custom_element
        && let Ok(css_output) =
            crate::compiler::phases::phase3_transform::css::render_stylesheet_minified(
                analysis,
                ast.css.as_deref(),
                source,
                options,
            )
        && !css_output.code.is_empty()
    {
        // const $$css = { hash: '<hash>', code: '<code>' };
        css_const = Some(b.const_id(
            "$$css",
            b.object(vec![
                b.init("hash", b.string(&analysis.css.hash)),
                b.init("code", b.string(&css_output.code)),
            ]),
        ));
        // unshift `$$renderer.global.css.add($$css)` onto the component block —
        // this lands ahead of the sanitized-props prologue, so prepend it here.
        prologue.insert(
            0,
            b.stmt(b.call("$$renderer.global.css.add", vec![b.id("$$css")])),
        );
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
    // body = [...hoisted, ...module.body] (state.hoisted already carries the
    // module body), then the `$$css` module const (if any), then the export.
    let mut program_body = std::mem::take(&mut state.hoisted);
    if let Some(css_const) = css_const {
        program_body.push(css_const);
    }

    // -- componentApi v4 export (upstream lines 313-355) --------------------
    // When `options.compatibility.componentApi === 4`, upstream emits the legacy
    // Svelte-4 `Component.render(...)` wrapper instead of `export default <fn>`:
    //   import { render as $$_render } from 'svelte/server';
    //   function <Name>(...) { ... }
    //   <Name>.render = function ($$props, $$opts) {
    //     return $$_render(<Name>, { props: $$props, context: $$opts?.context });
    //   };
    //   export default <Name>;
    if matches!(
        options.compatibility.component_api,
        crate::compiler::ComponentApi::V4
    ) {
        // import { render as $$_render } from 'svelte/server'; (unshifted)
        program_body.insert(0, b.imports(vec![("render", "$$_render")], "svelte/server"));
        program_body.push(component_fn);

        // <Name>.render = function ($$props, $$opts) { return ...; };
        let render_target = b.member(b.id(component_name), "render");
        let render_params = b.params(vec![b.id_pat("$$props"), b.id_pat("$$opts")], None);
        // $$opts?.context — optional member chaining.
        let opts_context = oxc_ast::ast::Expression::from(b.ab.member_expression_static(
            SPAN,
            b.id("$$opts"),
            b.id_name("context"),
            true,
        ));
        let render_obj = b.object(vec![
            b.init("props", b.id("$$props")),
            b.init("context", opts_context),
        ]);
        let render_call = b.call("$$_render", vec![b.id(component_name), render_obj]);
        let render_body = b.body(vec![b.return_stmt(Some(render_call))]);
        let render_fn = b.function_expr(None, render_params, render_body, false);
        program_body.push(b.stmt(b.assignment(
            oxc_ast::ast::AssignmentOperator::Assign,
            render_target,
            render_fn,
        )));

        // export default <Name>;
        program_body.push(b.export_default_expr(b.id(component_name)));
    } else {
        program_body.push(b.export_default_fn(component_fn));
    }

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

    /// Like [`run`], but with `experimental.async` enabled — exercises the
    /// async SSR foundation (top-level await instance split + async expression
    /// tags). Returns `(ast_output, oracle_output)` so the async fixtures can
    /// gate on byte-for-byte parity with the text-based oracle.
    fn run_async_both(source: &str) -> (String, String) {
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
        if let Some(module) = ast.module.as_mut() {
            phase1_parse::read::script::ensure_script_parsed(
                &ast.arena,
                module,
                source,
                &line_offsets,
            );
        }
        let mut options = CompileOptions {
            filename: Some("App.svelte".to_string()),
            ..CompileOptions::default()
        };
        options.experimental.r#async = true;
        let analysis =
            phase2_analyze::analyze_component(&mut ast, source, &options).expect("analyze");
        let allocator = Allocator::default();
        let ours = server_component_ast(&analysis, &ast, source, &options, &allocator)
            .expect("ast output");
        let oracle =
            super::super::transform_server(&analysis, &ast, source, &options).expect("server");
        (ours, oracle)
    }

    /// Async SSR foundation (Stage 0+1): the two simplest top-level-await
    /// snapshot fixtures. Each splits the instance body into a sync prelude +
    /// `var $$promises = $$renderer.run([…])` and wraps the blocked `{expr}`
    /// interpolation in `$$renderer.async([$$promises[N]], …)`. Asserts the AST
    /// pipeline matches the text-based oracle byte-for-byte (post-norm).
    ///
    /// - `async-top-level-group-sync-run`: consecutive sync statements after the
    ///   first await are GROUPED into one thunk (one `$$promises` index).
    /// - `async-top-level-inspect-server`: `$inspect(data)` becomes a
    ///   `() => void 0` thunk whose index is preserved.
    #[test]
    fn ast_matches_oracle_async_top_level() {
        let samples: &[(&str, &str)] = &[
            (
                "group-sync-run",
                "<script>\n\tlet a = await Promise.resolve(1);\n\t// these should be grouped into one, having an async tick inbetween\n\t// would change how the code runs and could introduce subtle timing bugs\n\tlet b = a + 1;\n\tlet c = b + 1;\n</script>\n\n{c}\n",
            ),
            (
                "inspect-server",
                "<script>\n\tlet data = await Promise.resolve(42);\n\t$inspect(data);\n</script>\n\n<p>{data}</p>",
            ),
        ];
        // The text-based oracle prints the top-level `$$renderer.async(...)`
        // expression statement at column 0 (one tab shy of the esrap-correct
        // depth — the same leading-indent quirk the block-visitor tests collapse
        // via `norm_blocks`). The AST pipeline indents it correctly, matching the
        // official snapshot fixture. Compare leading-whitespace-insensitively so
        // the gate asserts STRUCTURAL parity (the corpus oxfmt pass collapses the
        // same diff).
        let mut mismatches = Vec::new();
        for (name, src) in samples {
            let (ours, oracle) = run_async_both(src);
            let matched = norm_blocks(&ours) == norm_blocks(&oracle);
            eprintln!(
                "=== ASYNC: {name} === {}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                mismatches.push(*name);
            }
        }
        assert!(
            mismatches.is_empty(),
            "async top-level output differs from oracle for: {mismatches:?}"
        );
    }

    /// Async `{@const}` (Stage 3): the snapshot fixture `async-const`. An
    /// awaited `{@const a = await 1}` (and the dependent `{@const b = a + 1}`)
    /// inside `{#if}` lower to a per-block `$$renderer.run([...])` group:
    ///   let a; let b;
    ///   var promises = $$renderer.run([async () => a = (await $.save(1))(), () => b = a + 1]);
    /// and the reader `{b}` becomes
    ///   $$renderer.async([promises[1]], ($$renderer) => $$renderer.push(() => $.escape(b)));
    /// Asserts byte-for-byte parity with the text oracle (post `norm_blocks`).
    #[test]
    fn ast_matches_oracle_async_const() {
        let src =
            "{#if true}\n\t{@const a = await 1}\n\t{@const b = a + 1}\n\n\t<p>{b}</p>\n{/if}\n";
        let (ours, oracle) = run_async_both(src);
        // The text oracle splits the `$$renderer.run([...])` array across lines
        // (with blank-line padding between thunks); the AST pipeline emits the
        // array on one line — matching the OFFICIAL `_expected` snapshot. Both
        // are structurally identical; the corpus oxfmt pass collapses exactly
        // this layout diff, so compare with whitespace-runs collapsed to a single
        // space (a structural token comparison).
        fn norm_tokens(s: &str) -> String {
            // Pad bracket/paren/comma punctuators so adjacency to a newline
            // (oracle: `run([\n async`) vs none (ours: `run([async`) doesn't
            // change the token stream, then collapse all whitespace.
            let padded: String = s
                .chars()
                .flat_map(|c| match c {
                    '[' | ']' | '(' | ')' | ',' | '{' | '}' => vec![' ', c, ' '],
                    other => vec![other],
                })
                .collect();
            padded.split_whitespace().collect::<Vec<_>>().join(" ")
        }
        let matched = norm_tokens(&ours) == norm_tokens(&oracle);
        assert!(
            matched,
            "async-const output differs from oracle:\n--- OURS ---\n{ours}\n--- ORACLE ---\n{oracle}"
        );
        // Spot-check the load-bearing shapes the fixture oracle requires.
        let n = norm_blocks(&ours);
        assert!(
            n.contains("$$renderer.run([")
                && n.contains("async () => a = (await $.save(1))()")
                && n.contains("() => b = a + 1")
                && n.contains("$$renderer.async([promises[1]]"),
            "async-const missing expected run/async shape:\n{ours}"
        );
    }

    /// Async SSR `{#each}` block shapes (runtime-runes burn-down). Each fixture
    /// below drives the async each-block / `<svelte:boundary pending>` server
    /// codegen path that the new AST pipeline must reproduce byte-for-byte
    /// against the (correct) `transform_server` oracle (post `norm_blocks`):
    ///
    /// - `async-each-preserve-pending` / `async-overlapping-array` (the keyed +
    ///   unkeyed bodies) — an inline `{await fn(item)}` that is a DIRECT child of
    ///   an element inside the each body is `$.save`-wrapped
    ///   (`(await $.save(fn(item)))()`), 写经 the server `AwaitExpression.js`
    ///   parent-walk (`has_save = parent is a RegularElement`).
    /// - `async-each` / `async-each-await-item` / `async-each-keyed` /
    ///   `async-each-await-store-update` / `async-each-await-stale-rows` /
    ///   `async-each-const-await-error-boundary` — the each block sits inside a
    ///   `<svelte:boundary>` with a `{#snippet pending()}`; the SERVER renders
    ///   the pending snippet (`<!--[!-->` + pending body + `<!--]-->`) and
    ///   discards the each body, 写经 `SvelteBoundary.js`
    ///   `build_pending_snippet_block`.
    ///
    /// (`async-each-derived`, `async-eager-each-block`, `async-overlapping-array`
    /// have ORTHOGONAL remaining diffs — `<input>` attribute async-wrap,
    /// `$state.eager(x)` if-test unwrap, `$effect.pending()` → `0` const-fold —
    /// none of which are each-block codegen, so they are not gated here.)
    #[test]
    fn ast_matches_oracle_async_each() {
        let fixtures = [
            "async-each",
            "async-each-await-item",
            "async-each-keyed",
            "async-each-await-store-update",
            "async-each-preserve-pending",
            "async-each-await-stale-rows",
            "async-each-const-await-error-boundary",
        ];
        let mut mismatches = Vec::new();
        for dir in fixtures {
            let path = format!(
                "{}/../../submodules/svelte/packages/svelte/tests/runtime-runes/samples/{}/main.svelte",
                env!("CARGO_MANIFEST_DIR"),
                dir
            );
            let Ok(src) = std::fs::read_to_string(&path) else {
                eprintln!("SKIP {dir} (submodule not checked out)");
                return;
            };
            let (ours, oracle) = run_async_both(&src);
            if norm_blocks(&ours) != norm_blocks(&oracle) {
                eprintln!(
                    "===== {dir} DIFFER =====\n--- OURS ---\n{ours}\n--- ORACLE ---\n{oracle}\n"
                );
                mismatches.push(dir);
            }
        }
        assert!(
            mismatches.is_empty(),
            "async each-block output differs from oracle for: {mismatches:?}"
        );
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

    /// Destructured `$derived` / `$derived.by` SSR expansion (写经
    /// `VariableDeclaration.js:97-156` + `_extract_paths`). Each runtime-runes
    /// fixture below destructures a derived; the AST pipeline must expand it into
    /// the `$$d` / `$$derived_array` base + one `$.derived(() => <access>)` leaf
    /// per path, matching the (correct) `transform_server` oracle (post
    /// `norm_blocks`, which collapses the oracle's block-body indent + blank-line
    /// quirks). Covers: object pattern + nested array/object pattern (two array
    /// temps), object rest `{ ...b }` → `$.exclude_from_object`, `$derived.by`
    /// (`$$d = $.derived(fn)`), `$derived(<non-identifier>)` (`$$d = $.derived(…)`),
    /// `$derived(<Identifier>)` (no `$$d`, base read directly), iterator destructure
    /// (`$$d` + `$$derived_array`), and a single-property object destructure.
    #[test]
    fn ast_matches_oracle_destructured_derived() {
        let fixtures = [
            "derived-destructured",
            "derived-destructured-iterator",
            "derived-fn-destructure",
            "destructure-derived-by",
            "derived-rest-includes-symbol",
            "derived-destructure",
            "derived-dependencies",
        ];
        let mut mismatches: Vec<String> = Vec::new();
        for dir in fixtures {
            let path = format!(
                "{}/../../submodules/svelte/packages/svelte/tests/runtime-runes/samples/{}/main.svelte",
                env!("CARGO_MANIFEST_DIR"),
                dir
            );
            let Ok(src) = std::fs::read_to_string(&path) else {
                eprintln!("SKIP {dir} (submodule not checked out)");
                return;
            };
            let ours = run(&src);
            let oracle = oracle_dump(&src);
            if norm_blocks(&ours) != norm_blocks(&oracle) {
                eprintln!("=== {dir} DIFFER ===\n--- OURS ---\n{ours}\n--- ORACLE ---\n{oracle}\n");
                mismatches.push(dir.to_string());
            }
        }
        assert!(
            mismatches.is_empty(),
            "destructured-derived output differs from oracle for: {mismatches:?}"
        );
    }

    /// SPREAD / ATTRIBUTE / html-entities SSR element-codegen parity with the
    /// (correct) `transform_server` oracle. Each fixture below is a runtime
    /// fixture the oracle passes; matching it (post `norm_blocks`) means the
    /// runtime suite passes too.
    #[test]
    fn ast_matches_oracle_spread_attr_entities() {
        let fixtures: &[(&str, &str)] = &[
            ("runtime-legacy", "class-with-spread"),
            ("runtime-legacy", "class-with-dynamic-attribute-and-spread"),
            ("runtime-legacy", "spread-element-input"),
            ("runtime-legacy", "spread-element-multiple-dependencies"),
            ("runtime-legacy", "binding-indirect-spread"),
            ("runtime-legacy", "attribute-boolean-false"),
            ("runtime-legacy", "attribute-prefer-expression"),
            ("runtime-legacy", "html-entities"),
            ("runtime-legacy", "html-entities-inside-attributes"),
            ("runtime-legacy", "nbsp"),
            ("runtime-legacy", "nbsp-div"),
            ("runtime-legacy", "preserve-whitespaces"),
            ("runtime-legacy", "svg-multiple"),
            ("runtime-legacy", "dynamic-element-svg-inherit-namespace"),
        ];
        let mut mismatches: Vec<String> = Vec::new();
        for (suite, dir) in fixtures {
            let path = format!(
                "{}/../../submodules/svelte/packages/svelte/tests/{}/samples/{}/main.svelte",
                env!("CARGO_MANIFEST_DIR"),
                suite,
                dir
            );
            let Ok(src) = std::fs::read_to_string(&path) else {
                eprintln!("SKIP {dir} (submodule not checked out)");
                return;
            };
            let ours = run(&src);
            let oracle = oracle_dump(&src);
            // The runtime gate is `canon_js` (oxc parse → codegen), the SAME
            // canonicalizer `tests/common::canonicalize_js` applies — it
            // normalizes formatting (line-wrapping, trailing commas) while
            // preserving structure. Matching under it means the runtime suite
            // passes (the oracle passes these fixtures). `binding-indirect-spread`
            // only differs in esrap's long-call line-wrapping, which `canon_js`
            // collapses.
            if canon_js(&ours) != canon_js(&oracle) {
                eprintln!("=== {dir} DIFFER ===\n--- OURS ---\n{ours}\n--- ORACLE ---\n{oracle}\n");
                mismatches.push(dir.to_string());
            } else {
                eprintln!("=== {dir} MATCH ===");
            }
        }
        assert!(
            mismatches.is_empty(),
            "spread/attr/entities output differs from oracle for: {mismatches:?}"
        );
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

    /// Async SSR `IfBlock` (Stage 2a): the shared `$.save` await-wrap + the
    /// block-level `create_child_block` aggregate-blocker wrapping. Asserts the
    /// AST pipeline matches the text-based oracle byte-for-byte (post `norm_blocks`,
    /// which collapses the oracle's block-body leading-indent quirk).
    ///
    /// - `async-if-hoisting` / `async-if-alternate-hoisting`: a `{#if await …}`
    ///   with await-bearing branch interpolations. Each becomes
    ///   `$$renderer.child_block(async …)` (no top-level blocker), the test
    ///   `$.save`-wrapped to `(await $.save(…))()`, and the branch `{await …}`
    ///   tags emitted as `$$renderer.push(async () => $.escape(await …))`.
    ///   These match the oracle FULLY (no instance script).
    /// - `async-if-chain`: the full chain — sync if (blocker-only →
    ///   `async_block([$$promises[0]], (…) => …)`), nested non-flattened await
    ///   else-ifs (own `child_block`/`async_block`), and a flatten-only chain.
    ///   The IfBlock output matches the oracle; the only divergence is the
    ///   instance `let blocking = $derived(await foo)` lowering (a separate
    ///   `$derived(await …)` → `$.async_derived` axis, out of Stage 2a scope), so
    ///   that one instance line is normalized away before comparison.
    #[test]
    fn ast_matches_oracle_async_if_block() {
        let hoisting = "{#if await Promise.resolve(true)}\n  {await Promise.resolve('yes yes yes')}\n{:else}\n  {await Promise.reject('no no no')}\n{/if}\n";
        let alternate_hoisting = "{#if await Promise.resolve(false)}\n  {await Promise.reject('no no no')}\n{:else}\n  {await Promise.resolve('yes yes yes')}\n{/if}\n";
        // FULL-match fixtures (no instance script).
        for (name, src) in &[
            ("async-if-hoisting", hoisting),
            ("async-if-alternate-hoisting", alternate_hoisting),
        ] {
            let (ours, oracle) = run_async_both(src);
            let matched = norm_blocks(&ours) == norm_blocks(&oracle);
            assert!(
                matched,
                "IfBlock async output differs from oracle for {name}:\n--- OURS ---\n{ours}\n--- ORACLE ---\n{oracle}"
            );
        }

        // `async-if-chain`: compare with the instance `$derived(await …)` line
        // normalized out (a separate lowering axis). The IfBlock structure (the
        // five blocks) must still match byte-for-byte.
        let chain = "<script>\n  function complex1() {\n    return 1;\n  }\n\n  let foo = $state(true);\n  let blocking = $derived(await foo);\n</script>\n\n{#if foo}\n  foo\n{:else if bar}\n  bar\n{:else}\n  else\n{/if}\n\n{#if await foo}\n  foo\n{:else if bar}\n  bar\n{:else if await baz}\n  baz\n{:else}\n  else\n{/if}\n\n{#if await foo > 10}\n  foo\n{:else if bar}\n  bar\n{:else if await foo > 5}\n  baz\n{:else}\n  else\n{/if}\n\n{#if simple1}\n  foo\n{:else if simple2 > 10}\n  bar\n{:else if complex1() * complex2 > 100}\n  baz\n{:else}\n  else\n{/if}\n\n{#if blocking > 10}\n  foo\n{:else if blocking > 5}\n  bar\n{:else}\n  else\n{/if}\n";
        let (ours, oracle) = run_async_both(chain);
        // The instance `let blocking = $derived(await foo)` now lowers to the
        // async-derived form (`var blocking;` + `blocking = await
        // $.async_derived(() => foo)` in the `$$renderer.run([…])` prelude), so the
        // WHOLE component — instance prelude AND the five IfBlocks — matches the
        // oracle byte-for-byte (post-`norm_blocks`).
        assert_eq!(
            norm_blocks(&ours),
            norm_blocks(&oracle),
            "async-if-chain output differs from oracle:\n--- OURS ---\n{ours}\n--- ORACLE ---\n{oracle}"
        );
    }

    /// Async SSR `EachBlock` (Stage 2b): the iterable `$.save` await-wrap + the
    /// block-level `create_child_block` wrapping. Asserts the AST pipeline matches
    /// the text-based oracle byte-for-byte (post `norm_blocks`).
    ///
    /// - `async-each-hoisting`: `{#each await Promise.resolve([…]) as item}` with
    ///   an await-bearing body `{await item}`. The iterable becomes
    ///   `$.ensure_array_like((await $.save(Promise.resolve([…])))())`, the const +
    ///   for-loop wrap in `$$renderer.child_block(async ($$renderer) => …)`, and
    ///   the body `{await item}` emits `$$renderer.push(async () => $.escape(await
    ///   item))`. The `<!--[-->` / `<!--]-->` markers stay OUTSIDE the wrap.
    /// - `async-each-fallback-hoisting`: same with a `{:else}` fallback — the
    ///   const + `if (each_array.length !== 0) {…} else {…}` wrap together inside
    ///   one `child_block`, the `<!--]-->` close outside.
    #[test]
    fn ast_matches_oracle_async_each_block() {
        let hoisting = "{#each await Promise.resolve([first, second, third]) as item}\n  {await item}\n{/each}\n";
        let fallback_hoisting = "{#each await Promise.resolve([]) as item}\n  {await Promise.reject('This should never be reached')}\n{:else}\n  {await Promise.resolve(4)}\n{/each}\n";
        for (name, src) in &[
            ("async-each-hoisting", hoisting),
            ("async-each-fallback-hoisting", fallback_hoisting),
        ] {
            let (ours, oracle) = run_async_both(src);
            let matched = norm_blocks(&ours) == norm_blocks(&oracle);
            assert!(
                matched,
                "EachBlock async output differs from oracle for {name}:\n--- OURS ---\n{ours}\n--- ORACLE ---\n{oracle}"
            );
        }
    }

    /// SSR async `$derived(await …)` instance lowering (写经
    /// `VariableDeclaration.js:87-96`): a `let x = $derived(await EXPR)` under
    /// `experimental.async` lowers to `await $.async_derived(() => EXPR)`, which the
    /// async-body split then hoists as `var x;` + `x = await $.async_derived(…)`
    /// inside `$$renderer.run([…])`. Asserts the whole instance prelude matches the
    /// text-based oracle byte-for-byte.
    #[test]
    fn ast_matches_oracle_async_derived_instance() {
        let src = "<script>\n\tlet foo = true;\n\tlet blocking = $derived(await foo);\n</script>\n\n{blocking}\n";
        let (ours, oracle) = run_async_both(src);
        assert!(
            ours.contains("$.async_derived(() => foo)"),
            "expected `await $.async_derived(() => foo)` in instance lowering:\n{ours}"
        );
        assert_eq!(
            norm_blocks(&ours),
            norm_blocks(&oracle),
            "async `$derived(await …)` instance lowering differs from oracle:\n--- OURS ---\n{ours}\n--- ORACLE ---\n{oracle}"
        );
    }

    /// `let:` directives on components / slotted elements lower to a second
    /// destructured slot-fn parameter (upstream `shared/component.js`
    /// lines 232-259). Asserts the emitted parameter shape against the
    /// `transform_server` oracle. Compared with `norm_oxfmt`, which collapses the
    /// purely cosmetic diffs the corpus pipeline normalizes via oxfmt (trailing
    /// commas + object-pattern brace spacing).
    #[test]
    fn ast_matches_oracle_let_directives() {
        // Strip trailing commas + inner brace/bracket padding so a structural
        // comparison ignores the oracle's trailing-comma and `{a, b}` spacing.
        fn norm_oxfmt(s: &str) -> String {
            norm_blocks(s)
                .replace(", ", ",")
                .replace(",\n", "\n")
                .replace("{ ", "{")
                .replace(" }", "}")
                .replace("[ ", "[")
                .replace(" ]", "]")
        }
        let samples = [
            "<script>import Comp from './Comp.svelte';</script><Comp let:x>{x}</Comp>",
            "<script>import Comp from './Comp.svelte';</script><Comp let:x={value}>{value}</Comp>",
            "<script>import Comp from './Comp.svelte';</script><Comp let:x={{a, b}}>{a}{b}</Comp>",
            "<script>import Comp from './Comp.svelte';</script><Comp let:x={[a, b]}>{a}{b}</Comp>",
            "<script>import Comp from './Comp.svelte';</script><Comp><div slot=\"s\" let:item>{item}</div></Comp>",
            "<slot let:item />",
            "<slot let:item>{item}</slot>",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm_oxfmt(&ours) == norm_oxfmt(&oracle);
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
            "let-directive output differs from oracle for: {mismatches:?}"
        );
    }

    /// Snapshot fixture `class-state-field-constructor-assignment`: a runes class
    /// with `$state` + private `$state` + public `$derived` fields plus a
    /// constructor that assigns `this.<field>`. The public `$derived` fields must
    /// lower to a private backing field + `get`/`set` accessor pair (写经 server
    /// `ClassBody.js`); the constructor assignments pass through unchanged. The
    /// AST pipeline output must match the `transform_server` oracle.
    #[test]
    fn ast_matches_oracle_class_state_field_ctor() {
        let src = concat!(
            "<script>\n",
            "\tclass Foo {\n",
            "\t\ta = $state(0);\n",
            "\t\t#b = $state();\n",
            "\t\tfoo = $derived({ bar: this.a * 2 });\n",
            "\t\tbar = $derived({ baz: this.foo });\n",
            "\t\tconstructor() {\n",
            "\t\t\tthis.a = 1;\n",
            "\t\t\tthis.#b = 2;\n",
            "\t\t\tthis.foo.bar = 3;\n",
            "\t\t\tthis.bar = 4;\n",
            "\t\t}\n",
            "\t}\n",
            "</script>",
        );
        let ours = run(src);
        let oracle = oracle_dump(src);
        assert_eq!(
            norm(&ours),
            norm(&oracle),
            "\n--- OURS ---\n{ours}\n--- ORACLE ---\n{oracle}\n"
        );
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

    /// `{#await expr then VALUE}` where `VALUE` is a **destructuring** pattern —
    /// `{ a, b }`, `[a, b]`, `{ a = 3 }` (defaults), `{ a, ...rest }`,
    /// `{ [computed]: v }`, nested patterns. Upstream's server `AwaitBlock.js`
    /// emits the `then` arrow with `context.visit(node.value)` as its single
    /// parameter (the full `Pattern`). The AST visitor's `value_pattern` must
    /// re-parse the destructuring slice (not collapse it to `$$value`), otherwise
    /// every binding the `then` body reads goes undefined. Mirrors the
    /// runtime-legacy `await-then-destruct-*` cluster. (The `{:catch}` clause is
    /// never rendered server-side — `$.await` has only pending + then callbacks —
    /// so catch destructuring is irrelevant here.)
    #[test]
    fn ast_matches_oracle_await_then_destructuring() {
        let samples = [
            // object
            "{#await p then { result, error }}<p>{error}{result}</p>{/await}",
            // array
            "{#await p then [a, b, c]}<p>{a}{b}{c}</p>{/await}",
            // string props / renamed
            "{#await p then { value: theValue }}<p>{theValue}</p>{/await}",
            // number-ish / renamed nested
            "{#await p then { error: { message, code } }}<p>{message}{code}</p>{/await}",
            // rest (object)
            "{#await p then { a, ...rest }}<p>{a}{JSON.stringify(rest)}</p>{/await}",
            // rest (array)
            "{#await p then [a, b, ...rest]}<p>{a}{b}{JSON.stringify(rest)}</p>{/await}",
            // defaults
            "{#await p then { a = 3, b = 4, c }}<p>{a}{b}{c}</p>{/await}",
            "{#await p then [a, b, c = 3]}<p>{a}{b}{c}</p>{/await}",
            // nested array rest
            "{#await p then [ a, b, ...[,, c, ...{ length } ]]}<p>{a}{b}{c}{length}</p>{/await}",
            // computed props
            "{#await p then { [`prop${1}`]: { x }, ...rest }}<p>{x}{JSON.stringify(rest)}</p>{/await}",
            // {#await … then dest} with a {@const} reading the destructured binding
            "{#await p then { width, height }}{@const {area} = calc(width, height)}<div>{area}</div>{/await}",
            // bare identifier (regression guard — must still work)
            "{#await p then value}<p>{value}</p>{/await}",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            // Compare via the esrap canonical reprint (the corpus
            // output-equality measure): both sides are reprinted so that the
            // oracle's per-line arg wrapping vs. the AST printer's layout is
            // not noise. Fall back to `norm_blocks` (leading-ws-insensitive)
            // when either side fails to reparse.
            let matched = match (canon(&ours), canon(&oracle)) {
                (Some(a), Some(b)) => a == b,
                _ => norm_blocks(&ours) == norm_blocks(&oracle),
            };
            if !matched {
                eprintln!(
                    "=== SRC: {src} === DIFFER\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n"
                );
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "await-then destructuring AST output differs from oracle for: {mismatches:?}"
        );
    }

    /// Author HTML comments (`<!-- ... -->`) are stripped from the SSR template
    /// when `preserveComments` is false (the default), matching upstream
    /// `clean_nodes` (`utils.js:148-151`: `node.type === 'Comment' &&
    /// !preserve_comments → continue`). The comment must vanish from the
    /// `$$renderer.push(...)` markup, and — because it is dropped BEFORE the
    /// whitespace-trim pass — the surrounding text must collapse exactly as if
    /// the comment had never been present. The framework hydration markers
    /// (`<!--[-->` / `<!---->` / `<!--]-->`) are emitted by block visitors as
    /// literals, not `TemplateNode::Comment`, so they are unaffected.
    #[test]
    fn ast_matches_oracle_strips_comments() {
        let samples = [
            "<!-- hello --><p>x</p>",
            "<p>a</p><!-- mid --><p>b</p>",
            "<!-- single update --> <div>x</div>",
            "<p>before<!-- inline -->after</p>",
            "<div><!-- only comment --></div>",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            // The oracle strips author comments; assert ours does too.
            assert!(
                !ours.contains("hello")
                    && !ours.contains("mid")
                    && !ours.contains("single update")
                    && !ours.contains("inline")
                    && !ours.contains("only comment"),
                "AST pipeline leaked an author comment for {src}:\n{ours}"
            );
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
            "comment-stripping output differs from oracle for: {mismatches:?}"
        );
    }

    /// SSR constant-folding (`scope.evaluate`) parity with the
    /// `transform_server` oracle. Each `{expr}` template chunk whose value is
    /// statically "known" must inline as escaped text in BOTH pipelines (and a
    /// known-nullish value renders as nothing). The non-foldable case (a `$state`
    /// reassigned by a function) must stay a runtime `$.escape(...)` — proving we
    /// don't OVER-fold (folding where the oracle wouldn't would REGRESS matches).
    #[test]
    fn ast_matches_oracle_constant_fold() {
        let samples: &[&str] = &[
            // literal arithmetic / string concat / ternary / global calls
            "<p>{1 + 1}</p>",
            "<p>{'a' + 'b'}</p>",
            "<p>{true ? 'x' : 'y'}</p>",
            "<p>{Math.max(1, 2)}</p>",
            // const binding folds to its known value
            "<script>const c = 5;</script><p>{c}</p>",
            // unreassigned `$state` unwraps to a known const
            "<script>let x = $state(0);</script><p>{x}</p>",
            // known nullish renders as nothing
            "<script>const n = null;</script><p>{n}</p>",
            // NON-foldable: `$state` reassigned by a function stays runtime.
            "<script>let x = $state(0); function f(){x++}</script><p>{x}</p>",
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
                mismatches.push(*src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "constant-fold output differs from oracle for: {mismatches:?}"
        );
    }

    /// SSR constant-folding parity for dynamic ATTRIBUTE values vs the
    /// `transform_server` oracle. A single string-literal expression inlines as a
    /// static attribute; a mixed text+expression value whose expressions all fold
    /// to known values inlines wholesale; non-foldable expressions stay
    /// `$.attr(...)`. (The `Math.max(1,2)` whitespace-reprint case is excluded —
    /// that is an expression-printing artefact, folded away by the corpus's
    /// structural comparison, not a constant-fold concern.)
    #[test]
    fn ast_matches_oracle_attribute_fold() {
        let samples: &[&str] = &[
            "<a href={\"hi\"}>x</a>",
            "<a href={1 + 1}>x</a>",
            "<a href={5}>x</a>",
            "<script>const c = 'foo';</script><a href={c}>x</a>",
            "<script>const c = null;</script><a href={c}>x</a>",
            "<a href=\"/{5}\">x</a>",
            "<script>const c = 'p';</script><a href=\"/{c}/q\">x</a>",
            "<a title={true ? 'x' : 'y'}>x</a>",
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
                mismatches.push(*src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "attribute-fold output differs from oracle for: {mismatches:?}"
        );
    }

    /// Official snapshot fixture `nullish-coallescence-omittance`: exercises the
    /// SSR `scope.evaluate` constant-folding that omits `attr ?? ""` /
    /// `1 ?? 'stuff'` known interpolations in BOTH text-position
    /// (`process_children`) AND attribute-value position
    /// (`build_attribute_value`). The folded `<div title="...">` collapses
    /// every known part (`{name}`→`world`, `{null}`/`{undefined}`→nothing,
    /// `{1}`→`1`) and keeps only the live `{count}` / `{typeof value}` /
    /// `{value}` as `$.stringify(...)` interpolations. Asserts the AST pipeline
    /// matches the (correct) `transform_server` oracle byte-for-byte (post-norm).
    #[test]
    fn ast_matches_oracle_nullish_coallescence_omittance() {
        let src = r#"<script>
    let name = 'world';
    let count = $state(0);
    let { value } = $props();
</script>
<h1>Hello, {null}{name}!</h1>
<b>{1 ?? 'stuff'}{2 ?? 'more stuff'}{3 ?? 'even more stuff'}</b>
<button onclick={()=>count++}>Count is {count}</button>
<h1>Hello, {name ?? 'earth' ?? null}</h1>
<div title="Hello, {name} {count} {null} {1} {undefined} {typeof value} {value}"></div>
"#;
        let ours = run(src);
        let oracle = oracle_dump(src);
        assert_eq!(
            norm(&ours),
            norm(&oracle),
            "nullish-coallescence-omittance differs from oracle:\nOURS:\n{ours}\nORACLE:\n{oracle}"
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
            // EachBlock body starting with text → is_text_first anchor inside.
            "{#each [1] as n}text<li>{n}</li>{/each}",
            // EachBlock with `{:else}` fallback (empty-list guard).
            "{#each [1, 2, 3] as n}<li>{n}</li>{:else}<p>empty</p>{/each}",
            // EachBlock fallback over a state-bound empty list.
            "<script>let items = [];</script>{#each items as n}{n}{:else}none{/each}",
            // SnippetBlock body starting with text → is_text_first anchor inside.
            "{#snippet foo()}text<span>x</span>{/snippet}{@render foo()}",
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

    /// `<svelte:element>` (SvelteDynamicElement) SSR attribute / directive parity
    /// with the `transform_server` oracle. Covers the bare tag, a static + dynamic
    /// attribute, a `class:` directive with a CSS scope hash, a `style:` directive,
    /// a spread, and a no-children tag — the attribute argument (3rd arg of
    /// `$.element(...)`) must build the same `() => { $$renderer.push(...) }` thunk
    /// as a regular element. Compared structurally (the thunk bodies are
    /// block-bodied, which the text oracle prints at column 0).
    #[test]
    fn ast_matches_oracle_svelte_element_attributes() {
        // The AST printer (esrap) wraps a long `$.element(...)` call onto one arg
        // per line (and pads `(` / `)`), while the text oracle inlines it; both
        // are normalized to the same shape by the corpus pipeline's oxfmt pass.
        // Strip ALL whitespace so the gate asserts TOKEN equality (call args /
        // thunk bodies / expressions) free of pure layout noise. The only
        // whitespace inside a template literal here (`} data-k`) is identical on
        // both sides, so equality is preserved.
        fn norm_ws(s: &str) -> String {
            s.chars().filter(|c| !c.is_whitespace()).collect()
        }
        let samples = [
            // bare dynamic element, children only → interior `void 0` attrs
            "<svelte:element this={tag}>c</svelte:element>",
            // static + dynamic attribute
            "<svelte:element this={tag} id={x} data-k=\"v\">c</svelte:element>",
            // class: directive + CSS scope hash
            "<svelte:element this={\"div\"} class:foo={a}>c</svelte:element><style>div{color:red}</style>",
            // style: directive
            "<svelte:element this={tag} style:color={c}>c</svelte:element>",
            // spread → `$.attributes(...)`
            "<svelte:element this={tag} {...rest}>c</svelte:element>",
            // no children, no attrs → `$.element($$renderer, tag)`
            "<svelte:element this={tag} />",
            // attrs but no children
            "<svelte:element this={tag} id={x} />",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm_ws(&ours) == norm_ws(&oracle);
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
            "AST <svelte:element> output differs from oracle for: {mismatches:?}"
        );
    }

    /// `<slot>` (SlotElement) SSR structural parity with the `transform_server`
    /// oracle. Covers the default slot, a named slot with fallback content, a slot
    /// with a slot-prop (`{x}`), an empty default slot (no fallback → `null`), and
    /// a slot prop with a literal value. Compared STRUCTURALLY (the `$.slot(...)`
    /// call args / fallback thunk shape / `<!--[-->` … `<!--]-->` markers).
    #[test]
    fn ast_matches_oracle_slot_element() {
        let samples = [
            // default slot, no fallback → fallback `null`.
            "<slot></slot>",
            // named slot with fallback content.
            "<slot name=\"header\">fallback</slot>",
            // default slot with a slot prop (`{x}` shorthand).
            "<script>let x = 1;</script><slot {x}></slot>",
            // named slot with a literal prop and fallback.
            "<slot name=\"item\" label=\"hi\">default</slot>",
            // default slot with fallback markup.
            "<slot><p>none</p></slot>",
        ];
        // The text-based `transform_server` oracle hardcodes DOUBLE quotes for a
        // slot prop's string literal (`build_attribute_value_expr`), while the AST
        // pipeline emits esrap's SINGLE-quoted literal — the same single-quoted
        // form the oracle itself uses for *component* props and which matches the
        // official compiler. The corpus comparison normalizes quote style via
        // oxfmt, so this is a pure oracle quirk; normalize `"` → `'` here so the
        // gate asserts STRUCTURAL parity, not the oracle's quote bug.
        let norm_quotes = |s: &str| norm_blocks(s).replace('"', "'");
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm_quotes(&ours) == norm_quotes(&oracle);
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
            "AST slot output differs from oracle (structurally) for: {mismatches:?}"
        );
    }

    /// IfBlock structural parity with the `transform_server` oracle, exercising
    /// the shapes that the `is_text_first` anchor fix unblocked. Covers:
    ///   - bare `{#if}`, `{:else}`, `{:else if}` chains, empty body,
    ///   - state / derived test conditions (read-wrapping),
    ///   - if nested in an each block,
    ///   - a fragment-level text-first sibling around the if (the `<!---->`
    ///     anchor at FRAGMENT scope), and
    ///   - a text-first / element-first IfBlock BODY (the consequent is NOT an
    ///     `is_text_first` parent, so NO anchor inside the branch).
    /// All compared STRUCTURALLY (indentation-insensitive) like the block samples.
    #[test]
    fn ast_matches_oracle_if_block_text_first() {
        let samples = [
            "{#if x}a{/if}",
            "{#if x}a{:else}b{/if}",
            "{#if x}a{:else if y}b{:else}c{/if}",
            "{#if x}{/if}",
            "<script>let x = $state(true);</script>{#if x}a{/if}",
            "<script>let d = $derived(true);</script>{#if d}a{/if}",
            "{#each [1] as n}{#if n}a{/if}{/each}",
            // fragment-level text-first siblings: a leading `<!---->` anchor is
            // emitted at FRAGMENT scope (the regression this commit fixes).
            "text{#if x}a{/if}text",
            // text-first IfBlock body: the consequent fragment is NOT an
            // `is_text_first` parent, so it gets NO leading `<!---->`.
            "{#if x}text<span>y</span>{/if}",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm_blocks(&ours) == norm_blocks(&oracle);
            eprintln!(
                "\n===== SRC: {src} ===== {}\n--- NEW ---\n{ours}\n--- ORACLE ---\n{oracle}",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "IfBlock output differs from oracle (structurally) for: {mismatches:?}"
        );
    }

    /// Keyed `{#each ... (key)}` parity with the `transform_server` oracle.
    ///
    /// Upstream's server `EachBlock.js` never references `node.key` — the key
    /// only drives client-side keyed reconciliation — so a keyed each renders
    /// byte-identically to the same each without a key.
    #[test]
    fn ast_matches_oracle_keyed_each() {
        let samples = [
            // Keyed each, identifier key.
            "<script>let items = [{ id: 1, name: 'a' }];</script>\
             {#each items as item (item.id)}<li>{item.name}</li>{/each}",
            // Keyed each + `{:else}` fallback.
            "<script>let items = [];</script>\
             {#each items as item (item.id)}<li>{item.name}</li>{:else}<p>empty</p>{/each}",
            // Keyed each with an index binding.
            "<script>let items = [{ id: 1 }];</script>\
             {#each items as item, i (item.id)}<li>{i}</li>{/each}",
            // Keyed each over a literal collection, simple expression key.
            "{#each [1, 2, 3] as n (n)}<li>{n}</li>{/each}",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm_blocks(&ours) == norm_blocks(&oracle);
            eprintln!(
                "\n===== SRC: {src} ===== {}\n--- NEW ---\n{ours}\n--- ORACLE ---\n{oracle}",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "keyed EachBlock output differs from oracle (structurally) for: {mismatches:?}"
        );
    }

    /// `{@const}` (ConstTag) and `{@debug}` (DebugTag) structural parity with the
    /// `transform_server` oracle.
    #[test]
    fn ast_matches_oracle_const_debug_tags() {
        let samples = [
            // {@const} inside {#if}: const inline, then the reader push.
            "{#if true}{@const x = 2 + 3}<p>{x}</p>{/if}",
            // {@const} reading an each-context binding (read-wrapped init).
            "{#each [1, 2] as n}{@const d = n * 2}<li>{d}</li>{/each}",
            // {@const} with a destructuring pattern.
            "{#if true}{@const { a, b } = obj}<p>{a}{b}</p>{/if}",
            // {@debug} with identifiers reading instance state.
            "<script>let y = $state(0);</script>{@debug y}",
            // {@debug} with multiple identifiers.
            "<script>let a = $state(0); let b = $state(1);</script>{@debug a, b}",
            // bare {@debug} (no identifiers) → lone debugger.
            "{@debug}",
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
            "const/debug-tag output differs from oracle (structurally) for: {mismatches:?}"
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

    /// `<svelte:boundary>` structural parity with the `transform_server` oracle.
    /// The no-pending + `failed`-snippet case wraps the children in
    /// `$$renderer.boundary({ failed }, ($$renderer) => { <!--[--> { ... } <!--]--> })`
    /// and hoists the `failed` snippet function. The no-failed case skips the
    /// wrapper and renders the children between `<!--[-->` / `<!--]-->` directly.
    /// Compared STRUCTURALLY (indentation-insensitive) like the block samples.
    #[test]
    fn ast_matches_oracle_svelte_boundary() {
        let samples = [
            // failed snippet → boundary wrapper + hoisted `failed` fn.
            "<svelte:boundary>{#snippet failed(e)}err{/snippet}<p>main</p></svelte:boundary>",
            // no failed branch → no wrapper, children rendered inline.
            "<svelte:boundary><p>main</p></svelte:boundary>",
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
            "svelte:boundary output differs from oracle (structurally) for: {mismatches:?}"
        );
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

    /// `<select>` / `<option>` / `<optgroup>` SSR wrapper parity with the
    /// `transform_server` oracle. Covers:
    ///   - `<select><option value="a">A</option></select>` — option-only select
    ///     (NOT special: no select `value`/spread), each option a wrapper,
    ///   - `<select bind:value={v}>` — special select → `$$renderer.select(...)`,
    ///   - `<select value={v}>` — special select via plain `value` attr,
    ///   - `<optgroup label="g"><option>x</option></optgroup>` — optgroup (rich
    ///     content via the inner option) + nested option wrappers,
    ///   - rich-content `<select>` (a `<div>` child) → trailing `<!>` marker +
    ///     `true` flag,
    ///   - `<option>{v}</option>` — synthetic-value option (direct value arg).
    /// Compared STRUCTURALLY (indentation-insensitive) like the block samples.
    #[test]
    fn ast_matches_oracle_select_option() {
        let samples = [
            "<select><option value=\"a\">A</option></select>",
            "<script>let v = 'a';</script><select bind:value={v}><option value=\"a\">A</option></select>",
            "<script>let v = 'a';</script><select value={v}><option value=\"a\">A</option></select>",
            "<optgroup label=\"g\"><option>x</option></optgroup>",
            "<script>let v = 'a';</script><select bind:value={v}><div>rich</div><option value=\"a\">A</option></select>",
            "<script>let v = 'a';</script><option>{v}</option>",
            "<option value=\"a\">A</option>",
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
            "select/option output differs from oracle (structurally) for: {mismatches:?}"
        );
    }

    /// Special-element parity with the `transform_server` oracle for
    /// `<svelte:window>` / `<svelte:document>` / `<svelte:body>` /
    /// `<svelte:head>` (with a real `<meta>` child) / `<svelte:options>`.
    ///
    /// - `<svelte:window>` / `<svelte:document>` / `<svelte:options>` must emit
    ///   NO markup (no upstream server visitor).
    /// - `<svelte:body>` renders its children INLINE (upstream `context.next()`),
    ///   but the analyzer FORBIDS children on `<svelte:body>`
    ///   (`svelte_meta_invalid_content`), so in practice the inline walk is over
    ///   an empty fragment and emits nothing — asserted as no-markup below.
    /// - `<svelte:head><meta …></svelte:head>` lowers to `$.head(...)`.
    ///
    /// All compared STRUCTURALLY (indentation-insensitive) like the block samples.
    #[test]
    fn ast_matches_oracle_special_elements() {
        // (src, compare_against_oracle?). The SvelteBody-with-children sample is
        // upstream-faithful (children rendered) but the OLD text oracle drops it,
        // so that one is asserted on its own invariant instead of oracle parity.
        let oracle_samples = [
            // window / document event-handler hosts → no markup, before some text.
            "<svelte:window on:resize={f}/>text",
            "<svelte:document on:visibilitychange={f}/>text",
            // <svelte:options> compile-time-only → no markup.
            "<svelte:options runes={false}/><p>x</p>",
            // <svelte:head> with a real <meta> child.
            "<svelte:head><meta name=\"x\" content=\"y\"></svelte:head>",
        ];
        let mut mismatches = Vec::new();
        for src in oracle_samples {
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
            "special-element output differs from oracle for: {mismatches:?}"
        );

        // SvelteWindow / SvelteDocument / SvelteBody / SvelteOptions must emit no
        // markup at all (window/document/options have no upstream server visitor;
        // SvelteBody renders its children inline but the analyzer forbids
        // children, so the inline walk is over an empty fragment). With no
        // siblings, the whole component body has zero pushes.
        for src in [
            "<svelte:window on:keydown={f}/>",
            "<svelte:document on:click={f}/>",
            "<svelte:body on:click={f}/>",
            "<svelte:options namespace=\"html\"/>",
        ] {
            let out = run(src);
            eprintln!("=== empty-output {src} ===\n{out}");
            assert!(
                !out.contains("$$renderer.push"),
                "special element `{src}` unexpectedly emitted markup:\n{out}"
            );
        }
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

    /// Component CHILDREN / SLOTS / SNIPPET props parity with the
    /// `transform_server` oracle. Each sample has a `<Foo>…</Foo>` body that must
    /// serialize into a `children` snippet prop (`+ $$slots.default: true`),
    /// named-slot `$$slots` entries, and/or hoisted snippet-function declarations
    /// passed as props.
    ///
    /// The FULL output diverges only in the hoisted `import Foo …;` (instance-
    /// script gap), so this gate isolates the `$$renderer.push(...)` /
    /// `Foo($$renderer, …)` region and asserts it matches the oracle byte-for-byte
    /// (after the indentation-insensitive `norm_blocks` normalization — the
    /// children arrow / snippet block introduce nesting the text oracle indents
    /// inconsistently, exactly the case `norm_blocks` is for).
    #[test]
    fn ast_matches_oracle_component_children() {
        // (label, body). A leading text sibling (`z`) keeps the component
        // non-standalone so the `<!---->` anchor matches in both pipelines and
        // forces the children snippet to be exercised.
        let cases: &[(&str, &str)] = &[
            ("default-text", "<Foo>hi</Foo>"),
            ("default-element-expr", "<Foo><span>{x}</span></Foo>"),
            (
                "snippet-and-body",
                "<Foo>{#snippet header()}h{/snippet}body</Foo>",
            ),
        ];
        // `x` is a function-call read (not a literal), so neither pipeline can
        // constant-fold it via `scope.evaluate` — the `{x}` interpolation stays a
        // runtime `$.escape(x())` in BOTH, keeping the bodies comparable (a
        // `$state(1)` literal would be folded to `1` by the oracle only — an
        // orthogonal KNOWN GAP).
        let decls = "let x = $derived(Math.random());";

        // Extract the component-call region: every line from the first line that
        // mentions `Foo($$renderer` or opens its wrapping block, through the
        // trailing `<!---->`. Simpler: collect the lines of the LAST
        // `$$renderer.push` call onward (the component statement + anchor), which
        // is where children/slots land. We compare the whole body after the
        // instance prologue instead, dropping the hoisted-import region.
        let body_after_prologue = |dump: &str| -> Vec<String> {
            let mut out = Vec::new();
            let mut in_fn = false;
            for l in dump.lines() {
                let t = l.trim();
                if t.starts_with("export default function App") || t.starts_with("function App(") {
                    in_fn = true;
                    continue;
                }
                if !in_fn {
                    continue;
                }
                // Skip the legacy instance prologue (let/const/import lines) until
                // the first $$renderer template statement.
                out.push(t.to_string());
            }
            // Keep only from the first `$$renderer`-touching line onward so the
            // hoisted-import / prologue divergence is excluded.
            if let Some(pos) = out.iter().position(|l| l.contains("$$renderer")) {
                out.drain(0..pos);
            }
            out.into_iter().filter(|l| !l.is_empty()).collect()
        };

        let mut failures = Vec::new();
        for (label, body) in cases {
            let src = format!("<script>import Foo from './Foo.svelte'; {decls}</script>z{body}");
            let ours = run(&src);
            let oracle = oracle_dump(&src);
            let ob = body_after_prologue(&norm_blocks(&ours));
            let orb = body_after_prologue(&norm_blocks(&oracle));
            // Collapse ALL whitespace in the joined region so the comparison is
            // insensitive to esrap's multi-line object layout vs the text
            // oracle's single-line object (pure formatting — the corpus
            // output-equality pipeline reconciles exactly this via oxfmt).
            let collapse =
                |v: &[String]| v.join(" ").split_whitespace().collect::<Vec<_>>().join(" ");
            let matched = collapse(&ob) == collapse(&orb);
            eprintln!(
                "=== {label}: {body} === {}\n  ours:   {ob:?}\n  oracle: {orb:?}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                failures.push(*label);
            }
        }
        assert!(
            failures.is_empty(),
            "component children/slots differ from oracle for: {failures:?}"
        );
    }

    /// Dynamic-component SSR guard parity with the `transform_server` oracle:
    ///   - `<svelte:component this={Cmp} a={x}/>` (always dynamic), and
    ///   - `<Foo.Bar/>` (dynamic via a member-expression component name).
    ///
    /// Both must lower to the guarded
    /// `if (<expr>) { $$renderer.push('<!--[-->'); <expr>($$renderer, props);
    /// $$renderer.push('<!--]-->'); } else { $$renderer.push('<!--[!-->');
    /// $$renderer.push('<!--]-->'); }` form. The FULL output diverges only in the
    /// instance prologue / hoisted imports, so this gate isolates the
    /// `$$renderer`-touching region (from the first `if (` / `$$renderer.push`
    /// line onward) and compares it whitespace-collapsed (the corpus pipeline
    /// reconciles esrap's multi-line layout vs the text oracle via oxfmt).
    #[test]
    fn ast_matches_oracle_dynamic_component() {
        let cases: &[(&str, &str)] = &[
            (
                "svelte-component",
                "<script>let Cmp = $state(null); let x = $state(1);</script>z<svelte:component this={Cmp} a={x}/>",
            ),
            (
                "member-expression",
                "<script>import Foo from './Foo.svelte'; let x = $state(1);</script>z<Foo.Bar a={x}/>",
            ),
        ];

        // Collect the component region: every line from the first one that opens
        // the dynamic `if (` guard onward (the guarded block + its markers).
        let guard_region = |dump: &str| -> Vec<String> {
            let normd = norm_blocks(dump);
            let all: Vec<String> = normd.lines().map(str::to_string).collect();
            match all.iter().position(|l| l.starts_with("if (")) {
                Some(pos) => all[pos..].to_vec(),
                None => Vec::new(),
            }
        };
        // Collapse whitespace AND strip the oracle's cosmetic parens around a
        // bare-identifier callee (`(Cmp)($$renderer, …)` vs `Cmp($$renderer, …)`).
        // The text oracle parenthesizes the `<svelte:component this={Cmp}>` callee;
        // oxfmt elides this in the corpus output-equality pipeline. KNOWN COSMETIC
        // GAP — normalize it here so the structural guard is what's under test.
        let collapse = |v: &[String]| {
            let joined = v.join(" ").split_whitespace().collect::<Vec<_>>().join(" ");
            joined.replace("(Cmp)(", "Cmp(")
        };

        let mut failures = Vec::new();
        for (label, src) in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let og = guard_region(&ours);
            let orl = guard_region(&oracle);
            let matched = !og.is_empty() && collapse(&og) == collapse(&orl);
            eprintln!(
                "=== {label}: {src} === {}\n  ours:   {og:?}\n  oracle: {orl:?}\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                failures.push(*label);
            }
        }
        assert!(
            failures.is_empty(),
            "dynamic-component guard differs from oracle for: {failures:?}"
        );
    }

    /// Block close-anchor placement parity with the `transform_server` oracle.
    ///
    /// 写经 upstream `Fragment.js` / `clean_nodes`: a fragment whose single
    /// surviving (non-hoisted) child is a non-dynamic Component / RenderTag is
    /// "standalone" (`is_standalone`), so the enclosing block's anchor suffices
    /// and the child's own trailing `<!---->` empty-comment anchor is suppressed.
    /// `is_standalone` is per-fragment, so this must hold inside EVERY block arm
    /// (if / else / each body / each fallback / key body / await arms /
    /// `<svelte:head>` callback / snippet body / slot body), not just the root.
    ///
    /// Previously the AST pipeline set `is_standalone` only for the root
    /// fragment, so these arms emitted a spurious `$$renderer.push(\`<!---->\`)`
    /// after the standalone child. Each sample is compared STRUCTURALLY
    /// (indentation-insensitive) against the oracle.
    #[test]
    fn ast_matches_oracle_block_close_anchor() {
        let import_foo = "<script>import Foo from './Foo.svelte';</script>";
        let import_foo_bar =
            "<script>import Foo from './Foo.svelte';import Bar from './Bar.svelte';</script>";
        let samples = [
            // {#if}: single standalone child in the consequent → no `<!---->`.
            format!("{import_foo}{{#if true}}<Foo/>{{/if}}"),
            // {#if}/{:else}: BOTH arms standalone.
            format!("{import_foo_bar}{{#if x}}<Foo/>{{:else}}<Bar/>{{/if}}"),
            // {#if}/{:else if}/{:else}: all three arms standalone.
            format!(
                "<script>import A from './A.svelte';import B from './B.svelte';import C from './C.svelte';</script>{{#if x}}<A/>{{:else if y}}<B/>{{:else}}<C/>{{/if}}"
            ),
            // {#each} body standalone child.
            format!("{import_foo}{{#each [1] as n}}<Foo/>{{/each}}"),
            // {#each} with standalone child AND a standalone {:else} fallback.
            format!(
                "<script>import Foo from './Foo.svelte';import Bar from './Bar.svelte';let items = [];</script>{{#each items as n}}<Foo/>{{:else}}<Bar/>{{/each}}"
            ),
            // {#key} body standalone child.
            format!("{import_foo}{{#key 1}}<Foo/>{{/key}}"),
            // <svelte:head> callback standalone child → no leading/trailing anchor.
            format!("{import_foo}<svelte:head><Foo/></svelte:head>"),
            // A NON-standalone arm (two children) MUST keep the anchor after Foo.
            format!("{import_foo}{{#if true}}<Foo/><span>x</span>{{/if}}"),
            // RenderTag standalone child in an if arm.
            "{#snippet foo()}<p>x</p>{/snippet}{#if true}{@render foo()}{/if}".to_string(),
        ];
        let mut mismatches = Vec::new();
        for src in &samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm_blocks(&ours) == norm_blocks(&oracle);
            eprintln!(
                "\n===== SRC: {src} ===== {}\n--- NEW ---\n{ours}\n--- ORACLE ---\n{oracle}",
                if matched { "MATCH" } else { "DIFFER" }
            );
            if !matched {
                mismatches.push(src.clone());
            }
        }
        assert!(
            mismatches.is_empty(),
            "block close-anchor placement differs from oracle for: {mismatches:?}"
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

    /// Canonicalize `code` via oxc parse → codegen. This is the SAME comparison
    /// the runtime harness uses (`tests/common::canonicalize_js`): it normalizes
    /// formatting (whitespace, trailing commas, semicolons) but preserves
    /// structure (statement count, expressions). Matching the oracle under this
    /// canonicalizer is the real runtime gate (the oracle passes those fixtures).
    fn canon_js(code: &str) -> String {
        let allocator = Allocator::default();
        let parsed = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
        oxc_codegen::Codegen::new().build(&parsed.program).code
    }

    /// EACH-block + destructuring SSR parity with the (correct) `transform_server`
    /// oracle for the runtime fixtures in this cluster. Compared with
    /// [`canon_js`] — the same canonicalizer the runtime harness uses — so a
    /// match here means the runtime suite passes (the oracle passes these).
    ///
    /// Covered (must MATCH):
    /// - `each-block-destructured-default` (runtime-legacy): an each context
    ///   object-pattern with DEFAULT values + a `...rest` and an `export const`
    ///   (kept verbatim, NOT prop-lowered to `$.fallback`).
    /// - `each-updates` (runtime-runes): unkeyed + keyed each over `$state`.
    /// - `component-slot-let-destructured-2` / `…-fragment-…` (runtime-legacy):
    ///   `let:value={[a,b]}` / `let:value={{a,b}}` slot-let destructuring +
    ///   multi-declarator `let c = 0, d = 0, e = 0` (split into separate
    ///   statements, matching the oracle / official output).
    /// - `each-non-branch-effects` (runtime-runes): plain each over a Proxy.
    ///
    /// `each-updates-5` is intentionally NOT asserted here: its only divergence
    /// is store-write wrapping inside a nested function body (`$store[0].value++`
    /// → `$.store_get($$store_subs ??= {}, …)`), an orthogonal store-subscription
    /// axis unrelated to each-block / destructuring.
    /// `$inspect` / `$effect` / dev-instrumentation SSR cluster parity with the
    /// (correct) text-based `transform_server` oracle. Covers nested-scope rune
    /// lowering and effect/inspect removal:
    ///
    /// - `runes-in-module-context`: `$state` / `$derived` declared inside a
    ///   `<script module>` factory FUNCTION body must be lowered (`$state(0)` →
    ///   `0`, `$derived(e)` → `$.derived(() => e)`), and the derived READ inside
    ///   the getter must become a call (`return double` → `return double()`).
    /// - `inspect` / `inspect-derived`: a top-level `$inspect(count)` /
    ///   `$inspect(y).with(push)` statement is removed.
    /// - `effect-cleanup` / `effect-order` / `nested-effect-conflict`: top-level
    ///   `$effect(...)` (with arbitrary nested `$effect` / `$derived` inside) is
    ///   removed entirely.
    ///
    /// Compared via the SAME esrap `canon` reprint the corpus harness uses (which
    /// strips no-op `EmptyStatement`s), so a match here means the runtime suite
    /// passes (the oracle passes these fixtures, and empty statements left behind
    /// by the text-oracle are runtime no-ops).
    #[test]
    fn ast_matches_oracle_inspect_effect_cluster() {
        let samples: &[(&str, &str)] = &[
            (
                "runes-in-module-context",
                "<script module>\n  function createCounter() {\n    let count = $state(0);\n    let double = $derived(count * 2);\n    return {\n      get count() { return count },\n      set count(value) { count = value },\n      get double() { return double },\n    }\n  }\n</script>\n\n<script>\n  const counter = createCounter();\n</script>\n\n<button on:click={() => counter.count++}>{counter.double}</button>",
            ),
            (
                "inspect-derived",
                "<script>\n\tlet { push } = $props();\n\tlet x = $state('x');\n\tlet y = $derived(x.toUpperCase());\n\t$inspect(y).with(push);\n</script>\n\n<button on:click={() => x += 'x'}>{x}</button>",
            ),
            (
                "inspect",
                "<script>\n\tlet count = $state(0);\n\t$inspect(count);\n</script>\n<button onclick={() => count++}>{count}</button>",
            ),
            (
                "effect-cleanup",
                "<script>\n\tlet count = $state(0);\n\t$effect(() => {\n\t\tlet double = $derived(count * 2)\n\t\tconsole.log('init ' + double);\n\t\treturn function() { console.log('cleanup ' + double); };\n\t})\n</script>\n<button onclick={() => count++ }>Click</button>",
            ),
            (
                "effect-order",
                "<script>\n\tlet s = $state(0);\n\tlet d = $derived(s)\n\t$effect(() => { s; })\n\t$effect(() => { d; })\n</script>\n<h1>{s}</h1>",
            ),
            (
                "nested-effect-conflict",
                "<script>\n\tlet c = $state({ a: 0 });\n\t$effect(() => {\n\t\t$effect(() => {\n\t\t\tif (c) { $effect(() => { c.a; }); }\n\t\t});\n\t});\n</script>\n<button>x</button>",
            ),
        ];
        let mut mismatches = Vec::new();
        for (name, src) in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let (Some(co), Some(cr)) = (canon(&ours), canon(&oracle)) else {
                mismatches.push(*name);
                continue;
            };
            let matched = co == cr;
            if !matched {
                eprintln!(
                    "=== {name} === DIFFER\n--- OURS ---\n{ours}\n--- ORACLE ---\n{oracle}\n"
                );
                mismatches.push(*name);
            }
        }
        assert!(
            mismatches.is_empty(),
            "inspect/effect SSR output differs from oracle for: {mismatches:?}"
        );
    }

    #[test]
    fn ast_matches_oracle_each_and_let_destructure() {
        let each_default = "<script>\n\texport let animalEntries;\n\texport const defaultHeight = 30;\n</script>\n\n{#each animalEntries as { animal, species = 'unknown', kilogram: weight = 50, pound = (weight * 2.2).toFixed(0), height = defaultHeight, bmi = weight / (height * height), ...props } }\n\t<p {...props}>{animal} - {species} - {weight}kg ({pound} lb) - {height}cm - {bmi}</p>\n{/each}";
        let slot_let = "<script>\n\timport Nested from \"./Nested.svelte\";\n\tlet c = 0, d = 0, e = 0;\n</script>\n\n<div>\n\t<Nested props={['hello', 'world']} let:value={pair} let:data={foo}>\n\t\t{pair[0]} {pair[1]} {c} {foo}\n\t</Nested>\n\t<button on:click={() => { c += 1; }}>Increment</button>\n</div>\n<div>\n\t<Nested props={['hello', 'world']} let:value={[a, b]} let:data={foo}>\n\t\t{a} {b} {d} {foo}\n\t</Nested>\n</div>\n<div>\n\t<Nested props={{ a: 'hello', b: 'world' }} let:value={{ a, b }} let:data={foo}>\n\t\t{a} {b} {e} {foo}\n\t</Nested>\n</div>";
        let frag_let = "<script>\n\timport Nested from \"./Nested.svelte\";\n\tlet c = 0, d = 0, e = 0;\n</script>\n\n<div>\n\t<Nested props={['hello', 'world']}>\n\t\t<svelte:fragment slot=\"main\" let:value={pair} let:data={foo}>\n\t\t\t{pair[0]} {pair[1]} {c} {foo}\n\t\t</svelte:fragment>\n\t</Nested>\n</div>\n<div>\n\t<Nested props={['hello', 'world']}>\n\t\t<svelte:fragment slot=\"main\" let:value={[a, b]} let:data={foo}>\n\t\t\t{a} {b} {d} {foo}\n\t\t</svelte:fragment>\n\t</Nested>\n</div>";
        let samples: &[(&str, &str)] = &[
            ("each-block-destructured-default", each_default),
            (
                "each-updates",
                "<script>\n\tlet items = $state();\n</script>\n{#each items as item}\n  <p>{item.name} costs ${item.price}</p>\n{/each}\n{#each items as item (item.id)}\n  <p>{item.name} costs ${item.price}</p>\n{/each}",
            ),
            ("component-slot-let-destructured-2", slot_let),
            ("component-svelte-fragment-let-destructured-2", frag_let),
            (
                "each-non-branch-effects",
                "<script>\n\tlet items = $state([]);\n\tconst proxy = new Proxy(items, {\n\t\tget: (target, prop) => {\n\t\t\ttry {\n\t\t\t\t$effect.pre(() => {\n\t\t\t\t\treturn () => {};\n\t\t\t\t});\n\t\t\t} catch {}\n\t\t\treturn Reflect.get(target, prop);\n\t\t}\n\t});\n\tfunction add() {\n\t\titems.push(items.length + 1);\n\t}\n</script>\n\n{#each proxy as item}\n\t<span>{item}</span>\n{/each}\n<button class=\"add\" onclick={add}>add</button>",
            ),
        ];
        let mut mismatches = Vec::new();
        for (name, src) in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = canon_js(&ours) == canon_js(&oracle);
            if !matched {
                eprintln!(
                    "=== {name} === DIFFER\n--- OURS ---\n{ours}\n--- ORACLE ---\n{oracle}\n"
                );
                mismatches.push(*name);
            }
        }
        assert!(
            mismatches.is_empty(),
            "each-block / let-destructure output differs from oracle for: {mismatches:?}"
        );
    }

    /// Parse + analyze + lower the `source` through BOTH pipelines under a
    /// caller-customized [`CompileOptions`], returning `(ast_output, oracle_output)`.
    /// Used by the entry-assembly tests (`props_id` / `$$css` inject / componentApi
    /// v4) that need non-default options (`css: Injected`, `componentApi: V4`).
    fn run_both_opts(source: &str, customize: impl Fn(&mut CompileOptions)) -> (String, String) {
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
        if let Some(module) = ast.module.as_mut() {
            phase1_parse::read::script::ensure_script_parsed(
                &ast.arena,
                module,
                source,
                &line_offsets,
            );
        }
        let mut options = CompileOptions {
            filename: Some("App.svelte".to_string()),
            ..CompileOptions::default()
        };
        customize(&mut options);
        let analysis =
            phase2_analyze::analyze_component(&mut ast, source, &options).expect("analyze");
        let allocator = Allocator::default();
        let ours = server_component_ast(&analysis, &ast, source, &options, &allocator)
            .expect("ast output");
        let oracle =
            super::super::transform_server(&analysis, &ast, source, &options).expect("server");
        (ours, oracle)
    }

    /// `props_id` entry assembly (upstream lines 253-258): a top-level
    /// `const id = $props.id()` is dropped from the body and re-emitted as the
    /// FIRST line of the component as `const id = $.props_id($$renderer);`.
    /// Asserts the AST pipeline emits that exact form AND matches the oracle.
    #[test]
    fn ast_matches_oracle_props_id() {
        let (ours, oracle) = run_both_opts(
            "<script>const id = $props.id();</script><p>{id}</p>",
            |_| {},
        );
        assert!(
            ours.contains("const id = $.props_id($$renderer);"),
            "props_id re-emission missing:\n{ours}"
        );
        assert!(
            !ours.contains("$props.id"),
            "original $props.id() must be dropped:\n{ours}"
        );
        assert_eq!(
            norm(&ours),
            norm(&oracle),
            "props_id output differs from oracle:\nOURS:\n{ours}\nORACLE:\n{oracle}"
        );
    }

    /// Component-bindings settle-loop (upstream lines 178-211): a `bind:` on a
    /// child `<Component>` sets `analysis.uses_component_bindings`, so the
    /// template body is wrapped in a `do { … } while (!$$settled)` loop with the
    /// `$$render_inner` function and `$$renderer.subsume(...)` trailer. Asserts
    /// the AST pipeline emits that shape AND matches the oracle (block-norm).
    #[test]
    fn ast_matches_oracle_component_bindings_settle_loop() {
        let (ours, oracle) = run_both_opts(
            "<script>import Child from './Child.svelte'; let v = $state(0);</script><Child bind:value={v} />",
            |_| {},
        );
        assert!(
            ours.contains("let $$settled = true;"),
            "$$settled declaration missing:\n{ours}"
        );
        assert!(
            ours.contains("let $$inner_renderer;"),
            "$$inner_renderer declaration missing:\n{ours}"
        );
        assert!(
            ours.contains("function $$render_inner($$renderer)"),
            "$$render_inner function missing:\n{ours}"
        );
        assert!(
            ours.contains("$$render_inner($$inner_renderer)")
                && ours.contains("} while (!$$settled);"),
            "do-while settle loop missing:\n{ours}"
        );
        assert!(
            ours.contains("$$renderer.subsume($$inner_renderer)"),
            "subsume trailer missing:\n{ours}"
        );
        assert_eq!(
            norm_blocks(&ours),
            norm_blocks(&oracle),
            "settle-loop output differs from oracle:\nOURS:\n{ours}\nORACLE:\n{oracle}"
        );
    }

    /// `$$css` injection (upstream lines 305-311): with `css: Injected`, a scoped
    /// `<style>` produces a module-scope `const $$css = { hash, code }` plus a
    /// `$$renderer.global.css.add($$css)` first line in the component. Asserts the
    /// AST pipeline matches the oracle byte-for-byte (after blank-line norm).
    #[test]
    fn ast_matches_oracle_css_inject() {
        let (ours, oracle) = run_both_opts(
            "<p class=\"x\">hi</p><style>.x { color: red; }</style>",
            |o| o.css = crate::compiler::CssMode::Injected,
        );
        assert!(
            ours.contains("const $$css = {"),
            "module-scope $$css const missing:\n{ours}"
        );
        assert!(
            ours.contains("$$renderer.global.css.add($$css)"),
            "css.add call missing:\n{ours}"
        );
        // Collapse ALL whitespace before comparison: esrap prints the synthetic
        // `$$css` object inline (dummy spans give no multi-line signal), while the
        // oracle multi-lines it. That is pure formatting — the corpus
        // output-equality pipeline reconciles exactly this via oxfmt — so compare
        // structurally (same convention as `corpus_new_vs_oracle`).
        let collapse = |s: &str| s.split_whitespace().collect::<Vec<_>>().join(" ");
        assert_eq!(
            collapse(&ours),
            collapse(&oracle),
            "css-inject output differs from oracle:\nOURS:\n{ours}\nORACLE:\n{oracle}"
        );
    }

    /// componentApi v4 export (upstream lines 313-355): with
    /// `compatibility.componentApi === 4`, the legacy `Component.render(...)`
    /// wrapper + `import { render as $$_render } from 'svelte/server'` +
    /// `export default <Name>` is emitted instead of `export default function`.
    #[test]
    fn ast_matches_oracle_component_api_v4() {
        let (ours, oracle) = run_both_opts("<p>hi</p>", |o| {
            o.compatibility.component_api = crate::compiler::ComponentApi::V4;
        });
        assert!(
            ours.contains("import { render as $$_render } from 'svelte/server';"),
            "v4 import missing:\n{ours}"
        );
        assert!(
            ours.contains("App.render = function ($$props, $$opts)"),
            "v4 render wrapper missing:\n{ours}"
        );
        assert!(
            ours.contains("context: $$opts?.context"),
            "v4 optional-context member missing:\n{ours}"
        );
        assert!(
            ours.contains("export default App;"),
            "v4 export default identifier missing:\n{ours}"
        );
        assert_eq!(
            norm(&ours),
            norm(&oracle),
            "componentApi v4 output differs from oracle:\nOURS:\n{ours}\nORACLE:\n{oracle}"
        );
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

    /// Element CONTENT-bind codegen parity with the `transform_server` oracle.
    /// These binds render the bound value as the element's CHILD CONTENT (not an
    /// attribute), via the `if ($$body) push else children` body. Each sample
    /// declares the bound binding in an instance `<script>` ($state rune) so the
    /// instance body matches in both pipelines and only the content body is under
    /// test. Covers:
    ///   - `<textarea value="hi">`              → `$.escape('hi')` content
    ///   - `<textarea bind:value={x}>`          → `$.escape(x)` content
    ///   - contenteditable `bind:innerHTML={x}` → unescaped `x` content
    ///   - contenteditable `bind:textContent`   → `$.escape(x)` content
    ///   - contenteditable `bind:innerText`     → `$.escape(x)` content
    #[test]
    fn ast_matches_oracle_content_binds() {
        let samples = [
            // static textarea value -> escaped content
            "<textarea value=\"hi\"></textarea>",
            // bind:value on textarea -> escaped content
            "<script>let x = $state('');</script><textarea bind:value={x}></textarea>",
            // contenteditable bind:innerHTML -> unescaped content
            "<script>let x = $state('');</script><div contenteditable=\"true\" bind:innerHTML={x}></div>",
            // contenteditable bind:textContent -> escaped content
            "<script>let x = $state('');</script><div contenteditable=\"true\" bind:textContent={x}></div>",
            // contenteditable bind:innerText -> escaped content
            "<script>let x = $state('');</script><div contenteditable=\"true\" bind:innerText={x}></div>",
            // textarea bind:value with non-empty fallback children (else branch)
            "<script>let x = $state('');</script><textarea bind:value={x}>fallback</textarea>",
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
            "content-bind codegen differs from oracle (structurally) for: {mismatches:?}"
        );
    }

    /// Element SPREAD-attribute codegen parity with the `transform_server`
    /// oracle. Any `{...obj}` switches the whole element to a single
    /// `$.attributes(object, css_hash?, classes?, styles?, flags?)` call that
    /// merges static + dynamic + spread attributes. Covers:
    ///   - bare spread `<div {...spread}>`            → `$.attributes({ ...spread })`
    ///   - static + spread + dynamic (source order)   → `{ class: 'a', ...spread, id: x }`
    ///   - scope-hash (style block)                   → `$.attributes({ ...spread }, 'svelte-…')`
    ///   - `class:` directive (3rd arg)               → `…, void 0, { foo: on }`
    ///   - `style:` directive (4th arg)               → `…, void 0, void 0, { color: c }`
    ///   - `<input>` flags                            → `…, 4`
    ///   - `<svg>` namespaced flags                   → `…, 3`
    #[test]
    fn ast_matches_oracle_spread_attributes() {
        let samples = [
            // bare spread
            "<script>let spread = $state({});</script><div {...spread}></div>",
            // static class + spread + dynamic id (source order preserved)
            "<script>let spread = $state({}); let x = $state(1);</script><div class=\"a\" {...spread} id={x}></div>",
            // scope hash from a <style> block
            "<script>let spread = $state({});</script><div {...spread}>x</div><style>div{color:red}</style>",
            // class: directive
            "<script>let spread = $state({}); let on = $state(true);</script><div {...spread} class:foo={on}></div>",
            // style: directive
            "<script>let spread = $state({}); let c = $state('red');</script><div {...spread} style:color={c}></div>",
            // <input> flags
            "<script>let spread = $state({});</script><input {...spread}>",
            // <svg> namespaced flags
            "<script>let spread = $state({});</script><svg {...spread}></svg>",
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
            "spread-attribute codegen differs from oracle for: {mismatches:?}"
        );
    }

    /// `class:` / `style:` directives on a NON-spread element lower to the 3rd
    /// arg of `$.attr_class(value, hash, { 'name': value })` / the 2nd arg of
    /// `$.attr_style(value, { name: value })`. Parity with the `transform_server`
    /// oracle. Covers:
    ///   - `class:foo={a}` (no class attr; synthetic `class=""`)  → `('', void 0, { 'foo': a })`
    ///   - `class="x" class:foo={a}` + scope hash (hash folded)    → `('x svelte-…', void 0, { 'foo': a })`
    ///   - `style:color={c}` (synthetic `style=""`)                → `('', { color: c })`
    ///   - `style:color|important={c}` (important array split)     → `('', [{}, { color: c }])`
    ///   - multiple class / mixed important style directives,
    ///   - dynamic `class={'y'}` + a class directive (clsx-wrapped value).
    #[test]
    fn ast_matches_oracle_class_style_directives() {
        // Collapse runs of spaces so a purely-cosmetic empty-object rendering
        // (the text-based `transform_server` oracle prints `{  }`, the AST/esrap
        // printer + the OFFICIAL compiler print `{}`) does not register as a
        // structural diff — the corpus pipeline normalises this via oxfmt.
        fn norm_ws(s: &str) -> String {
            let mut out = String::with_capacity(s.len());
            let mut last_space = false;
            for ch in norm(s).chars() {
                if ch == ' ' {
                    if !last_space {
                        out.push(ch);
                    }
                    last_space = true;
                } else {
                    out.push(ch);
                    last_space = false;
                }
            }
            // Collapse an empty object `{ }` (oracle) to `{}` (AST / official).
            out.replace("{ }", "{}")
        }
        let samples = [
            "<script>let a = $state(true);</script><div class:foo={a}></div>",
            "<script>let a = $state(true);</script><div class=\"x\" class:foo={a}></div><style>div{color:red}</style>",
            "<script>let c = $state('red');</script><div style:color={c}></div>",
            "<script>let c = $state('red');</script><div style:color|important={c}></div>",
            "<script>let a = $state(true); let b = $state(false);</script><div class:foo={a} class:bar={b}></div>",
            "<script>let c = $state('red'); let d = $state('1px');</script><div style:color={c} style:padding|important={d}></div>",
            // shorthand boolean class directive (no script binding)
            "<span class:foo={true}></span>",
            // custom-property style directive (QUOTED `'--foo'` key) with a
            // static value
            "<div style:--foo=\"bar\"></div>",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm_ws(&ours) == norm_ws(&oracle);
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
            "class:/style: directive codegen differs from oracle for: {mismatches:?}"
        );

        // `class={'y'}` (a string-literal class) + a `class:` directive: the AST
        // pipeline matches the OFFICIAL compiler, which does NOT clsx-wrap a
        // non-clsx (Literal) class value — `$.attr_class('y', void 0, { 'foo': a })`.
        // The text-based `transform_server` oracle over-eagerly wraps it in
        // `$.clsx(...)` here, so it is asserted against the upstream-correct shape
        // directly rather than the (divergent) oracle.
        let ours =
            run("<script>let a = $state(true);</script><div class={'y'} class:foo={a}></div>");
        assert!(
            ours.contains("$.attr_class('y', void 0, { 'foo': a })"),
            "class={{'y'}} + class:foo should match the official compiler's \
             non-clsx-wrapped form, got:\n{ours}"
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
            // (a) class-field $state -> `count = 0`
            (
                "<script>class C { count = $state(0); }</script><p>x</p>",
                "count = 0;",
            ),
            // (a) class-field $state.raw -> `r = 7`
            (
                "<script>class C { r = $state.raw(7); }</script><p>x</p>",
                "r = 7;",
            ),
            // (a) class-field $derived -> `d = $.derived(() => 1 + 1)`
            (
                "<script>class C { d = $derived(1 + 1); }</script><p>x</p>",
                "d = $.derived(() => 1 + 1);",
            ),
            // (a) class-field $derived.by -> `d = $.derived(fn)`
            (
                "<script>class C { d = $derived.by(() => 2); }</script><p>x</p>",
                "d = $.derived(() => 2);",
            ),
            // (b) $props() rest -> inject $$slots / $$events before the rest.
            (
                "<script>let { x, ...rest } = $props();</script><p>{x}</p>",
                "let { x, $$slots, $$events, ...rest } = $$props;",
            ),
            // (b) $props() identifier -> object-pattern-with-rest expansion.
            (
                "<script>let props = $props();</script><p>x</p>",
                "let { $$slots, $$events, ...props } = $$props;",
            ),
            // (b) $props() plain object (no rest) -> unchanged.
            (
                "<script>let { a } = $props();</script><p>{a}</p>",
                "let { a } = $$props;",
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

    /// `$props()` `$$slots` deconfliction: when the component also declares
    /// `<slot>` (`analysis.uses_slots`), the injected slots key uses the
    /// deconflicted `$$slots_` value (写经 `VariableDeclaration.js:56-58`). The
    /// AST output must match the `transform_server` oracle line-for-line.
    #[test]
    fn ast_matches_oracle_props_slots_deconflict() {
        // Referencing `$$slots` in the template sets `analysis.uses_slots`, which
        // deconflicts the injected slots-key value to `$$slots_`.
        let cases: &[(&str, &str)] = &[
            // rest + uses_slots → `$$slots: $$slots_`
            (
                "<script>let { x, ...rest } = $props();</script>{x}{$$slots.default}",
                "let { x, $$slots: $$slots_, $$events, ...rest } = $$props;",
            ),
            // identifier + uses_slots → `$$slots: $$slots_`
            (
                "<script>let props = $props();</script>{$$slots.default}",
                "let { $$slots: $$slots_, $$events, ...props } = $$props;",
            ),
        ];
        let mut failures = Vec::new();
        for (src, must_have) in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let want = norm(must_have);
            eprintln!("=== SRC: {src} ===\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n");
            if !norm(&ours).contains(&want) || !norm(&oracle).contains(&want) {
                failures.push(*src);
            }
        }
        assert!(
            failures.is_empty(),
            "$props slots-deconflict differs from oracle for: {failures:?}"
        );
    }

    /// `$bindable(<d>)` defaults inside a `$props()` destructure lower to the
    /// argument (`$bindable(5)` → `5`) or `void 0` (`$bindable()` → `void 0`),
    /// mirroring upstream's `VariableDeclaration.js` AssignmentPattern walk. Each
    /// expected instance line must appear in BOTH outputs.
    #[test]
    fn ast_matches_oracle_props_bindable_default() {
        let cases: &[(&str, &str)] = &[
            (
                "<script>let { value = $bindable() } = $props();</script>{value}",
                "let { value = void 0 } = $$props;",
            ),
            (
                "<script>let { v = $bindable(5) } = $props();</script>{v}",
                "let { v = 5 } = $$props;",
            ),
            (
                "<script>let { a = $bindable(), b = $bindable(2), c = 3 } = $props();</script>{a}{b}{c}",
                "let { a = void 0, b = 2, c = 3 } = $$props;",
            ),
        ];
        let mut failures = Vec::new();
        for (src, must_have) in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let want = norm(must_have);
            eprintln!("=== SRC: {src} ===\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n");
            if !norm(&ours).contains(&want) || !norm(&oracle).contains(&want) {
                failures.push(*src);
            }
        }
        assert!(
            failures.is_empty(),
            "$bindable default lowering differs from oracle for: {failures:?}"
        );
    }

    /// `$state` / `$derived` class-field runes are lowered everywhere a
    /// `PropertyDefinition` can appear — class DECLARATION and class EXPRESSION
    /// (`const C = class {…}`) — matching upstream's tree-wide
    /// `PropertyDefinition.js` visitor. Both cases compared against the oracle.
    #[test]
    fn ast_matches_oracle_class_field_runes_everywhere() {
        let cases: &[(&str, &str)] = &[
            ("<script>class C { foo = $state(0); }</script>", "foo = 0;"),
            (
                "<script>const C = class { foo = $state(0); };</script>",
                "foo = 0;",
            ),
        ];
        let mut failures = Vec::new();
        for (src, must_have) in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let want = norm(must_have);
            eprintln!("=== SRC: {src} ===\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n");
            if !norm(&ours).contains(&want) || !norm(&oracle).contains(&want) {
                failures.push(*src);
            }
        }
        assert!(
            failures.is_empty(),
            "class-field rune lowering differs from oracle for: {failures:?}"
        );
    }

    /// A NESTED class (declared inside a method body) gets its `$state(...)`
    /// fields lowered too. The text-based `transform_server` oracle drops the
    /// whole method body for this exotic shape (a known oracle bug), so this is
    /// a NEW-correctness gate only: the nested field must lower to `y = 2`.
    #[test]
    fn nested_class_field_rune_lowered() {
        let ours = run(
            "<script>class A { x = $state(1); m() { class B { y = $state(2); } return B; } }</script>",
        );
        assert!(
            norm(&ours).contains("y = 2;"),
            "nested class field not lowered:\n{ours}"
        );
        assert!(
            !norm(&ours).contains("$state"),
            "residual $state in nested class output:\n{ours}"
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
    /// VariableDeclaration visitor's `skip`), then re-emitted by the entry
    /// assembly via `analysis.props_id` as `const uid = $.props_id($$renderer);`
    /// (see `ast_matches_oracle_props_id`). The original `$props.id()` text must
    /// be gone, and the re-emitted helper call present.
    #[test]
    fn props_id_dropped() {
        let out = run("<script>const uid = $props.id();</script><p>x</p>");
        assert!(
            !out.contains("$props.id"),
            "$props.id declarator should be dropped:\n{out}"
        );
        assert!(
            out.contains("const uid = $.props_id($$renderer);"),
            "props_id should be re-emitted via entry assembly:\n{out}"
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

    /// TypeScript instance scripts: the script slice is `strip_typescript`-ed
    /// before parsing, then lowered as JS. Output must match the oracle
    /// (which strips TS from its final output) structurally.
    #[test]
    fn typescript_script_oracle_parity() {
        // NOTE: template expressions are chosen so the oracle's `scope.evaluate`
        // constant-folding (e.g. `{x}` over a `$state(0)` → `0`) does NOT fire —
        // that folding is an ORTHOGONAL, pre-existing AST-template KNOWN GAP, not a
        // TS-strip concern. References to props / derived reads / mutated state
        // are non-foldable, so the diff isolates the script-body TS strip.
        let samples = [
            // runes $state with a type annotation (reactive, non-folded read)
            "<script lang=\"ts\">let x: number = $state(0); function inc(){ x++; }</script><p>{x}</p><button onclick={inc}>+</button>",
            // simple typed literal, prop-backed so not folded
            "<script lang=\"ts\">let n: string = 'a';</script><p>{n.length}</p>",
            // legacy export-let prop with type
            "<script lang=\"ts\">export let p: number;</script><p>{p}</p>",
            // interface + type decls (stripped) alongside a real decl, prop read
            "<script lang=\"ts\">interface Foo { a: number } type Bar = string; export let v: number;</script><p>{v}</p>",
            // function with typed params + return type, applied to a derived read
            // (no `export let` here — the oracle's text-strip path mishandles a
            // type-annotated `export let x: T;` with no initializer, an ORTHOGONAL
            // oracle bug; the AST path emits the correct `$$props['x']`).
            "<script lang=\"ts\">let base: number = $state(2); let twice: number = $derived(base * 2); function add(a: number, b: number): number { return a + b; }</script><p>{add(twice, 1)}</p>",
            // $derived with annotation (derived read → `d()`)
            "<script lang=\"ts\">let c: number = $state(0); let d: number = $derived(c * 2);</script><p>{d}</p>",
            // $props with destructure type annotation
            "<script lang=\"ts\">let { name }: { name: string } = $props();</script><p>{name}</p>",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm(&ours) == norm(&oracle);
            if !matched {
                eprintln!(
                    "=== SRC: {src} === DIFFER\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n"
                );
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "TS AST output differs from oracle for: {mismatches:?}"
        );
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
        //
        // NOTE: each read-wrapping case must use a NON-foldable dependency
        // (a `$props()` value), otherwise `scope.evaluate` folds the read away
        // on BOTH pipelines (`$derived(0 * 2)` → `<p>0</p>`) and there is no
        // read to wrap. Deriving from a prop (`count`) keeps the value dynamic.
        let cases: &[(&str, &[&str], &[&str])] = &[
            // double is derived → double(); count is a prop inside thunk → NOT wrapped.
            (
                "<script>let { count } = $props(); let double = $derived(count * 2);</script><p>{double}</p>",
                &["$.escape(double())", "$.derived(() => count * 2)"],
                &["$.escape(double)", "count()"],
            ),
            // count is a prop → NOT wrapped; double → double().
            (
                "<script>let { count } = $props(); let double = $derived(count * 2);</script><p>{double} {count}</p>",
                &["$.escape(double())", "$.escape(count)"],
                &["count()", "$.escape(double)"],
            ),
            // props identifier passthrough (name is a Prop → unchanged). FULL match.
            (
                "<script>let { name } = $props();</script><p>{name}</p>",
                &["$.escape(name)", "let { name } = $$props;"],
                &["name()"],
            ),
            // chained derived: b → b(); inside b's thunk a → a(). `a` derives
            // from a prop so neither read folds to a constant.
            (
                "<script>let { x } = $props(); let a = $derived(x); let b = $derived(a + 1);</script><p>{b}</p>",
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
            // multiple derived reads in one expression: both wrapped. Derive
            // from props so the sum doesn't constant-fold to a literal.
            (
                "<script>let { p, q } = $props(); let a = $derived(p); let b = $derived(q);</script><p>{a + b}</p>",
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

    /// The 5 official `server-side-rendering/samples/head-*` fixtures (essential
    /// shape inlined) must lower IDENTICALLY through the new AST pipeline and the
    /// `transform_server` oracle (which is correct for them). Asserts the
    /// `<svelte:head>` / `<title>` hoist + dedup-hash + whitespace handling
    /// matches structurally (oxc -> esrap canonical reprint, so layout-agnostic).
    #[test]
    fn head_fixtures_match_oracle() {
        std::thread::Builder::new()
            .stack_size(256 * 1024 * 1024)
            .spawn(|| {
                let cases = [
                    (
                        "head-html-and-component",
                        "<script>\nimport HeadNested from './HeadNested.svelte';\nimport Nested from './Nested.svelte';\n</script>\n\n<svelte:head>\n\t{@html '<meta name=\"main_html\" content=\"main_html\">'}\n\t<meta name=\"main\" content=\"main\">\n\t<HeadNested />\n</svelte:head>\n\n<Nested/>",
                    ),
                    (
                        "head-multiple-title",
                        "<svelte:head>\n\t<title>Main</title>\n</svelte:head>\n<A />\n<B />",
                    ),
                    (
                        "head-meta-hydrate-duplicate",
                        "<svelte:head>\n  <title>Some Title</title>\n  <link rel=\"canonical\" href=\"/\">\n  <meta name=\"description\" content=\"some description\">\n  <meta name=\"keywords\" content=\"some keywords\">\n</svelte:head>\n\n<div>Just a dummy page.</div>",
                    ),
                    (
                        "head-no-duplicates-with-binding",
                        "<script>\nimport Foo from './Foo.svelte';\nlet bar;\n</script>\n\n<svelte:head>\n\t<link rel=\"canonical\" href=\"/test\" />\n\t<meta name=\"description\" content=\"test\" />\n</svelte:head>\n\n<Foo bind:bar />",
                    ),
                    // NOTE: `head-raw-elements-content` is intentionally NOT asserted
                    // here. Despite its name it contains NO `<svelte:head>` — it
                    // exercises the class-attribute constant-fold (`class="{const} baz"`
                    // -> static `class="bar baz"`). That `$.stringify`/`attr_class`
                    // elide is an orthogonal feature gap in the new AST pipeline
                    // (the old `transform_server` oracle still folds it), unrelated
                    // to the `<svelte:head>` hoist/dedup work this test guards.
                ];
                for (name, src) in cases {
                    let new = canon(&run(src));
                    let oracle = canon(&oracle_dump(src));
                    assert!(
                        new.is_some() && new == oracle,
                        "{name}: new pipeline diverges from oracle\n--- NEW ---\n{}\n--- ORACLE ---\n{}",
                        new.unwrap_or_default(),
                        oracle.unwrap_or_default(),
                    );
                }
            })
            .unwrap()
            .join()
            .unwrap();
    }

    /// Destructured `$state` (object / array / iterable) lowers via
    /// `create_state_declarators` (`tmp` + `$$array = $.to_array(...)` +
    /// per-leaf declarators), and a `$props()` default that reads a store
    /// (`{ value = $page }`) read-wraps to `$.store_get(...)`. All three are
    /// the official SSR fixtures `destructure-state`, `destructure-state-iterable`,
    /// and `store-init-props`; assert byte-equality with the text-based oracle.
    #[test]
    fn ast_matches_oracle_destructure_state_and_store_init() {
        let samples = [
            "<script>\n\tlet [level, custom] = $state([10, \"Admin\"])\n</script>\n\n{level}, {custom}",
            "<script>\n\tlet count = 0;\n\tfunction* test(){\n\t\twhile (true) {\n\t\t\tyield count++;\n\t\t}\n\t}\n\tlet [one, two] = $state(test())\n</script>\n\n{one}, {two}",
            "<script>\n\tlet { a, b } = $state({ a: 1, b: 2 })\n</script>\n{a}{b}",
            "<script>\n\timport { writable } from 'svelte/store';\n\tconst page = writable(1);\n\tconst { value = $page } = $props();\n</script>\n\n{value}",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm(&ours) == norm(&oracle);
            if !matched {
                eprintln!(
                    "=== SRC: {src} === DIFFER\n--- AST ---\n{ours}\n--- ORACLE ---\n{oracle}\n"
                );
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "destructure-state / store-init output differs from oracle for: {mismatches:?}"
        );
    }

    /// Snippet codegen parity with the `transform_server` oracle for the
    /// runtime-runes snippet cluster — exercising the two server-codegen axes the
    /// AST visitor was missing: VERBATIM parameter emission (destructuring
    /// `{ count }` / `[x]`, defaults `id = default_arg()` / `param = "default"` /
    /// `b = (1, 2)` with the SequenceExpression-default parenthesization) and the
    /// `metadata.can_hoist` placement decision (a snippet referencing instance
    /// state stays in the component-body `init`, NOT module scope). Compared
    /// STRUCTURALLY (indentation-insensitive) like the other block samples.
    #[test]
    fn ast_matches_oracle_snippet_params_and_hoist() {
        let samples: &[&str] = &[
            // destructured object param + hoistable snippet (module scope).
            "<script>\n\tlet count = $state(0);\n</script>\n\n{#snippet foo({ count })}\n\t<p>clicks: {count}</p>\n{/snippet}\n\n{@render foo({ count })}\n",
            // two destructured object params (snippet fn shape; the render-tag
            // argument derived-read wrap is a separate axis, so use plain state).
            "<script>\n\tlet count = $state(0);\n\tlet other = $state(0);\n</script>\n\n{#snippet foo({ count }, { other })}\n\t<p>{count} {other}</p>\n{/snippet}\n\n{@render foo({ count }, { other })}\n",
            // default arg calling an instance function → NON-hoistable (init slot).
            "<script>\n\tlet count = $state(0);\n\tfunction default_arg() { return 1; }\n</script>\n\n{#snippet item(id = default_arg())}\n\t<div>{id}</div>\n{/snippet}\n\n{@render item()}\n",
            // mixed defaults incl. SequenceExpression defaults `(2, 3)` / `(1, 2)`.
            "{#snippet one(a, b = 1, c = (2, 3))}\n  {a}{b}{c}\n{/snippet}\n\n{#snippet two(a, b = (1, 2), c = 3)}\n  {a}{b}{c}\n{/snippet}\n\n{@render one(0)}/{@render two(0)}\n",
            // array-destructure param.
            "<script>\n\tlet array = $state(['a', 'b', 'c'])\n</script>\n\n{#snippet content([x])}\n\t{x}\n{/snippet}\n\n{@render content(array)}\n",
            // string-literal default.
            "{#snippet test(param = \"default\")}\n    <p>{param}</p>\n{/snippet}\n\n{@render test()}\n",
            // non-hoistable snippet nested inside elements → component-body init.
            "<script>\n\tlet numbers = $state([1, 2, 3]);\n</script>\n\n<div>\n\t<div>\n\t\t{#snippet x(n)}\n\t\t\t<p>{n}</p>\n\t\t{/snippet}\n\t\t{#each numbers as n}\n\t\t\t{@render x(n)}\n\t\t{/each}\n\t</div>\n</div>\n",
            // snippet-as-slot with destructured params (component.rs path).
            "<script>\n\timport Child from './Child.svelte';\n</script>\n\n<Child>\n\t{#snippet children({ foo })}\n\t\tDefault {foo}\n\t{/snippet}\n\t{#snippet named({ bar })}\n\t\tNamed {bar}\n\t{/snippet}\n</Child>\n",
        ];
        let mut mismatches = Vec::new();
        for src in samples {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = norm_blocks(&ours) == norm_blocks(&oracle);
            if !matched {
                eprintln!("===== DIFFER =====\n--- OURS ---\n{ours}\n--- ORACLE ---\n{oracle}\n");
                mismatches.push(*src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "snippet param/hoist output differs from oracle for: {mismatches:?}"
        );
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

        // TypeScript-component instrumentation (the lever for this slice).
        let mut ts_total = 0usize; // non-empty components whose source looks TS
        let mut ts_compared = 0usize; // TS components that produced output on both sides
        let mut ts_matched = 0usize; // TS components that structurally matched
        let mut ts_new_none = 0usize;
        let mut ts_panicked = 0usize;
        let mut ts_skipped = 0usize;

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

            // A component is "TypeScript" if either script tag carries
            // lang="ts"/lang='ts'/lang=typescript. Cheap source-substring probe
            // matching `script_is_typescript`'s intent for measurement only.
            let is_ts = source.contains("lang=\"ts\"")
                || source.contains("lang='ts'")
                || source.contains("lang=\"typescript\"")
                || source.contains("lang='typescript'");
            if is_ts {
                ts_total += 1;
            }

            match compile_both(&source) {
                Outcome::Compared {
                    matched_text,
                    matched_struct,
                    used_fallback,
                    new_canon,
                    oracle_canon,
                } => {
                    compared += 1;
                    if is_ts {
                        ts_compared += 1;
                        if matched_struct {
                            ts_matched += 1;
                        }
                    }
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
                    if is_ts {
                        ts_new_none += 1;
                    }
                    if new_none_examples.len() < 10 {
                        new_none_examples.push(name.clone());
                    }
                }
                Outcome::Panic(which) => {
                    panicked += 1;
                    if is_ts {
                        ts_panicked += 1;
                    }
                    if panic_examples.len() < 10 {
                        panic_examples.push(format!("[{which}] {name}"));
                    }
                }
                Outcome::Skipped => {
                    skipped += 1;
                    if is_ts {
                        ts_skipped += 1;
                    }
                }
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

        eprintln!("\n-- TYPESCRIPT components (lever) --");
        eprintln!(
            "  TS components (non-empty) ....... {ts_total} ({:.1}% of total)",
            pct(ts_total, total)
        );
        eprintln!(
            "    TS skipped (parse/analyze) .... {ts_skipped}  TS new=None {ts_new_none}  TS panic {ts_panicked}"
        );
        eprintln!("    TS compared ................... {ts_compared}");
        eprintln!(
            "    TS MATCH (structural) ......... {ts_matched} / {ts_compared}  = {:.1}% of TS-compared",
            pct(ts_matched, ts_compared)
        );
        eprintln!(
            "    TS MISMATCH (compared) ........ {}  (+ {} new=None/panic/skip)",
            ts_compared - ts_matched,
            ts_new_none + ts_panicked + ts_skipped
        );
        eprintln!(
            "    TS MATCH / TS total ........... {ts_matched} / {ts_total}  = {:.1}%",
            pct(ts_matched, ts_total)
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

    /// Legacy reactive `$: …` SSR completeness — every shape must match the
    /// `transform_server` oracle byte-for-byte (modulo blank lines). Covers:
    /// store reads inside the body (`$x` → `$.store_get`), parenthesized
    /// destructure assigns (`$: ({ a } = obj)` hoists `let a`), nested-block /
    /// conditional bodies with reads, prop / `$$props` reads, and topological
    /// reordering of interdependent statements (both statement order AND the
    /// hoisted `let` declaration order follow the dependency sort).
    #[test]
    fn reactive_statement_ssr_shapes() {
        let cases: &[(&str, &str)] = &[
            (
                "simple-assign-reader",
                "<script>let count = 0;\n$: doubled = count * 2;</script>{doubled}",
            ),
            (
                "block",
                "<script>let count = 0;\nfunction sideEffect(x){}\n$: { sideEffect(count); }</script>",
            ),
            (
                "conditional",
                "<script>let x = 0;\nlet y = 0;\n$: if (x) y = 1;</script>{y}",
            ),
            (
                "destructure-assign",
                "<script>let obj = {a:1};\n$: ({ a } = obj);</script>{a}",
            ),
            (
                "expr-stmt",
                "<script>let count = 0;\n$: console.log(count);</script>",
            ),
            (
                "interdep-source-order",
                "<script>let a = 1;\n$: b = a * 2;\n$: c = b + 1;</script>{c}",
            ),
            (
                "store-read",
                "<script>import {writable} from 'svelte/store';\nlet x = writable(0);\n$: doubled = $x * 2;</script>{doubled}",
            ),
            (
                "prop-read",
                "<script>export let count;\n$: doubled = count * 2;</script>{doubled}",
            ),
            (
                "store-in-block",
                "<script>import {writable} from 'svelte/store';\nlet x = writable(0);\nfunction log(v){}\n$: { log($x); }</script>",
            ),
            (
                "store-in-cond",
                "<script>import {writable} from 'svelte/store';\nlet x = writable(0);\nlet y = 0;\n$: if ($x) y = 1;</script>{y}",
            ),
            (
                "reorder-two",
                "<script>let a = 1;\n$: c = b + 1;\n$: b = a * 2;</script>{c}",
            ),
            (
                "reorder-chain3",
                "<script>let a = 1;\n$: d = c + 1;\n$: c = b + 1;\n$: b = a + 1;</script>{d}",
            ),
            (
                "reorder-block-read",
                "<script>let a = 1;\nfunction log(v){}\n$: log(c);\n$: c = a * 2;</script>",
            ),
            (
                "props-spread",
                "<script>let foo = 0;\n$: bar = { ...$$props, foo };</script>{bar}",
            ),
            (
                "member-write-no-hoist",
                "<script>let obj = {};\nlet count = 0;\n$: obj.x = count;</script>",
            ),
            (
                "multi-decl-destructure",
                "<script>let a = 0;\n$: ({ x, y } = { x: a, y: a });</script>{x}{y}",
            ),
            (
                "independent-keep-source-order",
                "<script>let a = 1;\nlet b = 2;\n$: x = a;\n$: y = b;</script>{x}{y}",
            ),
        ];
        for (name, src) in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let n: Vec<&str> = ours
                .lines()
                .map(|l| l.trim())
                .filter(|l| !l.is_empty())
                .collect();
            let o: Vec<&str> = oracle
                .lines()
                .map(|l| l.trim())
                .filter(|l| !l.is_empty())
                .collect();
            assert_eq!(
                n, o,
                "reactive shape `{name}` diverged from oracle.\n--- NEW ---\n{ours}\n--- ORACLE ---\n{oracle}"
            );
        }
    }

    /// The three SSR fixtures fixed by the boundary failed-prop whitespace,
    /// `<select>`/`{#snippet}` implicit-value trailing-whitespace, and spread
    /// `onload`/`onerror` event-capture ports. Asserts the NEW AST pipeline
    /// matches the (correct) OLD oracle after oxc → esrap structural
    /// canonicalization (`canon`), exactly the comparison the corpus
    /// output-equality harness applies via oxfmt.
    #[test]
    fn ast_matches_oracle_three_ssr_fixtures() {
        let names = [
            "boundary-error-failed-prop",
            "select-value-implicit-value-complex",
            "spread-attributes-event-handler-xss",
            // Despite the name, this fixture has NO `<svelte:head>`. It exercises
            // class-attribute constant folding: `class="{const} baz"` should fold
            // the static `{const}` into the literal (`class="bar baz svelte-…"`)
            // instead of emitting `$.attr_class(\`${$.stringify(...)} baz\`)`.
            "head-raw-elements-content",
        ];
        let base = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .unwrap()
            .parent()
            .unwrap()
            .join("submodules/svelte/packages/svelte/tests/server-side-rendering/samples");
        let mut mismatches = Vec::new();
        for name in names {
            let Ok(src) = std::fs::read_to_string(base.join(name).join("main.svelte")) else {
                eprintln!("SKIP {name}: fixture not found (svelte submodule absent)");
                continue;
            };
            let ours = run(&src);
            let oracle = oracle_dump(&src);
            let matched = match (canon(&ours), canon(&oracle)) {
                (Some(a), Some(b)) => a == b,
                _ => norm(&ours) == norm(&oracle),
            };
            if !matched {
                eprintln!(
                    "########## {name} (DIFFER) ##########\n=== NEW ===\n{ours}\n=== ORACLE ===\n{oracle}\n"
                );
                mismatches.push(name);
            }
        }
        assert!(
            mismatches.is_empty(),
            "SSR output differs from oracle for: {mismatches:?}"
        );
    }

    /// SSR class-attribute constant folding: a `class="{const} baz"` whose
    /// expression `scope.evaluate`s to a known string folds into a static
    /// literal (`class="bar baz"`), matching upstream `build_attribute_value`'s
    /// all-known → `b.literal(...)` branch (then inlined at element.js:257).
    #[test]
    fn ast_matches_oracle_class_attr_constant_folding() {
        let cases = [
            // Fully-foldable mixed class → static `class="bar baz"`.
            "<script>const x = 'bar';</script><div class=\"{x} baz\"></div>",
            // Leading + trailing static text around the folded expression.
            "<script>const x = 'bar';</script><div class=\"foo {x} baz\"></div>",
            // The fixture's exact shape, with a scoped `.baz` so a css hash joins.
            "<script>const dynamic_value = 'bar';</script>\
             <div class=\"{dynamic_value} baz\">bar</div>\
             <div class=\"foo {dynamic_value} baz\">bar</div>\
             <style>.baz { color: red; }</style>",
        ];
        let mut mismatches = Vec::new();
        for src in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            let matched = match (canon(&ours), canon(&oracle)) {
                (Some(a), Some(b)) => a == b,
                _ => norm(&ours) == norm(&oracle),
            };
            if !matched {
                eprintln!(
                    "########## class-fold (DIFFER) ##########\nSRC: {src}\n=== NEW ===\n{ours}\n=== ORACLE ===\n{oracle}\n"
                );
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "class-attr fold differs from oracle for {} case(s)",
            mismatches.len()
        );
    }

    /// Class-state CONSTRUCTOR codegen: `constructor() { this.x = $state(0) }`
    /// (and `$derived` / `$state.raw` / computed-literal / subclass / predeclared
    /// / module-scope variants) must lower to the same server output as the
    /// `transform_server` oracle (写经 server `ClassBody.js` +
    /// `AssignmentExpression.js`). Sources mirror the runtime-runes
    /// `class-state-constructor*` / `class-state-derived*` fixtures.
    #[test]
    fn ast_matches_oracle_class_state_constructor() {
        let cases = [
            // class-state-constructor: private $state + public $derived in ctor
            "<script>\nclass Counter {\n#count;\nconstructor(initial) {\nthis.#count = $state(initial);\nthis.doubled = $derived(this.#count * 2);\n}\nincrement = () => { this.#count++; }\n}\nconst counter = new Counter(10);\n</script>\n<button onclick={counter.increment}>{counter.doubled}</button>",
            // class-state-constructor-subclass: derived in subclass ctor
            "<script>\nclass Counter {\nconstructor(initial) {\nthis.count = $state(initial);\n}\nincrement = () => { this.count++; }\n}\nclass PluggableCounter extends Counter {\nconstructor(initial, plugin) {\nsuper(initial)\nthis.custom = $derived(plugin(this.count));\n}\n}\nconst counter = new PluggableCounter(10, (count) => count * 2);\n</script>\n<button onclick={counter.increment}>{counter.count}: {counter.custom}</button>",
            // class-state-constructor-predeclared-field: predeclared `count;` + ctor $state
            "<script>\nclass Counter {\ncount;\nconstructor(count) {\nthis.count = $state(count);\n}\n}\nconst counter = new Counter(0);\n</script>\n<button onclick={() => counter.count++}>{counter.count}</button>",
            // class-state-constructor-conflicting-get-name: literal + computed-literal keys
            "<script>\nclass Test {\n0 = $state();\nconstructor() {\nthis[1] = $state();\n}\n}\n</script>",
            // class-state-constructor-derived-unowned: module-scope ctor $state + $derived
            "<script module>\nclass SomeLogic {\ntrigger() { this.someValue++; }\nconstructor() {\nthis.someValue = $state(0);\nthis.isAboveThree = $derived(this.someValue > 3);\n}\n}\nconst someLogic = new SomeLogic();\n</script>",
            // class-state-constructor-closure-private-2: ctor $state + $effect closure (effect kept)
            "<script>\nclass Counter {\nconstructor() {\nthis.count = $state(0);\n$effect(() => { this.count = 10; });\n}\n}\nconst counter = new Counter();\n</script>\n<button onclick={() => counter.count++}>{counter.count}</button>",
            // class-state-constructor-closure-private-3: ctor $state in a class EXPRESSION
            "<script>\nconst counter = new class Counter {\nconstructor() {\nthis.count = $state(0);\n$effect(() => { this.count = 10; });\n}\n}\n</script>\n<button onclick={() => counter.count++}>{counter.count}</button>",
            // class-state-derived-2: propdef $state + propdef $derived + ctor plain assign.
            // (Source de-`export`ed to isolate the class codegen; `export class`
            // keyword stripping is a separate, pre-existing pipeline gap.)
            "<script>\nclass Counter {\ncount = $state(0);\ndoubled = $derived(this.count * 2);\nconstructor(initialCount = 0) {\nthis.count = initialCount;\n}\n}\nconst counter = new Counter(1);\n</script>\n{counter.doubled}",
            // class-state-effect: propdef $state, ctor $effect.pre + plain assign
            "<script>\nclass Counter {\ncount = $state(0);\nconstructor(initial) {\n$effect.pre(() => { console.log(this.count); });\nthis.count = initial;\n}\n}\nconst counter = new Counter(10);\n</script>\n<button onclick={() => counter.count++}>{counter.count}</button>",
            // class-state-extended-effect-derived: base propdef $state, subclass ctor effect.
            // (`counter` kept a plain `new` here — the fixture's `$derived(new …)`
            // + bare `counter;` read exercises orthogonal derived-read wrapping.)
            "<script>\nclass Base {\ncount = $state(0);\n}\nclass Counter extends Base {\nconstructor(initial) {\nsuper();\n$effect.pre(() => { console.log(this.count); });\nthis.count = initial;\n}\n}\nconst counter = new Counter(10);\n</script>\n<button onclick={() => counter.count++}>{counter.count}</button>",
        ];
        let mut mismatches = Vec::new();
        for src in cases {
            let ours = run(src);
            let oracle = oracle_dump(src);
            if norm(&ours) != norm(&oracle) {
                eprintln!(
                    "\n########## class-state-ctor (DIFFER) ##########\nSRC:\n{src}\n=== OURS ===\n{ours}\n=== ORACLE ===\n{oracle}\n"
                );
                mismatches.push(src);
            }
        }
        assert!(
            mismatches.is_empty(),
            "class-state constructor codegen differs from oracle for {} case(s)",
            mismatches.len()
        );
    }

    /// Legacy STORE subscription / assignment / update SSR lowering parity with
    /// the (correct) `transform_server` oracle for the runtime-legacy store
    /// cluster. Each fixture's `main.svelte` is compiled with the new AST
    /// pipeline (`run`) and the old text oracle (`oracle_dump`); the two must be
    /// equal under [`canon_js`] (the runtime-harness canonicalizer), so a match
    /// here means the runtime suite passes (the oracle passes these fixtures).
    ///
    /// Covers the store READ → `$.store_get`, store WRITE → `$.store_set` /
    /// `$.store_mutate`, store `++/--` → `$.update_store[_pre]`, derived
    /// `++/--` → `$.update_derived[_pre]`, destructure-assignment store-set
    /// sequence, the `$.fallback(…, () => …, true)` immediate-prop shape, and
    /// the derived-callback parameter-shadowing (`derived(y, ($y) => $y * $y)`)
    /// paths — exercised across the instance script, `export function` bodies,
    /// reactive `$:`, template expressions, `<svelte:element this={$store}>`,
    /// and component `bind:` setters.
    ///
    /// `store-auto-resubscribe-immediate` and `module-context-bind` are NOT
    /// asserted: their only remaining divergence is orthogonal to store
    /// subscription — a nested destructuring-assignment-in-expression-position
    /// needing the `extract_paths` `$$value`-cache IIFE, and a module-script /
    /// instance-script import-ordering quirk, respectively.
    #[test]
    fn ast_matches_oracle_legacy_store_cluster() {
        let base = concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/../../submodules/svelte/packages/svelte/tests/runtime-legacy/samples"
        );
        let names = [
            "store-auto-subscribe-in-script",
            "store-auto-subscribe-immediate",
            "store-auto-subscribe-immediate-multiple-vars",
            "store-assignment-updates",
            "store-assignment-updates-reactive",
            "store-assignment-updates-property",
            "store-assignment-updates-destructure",
            "store-increment-updates-reactive",
            "binding-store-each",
            "component-binding-store",
            "dynamic-element-store",
            "store-unreferenced",
            "instrumentation-auto-subscription-self-assignment",
            "window-binding-scroll-store",
        ];
        let mut mismatches = Vec::new();
        for n in names {
            let p = format!("{base}/{n}/main.svelte");
            let Ok(src) = std::fs::read_to_string(&p) else {
                // Submodule not checked out — skip silently (CI guards this
                // elsewhere; the unit test is a no-op without the corpus).
                eprintln!("SKIP (no main.svelte): {n}");
                continue;
            };
            let ours = run(&src);
            let oracle = oracle_dump(&src);
            if canon_js(&ours) != canon_js(&oracle) {
                eprintln!(
                    "\n######### DIFFER: {n} #########\n=== OURS ===\n{ours}\n=== ORACLE ===\n{oracle}\n"
                );
                mismatches.push(n);
            }
        }
        assert!(
            mismatches.is_empty(),
            "legacy store-cluster SSR differs from oracle for: {mismatches:?}"
        );
    }

    /// Server instance-body derived / store / class-private-derived read-wrap
    /// cluster (runtime-runes). The new SSR pipeline previously left derived /
    /// store reads inside re-homed verbatim instance statements UNCALLED (`d` →
    /// `d`, not `d()`), and did not wrap private `this.#derived` reads in class
    /// getters / methods / constructors. Each fixture's `main.svelte` is lowered
    /// through BOTH pipelines and compared via the esrap `canon` reprint (the same
    /// gate the corpus harness uses), so a match means the runtime suite passes
    /// (the text-based oracle passes these fixtures).
    ///
    /// Covered (must MATCH):
    /// - top-level derived reads & updates: `derived-update-server`
    ///   (`count++` → `$.update_derived(count)`), `derived-unowned-12`
    ///   (`linked.current++` → `linked().current++`), `derived-server-memoization`
    ///   (`console.log(d)` → `console.log(d())`), `class-state-effect-derived` /
    ///   `class-state-extended-effect-derived` (`counter;` → `counter();`).
    /// - scope-aware shadowing (NO over-wrap): `derived-shadowed` /
    ///   `effect-inside-derived` (an inner `const value = 0` / `let value = 0`
    ///   shadowing an outer derived binding must NOT be read-wrapped).
    /// - class private-`$derived` reads: `deriveds-in-constructor`
    ///   (`this.#derived` → `this.#derived()` in a field-init thunk + constructor),
    ///   `class-state-derived-private` (`self.#doubled()` / `this.#tripled()` in
    ///   getters), `writable-derived-3` (private-derived reads in getters AND
    ///   `this.#x = 3` derived WRITES → `this.#x(3)`).
    ///
    /// The 4 fixtures that remain blocked on ORTHOGONAL axes are intentionally NOT
    /// asserted here (their derived reads ARE now correct; they diverge only on
    /// unrelated features): `effect-active-derived` (`$effect.tracking()` → `false`
    /// lowering), `class-state-derived-2` (`export class` keyword stripping),
    /// `derived-read-outside-reaction` (constructor-derived stray public-field
    /// removal), `derived-map` (source-comment preservation).
    #[test]
    fn ast_matches_oracle_derived_readwrap_cluster() {
        let manifest = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));
        let base =
            manifest.join("../../submodules/svelte/packages/svelte/tests/runtime-runes/samples");
        let names = [
            "derived-stale-value",
            "derived-update-server",
            "derived-unowned-3",
            "derived-unowned-5",
            "derived-unowned-12",
            "derived-cleanup-old-value",
            "derived-server-memoization",
            "untrack-own-deriveds",
            "derived-in-expression",
            "deriveds-in-constructor",
            "derived-shadowed",
            "effect-inside-derived",
            "class-state-effect-derived",
            "class-state-derived-private",
            "class-state-derived-unowned",
            "class-state-extended-effect-derived",
            "class-state-constructor-derived-unowned",
            "writable-derived-3",
            "read-version-previous-reaction",
        ];
        let mut mismatches = Vec::new();
        for n in names {
            let p = base.join(n).join("main.svelte");
            let Ok(src) = std::fs::read_to_string(&p) else {
                // Submodule not checked out — skip silently.
                eprintln!("SKIP (no main.svelte): {n}");
                continue;
            };
            let ours = run(&src);
            let oracle = oracle_dump(&src);
            let (Some(co), Some(cr)) = (canon(&ours), canon(&oracle)) else {
                eprintln!(
                    "\n######### CANON-FAIL: {n} #########\n=OURS=\n{ours}\n=ORACLE=\n{oracle}"
                );
                mismatches.push(n);
                continue;
            };
            if co != cr {
                eprintln!(
                    "\n######### DIFFER: {n} #########\n=== OURS ===\n{ours}\n=== ORACLE ===\n{oracle}\n"
                );
                mismatches.push(n);
            }
        }
        assert!(
            mismatches.is_empty(),
            "derived read-wrap SSR differs from oracle for: {mismatches:?}"
        );
    }

    /// SSR async template-shape parity with the (correct) `transform_server`
    /// oracle for the `{#await}` / `{@html await …}` / async-attribute /
    /// async-prop cluster. Compared with [`canon_js`] (the runtime harness
    /// canonicalizer), so a match means the runtime suite passes (the oracle
    /// passes these). The instance-level `main.svelte` is read straight from the
    /// upstream fixtures and compiled with `experimental.async` on.
    ///
    /// Covered axes (must MATCH):
    /// - `async-await-block` — `{#await foo then x}` where `foo` is a top-level
    ///   blocker → `$$renderer.async_block([$$promises[0]], …)`.
    /// - `async-hydrate-html-tag` — `{@html await …}` in an element →
    ///   `$$renderer.child_block(async …)` + `$$renderer.push($.html((await
    ///   $.save(…))()))`.
    /// - `async-sole-if-child` — a component with an awaited prop inside `{#if}`
    ///   → `$$renderer.child_block(async …)` with a hoisted `$$0` const.
    /// - `async-no-pending-attributes` — element async attribute (`child`/`async`)
    ///   + component async prop (`child_block`/`async_block`), each with a `$$N`
    ///   hoist.
    /// - `async-static-prop-after-await` — element / component referencing a
    ///   top-level-await blocker → `$$renderer.async([$$promises[1]], …)` /
    ///   `$$renderer.async_block([$$promises[1]], …)`.
    ///
    /// The orthogonal `async-await-block-2` (server `$derived(await …)` →
    /// `$.async_derived` script lowering), `async-if-block-unskip` (instance
    /// script-comment preservation) and `async-nested-top-level` (instance/module
    /// import hoisting order) are NOT asserted — they fail on non-template axes.
    #[test]
    fn ast_matches_oracle_async_template_shapes() {
        let names = [
            "async-await-block",
            "async-hydrate-html-tag",
            "async-sole-if-child",
            "async-no-pending-attributes",
            "async-static-prop-after-await",
            // Already-passing async fixtures — guard against regression.
            "async-await",
            "async-expression",
            "async-html-tag",
            "async-attribute",
            "async-attribute-without-state",
            "async-prop",
            "async-if",
            "async-if-else",
            "async-no-pending",
        ];
        let base = concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/../../submodules/svelte/packages/svelte/tests/runtime-runes/samples"
        );
        let mut mismatches = Vec::new();
        for n in names {
            let path = format!("{base}/{n}/main.svelte");
            let Ok(src) = std::fs::read_to_string(&path) else {
                // Fixtures absent (no submodule) → skip silently.
                continue;
            };
            let (ours, oracle) = run_async_both(&src);
            if canon_js(&ours) != canon_js(&oracle) {
                eprintln!(
                    "\n######### DIFFER: {n} #########\n=== OURS ===\n{ours}\n=== ORACLE ===\n{oracle}\n"
                );
                mismatches.push(n);
            }
        }
        assert!(
            mismatches.is_empty(),
            "async template-shape SSR differs from oracle for: {mismatches:?}"
        );
    }

    /// $effect-rune SSR cluster parity with the (correct) text-based oracle.
    /// Covers `$effect.tracking()` → `false` and `$effect.root(...)` → noop arrow
    /// as expression VALUES (the ExpressionStatement removal path is already
    /// handled; these are the cases where the rune appears in a script/template
    /// expression rather than as a bare top-level effect statement).
    #[test]
    fn ast_matches_oracle_effect_rune_cluster() {
        let names = [
            "effect-active-derived",
            "effect-tracking",
            "effect-tracking-binding-set",
            "effect-tracking-transition",
            "effect-root",
            "effect-root-2",
            "effect-root-4",
            "effect-root-5",
            "effect-root-6",
            // `effect-cleanup` is covered by the inline `ast_matches_oracle_
            // inspect_effect_cluster` test; the on-disk fixture additionally has
            // a `// @ts-expect-error` comment INSIDE the removed `$effect`
            // callback body, which the text-oracle leaves dangling but the AST
            // pipeline cleanly drops (a runtime no-op — the comment can never
            // execute). Asserting it here would compare oracle comment cruft.
            "effect-order",
            "store-subscribe-effect-init",
            "pre-effect",
            "array-sort-in-effect",
            "guard-else-effect",
        ];
        let base = concat!(
            env!("CARGO_MANIFEST_DIR"),
            "/../../submodules/svelte/packages/svelte/tests/runtime-runes/samples"
        );
        let mut mismatches = Vec::new();
        for n in names {
            let path = format!("{base}/{n}/main.svelte");
            let Ok(src) = std::fs::read_to_string(&path) else {
                continue;
            };
            let ours = run(&src);
            let oracle = oracle_dump(&src);
            let (Some(co), Some(cr)) = (canon(&ours), canon(&oracle)) else {
                mismatches.push(n);
                continue;
            };
            if co != cr {
                eprintln!(
                    "\n######### DIFFER: {n} #########\n=== OURS ===\n{ours}\n=== ORACLE ===\n{oracle}\n"
                );
                mismatches.push(n);
            }
        }
        assert!(
            mismatches.is_empty(),
            "effect-rune SSR differs from oracle for: {mismatches:?}"
        );
    }
}
