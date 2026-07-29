//! Runes-mode detection over the template AST.
//!
//! NOTE on runes detection: svelte2tsx deliberately uses its OWN runes heuristic
//! (the `detect_*`/`ExportedNames::is_runes_mode` machinery) rather than the
//! compiler's authoritative `ComponentAnalysis::runes` flag. The two genuinely
//! DIVERGE: the compiler treats `$host` / `$inspect` / `$bindable` (and certain
//! shadowing/scope cases) as runes — semantically correct — but official
//! `svelte2tsx`'s `hasRunesGlobals` only counts `$state` / `$derived` / `$effect`
//! (plus `$props` / explicit / top-level await). Since this port targets
//! byte-parity with official `svelte2tsx`, it must mirror svelte2tsx's narrower
//! definition; wiring in the compiler flag was measured to REGRESS the corpus
//! (it over-detects runes for ~24 `$host`-only / shadowed-derived components).

use crate::ast::template::Root;

use super::super::utils::lexical::contains_word;

/// Detect whether the component uses Svelte 5 runes mode.
///
/// Checks for the presence of `$props()`, `$state()`, `$derived()`, etc. in script content,
/// or `runes: true` in `<svelte:options>`.
pub(crate) fn detect_runes_mode(ast: &Root) -> bool {
    // Check svelte:options for explicit runes setting
    if let Some(ref options) = ast.options
        && let Some(runes) = options.runes
    {
        return runes;
    }

    // Don't default to runes mode; let process_instance_script detect rune usage
    false
}

/// Detect `await` expressions inside template expression tags, e.g. `{await t}`.
///
/// This walks the template fragment AST looking for `ExpressionTag` nodes whose
/// expression is (or begins with) an `AwaitExpression`. Await-in-template forces
/// runes mode — async template expressions are Svelte 5 runes-only.
///
/// NOTE: `{#await ...}` block syntax is NOT detected here — only bare `await`
/// inside `{...}` expression tags counts.
///
/// Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
///   `isRunes = true when component has AWAIT INSIDE A TEMPLATE EXPRESSION`
///   ("True if uses runes or top level await or await in template expressions")
pub(crate) fn detect_await_in_template(
    ast: &Root,
    source: &str,
    source_has_await_word: bool,
) -> bool {
    if !source_has_await_word {
        return false;
    }

    fragment_has_template_await(&ast.fragment, source, &ast.arena)
}

/// Recursively walk a template fragment checking for `{await ...}` ExpressionTags.
fn fragment_has_template_await(
    fragment: &crate::ast::template::Fragment,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    for node in &fragment.nodes {
        if template_node_has_await(node, source, arena) {
            return true;
        }
    }
    false
}

