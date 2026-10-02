//! Client lowering: a DOM template per fragment plus the statements that walk it and keep it up to
//! date.
//!
//! Mirrors upstream `3-transform/client` (Fragment, `RegularElement`, `IfBlock`, `EachBlock`,
//! `BindDirective`, `AttachTag`, shared/fragment).

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_markup::decode_text;
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, Element, ElementKind,
    NodeKind, Part,
};
use rsvelte_svelte::compilation::render_plan::RenderPlan;
use rsvelte_svelte::semantic::analyze::{Analysis, ExpressionMetadata};
use rsvelte_svelte::semantic::resolve::Resolution;
use rsvelte_svelte::syntax::parse::is_void;
use rsvelte_typescript::copy::copy;
use rsvelte_typescript::operators::{AssignmentOperator, BinaryOperator, LogicalOperator};
use rsvelte_typescript::scope::{BindingIdentifier, ScopeIdentifier};
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::javascript::{init_property, runtime_call};
use super::names::Names;
use super::script::ScriptRewrite;
use super::{
    CompileInput, Item, Prepared, Target, check_binding, check_foreign_element, escape_markup,
    event_attribute, has_dependency, is_customizable_select, is_directive, is_load_error_element,
    needs_clsx, sanitize_template_string, synthetic_value,
};

const TEMPLATE_FRAGMENT: u32 = 1;
const TEMPLATE_USE_IMPORT_NODE: u32 = 2;
const EACH_ITEM_REACTIVE: u32 = 1;
const EACH_INDEX_REACTIVE: u32 = 1 << 1;
const EACH_IS_CONTROLLED: u32 = 1 << 2;
const EACH_ITEM_IMMUTABLE: u32 = 1 << 4;
const PASSIVE_EVENTS: &[&str] = &["touchstart", "touchmove"];
const DELEGATED_EVENTS: &[&str] = &[
    "beforeinput",
    "click",
    "change",
    "dblclick",
    "contextmenu",
    "focusin",
    "focusout",
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerout",
    "pointerover",
    "pointerup",
    "touchend",
    "touchmove",
    "touchstart",
];

type R<T> = Result<T, Diagnostic>;

fn unsupported<T>(what: &str, span: Span) -> R<T> {
    Err(Diagnostic::error(
        "unsupported",
        format!("{what} is not supported yet"),
        span,
    ))
}

/// Upstream `normalize_attribute`.
#[must_use]
pub fn normalize_attribute(name: &str) -> String {
    let lower = name.to_ascii_lowercase();
    let alias = match lower.as_str() {
        "formnovalidate" => "formNoValidate",
        "ismap" => "isMap",
        "nomodule" => "noModule",
        "playsinline" => "playsInline",
        "readonly" => "readOnly",
        "defaultvalue" => "defaultValue",
        "defaultchecked" => "defaultChecked",
        "srcobject" => "srcObject",
        "novalidate" => "noValidate",
        "allowfullscreen" => "allowFullscreen",
        "disablepictureinpicture" => "disablePictureInPicture",
        "disableremoteplayback" => "disableRemotePlayback",
        _ => return lower,
    };
    alias.to_owned()
}

/// The HTML of one fragment, built while its nodes are visited (upstream `Template`).
#[derive(Default)]
struct Template {
    arena: Vec<TplNode>,
    roots: Vec<usize>,
    stack: Vec<usize>,
    needs_import_node: bool,
}

enum TplNode {
    Element {
        name: String,
        attributes: Vec<(String, Option<String>)>,
        children: Vec<usize>,
    },
    Text(String),
    Comment(Option<String>),
}

impl Template {
    fn add(&mut self, n: TplNode) -> usize {
        self.arena.push(n);
        let i = self.arena.len() - 1;
        match self.stack.last() {
            Some(&p) => match &mut self.arena[p] {
                TplNode::Element { children, .. } => children.push(i),
                _ => unreachable!("only elements are pushed on the stack"),
            },
            None => self.roots.push(i),
        }
        i
    }

    fn push_element(&mut self, name: &str) {
        let i = self.add(TplNode::Element {
            name: name.to_owned(),
            attributes: Vec::new(),
            children: Vec::new(),
        });
        self.stack.push(i);
    }

    fn pop_element(&mut self) {
        self.stack.pop();
    }

    fn push_text(&mut self, raw: String) {
        self.add(TplNode::Text(raw));
    }

    fn push_comment(&mut self) {
        self.add(TplNode::Comment(None));
    }

    /// Like a JS object: setting an existing key keeps its position.
    fn set_prop(&mut self, key: &str, value: Option<String>) {
        let top = *self
            .stack
            .last()
            .expect("attributes are set on an open element");
        let TplNode::Element { attributes, .. } = &mut self.arena[top] else {
            unreachable!("stack holds elements")
        };
        match attributes.iter_mut().find(|(k, _)| k == key) {
            Some(slot) => slot.1 = value,
            None => attributes.push((key.to_owned(), value)),
        }
    }

    fn is_lone_comment(&self) -> bool {
        self.roots.len() == 1 && matches!(self.arena[self.roots[0]], TplNode::Comment(_))
    }

    fn markup(&self) -> String {
        let mut out = String::new();
        for &r in &self.roots {
            self.stringify(r, &mut out);
        }
        out
    }

    fn stringify(&self, i: usize, out: &mut String) {
        match &self.arena[i] {
            TplNode::Text(raw) => out.push_str(raw),
            TplNode::Comment(Some(d)) => {
                out.push_str("<!--");
                out.push_str(d);
                out.push_str("-->");
            }
            TplNode::Comment(None) => out.push_str("<!>"),
            TplNode::Element {
                name,
                attributes,
                children,
            } => {
                out.push('<');
                out.push_str(name);
                for (k, v) in attributes {
                    out.push(' ');
                    out.push_str(&k.to_ascii_lowercase());
                    if let Some(v) = v {
                        out.push_str("=\"");
                        out.push_str(&escape_markup(v, true));
                        out.push('"');
                    }
                }
                if is_void(name) {
                    out.push_str("/>");
                } else {
                    out.push('>');
                    for &c in children {
                        self.stringify(c, out);
                    }
                    out.push_str("</");
                    out.push_str(name);
                    out.push('>');
                }
            }
        }
    }
}

/// Per fragment: the template and the memoized expressions (`$0`, `$1`, …) of its render effect.
#[derive(Default)]
struct Frag {
    tpl: Template,
    memo: Vec<NodeIdentifier>,
}

#[derive(Default)]
struct Lists {
    initializer: Vec<NodeIdentifier>,
    update: Vec<NodeIdentifier>,
    after: Vec<NodeIdentifier>,
}

/// How to reach the first node of a child list (upstream `process_children`'s `initial`).
#[derive(Clone)]
enum Prev {
    Call { method: &'static str, of: String },
    Identifier(String),
}

struct ClientCompilationContext<'a> {
    javascript: &'a SyntaxTree,
    compiler_syntax_tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    res: &'a Resolution,
    an: &'a Analysis,
    out: SyntaxTree,
    names: Names,
    hoisted: Vec<NodeIdentifier>,
    templates: FxHashMap<String, String>,
    events: Vec<String>,
    /// The `{#each}` names in scope, and whether a read goes through `$.get`.
    each: FxHashMap<BindingIdentifier, bool>,
    each_index: FxHashMap<CompilerNodeIdentifier, String>,
    /// Where names in lowered expressions resolve: the innermost `{#each}` scope.
    scope: ScopeIdentifier,
    plan: &'a RenderPlan,
}

/// # Errors
///
/// An `unsupported` [`Diagnostic`] if the component uses a construct the client lowering does not
/// handle yet.
pub fn lower(
    input: &CompileInput<'_>,
    res: &Resolution,
    an: &Analysis,
) -> R<(SyntaxTree, NodeIdentifier)> {
    super::lower(input, res, an, Target::Client)
}

