//! The route files of a `SvelteKit` app, whose untyped `$props()` svelte2tsx types from `./$types`.

use oxc_ast::ast::{BindingPattern, ObjectPattern, PropertyKey};

use super::super::{Buffer, Builder, Node, NodeIdentifier, Span};
use super::Edit;

/// The `SvelteKit` file a component is, as svelte2tsx reads it from the file name.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(in super::super) enum Route {
    Page,
    Layout,
    Error,
}

impl Route {
    pub(in super::super) fn of(path: &str) -> Option<Self> {
        let basename = path.rsplit(['/', '\\']).next().unwrap_or(path);
        let stem = basename.rsplit_once('.').map_or(basename, |(stem, _)| stem);
        // `+page@group.svelte` resets its layout; svelte2tsx reads the name before the `@`.
        match basename.split_once('@').map_or(stem, |(stem, _)| stem) {
            "+page" | "+page.server" | "+server" => Some(Self::Page),
            "+layout" | "+layout.server" => Some(Self::Layout),
            _ if stem == "+error" => Some(Self::Error),
            _ => None,
        }
    }

    /// The prop `name` and the type svelte2tsx gives it, or `None` when it leaves it out.
    fn prop(self, name: &str) -> Option<(&'static str, &'static str)> {
        Some(match (self, name) {
            (Self::Page, "data") => ("data", "import('./$types.js').PageData"),
            (Self::Layout, "data") => ("data", "import('./$types.js').LayoutData"),
            (Self::Page, "form") => ("form", "import('./$types.js').ActionData"),
            (Self::Page, "params") => ("params", "import('./$types.js').PageProps['params']"),
            (Self::Layout, "params") => ("params", "import('./$types.js').LayoutProps['params']"),
            (Self::Error, "error") => ("error", "App.Error"),
            _ => return None,
        })
    }
}

impl Builder<'_> {
    /// Declares the `$$ComponentProps` svelte2tsx gives the untyped `object` of a route file before
    /// `statement` and annotates the pattern, which ends at `end`, with it. Without a prop it
    /// types, svelte2tsx leaves the props untyped.
    pub(super) fn route_props(
        &mut self,
        route: Route,
        object: &ObjectPattern<'_>,
        (statement, end): (u32, u32),
        edits: &mut Buffer<Edit>,
    ) -> NodeIdentifier {
        let mut properties = Buffer::new(0);
        let mut unknown = object.rest.is_some();
        let mut aliases = 0;
        for property in &object.properties {
            let name = match &property.key {
                PropertyKey::StaticIdentifier(key) if !property.computed => &key.name,
                _ => {
                    unknown = true;
                    continue;
                }
            };
            let value = match &property.value {
                BindingPattern::AssignmentPattern(assignment) => &assignment.left,
                value => value,
            };
            if !matches!(value, BindingPattern::BindingIdentifier(_)) {
                unknown = true;
                continue;
            }
            if let Some((name, kind)) = route.prop(name) {
                // The generated `./$types` may not exist yet, which svelte-check does not report.
                let alias = self.unused_name_from("__rsvelte_kit_type", aliases);
                aliases += 1;
                let value = self.tree.push(Node::Identifier(kind));
                let declaration = self.tree.push(Node::TypeAlias { name: alias, value });
                edits.push(Edit {
                    span: Span::new(statement, statement),
                    replacement: Some(self.tree.push(Node::Ignored(declaration))),
                });
                properties.push(self.route_prop(name, alias));
            }
        }
        if route == Route::Layout {
            let snippet = self.tree.push(Node::Identifier("import('svelte').Snippet"));
            properties.push(self.route_prop("children", snippet));
        }
        if unknown {
            let any = self.tree.push(Node::Identifier("any"));
            properties.push(self.route_prop("[key: string]", any));
        }
        if properties.is_empty() {
            return self.tree.push(Node::Identifier("any"));
        }
        let properties = self.tree.list(&properties);
        let value = self.tree.push(Node::TypeLiteral(properties));
        let name = self.tree.push(Node::Identifier("$$ComponentProps"));
        let alias = self.tree.push(Node::TypeAlias { name, value });
        edits.push(Edit {
            span: Span::new(statement, statement),
            replacement: Some(alias),
        });
        let annotation = self.tree.push(Node::TypeAnnotation(name));
        edits.push(Edit {
            span: Span::new(end, end),
            replacement: Some(annotation),
        });
        name
    }

    fn route_prop(&mut self, name: &'static str, value: NodeIdentifier) -> NodeIdentifier {
        let name = self.tree.push(Node::Identifier(name));
        self.tree.push(Node::TypeProperty { name, value })
    }
}