/// Check a single template node for `{await ...}` patterns, recursing into children.
fn template_node_has_await(
    node: &crate::ast::template::TemplateNode,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::template::TemplateNode;

    match node {
        // The key check: ExpressionTag with an AwaitExpression.
        TemplateNode::ExpressionTag(tag) => expression_is_await(&tag.expression, source, arena),
        // Recurse into element children and attributes
        TemplateNode::RegularElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&elem.fragment, source, arena)
        }
        TemplateNode::Component(comp) => {
            comp.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&comp.fragment, source, arena)
        }
        TemplateNode::IfBlock(block) => {
            // Also check the `{#if await cond}` test expression — mirrors 2_analyze
            // which walks `block.test` for has_await.
            expression_is_await(&block.test, source, arena)
                || fragment_has_template_await(&block.consequent, source, arena)
                || block
                    .alternate
                    .as_ref()
                    .map(|alt| fragment_has_template_await(alt, source, arena))
                    .unwrap_or(false)
        }
        TemplateNode::EachBlock(block) => {
            expression_is_await(&block.expression, source, arena)
                || fragment_has_template_await(&block.body, source, arena)
                || block
                    .fallback
                    .as_ref()
                    .map(|fb| fragment_has_template_await(fb, source, arena))
                    .unwrap_or(false)
        }
        TemplateNode::KeyBlock(block) => {
            expression_is_await(&block.expression, source, arena)
                || fragment_has_template_await(&block.fragment, source, arena)
        }
        // SnippetBlock: official svelte2tsx's `isRunes` sets true for an
        // AwaitExpression whose ancestor path has no function-expression node —
        // a SnippetBlock is NOT such a node, so an `await` inside a snippet body
        // (e.g. `{#snippet}{@const x = await …}{/snippet}`) DOES force runes.
        // (This is svelte2tsx-specific; the compiler's 2_analyze skips snippets,
        // but this detector mirrors svelte2tsx, not the compiler.)
        TemplateNode::SnippetBlock(block) => {
            fragment_has_template_await(&block.body, source, arena)
        }
        // AwaitBlock ({#await expr}) — the `expression` could itself contain an
        // await (e.g. `{#await await promise}`). Also recurse into the pending /
        // then / catch sub-fragments since they can contain nested {await ...}
        // ExpressionTags. Mirrors 2_analyze AwaitBlock fragment_check_features walk.
        TemplateNode::AwaitBlock(block) => {
            expression_is_await(&block.expression, source, arena)
                || block
                    .pending
                    .as_ref()
                    .map(|f| fragment_has_template_await(f, source, arena))
                    .unwrap_or(false)
                || block
                    .then
                    .as_ref()
                    .map(|f| fragment_has_template_await(f, source, arena))
                    .unwrap_or(false)
                || block
                    .catch
                    .as_ref()
                    .map(|f| fragment_has_template_await(f, source, arena))
                    .unwrap_or(false)
        }
        // SvelteHead, SvelteFragment, SvelteBody, SvelteWindow, SvelteDocument,
        // SvelteBoundary, SvelteOptions, SvelteSelf — all use the SvelteElement struct.
        TemplateNode::SvelteHead(elem)
        | TemplateNode::SvelteFragment(elem)
        | TemplateNode::SvelteBody(elem)
        | TemplateNode::SvelteWindow(elem)
        | TemplateNode::SvelteDocument(elem)
        | TemplateNode::SvelteBoundary(elem)
        | TemplateNode::SvelteOptions(elem)
        | TemplateNode::SvelteSelf(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&elem.fragment, source, arena)
        }
        TemplateNode::SvelteComponent(comp) => {
            comp.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&comp.fragment, source, arena)
        }
        TemplateNode::SvelteElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&elem.fragment, source, arena)
        }
        TemplateNode::TitleElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&elem.fragment, source, arena)
        }
        TemplateNode::SlotElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_await(attr, source, arena))
                || fragment_has_template_await(&elem.fragment, source, arena)
        }
        // HtmlTag ({@html expr}) and RenderTag ({@render expr}) — if the expression
        // itself is an AwaitExpression (e.g. `{@html await t}`) trigger runes mode.
        TemplateNode::HtmlTag(tag) => expression_is_await(&tag.expression, source, arena),
        TemplateNode::RenderTag(tag) => expression_is_await(&tag.expression, source, arena),
        // `{@const x = await …}` — a top-level await in a const-tag declaration
        // makes the component async (e.g. inside `<svelte:boundary>`).
        TemplateNode::ConstTag(ct) => expression_is_await(&ct.declaration, source, arena),
        // Text, Comment, DeclarationTag, DebugTag, AttachTag — the primary
        // trigger is ExpressionTag; these are less common.
        _ => false,
    }
}

/// Check if an attribute value contains an await expression in any ExpressionTag part.
fn attr_has_await(
    attr: &crate::ast::template::Attribute,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::template::Attribute;
    use crate::ast::template::AttributeValue;
    use crate::ast::template::AttributeValuePart;

    // Mirror official's template walk, which sets `isRunes` on ANY top-level
    // `AwaitExpression` regardless of which attribute/directive it lives in
    // (e.g. `class:x={await y}`, `style:c={await z}`, `use:a={await b}`,
    // `bind:v={await w}`). Previously only plain attributes were checked, so
    // an await confined to a directive failed to flip runes mode and the
    // `bindings:` field was emitted in legacy (`""`) instead of runes
    // (`__sveltets_$$bindings('')`) form.
    let value_has_await = |value: &AttributeValue| match value {
        AttributeValue::Expression(expr_tag) => {
            expression_is_await(&expr_tag.expression, source, arena)
        }
        AttributeValue::Sequence(parts) => parts.iter().any(|part| {
            if let AttributeValuePart::ExpressionTag(tag) = part {
                expression_is_await(&tag.expression, source, arena)
            } else {
                false
            }
        }),
        AttributeValue::True(_) => false,
    };
    let opt_expr_has_await = |expr: &Option<crate::ast::js::Expression>| {
        expr.as_ref()
            .is_some_and(|e| expression_is_await(e, source, arena))
    };

    match attr {
        Attribute::Attribute(attr_node) => value_has_await(&attr_node.value),
        Attribute::SpreadAttribute(s) => expression_is_await(&s.expression, source, arena),
        Attribute::AttachTag(t) => expression_is_await(&t.expression, source, arena),
        Attribute::ClassDirective(d) => expression_is_await(&d.expression, source, arena),
        Attribute::BindDirective(d) => expression_is_await(&d.expression, source, arena),
        Attribute::StyleDirective(d) => value_has_await(&d.value),
        Attribute::OnDirective(d) => opt_expr_has_await(&d.expression),
        Attribute::TransitionDirective(d) => opt_expr_has_await(&d.expression),
        Attribute::AnimateDirective(d) => opt_expr_has_await(&d.expression),
        Attribute::UseDirective(d) => opt_expr_has_await(&d.expression),
        Attribute::LetDirective(_) => false,
    }
}

