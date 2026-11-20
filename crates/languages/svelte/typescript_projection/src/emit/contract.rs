//! The node kinds `node` does not match itself: the contract's render function, types and default
//! export, and the declarations, quoted text, located wrappers and generated names that the
//! template's lowering builds too.

use std::fmt::Write as _;

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Range;

use super::Printer;
use crate::syntax_tree::{Node, NodeIdentifier, TypeParameters};

impl Printer<'_> {
    pub(super) fn contract_node(&mut self, node: Node) {
        match node {
            Node::ProgramParts { parts, .. } => {
                for &part in self.tree.children(parts) {
                    self.node(part);
                }
                self.program_end();
            }
            Node::Bare(value) => {
                self.source_expression(value);
                self.output.push(";\n");
            }
            Node::AsType { parts, written } => {
                self.output.push("(");
                for &part in self.tree.children(parts) {
                    self.node(part);
                }
                self.output.push(") as ");
                self.output.copy(self.source, written);
            }
            Node::QuotedText(span) => {
                let start = self.output.out.len() as u32;
                for part in ["\"", span.text(self.source), "\""] {
                    self.output.push(part);
                }
                self.output.atom_since(start, span);
            }
            Node::Located { value, open, close } => {
                if let Node::Object { properties } = self.tree.node(value) {
                    self.object(properties, Some((open, close)));
                } else {
                    let start = self.output.out.len() as u32;
                    self.node(value);
                    self.output.atom_since(start, open);
                }
            }
            Node::StoreSubscription(store) => self.store_subscription(store),
            Node::GeneratedIdentifier { prefix, index } => {
                self.node(prefix);
                write!(self.output.out, "{index}").expect("writing to a String cannot fail");
            }
            Node::TypeQuery(value) => {
                self.output.push("typeof ");
                self.node(value);
            }
            Node::TypeArguments { callee, arguments } if self.tree.javascript && !self.in_type => {
                self.instantiated(callee, arguments);
            }
            Node::DeclaredType(value) => self.declared_type(value),
            Node::TypeArguments { callee, arguments } => {
                self.node(callee);
                self.output.push("<");
                self.separated(arguments, ", ");
                self.output.push(">");
            }
            Node::TypeAnnotation(value) => {
                self.output.push(": ");
                self.node(value);
            }
            Node::TypeLiteral(properties) => self.type_literal(properties),
            Node::TypeProperty { name, value } => {
                self.node(name);
                self.output.push(": ");
                self.node(value);
                self.output.push(";\n");
            }
            Node::TypeUnion(parts) => self.separated(parts, " | "),
            Node::NamedProperty { name, value } => {
                self.node(name);
                self.output.push(": ");
                self.node(value);
                self.output.push(",\n");
            }
            Node::Const { name, value } => self.declaration("const ", name, value),
            Node::TypeAlias { name, value } => self.declaration("type ", name, value),
            Node::Render {
                type_parameters,
                asynchronous,
                body,
                name,
            } => self.render(type_parameters, asynchronous, body, name),
            Node::Return(value) => {
                self.output.push("return ");
                self.node(value);
                self.output.push(";\n");
            }
            Node::GenericExport {
                type_parameters,
                names,
                declared,
            } => self.generic_export(type_parameters, names, declared),
            Node::ExportDefault(value) => self.export_default(value),
            _ => unreachable!("ordinary nodes are printed by node"),
        }
    }

    /// The store subscription `$name`, declared with the store's value type.
    fn store_subscription(&mut self, store: Span) {
        let name = store.text(self.source);
        self.output.push(";let $");
        self.output.push(name);
        if self.tree.javascript {
            for part in [" = __rsvelte_store_get(", name, ");\n"] {
                self.output.push(part);
            }
            return;
        }
        // svelte-check copies a finding on the store to each read of `$x`; the store's name
        // locates it.
        self.output.push(" = __sveltets_2_store_get(");
        self.output.atom(name, store);
        self.output.push(");\n");
    }

    /// svelte2tsx's runes component: a type of the same name lets an import name its type.
    fn export_default(&mut self, value: NodeIdentifier) {
        if self.tree.javascript {
            return self.javascript_export(value);
        }
        self.output.push("const ");
        self.default_export_name();
        self.output.push(" = ");
        self.node(value);
        self.output.push(";\ntype ");
        self.default_export_name();
        self.output.push(" = ReturnType<typeof ");
        self.default_export_name();
        self.output.push(">;\nexport default ");
        self.default_export_name();
        self.output.push(";\n");
    }

    /// svelte2tsx's `function $$render<type parameters>() { body }`, async after a top-level
    /// `await`.
    fn render(
        &mut self,
        type_parameters: Option<TypeParameters>,
        asynchronous: bool,
        body: Range,
        name: Option<Span>,
    ) {
        self.output.push(if asynchronous {
            "async function "
        } else {
            "function "
        });
        match name {
            Some(name) => self.output.atom("$$render", name),
            None => self.output.push("$$render"),
        }
        match type_parameters {
            Some(TypeParameters::Attribute(span)) => {
                self.output.push("<");
                self.output.copy(self.source, span);
                // svelte2tsx maps the rest of the line to the character after the value, its
                // closing quote.
                let after = Span::new(span.end_offset, span.end_offset + 1);
                self.output.atom(">() {", after);
                self.output.push("\n");
            }
            Some(parameters @ TypeParameters::Declared(_)) => {
                let parameters = self.type_parameters(parameters);
                self.output.push("<");
                self.output.push(&parameters);
                self.output.push(">() {\n");
            }
            None => self.output.push("() {\n"),
        }
        self.body(body);
        self.output.push("}\n");
    }

    /// `const name = value;` or `type name = value;`.
    fn declaration(&mut self, keyword: &str, name: NodeIdentifier, value: NodeIdentifier) {
        self.output.push(keyword);
        self.node(name);
        self.output.push(" = ");
        self.node(value);
        self.output.push(";\n");
    }

    fn type_literal(&mut self, properties: Range) {
        if self.tree.children(properties).is_empty() {
            self.output.push("{}");
        } else {
            self.output.push("{\n");
            self.body(properties);
            self.output.push("}");
        }
    }
}
