use super::{
    Cg, DirectiveExpression, DirectiveName, Exit, Helper, NOT_CONSTANT, Nid, Node, NodeIdentifier,
    Property, PropertyIdentifier, PropertyKind, R, Transform, VChildren, VNodeArgs, patch,
};

impl Transform<'_> {
    // ---- v-for ---------------------------------------------------------------------------

    /// `processFor`, and the codegen `transformFor` creates before the children are traversed.
    pub(super) fn process_for(
        &mut self,
        el: Nid,
        parent: Option<Nid>,
        raw: NodeIdentifier,
        identifier: PropertyIdentifier,
    ) -> R<(Nid, Exit)> {
        let PropertyKind::Directive(d) = &self.compiler_syntax_tree.props[identifier].kind else {
            unreachable!("v-for is a directive")
        };
        let DirectiveExpression::For(f) = &d.exp else {
            unreachable!("a v-for has its parse result")
        };
        let parameters = f.parameters.clone();
        let source = self.process_expression(raw, false)?;
        let for_node = self.push(Node::For {
            source,
            parameters,
            children: vec![el],
            codegen: None,
        });
        if let Some(p) = parent {
            self.replace_child(p, el, for_node);
        }
        self.helper(Helper::RenderList);
        let source_text_cg = self.cgn(Cg::Exp(source));
        let render = self.cgn(Cg::Call {
            callee: Helper::RenderList,
            arguments: vec![source_text_cg],
        });
        let stable = source.const_type > NOT_CONSTANT;
        let flag = if stable {
            patch::STABLE_FRAGMENT
        } else if self.has_key(el) {
            patch::KEYED_FRAGMENT
        } else {
            patch::UNKEYED_FRAGMENT
        };
        self.helper(Helper::Fragment);
        let vnode = self.vnode_call(VNodeArgs {
            tag: None,
            props: None,
            children: Some(VChildren::Cg(render)),
            patch_flag: Some(flag),
            dynamic_props: None,
            directives: None,
            is_block: true,
            disable_tracking: !stable,
            needs_patch: false,
        });
        if let Node::For { codegen, .. } = &mut self.tree[for_node] {
            *codegen = Some(vnode);
        }
        self.v_for += 1;
        Ok((for_node, Exit::For(for_node)))
    }

    pub(super) fn has_key(&self, el: Nid) -> bool {
        let Node::Element { props, .. } = &self.tree[el] else {
            return false;
        };
        props.iter().any(|p| match p {
            Property::Dir {
                name: DirectiveName::Bind,
                arg,
                ..
            } => arg == "key",
            Property::Static { name, .. } => name == "key",
            Property::Dir { .. } => false,
        })
    }

    /// `transformFor`'s exit: the child's codegen becomes the render function's block.
    pub(super) fn finish_for(&mut self, for_node: Nid) {
        let Node::For {
            source,
            parameters,
            codegen: Some(vnode),
            ..
        } = &self.tree[for_node]
        else {
            unreachable!("a v-for with its codegen")
        };
        let (source, parameters, vnode) = (*source, parameters.clone(), *vnode);
        let Cg::VNode {
            children: Some(VChildren::Cg(render)),
            ..
        } = self.cg[vnode]
        else {
            unreachable!("a v-for fragment renders a list")
        };
        let stable = source.const_type > NOT_CONSTANT;
        let child = self.children_of(for_node)[0];
        let block = self.codegen_of(child).expect("a transformed element");
        let Cg::VNode { is_block, .. } = self.cg[block] else {
            unreachable!("an element's codegen is a vnode call")
        };
        if is_block == stable {
            if is_block {
                self.remove_helper(Helper::OpenBlock);
                self.remove_helper(Helper::CreateElementBlock);
            } else {
                self.remove_helper(Helper::CreateElementVNode);
            }
        }
        if let Cg::VNode { is_block, .. } = &mut self.cg[block] {
            *is_block = !stable;
        }
        if stable {
            self.helper(Helper::CreateElementVNode);
            if let Cg::VNode {
                needs_patch: true,
                patch_flag,
                ..
            } = &mut self.cg[block]
            {
                *patch_flag = Some(patch_flag.unwrap_or(0) | patch::NEED_PATCH);
            }
        } else {
            self.helper(Helper::OpenBlock);
            self.helper(Helper::CreateElementBlock);
        }
        let f = self.cgn(Cg::Function {
            parameters,
            returns: block,
        });
        if let Cg::Call { arguments, .. } = &mut self.cg[render] {
            arguments.push(f);
        }
    }
}
