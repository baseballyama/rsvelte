use oxc_allocator::{CloneIn, GetAllocator, TakeIn};
use oxc_ast::ast::{
    ArrowFunctionExpression, BlockStatement, Class, Expression, Function, ObjectPropertyKind,
    Program, Statement,
};
use oxc_ast_visit::{Visit, VisitMut, walk_mut};
use oxc_span::SPAN;
use oxc_syntax::node::NodeId;
use oxc_syntax::scope::ScopeFlags;
use rsvelte_typescript_compile::build::Builder;
use rsvelte_vue_semantic::resolve::call_name;

use super::expressions::script_getter;
use super::{Body, Emitter};
use crate::compilation::{markers, prelude};

const EFFECT_WATCH: [&str; 4] = [
    "currentInstance",
    "getCurrentScope",
    "setCurrentInstance",
    "restoreCurrentInstance",
];

impl<'o> Emitter<'_, 'o> {
    /// The script's statements: imports and the translation's own declarations to the module,
    /// `defineOptions` and `defineProps`' declaration to the component's options, the rest to
    /// setup. Returns the module's statements and the options.
    pub(super) fn script(
        &mut self,
        body: &mut Body<'o>,
    ) -> (Vec<Statement<'o>>, Vec<ObjectPropertyKind<'o>>) {
        let b = self.b;
        let program = self.res.tree().get_program(self.t.script);
        let define_props = self.res.define_props();
        let call = define_props.map(|d| d.call.node_id.get());
        let mut module = Vec::new();
        let mut fields = Vec::new();
        for marked in &program.body {
            let prelude = prelude::expand(marked);
            // A prelude bound for the module whole stays a marker, which the printer expands.
            if let Some(prelude) = prelude
                && prelude.iter().all(module_level)
            {
                for s in prelude {
                    self.note_vue_imports(s);
                }
                module.push(prelude::remark(b, marked).expect("a prelude's marker"));
                continue;
            }
            for s in prelude.unwrap_or_else(|| std::slice::from_ref(marked)) {
                if let Statement::FunctionDeclaration(f) = s
                    && f.id
                        .as_ref()
                        .is_some_and(|id| id.name.starts_with(markers::SNIPPET_PREFIX))
                {
                    continue;
                }
                self.note_vue_imports(s);
                if module_level(s) {
                    module.push(s.clone_in(b.allocator()));
                    continue;
                }
                if let Statement::ExpressionStatement(e) = s
                    && let Expression::CallExpression(c) = &e.expression
                {
                    match call_name(&e.expression) {
                        Some("defineOptions") => {
                            let Some(Expression::ObjectExpression(options)) =
                                c.arguments.first().and_then(|a| a.as_expression())
                            else {
                                unreachable!("defineOptions takes an object")
                            };
                            fields.extend(
                                options.properties.iter().map(|p| p.clone_in(b.allocator())),
                            );
                            continue;
                        }
                        Some("defineExpose") => {
                            let value = c.arguments[0].to_expression();
                            if self.t.template.custom_element.is_some() {
                                let call = b.call(
                                    b.id("$$custom_element_exports"),
                                    [value.clone_in(b.allocator())],
                                );
                                body.push(b.statement(call));
                            }
                            let expose = b.call(
                                b.member(b.id("$$setup_context"), "expose"),
                                [value.clone_in(b.allocator())],
                            );
                            body.push(b.statement(expose));
                            self.exposed = true;
                            continue;
                        }
                        _ => {}
                    }
                }
                let mut statement = s.clone_in_with_semantic_ids(b.allocator());
                PropsRewrite {
                    b,
                    call,
                    server: self.t.server,
                }
                .visit_statement(&mut statement);
                body.push(statement);
            }
        }
        if let Some(runtime) = define_props.and_then(|d| d.runtime) {
            fields.push(b.init("props", runtime.clone_in(b.allocator())));
        }
        if let Some(module_script) = self.t.module_script {
            let program = self.res.tree().get_program(module_script);
            module.extend(program.body.iter().map(|s| s.clone_in(b.allocator())));
        }
        (module, fields)
    }

    /// The Vue exports a declaration of the script needs.
    fn note_vue_imports(&mut self, s: &Statement<'_>) {
        if !self.t.server && declares(s, |name| name == markers::ON_MOUNT) {
            self.vue_imports.insert("currentInstance");
        }
        if !self.t.server && declares(s, |name| name == "$$effect_watch") {
            self.vue_imports.extend(EFFECT_WATCH);
        }
    }

    /// `function (__props, $$setup_context) { body }`, which runs the setup in an async context
    /// when it awaits.
    pub(super) fn setup_function(
        &mut self,
        body: Vec<Statement<'o>>,
        module: &mut Vec<Statement<'o>>,
    ) -> Expression<'o> {
        let b = self.b;
        let asynchronous = program_has_await(self.res.tree().get_program(self.t.script));
        let mut body = body;
        if asynchronous {
            if self.t.server {
                self.vue_imports.insert("withAsyncContext");
                module.push(prelude::marker(b, include_str!("async_server.js")));
                let context = b.call(b.id("$$server_async_context"), []);
                body.insert(0, b.const_("$$async_context", context));
            } else {
                body = self.async_setup(body, module);
            }
        }
        let mut parameters = vec!["__props"];
        if self.exposed {
            parameters.push("$$setup_context");
        }
        b.function_expression(
            None,
            b.parameters(parameters),
            body,
            asynchronous && self.t.server,
        )
    }

    /// `return $$async_setup(async ($$async_context) => { try { body } finally { … } })`.
    fn async_setup(
        &mut self,
        body: Vec<Statement<'o>>,
        module: &mut Vec<Statement<'o>>,
    ) -> Vec<Statement<'o>> {
        let b = self.b;
        self.vue_imports.extend([
            "VaporFragment",
            "currentInstance",
            "effectScope",
            "setCurrentInstance",
            "restoreCurrentInstance",
            "onScopeDispose",
            "insert",
            "handleError",
            "queuePostFlushCb",
        ]);
        module.push(prelude::marker(b, include_str!("async_setup.js")));
        let finish = b.statement(b.call(b.member(b.id("$$async_context"), "finish"), []));
        let statement = Statement::new_try_statement(
            SPAN,
            BlockStatement::boxed(SPAN, b.vec(body), b),
            None,
            Some(BlockStatement::boxed(SPAN, b.vec([finish]), b)),
            b,
        );
        let task = b.arrow_block(b.parameters(["$$async_context"]), [statement], true);
        vec![b.return_(Some(b.call(b.id("$$async_setup"), [task])))]
    }
}

