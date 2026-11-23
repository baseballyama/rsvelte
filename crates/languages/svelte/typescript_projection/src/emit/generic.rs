//! svelte2tsx's export of a generic component.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Range;

use super::Printer;
use crate::syntax_tree::{Node, NodeIdentifier, TypeParameters};

/// svelte2tsx's generic component of a render function that returns nothing.
const UNRENDERED: &str = "__rsvelte_unrendered_generic";

impl Printer<'_> {
    /// svelte2tsx's `__sveltets_Render` and `$$IsomorphicComponent`: the component of the render
    /// function's contract for each instantiation.
    pub(super) fn generic_export(
        &mut self,
        type_parameters: TypeParameters,
        names: Range,
        declared: Range,
    ) {
        // The ignore comments cover one line each.
        let parameters = self.type_parameters(type_parameters);
        let parameters = parameters.as_str();
        let arguments = self.joined(names);
        let arguments = arguments.as_str();
        let plain = self.joined(declared);
        let plain = plain.as_str();
        let instantiated = |printer: &mut Self| {
            for part in ["<", arguments, ">"] {
                printer.output.push(part);
            }
        };
        // Each declaration is one line whose findings TypeScript drops, as svelte-check drops
        // those of svelte2tsx's copies of the generics, which map to no source.
        for part in [
            "// @ts-ignore\nclass __rsvelte_Render<",
            parameters,
            "> { props(): Parameters<",
        ] {
            self.output.push(part);
        }
        self.render_result(instantiated, UNRENDERED);
        self.output
            .push(">[1] { return null as any; } exports(): NonNullable<");
        self.render_result(instantiated, UNRENDERED);
        self.output
            .push("['__rsvelte_exports']> { return null as any; } events(): NonNullable<");
        self.render_result(instantiated, UNRENDERED);
        for part in [
            "['__rsvelte_events']> { return null as any; } instance(): \
                import('svelte').SvelteComponent<ReturnType<__rsvelte_Render<",
            arguments,
            ">['props']>, ReturnType<__rsvelte_Render<",
            arguments,
            ">['events']>, {}> & ReturnType<__rsvelte_Render<",
            arguments,
            ">['exports']> { return null as any; } }\n// @ts-ignore\n",
            "interface $$IsomorphicComponent { <",
            plain,
            ">(internals: Parameters<import('svelte').Component>[0], props: \
                ReturnType<__rsvelte_Render<",
            arguments,
            ">['props']>): ReturnType<__rsvelte_Render<",
            arguments,
            // svelte2tsx's construct signature, whose instance `bind:this` assigns.
            ">['exports']>; __rsvelte_instance: <",
            plain,
            ">(internals: Parameters<import('svelte').Component>[0], props: \
                ReturnType<__rsvelte_Render<",
            arguments,
            ">['props']>) => ReturnType<__rsvelte_Render<",
            arguments,
            ">['instance']>; element?: typeof HTMLElement; z_$$bindings?: NonNullable<",
        ] {
            self.output.push(part);
        }
        // svelte2tsx's `__sveltets_Render<any>`: the bindings of any instantiation.
        let count = self.tree.children(names).len();
        let any = |printer: &mut Self| {
            for index in 0..count {
                printer
                    .output
                    .push(if index == 0 { "<any" } else { ", any" });
            }
            printer.output.push(">");
        };
        self.render_result(any, UNRENDERED);
        self.output.push("['__rsvelte_bindings']>; }\nconst ");
        self.push_default_export();
        self.output
            .push(": $$IsomorphicComponent = null as any;\n// @ts-ignore\ntype ");
        self.push_default_export();
        for part in [
            "<",
            plain,
            // svelte2tsx's instance type of the isomorphic component.
            "> = ReturnType<__rsvelte_Render<",
            arguments,
            ">['instance']>;\nexport default ",
        ] {
            self.output.push(part);
        }
        self.push_default_export();
        self.output.push(";\n");
    }

    /// The unmapped texts of `parts` on one line, separated by commas.
    fn joined(&self, parts: Range) -> String {
        let mut joined = String::new();
        for (i, &part) in self.tree.children(parts).iter().enumerate() {
            if i > 0 {
                joined.push_str(", ");
            }
            self.unmapped(part, &mut joined);
        }
        joined
    }

    /// An unmapped part's text on one line.
    pub(super) fn unmapped(&self, part: NodeIdentifier, out: &mut String) {
        let line = |text: Span| text.text(self.source).replace(['\r', '\n'], " ");
        match self.tree.node(part) {
            Node::UnmappedSource(text) => out.push_str(&line(text)),
            Node::TypeParameter { name, constraint } => {
                out.push_str(&line(name));
                if let Some(constraint) = constraint {
                    out.push_str(" extends ");
                    out.push_str(&line(constraint));
                }
            }
            _ => unreachable!("only unmapped parts are joined"),
        }
    }

    /// The type parameters on one line.
    pub(super) fn type_parameters(&self, type_parameters: TypeParameters) -> String {
        match type_parameters {
            TypeParameters::Attribute(span) => span.text(self.source).replace(['\r', '\n'], " "),
            TypeParameters::Declared(parts) => self.joined(parts),
        }
    }
}
