//! svelte2tsx's `ComponentEvents`: the events a component declares in `$$Events`, or else the
//! events it dispatches and forwards, written as the value its `toDefString` writes.

use std::borrow::Cow;

use oxc_ast::ast::{
    Argument, BindingIdentifier, CallExpression, Expression, ImportDeclarationSpecifier, Program,
    Statement, TSInterfaceDeclaration, TSPropertySignature, TSSignature, TSType,
    TSTypeAliasDeclaration, VariableDeclarator,
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::GetSpan;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, TemplateNode};
use rsvelte_typescript_tree::node_span;

use super::super::{Buffer, Builder, Node, NodeIdentifier, Range, Refusal, Result, Span};
use super::Edit;

mod names;

use names::{UNNAMED_EVENT, UnnamedKey};

/// A component's events: how many svelte2tsx finds, the value whose type the component's events
/// are, and whether they are svelte2tsx's `hasStrictEvents`.
#[derive(Clone, Copy)]
pub(in super::super) struct Events {
    count: usize,
    value: NodeIdentifier,
    pub(in super::super) strict: bool,
}

impl Events {
    /// svelte2tsx's `hasEvents`.
    pub(in super::super) const fn any(self) -> bool {
        self.count > 0
    }
}

/// What forwards an event with a bare `on:`, which svelte2tsx's `EventHandler` types the event
/// by.
enum Forwarder {
    Element,
    Window,
    Body,
    /// A component, by its name.
    Component(Span),
    /// `<svelte:component>`, whose name svelte2tsx writes as the component's, which TypeScript
    /// recovers as `any`.
    Dynamic,
    /// Any other element, such as `<svelte:document>`, whose event svelte2tsx types `undefined`.
    Other,
}

impl<'a> Builder<'a> {
    /// The component's events, after typing each `createEventDispatcher()` from `svelte` that
    /// follows a `$$Events` with it, as svelte2tsx does. `program` is the instance's.
    pub(super) fn events(
        &mut self,
        program: Option<&Program<'_>>,
        edits: &mut Buffer<Edit>,
    ) -> Result<Events> {
        let calls = self.template_calls();
        let forwarded = self.forwarded_events();
        let mut found = Found {
            dispatcher: program.and_then(dispatcher_import),
            top_level: program.map_or(&[], |program| &program.body),
            template: &calls,
            map: forwarded
                .iter()
                .map(|(name, _)| Cow::Borrowed(*name))
                .collect(),
            ..Found::default()
        };
        if let Some(program) = program {
            found.visit_program(program);
        }
        if let Some(key) = found.thrown {
            return Err(Refusal::Thrown {
                message: UNNAMED_EVENT,
                span: self.key_span(key),
            });
        }
        for &at in &found.declared_typings {
            let typing = self
                .tree
                .push(Node::Identifier("<__sveltets_2_CustomEvents<$$Events>>"));
            edits.push(Edit {
                span: Span::new(at, at),
                replacement: Some(typing),
            });
        }
        if let Some(count) = found.declared {
            let declared = self.tree.push(Node::Identifier("$$Events"));
            let value = self.value_of(declared);
            return Ok(Events {
                count,
                value,
                strict: true,
            });
        }
        let mut properties = Vec::new();
        for &Typing {
            written,
            dispatcher,
        } in &found.typings
        {
            let callee = self
                .tree
                .push(Node::Identifier("__sveltets_2_toEventTypings"));
            // svelte2tsx copies the typing, and svelte-check drops the copy's findings, which map
            // nowhere. The dispatcher's type names the typing without resolving it a second time.
            let typing = match dispatcher {
                Some(dispatcher) => {
                    let dispatcher = self.tree.push(Node::UnmappedSource(dispatcher));
                    let dispatcher = self.tree.push(Node::TypeQuery(dispatcher));
                    let arguments = self.tree.list(&[dispatcher]);
                    let callee = self
                        .tree
                        .push(Node::Identifier("__rsvelte_dispatcher_events"));
                    self.tree.push(Node::TypeArguments { callee, arguments })
                }
                None => self.tree.push(Node::UnmappedSource(written)),
            };
            let arguments = self.tree.list(&[typing]);
            let callee = self.tree.push(Node::TypeArguments { callee, arguments });
            let value = self.tree.push(Node::Call {
                callee,
                arguments: Range::default(),
            });
            properties.push(self.tree.push(Node::Spread { value, dots: None }));
        }
        // An event both forwarded and dispatched keeps the dispatched entry, which svelte2tsx
        // writes after the forwarded one, so that no two properties share a name.
        for (name, forwarders) in &forwarded {
            if !found.dispatched.iter().any(|dispatched| dispatched == name) {
                let value = self.forwarded(name, forwarders);
                properties.push(self.event_entry(name, value));
            }
        }
        for name in &found.dispatched {
            let value = self.tree.push(Node::Identifier("__sveltets_2_customEvent"));
            properties.push(self.event_entry(name, value));
        }
        let properties = self.tree.list(&properties);
        Ok(Events {
            count: found.map.len(),
            value: self.tree.push(Node::Object { properties }),
            strict: self.strict_events(),
        })
    }

