use super::{Builder, ExpressionRewrite, Kind, NodeIdentifier, Rewrite, SyntaxTree, copy};
use crate::compilation::asynchronous::await_nodes;
use crate::compilation::vapor::SYNTHETIC;

impl Builder<'_> {
    pub(in crate::compilation::vapor) fn async_if(
        &mut self,
        test: NodeIdentifier,
        branches: &[NodeIdentifier],
    ) -> NodeIdentifier {
        let mut body = Vec::new();
        let value = self.async_text(test, &mut body);
        let Kind::Member { object: cell, .. } = self.to.kind(value) else {
            unreachable!("an async cell read")
        };
        let ready = self.to.dot(cell, "resolved");
        let ready = self.to.dot(ready, "value");
        let ready = self.to.arrow(&[], ready, true, false, SYNTHETIC);
        let getter = self.to.arrow(&[], value, true, false, SYNTHETIC);
        let mut arguments = vec![getter];
        arguments.extend_from_slice(branches);
        let branch = self.call("createIf", &arguments);
        let branch = self.to.arrow(&[], branch, true, false, SYNTHETIC);
        let result = self.call("createIf", &[ready, branch]);
        body.push(self.to.return_(Some(result), SYNTHETIC));
        let block = self.to.block(&body, SYNTHETIC);
        let initialize = self.to.arrow(&[], block, false, false, SYNTHETIC);
        self.to.call0(initialize, &[])
    }

    pub(super) fn async_text(
        &mut self,
        identifier: NodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let mut rewrite = AsyncRewrite {
            awaited: await_nodes(&self.input.javascript, identifier),
            normal: ExpressionRewrite {
                resolution: self.resolution,
                references: &self.references,
                loop_bindings: &self.loop_bindings,
                needs_unref: false,
                memoized: None,
                tracking: self.input.tracking,
            },
        };
        let value = copy(
            &self.input.javascript,
            &mut self.to,
            &mut rewrite,
            identifier,
        );
        if rewrite.normal.needs_unref {
            self.helpers.insert("unref");
        }
        let read = self.to.identifier("$$async_read");
        let getter = self.to.arrow(&[read], value, true, true, SYNTHETIC);
        let helper = self.to.identifier("$$async_cell");
        let cell = self.to.call0(helper, &[getter]);
        let cell = self.declare(cell, body);
        self.to.dot(cell, "value")
    }
}

struct AsyncRewrite<N> {
    normal: N,
    awaited: rustc_hash::FxHashSet<NodeIdentifier>,
}

impl<N> AsyncRewrite<N> {
    fn read(to: &mut SyntaxTree, node: NodeIdentifier, value: NodeIdentifier) -> NodeIdentifier {
        let key = to.write_number(f64::from(node.0), SYNTHETIC);
        let getter = to.arrow(&[], value, true, false, SYNTHETIC);
        let read = to.identifier("$$async_read");
        to.call0(read, &[key, getter])
    }
}

impl<N: Rewrite> Rewrite for AsyncRewrite<N> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        match from.kind(identifier) {
            Kind::Function { .. } | Kind::Arrow { .. } => {
                Some(copy(from, to, &mut self.normal, identifier))
            }
            Kind::Identifier(_) => {
                let value = self.normal.rewrite(from, to, identifier)?;
                Some(Self::read(to, identifier, value))
            }
            Kind::Member { .. } if !self.awaited.contains(&identifier) => {
                let value = copy(from, to, &mut self.normal, identifier);
                Some(Self::read(to, identifier, value))
            }
            Kind::Call {
                callee,
                arguments,
                optional,
                ..
            } => {
                let callee = match from.kind(callee) {
                    Kind::Member {
                        object,
                        property,
                        computed,
                        optional,
                    } => {
                        let object = copy(from, to, self, object);
                        let property = if computed {
                            copy(from, to, self, property)
                        } else {
                            copy(from, to, &mut rsvelte_typescript::copy::Verbatim, property)
                        };
                        to.member(
                            object,
                            property,
                            computed,
                            optional,
                            from.source_location(callee),
                        )
                    }
                    _ => copy(from, to, self, callee),
                };
                let arguments: Vec<_> = arguments
                    .iter()
                    .map(|&arg| copy(from, to, self, arg))
                    .collect();
                Some(to.call(
                    callee,
                    &arguments,
                    optional,
                    from.source_location(identifier),
                ))
            }
            Kind::Property {
                key,
                value,
                shorthand: true,
                computed: false,
                ..
            } => {
                let value = copy(from, to, self, value);
                let key = copy(from, to, &mut rsvelte_typescript::copy::Verbatim, key);
                Some(to.property(key, value, 0, from.source_location(identifier)))
            }
            _ => self.normal.rewrite(from, to, identifier),
        }
    }
}

pub(crate) fn script_getter(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    getter: NodeIdentifier,
) -> NodeIdentifier {
    let Kind::Arrow {
        body,
        expression_body,
        ..
    } = from.kind(getter)
    else {
        unreachable!("an async derived getter")
    };
    let mut rewrite = AsyncRewrite {
        normal: rsvelte_typescript::copy::Verbatim,
        awaited: await_nodes(from, body),
    };
    let body = copy(from, to, &mut rewrite, body);
    let read = to.identifier("$$async_read");
    to.arrow(&[read], body, expression_body, true, SYNTHETIC)
}
