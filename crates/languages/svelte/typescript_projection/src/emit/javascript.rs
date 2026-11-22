//! A JavaScript projection's types, in `JSDoc`: TypeScript reads them in a `.js` file as it reads
//! the TypeScript forms, without the errors that type syntax raises there.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Range;

use super::Printer;
use crate::syntax_tree::NodeIdentifier;

impl Printer<'_> {
    /// `(/** @type {typeof callee<arguments>} */ (callee))`, which a call instantiates as
    /// `callee<arguments>()`.
    pub(super) fn instantiated(&mut self, callee: NodeIdentifier, arguments: Range) {
        self.output.push("(/** @type {typeof ");
        self.in_type(|printer| {
            printer.node(callee);
            printer.output.push("<");
            printer.separated(arguments, ", ");
            printer.output.push(">");
        });
        self.output.push("} */ (");
        self.node(callee);
        self.output.push("))");
    }

    /// `/** @type {value} */ `, before a declaration.
    pub(super) fn declared_type(&mut self, value: NodeIdentifier) {
        self.output.push("/** @type {");
        self.in_type(|printer| printer.node(value));
        self.output.push("} */ ");
    }

    /// `comment({})`.
    pub(super) fn comment_cast(&mut self, comment: Span) {
        self.output.copy(self.source, comment);
        self.output.push("({})");
    }

    /// `/** @typedef {value} name */`.
    pub(super) fn type_definition(&mut self, name: NodeIdentifier, value: NodeIdentifier) {
        self.output.push("/** @typedef {");
        self.in_type(|printer| printer.node(value));
        self.output.push("} ");
        self.node(name);
        self.output.push(" */\n");
    }

    /// svelte2tsx's default export in `JSDoc`, whose `@typedef` merges with the constant because
    /// the constant is exported; an import of the component may read it as `any`, as the run
    /// declares.
    pub(super) fn javascript_export(
        &mut self,
        component: NodeIdentifier,
        instance: &str,
        rendered: Option<&str>,
    ) {
        self.output.push("export const ");
        self.push_default_export();
        self.output
            .push(" = /** @type {__rsvelte_javascript_export<");
        let returned = "Awaited<ReturnType<typeof $$render>>";
        match rendered {
            Some(rendered) => {
                for part in [rendered, "<", returned, ">"] {
                    self.output.push(part);
                }
            }
            None => self.output.push(returned),
        }
        self.output.push(">} */ (");
        self.rendered(component, rendered);
        for part in [");\n/** @typedef {", instance, "<typeof "] {
            self.output.push(part);
        }
        self.push_default_export();
        self.output.push(">} ");
        self.push_default_export();
        self.output.push(" */\nexport default ");
        self.push_default_export();
        self.output.push(";\n");
    }

    fn in_type(&mut self, print: impl FnOnce(&mut Self)) {
        let outer = std::mem::replace(&mut self.in_type, true);
        print(self);
        self.in_type = outer;
    }
}
