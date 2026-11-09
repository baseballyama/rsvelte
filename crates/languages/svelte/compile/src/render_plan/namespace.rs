use rsvelte_kernel::index::IndexVector;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, ElementKind, MetadataTag,
    NodeKind,
};

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

#[derive(Debug)]
pub(super) enum Namespaces {
    AllDefault,
    Foreign(Box<Foreign>),
}

#[derive(Debug)]
pub(super) struct Foreign {
    namespaces: IndexVector<CompilerNodeIdentifier, Namespace>,
    children: IndexVector<CompilerNodeIdentifier, Namespace>,
    /// Upstream keeps whitespace inside an svg `<text>`.
    in_text: IndexVector<CompilerNodeIdentifier, bool>,
    /// Upstream `metadata.svg` and `metadata.mathml`, which namespace inference reads instead of
    /// the inherited namespace.
    named: IndexVector<CompilerNodeIdentifier, Namespace>,
    configured: Namespace,
}

impl Namespaces {
    pub(super) fn get(&self, node: CompilerNodeIdentifier) -> Namespace {
        match self {
            Self::AllDefault => Namespace::Html,
            Self::Foreign(foreign) => foreign.namespaces[node],
        }
    }

    /// Upstream `infer_namespace` for the fragment `nodes`, which their parent node holds.
    pub(super) fn infer(
        &self,
        tree: &CompilerSyntaxTree,
        source_text: &str,
        nodes: &[CompilerNodeIdentifier],
    ) -> Namespace {
        let Self::Foreign(foreign) = self else {
            return Namespace::Html;
        };
        let owner = nodes.first().and_then(|&node| tree.node(node).parent);
        let inherited = owner.map_or(foreign.configured, |owner| foreign.children[owner]);
        let checks_nodes = match owner.map(|owner| &tree.node(owner).kind) {
            Some(NodeKind::Element(element)) if is_dom(element.kind) => return inherited,
            None | Some(NodeKind::Snippet(_)) => true,
            Some(NodeKind::Element(element)) => element.kind == ElementKind::Component,
            Some(_) => false,
        };
        if checks_nodes
            && let Checked::Namespace(namespace) = foreign.check_nodes(tree, source_text, nodes)
        {
            return namespace;
        }
        foreign.consistent(tree, nodes, inherited)
    }

    /// Whitespace-only text between nodes is dropped in svg, outside an svg `<text>`.
    pub(super) fn drops_whitespace(
        &self,
        namespace: Namespace,
        nodes: &[CompilerNodeIdentifier],
    ) -> bool {
        match self {
            Self::AllDefault => false,
            Self::Foreign(foreign) => {
                namespace == Namespace::Svg
                    && !nodes.first().is_some_and(|&node| foreign.in_text[node])
            }
        }
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

pub(super) fn build(input: &CompileInput<'_>) -> Namespaces {
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
        return Namespaces::AllDefault;
    }
    let mut foreign = Foreign {
        namespaces: IndexVector::from_element_n(Namespace::Html, tree.nodes.len()),
        children: IndexVector::from_element_n(Namespace::Html, tree.nodes.len()),
        in_text: IndexVector::from_element_n(false, tree.nodes.len()),
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
    Namespaces::Foreign(Box::new(foreign))
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
            self.children[identifier] = inner.namespace;
            self.in_text[identifier] = scope.in_text;
            for children in tree.child_lists(identifier) {
                self.walk(input, children, inner);
            }
        }
    }
}

/// Upstream `is_svg`.
pub(crate) fn is_svg(name: &str) -> bool {
    matches!(
        name,
        "altGlyph"
            | "altGlyphDef"
            | "altGlyphItem"
            | "animate"
            | "animateColor"
            | "animateMotion"
            | "animateTransform"
            | "circle"
            | "clipPath"
            | "color-profile"
            | "cursor"
            | "defs"
            | "desc"
            | "discard"
            | "ellipse"
            | "feBlend"
            | "feColorMatrix"
            | "feComponentTransfer"
            | "feComposite"
            | "feConvolveMatrix"
            | "feDiffuseLighting"
            | "feDisplacementMap"
            | "feDistantLight"
            | "feDropShadow"
            | "feFlood"
            | "feFuncA"
            | "feFuncB"
            | "feFuncG"
            | "feFuncR"
            | "feGaussianBlur"
            | "feImage"
            | "feMerge"
            | "feMergeNode"
            | "feMorphology"
            | "feOffset"
            | "fePointLight"
            | "feSpecularLighting"
            | "feSpotLight"
            | "feTile"
            | "feTurbulence"
            | "filter"
            | "font"
            | "font-face"
            | "font-face-format"
            | "font-face-name"
            | "font-face-src"
            | "font-face-uri"
            | "foreignObject"
            | "g"
            | "glyph"
            | "glyphRef"
            | "hatch"
            | "hatchpath"
            | "hkern"
            | "image"
            | "line"
            | "linearGradient"
            | "marker"
            | "mask"
            | "mesh"
            | "meshgradient"
            | "meshpatch"
            | "meshrow"
            | "metadata"
            | "missing-glyph"
            | "mpath"
            | "path"
            | "pattern"
            | "polygon"
            | "polyline"
            | "radialGradient"
            | "rect"
            | "set"
            | "solidcolor"
            | "stop"
            | "svg"
            | "switch"
            | "symbol"
            | "text"
            | "textPath"
            | "tref"
            | "tspan"
            | "unknown"
            | "use"
            | "view"
            | "vkern"
    )
}

/// Upstream `is_mathml`.
pub(crate) fn is_mathml(name: &str) -> bool {
    matches!(
        name,
        "annotation"
            | "annotation-xml"
            | "maction"
            | "math"
            | "merror"
            | "mfrac"
            | "mi"
            | "mmultiscripts"
            | "mn"
            | "mo"
            | "mover"
            | "mpadded"
            | "mphantom"
            | "mprescripts"
            | "mroot"
            | "mrow"
            | "ms"
            | "mspace"
            | "msqrt"
            | "mstyle"
            | "msub"
            | "msubsup"
            | "msup"
            | "mtable"
            | "mtd"
            | "mtext"
            | "mtr"
            | "munder"
            | "munderover"
            | "semantics"
    )
}