/// Whether a statement of the script goes to the module: an import, or a declaration of `$$`
/// names only that are not the component's own.
fn module_level(s: &Statement<'_>) -> bool {
    match s {
        Statement::ImportDeclaration(_) => true,
        Statement::VariableDeclaration(d) => d.declarations.iter().all(|d| {
            d.id.get_binding_identifier().is_some_and(|id| {
                id.name.starts_with("$$")
                    && !id.name.starts_with(markers::PATTERN_PREFIX)
                    && !matches!(
                        id.name.as_str(),
                        "$$props" | "$$attrs" | "$$host" | "$$host_value"
                    )
            })
        }),
        _ => false,
    }
}

/// The setup's statements: `defineProps()` reads the props, an `await` keeps the instance, and an
/// async derived caches its reads; functions run later and stay as written.
struct PropsRewrite<'a, 'o> {
    b: &'a Builder<'o>,
    call: Option<NodeId>,
    server: bool,
}

impl<'o> VisitMut<'o> for PropsRewrite<'_, 'o> {
    fn visit_expression(&mut self, it: &mut Expression<'o>) {
        let b = self.b;
        match it {
            Expression::CallExpression(c) if Some(c.node_id.get()) == self.call => {
                *it = b.id("__props");
            }
            Expression::CallExpression(c)
                if !self.server
                    && matches!(&c.callee, Expression::Identifier(id) if id.name == "$$async_deriv\
                        ed") =>
            {
                let getter = c.arguments[0].to_expression_mut().take_in(b);
                *c.arguments[0].to_expression_mut() = script_getter(b, getter);
            }
            Expression::AwaitExpression(a) => {
                self.visit_expression(&mut a.argument);
                let value = a.argument.take_in(b);
                let context = || b.id("$$async_context");
                let suspended = b.call(b.member(context(), "suspend"), [value]);
                let awaited = Expression::new_await_expression(SPAN, suspended, b);
                *it = b.call(b.member(context(), "resume"), [awaited]);
            }
            _ => walk_mut::walk_expression(self, it),
        }
    }

    fn visit_function(&mut self, _: &mut Function<'o>, _: ScopeFlags) {}

    fn visit_arrow_function_expression(&mut self, _: &mut ArrowFunctionExpression<'o>) {}
}

/// Whether `statement` declares a variable whose name `wanted` accepts.
fn declares(statement: &Statement<'_>, wanted: impl Fn(&str) -> bool) -> bool {
    let Statement::VariableDeclaration(d) = statement else {
        return false;
    };
    d.declarations.iter().any(|d| {
        d.id.get_binding_identifier()
            .is_some_and(|id| wanted(&id.name))
    })
}

/// An `await` that a program's top level runs, the preludes it marks among it.
fn program_has_await(program: &Program<'_>) -> bool {
    let mut v = TopLevelAwait(false);
    for statement in prelude::expanded(&program.body) {
        v.visit_statement(statement);
    }
    v.0
}

struct TopLevelAwait(bool);

impl<'a> Visit<'a> for TopLevelAwait {
    fn visit_expression(&mut self, it: &Expression<'a>) {
        self.0 |= rsvelte_svelte_compile::lower::is_expression_async(it);
    }

    fn visit_function(&mut self, _: &Function<'a>, _: ScopeFlags) {}

    fn visit_class(&mut self, _: &Class<'a>) {}
}