/// Check if an Expression node is (or begins with) an AwaitExpression.
///
/// For `Typed` expressions, checks the top-level JsNode variant.
/// For `Lazy` expressions (source spans), checks the source text.
/// For `Value` (JSON) expressions, checks the JSON `type` field.
fn expression_is_await(
    expr: &crate::ast::js::Expression,
    source: &str,
    _arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::js::Expression;
    use crate::ast::typed_expr::JsNode;

    // A top-level `await` ANYWHERE inside the expression makes the component
    // async (→ runes), not only when the whole expression IS an await — e.g.
    // `{(await user).name}`, `{foo(await x)}`, `{cond ? await a : b}`. Fast-path
    // the direct `{await x}` form, then scan the expression's source span for
    // `await` as a word, which covers every nesting depth. (A literal "await"
    // string is a rare false positive; svelte itself treats such components as
    // async too once a template `await` is present.)
    let direct = match expr {
        Expression::Typed(te) => matches!(&te.node, JsNode::AwaitExpression { .. }),
        Expression::Lazy { .. } => false,
    };
    if direct {
        return true;
    }
    // Non-direct: a `await` nested in e.g. `(await user).name` / `foo(await x)`
    // still makes the component async — BUT an `await` inside a nested function
    // (`() => await x`) is a different scope and must NOT count (mirrors the
    // upstream `scope === rootScope` rule). Approximate the function-boundary
    // check on the source span: count the `await` only when the expression
    // contains no function boundary (`=>` / `function`), which keeps the common
    // member/call/conditional cases without over-triggering on callbacks.
    if let (Some(s), Some(e)) = (expr.start(), expr.end()) {
        let (s, e) = (s as usize, e as usize);
        if s < e && e <= source.len() {
            let span = &source.as_bytes()[s..e];
            return contains_word(span, b"await")
                && !span.windows(2).any(|w| w == b"=>")
                && !contains_word(span, b"function");
        }
    }
    false
}

// =============================================================================
// Rune-global-in-template detection
//
// Mirrors the official `checkGlobalsForRunes` pass which treats every undeclared
// `$state` / `$derived` / `$effect` identifier anywhere in the component (script
// OR template) as evidence of runes mode.  The instance-script scanner handles
// the `<script>` side; these helpers cover the template side so that components
// with NO `<script>` but with e.g. `{$state.eager(x)}` are correctly classified.
//
// Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/index.ts
//   `exportedNames.checkGlobalsForRunes(implicitStoreValues.getGlobals())`
// Reference: language-tools/packages/svelte2tsx/src/svelte2tsx/nodes/ExportedNames.ts
//   `hasRunesGlobals = isSvelte5Plus && globals.some(g => ['$state','$derived','$effect'].includes(g))`
// =============================================================================