    /// The events value svelte2tsx's `_events(strict, render)` passes: outside `strict`, a
    /// component also takes any event.
    pub(in super::super) fn events_value(
        &mut self,
        events: Events,
        strict: bool,
    ) -> NodeIdentifier {
        if strict {
            return events.value;
        }
        let callee = self.tree.push(Node::Identifier("__rsvelte_any_event"));
        let arguments = self.tree.list(&[events.value]);
        self.tree.push(Node::Call { callee, arguments })
    }

    /// `__rsvelte_value<written>()`.
    fn value_of(&mut self, written: NodeIdentifier) -> NodeIdentifier {
        let callee = self.tree.push(Node::Identifier("__rsvelte_value"));
        let arguments = self.tree.list(&[written]);
        let callee = self.tree.push(Node::TypeArguments { callee, arguments });
        self.tree.push(Node::Call {
            callee,
            arguments: Range::default(),
        })
    }

    /// `"name": value`.
    fn event_entry(&mut self, name: &str, value: NodeIdentifier) -> NodeIdentifier {
        let name = self.tree.computed_string_literal(name);
        self.tree.push(Node::NamedProperty { name, value })
    }

    /// svelte2tsx's type of an event its `forwarders` forward, a union of a component's when
    /// several components forward it.
    fn forwarded(&mut self, name: &str, forwarders: &[Forwarder]) -> NodeIdentifier {
        let definitions: Vec<NodeIdentifier> = forwarders
            .iter()
            .map(|forwarder| {
                let helper = match forwarder {
                    Forwarder::Element => "__rsvelte_element_event",
                    Forwarder::Window => "__rsvelte_window_event",
                    Forwarder::Body => "__rsvelte_body_event",
                    Forwarder::Other => return self.tree.push(Node::Identifier("undefined")),
                    Forwarder::Dynamic => {
                        let any = self.tree.push(Node::Identifier("any"));
                        return self.value_of(any);
                    }
                    &Forwarder::Component(component) => {
                        let instance = self.tree.push(Node::Identifier("__sveltets_2_instanceOf"));
                        // svelte2tsx reads the component itself, where a finding such as
                        // TS2454 maps nowhere and svelte-check drops it.
                        let component = self.tree.push(Node::UnmappedSource(component));
                        let component = self.tree.push(Node::TypeQuery(component));
                        let component = self.value_of(component);
                        let arguments = self.tree.list(&[component]);
                        let object = self.tree.push(Node::Call {
                            callee: instance,
                            arguments,
                        });
                        let property = self.tree.push(Node::Identifier("$$events_def"));
                        let events = self.tree.push(Node::Member { object, property });
                        let callee = self
                            .tree
                            .push(Node::Identifier("__sveltets_2_bubbleEventDef"));
                        let key = self.tree.computed_string_literal(name);
                        let arguments = self.tree.list(&[events, key]);
                        return self.tree.push(Node::Call { callee, arguments });
                    }
                };
                let callee = self.tree.push(Node::Identifier(helper));
                let key = self.tree.computed_string_literal(name);
                let arguments = self.tree.list(&[key]);
                self.tree.push(Node::Call { callee, arguments })
            })
            .collect();
        if let [definition] = definitions.as_slice() {
            return *definition;
        }
        let callee = self.tree.push(Node::Identifier("__sveltets_2_unionType"));
        let arguments = self.tree.list(&definitions);
        self.tree.push(Node::Call { callee, arguments })
    }