pub(crate) fn lower_prepared(
    input: &CompileInput<'_>,
    res: &Resolution,
    an: &Analysis,
    plan: &RenderPlan,
    prepared: Prepared,
) -> R<(SyntaxTree, NodeIdentifier)> {
    let javascript = input.javascript;
    let Prepared {
        out,
        names,
        each_index,
        hoisted,
        instance,
    } = prepared;
    let mut context = ClientCompilationContext {
        javascript,
        compiler_syntax_tree: input.compiler_syntax_tree,
        source_text: input.source_text,
        res,
        an,
        out,
        names,
        hoisted,
        templates: FxHashMap::default(),
        events: Vec::new(),
        each: FxHashMap::default(),
        each_index,
        scope: ScopeIdentifier::ROOT,
        plan,
    };
    let template = context.fragment(input.compiler_syntax_tree.root)?;

    let o = &mut context.out;
    let mut body = Vec::new();
    if an.needs_context {
        let props = o.identifier("$$props");
        let t = o.write_boolean(true, SourceLocation::SYNTHETIC);
        let push = o.runtime("$", "push", &[props, t]);
        body.push(o.expression_statement(push));
    }
    body.extend(instance);
    body.extend(template);
    if an.needs_context {
        let pop = o.runtime("$", "pop", &[]);
        body.push(o.expression_statement(pop));
    }
    let mut parameters = vec![o.identifier("$$anchor")];
    if res.uses_props || an.needs_context {
        parameters.push(o.identifier("$$props"));
    }
    let block = o.block(&body, SourceLocation::SYNTHETIC);
    let name = o.identifier(&an.name);
    let func = o.function(
        true,
        Some(name),
        &parameters,
        block,
        false,
        SourceLocation::SYNTHETIC,
    );

    let mut program = Vec::new();
    let src1 = o.write_string("svelte/internal/disclose-version");
    program.push(o.import(&[], src1, false, SourceLocation::SYNTHETIC));
    let ns = o.identifier("$");
    let spec = o.import_namespace(ns, SourceLocation::SYNTHETIC);
    let src2 = o.write_string("svelte/internal/client");
    program.push(o.import(&[spec], src2, false, SourceLocation::SYNTHETIC));
    program.extend(context.hoisted.iter().copied());
    let o = &mut context.out;
    program.push(o.export_default(func, SourceLocation::SYNTHETIC));
    if !context.events.is_empty() {
        let names: Vec<NodeIdentifier> = context.events.iter().map(|e| o.write_string(e)).collect();
        let arr = o.array(&names, SourceLocation::SYNTHETIC);
        let d = o.runtime("$", "delegate", &[arr]);
        program.push(o.expression_statement(d));
    }
    let root = o.program(&program, SourceLocation::SYNTHETIC);
    Ok((context.out, root))
}

impl<'a> ClientCompilationContext<'a> {
    fn expression(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        let mut rw = ScriptRewrite {
            target: Target::Client,
            res: self.res,
            source_text: self.source_text,
            each: Some(&self.each),
        };
        copy(self.javascript, &mut self.out, &mut rw, e)
    }

    /// `b.thunk`: `() => e`, or `f` for `() => f()`.
    fn thunk(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        let arrow = self
            .out
            .arrow(&[], e, true, false, SourceLocation::SYNTHETIC);
        self.unthunk(arrow)
    }

    /// `b.unthunk`: `(a, b) => f(a, b)` is `f`.
    fn unthunk(&self, arrow: NodeIdentifier) -> NodeIdentifier {
        let o = &self.out;
        let Kind::Arrow {
            parameters,
            body,
            expression_body: true,
            is_async: false,
            ..
        } = o.kind(arrow)
        else {
            return arrow;
        };
        let Kind::Call {
            callee,
            arguments,
            optional: false,
            ..
        } = o.kind(body)
        else {
            return arrow;
        };
        let same = matches!(o.kind(callee), Kind::Identifier(_))
            && parameters.len() == arguments.len()
            && parameters.iter().zip(arguments).all(|(&p, &a)| {
                matches!(o.kind(p), Kind::Identifier(_))
                    && matches!(o.kind(a), Kind::Identifier(_))
                    && o.name(p) == o.name(a)
            });
        if same { callee } else { arrow }
    }

    /// `b.call` drops trailing missing arguments and turns inner ones into `void 0`.
    fn call(&mut self, method: &str, arguments: Vec<Option<NodeIdentifier>>) -> NodeIdentifier {
        runtime_call(&mut self.out, method, arguments)
    }

    fn statement(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        self.out.expression_statement(e)
    }

    fn var(&mut self, name: &str, initializer: NodeIdentifier) -> NodeIdentifier {
        let identifier = self.out.identifier(name);
        self.out.let_(flag::VAR, identifier, Some(initializer))
    }

    fn write_number(&mut self, v: u32) -> NodeIdentifier {
        self.out
            .write_number(f64::from(v), SourceLocation::SYNTHETIC)
    }

    fn tru(&mut self) -> NodeIdentifier {
        self.out.write_boolean(true, SourceLocation::SYNTHETIC)
    }

    fn is_static_element(&self, identifier: CompilerNodeIdentifier) -> bool {
        let NodeKind::Element(el) = &self.compiler_syntax_tree.node(identifier).kind else {
            return false;
        };
        if self.an.dynamic[identifier] {
            return false;
        }
        let tag = el.name.text(self.source_text);
        if tag.contains('-') {
            return false;
        }
        for a in self.compiler_syntax_tree.attributes(el.attributes) {
            let n = a.name.text(self.source_text);
            if event_attribute(self.source_text, a).is_some()
                || super::cannot_be_set_statically(n)
                || n == "dir"
            {
                return false;
            }
            if matches!(tag, "input" | "textarea" | "select") && matches!(n, "value" | "checked") {
                return false;
            }
            if tag == "option" && n == "value" {
                return false;
            }
            if !matches!(a.value, AttributeValue::Boolean | AttributeValue::Static(_)) {
                return false;
            }
        }
        true
    }

    fn memoize(
        &mut self,
        frag: &mut Frag,
        value: NodeIdentifier,
        meta: ExpressionMetadata,
    ) -> NodeIdentifier {
        if !meta.has_call {
            return value;
        }
        let identifier = self.out.identifier(&format!("${}", frag.memo.len()));
        frag.memo.push(value);
        identifier
    }

    /// Upstream `Fragment` visitor: the statements of one block.
    fn fragment(
        &mut self,
        children: rsvelte_svelte::compilation::compiler_syntax_tree::Children,
    ) -> R<Vec<NodeIdentifier>> {
        let cleaned = self.plan.fragment(children);
        let items = &cleaned.items;
        if items.is_empty() {
            return Ok(Vec::new());
        }
        let mut frag = Frag::default();
        let mut l = Lists::default();
        let close;

        let single_element = match items.as_slice() {
            [Item::Node(identifier)] => match &self.compiler_syntax_tree.node(*identifier).kind {
                NodeKind::Element(e) => Some((*identifier, e.name)),
                _ => None,
            },
            _ => None,
        };
        if let Some((el, name)) = single_element {
            let identifier = self.names.generate(name.text(self.source_text));
            self.element(el, &identifier, &mut frag, &mut l)?;
            let flags = if frag.tpl.needs_import_node {
                TEMPLATE_USE_IMPORT_NODE
            } else {
                0
            };
            let callee = self.transform_template(&frag.tpl, "root", flags);
            let call = self.out.call0(callee, &[]);
            let declaration = self.var(&identifier, call);
            l.initializer.insert(0, declaration);
            close = self.append(&identifier);
        } else if let [Item::Text { data, .. }] = items.as_slice() {
            let identifier = self.names.generate("text");
            let s = self.out.write_string(data);
            let call = self.call("text", vec![Some(s)]);
            let declaration = self.var(&identifier, call);
            l.initializer.insert(0, declaration);
            close = self.append(&identifier);
        } else {
            let identifier = self.names.generate("fragment");
            let use_space_template = items.iter().any(|i| matches!(i, Item::Expression(_)))
                && items
                    .iter()
                    .all(|i| matches!(i, Item::Text { .. } | Item::Expression(_)));
            if use_space_template {
                let text = self.names.generate("text");
                self.process_children(
                    items,
                    Prev::Identifier(text.clone()),
                    false,
                    &mut frag,
                    &mut l,
                )?;
                let call = self.call("text", vec![]);
                let declaration = self.var(&text, call);
                l.initializer.insert(0, declaration);
                close = self.append(&text);
            } else {
                self.process_children(
                    items,
                    Prev::Call {
                        method: "first_child",
                        of: identifier.clone(),
                    },
                    false,
                    &mut frag,
                    &mut l,
                )?;
                let mut flags = TEMPLATE_FRAGMENT;
                if frag.tpl.needs_import_node {
                    flags |= TEMPLATE_USE_IMPORT_NODE;
                }
                let callee = self.transform_template(&frag.tpl, "root", flags);
                let call = self.out.call0(callee, &[]);
                let declaration = self.var(&identifier, call);
                l.initializer.insert(0, declaration);
                close = self.append(&identifier);
            }
        }

        let mut body = Vec::new();
        if cleaned.text_first {
            let next = self.call("next", vec![]);
            body.push(self.statement(next));
        }
        body.append(&mut l.initializer);
        if !l.update.is_empty() {
            let effect = self.render_statement(&mut frag, &std::mem::take(&mut l.update));
            body.push(effect);
        }
        body.append(&mut l.after);
        body.push(close);
        Ok(body)
    }

