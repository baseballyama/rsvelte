//! Server lowering: the component becomes string pushes onto `$$renderer`. Mirrors upstream
//! `3-transform/server` (Fragment, `RegularElement`, `IfBlock`, `EachBlock`, shared/utils,
//! shared/element).

use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_markup::decode_text;
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, Element, ElementKind,
    NodeKind, Part,
};
use rsvelte_svelte::compilation::render_plan::RenderPlan;
use rsvelte_svelte::semantic::analyze::Analysis;
use rsvelte_svelte::semantic::resolve::{BindingKind, Resolution};
use rsvelte_svelte::syntax::parse::is_void;
use rsvelte_typescript::copy::copy;
use rsvelte_typescript::operators::{BinaryOperator, UpdateOperator};
use rsvelte_typescript::scope::ScopeIdentifier;
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashMap;

use super::javascript::{call_arguments, init_property, runtime_call};
use super::names::Names;
use super::script::ScriptRewrite;
use super::{
    CompileInput, Item, Prepared, Target, check_binding, check_foreign_element, escape_markup,
    event_attribute, is_boolean_attribute, is_customizable_select, is_directive,
    is_load_error_element, needs_clsx, sanitize_template_string, synthetic_value,
};

type R<T> = Result<T, Diagnostic>;

const BLOCK_OPEN: &str = "<!--[-->";
const BLOCK_OPEN_ELSE: &str = "<!--[!-->";
const BLOCK_CLOSE: &str = "<!--]-->";
const EMPTY_COMMENT: &str = "<!---->";
const ELEMENT_IS_INPUT: u32 = 1 << 2;

/// One piece of a server template before it is folded into `$$renderer.push(…)` calls.
enum Piece {
    /// Cooked text.
    Text(String),
    /// A template literal, as cooked quasis and expressions.
    Template(Vec<String>, Vec<NodeIdentifier>),
    Expression(NodeIdentifier),
    Statement(NodeIdentifier),
}

struct ServerCompilationContext<'a> {
    javascript: &'a SyntaxTree,
    compiler_syntax_tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    res: &'a Resolution,
    an: &'a Analysis,
    out: SyntaxTree,
    names: Names,
    each_index: FxHashMap<CompilerNodeIdentifier, String>,
    plan: &'a RenderPlan,
}

