//! Lint rules over a document's scope analysis alone, for every language that embeds JavaScript.
//!
//! A host language wraps them in its own [`rsvelte_lint_runner::rule::Rule`]. Its template
//! expressions are in the same [`Semantic`], so their reads are already here; which symbols a
//! rule reports on is the host's decision (`considered`), because the upstream plugins differ:
//! svelte-eslint-parser puts `{#each}` names in the scope core rules read, while Vue's `v-for`
//! names are reported by `vue/no-unused-variables` instead.

mod no_inner_declarations;
mod no_unused_variables;
mod prefer_const;
pub use no_inner_declarations::{NoInnerDeclarationsOptions, no_inner_declarations};
pub use no_unused_variables::no_unused_variables;
use oxc_ast::AstKind;
use oxc_ast::ast::{
    Expression, FormalParameter, FormalParameters, Program, TSTypeName, VariableDeclaration,
};
use oxc_ast_visit::Visit;
use oxc_semantic::{AstNodes, NodeId, ScopeId, Scoping, SymbolId};
use oxc_span::GetSpan;
pub use prefer_const::{PreferConstOptions, ProgramStatements, prefer_const};
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};
use rustc_hash::{FxHashMap, FxHashSet};

/// What a rule over syntax walks: a program, or a part a host keeps apart from the programs,
/// such as a Svelte template's expression.
enum Root<'a> {
    Program(&'a Program<'a>),
    Expression(&'a Expression<'a>),
    Pattern(&'a FormalParameter<'a>),
    Parameters(&'a FormalParameters<'a>),
    Declaration(&'a VariableDeclaration<'a>),
}

impl<'a> Root<'a> {
    fn start(&self) -> u32 {
        match self {
            Self::Program(program) => program.span.start,
            Self::Expression(expression) => expression.span().start,
            Self::Pattern(pattern) => pattern.span.start,
            Self::Parameters(parameters) => parameters.span.start,
            Self::Declaration(declaration) => declaration.span.start,
        }
    }

    fn visit(&self, visitor: &mut impl Visit<'a>) {
        match self {
            Self::Program(program) => visitor.visit_program(program),
            Self::Expression(expression) => visitor.visit_expression(expression),
            Self::Pattern(pattern) => visitor.visit_formal_parameter(pattern),
            Self::Parameters(parameters) => visitor.visit_formal_parameters(parameters),
            Self::Declaration(declaration) => visitor.visit_variable_declaration(declaration),
        }
    }
}

/// `programs` and every part of `tree` outside the programs, in source order.
fn roots<'a>(tree: &'a Tree, programs: &[ProgramIdentifier]) -> Vec<Root<'a>> {
    let mut roots: Vec<Root<'a>> = programs
        .iter()
        .map(|&program| Root::Program(tree.get_program(program)))
        .chain(tree.expressions().map(|(_, e)| Root::Expression(e)))
        .chain(tree.patterns().map(|(_, p)| Root::Pattern(p)))
        .chain(tree.parameters().map(|(_, p)| Root::Parameters(p)))
        .chain(tree.declarations().map(|(_, d)| Root::Declaration(d)))
        .collect();
    roots.sort_by_key(Root::start);
    roots
}

/// A reference as `ESLint`'s scope analysis records it: oxc's, and the write a declaration's
/// initializer, a `for…in`/`for…of` head or a parameter's default makes at the declared name.
#[derive(Clone, Copy, Debug)]
struct Use {
    node: NodeId,
    span: oxc_span::Span,
    read: bool,
    write: bool,
    scope: ScopeId,
}

/// What every rule here asks of one analysis.
struct Facts<'s> {
    scoping: &'s Scoping,
    nodes: &'s AstNodes<'s>,
    /// The declaring identifier of each symbol.
    identifiers: Vec<Option<NodeId>>,
    /// The later declaring identifiers of a redeclared symbol (`var a = 1; var a = 2;`).
    redeclared: FxHashMap<SymbolId, Vec<NodeId>>,
    /// What the left of a qualified type name (`A` of `A.B`) names. typescript-eslint takes any
    /// symbol of that name, where oxc takes only a namespace.
    qualified: FxHashSet<SymbolId>,
}

