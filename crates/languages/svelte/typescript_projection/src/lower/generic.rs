//! svelte2tsx's generic component: the instance and the template in a function of the
//! `generics` type parameters, and a default export whose call signature takes them.

use oxc_ast::ast::{
    Declaration, ExportDeclaration, Program, Statement, TSInterfaceDeclaration, TSType,
    TSTypeAliasDeclaration, TSTypeName,
};
use oxc_ast_visit::{Visit, walk};
use rsvelte_svelte_syntax::syntax_tree::Script;

use super::contract::Edit;
use super::{Buffer, Builder, Node, NodeIdentifier, Range, Refusal, Result, Span, refuse, span};
use crate::syntax_tree::TypeParameters;

/// A generic component's type parameters and where its render function starts in the scratch.
#[derive(Clone, Copy)]
pub(super) struct Generics {
    pub(super) start: usize,
    type_parameters: TypeParameters,
    names: Range,
    /// Each parameter without its modifiers, which an interface or a type alias rejects.
    declared: Range,
}

impl Builder<'_> {
    /// The instance's generics, after its imports, which svelte2tsx keeps outside the render
    /// function: the `generics` attribute's or, without it, the `$$Generic` aliases'.
    pub(super) fn generics(
        &mut self,
        script: &Script,
        program: &Program<'_>,
        edits: &mut Buffer<Edit>,
    ) -> Result<Option<Generics>> {
        let aliases = DollarGenerics::of(program);
        let attribute = script
            .attributes
            .iter()
            .find(|(name, _)| name.text(self.source) == "generics");
        let (type_parameters, names, declared) = match attribute {
            Some(&(attribute, _)) if aliases.found.is_empty() => {
                self.attribute_generics(script, attribute)?
            }
            Some(_) => {
                return Err(thrown(
                    "Invalid $$Generic declaration: $$Generic definitions are not allowed when \
                     the generics attribute is present on the script tag",
                ));
            }
            None if aliases.found.is_empty() => return Ok(None),
            None => self.alias_generics(&aliases, edits)?,
        };
        self.hoist(program, &aliases, edits)?;
        Ok(Some(Generics {
            start: 0,
            type_parameters,
            names,
            declared,
        }))
    }

    /// The `generics` attribute's parameters, their names and the parameters without modifiers.
    fn attribute_generics(
        &mut self,
        script: &Script,
        attribute: Span,
    ) -> Result<(TypeParameters, Range, Range)> {
        let unsupported = || refuse("generic component contracts", attribute);
        let declaration = script
            .generics
            .map(|generics| self.component.javascript.get_type_parameters(generics))
            .ok_or_else(unsupported)?;
        let (Some(first), Some(last)) = (declaration.params.first(), declaration.params.last())
        else {
            return Err(unsupported());
        };
        let start = self.scratch.len();
        for parameter in &declaration.params {
            let name = span(parameter.name.span);
            self.scratch
                .push(self.tree.push(Node::UnmappedSource(name)));
        }
        let names = self.finish_list(start);
        for parameter in &declaration.params {
            let declared = Span::new(parameter.name.span.start, parameter.span.end);
            self.scratch
                .push(self.tree.push(Node::UnmappedSource(declared)));
        }
        let declared = self.finish_list(start);
        let type_parameters = TypeParameters::Attribute(Span::new(first.span.start, last.span.end));
        Ok((type_parameters, names, declared))
    }

    /// The `$$Generic` aliases as type parameters, which svelte2tsx removes from the script.
    fn alias_generics(
        &mut self,
        aliases: &DollarGenerics,
        edits: &mut Buffer<Edit>,
    ) -> Result<(TypeParameters, Range, Range)> {
        let start = self.scratch.len();
        for alias in &aliases.found {
            self.scratch
                .push(self.tree.push(Node::UnmappedSource(alias.name)));
        }
        let names = self.finish_list(start);
        for alias in &aliases.found {
            let constraint = match alias.arguments[..] {
                [] => None,
                [constraint] => Some(constraint),
                _ => {
                    return Err(thrown(
                        "Invalid $$Generic declaration: Only one type argument allowed",
                    ));
                }
            };
            self.scratch.push(self.tree.push(Node::TypeParameter {
                name: alias.name,
                constraint,
            }));
            edits.push(Edit {
                span: alias.span,
                replacement: None,
            });
        }
        let declared = self.finish_list(start);
        Ok((TypeParameters::Declared(declared), names, declared))
    }

    /// Moves the imports, and each type a constraint names, before the render function, which
    /// would otherwise read the type before declaring it.
    fn hoist(
        &mut self,
        program: &Program<'_>,
        aliases: &DollarGenerics,
        edits: &mut Buffer<Edit>,
    ) -> Result<()> {
        let start = self.scratch.len();
        let mut moved = |builder: &mut Self, at: Span| {
            let copy = builder.tree.push(Node::SourceCopy { span: at });
            builder
                .scratch
                .push(builder.tree.push(Node::Statement(copy)));
            edits.push(Edit {
                span: at,
                replacement: None,
            });
        };
        for statement in &program.body {
            match statement {
                Statement::ImportDeclaration(import) => moved(self, span(import.span)),
                // A type export would leave the render function; svelte2tsx moves it out.
                Statement::ExportDeclaration(export)
                    if matches!(
                        export.declaration,
                        Declaration::TSTypeAliasDeclaration(_)
                            | Declaration::TSInterfaceDeclaration(_)
                    ) && !aliases
                        .found
                        .iter()
                        .any(|alias| alias.span == span(export.span)) =>
                {
                    return Err(refuse("generic component contracts", span(export.span)));
                }
                _ => {}
            }
        }
        for &(declaration, name) in &aliases.named {
            let name = name.text(self.source);
            let constrains = aliases
                .found
                .iter()
                .filter_map(|alias| alias.arguments.first())
                .any(|constraint| constraint.text(self.source) == name);
            if constrains && !aliases.found.iter().any(|alias| alias.span == declaration) {
                moved(self, declaration);
            }
        }
        if self.scratch.len() > start {
            let parts = self.finish_list(start);
            self.scratch
                .push(self.tree.push(Node::ProgramParts { parts }));
        }
        Ok(())
    }

    /// svelte2tsx rejects a `$$Generic` alias in the module script.
    pub(super) fn module_generics(&self) -> Result<()> {
        let Some(script) = &self.component.module else {
            return Ok(());
        };
        let program = self.component.javascript.get_program(script.program);
        DollarGenerics::of(program)
            .found
            .first()
            .map_or(Ok(()), |alias| {
                Err(Refusal::Thrown {
                    message: "$$Generic declarations are only allowed in the instance script",
                    span: alias.span,
                })
            })
    }

    /// Wraps the instance and the template, from `generics.start`, in the render function that
    /// returns `contract`, and exports the component.
    pub(super) fn render(&mut self, contract: NodeIdentifier, generics: Generics) {
        self.scratch.push(self.tree.push(Node::Return(contract)));
        let body = self.finish_list(generics.start);
        self.scratch.push(self.tree.push(Node::Render {
            type_parameters: generics.type_parameters,
            body,
        }));
        self.scratch.push(self.tree.push(Node::GenericExport {
            type_parameters: generics.type_parameters,
            names: generics.names,
            declared: generics.declared,
        }));
    }
}

