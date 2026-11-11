//! Upstream's `ClassBody` analysis: the state fields a class declares, by field or by a first
//! assignment in its constructor, and the private name each public one keeps its signal in.

use std::borrow::Cow;

use oxc_ast::ast::{
    ClassBody, ClassElement, Expression, MemberExpression, MethodDefinitionKind, PropertyKey,
    Statement,
};
use rsvelte_svelte_semantic::resolve::Resolution;
use rustc_hash::FxHashMap;

use super::{Diagnostic, span_of};

/// A `$state`, `$state.raw`, `$derived` or `$derived.by` field.
#[derive(Clone)]
pub(super) struct StateField {
    /// The field's name, with its `#` when private.
    pub name: Box<str>,
    pub rune: &'static str,
    /// The private name, without `#`, that holds the signal.
    pub key: Box<str>,
    /// The field definition, or the constructor's assignment, that declares it.
    pub at: oxc_span::Span,
    pub constructor: bool,
}

impl StateField {
    pub(super) fn is_private(&self) -> bool {
        self.name.starts_with('#')
    }

    pub(super) fn is_state(&self) -> bool {
        matches!(self.rune, "$state" | "$state.raw")
    }
}

/// The state fields of one class body, in the order upstream declares them.
#[derive(Default)]
pub(super) struct ClassFields {
    fields: Vec<StateField>,
    by_name: FxHashMap<Box<str>, usize>,
}

impl ClassFields {
    pub(super) fn get(&self, name: &str) -> Option<&StateField> {
        self.by_name.get(name).map(|&i| &self.fields[i])
    }

    pub(super) fn iter(&self) -> impl Iterator<Item = &StateField> {
        self.fields.iter()
    }

    pub(super) const fn len(&self) -> usize {
        self.fields.len()
    }

    pub(super) const fn is_empty(&self) -> bool {
        self.fields.is_empty()
    }
}

/// What a name in the class body already is, as upstream's duplicate checks ask.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Member {
    Prop,
    AssignedProp,
    Method(MethodDefinitionKind),
}

/// Upstream `ClassBody`: the state fields of `body`.
///
/// # Errors
///
/// Upstream's `state_field_duplicate` and `duplicate_class_field`.
pub(super) fn class_fields(
    res: &Resolution,
    body: &ClassBody<'_>,
) -> Result<ClassFields, Diagnostic> {
    let mut private_ids: Vec<Cow<'_, str>> = (body.body.iter())
        .filter_map(|element| match element {
            ClassElement::MethodDefinition(m) => m.key.private_name().map(|n| n.as_str().into()),
            ClassElement::PropertyDefinition(p) => p.key.private_name().map(|n| n.as_str().into()),
            _ => None,
        })
        .collect();
    let mut analysis = Analysis {
        res,
        fields: ClassFields::default(),
        members: FxHashMap::default(),
    };
    let mut constructor = None;
    for element in &body.body {
        match element {
            ClassElement::PropertyDefinition(p) if !p.computed && !p.r#static => {
                analysis.handle(p.span, key_name(&p.key), p.value.as_ref(), false)?;
                let Some(name) = key_name(&p.key) else {
                    continue;
                };
                if analysis.members.contains_key(name.as_ref()) {
                    return duplicate_class_field(&name, span_of(&**p));
                }
                let member = if p.value.is_some() {
                    Member::AssignedProp
                } else {
                    Member::Prop
                };
                analysis.members.insert(name.into_owned(), vec![member]);
            }
            ClassElement::MethodDefinition(m) if m.kind == MethodDefinitionKind::Constructor => {
                constructor = Some(m);
            }
            ClassElement::MethodDefinition(m) if !m.computed => {
                let Some(name) = key_name(&m.key) else {
                    continue;
                };
                let name = if m.r#static {
                    format!("@{name}")
                } else {
                    name.into_owned()
                };
                analysis.method(name, m.kind, span_of(&**m))?;
            }
            _ => {}
        }
    }
    if let Some(constructor) = constructor
        && let Some(body) = &constructor.value.body
    {
        for statement in &body.statements {
            let Statement::ExpressionStatement(s) = statement else {
                continue;
            };
            let Expression::AssignmentExpression(assign) = &s.expression else {
                continue;
            };
            let Some(member) = assign.left.as_member_expression() else {
                continue;
            };
            if !matches!(member.object(), Expression::ThisExpression(_)) {
                continue;
            }
            analysis.handle(assign.span, member_name(member), Some(&assign.right), true)?;
        }
    }
    let mut fields = analysis.fields;
    for field in &mut fields.fields {
        if field.is_private() {
            continue;
        }
        let mut key = identifier_safe(&field.name);
        while private_ids.iter().any(|id| *id == key) {
            key.insert(0, '_');
        }
        field.key = key.as_str().into();
        private_ids.push(key.into());
    }
    Ok(fields)
}

struct Analysis<'r> {
    res: &'r Resolution,
    fields: ClassFields,
    members: FxHashMap<String, Vec<Member>>,
}

