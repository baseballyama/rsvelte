use oxc_allocator::ArenaBox;
use oxc_ast::ast::{
    BindingPattern, BindingProperty, Expression, FormalParameters, ObjectPropertyKind, Statement,
};
use oxc_span::SPAN;
use rsvelte_svelte_semantic::compiler_syntax_tree::Element;

use super::super::component::{
    Callee, Entry, Prop, SlotCallback, callee, child_snippets, props, props_expression,
    push_accessors, push_binding, push_children,
};
use super::super::lets::{default_slot_takes_props, pattern, slot_lets};
use super::{
    BLOCK_CLOSE, BLOCK_OPEN, BLOCK_OPEN_ELSE, CompilerNodeIdentifier, EMPTY_COMMENT, NodeKind,
    Piece, R, ServerCompilationContext, Target, set_settled,
};
use crate::lower::builder::Runtime;

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `build_inline_component`; a `standalone` component is its fragment's only node, so
    /// it needs no comment to end it.
    pub(super) fn component(
        &mut self,
        identifier: CompilerNodeIdentifier,
        standalone: bool,
        template: &mut Vec<Piece<'o>>,
    ) -> R<()> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("a component element")
        };
        let mut parts = Vec::new();
        let mut css = Vec::new();
        for prop in props(
            tree.attributes(element.attributes),
            self.source_text,
            self.javascript,
        ) {
            match prop {
                Prop::Accessors(a, get, set) => {
                    let mut rewrite = self.rewrite();
                    let functions = (rewrite.expression(get), rewrite.expression(set));
                    let name = a.name.text(self.source_text);
                    // Upstream declares them first in the fragment, with the snippets.
                    let mut declarations = Vec::new();
                    push_accessors(
                        b,
                        &mut parts,
                        &mut declarations,
                        name,
                        functions,
                        &self.names,
                    );
                    self.snippets.append(&mut declarations);
                }
                Prop::Value(a) => {
                    let value = self.attribute_value(a, false, false);
                    let name = a.name.text(self.source_text);
                    parts.push(Entry::Property(b.init(name, value)));
                }
                Prop::CssProperty(a) => {
                    let value = self.attribute_value(a, false, false);
                    css.push(b.init(a.name.text(self.source_text), value));
                }
                Prop::Spread(e) => parts.push(Entry::Spread(self.expression(e))),
                Prop::Attach(_) => {}
                Prop::Bind(a, target) => {
                    let value = self.expression(target);
                    let source = self.javascript.get_expression(target);
                    let assignment = self.rewrite().binding_assignment(source, false);
                    let setter = vec![b.stmt(assignment), set_settled(b, false)];
                    let name = a.name.text(self.source_text);
                    push_binding(b, &mut parts, name, value, setter);
                }
            }
        }
        let (mut declarations, snippets) =
            child_snippets(tree, self.javascript, element.children, |snippet| {
                self.snippet_declaration(snippet)
            })?;
        let callbacks = self.slot_callbacks(identifier, element)?;
        let takes_props = default_slot_takes_props(
            tree,
            self.javascript,
            self.source_text,
            element,
            Target::Server,
        );
        push_children(b, &mut parts, &snippets, callbacks, takes_props);
        let props = props_expression(b, parts, Target::Server);
        let callee = callee(tree, self.javascript, self.res, identifier);
        let function = match callee {
            Callee::Static(reference) | Callee::Dynamic(reference) => self.expression(reference),
            Callee::OwnFunction => b.id(self.component_name),
        };
        let statement = b.stmt(b.call(function, [b.id("$$renderer"), props]));
        let dynamic = matches!(callee, Callee::Dynamic(_));
        let statement = if let Callee::Dynamic(reference) = callee {
            let test = self.expression(reference);
            let consequent = b.block([
                self.push_literal(BLOCK_OPEN),
                statement,
                self.push_literal(BLOCK_CLOSE),
            ]);
            let alternate = b.block([
                self.push_literal(BLOCK_OPEN_ELSE),
                self.push_literal(BLOCK_CLOSE),
            ]);
            b.if_(test, consequent, Some(alternate))
        } else {
            statement
        };
        let statement = if declarations.is_empty() {
            statement
        } else {
            declarations.push(statement);
            b.block(declarations)
        };
        let has_css = !css.is_empty();
        let statement = self.css_props(identifier, css, statement, dynamic);
        template.push(Piece::Statement(statement));
        if !dynamic && !standalone && !has_css {
            template.push(Piece::Text(EMPTY_COMMENT.into()));
        }
        Ok(())
    }

    /// Upstream wraps a component with CSS custom properties in an element that holds them.
    fn css_props(
        &self,
        identifier: CompilerNodeIdentifier,
        css: Vec<ObjectPropertyKind<'o>>,
        statement: Statement<'o>,
        dynamic: bool,
    ) -> Statement<'o> {
        if css.is_empty() {
            return statement;
        }
        let b = self.b;
        let html = self.plan.namespace(identifier) != crate::render_plan::Namespace::Svg;
        let render = b.arrow_block(b.params([]), [statement], false);
        let arguments = vec![
            Some(b.id("$$renderer")),
            Some(b.boolean(html)),
            Some(b.object(css)),
            Some(render),
            dynamic.then(|| b.boolean(true)),
        ];
        b.stmt(b.runtime_some("css_props", arguments))
    }

    /// `($$renderer, { prop, other: pattern })`: a slot's callback takes the props its `let:`
    /// directives name as one object pattern.
    fn slot_parameters(
        &self,
        component: &'o Element,
        slot: &str,
    ) -> R<ArenaBox<'o, FormalParameters<'o>>> {
        let b = self.b;
        let lets = slot_lets(
            self.compiler_syntax_tree,
            self.javascript,
            self.source_text,
            component,
            slot,
        );
        let mut parameters = vec![b.parameter(b.binding("$$renderer"))];
        if !lets.is_empty() {
            let mut properties = Vec::with_capacity(lets.len());
            for directive in &lets {
                let (value, shorthand) = match directive.value {
                    None => (b.binding(directive.prop), true),
                    Some(Expression::Identifier(name)) => {
                        (b.binding(&name.name), name.name == directive.prop)
                    }
                    Some(value) => (pattern(b, directive, value)?, false),
                };
                let key = b.key(directive.prop);
                properties.push(BindingProperty::new(SPAN, key, value, shorthand, false, b));
            }
            let object = BindingPattern::new_object_pattern(SPAN, b.vec(properties), None, b);
            parameters.push(b.parameter(object));
        }
        Ok(b.formal_parameters(parameters))
    }
}

impl<'c, 'o> ServerCompilationContext<'c, 'o> {
    /// Each slot's callback: `($$renderer, { …props })` over the slot's content.
    fn slot_callbacks(
        &mut self,
        identifier: CompilerNodeIdentifier,
        element: &'o Element,
    ) -> R<Vec<SlotCallback<'c, 'o>>> {
        let plan = self.plan;
        let slots = match plan.slots(identifier) {
            None => vec![(
                "default",
                self.fragment_without(element.children, |_| true)?,
            )],
            Some(slots) => slots
                .map(|(name, region)| {
                    let (mut body, template) = self.region_parts(region, |_| true)?;
                    body.extend(template);
                    Ok((name, body))
                })
                .collect::<R<Vec<_>>>()?,
        };
        slots
            .into_iter()
            .map(|(name, body)| Ok((name, self.slot_parameters(element, name)?, body)))
            .collect()
    }
}