/// An error svelte2tsx throws without a position, which svelte-check reports at the start.
const fn thrown(message: &'static str) -> Refusal {
    Refusal::Thrown {
        message,
        span: Span::new(0, 0),
    }
}

/// A `type T = $$Generic<C>` anywhere in a script, as svelte2tsx finds it.
struct DollarGeneric {
    /// The declaration with its `export`, which svelte2tsx removes.
    span: Span,
    name: Span,
    arguments: Vec<Span>,
}

#[derive(Default)]
struct DollarGenerics {
    found: Vec<DollarGeneric>,
    /// Every interface and type alias, with its name, which a constraint may name.
    named: Vec<(Span, Span)>,
    /// The `export` around the declaration being visited.
    export: Option<Span>,
}

impl DollarGenerics {
    fn of(program: &Program<'_>) -> Self {
        let mut found = Self::default();
        found.visit_program(program);
        found
    }

    /// The declaration's span with its `export`, which svelte2tsx's node starts at.
    fn declared(&self, declaration: oxc_span::Span) -> Span {
        self.export.unwrap_or_else(|| span(declaration))
    }
}

impl<'a> Visit<'a> for DollarGenerics {
    fn visit_export_declaration(&mut self, it: &ExportDeclaration<'a>) {
        let outer = self.export;
        if matches!(
            it.declaration,
            Declaration::TSTypeAliasDeclaration(_) | Declaration::TSInterfaceDeclaration(_)
        ) {
            self.export = Some(span(it.span));
        }
        walk::walk_export_declaration(self, it);
        self.export = outer;
    }

    fn visit_ts_type_alias_declaration(&mut self, it: &TSTypeAliasDeclaration<'a>) {
        let declared = self.declared(it.span);
        self.export = None;
        self.named.push((declared, span(it.id.span)));
        if let TSType::TSTypeReference(reference) = &it.type_annotation
            && let TSTypeName::IdentifierReference(name) = &reference.type_name
            && name.name == "$$Generic"
        {
            self.found.push(DollarGeneric {
                span: declared,
                name: span(it.id.span),
                arguments: reference
                    .type_arguments
                    .iter()
                    .flat_map(|arguments| &arguments.params)
                    .map(|argument| span(oxc_span::GetSpan::span(argument)))
                    .collect(),
            });
        }
        walk::walk_ts_type_alias_declaration(self, it);
    }

    fn visit_ts_interface_declaration(&mut self, it: &TSInterfaceDeclaration<'a>) {
        let declared = self.declared(it.span);
        self.export = None;
        self.named.push((declared, span(it.id.span)));
        walk::walk_ts_interface_declaration(self, it);
    }
}