/// # Errors
///
/// An `unsupported` [`Diagnostic`] if the component uses an element or attribute the server
/// lowering does not handle yet.
pub fn lower(
    input: &CompileInput<'_>,
    res: &Resolution,
    an: &Analysis,
) -> R<(SyntaxTree, NodeIdentifier)> {
    super::lower(input, res, an, Target::Server)
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
    let mut sx = ServerCompilationContext {
        javascript,
        compiler_syntax_tree: input.compiler_syntax_tree,
        source_text: input.source_text,
        res,
        an,
        out,
        names,
        each_index,
        plan,
    };
    let template = sx.fragment(input.compiler_syntax_tree.root)?;

    let o = &mut sx.out;
    let mut body: Vec<NodeIdentifier> = instance;
    body.extend(template);
    // Upstream: in runes mode this only throws when `undefined` is passed to a bound prop that
    // has a default.
    let mut bound = Vec::new();
    for (b, binding) in res.sem.bindings.iter_enumerated() {
        let info = &res.bindings[b];
        let name = javascript.atoms.get(binding.name);
        if binding.scope != ScopeIdentifier::ROOT
            || info.kind != BindingKind::BindableProperty
            || name.starts_with("$$")
        {
            continue;
        }
        let key = info.prop_key.map_or_else(
            || name.to_owned(),
            |k| match javascript.kind(k) {
                Kind::Identifier(_) => javascript.name(k).to_owned(),
                _ => javascript.str_value(k, input.source_text).to_owned(),
            },
        );
        let value = o.identifier(name);
        bound.push(init_property(o, &key, value));
    }
    if !bound.is_empty() {
        let props = o.identifier("$$props");
        let object = o.object(&bound, SourceLocation::SYNTHETIC);
        let call = o.runtime("$", "bind_props", &[props, object]);
        body.push(o.expression_statement(call));
    }
    if an.needs_context {
        let block = o.block(&body, SourceLocation::SYNTHETIC);
        let param = o.identifier("$$renderer");
        let f = o.arrow(&[param], block, false, false, SourceLocation::SYNTHETIC);
        let r = o.identifier("$$renderer");
        let callee = o.dot(r, "component");
        let call = o.call(callee, &[f], false, SourceLocation::SYNTHETIC);
        body = vec![o.expression_statement(call)];
    }
    let mut parameters = vec![o.identifier("$$renderer")];
    if an.needs_context || res.uses_props {
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

    let ns = o.identifier("$");
    let spec = o.import_namespace(ns, SourceLocation::SYNTHETIC);
    let source = o.write_string("svelte/internal/server");
    let mut program = vec![o.import(&[spec], source, false, SourceLocation::SYNTHETIC)];
    program.extend(hoisted);
    program.push(o.export_default(func, SourceLocation::SYNTHETIC));
    let root = o.program(&program, SourceLocation::SYNTHETIC);
    Ok((sx.out, root))
}

impl<'a> ServerCompilationContext<'a> {
    fn expression(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        let mut rw = ScriptRewrite {
            target: Target::Server,
            res: self.res,
            source_text: self.source_text,
            each: None,
        };
        copy(self.javascript, &mut self.out, &mut rw, e)
    }

    fn fragment(
        &mut self,
        children: rsvelte_svelte::compilation::compiler_syntax_tree::Children,
    ) -> R<Vec<NodeIdentifier>> {
        let cleaned = self.plan.fragment(children);
        let mut template = Vec::new();
        if cleaned.text_first {
            template.push(Piece::Text(EMPTY_COMMENT.into()));
        }
        self.process_children(&cleaned.items, &mut template)?;
        Ok(self.build_template(template))
    }

    /// Upstream `process_children` (server).
    fn process_children(&mut self, items: &[Item<'_>], template: &mut Vec<Piece>) -> R<()> {
        let mut sequence: Vec<&Item<'_>> = Vec::new();
        for item in items {
            match item {
                Item::Text { .. } | Item::Expression(_) => sequence.push(item),
                Item::Node(identifier) => {
                    self.flush(&mut sequence, template);
                    match self.compiler_syntax_tree.node(*identifier).kind {
                        NodeKind::Element(_) => self.element(*identifier, template)?,
                        NodeKind::If { .. } => self.if_block(*identifier, template)?,
                        NodeKind::Each(_) => self.each_block(*identifier, template)?,
                        _ => unreachable!("clean_nodes keeps only elements and blocks as nodes"),
                    }
                }
            }
        }
        self.flush(&mut sequence, template);
        Ok(())
    }

    fn flush(&mut self, sequence: &mut Vec<&Item<'_>>, template: &mut Vec<Piece>) {
        if sequence.is_empty() {
            return;
        }
        let mut quasis = vec![String::new()];
        let mut expressions = Vec::new();
        for item in sequence.drain(..) {
            match item {
                Item::Text { data, .. } => quasis
                    .last_mut()
                    .expect("never empty")
                    .push_str(&escape_markup(data, false)),
                Item::Expression(e) => {
                    let evaluated = self.res.evaluate(self.javascript, self.source_text, *e);
                    if evaluated.is_known {
                        let s = known_string(&evaluated.value);
                        quasis
                            .last_mut()
                            .expect("never empty")
                            .push_str(&escape_markup(&s, false));
                    } else {
                        let v = self.expression(*e);
                        expressions.push(self.out.runtime("$", "escape", &[v]));
                        quasis.push(String::new());
                    }
                }
                Item::Node(_) => unreachable!("sequences hold text and expressions"),
            }
        }
        template.push(Piece::Template(quasis, expressions));
    }

    /// Upstream `build_template`: adjacent pieces fold into one `$$renderer.push(`…`)`.
    fn build_template(&mut self, template: Vec<Piece>) -> Vec<NodeIdentifier> {
        let mut statements = Vec::new();
        let mut strings: Vec<String> = Vec::new();
        let mut expressions: Vec<NodeIdentifier> = Vec::new();
        for piece in template {
            if let Piece::Statement(s) = piece {
                if !strings.is_empty() {
                    statements.push(self.push_call(
                        &std::mem::take(&mut strings),
                        &std::mem::take(&mut expressions),
                    ));
                }
                statements.push(s);
                continue;
            }
            if strings.is_empty() {
                strings.push(String::new());
            }
            match piece {
                Piece::Text(t) => strings.last_mut().expect("never empty").push_str(&t),
                Piece::Template(q, e) => {
                    let mut q = q.into_iter();
                    strings
                        .last_mut()
                        .expect("never empty")
                        .push_str(&q.next().expect("at least one quasi"));
                    strings.extend(q);
                    expressions.extend(e);
                }
                Piece::Expression(e) => {
                    expressions.push(e);
                    strings.push(String::new());
                }
                Piece::Statement(_) => unreachable!("handled above"),
            }
        }
        if !strings.is_empty() {
            statements.push(self.push_call(&strings, &expressions));
        }
        statements
    }

    fn push_call(&mut self, strings: &[String], expressions: &[NodeIdentifier]) -> NodeIdentifier {
        let n = strings.len();
        let quasis: Vec<NodeIdentifier> = strings
            .iter()
            .enumerate()
            .map(|(i, s)| {
                self.out
                    .template_element(&sanitize_template_string(s), i + 1 == n)
            })
            .collect();
        let t = self
            .out
            .template(&quasis, expressions, SourceLocation::SYNTHETIC);
        let r = self.out.identifier("$$renderer");
        let callee = self.out.dot(r, "push");
        let call = self
            .out
            .call(callee, &[t], false, SourceLocation::SYNTHETIC);
        self.out.expression_statement(call)
    }

    /// Upstream `RegularElement` + `build_element_attributes` (server, no spread).
    fn element(&mut self, identifier: CompilerNodeIdentifier, template: &mut Vec<Piece>) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        if el.kind != ElementKind::Regular {
            return Err(Diagnostic::error(
                "unsupported",
                "components, `<slot>` and `svelte:` elements are not supported yet",
                el.name,
            ));
        }
        let tag = el.name.text(self.source_text).to_ascii_lowercase();
        if matches!(
            tag.as_str(),
            "svg" | "math" | "script" | "style" | "textarea" | "template"
        ) || tag.contains('-')
        {
            return Err(Diagnostic::error(
                "unsupported",
                format!("`<{tag}>` is not supported yet"),
                el.name,
            ));
        }
        if is_customizable_select(compiler_syntax_tree, self.source_text, &tag, el) {
            return Err(Diagnostic::error(
                "unsupported",
                format!("rich content in `<{tag}>` is not supported yet"),
                el.name,
            ));
        }
        check_foreign_element(self.source_text, el.name)?;
        let select_special = tag == "select"
            && compiler_syntax_tree
                .attributes(el.attributes)
                .iter()
                .any(|a| match a.value {
                    AttributeValue::Spread(_) => true,
                    AttributeValue::Attach(_) | AttributeValue::Class(_) => false,
                    _ => {
                        let name = a.name.text(self.source_text);
                        name == "value" || name.eq_ignore_ascii_case("defaultvalue")
                    }
                });
        if select_special || tag == "option" {
            return self.select_element(identifier, el, &tag, template);
        }
        template.push(Piece::Text(format!("<{tag}")));
        self.element_attributes(
            identifier,
            &tag,
            compiler_syntax_tree.attributes(el.attributes),
            template,
        )?;
        let void = is_void(&tag);
        template.push(Piece::Text(if void { "/>".into() } else { ">".into() }));
        let cleaned = self.plan.fragment(el.children);
        self.process_children(&cleaned.items, template)?;
        if !void {
            template.push(Piece::Text(format!("</{tag}>")));
        }
        Ok(())
    }

    /// Upstream `RegularElement`'s `is_select_special` / `is_option_special` branches: the
    /// renderer writes the element, so it can mark the selected option.
    fn select_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        el: &Element,
        tag: &str,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let body = if let Some(e) = synthetic_value(compiler_syntax_tree, self.source_text, tag, el)
        {
            self.expression(e)
        } else {
            let cleaned = self.plan.fragment(el.children);
            let mut inner = Vec::new();
            self.process_children(&cleaned.items, &mut inner)?;
            let statements = self.build_template(inner);
            let block = self.out.block(&statements, SourceLocation::SYNTHETIC);
            let param = self.out.identifier("$$renderer");
            self.out
                .arrow(&[param], block, false, false, SourceLocation::SYNTHETIC)
        };
        let (mut arguments, _) = self.spread_args(
            identifier,
            tag,
            compiler_syntax_tree.attributes(el.attributes),
            true,
        )?;
        arguments.insert(1, Some(body));
        let arguments = call_arguments(&mut self.out, arguments);
        let r = self.out.identifier("$$renderer");
        let callee = self.out.dot(r, tag);
        let call = self
            .out
            .call(callee, &arguments, false, SourceLocation::SYNTHETIC);
        template.push(Piece::Statement(self.out.expression_statement(call)));
        Ok(())
    }

    /// Upstream `build_element_attributes` (no spread).
    #[expect(
        clippy::too_many_lines,
        reason = "ports upstream's `build_element_attributes` in one piece"
    )]
    fn element_attributes(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'a [Attribute],
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let source_text = self.source_text;
        // A `defaultValue` on an `<input>` deopts to the spread path, which orders it at runtime.
        let has_spread = list.iter().any(|a| {
            matches!(a.value, AttributeValue::Spread(_))
                || (tag == "input"
                    && !is_directive(&a.value)
                    && matches!(a.name.text(source_text), "defaultValue" | "defaultChecked"))
        });
        if has_spread {
            return self.spread_attributes(identifier, tag, list, template);
        }
        let hash = if self.an.scoped[identifier] {
            self.an.stylesheet_hash.clone()
        } else {
            None
        };
        let mut events = Vec::new();
        let class_directives: Vec<&Attribute> = list
            .iter()
            .filter(|a| matches!(a.value, AttributeValue::Class(_)))
            .collect();
        for a in list {
            let raw_name = a.name.text(self.source_text);
            match a.value {
                AttributeValue::Bind(_) => {
                    let e =
                        check_binding(self.javascript, self.res, self.source_text, tag, list, a)?;
                    let name = raw_name.to_ascii_lowercase();
                    let value = self.expression(e);
                    let n = self.out.write_string(&name);
                    let mut arguments = vec![n, value];
                    if is_boolean_attribute(&name) {
                        arguments.push(self.out.write_boolean(true, SourceLocation::SYNTHETIC));
                    }
                    template.push(Piece::Expression(self.out.runtime("$", "attr", &arguments)));
                    continue;
                }
                AttributeValue::Attach(_) | AttributeValue::Class(_) => continue,
                AttributeValue::Spread(_) => unreachable!("spreads take the spread path"),
                _ if event_attribute(self.source_text, a).is_some() => {
                    capture_event(&mut events, tag, raw_name);
                    continue;
                }
                _ if matches!(raw_name, "defaultValue" | "defaultChecked") => continue,
                _ => {}
            }
            let name = raw_name.to_ascii_lowercase();
            let trim = matches!(name.as_str(), "class" | "style");
            let can_use_literal = name != "class" || class_directives.is_empty();
            let literal = match &a.value {
                AttributeValue::Boolean => Some(None),
                AttributeValue::Static(v) => Some(Some(
                    escape_markup(&attribute_text(v, trim), true).into_owned(),
                )),
                _ => None,
            };
            if can_use_literal && let Some(v) = literal {
                Self::literal_attribute(template, &name, v, hash.as_deref());
                continue;
            }
            if name == "style" {
                return Err(Diagnostic::error(
                    "unsupported",
                    "a dynamic `style` attribute is not supported yet",
                    a.span,
                ));
            }
            let value = self.attribute_value(a, trim, raw_name == "class");
            if can_use_literal && matches!(self.out.kind(value), Kind::String) {
                let mut v = self.out.str_value(value, self.source_text).to_owned();
                if name == "class"
                    && let Some(h) = &hash
                {
                    format!("{v} {h}").trim().clone_into(&mut v);
                }
                let v = escape_markup(&v, true);
                template.push(Piece::Text(format!(" {name}=\"{v}\"")));
            } else if name == "class" {
                let call = self.attribute_class(&class_directives, value, hash.as_deref());
                template.push(Piece::Expression(call));
            } else {
                let n = self.out.write_string(&name);
                let mut arguments = vec![n, value];
                if is_boolean_attribute(&name) {
                    arguments.push(self.out.write_boolean(true, SourceLocation::SYNTHETIC));
                }
                template.push(Piece::Expression(self.out.runtime("$", "attr", &arguments)));
            }
        }
        // Upstream's analysis appends `class=""` to such an element.
        let has_class = list.iter().any(|a| {
            !matches!(a.value, AttributeValue::Class(_))
                && a.name.text(self.source_text).eq_ignore_ascii_case("class")
        });
        if !has_class && !class_directives.is_empty() {
            let value = self.out.write_string("");
            let call = self.attribute_class(&class_directives, value, hash.as_deref());
            template.push(Piece::Expression(call));
        } else if !has_class && self.an.scoped[identifier] {
            Self::literal_attribute(template, "class", Some(String::new()), hash.as_deref());
        }
        push_captured_events(template, &events);
        Ok(())
    }

    /// Upstream `build_element_attributes`' spread path: `build_element_spread_attributes` and
    /// `prepare_element_spread`.
    fn spread_attributes(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'a [Attribute],
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let (arguments, events) = self.spread_args(identifier, tag, list, false)?;
        let call = runtime_call(&mut self.out, "attributes", arguments);
        template.push(Piece::Expression(call));
        push_captured_events(template, &events);
        Ok(())
    }

    /// Upstream `prepare_element_spread`'s arguments. `all` is `prepare_element_spread_object`,
    /// which keeps every attribute; otherwise the spread path of `build_element_attributes`
    /// filters events (returned for capture) and the values the runtime sets elsewhere.
    fn spread_args(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'a [Attribute],
        all: bool,
    ) -> R<(Vec<Option<NodeIdentifier>>, Vec<&'a str>)> {
        let mut events = Vec::new();
        let mut props = Vec::with_capacity(list.len());
        let mut class_directives = Vec::new();
        for a in list {
            let raw_name = a.name.text(self.source_text);
            match a.value {
                AttributeValue::Bind(_) => {
                    let e =
                        check_binding(self.javascript, self.res, self.source_text, tag, list, a)?;
                    let value = self.expression(e);
                    let name = raw_name.to_ascii_lowercase();
                    props.push(init_property(&mut self.out, &name, value));
                    continue;
                }
                AttributeValue::Attach(_) => continue,
                AttributeValue::Class(e) => {
                    class_directives.push((raw_name, e));
                    continue;
                }
                AttributeValue::Spread(e) => {
                    let v = self.expression(e);
                    props.push(self.out.spread(v, SourceLocation::SYNTHETIC));
                    if is_load_error_element(tag) {
                        capture_event(&mut events, tag, "onload");
                        capture_event(&mut events, tag, "onerror");
                    }
                    continue;
                }
                _ if all => {}
                _ if raw_name == "value" && tag == "select" => continue,
                _ if event_attribute(self.source_text, a).is_some() => {
                    capture_event(&mut events, tag, raw_name);
                    continue;
                }
                _ if tag != "input" && matches!(raw_name, "defaultValue" | "defaultChecked") => {
                    continue;
                }
                _ => {}
            }
            let mut name = raw_name.to_ascii_lowercase();
            if tag == "select" && name == "defaultvalue" {
                "defaultValue".clone_into(&mut name);
            }
            let trim = matches!(name.as_str(), "class" | "style");
            let value = self.attribute_value(a, trim, raw_name == "class");
            props.push(init_property(&mut self.out, &name, value));
        }
        // Upstream's analysis appends `class=""` to such an element.
        let has_class = list.iter().any(|a| {
            !is_directive(&a.value) && a.name.text(self.source_text).eq_ignore_ascii_case("class")
        });
        let has_spread = list
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Spread(_)));
        if !has_spread && !has_class && (self.an.scoped[identifier] || !class_directives.is_empty())
        {
            let empty = self.out.write_string("");
            props.push(init_property(&mut self.out, "class", empty));
        }
        let object = self.out.object(&props, SourceLocation::SYNTHETIC);
        let classes = (!class_directives.is_empty()).then(|| {
            let props: Vec<NodeIdentifier> = class_directives
                .iter()
                .map(|&(name, e)| {
                    let v = self.expression(e);
                    init_property(&mut self.out, name, v)
                })
                .collect();
            self.out.object(&props, SourceLocation::SYNTHETIC)
        });
        let hash = if self.an.scoped[identifier] {
            self.an.stylesheet_hash.clone()
        } else {
            None
        };
        let hash = hash.map(|h| self.out.write_string(&h));
        let flags = (tag == "input").then(|| {
            self.out
                .write_number(f64::from(ELEMENT_IS_INPUT), SourceLocation::SYNTHETIC)
        });
        Ok((vec![Some(object), hash, classes, None, flags], events))
    }

    /// Upstream `build_attr_class`.
    fn attribute_class(
        &mut self,
        directives: &[&Attribute],
        value: NodeIdentifier,
        hash: Option<&str>,
    ) -> NodeIdentifier {
        let directives = (!directives.is_empty()).then(|| {
            let props: Vec<NodeIdentifier> = directives
                .iter()
                .map(|d| {
                    let AttributeValue::Class(e) = d.value else {
                        unreachable!("class directives")
                    };
                    let key = self.out.write_string(d.name.text(self.source_text));
                    let v = self.expression(e);
                    self.out.property(key, v, 0, SourceLocation::SYNTHETIC)
                })
                .collect();
            self.out.object(&props, SourceLocation::SYNTHETIC)
        });
        let mut value = value;
        let mut stylesheet_hash = None;
        if let Some(h) = hash {
            if matches!(self.out.kind(value), Kind::String) {
                let v = self.out.str_value(value, self.source_text);
                value = self.out.write_string(format!("{v} {h}").trim());
            } else {
                stylesheet_hash = Some(self.out.write_string(h));
            }
        }
        runtime_call(
            &mut self.out,
            "attr_class",
            vec![Some(value), stylesheet_hash, directives],
        )
    }

    fn literal_attribute(
        template: &mut Vec<Piece>,
        name: &str,
        value: Option<String>,
        hash: Option<&str>,
    ) {
        let mut value = value;
        if name == "class"
            && let Some(h) = hash
        {
            let base = value
                .as_deref()
                .map_or_else(|| "true".to_owned(), str::to_owned);
            value = Some(format!("{base} {h}").trim().to_owned());
        }
        if name != "class" || value.as_deref() != Some("") {
            template.push(Piece::Text(format!(
                " {name}=\"{}\"",
                value.unwrap_or_default()
            )));
        }
    }

    /// Upstream `build_attribute_value` (server); a `class`
    /// written as one unquoted expression goes through `$.clsx` when upstream's `needs_clsx`.
    fn attribute_value(&mut self, a: &Attribute, trim: bool, class: bool) -> NodeIdentifier {
        let parts = match &a.value {
            &AttributeValue::Expression { expression, quoted } => {
                let v = self.expression(expression);
                return if class && !quoted && needs_clsx(self.javascript, expression) {
                    self.out.runtime("$", "clsx", &[v])
                } else {
                    v
                };
            }
            &AttributeValue::Shorthand(expression) => {
                let v = self.expression(expression);
                return if class && needs_clsx(self.javascript, expression) {
                    self.out.runtime("$", "clsx", &[v])
                } else {
                    v
                };
            }
            AttributeValue::Interpolated(parts) => parts,
            AttributeValue::Boolean => {
                return self.out.write_boolean(true, SourceLocation::SYNTHETIC);
            }
            AttributeValue::Static(v) => {
                return self
                    .out
                    .write_string(&escape_markup(&attribute_text(v, trim), true));
            }
            AttributeValue::Bind(_)
            | AttributeValue::Attach(_)
            | AttributeValue::Class(_)
            | AttributeValue::Spread(_) => {
                unreachable!("directives are handled by the caller")
            }
        };
        let mut quasis = vec![String::new()];
        let mut expressions = Vec::new();
        for p in parts {
            match p {
                Part::Text(s) => {
                    let data = decode_text(s.text(self.source_text));
                    let data = if trim {
                        collapse_ws(&data)
                    } else {
                        data.into_owned()
                    };
                    quasis.last_mut().expect("never empty").push_str(&data);
                }
                Part::Expression { expression, .. } => {
                    let evaluated =
                        self.res
                            .evaluate(self.javascript, self.source_text, *expression);
                    if evaluated.is_known {
                        quasis
                            .last_mut()
                            .expect("never empty")
                            .push_str(&known_string(&evaluated.value));
                    } else {
                        let v = self.expression(*expression);
                        let v = if evaluated.is_string && evaluated.is_defined {
                            v
                        } else {
                            self.out.runtime("$", "stringify", &[v])
                        };
                        expressions.push(v);
                        quasis.push(String::new());
                    }
                }
            }
        }
        if expressions.is_empty() {
            return self.out.write_string(&quasis[0]);
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
        self.out
            .template(&elements, &expressions, SourceLocation::SYNTHETIC)
    }

    /// Upstream `IfBlock` (server).
    fn if_block(&mut self, identifier: CompilerNodeIdentifier, template: &mut Vec<Piece>) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::If {
            branches,
            otherwise,
        } = compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        let mut arms = Vec::new();
        for (index, b) in compiler_syntax_tree.branches(branches).iter().enumerate() {
            let body = self.fragment(b.body)?;
            let marker = format!("<!--[{index}-->");
            let block = self.prepend_block_marker(body, &marker);
            let t = self.expression(b.test);
            arms.push((t, block));
        }
        let final_body = match otherwise {
            Some(o) => self.fragment(o)?,
            None => Vec::new(),
        };
        let mut chain = self.prepend_block_marker(final_body, "<!--[-1-->");
        for (t, block) in arms.into_iter().rev() {
            chain = self
                .out
                .if_(t, block, Some(chain), SourceLocation::SYNTHETIC);
        }
        template.push(Piece::Statement(chain));
        template.push(Piece::Text(BLOCK_CLOSE.into()));
        Ok(())
    }

    /// Upstream `EachBlock` (server) for a block whose context is an identifier.
    fn each_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let (compiler_syntax_tree, javascript) = (self.compiler_syntax_tree, self.javascript);
        let NodeKind::Each(each) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        let context = each.context().expect("the parser requires `as`");
        if !matches!(javascript.kind(context), Kind::Identifier(_)) {
            return Err(Diagnostic::error(
                "unsupported",
                "a destructuring `{#each}` context is not supported yet",
                javascript
                    .source_location(context)
                    .span()
                    .expect("parsed from source"),
            ));
        }
        let collection = self.expression(each.collection);
        let index = each.index().map_or_else(
            || self.each_index[&identifier].clone(),
            |i| javascript.name(i).to_owned(),
        );
        let array_id = self.names.unique("each_array");
        let ensure = self.out.runtime("$", "ensure_array_like", &[collection]);
        let array = self.out.identifier(&array_id);
        let array_declaration = self.out.let_(flag::CONST, array, Some(ensure));

        let mut body = Vec::new();
        let item = self.out.ident(
            javascript.name(context),
            javascript.source_location(context),
        );
        let array = self.out.identifier(&array_id);
        let at = self.out.identifier(&index);
        let element = self
            .out
            .member(array, at, true, false, SourceLocation::SYNTHETIC);
        body.push(self.out.let_(flag::LET, item, Some(element)));
        body.extend(self.fragment(each.body)?);

        let i = self.out.identifier(&index);
        let zero = self.out.write_number(0.0, SourceLocation::SYNTHETIC);
        let first = self
            .out
            .declarator(i, Some(zero), SourceLocation::SYNTHETIC);
        let length = self.out.identifier("$$length");
        let array = self.out.identifier(&array_id);
        let array_length = self.out.dot(array, "length");
        let second = self
            .out
            .declarator(length, Some(array_length), SourceLocation::SYNTHETIC);
        let initializer =
            self.out
                .var_declaration(flag::LET, &[first, second], SourceLocation::SYNTHETIC);
        let i = self.out.identifier(&index);
        let length = self.out.identifier("$$length");
        let test = self
            .out
            .binary(BinaryOperator::Lt, i, length, SourceLocation::SYNTHETIC);
        let i = self.out.identifier(&index);
        let update = self
            .out
            .update(UpdateOperator::Inc, false, i, SourceLocation::SYNTHETIC);
        let block = self.out.block(&body, SourceLocation::SYNTHETIC);
        let for_loop = self.out.for_(
            Some(initializer),
            Some(test),
            Some(update),
            block,
            SourceLocation::SYNTHETIC,
        );

        if let Some(f) = each.fallback {
            let open = self.push_literal(BLOCK_OPEN);
            let fallback = self.fragment(f)?;
            let fallback = self.prepend_block_marker(fallback, BLOCK_OPEN_ELSE);
            let array = self.out.identifier(&array_id);
            let array_length = self.out.dot(array, "length");
            let zero = self.out.write_number(0.0, SourceLocation::SYNTHETIC);
            let test = self.out.binary(
                BinaryOperator::StrictNotEq,
                array_length,
                zero,
                SourceLocation::SYNTHETIC,
            );
            let consequent = self.out.block(&[open, for_loop], SourceLocation::SYNTHETIC);
            let statement =
                self.out
                    .if_(test, consequent, Some(fallback), SourceLocation::SYNTHETIC);
            template.push(Piece::Statement(array_declaration));
            template.push(Piece::Statement(statement));
        } else {
            template.push(Piece::Text(BLOCK_OPEN.into()));
            template.push(Piece::Statement(array_declaration));
            template.push(Piece::Statement(for_loop));
        }
        template.push(Piece::Text(BLOCK_CLOSE.into()));
        Ok(())
    }

    /// `$$renderer.push('…')`.
    fn push_literal(&mut self, text: &str) -> NodeIdentifier {
        let r = self.out.identifier("$$renderer");
        let callee = self.out.dot(r, "push");
        let m = self.out.write_string(text);
        let call = self
            .out
            .call(callee, &[m], false, SourceLocation::SYNTHETIC);
        self.out.expression_statement(call)
    }

    /// Upstream `prepend_block_marker`: folds the marker into a leading static push.
    fn prepend_block_marker(
        &mut self,
        mut body: Vec<NodeIdentifier>,
        marker: &str,
    ) -> NodeIdentifier {
        let folded = body.first().and_then(|&first| {
            let Kind::ExpressionStatement(call) = self.out.kind(first) else {
                return None;
            };
            let Kind::Call {
                callee,
                arguments: [arg],
                ..
            } = self.out.kind(call)
            else {
                return None;
            };
            let is_push = matches!(self.out.kind(callee), Kind::Member { object, property, .. }
                if self.out.name(object) == "$$renderer" && self.out.name(property) == "push");
            let Kind::Template {
                quasis,
                expressions,
            } = self.out.kind(*arg)
            else {
                return None;
            };
            if !is_push {
                return None;
            }
            let (quasis, expressions) = (quasis.to_vec(), expressions.to_vec());
            let n = quasis.len();
            let mut new_quasis = Vec::with_capacity(n);
            for (i, &q) in quasis.iter().enumerate() {
                let raw = self.out.str_value(q, self.source_text).to_owned();
                let raw = if i == 0 {
                    format!("{}{raw}", sanitize_template_string(marker))
                } else {
                    raw
                };
                new_quasis.push(self.out.template_element(&raw, i + 1 == n));
            }
            let t = self
                .out
                .template(&new_quasis, &expressions, SourceLocation::SYNTHETIC);
            let r = self.out.identifier("$$renderer");
            let callee = self.out.dot(r, "push");
            let call = self
                .out
                .call(callee, &[t], false, SourceLocation::SYNTHETIC);
            Some(self.out.expression_statement(call))
        });
        if let Some(s) = folded {
            body[0] = s;
        } else {
            let r = self.out.identifier("$$renderer");
            let callee = self.out.dot(r, "push");
            let m = self.out.write_string(marker);
            let call = self
                .out
                .call(callee, &[m], false, SourceLocation::SYNTHETIC);
            body.insert(0, self.out.expression_statement(call));
        }
        self.out.block(&body, SourceLocation::SYNTHETIC)
    }
}

