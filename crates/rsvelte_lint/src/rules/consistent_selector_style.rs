//! `svelte/consistent-selector-style` — enforce a consistent style for CSS
//! selectors (class vs id vs type) inside Svelte `<style>` blocks.
//!
//! The rule collects element type, class, and id usage from the template, then
//! checks each CSS selector to see whether a more-preferred selector type could
//! have been used instead (according to the `style` option priority list).
//!
//! Options (object, all optional):
//! - `style` (`("class"|"id"|"type")[]`, default `["type","id","class"]`):
//!   priority order of preferred selector kinds. The first entry wins.
//! - `checkGlobal` (bool, default `false`): whether to check inside
//!   `:global(…)` pseudo-classes.
//!
//! Port of `eslint-plugin-svelte/src/rules/consistent-selector-style.ts`.
//! Upstream: `meta.type = 'suggestion'`, not fixable.

use std::collections::HashMap;

use rsvelte_core::ast::css::StyleSheet;
use rsvelte_core::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, Fragment, Root, TemplateNode,
};
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/consistent-selector-style",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "enforce a consistent style for CSS selectors",
    options_schema: Some(
        r#"[{"type":"object","properties":{
            "checkGlobal":{"type":"boolean"},
            "style":{"type":"array","items":{"enum":["class","id","type"]},"maxItems":3,"uniqueItems":true}
        },"additionalProperties":false}]"#,
    ),
};

// ---------------------------------------------------------------------------
// Element occurrence count
// ---------------------------------------------------------------------------

/// Whether a template element can appear zero-to-infinite times (e.g. inside
/// `{#each}` or a `{#snippet}`), or at most once / conditionally.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum OccCount {
    /// Appears exactly once (or a fixed count) — can use an ID selector.
    Finite,
    /// May appear any number of times — cannot use an ID selector.
    ZeroToInf,
}

// ---------------------------------------------------------------------------
// Affix: optional string prefix / suffix for dynamic class or id attributes
// ---------------------------------------------------------------------------

/// Characterise a dynamic attribute value for class/id matching.
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
enum Affix {
    /// Both prefix and suffix are unknown → treat as universal selector.
    Universal,
    /// At least one of prefix or suffix is known.
    Known {
        prefix: Option<String>,
        suffix: Option<String>,
    },
}

// ---------------------------------------------------------------------------
// Template selections
// ---------------------------------------------------------------------------

/// An element, identified by its start offset.
type ElemId = u32;

/// Selections accumulated from the template for one selector kind (class / id).
#[derive(Debug, Default)]
struct Selections {
    /// Exact matches: name → [element ids].
    exact: HashMap<String, Vec<ElemId>>,
    /// Affix matches: (prefix, suffix) → [element ids].
    affixes: Vec<(Option<String>, Option<String>, Vec<ElemId>)>,
    /// True when a dynamic expression with unknown prefix AND suffix was found.
    universal_selector: bool,
}

impl Selections {
    /// Add an exact class/id name to an element.
    fn add_exact(&mut self, name: &str, elem: ElemId) {
        self.exact.entry(name.to_string()).or_default().push(elem);
    }

    /// Add an affix (prefix, suffix) match for an element.
    fn add_affix(&mut self, prefix: Option<String>, suffix: Option<String>, elem: ElemId) {
        for (p, s, elems) in &mut self.affixes {
            if *p == prefix && *s == suffix {
                elems.push(elem);
                return;
            }
        }
        self.affixes.push((prefix, suffix, vec![elem]));
    }

    /// Find all elements (with exact-match flag) whose class/id could match `key`.
    fn match_key(&self, key: &str) -> Vec<(ElemId, bool)> {
        let mut out: Vec<(ElemId, bool)> = self
            .exact
            .get(key)
            .map(|v| v.iter().map(|&e| (e, true)).collect())
            .unwrap_or_default();
        for (prefix, suffix, elems) in &self.affixes {
            let prefix_ok = prefix
                .as_deref()
                .map(|p| key.starts_with(p))
                .unwrap_or(true);
            let suffix_ok = suffix.as_deref().map(|s| key.ends_with(s)).unwrap_or(true);
            if prefix_ok && suffix_ok {
                out.extend(elems.iter().map(|&e| (e, false)));
            }
        }
        out
    }
}

