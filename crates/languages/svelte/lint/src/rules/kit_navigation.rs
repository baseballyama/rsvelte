//! What the `SvelteKit` navigation rules share: the uses of `$app/navigation` and `$app/paths`,
//! the `href` of each `<a>`, and the URL shapes they accept.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    Argument, AssignmentTarget, AssignmentTargetMaybeDefault, BindingPattern, CallExpression,
    Expression, IdentifierReference,
};
use oxc_semantic::{NodeId, SymbolId};
use rsvelte_svelte_syntax::syntax_tree::{
    Attribute, AttributeKind, AttributeValue, Component, Part, TemplateNode,
};
use rsvelte_typescript_semantic::reference_tracker::{TrackedReference, import_references};
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};
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
    pub(super) tree: &'a Tree,
    semantic: &'a Semantic,
    pub(super) source: &'a str,
    programs: Vec<ProgramIdentifier>,
}

impl<'a> Script<'a> {
    pub(super) fn new(file: &File<'a>) -> Self {
        Self {
            tree: file.javascript(),
            semantic: file.semantic(),
            source: file.source(),
            programs: file.programs(),
        }
    }

    /// The calls of `goto`, `pushState` and `replaceState` of `$app/navigation`.
    pub(super) fn navigation_calls(&self) -> Vec<(Navigation, &'a CallExpression<'a>)> {
        let nodes = self.semantic.nodes();
        self.imports("$app/navigation", &["goto", "pushState", "replaceState"])
            .into_iter()
            .filter_map(|reference| {
                let AstKind::CallExpression(call) = nodes.kind(reference.call?) else {
                    return None;
                };
                let navigation = match reference.name {
                    "goto" => Navigation::Goto,
                    "pushState" => Navigation::PushState,
                    _ => Navigation::ReplaceState,
                };
                Some((navigation, call))
            })
            .collect()
    }

    /// The expressions that read `exports` of `$app/paths`, sorted for a binary search: the
    /// tracker's, and the reads of a variable destructured from the module's namespace.
    pub(super) fn path_reads(&self, exports: &[&str]) -> Vec<NodeId> {
        let scoping = self.semantic.scoping();
        let nodes = self.semantic.nodes();
        let mut reads = Vec::new();
        for reference in self.imports("$app/paths", exports) {
            reads.push(reference.node);
            // The tracker reports `base` in `const { base } = paths` but not what reads it.
            let symbol = match nodes.kind(reference.node) {
                AstKind::BindingProperty(property) => {
                    let mut target = &property.value;
                    while let BindingPattern::AssignmentPattern(assignment) = target {
                        target = &assignment.left;
                    }
                    match target {
                        BindingPattern::BindingIdentifier(identifier) => identifier.symbol_id.get(),
                        _ => None,
                    }
                }
                AstKind::AssignmentTargetPropertyIdentifier(property) => {
                    self.symbol(&property.binding)
                }
                AstKind::AssignmentTargetPropertyProperty(property) => {
                    let target = match &property.binding {
                        AssignmentTargetMaybeDefault::AssignmentTargetWithDefault(default) => {
                            &default.binding
                        }
                        target => target.to_assignment_target(),
                    };
                    match target {
                        AssignmentTarget::AssignmentTargetIdentifier(identifier) => {
                            self.symbol(identifier)
                        }
                        _ => None,
                    }
                }
                _ => None,
            };
            if let Some(symbol) = symbol {
                reads.extend(
                    scoping
                        .get_resolved_references(symbol)
                        .filter(|r| r.is_read())
                        .map(oxc_semantic::Reference::node_id),
                );
            }
        }
        reads.sort_unstable();
        reads.dedup();
        reads
    }

    fn imports<'e>(&self, specifier: &str, exports: &[&'e str]) -> Vec<TrackedReference<'e>> {
        import_references(self.semantic, &self.programs, specifier, exports)
    }

    fn symbol(&self, identifier: &IdentifierReference<'_>) -> Option<SymbolId> {
        let reference = identifier.reference_id.get()?;
        self.semantic.scoping().get_reference(reference).symbol_id()
    }

    /// `const name = initializer` for an identifier that reads such a constant (or variable):
    /// its symbol and the initializer. A destructured name has none.
    pub(super) fn initializer(
        &self,
        identifier: &IdentifierReference<'_>,
    ) -> Option<(SymbolId, &'a Expression<'a>)> {
        let symbol = self.symbol(identifier)?;
        let declaration = self.semantic.scoping().symbol_declaration(symbol);
        match self.semantic.nodes().kind(declaration) {
            AstKind::VariableDeclarator(declarator) => match (&declarator.id, &declarator.init) {
                (BindingPattern::BindingIdentifier(name), Some(initializer))
                    if name.symbol_id.get() == Some(symbol) =>
                {
                    Some((symbol, initializer))
                }
                _ => None,
            },
            _ => None,
        }
    }
}

/// The call's first argument, if any; a spread is no expression.
pub(super) fn first_argument<'a>(call: &'a CallExpression<'a>) -> Option<&'a Argument<'a>> {
    call.arguments.first()
}

pub(super) fn string<'a>(node: &Expression<'a>) -> Option<&'a str> {
    match node {
        Expression::StringLiteral(string) => string.value.as_str(),
        _ => None,
    }
}

/// A template literal's quasis (raw) and expressions.
pub(super) fn template<'a>(
    node: &'a Expression<'a>,
) -> Option<(Vec<&'a str>, &'a [Expression<'a>])> {
    let Expression::TemplateLiteral(template) = node else {
        return None;
    };
    Some((
        template
            .quasis
            .iter()
            .map(|quasi| quasi.value.raw.as_str())
            .collect(),
        &template.expressions,
    ))
}

/// The first expression of a template literal that starts with one (`${x}…`); `None` when it
/// starts with text or has no expression.
pub(super) fn leading_expression<'a>(node: &'a Expression<'a>) -> Option<&'a Expression<'a>> {
    let (quasis, expressions) = template(node)?;
    if quasis.first().is_some_and(|quasi| !quasi.is_empty()) {
        return None;
    }
    expressions.first()
}

/// The `href` of an `<a>`, with the element's attributes.
pub(super) struct Link<'a> {
    pub(super) href: &'a Attribute,
    pub(super) attributes: &'a [Attribute],
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
            .map(move |href| Link { href, attributes })
    })
}

/// The first chunk of an attribute's value, as `svelte-eslint-parser` gives `value[0]`: it gives
/// no chunk for `href=""`.
pub(super) fn first_part<'a>(component: &'a Component, attribute: &Attribute) -> Option<&'a Part> {
    match attribute.value {
        AttributeValue::Parts(parts) => component
            .parts(parts)
            .first()
            .filter(|part| !matches!(part, Part::Text(span) if span.is_empty())),
        AttributeValue::True => None,
    }
}

/// `^[+a-z]*:`, case-insensitively: a URL with a scheme.
pub(super) fn has_scheme(url: &str) -> bool {
    let rest = url.trim_start_matches(|c: char| c == '+' || c.is_ascii_alphabetic());
    rest.starts_with(':')
}
