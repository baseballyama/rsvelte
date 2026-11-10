use rsvelte_svelte_semantic::compiler_syntax_tree::{AttributeValue, NodeKind};
use rsvelte_svelte_semantic::resolve::{BindingKind, for_each_pattern_target, lowers};
use rsvelte_svelte_syntax::names::{is_mathml, is_svg};
use rsvelte_typescript_semantic::scope::{Binding, DeclarationKind, ScopeIdentifier, Semantic};
use rsvelte_typescript_syntax::operators::AssignmentOperator;
use rsvelte_typescript_syntax::syntax_tree::{
    Class, Control, TypeScriptFeature, TypeScriptRuntime, flag,
};
use rustc_hash::{FxHashMap, FxHashSet};

pub(super) mod markup;

use super::{
    CompileInput, Diagnostic, Kind, NodeIdentifier, Resolution, Span, SyntaxTree, Target, span_of,
    unsupported,
};

/// Refuses an element upstream's `is_svg` or `is_mathml` names (case-sensitively).
///
/// With `<svg>` and `<math>` refused, such an element would need upstream's namespace inference,
/// which this port does not do.
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] at the element's name.
pub(crate) fn check_foreign_element(source_text: &str, name: Span) -> Result<(), Diagnostic> {
    let text = name.text(source_text);
    if is_svg(text) || is_mathml(text) {
        return unsupported(&format!("`<{text}>` outside `<svg>` or `<math>`"), name);
    }
    Ok(())
}

/// Upstream's name errors in runes mode, in its order: `validate_identifier_name` where the scope
/// declares a name, `$$props` and `$$restProps`, then `validate_identifier_name` where the
/// analysis walk meets a declaration.
///
/// # Errors
///
/// `dollar_binding_invalid`, `dollar_prefix_invalid`, `legacy_props_invalid` or
/// `legacy_rest_props_invalid` at the first such name.
pub(super) fn check_names(input: &CompileInput<'_>, res: &Resolution) -> Result<(), Diagnostic> {
    let javascript = input.component.javascript;
    let mut reserved = res
        .sem
        .bindings
        .iter()
        .filter(|b| {
            javascript.atoms.get(b.name).starts_with('$')
                && !matches!(b.kind, DeclarationKind::Param | DeclarationKind::Host)
        })
        .peekable();
    if reserved.peek().is_some() {
        let unchecked = unchecked_declarations(input);
        let reserved: Vec<&Binding> = reserved
            .filter(|b| {
                !unchecked.contains(&b.node)
                    && !b.declaration.is_some_and(|d| unchecked.contains(&d))
                    && !names_class_expression(javascript, &res.sem, b)
            })
            .collect();
        // The scope checks names down to function depth 1: the module's function bodies and the
        // instance's top level.
        if let Some(b) = reserved
            .iter()
            .find(|b| function_depth(javascript, &res.sem, b) <= 1)
        {
            return reserved_name(javascript, b);
        }
        check_legacy_props(javascript, res)?;
        if let Some(b) = reserved.iter().find(|b| {
            b.declaration.is_some()
                || !(names_function_expression(javascript, &res.sem, b)
                    || is_catch_parameter(javascript, &res.sem, b))
        }) {
            return reserved_name(javascript, b);
        }
        return Ok(());
    }
    check_legacy_props(javascript, res)
}

/// Upstream `legacy_props_invalid` and `legacy_rest_props_invalid` at a name no script declares.
fn check_legacy_props(javascript: &SyntaxTree, res: &Resolution) -> Result<(), Diagnostic> {
    for r in res.sem.references.iter().filter(|r| r.binding.is_none()) {
        let (code, message) = match javascript.name(r.node) {
            "$$props" => ("legacy_props_invalid", "Cannot use `$$props` in runes mode"),
            "$$restProps" => (
                "legacy_rest_props_invalid",
                "Cannot use `$$restProps` in runes mode",
            ),
            _ => continue,
        };
        return super::special::invalid(code, message, span_of(javascript, r.node));
    }
    Ok(())
}

fn reserved_name<T>(javascript: &SyntaxTree, b: &Binding) -> Result<T, Diagnostic> {
    let span = span_of(javascript, b.node);
    if javascript.atoms.get(b.name) == "$" {
        super::special::invalid(
            "dollar_binding_invalid",
            "The $ name is reserved, and cannot be used for variables and imports",
            span,
        )
    } else {
        super::special::invalid(
            "dollar_prefix_invalid",
            "The $ prefix is reserved, and cannot be used for variables and imports",
            span,
        )
    }
}

