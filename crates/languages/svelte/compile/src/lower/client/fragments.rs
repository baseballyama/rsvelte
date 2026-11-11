use crate::lower::builder::Runtime;
use oxc_ast::ast::{Expression, Statement};
use rsvelte_svelte_semantic::compiler_syntax_tree::{Children, CompilerNodeIdentifier};

use super::{ClientCompilationContext, Frag, Item, Lists, NodeKind, Prev, R, Template};

const TEMPLATE_FRAGMENT: u32 = 1;

const TEMPLATE_USE_IMPORT_NODE: u32 = 2;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `Fragment` visitor: the statements of one block.
    pub(super) fn fragment(&mut self, children: Children) -> R<Vec<Statement<'o>>> {
        self.fragment_without(children, |_| false)
    }

    /// Upstream `Fragment` over the children but the snippets named so that `skipped` holds,
    /// which the caller declares: the snippets come first (upstream `state.snippets`).
    pub(super) fn fragment_without(
        &mut self,
        children: Children,
        skipped: fn(&str) -> bool,
    ) -> R<Vec<Statement<'o>>> {
        let outer = std::mem::take(&mut self.snippets);
        let body = self.fragment_body(children, skipped);
        let mut snippets = std::mem::replace(&mut self.snippets, outer);
        snippets.extend(body?);
        Ok(snippets)
    }

    fn fragment_body(
        &mut self,
        children: Children,
        skipped: fn(&str) -> bool,
    ) -> R<Vec<Statement<'o>>> {
        let b = self.b;
        let cleaned = self.plan.fragment(children);
        let items = &cleaned.items;
        let mut frag = Frag::default();
        let mut l = Lists::default();
        self.fragment_hoisted(&cleaned.hoisted, skipped, &mut frag, &mut l)?;
        if items.is_empty() {
            l.initializer.append(&mut l.after);
            return Ok(l.initializer);
        }
        let single_element = match items.as_ref() {
            [Item::Node(identifier)] => match &self.compiler_syntax_tree.node(*identifier).kind {
                NodeKind::Element(e) if e.kind == super::ElementKind::Regular => {
                    Some((*identifier, e.name))
                }
                _ => None,
            },
            _ => None,
        };
        let root = if let Some((el, name)) = single_element {
            let identifier = self.names.generate(name.text(self.source_text));
            self.element(el, &identifier, &mut frag, &mut l)?;
            let flags = if frag.tpl.needs_import_node {
                TEMPLATE_USE_IMPORT_NODE
            } else {
                0
            };
            let callee = self.transform_template(&frag.tpl, cleaned.namespace, "root", flags);
            Some((identifier, b.call(callee, [])))
        } else if let [Item::Text { data, .. }] = items.as_ref() {
            let identifier = self.names.generate("text");
            Some((identifier, b.runtime("text", [b.string(data)])))
        } else {
            let identifier = self.names.generate("fragment");
            let use_space_template = items.iter().any(|i| matches!(i, Item::Expression(_)))
                && items
                    .iter()
                    .all(|i| matches!(i, Item::Text { .. } | Item::Expression(_)));
            if use_space_template {
                let text = self.names.generate("text");
                let initial = Prev::Identifier(text.clone());
                self.process_children(items, initial, false, &mut frag, &mut l)?;
                Some((text, b.runtime("text", [])))
            } else if let Some(standalone) = super::super::component::standalone(
                self.compiler_syntax_tree,
                self.javascript,
                self.res,
                items,
            ) {
                // A lone static component or render tag has no markup to clone, so it mounts at
                // the anchor.
                if let NodeKind::Render { .. } = self.compiler_syntax_tree.node(standalone).kind {
                    self.render_tag(standalone, "$$anchor", &mut frag, &mut l);
                } else {
                    self.component(standalone, "$$anchor", true, &mut frag, &mut l)?;
                }
                None
            } else {
                let initial = Prev::Call {
                    method: "first_child",
                    of: identifier.clone(),
                };
                self.process_children(items, initial, false, &mut frag, &mut l)?;
                let mut flags = TEMPLATE_FRAGMENT;
                if frag.tpl.needs_import_node {
                    flags |= TEMPLATE_USE_IMPORT_NODE;
                }
                let callee = self.transform_template(&frag.tpl, cleaned.namespace, "root", flags);
                Some((identifier, b.call(callee, [])))
            }
        };
        let close = root.map(|(identifier, call)| {
            l.initializer.insert(0, b.var(&identifier, call));
            self.append(&identifier)
        });

        let mut body = Vec::new();
        if cleaned.text_first {
            body.push(b.stmt(b.runtime("next", [])));
        }
        body.append(&mut l.initializer);
        if !l.update.is_empty() {
            let effect = self.render_statement(&mut frag, std::mem::take(&mut l.update));
            body.push(effect);
        }
        body.append(&mut l.after);
        body.extend(close);
        Ok(body)
    }

    fn fragment_hoisted(
        &mut self,
        identifiers: &[CompilerNodeIdentifier],
        skipped: fn(&str) -> bool,
        frag: &mut Frag<'o>,
        lists: &mut Lists<'o>,
    ) -> R<()> {
        for &identifier in identifiers {
            if let NodeKind::Snippet(snippet) = &self.compiler_syntax_tree.node(identifier).kind
                && skipped(self.snippet_name(snippet))
            {
                continue;
            }
            self.hoisted_element(identifier, frag, lists)?;
        }
        Ok(())
    }

    fn append(&self, identifier: &str) -> Statement<'o> {
        let b = self.b;
        b.stmt(b.runtime("append", [b.id("$$anchor"), b.id(identifier)]))
    }

    /// Upstream `build_render_statement`.
    pub(super) fn render_statement(
        &self,
        frag: &mut Frag<'o>,
        mut update: Vec<Statement<'o>>,
    ) -> Statement<'o> {
        let b = self.b;
        let (parameters, values) = std::mem::take(&mut frag.memo).into_effect(b);
        let callback = match update.as_mut_slice() {
            [Statement::ExpressionStatement(s)] => {
                let e = std::mem::replace(&mut s.expression, b.null());
                b.arrow(parameters, e)
            }
            _ => b.arrow_block(parameters, update, false),
        };
        let mut arguments = vec![Some(callback)];
        arguments.push(values);
        b.stmt(b.runtime_some("template_effect", arguments))
    }

    /// Upstream `transform_template`: hoists `var root = $.from_html(…)` (shared by identical
    /// templates) and returns the callee that builds the fragment.
    fn transform_template(
        &mut self,
        tpl: &Template,
        namespace: crate::render_plan::Namespace,
        name: &str,
        flags: u32,
    ) -> Expression<'o> {
        let b = self.b;
        if tpl.is_lone_comment() {
            return b.member(b.id("$"), "comment");
        }
        let markup = tpl.markup();
        let namespace = match namespace {
            crate::render_plan::Namespace::Html => "html",
            crate::render_plan::Namespace::Svg => "svg",
            crate::render_plan::Namespace::Mathml => "mathml",
        };
        let key = format!("{namespace} {flags} {markup}");
        if let Some(existing) = self.templates.get(&key) {
            return b.id(existing);
        }
        let t = b.template([markup.as_str()], []);
        let flags_arg = (flags != 0).then(|| b.number(f64::from(flags)));
        let call = b.runtime_some(
            match namespace {
                "svg" => "from_svg",
                "mathml" => "from_mathml",
                _ => "from_html",
            },
            vec![Some(t), flags_arg],
        );
        let identifier = self.names.unique(name);
        self.hoisted.push(b.var(&identifier, call));
        let read = b.id(&identifier);
        self.templates.insert(key, identifier);
        read
    }
}