    fn append(&mut self, identifier: &str) -> NodeIdentifier {
        let anchor = self.out.identifier("$$anchor");
        let x = self.out.identifier(identifier);
        let call = self.call("append", vec![Some(anchor), Some(x)]);
        self.statement(call)
    }

    /// Upstream `build_render_statement`.
    fn render_statement(&mut self, frag: &mut Frag, update: &[NodeIdentifier]) -> NodeIdentifier {
        let identifiers: Vec<NodeIdentifier> = (0..frag.memo.len())
            .map(|i| self.out.identifier(&format!("${i}")))
            .collect();
        let single = match update {
            [s] => match self.out.kind(*s) {
                Kind::ExpressionStatement(e) => Some(e),
                _ => None,
            },
            _ => None,
        };
        let body = if let Some(e) = single {
            self.out
                .arrow(&identifiers, e, true, false, SourceLocation::SYNTHETIC)
        } else {
            let b = self.out.block(update, SourceLocation::SYNTHETIC);
            self.out
                .arrow(&identifiers, b, false, false, SourceLocation::SYNTHETIC)
        };
        let values = if frag.memo.is_empty() {
            None
        } else {
            let memo = std::mem::take(&mut frag.memo);
            let thunks: Vec<NodeIdentifier> = memo
                .into_iter()
                .map(|m| {
                    self.out
                        .arrow(&[], m, true, false, SourceLocation::SYNTHETIC)
                })
                .collect();
            Some(self.out.array(&thunks, SourceLocation::SYNTHETIC))
        };
        let call = self.call("template_effect", vec![Some(body), values]);
        self.statement(call)
    }

    /// Upstream `transform_template`: hoists `var root = $.from_html(…)` (shared by identical
    /// templates) and returns the callee that builds the fragment.
    fn transform_template(&mut self, tpl: &Template, name: &str, flags: u32) -> NodeIdentifier {
        if tpl.is_lone_comment() {
            let ns = self.out.identifier("$");
            return self.out.dot(ns, "comment");
        }
        let markup = tpl.markup();
        let key = format!("html {flags} {markup}");
        if let Some(existing) = self.templates.get(&key) {
            let existing = existing.clone();
            return self.out.identifier(&existing);
        }
        let raw = sanitize_template_string(&markup).into_owned();
        let q = self.out.template_element(&raw, true);
        let t = self.out.template(&[q], &[], SourceLocation::SYNTHETIC);
        let flags_arg = (flags != 0).then(|| self.write_number(flags));
        let call = self.call("from_html", vec![Some(t), flags_arg]);
        let identifier = self.names.unique(name);
        let declaration = self.var(&identifier, call);
        self.hoisted.push(declaration);
        self.templates.insert(key, identifier.clone());
        self.out.identifier(&identifier)
    }

