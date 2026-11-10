use rsvelte_typescript_tree::{
    DeclarationIdentifier, ExpressionIdentifier, ParametersIdentifier, PatternIdentifier,
};

use crate::compiler_syntax_tree::{
    AttributeIdentifier, AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree,
    Element, NodeKind, Part, StyleValue,
};

/// A scope the template opens (upstream `create_scopes`).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum TemplateScope {
    /// A fragment that declares names: with `{@const}`, `{let}` or `{#snippet}`. The others would
    /// be empty, and an empty scope resolves nothing differently.
    Fragment(Children),
    /// The context and the index of `{#each}`, which the key and the body see.
    Each(CompilerNodeIdentifier),
    /// The value of `{:then}`.
    Then(CompilerNodeIdentifier),
    /// The error of `{:catch}`.
    Catch(CompilerNodeIdentifier),
    /// The parameters of `{#snippet}`.
    Snippet(CompilerNodeIdentifier),
    /// The `let:` names of an element, which its children see.
    Let(CompilerNodeIdentifier),
}

/// A name the template declares outside a JavaScript pattern.
#[derive(Clone, Copy, Debug)]
pub enum TemplateName {
    /// `{#snippet name()}`, in the enclosing fragment's scope.
    Snippet(CompilerNodeIdentifier),
    /// The names of a `let:` directive.
    Let(AttributeIdentifier),
}

/// What the template evaluates and declares, met in document order.
pub trait Roots {
    fn expression(&mut self, expression: ExpressionIdentifier);
    /// An expression the template reads and assigns: `bind:value={x}`.
    fn bound(&mut self, expression: ExpressionIdentifier);
    fn declaration(&mut self, declaration: DeclarationIdentifier);
    fn pattern(&mut self, pattern: PatternIdentifier);
    fn parameters(&mut self, parameters: ParametersIdentifier);
    fn name(&mut self, name: TemplateName);
    fn enter(&mut self, scope: TemplateScope);
    fn leave(&mut self);
}

/// Walks the template's roots. Fragments nest through here, so the stack grows as deep as the
/// markup does.
pub fn walk(compiler_syntax_tree: &CompilerSyntaxTree, list: Children, roots: &mut impl Roots) {
    rsvelte_kernel::performance::stack::grow(|| fragment(compiler_syntax_tree, list, roots));
}

fn fragment(compiler_syntax_tree: &CompilerSyntaxTree, list: Children, roots: &mut impl Roots) {
    let children = compiler_syntax_tree.children(list);
    let declares = children.iter().any(|&c| {
        matches!(
            compiler_syntax_tree.node(c).kind,
            NodeKind::Const { .. } | NodeKind::Declaration { .. } | NodeKind::Snippet(_)
        )
    });
    if declares {
        roots.enter(TemplateScope::Fragment(list));
    }
    for &identifier in children {
        node(compiler_syntax_tree, identifier, roots);
    }
    if declares {
        roots.leave();
    }
}

