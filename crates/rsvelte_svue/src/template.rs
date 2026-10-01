//! The template: Vue's HIR to Svelte's.

use rsvelte_javascript::operators::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator,
};
use rsvelte_javascript::scope::{BindingIdentifier, DeclarationKind};
use rsvelte_javascript::syntax_tree::flag;
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    self as svelte, Attribute, AttributeValue, Branch,
    CompilerNodeIdentifier as SvelteNodeIdentifier, CompilerSyntaxTreeBuilder, Each,
    Element as SvelteElement, NodeKind as SvelteNodeKind,
};
use rsvelte_svelte::compilation::lower::Target;
use rsvelte_vue::compiler_syntax_tree::{
    CompilerNodeIdentifier, CompilerSyntaxTree, Directive, Element, NodeKind, Property,
    PropertyKind, TagType,
};
use rsvelte_vue::syntax_tree::{DirectiveExpression, DirectiveName};
use rustc_hash::FxHashMap;

use crate::context::{Class, Helper, Info, Names, R, Rewriter, span_of, unsupported};

/// The translated template, and the declarations the instance script needs for it.
#[derive(Debug)]
pub(crate) struct Template {
    pub(crate) compiler_syntax_tree: svelte::CompilerSyntaxTree,
    pub(crate) expressions: Vec<NodeIdentifier>,
    /// Statements that go before the script's own.
    pub(crate) hoisted: Vec<NodeIdentifier>,
}

/// runtime-core `getChildRoot` / `filterSingleRoot` in development: the elements that receive the
/// attributes that fall through, when the template renders a single element root (one element,
/// or one `v-if` chain of elements). Comments do not count.
#[must_use]
pub(crate) fn fallthrough_targets(
    compiler_syntax_tree: &CompilerSyntaxTree,
) -> Vec<CompilerNodeIdentifier> {
    let roots: Vec<CompilerNodeIdentifier> = compiler_syntax_tree
        .root()
        .iter()
        .copied()
        .filter(|&n| !matches!(compiler_syntax_tree.node(n).kind, NodeKind::Comment { .. }))
        .collect();
    let element = |n: CompilerNodeIdentifier| match &compiler_syntax_tree.node(n).kind {
        NodeKind::Element(el) if el.tag_type == TagType::Element => {
            let dirs = directives(compiler_syntax_tree, el);
            (!dirs.iter().any(|d| d.name == DirectiveName::For)).then(|| {
                dirs.iter()
                    .find(|d| {
                        matches!(
                            d.name,
                            DirectiveName::If | DirectiveName::ElseIf | DirectiveName::Else
                        )
                    })
                    .map(|d| d.name)
            })
        }
        _ => None,
    };
    match *roots.as_slice() {
        [one] if element(one) == Some(None) => vec![one],
        [first, ..] if element(first) == Some(Some(DirectiveName::If)) => {
            let mut chain = vec![first];
            for &n in &roots[1..] {
                match element(n) {
                    Some(Some(DirectiveName::ElseIf)) => chain.push(n),
                    Some(Some(DirectiveName::Else)) => {
                        chain.push(n);
                        return if chain.len() == roots.len() {
                            chain
                        } else {
                            Vec::new()
                        };
                    }
                    _ => return Vec::new(),
                }
            }
            Vec::new()
        }
        _ => Vec::new(),
    }
}

fn directives<'h>(
    compiler_syntax_tree: &'h CompilerSyntaxTree,
    el: &Element,
) -> Vec<&'h Directive> {
    compiler_syntax_tree
        .props(el.props)
        .iter()
        .filter_map(|p| match &p.kind {
            PropertyKind::Directive(d) => Some(d),
            PropertyKind::Attribute { .. } => None,
        })
        .collect()
}

fn directive<'h>(
    compiler_syntax_tree: &'h CompilerSyntaxTree,
    el: &Element,
    name: DirectiveName,
) -> Option<(&'h Property, &'h Directive)> {
    compiler_syntax_tree
        .props(el.props)
        .iter()
        .find_map(|p| match &p.kind {
            PropertyKind::Directive(d) if d.name == name => Some((p, d)),
            _ => None,
        })
}

fn expression_of(d: &Directive, span: Span) -> R<NodeIdentifier> {
    match d.exp {
        DirectiveExpression::Expression(e) => Ok(e),
        _ => Err(unsupported("a directive without a value", span)),
    }
}

/// # Errors
///
/// A refusal for what the template does that svue does not translate.
pub(crate) fn translate(
    info: &Info<'_>,
    compiler_syntax_tree: Option<&CompilerSyntaxTree>,
    roots: &[CompilerNodeIdentifier],
    attributes: Option<&str>,
    to: &mut SyntaxTree,
    names: &mut Names,
) -> R<Template> {
    let mut b = CompilerSyntaxTreeBuilder::new(info.source_text, 0, 0);
    let Some(vue_tree) = compiler_syntax_tree else {
        let root = b.children(&[]);
        return Ok(Template {
            compiler_syntax_tree: b.finish(root),
            expressions: Vec::new(),
            hoisted: Vec::new(),
        });
    };
    let mut t = T {
        info,
        vue_tree,
        source_text: info.source_text,
        to,
        names,
        b,
        expressions: Vec::new(),
        aliases: FxHashMap::default(),
        roots,
        attributes,
        select_model: None,
        hoisted: Vec::new(),
        vmodel: None,
        boolean_attribute: None,
        renderable: None,
    };
    let root = t.list(vue_tree.root(), None)?;
    let root = t.b.children(&root);
    let T {
        b,
        expressions,
        hoisted,
        ..
    } = t;
    Ok(Template {
        compiler_syntax_tree: b.finish(root),
        expressions,
        hoisted,
    })
}

struct T<'a, 'i> {
    info: &'a Info<'i>,
    vue_tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    to: &'a mut SyntaxTree,
    names: &'a mut Names,
    b: CompilerSyntaxTreeBuilder<'a>,
    expressions: Vec<NodeIdentifier>,
    /// The aliases of the enclosing `v-for`s with more than one: read through their block's entry.
    aliases: FxHashMap<BindingIdentifier, (String, u32)>,
    roots: &'a [CompilerNodeIdentifier],
    attributes: Option<&'a str>,
    /// On the server, inside a `<select v-model>`: the model.
    select_model: Option<NodeIdentifier>,
    hoisted: Vec<NodeIdentifier>,
    vmodel: Option<String>,
    boolean_attribute: Option<String>,
    renderable: Option<String>,
}

impl T<'_, '_> {
    /// A template expression, rewritten.
    fn expression(&mut self, e: NodeIdentifier) -> R<NodeIdentifier> {
        let aliases = std::mem::take(&mut self.aliases);
        let out = Rewriter::new(self.info, true, &aliases).copy(self.to, e);
        self.aliases = aliases;
        out
    }

    fn root_expression(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        self.expressions.push(e);
        e
    }

    fn helper(&mut self, h: Helper) -> NodeIdentifier {
        let name = self.names.helper(self.info.from, h);
        self.to.identifier(&name)
    }