    /// Upstream `process_children`.
    fn process_children(
        &mut self,
        items: &[Item<'_>],
        initial: Prev,
        is_element: bool,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let mut st = Walk {
            prev: initial,
            skipped: 0,
        };
        let mut sequence: Vec<Item<'_>> = Vec::new();
        for item in items {
            if matches!(item, Item::Text { .. } | Item::Expression(_)) {
                sequence.push(item.clone());
                continue;
            }
            if !sequence.is_empty() {
                self.flush_sequence(&std::mem::take(&mut sequence), &mut st, frag, l);
            }
            let Item::Node(identifier) = item else {
                unreachable!("text is part of a sequence")
            };
            let identifier = *identifier;
            if self.is_static_element(identifier) {
                st.skipped += 1;
                self.visit(identifier, &st.prev_name(), frag, l)?;
            } else if is_element
                && items.len() == 1
                && matches!(
                    self.compiler_syntax_tree.node(identifier).kind,
                    NodeKind::Each(_)
                )
            {
                // Upstream's `is_controlled`: the element is the block's anchor.
                self.each_block(identifier, &st.prev_name(), true, frag, l)?;
            } else {
                let name = match &self.compiler_syntax_tree.node(identifier).kind {
                    NodeKind::Element(el) => el.name.text(self.source_text).to_owned(),
                    _ => "node".to_owned(),
                };
                let node = self.flush_node(&mut st, false, &name, l);
                self.visit(identifier, &node, frag, l)?;
            }
        }
        if !sequence.is_empty() {
            self.flush_sequence(&sequence, &mut st, frag, l);
        }
        if st.skipped > 1 {
            st.skipped -= 1;
            let n = (st.skipped != 1).then(|| self.write_number(st.skipped));
            let call = self.call("next", vec![n]);
            l.initializer.push(self.statement(call));
        }
        Ok(())
    }

    fn prev_expression(&mut self, prev: &Prev, is_text: bool) -> NodeIdentifier {
        match prev {
            Prev::Identifier(name) => self.out.identifier(name),
            Prev::Call { method, of } => {
                let x = self.out.identifier(of);
                let t = is_text.then(|| self.tru());
                self.call(method, vec![Some(x), t])
            }
        }
    }

    fn get_node(&mut self, st: &Walk, is_text: bool) -> NodeIdentifier {
        if st.skipped == 0 {
            return self.prev_expression(&st.prev, is_text);
        }
        let p = self.prev_expression(&st.prev, false);
        let n = (is_text || st.skipped != 1).then(|| self.write_number(st.skipped));
        let t = is_text.then(|| self.tru());
        self.call("sibling", vec![Some(p), n, t])
    }

    fn flush_node(&mut self, st: &mut Walk, is_text: bool, name: &str, l: &mut Lists) -> String {
        let expression = self.get_node(st, is_text);
        let identifier = if let Kind::Identifier(_) = self.out.kind(expression) {
            self.out.name(expression).to_owned()
        } else {
            let identifier = self.names.generate(name);
            let declaration = self.var(&identifier, expression);
            l.initializer.push(declaration);
            identifier
        };
        st.prev = Prev::Identifier(identifier.clone());
        st.skipped = 1;
        identifier
    }

    fn flush_sequence(&mut self, seq: &[Item<'_>], st: &mut Walk, frag: &mut Frag, l: &mut Lists) {
        if seq.iter().all(|i| matches!(i, Item::Text { .. })) {
            st.skipped += 1;
            let raw: String = seq
                .iter()
                .map(|i| match i {
                    Item::Text { raw, .. } => raw.as_ref(),
                    _ => unreachable!("all text"),
                })
                .collect();
            frag.tpl.push_text(raw);
            return;
        }
        frag.tpl.push_text(" ".into());
        let (value, has_state) = self.template_chunk(seq, frag);
        let identifier = self.flush_node(st, seq.len() == 1, "text", l);
        let x = self.out.identifier(&identifier);
        if has_state {
            let call = self.call("set_text", vec![Some(x), Some(value)]);
            l.update.push(self.statement(call));
        } else {
            let target = self.out.dot(x, "nodeValue");
            let assign = self.out.assign(
                AssignmentOperator::Assign,
                target,
                value,
                SourceLocation::SYNTHETIC,
            );
            l.initializer.push(self.statement(assign));
        }
    }

    /// Upstream `build_template_chunk`.
    fn template_chunk(&mut self, values: &[Item<'_>], frag: &mut Frag) -> (NodeIdentifier, bool) {
        let mut quasis: Vec<String> = vec![String::new()];
        let mut expressions: Vec<NodeIdentifier> = Vec::new();
        let mut has_state = false;
        for item in values {
            let expression = match item {
                Item::Text { data, .. } => {
                    quasis.last_mut().expect("never empty").push_str(data);
                    continue;
                }
                Item::Expression(e) => *e,
                Item::Node(_) => unreachable!("sequences hold text and expression tags"),
            };
            let javascript = self.javascript;
            match javascript.kind(expression) {
                Kind::String | Kind::Number(_) | Kind::Boolean(_) | Kind::Null => {
                    if !matches!(javascript.kind(expression), Kind::Null) {
                        let v = self
                            .res
                            .evaluate(javascript, self.source_text, expression)
                            .value
                            .to_javascript_string();
                        quasis.last_mut().expect("never empty").push_str(&v);
                    }
                    continue;
                }
                Kind::Identifier(_)
                    if javascript.name(expression) == "undefined"
                        && self.res.binding(expression).is_none() =>
                {
                    continue;
                }
                _ => {}
            }
            let meta = self.an.meta(expression);
            let built = self.expression(expression);
            let mut value = self.memoize(frag, built, meta);
            let evaluated = self.res.evaluate_output(
                javascript,
                self.source_text,
                &self.out,
                value,
                self.scope,
            );
            let known = evaluated.is_known.then_some(&evaluated);
            has_state |= meta.has_state && known.is_none();
            if values.len() == 1 {
                if let Some(k) = known {
                    let s = Self::template_string(&k.value);
                    value = self.out.write_string(&s);
                }
                return (value, has_state);
            }
            if let Kind::Logical(op @ (LogicalOperator::Nullish | LogicalOperator::Or), l, r) =
                self.out.kind(value)
                && matches!(self.out.kind(r), Kind::Null)
            {
                let empty = self.out.write_string("");
                value = self
                    .out
                    .logical(op, l, empty, self.out.source_location(value));
            }
            if let Some(k) = known {
                let s = Self::template_string(&k.value);
                quasis.last_mut().expect("never empty").push_str(&s);
            } else {
                if !evaluated.is_defined {
                    let empty = self.out.write_string("");
                    value = self.out.logical(
                        LogicalOperator::Nullish,
                        value,
                        empty,
                        SourceLocation::SYNTHETIC,
                    );
                }
                expressions.push(value);
                quasis.push(String::new());
            }
        }
        if expressions.is_empty() {
            let s = quasis.pop().expect("never empty");
            return (self.out.write_string(&s), has_state);
        }
        let n = quasis.len();
        let elements: Vec<NodeIdentifier> = quasis
            .iter()
            .enumerate()
            .map(|(i, q)| {
                self.out
                    .template_element(&sanitize_template_string(q), i + 1 == n)
            })
            .collect();
        (
            self.out
                .template(&elements, &expressions, SourceLocation::SYNTHETIC),
            has_state,
        )
    }

    fn template_string(value: &rsvelte_svelte::semantic::evaluate::Value) -> String {
        match value {
            rsvelte_svelte::semantic::evaluate::Value::Null
            | rsvelte_svelte::semantic::evaluate::Value::Undefined => String::new(),
            value => value.to_javascript_string(),
        }
    }

    fn visit(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        match self.compiler_syntax_tree.node(identifier).kind {
            NodeKind::Element(_) => self.element(identifier, node, frag, l),
            NodeKind::If { .. } => self.if_block(identifier, node, frag, l),
            NodeKind::Each(_) => self.each_block(identifier, node, false, frag, l),
            _ => unreachable!("clean_nodes keeps only elements and blocks as nodes"),
        }
    }

    /// Upstream `RegularElement`.
    fn element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        if el.kind != ElementKind::Regular {
            return unsupported("components, `<slot>` and `svelte:` elements", el.name);
        }
        let tag = el.name.text(self.source_text).to_ascii_lowercase();
        if matches!(
            tag.as_str(),
            "svg" | "math" | "script" | "textarea" | "template"
        ) || tag.contains('-')
        {
            return unsupported(&format!("`<{tag}>`"), el.name);
        }
        if is_customizable_select(compiler_syntax_tree, self.source_text, &tag, el) {
            return unsupported(&format!("rich content in `<{tag}>`"), el.name);
        }
        check_foreign_element(self.source_text, el.name)?;
        frag.tpl.push_element(&tag);
        if tag == "noscript" {
            frag.tpl.pop_element();
            return Ok(());
        }
        frag.tpl.needs_import_node |= tag == "video";

        let attribute_list = compiler_syntax_tree.attributes(el.attributes);
        // Upstream visits directives into their own lists, which follow the children's.
        let mut directives = self.element_directives(attribute_list, &tag, node)?;
        let has_spread = attribute_list
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Spread(_)));
        // Upstream compares the name as written.
        let remove_defaults = el.name.text(self.source_text) == "input"
            && self.remove_input_defaults(attribute_list, has_spread, node, l);
        if has_spread {
            self.attribute_effect(identifier, &tag, attribute_list, node, remove_defaults, l);
        } else {
            self.element_attributes(identifier, &tag, attribute_list, node, frag, l)?;
        }
        let load_error_events = attribute_list.iter().any(|a| {
            !is_directive(&a.value) && matches!(a.name.text(self.source_text), "onload" | "onerror")
        });
        if is_load_error_element(&tag) && (has_spread || load_error_events) {
            let x = self.out.identifier(node);
            let call = self.call("replay_events", vec![Some(x)]);
            l.after.push(self.statement(call));
        }

        let mut child = self.element_children(identifier, node, frag)?;
        if self.an.dynamic[identifier] {
            l.initializer.append(&mut child.initializer);
            l.update.append(&mut child.update);
            l.after.append(&mut child.after);
        }
        l.initializer.append(&mut directives.initializer);
        l.after.append(&mut directives.after);
        if !has_spread {
            self.select_value(el, &tag, attribute_list, node, frag, l);
        }
        frag.tpl.pop_element();
        Ok(())
    }

    /// The tail of upstream `RegularElement` for `<option>` and `<select>`: the value goes to the
    /// hidden `__value` once the children exist, then a `<select>` picks its option.
    fn select_value(
        &mut self,
        el: &Element,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) {
        if !matches!(tag, "option" | "select") {
            return;
        }
        let source_text = self.source_text;
        let value_attribute = attributes
            .iter()
            .find(|a| !is_directive(&a.value) && a.name.text(source_text) == "value");
        if let Some(e) = synthetic_value(self.compiler_syntax_tree, source_text, tag, el) {
            let meta = self.an.meta(e);
            let built = self.expression(e);
            let value = self.memoize(frag, built, meta);
            self.special_value(tag, node, (value, meta.has_state), false, true, l);
        } else if let Some(a) = value_attribute {
            let built = self.attribute_value(a, frag);
            let dynamic = !matches!(a.value, AttributeValue::Boolean | AttributeValue::Static(_));
            self.special_value(tag, node, built, tag == "select" && dynamic, false, l);
        }
        if tag != "select" {
            return;
        }
        let default_value = attributes.iter().find(|a| {
            !is_directive(&a.value)
                && normalize_attribute(a.name.text(source_text)) == "defaultValue"
        });
        if let Some(a) = default_value {
            let (value, has_state) = self.attribute_value(a, frag);
            let x = self.out.identifier(node);
            let call = self.call("set_default_select_value", vec![Some(x), Some(value)]);
            let s = self.statement(call);
            if has_state {
                l.update.push(s);
            } else {
                l.initializer.push(s);
            }
        }
        let dynamic_value = value_attribute.is_some_and(|a| {
            !matches!(a.value, AttributeValue::Boolean | AttributeValue::Static(_))
        });
        let bound = attributes.iter().any(|a| {
            matches!(a.value, AttributeValue::Bind(_)) && a.name.text(source_text) == "value"
        });
        if default_value.is_some() || dynamic_value || bound {
            let x = self.out.identifier(node);
            let call = self.call("init_select", vec![Some(x)]);
            l.initializer.push(self.statement(call));
        }
    }

