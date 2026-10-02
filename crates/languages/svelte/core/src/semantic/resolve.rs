//! Name resolution, the first layer above the surface tree.
//!
//! Every identifier of the script and the
//! template is resolved to a binding, and every binding classified by the rune that declares it.
//! Everything here is a side table over [`BindingIdentifier`]s and the tree's own
//! [`NodeIdentifier`]s; the tree is not touched. Compilation, lint rules and the HIR all read this
//! one resolution.

use rsvelte_kernel::source::index::IndexVector;
use rsvelte_typescript::scope::{
    self, BindingIdentifier, DeclarationKind, HostRoot, HostScope, Semantic,
};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use crate::compilation::compiler_syntax_tree::{
    AttributeValue, Children, CompilerSyntaxTree, NodeKind, Part,
};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum BindingKind {
    Normal,
    State,
    RawState,
    Derived,
    DerivedBy,
    Property,
    BindableProperty,
    RestProperty,
    /// Declared by an `{#each}` context.
    Each,
    /// The index of an unkeyed `{#each}` (upstream `static`): it never changes for an item.
    StaticIndex,
    /// The index of a keyed `{#each}` (upstream `template`).
    KeyedIndex,
}

#[derive(Clone, Copy, Debug)]
pub struct BindingInformation {
    pub kind: BindingKind,
    /// A function declaration or a variable initialised with a function.
    pub is_function: bool,
    /// For props: the default value; for state/derived: the rune's argument.
    pub initial: Option<NodeIdentifier>,
    /// For props: the key in `$$props` (the property name, not the local name).
    pub prop_key: Option<NodeIdentifier>,
}

#[derive(Debug)]
pub struct Resolution {
    pub sem: Semantic,
    pub bindings: IndexVector<BindingIdentifier, BindingInformation>,
    /// The instance calls `$props()` (upstream `needs_props`).
    pub uses_props: bool,
}

/// Resolves the script and the template of `compiler_syntax_tree`, which any frontend may have
/// built over `syntax_tree`.
#[must_use]
pub fn resolve(
    syntax_tree: &SyntaxTree,
    program: NodeIdentifier,
    compiler_syntax_tree: &CompilerSyntaxTree,
) -> Resolution {
    let mut host = Vec::new();
    template_roots(compiler_syntax_tree, compiler_syntax_tree.root, &mut host);
    let sem = scope::analyze(syntax_tree, program, &host);
    let mut bindings = classify(syntax_tree, &sem, program);
    classify_each(syntax_tree, &sem, compiler_syntax_tree, &mut bindings);
    Resolution {
        uses_props: has_props_rune(syntax_tree, program),
        sem,
        bindings,
    }
}

/// The template's expressions in document order, with the scope each `{#each}` opens (upstream
/// `create_scopes`' `EachBlock`: the collection outside it, the key and the body inside it).
fn template_roots(
    compiler_syntax_tree: &CompilerSyntaxTree,
    list: Children,
    out: &mut Vec<HostRoot>,
) {
    for &identifier in compiler_syntax_tree.children(list) {
        match &compiler_syntax_tree.node(identifier).kind {
            NodeKind::Text { .. } | NodeKind::Comment { .. } => {}
            NodeKind::Expression { expression } => out.push(HostRoot::Expression(*expression)),
            NodeKind::Element(el) => {
                for a in compiler_syntax_tree.attributes(el.attributes) {
                    match &a.value {
                        AttributeValue::Boolean | AttributeValue::Static(_) => {}
                        &(AttributeValue::Expression { expression, .. }
                        | AttributeValue::Shorthand(expression)
                        | AttributeValue::Attach(expression)
                        | AttributeValue::Class(expression)
                        | AttributeValue::Spread(expression)) => {
                            out.push(HostRoot::Expression(expression));
                        }
                        AttributeValue::Interpolated(parts) => {
                            out.extend(parts.iter().filter_map(|p| match *p {
                                Part::Expression { expression, .. } => {
                                    Some(HostRoot::Expression(expression))
                                }
                                Part::Text(_) => None,
                            }));
                        }
                        &AttributeValue::Bind(expression) => out.push(HostRoot::Bound(expression)),
                    }
                }
                template_roots(compiler_syntax_tree, el.children, out);
            }
            NodeKind::If {
                branches,
                otherwise,
            } => {
                for b in compiler_syntax_tree.branches(*branches) {
                    out.push(HostRoot::Expression(b.test));
                    template_roots(compiler_syntax_tree, b.body, out);
                }
                if let Some(o) = otherwise {
                    template_roots(compiler_syntax_tree, *o, out);
                }
            }
            NodeKind::Each(each) => {
                out.push(HostRoot::Expression(each.collection));
                let parameters: Vec<NodeIdentifier> =
                    each.context().into_iter().chain(each.index()).collect();
                let mut body = Vec::new();
                body.extend(each.key().map(HostRoot::Expression));
                template_roots(compiler_syntax_tree, each.body, &mut body);
                match parameters.first() {
                    Some(&node) => out.push(HostRoot::Scope(HostScope {
                        node,
                        parameters,
                        body,
                    })),
                    None => out.extend(body),
                }
                if let Some(f) = each.fallback {
                    template_roots(compiler_syntax_tree, f, out);
                }
            }
        }
    }
}