/// Upstream `function_depth` where `b` is declared: 0 in the module script and 1 in the instance,
/// plus one per function body around it. A function expression's name is outside its body.
fn function_depth(javascript: &SyntaxTree, sem: &Semantic, b: &Binding) -> usize {
    let mut depth = 0;
    let mut scope = b.scope;
    loop {
        if scope == ScopeIdentifier::ROOT {
            depth += 1;
            break;
        }
        let Some(parent) = sem.scopes[scope].parent else {
            break;
        };
        depth += usize::from(sem.scopes[scope].function);
        scope = parent;
    }
    depth - usize::from(names_function_expression(javascript, sem, b))
}

/// The name of the function expression whose scope declares it.
fn names_function_expression(javascript: &SyntaxTree, sem: &Semantic, b: &Binding) -> bool {
    let node = sem.scopes[b.scope].node;
    !node.is_none()
        && matches!(
            javascript.kind(node),
            Kind::Function { name: Some(name), declaration: false, .. } if name == b.node
        )
}

/// A catch clause's parameter, which no declaration the analysis walk visits declares.
fn is_catch_parameter(javascript: &SyntaxTree, sem: &Semantic, b: &Binding) -> bool {
    let node = sem.scopes[b.scope].node;
    !node.is_none() && matches!(javascript.kind(node), Kind::Control(Control::Catch { .. }))
}

/// A class expression's name, which the class's own scope declares.
fn names_class_expression(javascript: &SyntaxTree, sem: &Semantic, b: &Binding) -> bool {
    let node = sem.scopes[b.scope].node;
    !node.is_none()
        && matches!(
            javascript.kind(node),
            Kind::Class(Class::Definition {
                name: Some(name),
                declaration: false,
                ..
            }) if name == b.node
        )
}

/// The names and declarators upstream never checks besides a class expression's name: a snippet's
/// name, a `{@const}` and a type-only import.
fn unchecked_declarations(input: &CompileInput<'_>) -> FxHashSet<NodeIdentifier> {
    let javascript = input.component.javascript;
    let mut unchecked = FxHashSet::default();
    for n in &input.component.compiler_syntax_tree.nodes {
        match &n.kind {
            NodeKind::Snippet(s) => {
                unchecked.insert(s.name);
            }
            &NodeKind::Const { declaration } => {
                if let Kind::VariableDeclaration { declarations, .. } = javascript.kind(declaration)
                {
                    unchecked.extend(declarations.iter().copied());
                }
            }
            _ => {}
        }
    }
    for program in input
        .component
        .module
        .into_iter()
        .chain([input.component.program])
    {
        let Kind::Program(statements) = javascript.kind(program) else {
            continue;
        };
        for &statement in statements {
            if let Kind::Import {
                specifiers,
                type_only,
                ..
            } = javascript.kind(statement)
            {
                unchecked.extend(specifiers.iter().copied().filter(|&specifier| {
                    type_only || javascript.flags(specifier) & flag::TYPE_ONLY != 0
                }));
            }
        }
    }
    unchecked
}

/// Refuses a `$name` reference that upstream's analysis turns into a store subscription (its
/// synthetic `store_sub` bindings); this port has no store support.
///
/// Also refuses `$$slots`, which upstream declares from `$.sanitize_slots`.
///
/// # Errors
///
/// Upstream's `global_reference_invalid` for an undeclared store, or an `unsupported`
/// [`Diagnostic`], at the first such reference.
pub(super) fn check_stores(
    javascript: &SyntaxTree,
    res: &Resolution,
    program: NodeIdentifier,
) -> Result<(), Diagnostic> {
    let instance = res.sem.scope_of(program).unwrap_or(ScopeIdentifier::ROOT);
    for r in &res.sem.references {
        if r.binding.is_some() {
            continue;
        }
        let name = javascript.name(r.node);
        if name == "$$slots" {
            return unsupported("`$$slots`", span_of(javascript, r.node));
        }
        if res.is_store_subscription(name) {
            // In runes mode upstream reads an undeclared lowercase store as a misspelt global.
            let store = &name[1..];
            let declared = (javascript.atoms.lookup(store))
                .is_some_and(|atom| res.sem.lookup(instance, atom).is_some());
            if !declared && store.starts_with(|c: char| c.is_ascii_lowercase()) {
                return super::special::invalid(
                    "global_reference_invalid",
                    &format!(
                        "`{name}` is an illegal variable name. To reference a global variable called `{name}`, use `globalThis.{name}`"
                    ),
                    span_of(javascript, r.node),
                );
            }
            return unsupported(
                &format!("the store subscription `{name}`"),
                span_of(javascript, r.node),
            );
        }
    }
    Ok(())
}

