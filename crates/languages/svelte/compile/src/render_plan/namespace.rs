use rsvelte_kernel::index::IndexVector;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, ElementKind, MetadataTag,
    NodeKind,
};
use rsvelte_svelte_syntax::names::{is_mathml, is_svg};

use crate::input::CompileInput;

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum Namespace {
    #[default]
    Html,
    Svg,
    Mathml,
}

impl Namespace {
    /// Upstream's `NAMESPACE_SVG` and `NAMESPACE_MATHML`.
    #[must_use]
    pub fn from_url(url: &str) -> Option<Self> {
        match url {
            "http://www.w3.org/2000/svg" => Some(Self::Svg),
            "http://www.w3.org/1998/Math/MathML" => Some(Self::Mathml),
            _ => None,
        }
    }

    /// The `namespace` option, which also takes the names.
    fn parse(value: &str) -> Self {
        match value {
            "svg" => Self::Svg,
            "mathml" => Self::Mathml,
            _ => Self::from_url(value).unwrap_or(Self::Html),
        }
    }
}

/// Each node's namespace, and each fragment's; nothing when the component has no foreign content.
#[derive(Debug)]
pub struct Namespaces(Option<Box<Foreign>>);

#[derive(Debug)]
struct Foreign {
    namespaces: IndexVector<CompilerNodeIdentifier, Namespace>,
    /// What a node's children inherit: their namespace, and whether they are inside an svg
    /// `<text>`, where upstream keeps whitespace.
    children: IndexVector<CompilerNodeIdentifier, (Namespace, bool)>,
    /// Upstream `metadata.svg` and `metadata.mathml`, which namespace inference reads instead of
    /// the inherited namespace.
    named: IndexVector<CompilerNodeIdentifier, Namespace>,
    configured: Namespace,
}

impl Namespaces {
    #[must_use]
    pub fn build(input: &CompileInput<'_>) -> Self {
        let tree = input.component.compiler_syntax_tree;
        let configured = tree
            .elements()
            .find_map(|(_, element)| {
                if element.kind != ElementKind::Metadata(Some(MetadataTag::Options)) {
                    return None;
                }
                tree.attributes(element.attributes)
                    .iter()
                    .find_map(|attribute| {
                        if attribute.name.text(input.component.source_text) != "namespace" {
                            return None;
                        }
                        crate::input::static_string(input, &attribute.value).map(Namespace::parse)
                    })
            })
            .unwrap_or(Namespace::Html);
        let has_foreign = configured != Namespace::Html
            || tree.elements().any(|(_, element)| {
                if matches!(
                    element.name.text(input.component.source_text),
                    "svg" | "math"
                ) {
                    return true;
                }
                tree.attributes(element.attributes).iter().any(|attribute| {
                    if attribute.name.text(input.component.source_text) != "xmlns" {
                        return false;
                    }
                    match &attribute.value {
                        AttributeValue::Static(value) => Namespace::parse(value) != Namespace::Html,
                        _ => false,
                    }
                })
            });
        if !has_foreign {
            return Self(None);
        }
        let mut foreign = Foreign {
            namespaces: IndexVector::from_element_n(Namespace::Html, tree.nodes.len()),
            children: IndexVector::from_element_n((Namespace::Html, false), tree.nodes.len()),
            named: IndexVector::from_element_n(Namespace::Html, tree.nodes.len()),
            configured,
        };
        let scope = Scope {
            namespace: configured,
            in_text: false,
            regular: Namespace::Html,
            dynamic: configured,
        };
        foreign.walk(input, tree.root, scope);
        Self(Some(Box::new(foreign)))
    }

    #[must_use]
    pub fn get(&self, node: CompilerNodeIdentifier) -> Namespace {
        self.0
            .as_ref()
            .map_or(Namespace::Html, |foreign| foreign.namespaces[node])
    }

