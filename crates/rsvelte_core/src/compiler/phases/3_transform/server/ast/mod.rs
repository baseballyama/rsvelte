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
//! function shell) is emitted. The per-node visitors live in the `visitors`
//! submodule.
//!
//! This module is NOT yet wired into `super::transform_server`; it exists so
//! the crate keeps compiling while the AST pipeline is built out.

pub mod comment_stats;
pub mod comments;
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
    /// Nesting depth of the CURRENT fragment body. Incremented (save/restore) by
    /// [`visitors::shared::build_fragment_body`] around each fragment it builds.
    /// The root component fragment is depth 1 (built via the same helper); any
    /// nested block / boundary / snippet body is depth ≥ 2. Used by the
    /// `<svelte:boundary>` visitor to decide whether a `failed` snippet hoists to
    /// the component-body top (TOP-LEVEL boundary, depth 1) or is emitted inline in
    /// the surrounding block (NESTED boundary, depth ≥ 2) — a server-side stand-in
    /// for upstream's analyze-time `path.length > 1` hoist gate, which our analyze
    /// does not bump for `<svelte:boundary>`.
    pub fragment_depth: usize,
    /// Sticky whitespace-preservation flag (写经 upstream `state.preserve_whitespace`).
    /// Seeded from `options.preserve_whitespace` and turned ON (and never off
    /// again for the subtree) by an ancestor `<pre>` / `<textarea>`, so a nested
    /// `<span>` inside a `<pre>` keeps its inner whitespace. The element visitor
    /// saves/restores it around its children.
    pub preserve_whitespace: bool,
    /// Sticky "an ancestor element is a `<text>`" flag, standing in for upstream
    /// `clean_nodes`' `path.some((n) => n.type === 'RegularElement' && n.name ===
    /// 'text')`: whitespace-only text survives anywhere below an SVG `<text>`.
    pub in_text_element: bool,
    /// Current element namespace for the children being visited (`"html"` /
    /// `"svg"` / `"mathml"`), mirroring upstream `state.namespace`. Set by
    /// `process_children_inner` from the namespace it is handed and restored
    /// after, so a nested visitor (e.g. the component `$.css_props` SVG flag)
    /// can tell whether it renders inside an `<svg>` subtree.
    pub namespace: &'static str,
    /// Monotonic counter for `each_array` / `$$index` unique-name suffixes,
    /// mirroring upstream's `state.scope.root.unique('each_array')`. The first
    /// each block uses bare `each_array` / `$$index`; subsequent ones append
    /// `_1`, `_2`, … (matching the text-based oracle's `each_counter`).
    pub each_index: usize,
    /// Inputs to the `scope.evaluate` (SSR constant-folding) port. Computed
    /// once (via the proven legacy `ServerCodeGenerator::new` path) and reused
    /// by `Self::eval_ctx` when folding `{expr}` template chunks / dynamic
    /// attribute values. See `server::evaluate::EvalCtx`.
    pub eval_inputs: EvalInputs,
    /// Monotonic counter for the `$$body` temporary used by element CONTENT
    /// binds (`<textarea>` value, contenteditable `innerHTML`/`innerText`/
    /// `textContent`). The first one is bare `$$body`, subsequent ones append
    /// `_1`, `_2`, … — mirroring the text oracle's `$$body` / `$$body_N` naming
    /// (upstream uses `state.scope.generate('$$body')`).
    pub body_counter: usize,
    /// Monotonic counter for the `bind_get` / `bind_set` locals hoisted for a
    /// component get/set bind (`bind:x={() => a, (v) => …}`). Mirrors upstream's
    /// `scope.generate('bind_get')` / `'bind_set')`: the first pair is bare
    /// `bind_get` / `bind_set`, subsequent pairs append `_1`, `_2`, … (the count
    /// advances per bind, shared between the get/set names of that bind).
    pub bind_get_counter: usize,
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
    /// In-scope LOCAL async-`$derived` const binding names (`{const d =
    /// $derived(await …)}`). A read of such a name resolves to a CALL `d()`,
    /// winning over the ambiguous polluted-root `get_binding`. Saved/restored
    /// around each fragment body like [`Self::const_blocker_map`].
    pub local_derived_names: rustc_hash::FxHashSet<String>,
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
    /// Names of every `{#snippet name(...)}` lowered to a `function name(...)`
    /// declaration (写经 upstream's `fn.___snippet = true` marker). Used by the
    /// `uses_component_bindings` settle-loop assembly to partition top-level
    /// snippet FunctionDeclarations ahead of the `$$render_inner` wrapper, exactly
    /// like upstream's `template.body.filter(n => n.___snippet)` split.
    pub snippet_names: rustc_hash::FxHashSet<String>,
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
    /// Monotonic counter for the `tmp` temp generated when expanding a
    /// DESTRUCTURED `$state(...)` / `$state.raw(...)` declarator (mirrors upstream
    /// `scope.generate('tmp')`). The first is bare `tmp`, subsequent ones append
    /// `_1`, `_2`, … — so two destructured `$state(...)` declarations deconflict
    /// (`tmp` / `tmp_1`).
    pub state_tmp_counter: usize,
    /// Monotonic counter for the `$$array` temp generated per `ArrayPattern` in a
    /// RUNES-mode destructured `$state(...)` / `$state.raw(...)` declaration
    /// (mirrors upstream `scope.generate('$$array')`). Shared across every
    /// top-level declaration in the component (not reset per declarator), so a
    /// SECOND array-pattern declaration is named `$$array_1`, not a colliding
    /// `$$array`. The first is bare `$$array`, subsequent ones append `_1`, `_2`, …
    pub array_counter: u32,
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
    /// Names bound by the ENCLOSING snippet / scoped-slot parameters that shadow a
    /// same-named component-level `$derived` / `$store` binding. Mirrors upstream's
    /// `context.state.scope` resolving a snippet body's identifier to the snippet
    /// parameter (a normal binding) rather than the component derived. Seeded into
    /// each `wrap_reads` call so e.g. `{#snippet foo(doubled)} {doubled} {/snippet}`
    /// keeps `doubled` bare instead of read-wrapping it to `doubled()`. Pushed by
    /// the SnippetBlock visitor around its body, popped after.
    pub shadowed_names: Vec<rustc_hash::FxHashSet<String>>,
    /// Names bound by an enclosing slot `let:` directive (`<Nested let:count>`).
    /// Distinct from [`Self::shadowed_names`] (which also holds snippet params):
    /// a slot-`let` read must NOT constant-fold to the same-named COMPONENT
    /// binding's value, whereas a snippet-param read still folds. Pushed by the
    /// component slot-body builder, popped after.
    pub slot_let_shadows: Vec<rustc_hash::FxHashSet<String>>,
    /// Index into `analysis.root.all_scopes` of the scope the nodes currently
    /// being emitted live in — the AST mirror of upstream's `state.scope`
    /// (`set_scope` in `phases/scope.js`). Every scope-creating template node
    /// swaps this around its fragment children via [`Self::enter_template_scope`],
    /// so `scope.evaluate` resolves an identifier through the real lexical chain
    /// instead of a flat "every template scope" union.
    pub current_scope_index: usize,
    /// Leading-comment regions registered by the script transform, replayed onto
    /// a synthetic buffer at print time. See [`comments`].
    pub comments: comments::ChunkRegistry,
    /// Set when [`Self::reparse_program`] rejected text this compiler generated.
    /// The instance body cannot be reconstructed after that, so assembly aborts
    /// instead of shipping a component whose `<script>` silently did nothing.
    pub reparse_failure: std::cell::RefCell<Option<String>>,
}