/// Where a node sits, as far as upstream's rune checks ask.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Parent {
    Other,
    /// A statement of the instance script's body.
    InstanceBody,
    /// A declarator of a declaration in the instance script's body.
    TopDeclarator,
    /// A declarator's initializer; `top` at the instance's top level, `named` binding one name,
    /// and the rune it calls, named once at the declarator.
    Initializer {
        top: bool,
        named: bool,
        rune: Option<&'static str>,
    },
    /// The function of a class's `constructor`.
    Constructor,
    /// A function's block body, a statement of it (`first` or not), and the expression of an
    /// expression statement, which knows the body it stands in.
    Body(Body),
    BodyStatement(Body, bool),
    Statement(Option<(Body, bool)>),
    /// The value of a class field that is neither static nor computed.
    ClassField,
    /// The value of `this.x = …`, a statement of a constructor's body.
    ConstructorAssignment,
    /// The pattern a `$props()` declarator binds, one of its properties, and a property's value.
    Props,
    PropsProperty,
    PropsValue,
    /// The default of a `$props()` property.
    PropsDefault,
}

/// The function whose block body a statement stands in.
#[derive(Clone, Copy, PartialEq, Eq)]
struct Body {
    constructor: bool,
    generator: bool,
}

/// Where an expression sits.
#[derive(Clone, Copy)]
struct Place {
    parent: Parent,
    in_class: bool,
    module: bool,
    /// Upstream evaluates it when the component renders: the instance's top level or a
    /// template expression, outside any function.
    rendering: bool,
}

/// Upstream's rune and assignment checks over the scripts and the template expressions, in
/// document order, then the runes this port does not lower yet.
struct RuneWalk<'a> {
    javascript: &'a SyntaxTree,
    source_text: &'a str,
    res: &'a Resolution,
    target: Target,
    custom_element: bool,
    props: bool,
    props_id: bool,
    /// The first rune this port does not lower, refused only when upstream raises nothing later.
    refused: Option<Diagnostic>,
}

/// Raises upstream's rune placement, rune argument and assignment errors, a `bind:` target's
/// among them, then refuses a rune call this port does not lower, a state rune in a class body (class fields are not lowered yet), and on the server an
/// `$effect` that is not a statement of its own (upstream only drops it as an `ExpressionStatement`).
///
/// # Errors
///
/// The upstream or `unsupported` [`Diagnostic`] at the first such call.
pub(super) fn check_runes(
    input: &CompileInput<'_>,
    res: &Resolution,
    target: Target,
    custom_element: bool,
) -> Result<(), Diagnostic> {
    let mut walk = RuneWalk {
        javascript: input.component.javascript,
        source_text: input.component.source_text,
        res,
        target,
        custom_element,
        props: false,
        props_id: false,
        refused: None,
    };
    // Upstream checks a binding's target where it visits the directive, before the expression.
    let tree = input.component.compiler_syntax_tree;
    let binds: FxHashMap<NodeIdentifier, (Span, bool)> = (tree.nodes.iter())
        .filter_map(|n| match &n.kind {
            NodeKind::Element(el) => Some(tree.attributes(el.attributes)),
            _ => None,
        })
        .flatten()
        .filter_map(|a| match a.value {
            AttributeValue::Bind(target) => Some((
                target,
                (a.span, a.name.text(input.component.source_text) == "this"),
            )),
            _ => None,
        })
        .collect();
    let module = (input.component.module).map(|module| (module, true, false));
    let template = (input.component.template_expressions.iter()).map(|&e| (e, false, true));
    let roots = module
        .into_iter()
        .chain([(input.component.program, false, true)])
        .chain(template);
    // Pre-order from one stack: expressions nest thousands deep in real input.
    let mut pending = Vec::new();
    for (root, module, rendering) in roots {
        let place = Place {
            parent: Parent::Other,
            in_class: false,
            module,
            rendering,
        };
        if let Some(&(span, this)) = binds.get(&root) {
            walk.check_binding(root, span, this)?;
        }
        pending.push((root, place));
        while let Some((e, place)) = pending.pop() {
            walk.visit(e, place, &mut pending)?;
        }
    }
    walk.refused.map_or(Ok(()), Err)
}

