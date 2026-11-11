use oxc_ast::ast::{Expression, Statement};
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Children, CompilerNodeIdentifier, MetadataTag,
};

use super::super::component::Standalone;
use super::{
    ClientCompilationContext, ElementKind, Frag, Item, Lists, NodeKind, Prev, R, Template,
    unsupported,
};
use crate::lower::builder::Runtime;
use crate::render_plan::Region;

pub(super) const TEMPLATE_FRAGMENT: u32 = 1;

const TEMPLATE_USE_IMPORT_NODE: u32 = 2;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `Fragment` visitor: the statements of one block.
    pub(super) fn fragment(&mut self, children: Children) -> R<Vec<Statement<'o>>> {
        self.fragment_without(children, |_| false)
    }

    /// Upstream `Fragment` over the children but the hoisted ones for which `skipped` holds,
    /// which the caller lowers itself: the snippets come first (upstream `state.snippets`).
    pub(super) fn fragment_without(
        &mut self,
        children: Children,
        skipped: fn(&NodeKind) -> bool,
    ) -> R<Vec<Statement<'o>>> {
        let plan = self.plan;
        self.region_without(plan.fragment(children), skipped)
    }

    /// [`Self::fragment_without`] over a region the plan prepared, such as one slot's.
    pub(super) fn region_without(
        &mut self,
        region: &Region,
        skipped: fn(&NodeKind) -> bool,
    ) -> R<Vec<Statement<'o>>> {
        let (mut snippets, body) =
            self.collecting_snippets(|context| context.fragment_body(region, skipped));
        snippets.extend(body?);
        Ok(snippets)
    }

    /// `f`'s result and the snippets it declares (upstream `state.snippets`), kept apart.
    pub(super) fn collecting_snippets<T>(
        &mut self,
        f: impl FnOnce(&mut Self) -> T,
    ) -> (Vec<Statement<'o>>, T) {
        let outer = std::mem::take(&mut self.snippets);
        let result = f(self);
        (std::mem::replace(&mut self.snippets, outer), result)
    }

    fn fragment_body(
        &mut self,
        cleaned: &Region,
        skipped: fn(&NodeKind) -> bool,
    ) -> R<Vec<Statement<'o>>> {
        let b = self.b;
        let items = &cleaned.items;
        let mut frag = Frag::default();
        let mut l = Lists::default();
        self.fragment_hoisted(&cleaned.hoisted, skipped, &mut frag, &mut l)?;
        if items.is_empty() {
            l.lets.append(&mut l.consts);
            l.lets.append(&mut l.initializer);
            l.lets.append(&mut l.after);
            return Ok(l.lets);
        }
        let lone_fragment = self.lone_fragment(items)?;
        let single_element = match items.as_ref() {
            [Item::Node(identifier)] => match &self.compiler_syntax_tree.node(*identifier).kind {
                NodeKind::Element(e) if e.kind == ElementKind::Regular => {
                    Some((*identifier, e.name))
                }
                _ => None,
            },
            _ => None,
        };
        let root = if let Some(identifier) = lone_fragment {
            self.special_element(identifier, "", &mut frag, &mut l)?;
            None
        } else if let Some((el, name)) = single_element {
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
                self.source_text,
                items,
            ) {
                // A lone static component or render tag has no markup to clone, so it mounts at
                // the anchor.
                match standalone {
                    Standalone::Render(tag) => self.render_tag(tag, "$$anchor", &mut frag, &mut l),
                    Standalone::Component(component) => {
                        self.component(component, "$$anchor", true, &mut frag, &mut l)?;
                    }
                }
                None
            } else {
                let initial = Prev::Call {
                    method: "first_child",
                    of: identifier.clone(),
                    content: false,
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

        let mut body = std::mem::take(&mut l.lets);
        body.append(&mut l.consts);
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

    /// Upstream's `is_single_child_not_needing_template` for a `<svelte:fragment>`, which renders
    /// at the fragment's anchor; one beside other content is refused.
    fn lone_fragment(&self, items: &[Item<'_>]) -> R<Option<CompilerNodeIdentifier>> {
        let tree = self.compiler_syntax_tree;
        let mut fragments = items.iter().filter_map(|item| match item {
            Item::Node(identifier) => match &tree.node(*identifier).kind {
                NodeKind::Element(e)
                    if e.kind == ElementKind::Metadata(Some(MetadataTag::Fragment)) =>
                {
                    Some(*identifier)
                }
                _ => None,
            },
            _ => None,
        });
        match fragments.next() {
            Some(identifier) if items.len() == 1 => Ok(Some(identifier)),
            Some(identifier) => unsupported(
                "a `<svelte:fragment>` beside other content",
                tree.node(identifier).span,
            ),
            None => Ok(None),
        }
    }

    fn fragment_hoisted(
        &mut self,
        identifiers: &[CompilerNodeIdentifier],
        skipped: fn(&NodeKind) -> bool,
        frag: &mut Frag<'o>,
        lists: &mut Lists<'o>,
    ) -> R<()> {
        for &identifier in identifiers {
            if skipped(&self.compiler_syntax_tree.node(identifier).kind) {
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
    pub(super) fn transform_template(
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
        let call = if tpl.contains_script {
            b.runtime("with_script", [call])
        } else {
            call
        };
        let identifier = self.names.unique(name);
        self.hoisted.push(b.var(&identifier, call));
        let read = b.id(&identifier);
        self.templates.insert(key, identifier);
        read
    }
}