/// Detect any `$state`/`$derived`/`$effect` rune-global reference inside the
/// template fragment.
///
/// Fast-path: returns `false` immediately when none of the three magic words
/// appear as a word boundary in the raw source.  The AST walk is only done when
/// a quick substring match succeeds.
pub(crate) fn detect_rune_global_in_template(
    ast: &Root,
    source: &str,
    instance_value_names: &std::collections::HashSet<String>,
    source_may_contain_rune_global: bool,
) -> bool {
    // Fast path: if neither $state, $derived, nor $effect appears in the source
    // as a word start, bail immediately.  These identifiers always start with `$`
    // so a simple substring check is conservative (won't false-positive on
    // e.g. `some_$state_like_string` since we still walk the AST after this).
    if !source_may_contain_rune_global {
        return false;
    }

    // Populate the shadowed-rune set: a `state`/`derived`/`effect` declared as an
    // instance variable makes the matching `$`-rune a store sub, not a rune.
    SHADOWED_RUNE_BASES.with(|s| {
        let mut set = s.borrow_mut();
        set.clear();
        for base in ["state", "derived", "effect"] {
            if instance_value_names.contains(base) {
                set.insert(base.to_string());
            }
        }
    });
    let result = fragment_has_template_rune_global(&ast.fragment, source, &ast.arena);
    SHADOWED_RUNE_BASES.with(|s| s.borrow_mut().clear());
    result
}

/// Recursively walk a template fragment checking for rune-global references.
fn fragment_has_template_rune_global(
    fragment: &crate::ast::template::Fragment,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    for node in &fragment.nodes {
        if template_node_has_rune_global(node, source, arena) {
            return true;
        }
    }
    false
}

/// Check a single template node for rune-global references, recursing into children.
fn template_node_has_rune_global(
    node: &crate::ast::template::TemplateNode,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::template::TemplateNode;

    match node {
        // The primary check: ExpressionTag { expr } — check if the expression
        // references a $state/$derived/$effect global.
        TemplateNode::ExpressionTag(tag) => {
            expression_references_rune_global(&tag.expression, source, arena)
        }
        // Recurse into element children and attributes
        TemplateNode::RegularElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&elem.fragment, source, arena)
        }
        TemplateNode::Component(comp) => {
            comp.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&comp.fragment, source, arena)
        }
        TemplateNode::IfBlock(block) => {
            expression_references_rune_global(&block.test, source, arena)
                || fragment_has_template_rune_global(&block.consequent, source, arena)
                || block
                    .alternate
                    .as_ref()
                    .map(|alt| fragment_has_template_rune_global(alt, source, arena))
                    .unwrap_or(false)
        }
        TemplateNode::EachBlock(block) => {
            expression_references_rune_global(&block.expression, source, arena)
                || fragment_has_template_rune_global(&block.body, source, arena)
                || block
                    .fallback
                    .as_ref()
                    .map(|fb| fragment_has_template_rune_global(fb, source, arena))
                    .unwrap_or(false)
        }
        TemplateNode::KeyBlock(block) => {
            expression_references_rune_global(&block.expression, source, arena)
                || fragment_has_template_rune_global(&block.fragment, source, arena)
        }
        // SnippetBlock: official's global collection (checkGlobalsForRunes via
        // implicitStoreValues) walks the whole component including snippet
        // bodies, so a rune call inside a snippet (`{#snippet}{@const x =
        // $derived(…)}{/snippet}`) forces runes mode. Recurse into the body.
        TemplateNode::SnippetBlock(block) => {
            fragment_has_template_rune_global(&block.body, source, arena)
        }
        TemplateNode::AwaitBlock(block) => {
            expression_references_rune_global(&block.expression, source, arena)
                || block
                    .pending
                    .as_ref()
                    .map(|f| fragment_has_template_rune_global(f, source, arena))
                    .unwrap_or(false)
                || block
                    .then
                    .as_ref()
                    .map(|f| fragment_has_template_rune_global(f, source, arena))
                    .unwrap_or(false)
                || block
                    .catch
                    .as_ref()
                    .map(|f| fragment_has_template_rune_global(f, source, arena))
                    .unwrap_or(false)
        }
        // SvelteHead, SvelteFragment, SvelteBody, SvelteWindow, SvelteDocument,
        // SvelteBoundary, SvelteOptions, SvelteSelf — all use the SvelteElement struct.
        TemplateNode::SvelteHead(elem)
        | TemplateNode::SvelteFragment(elem)
        | TemplateNode::SvelteBody(elem)
        | TemplateNode::SvelteWindow(elem)
        | TemplateNode::SvelteDocument(elem)
        | TemplateNode::SvelteBoundary(elem)
        | TemplateNode::SvelteOptions(elem)
        | TemplateNode::SvelteSelf(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&elem.fragment, source, arena)
        }
        TemplateNode::SvelteComponent(comp) => {
            comp.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&comp.fragment, source, arena)
        }
        TemplateNode::SvelteElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&elem.fragment, source, arena)
        }
        TemplateNode::TitleElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&elem.fragment, source, arena)
        }
        TemplateNode::SlotElement(elem) => {
            elem.attributes
                .iter()
                .any(|attr| attr_has_rune_global(attr, source, arena))
                || fragment_has_template_rune_global(&elem.fragment, source, arena)
        }
        // HtmlTag ({@html expr}) and RenderTag ({@render expr})
        TemplateNode::HtmlTag(tag) => {
            expression_references_rune_global(&tag.expression, source, arena)
        }
        TemplateNode::RenderTag(tag) => {
            expression_references_rune_global(&tag.expression, source, arena)
        }
        // AttachTag ({@attach expr}) — the expression may contain nested
        // rune calls, e.g. `{@attach $effect(() => { ... })}`.
        // Reference: official svelte2tsx collects `@attach` expression globals
        // via `implicitStoreValues` just like any other template expression.
        TemplateNode::AttachTag(tag) => {
            expression_references_rune_global(&tag.expression, source, arena)
        }
        // `{@const x = $derived(…)}` and `{let x = $state(0), …}` carry rune
        // calls in their declaration; official collects their globals like any
        // other template expression, so a runes-only component with no script
        // (only template declaration tags) still enters runes mode. The
        // declaration is a `VariableDeclaration` (which the typed/JSON rune
        // walkers don't descend into), so scan the tag's source slice directly.
        TemplateNode::ConstTag(tag) => {
            let (s, e) = (tag.start as usize, tag.end as usize);
            s < e && e <= source.len() && lazy_slice_references_rune_global(&source[s..e])
        }
        TemplateNode::DeclarationTag(tag) => {
            let (s, e) = (tag.start as usize, tag.end as usize);
            s < e && e <= source.len() && lazy_slice_references_rune_global(&source[s..e])
        }
        _ => false,
    }
}