/// Upstream declares an each block's names `each`, and its index `static` or `template`.
fn classify_each(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    compiler_syntax_tree: &CompilerSyntaxTree,
    out: &mut IndexVector<BindingIdentifier, BindingInformation>,
) {
    for n in &compiler_syntax_tree.nodes {
        let NodeKind::Each(each) = &n.kind else {
            continue;
        };
        if let Some(context) = each.context() {
            for_each_pattern_identifier(syntax_tree, context, &mut |identifier| {
                if let Some(b) = sem.binding_of(identifier) {
                    out[b].kind = BindingKind::Each;
                    out[b].is_function = false;
                }
            });
        }
        if let Some(b) = each.index().and_then(|i| sem.binding_of(i)) {
            out[b].kind = if each.keyed(syntax_tree) {
                BindingKind::KeyedIndex
            } else {
                BindingKind::StaticIndex
            };
            out[b].is_function = false;
        }
    }
}

/// The identifiers a binding pattern declares.
pub fn for_each_pattern_identifier(
    syntax_tree: &SyntaxTree,
    p: NodeIdentifier,
    f: &mut impl FnMut(NodeIdentifier),
) {
    match syntax_tree.kind(p) {
        Kind::Identifier(_) => f(p),
        Kind::ObjectPattern(props) => {
            for &pr in props {
                match syntax_tree.kind(pr) {
                    Kind::Property { value, .. } => {
                        for_each_pattern_identifier(syntax_tree, value, f);
                    }
                    Kind::Rest(a) => for_each_pattern_identifier(syntax_tree, a, f),
                    _ => {}
                }
            }
        }
        Kind::ArrayPattern(items) => {
            for &it in items {
                for_each_pattern_identifier(syntax_tree, it, f);
            }
        }
        Kind::AssignPattern(l, _) | Kind::Rest(l) => for_each_pattern_identifier(syntax_tree, l, f),
        _ => {}
    }
}

impl Resolution {
    #[must_use]
    pub fn binding(
        &self,
        ident: NodeIdentifier,
    ) -> Option<(BindingIdentifier, &BindingInformation)> {
        let b = self.sem.binding_of(ident)?;
        Some((b, &self.bindings[b]))
    }

    /// Upstream `is_state_source`: in runes mode a `$state` needs a signal only if it is
    /// reassigned.
    #[must_use]
    pub fn is_state_source(&self, b: BindingIdentifier) -> bool {
        let info = &self.bindings[b];
        matches!(info.kind, BindingKind::State | BindingKind::RawState)
            && self.sem.bindings[b].writes > 0
    }

    /// Upstream `is_prop_source`, runes mode.
    #[must_use]
    pub fn is_prop_source(&self, b: BindingIdentifier) -> bool {
        let info = &self.bindings[b];
        let s = &self.sem.bindings[b];
        matches!(
            info.kind,
            BindingKind::Property | BindingKind::BindableProperty
        ) && (s.writes > 0 || info.initial.is_some() || s.mutations > 0)
    }

    /// Evaluates `e` of the component's own tree.
    #[must_use]
    pub fn evaluate(
        &self,
        syntax_tree: &SyntaxTree,
        source_text: &str,
        e: NodeIdentifier,
    ) -> crate::semantic::evaluate::Evaluation {
        crate::semantic::evaluate::Evaluator::new(syntax_tree, source_text, self)
            .evaluate(crate::semantic::evaluate::Tree::Source, e)
    }

    /// Evaluates `e` of a lowered tree, resolving names in `scope`.
    #[must_use]
    pub fn evaluate_output(
        &self,
        source: &SyntaxTree,
        source_text: &str,
        out: &SyntaxTree,
        e: NodeIdentifier,
        scope: scope::ScopeIdentifier,
    ) -> crate::semantic::evaluate::Evaluation {
        crate::semantic::evaluate::Evaluator::new(source, source_text, self)
            .evaluate(crate::semantic::evaluate::Tree::Output(out, scope), e)
    }
}

fn has_props_rune(syntax_tree: &SyntaxTree, program: NodeIdentifier) -> bool {
    let Kind::Program(body) = syntax_tree.kind(program) else {
        unreachable!("a script parses to a program")
    };
    body.iter()
        .any(|&statement| match syntax_tree.kind(statement) {
            Kind::VariableDeclaration { declarations, .. } => declarations.iter().any(|&d| {
                let Kind::Declarator {
                    initializer: Some(i),
                    ..
                } = syntax_tree.kind(d)
                else {
                    return false;
                };
                rune_call(syntax_tree, i).is_some_and(|(r, _)| r == "$props")
            }),
            _ => false,
        })
}

