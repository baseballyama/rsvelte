//! Diagnostics shared by every task. A diagnostic is positioned by a [`Span`] in its document;
//! conversion to line/column happens once, when a task renders its output.

use crate::source::Span;
use std::borrow::Cow;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Severity {
    Error,
    Warning,
}

#[derive(Clone, Debug)]
pub struct Diagnostic {
    pub severity: Severity,
    /// Stable machine-readable code (`state_invalid_placement`, `no-unused-vars`, …).
    pub code: Cow<'static, str>,
    pub message: String,
    pub span: Span,
}

impl Diagnostic {
    pub fn error(
        code: impl Into<Cow<'static, str>>,
        message: impl Into<String>,
        span: Span,
    ) -> Diagnostic {
        Diagnostic {
            severity: Severity::Error,
            code: code.into(),
            message: message.into(),
            span,
        }
    }

    pub fn warning(
        code: impl Into<Cow<'static, str>>,
        message: impl Into<String>,
        span: Span,
    ) -> Diagnostic {
        Diagnostic {
            severity: Severity::Warning,
            code: code.into(),
            message: message.into(),
            span,
        }
    }
}

/// A construct a port does not cover yet. Tasks report it instead of approximating the output.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Unsupported(pub &'static str);
