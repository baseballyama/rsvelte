//! Name resolution, the first layer above the surface tree.
//!
//! Every identifier of the script and the
//! template is resolved to a binding, and every binding classified by the rune that declares it.
//! Everything here is a side table over [`BindingIdentifier`]s and the tree's own
//! [`NodeIdentifier`]s; the tree is not touched. Compilation, lint rules and the HIR all read this
//! one resolution.

use rsvelte_javascript::scope::{self, BindingIdentifier, DeclarationKind, Semantic};
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::source::index::IndexVector;

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

#[must_use]
pub fn resolve(
    syntax_tree: &SyntaxTree,
    program: NodeIdentifier,
    template_expressions: &[NodeIdentifier],
) -> Resolution {
    let host: Vec<scope::HostRoot> = template_expressions
        .iter()
        .map(|&e| scope::HostRoot::Expression(e))
        .collect();
    let sem = scope::analyze(syntax_tree, program, &host);
    let bindings = classify(syntax_tree, &sem, program);
    Resolution {
        uses_props: has_props_rune(syntax_tree, program),
        sem,
        bindings,
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

    /// Evaluates `e` of a lowered tree, resolving names in the component scope.
    #[must_use]
    pub fn evaluate_output(
        &self,
        source: &SyntaxTree,
        source_text: &str,
        out: &SyntaxTree,
        e: NodeIdentifier,
    ) -> crate::semantic::evaluate::Evaluation {
        crate::semantic::evaluate::Evaluator::new(source, source_text, self)
            .evaluate(crate::semantic::evaluate::Tree::Output(out), e)
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