    /// The events a bare `on:` forwards, but on `<svelte:self>`, in the order svelte2tsx's map
    /// holds them: a later element's forward replaces an earlier one, and a component's joins it.
    fn forwarded_events(&self) -> Vec<(&'a str, Vec<Forwarder>)> {
        let source = self.source;
        let component = self.component;
        let mut forwarded: Vec<(&'a str, Vec<Forwarder>)> = Vec::new();
        for node in &component.nodes {
            let TemplateNode::Element {
                name,
                component: reference,
                attributes,
                ..
            } = *node
            else {
                continue;
            };
            let tag = name.text(source);
            if tag == "svelte:self" {
                continue;
            }
            for attribute in component.attributes(attributes) {
                if attribute.kind != AttributeKind::On
                    || !matches!(attribute.value, AttributeValue::True)
                {
                    continue;
                }
                let event = attribute.name.text(source);
                let event = event.strip_prefix("on:").unwrap_or(event);
                let event = event.split('|').next().unwrap_or(event);
                let by = match tag {
                    _ if reference.is_some() => Forwarder::Component(name),
                    "svelte:component" => Forwarder::Dynamic,
                    "svelte:window" => Forwarder::Window,
                    "svelte:body" => Forwarder::Body,
                    "svelte:element" => Forwarder::Element,
                    _ if tag.starts_with("svelte:") || tag == "slot" => Forwarder::Other,
                    _ => Forwarder::Element,
                };
                match forwarded.iter_mut().find(|(name, _)| *name == event) {
                    Some((_, forwarders))
                        if matches!(by, Forwarder::Component(_) | Forwarder::Dynamic) =>
                    {
                        forwarders.push(by);
                    }
                    Some((_, forwarders)) => *forwarders = vec![by],
                    None => forwarded.push((event, vec![by])),
                }
            }
        }
        forwarded
    }

    /// Each call in the template whose callee is a name and whose first argument a literal, as
    /// svelte2tsx's `EventHandler` records them: the name, and the literal as a key.
    fn template_calls(&self) -> Vec<(&'a str, Cow<'a, str>)> {
        let javascript = &self.component.javascript;
        let mut template = TemplateCalls(Vec::new());
        for (_, expression) in javascript.expressions() {
            template.visit_expression(expression);
        }
        for (_, declaration) in javascript.declarations() {
            template.visit_variable_declaration(declaration);
        }
        template.0
    }

    /// svelte2tsx's `strictEvents`: an attribute of any `<script>` or `<style>` that keeps the
    /// component to the events it names.
    fn strict_events(&self) -> bool {
        let source = self.source;
        let component = self.component;
        let strict = |name: Span| name.text(source) == "strictEvents";
        let scripts = component.instance.iter().chain(&component.module);
        (scripts.flat_map(|script| &script.attributes))
            .chain(component.style.iter().flat_map(|style| &style.attributes))
            .any(|&(name, _)| strict(name))
            || component.nodes.iter().any(|node| match *node {
                TemplateNode::Element {
                    name, attributes, ..
                } if matches!(name.text(source), "script" | "style") => component
                    .attributes(attributes)
                    .iter()
                    .any(|attribute| strict(attribute.name)),
                _ => false,
            })
    }
}

/// The local name of `createEventDispatcher` in the instance's first import of it from `svelte`.
fn dispatcher_import<'p>(program: &'p Program<'_>) -> Option<&'p str> {
    program.body.iter().find_map(|statement| {
        let Statement::ImportDeclaration(import) = statement else {
            return None;
        };
        if import.source.value != "svelte" {
            return None;
        }
        import
            .specifiers
            .iter()
            .flatten()
            .find_map(|specifier| match specifier {
                ImportDeclarationSpecifier::ImportSpecifier(named)
                    if named.imported.name() == "createEventDispatcher" =>
                {
                    Some(named.local.name.as_str())
                }
                _ => None,
            })
    })
}

/// svelte2tsx's `ComponentEventsFromEventsMap`, filled in the order it walks the instance.
/// A typed dispatcher's type argument, and the name of the dispatcher where the render function's
/// return can read its type.
#[derive(Clone, Copy)]
struct Typing {
    written: Span,
    dispatcher: Option<Span>,
}

#[derive(Default)]
struct Found<'a, 't> {
    /// The property signatures of the first `$$Events`.
    declared: Option<usize>,
    dispatcher: Option<&'a str>,
    /// The instance's top-level statements, where a bracketed key's variable is looked up and
    /// whose names the render function's return reads.
    top_level: &'t [Statement<'a>],
    /// The first key svelte2tsx's `getName` cannot name an event by, where it throws.
    thrown: Option<UnnamedKey>,
    /// The template's calls, from [`Builder::template_calls`].
    template: &'t [(&'t str, Cow<'t, str>)],
    /// Where each dispatcher creation after `$$Events` takes its type arguments.
    declared_typings: Vec<u32>,
    /// The type argument of each typed dispatcher.
    typings: Vec<Typing>,
    /// Dispatchers created without type arguments, whose calls name events.
    untyped: Vec<&'a str>,
    /// Variables initialized to a string, which a dispatch call may name an event by.
    strings: Vec<(&'a str, &'a str)>,
    /// svelte2tsx's `events`: each event once, forwarded ones first.
    map: Vec<Cow<'t, str>>,
    /// svelte2tsx's `dispatchedEvents`: the events an untyped dispatcher names, and every event
    /// found twice, which it types `CustomEvent<any>`.
    dispatched: Vec<Cow<'t, str>>,
}

