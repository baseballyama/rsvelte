use oxc_ast::AstKind;
use oxc_ast::ast::{
    BindingPattern, Expression, TSLiteral, TSType, TSTypeAnnotation, VariableDeclarationKind,
};
use oxc_semantic::{NodeId, SymbolFlags, SymbolId};
use oxc_span::GetSpan;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_syntax::syntax_tree::Component;

use super::{ConditionType, TypeFacts};

impl TypeFacts {
    pub(crate) fn infer(component: &Component, resolution: &Resolution, _source: &str) -> Self {
        let semantic = resolution.semantic();
        let nodes = semantic.nodes();
        let scoping = semantic.scoping();
        let mut facts = Self::new(nodes.iter().map(|node| literal_type(node.kind())).collect());
        // The declaring identifier of each symbol, and the type its annotation gives it.
        let mut identifiers = vec![None; scoping.symbols_len()];
        let mut declared = vec![None; scoping.symbols_len()];
        for node in nodes.iter() {
            match node.kind() {
                AstKind::BindingIdentifier(identifier) => {
                    if let Some(symbol) = identifier.symbol_id.get() {
                        identifiers[symbol.index()].get_or_insert(node.id());
                    }
                }
                AstKind::VariableDeclarator(declarator) => {
                    annotate(&mut declared, &declarator.id, declarator.type_annotation.as_deref());
                }
                AstKind::CatchParameter(parameter) => {
                    annotate(&mut declared, &parameter.pattern, parameter.type_annotation.as_deref());
                }
                AstKind::FormalParameter(parameter) => {
                    if parameter.optional {
                        if let BindingPattern::BindingIdentifier(identifier) = &parameter.pattern
                            && let Some(symbol) = identifier.symbol_id.get()
                        {
                            declared[symbol.index()] = Some(ConditionType::Unknown);
                        }
                    } else {
                        annotate(&mut declared, &parameter.pattern, parameter.type_annotation.as_deref());
                    }
                }
                AstKind::TSAsExpression(expression) => {
                    facts.nodes[node.id().index()] = type_of(&expression.type_annotation);
                }
                _ => {}
            }
        }
        facts.resolve_bindings(resolution, &identifiers, &declared);
        let in_script = |span: oxc_span::Span| {
            [component.instance.as_ref(), component.module.as_ref()]
                .into_iter()
                .flatten()
                .any(|script| {
                    script.content.start_offset <= span.start
                        && span.end <= script.content.end_offset
                })
        };
        for symbol in scoping.symbol_ids() {
            let Some(identifier) = identifiers[symbol.index()] else {
                continue;
            };
            // The template may read a `let` after the script has changed it.
            let variable = matches!(
                resolution.variable_kind(symbol),
                Some(VariableDeclarationKind::Let | VariableDeclarationKind::Var)
            );
            for &reference in scoping.get_resolved_reference_ids(symbol) {
                let node = scoping.get_reference(reference).node_id();
                facts.nodes[node.index()] = if variable && !in_script(nodes.kind(node).span()) {
                    ConditionType::Unknown
                } else {
                    facts.get(identifier)
                };
            }
        }
        // A wrapper follows what it wraps, which has a larger index.
        for index in (0..nodes.len()).rev() {
            let node = nodes.get_node(NodeId::new(index));
            let inner = match node.kind() {
                AstKind::TSSatisfiesExpression(e) => &e.expression,
                AstKind::TSInstantiationExpression(e) => &e.expression,
                AstKind::TSNonNullExpression(e) => &e.expression,
                _ => continue,
            };
            let mut condition = facts.get(inner.node_id());
            if matches!(node.kind(), AstKind::TSNonNullExpression(_))
                && condition == ConditionType::Nullish
            {
                condition = ConditionType::Unknown;
            }
            facts.nodes[node.id().index()] = condition;
        }
        facts
    }

    /// Gives each symbol's identifier its type: the annotation's, or a `const`'s initializer's,
    /// following `const a = b` chains so each dependency is typed first.
    fn resolve_bindings(
        &mut self,
        resolution: &Resolution,
        identifiers: &[Option<NodeId>],
        declared: &[Option<ConditionType>],
    ) {
        let scoping = resolution.scoping();
        let mut completed = vec![false; scoping.symbols_len()];
        let mut chain = Vec::new();
        for symbol in scoping.symbol_ids() {
            let mut current = symbol;
            while !completed[current.index()] {
                completed[current.index()] = true;
                chain.push(current);
                if declared[current.index()].is_some() {
                    break;
                }
                let Some(dependency) = constant_initializer(resolution, current)
                    .and_then(|initializer| identifier_symbol(resolution, initializer))
                else {
                    break;
                };
                current = dependency;
            }
            while let Some(current) = chain.pop() {
                let Some(identifier) = identifiers[current.index()] else {
                    continue;
                };
                self.nodes[identifier.index()] = declared[current.index()]
                    .unwrap_or_else(|| self.initializer_type(resolution, identifiers, current));
            }
        }
    }

