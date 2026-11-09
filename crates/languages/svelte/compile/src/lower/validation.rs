use rsvelte_svelte_semantic::compiler_syntax_tree::NodeKind;
use rsvelte_svelte_semantic::resolve::{
    BindingKind, RUNES, for_each_pattern_target, rune, rune_call,
};
use rsvelte_typescript_semantic::scope::{Binding, DeclarationKind, ScopeIdentifier, Semantic};
use rsvelte_typescript_syntax::syntax_tree::{
    Class, Control, TypeScriptFeature, TypeScriptRuntime, flag,
};
use rustc_hash::FxHashSet;

use crate::render_plan::{is_mathml, is_svg};

pub(super) mod markup;

use super::{
    CompileInput, Diagnostic, Kind, NodeIdentifier, Resolution, Span, SyntaxTree, Target,
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
        let Some(span) = javascript.source_location(r.node).span() else {
            unreachable!("a reference is parsed from source")
        };
        return super::special::invalid(code, message, span);
    }
    Ok(())
}

fn reserved_name<T>(javascript: &SyntaxTree, b: &Binding) -> Result<T, Diagnostic> {
    let Some(span) = javascript.source_location(b.node).span() else {
        unreachable!("a declared name is parsed from source")
    };
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
/// An `unsupported` [`Diagnostic`] at the first such reference.
pub(super) fn check_stores(
    javascript: &SyntaxTree,
    res: &Resolution,
    source_text: &str,
    program: NodeIdentifier,
) -> Result<(), Diagnostic> {
    for r in &res.sem.references {
        if r.binding.is_some() {
            continue;
        }
        let name = javascript.name(r.node);
        if name == "$$slots" {
            let Some(span) = javascript.source_location(r.node).span() else {
                unreachable!("a reference is parsed from source")
            };
            return unsupported("`$$slots`", span);
        }
        let Some(store) = name.strip_prefix('$') else {
            continue;
        };
        if store.is_empty() || store.starts_with('$') {
            continue;
        }
        let declaration = || {
            let atom = javascript.atoms.lookup(store)?;
            Some(&res.sem.bindings[res.sem.root_binding(atom)?])
        };
        let store_sub = !RUNES.contains(&name)
            || declaration().is_some_and(|b| {
                let rune = b
                    .initializer(javascript)
                    .and_then(|initializer| rune(javascript, initializer, Some(&res.sem)));
                (rune.is_none() || (store != "props" && rune == Some("$props")))
                    && !(name == "$derived"
                        && b.kind == DeclarationKind::Import
                        && import_source(javascript, source_text, program, b.declaration)
                            == Some("svelte/store"))
            });
        if store_sub {
            let Some(span) = javascript.source_location(r.node).span() else {
                unreachable!("a reference is parsed from source")
            };
            return unsupported(&format!("the store subscription `{name}`"), span);
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
    /// A declarator's initializer; `top` at the instance's top level, `named` binding one name.
    Initializer {
        top: bool,
        named: bool,
    },
    Statement,
    /// The value of a class field that is neither static nor computed.
    ClassField,
    /// The pattern a `$props()` declarator binds, one of its properties, and a property's value.
    Props,
    PropsProperty,
    PropsValue,
    /// The default of a `$props()` property.
    PropsDefault,
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

/// The rune checks of upstream's analysis, then the runes this port does not lower yet.
struct RuneWalk<'a> {
    javascript: &'a SyntaxTree,
    res: &'a Resolution,
    target: Target,
    custom_element: bool,
    props: bool,
    props_id: bool,
    /// The first rune this port does not lower, refused only when upstream raises nothing later.
    refused: Option<Diagnostic>,
}

/// Raises upstream's rune placement and argument errors, then refuses a rune call this port does
/// not lower, a state rune in a class body (class fields are not lowered yet), and on the server an
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
        res,
        target,
        custom_element,
        props: false,
        props_id: false,
        refused: None,
    };
    let module = input
        .component
        .module
        .map(|module| (module, Parent::Other, true, false));
    let template =
        (input.component.template_expressions.iter()).map(|&e| (e, Parent::Other, false, true));
    let roots = module
        .into_iter()
        .chain([(input.component.program, Parent::InstanceBody, false, true)])
        .chain(template);
    for (root, parent, module, rendering) in roots {
        let place = Place {
            parent: Parent::Other,
            in_class: false,
            module,
            rendering,
        };
        if parent == Parent::InstanceBody {
            let mut statements = Vec::new();
            walk.javascript.for_each_child(root, |c| statements.push(c));
            for statement in statements {
                walk.walk(statement, Place { parent, ..place })?;
            }
        } else {
            walk.walk(root, place)?;
        }
    }
    walk.refused.map_or(Ok(()), Err)
}

impl RuneWalk<'_> {
    fn walk(&mut self, e: NodeIdentifier, place: Place) -> Result<(), Diagnostic> {
        let javascript = self.javascript;
        // A `for await` suspends rendering as an `await` does; upstream prints it into a
        // function that is not async.
        if place.rendering
            && matches!(
                javascript.kind(e),
                Kind::Await(_) | Kind::Control(Control::ForEach { is_await: true, .. })
            )
        {
            return super::special::invalid(
                "experimental_async",
                "Cannot use `await` in deriveds and template expressions, or at the top level of a component, unless the `experimental.async` compiler option is `true`",
                span_of(javascript, e),
            );
        }
        if let Some(rune) = rune(javascript, e, Some(&self.res.sem)) {
            self.check_rune(e, rune, place)?;
        }
        if let Kind::Declarator {
            identifier,
            initializer,
        } = javascript.kind(e)
        {
            if initializer.and_then(|i| rune(javascript, i, Some(&self.res.sem))) == Some("$props")
            {
                check_props_pattern(javascript, e, identifier)?;
            }
            super::script::check_destructured_rune(javascript, e)?;
        }
        check_pattern_assignment(javascript, self.res, self.target, self.custom_element, e)?;
        let mut children = Vec::new();
        javascript.for_each_child(e, |c| children.push(c));
        let inner = Place {
            parent: Parent::Other,
            in_class: place.in_class
                || matches!(javascript.kind(e), Kind::Class(Class::Definition { .. })),
            module: place.module,
            // A class's heritage and computed keys run where the class is defined; the parser
            // already refuses `await` in its field values and static blocks.
            rendering: place.rendering
                && !matches!(
                    javascript.kind(e),
                    Kind::Function { .. } | Kind::Arrow { .. }
                ),
        };
        for c in children {
            let parent = self.parent_of(e, c, place.parent);
            self.walk(c, Place { parent, ..inner })?;
        }
        Ok(())
    }

    /// Where `child`, a child of `e`, sits, given where `e` sits.
    fn parent_of(&self, e: NodeIdentifier, child: NodeIdentifier, parent: Parent) -> Parent {
        let javascript = self.javascript;
        match (javascript.kind(e), parent) {
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
            },
            (
                Kind::Declarator {
                    initializer: Some(initializer),
                    ..
                },
                _,
            ) if rune(javascript, initializer, Some(&self.res.sem)) == Some("$props") => {
                Parent::Props
            }
            (Kind::ObjectPattern(_), Parent::Props) => Parent::PropsProperty,
            (Kind::Property { value, .. }, Parent::PropsProperty) if value == child => {
                Parent::PropsValue
            }
            (Kind::AssignPattern(_, default), Parent::PropsValue) if default == child => {
                Parent::PropsDefault
            }
            (Kind::ExpressionStatement(_), _) => Parent::Statement,
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
        rune: &'static str,
        place: Place,
    ) -> Result<(), Diagnostic> {
        let javascript = self.javascript;
        let Kind::Call { arguments, .. } = javascript.kind(e) else {
            unreachable!("a rune is a call")
        };
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
        // Upstream counts the arguments of these two before it asks where they are.
        if matches!(rune, "$bindable" | "$host") {
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
            // A class body is refused later, so a constructor's assignment is not told apart.
            "$state" | "$state.raw" | "$derived" | "$derived.by"
                if !matches!(parent, Parent::Initializer { .. } | Parent::ClassField)
                    && !place.in_class =>
            {
                (
                    "state_invalid_placement",
                    format!(
                        "`{rune}(...)` can only be used as a variable declaration initializer, a class field declaration, or the first assignment to a class field at the top level of the constructor."
                    ),
                )
            }
            "$effect" | "$effect.pre" if parent != Parent::Statement => (
                "effect_invalid_placement",
                "`$effect()` can only be used as an expression statement".to_owned(),
            ),
            _ => return Ok(()),
        };
        super::special::invalid(code, &message, span_of(self.javascript, e))
    }

    /// Keeps the first rune call this port does not lower, refused when the walk ends.
    fn refuse_unlowered(&mut self, e: NodeIdentifier, rune: &'static str, place: Place) {
        let lowered = rune_call(self.javascript, e).is_some();
        let supported = lowered
            && match rune {
                "$state" | "$state.raw" | "$derived" | "$derived.by" => !place.in_class,
                "$props" | "$bindable" | "$effect.pending" | "$effect.tracking" => true,
                "$host" => self.custom_element,
                "$effect" | "$effect.pre" => {
                    place.parent == Parent::Statement || self.target == Target::Client
                }
                _ => false,
            };
        if supported || self.refused.is_some() {
            return;
        }
        let what = if place.in_class {
            format!("`{rune}` in a class body")
        } else if lowered {
            format!("`{rune}`")
        } else {
            format!("`{rune}` in an optional chain")
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

/// The span of a node an error names; a frontend writes rune calls only where none is raised.
fn span_of(javascript: &SyntaxTree, e: NodeIdentifier) -> Span {
    let Some(span) = javascript.source_location(e).span() else {
        unreachable!("a node an error names is parsed from source")
    };
    span
}

/// Refuses a pattern assigned to a name the target reads through a signal or a call, or to a
/// member of a `$bindable` prop: a destructuring assignment needs upstream's per-path assignment,
/// and upstream prints a `for … in` or `for … of` head as invalid JavaScript.
fn check_pattern_assignment(
    javascript: &SyntaxTree,
    res: &Resolution,
    target: Target,
    accessors: bool,
    e: NodeIdentifier,
) -> Result<(), Diagnostic> {
    let (pattern, target) = match javascript.kind(e) {
        Kind::Assign(_, pattern, _)
            if matches!(
                javascript.kind(pattern),
                Kind::ArrayPattern(_) | Kind::ObjectPattern(_)
            ) =>
        {
            (pattern, target)
        }
        // Upstream prints any non-plain head as invalid JavaScript, on the server too.
        Kind::Control(Control::ForEach { left, .. })
            if !matches!(javascript.kind(left), Kind::VariableDeclaration { .. }) =>
        {
            (left, Target::Client)
        }
        _ => return Ok(()),
    };
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
                && super::script::mutated_bindable_prop(res, accessors, javascript, name).is_some()
        };
    });
    if !transformed {
        return Ok(());
    }
    let Some(span) = javascript.source_location(e).span() else {
        unreachable!("an assignment is parsed from source")
    };
    unsupported(
        "an assignment to state, a prop or a derived in a pattern",
        span,
    )
}

/// The module an import specifier of the instance script imports from.
fn import_source<'a>(
    javascript: &'a SyntaxTree,
    source_text: &'a str,
    program: NodeIdentifier,
    spec: Option<NodeIdentifier>,
) -> Option<&'a str> {
    let spec = spec?;
    let Kind::Program(body) = javascript.kind(program) else {
        return None;
    };
    body.iter()
        .find_map(|&statement| match javascript.kind(statement) {
            Kind::Import {
                specifiers, source, ..
            } if specifiers.contains(&spec) => Some(javascript.str_value(source, source_text)),
            _ => None,
        })
}

pub(super) fn check_typescript(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    if let Some(runtime) = input.component.javascript.typescript_runtime.first() {
        return Err(typescript_invalid_feature(runtime));
    }
    Ok(())
}

/// Upstream `remove_typescript_nodes` erases types and refuses what has a runtime value.
fn typescript_invalid_feature(t: &TypeScriptRuntime) -> Diagnostic {
    let feature = match t.feature {
        TypeScriptFeature::Enum => "enums",
        TypeScriptFeature::NamespaceWithValues => "namespaces with non-type nodes",
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