/// Full set of selections accumulated from the template.
#[derive(Debug, Default)]
struct TemplateSelections {
    class: Selections,
    id: Selections,
    /// type → [element ids] (only exact/static type names).
    type_map: HashMap<String, Vec<ElemId>>,
    /// Element id → occurrence count (ZeroToInf or Finite).
    occ: HashMap<ElemId, OccCount>,
    /// Class names added by `class:name` directives — always whitelisted.
    whitelisted_classes: Vec<String>,
}

impl TemplateSelections {
    fn add_element_type(&mut self, tag: &str, elem: ElemId, occ: OccCount) {
        self.type_map.entry(tag.to_string()).or_default().push(elem);
        self.occ.insert(elem, occ);
    }

    fn elem_occ(&self, elem: ElemId) -> OccCount {
        self.occ.get(&elem).copied().unwrap_or(OccCount::Finite)
    }
}

// ---------------------------------------------------------------------------
// Template walk
// ---------------------------------------------------------------------------

/// Collect all element / class / id usages from the template.
fn collect_selections(root: &Root) -> TemplateSelections {
    let mut sel = TemplateSelections::default();
    walk_fragment(&root.fragment, OccCount::Finite, false, &mut sel);
    sel
}

fn walk_fragment(
    fragment: &Fragment,
    parent_occ: OccCount,
    in_component: bool,
    sel: &mut TemplateSelections,
) {
    for node in &fragment.nodes {
        walk_node(node, parent_occ, in_component, sel);
    }
}

fn walk_node(
    node: &TemplateNode,
    parent_occ: OccCount,
    in_component: bool,
    sel: &mut TemplateSelections,
) {
    match node {
        TemplateNode::RegularElement(el) => {
            // Determine this element's own occurrence count.
            let elem_occ = if in_component {
                // Inside a component's slot → ZeroToInf.
                OccCount::ZeroToInf
            } else {
                parent_occ
            };

            // Register the element type and its occurrence.
            sel.add_element_type(&el.name, el.start, elem_occ);

            // Process its attributes.
            process_attrs(&el.attributes, el.start, elem_occ, sel);

            // Recurse into the element's fragment.
            walk_fragment(&el.fragment, elem_occ, false, sel);
        }
        TemplateNode::Component(c) => {
            // Components are NOT added to the type / class / id maps
            // (upstream skips elements with kind !== 'html').
            // But we still need to walk their slot fragment as "in_component=true"
            // to record any HTML elements within them as ZeroToInf.
            walk_fragment(&c.fragment, OccCount::ZeroToInf, true, sel);
        }
        TemplateNode::IfBlock(b) => {
            // `{#if}` blocks make children ZeroOrOne, which is still Finite for our purposes.
            walk_fragment(&b.consequent, parent_occ, in_component, sel);
            if let Some(alt) = &b.alternate {
                walk_fragment(alt, parent_occ, in_component, sel);
            }
        }
        TemplateNode::EachBlock(b) => {
            // `{#each}` makes children ZeroToInf.
            walk_fragment(&b.body, OccCount::ZeroToInf, in_component, sel);
            if let Some(fb) = &b.fallback {
                walk_fragment(fb, parent_occ, in_component, sel);
            }
        }
        TemplateNode::AwaitBlock(b) => {
            if let Some(f) = &b.pending {
                walk_fragment(f, parent_occ, in_component, sel);
            }
            if let Some(f) = &b.then {
                walk_fragment(f, parent_occ, in_component, sel);
            }
            if let Some(f) = &b.catch {
                walk_fragment(f, parent_occ, in_component, sel);
            }
        }
        TemplateNode::KeyBlock(b) => {
            walk_fragment(&b.fragment, parent_occ, in_component, sel);
        }
        TemplateNode::SnippetBlock(b) => {
            // Snippets can be called multiple times → ZeroToInf.
            walk_fragment(&b.body, OccCount::ZeroToInf, in_component, sel);
        }
        TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteBody(el)
        | TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteOptions(el)
        | TemplateNode::SvelteSelf(el)
        | TemplateNode::SvelteWindow(el) => {
            walk_fragment(&el.fragment, parent_occ, in_component, sel);
        }
        TemplateNode::SvelteComponent(c) => {
            walk_fragment(&c.fragment, OccCount::ZeroToInf, true, sel);
        }
        TemplateNode::SvelteElement(e) => {
            walk_fragment(&e.fragment, parent_occ, in_component, sel);
        }
        TemplateNode::TitleElement(t) => {
            walk_fragment(&t.fragment, parent_occ, in_component, sel);
        }
        _ => {}
    }
}

