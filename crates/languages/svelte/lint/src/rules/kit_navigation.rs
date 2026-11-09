//! What the `SvelteKit` navigation rules share: the uses of `$app/navigation` and `$app/paths`,
//! the `href` of each `<a>`, and the URL shapes they accept.

use rsvelte_svelte::syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, TemplateNode,
};
use rsvelte_typescript::scope::{BindingIdentifier, Semantic};
use rsvelte_typescript::semantic::imports::import_references;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use serde::Deserialize;

use crate::rule::File;

/// The options both rules take.
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
#[expect(
    clippy::struct_excessive_bools,
    reason = "the options as `ESLint` takes them"
)]
pub(super) struct Options {
    #[serde(default)]
    pub(super) ignore_goto: bool,
    #[serde(default)]
    pub(super) ignore_links: bool,
    #[serde(default)]
    pub(super) ignore_push_state: bool,
    #[serde(default)]
    pub(super) ignore_replace_state: bool,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub(super) enum Navigation {
    Goto,
    PushState,
    ReplaceState,
}

/// The document's JavaScript, its scopes and its text.
pub(super) struct Script<'a> {
    pub(super) tree: &'a SyntaxTree,
    pub(super) sem: &'a Semantic,
    pub(super) source: &'a str,
    programs: Vec<NodeIdentifier>,
    parents: &'a [NodeIdentifier],
}

impl<'a> Script<'a> {
    pub(super) fn new(file: &File<'a>) -> Self {
        let programs = match (file.component(), file.module()) {
            (Some(component), _) => component
                .module
                .iter()
                .map(|script| script.program)
                .chain([component.program])
                .collect(),
            (None, Some(module)) => vec![module.root],
            (None, None) => Vec::new(),
        };
        Self {
            tree: file.javascript(),
            sem: file.semantic(),
            source: file.source(),
            programs,
            parents: file.parents(),
        }
    }

    /// The calls of `goto`, `pushState` and `replaceState` of `$app/navigation`.
    pub(super) fn navigation_calls(&self) -> Vec<(Navigation, NodeIdentifier)> {
        self.imports("$app/navigation", &["goto", "pushState", "replaceState"])
            .into_iter()
            .filter_map(|reference| {
                let call = reference.call?;
                matches!(self.tree.kind(call), Kind::Call { .. }).then_some(())?;
                let navigation = match reference.export {
                    "goto" => Navigation::Goto,
                    "pushState" => Navigation::PushState,
                    _ => Navigation::ReplaceState,
                };
                Some((navigation, call))
            })
            .collect()
    }

    /// The call's first argument, if any.
    pub(super) fn first_argument(&self, call: NodeIdentifier) -> Option<NodeIdentifier> {
        match self.tree.kind(call) {
            Kind::Call { arguments, .. } => arguments.first().copied(),
            _ => None,
        }
    }

    /// The expressions that read `exports` of `$app/paths`, sorted for [`Script::reads`].
    pub(super) fn path_reads(&self, exports: &[&str]) -> Vec<NodeIdentifier> {
        let mut reads: Vec<NodeIdentifier> = self
            .imports("$app/paths", exports)
            .into_iter()
            .map(|reference| reference.node)
            .collect();
        reads.sort_unstable();
        reads
    }

    fn imports<'e>(
        &self,
        specifier: &str,
        exports: &[&'e str],
    ) -> Vec<rsvelte_typescript::semantic::imports::ImportReference<'e>> {
        import_references(
            self.tree,
            self.sem,
            self.parents,
            self.source,
            &self.programs,
            specifier,
            exports,
        )
    }

    pub(super) fn span(&self, node: NodeIdentifier) -> rsvelte_kernel::source::positions::Span {
        self.tree
            .source_location(node)
            .span()
            .expect("a source node has a span")
    }

    /// `const name = initializer` for an identifier that reads such a constant (or variable):
    /// its binding and the initializer. A destructured name has none.
    pub(super) fn initializer(
        &self,
        identifier: NodeIdentifier,
    ) -> Option<(BindingIdentifier, NodeIdentifier)> {
        let binding = self.sem.binding_of(identifier)?;
        let declared = &self.sem.bindings[binding];
        match self.tree.kind(declared.declaration?) {
            Kind::Declarator {
                identifier: name,
                initializer: Some(initializer),
            } if name == declared.node => Some((binding, initializer)),
            _ => None,
        }
    }

    pub(super) fn string(&self, node: NodeIdentifier) -> Option<&'a str> {
        matches!(self.tree.kind(node), Kind::String).then(|| self.tree.str_value(node, self.source))
    }

    /// A template literal's quasis (raw) and expressions.
    pub(super) fn template(
        &self,
        node: NodeIdentifier,
    ) -> Option<(Vec<&'a str>, &'a [NodeIdentifier])> {
        let Kind::Template {
            quasis,
            expressions,
        } = self.tree.kind(node)
        else {
            return None;
        };
        Some((
            quasis
                .iter()
                .map(|&quasi| self.tree.str_value(quasi, self.source))
                .collect(),
            expressions,
        ))
    }

    /// The first expression of a template literal that starts with one (`${x}…`); `None` when it
    /// starts with text or has no expression.
    pub(super) fn leading_expression(&self, node: NodeIdentifier) -> Option<NodeIdentifier> {
        let (quasis, expressions) = self.template(node)?;
        if quasis.first().is_some_and(|quasi| !quasi.is_empty()) {
            return None;
        }
        expressions.first().copied()
    }
}

/// The `href` of an `<a>`.
pub(super) struct Link<'a> {
    pub(super) href: &'a Attribute,
}

/// Each `href` attribute of an `<a>` element, in document order.
pub(super) fn links<'a>(
    component: &'a Component,
    source: &'a str,
) -> impl Iterator<Item = Link<'a>> {
    component.nodes.iter().flat_map(move |node| {
        let attributes = match node {
            TemplateNode::Element {
                name, attributes, ..
            } if name.text(source) == "a" => component.attributes(*attributes),
            _ => &[],
        };
        attributes
            .iter()
            .filter(move |attribute| {
                attribute.kind == AttributeKind::Attribute && attribute.name.text(source) == "href"
            })
            .map(|href| Link { href })
    })
}

/// The first chunk of an attribute's value, as `svelte-eslint-parser` gives `value[0]`.
pub(super) fn first_part<'a>(component: &'a Component, attribute: &Attribute) -> Option<&'a Part> {
    match attribute.value {
        AttributeValue::Parts(parts) => component.parts(parts).first(),
        AttributeValue::True => None,
    }
}

/// `^[+a-z]*:`, case-insensitively: a URL with a scheme.
pub(super) fn has_scheme(url: &str) -> bool {
    let rest = url.trim_start_matches(|c: char| c == '+' || c.is_ascii_alphabetic());
    rest.starts_with(':')
}
