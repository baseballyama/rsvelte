//! The single shared DFS walk over the template AST.
//!
//! One pass visits every node; per node it loops over the enabled rules and
//! calls the matching hook. There is no per-node-type listener registry — this
//! is the verbatim `vize_patina` `visitor.rs` structure, which keeps the walk
//! cache-friendly and the rule set trivially parallel across files.

use compact_str::CompactString;
use rsvelte_core::ast::template::{
    Attribute, AttributeNode, AttributeNodeMetadata, AttributeValue, Fragment, Root, TemplateNode,
};

use crate::context::LintContext;
use crate::rule::{Rule, RuleMeta, Severity, SpecialElement};

/// A rule that resolved to a non-`Off` severity for this run, paired with that
/// severity so the visitor doesn't re-resolve config per node.
pub struct EnabledRule<'r> {
    pub rule: &'r dyn Rule,
    pub meta: &'static RuleMeta,
    pub severity: Severity,
}

pub struct LintVisitor<'r> {
    rules: Vec<EnabledRule<'r>>,
}

impl<'r> LintVisitor<'r> {
    #[must_use]
    pub const fn new(rules: Vec<EnabledRule<'r>>) -> Self {
        Self { rules }
    }

    /// Walk the whole component, collecting findings into `ctx`.
    pub fn visit_root(&self, ctx: &mut LintContext, root: &Root) {
        for er in &self.rules {
            ctx.enter_rule(er.meta, er.severity);
            er.rule.check_root(ctx, root);
        }
        self.visit_fragment(ctx, &root.fragment);
        self.visit_special_elements(ctx, root);
    }

    /// After the template fragment walk, dispatch `check_special_element` for
    /// each of `<script>` (instance + module), `<style>`, and `<svelte:options>`
    /// that are present in the component.
    ///
    /// `<script>` and `<svelte:options>` carry typed `Vec<AttributeNode>` which
    /// we convert directly to `Vec<Attribute>`. `<style>` stores its attributes
    /// as raw `serde_json::Value`; we reconstruct `AttributeNode` from the JSON
    /// fields `name`, `start`, `end`. If any style attribute can't be faithfully
    /// reconstructed (missing required fields), it is skipped rather than
    /// emitting a wrong span — fail-safe.
    fn visit_special_elements(&self, ctx: &mut LintContext, root: &Root) {
        // Collect special elements in document order (instance/module first, then
        // style, then svelte:options — matches what svelte-eslint-parser emits).
        let mut elements: Vec<SpecialElement<'_>> = Vec::new();

        // Instance <script> (no context attribute or context="default")
        if let Some(script) = &root.instance {
            elements.push(SpecialElement {
                name: "script",
                start: script.start,
                end: script.end,
                attributes: script
                    .attributes
                    .iter()
                    .map(|n| Attribute::Attribute(n.clone()))
                    .collect(),
            });
        }

        // Module <script context="module">
        if let Some(script) = &root.module {
            elements.push(SpecialElement {
                name: "script",
                start: script.start,
                end: script.end,
                attributes: script
                    .attributes
                    .iter()
                    .map(|n| Attribute::Attribute(n.clone()))
                    .collect(),
            });
        }

        // <style> block — attributes are raw JSON; reconstruct AttributeNode
        // from `name`, `start`, `end` fields. Skip any attribute that lacks
        // all three (fail-safe: FN is acceptable, FP is not).
        if let Some(css) = &root.css {
            let attrs: Vec<Attribute> = css
                .attributes
                .iter()
                .filter_map(|v| {
                    let name = v.get("name").and_then(|n| n.as_str())?;
                    let start =
                        u32::try_from(v.get("start").and_then(serde_json::Value::as_u64)?).ok()?;
                    let end =
                        u32::try_from(v.get("end").and_then(serde_json::Value::as_u64)?).ok()?;
                    Some(Attribute::Attribute(AttributeNode {
                        start,
                        end,
                        name: CompactString::from(name),
                        name_loc: None,
                        value: AttributeValue::True(true),
                        metadata: AttributeNodeMetadata::default(),
                    }))
                })
                .collect();
            elements.push(SpecialElement {
                name: "style",
                start: css.start,
                end: css.end,
                attributes: attrs,
            });
        }

        // <svelte:options>
        if let Some(opts) = &root.options {
            elements.push(SpecialElement {
                name: "svelte:options",
                start: opts.start,
                end: opts.end,
                attributes: opts
                    .attributes
                    .iter()
                    .map(|n| Attribute::Attribute(n.clone()))
                    .collect(),
            });
        }

        // Sort by source position so rules see them in document order.
        elements.sort_by_key(|e| e.start);

        for el in &elements {
            for er in &self.rules {
                ctx.enter_rule(er.meta, er.severity);
                er.rule.check_special_element(ctx, el);
            }
        }
    }

    fn visit_fragment(&self, ctx: &mut LintContext, fragment: &Fragment) {
        for node in &fragment.nodes {
            self.visit_node(ctx, node);
        }
    }

    /// Dispatch `check_attribute` for every attribute/directive on an element.
    /// Shared across all element-bearing node types so attribute rules fire
    /// uniformly (not just on `RegularElement`).
    fn visit_attributes(&self, ctx: &mut LintContext, attributes: &[Attribute]) {
        for attr in attributes {
            for er in &self.rules {
                ctx.enter_rule(er.meta, er.severity);
                er.rule.check_attribute(ctx, attr);
            }
        }
    }

