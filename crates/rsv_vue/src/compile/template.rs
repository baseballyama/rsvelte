//! compiler-core for the templates the parser reads, building an [`Ast`] instead of text.
//!
//! It reads the template's HIR ([`crate::hir`]), which is `baseParse`'s tree. What is ported: the
//! node transforms of `getBaseTransformPreset` in upstream order, `cacheStatic`,
//! `createRootCodegen` and `generate`.
//!
//! The port keeps upstream's two mutable trees, the template nodes and their codegen nodes, as two
//! arenas, because the algorithm rewrites both in place (`replaceNode`, `convertToBlock`,
//! `injectProp`, caching, hoisting). It also keeps the helper registry as upstream's counted,
//! insertion-ordered map: which helpers the import names, and in which order, falls out of exactly
//! when each transform adds and removes one.

use rsv_js::ast::flag;
use rsv_js::copy::{Rewrite, Verbatim, copy};
use rsv_js::ops::{AssignOp, BinOp, LogicalOp, UnaryOp};
use rsv_js::scope::{DeclKind, ScopeId};
use rsv_js::{Ast, Kind, NodeId};
use rsv_kernel::diag::Unsupported;
use rsv_kernel::source::Loc;
use rustc_hash::FxHashMap;

use crate::ast::{DirExp, DirName};
use crate::hir::{Hir, HirId, NodeKind, PropId, PropKind, TagType};
use crate::resolve::{BindingType, Resolution};

type R<T> = Result<T, Unsupported>;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Helper {
    Fragment,
    OpenBlock,
    CreateElementBlock,
    CreateElementVNode,
    CreateComment,
    CreateText,
    ToDisplayString,
    RenderList,
    Unref,
    WithDirectives,
    VModelText,
    VModelCheckbox,
    VModelRadio,
    VModelSelect,
}

impl Helper {
    /// The name `vue` exports it under (`helperNameMap`).
    #[must_use]
    pub const fn name(self) -> &'static str {
        match self {
            Self::Fragment => "Fragment",
            Self::OpenBlock => "openBlock",
            Self::CreateElementBlock => "createElementBlock",
            Self::CreateElementVNode => "createElementVNode",
            Self::CreateComment => "createCommentVNode",
            Self::CreateText => "createTextVNode",
            Self::ToDisplayString => "toDisplayString",
            Self::RenderList => "renderList",
            Self::Unref => "unref",
            Self::WithDirectives => "withDirectives",
            Self::VModelText => "vModelText",
            Self::VModelCheckbox => "vModelCheckbox",
            Self::VModelRadio => "vModelRadio",
            Self::VModelSelect => "vModelSelect",
        }
    }
}

/// `@vue/shared` `PatchFlags`.
mod patch {
    pub(super) const TEXT: i32 = 1;
    pub(super) const PROPS: i32 = 8;
    pub(super) const NEED_HYDRATION: i32 = 32;
    pub(super) const STABLE_FRAGMENT: i32 = 64;
    pub(super) const KEYED_FRAGMENT: i32 = 128;
    pub(super) const UNKEYED_FRAGMENT: i32 = 256;
    pub(super) const NEED_PATCH: i32 = 512;
    pub(super) const CACHED: i32 = -1;
}

/// `ConstantTypes`.
const NOT_CONSTANT: u8 = 0;
const CAN_SKIP_PATCH: u8 = 1;
const CAN_CACHE: u8 = 2;
const CAN_STRINGIFY: u8 = 3;

/// `@vue/shared` `GLOBALS_ALLOWED`.
const GLOBALS_ALLOWED: &[&str] = &[
    "Infinity",
    "undefined",
    "NaN",
    "isFinite",
    "isNaN",
    "parseFloat",
    "parseInt",
    "decodeURI",
    "decodeURIComponent",
    "encodeURI",
    "encodeURIComponent",
    "Math",
    "Number",
    "Date",
    "Array",
    "Object",
    "Boolean",
    "String",
    "RegExp",
    "Map",
    "Set",
    "JSON",
    "Intl",
    "BigInt",
    "console",
    "Error",
    "Symbol",
];

type Nid = usize;
type Cid = usize;

/// A template expression after `processExpression`.
#[derive(Clone, Copy, Debug)]
struct Exp {
    node: NodeId,
    /// For a compound expression, the lowest of its identifiers' (what `getConstantType` reads).
    const_type: u8,
    /// Upstream returns a `COMPOUND_EXPRESSION` (a non-trivial expression naming an identifier),
    /// which `getGeneratedPropsConstantType` never treats as constant.
    compound: bool,
    /// An inline `v-on` statement: `$event` is a local name in it.
    event_local: bool,
}

#[derive(Debug)]
enum Prop {
    Static {
        name: String,
        /// `None` for a bare attribute.
        value: Option<String>,
    },
    Dir {
        name: DirName,
        arg: String,
        raw: NodeId,
        exp: Option<Exp>,
        id: PropId,
    },
}

#[derive(Debug)]
enum Node {
    Root(Vec<Nid>),
    Element {
        tag: String,
        props: Vec<Prop>,
        children: Vec<Nid>,
        codegen: Option<Cid>,
    },
    Text(String),
    Interpolation(Exp),
    /// Adjacent text and interpolations, merged by `transformText`.
    Compound(Vec<Nid>),
    If {
        branches: Vec<Nid>,
        codegen: Option<Cid>,
    },
    Branch {
        condition: Option<Exp>,
        children: Vec<Nid>,
    },
    For {
        source: Exp,
        params: Vec<NodeId>,
        children: Vec<Nid>,
        codegen: Option<Cid>,
    },
    TextCall {
        content: Nid,
        codegen: Cid,
    },
}

#[derive(Debug, Clone)]
enum VChildren {
    /// The only child, a text, interpolation or compound, passed as is.
    Node(Nid),
    List(Vec<Nid>),
    Cg(Cid),
}

#[derive(Debug, Clone)]
enum Lit {
    Str(String),
    Num(f64),
    Bool(bool),
    /// `void 0`.
    Undefined,
}

#[derive(Debug, Clone)]
enum Cg {
    VNode {
        /// `None`: `Fragment`.
        tag: Option<String>,
        props: Option<Cid>,
        children: Option<VChildren>,
        patch_flag: Option<i32>,
        dynamic_props: Option<Cid>,
        /// `withDirectives`' list: the element's runtime directives.
        directives: Option<Cid>,
        is_block: bool,
        disable_tracking: bool,
        /// `needsPatch`: a `v-for` that turns it from a block into a plain vnode adds
        /// `NEED_PATCH`.
        needs_patch: bool,
    },
    Call {
        callee: Helper,
        args: Vec<Cid>,
    },
    /// Keys are static.
    Object(Vec<(String, Cid)>),
    Array(Vec<Cid>),
    /// A helper's local name, as a value (a runtime directive).
    Helper(Helper),
    NodeArray(Vec<Nid>),
    /// `stringifyDynamicPropNames`.
    PropNames(Vec<String>),
    /// A simple expression the compiler wrote.
    Lit {
        lit: Lit,
        const_type: u8,
    },
    Exp(Exp),
    /// `$event => (exp)` for an inline statement; `(...args) => (exp && exp(...args))` for a
    /// cached member expression.
    Handler {
        exp: Exp,
        inline: bool,
    },
    /// `v-model`'s `$event => ((x).value = $event)` for a ref `x` as written, or
    /// `$event => ((exp) = $event)` for a member expression after `processExpression`.
    ModelUpdate {
        target: Exp,
        is_ref: bool,
    },
    Function {
        params: Vec<NodeId>,
        returns: Cid,
    },
    Cond {
        test: Exp,
        cons: Cid,
        alt: Cid,
    },
    Cache {
        index: usize,
        value: Cid,
        /// `needArraySpread`: `[...(_cache[i] || …)]`.
        spread: bool,
    },
    Hoisted(usize),
    /// A template node, generated through `genNode`.
    Node(Nid),
}

