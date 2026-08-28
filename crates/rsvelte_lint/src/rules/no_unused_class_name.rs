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
use crate::rules::consistent_selector_style::unescape_css_identifier;
use crate::rules::js_whitespace::{is_js_whitespace, js_trim};
use crate::rules::no_unknown_style_directive_property::Matcher;
use crate::rules::scss_selector::{SelectorKind, extract_selectors, is_plain_css_lang, scss_lang};
use crate::rules::start_tag::start_tag_span;

static META: RuleMeta = RuleMeta {
    name: "svelte/no-unused-class-name",
    category: RuleCategory::Style,
    fixable: Fixable::No,
    default_severity: Severity::Off,
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

/// Upstream reports on `node.startTag`, not on the whole element.
fn report_span(
    src: &str,
    start: u32,
    end: u32,
    name: &str,
    attributes: &[Attribute],
) -> (u32, u32) {
    start_tag_span(src, start, name.len(), attributes, None).unwrap_or((start, end))
}

/// Recursively walk the fragment and collect all class usages on HTML elements.
fn collect_template_classes(fragment: &Fragment, src: &str, out: &mut Vec<TemplateClass>) {
    for node in &fragment.nodes {
        collect_node_classes(node, src, out);
    }
}

fn collect_node_classes(node: &TemplateNode, src: &str, out: &mut Vec<TemplateClass>) {
    match node {
        TemplateNode::RegularElement(el) => {
            // Plain HTML elements: collect class names (upstream `node.kind === 'html'`).
            let (s, e) = report_span(src, el.start, el.end, &el.name, &el.attributes);
            collect_attrs_classes(&el.attributes, s, e, out);
            collect_template_classes(&el.fragment, src, out);
        }
        TemplateNode::SlotElement(el) => {
            // `<slot>` is also a plain HTML element — collect class names.
            let (s, e) = report_span(src, el.start, el.end, &el.name, &el.attributes);
            collect_attrs_classes(&el.attributes, s, e, out);
            collect_template_classes(&el.fragment, src, out);
        }
        TemplateNode::Component(c) => {
            // Components: upstream gates on `node.kind === 'html'` so Component
            // class attributes are NOT collected (avoid false positives).
            collect_template_classes(&c.fragment, src, out);
        }
        TemplateNode::IfBlock(b) => {
            collect_template_classes(&b.consequent, src, out);
            if let Some(alt) = &b.alternate {
                collect_template_classes(alt, src, out);
            }
        }
        TemplateNode::EachBlock(b) => {
            collect_template_classes(&b.body, src, out);
            if let Some(fb) = &b.fallback {
                collect_template_classes(fb, src, out);
            }
        }
        TemplateNode::AwaitBlock(b) => {
            if let Some(f) = &b.pending {
                collect_template_classes(f, src, out);
            }
            if let Some(f) = &b.then {
                collect_template_classes(f, src, out);
            }
            if let Some(f) = &b.catch {
                collect_template_classes(f, src, out);
            }
        }
        TemplateNode::KeyBlock(b) => {
            collect_template_classes(&b.fragment, src, out);
        }
        TemplateNode::SnippetBlock(b) => {
            collect_template_classes(&b.body, src, out);
        }
        TemplateNode::SvelteHead(el)
        | TemplateNode::SvelteBody(el)
        | TemplateNode::SvelteDocument(el)
        | TemplateNode::SvelteFragment(el)
        | TemplateNode::SvelteBoundary(el)
        | TemplateNode::SvelteOptions(el)
        | TemplateNode::SvelteSelf(el)
        | TemplateNode::SvelteWindow(el) => {
            collect_template_classes(&el.fragment, src, out);
        }
        TemplateNode::SvelteComponent(c) => {
            // `<svelte:component>`: upstream gates on `node.kind === 'html'` so
            // class attrs here are NOT collected (avoid false positives).
            collect_template_classes(&c.fragment, src, out);
        }
        TemplateNode::SvelteElement(e) => {
            // `<svelte:element>` (dynamic): same upstream gate — not collected.
            collect_template_classes(&e.fragment, src, out);
        }
        TemplateNode::TitleElement(t) => {
            // `<title>` is a plain HTML element upstream.
            let (s, e) = report_span(src, t.start, t.end, &t.name, &t.attributes);
            collect_attrs_classes(&t.attributes, s, e, out);
            collect_template_classes(&t.fragment, src, out);
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
                            // Mirror upstream `findClassesInAttribute`:
                            // `literal.value.trim().split(/\s+/u)`. In JS,
                            // `"".split(/\s+/)` yields `[""]`, so a whitespace-only
                            // text run (e.g. the space between two `{…}` mustaches
                            // in `class="{a} {b}"`) contributes one empty class
                            // name `""`. Reproduce that exactly — using
                            // `split_whitespace()` (which drops empties) would
                            // miss the `""` the oracle reports.
                            //
                            // A truly EMPTY run (`class=""`) is NOT a literal in
                            // svelte-eslint-parser (its value array is empty), so
                            // it yields no class — skip zero-length text runs.
                            if t.data.is_empty() {
                                continue;
                            }
                            let trimmed = js_trim(&t.data);
                            if trimmed.is_empty() {
                                out.push(TemplateClass {
                                    name: String::new(),
                                    el_start,
                                    el_end,
                                });
                            } else {
                                for name in
                                    trimmed.split(is_js_whitespace).filter(|s| !s.is_empty())
                                {
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
                out.push(unescape_css_identifier(name).into_owned());
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

/// Walk a selector node (any type) and extract `ClassSelector` names.
fn collect_selector_classes(node: &Value, out: &mut Vec<String>) {
    let ty = node.get("type").and_then(Value::as_str).unwrap_or("");
    match ty {
        "ClassSelector" => {
            if let Some(name) = node.get("name").and_then(Value::as_str) {
                out.push(unescape_css_identifier(name).into_owned());
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
        collect_template_classes(&root.fragment, ctx.source(), &mut template_classes);

        if template_classes.is_empty() {
            return;
        }

        // No <style> block → all classes are unused (skip if parse-error/unknown-lang
        // is signalled by a non-plain lang; no CSS is treated as "empty" which
        // means all classes are unused — matches upstream behaviour).
        let css_classes: Vec<String> = match root.css.as_deref() {
            None => Vec::new(),
            Some(css) => {
                if let Some(_lang) = scss_lang(&css.attributes) {
                    // Best-effort SCSS/PostCSS: extract class names from raw text.
                    let raw = &css.content.styles;
                    // The oracle's postcss-scss parse fails (and reports nothing)
                    // on malformed SCSS — mirror that so we don't over-report.
                    if !crate::rules::scss_selector::scss_is_parseable(raw) {
                        return;
                    }
                    extract_selectors(raw)
                        .into_iter()
                        .filter(|s| s.kind == SelectorKind::Class)
                        .map(|s| s.name)
                        .collect()
                } else if is_plain_css_lang(&css.attributes) {
                    collect_css_classes(css)
                } else {
                    // Unknown lang (less, etc.) — oracle skips these entirely.
                    return;
                }
            }
        };

        // Report each template class not found in CSS and not in allowedClassNames.
        for tc in &template_classes {
            if allowed
                .iter()
                .any(|p| Matcher::from_option(p).test(&tc.name))
            {
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
