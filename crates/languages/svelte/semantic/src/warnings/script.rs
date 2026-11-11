//! The warnings the analysis walk emits at JavaScript nodes, in the scripts and in the
//! template's expressions.

use std::borrow::Cow;

use oxc_ast::AstKind;
use oxc_ast::ast::{
    Argument, AssignmentExpression, AssignmentTarget, CallExpression, ChainElement,
    ChainExpression, ClassType, Expression, IdentifierReference, ImportDeclarationSpecifier,
    ModuleExportName, ObjectPropertyKind, PropertyKey, SimpleAssignmentTarget, Statement, TSType,
    UpdateExpression, VariableDeclarator,
};
use oxc_ast_visit::{Visit, walk};
use oxc_semantic::{ScopeId, SymbolFlags, SymbolId};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_typescript_tree::{
    DeclarationIdentifier, ExpressionIdentifier, ParametersIdentifier, PatternIdentifier,
};
use rustc_hash::FxHashMap;

use super::found::{Found, Stage};
use super::template::{bidirectional, bidirectional_runs};
use super::{Options, Scripts, Section, span, warning};
use crate::compiler_syntax_tree::CompilerSyntaxTree;
use crate::resolve::{BindingKind, RUNES, Resolution, Roots, TemplateName, TemplateScope};

/// Where in the walk a node is.
#[derive(Clone, Copy)]
struct Place {
    /// Inside a function.
    function: bool,
    /// The functions around the node, below the section's program.
    functions: u32,
    /// Upstream's `function_depth` below the section's program: one for each function, and one
    /// for each `$derived(…)`, `$inspect(…)` or `$props()` pattern around the node.
    depth: u32,
    /// Below an argument of `$state(…)` or `$state.raw(…)`; upstream does not count the
    /// argument itself.
    state_argument: bool,
    /// An argument of `$state(…)` or `$state.raw(…)`.
    state_call_argument: bool,
}

const TOP: Place = Place {
    function: false,
    functions: 0,
    depth: 0,
    state_argument: false,
    state_call_argument: false,
};

struct Walk<'w> {
    scripts: &'w Scripts<'w>,
    resolution: &'w Resolution,
    runes: bool,
    /// Whether a rune call that subscribes to a store is the `store_rune_conflict` warning: not
    /// when the `runes` option is `false`.
    store_conflicts: bool,
    /// Each unbound `$name` in the order of its first reference, which upstream warns
    /// `store_rune_conflict` in, name by name.
    dollar_names: FxHashMap<String, usize>,
    conflicts: Vec<(usize, Diagnostic)>,
    /// The bindings `export { … }` marks reassigned, from the specifier's start on.
    exported: &'w FxHashMap<SymbolId, u32>,
    section: Section,
    /// The scope of the section's program, whose top-level bindings the walk's depth is 1 for
    /// (0 for the module).
    program: Option<ScopeId>,
    /// In a template's `{let …}` tag, the scope its bindings live in: upstream walks the tag at
    /// that scope's depth.
    declaration_scope: Option<ScopeId>,
    found: &'w mut Found,
    /// The place of the node about to be entered.
    place: Place,
    /// The places of the nodes entered and not yet left.
    entered: Vec<Place>,
    next: Next,
}

/// What the parent knows of the node about to be entered.
#[derive(Clone, Copy, Default)]
struct Next {
    /// It is the callee or an argument of a call.
    called: bool,
    /// It is what an assignment or an update assigns.
    written: bool,
    /// It is a call that ends an optional chain, so it lowers as no rune.
    chain_call: bool,
}

/// Walks the module, the instance and the template's expressions.
pub(super) fn walk(
    scripts: &Scripts<'_>,
    template: Option<&CompilerSyntaxTree>,
    resolution: &Resolution,
    runes: bool,
    options: Options,
    exported: &FxHashMap<SymbolId, u32>,
    found: &mut Found,
) {
    let mut walk = Walk {
        scripts,
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
        place: TOP,
        entered: Vec::new(),
        next: Next::default(),
    };
    let scoping = resolution.scoping();
    for (section, script) in scripts.sections() {
        walk.section = section;
        walk.program = Some(match section {
            Section::Instance => resolution.instance_scope(),
            _ => scoping.root_scope_id(),
        });
        walk.place = TOP;
        walk.visit_program(scripts.javascript.get_program(script.program));
    }
    if let Some(template) = template {
        walk.section = Section::Template;
        walk.program = None;
        crate::resolve::walk(template, template.root, &mut walk);
    }
    let mut conflicts = std::mem::take(&mut walk.conflicts);
    conflicts.sort_by_key(|&(order, _)| order);
    for (_, conflict) in conflicts {
        walk.found.push(Stage::Setup, 0, conflict);
    }
}

