//! The judgement `svelte/button-has-type` and `vue/html-button-has-type` share.
//!
//! Which values a `<button>`'s `type` may take, and the four messages. Upstream the two are copies
//! of one rule; here they are one function.
//!
//! What stays each plugin's is what the two trees make different: which attribute counts as the
//! `type` (Vue checks a static `type` before a `:type`, Svelte takes the first `type` of any value,
//! and a shorthand `{type}` or a spread satisfies it), and where a finding is reported (Vue on the
//! value, Svelte on the attribute).

/// The rule's options; each is `true` unless configured otherwise.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Allowed {
    pub button: bool,
    pub submit: bool,
    pub reset: bool,
}

impl Default for Allowed {
    fn default() -> Self {
        Self {
            button: true,
            submit: true,
            reset: true,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Problem<'a> {
    /// No `type` at all.
    Missing,
    /// A `type` with no value, an empty one, or a binding with no expression.
    Empty,
    Invalid(&'a str),
    Forbidden(&'a str),
}

impl Problem<'_> {
    #[must_use]
    pub fn message(self) -> String {
        match self {
            Self::Missing => "Missing an explicit type attribute for button.".into(),
            Self::Empty => "A value must be set for button type attribute.".into(),
            Self::Invalid(v) => format!("{v} is an invalid value for button type attribute."),
            Self::Forbidden(v) => format!("{v} is a forbidden value for button type attribute."),
        }
    }
}

/// The verdict on a `type` whose value is known (decoded) text.
#[must_use]
pub fn check_static(value: &str, allowed: Allowed) -> Option<Problem<'_>> {
    let ok = match value {
        "" => return Some(Problem::Empty),
        "button" => allowed.button,
        "submit" => allowed.submit,
        "reset" => allowed.reset,
        _ => return Some(Problem::Invalid(value)),
    };
    (!ok).then_some(Problem::Forbidden(value))
}

#[cfg(test)]
mod tests {
    use super::{Allowed, Problem, check_static};

    #[test]
    fn a_known_type_passes_unless_forbidden() {
        let all = Allowed::default();
        assert_eq!(check_static("submit", all), None);
        assert_eq!(check_static("", all), Some(Problem::Empty));
        assert_eq!(
            check_static("Submit", all),
            Some(Problem::Invalid("Submit"))
        );
        let no_reset = Allowed {
            reset: false,
            ..all
        };
        assert_eq!(
            check_static("reset", no_reset),
            Some(Problem::Forbidden("reset"))
        );
    }
}
