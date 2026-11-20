use std::fmt::Write as _;

use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Range;

use crate::syntax_tree::{
    Node, NodeIdentifier, SourceExpression, Spelling, SyntaxTree, TypeParameters,
};

/// An emitter sized from the source, so that half the projections never grow.
fn projection_emitter(source: usize) -> Emitter {
    // Corpus medians: 3.3 bytes per source byte, a mapping per 16 bytes, an atom per 50.
    Emitter::with_capacity(source * 33 / 10, source / 16, source / 50)
}

/// The projection of the component at `path`, whose name its default export declares; svelte2tsx
/// names a component without a file, an empty `path`, `$$Component`.
#[must_use]
pub fn emit(tree: &SyntaxTree, source: &str, path: &str) -> Emitter {
    let mut printer = Printer {
        tree,
        source,
        component: if path.is_empty() {
            "$$Component".to_owned()
        } else {
            crate::component_name(path)
        },
        output: projection_emitter(source.len()),
        indent: 0,
        in_type: false,
    };
    printer.output.push(";\n");
    printer.children(tree.root());
    // The database keeps the projection, so spare room would stay live: 3.6% more peak memory.
    printer.output.out.shrink_to_fit();
    printer.output
}

struct Printer<'a> {
    tree: &'a SyntaxTree,
    source: &'a str,
    /// The default export's name, which the projection writes several times.
    component: String,
    output: Emitter,
    indent: usize,
    /// Inside a `JSDoc` type, where a JavaScript projection prints types as TypeScript does.
    in_type: bool,
}

mod component;
mod generic;
mod javascript;
mod string;

