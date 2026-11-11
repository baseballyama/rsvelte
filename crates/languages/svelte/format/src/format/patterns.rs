use oxc_ast::AstKind;
use oxc_ast::ast::{
    ArrayExpressionElement, BindingPattern, Expression, ObjectPropertyKind, PropertyKey,
    PropertyKind,
};
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;
use rsvelte_typescript_tree::PatternIdentifier;

use super::{Printer, R, Span, Unsupported};

/// The document position of an oxc node.
pub(super) const fn span(span: oxc_span::Span) -> Span {
    Span::new(span.start, span.end)
}

/// Whether what `visit` walks holds TypeScript: an annotation, a cast or type arguments.
pub(super) fn has_typescript(visit: impl FnOnce(&mut TypeScriptFinder)) -> bool {
    let mut finder = TypeScriptFinder(false);
    visit(&mut finder);
    finder.0
}

pub(super) struct TypeScriptFinder(bool);

impl<'a> Visit<'a> for TypeScriptFinder {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        self.0 |= matches!(
            kind,
            AstKind::TSTypeAnnotation(_)
                | AstKind::TSAsExpression(_)
                | AstKind::TSSatisfiesExpression(_)
                | AstKind::TSNonNullExpression(_)
                | AstKind::TSTypeAssertion(_)
                | AstKind::TSInstantiationExpression(_)
                | AstKind::TSTypeParameterInstantiation(_)
                | AstKind::TSTypeParameterDeclaration(_)
        );
    }
}

/// A property's value: a pattern's, or an object literal's in a default.
#[derive(Clone, Copy)]
enum Value<'p, 'a> {
    Pattern(&'p BindingPattern<'a>),
    Expression(&'p Expression<'a>),
}

impl<'p> Value<'p, '_> {
    fn name(self) -> Option<&'p str> {
        match self {
            Self::Pattern(BindingPattern::BindingIdentifier(i)) => Some(i.name.as_str()),
            Self::Expression(Expression::Identifier(i)) => Some(i.name.as_str()),
            _ => None,
        }
    }
}