/// Process the attributes of a `RegularElement` to populate class/id selections.
fn process_attrs(
    attrs: &[Attribute],
    elem: ElemId,
    elem_occ: OccCount,
    sel: &mut TemplateSelections,
) {
    for attr in attrs {
        match attr {
            Attribute::ClassDirective(d) => {
                // `class:name={expr}` → whitelist this class name.
                sel.whitelisted_classes.push(d.name.to_string());
            }
            Attribute::Attribute(node) if node.name == "class" => {
                process_class_value(&node.value, elem, sel);
            }
            Attribute::Attribute(node) if node.name == "id" => {
                process_id_value(&node.value, elem, elem_occ, sel);
            }
            _ => {}
        }
    }
}

/// Process the value of `class="..."` or `class={expr}` etc.
fn process_class_value(value: &AttributeValue, elem: ElemId, sel: &mut TemplateSelections) {
    match value {
        AttributeValue::Sequence(parts) => {
            // Collect leading text (potential prefix) and trailing text (suffix)
            // around any expression part. If there are multiple text or expression
            // parts, handle them conservatively.
            let mut has_expr = false;
            let mut prefix_text: Option<String> = None;
            let mut suffix_text: Option<String> = None;
            let mut pure_texts: Vec<String> = Vec::new();

            for part in parts {
                match part {
                    AttributeValuePart::Text(t) => {
                        if !has_expr {
                            // Text before any expression → static class names OR prefix.
                            pure_texts.push(t.data.to_string());
                            prefix_text = Some(t.data.to_string());
                        } else {
                            // Text after an expression → suffix.
                            suffix_text = Some(t.data.to_string());
                        }
                    }
                    AttributeValuePart::ExpressionTag(_) => {
                        has_expr = true;
                    }
                }
            }

            if !has_expr {
                // Pure static text: split on whitespace to get class names.
                for text in &pure_texts {
                    for name in text.split_whitespace() {
                        if !name.is_empty() {
                            sel.class.add_exact(name, elem);
                        }
                    }
                }
            } else {
                // Mixed: expression with optional prefix/suffix text.
                let pfx = prefix_text
                    .as_deref()
                    .map(|t| t.trim())
                    .filter(|s| !s.is_empty())
                    .map(str::to_string);
                let sfx = suffix_text
                    .as_deref()
                    .map(|t| t.trim())
                    .filter(|s| !s.is_empty())
                    .map(str::to_string);
                match (pfx, sfx) {
                    (None, None) => sel.class.universal_selector = true,
                    (p, s) => sel.class.add_affix(p, s, elem),
                }
            }
        }
        AttributeValue::Expression(et) => {
            // `class={expr}` — analyse the expression.
            let affix = extract_affix(et.expression.as_json());
            match affix {
                Affix::Universal => sel.class.universal_selector = true,
                Affix::Known { prefix, suffix } => sel.class.add_affix(prefix, suffix, elem),
            }
        }
        AttributeValue::True(_) => {}
    }
}