    /// Upstream `infer_namespace` for the fragment `nodes`, which their parent node holds, and
    /// whether [`super::clean_nodes`] drops the whitespace between them: in svg, outside an svg
    /// `<text>`.
    #[must_use]
    pub fn fragment(
        &self,
        tree: &CompilerSyntaxTree,
        source_text: &str,
        nodes: &[CompilerNodeIdentifier],
    ) -> (Namespace, bool) {
        let Some(foreign) = &self.0 else {
            return (Namespace::Html, false);
        };
        let owner = nodes.first().and_then(|&node| tree.node(node).parent);
        let (inherited, in_text) =
            owner.map_or((foreign.configured, false), |owner| foreign.children[owner]);
        let namespace = foreign.infer(tree, source_text, nodes, owner, inherited);
        (namespace, namespace == Namespace::Svg && !in_text)
    }
}

/// Upstream `check_nodes_for_namespace` state.
#[derive(Clone, Copy)]
enum Checked {
    Keep,
    HasText,
    Namespace(Namespace),
}

const fn is_dom(kind: ElementKind) -> bool {
    matches!(
        kind,
        ElementKind::Regular | ElementKind::Metadata(Some(MetadataTag::Element))
    )
}

impl Foreign {
    /// Upstream `infer_namespace`, given the fragment's owner and what the owner passes down.
    fn infer(
        &self,
        tree: &CompilerSyntaxTree,
        source_text: &str,
        nodes: &[CompilerNodeIdentifier],
        owner: Option<CompilerNodeIdentifier>,
        inherited: Namespace,
    ) -> Namespace {
        let checks_nodes = match owner.map(|owner| &tree.node(owner).kind) {
            Some(NodeKind::Element(element)) if is_dom(element.kind) => return inherited,
            None | Some(NodeKind::Snippet(_)) => true,
            Some(NodeKind::Element(element)) => element.kind == ElementKind::Component,
            Some(_) => false,
        };
        if checks_nodes
            && let Checked::Namespace(namespace) = self.check_nodes(tree, source_text, nodes)
        {
            return namespace;
        }
        self.consistent(tree, nodes, inherited)
    }

    /// Upstream `check_nodes_for_namespace(nodes, 'keep')`: elements and text, looking through
    /// blocks but not into elements or components.
    fn check_nodes(
        &self,
        tree: &CompilerSyntaxTree,
        source_text: &str,
        nodes: &[CompilerNodeIdentifier],
    ) -> Checked {
        let mut state = Checked::Keep;
        for &node in nodes {
            self.check_node(tree, source_text, node, &mut state);
            if matches!(state, Checked::Namespace(Namespace::Html)) {
                break;
            }
        }
        state
    }

    fn check_node(
        &self,
        tree: &CompilerSyntaxTree,
        source_text: &str,
        node: CompilerNodeIdentifier,
        state: &mut Checked,
    ) {
        let kind = &tree.node(node).kind;
        match kind {
            NodeKind::Element(element) if is_dom(element.kind) => match self.named[node] {
                Namespace::Html => *state = Checked::Namespace(Namespace::Html),
                namespace => {
                    if matches!(state, Checked::Keep) {
                        *state = Checked::Namespace(namespace);
                    }
                }
            },
            NodeKind::Text { .. } => {
                if !kind.is_blank_text(source_text) {
                    *state = Checked::HasText;
                }
            }
            NodeKind::If { .. } | NodeKind::Each(_) | NodeKind::Await(_) | NodeKind::Key { .. } => {
                for children in tree.child_lists(node) {
                    for &child in tree.children(children) {
                        if matches!(state, Checked::Namespace(Namespace::Html)) {
                            return;
                        }
                        self.check_node(tree, source_text, child, state);
                    }
                }
            }
            _ => {}
        }
    }

