use oxc_ast::ast::{
    Expression, LogicalOperator, ObjectPropertyKind, PropertyKey, PropertyKind, Statement,
};
use rsvelte_svelte_semantic::compiler_syntax_tree::{Element, Modifiers};
use rsvelte_svelte_semantic::evaluate::Evaluator;

use super::super::component::{
    Callee, Entry, Prop, bind_this, callee, child_snippets, props, props_expression,
    push_accessors, push_binding, push_children,
};
use super::super::derived::{Created, callback};
use super::super::lets::default_slot_takes_props;
use super::{
    AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, ElementKind, Frag, Lists,
    Memo, NodeKind, Part, R, Target,
};
use crate::lower::builder::Runtime;
use crate::render_plan::slot_name;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `build_component`; a `standalone` component is its fragment's only node, so it
    /// has no comment in the template to mount at.
    pub(super) fn component(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        standalone: bool,
        frag: &mut Frag<'o>,
        lists: &mut Lists<'o>,
    ) -> R<()> {
        let b = self.b;
        let tree = self.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("a component element")
        };
        let callee = callee(tree, self.javascript, self.res, identifier);
        // Upstream renders `<svelte:component>` through `$$component`, a name it never generates.
        let intermediate = match callee {
            Callee::Dynamic(_) if element.kind == ElementKind::Component => {
                Some(self.names.generate(element.name.text(self.source_text)))
            }
            Callee::Dynamic(_) => Some("$$component".to_owned()),
            Callee::Static(_) | Callee::OwnFunction => None,
        };
        let mut lets = self.let_directives(identifier, element)?;
        let fills_slot = slot_name(tree, self.source_text, element.attributes).is_some();
        let mut memo = Memo::derived();
        let mut parts = Vec::new();
        let mut accessors = Vec::new();
        let mut css = Vec::new();
        for prop in props(
            tree.attributes(element.attributes),
            self.source_text,
            self.javascript,
        ) {
            self.push_prop(prop, &mut memo, &mut parts, &mut accessors, &mut css);
        }
        self.push_events(
            tree.attributes(element.attributes),
            &mut parts,
            &mut accessors,
        );
        let (mut statements, snippets) =
            child_snippets(tree, self.javascript, element.children, |snippet| {
                self.snippet_declaration(snippet)
            })?;
        let plan = self.plan;
        let mut slots = match plan.slots(identifier) {
            None => vec![(
                "default",
                self.fragment_without(element.children, is_snippet)?,
            )],
            Some(slots) => slots
                .map(|(name, region)| Ok((name, self.region_without(region, is_snippet)?)))
                .collect::<R<Vec<_>>>()?,
        };
        if !fills_slot
            && let Some((_, body)) = slots.iter_mut().find(|(name, _)| *name == "default")
            && !body.is_empty()
        {
            body.splice(0..0, std::mem::take(&mut lets));
        }
        let takes_props = default_slot_takes_props(
            tree,
            self.javascript,
            self.source_text,
            element,
            Target::Client,
        );
        let callbacks = slots
            .into_iter()
            .map(|(name, body)| (name, b.params(["$$anchor", "$$slotProps"]), body))
            .collect();
        push_children(b, &mut parts, &snippets, callbacks, takes_props);
        let props = props_expression(b, parts, Target::Client);
        statements.extend(self.memo_deriveds(memo));
        // Upstream mounts a component with CSS custom properties in an element that holds them.
        let anchor = if css.is_empty() {
            b.id(node)
        } else {
            b.member(b.id(node), "lastChild")
        };
        let call = self.instantiate(element, callee, intermediate, anchor, props);
        statements.extend(self.mount(identifier, node, css, call, standalone, frag));
        lists.initializer.append(&mut accessors);
        // Upstream declares a slot filler's own directives before it, where its attributes see
        // them.
        if fills_slot {
            lists.initializer.append(&mut lets);
        }
        lists.initializer.push(if statements.len() == 1 {
            statements.pop().expect("one statement")
        } else {
            b.block(statements)
        });
        Ok(())
    }

    /// Mounts the component `call` at `node`, or in an element around it that holds its CSS
    /// custom properties.
    fn mount(
        &self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        css: Vec<ObjectPropertyKind<'o>>,
        call: Expression<'o>,
        standalone: bool,
        frag: &mut Frag<'o>,
    ) -> Vec<Statement<'o>> {
        let b = self.b;
        if css.is_empty() {
            if !standalone {
                frag.tpl.push_comment();
            }
            vec![b.stmt(call)]
        } else {
            let svg = self.plan.namespace(identifier) == crate::render_plan::Namespace::Svg;
            frag.tpl
                .push_element(if svg { "g" } else { "svelte-css-wrapper" }, false);
            if !svg {
                frag.tpl
                    .set_prop("style", Some("display: contents".to_owned()));
            }
            frag.tpl.push_comment();
            frag.tpl.pop_element();
            let properties = b.thunk(b.object(css));
            vec![
                b.stmt(b.runtime("css_props", [b.id(node), properties])),
                b.stmt(call),
                b.stmt(b.runtime("reset", [b.id(node)])),
            ]
        }
    }

    /// The call that renders the component at `anchor`, through `$.component` when it may change.
    fn instantiate(
        &self,
        element: &Element,
        callee: Callee,
        intermediate: Option<String>,
        anchor: Expression<'o>,
        props: Expression<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        let this = bind_this(
            self.compiler_syntax_tree.attributes(element.attributes),
            self.source_text,
        );
        let instance = |call| match this {
            Some(target) => self.bind_this(target, call, false),
            None => call,
        };
        match (callee, intermediate) {
            (Callee::Dynamic(reference), Some(intermediate)) => {
                let inner = b.call(b.id(&intermediate), [b.id("$$anchor"), props]);
                let inner = b.stmt(instance(inner));
                let render = b.arrow_block(b.params(["$$anchor", &intermediate]), [inner], false);
                let get = b.thunk(self.expression(reference));
                b.runtime("component", [anchor, get, render])
            }
            (Callee::Static(reference), _) => {
                instance(b.call(self.expression(reference), [anchor, props]))
            }
            _ => instance(b.call(b.id(&self.component_name), [anchor, props])),
        }
    }

    /// Upstream's `$$events`: each `on:` handler by event name, in the order the names first
    /// appear, an array where a name has several.
    fn push_events(
        &mut self,
        attributes: &[super::Attribute],
        parts: &mut Vec<Entry<'o>>,
        declarations: &mut Vec<Statement<'o>>,
    ) {
        let b = self.b;
        let mut events: Vec<(&str, Vec<Expression<'o>>)> = Vec::new();
        for attribute in attributes {
            let AttributeValue::On { handler, modifiers } = attribute.value else {
                continue;
            };
            let mut lists = Lists::default();
            let mut handler = self.directive_handler(handler, &mut lists);
            declarations.append(&mut lists.initializer);
            if modifiers.contains(Modifiers::ONCE) {
                handler = b.runtime("once", [handler]);
            }
            let name = attribute.name.text(self.source_text);
            match events.iter_mut().find(|(n, _)| *n == name) {
                Some((_, handlers)) => handlers.push(handler),
                None => events.push((name, vec![handler])),
            }
        }
        if events.is_empty() {
            return;
        }
        let properties = events.into_iter().map(|(name, mut handlers)| {
            let value = if handlers.len() == 1 {
                handlers.pop().expect("one handler")
            } else {
                b.array(handlers)
            };
            b.init(name, value)
        });
        parts.push(Entry::Property(b.init("$$events", b.object(properties))));
    }

    /// Upstream `Memoizer.deriveds`: `let $0 = $.derived(() => value)` for each memoized value.
    pub(super) fn memo_deriveds(&self, memo: Memo<'o>) -> impl Iterator<Item = Statement<'o>> {
        let b = self.b;
        memo.entries.into_iter().map(move |m| {
            let source = self
                .javascript
                .get_expression(m.source)
                .get_inner_expression();
            let thunk = callback(b, self.res, Some(source), m.value, Created::Template);
            b.let_(&m.name, Some(b.runtime("derived", [thunk])))
        })
    }

    /// A prop as a property or a spread; memoized values become deriveds in `memo`.
    fn push_prop(
        &self,
        prop: Prop<'_>,
        memo: &mut Memo<'o>,
        parts: &mut Vec<Entry<'o>>,
        accessors: &mut Vec<Statement<'o>>,
        css: &mut Vec<ObjectPropertyKind<'o>>,
    ) {
        let b = self.b;
        match prop {
            Prop::CssProperty(a) => {
                let (value, _) = self.attribute_value(a, memo, false);
                css.push(b.init(a.name.text(self.source_text), value));
            }
            Prop::Accessors(a, get, set) => {
                let functions = (self.rewrite(get, true), self.rewrite(set, true));
                let name = a.name.text(self.source_text);
                push_accessors(b, parts, accessors, name, functions, &self.names);
            }
            Prop::Value(a) => {
                let if_state = self.wraps_in_derived(&a.value);
                let (value, has_state) = self.attribute_value(a, memo, if_state);
                let name = a.name.text(self.source_text);
                parts.push(Entry::Property(if has_state {
                    b.getter(name, value)
                } else {
                    b.init(name, value)
                }));
            }
            Prop::Attach(e) => {
                let mut value = self.expression(e);
                // Upstream reads a stateful attachment when the component attaches it.
                if self.an.meta(e).has_state {
                    let javascript = self.javascript.get_expression(e);
                    let evaluation = Evaluator::new(self.res).evaluate(javascript);
                    let callee = if evaluation.is_function {
                        value
                    } else {
                        b.logical(value, LogicalOperator::Or, b.member(b.id("$"), "noop"))
                    };
                    let call = b.call(callee, [b.id("$$node")]);
                    value = b.arrow(b.params(["$$node"]), call);
                }
                let key = PropertyKey::from(b.runtime("attachment", []));
                parts.push(Entry::Property(b.property(key, value, true)));
            }
            Prop::Spread(e) => {
                let built = self.expression(e);
                let value = self.memoize(memo, e, built, false);
                parts.push(Entry::Spread(if self.an.meta(e).has_state {
                    b.thunk(value)
                } else {
                    value
                }));
            }
            Prop::Bind(a, target) => {
                let value = self.expression(target);
                let setter = vec![b.stmt(self.binding_assignment(target, false))];
                let name = a.name.text(self.source_text);
                // A store read through a binding tells the store it is bound.
                let store = matches!(
                    self.javascript.get_expression(target).get_inner_expression(),
                    Expression::Identifier(identifier) if self.rewriter(true).is_store(identifier)
                );
                if store {
                    let mark = b.stmt(b.runtime("mark_store_binding", []));
                    let get = vec![mark, b.return_(Some(value))];
                    parts.push(Entry::Property(b.accessor(
                        PropertyKind::Get,
                        name,
                        b.params([]),
                        get,
                    )));
                    parts.push(Entry::Property(b.accessor(
                        PropertyKind::Set,
                        name,
                        b.params(["$$value"]),
                        setter,
                    )));
                } else {
                    push_binding(b, parts, name, value, setter);
                }
            }
        }
    }

    /// So that the child does not rerun a stateful value on each read; upstream skips names and
    /// members, but not an optional chain, which is a `ChainExpression`.
    fn wraps_in_derived(&self, value: &AttributeValue) -> bool {
        let simple = |e| {
            matches!(
                self.javascript.get_expression(e).get_inner_expression(),
                Expression::Identifier(_)
                    | Expression::StaticMemberExpression(_)
                    | Expression::ComputedMemberExpression(_)
                    | Expression::PrivateFieldExpression(_)
            )
        };
        match value {
            &AttributeValue::Expression { expression, .. } => !simple(expression),
            AttributeValue::Interpolated(parts) => parts.iter().any(
                |part| matches!(*part, Part::Expression { expression, .. } if !simple(expression)),
            ),
            _ => false,
        }
    }
}

/// The hoisted children a component declares itself.
const fn is_snippet(kind: &NodeKind) -> bool {
    matches!(kind, NodeKind::Snippet(_))
}
