use rsvelte_typescript_semantic::scope::DeclarationKind;
use rsvelte_typescript_syntax::{Kind, NodeIdentifier, SyntaxTree};

use super::ExpressionMetadata;
use super::evaluation::BindingValues;
use crate::input::ComponentInput;
use crate::resolve::{BindingKind, Resolution, rune_call};

/// Computes [`ExpressionMetadata`] the way upstream's analysis visitors do, and `needs_context`.
pub(super) struct MetadataWalker<'a, 'walk, const COLLECT_METADATA: bool> {
    syntax_tree: &'a SyntaxTree,
    res: &'a Resolution,
    values: &'walk mut BindingValues<'a>,
    meta: ExpressionMetadata,
    /// Bindings referenced so far (upstream `metadata.dependencies`, as a count).
    deps: u32,
    needs_context: bool,
    function_depth: u32,
}

impl<'a, 'walk, const COLLECT_METADATA: bool> MetadataWalker<'a, 'walk, COLLECT_METADATA> {
    pub(super) const fn new(
        input: &ComponentInput<'a>,
        res: &'a Resolution,
        values: &'walk mut BindingValues<'a>,
    ) -> Self {
        Self {
            syntax_tree: input.javascript,
            res,
            values,
            meta: ExpressionMetadata {
                has_reference: false,
                has_state: false,
                has_call: false,
                has_member: false,
            },
            deps: 0,
            needs_context: false,
            function_depth: 0,
        }
    }

    pub(super) const fn metadata(&self) -> ExpressionMetadata {
        self.meta
    }

    pub(super) const fn needs_context(&self) -> bool {
        self.needs_context
    }
}

/// What a parent needs to know about a visited child.
#[derive(Clone, Copy)]
pub(super) struct Visited {
    /// Upstream `is_pure`: no binding is read, only unbound globals and literals.
    pure: bool,
    /// The identifier a member chain starts from.
    root: Option<NodeIdentifier>,
}

impl Visited {
    const OPAQUE: Self = Self {
        pure: false,
        root: None,
    };
}

impl<const COLLECT_METADATA: bool> MetadataWalker<'_, '_, COLLECT_METADATA> {
    /// Children first, so that a chain is not walked again at every link.
    pub(super) fn visit(&mut self, identifier: NodeIdentifier) -> Visited {
        let kind = self.syntax_tree.kind(identifier);
        self.needs_context |= matches!(kind, Kind::New { .. });
        match kind {
            Kind::String
            | Kind::Regex { .. }
            | Kind::BigInt
            | Kind::Number(_)
            | Kind::Boolean(_)
            | Kind::Null => Visited {
                pure: true,
                root: None,
            },
            Kind::Identifier(_) => {
                if COLLECT_METADATA {
                    self.reference(identifier);
                }
                Visited {
                    pure: self.res.binding(identifier).is_none(),
                    root: Some(identifier),
                }
            }
            Kind::Member {
                object,
                property,
                computed,
                ..
            } => {
                let visited = self.link(object);
                if computed {
                    self.visit(property);
                }
                self.meta.has_member = true;
                if COLLECT_METADATA && !visited.pure {
                    self.meta.has_state = true;
                }
                if !self.is_safe(visited.root) {
                    self.needs_context = true;
                }
                visited
            }
            Kind::Call {
                callee, arguments, ..
            } => self.call(identifier, callee, arguments),
            Kind::Property {
                key,
                value,
                computed,
                ..
            } => {
                if computed {
                    self.visit(key);
                }
                self.visit(value);
                Visited::OPAQUE
            }
            // Upstream `SpreadElement`: `[...x]` reads like `[...x.values()]`. Its expression state
            // is cleared inside functions.
            Kind::Spread(arg) => {
                if self.function_depth == 0 {
                    self.meta.has_call = true;
                    self.meta.has_state = true;
                }
                Visited {
                    pure: self.visit(arg).pure,
                    root: None,
                }
            }
            Kind::Function { .. } | Kind::Arrow { .. } => {
                let saved_meta = self.meta;
                let saved_deps = self.deps;
                self.function_depth += 1;
                let tree = self.syntax_tree;
                tree.for_each_child(identifier, |child| {
                    self.visit(child);
                });
                self.function_depth -= 1;
                self.meta = saved_meta;
                self.deps = saved_deps;
                Visited::OPAQUE
            }
            _ => {
                let tree = self.syntax_tree;
                tree.for_each_child(identifier, |child| {
                    self.visit(child);
                });
                Visited::OPAQUE
            }
        }
    }

    fn call(
        &mut self,
        identifier: NodeIdentifier,
        callee: NodeIdentifier,
        arguments: &[NodeIdentifier],
    ) -> Visited {
        let rune = rune_call(self.syntax_tree, identifier).map(|(r, _)| r);
        let callee = self.link(callee);
        let mut pure = callee.pure;
        for &a in arguments {
            pure &= self.visit(a).pure;
        }
        if rune.is_none() {
            if !self.is_safe(callee.root) {
                self.needs_context = true;
            }
            if COLLECT_METADATA && (!callee.pure || self.deps > 0) {
                self.meta.has_call = true;
                self.meta.has_state = true;
            }
        } else if rune == Some("$effect.pending") {
            self.meta.has_state = true;
        } else if matches!(rune, Some("$effect" | "$effect.pre" | "$bindable")) {
            self.needs_context = true;
        }
        Visited { pure, root: None }
    }

    /// A member's object or a call's callee. A whole optional chain there is upstream's
    /// `ChainExpression`, which `is_pure` and `is_safe_identifier` do not look through.
    fn link(&mut self, identifier: NodeIdentifier) -> Visited {
        let visited = self.visit(identifier);
        if self.syntax_tree.is_chain(identifier) {
            Visited::OPAQUE
        } else {
            visited
        }
    }

    fn reference(&mut self, identifier: NodeIdentifier) {
        let binding = self.res.binding(identifier);
        let declares = binding.is_some_and(|(b, _)| self.res.sem.bindings[b].node == identifier);
        self.meta.has_reference |= !declares;
        if let Some((binding, info)) = binding
            && !declares
        {
            self.deps += 1;
            let prop = matches!(
                info.kind,
                BindingKind::Property | BindingKind::BindableProperty | BindingKind::RestProperty
            );
            if info.kind != BindingKind::StaticIndex
                && (prop || !info.is_function)
                && !self.values.is_known(binding, identifier)
            {
                self.meta.has_state = true;
            }
        }
    }

    /// Upstream `is_safe_identifier`.
    fn is_safe(&self, root: Option<NodeIdentifier>) -> bool {
        let Some(root) = root else {
            return false;
        };
        let Some((b, info)) = self.res.binding(root) else {
            return true;
        };
        self.res.sem.bindings[b].kind != DeclarationKind::Import
            && !matches!(
                info.kind,
                BindingKind::Property | BindingKind::BindableProperty | BindingKind::RestProperty
            )
    }
}
