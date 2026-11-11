use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_typescript_semantic::number::number;

#[derive(Clone, Debug)]
pub enum Value {
    String(String),
    Number(f64),
    BigInt(Box<num_bigint::BigInt>),
    Boolean(bool),
    Null,
    Undefined,
    /// Some string.
    AnyString,
    /// Some number.
    AnyNumber,
    AnyFunction,
    /// The object of a regular expression literal, one per literal, and its `String(value)`.
    RegExp {
        literal: oxc_span::Span,
        text: Box<str>,
    },
    Unknown,
}

impl PartialEq for Value {
    /// `Set` membership in JS: `SameValueZero`.
    fn eq(&self, other: &Self) -> bool {
        use Value::{
            AnyFunction, AnyNumber, AnyString, BigInt, Boolean, Null, Number, RegExp, String,
            Undefined, Unknown,
        };
        match (self, other) {
            (String(a), String(b)) => a == b,
            (BigInt(a), BigInt(b)) => a == b,
            (Number(a), Number(b)) => a == b || (a.is_nan() && b.is_nan()),
            (Boolean(a), Boolean(b)) => a == b,
            (Null, Null)
            | (Undefined, Undefined)
            | (AnyString, AnyString)
            | (AnyNumber, AnyNumber)
            | (AnyFunction, AnyFunction)
            | (Unknown, Unknown) => true,
            (RegExp { literal: a, .. }, RegExp { literal: b, .. }) => a == b,
            _ => false,
        }
    }
}

impl Value {
    pub(super) const fn is_string(&self) -> bool {
        matches!(self, Self::AnyString | Self::String(_))
    }

    pub(super) const fn is_number(&self) -> bool {
        matches!(self, Self::AnyNumber | Self::Number(_))
    }

    pub(super) const fn is_symbol(&self) -> bool {
        matches!(
            self,
            Self::AnyString | Self::AnyNumber | Self::AnyFunction | Self::Unknown
        )
    }

    /// `String(value)` for a known value.
    #[must_use]
    pub fn to_javascript_string(&self) -> String {
        match self {
            Self::String(s) => s.clone(),
            Self::Number(n) => number(*n),
            Self::BigInt(n) => n.to_string(),
            Self::Boolean(b) => b.to_string(),
            Self::Null => "null".into(),
            Self::Undefined => "undefined".into(),
            Self::RegExp { text, .. } => text.to_string(),
            _ => unreachable!("only known values are rendered"),
        }
    }

    pub(super) fn to_number(&self) -> f64 {
        match self {
            Self::Number(n) => *n,
            Self::BigInt(n) => string_to_number(&n.to_string()),
            Self::Boolean(b) => f64::from(u8::from(*b)),
            Self::Null => 0.0,
            Self::Undefined => f64::NAN,
            Self::String(s) => string_to_number(s),
            Self::RegExp { text, .. } => string_to_number(text),
            _ => unreachable!("only known values are converted"),
        }
    }

    /// `ToPrimitive(value)`: an object is its string.
    pub(super) fn primitive(&self) -> std::borrow::Cow<'_, Self> {
        match self {
            Self::RegExp { text, .. } => std::borrow::Cow::Owned(Self::String(text.to_string())),
            _ => std::borrow::Cow::Borrowed(self),
        }
    }

    pub(super) fn truthy(&self) -> bool {
        match self {
            Self::String(s) => !s.is_empty(),
            Self::Number(n) => *n != 0.0 && !n.is_nan(),
            Self::BigInt(n) => n.sign() != num_bigint::Sign::NoSign,
            Self::Boolean(b) => *b,
            Self::Null | Self::Undefined => false,
            Self::RegExp { .. } => true,
            _ => unreachable!("only known values are tested"),
        }
    }
}

#[expect(
    clippy::cast_precision_loss,
    reason = "a JavaScript number is an f64 and rounds the same way"
)]
fn string_to_number(s: &str) -> f64 {
    let t = s.trim_matches(is_ecmascript_whitespace);
    if t.is_empty() {
        return 0.0;
    }
    let radix = |p: &str, r| u64::from_str_radix(p, r).map_or(f64::NAN, |v| v as f64);
    match t.get(..2) {
        Some("0x" | "0X") => radix(&t[2..], 16),
        Some("0o" | "0O") => radix(&t[2..], 8),
        Some("0b" | "0B") => radix(&t[2..], 2),
        _ => match t {
            "Infinity" | "+Infinity" => f64::INFINITY,
            "-Infinity" => f64::NEG_INFINITY,
            _ if t.contains(|c: char| c.is_ascii_alphabetic() && c != 'e' && c != 'E') => f64::NAN,
            _ => t.parse().unwrap_or(f64::NAN),
        },
    }
}
