//! Diagnostics shared by every task. A diagnostic is positioned by a [`Span`] in its document;
//! conversion to line/column happens once, when a task renders its output.

use crate::source::{Loc, Span};
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
pub struct Unsupported {
    pub what: &'static str,
    /// The construct; synthetic when the refusal is about the whole document.
    pub loc: Loc,
}

impl Unsupported {
    pub fn at(what: &'static str, loc: impl Into<Loc>) -> Unsupported {
        Unsupported {
            what,
            loc: loc.into(),
        }
    }

    /// A refusal no single construct explains (a layout decision over the whole document).
    pub fn nowhere(what: &'static str) -> Unsupported {
        Unsupported {
            what,
            loc: Loc::SYNTHETIC,
        }
    }

    /// Where a diagnostic for it points: the construct, or the document's start.
    pub fn span(&self) -> Span {
        self.loc.span().unwrap_or_default()
    }
}
