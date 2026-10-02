use super::{
    CAN_STRINGIFY, Cg, Cid, DirectiveName, Helper, Lit, NOT_CONSTANT, Nid, Node, Property,
    PropertyView, R, Transform, Unsupported, VChildren, VNodeArgs, is_object_bind, is_on,
    is_reserved, patch,
};

impl Transform<'_> {
    // ---- transformElement ----------------------------------------------------------------

    pub(super) fn prop_views(&self, n: Nid) -> Vec<PropertyView> {
        let Node::Element { props, .. } = &self.tree[n] else {
            unreachable!("an element")
        };
        props
            .iter()
            .map(|p| match p {
                Property::Static { name, value } => {
                    PropertyView::Static(name.clone(), value.clone().unwrap_or_default())
                }
                Property::Dir {
                    name,
                    arg,
                    raw,
                    exp,
                    identifier,
                } => PropertyView::Dir(*name, arg.clone(), *raw, *exp, *identifier),
            })
            .collect()
    }

    /// `buildProps` for an element with `v-bind="obj"`: `normalizeProps(guardReactiveProps(obj))`,
    /// or in a `v-for` `mergeProps({ key }, { ref_for: true }, obj)` (the key as `injectProperty`
    /// puts it first), and `FULL_PROPS`. An object beside other props is not compiled yet.
    pub(super) fn object_bind(&mut self, n: Nid, tag: &str, props: &[PropertyView]) -> R<bool> {
        if !props.iter().any(is_object_bind) {
            return Ok(false);
        }
        let mut object = None;
        let mut key = None;
        for p in props {
            match p {
                PropertyView::Dir(DirectiveName::Bind, a, _, Some(e), _)
                    if a.is_empty() && object.is_none() =>
                {
                    object = Some(*e);
                }
                PropertyView::Dir(DirectiveName::Bind, a, _, Some(e), _)
                    if a == "key" && key.is_none() =>
                {
                    key = Some(*e);
                }
                _ => return Err(Unsupported::nowhere("a v-bind object beside other props")),
            }
        }
        let object = object.expect("found above");
        let obj = self.cgn(Cg::Exp(object));
        let props = if self.v_for > 0 {
            let mut arguments = Vec::new();
            if let Some(k) = key {
                let k = self.cgn(Cg::Exp(k));
                arguments.push(self.cgn(Cg::Object(vec![("key".to_owned(), k)])));
            }
            let t = self.lit(Lit::Boolean(true), NOT_CONSTANT);
            arguments.push(self.cgn(Cg::Object(vec![("ref_for".to_owned(), t)])));
            arguments.push(obj);
            self.helper(Helper::MergeProps);
            self.cgn(Cg::Call {
                callee: Helper::MergeProps,
                arguments,
            })
        } else {
            if key.is_some() {
                return Err(Unsupported::nowhere("a v-bind object beside a key"));
            }
            self.helper(Helper::NormalizeProps);
            self.helper(Helper::GuardReactiveProps);
            let guarded = self.cgn(Cg::Call {
                callee: Helper::GuardReactiveProps,
                arguments: vec![obj],
            });
            self.cgn(Cg::Call {
                callee: Helper::NormalizeProps,
                arguments: vec![guarded],
            })
        };
        let mut patch_flag = patch::FULL_PROPS;
        let children = self.vnode_children(n, &mut patch_flag);
        let vnode = self.vnode_call(VNodeArgs {
            tag: Some(tag.to_owned()),
            props: Some(props),
            children,
            patch_flag: Some(patch_flag),
            dynamic_props: None,
            directives: None,
            is_block: false,
            disable_tracking: false,
            needs_patch: false,
        });
        if let Node::Element { codegen, .. } = &mut self.tree[n] {
            *codegen = Some(vnode);
        }
        Ok(true)
    }

    /// `postTransformElement` for a plain element, with `buildProps`, `transformBind` and
    /// `transformOn`.
    pub(super) fn post_transform_element(&mut self, n: Nid) -> R<()> {
        let Node::Element { tag, .. } = &self.tree[n] else {
            return Ok(());
        };
        let tag = tag.clone();
        let model_runtime = self.model_runtime(n)?;
        let props = self.prop_views(n);
        if self.object_bind(n, &tag, &props)? {
            return Ok(());
        }
        let mut properties: Vec<(String, Cid)> = Vec::new();
        let mut runtime_directives: Vec<Cid> = Vec::new();
        let mut patch_flag = 0;
        let mut dynamic_prop_names: Vec<String> = Vec::new();
        let mut has_hydration_event = false;
        let mut has_ref = false;
        let mut should_use_block = false;
        for p in props {
            let (key, value) = match p {
                PropertyView::Static(name, value) => {
                    let v = self.lit(Lit::String(value), CAN_STRINGIFY);
                    (name, v)
                }
                PropertyView::Dir(dir, arg, raw, exp, identifier) => {
                    if dir == DirectiveName::Bind && arg == "key" {
                        should_use_block = true;
                    }
                    if dir == DirectiveName::Bind && arg == "ref" {
                        has_ref = true;
                        // `pushRefVForMarker`.
                        if self.v_for > 0 {
                            let t = self.lit(Lit::Boolean(true), NOT_CONSTANT);
                            properties.push(("ref_for".to_owned(), t));
                        }
                    }
                    let (key, value, runtime) =
                        self.directive_transform(dir, arg, raw, exp, identifier, model_runtime)?;
                    runtime_directives.extend(runtime);
                    // `analyzePatchFlag`.
                    if is_on(&key)
                        && !key.eq_ignore_ascii_case("onclick")
                        && key != "onUpdate:modelValue"
                        && !is_reserved(&key)
                    {
                        has_hydration_event = true;
                    }
                    if !self.skips_patch_flag(&key, value)
                        && key != "key"
                        && key != "ref"
                        && !dynamic_prop_names.contains(&key)
                    {
                        dynamic_prop_names.push(key.clone());
                    }
                    (key, value)
                }
            };
            // `dedupeProperties` merges repeated `on*`/`class`/`style`; nothing here repeats.
            if properties.iter().any(|(k, _)| *k == key) {
                return Err(Unsupported::nowhere("a repeated attribute"));
            }
            properties.push((key, value));
        }
        if !dynamic_prop_names.is_empty() {
            patch_flag |= patch::PROPS;
        }
        if has_hydration_event {
            patch_flag |= patch::NEED_HYDRATION;
        }
        let needs_patch = matches!(patch_flag, 0 | patch::NEED_HYDRATION)
            && (has_ref || !runtime_directives.is_empty());
        if !should_use_block && needs_patch {
            patch_flag |= patch::NEED_PATCH;
        }
        let vnode_props = (!properties.is_empty()).then(|| self.cgn(Cg::Object(properties)));
        let vnode_children = self.vnode_children(n, &mut patch_flag);
        let dynamic_props = (!dynamic_prop_names.is_empty())
            .then(|| self.cgn(Cg::PropertyNames(dynamic_prop_names)));
        let directives =
            (!runtime_directives.is_empty()).then(|| self.cgn(Cg::Array(runtime_directives)));
        let vnode = self.vnode_call(VNodeArgs {
            tag: Some(tag),
            props: vnode_props,
            children: vnode_children,
            patch_flag: (patch_flag != 0).then_some(patch_flag),
            dynamic_props,
            directives,
            is_block: should_use_block,
            disable_tracking: false,
            needs_patch: needs_patch && matches!(patch_flag, 0 | patch::NEED_HYDRATION),
        });
        if let Node::Element { codegen, .. } = &mut self.tree[n] {
            *codegen = Some(vnode);
        }
        Ok(())
    }

    /// `transformElement`'s children: a lone text-like child is passed as is, and marks the
    /// element `TEXT` when it is dynamic.
    pub(super) fn vnode_children(&self, n: Nid, patch_flag: &mut i32) -> Option<VChildren> {
        let children = self.children_of(n).to_vec();
        match children.as_slice() {
            [] => None,
            [child] => {
                let child = *child;
                let dynamic_text =
                    matches!(self.tree[child], Node::Interpolation(_) | Node::Compound(_));
                if dynamic_text && self.constant_type(child) == NOT_CONSTANT {
                    *patch_flag |= patch::TEXT;
                }
                Some(
                    if dynamic_text || matches!(self.tree[child], Node::Text(_)) {
                        VChildren::Node(child)
                    } else {
                        VChildren::List(children)
                    },
                )
            }
            _ => Some(VChildren::List(children)),
        }
    }

    /// `analyzePatchFlag`'s early return: a cached handler or a constant value; an event
    /// modifier's wrapper is looked through once, as upstream does.
    pub(super) fn skips_patch_flag(&self, key: &str, value: Cid) -> bool {
        let value = match &self.cg[value] {
            Cg::Call { arguments, .. } if is_on(key) => arguments[0],
            _ => value,
        };
        match &self.cg[value] {
            Cg::Cache { .. } => true,
            Cg::Exp(e) | Cg::Handler { exp: e, .. } => e.const_type > 0,
            Cg::ModelUpdate { target, is_ref } => !is_ref && target.const_type > 0,
            _ => false,
        }
    }
}