impl RuneWalk<'_> {
    /// Upstream's `BindDirective` checks of the `bind:` target `e` at `span`; `bind:this` also
    /// takes a global.
    fn check_binding(&self, e: NodeIdentifier, span: Span, this: bool) -> Result<(), Diagnostic> {
        let javascript = self.javascript;
        check_assignment(javascript, self.res, e, true, || span)?;
        if !this
            && javascript.is_identifier(e)
            && self.res.binding(e).is_none()
            && !self.res.is_store_subscription(javascript.name(e))
        {
            return super::special::invalid(
                "bind_invalid_value",
                "Can only bind to state or props",
                span_of(javascript, e),
            );
        }
        Ok(())
    }

    /// Checks `e` and pushes its children, each with where it sits, so that they pop in order.
    fn visit(
        &mut self,
        e: NodeIdentifier,
        place: Place,
        pending: &mut Vec<(NodeIdentifier, Place)>,
    ) -> Result<(), Diagnostic> {
        let javascript = self.javascript;
        let kind = javascript.kind(e);
        // A `for await` suspends rendering as an `await` does; upstream prints it into a
        // function that is not async.
        if place.rendering
            && matches!(
                kind,
                Kind::Await(_) | Kind::Control(Control::ForEach { is_await: true, .. })
            )
        {
            return super::special::invalid(
                "experimental_async",
                "Cannot use `await` in deriveds and template expressions, or at the top level of a component, unless the `experimental.async` compiler option is `true`",
                span_of(javascript, e),
            );
        }
        let mut rune = None;
        match kind {
            Kind::Call { arguments, .. } => {
                let named = match place.parent {
                    Parent::Initializer { rune, .. } => rune,
                    _ => self.res.rune_named(javascript, e),
                };
                if let Some(named) = named {
                    self.check_rune(e, arguments, named, place)?;
                }
            }
            Kind::Declarator {
                identifier,
                initializer: Some(initializer),
            } => {
                rune = self.res.rune_named(javascript, initializer);
                if rune == Some("$props") {
                    check_props_pattern(javascript, e, identifier)?;
                }
            }
            Kind::Update { arg, .. } => {
                check_assignment(javascript, self.res, arg, false, || span_of(javascript, e))?;
            }
            Kind::Assign(_, pattern, _) => {
                check_assignment(javascript, self.res, pattern, false, || {
                    span_of(javascript, e)
                })?;
                if matches!(
                    javascript.kind(pattern),
                    Kind::ArrayPattern(_) | Kind::ObjectPattern(_)
                ) {
                    self.check_pattern_assignment(e, pattern, self.target)?;
                }
            }
            // Upstream prints any non-plain head as invalid JavaScript, on the server too.
            Kind::Control(Control::ForEach { left, .. })
                if !matches!(javascript.kind(left), Kind::VariableDeclaration { .. }) =>
            {
                self.check_pattern_assignment(e, left, Target::Client)?;
            }
            _ => {}
        }
        let inner = Place {
            parent: Parent::Other,
            in_class: place.in_class || matches!(kind, Kind::Class(Class::Definition { .. })),
            module: place.module,
            // A class's heritage and computed keys run where the class is defined.
            rendering: place.rendering
                && !matches!(kind, Kind::Function { .. } | Kind::Arrow { .. }),
        };
        let base = pending.len();
        javascript.for_each_child(e, |c| pending.push((c, inner)));
        for (child, child_place) in &mut pending[base..] {
            child_place.parent = self.parent_of(e, kind, rune, *child, place);
        }
        pending[base..].reverse();
        Ok(())
    }

    /// Where `child`, a child of `e`, sits, given where `e` sits; `rune` is the rune a declarator
    /// `e` calls.
    fn parent_of(
        &self,
        e: NodeIdentifier,
        kind: Kind<'_>,
        rune: Option<&'static str>,
        child: NodeIdentifier,
        place: Place,
    ) -> Parent {
        let javascript = self.javascript;
        let parent = place.parent;
        match (kind, parent) {
            (Kind::Program(_), _) if !place.module => Parent::InstanceBody,
            (Kind::VariableDeclaration { .. }, Parent::InstanceBody) => Parent::TopDeclarator,
            // Upstream asks for the instance scope, which an `export` does not leave.
            (Kind::ExportNamed(_), Parent::InstanceBody) => Parent::InstanceBody,
            (
                Kind::Declarator {
                    identifier,
                    initializer,
                },
                _,
            ) if Some(child) == initializer => Parent::Initializer {
                top: parent == Parent::TopDeclarator,
                named: javascript.is_identifier(identifier),
                rune,
            },
            (Kind::Declarator { .. }, _) if rune == Some("$props") => Parent::Props,
            (Kind::ObjectPattern(_), Parent::Props) => Parent::PropsProperty,
            (Kind::Property { value, .. }, Parent::PropsProperty) if value == child => {
                Parent::PropsValue
            }
            (Kind::AssignPattern(_, default), Parent::PropsValue) if default == child => {
                Parent::PropsDefault
            }
            (
                Kind::Class(Class::Method {
                    key,
                    computed: false,
                    is_static: false,
                    getter: false,
                    setter: false,
                    ..
                }),
                _,
            ) if is_constructor_key(javascript, self.source_text, key) => Parent::Constructor,
            (Kind::Function { body, .. } | Kind::Arrow { body, .. }, _) if body == child => {
                Parent::Body(Body {
                    constructor: parent == Parent::Constructor,
                    generator: javascript.flags(e) & flag::GENERATOR != 0,
                })
            }
            (Kind::Block(statements), Parent::Body(body)) => {
                Parent::BodyStatement(body, statements.first() == Some(&child))
            }
            (Kind::ExpressionStatement(_), Parent::BodyStatement(body, first)) => {
                Parent::Statement(Some((body, first)))
            }
            (Kind::ExpressionStatement(_), _) => Parent::Statement(None),
            (
                Kind::Assign(AssignmentOperator::Assign, target, value),
                Parent::Statement(Some((
                    Body {
                        constructor: true, ..
                    },
                    _,
                ))),
            ) if value == child && assigns_this_property(javascript, target) => {
                Parent::ConstructorAssignment
            }
            (
                Kind::Class(Class::Field {
                    value: Some(value),
                    computed: false,
                    is_static: false,
                    ..
                }),
                _,
            ) if value == child => Parent::ClassField,
            _ => Parent::Other,
        }
    }

    /// Upstream's `CallExpression` checks for a rune call, then whether this port lowers it.
    fn check_rune(
        &mut self,
        e: NodeIdentifier,
        arguments: &[NodeIdentifier],
        rune: &'static str,
        place: Place,
    ) -> Result<(), Diagnostic> {
        let javascript = self.javascript;
        let spread = (arguments.iter()).any(|&a| matches!(javascript.kind(a), Kind::Spread(_)));
        if rune != "$inspect" && spread {
            return super::special::invalid(
                "rune_invalid_spread",
                &format!("`{rune}` cannot be called with a spread argument"),
                span_of(javascript, e),
            );
        }
        // Upstream's parent of an optional call is its `ChainExpression`.
        let parent = if javascript.is_chain(e) {
            Parent::Other
        } else {
            place.parent
        };
        // Upstream counts the arguments of these before it asks where they are.
        if matches!(rune, "$bindable" | "$host" | "$inspect.trace") {
            check_rune_arguments(javascript, e, rune, arguments.len())?;
            self.check_rune_placement(e, rune, parent, place)?;
        } else {
            self.check_rune_placement(e, rune, parent, place)?;
            check_rune_arguments(javascript, e, rune, arguments.len())?;
        }
        self.refuse_unlowered(e, rune, place);
        Ok(())
    }

    /// Upstream's placement errors, and its errors for a second `$props()` or `$props.id()`.
    fn check_rune_placement(
        &mut self,
        e: NodeIdentifier,
        rune: &'static str,
        parent: Parent,
        place: Place,
    ) -> Result<(), Diagnostic> {
        let top = matches!(parent, Parent::Initializer { top: true, .. }) && !place.module;
        let (code, message) = match rune {
            "$bindable" if parent != Parent::PropsDefault => (
                "bindable_invalid_location",
                "`$bindable()` can only be used inside a `$props()` declaration".to_owned(),
            ),
            "$host" if place.module || !self.custom_element => (
                "host_invalid_placement",
                "`$host()` can only be used inside custom element component instances".to_owned(),
            ),
            "$props" | "$props.id" => {
                let seen = if rune == "$props" {
                    &mut self.props
                } else {
                    &mut self.props_id
                };
                if std::mem::replace(seen, true) {
                    (
                        "props_duplicate",
                        format!("Cannot use `{rune}()` more than once"),
                    )
                } else if !top
                    || rune == "$props.id"
                        && !matches!(parent, Parent::Initializer { named: true, .. })
                {
                    let code = if rune == "$props" {
                        "props_invalid_placement"
                    } else {
                        "props_id_invalid_placement"
                    };
                    (
                        code,
                        format!(
                            "`{rune}()` can only be used at the top level of components as a variable declaration initializer"
                        ),
                    )
                } else {
                    return Ok(());
                }
            }
            "$state" | "$state.raw" | "$derived" | "$derived.by"
                if !matches!(
                    parent,
                    Parent::Initializer { .. } | Parent::ClassField | Parent::ConstructorAssignment
                ) =>
            {
                return state_invalid_placement(rune, span_of(self.javascript, e));
            }
            "$effect" | "$effect.pre" if !matches!(parent, Parent::Statement(_)) => (
                "effect_invalid_placement",
                "`$effect()` can only be used as an expression statement".to_owned(),
            ),
            "$inspect.trace" => match parent {
                Parent::Statement(Some((
                    Body {
                        generator: true, ..
                    },
                    true,
                ))) => (
                    "inspect_trace_generator",
                    "`$inspect.trace(...)` cannot be used inside a generator function".to_owned(),
                ),
                Parent::Statement(Some((_, true))) => return Ok(()),
                _ => (
                    "inspect_trace_invalid_placement",
                    "`$inspect.trace(...)` must be the first statement of a function body"
                        .to_owned(),
                ),
            },
            _ => return Ok(()),
        };
        super::special::invalid(code, &message, span_of(self.javascript, e))
    }

    /// Keeps the first rune call this port does not lower, refused when the walk ends.
    fn refuse_unlowered(&mut self, e: NodeIdentifier, rune: &'static str, place: Place) {
        let lowered = lowers(self.javascript, e);
        // Upstream splits a destructured state or derived into one declaration per path; this
        // port has no `extract_paths` yet.
        let destructured = matches!(rune, "$state" | "$state.raw" | "$derived" | "$derived.by")
            && matches!(place.parent, Parent::Initializer { named: false, .. });
        let supported = lowered
            && !destructured
            && match rune {
                "$state" | "$state.raw" | "$derived" | "$derived.by" => !place.in_class,
                "$props" | "$bindable" | "$effect.pending" | "$effect.tracking" => true,
                "$host" => self.custom_element,
                "$effect" | "$effect.pre" => {
                    matches!(place.parent, Parent::Statement(_)) || self.target == Target::Client
                }
                _ => false,
            };
        if supported || self.refused.is_some() {
            return;
        }
        let what = if place.in_class {
            format!("`{rune}` in a class body")
        } else if !lowered {
            format!("`{rune}` in an optional chain")
        } else if destructured {
            format!("a destructured `{rune}` declaration")
        } else {
            format!("`{rune}`")
        };
        self.refused = unsupported::<()>(&what, span_of(self.javascript, e)).err();
    }
}