    /// Upstream `build_element_special_value_attribute`.
    fn special_value(
        &mut self,
        tag: &str,
        node: &str,
        (value, has_state): (NodeIdentifier, bool),
        select_with_value: bool,
        synthetic: bool,
        l: &mut Lists,
    ) {
        let defined = self
            .res
            .evaluate_output(
                self.javascript,
                self.source_text,
                &self.out,
                value,
                self.scope,
            )
            .is_defined;
        let build_update = |context: &mut Self, v: NodeIdentifier| {
            let x = context.out.identifier(node);
            let hidden = context.out.dot(x, "__value");
            let assignment = context.out.assign(
                AssignmentOperator::Assign,
                hidden,
                v,
                SourceLocation::SYNTHETIC,
            );
            let set_value = |context: &mut Self| {
                let rhs = if defined {
                    assignment
                } else {
                    let empty = context.out.write_string("");
                    context.out.logical(
                        LogicalOperator::Nullish,
                        assignment,
                        empty,
                        SourceLocation::SYNTHETIC,
                    )
                };
                let x = context.out.identifier(node);
                let target = context.out.dot(x, "value");
                context.out.assign(
                    AssignmentOperator::Assign,
                    target,
                    rhs,
                    SourceLocation::SYNTHETIC,
                )
            };
            let e = if select_with_value {
                let set = set_value(context);
                let x = context.out.identifier(node);
                let select = context.call("select_option", vec![Some(x), Some(v)]);
                context.out.seq(&[set, select], SourceLocation::SYNTHETIC)
            } else if synthetic {
                assignment
            } else {
                set_value(context)
            };
            context.statement(e)
        };
        if has_state {
            let identifier = self.names.generate(&format!("{node}_value"));
            let initializer =
                (tag == "option").then(|| self.out.object(&[], SourceLocation::SYNTHETIC));
            let target = self.out.identifier(&identifier);
            l.initializer
                .push(self.out.let_(flag::VAR, target, initializer));
            let read = self.out.identifier(&identifier);
            let target = self.out.identifier(&identifier);
            let assign = self.out.assign(
                AssignmentOperator::Assign,
                target,
                value,
                SourceLocation::SYNTHETIC,
            );
            let test = self.out.binary(
                BinaryOperator::StrictNotEq,
                read,
                assign,
                SourceLocation::SYNTHETIC,
            );
            let v = self.out.identifier(&identifier);
            let update = build_update(self, v);
            let block = self.out.block(&[update], SourceLocation::SYNTHETIC);
            l.update
                .push(self.out.if_(test, block, None, SourceLocation::SYNTHETIC));
        } else {
            let s = build_update(self, value);
            l.initializer.push(s);
        }
    }

    /// The directives of upstream `RegularElement`'s `other_directives`, in attribute order.
    fn element_directives(&mut self, attributes: &[Attribute], tag: &str, node: &str) -> R<Lists> {
        let mut directives = Lists::default();
        for a in attributes {
            match a.value {
                AttributeValue::Bind(_) => {
                    let call = self.binding(a, tag, attributes, node)?;
                    directives.after.push(self.statement(call));
                }
                AttributeValue::Attach(e) => {
                    let call = self.attach(e, node);
                    directives.initializer.push(self.statement(call));
                }
                _ => {}
            }
        }
        Ok(directives)
    }

    /// Upstream's `$.remove_input_defaults` condition for an `<input>`; a binding is named by its
    /// property, so `bind:value` counts as a dynamic `value`. With a spread the runtime's
    /// `attribute_effect` removes them: returns whether it must.
    fn remove_input_defaults(
        &mut self,
        attributes: &[Attribute],
        has_spread: bool,
        node: &str,
        l: &mut Lists,
    ) -> bool {
        let source_text = self.source_text;
        let has_value = attributes.iter().any(|a| {
            matches!(a.name.text(source_text), "value" | "checked")
                && !matches!(
                    a.value,
                    AttributeValue::Static(_) | AttributeValue::Class(_)
                )
        });
        let has_default_value = attributes.iter().any(|a| {
            !is_directive(&a.value)
                && matches!(a.name.text(source_text), "defaultValue" | "defaultChecked")
        });
        if has_default_value || !(has_spread || has_value) {
            return false;
        }
        if has_spread {
            return true;
        }
        let x = self.out.identifier(node);
        let call = self.call("remove_input_defaults", vec![Some(x)]);
        l.initializer.push(self.statement(call));
        false
    }

    /// Upstream `build_attribute_effect`: every attribute and spread, in order, as one object the
    /// runtime diffs, with its own memoized values.
    fn attribute_effect(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
        remove_defaults: bool,
        l: &mut Lists,
    ) {
        let mut memo = Frag::default();
        let mut values = Vec::with_capacity(attributes.len());
        let mut class_directives = Vec::new();
        for a in attributes {
            match a.value {
                AttributeValue::Bind(_) | AttributeValue::Attach(_) => continue,
                AttributeValue::Class(_) => {
                    class_directives.push(a);
                    continue;
                }
                AttributeValue::Spread(e) => {
                    let meta = self.an.meta(e);
                    let built = self.expression(e);
                    let v = self.memoize(&mut memo, built, meta);
                    values.push(self.out.spread(v, SourceLocation::SYNTHETIC));
                    continue;
                }
                _ => {}
            }
            let (value, _) = self.attribute_value(a, &mut memo);
            let raw_name = a.name.text(self.source_text);
            if event_attribute(self.source_text, a).is_some()
                && matches!(
                    self.out.kind(value),
                    Kind::Arrow { .. } | Kind::Function { .. }
                )
            {
                // A stable handler, so the runtime does not remove and re-add it on every update.
                let handler = self.names.generate("event_handler");
                l.initializer.push(self.var(&handler, value));
                let x = self.out.identifier(&handler);
                values.push(init_property(&mut self.out, raw_name, x));
            } else {
                let name = if tag == "select" && normalize_attribute(raw_name) == "defaultValue" {
                    "defaultValue"
                } else {
                    raw_name
                };
                values.push(init_property(&mut self.out, name, value));
            }
        }
        if !class_directives.is_empty() {
            let props: Vec<NodeIdentifier> = class_directives
                .iter()
                .map(|d| {
                    let AttributeValue::Class(e) = d.value else {
                        unreachable!("class directives")
                    };
                    let meta = self.an.meta(e);
                    let built = self.expression(e);
                    let v = self.memoize(&mut memo, built, meta);
                    init_property(&mut self.out, d.name.text(self.source_text), v)
                })
                .collect();
            let object = self.out.object(&props, SourceLocation::SYNTHETIC);
            let ns = self.out.identifier("$");
            let key = self.out.dot(ns, "CLASS");
            values.push(
                self.out
                    .property(key, object, flag::COMPUTED, SourceLocation::SYNTHETIC),
            );
        }
        let identifiers: Vec<NodeIdentifier> = (0..memo.memo.len())
            .map(|i| self.out.identifier(&format!("${i}")))
            .collect();
        let object = self.out.object(&values, SourceLocation::SYNTHETIC);
        let arrow = self
            .out
            .arrow(&identifiers, object, true, false, SourceLocation::SYNTHETIC);
        let sync = (!memo.memo.is_empty()).then(|| {
            let thunks: Vec<NodeIdentifier> = std::mem::take(&mut memo.memo)
                .into_iter()
                .map(|m| {
                    self.out
                        .arrow(&[], m, true, false, SourceLocation::SYNTHETIC)
                })
                .collect();
            self.out.array(&thunks, SourceLocation::SYNTHETIC)
        });
        let hash = if self.an.scoped[identifier] {
            self.an.stylesheet_hash.clone()
        } else {
            None
        };
        let hash = hash.map(|h| self.out.write_string(&h));
        let remove = remove_defaults.then(|| self.tru());
        let x = self.out.identifier(node);
        let call = self.call(
            "attribute_effect",
            vec![Some(x), Some(arrow), sync, None, None, hash, remove],
        );
        l.initializer.push(self.statement(call));
    }

