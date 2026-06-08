//! The single shared DFS walk over the template AST.
//!
//! One pass visits every node; per node it loops over the enabled rules and
//! calls the matching hook. There is no per-node-type listener registry — this
//! is the verbatim `vize_patina` `visitor.rs` structure, which keeps the walk
//! cache-friendly and the rule set trivially parallel across files.

use rsvelte_core::ast::template::{Fragment, Root, TemplateNode};

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
            TemplateNode::KeyBlock(b) => self.visit_fragment(ctx, &b.fragment),
            TemplateNode::RegularElement(el) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_element(ctx, el);
                }
                for attr in &el.attributes {
                    for er in &self.rules {
                        ctx.enter_rule(er.meta, er.severity);
                        er.rule.check_attribute(ctx, attr);
                    }
                }
                self.visit_fragment(ctx, &el.fragment);
            }
            TemplateNode::Component(c) => {
                for er in &self.rules {
                    ctx.enter_rule(er.meta, er.severity);
                    er.rule.check_component(ctx, c);
                }
                self.visit_fragment(ctx, &c.fragment);
            }
            TemplateNode::SvelteComponent(c) => self.visit_fragment(ctx, &c.fragment),
            TemplateNode::SvelteElement(e) => self.visit_fragment(ctx, &e.fragment),
            TemplateNode::TitleElement(e) => self.visit_fragment(ctx, &e.fragment),
            TemplateNode::SlotElement(e) => self.visit_fragment(ctx, &e.fragment),
            // The `svelte:*` special elements all wrap a `SvelteElement`.
            TemplateNode::SvelteBody(e)
            | TemplateNode::SvelteDocument(e)
            | TemplateNode::SvelteFragment(e)
            | TemplateNode::SvelteBoundary(e)
            | TemplateNode::SvelteHead(e)
            | TemplateNode::SvelteOptions(e)
            | TemplateNode::SvelteSelf(e)
            | TemplateNode::SvelteWindow(e) => self.visit_fragment(ctx, &e.fragment),
            // Leaf nodes with no template children and no Wave-1 hooks.
            TemplateNode::Text(_)
            | TemplateNode::Comment(_)
            | TemplateNode::ConstTag(_)
            | TemplateNode::DeclarationTag(_)
            | TemplateNode::RenderTag(_)
            | TemplateNode::AttachTag(_) => {}
        }
    }
}
