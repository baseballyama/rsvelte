use super::{
    AssignmentOperator, BinaryOperator, Cg, Cid, Compiled, DirectiveName, Exp, ExpRewrite,
    FxHashMap, Helper, Lit, LogicalOperator, Nid, Node, NodeIdentifier, PropertyView, RefInfo,
    Resolution, SourceLocation, SyntaxTree, UnaryOperator, VChildren, Verbatim, copy, flag,
    is_simple_identifier, reference_table,
};

pub(super) struct Gen<'a> {
    t: &'a Compiled,
    javascript: &'a SyntaxTree,
    res: &'a Resolution,
    references: FxHashMap<NodeIdentifier, RefInfo>,
    inline: bool,
    to: &'a mut SyntaxTree,
}

impl Compiled {
    /// `generate` for a module: the preamble (`genModulePreamble`: the helper import and the
    /// hoists) and the expression the render function returns.
    pub fn generate(
        &self,
        javascript: &SyntaxTree,
        res: &Resolution,
        inline: bool,
        to: &mut SyntaxTree,
    ) -> (Vec<NodeIdentifier>, NodeIdentifier) {
        let mut g = Gen {
            t: self,
            javascript,
            res,
            references: reference_table(res),
            inline,
            to,
        };
        let mut preamble = Vec::new();
        if !self.helpers.is_empty() {
            let specs: Vec<NodeIdentifier> = self
                .helpers
                .iter()
                .map(|h| {
                    let imported = g.to.identifier(h.name());
                    let local = g.to.identifier(&format!("_{}", h.name()));
                    g.to.import_named(imported, local, false, SourceLocation::SYNTHETIC)
                })
                .collect();
            let source = g.to.write_string("vue");
            preamble.push(g.to.import(&specs, source, false, SourceLocation::SYNTHETIC));
        }
        for (i, &h) in self.hoists.iter().enumerate() {
            let value = g.cg(h);
            let name = g.to.identifier(&format!("_hoisted_{}", i + 1));
            preamble.push(g.to.let_(flag::CONST, name, Some(value)));
        }
        let ret = match self.root_codegen {
            Some(c) => g.cg(c),
            None => g.to.null(SourceLocation::SYNTHETIC),
        };
        (preamble, ret)
    }
}