impl Printer<'_> {
    fn children(&mut self, range: Range) {
        for &identifier in self.tree.children(range) {
            self.indentation();
            self.node(identifier);
        }
    }

    fn property(
        &mut self,
        name: Span,
        spelling: Spelling,
        value: NodeIdentifier,
        end: Option<u32>,
    ) {
        // svelte2tsx quotes every name, and a finding on it covers the name without quotes.
        let start = self.output.out.len() as u32;
        self.output.push("\"");
        match spelling {
            Spelling::AsWritten => self.output.push(name.text(self.source)),
            Spelling::Lowercase => {
                for c in name.text(self.source).chars().flat_map(char::to_lowercase) {
                    self.output.push_char(c);
                }
            }
            Spelling::Event => {
                self.output.push("on:");
                self.output.push(name.text(self.source));
            }
        }
        self.output.push("\"");
        // An `end` inside the name shortens what a finding on it covers.
        let original = match end {
            Some(end) if end < name.end_offset => Span::new(name.start_offset, end),
            _ => name,
        };
        self.output.atom_since(start, original);
        if let Some(end) = end {
            self.output.mark(end);
        }
        self.output.push(": ");
        self.node(value);
        self.output.push(",\n");
    }

    /// `target = value`, or `target = value as T` for svelte2tsx's one-way binding.
    fn assignment(&mut self, target: NodeIdentifier, value: NodeIdentifier) {
        let assertion = if let Node::Asserted { target, assertion } = self.tree.node(target) {
            self.node(target);
            Some(assertion)
        } else {
            self.node(target);
            None
        };
        self.output.push(" = ");
        self.node(value);
        if let Some(assertion) = assertion {
            self.output.copy(self.source, assertion);
        }
    }

    fn node(&mut self, identifier: NodeIdentifier) {
        match self.tree.node(identifier) {
            Node::Program { span, .. } => {
                self.output.copy(self.source, span);
                self.program_end();
            }
            Node::Source(expression) => self.source_expression(expression),
            Node::Expression(value) => {
                self.output.push("(");
                self.source_expression(value);
                self.output.push(");\n");
            }
            Node::Statement(expression) => {
                self.node(expression);
                self.output.push(";\n");
            }
            Node::Identifier(name) => self.output.push(name),
            Node::IdentifierAt { name, at } => self.output.atom(name, Span::new(at, at)),
            Node::AnyComponent => self.output.push("__rsvelte_any_component"),
            Node::StringLiteralAt { value, at } => {
                let start = self.output.out.len() as u32;
                self.node_string_literal(value);
                self.output.atom_since(start, Span::new(at, at));
            }
            Node::StringLiteral(value) => self.node_string_literal(value),
            Node::Member { object, property } => {
                self.node(object);
                self.output.push(".");
                self.node(property);
            }
            Node::Call { callee, arguments } => self.call(callee, arguments),
            Node::ArrayPattern { index, value } => self.array_pattern(index, value),
            Node::ForOf {
                binding,
                iterable,
                body,
            } => self.for_of(binding, iterable, body),
            Node::Assignment { target, value } => self.assignment(target, value),
            Node::Object { properties } => self.object(properties, None),
            Node::Block { body } => {
                self.output.push("{\n");
                self.body(body);
                self.output.push("}\n");
            }
            Node::If {
                test,
                consequent,
                alternate,
            } => self.branch(test, consequent, alternate),
            Node::Property {
                name,
                spelling,
                value,
                end,
            } => self.property(name, spelling, value, end),
            node @ (Node::SnippetProperty { .. }
            | Node::SnippetNames { .. }
            | Node::ImplicitChildren(_)) => self.component_part(node),
            Node::Shorthand(value) => {
                self.node(value);
                self.output.push(",\n");
            }
            Node::Spread { value, dots } => {
                self.output.atom("...", dots);
                self.output.push("(");
                self.node(value);
                self.output.push("),\n");
            }
            Node::ComputedProperty { key, value } => {
                self.output.push("[");
                self.node(key);
                self.output.push("]: ");
                self.node(value);
                self.output.push(",\n");
            }
            Node::UnmappedSource(span) => self.output.push(span.text(self.source)),
            Node::Commented { comments, value } => self.commented(comments, value),
            Node::Ignored(statement) => {
                self.output.push("// @ts-ignore\n");
                self.indentation();
                self.node(statement);
                self.output.push(";\n");
            }
            Node::Parenthesized(value) => {
                self.output.push("(");
                self.node(value);
                self.output.push(")");
            }
            node @ (Node::Snippet { .. }
            | Node::Arrow { .. }
            | Node::Statements(_)
            | Node::Await(_)
            | Node::Index { .. }
            | Node::Try { .. }
            | Node::Template(_)) => self.template_part(node),
            Node::Boolean => self.output.push("true"),
            Node::String { parts, template } => self.string(parts, template),
            Node::Text(_) => unreachable!("text is printed only inside a string literal"),
            Node::TypeParameter { .. } => unreachable!("type parameters are printed as a list"),
            node => self.contract_node(node),
        }
    }

    /// `value` after `comments`, each on lines of their own.
    fn commented(&mut self, comments: Span, value: NodeIdentifier) {
        self.output.push("\n");
        self.output.atom(comments.text(self.source), comments);
        self.output.push("\n");
        self.node(value);
    }

    fn contract_node(&mut self, node: Node) {
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
            Node::SourceCopy { span, .. } => {
                self.output.copy(self.source, span);
                self.output.mark(span.end_offset);
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
            Node::TypeDefinition { name, value } => self.type_definition(name, value),
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
        self.component_name();
        self.output.push(" = ");
        self.node(value);
        self.output.push(";\ntype ");
        self.component_name();
        self.output.push(" = ReturnType<typeof ");
        self.component_name();
        self.output.push(">;\nexport default ");
        self.component_name();
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

    pub(super) fn component_name(&mut self) {
        self.output.push(&self.component);
    }

    fn program_end(&mut self) {
        self.output.push("\n;\n\n");
    }

    fn separated(&mut self, parts: Range, separator: &str) {
        for (index, &part) in self.tree.children(parts).iter().enumerate() {
            if index != 0 {
                self.output.push(separator);
            }
            self.node(part);
        }
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

    fn indentation(&mut self) {
        for _ in 0..self.indent {
            self.output.push("  ");
        }
    }

    /// A function or a block of the template. A snippet's inner `async` function lets its body
    /// hold `{#await}`.
    fn template_part(&mut self, node: Node) {
        let Node::Snippet {
            name,
            type_parameters,
            parameters,
            body,
        } = node
        else {
            match node {
                Node::Statements(statements) => {
                    self.output.push("\n");
                    self.children(statements);
                }
                Node::Index { object, index } => {
                    self.node(object);
                    self.output.push("[");
                    self.node(index);
                    self.output.push("]");
                }
                Node::Await(value) => {
                    self.output.push("await (");
                    self.node(value);
                    self.output.push(")");
                }
                Node::Try { body, catch } => {
                    self.output.push("try {\n");
                    self.body(body);
                    self.output.push("} catch (__rsvelte_error) {\n");
                    self.body(catch);
                    self.output.push("}\n");
                }
                Node::Arrow { body } => {
                    self.output.push("() => {\n");
                    self.body(body);
                    self.output.push("}");
                }
                Node::Template(body) => {
                    self.output.push("async () => {\n");
                    self.body(body);
                    self.output.push("}");
                }
                _ => unreachable!("a template declaration"),
            }
            return;
        };
        self.output.push("const ");
        self.node(name);
        self.output.push(" = ");
        if let Some(type_parameters) = type_parameters {
            self.node(type_parameters);
        }
        match parameters {
            Some(parameters) => self.node(parameters),
            None => self.output.push("()"),
        }
        if !self.tree.javascript {
            self.output.push(": ReturnType<import('svelte').Snippet>");
        }
        self.output.push(" => {\n");
        self.indent += 1;
        self.indentation();
        self.output.push("async () => {\n");
        self.body(body);
        self.output.push("};\n");
        self.indentation();
        self.output.push("return __rsvelte_snippet_return;\n");
        self.indent -= 1;
        self.indentation();
        self.output.push("};\n");
    }

    fn body(&mut self, body: Range) {
        self.indent += 1;
        self.children(body);
        self.indent -= 1;
        self.indentation();
    }

    /// The object of `properties`, whose braces map to `at`'s spans, so that a finding on all of
    /// it does.
    fn object(&mut self, properties: Range, at: Option<(Span, Option<Span>)>) {
        let brace = |output: &mut Emitter, text: &str, at: Option<Span>| match at {
            Some(at) => output.atom(text, at),
            None => output.push(text),
        };
        let (open, close) = at.map_or((None, None), |(open, close)| (Some(open), close));
        if self.tree.children(properties).is_empty() {
            brace(&mut self.output, "{", open);
            brace(&mut self.output, "}", close.or(open));
        } else {
            brace(&mut self.output, "{", open);
            self.output.push("\n");
            self.body(properties);
            brace(&mut self.output, "}", close);
        }
    }

    fn call(&mut self, callee: NodeIdentifier, arguments: Range) {
        self.node(callee);
        self.output.push("(");
        for (index, &argument) in self.tree.children(arguments).iter().enumerate() {
            if index != 0 {
                self.output.push(", ");
            }
            self.node(argument);
        }
        self.output.push(")");
    }

    fn array_pattern(&mut self, index: Option<NodeIdentifier>, value: Option<NodeIdentifier>) {
        self.output.push("[");
        if let Some(index) = index {
            self.node(index);
        }
        self.output.push(", ");
        if let Some(value) = value {
            self.node(value);
        }
        self.output.push("]");
    }

    fn for_of(&mut self, binding: NodeIdentifier, iterable: NodeIdentifier, body: Range) {
        self.output.push("for (let ");
        self.node(binding);
        self.output.push(" of ");
        self.node(iterable);
        self.output.push(") {\n");
        self.body(body);
        self.output.push("}\n");
    }

    fn branch(&mut self, test: NodeIdentifier, consequent: Range, alternate: Option<Range>) {
        self.output.push("if (");
        self.node(test);
        self.output.push(") {\n");
        self.body(consequent);
        self.output.push("}");
        if let Some(body) = alternate {
            self.output.push(" else {\n");
            self.body(body);
            self.output.push("}");
        }
        self.output.push("\n");
    }

    fn source_expression(&mut self, expression: SourceExpression) {
        self.output.copy(self.source, expression.span);
        self.output.mark(expression.end);
    }
}
