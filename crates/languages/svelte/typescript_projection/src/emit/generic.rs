//! svelte2tsx's export of a generic component.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Range;

use super::Printer;
use crate::syntax_tree::Node;

impl Printer<'_> {
    /// svelte2tsx's `__sveltets_Render` and `$$IsomorphicComponent`: the component of the render
    /// function's contract for each instantiation.
    pub(super) fn generic_export(&mut self, type_parameters: Span, names: Range, declared: Range) {
        // The ignore comments cover one line each.
        let parameters = type_parameters.text(self.source).replace(['\r', '\n'], " ");
        let parameters = parameters.as_str();
        let arguments = self.joined(names);
        let arguments = arguments.as_str();
        let plain = self.joined(declared);
        let plain = plain.as_str();
        for part in [
            // Each declaration is one line whose findings TypeScript drops, as svelte-check drops
            // those of svelte2tsx's copies of the generics, which map to no source.
            "// @ts-ignore\nclass __rsvelte_Render<",
            parameters,
            "> { props(): Parameters<ReturnType<typeof $$render<",
            arguments,
            ">>>[1] { return null as any; } exports(): ReturnType<ReturnType<typeof $$render<",
            arguments,
            ">>> { return null as any; } }\n// @ts-ignore\ninterface __rsvelte_generic_component { \
                <",
            plain,
            ">(internals: Parameters<import('svelte').Component>[0], props: \
                ReturnType<__rsvelte_Render<",
            arguments,
            ">['props']>): ReturnType<__rsvelte_Render<",
            arguments,
            ">['exports']>; element?: typeof HTMLElement; z_$$bindings?: any; }\nconst ",
        ] {
            self.output.push(part);
        }
        self.component_name();
        self.output
            .push(": __rsvelte_generic_component = null as any;\n// @ts-ignore\ntype ");
        self.component_name();
        for part in [
            "<",
            plain,
            "> = ReturnType<__rsvelte_Render<",
            arguments,
            ">['exports']>;\nexport default ",
        ] {
            self.output.push(part);
        }
        self.component_name();
        self.output.push(";\n");
    }

    /// The unmapped texts of `parts` on one line, separated by commas.
    fn joined(&self, parts: Range) -> String {
        let mut joined = String::new();
        for (i, &part) in self.tree.children(parts).iter().enumerate() {
            if i > 0 {
                joined.push_str(", ");
            }
            if let Node::UnmappedSource(text) = self.tree.node(part) {
                joined.push_str(&text.text(self.source).replace(['\r', '\n'], " "));
            }
        }
        joined
    }
}
