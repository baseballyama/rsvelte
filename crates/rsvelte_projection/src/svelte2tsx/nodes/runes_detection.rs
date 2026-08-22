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
pub fn detect_runes_mode(ast: &Root) -> bool {
    // Check svelte:options for explicit runes setting
    if let Some(ref options) = ast.options
        && let Some(runes) = options.runes
    {
        return runes;
    }

    // Don't default to runes mode; let process_instance_script detect rune usage
    false
}

pub struct TemplateRunesDetector {
    flags: DetectionFlags,
}

#[derive(Clone, Copy, Default)]
struct DetectionFlags(u8);

impl DetectionFlags {
    const CHECK_AWAIT: u8 = 1;
    const CHECK_RUNE_GLOBAL: u8 = 1 << 1;
    const HAS_AWAIT: u8 = 1 << 2;
    const HAS_RUNE_GLOBAL: u8 = 1 << 3;

    const fn contains(self, flag: u8) -> bool {
        self.0 & flag != 0
    }
    const fn mark(&mut self, flag: u8) {
        self.0 |= flag;
    }
}

impl TemplateRunesDetector {
    pub(crate) fn new(
        check_await: bool,
        check_rune_global: bool,
        instance_value_names: &std::collections::HashSet<String>,
    ) -> Self {
        if check_rune_global {
            SHADOWED_RUNE_BASES.with(|set| {
                let mut set = set.borrow_mut();
                set.clear();
                for base in ["state", "derived", "effect"] {
                    if instance_value_names.contains(base) {
                        set.insert(base.to_string());
                    }
                }
            });
        }
        Self {
            flags: DetectionFlags(u8::from(check_await) | (u8::from(check_rune_global) << 1)),
        }
    }

    #[inline]
    pub(crate) fn observe(
        &mut self,
        node: &crate::ast::template::TemplateNode,
        source: &str,
        arena: &crate::ast::arena::ParseArena,
    ) {
        if self.flags.contains(DetectionFlags::CHECK_AWAIT)
            && !self.flags.contains(DetectionFlags::HAS_AWAIT)
            && template_node_has_await(node, source, arena)
        {
            self.flags.mark(DetectionFlags::HAS_AWAIT);
        }
        if self.flags.contains(DetectionFlags::CHECK_RUNE_GLOBAL)
            && !self.flags.contains(DetectionFlags::HAS_RUNE_GLOBAL)
            && template_node_has_rune_global(node, source, arena)
        {
            self.flags.mark(DetectionFlags::HAS_RUNE_GLOBAL);
        }
    }

    pub(crate) const fn uses_runes(&self) -> bool {
        self.flags
            .contains(DetectionFlags::HAS_AWAIT | DetectionFlags::HAS_RUNE_GLOBAL)
    }

    /// A top-level `await` in a template expression. Upstream sets its
    /// `isRunes` from this WITHOUT the Svelte-5 gate that covers rune globals,
    /// so the two halves have to stay separable.
    pub(crate) const fn has_template_await(&self) -> bool {
        self.flags.contains(DetectionFlags::HAS_AWAIT)
    }
}

impl Drop for TemplateRunesDetector {
    fn drop(&mut self) {
        if self.flags.contains(DetectionFlags::CHECK_RUNE_GLOBAL) {
            SHADOWED_RUNE_BASES.with(|set| set.borrow_mut().clear());
        }
    }
}

