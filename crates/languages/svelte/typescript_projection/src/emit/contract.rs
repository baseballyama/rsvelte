//! The node kinds `node` does not match itself: the contract's render function, types and default
//! export, and the declarations, quoted text, located wrappers and generated names that the
//! template's lowering builds too.

use std::fmt::Write as _;

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Range;

use super::Printer;
use crate::syntax_tree::{Instance, Node, NodeIdentifier, TypeParameters};

impl Printer<'_> {
    pub(super) fn contract_node(&mut self, node: Node) {
        match node {
            Node::ProgramParts { parts, .. } | Node::Parts(parts) => {
                for &part in self.tree.children(parts) {
                    self.node(part);
                }
                if let Node::ProgramParts { end_tag, .. } = node {
                    self.program_end(end_tag);
                }
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
            Node::CommentCast(comment) => self.comment_cast(comment),
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
            Node::TypeProperty {
                name,
                value,
                optional,
            } => self.type_property(name, value, optional),
            Node::TypeUnion(parts) => self.separated(parts, " | "),
            Node::NamedProperty { name, value } => {
                self.node(name);
                self.output.push(": ");
                self.node(value);
                self.output.push(",\n");
            }
            Node::Const { name, value } => self.declaration("const ", name, value),
            Node::TypeAlias { name, value } => self.declaration("type ", name, value),
            Node::TypeDefinition { name, value } => self.type_definition(name, value),
            Node::Render {
                type_parameters,
                asynchronous,
                body,
                name,
            } => self.render(type_parameters, asynchronous, body, name),
            Node::Return(value) => self.returned(value),
            Node::GenericExport {
                type_parameters,
                names,
                declared,
            } => self.generic_export(type_parameters, names, declared),
            Node::ExportDefault {
                component,
                instance,
            } => self.export_default(component, instance),
            _ => unreachable!("ordinary nodes are printed by node"),
        }
    }

    /// The store subscription `$name`, declared with the store's value type, between svelte2tsx's
    /// ignore comments.
    fn store_subscription(&mut self, store: Span) {
        let name = store.text(self.source);
        let start = self.output.out.len() as u32;
        for part in [";let $", name, " = __sveltets_2_store_get(", name, ");"] {
            self.output.push(part);
        }
        self.output.ignore_since(start);
        self.output.push("\n");
    }

    /// svelte2tsx's `const X = component; type X = …; export default X;`: the type of the same
    /// name lets an import name the component's instance.
    fn export_default(&mut self, component: NodeIdentifier, instance: Instance) {
        let unrendered = instance.unrendered();
        let instance = match instance {
            Instance::Returned => "ReturnType",
            Instance::Constructed => "InstanceType",
        };
        if self.tree.javascript {
            return self.javascript_export(component, instance, unrendered);
        }
        self.output.push("const ");
        self.push_default_export();
        self.output.push(" = ");
        self.node(component);
        if self.tree.holes {
            self.output.push(" as unknown as ");
            self.render_result(|_| {}, unrendered);
        }
        self.output.push(";\ntype ");
        self.push_default_export();
        for part in [" = ", instance, "<typeof "] {
            self.output.push(part);
        }
        self.push_default_export();
        self.output.push(">;\nexport default ");
        self.push_default_export();
        self.output.push(";\n");
    }

    /// The type of what `$$render` returns, instantiated with what `arguments` writes. svelte2tsx
    /// makes the component outside the render function, so when a hole closes it before its
    /// return, the component is `unrendered`, its helper's constraints.
    pub(super) fn render_result(&mut self, arguments: impl FnOnce(&mut Self), unrendered: &str) {
        let holes = self.tree.holes;
        if holes {
            self.output.push("__rsvelte_rendered<");
        }
        self.output.push("Awaited<ReturnType<typeof $$render");
        arguments(self);
        self.output.push(">>");
        if holes {
            for part in [", ", unrendered, ">"] {
                self.output.push(part);
            }
        }
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
                // svelte2tsx maps the rest of the line to the character after the value, its
                // closing quote.
                let after = Span::new(span.end_offset, span.end_offset + 1);
                if self.tree.javascript {
                    // svelte2tsx writes the list and its `>` between its ignore comments: the start
                    // keeps `</` from reading as a closing tag, and the end closes a comment the
                    // list leaves open. The `>` maps to the opening quote, which nothing else maps
                    // from.
                    let start = self.output.out.len() as u32;
                    self.output.push("/*\u{3a9}ignore_start\u{3a9}*/");
                    self.output.copy(self.source, span);
                    let before = Span::new(span.start_offset - 1, span.start_offset);
                    self.output.atom(">", before);
                    self.output.ignore_since(start);
                    self.output
                        .atom("/*\u{3a9}ignore_end\u{3a9}*/() {\n", after);
                } else {
                    self.output.copy(self.source, span);
                    self.output.atom(">() {", after);
                    self.output.push("\n");
                }
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

    /// `name: value;` or, when `optional`, `name?: value;`, on a line of its own.
    fn type_property(&mut self, name: NodeIdentifier, value: NodeIdentifier, optional: bool) {
        self.node(name);
        self.output.push(if optional { "?: " } else { ": " });
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

    /// The render function's return, which svelte2tsx appends with no mapping, so svelte-check
    /// drops a finding in it.
    fn returned(&mut self, value: NodeIdentifier) {
        let start = self.output.out.len() as u32;
        self.output.push("return ");
        self.node(value);
        self.output.unmapped_since(start);
        self.output.push(";\n");
    }
}