/// Upstream's errors for a rune called with the wrong number of arguments.
fn check_rune_arguments(
    javascript: &SyntaxTree,
    e: NodeIdentifier,
    rune: &'static str,
    count: usize,
) -> Result<(), Diagnostic> {
    let expected = match rune {
        "$props" | "$props.id" | "$host" | "$effect.tracking" if count > 0 => {
            return super::special::invalid(
                "rune_invalid_arguments",
                &format!("`{rune}` cannot be called with arguments"),
                span_of(javascript, e),
            );
        }
        "$derived" | "$derived.by" | "$effect" | "$effect.pre" | "$effect.root"
        | "$inspect().with" | "$state.eager" | "$state.snapshot"
            if count != 1 =>
        {
            "exactly one argument"
        }
        "$bindable" | "$state" | "$state.raw" | "$inspect.trace" if count > 1 => {
            "zero or one arguments"
        }
        "$inspect" if count < 1 => "one or more arguments",
        _ => return Ok(()),
    };
    super::special::invalid(
        "rune_invalid_arguments_length",
        &format!("`{rune}` must be called with {expected}"),
        span_of(javascript, e),
    )
}

/// Upstream `state_invalid_placement`, which the rune walk and the markup walk both raise.
fn state_invalid_placement<T>(rune: &str, span: Span) -> Result<T, Diagnostic> {
    super::special::invalid(
        "state_invalid_placement",
        &format!(
            "`{rune}(...)` can only be used as a variable declaration initializer, a class field \
             declaration, or the first assignment to a class field at the top level of the \
             constructor."
        ),
        span,
    )
}

