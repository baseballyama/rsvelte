//! svelte2tsx's generic component: the instance and the template in a function of the
//! `generics` type parameters, and a default export whose call signature takes them.

use oxc_ast::ast::{Declaration, Program, Statement};
use rsvelte_svelte_syntax::syntax_tree::Script;

use super::contract::Edit;
use super::{Buffer, Builder, Node, NodeIdentifier, Result, Span, Unsupported, span};

/// A generic component's type parameters and where its render function starts in the scratch.
#[derive(Clone, Copy)]
pub(super) struct Generics {
    pub(super) start: usize,
    type_parameters: Span,
    names: rsvelte_svelte_syntax::syntax_tree::Range,
    /// Each parameter without its modifiers, which an interface or a type alias rejects.
    declared: rsvelte_svelte_syntax::syntax_tree::Range,
}

impl Builder<'_> {
    /// The instance's generics, after its imports, which svelte2tsx keeps outside the render
    /// function.
    pub(super) fn generics(
        &mut self,
        script: &Script,
        program: &Program<'_>,
        edits: &mut Buffer<Edit>,
    ) -> Result<Option<Generics>> {
        let Some(&(attribute, _)) = script
            .attributes
            .iter()
            .find(|(name, _)| name.text(self.source) == "generics")
        else {
            return Ok(None);
        };
        let unsupported = || Unsupported::at("generic component contracts", attribute);
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
        for statement in &program.body {
            match statement {
                Statement::ImportDeclaration(import) => {
                    let at = span(import.span);
                    let import = self.tree.push(Node::SourceCopy { span: at });
                    self.scratch.push(self.tree.push(Node::Statement(import)));
                    edits.push(Edit {
                        span: at,
                        replacement: None,
                    });
                }
                // A type export would leave the render function; svelte2tsx moves it out.
                Statement::ExportDeclaration(export)
                    if matches!(
                        export.declaration,
                        Declaration::TSTypeAliasDeclaration(_)
                            | Declaration::TSInterfaceDeclaration(_)
                    ) =>
                {
                    return Err(Unsupported::at(
                        "generic component contracts",
                        span(export.span),
                    ));
                }
                _ => {}
            }
        }
        if self.scratch.len() > start {
            let parts = self.finish_list(start);
            self.scratch
                .push(self.tree.push(Node::ProgramParts { parts }));
        }
        Ok(Some(Generics {
            start: 0,
            type_parameters: Span::new(first.span.start, last.span.end),
            names,
            declared,
        }))
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