impl Analysis<'_> {
    /// Upstream's `handle`: records the field `name` when `value` creates state.
    fn handle(
        &mut self,
        at: oxc_span::Span,
        name: Option<Cow<'_, str>>,
        value: Option<&Expression<'_>>,
        constructor: bool,
    ) -> Result<(), Diagnostic> {
        let Some(name) = name else {
            return Ok(());
        };
        // Upstream erases the types before it reads a rune.
        let rune = value.and_then(|v| self.res.rune(v.get_inner_expression()));
        let Some((rune @ ("$state" | "$state.raw" | "$derived" | "$derived.by"), _)) = rune else {
            return Ok(());
        };
        let span = super::Span::new(at.start, at.end);
        if self.fields.by_name.contains_key(name.as_ref()) {
            return super::special::invalid(
                "state_field_duplicate",
                &format!("`{name}` has already been declared on this class"),
                span,
            );
        }
        if let Some(members) = self.members.get(name.as_ref())
            && members.as_slice() != [Member::Prop]
        {
            return duplicate_class_field(&name, span);
        }
        let key = name.strip_prefix('#').unwrap_or_default().into();
        let name: Box<str> = name.into();
        self.fields
            .by_name
            .insert(name.clone(), self.fields.fields.len());
        self.fields.fields.push(StateField {
            name,
            rune,
            key,
            at,
            constructor,
        });
        Ok(())
    }

    /// Upstream's duplicate checks of a method, getter or setter named `name`.
    fn method(
        &mut self,
        name: String,
        kind: MethodDefinitionKind,
        span: super::Span,
    ) -> Result<(), Diagnostic> {
        let Some(members) = self.members.get_mut(&name) else {
            self.members.insert(name, vec![Member::Method(kind)]);
            return Ok(());
        };
        if members.contains(&Member::Method(kind))
            || members.contains(&Member::Prop)
            || members.contains(&Member::AssignedProp)
        {
            return duplicate_class_field(&name, span);
        }
        let pairs = match kind {
            MethodDefinitionKind::Get => {
                members.as_slice() == [Member::Method(MethodDefinitionKind::Set)]
            }
            MethodDefinitionKind::Set => {
                members.as_slice() == [Member::Method(MethodDefinitionKind::Get)]
            }
            _ => true,
        };
        if !pairs {
            return duplicate_class_field(&name, span);
        }
        members.push(Member::Method(kind));
        Ok(())
    }
}

fn duplicate_class_field<T>(name: &str, span: super::Span) -> Result<T, Diagnostic> {
    super::special::invalid(
        "duplicate_class_field",
        &format!("`{name}` has already been declared"),
        span,
    )
}

/// Upstream `get_name` of a key: a name, `#name`, or a literal's value as a string.
pub(super) fn key_name<'k>(key: &'k PropertyKey<'_>) -> Option<Cow<'k, str>> {
    match key {
        PropertyKey::StaticIdentifier(id) => Some(id.name.as_str().into()),
        PropertyKey::PrivateIdentifier(id) => Some(format!("#{}", id.name).into()),
        key => key.as_expression().and_then(expression_name),
    }
}

/// Upstream `get_name` of a member's property, for `this.x`, `this.#x` and `this[<literal>]`.
pub(super) fn member_name<'k>(member: &'k MemberExpression<'_>) -> Option<Cow<'k, str>> {
    match member {
        MemberExpression::StaticMemberExpression(m) => Some(m.property.name.as_str().into()),
        MemberExpression::PrivateFieldExpression(m) => Some(format!("#{}", m.field.name).into()),
        MemberExpression::ComputedMemberExpression(m) => match &m.expression {
            Expression::Identifier(_) => None,
            e => expression_name(e),
        },
    }
}

/// `String(value)` of a literal, or an identifier's name.
fn expression_name<'k>(e: &'k Expression<'_>) -> Option<Cow<'k, str>> {
    match e {
        Expression::Identifier(id) => Some(id.name.as_str().into()),
        Expression::StringLiteral(s) => Some(super::javascript::string_value(s.value)),
        // Rust prints an integer below 1e21 as JavaScript does.
        Expression::NumericLiteral(n) if n.value.abs() < 1e21 => Some(n.value.to_string().into()),
        Expression::BigIntLiteral(n) => Some(n.value.as_str().into()),
        Expression::BooleanLiteral(l) => Some(if l.value { "true" } else { "false" }.into()),
        Expression::NullLiteral(_) => Some("null".into()),
        _ => None,
    }
}

/// Upstream `regex_invalid_identifier_chars`: each UTF-16 unit that cannot stand there is `_`.
fn identifier_safe(name: &str) -> String {
    let mut out = String::with_capacity(name.len());
    for (i, c) in name.chars().enumerate() {
        let valid =
            c == '_' || c == '$' || c.is_ascii_alphabetic() || (i > 0 && c.is_ascii_digit());
        if valid {
            out.push(c);
        } else {
            out.extend(std::iter::repeat_n('_', c.len_utf16()));
        }
    }
    out
}
