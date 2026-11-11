use oxc_ast::AstKind;
use oxc_ast::ast::{BindingPattern, Expression, StaticMemberExpression};
use oxc_ast_visit::{Visit, walk};
use oxc_semantic::ReferenceId;
use rsvelte_kernel::source::positions::Span;

/// `@vue/shared` `GLOBALS_ALLOWED`.
const GLOBALS_ALLOWED: &[&str] = &[
    "Infinity",
    "undefined",
    "NaN",
    "isFinite",
    "isNaN",
    "parseFloat",
    "parseInt",
    "decodeURI",
    "decodeURIComponent",
    "encodeURI",
    "encodeURIComponent",
    "Math",
    "Number",
    "Date",
    "Array",
    "Object",
    "Boolean",
    "String",
    "RegExp",
    "Map",
    "Set",
    "JSON",
    "Intl",
    "BigInt",
    "console",
    "Error",
    "Symbol",
];

#[must_use]
pub fn can_prefix(name: &str) -> bool {
    !is_global(name) && name != "require"
}

/// `@vue/shared` `camelize`: `-x` becomes `X` for a word character `x`.
#[must_use]
pub fn camelize(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '-'
            && let Some(&n) = chars.peek()
            && (n.is_ascii_alphanumeric() || n == '_')
        {
            out.push(n.to_ascii_uppercase());
            chars.next();
        } else {
            out.push(c);
        }
    }
    out
}

/// `toHandlerKey`: `on` and the name with its first character upper-cased.
pub fn to_handler_key(s: &str) -> String {
    let mut chars = s.chars();
    chars.next().map_or_else(String::new, |f| {
        format!("on{}{}", f.to_uppercase(), chars.as_str())
    })
}

/// compiler-core `isSimpleIdentifier`.
#[must_use]
pub fn is_simple_identifier(s: &str) -> bool {
    let mut b = s.bytes();
    b.next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == b'_' || c == b'$')
        && b.all(|c| c.is_ascii_alphanumeric() || c == b'_' || c == b'$')
}

/// What holds an identifier, as far as the template compiler asks.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Parent {
    /// The value of a shorthand property, `{ a }`, which keeps its key when it is rewritten.
    Shorthand,
    /// A call, a `new` or a member access: the name is read for more than its value.
    Accessed,
    Other,
}

/// An identifier `walkIdentifiers` visits with `includeAll`.
#[derive(Clone, Copy, Debug)]
pub struct Identifier<'a> {
    pub name: &'a str,
    pub span: Span,
    /// The reference it is; `None` for a name it declares or a member's property.
    pub reference: Option<ReferenceId>,
    pub parent: Parent,
}

/// Every identifier `walkIdentifiers` visits with `includeAll` in `e`, but static object keys
/// (`isStaticPropertyKey`), in document order.
pub fn collect_identifiers<'a>(e: &'a Expression<'a>, out: &mut Vec<Identifier<'a>>) {
    let mut walk = Walk {
        out,
        parents: Vec::new(),
    };
    walk.visit_expression(e);
}

/// [`collect_identifiers`] of a `v-for` alias: the names it declares and what its defaults read.
pub fn collect_pattern_identifiers<'a>(p: &'a BindingPattern<'a>, out: &mut Vec<Identifier<'a>>) {
    let mut walk = Walk {
        out,
        parents: Vec::new(),
    };
    walk.visit_binding_pattern(p);
}

struct Walk<'o, 'a> {
    out: &'o mut Vec<Identifier<'a>>,
    parents: Vec<Parent>,
}

impl Walk<'_, '_> {
    fn parent(&self) -> Parent {
        self.parents.last().copied().unwrap_or(Parent::Other)
    }
}

impl<'a> Visit<'a> for Walk<'_, 'a> {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        let parent = match kind {
            AstKind::ObjectProperty(p) if p.shorthand => Parent::Shorthand,
            AstKind::CallExpression(_)
            | AstKind::NewExpression(_)
            | AstKind::StaticMemberExpression(_)
            | AstKind::ComputedMemberExpression(_)
            | AstKind::PrivateFieldExpression(_) => Parent::Accessed,
            AstKind::IdentifierReference(i) => {
                let parent = self.parent();
                self.out.push(Identifier {
                    name: i.name.as_str(),
                    span: span(i.span),
                    reference: i.reference_id.get(),
                    parent,
                });
                Parent::Other
            }
            AstKind::BindingIdentifier(i) => {
                let parent = self.parent();
                self.out.push(Identifier {
                    name: i.name.as_str(),
                    span: span(i.span),
                    reference: None,
                    parent,
                });
                Parent::Other
            }
            _ => Parent::Other,
        };
        self.parents.push(parent);
    }

    fn leave_node(&mut self, _: AstKind<'a>) {
        self.parents.pop();
    }

    fn visit_static_member_expression(&mut self, it: &StaticMemberExpression<'a>) {
        walk::walk_static_member_expression(self, it);
        // Babel's member property is an `Identifier` too.
        self.out.push(Identifier {
            name: it.property.name.as_str(),
            span: span(it.property.span),
            reference: None,
            parent: Parent::Accessed,
        });
    }
}

const fn span(span: oxc_span::Span) -> Span {
    Span::new(span.start, span.end)
}

#[must_use]
pub fn is_global(name: &str) -> bool {
    GLOBALS_ALLOWED.contains(&name)
}