#[derive(Clone, Copy, Debug)]
struct RefInfo {
    /// Declared inside the template (a `v-for` alias, a nested function's parameter).
    local: bool,
    /// A `v-for` alias: what `hasScopeRef` looks for.
    host: bool,
    write: bool,
}

fn reference_table(res: &Resolution) -> FxHashMap<NodeId, RefInfo> {
    res.sem
        .references
        .iter()
        .map(|r| {
            let b = r.binding.map(|b| &res.sem.bindings[b]);
            (
                r.node,
                RefInfo {
                    local: b.is_some_and(|b| b.scope != ScopeId::ROOT),
                    host: b.is_some_and(|b| b.kind == DeclKind::Host),
                    write: r.write,
                },
            )
        })
        .collect()
}

/// A compiled template, ready for [`Compiled::generate`].
#[derive(Debug)]
pub struct Compiled {
    tree: Vec<Node>,
    cg: Vec<Cg>,
    root_codegen: Option<Cid>,
    pub helpers: Vec<Helper>,
    hoists: Vec<Cid>,
}

struct Transform<'a> {
    js: &'a Ast,
    hir: &'a Hir,
    src: &'a str,
    res: &'a Resolution,
    /// The render function is `setup`'s closure and reads bindings directly.
    inline: bool,
    tree: Vec<Node>,
    cg: Vec<Cg>,
    helpers: Vec<(Helper, u32)>,
    hoists: Vec<Cid>,
    cached: usize,
    refs: FxHashMap<NodeId, RefInfo>,
}

/// # Errors
///
/// [`Unsupported`] for a template construct the port does not cover.
pub fn transform(js: &Ast, hir: &Hir, src: &str, res: &Resolution, inline: bool) -> R<Compiled> {
    let mut t = Transform {
        js,
        hir,
        src,
        res,
        inline,
        tree: Vec::new(),
        cg: Vec::new(),
        helpers: Vec::new(),
        hoists: Vec::new(),
        cached: 0,
        refs: reference_table(res),
    };
    let children = t.parse_children(hir.root())?;
    let root = t.push(Node::Root(children));
    t.traverse(root, None)?;
    let single = t.single_element_root(root);
    t.walk_static(root, single);
    let root_codegen = t.root_codegen(root);
    Ok(Compiled {
        root_codegen,
        helpers: t.helpers.iter().map(|&(h, _)| h).collect(),
        hoists: t.hoists,
        tree: t.tree,
        cg: t.cg,
    })
}

