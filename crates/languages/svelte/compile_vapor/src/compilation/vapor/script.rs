use rsvelte_typescript::SyntaxTree;
use rsvelte_typescript::copy::Rewrite;

use super::{Builder, Kind, NodeIdentifier, SYNTHETIC, Verbatim, call_name, copy};

impl Builder<'_> {
    fn module_script(&mut self) -> Vec<NodeIdentifier> {
        let Some(program) = self.input.module_script else {
            return Vec::new();
        };
        let from = &self.input.javascript;
        let Kind::Program(statements) = from.kind(program) else {
            unreachable!("a module script is a program")
        };
        statements
            .iter()
            .map(|&statement| copy(from, &mut self.to, &mut Verbatim, statement))
            .collect()
    }

    pub(super) fn setup_function(
        &mut self,
        body: &[NodeIdentifier],
        module: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let props = self.to.identifier("__props");
        let asynchronous =
            super::super::asynchronous::has_await(&self.input.javascript, self.input.script);
        let mut block = self.to.block(body, SYNTHETIC);
        if asynchronous {
            if self.input.server {
                self.helpers.insert("withAsyncContext");
                module.extend(crate::helpers::source_declarations(
                    include_str!("async_server.js"),
                    &mut self.to,
                ));
                let helper = self.to.identifier("$$server_async_context");
                let value = self.to.call0(helper, &[]);
                let context = self.to.identifier("$$async_context");
                let declaration = self.to.let_(
                    rsvelte_typescript::syntax_tree::flag::CONST,
                    context,
                    Some(value),
                );
                let mut statements = Vec::with_capacity(body.len() + 1);
                statements.push(declaration);
                statements.extend_from_slice(body);
                block = self.to.block(&statements, SYNTHETIC);
            } else {
                block = self.async_setup(block, module);
            }
        }
        let mut parameters = vec![props];
        if self.exposed {
            parameters.push(self.to.identifier("$$setup_context"));
        }
        self.to.function(
            false,
            None,
            &parameters,
            block,
            asynchronous && self.input.server,
            SYNTHETIC,
        )
    }

    pub(super) fn async_setup(
        &mut self,
        block: NodeIdentifier,
        module: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        self.helpers.extend([
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
        module.extend(crate::helpers::source_declarations(
            include_str!("async_setup.js"),
            &mut self.to,
        ));
        let context = self.to.identifier("$$async_context");
        let finish = self.to.dot(context, "finish");
        let finish = self.to.call0(finish, &[]);
        let finish = self.to.expression_statement(finish);
        let finalizer = self.to.block(&[finish], SYNTHETIC);
        let statement = self.to.control(
            rsvelte_typescript::syntax_tree::Control::Try {
                block,
                handler: None,
                finalizer: Some(finalizer),
            },
            SYNTHETIC,
        );
        let block = self.to.block(&[statement], SYNTHETIC);
        let task = self.to.arrow(&[context], block, false, true, SYNTHETIC);
        let helper = self.to.identifier("$$async_setup");
        let call = self.to.call0(helper, &[task]);
        let result = self.to.return_(Some(call), SYNTHETIC);
        self.to.block(&[result], SYNTHETIC)
    }

    pub(super) fn script(
        &mut self,
        body: &mut Vec<NodeIdentifier>,
    ) -> (Vec<NodeIdentifier>, Vec<NodeIdentifier>) {
        let from = &self.input.javascript;
        let Kind::Program(statements) = from.kind(self.input.script) else {
            unreachable!("a translated script is a program")
        };
        let mut module = Vec::new();
        let mut fields = Vec::new();
        for &s in statements {
            if let Kind::Function {
                name: Some(name),
                declaration: true,
                ..
            } = from.kind(s)
                && from.name(name).starts_with("$$snippet_")
            {
                continue;
            }
            if let Kind::VariableDeclaration { declarations, .. } = from.kind(s)
                && declarations.iter().any(|&node| matches!(from.kind(node), Kind::Declarator { identifier, .. } if matches!(from.kind(identifier), Kind::Identifier(_)) && from.name(identifier) == "$$on_mount"))
                && !self.input.server
            { self.helpers.insert("currentInstance"); }
            if let Kind::VariableDeclaration { declarations, .. } = from.kind(s)
                && declarations.iter().any(|&node| matches!(from.kind(node), Kind::Declarator { identifier, .. } if matches!(from.kind(identifier), Kind::Identifier(_)) && from.name(identifier) == "$$effect_watch"))
                && !self.input.server
            { self.helpers.extend(["currentInstance", "getCurrentScope", "setCurrentInstance", "restoreCurrentInstance"]); }
            if let Kind::Import { .. } = from.kind(s) {
                module.push(copy(from, &mut self.to, &mut Verbatim, s));
                continue;
            }
            if let Kind::VariableDeclaration { declarations, .. } = from.kind(s)
                && declarations.iter().all(|&declaration| {
                    let Kind::Declarator { identifier, .. } = from.kind(declaration) else {
                        return false;
                    };
                    if !matches!(from.kind(identifier), Kind::Identifier(_)) {
                        return false;
                    }
                    let name = from.name(identifier);
                    name.starts_with("$$")
                        && !name.starts_with("$$pattern_")
                        && !matches!(name, "$$props" | "$$attrs" | "$$host" | "$$host_value")
                })
            {
                module.push(copy(from, &mut self.to, &mut Verbatim, s));
                continue;
            }
            if let Kind::ExpressionStatement(e) = from.kind(s)
                && call_name(from, e) == Some("defineOptions")
            {
                let Kind::Call { arguments, .. } = from.kind(e) else {
                    unreachable!()
                };
                let Kind::Object(options) = from.kind(arguments[0]) else {
                    unreachable!()
                };
                fields.extend(
                    options
                        .iter()
                        .map(|&p| copy(from, &mut self.to, &mut Verbatim, p)),
                );
                continue;
            }
            if let Kind::ExpressionStatement(expression) = from.kind(s)
                && call_name(from, expression) == Some("defineExpose")
            {
                let Kind::Call { arguments, .. } = from.kind(expression) else {
                    unreachable!("an expose call")
                };
                let value = copy(from, &mut self.to, &mut Verbatim, arguments[0]);
                if self.input.custom_element.is_some() {
                    let helper = self.to.identifier("$$custom_element_exports");
                    let call = self.to.call0(helper, &[value]);
                    body.push(self.to.expression_statement(call));
                }
                let context = self.to.identifier("$$setup_context");
                let expose = self.to.dot(context, "expose");
                let call = self.to.call0(expose, &[value]);
                body.push(self.to.expression_statement(call));
                self.exposed = true;
                continue;
            }
            let call = self.resolution.define_props.map(|d| d.call);
            body.push(copy(
                from,
                &mut self.to,
                &mut PropsRewrite {
                    call,
                    server: self.input.server,
                },
                s,
            ));
        }
        if let Some(runtime) = self.resolution.define_props.and_then(|d| d.runtime) {
            let key = self.to.identifier("props");
            let value = copy(from, &mut self.to, &mut Verbatim, runtime);
            fields.push(self.to.property(key, value, 0, SYNTHETIC));
        }
        module.extend(self.module_script());
        (module, fields)
    }
}

struct PropsRewrite {
    call: Option<NodeIdentifier>,
    server: bool,
}

impl Rewrite for PropsRewrite {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        if Some(identifier) == self.call {
            return Some(to.identifier("__props"));
        }
        match from.kind(identifier) {
            Kind::Function { .. } | Kind::Arrow { .. } => {
                Some(copy(from, to, &mut Verbatim, identifier))
            }
            Kind::Call {
                callee, arguments, ..
            } if matches!(from.kind(callee), Kind::Identifier(_))
                && from.name(callee) == "$$async_derived"
                && !self.server =>
            {
                let getter = super::expressions::script_getter(from, to, arguments[0]);
                let callee = to.identifier("$$async_derived");
                Some(to.call0(callee, &[getter]))
            }
            Kind::Await(value) => {
                let value = copy(from, to, self, value);
                let context = to.identifier("$$async_context");
                let suspend = to.dot(context, "suspend");
                let value = to.call0(suspend, &[value]);
                let value = to.await_(value, SYNTHETIC);
                let resume = to.dot(context, "resume");
                Some(to.call0(resume, &[value]))
            }
            _ => None,
        }
    }
}