    fn list(
        &mut self,
        child_nodes: &[CompilerNodeIdentifier],
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<Vec<SvelteNodeIdentifier>> {
        let (vue_tree, source_text) = (self.vue_tree, self.source_text);
        let mut out = Vec::with_capacity(child_nodes.len());
        let mut at = 0;
        while at < child_nodes.len() {
            let child = child_nodes[at];
            let node = vue_tree.node(child);
            let origin = vue_tree.origin[child];
            match &node.kind {
                NodeKind::Text(t) => {
                    let kind = svelte::spelled_text(t.raw, t.text(source_text).into());
                    out.push(self.b.node(kind, node.span, parent, origin));
                }
                &NodeKind::Comment { data } => {
                    out.push(self.b.node(
                        SvelteNodeKind::Comment { data },
                        node.span,
                        parent,
                        origin,
                    ));
                }
                &NodeKind::Interpolation { expression } => {
                    let e = self.expression(expression)?;
                    let callee = self.helper(Helper::ToDisplayString);
                    let call = self
                        .to
                        .call(callee, &[e], false, SourceLocation::from(node.span));
                    let call = self.root_expression(call);
                    out.push(self.b.node(
                        SvelteNodeKind::Expression { expression: call },
                        node.span,
                        parent,
                        origin,
                    ));
                }
                NodeKind::Element(el) => {
                    let cond = directives(vue_tree, el).into_iter().find(|d| {
                        matches!(
                            d.name,
                            DirectiveName::If | DirectiveName::ElseIf | DirectiveName::Else
                        )
                    });
                    match cond.map(|d| d.name) {
                        Some(DirectiveName::If) => {
                            let mut chain = vec![child];
                            let mut next = at + 1;
                            let mut end = at;
                            while next < child_nodes.len() {
                                match &vue_tree.node(child_nodes[next]).kind {
                                    NodeKind::Comment { .. } => {}
                                    NodeKind::Text(t) if t.text(source_text).trim().is_empty() => {}
                                    NodeKind::Element(e) => {
                                        let branch = directive(vue_tree, e, DirectiveName::ElseIf)
                                            .or_else(|| {
                                                directive(vue_tree, e, DirectiveName::Else)
                                            });
                                        match branch.map(|(_, d)| d.name) {
                                            Some(DirectiveName::ElseIf) => {
                                                chain.push(child_nodes[next]);
                                                end = next;
                                            }
                                            Some(_) => {
                                                chain.push(child_nodes[next]);
                                                end = next;
                                                break;
                                            }
                                            None => break,
                                        }
                                    }
                                    _ => break,
                                }
                                next += 1;
                            }
                            out.push(self.if_chain(&chain, parent)?);
                            at = end + 1;
                            continue;
                        }
                        Some(_) => {
                            return Err(unsupported(
                                "`v-else` or `v-else-if` without `v-if`",
                                node.span,
                            ));
                        }
                        None => out.push(self.element_or_each(child, parent)?),
                    }
                }
            }
            at += 1;
        }
        Ok(out)
    }

    fn if_chain(
        &mut self,
        chain: &[CompilerNodeIdentifier],
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<SvelteNodeIdentifier> {
        let vue_tree = self.vue_tree;
        let first = vue_tree.node(chain[0]).span;
        let last = vue_tree.node(chain[chain.len() - 1]).span;
        let span = Span::new(first.start_offset, last.end_offset);
        let placeholder = SvelteNodeKind::Comment {
            data: Span::default(),
        };
        let identifier = self
            .b
            .node(placeholder, span, parent, vue_tree.origin[chain[0]]);
        let mut branches = Vec::new();
        let mut otherwise = None;
        for &k in chain {
            let NodeKind::Element(el) = &vue_tree.node(k).kind else {
                unreachable!("a chain holds elements")
            };
            if directive(vue_tree, el, DirectiveName::For).is_some() {
                return Err(unsupported(
                    "`v-if` and `v-for` on one element",
                    vue_tree.node(k).span,
                ));
            }
            let (p, d) = directive(vue_tree, el, DirectiveName::If)
                .or_else(|| directive(vue_tree, el, DirectiveName::ElseIf))
                .or_else(|| directive(vue_tree, el, DirectiveName::Else))
                .expect("a chain's elements have a condition");
            let test = if d.name == DirectiveName::Else {
                None
            } else {
                let e = expression_of(d, p.span)?;
                let e = self.expression(e)?;
                Some(self.root_expression(e))
            };
            let body = self.fragment_body(k, Some(identifier))?;
            let body = self.b.children(&body);
            match test {
                Some(test) => branches.push(Branch {
                    test,
                    body,
                    origin: vue_tree.origin[k],
                }),
                None => otherwise = Some(body),
            }
        }
        let branches = self.b.branches(branches);
        self.b.set_kind(
            identifier,
            SvelteNodeKind::If {
                branches,
                otherwise,
            },
        );
        Ok(identifier)
    }

    /// What a branch or a `v-for` renders: a `<template>`'s children, or the element itself.
    fn fragment_body(
        &mut self,
        k: CompilerNodeIdentifier,
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<Vec<SvelteNodeIdentifier>> {
        let vue_tree = self.vue_tree;
        let node = vue_tree.node(k);
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("directives sit on elements")
        };
        if el.tag_type == TagType::Template {
            let structural = |p: &Property| match &p.kind {
                PropertyKind::Directive(d) => {
                    matches!(
                        d.name,
                        DirectiveName::If
                            | DirectiveName::ElseIf
                            | DirectiveName::Else
                            | DirectiveName::For
                    ) || (d.name == DirectiveName::Bind
                        && d.arg
                            .as_ref()
                            .is_some_and(|a| a.text(self.source_text) == "key"))
                }
                PropertyKind::Attribute { .. } => false,
            };
            if let Some(p) = vue_tree.props(el.props).iter().find(|p| !structural(p)) {
                return Err(unsupported(
                    "an attribute on a `<template>` fragment",
                    p.span,
                ));
            }
            return self.list(vue_tree.children(el.children), parent);
        }
        Ok(vec![self.element(k, parent)?])
    }

    fn element_or_each(
        &mut self,
        k: CompilerNodeIdentifier,
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<SvelteNodeIdentifier> {
        let vue_tree = self.vue_tree;
        let NodeKind::Element(el) = &vue_tree.node(k).kind else {
            unreachable!("called on elements")
        };
        match directive(vue_tree, el, DirectiveName::For) {
            Some((p, d)) => self.each(k, p, d, parent),
            None => self.element(k, parent),
        }
    }

    /// `v-for`: an `{#each}` over `renderList`, which iterates arrays, strings, numbers and objects
    /// as Vue does. One alias is the block's context; with more, the context is an entry array
    /// the aliases are read from.
    #[expect(clippy::too_many_lines, reason = "one arm per alias shape Vue reads")]
    fn each(
        &mut self,
        at: CompilerNodeIdentifier,
        prop: &Property,
        dir: &Directive,
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<SvelteNodeIdentifier> {
        let (vue_tree, from) = (self.vue_tree, self.info.from);
        let node = vue_tree.node(at);
        let DirectiveExpression::For(f) = &dir.exp else {
            return Err(unsupported("a `v-for` without a value", prop.span));
        };
        if !dir.modifiers.is_empty() {
            return Err(unsupported("a `v-for` modifier", prop.span));
        }
        // `renderList` passes value, key and index; Vue leaves a fourth alias undefined.
        if !(1..=3).contains(&f.parameters.len()) {
            return Err(unsupported(
                "a `v-for` with no alias or more than three",
                prop.span,
            ));
        }
        for &param in &f.parameters {
            if !matches!(from.kind(param), Kind::Identifier(_)) {
                return Err(unsupported(
                    "a destructuring `v-for` alias",
                    span_of(from, param),
                ));
            }
            if let Some(b) = self.info.resolution.sem.binding_of(param) {
                let binding = &self.info.resolution.sem.bindings[b];
                if binding.writes > 0 {
                    return Err(unsupported(
                        "a write to a `v-for` alias",
                        span_of(from, param),
                    ));
                }
            }
        }
        let source = self.expression(f.source)?;
        let count = f.parameters.len();
        let parameters: Vec<String> = (0..count)
            .map(|i| self.names.fresh(from, ["value", "key", "index"][i]))
            .collect();
        let param_ids: Vec<NodeIdentifier> =
            parameters.iter().map(|p| self.to.identifier(p)).collect();
        let body = if count <= 1 {
            self.to.identifier(&parameters[0])
        } else {
            let items: Vec<NodeIdentifier> =
                parameters.iter().map(|p| self.to.identifier(p)).collect();
            self.to.array(&items, SourceLocation::SYNTHETIC)
        };
        let item = self
            .to
            .arrow(&param_ids, body, true, false, SourceLocation::SYNTHETIC);
        let render_list = self.helper(Helper::RenderList);
        let collection = self.to.call(
            render_list,
            &[source, item],
            false,
            SourceLocation::SYNTHETIC,
        );
        let collection = self.root_expression(collection);
        let outer = self.aliases.clone();
        let context = if count == 1 {
            self.to.ident(
                from.name(f.parameters[0]),
                from.source_location(f.parameters[0]),
            )
        } else {
            let entry = self.names.fresh(from, "entry");
            for (i, &param) in f.parameters.iter().enumerate() {
                if let Some(b) = self.info.resolution.sem.binding_of(param) {
                    self.aliases.insert(b, (entry.clone(), i as u32));
                }
            }
            self.to.ident(&entry, from.source_location(f.parameters[0]))
        };
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("called on elements")
        };
        let key = match directive_key(vue_tree, el, self.source_text) {
            Some((kp, kd)) => {
                let key = expression_of(kd, kp.span)?;
                let key = self.expression(key)?;
                self.root_expression(key)
            }
            None => NodeIdentifier::NONE,
        };
        let placeholder = SvelteNodeKind::Comment {
            data: Span::default(),
        };
        let identifier = self
            .b
            .node(placeholder, node.span, parent, vue_tree.origin[at]);
        let body = self.fragment_body(at, Some(identifier))?;
        let body = self.b.children(&body);
        self.aliases = outer;
        self.b.set_kind(
            identifier,
            SvelteNodeKind::Each(Each {
                collection,
                context,
                index: NodeIdentifier::NONE,
                key,
                body,
                fallback: None,
            }),
        );
        Ok(identifier)
    }

    #[expect(
        clippy::too_many_lines,
        reason = "one arm per attribute shape Vue reads"
    )]
    fn element(
        &mut self,
        k: CompilerNodeIdentifier,
        parent: Option<SvelteNodeIdentifier>,
    ) -> R<SvelteNodeIdentifier> {
        let (vue_tree, source_text) = (self.vue_tree, self.source_text);
        let node = vue_tree.node(k);
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("called on elements")
        };
        if el.tag_type != TagType::Element {
            return Err(unsupported(
                "a component, `<slot>` or `<template>`",
                el.tag.span(),
            ));
        }
        let rsvelte_vue::compiler_syntax_tree::Name::Source(name) = el.tag else {
            return Err(unsupported("a spelled tag name", el.tag.span()));
        };
        let tag = name.text(source_text);
        if tag.bytes().any(|c| c.is_ascii_uppercase()) {
            return Err(unsupported("an element name with uppercase letters", name));
        }
        let child_nodes = vue_tree.children(el.children);
        if tag == "pre"
            && let Some(NodeKind::Text(t)) = child_nodes.first().map(|&c| &vue_tree.node(c).kind)
            && t.text(source_text).starts_with(['\n', '\r'])
        {
            return Err(unsupported(
                "a `<pre>` whose text starts with a line break (the HTML parser drops it)",
                node.span,
            ));
        }
        let fallthrough = self.roots.contains(&k).then_some(self.attributes).flatten();
        let start_tag = node.span;
        let kind = self.b.element_kind(tag, parent);
        let identifier = self.b.node(
            SvelteNodeKind::Comment {
                data: Span::default(),
            },
            node.span,
            parent,
            vue_tree.origin[k],
        );
        let props = vue_tree.props(el.props);
        let mut attributes: Vec<Attribute> = Vec::new();
        let mut class: Vec<NodeIdentifier> = Vec::new();
        let mut class_at: Option<(usize, Span, u32)> = None;
        let mut model: Option<(&Property, &Directive)> = None;
        let mut events: Vec<String> = Vec::new();
        let static_attribute = |name: &str| {
            props.iter().find_map(|p| match &p.kind {
                PropertyKind::Attribute { name: n, value } if n.text(source_text) == name => {
                    Some(value.as_ref().map_or("", |v| v.text(source_text)))
                }
                _ => None,
            })
        };
        let bound = |name: &str| {
            props.iter().any(|p| match &p.kind {
                PropertyKind::Directive(d) => {
                    d.name == DirectiveName::Bind
                        && d.arg.as_ref().is_some_and(|a| a.text(source_text) == name)
                }
                PropertyKind::Attribute { .. } => false,
            })
        };
        let attribute = |name: svelte::Name, value: AttributeValue, p: &Property| Attribute {
            name,
            value,
            span: p.span,
            owner: identifier,
            origin: p.origin,
        };
        for p in props {
            match &p.kind {
                PropertyKind::Attribute { name: n, value } => {
                    let n_text = n.text(source_text);
                    let value_text = value.as_ref().map(|v| v.text(source_text));
                    check_name(n_text, p.span)?;
                    if attributes
                        .iter()
                        .any(|a| a.name.text(source_text) == n_text)
                    {
                        return Err(unsupported("an attribute written twice", p.span));
                    }
                    match n_text {
                        "class" => {
                            let v = self.to.write_string(value_text.unwrap_or_default());
                            class.push(v);
                            class_at = Some((attributes.len(), p.span, p.origin));
                            continue;
                        }
                        "style" if fallthrough.is_some() => {
                            return Err(unsupported(
                                "a `style` on an element attributes fall through to",
                                p.span,
                            ));
                        }
                        "key" | "ref" | "is" => {
                            return Err(unsupported(
                                format_args!("the attribute `{n_text}`"),
                                p.span,
                            ));
                        }
                        "value" if tag == "input" => {
                            let v = self.to.write_string(value_text.unwrap_or_default());
                            let v = self.root_expression(v);
                            attributes.push(attribute(
                                svelte::Name::Source(n.span()),
                                AttributeValue::Expression {
                                    expression: v,
                                    quoted: false,
                                },
                                p,
                            ));
                            continue;
                        }
                        "value" if tag != "option" => {
                            return Err(unsupported(
                                "a static `value` other than on `<input>` and `<option>`",
                                p.span,
                            ));
                        }
                        _ => {}
                    }
                    if !reflects_as_written(n_text, tag) {
                        return Err(unsupported(
                            format_args!(
                                "the static attribute `{n_text}` here (Vue sets it as a DOM \
                                 property that does not reflect it as written)"
                            ),
                            p.span,
                        ));
                    }
                    if is_boolean_attribute(n_text) && value_text.is_some_and(|v| !v.is_empty()) {
                        return Err(unsupported(
                            format_args!("a value on the boolean attribute `{n_text}`"),
                            p.span,
                        ));
                    }
                    let value = value.as_ref().map_or(AttributeValue::Boolean, |v| {
                        AttributeValue::Static(v.text(source_text).into())
                    });
                    attributes.push(attribute(svelte::Name::Source(n.span()), value, p));
                }
                PropertyKind::Directive(d) => match d.name {
                    DirectiveName::If
                    | DirectiveName::ElseIf
                    | DirectiveName::Else
                    | DirectiveName::For => {}
                    DirectiveName::Model => {
                        if model.is_some() {
                            return Err(unsupported("two `v-model`s on one element", p.span));
                        }
                        model = Some((p, d));
                    }
                    DirectiveName::Bind => {
                        let arg = d
                            .arg
                            .as_ref()
                            .expect("the parser requires an argument")
                            .text(source_text);
                        if !d.modifiers.is_empty() {
                            return Err(unsupported("a `v-bind` modifier", p.span));
                        }
                        check_name(arg, p.span)?;
                        if attributes.iter().any(|a| a.name.text(source_text) == arg) {
                            return Err(unsupported("an attribute written twice", p.span));
                        }
                        let e = expression_of(d, p.span)?;
                        match arg {
                            "key" if directive(vue_tree, el, DirectiveName::For).is_some() => {
                                continue;
                            }
                            "class" => {
                                class.push(self.expression(e)?);
                                if class_at.is_none() {
                                    class_at = Some((attributes.len(), p.span, p.origin));
                                }
                                continue;
                            }
                            "key" | "ref" | "is" | "style" | "hidden" | "autofocus" => {
                                return Err(unsupported(format_args!("`:{arg}`"), p.span));
                            }
                            "value"
                                if tag == "input"
                                    && model.is_none()
                                    && directive(vue_tree, el, DirectiveName::Model).is_none() => {}
                            "value" => {
                                return Err(unsupported(
                                    "`:value` other than on an `<input>` without `v-model`",
                                    p.span,
                                ));
                            }
                            _ if !reflects_as_written(arg, tag) => {
                                return Err(unsupported(
                                    format_args!(
                                        "`:{arg}` here (Vue sets it as a DOM property that does \
                                         not reflect it as written)"
                                    ),
                                    p.span,
                                ));
                            }
                            _ => {}
                        }
                        let v = self.expression(e)?;
                        let v = if is_boolean_attribute(arg) {
                            self.boolean_value(v)
                        } else if self.info.target == Target::Server {
                            self.renderable_value(v)
                        } else {
                            v
                        };
                        let v = self.root_expression(v);
                        attributes.push(attribute(
                            svelte::Name::Spelled {
                                text: arg.into(),
                                span: p.span,
                            },
                            AttributeValue::Expression {
                                expression: v,
                                quoted: false,
                            },
                            p,
                        ));
                    }
                    DirectiveName::On => {
                        let (event, handler) = self.handler(p, d)?;
                        if events.contains(&event) {
                            return Err(unsupported("two listeners for one event", p.span));
                        }
                        let handler = self.root_expression(handler);
                        attributes.push(attribute(
                            svelte::Name::Spelled {
                                text: format!("on{event}").into(),
                                span: p.span,
                            },
                            AttributeValue::Expression {
                                expression: handler,
                                quoted: false,
                            },
                            p,
                        ));
                        events.push(event);
                    }
                },
            }
        }
        if let Some((p, d)) = model {
            if tag == "input"
                && static_attribute("type").is_none_or(|t| !matches!(t, "checkbox" | "radio"))
            {
                for e in &events {
                    if matches!(e.as_str(), "compositionstart" | "compositionend") {
                        return Err(unsupported(
                            "a composition listener beside `v-model` (Svelte attaches it before \
                             Vue's own)",
                            p.span,
                        ));
                    }
                }
            }
            if bound("type")
                || bound("true-value")
                || bound("false-value")
                || static_attribute("true-value").is_some()
                || static_attribute("false-value").is_some()
            {
                return Err(unsupported(
                    "`v-model` with a bound `type`, `true-value` or `false-value`",
                    p.span,
                ));
            }
            let value = static_attribute("value");
            let ty = static_attribute("type");
            let attribute_value = self.model(tag, ty, value, p, d)?;
            if let Some(v) = attribute_value {
                attributes.push(v(identifier, p));
            }
        }
        if tag == "option"
            && let Some(m) = self.select_model
            && static_attribute("selected").is_none()
            && !bound("selected")
        {
            attributes.push(self.ssr_option_selected(
                m,
                static_attribute("value"),
                identifier,
                node.span,
            )?);
        }
        if fallthrough.is_some()
            || class.len() > 1
            || class
                .iter()
                .any(|&c| !matches!(self.to.kind(c), Kind::String))
        {
            self.dynamic_class(&mut attributes, &class, class_at, fallthrough, identifier);
        } else if let (Some(&c), Some((at, span, origin))) = (class.first(), class_at) {
            let v = self.to.str_value(c, source_text).into();
            attributes.insert(
                at,
                Attribute {
                    name: svelte::Name::Spelled {
                        text: "class".into(),
                        span,
                    },
                    value: AttributeValue::Static(v),
                    span,
                    owner: identifier,
                    origin,
                },
            );
        }
        let attributes = self.b.attributes(attributes);
        self.b.set_kind(
            identifier,
            SvelteNodeKind::Element(SvelteElement {
                name,
                kind,
                attributes,
                children: svelte::Children::default(),
                start_tag,
            }),
        );
        let outer = self.select_model;
        self.select_model = match (tag, model) {
            ("optgroup", _) => outer,
            ("select", Some((p, d))) if self.info.target == Target::Server => {
                Some(expression_of(d, p.span)?)
            }
            _ => None,
        };
        let children = self.list(child_nodes, Some(identifier));
        self.select_model = outer;
        let children = self.b.children(&children?);
        self.b.set_element_children(identifier, children);
        Ok(identifier)
    }