    /// The namespace every direct regular element shares, else html, else `inherited`.
    fn consistent(
        &self,
        tree: &CompilerSyntaxTree,
        nodes: &[CompilerNodeIdentifier],
        inherited: Namespace,
    ) -> Namespace {
        let mut shared = None;
        for &node in nodes {
            if !matches!(&tree.node(node).kind, NodeKind::Element(element) if element.kind == ElementKind::Regular)
            {
                continue;
            }
            match self.named[node] {
                Namespace::Html => return Namespace::Html,
                namespace if shared.is_none_or(|shared| shared == namespace) => {
                    shared = Some(namespace);
                }
                _ => return Namespace::Html,
            }
        }
        shared.unwrap_or(inherited)
    }
}

/// What a node inherits from its ancestors.
#[derive(Clone, Copy)]
struct Scope {
    namespace: Namespace,
    in_text: bool,
    /// The nearest regular element's `metadata.svg`, which an `<a>` or `<title>` takes.
    regular: Namespace,
    /// What a `<svelte:element>` without `xmlns` takes: the nearest element's, or the configured
    /// namespace below a component, a snippet or the root.
    dynamic: Namespace,
}

impl Foreign {
    fn walk(&mut self, input: &CompileInput<'_>, children: Children, scope: Scope) {
        let tree = input.component.compiler_syntax_tree;
        let source_text = input.component.source_text;
        for &identifier in tree.children(children) {
            let mut namespace = scope.namespace;
            let mut inner = scope;
            match &tree.node(identifier).kind {
                NodeKind::Element(element) => {
                    let name = element.name.text(source_text);
                    let xmlns = tree
                        .attributes(element.attributes)
                        .iter()
                        .find_map(|attribute| match &attribute.value {
                            AttributeValue::Static(value)
                                if attribute.name.text(source_text) == "xmlns" =>
                            {
                                Some(value.as_ref())
                            }
                            _ => None,
                        });
                    namespace = match (xmlns, name) {
                        (Some(value), _) => Namespace::parse(value),
                        (None, "svg") => Namespace::Svg,
                        (None, "math") => Namespace::Mathml,
                        (None, _) => scope.namespace,
                    };
                    let named = match element.kind {
                        ElementKind::Regular if is_mathml(name) => Namespace::Mathml,
                        ElementKind::Regular if is_svg(name) => Namespace::Svg,
                        ElementKind::Regular if matches!(name, "a" | "title") => {
                            if scope.regular == Namespace::Svg {
                                Namespace::Svg
                            } else {
                                Namespace::Html
                            }
                        }
                        // Upstream's `metadata.svg` reads an `xmlns` as a URL only.
                        ElementKind::Metadata(Some(MetadataTag::Element)) => xmlns
                            .map_or(scope.dynamic, |url| {
                                Namespace::from_url(url).unwrap_or(Namespace::Html)
                            }),
                        _ => Namespace::Html,
                    };
                    self.named[identifier] = named;
                    let foreign_object = name == "foreignObject";
                    inner.namespace = if foreign_object {
                        Namespace::Html
                    } else {
                        namespace
                    };
                    inner.in_text |= element.kind == ElementKind::Regular && name == "text";
                    match element.kind {
                        ElementKind::Regular => {
                            inner.regular = named;
                            inner.dynamic = if foreign_object {
                                Namespace::Html
                            } else {
                                named
                            };
                        }
                        ElementKind::Metadata(Some(MetadataTag::Element)) => inner.dynamic = named,
                        ElementKind::Component
                        | ElementKind::Metadata(Some(
                            MetadataTag::Component | MetadataTag::Fragment,
                        )) => inner.dynamic = self.configured,
                        _ => {}
                    }
                }
                NodeKind::Snippet(_) => {
                    inner.namespace = self.configured;
                    inner.dynamic = self.configured;
                }
                _ => {}
            }
            self.namespaces[identifier] = namespace;
            self.children[identifier] = (inner.namespace, inner.in_text);
            for children in tree.child_lists(identifier) {
                self.walk(input, children, inner);
            }
        }
    }
}