impl<'s> Facts<'s> {
    fn new(semantic: &'s Semantic) -> Self {
        let scoping = semantic.scoping();
        let nodes = semantic.nodes();
        let mut identifiers = vec![None; scoping.symbols_len()];
        let mut redeclared: FxHashMap<SymbolId, Vec<NodeId>> = FxHashMap::default();
        let mut qualified = FxHashSet::default();
        for node in nodes.iter() {
            match node.kind() {
                AstKind::BindingIdentifier(identifier) => {
                    if let Some(symbol) = identifier.symbol_id.get() {
                        match identifiers[symbol.index()] {
                            None => identifiers[symbol.index()] = Some(node.id()),
                            Some(_) => redeclared.entry(symbol).or_default().push(node.id()),
                        }
                    }
                }
                AstKind::TSQualifiedName(name) => {
                    if let TSTypeName::IdentifierReference(left) = &name.left
                        && left
                            .reference_id
                            .get()
                            .and_then(|r| scoping.get_reference(r).symbol_id())
                            .is_none()
                    {
                        qualified.extend(scoping.find_binding(node.scope_id(), left.name));
                    }
                }
                _ => {}
            }
        }
        Self {
            scoping,
            nodes,
            identifiers,
            redeclared,
            qualified,
        }
    }

    fn kind(&self, node: NodeId) -> AstKind<'s> {
        self.nodes.kind(node)
    }

    fn parent(&self, node: NodeId) -> Option<NodeId> {
        let parent = self.nodes.parent_id(node);
        (parent != node).then_some(parent)
    }

    /// The parent, past parentheses, which `ESTree` does not keep.
    fn parent_past_parentheses(&self, node: NodeId) -> Option<NodeId> {
        let mut parent = self.parent(node)?;
        while matches!(self.kind(parent), AstKind::ParenthesizedExpression(_)) {
            parent = self.parent(parent)?;
        }
        Some(parent)
    }

    fn span(&self, node: NodeId) -> oxc_span::Span {
        self.kind(node).span()
    }

    /// `ESLint`'s `isInside` compares ranges; on one document that is containment.
    fn inside(&self, inner: oxc_span::Span, outer: NodeId) -> bool {
        let outer = self.span(outer);
        outer.start <= inner.start && inner.end <= outer.end
    }

    /// `scope.variableScope`: the nearest function, module, class static block or namespace.
    fn variable_scope(&self, scope: ScopeId) -> ScopeId {
        self.scoping
            .scope_ancestors(scope)
            .find(|&s| {
                let flags = self.scoping.scope_flags(s);
                flags.is_var() || flags.is_arrow()
            })
            .unwrap_or(scope)
    }

    /// The node that declares `symbol`: a declarator, a parameter, a function, an import
    /// specifier, ….
    fn declaration(&self, symbol: SymbolId) -> NodeId {
        self.scoping.symbol_declaration(symbol)
    }

    /// The symbol's references in source order, with the write `ESLint` records at its name.
    fn uses(&self, symbol: SymbolId, out: &mut Vec<Use>) {
        out.clear();
        out.extend(
            self.scoping
                .get_resolved_reference_ids(symbol)
                .iter()
                .map(|&id| {
                    let reference = self.scoping.get_reference(id);
                    let node = reference.node_id();
                    Use {
                        node,
                        span: self.span(node),
                        read: reference.is_read(),
                        write: reference.is_write(),
                        scope: reference.scope_id(),
                    }
                }),
        );
        let later = self.redeclared.get(&symbol).map_or(&[][..], Vec::as_slice);
        for &identifier in self.identifiers[symbol.index()].iter().chain(later) {
            if self.written_where_declared(identifier) {
                out.push(Use {
                    node: identifier,
                    span: self.span(identifier),
                    read: false,
                    write: true,
                    scope: self.nodes.get_node(identifier).scope_id(),
                });
            }
        }
        out.sort_by_key(|u| u.span.start);
    }

    /// A name declared with a value: in a declarator with an initializer, in a `for…in` or
    /// `for…of` head, or under a default.
    fn written_where_declared(&self, identifier: NodeId) -> bool {
        let mut at = identifier;
        while let Some(parent) = self.parent(at) {
            match self.kind(parent) {
                AstKind::VariableDeclarator(declarator) => {
                    return declarator.init.is_some()
                        || self
                            .parent(parent)
                            .and_then(|d| self.parent(d))
                            .is_some_and(|p| {
                                matches!(
                                    self.kind(p),
                                    AstKind::ForInStatement(_) | AstKind::ForOfStatement(_)
                                )
                            });
                }
                AstKind::AssignmentPattern(_) => return true,
                AstKind::FormalParameter(parameter) => return parameter.initializer.is_some(),
                AstKind::ArrayPattern(_)
                | AstKind::ObjectPattern(_)
                | AstKind::BindingProperty(_)
                | AstKind::BindingRestElement(_) => at = parent,
                _ => return false,
            }
        }
        false
    }
}

const fn span(span: oxc_span::Span) -> Span {
    Span {
        start_offset: span.start,
        end_offset: span.end,
    }
}

#[cfg(test)]
mod tests;
