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
use crate::rules::js_static::ScriptVars;
use crate::rules::scss_selector::{
    ScssSelector, SelectorKind, extract_selectors, is_plain_css_lang, scss_lang,
};

/// Consume a CSS hex escape, returning the code point and how many characters
/// after the backslash it spans. Mirrors `postcss-selector-parser`'s `gobbleHex`.
fn gobble_hex(chars: &[char]) -> Option<(char, usize)> {
    let mut hex = String::new();
    let mut space_terminated = false;
    for &c in chars.iter().take(6) {
        space_terminated = c == ' ';
        if !c.is_ascii_hexdigit() {
            break;
        }
        hex.push(c);
    }
    if hex.is_empty() {
        return None;
    }
    let code = u32::from_str_radix(&hex, 16).ok()?;
    let ch = if code == 0 {
        char::REPLACEMENT_CHARACTER
    } else {
        char::from_u32(code).unwrap_or(char::REPLACEMENT_CHARACTER)
    };
    Some((ch, hex.len() + usize::from(space_terminated)))
}

/// `postcss-selector-parser` exposes the UNESCAPED identifier as a selector
/// node's `value`, while rsvelte's CSS parser keeps the raw source slice.
pub(crate) fn unescape_css_identifier(s: &str) -> std::borrow::Cow<'_, str> {
    if !s.contains('\\') {
        return std::borrow::Cow::Borrowed(s);
    }
    let chars: Vec<char> = s.chars().collect();
    let mut out = String::with_capacity(s.len());
    let mut i = 0;
    while i < chars.len() {
        if chars[i] != '\\' {
            out.push(chars[i]);
            i += 1;
            continue;
        }
        let window_end = (i + 7).min(chars.len());
        if let Some((c, consumed)) = gobble_hex(&chars[i + 1..window_end]) {
            out.push(c);
            i += 1 + consumed;
        } else if chars.get(i + 1) == Some(&'\\') {
            out.push('\\');
            i += 2;
        } else {
            if i + 1 == chars.len() {
                out.push('\\');
            }
            i += 1;
        }
    }
    std::borrow::Cow::Owned(out)
}

fn json_offset(node: &Value, field: &str) -> u32 {
    node.get(field)
        .and_then(Value::as_u64)
        .and_then(|offset| u32::try_from(offset).ok())
        .unwrap_or(0)
}

