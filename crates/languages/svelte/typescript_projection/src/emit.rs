use std::fmt::Write as _;

use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Range;

use crate::syntax_tree::{Node, NodeIdentifier, SourceExpression, SyntaxTree};

/// [`emit_named`] for a component without a file, which svelte2tsx names `$$Component`.
#[must_use]
pub fn emit(tree: &SyntaxTree, source: &str) -> Emitter {
    emit_named(tree, source, "")
}

/// The projection of the component at `path`, whose name its default export declares.
#[must_use]
pub fn emit_named(tree: &SyntaxTree, source: &str, path: &str) -> Emitter {
    let mut printer = Printer {
        tree,
        source,
        path,
        output: Emitter::new(),
        indent: 0,
    };
    printer.output.push(";\n");
    printer.children(tree.root());
    printer.output
}

struct Printer<'a> {
    tree: &'a SyntaxTree,
    source: &'a str,
    path: &'a str,
    output: Emitter,
    indent: usize,
}

mod generic;

impl Printer<'_> {
    fn children(&mut self, range: Range) {
        for &identifier in self.tree.children(range) {
            self.indentation();
            self.node(identifier);
        }
    }

    fn property(&mut self, name: Span, lowercase: bool, value: NodeIdentifier, end: Option<u32>) {
        // svelte2tsx quotes every name, and a finding on it covers the name without quotes.
        let start = self.output.out.len() as u32;
        self.output.push("\"");
        if lowercase {
            for c in name.text(self.source).chars().flat_map(char::to_lowercase) {
                self.output.push_char(c);
            }
        } else {
            self.output.push(name.text(self.source));
        }
        self.output.push("\"");
        self.output.atom_since(start, name);
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
            Node::Object { properties } => self.object(properties),
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
                lowercase,
                value,
                end,
            } => self.property(name, lowercase, value, end),
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
            node => self.contract_node(node),
        }
    }

    /// What svelte2tsx adds around a component's call for its children.
    fn component_part(&mut self, node: Node) {
        match node {
            Node::SnippetProperty {
                name,
                parameters,
                body,
            } => {
                self.node(name);
                self.output.push(": ");
                match parameters {
                    Some(parameters) => self.node(parameters),
                    None => self.output.push("()"),
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
                self.output.push("},\n");
            }
            Node::SnippetNames { names, component } => {
                self.output.push("const { ");
                self.separated(names, ", ");
                self.output.push(" } = __rsvelte_component_props(");
                self.node(component);
                self.output.push(");\n");
            }
            Node::ImplicitChildren(at) => {
                // svelte2tsx's `children` has no source text, so a finding on it lands where its
                // source map puts the key.
                self.output.atom("children", Span::new(at, at));
                self.output.push(": __rsvelte_children,\n");
            }
            _ => unreachable!("only a component's parts are printed here"),
        }
    }

    fn contract_node(&mut self, node: Node) {
        match node {
            Node::ProgramParts { parts, .. } => {
                for &part in self.tree.children(parts) {
                    self.node(part);
                }
                self.program_end();
            }
            Node::SourceCopy { span, .. } => {
                self.output.copy(self.source, span);
                self.output.mark(span.end_offset);
            }
            Node::StoreSubscription(store) => {
                let name = store.text(self.source);
                // A type query reads no value, so this declaration can raise no finding of its own.
                for part in [
                    ";let $",
                    name,
                    "!: __rsvelte_store_value<typeof ",
                    name,
                    ">;\n",
                ] {
                    self.output.push(part);
                }
            }
            Node::GeneratedIdentifier { prefix, index } => {
                self.node(prefix);
                write!(self.output.out, "{index}").expect("writing to a String cannot fail");
            }
            Node::TypeQuery(value) => {
                self.output.push("typeof ");
                self.node(value);
            }
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
            Node::Const { name, value } => {
                self.output.push("const ");
                self.node(name);
                self.output.push(" = ");
                self.node(value);
                self.output.push(";\n");
            }
            Node::Render {
                type_parameters,
                body,
            } => {
                self.output.push("function $$render<");
                self.output.copy(self.source, type_parameters);
                self.output.push(">() {\n");
                self.body(body);
                self.output.push("}\n");
            }
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
            Node::ExportDefault(value) => {
                // svelte2tsx's runes component: a type of the same name lets an import name the
                // instance's type.
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
            _ => unreachable!("ordinary nodes are printed by node"),
        }
    }

    fn component_name(&mut self) {
        if self.path.is_empty() {
            self.output.push("$$Component");
        } else {
            crate::write_component_name(self.path, &mut self.output.out);
        }
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
        self.output
            .push(": ReturnType<import('svelte').Snippet> => {\n");
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

    fn object(&mut self, properties: Range) {
        if self.tree.children(properties).is_empty() {
            self.output.push("{}");
        } else {
            self.output.push("{\n");
            self.body(properties);
            self.output.push("}");
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

    fn node_string_literal(&mut self, value: &str) {
        self.output.push("\"");
        for ch in value.chars() {
            self.character(ch, false);
        }
        self.output.push("\"");
    }

    fn string(&mut self, parts: Range, template: bool) {
        let quote = if template { "`" } else { "\"" };
        self.output.push(quote);
        for &part in self.tree.children(parts) {
            if let Node::Text(span) = self.tree.node(part) {
                self.text(span, template);
            } else {
                self.output.push("${");
                self.node(part);
                self.output.push("}");
            }
        }
        self.output.push(quote);
    }

    fn source_expression(&mut self, expression: SourceExpression) {
        self.output.copy(self.source, expression.span);
        self.output.mark(expression.end);
    }

    fn text(&mut self, span: Span, template: bool) {
        let special: &[char] = if template {
            &['`', '\\', '$', '\n', '\r']
        } else {
            &['"', '\\', '\n', '\r']
        };
        let text = span.text(self.source);
        if !text.contains(special) {
            self.output.copy(self.source, span);
            return;
        }
        for (offset, ch) in text.char_indices() {
            self.output.mark(span.start_offset + offset as u32);
            self.character(ch, template);
        }
    }

    fn character(&mut self, ch: char, template: bool) {
        match ch {
            '\n' => self.output.push("\\n"),
            '\r' => self.output.push("\\r"),
            '\\' | '"' if !template => {
                self.output.push_char('\\');
                self.output.push_char(ch);
            }
            '\\' | '`' | '$' if template => {
                self.output.push_char('\\');
                self.output.push_char(ch);
            }
            c => self.output.push_char(c),
        }
    }
}