/// Process the value of `id="..."` or `id={expr}` etc.
fn process_id_value(
    value: &AttributeValue,
    elem: ElemId,
    elem_occ: OccCount,
    sel: &mut TemplateSelections,
) {
    match value {
        AttributeValue::Sequence(parts) => {
            let mut has_expr = false;
            let mut prefix_text: Option<String> = None;
            let mut suffix_text: Option<String> = None;
            let mut text_val: Option<String> = None;

            for part in parts {
                match part {
                    AttributeValuePart::Text(t) => {
                        if !has_expr {
                            text_val = Some(t.data.to_string());
                            prefix_text = Some(t.data.to_string());
                        } else {
                            suffix_text = Some(t.data.to_string());
                        }
                    }
                    AttributeValuePart::ExpressionTag(_) => {
                        has_expr = true;
                    }
                }
            }

            if !has_expr {
                // Static id value.
                if let Some(id_val) = text_val {
                    let id_val = id_val.trim();
                    if !id_val.is_empty() {
                        sel.id.add_exact(id_val, elem);
                        sel.occ.insert(elem, elem_occ);
                    }
                }
            } else {
                let pfx = prefix_text
                    .as_deref()
                    .map(|t| t.trim())
                    .filter(|s| !s.is_empty())
                    .map(str::to_string);
                let sfx = suffix_text
                    .as_deref()
                    .map(|t| t.trim())
                    .filter(|s| !s.is_empty())
                    .map(str::to_string);
                match (pfx, sfx) {
                    (None, None) => sel.id.universal_selector = true,
                    (p, s) => {
                        sel.id.add_affix(p, s, elem);
                        sel.occ.insert(elem, elem_occ);
                    }
                }
            }
        }
        AttributeValue::Expression(et) => {
            let affix = extract_affix(et.expression.as_json());
            match affix {
                Affix::Universal => sel.id.universal_selector = true,
                Affix::Known { prefix, suffix } => {
                    sel.id.add_affix(prefix, suffix, elem);
                    sel.occ.insert(elem, elem_occ);
                }
            }
        }
        AttributeValue::True(_) => {}
    }
}

// ---------------------------------------------------------------------------
// Expression affix extraction
// ---------------------------------------------------------------------------

/// Extract prefix/suffix literals from a JS expression JSON node.
/// Returns `Affix::Universal` when both are unknown (null).
fn extract_affix(expr: &Value) -> Affix {
    let prefix = extract_prefix_literal(expr);
    let suffix = extract_suffix_literal(expr);
    match (prefix, suffix) {
        (None, None) => Affix::Universal,
        (p, s) => Affix::Known {
            prefix: p,
            suffix: s,
        },
    }
}

/// Extract the leading string literal from an expression (recursive).
/// - `BinaryExpression`: recurse into left.
/// - `TemplateLiteral`: first non-empty quasi is prefix.
/// - `Literal(string)`: the literal itself.
/// - `Identifier`: unknown → None.
fn extract_prefix_literal(expr: &Value) -> Option<String> {
    let ty = expr.get("type").and_then(Value::as_str)?;
    match ty {
        "BinaryExpression" => {
            let left = expr.get("left")?;
            extract_prefix_literal(left)
        }
        "TemplateLiteral" => {
            // Quasis and expressions interleaved by index.
            let quasis = expr
                .get("quasis")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();
            let exprs = expr
                .get("expressions")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();

            // Build sorted list of all parts by their start position.
            let quasis_refs: Vec<_> = quasis.iter().collect();
            let exprs_refs: Vec<_> = exprs.iter().collect();
            let mut all: Vec<(u32, &Value)> = Vec::new();
            for q in &quasis_refs {
                let start = q.get("start").and_then(Value::as_u64).unwrap_or(0) as u32;
                all.push((start, q));
            }
            for e in &exprs_refs {
                let start = e.get("start").and_then(Value::as_u64).unwrap_or(0) as u32;
                all.push((start, e));
            }
            all.sort_by_key(|(s, _)| *s);
            for (_, part) in &all {
                let part_ty = part.get("type").and_then(Value::as_str).unwrap_or("");
                if part_ty == "TemplateElement" {
                    let raw = part
                        .get("value")
                        .and_then(|v| v.get("raw"))
                        .and_then(Value::as_str)
                        .unwrap_or("");
                    if raw.is_empty() {
                        continue; // skip leading empty quasi
                    }
                    return Some(raw.to_string());
                } else {
                    // Expression part: recurse.
                    return extract_prefix_literal(part);
                }
            }
            None
        }
        "Literal" => {
            let v = expr.get("value")?;
            v.as_str().map(|s| s.to_string())
        }
        _ => None,
    }
}

