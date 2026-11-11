//! An element's attributes and directives.

use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{CompilerNodeIdentifier, Part};

/// An attribute name as the compiler reads it: as written, or as a frontend spells it in Svelte
/// (Vue's `@click` is Svelte's `onclick`).
#[derive(Debug, Clone)]
pub enum Name {
    Source(Span),
    Spelled { text: Box<str>, span: Span },
}

impl Name {
    #[must_use]
    pub fn text<'a>(&'a self, source_text: &'a str) -> &'a str {
        match self {
            Self::Source(span) => span.text(source_text),
            Self::Spelled { text, .. } => text,
        }
    }

    /// Where it was written.
    #[must_use]
    pub const fn span(&self) -> Span {
        match *self {
            Self::Source(span) | Self::Spelled { span, .. } => span,
        }
    }
}

#[derive(Debug)]
pub struct Attribute {
    pub name: Name,
    pub value: AttributeValue,
    pub span: Span,
    pub owner: CompilerNodeIdentifier,
    /// The frontend's identifier of the attribute; for Svelte, an index into the surface attribute
    /// list.
    pub origin: u32,
}

#[derive(Debug)]
pub enum AttributeValue {
    /// `<input disabled>`
    Boolean,
    /// Text only, character references decoded; `a=""` is `Static("")`.
    Static(Box<str>),
    /// `a={e}`, or `a="{e}"` with `quoted`.
    Expression {
        expression: ExpressionIdentifier,
        quoted: bool,
    },
    /// `{a}`
    Shorthand(ExpressionIdentifier),
    /// Text and expressions, or several expressions: `class="a {b}"`. Empty for `a=` followed by
    /// nothing, which is not the empty text `a=""`: the compiler sets it at runtime.
    Interpolated(Box<[Part]>),
    /// `bind:name={e}`: the attribute's name is the bound property.
    Bind(ExpressionIdentifier),
    /// `{@attach e}`: the attribute's name is empty.
    Attach(ExpressionIdentifier),
    /// `class:name={e}`: the attribute's name is the class.
    Class(ExpressionIdentifier),
    /// `{...e}`: the attribute's name is empty.
    Spread(ExpressionIdentifier),
    /// `on:name={handler}`: the attribute's name is the event; without a handler the event is
    /// forwarded.
    On {
        handler: Option<ExpressionIdentifier>,
        modifiers: Modifiers,
    },
    /// `use:action={argument}`: `action` is an identifier or a member chain.
    Use {
        action: ExpressionIdentifier,
        argument: Option<ExpressionIdentifier>,
    },
    /// `transition:`, `in:` or `out:`.
    Transition {
        function: ExpressionIdentifier,
        argument: Option<ExpressionIdentifier>,
        intro: bool,
        outro: bool,
        modifiers: Modifiers,
    },
    /// `animate:name={parameters}`
    Animate {
        function: ExpressionIdentifier,
        argument: Option<ExpressionIdentifier>,
    },
    /// `style:property={value}`: the attribute's name is the property. Boxed: the value has the
    /// shapes of an attribute's, and directives are rare.
    Style {
        value: Box<StyleValue>,
        modifiers: Modifiers,
    },
    /// `let:name={pattern}`
    Let(Option<ExpressionIdentifier>),
}

/// The value of a `style:` directive.
#[derive(Debug)]
pub enum StyleValue {
    /// `style:color`, which reads `color`.
    Shorthand(ExpressionIdentifier),
    /// `style:--name`: nothing to read.
    Empty,
    Static(Box<str>),
    Expression {
        expression: ExpressionIdentifier,
        quoted: bool,
    },
    Interpolated(Box<[Part]>),
}

/// A directive's `|modifier`s, one bit each.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct Modifiers(u16);

impl Modifiers {
    pub const CAPTURE: Self = Self(1 << 3);
    pub const GLOBAL: Self = Self(1 << 9);
    pub const IMPORTANT: Self = Self(1 << 11);
    pub(crate) const LOCAL: Self = Self(1 << 10);
    pub const NONPASSIVE: Self = Self(1 << 6);
    pub const ONCE: Self = Self(1 << 4);
    pub const PASSIVE: Self = Self(1 << 5);
    pub const PREVENT_DEFAULT: Self = Self(1);
    pub const SELF: Self = Self(1 << 7);
    pub const STOP_IMMEDIATE_PROPAGATION: Self = Self(1 << 2);
    pub const STOP_PROPAGATION: Self = Self(1 << 1);
    pub const TRUSTED: Self = Self(1 << 8);

    /// The modifier a name stands for, if any.
    #[must_use]
    pub(crate) fn parse(name: &str) -> Option<Self> {
        Some(match name {
            "preventDefault" => Self::PREVENT_DEFAULT,
            "stopPropagation" => Self::STOP_PROPAGATION,
            "stopImmediatePropagation" => Self::STOP_IMMEDIATE_PROPAGATION,
            "capture" => Self::CAPTURE,
            "once" => Self::ONCE,
            "passive" => Self::PASSIVE,
            "nonpassive" => Self::NONPASSIVE,
            "self" => Self::SELF,
            "trusted" => Self::TRUSTED,
            "global" => Self::GLOBAL,
            "local" => Self::LOCAL,
            "important" => Self::IMPORTANT,
            _ => return None,
        })
    }

    #[must_use]
    pub const fn contains(self, other: Self) -> bool {
        self.0 & other.0 == other.0
    }

    #[must_use]
    pub(crate) const fn with(self, other: Self) -> Self {
        Self(self.0 | other.0)
    }
}
