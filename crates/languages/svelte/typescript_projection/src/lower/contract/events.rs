//! svelte2tsx's `ComponentEvents`: the events a component declares in `$$Events`, or else the
//! events it dispatches and forwards.

use std::borrow::Cow;

use oxc_ast::ast::{
    Argument, CallExpression, Expression, ImportDeclarationSpecifier, Program, PropertyKey,
    Statement, TSInterfaceDeclaration, TSSignature, TSType, TSTypeAliasDeclaration,
    VariableDeclarator,
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::GetSpan;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, TemplateNode};

use super::super::{Buffer, Builder, Node, Span};
use super::Edit;

/// Where svelte2tsx reads a component's events from, with how many it finds.
#[derive(Clone, Copy)]
pub(in super::super) enum Events {
    /// `$$Events`: its property signatures.
    Declared { properties: usize },
    /// The names the component dispatches through a `createEventDispatcher` from `svelte`, and
    /// the events its template forwards with a bare `on:`.
    Inferred { names: usize },
}

impl Events {
    /// svelte2tsx's `hasEvents`.
    pub(in super::super) const fn any(self) -> bool {
        match self {
            Self::Declared { properties: count } | Self::Inferred { names: count } => count > 0,
        }
    }
}

impl Builder<'_> {
    /// The component's events, after typing each `createEventDispatcher()` from `svelte` that
    /// follows a `$$Events` with it, as svelte2tsx does. `program` is the instance's.
    pub(super) fn events(
        &mut self,
        program: Option<&Program<'_>>,
        edits: &mut Buffer<Edit>,
    ) -> Events {
        let mut found = Found {
            dispatcher: program.and_then(dispatcher_import),
            ..Found::default()
        };
        if let Some(program) = program {
            found.visit_program(program);
        }
        for &at in &found.typed {
            let typing = self
                .tree
                .push(Node::Identifier("<__sveltets_2_CustomEvents<$$Events>>"));
            edits.push(Edit {
                span: Span::new(at, at),
                replacement: Some(typing),
            });
        }
        if let Some(properties) = found.declared {
            return Events::Declared { properties };
        }
        let mut names = found.names;
        let javascript = &self.component.javascript;
        let mut template = TemplateCalls {
            dispatchers: &found.untyped,
            names: Vec::new(),
        };
        for (_, expression) in javascript.expressions() {
            template.visit_expression(expression);
        }
        for (_, declaration) in javascript.declarations() {
            template.visit_variable_declaration(declaration);
        }
        names.extend(template.names);
        names.extend(self.forwarded_events().map(Cow::Borrowed));
        names.sort_unstable();
        names.dedup();
        Events::Inferred { names: names.len() }
    }

    /// The events a bare `on:` forwards, but on `<svelte:self>`.
    fn forwarded_events(&self) -> impl Iterator<Item = &str> {
        let source = self.source;
        let component = &self.component;
        component
            .nodes
            .iter()
            .filter_map(move |node| match *node {
                TemplateNode::Element {
                    name, attributes, ..
                } if name.text(source) != "svelte:self" => Some(component.attributes(attributes)),
                _ => None,
            })
            .flatten()
            .filter(|attribute| {
                attribute.kind == AttributeKind::On
                    && matches!(attribute.value, AttributeValue::True)
            })
            .map(move |attribute| {
                let event = attribute.name.text(source);
                let event = event.strip_prefix("on:").unwrap_or(event);
                event.split('|').next().unwrap_or(event)
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

#[derive(Default)]
struct Found<'a> {
    /// The property signatures of the first `$$Events`.
    declared: Option<usize>,
    dispatcher: Option<&'a str>,
    /// Where each dispatcher creation after `$$Events` takes its type arguments.
    typed: Vec<u32>,
    /// Dispatchers created without type arguments, whose calls name events.
    untyped: Vec<&'a str>,
    /// Variables initialized to a string, which a dispatch call may name an event by.
    strings: Vec<(&'a str, &'a str)>,
    names: Vec<Cow<'a, str>>,
}

impl<'a> Visit<'a> for Found<'a> {
    fn visit_ts_interface_declaration(&mut self, it: &TSInterfaceDeclaration<'a>) {
        if it.id.name == "$$Events" && self.declared.is_none() {
            self.declared = Some(properties(&it.body.body));
        }
        walk::walk_ts_interface_declaration(self, it);
    }

    fn visit_ts_type_alias_declaration(&mut self, it: &TSTypeAliasDeclaration<'a>) {
        if it.id.name == "$$Events" && self.declared.is_none() {
            self.declared = Some(match &it.type_annotation {
                TSType::TSTypeLiteral(literal) => properties(&literal.members),
                TSType::TSIntersectionType(intersection) => intersection
                    .types
                    .iter()
                    .map(|part| match part {
                        TSType::TSTypeLiteral(literal) => properties(&literal.members),
                        _ => 0,
                    })
                    .sum(),
                _ => 0,
            });
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
                    self.dispatcher_created(local.name.as_str(), call);
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
                    .map(|&(_, value)| value),
                _ => None,
            };
            self.names.extend(name.map(Cow::Borrowed));
        }
        walk::walk_call_expression(self, it);
    }
}

impl<'a> Found<'a> {
    fn dispatcher_created(&mut self, local: &'a str, call: &CallExpression<'a>) {
        match &call.type_arguments {
            None if self.declared.is_some() => self.typed.push(call.callee.span().end),
            None => self.untyped.push(local),
            Some(arguments) => {
                if let Some(TSType::TSTypeLiteral(literal)) = arguments.params.first() {
                    self.names
                        .extend(literal.members.iter().filter_map(|member| {
                            let TSSignature::TSPropertySignature(property) = member else {
                                return None;
                            };
                            match &property.key {
                                PropertyKey::StaticIdentifier(name) => {
                                    Some(Cow::Borrowed(name.name.as_str()))
                                }
                                PropertyKey::StringLiteral(name) => {
                                    name.value.as_str().map(Cow::Borrowed)
                                }
                                _ => None,
                            }
                        }));
                }
            }
        }
    }
}

/// The property signatures among `members`, which svelte2tsx reads as events.
fn properties(members: &[TSSignature<'_>]) -> usize {
    members
        .iter()
        .filter(|member| matches!(member, TSSignature::TSPropertySignature(_)))
        .count()
}

/// The events the template's calls of an untyped dispatcher name, by a literal.
struct TemplateCalls<'d, 'a> {
    dispatchers: &'d [&'d str],
    names: Vec<Cow<'a, str>>,
}

impl<'a> Visit<'a> for TemplateCalls<'_, 'a> {
    fn visit_call_expression(&mut self, it: &CallExpression<'a>) {
        if let Expression::Identifier(callee) = &it.callee
            && self.dispatchers.contains(&callee.name.as_str())
            && let Some(argument) = it.arguments.first().and_then(Argument::as_expression)
            && let Some(name) = literal_text(argument)
        {
            self.names.push(name);
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