/// Extract the trailing string literal from an expression (recursive).
fn extract_suffix_literal(expr: &Value) -> Option<String> {
    let ty = expr.get("type").and_then(Value::as_str)?;
    match ty {
        "BinaryExpression" => {
            let right = expr.get("right")?;
            extract_suffix_literal(right)
        }
        "TemplateLiteral" => {
            let quasis = expr
                .get("quasis")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();
            let exprs = expr
                .get("expressions")
                .and_then(Value::as_array)
                .cloned()
                .unwrap_or_default();

            let quasis_refs: Vec<_> = quasis.iter().collect();
            let exprs_refs: Vec<_> = exprs.iter().collect();
            let mut all: Vec<(u32, &Value)> = Vec::new();
            for q in &quasis_refs {
                let start = q.get("start").and_then(Value::as_u64).unwrap_or(0) as u32;
                all.push((start, q));
            }
            for e in &exprs_refs {
                let start = e.get("start").and_then(Value::as_u64).unwrap_or(0) as u32;
                all.push((start, e));
            }
            all.sort_by_key(|(s, _)| *s);

            // Reverse to find trailing.
            for (_, part) in all.iter().rev() {
                let part_ty = part.get("type").and_then(Value::as_str).unwrap_or("");
                if part_ty == "TemplateElement" {
                    let raw = part
                        .get("value")
                        .and_then(|v| v.get("raw"))
                        .and_then(Value::as_str)
                        .unwrap_or("");
                    if raw.is_empty() {
                        continue;
                    }
                    return Some(raw.to_string());
                } else {
                    return extract_suffix_literal(part);
                }
            }
            None
        }
        "Literal" => {
            let v = expr.get("value")?;
            v.as_str().map(|s| s.to_string())
        }
        _ => None,
    }
}

// ---------------------------------------------------------------------------
// CSS walk and selector checking
// ---------------------------------------------------------------------------

/// Check whether an ID selector can be used: no elements (empty match), or
/// exactly one element that is not in a ZeroToInf context.
fn can_use_id_selector(selection: &[(ElemId, bool)], sel: &TemplateSelections) -> bool {
    if selection.is_empty() {
        return true;
    }
    if selection.len() == 1 {
        let (elem, _) = selection[0];
        return sel.elem_occ(elem) != OccCount::ZeroToInf;
    }
    false
}

/// Check whether a type selector could replace the selector:
/// - all matched elements have the same tag type
/// - no affix-matched element is in a ZeroToInf context
/// - the set of matched elements equals the full set of that tag type in the template
fn can_use_type_selector(
    selection: &[(ElemId, bool)],
    type_map: &HashMap<String, Vec<ElemId>>,
    occ: &HashMap<ElemId, OccCount>,
) -> bool {
    if selection.is_empty() {
        return true;
    }
    // Collect unique types from the selection (using the type_map to find the
    // tag name for each element id).
    let mut types: Vec<String> = Vec::new();
    for (elem, _) in selection {
        for (tag, elems) in type_map {
            if elems.contains(elem) && !types.contains(tag) {
                types.push(tag.clone());
            }
        }
    }
    if types.len() > 1 {
        return false;
    }
    // Check: no affix-matched element with ZeroToInf occurrence.
    for (elem, exact) in selection {
        if !exact && occ.get(elem).copied() == Some(OccCount::ZeroToInf) {
            return false;
        }
    }
    if types.is_empty() {
        return true; // no elements with this tag in template
    }
    let tag = &types[0];
    let type_elems = match type_map.get(tag.as_str()) {
        Some(e) => e,
        None => return false,
    };
    // Selection elements must be exactly the set of type elements.
    let sel_elems: Vec<ElemId> = selection.iter().map(|(e, _)| *e).collect();
    if type_elems.len() != sel_elems.len() {
        return false;
    }
    type_elems.iter().all(|e| sel_elems.contains(e))
}

/// Walk the CSS stylesheet and check each ClassSelector, IdSelector,
/// TypeSelector for consistency.
fn check_stylesheet(
    css: &StyleSheet,
    sel: &TemplateSelections,
    style: &[&str],
    check_global: bool,
    ctx: &mut LintContext,
) {
    for child in &css.children {
        check_css_node(child, sel, style, check_global, ctx, false);
    }
}

fn check_css_node(
    node: &Value,
    sel: &TemplateSelections,
    style: &[&str],
    check_global: bool,
    ctx: &mut LintContext,
    in_global: bool,
) {
    // When not checking global content and we're already inside a :global block,
    // skip entirely.
    if in_global && !check_global {
        return;
    }

    let ty = node.get("type").and_then(Value::as_str).unwrap_or("");
    match ty {
        "Rule" => {
            // Check if this is a bare `:global` rule (`:global { … }`).
            let rule_is_global = is_bare_global_rule(node);
            if let Some(prelude) = node.get("prelude") {
                check_selector_node(prelude, sel, style, check_global, ctx, in_global);
            }
            // Recurse into nested rules in the block.
            if let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(Value::as_array)
            {
                for child in children {
                    check_css_node(
                        child,
                        sel,
                        style,
                        check_global,
                        ctx,
                        in_global || rule_is_global,
                    );
                }
            }
        }
        "Atrule" => {
            if let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(Value::as_array)
            {
                for child in children {
                    check_css_node(child, sel, style, check_global, ctx, in_global);
                }
            }
        }
        _ => {}
    }
}

