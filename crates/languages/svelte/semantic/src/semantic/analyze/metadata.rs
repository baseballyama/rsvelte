use rsvelte_typescript::scope::DeclarationKind;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::{FxBuildHasher, FxHashMap};

use super::ExpressionMetadata;
use super::evaluation::BindingValues;
use crate::semantic::input::ComponentInput;
use crate::semantic::resolve::{BindingKind, Resolution};

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
    /// Each walked call's `is_pure`, so a chain `f()()…` is judged once per link, not once per
    /// link per enclosing call.
    pure_calls: FxHashMap<NodeIdentifier, bool>,
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
            pure_calls: FxHashMap::with_hasher(FxBuildHasher),
        }
    }

    pub(super) const fn metadata(&self) -> ExpressionMetadata {
        self.meta
    }

    pub(super) const fn needs_context(&self) -> bool {
        self.needs_context
    }
}

/// Work left for the walker. Expressions nest thousands deep in real input, so the walk keeps
/// its own stack.
enum Task {
    Visit(NodeIdentifier),
    /// A call's checks, which read what its callee and arguments referenced.
    CallEnd {
        call: NodeIdentifier,
        callee: NodeIdentifier,
        rune: Option<&'static str>,
    },
    /// Leaving a function: its expression state does not reach the enclosing expression.
    FunctionEnd {
        meta: ExpressionMetadata,
        deps: u32,
    },
}

impl<const COLLECT_METADATA: bool> MetadataWalker<'_, '_, COLLECT_METADATA> {
    pub(super) fn visit(&mut self, root: NodeIdentifier) {
        let mut pending = vec![Task::Visit(root)];
        while let Some(task) = pending.pop() {
            match task {
                Task::Visit(identifier) => self.enter(identifier, &mut pending),
                Task::CallEnd { call, callee, rune } => self.call_end(call, callee, rune),
                Task::FunctionEnd { meta, deps } => {
                    self.function_depth -= 1;
                    self.meta = meta;
                    self.deps = deps;
                }
            }
        }
    }

    /// Judges `identifier` and pushes its children so that they pop in source order.
    fn enter(&mut self, identifier: NodeIdentifier, pending: &mut Vec<Task>) {
        let kind = self.syntax_tree.kind(identifier);
        self.needs_context |= matches!(kind, Kind::New { .. });
        let mut base = pending.len();
        match kind {
            Kind::Identifier(_) => {
                if COLLECT_METADATA {
                    self.reference(identifier);
                }
            }
            Kind::Member { .. } => self.member_chain(identifier, pending),
            Kind::Call {
                callee, arguments, ..
            } => {
                let rune = self.res.rune(self.syntax_tree, identifier).map(|(r, _)| r);
                pending.push(Task::CallEnd {
                    call: identifier,
                    callee,
                    rune,
                });
                base += 1;
                pending.push(Task::Visit(callee));
                pending.extend(arguments.iter().map(|&a| Task::Visit(a)));
            }
            Kind::Property {
                key,
                value,
                computed,
                ..
            } => {
                if computed {
                    pending.push(Task::Visit(key));
                }
                pending.push(Task::Visit(value));
            }
            // Upstream `TaggedTemplateExpression`: a tag is a call.
            Kind::TaggedTemplate { tag, quasi } => {
                if COLLECT_METADATA && !self.is_pure(tag) {
                    self.meta.has_call = true;
                    self.meta.has_state = true;
                }
                pending.extend([Task::Visit(tag), Task::Visit(quasi)]);
            }
            // Upstream `SpreadElement`: `[...x]` reads like `[...x.values()]`. Its expression state
            // is cleared inside functions.
            Kind::Spread(arg) => {
                if self.function_depth == 0 {
                    self.meta.has_call = true;
                    self.meta.has_state = true;
                }
                pending.push(Task::Visit(arg));
            }
            Kind::Function { .. } | Kind::Arrow { .. } => {
                pending.push(Task::FunctionEnd {
                    meta: self.meta,
                    deps: self.deps,
                });
                base += 1;
                self.function_depth += 1;
                self.syntax_tree
                    .for_each_child(identifier, |child| pending.push(Task::Visit(child)));
            }
            _ => self
                .syntax_tree
                .for_each_child(identifier, |child| pending.push(Task::Visit(child))),
        }
        if !matches!(kind, Kind::Member { .. }) {
            pending[base..].reverse();
        }
    }

    fn call_end(
        &mut self,
        call: NodeIdentifier,
        callee: NodeIdentifier,
        rune: Option<&'static str>,
    ) {
        // Inner calls end first, so this reads their recorded purity instead of walking them.
        if COLLECT_METADATA {
            let pure = self.is_pure(call);
            self.pure_calls.insert(call, pure);
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

    /// A chain `a.b.c…`, walked down by a loop. Every link shares the innermost one's root, so
    /// only that one is judged.
    fn member_chain(&mut self, identifier: NodeIdentifier, pending: &mut Vec<Task>) {
        let (mut innermost, mut at) = (identifier, identifier);
        // Pushed outermost first, so the root and then the innermost property pop first.
        while let Kind::Member {
            object,
            property,
            computed,
            ..
        } = self.syntax_tree.kind(at)
        {
            if computed {
                pending.push(Task::Visit(property));
            }
            innermost = at;
            at = object;
        }
        pending.push(Task::Visit(at));
        self.meta.has_member = true;
        if COLLECT_METADATA && !self.is_pure(innermost) {
            self.meta.has_state = true;
        }
        if !self.is_safe(innermost) {
            self.needs_context = true;
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

    /// Upstream `is_pure`. A call chain `f()()…` is followed by a loop.
    fn is_pure(&self, mut e: NodeIdentifier) -> bool {
        loop {
            match self.syntax_tree.kind(e) {
                Kind::String
                | Kind::Regex { .. }
                | Kind::BigInt
                | Kind::Number(_)
                | Kind::Boolean(_)
                | Kind::Null => return true,
                Kind::Call {
                    callee, arguments, ..
                } => {
                    if let Some(&pure) = self.pure_calls.get(&e) {
                        return pure;
                    }
                    if !arguments.iter().all(|&a| self.is_pure(a)) {
                        return false;
                    }
                    e = callee;
                }
                Kind::Identifier(_) | Kind::Member { .. } => {
                    return self
                        .root_ident(e)
                        .is_some_and(|root| self.res.binding(root).is_none());
                }
                _ => return false,
            }
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
