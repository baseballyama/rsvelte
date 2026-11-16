//! svelte2tsx's `$$Events`: the events a component declares it dispatches.

use oxc_ast::ast::{
    Expression, ImportDeclarationSpecifier, Program, Statement, TSInterfaceDeclaration,
    TSTypeAliasDeclaration, VariableDeclarator,
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::GetSpan;

use super::super::{Buffer, Builder, Node, Span};
use super::Edit;

impl Builder<'_> {
    /// Whether the instance `program` declares `$$Events`, after typing each later
    /// `createEventDispatcher()` from `svelte` with it, as svelte2tsx does.
    pub(super) fn events_interface(
        &mut self,
        program: &Program<'_>,
        edits: &mut Buffer<Edit>,
    ) -> bool {
        let dispatcher = program.body.iter().find_map(|statement| {
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
        });
        let mut found = Found {
            declared: None,
            dispatcher,
            typed: Vec::new(),
        };
        found.visit_program(program);
        for at in found.typed {
            let typing = self
                .tree
                .push(Node::Identifier("<__sveltets_2_CustomEvents<$$Events>>"));
            edits.push(Edit {
                span: Span::new(at, at),
                replacement: Some(typing),
            });
        }
        found.declared.is_some()
    }
}

struct Found<'p> {
    /// Where the first `$$Events` declaration starts.
    declared: Option<u32>,
    /// The local name of `svelte`'s `createEventDispatcher`.
    dispatcher: Option<&'p str>,
    /// Where each dispatcher creation after the declaration takes its type arguments.
    typed: Vec<u32>,
}

impl<'a> Visit<'a> for Found<'_> {
    fn visit_ts_interface_declaration(&mut self, it: &TSInterfaceDeclaration<'a>) {
        if it.id.name == "$$Events" {
            self.declared.get_or_insert(it.span.start);
        }
        walk::walk_ts_interface_declaration(self, it);
    }

    fn visit_ts_type_alias_declaration(&mut self, it: &TSTypeAliasDeclaration<'a>) {
        if it.id.name == "$$Events" {
            self.declared.get_or_insert(it.span.start);
        }
        walk::walk_ts_type_alias_declaration(self, it);
    }

    fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
        if self.declared.is_some()
            && it.id.get_binding_identifier().is_some()
            && let Some(Expression::CallExpression(call)) = &it.init
            && call.type_arguments.is_none()
            && let Expression::Identifier(callee) = &call.callee
            && Some(callee.name.as_str()) == self.dispatcher
        {
            self.typed.push(callee.span().end);
        }
        walk::walk_variable_declarator(self, it);
    }
}