/// True if a Rule's selector is bare `:global` (not `:global(...)`).
fn is_bare_global_rule(node: &Value) -> bool {
    // A bare `:global { … }` rule has prelude = SelectorList > ComplexSelector
    // > RelativeSelector > selectors=[PseudoClassSelector(name="global", args=null)]
    let prelude = match node.get("prelude") {
        Some(p) => p,
        None => return false,
    };
    if prelude.get("type").and_then(Value::as_str) != Some("SelectorList") {
        return false;
    }
    let children = match prelude.get("children").and_then(Value::as_array) {
        Some(c) => c,
        None => return false,
    };
    if children.len() != 1 {
        return false;
    }
    let complex = &children[0];
    let rel_children = match complex.get("children").and_then(Value::as_array) {
        Some(c) => c,
        None => return false,
    };
    if rel_children.len() != 1 {
        return false;
    }
    let rel = &rel_children[0];
    let sels = match rel.get("selectors").and_then(Value::as_array) {
        Some(s) => s,
        None => return false,
    };
    if sels.len() != 1 {
        return false;
    }
    let first = &sels[0];
    first.get("type").and_then(Value::as_str) == Some("PseudoClassSelector")
        && first.get("name").and_then(Value::as_str) == Some("global")
        && first.get("args").is_none()
}

#[allow(clippy::only_used_in_recursion)]
fn check_selector_node(
    node: &Value,
    sel: &TemplateSelections,
    style: &[&str],
    check_global: bool,
    ctx: &mut LintContext,
    in_global: bool,
) {
    let ty = node.get("type").and_then(Value::as_str).unwrap_or("");
    match ty {
        "SelectorList" | "ComplexSelector" => {
            if let Some(children) = node.get("children").and_then(Value::as_array) {
                for child in children {
                    check_selector_node(child, sel, style, check_global, ctx, in_global);
                }
            }
        }
        "RelativeSelector" => {
            if let Some(selectors) = node.get("selectors").and_then(Value::as_array) {
                for s in selectors {
                    check_selector_node(s, sel, style, check_global, ctx, in_global);
                }
            }
        }
        "ClassSelector" => {
            check_class_selector(node, sel, style, ctx);
        }
        "IdSelector" => {
            check_id_selector(node, sel, style, ctx);
        }
        "TypeSelector" => {
            check_type_selector(node, sel, style, ctx);
        }
        "PseudoClassSelector" => {
            let name = node.get("name").and_then(Value::as_str).unwrap_or("");
            let is_global_pseudo = name == "global";
            if is_global_pseudo && !check_global {
                // Skip :global pseudo-class content unless checkGlobal is true.
                return;
            }
            if let Some(args) = node.get("args") {
                check_selector_node(
                    args,
                    sel,
                    style,
                    check_global,
                    ctx,
                    in_global || is_global_pseudo,
                );
            }
        }
        _ => {}
    }
}

fn check_class_selector(
    node: &Value,
    sel: &TemplateSelections,
    style: &[&str],
    ctx: &mut LintContext,
) {
    if sel.class.universal_selector {
        return;
    }
    let name = match node.get("name").and_then(Value::as_str) {
        Some(n) => n,
        None => return,
    };
    if sel.whitelisted_classes.iter().any(|w| w == name) {
        return;
    }
    let start = node.get("start").and_then(Value::as_u64).unwrap_or(0) as u32;
    let end = node.get("end").and_then(Value::as_u64).unwrap_or(0) as u32;

    let selection = sel.class.match_key(name);
    for style_val in style {
        match *style_val {
            "class" => return, // class selector is the preferred style
            "id" if can_use_id_selector(&selection, sel) => {
                ctx.report(start, end, "Selector should select by ID instead of class");
                return;
            }
            "type" if can_use_type_selector(&selection, &sel.type_map, &sel.occ) => {
                ctx.report(
                    start,
                    end,
                    "Selector should select by element type instead of class",
                );
                return;
            }
            _ => {}
        }
    }
}