impl Walk<'_> {
    fn warn(&mut self, at: u32, warning: Diagnostic) {
        self.found.push(Stage::Walk(self.section), at, warning);
    }

    /// `bidirectional_control_characters` in a string's value: upstream tests the value, so an
    /// escape that spells a control character counts.
    fn string(&mut self, text: &str, at: oxc_span::Span) {
        if bidirectional_runs(text).next().is_some() {
            self.warn(at.start, bidirectional(span(at)));
        }
    }

    /// `state_referenced_locally`: a read of reactive state where the walk's depth is the
    /// binding's, so it only sees the initial value.
    fn identifier(&mut self, identifier: &IdentifierReference<'_>, written: bool, called: bool) {
        self.store_conflict(identifier, called);
        if !self.runes {
            return;
        }
        let resolution = self.resolution;
        let scoping = resolution.scoping();
        let Some(symbol) = resolution.symbol(identifier) else {
            return;
        };
        let info = resolution.binding(symbol);
        let at = identifier.span;
        let declared_scope = scoping.symbol_scope_id(symbol);
        // The declarator's visitor gives a binding its rune kind, so earlier reads see a plain one.
        let declared_before = scoping.symbol_span(symbol).start < at.start;
        let same_depth = match (self.program, self.declaration_scope) {
            (Some(program), _) => {
                self.function_depth(declared_scope, program) == Some(self.place.depth)
            }
            (None, Some(scope)) => declared_scope == scope && self.place.depth == 0,
            (None, None) => false,
        };
        if !declared_before || !same_depth {
            return;
        }
        let reactive = match info.kind {
            BindingKind::State => {
                let exported = self.exported.get(&symbol).is_some_and(|&from| {
                    self.section == Section::Template
                        || (self.section == Section::Instance && from < at.start)
                });
                resolution.writes(symbol) > 0
                    || exported
                    || resolution.initializer(symbol).is_some_and(|init| {
                        matches!(crate::typescript::without_typescript(init), Expression::CallExpression(call)
                            if matches!(call.arguments.as_slice(), [only]
                                if only.as_expression().is_some_and(|only| !resolution.should_proxy(only))))
                    })
            }
            BindingKind::RawState
            | BindingKind::Derived
            | BindingKind::DerivedBy
            | BindingKind::Property
            | BindingKind::RestProperty => true,
            _ => false,
        };
        if !reactive || written {
            return;
        }
        let name = identifier.name.as_str();
        let kind = if self.place.state_argument {
            "derived"
        } else {
            "closure"
        };
        let message = format!(
            "This reference only captures the initial value of `{name}`. Did you mean to reference it inside a {kind} instead?"
        );
        self.warn(
            at.start,
            warning("state_referenced_locally", &message, span(at)),
        );
    }

    /// How many functions enclose `scope` below `program`; `None` outside `program`.
    fn function_depth(&self, mut scope: ScopeId, program: ScopeId) -> Option<u32> {
        let scoping = self.resolution.scoping();
        let mut depth = 0;
        while scope != program {
            depth += u32::from(self.resolution.is_function_scope(scope));
            scope = scoping.scope_parent_id(scope)?;
        }
        Some(depth)
    }

    /// `store_rune_conflict`: `$name(…)` where `name` is a local binding, so it subscribes to a
    /// store rather than calling the rune.
    fn store_conflict(&mut self, identifier: &IdentifierReference<'_>, called: bool) {
        let name = identifier.name.as_str();
        let Some(store) = name.strip_prefix('$') else {
            return;
        };
        if self.resolution.symbol(identifier).is_some() {
            return;
        }
        let next = self.dollar_names.len();
        let order = *self.dollar_names.entry(name.to_owned()).or_insert(next);
        if called
            && self.store_conflicts
            && RUNES.contains(&name)
            && self.resolution.is_store_subscription(name)
        {
            let message = format!(
                "It looks like you're using the `{name}` rune, but there is a local binding called `{store}`. Referencing a local variable with a `$` prefix will create a store subscription. Please rename `{store}` to avoid the ambiguity"
            );
            self.conflicts.push((
                order,
                warning("store_rune_conflict", &message, span(identifier.span)),
            ));
        }
    }

    /// `legacy_component_creation`: `new Component({ target })` of a default import from a
    /// `.svelte` file.
    fn component_creation(&mut self, expression: &Expression<'_>) {
        let Expression::NewExpression(new) = expression else {
            return;
        };
        let [Argument::ObjectExpression(options)] = new.arguments.as_slice() else {
            return;
        };
        let targets = options.properties.iter().any(|p| {
            matches!(p, ObjectPropertyKind::ObjectProperty(p)
                if !p.computed && matches!(&p.key, PropertyKey::StaticIdentifier(key) if key.name == "target"))
        });
        let Expression::Identifier(callee) = &new.callee else {
            return;
        };
        if !targets {
            return;
        }
        let resolution = self.resolution;
        let Some(symbol) = resolution.symbol(callee) else {
            return;
        };
        if !resolution
            .scoping()
            .symbol_flags(symbol)
            .contains(SymbolFlags::Import)
        {
            return;
        }
        let from_svelte = self.imports().any(|import| {
            import.source.value.ends_with(".svelte")
                && import.specifiers.iter().flatten().any(|specifier| {
                    matches!(specifier, ImportDeclarationSpecifier::ImportDefaultSpecifier(s)
                        if s.local.symbol_id.get() == Some(symbol))
                })
        });
        if from_svelte {
            self.warn(new.span.start, warning(
                "legacy_component_creation",
                "Svelte 5 components are no longer classes. Instantiate them using `mount` or `hydrate` (imported from 'svelte') instead.",
                span(new.span),
            ));
        }
    }

    /// The import declarations of both scripts.
    fn imports(&self) -> impl Iterator<Item = &oxc_ast::ast::ImportDeclaration<'_>> {
        let javascript = self.scripts.javascript;
        self.scripts
            .sections()
            .flat_map(move |(_, script)| &javascript.get_program(script.program).body)
            .filter_map(|statement| match statement {
                Statement::ImportDeclaration(import) => Some(&**import),
                _ => None,
            })
    }
}