impl Gen<'_> {
    fn helper(&mut self, h: Helper) -> NodeIdentifier {
        self.to.identifier(&format!("_{}", h.name()))
    }

    fn exp(&mut self, e: Exp) -> NodeIdentifier {
        let mut rw = ExpRewrite {
            res: self.res,
            references: &self.references,
            inline: self.inline,
            event_local: e.event_local,
        };
        copy(self.javascript, self.to, &mut rw, e.node)
    }

    /// `genNode` for a template node.
    fn node(&mut self, n: Nid) -> NodeIdentifier {
        match &self.t.tree[n] {
            Node::Text(t) => self.to.write_string(t),
            Node::Interpolation(e) => {
                let x = self.exp(*e);
                let callee = self.helper(Helper::ToDisplayString);
                self.to.call0(callee, &[x])
            }
            Node::Compound(list) => {
                let mut acc: Option<NodeIdentifier> = None;
                for &c in list {
                    let x = self.node(c);
                    acc = Some(match acc {
                        None => x,
                        Some(l) => {
                            self.to
                                .binary(BinaryOperator::Add, l, x, SourceLocation::SYNTHETIC)
                        }
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
    fn cg(&mut self, c: Cid) -> NodeIdentifier {
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
                let tag = match tag {
                    Some(t) => self.to.write_string(t),
                    None => self.helper(Helper::Fragment),
                };
                let mut arguments: Vec<Option<NodeIdentifier>> = vec![Some(tag)];
                arguments.push(props.map(|p| self.cg(p)));
                arguments.push(children.as_ref().map(|ch| match ch {
                    VChildren::Node(n) => self.node(*n),
                    VChildren::List(list) => self.node_array(list),
                    VChildren::Cg(c) => self.cg(*c),
                }));
                arguments.push(patch_flag.map(|f| self.flag(f)));
                arguments.push(dynamic_props.map(|d| self.cg(d)));
                while arguments.last().is_some_and(Option::is_none) {
                    arguments.pop();
                }
                let arguments: Vec<NodeIdentifier> = arguments
                    .into_iter()
                    .map(|a| a.unwrap_or_else(|| self.to.null(SourceLocation::SYNTHETIC)))
                    .collect();
                let callee = self.helper(if is_block {
                    Helper::CreateElementBlock
                } else {
                    Helper::CreateElementVNode
                });
                let mut call = self.to.call0(callee, &arguments);
                if is_block {
                    let open = self.helper(Helper::OpenBlock);
                    let open_arguments = if disable_tracking {
                        vec![self.to.write_boolean(true, SourceLocation::SYNTHETIC)]
                    } else {
                        Vec::new()
                    };
                    let open = self.to.call0(open, &open_arguments);
                    call = self.to.seq(&[open, call], SourceLocation::SYNTHETIC);
                }
                let Some(d) = directives else {
                    return call;
                };
                let list = self.cg(d);
                let callee = self.helper(Helper::WithDirectives);
                self.to.call0(callee, &[call, list])
            }
            Cg::Call { callee, arguments } => {
                let arguments: Vec<NodeIdentifier> =
                    arguments.iter().map(|&a| self.cg(a)).collect();
                let callee = self.helper(*callee);
                self.to.call0(callee, &arguments)
            }
            Cg::Object(list) => {
                let props: Vec<NodeIdentifier> = list
                    .iter()
                    .map(|(k, v)| {
                        let key = if is_simple_identifier(k) {
                            self.to.identifier(k)
                        } else {
                            self.to.write_string(k)
                        };
                        let value = self.cg(*v);
                        self.to.property(key, value, 0, SourceLocation::SYNTHETIC)
                    })
                    .collect();
                self.to.object(&props, SourceLocation::SYNTHETIC)
            }
            Cg::NodeArray(list) => self.node_array(list),
            Cg::Array(list) => {
                let items: Vec<NodeIdentifier> = list.iter().map(|&c| self.cg(c)).collect();
                self.to.array(&items, SourceLocation::SYNTHETIC)
            }
            &Cg::Helper(h) => self.helper(h),
            Cg::PropertyNames(names) => {
                let items: Vec<NodeIdentifier> =
                    names.iter().map(|n| self.to.write_string(n)).collect();
                self.to.array(&items, SourceLocation::SYNTHETIC)
            }
            Cg::Lit { lit, .. } => match lit {
                Lit::String(s) => self.to.write_string(s),
                Lit::Number(v) => self.to.write_number(*v, SourceLocation::SYNTHETIC),
                Lit::Boolean(b) => self.to.write_boolean(*b, SourceLocation::SYNTHETIC),
                Lit::Undefined => {
                    let zero = self.to.write_number(0.0, SourceLocation::SYNTHETIC);
                    self.to
                        .unary(UnaryOperator::Void, zero, SourceLocation::SYNTHETIC)
                }
            },
            Cg::Exp(e) => self.exp(*e),
            &Cg::Handler { exp, inline } => {
                if inline {
                    let body = self.exp(exp);
                    let p = self.to.identifier("$event");
                    return self
                        .to
                        .arrow(&[p], body, true, false, SourceLocation::SYNTHETIC);
                }
                let a = self.exp(exp);
                let f = self.exp(exp);
                let arguments = self.to.identifier("args");
                let spread = self.to.spread(arguments, SourceLocation::SYNTHETIC);
                let call = self.to.call0(f, &[spread]);
                let body =
                    self.to
                        .logical(LogicalOperator::And, a, call, SourceLocation::SYNTHETIC);
                let arguments = self.to.identifier("args");
                let rest = self.to.rest(arguments, SourceLocation::SYNTHETIC);
                self.to
                    .arrow(&[rest], body, true, false, SourceLocation::SYNTHETIC)
            }
            &Cg::ModelUpdate { target, is_ref } => {
                let lhs = if is_ref {
                    let x = copy(self.javascript, self.to, &mut Verbatim, target.node);
                    self.to.dot(x, "value")
                } else {
                    self.exp(target)
                };
                let event = self.to.identifier("$event");
                let body = self.to.assign(
                    AssignmentOperator::Assign,
                    lhs,
                    event,
                    SourceLocation::SYNTHETIC,
                );
                let p = self.to.identifier("$event");
                self.to
                    .arrow(&[p], body, true, false, SourceLocation::SYNTHETIC)
            }
            Cg::Function {
                parameters,
                returns,
            } => {
                let ps: Vec<NodeIdentifier> = parameters
                    .iter()
                    .map(|&p| copy(self.javascript, self.to, &mut Verbatim, p))
                    .collect();
                let r = self.cg(*returns);
                let ret = self.to.return_(Some(r), SourceLocation::SYNTHETIC);
                let body = self.to.block(&[ret], SourceLocation::SYNTHETIC);
                self.to
                    .arrow(&ps, body, false, false, SourceLocation::SYNTHETIC)
            }
            &Cg::Conditional {
                test,
                consequent,
                alternate,
            } => {
                let t = self.exp(test);
                let c = self.cg(consequent);
                let a = self.cg(alternate);
                self.to.cond(t, c, a, SourceLocation::SYNTHETIC)
            }
            &Cg::Cache {
                index,
                value,
                spread,
            } => {
                #[expect(clippy::cast_precision_loss, reason = "a cache slot")]
                let slot = |to: &mut SyntaxTree| {
                    let cache = to.identifier("_cache");
                    let i = to.write_number(index as f64, SourceLocation::SYNTHETIC);
                    to.member(cache, i, true, false, SourceLocation::SYNTHETIC)
                };
                let read = slot(self.to);
                let v = self.cg(value);
                let target = slot(self.to);
                let assign = self.to.assign(
                    AssignmentOperator::Assign,
                    target,
                    v,
                    SourceLocation::SYNTHETIC,
                );
                let cached =
                    self.to
                        .logical(LogicalOperator::Or, read, assign, SourceLocation::SYNTHETIC);
                if !spread {
                    return cached;
                }
                let s = self.to.spread(cached, SourceLocation::SYNTHETIC);
                self.to.array(&[s], SourceLocation::SYNTHETIC)
            }
            Cg::Hoisted(i) => self.to.identifier(&format!("_hoisted_{i}")),
            Cg::Node(n) => self.node(*n),
        }
    }

    fn node_array(&mut self, list: &[Nid]) -> NodeIdentifier {
        let items: Vec<NodeIdentifier> = list.iter().map(|&n| self.node(n)).collect();
        self.to.array(&items, SourceLocation::SYNTHETIC)
    }

    fn flag(&mut self, f: i32) -> NodeIdentifier {
        let n = self
            .to
            .write_number(f64::from(f.abs()), SourceLocation::SYNTHETIC);
        if f < 0 {
            self.to
                .unary(UnaryOperator::Neg, n, SourceLocation::SYNTHETIC)
        } else {
            n
        }
    }
}

/// `v-bind="obj"`: a `v-bind` without an argument.
pub(super) const fn is_object_bind(p: &PropertyView) -> bool {
    matches!(p, PropertyView::Dir(DirectiveName::Bind, a, ..) if a.is_empty())
}
