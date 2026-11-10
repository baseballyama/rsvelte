//! The warnings the analysis walk emits at JavaScript nodes, in the scripts and in the
//! template's expressions.

use crate::resolve::{BindingKind, RUNES, Resolution, for_each_pattern_target};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_typescript_semantic::scope::DeclarationKind;
use rsvelte_typescript_syntax::syntax_tree::{Class, Control, Kind};
use rsvelte_typescript_syntax::{NodeIdentifier, SyntaxTree};

use rsvelte_typescript_semantic::scope::{BindingIdentifier, ScopeIdentifier};
use rustc_hash::FxHashMap;

use super::found::{Found, Stage};
use super::template::{bidirectional, bidirectional_runs};
use super::warning;
use super::{Options, Section};

/// Where in the walk a node is.
#[derive(Clone, Copy)]
struct Place {
    /// Inside a function.
    function: bool,
    /// Upstream's `function_depth` below the section's program: one for each function, and one
    /// for each `$derived(…)`, `$inspect(…)` or `$props()` pattern around the node.
    depth: u32,
    /// Below an argument of `$state(…)` or `$state.raw(…)`; upstream does not count the
    /// argument itself.
    state_argument: bool,
    /// An argument of `$state(…)` or `$state.raw(…)`.
    state_call_argument: bool,
}

struct Walk<'a> {
    component: &'a Component,
    javascript: &'a SyntaxTree,
    source: &'a str,
    resolution: &'a Resolution,
    runes: bool,
    /// Whether a rune call that subscribes to a store is the `store_rune_conflict` warning: not
    /// when the `runes` option is `false`.
    store_conflicts: bool,
    /// Each unbound `$name` in the order of its first reference, which upstream warns
    /// `store_rune_conflict` in, name by name.
    dollar_names: FxHashMap<&'a str, usize>,
    conflicts: Vec<(usize, Diagnostic)>,
    /// The bindings `export { … }` marks reassigned, from the specifier's start on.
    exported: &'a FxHashMap<BindingIdentifier, u32>,
    section: Section,
    /// The program of the section, whose top-level bindings the walk's depth is 1 for (0 for
    /// the module).
    program: Option<NodeIdentifier>,
    /// In a template's `{let …}` tag, the scope its bindings live in: upstream walks the tag at
    /// that scope's depth.
    declaration_scope: Option<ScopeIdentifier>,
    found: &'a mut Found,
}

/// Walks the module, the instance and the template's expressions.
pub(super) fn walk(
    component: &Component,
    source: &str,
    resolution: &Resolution,
    runes: bool,
    options: Options,
    exported: &FxHashMap<BindingIdentifier, u32>,
    found: &mut Found,
) {
    let mut walk = Walk {
        component,
        javascript: &component.javascript,
        source,
        resolution,
        runes,
        store_conflicts: options.runes != Some(false),
        dollar_names: FxHashMap::default(),
        conflicts: Vec::new(),
        exported,
        section: Section::Module,
        program: None,
        declaration_scope: None,
        found,
    };
    let top = Place {
        function: false,
        depth: 0,
        state_argument: false,
        state_call_argument: false,
    };
    for (section, script) in [
        (Section::Module, &component.module),
        (Section::Instance, &component.instance),
    ] {
        if let Some(script) = script {
            walk.section = section;
            walk.program = Some(script.program);
            walk.node(script.program, None, top);
        }
    }
    walk.section = Section::Template;
    walk.program = None;
    for &expression in &component.template_expressions {
        walk.declaration_scope = declaration_scope(component, resolution, expression);
        walk.node(expression, None, top);
    }
    let mut conflicts = std::mem::take(&mut walk.conflicts);
    conflicts.sort_by_key(|&(order, _)| order);
    for (_, conflict) in conflicts {
        walk.found.push(Stage::Setup, 0, conflict);
    }
}

/// The scope of the bindings a template's `{let …}` tag declares.
fn declaration_scope(
    component: &Component,
    resolution: &Resolution,
    expression: NodeIdentifier,
) -> Option<ScopeIdentifier> {
    let javascript = &component.javascript;
    let Kind::VariableDeclaration { declarations, .. } = javascript.kind(expression) else {
        return None;
    };
    let mut scope = None;
    for &declarator in declarations {
        if let Kind::Declarator { identifier, .. } = javascript.kind(declarator) {
            for_each_pattern_target(javascript, identifier, &mut |name| {
                if let Some(binding) = resolution.sem.binding_of(name) {
                    scope.get_or_insert(resolution.sem.bindings[binding].scope);
                }
            });
        }
    }
    scope
}