    /// `class={normalizeClass([…own, attrs.class])}`, at the own class's position or last.
    fn dynamic_class(
        &mut self,
        attributes: &mut Vec<Attribute>,
        class: &[NodeIdentifier],
        at: Option<(usize, Span, u32)>,
        fallthrough: Option<&str>,
        owner: SvelteNodeIdentifier,
    ) {
        let normalize = |t: &mut Self, items: &[NodeIdentifier]| {
            let list = t.to.array(items, SourceLocation::SYNTHETIC);
            let callee = t.helper(Helper::NormalizeClass);
            t.to.call0(callee, &[list])
        };
        let own = match class {
            [] => None,
            &[only] if matches!(self.to.kind(only), Kind::String) => Some(only),
            _ => Some(normalize(self, class)),
        };
        let value = match fallthrough {
            None => own,
            Some(a) => {
                // runtime-core `mergeProps` merges the class only when the attributes carry one,
                // and Vue renders a `class` attribute exactly when the props have the key.
                let key = self.to.write_string("class");
                let o = self.to.identifier(a);
                let has = self
                    .to
                    .binary(BinaryOperator::In, key, o, SourceLocation::SYNTHETIC);
                let mut items = class.to_vec();
                let o = self.to.identifier(a);
                items.push(self.to.dot(o, "class"));
                let merged = normalize(self, &items);
                let (spread, value) = if let Some(own) = own {
                    let value = self.to.cond(has, merged, own, SourceLocation::SYNTHETIC);
                    (self.to.identifier(a), Some(value))
                } else {
                    // `{...attrs}` with its class normalized: a class attribute after a spread
                    // always renders, even for `undefined`.
                    let o = self.to.identifier(a);
                    let rest = self.to.spread(o, SourceLocation::SYNTHETIC);
                    let key = self.to.identifier("class");
                    let class = self.to.property(key, merged, 0, SourceLocation::SYNTHETIC);
                    let with_class = self.to.object(&[rest, class], SourceLocation::SYNTHETIC);
                    let plain = self.to.identifier(a);
                    (
                        self.to
                            .cond(has, with_class, plain, SourceLocation::SYNTHETIC),
                        None,
                    )
                };
                let spread = self.root_expression(spread);
                attributes.push(Attribute {
                    name: svelte::Name::Spelled {
                        text: "".into(),
                        span: Span::default(),
                    },
                    value: AttributeValue::Spread(spread),
                    span: Span::default(),
                    owner,
                    origin: u32::MAX,
                });
                value
            }
        };
        let Some(value) = value else {
            return;
        };
        let value = self.root_expression(value);
        let (index, span, origin) = match at {
            Some(at) if fallthrough.is_none() => at,
            Some((_, span, origin)) => (attributes.len(), span, origin),
            None => (attributes.len(), Span::default(), u32::MAX),
        };
        attributes.insert(
            index,
            Attribute {
                name: svelte::Name::Spelled {
                    text: "class".into(),
                    span,
                },
                value: AttributeValue::Expression {
                    expression: value,
                    quoted: false,
                },
                span,
                owner,
                origin,
            },
        );
    }

