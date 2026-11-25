use oxc_ast::ast::{AssignmentOperator, AssignmentTarget, Expression, SimpleAssignmentTarget};
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_compile::Target;
use rsvelte_svelte_semantic::compiler_syntax_tree as svelte;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier as SvelteNodeIdentifier,
};
use rsvelte_typescript_tree::{ExpressionIdentifier, document_span, node_span};
use rsvelte_vue_semantic::compiler_syntax_tree::{Directive, Property};

use super::{Template, expression_of, output_span, vmodel};
use crate::compilation::info::{Class, Declared};
use crate::compilation::names::Helper;
use crate::compilation::{R, unsupported};

/// An attribute waiting for the element it goes on.
type Pending = Box<dyn FnOnce(SvelteNodeIdentifier, &Property) -> Attribute>;

/// The object of the innermost member of `e`'s chain, or `e` itself.
fn member_root<'e, 'v>(mut e: &'e Expression<'v>) -> &'e Expression<'v> {
    loop {
        e = match e {
            Expression::StaticMemberExpression(m) => &m.object,
            Expression::ComputedMemberExpression(m) => &m.object,
            Expression::PrivateFieldExpression(m) => &m.object,
            _ => return e,
        };
    }
}

impl<'a> Template<'_, '_, '_, 'a> {
    /// `v-model`. On the client, Vue's own directive runs on the element through an attachment;
    /// on the server, the attribute compiler-ssr's `ssrTransformModel` renders.
    pub(super) fn model(
        &mut self,
        tag: &str,
        ty: Option<&str>,
        value: Option<&str>,
        p: &Property,
        d: &Directive,
    ) -> R<Option<Pending>> {
        let (source_text, info) = (self.source_text, self.info);
        if d.arg.is_some() {
            return Err(unsupported("a `v-model` argument on an element", p.span));
        }
        let exp = expression_of(d, p.span)?;
        let written = info.from.get_expression(exp);
        if !matches!(written, Expression::Identifier(_)) && !written.is_member_expression() {
            return Err(unsupported(
                "a `v-model` value other than a variable or a member",
                node_span(written),
            ));
        }
        self.check_model_target(written)?;
        let dir = match (tag, ty) {
            ("input", Some("checkbox")) => Helper::VModelCheckbox,
            ("input", Some("radio")) => Helper::VModelRadio,
            ("input", Some("file")) => {
                return Err(unsupported("`v-model` on a file input", p.span));
            }
            ("input", _) => {
                if value.is_some() {
                    return Err(unsupported("`v-model` beside a `value`", p.span));
                }
                Helper::VModelText
            }
            ("select", _) => Helper::VModelSelect,
            _ => {
                return Err(unsupported(format_args!("`v-model` on `<{tag}>`"), p.span));
            }
        };
        let mut modifiers = Vec::new();
        for m in &d.modifiers {
            let m = m.text(source_text);
            if !matches!(m, "lazy" | "number" | "trim") {
                return Err(unsupported(
                    format_args!("the `v-model` modifier `.{m}`"),
                    p.span,
                ));
            }
            modifiers.push(m);
        }
        if info.target == Target::Server {
            return self.ssr_model(dir, exp, value);
        }
        let b = self.b;
        let model = self.expression(exp)?;
        let callee = self.helper(dir);
        let mods = b.object(
            modifiers
                .iter()
                .map(|m| b.property(b.key(m), b.boolean(true))),
        );
        let parameter = self.names.fresh("value");
        let target = match self.expression(exp)? {
            Expression::Identifier(identifier) => {
                SimpleAssignmentTarget::AssignmentTargetIdentifier(identifier)
            }
            e if e.is_member_expression() => {
                SimpleAssignmentTarget::from(e.into_member_expression())
            }
            _ => {
                return Err(unsupported(
                    "a `v-model` value other than a variable or a member",
                    node_span(written),
                ));
            }
        };
        let assign = b.assign(
            AssignmentOperator::Assign,
            AssignmentTarget::from(target),
            b.id(&parameter),
        );
        let assigner = b.arrow(b.parameters([parameter.as_str()]), assign);
        let mut props = vec![b.property(b.key("onUpdate:modelValue"), assigner)];
        for (name, text) in [("type", ty), ("value", value)] {
            if let Some(text) = text {
                props.push(b.property(b.key(name), b.string(text)));
            }
        }
        let props = b.object(props);
        let vmodel = self.vmodel_helper();
        let mut call = b.call(b.id(&vmodel), [callee, model, mods, props]);
        if let Expression::CallExpression(c) = &mut call {
            c.span = output_span(p.span);
        }
        let call = self.keep(call);
        Ok(Some(Box::new(move |owner, p| Attribute {
            name: svelte::Name::Spelled {
                text: "".into(),
                span: p.span,
            },
            value: AttributeValue::Attach(call),
            span: p.span,
            owner,
            origin: p.origin,
        })))
    }

    pub(super) fn ssr_model(
        &mut self,
        dir: Helper,
        e: ExpressionIdentifier,
        value: Option<&str>,
    ) -> R<Option<Pending>> {
        let b = self.b;
        let (name, v) = match dir {
            Helper::VModelText => {
                let m = self.expression(e)?;
                ("value", self.renderable_value(m))
            }
            Helper::VModelCheckbox => {
                let value = self.value_or_null(value);
                let test = self.is_array(e)?;
                let m = self.expression(e)?;
                let contain = self.helper(Helper::SsrLooseContain);
                let contain = b.call(contain, [m, value]);
                let m = self.expression(e)?;
                let c = b.conditional(test, contain, m);
                ("checked", self.ssr_boolean(c))
            }
            Helper::VModelRadio => {
                let value = self.value_or_null(value);
                let m = self.expression(e)?;
                let eq = self.helper(Helper::SsrLooseEqual);
                let eq = b.call(eq, [m, value]);
                ("checked", self.ssr_boolean(eq))
            }
            _ => return Ok(None),
        };
        let v = self.keep(v);
        Ok(Some(Box::new(move |owner, p| Attribute {
            name: svelte::Name::Spelled {
                text: name.into(),
                span: p.span,
            },
            value: AttributeValue::Expression {
                expression: v,
                quoted: false,
            },
            span: p.span,
            owner,
            origin: p.origin,
        })))
    }

    /// compiler-ssr `processOption`.
    pub(super) fn ssr_option_selected(
        &mut self,
        model: ExpressionIdentifier,
        value: Option<&str>,
        owner: SvelteNodeIdentifier,
        span: Span,
    ) -> R<Attribute> {
        let b = self.b;
        let test = self.is_array(model)?;
        let v = self.value_or_null(value);
        let m = self.expression(model)?;
        let contain = self.helper(Helper::SsrLooseContain);
        let contain = b.call(contain, [m, v]);
        let value = self.value_or_null(value);
        let m = self.expression(model)?;
        let eq = self.helper(Helper::SsrLooseEqual);
        let eq = b.call(eq, [m, value]);
        let c = b.conditional(test, contain, eq);
        let v = self.ssr_boolean(c);
        let v = self.keep(v);
        Ok(Attribute {
            name: svelte::Name::Spelled {
                text: "selected".into(),
                span,
            },
            value: AttributeValue::Expression {
                expression: v,
                quoted: false,
            },
            span,
            owner,
            origin: u32::MAX,
        })
    }

    fn value_or_null(&self, value: Option<&str>) -> Expression<'a> {
        value.map_or_else(|| self.b.null(), |v| self.b.string(v))
    }

    fn is_array(&self, e: ExpressionIdentifier) -> R<Expression<'a>> {
        let m = self.expression(e)?;
        Ok(self
            .b
            .call(self.b.member(self.b.id("Array"), "isArray"), [m]))
    }

    fn ssr_boolean(&mut self, v: Expression<'a>) -> Expression<'a> {
        let callee = self.helper(Helper::SsrIncludeBooleanAttribute);
        self.b.call(callee, [v])
    }

    /// What `v-model` may assign: not a prop, a computed, a `v-for` alias, a constant or an
    /// unresolved name.
    fn check_model_target(&self, e: &Expression<'_>) -> R<()> {
        let info = self.info;
        let root = member_root(e);
        if let Expression::Identifier(identifier) = e {
            let ok = info.symbol(identifier).is_some_and(|s| {
                info.class.get(&s) == Some(&Class::Ref)
                    || info
                        .top
                        .get(&s)
                        .is_some_and(|t| matches!(t.declared, Declared::Let | Declared::Var))
            });
            if !ok {
                return Err(unsupported(
                    "`v-model` on something other than a ref or a variable",
                    document_span(identifier.span),
                ));
            }
        } else if info
            .class_of_expression(root)
            .is_some_and(|c| matches!(c, Class::Props | Class::Computed))
        {
            return Err(unsupported(
                "`v-model` on a prop or a computed",
                node_span(e),
            ));
        }
        Ok(())
    }

    fn vmodel_helper(&mut self) -> String {
        if let Some(n) = &self.vmodel {
            return n.clone();
        }
        let name = self.names.fresh("vmodel");
        let untrack = self.names.helper(Helper::Untrack);
        let declarations = vmodel(self.b, &name, &untrack, self.names);
        self.hoisted.extend(declarations);
        self.vmodel = Some(name.clone());
        name
    }
}
