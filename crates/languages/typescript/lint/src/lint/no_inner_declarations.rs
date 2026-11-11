use oxc_ast::AstKind;
use oxc_ast::ast::{ArrowFunctionBody, Directive, FunctionType, VariableDeclarationKind};
use oxc_ast_visit::Visit;
use oxc_semantic::NodeId;
use oxc_span::GetSpan;
use rsvelte_lint_runner::rule::{Report, Reporter};
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::ProgramIdentifier;

use super::{Facts, Root, roots, span};

/// `ESLint`'s `no-inner-declarations` options.
#[derive(Clone, Copy, Debug, Default)]
pub struct NoInnerDeclarationsOptions {
    /// `"both"`: `var` declarations too, not only functions.
    pub variables: bool,
    /// `blockScopedFunctions: "disallow"`.
    pub disallow_block_scoped_functions: bool,
}

/// `ESLint`'s `no-inner-declarations` over `programs` and the parts of the tree outside them.
///
/// A program is a module (strict code) or a script; a host's part, such as a template's
/// expression, is strict. In strict code a function in a block is block-scoped and allowed
/// unless the options disallow it.
pub fn no_inner_declarations(
    semantic: &Semantic,
    programs: &[ProgramIdentifier],
    module: bool,
    options: NoInnerDeclarationsOptions,
    reporter: &mut Reporter<'_>,
) {
    let mut visitor = Visitor {
        f: Facts::new(semantic),
        options,
        reporter,
        contexts: Vec::new(),
    };
    for root in roots(semantic.tree(), programs) {
        let strict = match &root {
            Root::Program(program) => module || has_use_strict(&program.directives),
            // A host's part runs in its component, which is a module.
            _ => true,
        };
        visitor.contexts.clear();
        visitor.contexts.push(Context {
            strict,
            body: "program",
            node: None,
        });
        root.visit(&mut visitor);
    }
}

/// Whether the code is strict, and the body it is in (`getAllowedBodyDescription`), both
/// decided on the way down.
struct Context {
    strict: bool,
    body: &'static str,
    /// The node that opened the context, which closes it when the walk leaves it.
    node: Option<NodeId>,
}

struct Visitor<'s, 'r, 'p> {
    f: Facts<'s>,
    options: NoInnerDeclarationsOptions,
    reporter: &'r mut Reporter<'p>,
    contexts: Vec<Context>,
}

impl<'a> Visit<'a> for Visitor<'_, '_, '_> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        let outer = self.contexts.last().expect("a program opens a context");
        let (strict, body) = (outer.strict, outer.body);
        let reported = match kind {
            AstKind::Function(function)
                if function.r#type == FunctionType::FunctionDeclaration
                    && (self.options.disallow_block_scoped_functions || !strict) =>
            {
                Some(("function", function.node_id.get()))
            }
            AstKind::VariableDeclaration(declaration)
                if declaration.kind == VariableDeclarationKind::Var && self.options.variables =>
            {
                Some(("variable", declaration.node_id.get()))
            }
            _ => None,
        };
        if let Some((what, node)) = reported
            && !at_root(&self.f, node)
        {
            self.reporter.report(
                Report::range(
                    format!("Move {what} declaration to {body} root."),
                    span(kind.span()),
                )
                .message_id("moveDeclToRoot"),
            );
        }
        let inner = match kind {
            AstKind::Class(class) => Some((true, body, class.node_id.get())),
            AstKind::Function(function) => Some((
                strict
                    || function
                        .body
                        .as_ref()
                        .is_some_and(|b| has_use_strict(&b.directives)),
                "function body",
                function.node_id.get(),
            )),
            AstKind::ArrowFunctionExpression(arrow) => Some((
                strict
                    || matches!(
                        &arrow.body,
                        ArrowFunctionBody::FunctionBody(b) if has_use_strict(&b.directives)
                    ),
                "function body",
                arrow.node_id.get(),
            )),
            AstKind::StaticBlock(block) => {
                Some((strict, "class static block body", block.node_id.get()))
            }
            _ => None,
        };
        if let Some((strict, body, node)) = inner {
            self.contexts.push(Context {
                strict,
                body,
                node: Some(node),
            });
        }
    }

    fn leave_node(&mut self, kind: AstKind<'a>) {
        let node = match kind {
            AstKind::Class(class) => class.node_id.get(),
            AstKind::Function(function) => function.node_id.get(),
            AstKind::ArrowFunctionExpression(arrow) => arrow.node_id.get(),
            AstKind::StaticBlock(block) => block.node_id.get(),
            _ => return,
        };
        if self.contexts.last().and_then(|c| c.node) == Some(node) {
            self.contexts.pop();
        }
    }
}

/// A directive prologue that says `"use strict"`, with no escape in its text.
fn has_use_strict(directives: &[Directive<'_>]) -> bool {
    directives.iter().any(|d| d.directive == "use strict")
}

/// The declaration is a statement of a program, a function body or a class static block, or
/// exported.
fn at_root(f: &Facts<'_>, node: NodeId) -> bool {
    f.parent(node).is_none_or(|parent| {
        matches!(
            f.kind(parent),
            AstKind::Program(_)
                | AstKind::FunctionBody(_)
                | AstKind::StaticBlock(_)
                | AstKind::ExportDeclaration(_)
                | AstKind::ExportDefaultDeclaration(_)
        )
    })
}
