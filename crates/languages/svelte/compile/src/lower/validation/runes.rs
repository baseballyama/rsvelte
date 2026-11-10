//! Upstream's rune and assignment checks over the scripts and the template expressions.

use rsvelte_svelte_semantic::compiler_syntax_tree::{AttributeValue, NodeKind};
use rsvelte_svelte_semantic::resolve::lowers;
use rsvelte_typescript_syntax::operators::AssignmentOperator;
use rsvelte_typescript_syntax::syntax_tree::{Class, Control, flag};
use rustc_hash::FxHashMap;

use crate::lower::{
    CompileInput, Diagnostic, Kind, NodeIdentifier, Resolution, Span, SyntaxTree, Target, span_of,
    unsupported,
};

mod assignments;

use assignments::check_assignment;

use super::state_invalid_placement;

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
pub(in crate::lower) fn check_runes(
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
            return crate::lower::special::invalid(
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
            return crate::lower::special::invalid(
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
            return crate::lower::special::invalid(
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
        crate::lower::special::invalid(code, &message, span_of(self.javascript, e))
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
            return crate::lower::special::invalid(
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
    crate::lower::special::invalid(
        "rune_invalid_arguments_length",
        &format!("`{rune}` must be called with {expected}"),
        span_of(javascript, e),
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
            return crate::lower::special::invalid(
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
            return crate::lower::special::invalid(
                "props_invalid_pattern",
                "`$props()` assignment must not contain nested properties or computed keys",
                span_of(javascript, property),
            );
        }
    }
    Ok(())
}
