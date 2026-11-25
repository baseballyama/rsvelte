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
    /// Declares the `$$ComponentProps` svelte2tsx gives the untyped `object` of a route file and
    /// types the pattern with it: before `statement` and after the pattern's `end` in TypeScript,
    /// in `JSDoc` at the declarator's start `at` in JavaScript. Without a prop it types, svelte2tsx
    /// leaves the props untyped.
    pub(super) fn route_props(
        &mut self,
        route: Route,
        object: &ObjectPattern<'_>,
        [statement, at, end]: [u32; 3],
        edits: &mut Buffer<Edit>,
    ) -> NodeIdentifier {
        let tokens = &self.component.tokens;
        // TypeScript's `pos` of the declarator, after the token before it, where svelte2tsx
        // writes the `JSDoc`.
        let written = tokens
            .before(at)
            .map(|token| tokens.get(token).span.end_offset);
        let written = written.expect("a declarator follows its keyword or a comma");
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
                // The generated `./$types` may not exist yet, which svelte-check reports in
                // JavaScript only, where svelte2tsx writes the type.
                let value = if self.tree.javascript {
                    self.tree.push(Node::IdentifierAt {
                        name: kind,
                        at: written,
                    })
                } else {
                    let value = self.tree.push(Node::Identifier(kind));
                    let alias = self.unused_name_from("__rsvelte_kit_type", aliases);
                    aliases += 1;
                    let declaration = self.tree.push(Node::TypeAlias { name: alias, value });
                    edits.push(Edit {
                        span: Span::new(statement, statement),
                        replacement: Some(self.tree.push(Node::Ignored(declaration))),
                    });
                    alias
                };
                properties.push(self.route_prop(name, value));
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
        let (alias, annotation, [alias_at, annotation_at]) = if self.tree.javascript {
            let definition = Node::TypeDefinition { name, value };
            (definition, Node::DeclaredType(name), [at, at])
        } else {
            let alias = Node::TypeAlias { name, value };
            (alias, Node::TypeAnnotation(name), [statement, end])
        };
        for (node, at) in [(alias, alias_at), (annotation, annotation_at)] {
            edits.push(Edit {
                span: Span::new(at, at),
                replacement: Some(self.tree.push(node)),
            });
        }
        name
    }

    fn route_prop(&mut self, name: &'static str, value: NodeIdentifier) -> NodeIdentifier {
        let name = self.tree.push(Node::Identifier(name));
        self.tree.push(Node::TypeProperty {
            name,
            value,
            optional: false,
        })
    }
}
