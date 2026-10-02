use super::{
    CAN_CACHE, Cg, Cid, DirectiveName, Exit, Helper, Lit, NOT_CONSTANT, Nid, Node, NodeIdentifier,
    R, Transform, Unsupported,
};

impl Transform<'_> {
    // ---- v-if ----------------------------------------------------------------------------

    /// `processIf`. `None` when the element joined an earlier `v-if`: it is traversed here and
    /// leaves its parent.
    pub(super) fn process_if(
        &mut self,
        el: Nid,
        parent: Option<Nid>,
        name: DirectiveName,
        raw: NodeIdentifier,
    ) -> R<Option<(Nid, Exit)>> {
        let parent = parent.expect("an element has a parent");
        let condition = match name {
            DirectiveName::Else => None,
            _ => Some(self.process_expression(raw, false)?),
        };
        let branch = self.push(Node::Branch {
            condition,
            children: vec![el],
        });
        if name == DirectiveName::If {
            let if_node = self.push(Node::If {
                branches: vec![branch],
                codegen: None,
            });
            self.replace_child(parent, el, if_node);
            let key = self.branches_before(parent, if_node);
            return Ok(Some((
                if_node,
                Exit::If {
                    if_node,
                    branch,
                    key,
                },
            )));
        }
        let siblings = self.children_of(parent).to_vec();
        let mut j = siblings
            .iter()
            .position(|&s| s == el)
            .expect("an element is its parent's child");
        let mut remove = vec![el];
        let if_node = loop {
            let Some(prev) = j.checked_sub(1) else {
                return Err(Unsupported::nowhere("v-else without an adjacent v-if"));
            };
            j = prev;
            match &self.tree[siblings[j]] {
                Node::Text(t) if t.trim_ascii().is_empty() => remove.push(siblings[j]),
                Node::If { .. } => break siblings[j],
                _ => return Err(Unsupported::nowhere("v-else without an adjacent v-if")),
            }
        };
        self.children_mut(parent).retain(|c| !remove.contains(c));
        let Node::If { branches, .. } = &mut self.tree[if_node] else {
            unreachable!("found an if node")
        };
        branches.push(branch);
        let count = branches.len();
        let key = self.branches_before(parent, if_node) + count - 1;
        self.traverse(branch, Some(if_node))?;
        let alternate = self.branch_codegen(branch, key);
        let Node::If {
            codegen: Some(mut c),
            ..
        } = self.tree[if_node]
        else {
            unreachable!("the v-if branch has set the codegen")
        };
        // `getParentCondition`.
        while let Cg::Conditional { alternate: a, .. } = self.cg[c]
            && matches!(self.cg[a], Cg::Conditional { .. })
        {
            c = a;
        }
        if let Cg::Conditional { alternate: a, .. } = &mut self.cg[c] {
            *a = alternate;
        }
        Ok(None)
    }

    /// The branches of the `v-if` nodes before `if_node`: its first key.
    pub(super) fn branches_before(&self, parent: Nid, if_node: Nid) -> usize {
        let siblings = self.children_of(parent);
        let at = siblings.iter().position(|&s| s == if_node).unwrap_or(0);
        siblings[..at]
            .iter()
            .map(|&s| match &self.tree[s] {
                Node::If { branches, .. } => branches.len(),
                _ => 0,
            })
            .sum()
    }

    /// `createCodegenNodeForBranch`.
    pub(super) fn branch_codegen(&mut self, branch: Nid, key: usize) -> Cid {
        let Node::Branch { condition, .. } = self.tree[branch] else {
            unreachable!("a branch")
        };
        let children = self.children_codegen(branch, key);
        let Some(test) = condition else {
            return children;
        };
        self.helper(Helper::CreateComment);
        let a = self.lit(Lit::String("v-if".to_owned()), NOT_CONSTANT);
        let b = self.lit(Lit::Boolean(true), NOT_CONSTANT);
        let alternate = self.cgn(Cg::Call {
            callee: Helper::CreateComment,
            arguments: vec![a, b],
        });
        self.cgn(Cg::Conditional {
            test,
            consequent: children,
            alternate,
        })
    }

    /// `createChildrenCodegenNode` for a branch holding one element, or the `v-for` it became.
    pub(super) fn children_codegen(&mut self, branch: Nid, key: usize) -> Cid {
        let first = self.children_of(branch)[0];
        let vnode = self.codegen_of(first).expect("a transformed element");
        if matches!(self.tree[first], Node::Element { .. }) {
            self.convert_to_block(vnode);
        }
        #[expect(clippy::cast_precision_loss, reason = "a branch count")]
        let value = self.lit(Lit::Number(key as f64), CAN_CACHE);
        self.inject_prop(vnode, "key", value);
        vnode
    }

    pub(super) fn convert_to_block(&mut self, vnode: Cid) {
        if let Cg::VNode { is_block, .. } = &mut self.cg[vnode]
            && !*is_block
        {
            *is_block = true;
            self.remove_helper(Helper::CreateElementVNode);
            self.helper(Helper::OpenBlock);
            self.helper(Helper::CreateElementBlock);
        }
    }

    /// `injectProperty`.
    pub(super) fn inject_prop(&mut self, vnode: Cid, key: &str, value: Cid) {
        let Cg::VNode { props, .. } = self.cg[vnode] else {
            unreachable!("a vnode call")
        };
        match props {
            None => {
                let obj = self.cgn(Cg::Object(vec![(key.to_owned(), value)]));
                if let Cg::VNode { props, .. } = &mut self.cg[vnode] {
                    *props = Some(obj);
                }
            }
            Some(p) => match &mut self.cg[p] {
                Cg::Object(list) => {
                    if !list.iter().any(|(k, _)| k == key) {
                        list.insert(0, (key.to_owned(), value));
                    }
                }
                // `getUnnormalizedProps` unwraps `normalizeProps(guardReactiveProps(obj))`; the
                // object, not a call, is merged after the key.
                Cg::Call {
                    callee: Helper::NormalizeProps,
                    arguments,
                } => {
                    let guarded = arguments[0];
                    let Cg::Call {
                        callee: Helper::GuardReactiveProps,
                        arguments: inner,
                    } = &self.cg[guarded]
                    else {
                        unreachable!("object_bind builds both calls")
                    };
                    let obj = inner[0];
                    let k = self.cgn(Cg::Object(vec![(key.to_owned(), value)]));
                    self.helper(Helper::MergeProps);
                    let merged = self.cgn(Cg::Call {
                        callee: Helper::MergeProps,
                        arguments: vec![k, obj],
                    });
                    if let Cg::Call { arguments, .. } = &mut self.cg[p] {
                        arguments[0] = merged;
                    }
                }
                _ => {}
            },
        }
    }
}
