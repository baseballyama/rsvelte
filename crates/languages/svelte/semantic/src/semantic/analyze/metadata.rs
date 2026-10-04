use rsvelte_typescript::scope::DeclarationKind;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::ExpressionMetadata;
use super::evaluation::BindingValues;
use crate::semantic::input::ComponentInput;
use crate::semantic::resolve::{BindingKind, Resolution, rune_call};

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

impl<const COLLECT_METADATA: bool> MetadataWalker<'_, '_, COLLECT_METADATA> {
    pub(super) fn visit(&mut self, identifier: NodeIdentifier) {
        let kind = self.syntax_tree.kind(identifier);
        self.needs_context |= matches!(kind, Kind::New { .. });
        match kind {
            Kind::Identifier(_) => {
                if COLLECT_METADATA {
                    self.reference(identifier);
                }
            }
            Kind::Member {
                object,
                property,
                computed,
                ..
            } => {
                self.visit(object);
                if computed {
                    self.visit(property);
                }
                self.meta.has_member = true;
                if COLLECT_METADATA && !self.is_pure(identifier) {
                    self.meta.has_state = true;
                }
                if !self.is_safe(identifier) {
                    self.needs_context = true;
                }
            }
            Kind::Call {
                callee, arguments, ..
            } => {
                let rune = rune_call(self.syntax_tree, identifier).map(|(r, _)| r);
                self.visit(callee);
                for &a in arguments {
                    self.visit(a);
                }
                if rune.is_none() {
                    if !self.is_safe(callee) {
                        self.needs_context = true;
                    }
                    if COLLECT_METADATA && (!self.is_pure(callee) || self.deps > 0) {
                        self.meta.has_call = true;
                        self.meta.has_state = true;
                    }
                } else if rune == Some("$effect.pending") {
                    self.meta.has_state = true;
                } else if matches!(rune, Some("$effect" | "$effect.pre" | "$bindable")) {
                    self.needs_context = true;
                }
            }
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
            }
            // Upstream `SpreadElement`: `[...x]` reads like `[...x.values()]`. Its expression state
            // is cleared inside functions.
            Kind::Spread(arg) => {
                if self.function_depth == 0 {
                    self.meta.has_call = true;
                    self.meta.has_state = true;
                }
                self.visit(arg);
            }
            Kind::Function { .. } | Kind::Arrow { .. } => {
                let saved_meta = self.meta;
                let saved_deps = self.deps;
                self.function_depth += 1;
                let tree = self.syntax_tree;
                tree.for_each_child(identifier, |child| self.visit(child));
                self.function_depth -= 1;
                self.meta = saved_meta;
                self.deps = saved_deps;
            }
            _ => {
                let tree = self.syntax_tree;
                tree.for_each_child(identifier, |child| self.visit(child));
            }
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

    fn root_ident(&self, mut e: NodeIdentifier) -> Option<NodeIdentifier> {
        while let Kind::Member { object, .. } = self.syntax_tree.kind(e) {
            e = object;
        }
        matches!(self.syntax_tree.kind(e), Kind::Identifier(_)).then_some(e)
    }

    /// Upstream `is_pure`.
    fn is_pure(&self, e: NodeIdentifier) -> bool {
        match self.syntax_tree.kind(e) {
            Kind::String
            | Kind::Regex { .. }
            | Kind::BigInt
            | Kind::Number(_)
            | Kind::Boolean(_)
            | Kind::Null => true,
            Kind::Call {
                callee, arguments, ..
            } => self.is_pure(callee) && arguments.iter().all(|&a| self.is_pure(a)),
            Kind::Identifier(_) | Kind::Member { .. } => self
                .root_ident(e)
                .is_some_and(|root| self.res.binding(root).is_none()),
            _ => false,
        }
    }

    /// Upstream `is_safe_identifier`.
    fn is_safe(&self, e: NodeIdentifier) -> bool {
        let Some(root) = self.root_ident(e) else {
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