fn classify(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    program: NodeIdentifier,
) -> IndexVector<BindingIdentifier, BindingInformation> {
    let mut out: IndexVector<BindingIdentifier, BindingInformation> = sem
        .bindings
        .iter()
        .map(|b| BindingInformation {
            kind: BindingKind::Normal,
            // Upstream `Binding.is_function`: never updated, and initialised with a function.
            is_function: b.writes == 0
                && b.mutations == 0
                && (b.kind == DeclarationKind::Function
                    || b.initializer(syntax_tree).is_some_and(|i| {
                        matches!(
                            syntax_tree.kind(i),
                            Kind::Function { .. } | Kind::Arrow { .. }
                        )
                    })),
            initial: None,
            prop_key: None,
        })
        .collect();
    let Kind::Program(body) = syntax_tree.kind(program) else {
        unreachable!("a script parses to a program")
    };
    for &statement in body {
        let Kind::VariableDeclaration { declarations, .. } = syntax_tree.kind(statement) else {
            continue;
        };
        for &d in declarations {
            let Kind::Declarator {
                identifier,
                initializer: Some(initializer),
            } = syntax_tree.kind(d)
            else {
                continue;
            };
            let Some((rune, arg)) = rune_call(syntax_tree, initializer) else {
                continue;
            };
            match rune {
                "$state" | "$state.raw" | "$derived" | "$derived.by" => {
                    let kind = match rune {
                        "$state" => BindingKind::State,
                        "$state.raw" => BindingKind::RawState,
                        "$derived" => BindingKind::Derived,
                        _ => BindingKind::DerivedBy,
                    };
                    if let Some(b) = sem.binding_of(identifier) {
                        out[b].kind = kind;
                        out[b].initial = arg;
                        out[b].is_function = false;
                    }
                }
                "$props" => classify_props(syntax_tree, sem, identifier, &mut out),
                _ => {}
            }
        }
    }
    out
}

fn classify_props(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    pattern: NodeIdentifier,
    out: &mut IndexVector<BindingIdentifier, BindingInformation>,
) {
    match syntax_tree.kind(pattern) {
        Kind::Identifier(_) => {
            if let Some(b) = sem.binding_of(pattern) {
                out[b].kind = BindingKind::RestProperty;
            }
        }
        Kind::ObjectPattern(props) => {
            for &p in props {
                match syntax_tree.kind(p) {
                    Kind::Property { key, value, .. } => {
                        let (local, default) = match syntax_tree.kind(value) {
                            Kind::AssignPattern(l, r) => (l, Some(r)),
                            _ => (value, None),
                        };
                        let bindable = default
                            .and_then(|d| rune_call(syntax_tree, d))
                            .is_some_and(|(r, _)| r == "$bindable");
                        if let Some(b) = sem.binding_of(local) {
                            let info = &mut out[b];
                            info.kind = if bindable {
                                BindingKind::BindableProperty
                            } else {
                                BindingKind::Property
                            };
                            info.initial = if bindable {
                                default
                                    .and_then(|d| rune_call(syntax_tree, d))
                                    .and_then(|(_, a)| a)
                            } else {
                                default
                            };
                            info.prop_key = Some(key);
                            info.is_function = false;
                        }
                    }
                    Kind::Rest(arg) => {
                        if let Some(b) = sem.binding_of(arg) {
                            out[b].kind = BindingKind::RestProperty;
                        }
                    }
                    _ => {}
                }
            }
        }
        _ => {}
    }
}

/// `$name(arg)` or `$name.member(arg)` → (`"$name.member"`, first argument).
#[must_use]
pub fn rune_call(
    syntax_tree: &SyntaxTree,
    e: NodeIdentifier,
) -> Option<(&'static str, Option<NodeIdentifier>)> {
    const RUNES: &[&str] = &[
        "$state",
        "$state.raw",
        "$derived",
        "$derived.by",
        "$props",
        "$bindable",
        "$effect",
        "$effect.pre",
    ];
    let Kind::Call {
        callee, arguments, ..
    } = syntax_tree.kind(e)
    else {
        return None;
    };
    let name = match syntax_tree.kind(callee) {
        Kind::Identifier(_) => syntax_tree.name(callee).to_owned(),
        Kind::Member {
            object,
            property,
            computed: false,
            ..
        } if matches!(syntax_tree.kind(object), Kind::Identifier(_)) => {
            format!(
                "{}.{}",
                syntax_tree.name(object),
                syntax_tree.name(property)
            )
        }
        _ => return None,
    };
    let rune = RUNES.iter().find(|r| **r == name)?;
    Some((rune, arguments.first().copied()))
}
