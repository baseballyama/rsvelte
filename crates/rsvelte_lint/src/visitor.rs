//! The single shared DFS walk over the template AST.
//!
//! One pass visits every node; per node it loops over the enabled rules and
//! calls the matching hook. There is no per-node-type listener registry — this
//! is the verbatim `vize_patina` `visitor.rs` structure, which keeps the walk
//! cache-friendly and the rule set trivially parallel across files.

use rsvelte_core::ast::template::{Attribute, Fragment, Root, TemplateNode};

use crate::context::LintContext;
use crate::rule::{Rule, RuleMeta, Severity};

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
    pub fn new(rules: Vec<EnabledRule<'r>>) -> Self {
        Self { rules }
    }

    /// Walk the whole component, collecting findings into `ctx`.
    pub fn visit_root(&self, ctx: &mut LintContext, root: &Root) {
        for er in &self.rules {
            ctx.enter_rule(er.meta, er.severity);
            er.rule.check_root(ctx, root);
        }
        self.visit_fragment(ctx, &root.fragment);
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
            TemplateNode::EachBlock(b) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_each(ctx, b);
                }
                self.visit_fragment(ctx, &b.body);
                if let Some(fallback) = &b.fallback {
                    self.visit_fragment(ctx, fallback);
                }
            }
            TemplateNode::IfBlock(b) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_if(ctx, b);
                }
                self.visit_fragment(ctx, &b.consequent);
                if let Some(alternate) = &b.alternate {
                    self.visit_fragment(ctx, alternate);
                }
            }
            TemplateNode::AwaitBlock(b) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_await(ctx, b);
                }
                if let Some(f) = &b.pending {
                    self.visit_fragment(ctx, f);
                }
                if let Some(f) = &b.then {
                    self.visit_fragment(ctx, f);
                }
                if let Some(f) = &b.catch {
                    self.visit_fragment(ctx, f);
                }
            }
            TemplateNode::SnippetBlock(b) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_snippet(ctx, b);
                }
                self.visit_fragment(ctx, &b.body);
            }
            TemplateNode::DebugTag(t) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_debug_tag(ctx, t);
                }
            }
            TemplateNode::KeyBlock(b) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_key(ctx, b);
                }
                self.visit_fragment(ctx, &b.fragment)
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
            TemplateNode::TitleElement(e) => {
                self.visit_attributes(ctx, &e.attributes);
                self.visit_fragment(ctx, &e.fragment);
            }
            TemplateNode::SlotElement(e) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_slot(ctx, e);
                }
                self.visit_attributes(ctx, &e.attributes);
                self.visit_fragment(ctx, &e.fragment)
            }
            // The `svelte:*` special elements all wrap a `SvelteElement`.
            TemplateNode::SvelteBody(e)
            | TemplateNode::SvelteDocument(e)
            | TemplateNode::SvelteFragment(e)
            | TemplateNode::SvelteBoundary(e)
            | TemplateNode::SvelteHead(e)
            | TemplateNode::SvelteOptions(e)
            | TemplateNode::SvelteSelf(e)
            | TemplateNode::SvelteWindow(e) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_svelte_element(ctx, e);
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
            // Leaf nodes with no template children and no hooks.
            TemplateNode::Text(_) | TemplateNode::AttachTag(_) => {}
        }
    }
}