    /// runtime-dom `patchDOMProp` for a boolean property, and server-renderer's
    /// `includeBooleanAttr`: present for any truthy value and for `''`.
    fn boolean_value(&mut self, v: NodeIdentifier) -> NodeIdentifier {
        let callee = if self.info.target == Target::Server {
            self.helper(Helper::SsrIncludeBooleanAttribute)
        } else {
            let name = if let Some(name) = &self.boolean_attribute {
                name.clone()
            } else {
                let name = self.names.fresh(self.info.from, "includeBooleanAttr");
                let declaration =
                    include_boolean_attribute(self.to, &name, self.names, self.info.from);
                self.hoisted.push(declaration);
                self.boolean_attribute = Some(name.clone());
                name
            };
            self.to.identifier(&name)
        };
        self.to.call0(callee, &[v])
    }

    /// server-renderer `isRenderableAttrValue`: Vue renders only strings, numbers and booleans.
    fn renderable_value(&mut self, v: NodeIdentifier) -> NodeIdentifier {
        let name = if let Some(name) = &self.renderable {
            name.clone()
        } else {
            let name = self.names.fresh(self.info.from, "renderable");
            let declaration = renderable(self.to, &name, self.names, self.info.from);
            self.hoisted.push(declaration);
            self.renderable = Some(name.clone());
            name
        };
        let callee = self.to.identifier(&name);
        self.to.call0(callee, &[v])
    }

