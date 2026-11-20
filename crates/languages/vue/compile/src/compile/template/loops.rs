use super::{
    Codegen, DirectiveExpression, DirectiveName, Exit, ExpressionIdentifier, Helper, NOT_CONSTANT,
    Node, NodeIdentifier, Property, PropertyIdentifier, PropertyKind, R, Transform, VChildren,
    VNodeArgs, patch,
};

impl Transform<'_> {
    /// `processFor`, and the codegen `transformFor` creates before the children are traversed.
    pub(super) fn process_for(
        &mut self,
        el: NodeIdentifier,
        parent: Option<NodeIdentifier>,
        raw: ExpressionIdentifier,
        identifier: PropertyIdentifier,
    ) -> R<(NodeIdentifier, Exit)> {
        let PropertyKind::Directive(d) = &self.compiler_syntax_tree.props[identifier].kind else {
            unreachable!("v-for is a directive")
        };
        let DirectiveExpression::For(f) = &d.exp else {
            unreachable!("a v-for has its parse result")
        };
        let parameters = f.parameters;
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
        let source_text_cg = self.cgn(Codegen::Exp(source));
        let render = self.cgn(Codegen::Call {
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
            children: Some(VChildren::Codegen(render)),
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

    pub(super) fn has_key(&self, el: NodeIdentifier) -> bool {
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
    pub(super) fn finish_for(&mut self, for_node: NodeIdentifier) {
        let Node::For {
            source,
            parameters,
            codegen: Some(vnode),
            ..
        } = &self.tree[for_node]
        else {
            unreachable!("a v-for with its codegen")
        };
        let (source, parameters, vnode) = (*source, *parameters, *vnode);
        let Codegen::VNode {
            children: Some(VChildren::Codegen(render)),
            ..
        } = self.codegen[vnode]
        else {
            unreachable!("a v-for fragment renders a list")
        };
        let stable = source.const_type > NOT_CONSTANT;
        let child = self.children_of(for_node)[0];
        let block = self.codegen_of(child).expect("a transformed element");
        let Codegen::VNode { is_block, .. } = self.codegen[block] else {
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
        if let Codegen::VNode { is_block, .. } = &mut self.codegen[block] {
            *is_block = !stable;
        }
        if stable {
            self.helper(Helper::CreateElementVNode);
            if let Codegen::VNode {
                needs_patch: true,
                patch_flag,
                ..
            } = &mut self.codegen[block]
            {
                *patch_flag = Some(patch_flag.unwrap_or(0) | patch::NEED_PATCH);
            }
        } else {
            self.helper(Helper::OpenBlock);
            self.helper(Helper::CreateElementBlock);
        }
        let f = self.cgn(Codegen::Function {
            parameters,
            returns: block,
        });
        if let Codegen::Call { arguments, .. } = &mut self.codegen[render] {
            arguments.push(f);
        }
    }
}