impl Walk<'_> {
    fn warn(&mut self, at: u32, warning: Diagnostic) {
        self.found.push(Stage::Walk(self.section), at, warning);
    }

    fn span(&self, node: NodeIdentifier) -> Option<Span> {
        self.javascript.source_location(node).span()
    }

    fn node(&mut self, node: NodeIdentifier, parent: Option<NodeIdentifier>, place: Place) {
        let javascript = self.javascript;
        let Some(span) = self.span(node) else {
            javascript.for_each_child(node, |child| self.node(child, Some(node), place));
            return;
        };
        let at = span.start_offset;
        let mut inner = place;
        inner.state_argument |= place.state_call_argument;
        inner.state_call_argument = false;
        match javascript.kind(node) {
            // Upstream's `ExportSpecifier` visitor does not visit its names.
            Kind::Control(Control::ExportSpecifier { .. }) => return,
            Kind::Identifier(_) => self.identifier(node, parent, place, span),
            // Upstream tests the value, so an escape that spells a control character counts.
            Kind::String => {
                if bidirectional_runs(javascript.str_value(node, self.source))
                    .next()
                    .is_some()
                {
                    self.warn(at, bidirectional(span));
                }
            }
            Kind::TemplateElement { .. } => {
                let raw = javascript.str_value(node, self.source);
                let cooked = if raw.contains(['\\', '\r']) {
                    let raw = raw.replace("\r\n", "\n").replace('\r', "\n");
                    std::borrow::Cow::Owned(
                        rsvelte_typescript_syntax::lexer::decode_string(&raw).unwrap_or(raw),
                    )
                } else {
                    std::borrow::Cow::Borrowed(raw)
                };
                if bidirectional_runs(&cooked).next().is_some() {
                    self.warn(at, bidirectional(span));
                }
            }
            Kind::Function { .. } | Kind::Arrow { .. } => {
                inner.function = true;
                inner.depth += 1;
                // Upstream looks for an enclosing `$state(…)` only up to the nearest function.
                inner.state_argument = false;
            }
            Kind::Class(Class::Definition {
                declaration: true, ..
            }) => {
                // The module allows a class at its top level, a component at the instance's.
                let nested = place.function || self.section == Section::Template;
                if nested {
                    self.warn(
                        at,
                        warning(
                            "perf_avoid_nested_class",
                            "Avoid declaring classes below the top level scope",
                            span,
                        ),
                    );
                }
            }
            Kind::New { callee, .. } => {
                let inline = matches!(javascript.kind(callee), Kind::Class(_))
                    && (place.function || self.section != Section::Module);
                if inline {
                    self.warn(
                        at,
                        warning(
                            "perf_avoid_inline_class",
                            "Avoid 'new class' — instead, declare the class at the top level scope",
                            span,
                        ),
                    );
                }
            }
            Kind::ExpressionStatement(expression) => self.component_creation(expression),
            _ => {}
        }
        let rune = self.resolution.rune(javascript, node).map(|(rune, _)| rune);
        let callee = match javascript.kind(node) {
            Kind::Call { callee, .. } => Some(callee),
            _ => None,
        };
        // Upstream walks a `$props()` pattern one function deeper, so its fallbacks do not warn.
        let props_pattern = match javascript.kind(node) {
            Kind::Declarator {
                identifier,
                initializer: Some(init),
            } if self
                .resolution
                .rune(javascript, init)
                .is_some_and(|(rune, _)| rune == "$props") =>
            {
                Some(identifier)
            }
            _ => None,
        };
        javascript.for_each_child(node, |child| {
            let mut child_place = inner;
            child_place.depth += u32::from(Some(child) == props_pattern);
            if Some(child) != callee {
                child_place.depth += u32::from(matches!(rune, Some("$derived" | "$inspect")));
                child_place.state_call_argument = matches!(rune, Some("$state" | "$state.raw"));
            }
            self.node(child, Some(node), child_place);
        });
    }

    /// `state_referenced_locally`: a read of reactive state where the walk's depth is the
    /// binding's, so it only sees the initial value.
    fn identifier(
        &mut self,
        node: NodeIdentifier,
        parent: Option<NodeIdentifier>,
        place: Place,
        span: Span,
    ) {
        self.store_conflict(node, parent, span);
        if !self.runes {
            return;
        }
        let javascript = self.javascript;
        let sem = &self.resolution.sem;
        let Some((binding, info)) = self.resolution.binding(node) else {
            return;
        };
        let declared = &sem.bindings[binding];
        // The declarator's visitor gives a binding its rune kind, so earlier reads see a plain one.
        let declared_before = javascript
            .source_location(declared.node)
            .span()
            .is_some_and(|d| d.start_offset < span.start_offset);
        let same_depth = match (self.program, self.declaration_scope) {
            (Some(program), _) => self.function_depth(declared.scope, program) == Some(place.depth),
            (None, Some(scope)) => declared.scope == scope && place.depth == 0,
            (None, None) => false,
        };
        if !declared_before || !same_depth {
            return;
        }
        let reactive = match info.kind {
            BindingKind::State => {
                let exported = self.exported.get(&binding).is_some_and(|&at| {
                    self.section == Section::Template
                        || (self.section == Section::Instance && at < span.start_offset)
                });
                declared.writes > 0
                    || exported
                    || declared.initializer(javascript).is_some_and(|init| {
                        matches!(javascript.kind(init), Kind::Call { arguments: [only], .. }
                            if !matches!(javascript.kind(*only), Kind::Spread(_))
                                && !self.resolution.should_proxy(javascript, *only))
                    })
            }
            BindingKind::RawState
            | BindingKind::Derived
            | BindingKind::DerivedBy
            | BindingKind::Property
            | BindingKind::RestProperty => true,
            _ => false,
        };
        let written = parent.is_some_and(|p| match javascript.kind(p) {
            Kind::Assign(_, left, _) => left == node,
            Kind::Update { .. } => true,
            _ => false,
        });
        if !reactive || written {
            return;
        }
        let name = javascript.name(node);
        let kind = if place.state_argument {
            "derived"
        } else {
            "closure"
        };
        let message = format!(
            "This reference only captures the initial value of `{name}`. Did you mean to reference it inside a {kind} instead?"
        );
        self.warn(
            span.start_offset,
            warning("state_referenced_locally", &message, span),
        );
    }

    /// How many functions enclose `scope` below `program`; `None` outside `program`.
    fn function_depth(&self, mut scope: ScopeIdentifier, program: NodeIdentifier) -> Option<u32> {
        let scopes = &self.resolution.sem.scopes;
        let mut depth = 0;
        while scopes[scope].node != program {
            depth += u32::from(scopes[scope].function);
            scope = scopes[scope].parent?;
        }
        Some(depth)
    }

    /// `store_rune_conflict`: `$name(…)` where `name` is a local binding, so it subscribes to a
    /// store rather than calling the rune.
    fn store_conflict(&mut self, node: NodeIdentifier, parent: Option<NodeIdentifier>, span: Span) {
        let javascript = self.javascript;
        let name = javascript.name(node);
        let Some(store) = name.strip_prefix('$') else {
            return;
        };
        if self.resolution.sem.binding_of(node).is_some() {
            return;
        }
        let next = self.dollar_names.len();
        let order = *self.dollar_names.entry(name).or_insert(next);
        let called = parent.is_some_and(|p| matches!(javascript.kind(p), Kind::Call { .. }));
        if called
            && self.store_conflicts
            && RUNES.contains(&name)
            && self.resolution.is_store_subscription(name)
        {
            let message = format!(
                "It looks like you're using the `{name}` rune, but there is a local binding called `{store}`. Referencing a local variable with a `$` prefix will create a store subscription. Please rename `{store}` to avoid the ambiguity"
            );
            self.conflicts
                .push((order, warning("store_rune_conflict", &message, span)));
        }
    }

    /// `legacy_component_creation`: `new Component({ target })` of a default import from a
    /// `.svelte` file.
    fn component_creation(&mut self, expression: NodeIdentifier) {
        let javascript = self.javascript;
        let Kind::New {
            callee,
            arguments: [options],
        } = javascript.kind(expression)
        else {
            return;
        };
        let Kind::Object(properties) = javascript.kind(*options) else {
            return;
        };
        let targets = properties.iter().any(|&p| {
            matches!(javascript.kind(p), Kind::Property { key, computed: false, .. }
                if matches!(javascript.kind(key), Kind::Identifier(_)) && javascript.name(key) == "target")
        });
        if !targets || !matches!(javascript.kind(callee), Kind::Identifier(_)) {
            return;
        }
        let sem = &self.resolution.sem;
        let Some(binding) = sem.binding_of(callee) else {
            return;
        };
        let declared = &sem.bindings[binding];
        let Some(specifier) = declared.declaration else {
            return;
        };
        if declared.kind != DeclarationKind::Import
            || !matches!(javascript.kind(specifier), Kind::ImportDefault(_))
        {
            return;
        }
        let from_svelte = self.imports().any(|(specifiers, source)| {
            specifiers.contains(&specifier)
                && javascript
                    .str_value(source, self.source)
                    .ends_with(".svelte")
        });
        if from_svelte && let Some(span) = self.span(expression) {
            self.warn(span.start_offset, warning(
                "legacy_component_creation",
                "Svelte 5 components are no longer classes. Instantiate them using `mount` or `hydrate` (imported from 'svelte') instead.",
                span,
            ));
        }
    }

    /// The import declarations of both scripts: their specifiers and source.
    fn imports(&self) -> impl Iterator<Item = (&[NodeIdentifier], NodeIdentifier)> {
        let javascript = self.javascript;
        [&self.component.module, &self.component.instance]
            .into_iter()
            .flatten()
            .flat_map(move |script| match javascript.kind(script.program) {
                Kind::Program(statements) => statements,
                _ => &[],
            })
            .filter_map(move |&statement| match javascript.kind(statement) {
                Kind::Import {
                    specifiers, source, ..
                } => Some((specifiers, source)),
                _ => None,
            })
    }
}
