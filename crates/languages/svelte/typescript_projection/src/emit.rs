use std::fmt::Write as _;

use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::Range;

use crate::syntax_tree::{Node, NodeIdentifier, SourceExpression, SyntaxTree};

#[must_use]
pub fn emit(tree: &SyntaxTree, source: &str) -> Emitter {
    let mut printer = Printer {
        tree,
        source,
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
    output: Emitter,
    indent: usize,
}

impl Printer<'_> {
    fn children(&mut self, range: Range) {
        for &identifier in self.tree.children(range) {
            self.indentation();
            self.node(identifier);
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
            Node::StringLiteral(value) => {
                self.output.push("\"");
                for ch in value.chars() {
                    self.character(ch, false);
                }
                self.output.push("\"");
            }
            Node::Member { object, property } => {
                self.node(object);
                self.output.push(".");
                self.node(property);
            }
            Node::Call { callee, arguments } => self.call(callee, arguments),
            Node::ArrayPattern { index, value } => self.array_pattern(index, value),
            Node::Arrow { body } => {
                self.output.push("() => {\n");
                self.body(body);
                self.output.push("}");
            }
            Node::ForOf {
                binding,
                iterable,
                body,
            } => self.for_of(binding, iterable, body),
            Node::Assignment { target, value } => {
                self.node(target);
                self.output.push(" = ");
                self.node(value);
            }
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
            Node::Property { name, value, end } => {
                if is_identifier(name.text(self.source)) {
                    self.output.copy(self.source, name);
                } else {
                    self.output.mark(name.start_offset);
                    self.output.push("\"");
                    self.output.copy(self.source, name);
                    self.output.push("\"");
                }
                if let Some(end) = end {
                    self.output.mark(end);
                }
                self.output.push(": ");
                self.node(value);
                self.output.push(",\n");
            }
            Node::Shorthand(value) => {
                self.node(value);
                self.output.push(",\n");
            }
            Node::Spread(value) => {
                self.output.push("...(");
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
            Node::Boolean => self.output.push("true"),
            Node::String { parts, template } => self.string(parts, template),
            Node::Text(_) => unreachable!("text is printed only inside a string literal"),
            node => self.contract_node(node),
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
            Node::ExportDefault(value) => {
                self.output.push("export default ");
                self.node(value);
                self.output.push(";\n");
            }
            _ => unreachable!("ordinary nodes are printed by node"),
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

fn is_identifier(name: &str) -> bool {
    let mut chars = name.chars();
    chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}