impl Printer<'_, '_, '_> {
    /// The plugin's `expandNode`: an `{#each}` or `{#await}` pattern on one line, each part after
    /// a space (` { a, b: [c] }`), with the root's type annotation as written.
    pub(super) fn expand(&self, pattern: Option<PatternIdentifier>) -> R<String> {
        let mut out = String::new();
        let Some(pattern) = pattern else {
            return Ok(out);
        };
        let parameter = self.c.javascript.get_pattern(pattern);
        self.expand_pattern(&parameter.pattern, &mut out)?;
        // `expandNode` prints the root's annotation only and drops the others.
        if has_typescript(|f| f.visit_binding_pattern(&parameter.pattern)) {
            return Err(Unsupported::at(
                "TypeScript inside a block's pattern",
                span(parameter.pattern.span()),
            ));
        }
        if let Some(annotation) = &parameter.type_annotation {
            out.push_str(": ");
            out.push_str(span(annotation.type_annotation.span()).text(self.source_text));
        }
        Ok(out)
    }

    /// `_expandNode` of a binding pattern.
    fn expand_pattern(&self, pattern: &BindingPattern<'_>, out: &mut String) -> R<()> {
        match pattern {
            BindingPattern::BindingIdentifier(identifier) => {
                out.push(' ');
                out.push_str(identifier.name.as_str());
            }
            BindingPattern::ArrayPattern(array) => {
                out.push_str(" [");
                let start = out.len();
                let mut first = true;
                for element in &array.elements {
                    if !std::mem::take(&mut first) {
                        out.push(',');
                    }
                    match element {
                        Some(element) => self.expand_pattern(element, out)?,
                        None => out.push(' '),
                    }
                }
                if let Some(rest) = &array.rest {
                    if !std::mem::take(&mut first) {
                        out.push(',');
                    }
                    self.expand_rest(Value::Pattern(&rest.argument), out)?;
                }
                // `.join(',').slice(1)`: the first element's leading space goes.
                if !first {
                    out.remove(start);
                }
                out.push(']');
            }
            BindingPattern::AssignmentPattern(assignment) => {
                self.expand_pattern(&assignment.left, out)?;
                out.push_str(" =");
                self.expand_expression(&assignment.right, out)?;
            }
            BindingPattern::ObjectPattern(object) => {
                out.push_str(" {");
                let mut first = true;
                for property in &object.properties {
                    if !std::mem::take(&mut first) {
                        out.push(',');
                    }
                    self.expand_property(
                        &property.key,
                        Value::Pattern(&property.value),
                        property.computed,
                        false,
                        span(property.span),
                        out,
                    )?;
                }
                if let Some(rest) = &object.rest {
                    if !first {
                        out.push(',');
                    }
                    self.expand_rest(Value::Pattern(&rest.argument), out)?;
                }
                out.push_str(" }");
            }
        }
        Ok(())
    }

    /// `_expandNode` of an expression, which a default value is.
    fn expand_expression(&self, e: &Expression<'_>, out: &mut String) -> R<()> {
        match e {
            Expression::ArrayExpression(array) => {
                out.push_str(" [");
                let start = out.len();
                for (i, element) in array.elements.iter().enumerate() {
                    if i > 0 {
                        out.push(',');
                    }
                    match element {
                        ArrayExpressionElement::Elision(_) => out.push(' '),
                        ArrayExpressionElement::SpreadElement(spread) => {
                            self.expand_rest(Value::Expression(&spread.argument), out)?;
                        }
                        element => {
                            let element = element
                                .as_expression()
                                .expect("an element is an expression");
                            self.expand_expression(element, out)?;
                        }
                    }
                }
                if !array.elements.is_empty() {
                    out.remove(start);
                }
                out.push(']');
            }
            Expression::Identifier(identifier) => {
                out.push(' ');
                out.push_str(identifier.name.as_str());
            }
            Expression::NumericLiteral(_)
            | Expression::StringLiteral(_)
            | Expression::BooleanLiteral(_)
            | Expression::NullLiteral(_) => {
                out.push(' ');
                out.push_str(span(e.span()).text(self.source_text));
            }
            Expression::ObjectExpression(object) => {
                out.push_str(" {");
                for (i, property) in object.properties.iter().enumerate() {
                    if i > 0 {
                        out.push(',');
                    }
                    match property {
                        ObjectPropertyKind::ObjectProperty(p)
                            if p.kind == PropertyKind::Init && !p.method =>
                        {
                            self.expand_property(
                                &p.key,
                                Value::Expression(&p.value),
                                p.computed,
                                true,
                                span(p.span),
                                out,
                            )?;
                        }
                        ObjectPropertyKind::SpreadProperty(spread) => {
                            if !matches!(spread.argument, Expression::Identifier(_)) {
                                return Err(Unsupported::at(
                                    "a pattern after `...` in an object",
                                    span(spread.span),
                                ));
                            }
                            self.expand_rest(Value::Expression(&spread.argument), out)?;
                        }
                        ObjectPropertyKind::ObjectProperty(p) => {
                            return Err(Unsupported::at(
                                "this part of a block's pattern",
                                span(p.span),
                            ));
                        }
                    }
                }
                out.push_str(" }");
            }
            // `_expandNode` throws on any other node.
            _ => {
                return Err(Unsupported::at(
                    "this part of a block's pattern",
                    span(e.span()),
                ));
            }
        }
        Ok(())
    }

    fn expand_value(&self, value: Value<'_, '_>, out: &mut String) -> R<()> {
        match value {
            Value::Pattern(p) => self.expand_pattern(p, out),
            Value::Expression(e) => self.expand_expression(e, out),
        }
    }

    /// `_expandNode`'s `RestElement` case.
    fn expand_rest(&self, argument: Value<'_, '_>, out: &mut String) -> R<()> {
        out.push_str(" ...");
        let start = out.len();
        self.expand_value(argument, out)?;
        // `.slice(1)` of the argument.
        out.remove(start);
        Ok(())
    }

    /// `_expandNode`'s `Property` case; `in_object` is its `parent` being an object literal.
    fn expand_property(
        &self,
        key: &PropertyKey<'_>,
        value: Value<'_, '_>,
        computed: bool,
        in_object: bool,
        at: Span,
        out: &mut String,
    ) -> R<()> {
        // `node.key.name`, which a computed key has when it is an identifier.
        let key_name = match key {
            PropertyKey::StaticIdentifier(identifier) => Some(identifier.name.as_str()),
            PropertyKey::Identifier(identifier) => Some(identifier.name.as_str()),
            _ => None,
        };
        let key_doc = |out: &mut String| -> R<()> {
            if computed {
                out.push_str(" [");
                out.push_str(span(key.span()).text(self.source_text));
                out.push(']');
                return Ok(());
            }
            match key {
                PropertyKey::StaticIdentifier(identifier) => {
                    out.push(' ');
                    out.push_str(identifier.name.as_str());
                    Ok(())
                }
                PropertyKey::StringLiteral(_) | PropertyKey::NumericLiteral(_) => {
                    out.push(' ');
                    out.push_str(span(key.span()).text(self.source_text));
                    Ok(())
                }
                _ => Err(Unsupported::at(
                    "this part of a block's pattern",
                    span(key.span()),
                )),
            }
        };
        let nested = matches!(
            value,
            Value::Pattern(BindingPattern::ObjectPattern(_) | BindingPattern::ArrayPattern(_))
        );
        if nested {
            if !computed && key_name.is_none() {
                // `' ' + node.key.name` prints ` undefined` for a quoted key.
                return Err(Unsupported::at("a quoted key before a nested pattern", at));
            }
            key_doc(out)?;
            out.push(':');
            return self.expand_value(value, out);
        }
        let value_name = value.name();
        if in_object || (value_name.is_some() && key_name != value_name) {
            key_doc(out)?;
            out.push(':');
            return self.expand_value(value, out);
        }
        // Upstream prints only the value from here on; that is the property itself only when
        // it is written short (`a`, `a = 1`).
        if value_name.is_some() && computed {
            return Err(Unsupported::at("a computed key named like its value", at));
        }
        if let Value::Pattern(BindingPattern::AssignmentPattern(assignment)) = value {
            let left = Value::Pattern(&assignment.left).name();
            if computed || key_name.is_none() || left.is_none() || key_name != left {
                return Err(Unsupported::at(
                    "a renamed property with a default in a block's pattern",
                    at,
                ));
            }
        }
        self.expand_value(value, out)
    }
}