fn check_id_selector(
    node: &Value,
    sel: &TemplateSelections,
    style: &[&str],
    ctx: &mut LintContext,
) {
    if sel.id.universal_selector {
        return;
    }
    let name = match node.get("name").and_then(Value::as_str) {
        Some(n) => n,
        None => return,
    };
    let start = node.get("start").and_then(Value::as_u64).unwrap_or(0) as u32;
    let end = node.get("end").and_then(Value::as_u64).unwrap_or(0) as u32;

    let selection = sel.id.match_key(name);
    for style_val in style {
        match *style_val {
            "class" => {
                ctx.report(start, end, "Selector should select by class instead of ID");
                return;
            }
            "id" => return, // id is the preferred style
            "type" if can_use_type_selector(&selection, &sel.type_map, &sel.occ) => {
                ctx.report(
                    start,
                    end,
                    "Selector should select by element type instead of ID",
                );
                return;
            }
            _ => {}
        }
    }
}

fn check_type_selector(
    node: &Value,
    sel: &TemplateSelections,
    style: &[&str],
    ctx: &mut LintContext,
) {
    let name = match node.get("name").and_then(Value::as_str) {
        Some(n) => n,
        None => return,
    };
    let start = node.get("start").and_then(Value::as_u64).unwrap_or(0) as u32;
    let end = node.get("end").and_then(Value::as_u64).unwrap_or(0) as u32;

    let selection: Vec<ElemId> = sel.type_map.get(name).cloned().unwrap_or_default();
    // Convert to selection with exact=true (type selectors are always exact).
    let selection_with_exact: Vec<(ElemId, bool)> = selection.iter().map(|&e| (e, true)).collect();

    for style_val in style {
        match *style_val {
            "class" => {
                ctx.report(
                    start,
                    end,
                    "Selector should select by class instead of element type",
                );
                return;
            }
            "id" if can_use_id_selector(&selection_with_exact, sel) => {
                ctx.report(
                    start,
                    end,
                    "Selector should select by ID instead of element type",
                );
                return;
            }
            "type" => return, // type is the preferred style
            _ => {}
        }
    }
}

// ---------------------------------------------------------------------------
// CSS lang check (skip for non-plain CSS)
// ---------------------------------------------------------------------------

fn has_unknown_lang(css: &StyleSheet) -> bool {
    for attr in &css.attributes {
        if attr.get("name").and_then(Value::as_str) == Some("lang") {
            let val = attr.get("value");
            if val.and_then(Value::as_bool).unwrap_or(false) {
                return false;
            }
            if let Some(seq) = val.and_then(Value::as_array) {
                for part in seq {
                    if part.get("type").and_then(Value::as_str) == Some("Text")
                        && let Some(data) = part.get("data").and_then(Value::as_str)
                    {
                        let lang = data.to_lowercase();
                        return !matches!(lang.as_str(), "" | "css");
                    }
                }
            }
            return true;
        }
    }
    false
}

// ---------------------------------------------------------------------------
// Rule implementation
// ---------------------------------------------------------------------------

#[derive(Default)]
pub struct ConsistentSelectorStyle;

impl Rule for ConsistentSelectorStyle {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        // Parse options.
        let opts = ctx.option0();
        let check_global = opts
            .and_then(|o| o.get("checkGlobal"))
            .and_then(Value::as_bool)
            .unwrap_or(false);
        let style_vec: Vec<String> = opts
            .and_then(|o| o.get("style"))
            .and_then(Value::as_array)
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(str::to_string))
                    .collect()
            })
            .unwrap_or_else(|| vec!["type".into(), "id".into(), "class".into()]);
        let style: Vec<&str> = style_vec.iter().map(|s| s.as_str()).collect();

        // No CSS → nothing to check.
        let css = match root.css.as_deref() {
            Some(c) => c,
            None => return,
        };
        if has_unknown_lang(css) {
            return;
        }

        // Collect template selections.
        let sel = collect_selections(root);

        // Check CSS selectors.
        check_stylesheet(css, &sel, &style, check_global, ctx);
    }
}
