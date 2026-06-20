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

/// Re-parse a JS expression source slice with oxc and return its first
/// expression-statement expression. Returns `None` on parse error or if the
/// program isn't a single expression statement.
fn reparse_expression<'a>(src: &str, allocator: &'a Allocator) -> Option<OxcExpression<'a>> {
    let owned = allocator.alloc_str(src);
    let ret = oxc_parser::Parser::new(allocator, owned, oxc_span::SourceType::mjs()).parse();
    if !ret.diagnostics.is_empty() {
        return None;
    }
    for stmt in ret.program.body {
        if let Statement::ExpressionStatement(es) = stmt {
            return Some(es.unbox().expression);
        }
    }
    None
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
    ast: &'a Root,
    source: &'a str,
    options: &'a CompileOptions,
    allocator: &'a Allocator,
) -> Option<String> {
    let mut state = ServerTransformState::new(analysis, options, source, &ast.arena, allocator);
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

    // -- module-script body (module scope) ----------------------------------
    // Upstream emits `[...hoisted, ...module.body]` at module scope. We append
    // the lowered module statements onto `hoisted` (after the namespace import).
    // (NON-DELICATE slice — only the localized rune lowerings; KNOWN GAPS:
    // derived-read wrapping / store-get / snapshot / $$sanitized_props.)
    let module_body = script::transform_module(ast, &mut state);
    state.hoisted.extend(module_body);

    // -- instance-script body -----------------------------------------------
    // Upstream's component block is `[...instance.body, ...template.body]` (with
    // the props prologue prepended). The instance statements therefore go BEFORE
    // the template pushes, right after the prologue we just built. Instance
    // imports are hoisted onto `state.hoisted` inside `transform_instance`.
    let instance_body = script::transform_instance(ast, &mut state);
    state.body.extend(instance_body);

    // -- template body ------------------------------------------------------
    // Walk the root fragment through process_children + build_template, then
    // append the coalesced `$$renderer.push(...)` statements. (bind_props,
    // store-subs cleanup, props_id, $$renderer.component wrapper, etc. are still
    // TODO.)
    state.is_standalone = ServerTransformState::is_standalone_fragment(&ast.fragment.nodes);
    let template_body = visitors::shared::build_fragment_body(&ast.fragment, &mut state);
    state.body.extend(template_body);

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