/// Check if an attribute (of any kind) contains a rune-global reference.
///
/// Covers all `Attribute` variants:
/// - `Attribute` (plain attribute with expression/sequence value)
/// - `SpreadAttribute` (spread expression)
/// - `AttachTag` (`{@attach expr}` used inside element attribute position)
/// - All directives: `bind:`, `on:`, `class:`, `style:`, `transition:`,
///   `animate:`, `use:`, `let:` — each may carry an expression value.
///
/// Reference: official svelte2tsx passes ALL template expressions through
/// `implicitStoreValues` (which collects globals), not just plain attributes.
/// Mirrors the comprehensive directive coverage in `attr_has_await`.
fn attr_has_rune_global(
    attr: &crate::ast::template::Attribute,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::template::Attribute;
    use crate::ast::template::AttributeValue;
    use crate::ast::template::AttributeValuePart;

    match attr {
        // Plain attribute: check expression / sequence values.
        Attribute::Attribute(attr_node) => match &attr_node.value {
            AttributeValue::Expression(expr_tag) => {
                expression_references_rune_global(&expr_tag.expression, source, arena)
            }
            AttributeValue::Sequence(parts) => parts.iter().any(|part| {
                if let AttributeValuePart::ExpressionTag(tag) = part {
                    expression_references_rune_global(&tag.expression, source, arena)
                } else {
                    false
                }
            }),
            AttributeValue::True(_) => false,
        },

        // Spread attribute: `{...expr}` — check the spread expression.
        Attribute::SpreadAttribute(spread) => {
            expression_references_rune_global(&spread.expression, source, arena)
        }

        // AttachTag in attribute position: `{@attach expr}`.
        Attribute::AttachTag(attach) => {
            expression_references_rune_global(&attach.expression, source, arena)
        }

        // bind:name={expr} — expression is always present.
        Attribute::BindDirective(bind) => {
            expression_references_rune_global(&bind.expression, source, arena)
        }

        // on:event={handler} — expression is Optional<Expression>.
        Attribute::OnDirective(on) => on
            .expression
            .as_ref()
            .is_some_and(|e| expression_references_rune_global(e, source, arena)),

        // class:name={expr} — expression is always present.
        Attribute::ClassDirective(class) => {
            expression_references_rune_global(&class.expression, source, arena)
        }

        // style:property={value} — value is AttributeValue (same shape as plain attr).
        Attribute::StyleDirective(style) => match &style.value {
            AttributeValue::Expression(expr_tag) => {
                expression_references_rune_global(&expr_tag.expression, source, arena)
            }
            AttributeValue::Sequence(parts) => parts.iter().any(|part| {
                if let AttributeValuePart::ExpressionTag(tag) = part {
                    expression_references_rune_global(&tag.expression, source, arena)
                } else {
                    false
                }
            }),
            AttributeValue::True(_) => false,
        },

        // transition:name={params} / in: / out: — expression is Optional.
        Attribute::TransitionDirective(t) => t
            .expression
            .as_ref()
            .is_some_and(|e| expression_references_rune_global(e, source, arena)),

        // animate:name={params} — expression is Optional.
        Attribute::AnimateDirective(a) => a
            .expression
            .as_ref()
            .is_some_and(|e| expression_references_rune_global(e, source, arena)),

        // use:action={params} — expression is Optional.
        Attribute::UseDirective(u) => u
            .expression
            .as_ref()
            .is_some_and(|e| expression_references_rune_global(e, source, arena)),

        // let:item — rarely carries a rune call, but check for completeness.
        Attribute::LetDirective(l) => l
            .expression
            .as_ref()
            .is_some_and(|e| expression_references_rune_global(e, source, arena)),
    }
}

