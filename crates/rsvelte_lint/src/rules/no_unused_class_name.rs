//! `svelte/no-unused-class-name` — disallow class names in the template that
//! have no corresponding selector in `<style>`.
//!
//! Flags every `class="foo bar"` / `class:foo` usage whose class name does not
//! appear in any CSS `ClassSelector` inside the component's `<style>` block.
//! The optional `allowedClassNames` array (plain strings or `/regex/` patterns)
//! exempts matching names.
//!
//! Port of `eslint-plugin-svelte/src/rules/no-unused-class-name.ts`.
//! Upstream: `meta.type = 'suggestion'`, not fixable.

use rsvelte_core::ast::css::StyleSheet;
use rsvelte_core::ast::template::{
    Attribute, AttributeValue, AttributeValuePart, Fragment, Root, TemplateNode,
};
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-unused-class-name",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow the use of a class in the template without a corresponding style",
    options_schema: Some(
        r#"[{"type":"object","properties":{
            "allowedClassNames":{"type":"array","items":{"type":"string"}}
        },"additionalProperties":false}]"#,
    ),
};

// ---------------------------------------------------------------------------
// Regex helper (mirrors upstream `toRegExp`)
// ---------------------------------------------------------------------------

/// Match a class name against an allowedClassNames entry. An entry wrapped in
/// `/…/` is compiled as a regex; any other string is an exact match.
fn matches_allowed(pattern: &str, class_name: &str) -> bool {
    if let Some(rest) = pattern.strip_prefix('/')
        && let Some(slash) = rest.rfind('/')
    {
        let pat = &rest[..slash];
        let flags = &rest[slash + 1..];
        let mut builder = regex::RegexBuilder::new(pat);
        if flags.contains('i') {
            builder.case_insensitive(true);
        }
        if let Ok(re) = builder.build() {
            return re.is_match(class_name);
        }
        // Regex compilation failed — fall through to exact match.
    }
    pattern == class_name
}

// ---------------------------------------------------------------------------
// Template walk: collect (class_name, element_start) pairs
// ---------------------------------------------------------------------------

/// A class name found in the template, together with the start offset of the
/// element that carries it (used as the report location, matching upstream's
/// `node.startTag.loc`).
struct TemplateClass {
    name: String,
    el_start: u32,
    el_end: u32,
}

/// Recursively walk the fragment and collect all class usages on HTML elements.
fn collect_template_classes(fragment: &Fragment, out: &mut Vec<TemplateClass>) {
    for node in &fragment.nodes {
        collect_node_classes(node, out);
    }
}

fn collect_node_classes(node: &TemplateNode, out: &mut Vec<TemplateClass>) {
    match node {
        TemplateNode::RegularElement(el) => {
            // Plain HTML elements: collect class names (upstream `node.kind === 'html'`).
            collect_attrs_classes(&el.attributes, el.start, el.end, out);
            collect_template_classes(&el.fragment, out);
        }
        TemplateNode::SlotElement(el) => {
            // `<slot>` is also a plain HTML element — collect class names.
            collect_attrs_classes(&el.attributes, el.start, el.end, out);
            collect_template_classes(&el.fragment, out);
        }
        TemplateNode::Component(c) => {
            // Components: upstream gates on `node.kind === 'html'` so Component
            // class attributes are NOT collected (avoid false positives).
            collect_template_classes(&c.fragment, out);
        }
        TemplateNode::IfBlock(b) => {
            collect_template_classes(&b.consequent, out);
            if let Some(alt) = &b.alternate {
                collect_template_classes(alt, out);
            }
        }
        TemplateNode::EachBlock(b) => {
            collect_template_classes(&b.body, out);
            if let Some(fb) = &b.fallback {
                collect_template_classes(fb, out);
            }
        }
        TemplateNode::AwaitBlock(b) => {
            if let Some(f) = &b.pending {
                collect_template_classes(f, out);
            }
            if let Some(f) = &b.then {
                collect_template_classes(f, out);
            }
            if let Some(f) = &b.catch {
                collect_template_classes(f, out);
            }
        }
        TemplateNode::KeyBlock(b) => {
            collect_template_classes(&b.fragment, out);
        }
        TemplateNode::SnippetBlock(b) => {
            collect_template_classes(&b.body, out);
        }
        TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteBody(el)
        | TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteOptions(el)
        | TemplateNode::SvelteSelf(el)
        | TemplateNode::SvelteWindow(el) => {
            collect_template_classes(&el.fragment, out);
        }
        TemplateNode::SvelteComponent(c) => {
            // `<svelte:component>`: upstream gates on `node.kind === 'html'` so
            // class attrs here are NOT collected (avoid false positives).
            collect_template_classes(&c.fragment, out);
        }
        TemplateNode::SvelteElement(e) => {
            // `<svelte:element>` (dynamic): same upstream gate — not collected.
            collect_template_classes(&e.fragment, out);
        }
        TemplateNode::TitleElement(t) => {
            collect_template_classes(&t.fragment, out);
        }
        _ => {}
    }
}