impl Transform<'_> {
    fn push(&mut self, n: Node) -> Nid {
        self.tree.push(n);
        self.tree.len() - 1
    }

    fn cgn(&mut self, c: Cg) -> Cid {
        self.cg.push(c);
        self.cg.len() - 1
    }

    fn helper(&mut self, h: Helper) {
        if let Some(e) = self.helpers.iter_mut().find(|e| e.0 == h) {
            e.1 += 1;
        } else {
            self.helpers.push((h, 1));
        }
    }

    fn remove_helper(&mut self, h: Helper) {
        if let Some(i) = self.helpers.iter().position(|e| e.0 == h) {
            if self.helpers[i].1 <= 1 {
                self.helpers.remove(i);
            } else {
                self.helpers[i].1 -= 1;
            }
        }
    }

    fn children_of(&self, n: Nid) -> &[Nid] {
        match &self.tree[n] {
            Node::Root(children)
            | Node::Element { children, .. }
            | Node::Branch { children, .. }
            | Node::For { children, .. } => children,
            _ => &[],
        }
    }

    fn children_mut(&mut self, n: Nid) -> &mut Vec<Nid> {
        match &mut self.tree[n] {
            Node::Root(children)
            | Node::Element { children, .. }
            | Node::Branch { children, .. }
            | Node::For { children, .. } => children,
            _ => unreachable!("only a container has children"),
        }
    }

    fn codegen_of(&self, n: Nid) -> Option<Cid> {
        match &self.tree[n] {
            Node::Element { codegen, .. }
            | Node::If { codegen, .. }
            | Node::For { codegen, .. } => *codegen,
            Node::TextCall { codegen, .. } => Some(*codegen),
            _ => None,
        }
    }

    fn lit(&mut self, lit: Lit, const_type: u8) -> Cid {
        self.cgn(Cg::Lit { lit, const_type })
    }

    // ---- the HIR ------------------------------------------------------------------------

    /// The nodes as the transforms hold them, refusing what the port does not compile.
    fn parse_children(&mut self, kids: &[HirId]) -> R<Vec<Nid>> {
        let mut out = Vec::with_capacity(kids.len());
        for &k in kids {
            let node = self.hir.node(k);
            let n = match &node.kind {
                NodeKind::Text(t) => {
                    let text = t.text(self.src).to_owned();
                    self.push(Node::Text(text))
                }
                NodeKind::Comment { .. } => {
                    return Err(Unsupported::at(
                        "a comment in a compiled template",
                        node.span,
                    ));
                }
                NodeKind::Interpolation { expr } => self.push(Node::Interpolation(Exp {
                    node: *expr,
                    const_type: NOT_CONSTANT,
                    compound: false,
                    event_local: false,
                })),
                NodeKind::Element(el) => {
                    let tag = el.tag.text(self.src);
                    let filled_textarea =
                        tag == "textarea" && !self.hir.children(el.children).is_empty();
                    if filled_textarea || matches!(tag, "pre" | "svg" | "math" | "foreignObject") {
                        return Err(Unsupported::at(
                            "this element in a compiled template",
                            el.tag.span(),
                        ));
                    }
                    if el.tag_type != TagType::Element {
                        return Err(Unsupported::at(
                            "a component, slot or template in a compiled template",
                            el.tag.span(),
                        ));
                    }
                    let tag = tag.to_owned();
                    let props = self.parse_props(el.props)?;
                    let kids = self.parse_children(self.hir.children(el.children))?;
                    self.push(Node::Element {
                        tag,
                        props,
                        children: kids,
                        codegen: None,
                    })
                }
            };
            out.push(n);
        }
        Ok(out)
    }

    fn parse_props(&self, range: rsv_kernel::idx::IdxRange<PropId>) -> R<Vec<Prop>> {
        let mut props = Vec::with_capacity(range.len());
        for (id, p) in range.iter().zip(self.hir.props(range)) {
            props.push(match &p.kind {
                PropKind::Attribute { name, value } => {
                    let name = name.text(self.src);
                    if matches!(name, "ref" | "is" | "key") {
                        return Err(Unsupported::at("this attribute", p.span));
                    }
                    Prop::Static {
                        name: name.to_owned(),
                        value: value.as_ref().map(|v| v.text(self.src).to_owned()),
                    }
                }
                PropKind::Directive(d) => {
                    let arg = d.arg.as_ref().map_or("", |a| a.text(self.src));
                    if d.name == DirName::Bind && matches!(arg, "class" | "style" | "ref" | "is") {
                        return Err(Unsupported::at("this bound attribute", p.span));
                    }
                    let raw = match &d.exp {
                        DirExp::None => NodeId::NONE,
                        DirExp::Expr(e) => *e,
                        DirExp::For(f) => f.source,
                    };
                    Prop::Dir {
                        name: d.name,
                        arg: arg.to_owned(),
                        raw,
                        exp: None,
                        id,
                    }
                }
            });
        }
        Ok(props)
    }

    // ---- traverseNode --------------------------------------------------------------------

    /// `traverseNode` with the transforms that act on this template, in preset order:
    /// `transformIf`, `transformFor`, `transformExpression`, `transformElement`, `transformText`.
    fn traverse(&mut self, mut n: Nid, parent: Option<Nid>) -> R<()> {
        let mut exits: Vec<Exit> = Vec::new();
        if let Some((name, raw, _)) = self.take_directive(n, |d| {
            matches!(d, DirName::If | DirName::ElseIf | DirName::Else)
        }) {
            match self.process_if(n, parent, name, raw)? {
                Some((if_node, exit)) => {
                    n = if_node;
                    exits.push(exit);
                }
                None => return Ok(()),
            }
        }
        if let Some((_, raw, id)) = self.take_directive(n, |d| d == DirName::For) {
            let (for_node, exit) = self.process_for(n, parent, raw, id)?;
            n = for_node;
            exits.push(exit);
        }
        match self.tree[n] {
            Node::Interpolation(e) => {
                let e = self.process_expression(e.node, false)?;
                self.tree[n] = Node::Interpolation(e);
            }
            Node::Element { .. } => self.expression_props(n)?,
            _ => {}
        }
        if matches!(self.tree[n], Node::Element { .. }) {
            exits.push(Exit::Element(n));
        }
        if matches!(
            self.tree[n],
            Node::Root(_) | Node::Element { .. } | Node::For { .. } | Node::Branch { .. }
        ) {
            exits.push(Exit::Text(n));
        }
        match &self.tree[n] {
            Node::Interpolation(_) => self.helper(Helper::ToDisplayString),
            Node::If { branches, .. } => {
                for b in branches.clone() {
                    self.traverse(b, Some(n))?;
                }
            }
            Node::Root(_) | Node::Element { .. } | Node::Branch { .. } | Node::For { .. } => {
                self.traverse_children(n)?;
            }
            _ => {}
        }
        while let Some(exit) = exits.pop() {
            match exit {
                Exit::Element(n) => self.post_transform_element(n)?,
                Exit::Text(n) => self.transform_text(n),
                Exit::If {
                    if_node,
                    branch,
                    key,
                } => {
                    let cg = self.branch_codegen(branch, key);
                    if let Node::If { codegen, .. } = &mut self.tree[if_node] {
                        *codegen = Some(cg);
                    }
                }
                Exit::For(for_node) => self.finish_for(for_node),
            }
        }
        Ok(())
    }

    fn traverse_children(&mut self, n: Nid) -> R<()> {
        let mut i = 0;
        while i < self.children_of(n).len() {
            let child = self.children_of(n)[i];
            let before = self.children_of(n).len();
            self.traverse(child, Some(n))?;
            // Removals (a `v-else` and the whitespace before it) are at or before `i`.
            i = i + 1 - (before - self.children_of(n).len());
        }
        Ok(())
    }

    /// `createStructuralDirectiveTransform`: removes the first matching directive.
    fn take_directive(
        &mut self,
        n: Nid,
        matches: impl Fn(DirName) -> bool,
    ) -> Option<(DirName, NodeId, PropId)> {
        let Node::Element { props, .. } = &mut self.tree[n] else {
            return None;
        };
        let i = props
            .iter()
            .position(|p| matches!(p, Prop::Dir { name, .. } if matches(*name)))?;
        let Prop::Dir { name, raw, id, .. } = props.remove(i) else {
            unreachable!("matched a directive")
        };
        Some((name, raw, id))
    }

    fn replace_child(&mut self, parent: Nid, old: Nid, new: Nid) {
        if let Some(slot) = self.children_mut(parent).iter_mut().find(|c| **c == old) {
            *slot = new;
        }
    }

    // ---- v-if ----------------------------------------------------------------------------

    /// `processIf`. `None` when the element joined an earlier `v-if`: it is traversed here and
    /// leaves its parent.
    fn process_if(
        &mut self,
        el: Nid,
        parent: Option<Nid>,
        name: DirName,
        raw: NodeId,
    ) -> R<Option<(Nid, Exit)>> {
        let parent = parent.expect("an element has a parent");
        let condition = match name {
            DirName::Else => None,
            _ => Some(self.process_expression(raw, false)?),
        };
        let branch = self.push(Node::Branch {
            condition,
            children: vec![el],
        });
        if name == DirName::If {
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
        let alt = self.branch_codegen(branch, key);
        let Node::If {
            codegen: Some(mut c),
            ..
        } = self.tree[if_node]
        else {
            unreachable!("the v-if branch has set the codegen")
        };
        // `getParentCondition`.
        while let Cg::Cond { alt: a, .. } = self.cg[c]
            && matches!(self.cg[a], Cg::Cond { .. })
        {
            c = a;
        }
        if let Cg::Cond { alt: a, .. } = &mut self.cg[c] {
            *a = alt;
        }
        Ok(None)
    }

    /// The branches of the `v-if` nodes before `if_node`: its first key.
    fn branches_before(&self, parent: Nid, if_node: Nid) -> usize {
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
    fn branch_codegen(&mut self, branch: Nid, key: usize) -> Cid {
        let Node::Branch { condition, .. } = self.tree[branch] else {
            unreachable!("a branch")
        };
        let children = self.children_codegen(branch, key);
        let Some(test) = condition else {
            return children;
        };
        self.helper(Helper::CreateComment);
        let a = self.lit(Lit::Str("v-if".to_owned()), NOT_CONSTANT);
        let b = self.lit(Lit::Bool(true), NOT_CONSTANT);
        let alt = self.cgn(Cg::Call {
            callee: Helper::CreateComment,
            args: vec![a, b],
        });
        self.cgn(Cg::Cond {
            test,
            cons: children,
            alt,
        })
    }

    /// `createChildrenCodegenNode` for a branch holding one element, or the `v-for` it became.
    fn children_codegen(&mut self, branch: Nid, key: usize) -> Cid {
        let first = self.children_of(branch)[0];
        let vnode = self.codegen_of(first).expect("a transformed element");
        if matches!(self.tree[first], Node::Element { .. }) {
            self.convert_to_block(vnode);
        }
        #[expect(clippy::cast_precision_loss, reason = "a branch count")]
        let value = self.lit(Lit::Num(key as f64), CAN_CACHE);
        self.inject_prop(vnode, "key", value);
        vnode
    }

    fn convert_to_block(&mut self, vnode: Cid) {
        if let Cg::VNode { is_block, .. } = &mut self.cg[vnode]
            && !*is_block
        {
            *is_block = true;
            self.remove_helper(Helper::CreateElementVNode);
            self.helper(Helper::OpenBlock);
            self.helper(Helper::CreateElementBlock);
        }
    }

    /// `injectProp`.
    fn inject_prop(&mut self, vnode: Cid, key: &str, value: Cid) {
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
            Some(p) => {
                if let Cg::Object(list) = &mut self.cg[p]
                    && !list.iter().any(|(k, _)| k == key)
                {
                    list.insert(0, (key.to_owned(), value));
                }
            }
        }
    }

    // ---- v-for ---------------------------------------------------------------------------

    /// `processFor`, and the codegen `transformFor` creates before the children are traversed.
    fn process_for(
        &mut self,
        el: Nid,
        parent: Option<Nid>,
        raw: NodeId,
        id: PropId,
    ) -> R<(Nid, Exit)> {
        let PropKind::Directive(d) = &self.hir.props[id].kind else {
            unreachable!("v-for is a directive")
        };
        let DirExp::For(f) = &d.exp else {
            unreachable!("a v-for has its parse result")
        };
        let params = f.params.clone();
        let source = self.process_expression(raw, false)?;
        let for_node = self.push(Node::For {
            source,
            params,
            children: vec![el],
            codegen: None,
        });
        if let Some(p) = parent {
            self.replace_child(p, el, for_node);
        }
        self.helper(Helper::RenderList);
        let src_cg = self.cgn(Cg::Exp(source));
        let render = self.cgn(Cg::Call {
            callee: Helper::RenderList,
            args: vec![src_cg],
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
        Ok((for_node, Exit::For(for_node)))
    }

    fn has_key(&self, el: Nid) -> bool {
        let Node::Element { props, .. } = &self.tree[el] else {
            return false;
        };
        props.iter().any(|p| match p {
            Prop::Dir {
                name: DirName::Bind,
                arg,
                ..
            } => arg == "key",
            Prop::Static { name, .. } => name == "key",
            Prop::Dir { .. } => false,
        })
    }

    /// `transformFor`'s exit: the child's codegen becomes the render function's block.
    fn finish_for(&mut self, for_node: Nid) {
        let Node::For {
            source,
            params,
            codegen: Some(vnode),
            ..
        } = &self.tree[for_node]
        else {
            unreachable!("a v-for with its codegen")
        };
        let (source, params, vnode) = (*source, params.clone(), *vnode);
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
            params,
            returns: block,
        });
        if let Cg::Call { args, .. } = &mut self.cg[render] {
            args.push(f);
        }
    }

    // ---- expressions ---------------------------------------------------------------------

    /// `transformExpression` on an element: every directive's expression but `v-on`'s, which
    /// `transformOn` processes with `$event` in scope.
    fn expression_props(&mut self, n: Nid) -> R<()> {
        let Node::Element { props, .. } = &self.tree[n] else {
            return Ok(());
        };
        let todo: Vec<(usize, NodeId)> = props
            .iter()
            .enumerate()
            .filter_map(|(i, p)| match p {
                Prop::Dir {
                    name: DirName::Bind | DirName::Model,
                    raw,
                    ..
                } => Some((i, *raw)),
                _ => None,
            })
            .collect();
        for (i, raw) in todo {
            let e = self.process_expression(raw, false)?;
            if let Node::Element { props, .. } = &mut self.tree[n]
                && let Prop::Dir { exp, .. } = &mut props[i]
            {
                *exp = Some(e);
            }
        }
        Ok(())
    }

    fn reference(&self, id: NodeId, event_local: bool) -> Option<RefInfo> {
        let mut r = *self.refs.get(&id)?;
        if event_local && self.js.name(id) == "$event" {
            r.local = true;
        }
        Some(r)
    }

    /// `processExpression`: the constant type, and the checks and helpers of the identifier
    /// rewrites (`rewriteIdentifier` adds `unref` while it rewrites).
    fn process_expression(&mut self, e: NodeId, event_local: bool) -> R<Exp> {
        let mut out = Exp {
            node: e,
            const_type: NOT_CONSTANT,
            compound: false,
            event_local,
        };
        if let Kind::Ident(_) = self.js.kind(e) {
            let name = self.js.name(e);
            let local = self.reference(e, event_local).is_some_and(|r| r.local);
            let binding = self.binding_type(e);
            if !local && (!GLOBALS_ALLOWED.contains(&name) || binding.is_some()) {
                if matches!(
                    binding,
                    Some(BindingType::SetupConst | BindingType::LiteralConst)
                ) {
                    out.const_type = CAN_SKIP_PATCH;
                }
                self.check_rewrite(e, false)?;
            } else if !local {
                out.const_type = CAN_CACHE;
            }
            return Ok(out);
        }
        let mut ids = Vec::new();
        identifiers(self.js, e, None, &mut ids);
        if ids.is_empty() {
            out.const_type = CAN_STRINGIFY;
            return Ok(out);
        }
        out.compound = true;
        out.const_type = CAN_STRINGIFY;
        for (id, parent) in ids {
            let r = self.reference(id, event_local);
            let need_prefix = r.is_some() && can_prefix(self.js.name(id));
            let local = r.is_some_and(|r| r.local);
            if need_prefix && !local {
                self.check_rewrite(id, r.is_some_and(|r| r.write))?;
                out.const_type = NOT_CONSTANT;
            } else {
                // Reaching here, a name that needs a prefix is local: a scope variable.
                let accessed = parent.is_some_and(|p| {
                    matches!(
                        self.js.kind(p),
                        Kind::Call { .. } | Kind::New { .. } | Kind::Member { .. }
                    )
                });
                if need_prefix || accessed {
                    out.const_type = NOT_CONSTANT;
                }
            }
        }
        Ok(out)
    }

    fn binding_type(&self, id: NodeId) -> Option<BindingType> {
        if !self.inline {
            return None;
        }
        self.js.atom(id).and_then(|a| self.res.binding_type(a))
    }

    /// Refuses what `rewriteIdentifier` would do that the port does not, and adds its helper.
    fn check_rewrite(&mut self, id: NodeId, write: bool) -> R<()> {
        let loc = self.js.loc(id);
        let root_binding = self
            .res
            .sem
            .binding_of(id)
            .is_some_and(|b| self.res.sem.bindings[b].scope == ScopeId::ROOT);
        if self.inline && root_binding && self.binding_type(id).is_none() {
            return Err(Unsupported::at(
                "a template reference to a binding compileScript does not classify yet",
                loc,
            ));
        }
        match self.binding_type(id) {
            Some(BindingType::SetupLet) if write => Err(Unsupported::at(
                "assigning a `let` binding in the template",
                loc,
            )),
            Some(BindingType::SetupLet | BindingType::SetupMaybeRef) if !write => {
                self.helper(Helper::Unref);
                Ok(())
            }
            _ => Ok(()),
        }
    }

    // ---- transformElement ----------------------------------------------------------------

    /// `postTransformElement` for a plain element, with `buildProps`, `transformBind` and
    /// `transformOn`.
    fn post_transform_element(&mut self, n: Nid) -> R<()> {
        let Node::Element { tag, .. } = &self.tree[n] else {
            return Ok(());
        };
        let tag = tag.clone();
        let model_runtime = self.model_runtime(n)?;
        let Node::Element { props, .. } = &self.tree[n] else {
            unreachable!("an element")
        };
        let props: Vec<PropView> = props
            .iter()
            .map(|p| match p {
                Prop::Static { name, value } => {
                    PropView::Static(name.clone(), value.clone().unwrap_or_default())
                }
                Prop::Dir {
                    name,
                    arg,
                    raw,
                    exp,
                    id,
                } => PropView::Dir(*name, arg.clone(), *raw, *exp, *id),
            })
            .collect();
        let mut properties: Vec<(String, Cid)> = Vec::new();
        let mut runtime_directives: Vec<Cid> = Vec::new();
        let mut patch_flag = 0;
        let mut dynamic_prop_names: Vec<String> = Vec::new();
        let mut has_hydration_event = false;
        let mut should_use_block = false;
        for p in props {
            let (key, value) = match p {
                PropView::Static(name, value) => {
                    let v = self.lit(Lit::Str(value), CAN_STRINGIFY);
                    (name, v)
                }
                PropView::Dir(dir, arg, raw, exp, id) => {
                    if dir == DirName::Bind && arg == "key" {
                        should_use_block = true;
                    }
                    let (key, value, runtime) =
                        self.directive_transform(dir, arg, raw, exp, id, model_runtime)?;
                    runtime_directives.extend(runtime);
                    // `analyzePatchFlag`.
                    if is_on(&key)
                        && !key.eq_ignore_ascii_case("onclick")
                        && key != "onUpdate:modelValue"
                        && !is_reserved(&key)
                    {
                        has_hydration_event = true;
                    }
                    let constant = match &self.cg[value] {
                        Cg::Cache { .. } => true,
                        Cg::Exp(e) | Cg::Handler { exp: e, .. } => e.const_type > 0,
                        Cg::ModelUpdate { target, is_ref } => !is_ref && target.const_type > 0,
                        _ => false,
                    };
                    if !constant && key != "key" && !dynamic_prop_names.contains(&key) {
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
        let needs_patch =
            matches!(patch_flag, 0 | patch::NEED_HYDRATION) && !runtime_directives.is_empty();
        if !should_use_block && needs_patch {
            patch_flag |= patch::NEED_PATCH;
        }
        let vnode_props = (!properties.is_empty()).then(|| self.cgn(Cg::Object(properties)));
        let vnode_children = self.vnode_children(n, &mut patch_flag);
        let dynamic_props =
            (!dynamic_prop_names.is_empty()).then(|| self.cgn(Cg::PropNames(dynamic_prop_names)));
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
    fn vnode_children(&self, n: Nid, patch_flag: &mut i32) -> Option<VChildren> {
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

    /// The directive transforms `buildProps` runs: the property, and the runtime directive.
    fn directive_transform(
        &mut self,
        dir: DirName,
        arg: String,
        raw: NodeId,
        exp: Option<Exp>,
        id: PropId,
        model_runtime: Option<Helper>,
    ) -> R<(String, Cid, Option<Cid>)> {
        Ok(match dir {
            DirName::Bind => {
                let exp = exp.expect("transformExpression processed it");
                (arg, self.cgn(Cg::Exp(exp)), None)
            }
            DirName::On => {
                let (key, value) = self.transform_on(&arg, raw)?;
                (key, value, None)
            }
            DirName::Model => {
                let exp = exp.expect("transformExpression processed it");
                let runtime = model_runtime.expect("an element v-model has a runtime");
                let (update, args) = self.transform_model(raw, exp, id, runtime)?;
                ("onUpdate:modelValue".to_owned(), update, Some(args))
            }
            _ => unreachable!("structural directives are removed"),
        })
    }

    /// compiler-dom `transformModel`'s choice of runtime directive for an element's `v-model`,
    /// refusing what upstream reports as an error or the port does not compile; `None` without a
    /// `v-model`.
    fn model_runtime(&self, n: Nid) -> R<Option<Helper>> {
        let Node::Element { tag, props, .. } = &self.tree[n] else {
            return Ok(None);
        };
        let Some(id) = props.iter().find_map(|p| match p {
            Prop::Dir {
                name: DirName::Model,
                id,
                ..
            } => Some(*id),
            _ => None,
        }) else {
            return Ok(None);
        };
        let span = self.hir.props[id].span;
        let PropKind::Directive(d) = &self.hir.props[id].kind else {
            unreachable!("v-model is a directive")
        };
        if d.arg.is_some() {
            return Err(Unsupported::at("a v-model argument on an element", span));
        }
        // `checkDuplicatedValue`: only the first `v-bind` is looked at.
        let duplicated_value = || {
            props.iter().find_map(|p| match p {
                Prop::Dir {
                    name: DirName::Bind,
                    arg,
                    ..
                } => Some(arg == "value"),
                _ => None,
            }) == Some(true)
        };
        let runtime = match tag.as_str() {
            "input" => {
                // `findProp(node, 'type')`: a static `type` with a value, or a bound one.
                let ty = props.iter().find_map(|p| match p {
                    Prop::Static {
                        name,
                        value: Some(v),
                    } if name == "type" => Some(Some(v.as_str())),
                    Prop::Dir {
                        name: DirName::Bind,
                        arg,
                        ..
                    } if arg == "type" => Some(None),
                    _ => None,
                });
                match ty {
                    Some(None) => {
                        return Err(Unsupported::at("v-model with a bound `type`", span));
                    }
                    Some(Some("radio")) => Helper::VModelRadio,
                    Some(Some("checkbox")) => Helper::VModelCheckbox,
                    Some(Some("file")) => {
                        return Err(Unsupported::at("v-model on a file input", span));
                    }
                    _ if duplicated_value() => {
                        return Err(Unsupported::at("v-model with a bound `value`", span));
                    }
                    _ => Helper::VModelText,
                }
            }
            "select" => Helper::VModelSelect,
            "textarea" if duplicated_value() => {
                return Err(Unsupported::at("v-model with a bound `value`", span));
            }
            "textarea" => Helper::VModelText,
            _ => return Err(Unsupported::at("v-model on this element", span)),
        };
        Ok(Some(runtime))
    }

    /// compiler-core `transformModel` for an element, with compiler-dom's: the update handler
    /// (cached unless it reads a `v-for` alias) and the directive's `withDirectives` entry
    /// (`buildDirectiveArgs`). The target is a ref or a member expression.
    fn transform_model(
        &mut self,
        raw: NodeId,
        exp: Exp,
        id: PropId,
        runtime: Helper,
    ) -> R<(Cid, Cid)> {
        let loc = self.js.loc(raw);
        let is_ref = match self.js.kind(raw) {
            Kind::Ident(_) => {
                let local = self.reference(raw, false).is_some_and(|r| r.local);
                if local || self.binding_type(raw) != Some(BindingType::SetupRef) {
                    return Err(Unsupported::at(
                        "a v-model target that is not a ref or a member expression",
                        loc,
                    ));
                }
                true
            }
            Kind::Member {
                optional: false, ..
            } => false,
            _ => {
                return Err(Unsupported::at(
                    "a v-model target that is not a ref or a member expression",
                    loc,
                ));
            }
        };
        let update = self.cgn(Cg::ModelUpdate {
            target: exp,
            is_ref,
        });
        let update = if self.has_scope_ref(raw) {
            update
        } else {
            self.cache(update)
        };
        self.helper(runtime);
        let PropKind::Directive(d) = &self.hir.props[id].kind else {
            unreachable!("v-model is a directive")
        };
        let modifiers: Vec<String> = d
            .modifiers
            .iter()
            .map(|m| m.text(self.src).to_owned())
            .collect();
        let mut args = vec![self.cgn(Cg::Helper(runtime)), self.cgn(Cg::Exp(exp))];
        if !modifiers.is_empty() {
            args.push(self.lit(Lit::Undefined, NOT_CONSTANT));
            let props = modifiers
                .into_iter()
                .map(|m| (m, self.lit(Lit::Bool(true), NOT_CONSTANT)))
                .collect();
            args.push(self.cgn(Cg::Object(props)));
        }
        Ok((update, self.cgn(Cg::Array(args))))
    }

    /// `transformOn`, with `cacheHandlers`.
    fn transform_on(&mut self, arg: &str, raw: NodeId) -> R<(String, Cid)> {
        let key = to_handler_key(&camelize(arg));
        let is_member = match self.js.kind(raw) {
            Kind::Member { .. } => true,
            Kind::Ident(_) => self.js.name(raw) != "undefined",
            _ => false,
        };
        let is_fn = matches!(
            self.js.kind(raw),
            Kind::Arrow { .. } | Kind::Function { .. }
        );
        let inline = !(is_member || is_fn);
        let exp = self.process_expression(raw, inline)?;
        let runtime_constant = !exp.compound && exp.const_type > 0;
        let should_cache = !runtime_constant && !self.has_scope_ref(raw);
        let value = if inline || (should_cache && is_member) {
            self.cgn(Cg::Handler { exp, inline })
        } else {
            self.cgn(Cg::Exp(exp))
        };
        let value = if should_cache {
            self.cache(value)
        } else {
            value
        };
        Ok((key, value))
    }

    /// `hasScopeRef`: the expression reads a `v-for` alias.
    fn has_scope_ref(&self, e: NodeId) -> bool {
        let mut ids = Vec::new();
        identifiers(self.js, e, None, &mut ids);
        ids.iter()
            .any(|&(id, _)| self.refs.get(&id).is_some_and(|r| r.host))
    }

    fn cache(&mut self, value: Cid) -> Cid {
        let index = self.cached;
        self.cached += 1;
        self.cgn(Cg::Cache {
            index,
            value,
            spread: false,
        })
    }

    /// `createVNodeCall`.
    fn vnode_call(&mut self, a: VNodeArgs) -> Cid {
        if a.is_block {
            self.helper(Helper::OpenBlock);
            self.helper(Helper::CreateElementBlock);
        } else {
            self.helper(Helper::CreateElementVNode);
        }
        if a.directives.is_some() {
            self.helper(Helper::WithDirectives);
        }
        self.cgn(Cg::VNode {
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

    // ---- transformText -------------------------------------------------------------------

    fn transform_text(&mut self, n: Nid) {
        let is_text =
            |t: &Self, c: Nid| matches!(t.tree[c], Node::Text(_) | Node::Interpolation(_));
        let mut children = self.children_of(n).to_vec();
        let mut has_text = false;
        let mut i = 0;
        while i < children.len() {
            if is_text(self, children[i]) {
                has_text = true;
                let mut container: Option<Nid> = None;
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
                let mut args = Vec::new();
                if !matches!(&self.tree[*child], Node::Text(t) if t == " ") {
                    args.push(self.cgn(Cg::Node(*child)));
                }
                if self.constant_type(*child) == NOT_CONSTANT {
                    args.push(self.lit(Lit::Num(f64::from(patch::TEXT)), NOT_CONSTANT));
                }
                self.helper(Helper::CreateText);
                let codegen = self.cgn(Cg::Call {
                    callee: Helper::CreateText,
                    args,
                });
                *child = self.push(Node::TextCall {
                    content: *child,
                    codegen,
                });
            }
        }
        *self.children_mut(n) = children;
    }

    // ---- constant types, cacheStatic, the root -------------------------------------------

    /// `getConstantType` for a template node.
    fn constant_type(&self, n: Nid) -> u8 {
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
                let Cg::VNode {
                    is_block,
                    patch_flag,
                    props: vprops,
                    ..
                } = &self.cg[*cg]
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
                        if let Prop::Dir {
                            name: DirName::Bind,
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
    fn generated_props_type(&self, props: Option<Cid>) -> u8 {
        let Some(Cg::Object(list)) = props.map(|p| &self.cg[p]) else {
            return CAN_STRINGIFY;
        };
        let mut ret = CAN_STRINGIFY;
        for &(_, v) in list {
            let t = match &self.cg[v] {
                Cg::Lit { const_type, .. } => *const_type,
                Cg::Exp(e) if !e.compound => e.const_type,
                Cg::Hoisted(_) => CAN_CACHE,
                _ => NOT_CONSTANT,
            };
            if t == NOT_CONSTANT {
                return NOT_CONSTANT;
            }
            ret = ret.min(t);
        }
        ret
    }

    fn single_element_root(&self, root: Nid) -> bool {
        matches!(self.children_of(root), [only] if matches!(self.tree[*only], Node::Element { .. }))
    }

    fn hoist(&mut self, value: Cid) -> Cid {
        self.hoists.push(value);
        self.cgn(Cg::Hoisted(self.hoists.len()))
    }

    /// `walk` for an element that is not constant: its props may still be hoisted.
    fn hoist_props(&mut self, vnode: Cid) {
        let Cg::VNode {
            patch_flag,
            props,
            dynamic_props,
            ..
        } = self.cg[vnode]
        else {
            return;
        };
        if matches!(patch_flag, None | Some(patch::NEED_PATCH | patch::TEXT))
            && self.generated_props_type(props) >= CAN_CACHE
            && let Some(p) = props
        {
            let h = self.hoist(p);
            if let Cg::VNode { props, .. } = &mut self.cg[vnode] {
                *props = Some(h);
            }
        }
        if let Some(d) = dynamic_props {
            let h = self.hoist(d);
            if let Cg::VNode { dynamic_props, .. } = &mut self.cg[vnode] {
                *dynamic_props = Some(h);
            }
        }
    }

    /// `cacheStatic`'s `walk`.
    fn walk_static(&mut self, n: Nid, do_not_hoist: bool) {
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
                        if let Cg::VNode { patch_flag, .. } = &mut self.cg[vnode] {
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
                        if let Cg::Call { args, .. } = &self.cg[codegen]
                            && !args.is_empty()
                        {
                            let flag = self.lit(Lit::Num(f64::from(patch::CACHED)), NOT_CONSTANT);
                            if let Cg::Call { args, .. } = &mut self.cg[codegen] {
                                args.push(flag);
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
            && let Cg::VNode {
                children: Some(VChildren::List(list)),
                ..
            } = &self.cg[vnode]
        {
            let arr = self.cgn(Cg::NodeArray(list.clone()));
            let c = self.cache(arr);
            // Always spread since #13221: mounting must not mutate the cached array.
            if let Cg::Cache { spread, .. } = &mut self.cg[c] {
                *spread = true;
            }
            if let Cg::VNode { children, .. } = &mut self.cg[vnode] {
                *children = Some(VChildren::Cg(c));
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
    fn root_codegen(&mut self, root: Nid) -> Option<Cid> {
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
                    Some(self.cgn(Cg::Node(child)))
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

enum PropView {
    Static(String, String),
    Dir(DirName, String, NodeId, Option<Exp>, PropId),
}

struct VNodeArgs {
    tag: Option<String>,
    props: Option<Cid>,
    children: Option<VChildren>,
    patch_flag: Option<i32>,
    dynamic_props: Option<Cid>,
    directives: Option<Cid>,
    is_block: bool,
    disable_tracking: bool,
    needs_patch: bool,
}

enum Exit {
    Element(Nid),
    Text(Nid),
    If {
        if_node: Nid,
        branch: Nid,
        key: usize,
    },
    For(Nid),
}

pub(crate) fn can_prefix(name: &str) -> bool {
    !GLOBALS_ALLOWED.contains(&name) && name != "require"
}

/// `isOn`: `on` followed by a character that is not a lower-case letter.
fn is_on(key: &str) -> bool {
    let b = key.as_bytes();
    b.len() > 2 && b.starts_with(b"on") && !b[2].is_ascii_lowercase()
}

/// `isReservedProp`.
fn is_reserved(key: &str) -> bool {
    matches!(
        key,
        "" | "key"
            | "ref"
            | "ref_for"
            | "ref_key"
            | "onVnodeBeforeMount"
            | "onVnodeMounted"
            | "onVnodeBeforeUpdate"
            | "onVnodeUpdated"
            | "onVnodeBeforeUnmount"
            | "onVnodeUnmounted"
    )
}

/// `@vue/shared` `camelize`: `-x` becomes `X` for a word character `x`.
pub(crate) fn camelize(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '-'
            && let Some(&n) = chars.peek()
            && (n.is_ascii_alphanumeric() || n == '_')
        {
            out.push(n.to_ascii_uppercase());
            chars.next();
        } else {
            out.push(c);
        }
    }
    out
}

/// `toHandlerKey`: `on` and the name with its first character upper-cased.
pub(crate) fn to_handler_key(s: &str) -> String {
    let mut chars = s.chars();
    chars.next().map_or_else(String::new, |f| {
        format!("on{}{}", f.to_uppercase(), chars.as_str())
    })
}

/// compiler-core `isSimpleIdentifier`.
pub(crate) fn is_simple_identifier(s: &str) -> bool {
    let mut b = s.bytes();
    b.next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == b'_' || c == b'$')
        && b.all(|c| c.is_ascii_alphanumeric() || c == b'_' || c == b'$')
}

/// Every identifier `walkIdentifiers` visits with `includeAll`, with its parent, but static object
/// keys (`isStaticPropertyKey`).
pub(crate) fn identifiers(
    ast: &Ast,
    n: NodeId,
    parent: Option<NodeId>,
    out: &mut Vec<(NodeId, Option<NodeId>)>,
) {
    match ast.kind(n) {
        Kind::Ident(_) => out.push((n, parent)),
        Kind::Property {
            key,
            value,
            computed,
            shorthand,
            ..
        } => {
            if computed {
                identifiers(ast, key, Some(n), out);
            }
            if shorthand && !computed {
                out.push((value, Some(n)));
            } else {
                identifiers(ast, value, Some(n), out);
            }
        }
        _ => {
            let mut kids = Vec::new();
            ast.for_each_child(n, |k| kids.push(k));
            for k in kids {
                identifiers(ast, k, Some(n), out);
            }
        }
    }
}

// ---- generate ----------------------------------------------------------------------------

/// Copies a template expression into the output, rewriting names as inline-mode
/// `rewriteIdentifier` does (or to `_ctx.x` without bindings).
struct ExpRewrite<'a> {
    res: &'a Resolution,
    refs: &'a FxHashMap<NodeId, RefInfo>,
    inline: bool,
    event_local: bool,
}

impl ExpRewrite<'_> {
    fn binding(&self, from: &Ast, id: NodeId) -> Option<BindingType> {
        if !self.inline {
            return None;
        }
        from.atom(id).and_then(|a| self.res.binding_type(a))
    }

    fn prefixed(&self, from: &Ast, id: NodeId) -> bool {
        let Some(r) = self.refs.get(&id) else {
            return false;
        };
        let name = from.name(id);
        let local = r.local || (self.event_local && name == "$event");
        !local && (can_prefix(name) || self.binding(from, id).is_some())
    }

    fn rewrite_ident(&self, from: &Ast, to: &mut Ast, id: NodeId) -> NodeId {
        let loc = from.loc(id);
        let x = to.ident(from.name(id), loc);
        let write = self.refs.get(&id).is_some_and(|r| r.write);
        let member = |to: &mut Ast, object: &str, x: NodeId| {
            let o = to.id(object);
            to.member(o, x, false, false, loc)
        };
        match self.binding(from, id) {
            Some(
                BindingType::SetupConst
                | BindingType::LiteralConst
                | BindingType::SetupReactiveConst,
            ) => x,
            Some(BindingType::SetupRef) => to.dot(x, "value"),
            Some(BindingType::SetupMaybeRef) if write => to.dot(x, "value"),
            Some(BindingType::SetupMaybeRef | BindingType::SetupLet) => {
                let callee = to.id("_unref");
                to.call(callee, &[x], false, loc)
            }
            Some(BindingType::Props) => member(to, "__props", x),
            None => member(to, "_ctx", x),
        }
    }
}

impl Rewrite for ExpRewrite<'_> {
    fn rewrite(&mut self, from: &Ast, to: &mut Ast, id: NodeId) -> Option<NodeId> {
        match from.kind(id) {
            Kind::Ident(_) if self.prefixed(from, id) => Some(self.rewrite_ident(from, to, id)),
            Kind::Property {
                key,
                value,
                shorthand: true,
                computed: false,
                ..
            } if self.prefixed(from, value) => {
                let k = to.ident(from.name(key), from.loc(key));
                let v = self.rewrite_ident(from, to, value);
                Some(to.property(k, v, 0, from.loc(id)))
            }
            _ => None,
        }
    }
}

struct Gen<'a> {
    t: &'a Compiled,
    js: &'a Ast,
    res: &'a Resolution,
    refs: FxHashMap<NodeId, RefInfo>,
    inline: bool,
    to: &'a mut Ast,
}

impl Compiled {
    /// `generate` for a module: the preamble (`genModulePreamble`: the helper import and the
    /// hoists) and the expression the render function returns.
    pub fn generate(
        &self,
        js: &Ast,
        res: &Resolution,
        inline: bool,
        to: &mut Ast,
    ) -> (Vec<NodeId>, NodeId) {
        let mut g = Gen {
            t: self,
            js,
            res,
            refs: reference_table(res),
            inline,
            to,
        };
        let mut preamble = Vec::new();
        if !self.helpers.is_empty() {
            let specs: Vec<NodeId> = self
                .helpers
                .iter()
                .map(|h| {
                    let imported = g.to.id(h.name());
                    let local = g.to.id(&format!("_{}", h.name()));
                    g.to.import_named(imported, local, false, Loc::SYNTHETIC)
                })
                .collect();
            let source = g.to.str("vue");
            preamble.push(g.to.import(&specs, source, false, Loc::SYNTHETIC));
        }
        for (i, &h) in self.hoists.iter().enumerate() {
            let value = g.cg(h);
            let name = g.to.id(&format!("_hoisted_{}", i + 1));
            preamble.push(g.to.let_(flag::CONST, name, Some(value)));
        }
        let ret = match self.root_codegen {
            Some(c) => g.cg(c),
            None => g.to.null(Loc::SYNTHETIC),
        };
        (preamble, ret)
    }
}

impl Gen<'_> {
    fn helper(&mut self, h: Helper) -> NodeId {
        self.to.id(&format!("_{}", h.name()))
    }

    fn exp(&mut self, e: Exp) -> NodeId {
        let mut rw = ExpRewrite {
            res: self.res,
            refs: &self.refs,
            inline: self.inline,
            event_local: e.event_local,
        };
        copy(self.js, self.to, &mut rw, e.node)
    }

    /// `genNode` for a template node.
    fn node(&mut self, n: Nid) -> NodeId {
        match &self.t.tree[n] {
            Node::Text(t) => self.to.str(t),
            Node::Interpolation(e) => {
                let x = self.exp(*e);
                let callee = self.helper(Helper::ToDisplayString);
                self.to.call0(callee, &[x])
            }
            Node::Compound(list) => {
                let mut acc: Option<NodeId> = None;
                for &c in list {
                    let x = self.node(c);
                    acc = Some(match acc {
                        None => x,
                        Some(l) => self.to.binary(BinOp::Add, l, x, Loc::SYNTHETIC),
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
    fn cg(&mut self, c: Cid) -> NodeId {
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
                    Some(t) => self.to.str(t),
                    None => self.helper(Helper::Fragment),
                };
                let mut args: Vec<Option<NodeId>> = vec![Some(tag)];
                args.push(props.map(|p| self.cg(p)));
                args.push(children.as_ref().map(|ch| match ch {
                    VChildren::Node(n) => self.node(*n),
                    VChildren::List(list) => self.node_array(list),
                    VChildren::Cg(c) => self.cg(*c),
                }));
                args.push(patch_flag.map(|f| self.flag(f)));
                args.push(dynamic_props.map(|d| self.cg(d)));
                while args.last().is_some_and(Option::is_none) {
                    args.pop();
                }
                let args: Vec<NodeId> = args
                    .into_iter()
                    .map(|a| a.unwrap_or_else(|| self.to.null(Loc::SYNTHETIC)))
                    .collect();
                let callee = self.helper(if is_block {
                    Helper::CreateElementBlock
                } else {
                    Helper::CreateElementVNode
                });
                let mut call = self.to.call0(callee, &args);
                if is_block {
                    let open = self.helper(Helper::OpenBlock);
                    let open_args = if disable_tracking {
                        vec![self.to.bool(true, Loc::SYNTHETIC)]
                    } else {
                        Vec::new()
                    };
                    let open = self.to.call0(open, &open_args);
                    call = self.to.seq(&[open, call], Loc::SYNTHETIC);
                }
                let Some(d) = directives else {
                    return call;
                };
                let list = self.cg(d);
                let callee = self.helper(Helper::WithDirectives);
                self.to.call0(callee, &[call, list])
            }
            Cg::Call { callee, args } => {
                let args: Vec<NodeId> = args.iter().map(|&a| self.cg(a)).collect();
                let callee = self.helper(*callee);
                self.to.call0(callee, &args)
            }
            Cg::Object(list) => {
                let props: Vec<NodeId> = list
                    .iter()
                    .map(|(k, v)| {
                        let key = if is_simple_identifier(k) {
                            self.to.id(k)
                        } else {
                            self.to.str(k)
                        };
                        let value = self.cg(*v);
                        self.to.property(key, value, 0, Loc::SYNTHETIC)
                    })
                    .collect();
                self.to.object(&props, Loc::SYNTHETIC)
            }
            Cg::NodeArray(list) => self.node_array(list),
            Cg::Array(list) => {
                let items: Vec<NodeId> = list.iter().map(|&c| self.cg(c)).collect();
                self.to.array(&items, Loc::SYNTHETIC)
            }
            &Cg::Helper(h) => self.helper(h),
            Cg::PropNames(names) => {
                let items: Vec<NodeId> = names.iter().map(|n| self.to.str(n)).collect();
                self.to.array(&items, Loc::SYNTHETIC)
            }
            Cg::Lit { lit, .. } => match lit {
                Lit::Str(s) => self.to.str(s),
                Lit::Num(v) => self.to.num(*v, Loc::SYNTHETIC),
                Lit::Bool(b) => self.to.bool(*b, Loc::SYNTHETIC),
                Lit::Undefined => {
                    let zero = self.to.num(0.0, Loc::SYNTHETIC);
                    self.to.unary(UnaryOp::Void, zero, Loc::SYNTHETIC)
                }
            },
            Cg::Exp(e) => self.exp(*e),
            &Cg::Handler { exp, inline } => {
                if inline {
                    let body = self.exp(exp);
                    let p = self.to.id("$event");
                    return self.to.arrow(&[p], body, true, false, Loc::SYNTHETIC);
                }
                let a = self.exp(exp);
                let f = self.exp(exp);
                let args = self.to.id("args");
                let spread = self.to.spread(args, Loc::SYNTHETIC);
                let call = self.to.call0(f, &[spread]);
                let body = self.to.logical(LogicalOp::And, a, call, Loc::SYNTHETIC);
                let args = self.to.id("args");
                let rest = self.to.rest(args, Loc::SYNTHETIC);
                self.to.arrow(&[rest], body, true, false, Loc::SYNTHETIC)
            }
            &Cg::ModelUpdate { target, is_ref } => {
                let lhs = if is_ref {
                    let x = copy(self.js, self.to, &mut Verbatim, target.node);
                    self.to.dot(x, "value")
                } else {
                    self.exp(target)
                };
                let event = self.to.id("$event");
                let body = self.to.assign(AssignOp::Assign, lhs, event, Loc::SYNTHETIC);
                let p = self.to.id("$event");
                self.to.arrow(&[p], body, true, false, Loc::SYNTHETIC)
            }
            Cg::Function { params, returns } => {
                let ps: Vec<NodeId> = params
                    .iter()
                    .map(|&p| copy(self.js, self.to, &mut Verbatim, p))
                    .collect();
                let r = self.cg(*returns);
                let ret = self.to.return_(Some(r), Loc::SYNTHETIC);
                let body = self.to.block(&[ret], Loc::SYNTHETIC);
                self.to.arrow(&ps, body, false, false, Loc::SYNTHETIC)
            }
            &Cg::Cond { test, cons, alt } => {
                let t = self.exp(test);
                let c = self.cg(cons);
                let a = self.cg(alt);
                self.to.cond(t, c, a, Loc::SYNTHETIC)
            }
            &Cg::Cache {
                index,
                value,
                spread,
            } => {
                #[expect(clippy::cast_precision_loss, reason = "a cache slot")]
                let slot = |to: &mut Ast| {
                    let cache = to.id("_cache");
                    let i = to.num(index as f64, Loc::SYNTHETIC);
                    to.member(cache, i, true, false, Loc::SYNTHETIC)
                };
                let read = slot(self.to);
                let v = self.cg(value);
                let target = slot(self.to);
                let assign = self.to.assign(AssignOp::Assign, target, v, Loc::SYNTHETIC);
                let cached = self.to.logical(LogicalOp::Or, read, assign, Loc::SYNTHETIC);
                if !spread {
                    return cached;
                }
                let s = self.to.spread(cached, Loc::SYNTHETIC);
                self.to.array(&[s], Loc::SYNTHETIC)
            }
            Cg::Hoisted(i) => self.to.id(&format!("_hoisted_{i}")),
            Cg::Node(n) => self.node(*n),
        }
    }

    fn node_array(&mut self, list: &[Nid]) -> NodeId {
        let items: Vec<NodeId> = list.iter().map(|&n| self.node(n)).collect();
        self.to.array(&items, Loc::SYNTHETIC)
    }

    fn flag(&mut self, f: i32) -> NodeId {
        let n = self.to.num(f64::from(f.abs()), Loc::SYNTHETIC);
        if f < 0 {
            self.to.unary(UnaryOp::Neg, n, Loc::SYNTHETIC)
        } else {
            n
        }
    }
}
