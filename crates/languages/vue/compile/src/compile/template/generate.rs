use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{BinaryOperator, LogicalOperator, Statement, UnaryOperator};
use oxc_ast_visit::VisitMut;
use rsvelte_typescript_compile::build::Builder;

use super::{
    Cg, Cid, Compiled, DirectiveName, Exp, ExpRewrite, Expression, Helper, Lit, Nid, Node,
    PropertyView, Resolution, Tree, VChildren, is_simple_identifier,
};
use crate::compile::out;

pub(super) struct Gen<'a, 'b, 'o> {
    t: &'a Compiled,
    javascript: &'a Tree,
    res: &'a Resolution,
    inline: bool,
    b: &'b Builder<'o>,
}

impl Compiled {
    /// `generate` for a module: the preamble (`genModulePreamble`: the helper import and the
    /// hoists) and the expression the render function returns.
    pub(crate) fn generate<'o>(
        &self,
        javascript: &Tree,
        res: &Resolution,
        inline: bool,
        b: &Builder<'o>,
    ) -> (Vec<Statement<'o>>, Expression<'o>) {
        let mut g = Gen {
            t: self,
            javascript,
            res,
            inline,
            b,
        };
        let mut preamble = Vec::new();
        if !self.helpers.is_empty() {
            let specifiers = self
                .helpers
                .iter()
                .map(|h| (h.name(), out::name(b, &format!("_{}", h.name()))));
            preamble.push(out::import(b, specifiers, "vue"));
        }
        for (i, &h) in self.hoists.iter().enumerate() {
            let value = g.cg(h);
            preamble.push(b.const_(&format!("_hoisted_{}", i + 1), value));
        }
        let ret = self.root_codegen.map_or_else(|| b.null(), |c| g.cg(c));
        (preamble, ret)
    }
}

