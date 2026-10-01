//! The TypeScript view of a component, for type checking (upstream: svelte2tsx).
//!
//! The instance
//! script comes first, verbatim; the template follows as statements TypeScript can check: an
//! element is a `svelteHTML.createElement` call (declared by the vendored svelte-check shim) with
//! its attributes as an object literal, an `{#if}` is an `if`, a `{expression}` is a statement.
//! Everything copied from the component is mapped, so a diagnostic maps back to where it was
//! written.

use rsvelte_javascript::syntax_tree::TypeScriptKind;
use rsvelte_javascript::{NodeIdentifier, SyntaxTree};
use rsvelte_kernel::diagnostics::diagnostic::Unsupported;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;

use crate::syntax::syntax_tree::{
    Attribute, AttributeValue, Component, Part, TemplateNode, TemplateNodeIdentifier,
};

#[derive(Debug)]
pub enum Projection {
    /// Not type-checked: without `lang="ts"` svelte-check reports no semantic diagnostics
    /// (`checkJavaScript` is offset).
    JavaScript,
    TypeScript(Emitter),
}

type R<T> = Result<T, Unsupported>;

/// # Errors
///
/// [`Unsupported`] if the component holds a construct the projection does not handle yet.
pub fn project(c: &Component, source_text: &str) -> R<Projection> {
    let Some(script) = c.instance.as_ref().filter(|s| s.typescript) else {
        return Ok(Projection::JavaScript);
    };
    let mut p = Projector {
        c,
        source_text,
        e: Emitter::new(),
    };
    p.e.copy(source_text, script.content);
    p.e.push("\n;{\n");
    p.children(c.children(c.root))?;
    p.e.push("}\n");
    Ok(Projection::TypeScript(p.e))
}

struct Projector<'a> {
    c: &'a Component,
    source_text: &'a str,
    e: Emitter,
}

impl Projector<'_> {
    fn children(&mut self, identifiers: &[TemplateNodeIdentifier]) -> R<()> {
        for &identifier in identifiers {
            self.node(identifier)?;
        }
        Ok(())
    }

    fn node(&mut self, identifier: TemplateNodeIdentifier) -> R<()> {
        match *self.c.node(identifier) {
            TemplateNode::Text { .. } | TemplateNode::Comment { .. } => {}
            TemplateNode::Expression { span, .. } => {
                self.expression(span);
                self.e.push(";\n");
            }
            TemplateNode::Element {
                name,
                attributes,
                children,
                ..
            } => {
                let tag = name.text(self.source_text);
                if !tag.starts_with(|c: char| c.is_ascii_lowercase()) || tag.contains(['-', ':']) {
                    return Err(Unsupported::at(
                        "components, custom elements and svelte: elements",
                        name,
                    ));
                }
                self.e.push("{ svelteHTML.createElement(\"");
                self.e.push(tag);
                self.e.push("\", {");
                for a in self.c.attributes(attributes) {
                    self.attribute(a);
                }
                self.e.push("});\n");
                self.children(self.c.children(children))?;
                self.e.push("}\n");
            }
            TemplateNode::If {
                test,
                consequent,
                alternate,
                ..
            } => {
                self.e.push("if (");
                let test = expression_range(&self.c.javascript, test);
                self.e.copy(self.source_text, test);
                self.e.mark(test.end_offset);
                self.e.push(") {\n");
                self.children(self.c.children(consequent))?;
                self.e.push("}");
                if let Some(alternate) = alternate {
                    self.e.push(" else {\n");
                    self.children(self.c.children(alternate))?;
                    self.e.push("}");
                }
                self.e.push("\n");
            }
        }
        Ok(())
    }

    fn attribute(&mut self, a: &Attribute) {
        let source_text = self.source_text;
        let parts = match a.value {
            AttributeValue::True => &[][..],
            AttributeValue::Parts(r) => self.c.parts(r),
        };
        self.e.push(" ");
        if a.shorthand {
            // `{name}` is a shorthand property: TypeScript reports an undeclared name on it.
            self.expression(a.span);
            self.e.push(",");
            return;
        }
        let name = a.name.text(source_text);
        if is_identifier(name) {
            self.e.copy(source_text, a.name);
        } else {
            self.e.mark(a.name.start_offset);
            self.e.push("\"");
            self.e.copy(source_text, a.name);
            self.e.push("\"");
        }
        // svelte2tsx turns `=` into `:` in place, so a range ending at the key maps to the `=`;
        // a valueless attribute has no `=` and its key's range ends on its last character.
        if !matches!(a.value, AttributeValue::True) {
            self.e.mark(a.name.end_offset);
        }
        self.e.push(": ");
        match (a.value, parts) {
            (AttributeValue::True, _) => self.e.push("true"),
            (_, [Part::Expression { span, .. }]) if !a.quoted => self.expression(*span),
            (_, [Part::Text(s)]) if s.is_empty() => {
                self.e
                    .copy(source_text, Span::new(s.start_offset - 1, s.end_offset + 1));
            }
            _ if parts.iter().all(|p| matches!(p, Part::Text(_))) => {
                self.e.push("\"");
                for p in parts {
                    if let Part::Text(s) = p {
                        self.text(*s, &['"', '\\', '\n', '\r']);
                    }
                }
                self.e.push("\"");
            }
            _ => {
                self.e.push("`");
                for p in parts {
                    match p {
                        Part::Text(s) => self.text(*s, &['`', '\\', '$']),
                        Part::Expression { span, .. } => {
                            self.e.push("${");
                            self.expression(*span);
                            self.e.push("}");
                        }
                    }
                }
                self.e.push("`");
            }
        }
        self.e.push(",");
    }

    /// The expression inside `{…}`, with the `}` mapped: svelte2tsx rewrites the braces in place,
    /// so a range ending at the expression's end maps to the `}`.
    fn expression(&mut self, braces: Span) {
        self.e.copy(self.source_text, inner(braces));
        self.e.mark(braces.end_offset - 1);
    }

    /// Raw attribute text (character references stay as written, as in svelte2tsx) inside a
    /// literal delimited by one of `special`.
    fn text(&mut self, s: Span, special: &[char]) {
        let raw = s.text(self.source_text);
        if !raw.contains(special) {
            self.e.copy(self.source_text, s);
            return;
        }
        self.e.mark(s.start_offset);
        for ch in raw.chars() {
            match ch {
                '\n' => self.e.push("\\n"),
                '\r' => self.e.push("\\r"),
                c if special.contains(&c) => {
                    self.e.push_char('\\');
                    self.e.push_char(c);
                }
                c => self.e.push_char(c),
            }
        }
    }
}

/// The expression inside `{…}`.
const fn inner(braces: Span) -> Span {
    Span::new(braces.start_offset + 1, braces.end_offset - 1)
}

/// An expression's range including the TypeScript suffix the tree erases (`x as T`, `x!`).
fn expression_range(syntax_tree: &SyntaxTree, e: NodeIdentifier) -> Span {
    let mut span = syntax_tree
        .source_location(e)
        .span()
        .expect("a parsed expression has a source range");
    for t in &syntax_tree.typescript {
        if t.node == e
            && matches!(
                t.kind,
                TypeScriptKind::As | TypeScriptKind::Satisfies | TypeScriptKind::NonNull
            )
        {
            span.end_offset = span.end_offset.max(t.span.end_offset);
        }
    }
    span
}

fn is_identifier(s: &str) -> bool {
    let mut chars = s.chars();
    chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}