    fn initializer_type(
        &self,
        resolution: &Resolution,
        identifiers: &[Option<NodeId>],
        symbol: SymbolId,
    ) -> ConditionType {
        let Some(initializer) = constant_initializer(resolution, symbol) else {
            return ConditionType::Unknown;
        };
        if let Some(dependency) = identifier_symbol(resolution, initializer) {
            return identifiers[dependency.index()]
                .map_or(ConditionType::Unknown, |identifier| self.get(identifier));
        }
        self.get(initializer.node_id())
    }
}

/// The first annotation of a name a pattern declares gives its type.
fn annotate(
    declared: &mut [Option<ConditionType>],
    pattern: &BindingPattern<'_>,
    annotation: Option<&TSTypeAnnotation<'_>>,
) {
    if let BindingPattern::BindingIdentifier(identifier) = pattern
        && let Some(symbol) = identifier.symbol_id.get()
        && let Some(annotation) = annotation
    {
        declared[symbol.index()].get_or_insert_with(|| type_of(&annotation.type_annotation));
    }
}

/// The initializer of a `const` that nothing writes, past the type syntax that changes no type.
fn constant_initializer(resolution: &Resolution, symbol: SymbolId) -> Option<&Expression<'_>> {
    let constant = resolution
        .scoping()
        .symbol_flags(symbol)
        .contains(SymbolFlags::ConstVariable);
    if !constant || resolution.writes(symbol) != 0 {
        return None;
    }
    resolution.initializer(symbol).map(without_erased)
}

/// The symbol an identifier initializer reads.
fn identifier_symbol(resolution: &Resolution, initializer: &Expression<'_>) -> Option<SymbolId> {
    match initializer {
        Expression::Identifier(identifier) => resolution.symbol(identifier),
        _ => None,
    }
}

/// `e satisfies T`, `e!` and `e<T>` have the type of `e`; `e as T` has its own.
fn without_erased<'e>(mut expression: &'e Expression<'e>) -> &'e Expression<'e> {
    loop {
        expression = match expression {
            Expression::TSSatisfiesExpression(e) => &e.expression,
            Expression::TSNonNullExpression(e) => &e.expression,
            Expression::TSInstantiationExpression(e) => &e.expression,
            _ => return expression,
        };
    }
}

/// The condition type of a type written as one keyword or boolean literal.
fn type_of(written: &TSType<'_>) -> ConditionType {
    match written {
        TSType::TSLiteralType(literal) => match &literal.literal {
            TSLiteral::BooleanLiteral(boolean) if boolean.value => ConditionType::Truthy,
            TSLiteral::BooleanLiteral(_) => ConditionType::Falsy,
            _ => ConditionType::Unknown,
        },
        TSType::TSNullKeyword(_) | TSType::TSUndefinedKeyword(_) => ConditionType::Nullish,
        TSType::TSBooleanKeyword(_)
        | TSType::TSNumberKeyword(_)
        | TSType::TSStringKeyword(_)
        | TSType::TSBigIntKeyword(_)
        | TSType::TSSymbolKeyword(_) => ConditionType::NonNullish,
        _ => ConditionType::Unknown,
    }
}

fn literal_type(kind: AstKind<'_>) -> ConditionType {
    match kind {
        AstKind::BooleanLiteral(boolean) => {
            if boolean.value {
                ConditionType::Truthy
            } else {
                ConditionType::Falsy
            }
        }
        AstKind::ObjectExpression(_)
        | AstKind::ArrayExpression(_)
        | AstKind::ArrowFunctionExpression(_)
        | AstKind::Function(_)
        | AstKind::Class(_)
        | AstKind::RegExpLiteral(_) => ConditionType::Truthy,
        AstKind::NullLiteral(_) => ConditionType::Nullish,
        AstKind::NumericLiteral(number) => {
            if number.value == 0.0 || number.value.is_nan() {
                ConditionType::Falsy
            } else {
                ConditionType::Truthy
            }
        }
        AstKind::StringLiteral(string) => {
            if string.value.is_empty() {
                ConditionType::Falsy
            } else {
                ConditionType::Truthy
            }
        }
        _ => ConditionType::Unknown,
    }
}