impl<'a: 't, 't> Visit<'a> for Found<'a, 't> {
    fn visit_ts_interface_declaration(&mut self, it: &TSInterfaceDeclaration<'a>) {
        if it.id.name == "$$Events" {
            // svelte2tsx reads the keys of every `$$Events`.
            let declared = self.properties(&it.body.body);
            self.declared.get_or_insert(declared);
        }
        walk::walk_ts_interface_declaration(self, it);
    }

    fn visit_ts_type_alias_declaration(&mut self, it: &TSTypeAliasDeclaration<'a>) {
        if it.id.name == "$$Events" {
            let declared = match &it.type_annotation {
                TSType::TSTypeLiteral(literal) => self.properties(&literal.members),
                TSType::TSIntersectionType(intersection) => intersection
                    .types
                    .iter()
                    .map(|part| match part {
                        TSType::TSTypeLiteral(literal) => self.properties(&literal.members),
                        _ => 0,
                    })
                    .sum(),
                _ => 0,
            };
            self.declared.get_or_insert(declared);
        }
        walk::walk_ts_type_alias_declaration(self, it);
    }

    fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
        if let Some(local) = it.id.get_binding_identifier() {
            match &it.init {
                // Only a dispatch call reads them.
                Some(Expression::StringLiteral(value)) if self.dispatcher.is_some() => {
                    if let Some(value) = value.value.as_str() {
                        self.strings.push((local.name.as_str(), value));
                    }
                }
                Some(Expression::CallExpression(call))
                    if matches!(&call.callee, Expression::Identifier(callee)
                        if Some(callee.name.as_str()) == self.dispatcher) =>
                {
                    // The return reads the dispatcher's type where its name is in scope and
                    // its type is the call's.
                    let in_scope = it.type_annotation.is_none()
                        && names::top_level_declarators(self.top_level)
                            .any(|declarator| declarator.span == it.span);
                    self.dispatcher_created(local.name.as_str(), in_scope.then_some(local), call);
                }
                _ => {}
            }
        }
        walk::walk_variable_declarator(self, it);
    }

    fn visit_call_expression(&mut self, it: &CallExpression<'a>) {
        if let Expression::Identifier(callee) = &it.callee
            && self.untyped.contains(&callee.name.as_str())
        {
            let name = match it.arguments.first() {
                Some(Argument::StringLiteral(name)) => name.value.as_str(),
                Some(Argument::Identifier(variable)) => self
                    .strings
                    .iter()
                    .rev()
                    .find(|(name, _)| *name == variable.name.as_str())
                    .map(|&(_, value)| value)
                    // svelte2tsx's `if (str)`.
                    .filter(|value| !value.is_empty()),
                _ => None,
            };
            if let Some(name) = name {
                self.dispatch(Cow::Borrowed(name));
            }
        }
        walk::walk_call_expression(self, it);
    }
}