fn template_node_has_await(
    node: &crate::ast::template::TemplateNode,
    source: &str,
    arena: &crate::ast::arena::ParseArena,
) -> bool {
    use crate::ast::template::TemplateNode;

    match node {
        // The key check: ExpressionTag with an AwaitExpression.
        TemplateNode::ExpressionTag(tag) => expression_is_await(&tag.expression, source, arena),
        TemplateNode::RegularElement(elem) => elem
            .attributes
            .iter()
            .any(|attr| attr_has_await(attr, source, arena)),
        TemplateNode::Component(comp) => comp
            .attributes
            .iter()
            .any(|attr| attr_has_await(attr, source, arena)),
        TemplateNode::SvelteComponent(comp) => comp
            .attributes
            .iter()
            .any(|attr| attr_has_await(attr, source, arena)),
        TemplateNode::IfBlock(block) => expression_is_await(&block.test, source, arena),
        TemplateNode::EachBlock(block) => expression_is_await(&block.expression, source, arena),
        TemplateNode::KeyBlock(block) => expression_is_await(&block.expression, source, arena),
        TemplateNode::AwaitBlock(block) => expression_is_await(&block.expression, source, arena),
        TemplateNode::SvelteHead(elem)
        | TemplateNode::SvelteFragment(elem)
        | TemplateNode::SvelteBody(elem)
        | TemplateNode::SvelteWindow(elem)
        | TemplateNode::SvelteDocument(elem)
        | TemplateNode::SvelteBoundary(elem)
        | TemplateNode::SvelteOptions(elem)
        | TemplateNode::SvelteSelf(elem) => elem
            .attributes
            .iter()
            .any(|attr| attr_has_await(attr, source, arena)),
        TemplateNode::SvelteElement(elem) => elem
            .attributes
            .iter()
            .any(|attr| attr_has_await(attr, source, arena)),
        TemplateNode::TitleElement(elem) => elem
            .attributes
            .iter()
            .any(|attr| attr_has_await(attr, source, arena)),
        TemplateNode::SlotElement(elem) => elem
            .attributes
            .iter()
            .any(|attr| attr_has_await(attr, source, arena)),
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

/// Check if an attribute value contains an await expression in any `ExpressionTag` part.
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

/// Check if an Expression node is (or begins with) an `AwaitExpression`.
///
/// For `Typed` expressions, checks the top-level `JsNode` variant.
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
        TemplateNode::RegularElement(elem) => elem
            .attributes
            .iter()
            .any(|attr| attr_has_rune_global(attr, source, arena)),
        TemplateNode::Component(comp) => comp
            .attributes
            .iter()
            .any(|attr| attr_has_rune_global(attr, source, arena)),
        TemplateNode::SvelteComponent(comp) => comp
            .attributes
            .iter()
            .any(|attr| attr_has_rune_global(attr, source, arena)),
        TemplateNode::IfBlock(block) => {
            expression_references_rune_global(&block.test, source, arena)
        }
        TemplateNode::EachBlock(block) => {
            expression_references_rune_global(&block.expression, source, arena)
        }
        TemplateNode::KeyBlock(block) => {
            expression_references_rune_global(&block.expression, source, arena)
        }
        TemplateNode::AwaitBlock(block) => {
            expression_references_rune_global(&block.expression, source, arena)
        }
        TemplateNode::SvelteHead(elem)
        | TemplateNode::SvelteFragment(elem)
        | TemplateNode::SvelteBody(elem)
        | TemplateNode::SvelteWindow(elem)
        | TemplateNode::SvelteDocument(elem)
        | TemplateNode::SvelteBoundary(elem)
        | TemplateNode::SvelteOptions(elem)
        | TemplateNode::SvelteSelf(elem) => elem
            .attributes
            .iter()
            .any(|attr| attr_has_rune_global(attr, source, arena)),
        TemplateNode::SvelteElement(elem) => elem
            .attributes
            .iter()
            .any(|attr| attr_has_rune_global(attr, source, arena)),
        TemplateNode::TitleElement(elem) => elem
            .attributes
            .iter()
            .any(|attr| attr_has_rune_global(attr, source, arena)),
        TemplateNode::SlotElement(elem) => elem
            .attributes
            .iter()
            .any(|attr| attr_has_rune_global(attr, source, arena)),
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
/// For `Typed` expressions, walks the `JsNode` tree stored in the parse arena.
/// For `Lazy` expressions (raw source spans), scans the source text.
/// For `Value` (JSON) expressions, inspects the JSON AST.
///
/// The walk is deliberately shallow-but-sufficient: it recurses into the callee
/// of a `CallExpression` and the object of a `MemberExpression` (the two patterns
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
///   - `$state(x)`                     → `CallExpression` callee = Identifier "$state"
///   - `$state.eager(x)`               → `CallExpression` callee = `MemberExpression` { object = Identifier "$state" }
///   - `$effect.pre(() => …)`          → same
///   - `foo($state(x))`                → arguments contain a rune `CallExpression`
///   - `a === '/' ? $state(x) : null`  → `ConditionalExpression` branches
///   - `() => $effect(() => {})`       → `ArrowFunctionExpression` body
///   - `{@attach $effect(() => {})}`   → `ArrowFunctionExpression` body in `AttachTag`
///   - `[..., $state(x)]`              → `ArrayExpression` element
///   - `{ k: $derived(v) }`            → `ObjectExpression` property value
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
        JsNode::FunctionExpression { body, .. } => body.is_some_and(|b| {
            let body_node = arena.get_js_node(b);
            js_node_references_rune_global(body_node, arena)
        }),

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
        JsNode::AwaitExpression { argument, .. }

        // UnaryExpression: recurse into argument (e.g. `!$state(x)`).
        | JsNode::UnaryExpression { argument, .. } => {
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
        JsNode::VariableDeclarator { init, .. } => {
            init.is_some_and(|i| js_node_references_rune_global(arena.get_js_node(i), arena))
        }

        // ReturnStatement / IfStatement bodies can also host rune calls.
        JsNode::ReturnStatement { argument, .. } => {
            argument.is_some_and(|a| js_node_references_rune_global(arena.get_js_node(a), arena))
        }

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