    /// `@event.modifiers="handler"`, as compiler-core `transformOn` and compiler-dom's
    /// `resolveModifiers` build it.
    fn handler(&mut self, p: &Property, d: &Directive) -> R<(String, NodeIdentifier)> {
        let (source_text, from) = (self.source_text, self.info.from);
        let event = d
            .arg
            .as_ref()
            .expect("the parser requires an argument")
            .text(source_text);
        if event.is_empty() || !event.bytes().all(|c| c.is_ascii_lowercase()) {
            return Err(unsupported(
                "an event name other than lowercase letters (Vue hyphenates it, Svelte \
                 lowercases it)",
                p.span,
            ));
        }
        let e = expression_of(d, p.span)?;
        let mut handler = match from.kind(e) {
            Kind::Arrow { .. } => self.expression(e)?,
            Kind::Function { .. } => {
                return Err(unsupported(
                    "a `function` expression as a handler (its `this` differs)",
                    span_of(from, e),
                ));
            }
            Kind::Identifier(_) => {
                let function = self.info.resolution.sem.binding_of(e).is_some_and(|b| {
                    let binding = &self.info.resolution.sem.bindings[b];
                    binding.scope == rsvelte_javascript::scope::ScopeIdentifier::ROOT
                        && (binding.kind == DeclarationKind::Function
                            || (binding.kind == DeclarationKind::Const
                                && binding.initializer(from).is_some_and(|i| {
                                    matches!(
                                        from.kind(i),
                                        Kind::Arrow { .. } | Kind::Function { .. }
                                    )
                                })))
                });
                if !function {
                    return Err(unsupported(
                        "a handler named by something other than a function the script declares",
                        span_of(from, e),
                    ));
                }
                self.expression(e)?
            }
            Kind::Member { .. } => {
                return Err(unsupported(
                    "a member expression as a handler",
                    span_of(from, e),
                ));
            }
            _ => {
                let event_param = self.names.fresh(from, "event");
                let aliases = std::mem::take(&mut self.aliases);
                let mut rewriter = Rewriter::new(self.info, true, &aliases);
                rewriter.event = Some(&event_param);
                let body = rewriter.copy(self.to, e);
                self.aliases = aliases;
                let body = body?;
                let param = self.to.identifier(&event_param);
                self.to
                    .arrow(&[param], body, true, false, SourceLocation::SYNTHETIC)
            }
        };
        let mut non_key = Vec::new();
        let mut keys = Vec::new();
        for m in &d.modifiers {
            let m = m.text(source_text);
            match m {
                "stop" | "prevent" | "self" | "ctrl" | "shift" | "alt" | "meta" | "exact" => {
                    non_key.push(m);
                }
                "once" | "passive" | "capture" | "left" | "right" | "middle" | "native" => {
                    return Err(unsupported(
                        format_args!("the event modifier `.{m}`"),
                        p.span,
                    ));
                }
                _ => keys.push(m),
            }
        }
        if !non_key.is_empty() {
            let callee = self.helper(Helper::WithModifiers);
            let list: Vec<NodeIdentifier> =
                non_key.iter().map(|m| self.to.write_string(m)).collect();
            let list = self.to.array(&list, SourceLocation::SYNTHETIC);
            handler = self.to.call0(callee, &[handler, list]);
        }
        if !keys.is_empty() && matches!(event, "keyup" | "keydown" | "keypress") {
            let callee = self.helper(Helper::WithKeys);
            let list: Vec<NodeIdentifier> = keys.iter().map(|m| self.to.write_string(m)).collect();
            let list = self.to.array(&list, SourceLocation::SYNTHETIC);
            handler = self.to.call0(callee, &[handler, list]);
        }
        Ok((event.to_owned(), handler))
    }

    /// `v-model`. On the client, Vue's own directive runs on the element through an attachment;
    /// on the server, the attribute compiler-ssr's `ssrTransformModel` renders.
    #[expect(clippy::type_complexity, reason = "an attribute waiting for its owner")]
    fn model(
        &mut self,
        tag: &str,
        ty: Option<&str>,
        value: Option<&str>,
        p: &Property,
        d: &Directive,
    ) -> R<Option<Box<dyn FnOnce(SvelteNodeIdentifier, &Property) -> Attribute>>> {
        let (source_text, from) = (self.source_text, self.info.from);
        if d.arg.is_some() {
            return Err(unsupported("a `v-model` argument on an element", p.span));
        }
        let exp = expression_of(d, p.span)?;
        if !matches!(from.kind(exp), Kind::Identifier(_) | Kind::Member { .. }) {
            return Err(unsupported(
                "a `v-model` value other than a variable or a member",
                span_of(from, exp),
            ));
        }
        self.check_model_target(exp)?;
        let dir = match (tag, ty) {
            ("input", Some("checkbox")) => Helper::VModelCheckbox,
            ("input", Some("radio")) => Helper::VModelRadio,
            ("input", Some("file")) => {
                return Err(unsupported("`v-model` on a file input", p.span));
            }
            ("input", _) => {
                if value.is_some() {
                    return Err(unsupported("`v-model` beside a `value`", p.span));
                }
                Helper::VModelText
            }
            ("select", _) => Helper::VModelSelect,
            _ => {
                return Err(unsupported(format_args!("`v-model` on `<{tag}>`"), p.span));
            }
        };
        let mut modifiers = Vec::new();
        for m in &d.modifiers {
            let m = m.text(source_text);
            if !matches!(m, "lazy" | "number" | "trim") {
                return Err(unsupported(
                    format_args!("the `v-model` modifier `.{m}`"),
                    p.span,
                ));
            }
            modifiers.push(m);
        }
        if self.info.target == Target::Server {
            return self.ssr_model(dir, exp, value);
        }
        let model = self.expression(exp)?;
        let callee = self.helper(dir);
        let mods: Vec<NodeIdentifier> = modifiers
            .iter()
            .map(|m| {
                let key = self.to.identifier(m);
                let yes = self.to.write_boolean(true, SourceLocation::SYNTHETIC);
                self.to.property(key, yes, 0, SourceLocation::SYNTHETIC)
            })
            .collect();
        let mods = self.to.object(&mods, SourceLocation::SYNTHETIC);
        let param = self.names.fresh(from, "value");
        let target = self.expression(exp)?;
        let new_value = self.to.identifier(&param);
        let assign = self.to.assign(
            AssignmentOperator::Assign,
            target,
            new_value,
            SourceLocation::SYNTHETIC,
        );
        let param_id = self.to.identifier(&param);
        let assigner = self
            .to
            .arrow(&[param_id], assign, true, false, SourceLocation::SYNTHETIC);
        let key = self.to.write_string("onUpdate:modelValue");
        let mut props = vec![
            self.to
                .property(key, assigner, 0, SourceLocation::SYNTHETIC),
        ];
        for (name, text) in [("type", ty), ("value", value)] {
            if let Some(text) = text {
                let key = self.to.identifier(name);
                let text = self.to.write_string(text);
                props.push(self.to.property(key, text, 0, SourceLocation::SYNTHETIC));
            }
        }
        let props = self.to.object(&props, SourceLocation::SYNTHETIC);
        let vmodel = self.vmodel_helper();
        let vmodel = self.to.identifier(&vmodel);
        let call = self.to.call(
            vmodel,
            &[callee, model, mods, props],
            false,
            SourceLocation::from(p.span),
        );
        let call = self.root_expression(call);
        Ok(Some(Box::new(move |owner, p| Attribute {
            name: svelte::Name::Spelled {
                text: "".into(),
                span: p.span,
            },
            value: AttributeValue::Attach(call),
            span: p.span,
            owner,
            origin: p.origin,
        })))
    }