impl<'o> Gen<'_, '_, 'o> {
    fn helper(&self, h: Helper) -> Expression<'o> {
        self.b.id(&format!("_{}", h.name()))
    }

    /// The input expression, copied into the output with its names rewritten.
    fn exp(&self, e: Exp) -> Expression<'o> {
        let mut copied = self
            .javascript
            .get_expression(e.node)
            .clone_in_with_semantic_ids(self.b.allocator());
        ExpRewrite {
            res: self.res,
            b: self.b,
            inline: self.inline,
            event_local: e.event_local,
        }
        .visit_expression(&mut copied);
        copied
    }

    /// The input expression as written.
    fn verbatim(&self, e: Exp) -> Expression<'o> {
        self.javascript
            .get_expression(e.node)
            .clone_in(self.b.allocator())
    }

    /// `genNode` for a template node.
    fn node(&mut self, n: Nid) -> Expression<'o> {
        let b = self.b;
        match &self.t.tree[n] {
            Node::Text(t) => b.string(t),
            Node::Interpolation(e) => {
                let x = self.exp(*e);
                b.call(self.helper(Helper::ToDisplayString), [x])
            }
            Node::Compound(list) => {
                let mut acc: Option<Expression<'o>> = None;
                for &c in list {
                    let x = self.node(c);
                    acc = Some(match acc {
                        None => x,
                        Some(l) => b.binary(l, BinaryOperator::Addition, x),
                    });
                }
                acc.expect("a compound has children")
            }
            Node::Element { codegen, .. }
            | Node::If { codegen, .. }
            | Node::For { codegen, .. } => self.cg(codegen.expect("a transformed node")),
            Node::TextCall { codegen, .. } => self.cg(*codegen),
            Node::Root(_) | Node::Branch { .. } => unreachable!("not generated on its own"),
        }
    }

    #[expect(clippy::too_many_lines, reason = "one arm per codegen node")]
    fn cg(&mut self, c: Cid) -> Expression<'o> {
        let b = self.b;
        match &self.t.cg[c] {
            Cg::VNode {
                tag,
                props,
                children,
                patch_flag,
                dynamic_props,
                directives,
                is_block,
                disable_tracking,
                ..
            } => {
                let (props, patch_flag, dynamic_props) = (*props, *patch_flag, *dynamic_props);
                let directives = *directives;
                let (is_block, disable_tracking) = (*is_block, *disable_tracking);
                let tag = tag
                    .as_ref()
                    .map_or_else(|| self.helper(Helper::Fragment), |t| b.string(t));
                let mut arguments: Vec<Option<Expression<'o>>> = vec![Some(tag)];
                arguments.push(props.map(|p| self.cg(p)));
                let children = children.clone();
                arguments.push(children.map(|ch| match ch {
                    VChildren::Node(n) => self.node(n),
                    VChildren::List(list) => self.node_array(&list),
                    VChildren::Cg(c) => self.cg(c),
                }));
                arguments.push(patch_flag.map(|f| self.flag(f)));
                arguments.push(dynamic_props.map(|d| self.cg(d)));
                while arguments.last().is_some_and(Option::is_none) {
                    arguments.pop();
                }
                let arguments: Vec<Expression<'o>> = arguments
                    .into_iter()
                    .map(|a| a.unwrap_or_else(|| b.null()))
                    .collect();
                let callee = self.helper(if is_block {
                    Helper::CreateElementBlock
                } else {
                    Helper::CreateElementVNode
                });
                let mut call = b.call(callee, arguments);
                if is_block {
                    let open_arguments = disable_tracking.then(|| b.boolean(true));
                    let open = b.call(self.helper(Helper::OpenBlock), open_arguments);
                    call = b.sequence([open, call]);
                }
                let Some(d) = directives else {
                    return call;
                };
                let list = self.cg(d);
                b.call(self.helper(Helper::WithDirectives), [call, list])
            }
            Cg::Call { callee, arguments } => {
                let callee = *callee;
                let arguments: Vec<Expression<'o>> =
                    arguments.clone().into_iter().map(|a| self.cg(a)).collect();
                b.call(self.helper(callee), arguments)
            }
            Cg::Object(list) => {
                let properties: Vec<_> = list
                    .clone()
                    .into_iter()
                    .map(|(k, v)| {
                        let key = if is_simple_identifier(&k) {
                            b.key(&k)
                        } else {
                            oxc_ast::ast::PropertyKey::from(b.string(&k))
                        };
                        let value = self.cg(v);
                        b.property(key, value, false)
                    })
                    .collect();
                b.object(properties)
            }
            Cg::NodeArray(list) => {
                let list = list.clone();
                self.node_array(&list)
            }
            Cg::Array(list) => {
                let items: Vec<Expression<'o>> =
                    list.clone().into_iter().map(|c| self.cg(c)).collect();
                b.array(items)
            }
            &Cg::Helper(h) => self.helper(h),
            Cg::PropertyNames(names) => b.array(names.iter().map(|n| b.string(n))),
            Cg::Lit { lit, .. } => match lit {
                Lit::String(s) => b.string(s),
                Lit::Number(v) => b.number(*v),
                Lit::Boolean(v) => b.boolean(*v),
                Lit::Undefined => b.void0(),
            },
            Cg::Exp(e) => self.exp(*e),
            &Cg::Handler { exp, inline } => {
                if inline {
                    return b.arrow(b.params(["$event"]), self.exp(exp));
                }
                let call = out::spread_call(b, self.exp(exp), b.id("args"));
                let body = b.logical(self.exp(exp), LogicalOperator::And, call);
                out::rest_arrow(b, "args", body)
            }
            &Cg::ModelUpdate { target, is_ref } => {
                let lhs = if is_ref {
                    b.member(self.verbatim(target), "value")
                } else {
                    self.exp(target)
                };
                let body = b.assign_member(lhs, b.id("$event"));
                b.arrow(b.params(["$event"]), body)
            }
            &Cg::Function {
                parameters,
                returns,
            } => {
                let mut parameters = self
                    .javascript
                    .get_parameters(parameters)
                    .clone_in(b.allocator());
                parameters.kind = oxc_ast::ast::FormalParameterKind::ArrowFormalParameters;
                let r = self.cg(returns);
                b.arrow_block(b.alloc(parameters), [b.return_(Some(r))], false)
            }
            &Cg::Conditional {
                test,
                consequent,
                alternate,
            } => {
                let t = self.exp(test);
                let c = self.cg(consequent);
                let a = self.cg(alternate);
                Expression::new_conditional_expression(oxc_span::SPAN, t, c, a, b)
            }
            &Cg::Cache {
                index,
                value,
                spread,
            } => {
                #[expect(clippy::cast_precision_loss, reason = "a cache slot")]
                let slot = || b.computed(b.id("_cache"), b.number(index as f64));
                let v = self.cg(value);
                let cached = b.logical(slot(), LogicalOperator::Or, b.assign_member(slot(), v));
                if spread {
                    out::spread_array(b, cached)
                } else {
                    cached
                }
            }
            Cg::Hoisted(i) => b.id(&format!("_hoisted_{i}")),
            Cg::Node(n) => self.node(*n),
        }
    }

    fn node_array(&mut self, list: &[Nid]) -> Expression<'o> {
        let items: Vec<Expression<'o>> = list.iter().map(|&n| self.node(n)).collect();
        self.b.array(items)
    }

    fn flag(&self, f: i32) -> Expression<'o> {
        let n = self.b.number(f64::from(f.abs()));
        if f < 0 {
            self.b.unary(UnaryOperator::UnaryNegation, n)
        } else {
            n
        }
    }
}

/// `v-bind="obj"`: a `v-bind` without an argument.
pub(super) const fn is_object_bind(p: &PropertyView) -> bool {
    matches!(p, PropertyView::Dir(DirectiveName::Bind, a, ..) if a.is_empty())
}