/// Upstream's `events_to_capture`: a load or error event on an element that emits them is
/// replayed after hydration, so the server marks it.
fn capture_event<'a>(events: &mut Vec<&'a str>, tag: &str, name: &'a str) {
    if matches!(name, "onload" | "onerror") && is_load_error_element(tag) && !events.contains(&name)
    {
        events.push(name);
    }
}

fn push_captured_events(template: &mut Vec<Piece>, events: &[&str]) {
    for e in events {
        template.push(Piece::Text(format!(" {e}=\"this.__e=event\"")));
    }
}

/// `String(value ?? '')` for a known value.
fn known_string(v: &rsvelte_svelte::semantic::evaluate::Value) -> String {
    match v {
        rsvelte_svelte::semantic::evaluate::Value::Null
        | rsvelte_svelte::semantic::evaluate::Value::Undefined => String::new(),
        v => v.to_javascript_string(),
    }
}

fn attribute_text(data: &str, trim: bool) -> String {
    if trim {
        collapse_ws(data).trim().to_owned()
    } else {
        data.to_owned()
    }
}

/// `regex_whitespaces_strict` → `' '`.
fn collapse_ws(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut in_ws = false;
    for ch in s.chars() {
        if matches!(ch, ' ' | '\t' | '\n' | '\r' | '\u{c}') {
            if !in_ws {
                out.push(' ');
            }
            in_ws = true;
        } else {
            out.push(ch);
            in_ws = false;
        }
    }
    out
}
