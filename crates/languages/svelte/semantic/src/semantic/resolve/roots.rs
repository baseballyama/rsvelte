use rsvelte_svelte_hir::compiler_syntax_tree::{
    AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, Element, NodeKind, Part,
    StyleValue,
};
use rsvelte_typescript::NodeIdentifier;
use rsvelte_typescript::scope::{DeclarationKind, HostRoot, HostScope};

/// The template's expressions in document order, with the scopes the template opens (upstream
/// `create_scopes`). A fragment gets a scope only when it declares names: the others would be
/// empty, and an empty scope resolves nothing differently.
pub(super) fn template_roots(
    compiler_syntax_tree: &CompilerSyntaxTree,
    list: Children,
    out: &mut Vec<HostRoot>,
) {
    let children = compiler_syntax_tree.children(list);
    let declares = children.iter().any(|&c| {
        matches!(
            compiler_syntax_tree.node(c).kind,
            NodeKind::Const { .. } | NodeKind::Declaration { .. } | NodeKind::Snippet(_)
        )
    });
    if !declares {
        return node_roots(compiler_syntax_tree, children, out);
    }
    let mut body = Vec::new();
    node_roots(compiler_syntax_tree, children, &mut body);
    out.push(HostRoot::Scope(HostScope {
        node: None,
        parameters: Vec::new(),
        body,
    }));
}

fn node_roots(
    compiler_syntax_tree: &CompilerSyntaxTree,
    children: &[CompilerNodeIdentifier],
    out: &mut Vec<HostRoot>,
) {
    for &identifier in children {
        match &compiler_syntax_tree.node(identifier).kind {
            NodeKind::Text { .. } | NodeKind::Comment { .. } => {}
            &(NodeKind::Expression { expression }
            | NodeKind::Render { expression }
            | NodeKind::Html { expression }) => out.push(HostRoot::Expression(expression)),
            &(NodeKind::Const { declaration } | NodeKind::Declaration { declaration }) => {
                out.push(HostRoot::Expression(declaration));
            }
            &NodeKind::Debug { identifiers } => out.extend(
                compiler_syntax_tree
                    .javascript_list(identifiers)
                    .iter()
                    .map(|&i| HostRoot::Expression(i)),
            ),
            NodeKind::Element(el) => element_roots(compiler_syntax_tree, identifier, el, out),
            NodeKind::If {
                branches,
                otherwise,
            } => {
                for b in compiler_syntax_tree.branches(*branches) {
                    out.push(HostRoot::Expression(b.test));
                    template_roots(compiler_syntax_tree, b.body, out);
                }
                if let Some(o) = otherwise {
                    template_roots(compiler_syntax_tree, *o, out);
                }
            }
            NodeKind::Each(each) => {
                out.push(HostRoot::Expression(each.collection));
                let parameters: Vec<NodeIdentifier> =
                    each.context().into_iter().chain(each.index()).collect();
                let mut body = Vec::new();
                body.extend(each.key().map(HostRoot::Expression));
                template_roots(compiler_syntax_tree, each.body, &mut body);
                match parameters.first() {
                    Some(&node) => out.push(HostRoot::Scope(HostScope {
                        node: Some(node),
                        parameters,
                        body,
                    })),
                    None => out.extend(body),
                }
                if let Some(f) = each.fallback {
                    template_roots(compiler_syntax_tree, f, out);
                }
            }
            &NodeKind::Key { expression, body } => {
                out.push(HostRoot::Expression(expression));
                template_roots(compiler_syntax_tree, body, out);
            }
            NodeKind::Await(a) => {
                out.push(HostRoot::Expression(a.expression));
                if let Some(p) = a.pending() {
                    template_roots(compiler_syntax_tree, p, out);
                }
                for (pattern, branch) in [(a.value(), a.then()), (a.error(), a.catch())] {
                    let Some(branch) = branch else { continue };
                    let mut body = Vec::new();
                    template_roots(compiler_syntax_tree, branch, &mut body);
                    out.push(HostRoot::Scope(HostScope {
                        node: None,
                        parameters: pattern.into_iter().collect(),
                        body,
                    }));
                }
            }
            NodeKind::Snippet(s) => {
                out.push(HostRoot::Name(s.name, DeclarationKind::Function));
                let mut body = Vec::new();
                template_roots(compiler_syntax_tree, s.body, &mut body);
                out.push(HostRoot::Scope(HostScope {
                    node: None,
                    parameters: compiler_syntax_tree.javascript_list(s.parameters).to_vec(),
                    body,
                }));
            }
        }
    }
}

fn element_roots(
    compiler_syntax_tree: &CompilerSyntaxTree,
    identifier: CompilerNodeIdentifier,
    el: &Element,
    out: &mut Vec<HostRoot>,
) {
    out.extend(
        compiler_syntax_tree
            .component_reference(identifier)
            .map(HostRoot::Expression),
    );
    if let Some(this) = el.this {
        attribute_roots(&compiler_syntax_tree.attributes[this].value, out);
    }
    let mut lets = Vec::new();
    for a in compiler_syntax_tree.attributes(el.attributes) {
        match &a.value {
            AttributeValue::Let(pattern) => lets.extend(*pattern),
            value => attribute_roots(value, out),
        }
    }
    if lets.is_empty() {
        template_roots(compiler_syntax_tree, el.children, out);
    } else {
        let mut body = Vec::new();
        template_roots(compiler_syntax_tree, el.children, &mut body);
        out.push(HostRoot::Scope(HostScope {
            node: None,
            parameters: lets,
            body,
        }));
    }
}

fn attribute_roots(value: &AttributeValue, out: &mut Vec<HostRoot>) {
    let parts = |parts: &[Part], out: &mut Vec<HostRoot>| {
        out.extend(parts.iter().filter_map(|p| match *p {
            Part::Expression { expression, .. } => Some(HostRoot::Expression(expression)),
            Part::Text(_) => None,
        }));
    };
    match value {
        AttributeValue::Boolean | AttributeValue::Static(_) | AttributeValue::Let(_) => {}
        &(AttributeValue::Expression { expression, .. }
        | AttributeValue::Shorthand(expression)
        | AttributeValue::Attach(expression)
        | AttributeValue::Class(expression)
        | AttributeValue::Spread(expression)) => out.push(HostRoot::Expression(expression)),
        AttributeValue::Interpolated(p) => parts(p, out),
        &AttributeValue::Bind(expression) => out.push(HostRoot::Bound(expression)),
        &AttributeValue::On { handler, .. } => out.extend(handler.map(HostRoot::Expression)),
        &(AttributeValue::Use { action, argument }
        | AttributeValue::Animate {
            function: action,
            argument,
        }
        | AttributeValue::Transition {
            function: action,
            argument,
            ..
        }) => {
            out.push(HostRoot::Expression(action));
            out.extend(argument.map(HostRoot::Expression));
        }
        AttributeValue::Style { value, .. } => match value.as_ref() {
            StyleValue::Empty | StyleValue::Static(_) => {}
            &(StyleValue::Shorthand(expression) | StyleValue::Expression { expression, .. }) => {
                out.push(HostRoot::Expression(expression));
            }
            StyleValue::Interpolated(p) => parts(p, out),
        },
    }
}