/// The render position saved by [`ServerTransformState::enter_template_scope`],
/// handed back to [`ServerTransformState::restore_scope`] on the way out.
pub struct SavedScope {
    /// The scope index in effect before the entered fragment.
    scope: usize,
    /// The entered scope, when the node owned one (`None` = nothing changed).
    entered: Option<usize>,
    /// `constant_vars` entries the entered scope redeclared, to put back.
    shadowed_constants: Vec<(String, String)>,
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
/// (`server::evaluate::EvalCtx`). Mirrors exactly the fields the legacy
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
            fragment_depth: 0,
            preserve_whitespace: options.preserve_whitespace,
            in_text_element: false,
            namespace: "html",
            each_index: 0,
            eval_inputs: EvalInputs::default(),
            body_counter: 0,
            bind_get_counter: 0,
            async_consts: None,
            const_blocker_map: rustc_hash::FxHashMap::default(),
            local_derived_names: rustc_hash::FxHashSet::default(),
            const_promises_counter: 0,
            snippet_inits: Vec::new(),
            snippet_names: rustc_hash::FxHashSet::default(),
            derived_d_counter: 0,
            derived_array_counter: 0,
            state_tmp_counter: 0,
            array_counter: 0,
            in_element_children: false,
            attr_optimiser: None,
            shadowed_names: Vec::new(),
            slot_let_shadows: Vec::new(),
            current_scope_index: analysis.root.instance_scope_index,
            comments: comments::ChunkRegistry::default(),
            reparse_failure: std::cell::RefCell::new(None),
        }
    }

    /// Enter the scope the scope-builder created for the fragment children of
    /// the template node starting at `node_start`, returning the state to hand
    /// back to [`Self::restore_scope`]. Nodes that own no scope (or whose scope
    /// was not recorded) leave the current one in place, exactly like upstream's
    /// `set_scope` (`scopes.get(node) ?? state.scope`).
    pub fn enter_template_scope(&mut self, node_start: u32) -> SavedScope {
        match self
            .analysis
            .root
            .template_scope_map
            .get(&node_start)
            .copied()
        {
            Some(idx) => self.enter_scope(idx),
            None => SavedScope {
                scope: self.current_scope_index,
                entered: None,
                shadowed_constants: Vec::new(),
            },
        }
    }

    /// Enter an `{#if}`'s `{:else}` scope (an if-block owns two fragment scopes,
    /// so its alternate lives in its own map under the block's start).
    pub fn enter_if_alternate_scope(&mut self, node_start: u32) -> SavedScope {
        match self
            .analysis
            .root
            .if_alternate_scope_map
            .get(&node_start)
            .copied()
        {
            Some(idx) => self.enter_scope(idx),
            None => SavedScope {
                scope: self.current_scope_index,
                entered: None,
                shadowed_constants: Vec::new(),
            },
        }
    }

    /// Swap the render position to `idx` and hide every script-level
    /// `constant_vars` entry the entered scope redeclares with a `{@const}` /
    /// `{const}` — `constant_vars` is keyed by NAME alone, so a
    /// `{@const doubled = …}` shadowing an instance `$derived doubled` would
    /// otherwise keep folding template reads to the outer binding's value.
    fn enter_scope(&mut self, idx: usize) -> SavedScope {
        let scope = self.current_scope_index;
        self.current_scope_index = idx;
        let mut shadowed_constants = Vec::new();
        if !self.eval_inputs.constant_vars.is_empty() {
            for name in self.const_declaration_names(idx) {
                if let Some(value) = self.eval_inputs.constant_vars.remove(name) {
                    shadowed_constants.push((name.to_string(), value));
                }
            }
        }
        SavedScope {
            scope,
            entered: Some(idx),
            shadowed_constants,
        }
    }

    /// Restore the scope saved by [`Self::enter_template_scope`], dropping the
    /// folds the exited scope registered and putting the hidden outer ones back.
    pub fn restore_scope(&mut self, saved: SavedScope) {
        self.current_scope_index = saved.scope;
        if let Some(idx) = saved.entered {
            for name in self.const_declaration_names(idx) {
                self.eval_inputs.constant_vars.remove(name);
            }
        }
        for (name, value) in saved.shadowed_constants {
            self.eval_inputs.constant_vars.insert(name, value);
        }
    }

    /// The names scope `idx` declares through a template `{@const}` / `{const}`
    /// (`BindingKind::Template`). Slot `let:` / each-item / snippet parameters
    /// are deliberately excluded: rsvelte's scope tree is coarser than
    /// upstream's for those (one component scope covers every slot body), and
    /// their fold veto already lives in `slot_let_shadows` / `shadowed_names`.
    fn const_declaration_names(&self, idx: usize) -> Vec<&'a str> {
        use crate::compiler::phases::phase2_analyze::scope::BindingKind;
        let root = &self.analysis.root;
        let Some(declared) = root.all_scopes.get(idx) else {
            return Vec::new();
        };
        declared
            .declarations
            .iter()
            .filter(|&(_, &binding)| {
                root.bindings
                    .get(binding)
                    .is_some_and(|b| matches!(b.kind, BindingKind::Template))
            })
            .map(|(name, _)| name.as_str())
            .collect()
    }

    /// Collect all the names currently shadowed by enclosing snippet / slot
    /// parameters (flattened from [`Self::shadowed_names`]).
    pub(super) fn collect_shadowed(&self) -> rustc_hash::FxHashSet<String> {
        let mut out = rustc_hash::FxHashSet::default();
        for frame in &self.shadowed_names {
            out.extend(frame.iter().cloned());
        }
        out
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

    /// Generate the next `tmp` temp name — `tmp`, `tmp_1`, `tmp_2`, …
    /// (mirrors upstream `scope.generate('tmp')`).
    pub fn next_state_tmp_name(&mut self) -> String {
        let counter = self.state_tmp_counter;
        self.state_tmp_counter = counter + 1;
        if counter == 0 {
            "tmp".to_string()
        } else {
            format!("tmp_{counter}")
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
    /// precomputed [`EvalInputs`].
    pub(crate) fn eval_ctx(
        &self,
    ) -> crate::compiler::phases::phase3_transform::server::evaluate::EvalCtx<'_> {
        crate::compiler::phases::phase3_transform::server::evaluate::EvalCtx {
            analysis: Some(self.analysis),
            constant_vars: &self.eval_inputs.constant_vars,
            source: self.source,
            use_async: self.eval_inputs.use_async,
            top_level_blocker_map: &self.eval_inputs.top_level_blocker_map,
            current_scope_index: Some(self.current_scope_index),
            template_scopes_cache: &self.eval_inputs.template_scopes_cache,
        }
    }

    /// Port of the text-based oracle's `is_standalone_fragment`: a fragment is
    /// standalone when, after filtering hoisted / whitespace / comment nodes, it
    /// contains exactly one node that is a non-dynamic RenderTag or non-dynamic
    /// Component (so the parent anchors suffice and the trailing `<!---->` is
    /// elided). Snippet defs / const tags / head-like nodes are hoisted out.
    pub fn is_standalone_fragment<'t, N: AsRef<TemplateNode<'t>>>(
        nodes: &[N],
        preserve_whitespace: bool,
    ) -> bool {
        use crate::compiler::phases::phase3_transform::utils::is_svelte_whitespace_only;
        let meaningful: Vec<&TemplateNode> = nodes
            .iter()
            .map(|n| n.as_ref())
            .filter(|n| match n {
                // In a whitespace-preserving context (`<pre>` / `<textarea>` /
                // sticky descendant), whitespace-only text is NOT trimmed, so it
                // counts as a real sibling — mirroring upstream `clean_nodes`,
                // which computes `is_standalone` on the (un-trimmed) `trimmed`
                // list when `preserve_whitespace` is set. This keeps a component
                // with surrounding whitespace inside `<pre>` from being treated as
                // standalone, so its trailing `<!---->` anchor is still emitted.
                TemplateNode::Text(t) => preserve_whitespace || !is_svelte_whitespace_only(&t.data),
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
        read_wrap::wrap_reads_with_shadows_and_local_derived(
            &mut out,
            self.b,
            self.analysis,
            self.current_scope_index,
            self.collect_shadowed(),
            self.local_derived_names.clone(),
        );
        // Lower value-position `$effect.tracking()` → `false`,
        // `$effect.root(…)` → `() => {}`, `$effect.pending()` → `0` inside the
        // template expression (写经 server `CallExpression` visitor).
        script::lower_effect_value_runes_expr(&mut out, self.b);
        // Drop statement-position `$effect(…)` / `$effect.pre(…)` / `$inspect(…)`
        // calls nested in a template-expression IIFE arrow / function body (写经
        // server `ExpressionStatement` visitor → `b.empty`).
        script::lower_nested_runes_in_expr(&mut out, self.b);
        out
    }

    /// Run the read-wrapping pass over an already-built oxc expression in place,
    /// resolving names against the RENDER POSITION's scope chain (upstream
    /// `context.state.scope`), so a `{@const}` shadowing an instance `$derived`
    /// keeps its reads bare. Mirrors `context.visit(...)`'s read-rewriting for
    /// callers (e.g. `RenderTag`) that decompose a template expression by
    /// source-slice + re-parse rather than `visit_expr`.
    pub fn wrap_reads_in_place(&self, expr: &mut OxcExpression<'a>) {
        read_wrap::wrap_reads_with_shadows_and_local_derived(
            expr,
            self.b,
            self.analysis,
            self.current_scope_index,
            self.collect_shadowed(),
            self.local_derived_names.clone(),
        );
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

    /// Codegen an oxc [`OxcExpression`] back to a JS source string. Used by the
    /// async-const / async-declaration-tag string-thunk builders, which assemble
    /// `() => x = <rhs>` text from a read-wrapped RHS expression.
    pub fn expr_to_string(&self, expr: &OxcExpression<'a>) -> String {
        use oxc_codegen::{Codegen, CodegenOptions};
        let options = CodegenOptions {
            single_quote: true,
            ..Default::default()
        };
        let mut codegen = Codegen::new().with_options(options);
        codegen.print_expression(expr);
        codegen.into_source_text()
    }

    /// Read-wrap a const/declaration-tag RHS *source string* so derived reads
    /// become getter calls (`bar` → `bar()`) and store reads become
    /// `$.store_get(...)` — the same transform the SYNC const path applies to its
    /// AST init, but producing a STRING for the async `$$renderer.run([...])`
    /// thunk. Reparse failures (e.g. an `await` whose `$.save` rewrite is applied
    /// separately) fall back to the original `rhs`.
    pub fn read_wrap_rhs_string(&self, rhs: &str) -> String {
        let Some(mut expr) = reparse_expression(rhs.trim(), self.allocator) else {
            return rhs.to_string();
        };
        self.wrap_reads_in_place(&mut expr);
        self.expr_to_string(&expr)
    }

    /// Re-parse a complete statement `src` slice into the STATE allocator,
    /// returning its first top-level statement. Used by the script transform to
    /// rehome kept / hoisted statements (imports, functions, expression
    /// statements) from the throwaway classification arena into the output AST.
    pub fn reparse_statement(&self, src: &str) -> Option<Statement<'a>> {
        let owned = self.allocator.alloc_str(src.trim());
        let ret =
            oxc_parser::Parser::new(self.allocator, owned, oxc_span::SourceType::mjs()).parse();
        comment_stats::bump::REPARSE_STMT_CALLS(1);
        comment_stats::bump::REPARSE_STMT_DROPPED_COMMENTS(ret.program.comments.len() as u64);
        if !ret.diagnostics.is_empty() {
            return None;
        }
        ret.program.body.into_iter().next()
    }

    /// Re-parse a whole program `src` into the state allocator, returning ALL
    /// its top-level statements. Used by the async instance-body transform to
    /// rehome the sync/async-split TEXT (`var …; var $$promises = …`) emitted by
    /// `transform_async_body` back into oxc statements. Records a failure and
    /// returns an empty vec on a parse failure.
    pub fn reparse_program(&self, src: &str) -> Vec<Statement<'a>> {
        let owned = self.allocator.alloc_str(src.trim());
        let ret =
            oxc_parser::Parser::new(self.allocator, owned, oxc_span::SourceType::mjs()).parse();
        comment_stats::bump::REPARSE_PROGRAM_CALLS(1);
        if !ret.diagnostics.is_empty() {
            comment_stats::bump::REPARSE_PROGRAM_DIAG_DROPS(1);
            // `src` is our own generated text, so a rejection is a compiler bug,
            // and continuing would ship a component whose instance body silently
            // did nothing — fail the compile in every build profile instead.
            *self.reparse_failure.borrow_mut() = Some(format!(
                "server async instance-body reparse rejected compiler-generated source \
                 ({} diagnostics): {}",
                ret.diagnostics.len(),
                ret.diagnostics
                    .iter()
                    .map(|d| d.message.to_string())
                    .collect::<Vec<_>>()
                    .join("; ")
            ));
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
    /// `FormalParameters`, by wrapping them as a throwaway arrow
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
    // Parse TypeScript-aware: a source slice (e.g. a `{@render foo(x as T)}`
    // argument) may still carry TS that the rsvelte parser strips on the structured
    // AST but the raw text retains. Parsing as plain JS rejects `x as T`, leaving an
    // `undefined` fallback; parsing as TS then stripping the type-only wrappers
    // (below) reproduces the structured-AST output.
    let ret = oxc_parser::Parser::new(
        allocator,
        owned,
        oxc_span::SourceType::mjs().with_typescript(true),
    )
    .parse();
    if !ret.diagnostics.is_empty() {
        return None;
    }
    // Type-only syntax that is not an expression wrapper — parameter annotations
    // on an inline arrow (`{@const f = (d: T) => …}`), call type arguments, a
    // `type` alias in an arrow's block body — survives the wrapper collapse below
    // and would reach the output as TypeScript. Erase it textually with the same
    // positional stripper the analyzer uses, then re-parse the result as plain JS.
    // `strip_typescript_from_program` returns its input unchanged when there is
    // nothing to remove, so the common (non-TS) slice pays no second parse.
    let erased = crate::compiler::phases::phase2_analyze::types::strip_typescript_from_program(
        owned,
        &ret.program,
    );
    if erased != owned {
        let reowned = allocator.alloc_str(&erased);
        let reparsed =
            oxc_parser::Parser::new(allocator, reowned, oxc_span::SourceType::mjs()).parse();
        if reparsed.diagnostics.is_empty() {
            return first_expression(reparsed.program.body, allocator);
        }
    }
    first_expression(ret.program.body, allocator)
}

/// Pull the single `ExpressionStatement` out of a re-parsed program body,
/// unwrapping the synthetic parens and collapsing any TS expression wrappers.
fn first_expression<'a>(
    body: oxc_allocator::Vec<'a, Statement<'a>>,
    allocator: &'a Allocator,
) -> Option<OxcExpression<'a>> {
    for stmt in body {
        if let Statement::ExpressionStatement(es) = stmt {
            let mut expr = unwrap_parenthesized(es.unbox().expression);
            strip_ts_expression_wrappers(&mut expr, allocator);
            return Some(expr);
        }
    }
    None
}

/// Recursively replace TypeScript expression wrappers (`x as T`,
/// `x satisfies T`, `x!`, `<T>x`) with their inner expression, tree-wide. The
/// server never emits TS, so these always collapse to the underlying value (e.g.
/// `{ value: value as T[U] }` → `{ value: value }`, which esrap then prints as the
/// shorthand `{ value }`). Mirrors the rsvelte parser's `remove_typescript_nodes`
/// pass, applied here because `reparse_expression` re-parses raw (un-stripped)
/// source text.
fn strip_ts_expression_wrappers<'a>(expr: &mut OxcExpression<'a>, allocator: &'a Allocator) {
    use oxc_ast_visit::VisitMut;
    struct TsStrip<'b> {
        ab: oxc_ast::builder::AstBuilder<'b>,
    }
    impl<'b> VisitMut<'b> for TsStrip<'b> {
        fn visit_expression(&mut self, expr: &mut OxcExpression<'b>) {
            loop {
                let is_wrapper = matches!(
                    expr,
                    OxcExpression::TSAsExpression(_)
                        | OxcExpression::TSSatisfiesExpression(_)
                        | OxcExpression::TSNonNullExpression(_)
                        | OxcExpression::TSTypeAssertion(_)
                );
                if !is_wrapper {
                    break;
                }
                let placeholder =
                    oxc_ast::ast::Expression::new_boolean_literal(SPAN, false, &self.ab);
                let taken = std::mem::replace(expr, placeholder);
                *expr = match taken {
                    OxcExpression::TSAsExpression(e) => e.unbox().expression,
                    OxcExpression::TSSatisfiesExpression(e) => e.unbox().expression,
                    OxcExpression::TSNonNullExpression(e) => e.unbox().expression,
                    OxcExpression::TSTypeAssertion(e) => e.unbox().expression,
                    _ => unreachable!(),
                };
            }
            oxc_ast_visit::walk_mut::walk_expression(self, expr);
        }
    }
    let mut v = TsStrip {
        ab: oxc_ast::builder::AstBuilder::new(allocator),
    };
    v.visit_expression(expr);
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
/// Returns the printed code, or `Err(message)` when assembly is impossible —
/// currently only when [`ServerTransformState::reparse_program`] rejected text
/// this compiler generated.
pub fn server_component_ast<'a>(
    analysis: &'a ComponentAnalysis,
    ast: &'a Root,
    source: &'a str,
    options: &'a CompileOptions,
    allocator: &'a Allocator,
) -> Result<String, String> {
    let mut state = ServerTransformState::new(analysis, options, source, &ast.arena, allocator);

    // Precompute the SSR constant-folding inputs (`constant_vars` /
    // `use_async` / `top_level_blocker_map`) via the standalone
    // `compute_eval_inputs` (extracted from the now-removed text
    // `ServerCodeGenerator::new`), so the AST pipeline folds template chunks
    // byte-identically to the oracle. Cheap: only harvests the maps.
    {
        let instance_script = ast.instance.as_ref().map(|s| s.as_ref());
        let module_script = ast.module.as_ref().map(|s| s.as_ref());
        let use_async = options.experimental.r#async;
        let raw = super::helpers::compute_eval_inputs(
            Some(analysis),
            instance_script,
            module_script,
            source,
            use_async,
        );
        state.eval_inputs = EvalInputs {
            constant_vars: raw.constant_vars,
            use_async,
            top_level_blocker_map: raw.top_level_blocker_map,
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
    // Upstream emits `[...hoisted, ...module.body]` at module scope. The module
    // body is kept SEPARATE here (rather than appended to `state.hoisted` up
    // front) so that hoistable snippet `function` declarations — which are pushed
    // onto `state.hoisted` later, during `build_fragment_body` — land BEFORE the
    // module body. This matches upstream's `[...hoisted, ...module.body]` order
    // (e.g. a hoisted `{#snippet foo}` function precedes a `<script module>`'s
    // `export { foo }`).
    // (NON-DELICATE slice — only the localized rune lowerings; KNOWN GAPS:
    // derived-read wrapping / store-get / snapshot / $$sanitized_props.)
    let module_body = script::transform_module(ast, &mut state);

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
    state.is_standalone = ServerTransformState::is_standalone_fragment(
        &ast.fragment.nodes,
        state.preserve_whitespace,
    );
    // Root fragment: parent is the Fragment node itself, so it IS an
    // `is_text_first` parent (upstream `clean_nodes`/`Fragment`).
    // 写经 upstream `SnippetBlock.js`: NON-hoistable snippet function
    // declarations are emitted into the enclosing render scope's `state.init`.
    // `build_fragment_body` collects them per-fragment (see `state.snippet_inits`)
    // and prepends them to the front of each fragment body — so for the ROOT
    // fragment they already sit at the head of `template_body` (ahead of the
    // rendered template, after the instance body), and for block-nested snippets
    // they stay inside their block body. No extra splice is needed here.
    let template_body =
        visitors::shared::build_fragment_body(&ast.fragment.nodes, true, true, &mut state);

    // -- component-bindings settle-loop (upstream lines 178-211) ------------
    // If the component binds to a child (`<Child bind:value={v} />`), legacy
    // bindings may not be stable on the first render, so upstream wraps the
    // template body in a do-while settle loop that re-renders into a copied
    // renderer until `$$settled` stays true, then `subsume`s the inner result.
    //
    // Upstream separates top-level snippet FunctionDeclarations (`___snippet`)
    // from the `rest`, keeps the snippets ahead of the loop, and wraps only the
    // `rest`. A HOISTABLE snippet was lifted to module scope (`state.hoisted`); a
    // NON-hoistable one (referencing instance state, e.g. `{#snippet Fallback()}`
    // using a prop) is emitted inline into `template_body`. Those non-hoistable
    // top-level snippet functions must render OUTSIDE the settle loop, so split
    // them off the front (matching upstream's `template.body.filter(___snippet)`)
    // and keep them ahead of `$$render_inner` rather than inside it.
    let template_body = if analysis.uses_component_bindings {
        let mut snippets: Vec<Statement<'a>> = Vec::new();
        let mut rest: Vec<Statement<'a>> = Vec::new();
        for stmt in template_body {
            let is_snippet = matches!(
                &stmt,
                Statement::FunctionDeclaration(f)
                    if f.id.as_ref().is_some_and(|id| state.snippet_names.contains(id.name.as_str()))
            );
            if is_snippet {
                snippets.push(stmt);
            } else {
                rest.push(stmt);
            }
        }

        // function $$render_inner($$renderer) { <rest> }
        let inner_params = b.params(vec![b.id_pat("$$renderer")], None);
        let inner_fn_body = b.body(rest);
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

        let mut out = snippets;
        out.extend([
            b.let_id("$$settled", Some(b.bool(true))),
            b.let_id("$$inner_renderer", None),
            render_inner_fn,
            do_while,
            b.stmt(b.call("$$renderer.subsume", vec![b.id("$$inner_renderer")])),
        ]);
        out
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
    // Collect bindable props in SOURCE-declaration order (by `declaration_start`).
    // The bindings list is not always in declaration order — a prop that is also a
    // store subscription (e.g. `export let brush = writable(...)` used as `$brush`)
    // can be registered out of order — but Svelte emits `$.bind_props` in the
    // scope's declaration order, so sort to match.
    let mut bindable: Vec<&crate::compiler::phases::phase2_analyze::scope::Binding> = analysis
        .root
        .bindings
        .iter()
        .filter(|binding| {
            matches!(binding.kind, BindingKind::BindableProp) && !binding.name.starts_with("$$")
        })
        .collect();
    // Sort by source-declaration position. A bindable prop that is shadowed by a
    // same-named function parameter can have its BindableProp kind on the param
    // binding (no `declaration_start`); borrow the real `let/var` declaration's
    // position so the prop sorts at its true source location instead of last.
    // Sort-only — does not change which binding is marked (so var-hoisting is
    // untouched).
    let decl_pos = |binding: &crate::compiler::phases::phase2_analyze::scope::Binding| -> u32 {
        if let Some(start) = binding.declaration_start {
            return start;
        }
        use crate::compiler::phases::phase2_analyze::scope::DeclarationKind;
        analysis
            .root
            .bindings
            .iter()
            .filter(|b| {
                b.name == binding.name
                    && matches!(
                        b.declaration_kind,
                        DeclarationKind::Let | DeclarationKind::Var
                    )
            })
            .find_map(|b| b.declaration_start)
            .unwrap_or(u32::MAX)
    };
    bindable.sort_by_key(|binding| decl_pos(binding));
    let mut bind_props: Vec<oxc_ast::ast::ObjectPropertyKind<'a>> = Vec::new();
    for binding in bindable {
        let key = binding.prop_alias.as_deref().unwrap_or(&binding.name);
        bind_props.push(b.init(key, b.id(&binding.name)));
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
    // body = [...hoisted, ...module.body] — `state.hoisted` carries the namespace
    // import + instance imports + any hoisted snippet `function` declarations;
    // `module_body` (the `<script module>` lowering) follows so a hoisted snippet
    // function precedes a module-level `export { name }`. Then the `$$css` module
    // const (if any), then the export.
    let mut program_body = std::mem::take(&mut state.hoisted);
    program_body.extend(module_body);
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
        let opts_context =
            oxc_ast::ast::Expression::from(oxc_ast::ast::MemberExpression::StaticMemberExpression(
                oxc_ast::ast::StaticMemberExpression::boxed(
                    SPAN,
                    b.id("$$opts"),
                    b.id_name("context"),
                    true,
                    &b.ab(),
                ),
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
    } else if options.dev {
        // -- dev component export (upstream lines 356-376) ------------------
        // In dev mode the component is a NAMED function declaration followed by
        // a `<Name>.render = function () { throw ... }` stub (so the legacy
        // Svelte-4 `Component.render()` API throws a helpful error), then
        // `export default <Name>;`.
        program_body.push(component_fn);

        let render_target = b.member(b.id(component_name), "render");
        let render_params = b.params(vec![], None);
        let throw_msg = "Component.render(...) is no longer valid in Svelte 5. \
See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information";
        let render_body = b.body(vec![b.throw_error(throw_msg)]);
        let render_fn = b.function_expr(None, render_params, render_body, false);
        program_body.push(b.stmt(b.assignment(
            oxc_ast::ast::AssignmentOperator::Assign,
            render_target,
            render_fn,
        )));

        program_body.push(b.export_default_expr(b.id(component_name)));
    } else {
        program_body.push(b.export_default_fn(component_fn));
    }

    // -- dev FILENAME assignment (upstream lines 381-388) -------------------
    // `<Name>[$.FILENAME] = '<filename>';` is unshifted to the FRONT of the
    // module body (ahead of the namespace import) so the runtime can print
    // useful error messages. The async-flags side-effect import (already at
    // `hoisted[0]` when `use_async`) must stay ahead of it, so insert AFTER
    // any leading `import 'svelte/internal/flags/async';`.
    if options.dev {
        let filename = options.filename.as_deref().unwrap_or("");
        // `b.member(id, '$.FILENAME', computed=true)` → `<Name>[$.FILENAME]`,
        // where the computed key `$.FILENAME` is itself the member expression
        // `$.FILENAME` (namespace `$` dot-access `FILENAME`).
        let filename_target = b.member_computed(b.id(component_name), b.member_id("$.FILENAME"));
        let filename_stmt = b.stmt(b.assignment(
            oxc_ast::ast::AssignmentOperator::Assign,
            filename_target,
            b.string(filename),
        ));
        let insert_at = if state.eval_inputs.use_async { 1 } else { 0 };
        program_body.insert(insert_at, filename_stmt);
    }

    if let Some(message) = state.reparse_failure.borrow_mut().take() {
        return Err(message);
    }

    let mut program = b.program(program_body);
    // `main`'s `record_esrap_server` timed the bare `rsvelte_esrap::print` that
    // used to stand here. Comment preservation replaces that call, so the timer
    // moves onto its replacement rather than being dropped: the site is the
    // same one, and leaving it untimed would silently empty a bucket that the
    // esrap breakdown still reports.
    let _t = crate::compiler::phases::phase3_transform::profile::timer_start();
    let code = comments::print_with_comments(&mut program, &state.comments, allocator);
    crate::compiler::phases::phase3_transform::profile::record_esrap_server(
        crate::compiler::phases::phase3_transform::profile::timer_elapsed(_t),
    );
    comment_stats::dump();
    Ok(code)
}

#[cfg(test)]
mod tests;