    /// The attribute loop of upstream `RegularElement` (no spread).
    fn element_attributes(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let class_directives: Vec<&Attribute> = attributes
            .iter()
            .filter(|a| matches!(a.value, AttributeValue::Class(_)))
            .collect();
        for a in attributes {
            if let AttributeValue::Bind(_) | AttributeValue::Attach(_) | AttributeValue::Class(_) =
                a.value
            {
                continue;
            }
            let raw_name = a.name.text(self.source_text);
            if let Some(handler) = event_attribute(self.source_text, a) {
                self.event(raw_name, handler, node, l);
                continue;
            }
            let attribute_name = normalize_attribute(raw_name);
            // `select_value` sets these once the options exist.
            if (matches!(tag, "option" | "select") && raw_name == "value")
                || (tag == "select" && attribute_name == "defaultValue")
            {
                continue;
            }
            let literal = match &a.value {
                AttributeValue::Boolean => Some(None),
                AttributeValue::Static(v) => Some(Some(v.to_string())),
                _ => None,
            };
            if !super::cannot_be_set_statically(raw_name)
                && (attribute_name != "class" || class_directives.is_empty())
                && let Some(value) = literal
            {
                self.static_attribute(frag, identifier, raw_name, &attribute_name, value);
            } else if attribute_name == "class" {
                self.set_class(identifier, node, Some(a), &class_directives, frag, l);
            } else if attribute_name == "autofocus" || attribute_name == "style" {
                return unsupported(&format!("a dynamic `{attribute_name}` attribute"), a.span);
            } else {
                let (value, has_state) = self.attribute_value(a, frag);
                let update = self.attribute_update(node, &attribute_name, value);
                let s = self.statement(update);
                if has_state {
                    l.update.push(s);
                } else {
                    l.initializer.push(s);
                }
            }
        }
        // Upstream's analysis appends `class=""` to such an element.
        let has_class = attributes.iter().any(|a| {
            !matches!(a.value, AttributeValue::Class(_))
                && a.name.text(self.source_text).eq_ignore_ascii_case("class")
        });
        if !has_class && !class_directives.is_empty() {
            self.set_class(identifier, node, None, &class_directives, frag, l);
        } else if !has_class && self.an.scoped[identifier] {
            self.static_attribute(frag, identifier, "class", "class", Some(String::new()));
        }
        Ok(())
    }

    /// A `class` value written as one expression, through `$.clsx` when upstream's `needs_clsx`.
    fn class_expression(
        &mut self,
        expression: NodeIdentifier,
        unquoted: bool,
        frag: &mut Frag,
    ) -> (NodeIdentifier, bool) {
        let meta = self.an.meta(expression);
        let mut built = self.expression(expression);
        if unquoted && needs_clsx(self.javascript, expression) {
            built = self.call("clsx", vec![Some(built)]);
        }
        (self.memoize(frag, built, meta), meta.has_state)
    }

    /// Upstream `build_set_class`; `attribute` is `None` for the empty `class` upstream's analysis
    /// adds.
    fn set_class(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        attribute: Option<&Attribute>,
        directives: &[&Attribute],
        frag: &mut Frag,
        l: &mut Lists,
    ) {
        let (mut value, mut has_state) = match attribute.map(|a| &a.value) {
            None => (self.out.write_string(""), false),
            Some(&AttributeValue::Expression { expression, quoted }) => {
                self.class_expression(expression, !quoted, frag)
            }
            Some(&AttributeValue::Shorthand(expression)) => {
                self.class_expression(expression, true, frag)
            }
            Some(_) => self.attribute_value(attribute.expect("matched above"), frag),
        };
        let mut prev = None;
        let mut next = None;
        let mut previous_id = None;
        if !directives.is_empty() {
            let mut props = Vec::with_capacity(directives.len());
            for d in directives {
                let AttributeValue::Class(e) = d.value else {
                    unreachable!("class directives")
                };
                let meta = self.an.meta(e);
                let built = self.expression(e);
                let v = self.memoize(frag, built, meta);
                has_state |= meta.has_state;
                props.push(init_property(
                    &mut self.out,
                    d.name.text(self.source_text),
                    v,
                ));
            }
            next = Some(self.out.object(&props, SourceLocation::SYNTHETIC));
            if has_state {
                let name = self.names.generate("classes");
                let x = self.out.identifier(&name);
                l.initializer.push(self.out.let_(flag::LET, x, None));
                prev = Some(self.out.identifier(&name));
                previous_id = Some(name);
            } else {
                prev = Some(self.out.object(&[], SourceLocation::SYNTHETIC));
            }
        }
        let mut stylesheet_hash = None;
        if self.an.scoped[identifier]
            && let Some(hash) = self.an.stylesheet_hash.clone()
        {
            let literal = match self.out.kind(value) {
                Kind::String => Some(self.out.str_value(value, self.source_text).to_owned()),
                Kind::Null => Some(String::new()),
                _ => None,
            };
            match literal {
                Some(v) if v.is_empty() => value = self.out.write_string(&hash),
                Some(v) => {
                    value = self
                        .out
                        .write_string(&format!("{} {hash}", escape_markup(&v, true)));
                }
                None => stylesheet_hash = Some(self.out.write_string(&hash)),
            }
        }
        if stylesheet_hash.is_none() && next.is_some() {
            stylesheet_hash = Some(self.out.null(SourceLocation::SYNTHETIC));
        }
        let x = self.out.identifier(node);
        let is_markup = self.write_number(1);
        let mut set_class = self.call(
            "set_class",
            vec![
                Some(x),
                Some(is_markup),
                Some(value),
                stylesheet_hash,
                prev,
                next,
            ],
        );
        if let Some(name) = previous_id {
            let target = self.out.identifier(&name);
            set_class = self.out.assign(
                AssignmentOperator::Assign,
                target,
                set_class,
                SourceLocation::SYNTHETIC,
            );
        }
        let s = self.statement(set_class);
        if has_state {
            l.update.push(s);
        } else {
            l.initializer.push(s);
        }
    }