/// acorn's `kind === 'constructor'`: a plain method keyed `constructor` by a name or a string.
fn is_constructor_key(javascript: &SyntaxTree, source_text: &str, key: NodeIdentifier) -> bool {
    match javascript.kind(key) {
        Kind::Identifier(_) => javascript.name(key) == "constructor",
        Kind::String => javascript.str_value(key, source_text) == "constructor",
        _ => false,
    }
}

/// Upstream's `this.x`, `this.#x` or `this[<literal>]`.
fn assigns_this_property(javascript: &SyntaxTree, target: NodeIdentifier) -> bool {
    let Kind::Member {
        object,
        property,
        computed,
        ..
    } = javascript.kind(target)
    else {
        return false;
    };
    matches!(javascript.kind(object), Kind::This)
        && (!computed
            || matches!(
                javascript.kind(property),
                Kind::String
                    | Kind::Number(_)
                    | Kind::Boolean(_)
                    | Kind::Null
                    | Kind::Regex { .. }
                    | Kind::BigInt
            ))
}

/// Upstream `VariableDeclarator`: `$props()` binds a name or flat object pattern, checked before
/// the call and its `$bindable` defaults.
fn check_props_pattern(
    javascript: &SyntaxTree,
    declarator: NodeIdentifier,
    pattern: NodeIdentifier,
) -> Result<(), Diagnostic> {
    let properties = match javascript.kind(pattern) {
        Kind::Identifier(_) => return Ok(()),
        Kind::ObjectPattern(properties) => properties,
        _ => {
            return super::special::invalid(
                "props_invalid_identifier",
                "`$props()` can only be used with an object destructuring pattern",
                span_of(javascript, declarator),
            );
        }
    };
    for &property in properties {
        let Kind::Property { value, .. } = javascript.kind(property) else {
            continue;
        };
        let value = match javascript.kind(value) {
            Kind::AssignPattern(left, _) => left,
            _ => value,
        };
        if javascript.flags(property) & flag::COMPUTED != 0 || !javascript.is_identifier(value) {
            return super::special::invalid(
                "props_invalid_pattern",
                "`$props()` assignment must not contain nested properties or computed keys",
                span_of(javascript, property),
            );
        }
    }
    Ok(())
}