    #[expect(clippy::type_complexity, reason = "an attribute waiting for its owner")]
    fn ssr_model(
        &mut self,
        dir: Helper,
        e: NodeIdentifier,
        value: Option<&str>,
    ) -> R<Option<Box<dyn FnOnce(SvelteNodeIdentifier, &Property) -> Attribute>>> {
        let (name, v) = match dir {
            Helper::VModelText => {
                let m = self.expression(e)?;
                ("value", self.renderable_value(m))
            }
            Helper::VModelCheckbox => {
                let value = self.value_or_null(value);
                let test = self.is_array(e)?;
                let m = self.expression(e)?;
                let contain = self.helper(Helper::SsrLooseContain);
                let contain = self.to.call0(contain, &[m, value]);
                let m = self.expression(e)?;
                let c = self.to.cond(test, contain, m, SourceLocation::SYNTHETIC);
                ("checked", self.ssr_boolean(c))
            }
            Helper::VModelRadio => {
                let value = self.value_or_null(value);
                let m = self.expression(e)?;
                let eq = self.helper(Helper::SsrLooseEqual);
                let eq = self.to.call0(eq, &[m, value]);
                ("checked", self.ssr_boolean(eq))
            }
            _ => return Ok(None),
        };
        let v = self.root_expression(v);
        Ok(Some(Box::new(move |owner, p| Attribute {
            name: svelte::Name::Spelled {
                text: name.into(),
                span: p.span,
            },
            value: AttributeValue::Expression {
                expression: v,
                quoted: false,
            },
            span: p.span,
            owner,
            origin: p.origin,
        })))
    }

    /// compiler-ssr `processOption`.
    fn ssr_option_selected(
        &mut self,
        model: NodeIdentifier,
        value: Option<&str>,
        owner: SvelteNodeIdentifier,
        span: Span,
    ) -> R<Attribute> {
        let test = self.is_array(model)?;
        let v = self.value_or_null(value);
        let m = self.expression(model)?;
        let contain = self.helper(Helper::SsrLooseContain);
        let contain = self.to.call0(contain, &[m, v]);
        let value = self.value_or_null(value);
        let m = self.expression(model)?;
        let eq = self.helper(Helper::SsrLooseEqual);
        let eq = self.to.call0(eq, &[m, value]);
        let c = self.to.cond(test, contain, eq, SourceLocation::SYNTHETIC);
        let v = self.ssr_boolean(c);
        let v = self.root_expression(v);
        Ok(Attribute {
            name: svelte::Name::Spelled {
                text: "selected".into(),
                span,
            },
            value: AttributeValue::Expression {
                expression: v,
                quoted: false,
            },
            span,
            owner,
            origin: u32::MAX,
        })
    }

    fn value_or_null(&mut self, value: Option<&str>) -> NodeIdentifier {
        match value {
            Some(v) => self.to.write_string(v),
            None => self.to.null(SourceLocation::SYNTHETIC),
        }
    }

    fn is_array(&mut self, e: NodeIdentifier) -> R<NodeIdentifier> {
        let m = self.expression(e)?;
        let array = self.to.identifier("Array");
        let is_array = self.to.dot(array, "isArray");
        Ok(self.to.call0(is_array, &[m]))
    }

    fn ssr_boolean(&mut self, v: NodeIdentifier) -> NodeIdentifier {
        let callee = self.helper(Helper::SsrIncludeBooleanAttribute);
        self.to.call0(callee, &[v])
    }

    /// What `v-model` may assign: not a prop, a computed, a `v-for` alias, a constant or an
    /// unresolved name.
    fn check_model_target(&self, e: NodeIdentifier) -> R<()> {
        let from = self.info.from;
        let mut root = e;
        while let Kind::Member { object, .. } = from.kind(root) {
            root = object;
        }
        if root == e {
            let ok = self.info.resolution.sem.binding_of(e).is_some_and(|b| {
                let binding = &self.info.resolution.sem.bindings[b];
                self.info.class.get(&b) == Some(&Class::Ref)
                    || (binding.scope == rsvelte_javascript::scope::ScopeIdentifier::ROOT
                        && matches!(
                            binding.kind,
                            DeclarationKind::Let | DeclarationKind::Variable
                        ))
            });
            if !ok {
                return Err(unsupported(
                    "`v-model` on something other than a ref or a variable",
                    span_of(from, e),
                ));
            }
        } else if matches!(from.kind(root), Kind::Identifier(_))
            && self
                .info
                .class_of(root)
                .is_some_and(|c| matches!(c, Class::Props | Class::Computed))
        {
            return Err(unsupported(
                "`v-model` on a prop or a computed",
                span_of(from, e),
            ));
        }
        Ok(())
    }

    fn vmodel_helper(&mut self) -> String {
        if let Some(n) = &self.vmodel {
            return n.clone();
        }
        let from = self.info.from;
        let name = self.names.fresh(from, "vmodel");
        let untrack = self.names.helper(from, Helper::Untrack);
        let declarations = vmodel(self.to, &name, &untrack, self.names, from);
        self.hoisted.extend(declarations);
        self.vmodel = Some(name.clone());
        name
    }
}

/// The `:key` of a `v-for` element.
fn directive_key<'h>(
    compiler_syntax_tree: &'h CompilerSyntaxTree,
    el: &Element,
    source_text: &str,
) -> Option<(&'h Property, &'h Directive)> {
    compiler_syntax_tree
        .props(el.props)
        .iter()
        .find_map(|p| match &p.kind {
            PropertyKind::Directive(d)
                if d.name == DirectiveName::Bind
                    && d.arg.as_ref().is_some_and(|a| a.text(source_text) == "key") =>
            {
                Some((p, d))
            }
            _ => None,
        })
}

fn check_name(name: &str, span: Span) -> R<()> {
    if name.is_empty()
        || !name
            .bytes()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == b'-')
    {
        return Err(unsupported(
            format_args!("the attribute name `{name}` (svue takes lowercase names)"),
            span,
        ));
    }
    Ok(())
}

/// `@vue/shared`'s `isBooleanAttr` with `isSpecialBooleanAttr`.
fn is_boolean_attribute(name: &str) -> bool {
    matches!(
        name,
        "itemscope"
            | "allowfullscreen"
            | "formnovalidate"
            | "ismap"
            | "nomodule"
            | "novalidate"
            | "readonly"
            | "async"
            | "autofocus"
            | "autoplay"
            | "controls"
            | "default"
            | "defer"
            | "disabled"
            | "hidden"
            | "inert"
            | "loop"
            | "open"
            | "required"
            | "reversed"
            | "scoped"
            | "seamless"
            | "checked"
            | "muted"
            | "multiple"
            | "selected"
    )
}

/// Whether Vue's runtime leaves the attribute as written: runtime-dom's `shouldSetAsProp` sets
/// some names as DOM properties, and these properties either do not reflect to the attribute or
/// reflect it converted (to a number, or for `value` not at all).
fn reflects_as_written(name: &str, tag: &str) -> bool {
    match name {
        "checked" | "selected" | "muted" | "autofocus" | "indeterminate" | "start" | "size"
        | "span" | "high" | "low" | "optimum" | "srcobject" | "innerhtml" | "textcontent"
        | "innertext" => false,
        "min" | "max" => tag == "input",
        "width" | "height" => matches!(tag, "img" | "video" | "canvas" | "source"),
        _ => true,
    }
}

fn function_declaration(
    to: &mut SyntaxTree,
    name: &str,
    parameters: &[&str],
    body: &[NodeIdentifier],
) -> NodeIdentifier {
    let name = to.identifier(name);
    let parameters: Vec<NodeIdentifier> = parameters.iter().map(|p| to.identifier(p)).collect();
    let block = to.block(body, SourceLocation::SYNTHETIC);
    to.function(
        true,
        Some(name),
        &parameters,
        block,
        false,
        SourceLocation::SYNTHETIC,
    )
}

