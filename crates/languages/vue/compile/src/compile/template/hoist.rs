//! `transformText`, `getConstantType`, `cacheStatic` and the root codegen.

use super::{
    CAN_CACHE, CAN_SKIP_PATCH, CAN_STRINGIFY, Codegen, CodegenIdentifier, DirectiveName, Helper,
    Lit, NOT_CONSTANT, Node, NodeIdentifier, Property, Transform, VChildren, VNodeArgs, patch,
};

impl Transform<'_> {
    /// `createVNodeCall`.
    pub(super) fn vnode_call(&mut self, a: VNodeArgs) -> CodegenIdentifier {
        if a.is_block {
            self.helper(Helper::OpenBlock);
            self.helper(Helper::CreateElementBlock);
        } else {
            self.helper(Helper::CreateElementVNode);
        }
        if a.directives.is_some() {
            self.helper(Helper::WithDirectives);
        }
        self.cgn(Codegen::VNode {
            tag: a.tag,
            props: a.props,
            children: a.children,
            patch_flag: a.patch_flag,
            dynamic_props: a.dynamic_props,
            directives: a.directives,
            is_block: a.is_block,
            disable_tracking: a.disable_tracking,
            needs_patch: a.needs_patch,
        })
    }

    pub(super) fn transform_text(&mut self, n: NodeIdentifier) {
        let is_text = |t: &Self, c: NodeIdentifier| {
            matches!(t.tree[c], Node::Text(_) | Node::Interpolation(_))
        };
        let mut children = self.children_of(n).to_vec();
        let mut has_text = false;
        let mut i = 0;
        while i < children.len() {
            if is_text(self, children[i]) {
                has_text = true;
                let mut container: Option<NodeIdentifier> = None;
                while i + 1 < children.len() && is_text(self, children[i + 1]) {
                    let next = children.remove(i + 1);
                    if let Some(c) = container {
                        if let Node::Compound(list) = &mut self.tree[c] {
                            list.push(next);
                        }
                    } else {
                        let c = self.push(Node::Compound(vec![children[i], next]));
                        children[i] = c;
                        container = Some(c);
                    }
                }
            }
            i += 1;
        }
        let single =
            children.len() == 1 && matches!(self.tree[n], Node::Root(_) | Node::Element { .. });
        if has_text && !single {
            for child in &mut children {
                if !matches!(
                    self.tree[*child],
                    Node::Text(_) | Node::Interpolation(_) | Node::Compound(_)
                ) {
                    continue;
                }
                let mut arguments = Vec::new();
                if !matches!(&self.tree[*child], Node::Text(t) if t == " ") {
                    arguments.push(self.cgn(Codegen::Node(*child)));
                }
                if self.constant_type(*child) == NOT_CONSTANT {
                    arguments.push(self.lit(Lit::Number(f64::from(patch::TEXT)), NOT_CONSTANT));
                }
                self.helper(Helper::CreateText);
                let codegen = self.cgn(Codegen::Call {
                    callee: Helper::CreateText,
                    arguments,
                });
                *child = self.push(Node::TextCall {
                    content: *child,
                    codegen,
                });
            }
        }
        *self.children_mut(n) = children;
    }

    /// `getConstantType` for a template node.
    pub(super) fn constant_type(&self, n: NodeIdentifier) -> u8 {
        match &self.tree[n] {
            Node::Text(_) => CAN_STRINGIFY,
            Node::Interpolation(e) => e.const_type,
            Node::TextCall { content, .. } => self.constant_type(*content),
            Node::Compound(list) => list
                .iter()
                .map(|&c| self.constant_type(c))
                .min()
                .unwrap_or(CAN_STRINGIFY),
            Node::Element {
                props,
                children,
                codegen: Some(cg),
                ..
            } => {
                let Codegen::VNode {
                    is_block,
                    patch_flag,
                    props: vprops,
                    ..
                } = &self.codegen[*cg]
                else {
                    return NOT_CONSTANT;
                };
                if *is_block || patch_flag.is_some() {
                    return NOT_CONSTANT;
                }
                let mut ret = self.generated_props_type(*vprops);
                for &c in children {
                    if ret == NOT_CONSTANT {
                        return NOT_CONSTANT;
                    }
                    ret = ret.min(self.constant_type(c));
                }
                if ret > CAN_SKIP_PATCH {
                    for p in props {
                        if let Property::Dir {
                            name: DirectiveName::Bind,
                            exp: Some(e),
                            ..
                        } = p
                        {
                            ret = ret.min(e.const_type);
                        }
                    }
                }
                ret
            }
            _ => NOT_CONSTANT,
        }
    }

    /// `getGeneratedPropsConstantType`.
    pub(super) fn generated_props_type(&self, props: Option<CodegenIdentifier>) -> u8 {
        let Some(Codegen::Object(list)) = props.map(|p| &self.codegen[p]) else {
            return CAN_STRINGIFY;
        };
        let mut ret = CAN_STRINGIFY;
        for &(_, v) in list {
            let t = match &self.codegen[v] {
                Codegen::Lit { const_type, .. } => *const_type,
                Codegen::Exp(e) if !e.compound => e.const_type,
                Codegen::Hoisted(_) => CAN_CACHE,
                _ => NOT_CONSTANT,
            };
            if t == NOT_CONSTANT {
                return NOT_CONSTANT;
            }
            ret = ret.min(t);
        }
        ret
    }

    pub(super) fn single_element_root(&self, root: NodeIdentifier) -> bool {
        matches!(self.children_of(root), [only] if matches!(self.tree[*only], Node::Element { .. }))
    }

    pub(super) fn hoist(&mut self, value: CodegenIdentifier) -> CodegenIdentifier {
        self.hoists.push(value);
        self.cgn(Codegen::Hoisted(self.hoists.len()))
    }

    /// `walk` for an element that is not constant: its props may still be hoisted.
    pub(super) fn hoist_props(&mut self, vnode: CodegenIdentifier) {
        let Codegen::VNode {
            patch_flag,
            props,
            dynamic_props,
            ..
        } = self.codegen[vnode]
        else {
            return;
        };
        if matches!(patch_flag, None | Some(patch::NEED_PATCH | patch::TEXT))
            && self.generated_props_type(props) >= CAN_CACHE
            && let Some(p) = props
        {
            let h = self.hoist(p);
            if let Codegen::VNode { props, .. } = &mut self.codegen[vnode] {
                *props = Some(h);
            }
        }
        if let Some(d) = dynamic_props {
            let h = self.hoist(d);
            if let Codegen::VNode { dynamic_props, .. } = &mut self.codegen[vnode] {
                *dynamic_props = Some(h);
            }
        }
    }

    /// `cacheStatic`'s `walk`.
    pub(super) fn walk_static(&mut self, n: NodeIdentifier, do_not_hoist: bool) {
        let children = self.children_of(n).to_vec();
        let mut to_cache = Vec::new();
        for &child in &children {
            match &self.tree[child] {
                Node::Element { codegen, .. } => {
                    let vnode = codegen.expect("a transformed element");
                    let ct = if do_not_hoist {
                        NOT_CONSTANT
                    } else {
                        self.constant_type(child)
                    };
                    if ct >= CAN_CACHE {
                        if let Codegen::VNode { patch_flag, .. } = &mut self.codegen[vnode] {
                            *patch_flag = Some(patch::CACHED);
                        }
                        to_cache.push(child);
                        continue;
                    }
                    if ct == NOT_CONSTANT {
                        self.hoist_props(vnode);
                    }
                    self.walk_static(child, false);
                }
                Node::TextCall { content, codegen } => {
                    let codegen = *codegen;
                    let ct = if do_not_hoist {
                        NOT_CONSTANT
                    } else {
                        self.constant_type(*content)
                    };
                    if ct >= CAN_CACHE {
                        if let Codegen::Call { arguments, .. } = &self.codegen[codegen]
                            && !arguments.is_empty()
                        {
                            let flag =
                                self.lit(Lit::Number(f64::from(patch::CACHED)), NOT_CONSTANT);
                            if let Codegen::Call { arguments, .. } = &mut self.codegen[codegen] {
                                arguments.push(flag);
                            }
                        }
                        to_cache.push(child);
                    }
                }
                Node::For { children, .. } => {
                    let one = children.len() == 1;
                    self.walk_static(child, one);
                }
                Node::If { branches, .. } => {
                    for b in branches.clone() {
                        let one = self.children_of(b).len() == 1;
                        self.walk_static(b, one);
                    }
                }
                _ => {}
            }
        }
        if to_cache.len() == children.len()
            && let Node::Element {
                codegen: Some(vnode),
                ..
            } = self.tree[n]
            && let Codegen::VNode {
                children: Some(VChildren::List(list)),
                ..
            } = &self.codegen[vnode]
        {
            let arr = self.cgn(Codegen::NodeArray(list.clone()));
            let c = self.cache(arr);
            // Always spread: mounting must not mutate the cached array.
            if let Codegen::Cache { spread, .. } = &mut self.codegen[c] {
                *spread = true;
            }
            if let Codegen::VNode { children, .. } = &mut self.codegen[vnode] {
                *children = Some(VChildren::Codegen(c));
            }
            return;
        }
        for child in to_cache {
            let old = self.codegen_of(child).expect("a cached node has a codegen");
            let c = self.cache(old);
            match &mut self.tree[child] {
                Node::Element { codegen, .. } => *codegen = Some(c),
                Node::TextCall { codegen, .. } => *codegen = c,
                _ => unreachable!("only elements and text calls are cached"),
            }
        }
    }

    /// `createRootCodegen`.
    pub(super) fn root_codegen(&mut self, root: NodeIdentifier) -> Option<CodegenIdentifier> {
        let children = self.children_of(root).to_vec();
        match children.as_slice() {
            [] => None,
            [child] => {
                let child = *child;
                if matches!(self.tree[child], Node::Element { .. }) {
                    let vnode = self.codegen_of(child)?;
                    self.convert_to_block(vnode);
                    Some(vnode)
                } else {
                    Some(self.cgn(Codegen::Node(child)))
                }
            }
            _ => {
                self.helper(Helper::Fragment);
                Some(self.vnode_call(VNodeArgs {
                    tag: None,
                    props: None,
                    children: Some(VChildren::List(children)),
                    patch_flag: Some(patch::STABLE_FRAGMENT),
                    dynamic_props: None,
                    directives: None,
                    is_block: true,
                    disable_tracking: false,
                    needs_patch: false,
                }))
            }
        }
    }
}