static META: RuleMeta = RuleMeta {
    name: "svelte/consistent-selector-style",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Off,
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
            let prefix_ok = prefix.as_deref().is_none_or(|p| key.starts_with(p));
            let suffix_ok = suffix.as_deref().is_none_or(|s| key.ends_with(s));
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
    /// Element id → occurrence count (`ZeroToInf` or Finite).
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
fn collect_selections(root: &Root, vars: &ScriptVars) -> TemplateSelections {
    let mut sel = TemplateSelections::default();
    walk_fragment(&root.fragment, OccCount::Finite, false, &mut sel, vars);
    sel
}

fn walk_fragment(
    fragment: &Fragment,
    parent_occ: OccCount,
    in_component: bool,
    sel: &mut TemplateSelections,
    vars: &ScriptVars,
) {
    for node in &fragment.nodes {
        walk_node(node, parent_occ, in_component, sel, vars);
    }
}

fn walk_node(
    node: &TemplateNode,
    parent_occ: OccCount,
    in_component: bool,
    sel: &mut TemplateSelections,
    vars: &ScriptVars,
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
            process_attrs(&el.attributes, el.start, elem_occ, sel, vars);

            // Recurse into the element's fragment.
            walk_fragment(&el.fragment, elem_occ, false, sel, vars);
        }
        TemplateNode::Component(c) => {
            // Components are NOT added to the type / class / id maps
            // (upstream skips elements with kind !== 'html').
            // But we still need to walk their slot fragment as "in_component=true"
            // to record any HTML elements within them as ZeroToInf.
            walk_fragment(&c.fragment, OccCount::ZeroToInf, true, sel, vars);
        }
        TemplateNode::IfBlock(b) => {
            // `{#if}` blocks make children ZeroOrOne, which is still Finite for our purposes.
            walk_fragment(&b.consequent, parent_occ, in_component, sel, vars);
            if let Some(alt) = &b.alternate {
                walk_fragment(alt, parent_occ, in_component, sel, vars);
            }
        }
        TemplateNode::EachBlock(b) => {
            // `{#each}` makes children ZeroToInf.
            walk_fragment(&b.body, OccCount::ZeroToInf, in_component, sel, vars);
            if let Some(fb) = &b.fallback {
                // The `{:else}` fragment's parent chain still runs through the
                // each block, so its elements are `ZeroToInf` too.
                walk_fragment(fb, OccCount::ZeroToInf, in_component, sel, vars);
            }
        }
        TemplateNode::AwaitBlock(b) => {
            if let Some(f) = &b.pending {
                walk_fragment(f, parent_occ, in_component, sel, vars);
            }
            if let Some(f) = &b.then {
                walk_fragment(f, parent_occ, in_component, sel, vars);
            }
            if let Some(f) = &b.catch {
                walk_fragment(f, parent_occ, in_component, sel, vars);
            }
        }
        TemplateNode::KeyBlock(b) => {
            walk_fragment(&b.fragment, parent_occ, in_component, sel, vars);
        }
        TemplateNode::SnippetBlock(b) => {
            // Snippets can be called multiple times → ZeroToInf.
            walk_fragment(&b.body, OccCount::ZeroToInf, in_component, sel, vars);
        }
        TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteBody(el)
        | TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteOptions(el)
        | TemplateNode::SvelteSelf(el)
        | TemplateNode::SvelteWindow(el) => {
            walk_fragment(&el.fragment, parent_occ, in_component, sel, vars);
        }
        // `<svelte:component>` is a `special`, not a `component`, element to
        // svelte-eslint-parser, so its children keep the parent's count.
        TemplateNode::SvelteComponent(c) => {
            walk_fragment(&c.fragment, parent_occ, in_component, sel, vars);
        }
        TemplateNode::SvelteElement(e) => {
            walk_fragment(&e.fragment, parent_occ, in_component, sel, vars);
        }
        // `<slot>` and `<title>` are `SvelteHTMLElement` (kind `html`) upstream.
        TemplateNode::SlotElement(el) => {
            let elem_occ = if in_component {
                OccCount::ZeroToInf
            } else {
                parent_occ
            };
            sel.add_element_type(&el.name, el.start, elem_occ);
            process_attrs(&el.attributes, el.start, elem_occ, sel, vars);
            walk_fragment(&el.fragment, elem_occ, false, sel, vars);
        }
        TemplateNode::TitleElement(t) => {
            let elem_occ = if in_component {
                OccCount::ZeroToInf
            } else {
                parent_occ
            };
            sel.add_element_type(&t.name, t.start, elem_occ);
            process_attrs(&t.attributes, t.start, elem_occ, sel, vars);
            walk_fragment(&t.fragment, elem_occ, false, sel, vars);
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
    vars: &ScriptVars,
) {
    for attr in attrs {
        match attr {
            Attribute::ClassDirective(d) => {
                // `class:name={expr}` → whitelist this class name.
                sel.whitelisted_classes.push(d.name.to_string());
            }
            Attribute::Attribute(node) if node.name == "class" => {
                process_class_value(&node.value, elem, sel, vars);
            }
            Attribute::Attribute(node) if node.name == "id" => {
                process_id_value(&node.value, elem, elem_occ, sel, vars);
            }
            _ => {}
        }
    }
}

/// Process the value of `class="..."` or `class={expr}` etc.
///
/// Mirrors upstream's two independent passes over the attribute value:
/// 1. `findClassesInAttribute` — every **literal** chunk is whitespace-split
///    into exact class names (regardless of any adjacent expression).
/// 2. each **expression** chunk contributes an affix derived from the
///    expression *itself* (`extractExpression{Prefix,Suffix}Literal`), NOT the
///    surrounding static text; an expression with no literal prefix *and* no
///    literal suffix (e.g. a bare `{level}`) marks the whole class selection
///    universal, which suppresses every class-selector report.
fn process_class_value(
    value: &AttributeValue,
    elem: ElemId,
    sel: &mut TemplateSelections,
    vars: &ScriptVars,
) {
    match value {
        AttributeValue::Sequence(parts) => {
            for part in parts {
                match part {
                    AttributeValuePart::Text(t) => {
                        for name in t.data.split_whitespace() {
                            if !name.is_empty() {
                                sel.class.add_exact(name, elem);
                            }
                        }
                    }
                    AttributeValuePart::ExpressionTag(et) => {
                        match extract_affix(et.expression.as_json(), vars) {
                            Affix::Universal => sel.class.universal_selector = true,
                            Affix::Known { prefix, suffix } => {
                                sel.class.add_affix(prefix, suffix, elem);
                            }
                        }
                    }
                }
            }
        }
        AttributeValue::Expression(et) => {
            // `class={expr}` — analyse the expression.
            let affix = extract_affix(et.expression.as_json(), vars);
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
    vars: &ScriptVars,
) {
    match value {
        AttributeValue::Sequence(parts) => {
            // Mirrors upstream: each literal chunk is an exact id, each
            // expression chunk contributes an affix from the expression itself
            // (a bare expression with no literal prefix/suffix → universal).
            for part in parts {
                match part {
                    AttributeValuePart::Text(t) => {
                        let id_val = t.data.trim();
                        if !id_val.is_empty() {
                            sel.id.add_exact(id_val, elem);
                            sel.occ.insert(elem, elem_occ);
                        }
                    }
                    AttributeValuePart::ExpressionTag(et) => {
                        match extract_affix(et.expression.as_json(), vars) {
                            Affix::Universal => sel.id.universal_selector = true,
                            Affix::Known { prefix, suffix } => {
                                sel.id.add_affix(prefix, suffix, elem);
                                sel.occ.insert(elem, elem_occ);
                            }
                        }
                    }
                }
            }
        }
        AttributeValue::Expression(et) => {
            let affix = extract_affix(et.expression.as_json(), vars);
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
fn extract_affix(expr: &Value, vars: &ScriptVars) -> Affix {
    let prefix = extract_prefix_literal(expr, vars, &mut Vec::new());
    let suffix = extract_suffix_literal(expr, vars, &mut Vec::new());
    match (prefix, suffix) {
        (None, None) => Affix::Universal,
        (p, s) => Affix::Known {
            prefix: p,
            suffix: s,
        },
    }
}

/// Port of `extractExpressionPrefixLiteral`: the leading literal text an
/// expression is known to produce.
/// - `BinaryExpression`: recurse into `left`.
/// - `TemplateLiteral`: the first non-empty part, quasi raw or nested expression.
/// - `Literal(string)`: the literal itself.
/// - `Identifier`: the initializer of the declarator that binds it, if unique.
fn extract_prefix_literal(
    expr: &Value,
    vars: &ScriptVars,
    seen: &mut Vec<String>,
) -> Option<String> {
    match expr.get("type").and_then(Value::as_str)? {
        "BinaryExpression" => extract_prefix_literal(expr.get("left")?, vars, seen),
        "TemplateLiteral" => {
            for part in template_parts_in_source_order(expr) {
                if let Some(raw) = template_element_raw(part) {
                    if raw.is_empty() {
                        continue; // skip an empty leading quasi
                    }
                    return Some(raw.to_string());
                }
                return extract_prefix_literal(part, vars, seen);
            }
            None
        }
        "Literal" => expr.get("value")?.as_str().map(ToString::to_string),
        "Identifier" => {
            let init = resolve_identifier_init(expr, vars, seen)?.clone();
            let out = extract_prefix_literal(&init, vars, seen);
            seen.pop();
            out
        }
        _ => None,
    }
}

/// Port of `extractExpressionSuffixLiteral` — the mirror of the above, taking
/// `right` and the last template part.
fn extract_suffix_literal(
    expr: &Value,
    vars: &ScriptVars,
    seen: &mut Vec<String>,
) -> Option<String> {
    match expr.get("type").and_then(Value::as_str)? {
        "BinaryExpression" => extract_suffix_literal(expr.get("right")?, vars, seen),
        "TemplateLiteral" => {
            for part in template_parts_in_source_order(expr).into_iter().rev() {
                if let Some(raw) = template_element_raw(part) {
                    if raw.is_empty() {
                        continue;
                    }
                    return Some(raw.to_string());
                }
                return extract_suffix_literal(part, vars, seen);
            }
            None
        }
        "Literal" => expr.get("value")?.as_str().map(ToString::to_string),
        "Identifier" => {
            let init = resolve_identifier_init(expr, vars, seen)?.clone();
            let out = extract_suffix_literal(&init, vars, seen);
            seen.pop();
            out
        }
        _ => None,
    }
}

/// The initializer an identifier resolves to, pushing the name onto `seen` so a
/// cyclic initializer terminates the way upstream's visited-node set does. The
/// caller pops once it is done with the returned node.
fn resolve_identifier_init<'a>(
    expr: &Value,
    vars: &'a ScriptVars,
    seen: &mut Vec<String>,
) -> Option<&'a Value> {
    let name = expr.get("name").and_then(Value::as_str)?;
    if seen.iter().any(|s| s == name) {
        return None;
    }
    let init = vars.declarator_init(name)?;
    seen.push(name.to_string());
    Some(init)
}

/// A template literal's quasis and expressions, interleaved by source position.
fn template_parts_in_source_order(expr: &Value) -> Vec<&Value> {
    let quasis = expr
        .get("quasis")
        .and_then(Value::as_array)
        .map_or(&[][..], Vec::as_slice);
    let exprs = expr
        .get("expressions")
        .and_then(Value::as_array)
        .map_or(&[][..], Vec::as_slice);
    let mut all: Vec<&Value> = quasis.iter().chain(exprs.iter()).collect();
    all.sort_by_key(|part| json_offset(part, "start"));
    all
}

/// The raw text of a `TemplateElement`, or `None` for an expression part.
fn template_element_raw(part: &Value) -> Option<&str> {
    if part.get("type").and_then(Value::as_str) != Some("TemplateElement") {
        return None;
    }
    Some(
        part.get("value")
            .and_then(|v| v.get("raw"))
            .and_then(Value::as_str)
            .unwrap_or(""),
    )
}

// ---------------------------------------------------------------------------
// CSS walk and selector checking
// ---------------------------------------------------------------------------

/// Check whether an ID selector can be used: no elements (empty match), or
/// exactly one element that is not in a `ZeroToInf` context.
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
/// - no affix-matched element is in a `ZeroToInf` context
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
    let Some(type_elems) = type_map.get(tag.as_str()) else {
        return false;
    };
    // Selection elements must be exactly the set of type elements.
    let sel_elems: Vec<ElemId> = selection.iter().map(|(e, _)| *e).collect();
    if type_elems.len() != sel_elems.len() {
        return false;
    }
    type_elems.iter().all(|e| sel_elems.contains(e))
}

/// Walk the CSS stylesheet and check each `ClassSelector`, `IdSelector`,
/// `TypeSelector` for consistency.
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
    let Some(prelude) = node.get("prelude") else {
        return false;
    };
    if prelude.get("type").and_then(Value::as_str) != Some("SelectorList") {
        return false;
    }
    let Some(children) = prelude.get("children").and_then(Value::as_array) else {
        return false;
    };
    if children.len() != 1 {
        return false;
    }
    let complex = &children[0];
    let Some(rel_children) = complex.get("children").and_then(Value::as_array) else {
        return false;
    };
    if rel_children.len() != 1 {
        return false;
    }
    let rel = &rel_children[0];
    let Some(sels) = rel.get("selectors").and_then(Value::as_array) else {
        return false;
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
    let Some(raw) = node.get("name").and_then(Value::as_str) else {
        return;
    };
    let name = &*unescape_css_identifier(raw);
    if sel.whitelisted_classes.iter().any(|w| w == name) {
        return;
    }
    let start = json_offset(node, "start");
    let end = json_offset(node, "end");

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
    let Some(raw) = node.get("name").and_then(Value::as_str) else {
        return;
    };
    let name = &*unescape_css_identifier(raw);
    let start = json_offset(node, "start");
    let end = json_offset(node, "end");

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
    let Some(raw) = node.get("name").and_then(Value::as_str) else {
        return;
    };
    let name = &*unescape_css_identifier(raw);
    let start = json_offset(node, "start");
    let end = json_offset(node, "end");

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
// SCSS best-effort check
// ---------------------------------------------------------------------------

/// Check SCSS/Less/PostCSS selectors against the template selections.
///
/// `content_start` is the absolute byte offset of `css.content.styles` in the
/// full source file. The `ScssSelector.offset` values are relative to the
/// content text, so `content_start + sel.offset` gives the absolute offset.
fn check_stylesheet_scss(
    selectors: &[ScssSelector],
    content_start: u32,
    sel: &TemplateSelections,
    style: &[&str],
    ctx: &mut LintContext,
) {
    for s in selectors {
        let abs_start = content_start + s.offset;
        let abs_end = content_start + s.end;
        match s.kind {
            SelectorKind::Class => {
                check_class_selector_scss(&s.name, abs_start, abs_end, sel, style, ctx);
            }
            SelectorKind::Id => {
                check_id_selector_scss(&s.name, abs_start, abs_end, sel, style, ctx);
            }
            SelectorKind::Type => {
                check_type_selector_scss(&s.name, abs_start, abs_end, sel, style, ctx);
            }
        }
    }
}

fn check_class_selector_scss(
    name: &str,
    start: u32,
    end: u32,
    sel: &TemplateSelections,
    style: &[&str],
    ctx: &mut LintContext,
) {
    if sel.class.universal_selector {
        return;
    }
    if sel.whitelisted_classes.iter().any(|w| w == name) {
        return;
    }

    let selection = sel.class.match_key(name);
    for style_val in style {
        match *style_val {
            "class" => return,
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

fn check_id_selector_scss(
    name: &str,
    start: u32,
    end: u32,
    sel: &TemplateSelections,
    style: &[&str],
    ctx: &mut LintContext,
) {
    if sel.id.universal_selector {
        return;
    }
    let selection = sel.id.match_key(name);
    for style_val in style {
        match *style_val {
            "class" => {
                ctx.report(start, end, "Selector should select by class instead of ID");
                return;
            }
            "id" => return,
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

fn check_type_selector_scss(
    name: &str,
    start: u32,
    end: u32,
    sel: &TemplateSelections,
    style: &[&str],
    ctx: &mut LintContext,
) {
    let selection: Vec<ElemId> = sel.type_map.get(name).cloned().unwrap_or_default();
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
            "type" => return,
            _ => {}
        }
    }
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
            .map_or_else(
                || vec!["type".into(), "id".into(), "class".into()],
                |arr| {
                    arr.iter()
                        .filter_map(|v| v.as_str().map(str::to_string))
                        .collect()
                },
            );
        let style: Vec<&str> = style_vec.iter().map(std::string::String::as_str).collect();

        // No CSS → nothing to check.
        let Some(css) = root.css.as_deref() else {
            return;
        };

        // Collect template selections.
        let vars = ScriptVars::from_root_json(&ctx.root_json(root));
        let sel = collect_selections(root, &vars);

        if let Some(_lang) = scss_lang(&css.attributes) {
            // Best-effort SCSS/PostCSS: extract selectors from raw text.
            // checkGlobal is not applicable to SCSS (no :global pseudo-class parsing).
            let _ = check_global; // intentionally unused for SCSS path
            let raw = &css.content.styles;
            // The oracle's postcss-scss parse fails (reporting nothing) on
            // malformed SCSS — mirror that so we don't over-report.
            if !crate::rules::scss_selector::scss_is_parseable(raw) {
                return;
            }
            let extracted = extract_selectors(raw);
            check_stylesheet_scss(&extracted, css.content.start, &sel, &style, ctx);
        } else if is_plain_css_lang(&css.attributes) {
            // Plain CSS: use the parsed StyleSheet AST.
            check_stylesheet(css, &sel, &style, check_global, ctx);
        }
        // else: unknown lang (less, etc.) — skip entirely, matching oracle behavior.
    }
}

#[cfg(test)]
mod tests {
    use super::unescape_css_identifier;

    #[test]
    fn css_identifier_escapes() {
        assert_eq!(unescape_css_identifier("plain"), "plain");
        assert_eq!(unescape_css_identifier(r"foo\.bar"), "foo.bar");
        assert_eq!(unescape_css_identifier(r"a\:b"), "a:b");
        assert_eq!(unescape_css_identifier(r"\31 23"), "123");
        assert_eq!(unescape_css_identifier(r"\41 b"), "Ab");
        assert_eq!(unescape_css_identifier(r"a\\b"), r"a\b");
        assert_eq!(unescape_css_identifier(r"\0"), "\u{FFFD}");
        assert_eq!(unescape_css_identifier(r"\D800"), "\u{FFFD}");
        assert_eq!(unescape_css_identifier(r"\1F600"), "\u{1F600}");
    }
}