/// A name an assignment or a binding cannot change, as upstream's `validate_assignment` sorts it.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Fixed {
    Import,
    Constant,
    EachItem,
    SnippetParameter,
}

/// Upstream `validate_assignment`: `argument`, assigned by the node at `span` or bound by the
/// `bind:` directive at `span`, names nothing that cannot change. The span is asked for only on
/// an error, because a frontend writes nodes with none where it raises none.
fn check_assignment(
    javascript: &SyntaxTree,
    res: &Resolution,
    argument: NodeIdentifier,
    binding: bool,
    span: impl FnOnce() -> Span,
) -> Result<(), Diagnostic> {
    let Some(fixed) = fixed(javascript, res, argument, true) else {
        return Ok(());
    };
    let (code, message) = match fixed {
        Fixed::Import | Fixed::Constant => {
            let thing = if fixed == Fixed::Import {
                "import"
            } else {
                "constant"
            };
            let (code, verb) = if binding {
                ("constant_binding", "bind to")
            } else {
                ("constant_assignment", "assign to")
            };
            (code, format!("Cannot {verb} {thing}"))
        }
        Fixed::EachItem => (
            "each_item_invalid_assignment",
            "Cannot reassign or bind to each block argument in runes mode. Use the array and index variables instead (e.g. `array[i] = value` instead of `entry = value`, or `bind:value={array[i]}` instead of `bind:value={entry}`)".to_owned(),
        ),
        Fixed::SnippetParameter => (
            "snippet_parameter_assignment",
            "Cannot reassign or bind to snippet parameter".to_owned(),
        ),
    };
    super::special::invalid(code, &message, span())
}