impl<'a> Visit<'a> for Walk<'_> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        let place = self.place;
        let Next {
            called, written, ..
        } = self.next;
        self.next.called = false;
        self.next.written = false;
        self.entered.push(place);
        let mut inner = place;
        inner.state_argument |= place.state_call_argument;
        inner.state_call_argument = false;
        let at = oxc_span::GetSpan::span(&kind);
        match kind {
            AstKind::IdentifierReference(identifier) => {
                self.identifier(identifier, written, called);
            }
            AstKind::StringLiteral(string) => {
                let value = string.value;
                let text = value
                    .as_str()
                    .map_or_else(|| Cow::Owned(value.display().to_string()), Cow::Borrowed);
                self.string(&text, at);
            }
            AstKind::TemplateElement(element) => match element.value.cooked {
                Some(value) => {
                    let text = value
                        .as_str()
                        .map_or_else(|| Cow::Owned(value.display().to_string()), Cow::Borrowed);
                    self.string(&text, at);
                }
                None => self.string(element.value.raw.as_str(), at),
            },
            AstKind::Function(_) | AstKind::ArrowFunctionExpression(_) => {
                inner.function = true;
                inner.functions += 1;
                inner.depth += 1;
                // Upstream looks for an enclosing `$state(…)` only up to the nearest function.
                inner.state_argument = false;
            }
            AstKind::Class(class) if class.r#type == ClassType::ClassDeclaration => {
                // A component's module allows a class at its top level, a component at the
                // instance's, and a module file in its top-level functions too.
                let nested = if self.scripts.file {
                    place.functions > 1
                } else {
                    place.function || self.section == Section::Template
                };
                if nested {
                    self.warn(
                        at.start,
                        warning(
                            "perf_avoid_nested_class",
                            "Avoid declaring classes below the top level scope",
                            span(at),
                        ),
                    );
                }
            }
            AstKind::NewExpression(new) => {
                let inline = matches!(new.callee, Expression::ClassExpression(_))
                    && (place.function || self.section != Section::Module);
                if inline {
                    self.warn(
                        at.start,
                        warning(
                            "perf_avoid_inline_class",
                            "Avoid 'new class' — instead, declare the class at the top level scope",
                            span(at),
                        ),
                    );
                }
            }
            AstKind::ExpressionStatement(statement) => {
                self.component_creation(&statement.expression);
            }
            _ => {}
        }
        self.place = inner;
    }

    fn leave_node(&mut self, _: AstKind<'a>) {
        self.place = self.entered.pop().expect("entered before");
    }

    fn visit_chain_expression(&mut self, it: &ChainExpression<'a>) {
        self.next.chain_call = matches!(it.expression, ChainElement::CallExpression(_));
        walk::walk_chain_expression(self, it);
    }

    fn visit_call_expression(&mut self, it: &CallExpression<'a>) {
        let chain_call = std::mem::take(&mut self.next.chain_call);
        let rune = if chain_call || matches!(it.callee, Expression::ChainExpression(_)) {
            None
        } else {
            self.resolution.rune_of_call(it)
        };
        let kind = AstKind::CallExpression(self.alloc(it));
        self.enter_node(kind);
        let inner = self.place;
        self.next.called = matches!(it.callee, Expression::Identifier(_));
        self.visit_expression(&it.callee);
        let mut argument = inner;
        argument.depth += u32::from(matches!(rune, Some("$derived" | "$inspect")));
        argument.state_call_argument = matches!(rune, Some("$state" | "$state.raw"));
        for a in &it.arguments {
            self.place = argument;
            self.next.called = matches!(a, Argument::Identifier(_));
            self.visit_argument(a);
        }
        self.place = inner;
        self.leave_node(kind);
    }

    fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
        // Upstream walks a `$props()` pattern one function deeper, so its fallbacks do not warn.
        let props = it
            .init
            .as_ref()
            .and_then(|init| self.resolution.rune(init))
            .is_some_and(|(rune, _)| rune == "$props");
        let kind = AstKind::VariableDeclarator(self.alloc(it));
        self.enter_node(kind);
        let inner = self.place;
        self.place.depth += u32::from(props);
        self.visit_binding_pattern(&it.id);
        self.place = inner;
        if let Some(init) = &it.init {
            self.visit_expression(init);
        }
        self.leave_node(kind);
    }

    fn visit_assignment_expression(&mut self, it: &AssignmentExpression<'a>) {
        let kind = AstKind::AssignmentExpression(self.alloc(it));
        self.enter_node(kind);
        self.next.written = matches!(it.left, AssignmentTarget::AssignmentTargetIdentifier(_));
        self.visit_assignment_target(&it.left);
        self.next.written = false;
        self.visit_expression(&it.right);
        self.leave_node(kind);
    }

    fn visit_update_expression(&mut self, it: &UpdateExpression<'a>) {
        let kind = AstKind::UpdateExpression(self.alloc(it));
        self.enter_node(kind);
        self.next.written = matches!(
            it.argument,
            SimpleAssignmentTarget::AssignmentTargetIdentifier(_)
        );
        self.visit_simple_assignment_target(&it.argument);
        self.next.written = false;
        self.leave_node(kind);
    }

    // Upstream's `ExportSpecifier` visitor does not visit its names.
    fn visit_export_specifier(&mut self, _: &oxc_ast::ast::ExportSpecifier<'a>) {}

    fn visit_module_export_name(&mut self, _: &ModuleExportName<'a>) {}

    // TypeScript is erased before the compiler's walk.
    fn visit_ts_type(&mut self, _: &TSType<'a>) {}

    fn visit_ts_interface_declaration(&mut self, _: &oxc_ast::ast::TSInterfaceDeclaration<'a>) {}

    fn visit_ts_type_alias_declaration(&mut self, _: &oxc_ast::ast::TSTypeAliasDeclaration<'a>) {}
}

impl Roots for Walk<'_> {
    fn expression(&mut self, expression: ExpressionIdentifier) {
        self.place = TOP;
        self.visit_expression(self.scripts.javascript.get_expression(expression));
    }

    fn bound(&mut self, expression: ExpressionIdentifier) {
        self.expression(expression);
    }

    fn declaration(&mut self, declaration: DeclarationIdentifier) {
        let declaration = self.scripts.javascript.get_declaration(declaration);
        // The scope of the bindings a template's `{let …}` or `{@const}` tag declares.
        self.declaration_scope = declaration
            .declarations
            .iter()
            .flat_map(|d| d.id.get_binding_identifiers())
            .find_map(|identifier| identifier.symbol_id.get())
            .map(|symbol| self.resolution.scoping().symbol_scope_id(symbol));
        self.place = TOP;
        self.visit_variable_declaration(declaration);
        self.declaration_scope = None;
    }

    fn pattern(&mut self, pattern: PatternIdentifier) {
        self.place = TOP;
        self.visit_formal_parameter(self.scripts.javascript.get_pattern(pattern));
    }

    fn parameters(&mut self, parameters: ParametersIdentifier) {
        self.place = TOP;
        self.visit_formal_parameters(self.scripts.javascript.get_parameters(parameters));
    }

    fn name(&mut self, _: TemplateName) {}

    fn enter(&mut self, _: TemplateScope) {}

    fn leave(&mut self) {}
}