/// `function includeBooleanAttr(value) { return !!value || value === ''; }`
fn include_boolean_attribute(
    to: &mut SyntaxTree,
    name: &str,
    names: &mut Names,
    from: &SyntaxTree,
) -> NodeIdentifier {
    let v = names.fresh(from, "value");
    let a = to.identifier(&v);
    let not = to.unary(UnaryOperator::Not, a, SourceLocation::SYNTHETIC);
    let not = to.unary(UnaryOperator::Not, not, SourceLocation::SYNTHETIC);
    let a = to.identifier(&v);
    let empty = to.write_string("");
    let eq = to.binary(
        BinaryOperator::StrictEq,
        a,
        empty,
        SourceLocation::SYNTHETIC,
    );
    let or = to.logical(LogicalOperator::Or, not, eq, SourceLocation::SYNTHETIC);
    let ret = to.return_(Some(or), SourceLocation::SYNTHETIC);
    function_declaration(to, name, &[&v], &[ret])
}

/// `function renderable(value) { return typeof value === 'string' || … ? value : undefined; }`
fn renderable(
    to: &mut SyntaxTree,
    name: &str,
    names: &mut Names,
    from: &SyntaxTree,
) -> NodeIdentifier {
    let v = names.fresh(from, "value");
    let mut test = None;
    for ty in ["string", "number", "boolean"] {
        let a = to.identifier(&v);
        let t = to.unary(UnaryOperator::TypeOf, a, SourceLocation::SYNTHETIC);
        let s = to.write_string(ty);
        let eq = to.binary(BinaryOperator::StrictEq, t, s, SourceLocation::SYNTHETIC);
        test = Some(test.map_or(eq, |l| {
            to.logical(LogicalOperator::Or, l, eq, SourceLocation::SYNTHETIC)
        }));
    }
    let a = to.identifier(&v);
    let undefined = to.identifier("undefined");
    let c = to.cond(
        test.expect("three types"),
        a,
        undefined,
        SourceLocation::SYNTHETIC,
    );
    let ret = to.return_(Some(c), SourceLocation::SYNTHETIC);
    function_declaration(to, name, &[&v], &[ret])
}