/// What makes `argument`, or a name its pattern writes, [`Fixed`]: an `{#each}` item or a snippet
/// parameter only as the whole `argument` (`whole`). As upstream, a default, a rest element and
/// a `for … of` head are not looked into, so a `const` written there compiles.
fn fixed(
    javascript: &SyntaxTree,
    res: &Resolution,
    argument: NodeIdentifier,
    whole: bool,
) -> Option<Fixed> {
    match javascript.kind(argument) {
        Kind::Identifier(_) => {
            let (b, information) = res.binding(argument)?;
            let fixed = match (res.sem.bindings[b].kind, information.kind) {
                (DeclarationKind::Import, _) => Fixed::Import,
                (_, BindingKind::Each) => Fixed::EachItem,
                (_, BindingKind::Snippet) => Fixed::SnippetParameter,
                (DeclarationKind::Const, _)
                | (_, BindingKind::Template | BindingKind::StaticIndex | BindingKind::KeyedIndex) => {
                    Fixed::Constant
                }
                _ => return None,
            };
            (whole || matches!(fixed, Fixed::Import | Fixed::Constant)).then_some(fixed)
        }
        Kind::ArrayPattern(elements) => {
            (elements.iter()).find_map(|&element| fixed(javascript, res, element, false))
        }
        Kind::ObjectPattern(properties) => properties.iter().find_map(|&property| match javascript
            .kind(property)
        {
            Kind::Property { value, .. } => fixed(javascript, res, value, false),
            _ => None,
        }),
        _ => None,
    }
}

impl RuneWalk<'_> {
    /// Refuses a `pattern`, written by `e`, that writes a name the `target` reads through a signal or a call, or a
    /// member of a `$bindable` prop: a destructuring assignment needs upstream's per-path
    /// assignment, and upstream prints a `for … in` or `for … of` head as invalid JavaScript.
    fn check_pattern_assignment(
        &self,
        e: NodeIdentifier,
        pattern: NodeIdentifier,
        target: Target,
    ) -> Result<(), Diagnostic> {
        let (javascript, res, accessors) = (self.javascript, self.res, self.custom_element);
        let mut transformed = false;
        for_each_pattern_target(javascript, pattern, &mut |name| {
            transformed |= if javascript.is_identifier(name) {
                res.binding(name)
                    .is_some_and(|(_, information)| match information.kind {
                        BindingKind::Normal => false,
                        // The server reads only a derived through a call.
                        BindingKind::Derived | BindingKind::DerivedBy => true,
                        _ => target == Target::Client,
                    })
            } else {
                target == Target::Client
                    && super::script::mutated_bindable_prop(res, accessors, javascript, name)
                        .is_some()
            };
        });
        if !transformed {
            return Ok(());
        }
        unsupported(
            "an assignment to state, a prop or a derived in a pattern",
            span_of(javascript, e),
        )
    }
}

pub(super) fn check_typescript(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    if let Some(runtime) = input.component.javascript.typescript_runtime.first() {
        return Err(typescript_invalid_feature(runtime));
    }
    Ok(())
}

/// Upstream `remove_typescript_nodes` erases types and refuses what has a runtime value; what it
/// keeps for esrap to print, this compiler does not lower.
fn typescript_invalid_feature(t: &TypeScriptRuntime) -> Diagnostic {
    let feature = match t.feature {
        TypeScriptFeature::Enum => "enums",
        TypeScriptFeature::NamespaceWithValues => "namespaces with non-type nodes",
        TypeScriptFeature::Decorator => "decorators (related TSC proposal is not stage 4 yet)",
        TypeScriptFeature::Accessor => "accessor fields (related TSC proposal is not stage 4 yet)",
        TypeScriptFeature::ParameterProperty => "accessibility modifiers on constructor parameters",
        TypeScriptFeature::ImportEquals => {
            return Diagnostic::error(
                "unsupported",
                "`import name = …` is not supported yet",
                t.span,
            );
        }
        TypeScriptFeature::ExportAssignment => {
            return Diagnostic::error("unsupported", "`export = …` is not supported yet", t.span);
        }
    };
    Diagnostic::error(
        "typescript_invalid_feature",
        format!(
            "TypeScript language features like {feature} are not natively supported, and their \
             use is generally discouraged. Outside of `<script>` tags, these features are not \
             supported. For use within `<script>` tags, you will need to use a preprocessor to \
             convert it to JavaScript before it gets passed to the Svelte compiler. If you are \
             using `vitePreprocess`, make sure to specifically enable preprocessing script tags \
             (`vitePreprocess({{ script: true }})`)\n\
             https://svelte.dev/e/typescript_invalid_feature"
        ),
        t.span,
    )
}