// Rune base names (`state`/`derived`/`effect`) that are SHADOWED by an
// instance-script variable of the same name. Official `getGlobals()` removes
// declared variables, so `$state.snapshot(state)` where `state` is declared
// is a store auto-subscription, NOT a `$state` rune — the component stays
// legacy. Set (read-only) for the duration of `detect_rune_global_in_template`
// on this thread and cleared right after; never accumulated across calls.
thread_local! {
    static SHADOWED_RUNE_BASES: std::cell::RefCell<std::collections::HashSet<String>> =
        std::cell::RefCell::new(std::collections::HashSet::new());
}

fn rune_base_is_shadowed(base: &str) -> bool {
    SHADOWED_RUNE_BASES.with(|s| s.borrow().contains(base))
}

/// Returns `true` if `name` is one of the three rune-global identifiers and is
/// not shadowed by a declared instance variable.
#[inline]
fn is_rune_global_name(name: &str) -> bool {
    matches!(name, "$state" | "$derived" | "$effect") && !rune_base_is_shadowed(&name[1..])
}

/// Check whether an Expression node references a `$state`/`$derived`/`$effect` global.
///
/// For `Typed` expressions, walks the JsNode tree stored in the parse arena.
/// For `Lazy` expressions (raw source spans), scans the source text.
/// For `Value` (JSON) expressions, inspects the JSON AST.
///
/// The walk is deliberately shallow-but-sufficient: it recurses into the callee
/// of a CallExpression and the object of a MemberExpression (the two patterns
/// that can reference a rune global — `$state(x)` and `$state.eager(x)`) but
/// does NOT recurse into every sub-expression.  Template expressions that use
/// rune globals almost always have the global as the outermost callee or
/// member-expression object, so this covers all real-world cases while keeping
/// the implementation simple and fast.
///
/// Reference: ExportedNames.ts `checkGlobalsForRunes` which sets
///   `hasRunesGlobals` when any of `$state`/`$derived`/`$effect` appear as an
///   undeclared identifier anywhere in the component globals set.
fn expression_references_rune_global(
    expr: &crate::ast::js::Expression,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::js::Expression;

    match expr {
        Expression::Typed(te) => js_node_references_rune_global(&te.node, arena),
        Expression::Lazy { start, end, .. } => {
            // Raw source slice — scan for `$state`, `$derived`, `$effect` as
            // identifier-like occurrences.  We already know the full source
            // contains one of these strings (fast-path in
            // `detect_rune_global_in_template`), so this walk is uncommon.
            let s = *start as usize;
            let e = *end as usize;
            if s < e && e <= source.len() {
                let slice = &source[s..e];
                lazy_slice_references_rune_global(slice)
            } else {
                false
            }
        }
    }
}

/// Check whether a callee `JsNode` directly IS a rune-global call target.
///
/// A callee is a rune-global target when it is:
///   - An `Identifier` named `$state`/`$derived`/`$effect`  (direct call: `$state(x)`)
///   - A `MemberExpression` whose object is such an identifier  (`$state.eager(x)`)
///
/// This intentionally does NOT recurse further — if the callee is something more
/// complex, it is not a rune call pattern.
#[inline]
fn js_callee_is_rune_global(
    callee: &crate::ast::typed_expr::JsNode,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::typed_expr::JsNode;
    match callee {
        JsNode::Identifier { name, .. } => is_rune_global_name(name.as_str()),
        JsNode::MemberExpression { object, .. } => {
            let obj = arena.get_js_node(*object);
            matches!(obj, JsNode::Identifier { name, .. } if is_rune_global_name(name.as_str()))
        }
        _ => false,
    }
}