/// Vue's directive hooks, run on a Svelte element:
///
/// ```js
/// const bindings = new WeakMap();
/// function vmodel(dir, value, modifiers, props) {
///   if (dir.deep) traverse(value);
///   return (el) => untrack(() => {
///     const vnode = { props };
///     let binding = bindings.get(el);
///     if (binding === undefined) {
///       binding = { value, oldValue: undefined, modifiers };
///       bindings.set(el, binding);
///       dir.created?.(el, binding, vnode);
///       dir.mounted?.(el, binding, vnode);
///     } else {
///       binding.oldValue = binding.value;
///       binding.value = value;
///       dir.beforeUpdate?.(el, binding, vnode);
///       dir.updated?.(el, binding, vnode);
///     }
///   });
/// }
/// function traverse(value, seen = new Set()) {
///   if (typeof value !== 'object' || value === null || seen.has(value)) return;
///   seen.add(value);
///   if (Array.isArray(value)) for (let i = 0; i < value.length; i++) traverse(value[i], seen);
///   else if (value instanceof Set || value instanceof Map)
///     value.forEach((v) => traverse(v, seen));
///   else if (Object.prototype.toString.call(value) === '[object Object]')
///     for (const key of Object.keys(value)) traverse(value[key], seen);
/// }
/// ```
///
/// The getter runs in the attachment's tracked scope, so a deep directive (`vModelCheckbox`,
/// `vModelSelect`) re-runs its update hooks when the value changes inside, as reactivity-core's
/// `traverse` makes a Vue render do; the hooks themselves run untracked, as Vue runs them with
/// tracking paused.
#[expect(
    clippy::too_many_lines,
    clippy::many_single_char_names,
    reason = "builds one helper, one node at a time"
)]
fn vmodel(
    to: &mut SyntaxTree,
    name: &str,
    untrack: &str,
    names: &mut Names,
    from: &SyntaxTree,
) -> Vec<NodeIdentifier> {
    let bindings = names.fresh(from, "vmodelBindings");
    let traverse = names.fresh(from, "traverse");
    let n = |names: &mut Names, base: &str| names.fresh(from, base);
    let (dir, value, modifiers, props) = (
        n(names, "dir"),
        n(names, "value"),
        n(names, "modifiers"),
        n(names, "props"),
    );
    let (el, vnode, binding) = (n(names, "el"), n(names, "vnode"), n(names, "binding"));
    let (seen, item, i) = (n(names, "seen"), n(names, "item"), n(names, "i"));
    let identifier = |to: &mut SyntaxTree, s: &str| to.identifier(s);
    let statement = |to: &mut SyntaxTree, e: NodeIdentifier| to.expression_statement(e);
    let hook = |to: &mut SyntaxTree, hook: &str| {
        let d = to.identifier(&dir);
        let h = to.identifier(hook);
        let callee = to.member(d, h, false, false, SourceLocation::SYNTHETIC);
        let arguments = [
            to.identifier(&el),
            to.identifier(&binding),
            to.identifier(&vnode),
        ];
        let call = to.call(callee, &arguments, true, SourceLocation::SYNTHETIC);
        to.expression_statement(call)
    };
    let set_prop = |to: &mut SyntaxTree, object: &str, prop: &str, value: NodeIdentifier| {
        let o = to.identifier(object);
        let target = to.dot(o, prop);
        let a = to.assign(
            AssignmentOperator::Assign,
            target,
            value,
            SourceLocation::SYNTHETIC,
        );
        to.expression_statement(a)
    };

    let weak_map = identifier(to, "WeakMap");
    let new_map = to.new_(weak_map, &[], SourceLocation::SYNTHETIC);
    let b = identifier(to, &bindings);
    let bindings_declaration = to.let_(flag::CONST, b, Some(new_map));

    // The hooks.
    let mut inner = Vec::new();
    let props_ref = identifier(to, &props);
    let props_key = identifier(to, "props");
    let vnode_props = to.property(props_key, props_ref, 0, SourceLocation::SYNTHETIC);
    let vnode_obj = to.object(&[vnode_props], SourceLocation::SYNTHETIC);
    let vn = identifier(to, &vnode);
    inner.push(to.let_(flag::CONST, vn, Some(vnode_obj)));
    let b = identifier(to, &bindings);
    let get = to.dot(b, "get");
    let e = identifier(to, &el);
    let get = to.call0(get, &[e]);
    let bn = identifier(to, &binding);
    inner.push(to.let_(flag::LET, bn, Some(get)));
    let bn = identifier(to, &binding);
    let undefined = identifier(to, "undefined");
    let test = to.binary(
        BinaryOperator::StrictEq,
        bn,
        undefined,
        SourceLocation::SYNTHETIC,
    );
    let mut created = Vec::new();
    let fields: Vec<NodeIdentifier> = [
        ("value", value.as_str()),
        ("oldValue", "undefined"),
        ("modifiers", modifiers.as_str()),
    ]
    .iter()
    .map(|&(k, v)| {
        let key = to.identifier(k);
        let val = to.identifier(v);
        to.property(key, val, 0, SourceLocation::SYNTHETIC)
    })
    .collect();
    let obj = to.object(&fields, SourceLocation::SYNTHETIC);
    let bn = identifier(to, &binding);
    let a = to.assign(
        AssignmentOperator::Assign,
        bn,
        obj,
        SourceLocation::SYNTHETIC,
    );
    created.push(statement(to, a));
    let b = identifier(to, &bindings);
    let set = to.dot(b, "set");
    let arguments = [identifier(to, &el), identifier(to, &binding)];
    let set = to.call0(set, &arguments);
    created.push(statement(to, set));
    created.push(hook(to, "created"));
    created.push(hook(to, "mounted"));
    let created = to.block(&created, SourceLocation::SYNTHETIC);
    let mut updated = Vec::new();
    let bn = identifier(to, &binding);
    let old = to.dot(bn, "value");
    updated.push(set_prop(to, &binding, "oldValue", old));
    let v = identifier(to, &value);
    updated.push(set_prop(to, &binding, "value", v));
    updated.push(hook(to, "beforeUpdate"));
    updated.push(hook(to, "updated"));
    let updated = to.block(&updated, SourceLocation::SYNTHETIC);
    inner.push(to.if_(test, created, Some(updated), SourceLocation::SYNTHETIC));
    let inner = to.block(&inner, SourceLocation::SYNTHETIC);
    let untracked = to.arrow(&[], inner, false, false, SourceLocation::SYNTHETIC);
    let u = identifier(to, untrack);
    let call = to.call0(u, &[untracked]);
    let e = identifier(to, &el);
    let attachment = to.arrow(&[e], call, true, false, SourceLocation::SYNTHETIC);
    let mut body = Vec::new();
    let d = identifier(to, &dir);
    let deep = to.dot(d, "deep");
    let t = identifier(to, &traverse);
    let v = identifier(to, &value);
    let call = to.call0(t, &[v]);
    let call = statement(to, call);
    body.push(to.if_(deep, call, None, SourceLocation::SYNTHETIC));
    body.push(to.return_(Some(attachment), SourceLocation::SYNTHETIC));
    let vmodel = function_declaration(to, name, &[&dir, &value, &modifiers, &props], &body);

    // traverse(value, seen = new Set())
    let mut body = Vec::new();
    let v = identifier(to, &value);
    let ty = to.unary(UnaryOperator::TypeOf, v, SourceLocation::SYNTHETIC);
    let object = to.write_string("object");
    let not_object = to.binary(
        BinaryOperator::StrictNotEq,
        ty,
        object,
        SourceLocation::SYNTHETIC,
    );
    let v = identifier(to, &value);
    let null = to.null(SourceLocation::SYNTHETIC);
    let is_null = to.binary(BinaryOperator::StrictEq, v, null, SourceLocation::SYNTHETIC);
    let s = identifier(to, &seen);
    let has = to.dot(s, "has");
    let v = identifier(to, &value);
    let has = to.call0(has, &[v]);
    let test = to.logical(
        LogicalOperator::Or,
        not_object,
        is_null,
        SourceLocation::SYNTHETIC,
    );
    let test = to.logical(LogicalOperator::Or, test, has, SourceLocation::SYNTHETIC);
    let ret = to.return_(None, SourceLocation::SYNTHETIC);
    body.push(to.if_(test, ret, None, SourceLocation::SYNTHETIC));
    let s = identifier(to, &seen);
    let add = to.dot(s, "add");
    let v = identifier(to, &value);
    let add = to.call0(add, &[v]);
    body.push(statement(to, add));
    let recurse = |to: &mut SyntaxTree, arg: NodeIdentifier| {
        let t = to.identifier(&traverse);
        let s = to.identifier(&seen);
        let call = to.call0(t, &[arg, s]);
        to.expression_statement(call)
    };
    // for (let i = 0; i < value.length; i++) traverse(value[i], seen);
    let i0 = identifier(to, &i);
    let zero = to.write_number(0.0, SourceLocation::SYNTHETIC);
    let initializer = to.let_(flag::LET, i0, Some(zero));
    let iv = identifier(to, &i);
    let v = identifier(to, &value);
    let len = to.dot(v, "length");
    let lt = to.binary(BinaryOperator::Lt, iv, len, SourceLocation::SYNTHETIC);
    let iv = identifier(to, &i);
    let inc = to.update(
        rsvelte_javascript::operators::UpdateOperator::Inc,
        false,
        iv,
        SourceLocation::SYNTHETIC,
    );
    let v = identifier(to, &value);
    let iv = identifier(to, &i);
    let at = to.member(v, iv, true, false, SourceLocation::SYNTHETIC);
    let each_index = recurse(to, at);
    let for_array = to.for_(
        Some(initializer),
        Some(lt),
        Some(inc),
        each_index,
        SourceLocation::SYNTHETIC,
    );
    let array = identifier(to, "Array");
    let is_array = to.dot(array, "isArray");
    let v = identifier(to, &value);
    let is_array = to.call0(is_array, &[v]);
    // value.forEach((item) => traverse(item, seen));
    let v = identifier(to, &value);
    let for_each = to.dot(v, "forEach");
    let it = identifier(to, &item);
    let t = identifier(to, &traverse);
    let s = identifier(to, &seen);
    let it2 = identifier(to, &item);
    let rec = to.call0(t, &[it2, s]);
    let cb = to.arrow(&[it], rec, true, false, SourceLocation::SYNTHETIC);
    let for_each = to.call0(for_each, &[cb]);
    let for_each = statement(to, for_each);
    let mut collection = None;
    for class in ["Set", "Map"] {
        let v = identifier(to, &value);
        let c = identifier(to, class);
        let is_instance = to.binary(BinaryOperator::InstanceOf, v, c, SourceLocation::SYNTHETIC);
        collection = Some(collection.map_or(is_instance, |l| {
            to.logical(
                LogicalOperator::Or,
                l,
                is_instance,
                SourceLocation::SYNTHETIC,
            )
        }));
    }
    // for (const key in value) traverse(value[key], seen) — as a `for` over `Object.keys`, the
    // statement forms this tree has.
    let keys = n(names, "keys");
    let object = identifier(to, "Object");
    let object_keys = to.dot(object, "keys");
    let v = identifier(to, &value);
    let all_keys = to.call0(object_keys, &[v]);
    let k = identifier(to, &keys);
    let keys_declaration = to.let_(flag::CONST, k, Some(all_keys));
    let i0 = identifier(to, &i);
    let zero = to.write_number(0.0, SourceLocation::SYNTHETIC);
    let initializer = to.let_(flag::LET, i0, Some(zero));
    let iv = identifier(to, &i);
    let k = identifier(to, &keys);
    let len = to.dot(k, "length");
    let lt = to.binary(BinaryOperator::Lt, iv, len, SourceLocation::SYNTHETIC);
    let iv = identifier(to, &i);
    let inc = to.update(
        rsvelte_javascript::operators::UpdateOperator::Inc,
        false,
        iv,
        SourceLocation::SYNTHETIC,
    );
    let v = identifier(to, &value);
    let k = identifier(to, &keys);
    let iv = identifier(to, &i);
    let key_at = to.member(k, iv, true, false, SourceLocation::SYNTHETIC);
    let at = to.member(v, key_at, true, false, SourceLocation::SYNTHETIC);
    let each_key = recurse(to, at);
    let for_keys = to.for_(
        Some(initializer),
        Some(lt),
        Some(inc),
        each_key,
        SourceLocation::SYNTHETIC,
    );
    let object_body = to.block(&[keys_declaration, for_keys], SourceLocation::SYNTHETIC);
    let object = identifier(to, "Object");
    let proto = to.dot(object, "prototype");
    let to_string = to.dot(proto, "toString");
    let call = to.dot(to_string, "call");
    let v = identifier(to, &value);
    let tag = to.call0(call, &[v]);
    let plain = to.write_string("[object Object]");
    let is_plain = to.binary(
        BinaryOperator::StrictEq,
        tag,
        plain,
        SourceLocation::SYNTHETIC,
    );
    let object_branch = to.if_(is_plain, object_body, None, SourceLocation::SYNTHETIC);
    let collection_branch = to.if_(
        collection.expect("two classes"),
        for_each,
        Some(object_branch),
        SourceLocation::SYNTHETIC,
    );
    body.push(to.if_(
        is_array,
        for_array,
        Some(collection_branch),
        SourceLocation::SYNTHETIC,
    ));
    let s = identifier(to, &seen);
    let set = identifier(to, "Set");
    let new_set = to.new_(set, &[], SourceLocation::SYNTHETIC);
    let seen_param = to.assign_pat(s, new_set, SourceLocation::SYNTHETIC);
    let tn = identifier(to, &traverse);
    let vp = identifier(to, &value);
    let block = to.block(&body, SourceLocation::SYNTHETIC);
    let traverse_declaration = to.function(
        true,
        Some(tn),
        &[vp, seen_param],
        block,
        false,
        SourceLocation::SYNTHETIC,
    );
    vec![bindings_declaration, vmodel, traverse_declaration]
}