    fn visit_node(&self, ctx: &mut LintContext, node: &TemplateNode) {
        if self.visit_control_flow(ctx, node) {
            return;
        }
        if self.visit_template_special_elements(ctx, node) {
            return;
        }
        match node {
            TemplateNode::HtmlTag(t) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_html_tag(ctx, t);
                }
            }
            TemplateNode::ExpressionTag(t) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_expression_tag(ctx, t);
                }
            }
            TemplateNode::DebugTag(t) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_debug_tag(ctx, t);
                }
            }
            TemplateNode::RegularElement(el) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_element(ctx, el);
                }
                self.visit_attributes(ctx, &el.attributes);
                self.visit_fragment(ctx, &el.fragment);
            }
            TemplateNode::Component(c) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_component(ctx, c);
                }
                self.visit_attributes(ctx, &c.attributes);
                self.visit_fragment(ctx, &c.fragment);
            }
            TemplateNode::SvelteComponent(c) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_svelte_component(ctx, c);
                }
                self.visit_attributes(ctx, &c.attributes);
                self.visit_fragment(ctx, &c.fragment);
            }
            TemplateNode::SvelteElement(e) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_svelte_dynamic_element(ctx, e);
                }
                self.visit_attributes(ctx, &e.attributes);
                self.visit_fragment(ctx, &e.fragment);
            }
            TemplateNode::ConstTag(t) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_const_tag(ctx, t);
                }
            }
            TemplateNode::Comment(c) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_comment(ctx, c);
                }
            }
            TemplateNode::DeclarationTag(t) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_declaration_tag(ctx, t);
                }
            }
            TemplateNode::RenderTag(t) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_render_tag(ctx, t);
                }
            }
            TemplateNode::EachBlock(_)
            | TemplateNode::IfBlock(_)
            | TemplateNode::AwaitBlock(_)
            | TemplateNode::SnippetBlock(_)
            | TemplateNode::KeyBlock(_)
            | TemplateNode::TitleElement(_)
            | TemplateNode::SlotElement(_)
            | TemplateNode::SvelteBody(_)
            | TemplateNode::SvelteDocument(_)
            | TemplateNode::SvelteFragment(_)
            | TemplateNode::SvelteBoundary(_)
            | TemplateNode::SvelteHead(_)
            | TemplateNode::SvelteOptions(_)
            | TemplateNode::SvelteSelf(_)
            | TemplateNode::SvelteWindow(_)
            | TemplateNode::Text(_)
            | TemplateNode::AttachTag(_) => {}
        }
    }

    fn visit_control_flow(&self, ctx: &mut LintContext, node: &TemplateNode) -> bool {
        match node {
            TemplateNode::EachBlock(block) => {
                for rule in &self.rules {
                    ctx.enter_rule(rule.meta, rule.severity);
                    rule.rule.check_each(ctx, block);
                }
                self.visit_fragment(ctx, &block.body);
                if let Some(fallback) = &block.fallback {
                    self.visit_fragment(ctx, fallback);
                }
            }
            TemplateNode::IfBlock(block) => {
                for rule in &self.rules {
                    ctx.enter_rule(rule.meta, rule.severity);
                    rule.rule.check_if(ctx, block);
                }
                self.visit_fragment(ctx, &block.consequent);
                if let Some(alternate) = &block.alternate {
                    self.visit_fragment(ctx, alternate);
                }
            }
            TemplateNode::AwaitBlock(block) => {
                for rule in &self.rules {
                    ctx.enter_rule(rule.meta, rule.severity);
                    rule.rule.check_await(ctx, block);
                }
                for fragment in [
                    block.pending.as_ref(),
                    block.then.as_ref(),
                    block.catch.as_ref(),
                ]
                .into_iter()
                .flatten()
                {
                    self.visit_fragment(ctx, fragment);
                }
            }
            TemplateNode::SnippetBlock(block) => {
                for rule in &self.rules {
                    ctx.enter_rule(rule.meta, rule.severity);
                    rule.rule.check_snippet(ctx, block);
                }
                self.visit_fragment(ctx, &block.body);
            }
            TemplateNode::KeyBlock(block) => {
                for rule in &self.rules {
                    ctx.enter_rule(rule.meta, rule.severity);
                    rule.rule.check_key(ctx, block);
                }
                self.visit_fragment(ctx, &block.fragment);
            }
            _ => return false,
        }
        true
    }

    fn visit_template_special_elements(&self, ctx: &mut LintContext, node: &TemplateNode) -> bool {
        match node {
            TemplateNode::TitleElement(element) => {
                for rule in &self.rules {
                    ctx.enter_rule(rule.meta, rule.severity);
                    rule.rule.check_title(ctx, element);
                }
                self.visit_attributes(ctx, &element.attributes);
                self.visit_fragment(ctx, &element.fragment);
            }
            TemplateNode::SlotElement(element) => {
                for rule in &self.rules {
                    ctx.enter_rule(rule.meta, rule.severity);
                    rule.rule.check_slot(ctx, element);
                }
                self.visit_attributes(ctx, &element.attributes);
                self.visit_fragment(ctx, &element.fragment);
            }
            TemplateNode::SvelteBody(element)
            | TemplateNode::SvelteDocument(element)
            | TemplateNode::SvelteFragment(element)
            | TemplateNode::SvelteBoundary(element)
            | TemplateNode::SvelteHead(element)
            | TemplateNode::SvelteOptions(element)
            | TemplateNode::SvelteSelf(element)
            | TemplateNode::SvelteWindow(element) => {
                for rule in &self.rules {
                    ctx.enter_rule(rule.meta, rule.severity);
                    rule.rule.check_svelte_element(ctx, element);
                }
                self.visit_attributes(ctx, &element.attributes);
                self.visit_fragment(ctx, &element.fragment);
            }
            _ => return false,
        }
        true
    }
}
