//! A JavaScript projection's types, in `JSDoc`: TypeScript reads them in a `.js` file as it reads
//! the TypeScript forms, without the errors that type syntax raises there.

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

    /// The default export, which JavaScript cannot name as a type; an import of the component may
    /// read it as `any`, as the run declares.
    pub(super) fn javascript_export(&mut self, value: NodeIdentifier) {
        self.output.push("const ");
        self.component_name();
        self.output.push(" = ");
        self.node(value);
        self.output
            .push(";\nexport default /** @type {__rsvelte_javascript_export<typeof ");
        self.component_name();
        self.output.push(">} */ (");
        self.component_name();
        self.output.push(");\n");
    }

    fn in_type(&mut self, print: impl FnOnce(&mut Self)) {
        let outer = std::mem::replace(&mut self.in_type, true);
        print(self);
        self.in_type = outer;
    }
}