/// Extract class names from the attributes list of an element.
fn collect_attrs_classes(
    attributes: &[Attribute],
    el_start: u32,
    el_end: u32,
    out: &mut Vec<TemplateClass>,
) {
    for attr in attributes {
        match attr {
            Attribute::Attribute(node) if node.name == "class" => {
                // `class="foo bar"` or mixed `class="foo {expr} bar"`
                if let AttributeValue::Sequence(parts) = &node.value {
                    for part in parts {
                        if let AttributeValuePart::Text(t) = part {
                            // Split on whitespace — each token is a class name.
                            for name in t.data.split_whitespace() {
                                if !name.is_empty() {
                                    out.push(TemplateClass {
                                        name: name.to_string(),
                                        el_start,
                                        el_end,
                                    });
                                }
                            }
                        }
                    }
                }
            }
            Attribute::ClassDirective(d) => {
                // `class:foo={expr}` — the directive name is the class name.
                out.push(TemplateClass {
                    name: d.name.to_string(),
                    el_start,
                    el_end,
                });
            }
            _ => {}
        }
    }
}

// ---------------------------------------------------------------------------
// CSS walk: collect all ClassSelector names
// ---------------------------------------------------------------------------

/// Walk a CSS stylesheet's children and collect every `ClassSelector` name.
fn collect_css_classes(css: &StyleSheet) -> Vec<String> {
    let mut out = Vec::new();
    for child in &css.children {
        collect_css_node_classes(child, &mut out);
    }
    out
}

fn collect_css_node_classes(node: &Value, out: &mut Vec<String>) {
    let ty = node.get("type").and_then(Value::as_str).unwrap_or("");
    match ty {
        "Rule" => {
            // Walk the prelude (SelectorList with ComplexSelector children).
            if let Some(prelude) = node.get("prelude") {
                collect_selector_classes(prelude, out);
            }
            // Recurse into nested rules inside the block (e.g. SCSS nesting).
            if let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(Value::as_array)
            {
                for child in children {
                    collect_css_node_classes(child, out);
                }
            }
        }
        "Atrule" => {
            // @media, @supports, @keyframes, etc. — recurse into block.
            if let Some(block) = node.get("block")
                && let Some(children) = block.get("children").and_then(Value::as_array)
            {
                for child in children {
                    collect_css_node_classes(child, out);
                }
            }
        }
        "SelectorList" | "ComplexSelector" => {
            if let Some(children) = node.get("children").and_then(Value::as_array) {
                for child in children {
                    collect_selector_classes(child, out);
                }
            }
        }
        "RelativeSelector" => {
            if let Some(selectors) = node.get("selectors").and_then(Value::as_array) {
                for sel in selectors {
                    collect_selector_classes(sel, out);
                }
            }
        }
        "ClassSelector" => {
            if let Some(name) = node.get("name").and_then(Value::as_str) {
                out.push(name.to_string());
            }
        }
        "PseudoClassSelector" => {
            // :not(.foo), :is(.foo), :where(.foo), :has(.foo) etc.
            if let Some(args) = node.get("args") {
                collect_selector_classes(args, out);
            }
        }
        _ => {}
    }
}