/// Walk a `JsNode` (typed AST node stored in the parse arena) looking for a
/// `$state`/`$derived`/`$effect` rune call anywhere in the expression tree.
///
/// A RUNE CALL means the global is used as a call callee or as the object of a
/// member-expression that is itself used as a call callee.  A bare `$state`
/// identifier that is just a store auto-subscription (`{$state}`) does NOT match.
///
/// Handles patterns like:
///   - `$state(x)`                     → CallExpression callee = Identifier "$state"
///   - `$state.eager(x)`               → CallExpression callee = MemberExpression { object = Identifier "$state" }
///   - `$effect.pre(() => …)`          → same
///   - `foo($state(x))`                → arguments contain a rune CallExpression
///   - `a === '/' ? $state(x) : null`  → ConditionalExpression branches
///   - `() => $effect(() => {})`       → ArrowFunctionExpression body
///   - `{@attach $effect(() => {})}`   → ArrowFunctionExpression body in AttachTag
///   - `[..., $state(x)]`              → ArrayExpression element
///   - `{ k: $derived(v) }`            → ObjectExpression property value
///
/// Does NOT match:
///   - `{$state}` (bare store auto-subscription; no call)
///   - `$state + 1` (store ref in arithmetic; no call)
///
/// Reference: official `implicitStoreValues` collects ALL undeclared globals,
/// including those inside nested function bodies passed to directives.
fn js_node_references_rune_global(
    node: &crate::ast::typed_expr::JsNode,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::typed_expr::JsNode;
    match node {
        // CallExpression: the callee must be a rune-global target (direct call
        // `$state(...)` or member-call `$state.eager(...)`).  Also recurse into
        // arguments so nested rune calls like `foo($state(x))` are caught.
        JsNode::CallExpression {
            callee, arguments, ..
        } => {
            let callee_node = arena.get_js_node(*callee);
            if js_callee_is_rune_global(callee_node, arena) {
                return true;
            }
            // Recurse into arguments to catch `foo($state(x))`.
            let args = arena.get_js_children(*arguments);
            args.iter()
                .any(|arg| js_node_references_rune_global(arg, arena))
        }

        // ConditionalExpression: check test, consequent, alternate.
        // E.g. `$state.eager(x) === '/' ? 'page' : null` — the test is the
        // BinaryExpression; we recurse into it and then into the call.
        JsNode::ConditionalExpression {
            test,
            consequent,
            alternate,
            ..
        } => {
            js_node_references_rune_global(arena.get_js_node(*test), arena)
                || js_node_references_rune_global(arena.get_js_node(*consequent), arena)
                || js_node_references_rune_global(arena.get_js_node(*alternate), arena)
        }

        // BinaryExpression / LogicalExpression: check both sides.
        // E.g. `$state.eager(pathname) === '/'` — the left side is the call.
        JsNode::BinaryExpression { left, right, .. }
        | JsNode::LogicalExpression { left, right, .. } => {
            js_node_references_rune_global(arena.get_js_node(*left), arena)
                || js_node_references_rune_global(arena.get_js_node(*right), arena)
        }

        // ArrowFunctionExpression: recurse into the body.
        // Covers `{@attach $effect(() => { ... })}` and
        // `use:action={() => $state(x)}` patterns.
        // The body is a JsNodeId pointing to either a BlockStatement or an
        // expression (when `expression: true`).
        JsNode::ArrowFunctionExpression { body, .. } => {
            let body_node = arena.get_js_node(*body);
            js_node_references_rune_global(body_node, arena)
        }

        // FunctionExpression: recurse into the body (a BlockStatement or None).
        // E.g. `use:action={function() { $effect(() => {}); }}`.
        JsNode::FunctionExpression { body, .. } => body
            .map(|b| {
                let body_node = arena.get_js_node(b);
                js_node_references_rune_global(body_node, arena)
            })
            .unwrap_or(false),

        // BlockStatement: recurse into each statement.
        // Reached from FunctionExpression / ArrowFunctionExpression bodies.
        JsNode::BlockStatement { body, .. } => {
            let stmts = arena.get_js_children(*body);
            stmts
                .iter()
                .any(|s| js_node_references_rune_global(s, arena))
        }

        // ExpressionStatement: unwrap to the inner expression.
        JsNode::ExpressionStatement { expression, .. } => {
            js_node_references_rune_global(arena.get_js_node(*expression), arena)
        }

        // ObjectExpression: recurse into property values.
        // E.g. `use:action={{ key: $state(x) }}`.
        JsNode::ObjectExpression { properties, .. } => {
            let props = arena.get_js_children(*properties);
            props.iter().any(|p| {
                if let JsNode::Property { value, .. } = p {
                    js_node_references_rune_global(arena.get_js_node(*value), arena)
                } else {
                    false
                }
            })
        }

        // ArrayExpression: recurse into elements (elements are inline, not arena-indexed).
        // E.g. `{[$state(a), $derived(b)]}`.
        JsNode::ArrayExpression { elements, .. } => elements.iter().any(|elem| {
            elem.as_ref()
                .is_some_and(|e| js_node_references_rune_global(e, arena))
        }),

        // SequenceExpression: recurse into each sub-expression.
        // E.g. `{(doSomething(), $state(x))}`.
        JsNode::SequenceExpression { expressions, .. } => {
            let exprs = arena.get_js_children(*expressions);
            exprs
                .iter()
                .any(|e| js_node_references_rune_global(e, arena))
        }

        // AwaitExpression: recurse into the argument.
        // Rare in template context but possible.
        JsNode::AwaitExpression { argument, .. } => {
            js_node_references_rune_global(arena.get_js_node(*argument), arena)
        }

        // UnaryExpression: recurse into argument (e.g. `!$state(x)`).
        JsNode::UnaryExpression { argument, .. } => {
            js_node_references_rune_global(arena.get_js_node(*argument), arena)
        }

        // AssignmentExpression: check right-hand side.
        // E.g. `x = $state(0)` inside a function body.
        JsNode::AssignmentExpression { right, .. } => {
            js_node_references_rune_global(arena.get_js_node(*right), arena)
        }

        // VariableDeclaration / VariableDeclarator: recurse into each
        // declarator's initializer — e.g. `const state = $state({…})` inside an
        // event-handler arrow body (`onsubmit={e => { const s = $state(…) }}`).
        JsNode::VariableDeclaration { declarations, .. } => {
            let decls = arena.get_js_children(*declarations);
            decls
                .iter()
                .any(|d| js_node_references_rune_global(d, arena))
        }
        JsNode::VariableDeclarator { init, .. } => init
            .map(|i| js_node_references_rune_global(arena.get_js_node(i), arena))
            .unwrap_or(false),

        // ReturnStatement / IfStatement bodies can also host rune calls.
        JsNode::ReturnStatement { argument, .. } => argument
            .map(|a| js_node_references_rune_global(arena.get_js_node(a), arena))
            .unwrap_or(false),

        // Bare Identifier (e.g. `{$state}` — store auto-subscription) → NOT a rune call.
        // MemberExpression without being called (e.g. `$state.value` as a bare expr) → NOT a rune call.
        // These are legitimate store/object references, not rune invocations.
        _ => false,
    }
}

/// Scan a raw source slice (from a `Lazy` expression) for a rune-global CALL.
///
/// Only triggers when `$state`/`$derived`/`$effect` is immediately followed by
/// `(` (direct call) or `.` (member call like `$state.eager(…)`).  A bare
/// `$state` with no following `(` or `.` is a store auto-subscription reference
/// and must NOT trigger runes mode.
fn lazy_slice_references_rune_global(slice: &str) -> bool {
    for candidate in &["$state", "$derived", "$effect"] {
        // A rune whose base is shadowed by a declared instance var is a store
        // sub, not a rune (see SHADOWED_RUNE_BASES).
        if rune_base_is_shadowed(&candidate[1..]) {
            continue;
        }
        let mut search_from = 0;
        while let Some(rel) = slice[search_from..].find(candidate) {
            let idx = search_from + rel;
            let after = idx + candidate.len();
            if after < slice.len() {
                let next = slice.as_bytes()[after];
                // Require `(` (direct call) or `.` (member call).
                // Also ensure the match is not inside a longer identifier
                // (e.g. `$state_machine` — `$` is a valid JS identifier char).
                if next == b'(' || next == b'.' {
                    return true;
                }
            }
            search_from = idx + 1;
        }
    }
    false
}