impl<'a: 't, 't> Found<'a, 't> {
    fn dispatcher_created(
        &mut self,
        local: &'a str,
        binding: Option<&BindingIdentifier<'a>>,
        call: &CallExpression<'a>,
    ) {
        match &call.type_arguments {
            None if self.declared.is_some() => self.declared_typings.push(call.callee.span().end),
            None => {
                self.untyped.push(local);
                let template = self.template;
                for (_, name) in template.iter().filter(|(callee, _)| *callee == local) {
                    self.dispatch(name.clone());
                }
            }
            Some(arguments) => {
                let Some(typing) = arguments.params.first() else {
                    return;
                };
                self.typings.push(Typing {
                    written: node_span(typing),
                    dispatcher: binding.map(node_span),
                });
                let TSType::TSTypeLiteral(literal) = typing else {
                    return;
                };
                for member in &literal.members {
                    let TSSignature::TSPropertySignature(property) = member else {
                        continue;
                    };
                    if let Some(name) = self.event_name(property) {
                        self.add(Cow::Borrowed(name));
                    }
                }
            }
        }
    }

    /// svelte2tsx's `getName`; the first key it throws on is kept.
    fn event_name(&mut self, property: &TSPropertySignature<'a>) -> Option<&'a str> {
        names::event_name(self.top_level, property).unwrap_or_else(|key| {
            self.thrown.get_or_insert(key);
            None
        })
    }

    /// The property signatures among `members`, which svelte2tsx reads as events.
    fn properties(&mut self, members: &[TSSignature<'a>]) -> usize {
        members
            .iter()
            .filter_map(|member| match member {
                TSSignature::TSPropertySignature(property) => self.event_name(property),
                _ => None,
            })
            .count()
    }

    /// svelte2tsx's `addToEvents`: an event found again is typed `CustomEvent<any>`.
    fn add(&mut self, name: Cow<'t, str>) {
        if self.map.contains(&name) {
            self.mark_dispatched(name);
        } else {
            self.map.push(name);
        }
    }

    /// An event an untyped dispatcher names.
    fn dispatch(&mut self, name: Cow<'t, str>) {
        self.add(name.clone());
        self.mark_dispatched(name);
    }

    fn mark_dispatched(&mut self, name: Cow<'t, str>) {
        if !self.dispatched.contains(&name) {
            self.dispatched.push(name);
        }
    }
}

/// The template's calls of a name with a literal first argument.
struct TemplateCalls<'a>(Vec<(&'a str, Cow<'a, str>)>);

impl<'a> Visit<'a> for TemplateCalls<'a> {
    fn visit_call_expression(&mut self, it: &CallExpression<'a>) {
        if let Expression::Identifier(callee) = &it.callee
            && let Some(argument) = it.arguments.first().and_then(Argument::as_expression)
            && let Some(name) = literal_text(argument)
        {
            self.0.push((callee.name.as_str(), name));
        }
        walk::walk_call_expression(self, it);
    }
}

/// The value of a literal as a key, as svelte2tsx's `name.value` gives it.
fn literal_text<'a>(expression: &Expression<'a>) -> Option<Cow<'a, str>> {
    Some(match expression {
        Expression::StringLiteral(value) => Cow::Borrowed(value.value.as_str()?),
        Expression::NumericLiteral(value) => Cow::Owned(value.value.to_string()),
        Expression::BooleanLiteral(value) => {
            Cow::Borrowed(if value.value { "true" } else { "false" })
        }
        Expression::NullLiteral(_) => Cow::Borrowed("null"),
        _ => return None,
    })
}