/// Walk a selector node (any type) and extract ClassSelector names.
fn collect_selector_classes(node: &Value, out: &mut Vec<String>) {
    let ty = node.get("type").and_then(Value::as_str).unwrap_or("");
    match ty {
        "ClassSelector" => {
            if let Some(name) = node.get("name").and_then(Value::as_str) {
                out.push(name.to_string());
            }
        }
        "SelectorList" | "ComplexSelector" => {
            if let Some(children) = node.get("children").and_then(Value::as_array) {
                for child in children {
                    collect_selector_classes(child, out);
                }
            }
        }
        "RelativeSelector" => {
            if let Some(selectors) = node.get("selectors").and_then(Value::as_array) {
                for sel in selectors {
                    collect_selector_classes(sel, out);
                }
            }
        }
        "PseudoClassSelector" | "PseudoElementSelector" => {
            // Recurse into pseudo-class args (:not, :is, :where, :has).
            if let Some(args) = node.get("args") {
                collect_selector_classes(args, out);
            }
        }
        _ => {}
    }
}

// ---------------------------------------------------------------------------
// CSS lang check: skip for unknown / non-plain-CSS langs
// ---------------------------------------------------------------------------

/// Returns `true` when the `<style>` block has a non-plain lang attribute
/// (e.g. `lang="scss"`). The upstream rule returns early for
/// `status === 'unknown-lang'` which corresponds to this.
fn has_unknown_lang(css: &StyleSheet) -> bool {
    for attr in &css.attributes {
        if attr.get("name").and_then(Value::as_str) == Some("lang") {
            // Any truthy lang value other than "css" (or empty) is considered
            // unknown; "css" itself is fine.
            let val = attr.get("value");
            // boolean `true` → shorthand `lang` (no value) → treat as empty → known
            if val.and_then(Value::as_bool).unwrap_or(false) {
                return false;
            }
            // Sequence value: extract text
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
            // lang attribute present but no recognizable value → unknown
            return true;
        }
    }
    false
}

// ---------------------------------------------------------------------------
// Rule implementation
// ---------------------------------------------------------------------------

#[derive(Default)]
pub struct NoUnusedClassName;

impl Rule for NoUnusedClassName {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        // Parse options: allowedClassNames (string array, may be /regex/ patterns).
        let allowed: Vec<String> = ctx.option_str_list("allowedClassNames");

        // Collect classes used in the template.
        let mut template_classes: Vec<TemplateClass> = Vec::new();
        collect_template_classes(&root.fragment, &mut template_classes);

        if template_classes.is_empty() {
            return;
        }

        // No <style> block → all classes are unused (skip if parse-error/unknown-lang
        // is signalled by a non-plain lang; no CSS is treated as "empty" which
        // means all classes are unused — matches upstream behaviour).
        let css_classes: Vec<String> = match root.css.as_deref() {
            None => Vec::new(),
            Some(css) => {
                // Skip if the style block has an unknown/non-plain lang.
                if has_unknown_lang(css) {
                    return;
                }
                collect_css_classes(css)
            }
        };

        // Report each template class not found in CSS and not in allowedClassNames.
        for tc in &template_classes {
            if allowed.iter().any(|p| matches_allowed(p, &tc.name)) {
                continue;
            }
            if css_classes.contains(&tc.name) {
                continue;
            }
            ctx.report(
                tc.el_start,
                tc.el_end,
                format!("Unused class \"{}\".", tc.name),
            );
        }
    }
}