    /// The children half of upstream `RegularElement`, under the element's whitespace rule.
    fn element_children(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
    ) -> R<Lists> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        let cleaned = self.plan.fragment(el.children);
        let items = &cleaned.items;
        let mut child = Lists::default();
        let use_text_content = items.iter().all(|i| match i {
            Item::Text { .. } => true,
            Item::Expression(e) => !self.an.meta(*e).has_state,
            Item::Node(_) => false,
        }) && items.iter().any(|i| matches!(i, Item::Expression(_)));
        if use_text_content {
            let (value, _) = self.template_chunk(items, frag);
            let empty = matches!(self.out.kind(value), Kind::String)
                && self.out.str_value(value, self.source_text).is_empty();
            if !empty {
                let x = self.out.identifier(node);
                let target = self.out.dot(x, "textContent");
                let assign = self.out.assign(
                    AssignmentOperator::Assign,
                    target,
                    value,
                    SourceLocation::SYNTHETIC,
                );
                child.initializer.push(self.statement(assign));
            }
        } else {
            let needs_reset = items.iter().any(|i| match i {
                Item::Text { .. } => false,
                Item::Expression(_) => true,
                Item::Node(n) => !self.is_static_element(*n),
            });
            self.process_children(
                items,
                Prev::Call {
                    method: "child",
                    of: node.to_owned(),
                },
                true,
                frag,
                &mut child,
            )?;
            if needs_reset && !self.fold_reset_into_child(&mut child.initializer, node) {
                let x = self.out.identifier(node);
                let call = self.call("reset", vec![Some(x)]);
                child.initializer.push(self.statement(call));
            }
        }
        Ok(child)
    }

    /// Upstream `BindDirective` (client, non-dev) for the bindings [`check_binding`] admits.
    fn binding(
        &mut self,
        a: &Attribute,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
    ) -> R<NodeIdentifier> {
        let e = check_binding(
            self.javascript,
            self.res,
            self.source_text,
            tag,
            attributes,
            a,
        )?;
        let get = self.expression(e);
        let get = self.thunk(get);
        let value = self.out.identifier("$$value");
        let assignment = if let Kind::Identifier(_) = self.javascript.kind(e) {
            // An element binding's value is a primitive: upstream never proxies it.
            let x = self
                .out
                .ident(self.javascript.name(e), self.javascript.source_location(e));
            self.out.runtime("$", "set", &[x, value])
        } else {
            let target = self.expression(e);
            self.out.assign(
                AssignmentOperator::Assign,
                target,
                value,
                SourceLocation::SYNTHETIC,
            )
        };
        let param = self.out.identifier("$$value");
        let set = self
            .out
            .arrow(&[param], assignment, true, false, SourceLocation::SYNTHETIC);
        let set = self.unthunk(set);
        let x = self.out.identifier(node);
        let method = match a.name.text(self.source_text) {
            "value" if tag == "select" => "bind_select_value",
            "value" => "bind_value",
            "checked" => "bind_checked",
            p => unreachable!("`check_binding` admits no `bind:{p}`"),
        };
        Ok(self.call(method, vec![Some(x), Some(get), Some(set)]))
    }

    /// Upstream `AttachTag` (client).
    fn attach(&mut self, e: NodeIdentifier, node: &str) -> NodeIdentifier {
        let value = self.expression(e);
        let thunk = self.thunk(value);
        let x = self.out.identifier(node);
        self.call("attach", vec![Some(x), Some(thunk)])
    }

    fn static_attribute(
        &self,
        frag: &mut Frag,
        identifier: CompilerNodeIdentifier,
        raw_name: &str,
        attribute_name: &str,
        value: Option<String>,
    ) {
        let mut value = value;
        if attribute_name == "class"
            && self.an.scoped[identifier]
            && let Some(hash) = &self.an.stylesheet_hash
        {
            value = Some(match value.as_deref() {
                None | Some("") => hash.clone(),
                Some(v) => format!("{v} {hash}"),
            });
        }
        if attribute_name != "class"
            || value.as_deref().is_some_and(|v| !v.is_empty())
            || value.is_none()
        {
            frag.tpl.set_prop(raw_name, Some(value.unwrap_or_default()));
        }
    }

    /// Upstream `build_attribute_value` (client).
    fn attribute_value(&mut self, a: &Attribute, frag: &mut Frag) -> (NodeIdentifier, bool) {
        match &a.value {
            AttributeValue::Boolean => (self.tru(), false),
            AttributeValue::Static(v) => (self.out.write_string(v), false),
            &(AttributeValue::Expression { expression, .. }
            | AttributeValue::Shorthand(expression)) => {
                let meta = self.an.meta(expression);
                let built = self.expression(expression);
                (self.memoize(frag, built, meta), meta.has_state)
            }
            AttributeValue::Interpolated(parts) => {
                let items = self.chunk_items(parts);
                self.template_chunk(&items, frag)
            }
            AttributeValue::Bind(_)
            | AttributeValue::Attach(_)
            | AttributeValue::Class(_)
            | AttributeValue::Spread(_) => {
                unreachable!("directives are lowered by `element`")
            }
        }
    }

    fn chunk_items(&self, parts: &[Part]) -> Vec<Item<'a>> {
        parts
            .iter()
            .map(|p| match p {
                Part::Text(s) => {
                    let raw = s.text(self.source_text);
                    Item::Text {
                        data: decode_text(raw),
                        raw: raw.into(),
                    }
                }
                Part::Expression { expression, .. } => Item::Expression(*expression),
            })
            .collect()
    }

    /// Upstream `build_element_attribute_update`.
    fn attribute_update(
        &mut self,
        node: &str,
        name: &str,
        value: NodeIdentifier,
    ) -> NodeIdentifier {
        let x = self.out.identifier(node);
        match name {
            "muted" => {
                let target = self.out.dot(x, "muted");
                self.out.assign(
                    AssignmentOperator::Assign,
                    target,
                    value,
                    SourceLocation::SYNTHETIC,
                )
            }
            "value" => self.call("set_value", vec![Some(x), Some(value)]),
            "checked" => self.call("set_checked", vec![Some(x), Some(value)]),
            "selected" => self.call("set_selected", vec![Some(x), Some(value)]),
            _ if super::is_dom_property(name) => {
                let target = self.out.dot(x, name);
                self.out.assign(
                    AssignmentOperator::Assign,
                    target,
                    value,
                    SourceLocation::SYNTHETIC,
                )
            }
            _ => {
                let method = if name.starts_with("xlink") {
                    "set_xlink_attribute"
                } else {
                    "set_attribute"
                };
                let n = self.out.write_string(name);
                self.call(method, vec![Some(x), Some(n), Some(value)])
            }
        }
    }

    /// Upstream `fold_reset_into_child`: `var x = $.child(el)` + `$.reset(el)` →
    /// `$.only_child(el)`.
    fn fold_reset_into_child(&mut self, initializer: &mut [NodeIdentifier], node: &str) -> bool {
        let Some(&last) = initializer.last() else {
            return false;
        };
        let Kind::VariableDeclaration {
            declarations: [d],
            kind,
        } = self.out.kind(last)
        else {
            return false;
        };
        let d = *d;
        let Kind::Declarator {
            identifier,
            initializer: Some(call),
        } = self.out.kind(d)
        else {
            return false;
        };
        let Kind::Call {
            callee, arguments, ..
        } = self.out.kind(call)
        else {
            return false;
        };
        let is_child = matches!(
            self.out.kind(callee),
            Kind::Member { object, property, computed: false, .. }
                if self.out.name(object) == "$" && self.out.name(property) == "child"
        );
        let first_is_node = arguments.first().is_some_and(|&a| {
            matches!(self.out.kind(a), Kind::Identifier(_)) && self.out.name(a) == node
        });
        if !is_child || !first_is_node {
            return false;
        }
        let arguments = arguments.to_vec();
        let new_call = self.out.runtime("$", "only_child", &arguments);
        let declaration =
            self.out
                .declarator(identifier, Some(new_call), SourceLocation::SYNTHETIC);
        let var = self
            .out
            .var_declaration(kind, &[declaration], SourceLocation::SYNTHETIC);
        *initializer.last_mut().expect("checked above") = var;
        true
    }

    /// Upstream `visit_event_attribute` + `build_event` + `build_event_handler` (non-dev).
    fn event(&mut self, raw_name: &str, handler: NodeIdentifier, node: &str, l: &mut Lists) {
        let mut event_name = &raw_name[2..];
        let capture = if event_name.ends_with("capture")
            && event_name != "gotpointercapture"
            && event_name != "lostpointercapture"
        {
            event_name = &event_name[..event_name.len() - 7];
            true
        } else {
            false
        };
        let meta = self.an.meta(handler);
        let built = self.expression(handler);
        let handler_expression = match self.javascript.kind(handler) {
            Kind::Arrow { .. }
            | Kind::Function {
                declaration: false, ..
            } => built,
            Kind::Identifier(_)
                if self.res.binding(handler).is_none_or(|(b, _)| {
                    self.res.sem.bindings[b].kind
                        != rsvelte_typescript::scope::DeclarationKind::Import
                }) =>
            {
                built
            }
            _ => {
                let mut h = built;
                if meta.has_call {
                    let identifier = self.names.generate("event_handler");
                    let thunk = self
                        .out
                        .arrow(&[], h, true, false, SourceLocation::SYNTHETIC);
                    let derived = self.call("derived", vec![Some(thunk)]);
                    l.initializer.push(self.var(&identifier, derived));
                    let x = self.out.identifier(&identifier);
                    h = self.call("get", vec![Some(x)]);
                }
                let apply = self.out.ident("apply", SourceLocation::SYNTHETIC);
                let member = self
                    .out
                    .member(h, apply, false, true, SourceLocation::SYNTHETIC);
                let this = self.out.this(SourceLocation::SYNTHETIC);
                let arguments = self.out.identifier("$$args");
                let call =
                    self.out
                        .call(member, &[this, arguments], false, SourceLocation::SYNTHETIC);
                let s = self.statement(call);
                let body = self.out.block(&[s], SourceLocation::SYNTHETIC);
                let rest_identifier = self.out.identifier("$$args");
                let rest = self.out.rest(rest_identifier, SourceLocation::SYNTHETIC);
                self.out
                    .function(false, None, &[rest], body, false, SourceLocation::SYNTHETIC)
            }
        };
        let delegated = DELEGATED_EVENTS.contains(&event_name);
        if delegated && !self.events.iter().any(|e| e == event_name) {
            self.events.push(event_name.to_owned());
        }
        let name = self.out.write_string(event_name);
        let x = self.out.identifier(node);
        let cap = capture.then(|| self.tru());
        let passive = PASSIVE_EVENTS.contains(&event_name).then(|| self.tru());
        let call = self.call(
            if delegated { "delegated" } else { "event" },
            vec![Some(name), Some(x), Some(handler_expression), cap, passive],
        );
        l.after.push(self.statement(call));
    }

    /// Upstream `IfBlock` (client), with `{:else if}` chains flattened.
    fn if_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        frag.tpl.push_comment();
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::If {
            branches,
            otherwise,
        } = compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        let mut statements = Vec::new();
        let mut tests_and_renders: Vec<(NodeIdentifier, NodeIdentifier)> = Vec::new();
        for (index, b) in compiler_syntax_tree.branches(branches).iter().enumerate() {
            let test = b.test;
            let body = self.fragment(b.body)?;
            let cid = self.names.generate("consequent");
            let arrow = self.anchor_arrow(&body);
            statements.push(self.var(&cid, arrow));
            let meta = self.an.meta(test);
            let mut t = self.expression(test);
            if meta.has_call {
                let d = self.names.generate("d");
                let thunk = self
                    .out
                    .arrow(&[], t, true, false, SourceLocation::SYNTHETIC);
                let derived = self.call("derived", vec![Some(thunk)]);
                statements.push(self.var(&d, derived));
                let x = self.out.identifier(&d);
                t = self.call("get", vec![Some(x)]);
            }
            let render = self.out.identifier("$$render");
            let c = self.out.identifier(&cid);
            let index = (index != 0).then(|| self.write_number(index as u32));
            let mut arguments = vec![c];
            arguments.extend(index);
            let call = self
                .out
                .call(render, &arguments, false, SourceLocation::SYNTHETIC);
            tests_and_renders.push((t, self.out.expression_statement(call)));
        }
        let else_statement = if let Some(o) = otherwise {
            let body = self.fragment(o)?;
            let aid = self.names.generate("alternate");
            let arrow = self.anchor_arrow(&body);
            statements.push(self.var(&aid, arrow));
            let render = self.out.identifier("$$render");
            let x = self.out.identifier(&aid);
            let minus = self.out.write_number(-1.0, SourceLocation::SYNTHETIC);
            let call = self
                .out
                .call(render, &[x, minus], false, SourceLocation::SYNTHETIC);
            Some(self.out.expression_statement(call))
        } else {
            None
        };
        let mut chain = else_statement;
        for (t, r) in tests_and_renders.into_iter().rev() {
            chain = Some(self.out.if_(t, r, chain, SourceLocation::SYNTHETIC));
        }
        let inner = self.out.block(
            &chain.into_iter().collect::<Vec<_>>(),
            SourceLocation::SYNTHETIC,
        );
        let render_param = self.out.identifier("$$render");
        let f = self.out.arrow(
            &[render_param],
            inner,
            false,
            false,
            SourceLocation::SYNTHETIC,
        );
        let x = self.out.identifier(node);
        // Upstream's third argument marks a nested `{:else if}` block; a chain is one node here.
        let call = self.call("if", vec![Some(x), Some(f)]);
        statements.push(self.statement(call));
        l.initializer
            .push(self.out.block(&statements, SourceLocation::SYNTHETIC));
        Ok(())
    }

    /// Upstream `EachBlock` (client, runes mode) for a block whose context is an identifier.
    #[expect(
        clippy::too_many_lines,
        reason = "ports upstream's `EachBlock` visitor in one piece"
    )]
    fn each_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        controlled: bool,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let (compiler_syntax_tree, javascript, res) =
            (self.compiler_syntax_tree, self.javascript, self.res);
        let NodeKind::Each(each) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        let context = each.context().expect("the parser requires `as`");
        if !matches!(javascript.kind(context), Kind::Identifier(_)) {
            let span = javascript
                .source_location(context)
                .span()
                .expect("parsed from source");
            return unsupported("a destructuring `{#each}` context", span);
        }
        let collection = self.expression(each.collection);
        if !controlled {
            frag.tpl.push_comment();
        }
        let keyed = each.keyed(javascript);
        let mut flags = 0;
        if keyed && each.index().is_some() {
            flags |= EACH_INDEX_REACTIVE;
        }
        let key_is_item = each.key().is_some_and(|k| {
            matches!(javascript.kind(k), Kind::Identifier(_))
                && javascript.atom(k) == javascript.atom(context)
        });
        if !key_is_item && has_dependency(javascript, res, each.collection) {
            flags |= EACH_ITEM_REACTIVE;
        }
        flags |= EACH_ITEM_IMMUTABLE;
        if controlled {
            flags |= EACH_IS_CONTROLLED;
        }

        let item = res.sem.binding_of(context);
        let index = each.index().and_then(|i| res.sem.binding_of(i));
        let shadows = [item, index].into_iter().flatten().any(|b| {
            let s = &res.sem.bindings[b];
            res.sem.scopes[s.scope]
                .parent
                .is_some_and(|p| res.sem.lookup(p, s.name).is_some())
        });
        let collection_id = shadows.then(|| self.names.unique("$$array"));
        let index_name = each.index().map_or_else(
            || self.each_index[&identifier].clone(),
            |i| javascript.name(i).to_owned(),
        );

        let key_span = each
            .key()
            .and_then(|k| javascript.source_location(k).span());
        let in_key = |n: NodeIdentifier| {
            let at = javascript.source_location(n).span();
            key_span.is_some_and(|k| {
                at.is_some_and(|a| k.start_offset <= a.start_offset && a.end_offset <= k.end_offset)
            })
        };
        let (mut uses_index, mut key_uses_index) = (false, false);
        if let Some(b) = index {
            for r in res.sem.references_to(b) {
                if in_key(r.node) {
                    key_uses_index = true;
                } else {
                    uses_index = true;
                }
            }
        }
        // Upstream's `assign` and `mutate` transforms of the item set `uses_index`.
        if let Some(b) = item {
            let s = &res.sem.bindings[b];
            uses_index |= s.writes > 0 || s.mutations > 0;
        }

        if let Some(b) = item {
            self.each.insert(b, flags & EACH_ITEM_REACTIVE != 0);
        }
        if let Some(b) = index {
            self.each.insert(b, flags & EACH_INDEX_REACTIVE != 0);
        }
        let outer = self.scope;
        self.scope = res
            .sem
            .scope_of(context)
            .expect("an `{#each}` context opens a scope");
        let body = self.fragment(each.body);
        self.scope = outer;
        let body = body?;

        let key_function = if keyed {
            for b in [item, index].into_iter().flatten() {
                self.each.insert(b, false);
            }
            let pattern = self.out.ident(
                javascript.name(context),
                javascript.source_location(context),
            );
            let key = self.expression(each.key().expect("a keyed block has a key"));
            let mut parameters = vec![pattern];
            if key_uses_index {
                parameters.push(self.out.identifier(&index_name));
            }
            self.out
                .arrow(&parameters, key, true, false, SourceLocation::SYNTHETIC)
        } else {
            let ns = self.out.identifier("$");
            self.out.dot(ns, "index")
        };
        for b in [item, index].into_iter().flatten() {
            self.each.remove(&b);
        }

        let thunk = self.thunk(collection);
        let mut render_args = vec![
            self.out.identifier("$$anchor"),
            self.out.ident(
                javascript.name(context),
                javascript.source_location(context),
            ),
        ];
        if uses_index || collection_id.is_some() {
            render_args.push(self.out.identifier(&index_name));
        }
        if let Some(c) = &collection_id {
            render_args.push(self.out.identifier(c));
        }
        let block = self.out.block(&body, SourceLocation::SYNTHETIC);
        let render = self
            .out
            .arrow(&render_args, block, false, false, SourceLocation::SYNTHETIC);
        let x = self.out.identifier(node);
        let flags = self.write_number(flags);
        let mut arguments = vec![
            Some(x),
            Some(flags),
            Some(thunk),
            Some(key_function),
            Some(render),
        ];
        if let Some(f) = each.fallback {
            let fallback = self.fragment(f)?;
            arguments.push(Some(self.anchor_arrow(&fallback)));
        }
        let call = self.call("each", arguments);
        l.initializer.push(self.statement(call));
        Ok(())
    }

    fn anchor_arrow(&mut self, body: &[NodeIdentifier]) -> NodeIdentifier {
        let block = self.out.block(body, SourceLocation::SYNTHETIC);
        let anchor = self.out.identifier("$$anchor");
        self.out
            .arrow(&[anchor], block, false, false, SourceLocation::SYNTHETIC)
    }
}

struct Walk {
    prev: Prev,
    skipped: u32,
}

impl Walk {
    /// The node a static element would be visited with (upstream passes the parent's state).
    fn prev_name(&self) -> String {
        match &self.prev {
            Prev::Identifier(n) => n.clone(),
            Prev::Call { of, .. } => of.clone(),
        }
    }
}