fn node(
    compiler_syntax_tree: &CompilerSyntaxTree,
    identifier: CompilerNodeIdentifier,
    roots: &mut impl Roots,
) {
    match &compiler_syntax_tree.node(identifier).kind {
        NodeKind::Text { .. } | NodeKind::Comment { .. } => {}
        &(NodeKind::Expression { expression }
        | NodeKind::Render { expression }
        | NodeKind::Html { expression }) => roots.expression(expression),
        &(NodeKind::Const { declaration } | NodeKind::Declaration { declaration }) => {
            roots.declaration(declaration);
        }
        &NodeKind::Debug { identifiers } => {
            for &e in compiler_syntax_tree.debug_identifiers(identifiers) {
                roots.expression(e);
            }
        }
        NodeKind::Element(el) => element(compiler_syntax_tree, identifier, el, roots),
        NodeKind::If {
            branches,
            otherwise,
        } => {
            for b in compiler_syntax_tree.branches(*branches) {
                roots.expression(b.test);
                walk(compiler_syntax_tree, b.body, roots);
            }
            if let Some(o) = otherwise {
                walk(compiler_syntax_tree, *o, roots);
            }
        }
        NodeKind::Each(each) => {
            roots.expression(each.collection);
            let scoped = each.context.is_some() || each.index.is_some();
            if scoped {
                roots.enter(TemplateScope::Each(identifier));
                each.context
                    .into_iter()
                    .chain(each.index)
                    .for_each(|p| roots.pattern(p));
            }
            if let Some(key) = each.key {
                roots.expression(key);
            }
            walk(compiler_syntax_tree, each.body, roots);
            if scoped {
                roots.leave();
            }
            if let Some(f) = each.fallback {
                walk(compiler_syntax_tree, f, roots);
            }
        }
        &NodeKind::Key { expression, body } => {
            roots.expression(expression);
            walk(compiler_syntax_tree, body, roots);
        }
        NodeKind::Await(a) => {
            roots.expression(a.expression);
            if let Some(p) = a.pending() {
                walk(compiler_syntax_tree, p, roots);
            }
            for (scope, pattern, branch) in [
                (TemplateScope::Then(identifier), a.value, a.then()),
                (TemplateScope::Catch(identifier), a.error, a.catch()),
            ] {
                let Some(branch) = branch else { continue };
                roots.enter(scope);
                if let Some(pattern) = pattern {
                    roots.pattern(pattern);
                }
                walk(compiler_syntax_tree, branch, roots);
                roots.leave();
            }
        }
        NodeKind::Snippet(s) => {
            roots.name(TemplateName::Snippet(identifier));
            roots.enter(TemplateScope::Snippet(identifier));
            if let Some(parameters) = s.parameters {
                roots.parameters(parameters);
            }
            walk(compiler_syntax_tree, s.body, roots);
            roots.leave();
        }
    }
}

fn element(
    compiler_syntax_tree: &CompilerSyntaxTree,
    identifier: CompilerNodeIdentifier,
    el: &Element,
    roots: &mut impl Roots,
) {
    if let Some(reference) = compiler_syntax_tree.component_reference(identifier) {
        roots.expression(reference);
    }
    if let Some(this) = el.this {
        attribute(&compiler_syntax_tree.attributes[this].value, roots);
    }
    let mut lets = false;
    for a in compiler_syntax_tree.attributes(el.attributes) {
        if matches!(a.value, AttributeValue::Let(_)) {
            lets = true;
        } else {
            attribute(&a.value, roots);
        }
    }
    if !lets {
        return walk(compiler_syntax_tree, el.children, roots);
    }
    roots.enter(TemplateScope::Let(identifier));
    for (attribute, a) in el
        .attributes
        .iter()
        .zip(compiler_syntax_tree.attributes(el.attributes))
    {
        if matches!(a.value, AttributeValue::Let(_)) {
            roots.name(TemplateName::Let(attribute));
        }
    }
    walk(compiler_syntax_tree, el.children, roots);
    roots.leave();
}

fn attribute(value: &AttributeValue, roots: &mut impl Roots) {
    let parts = |parts: &[Part], roots: &mut dyn FnMut(ExpressionIdentifier)| {
        for p in parts {
            if let Part::Expression { expression, .. } = *p {
                roots(expression);
            }
        }
    };
    match value {
        AttributeValue::Boolean | AttributeValue::Static(_) | AttributeValue::Let(_) => {}
        &(AttributeValue::Expression { expression, .. }
        | AttributeValue::Shorthand(expression)
        | AttributeValue::Attach(expression)
        | AttributeValue::Class(expression)
        | AttributeValue::Spread(expression)) => roots.expression(expression),
        AttributeValue::Interpolated(p) => parts(p, &mut |e| roots.expression(e)),
        &AttributeValue::Bind(expression) => roots.bound(expression),
        &AttributeValue::On { handler, .. } => {
            if let Some(handler) = handler {
                roots.expression(handler);
            }
        }
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
            roots.expression(action);
            if let Some(argument) = argument {
                roots.expression(argument);
            }
        }
        AttributeValue::Style { value, .. } => match value.as_ref() {
            StyleValue::Empty | StyleValue::Static(_) => {}
            &(StyleValue::Shorthand(expression) | StyleValue::Expression { expression, .. }) => {
                roots.expression(expression);
            }
            StyleValue::Interpolated(p) => parts(p, &mut |e| roots.expression(e)),
        },
    }
}
