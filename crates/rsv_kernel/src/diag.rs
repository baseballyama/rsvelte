//! Diagnostics shared by every task. A diagnostic is positioned by a [`Span`] in its document;
//! conversion to line/column happens once, when a task renders its output.

use std::borrow::Cow;

use crate::source::{Loc, Span};

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
    /// `false` when the tool being ported reports only a start (an `ESLint` report with a `loc` of
    /// one position): `span` is then empty and renderers print no end.
    pub has_end: bool,
}

impl Diagnostic {
    pub fn error(
        code: impl Into<Cow<'static, str>>,
        message: impl Into<String>,
        span: Span,
    ) -> Self {
        Self {
            severity: Severity::Error,
            code: code.into(),
            message: message.into(),
            span,
            has_end: true,
        }
    }

    pub fn warning(
        code: impl Into<Cow<'static, str>>,
        message: impl Into<String>,
        span: Span,
    ) -> Self {
        Self {
            severity: Severity::Warning,
            code: code.into(),
            message: message.into(),
            span,
            has_end: true,
        }
    }

    /// The same diagnostic at `span.lo` alone, with no end.
    #[must_use]
    pub const fn without_end(mut self) -> Self {
        self.span = Span::new(self.span.lo, self.span.lo);
        self.has_end = false;
        self
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
    pub fn at(what: &'static str, loc: impl Into<Loc>) -> Self {
        Self {
            what,
            loc: loc.into(),
        }
    }

    /// A refusal no single construct explains (a layout decision over the whole document).
    #[must_use]
    pub const fn nowhere(what: &'static str) -> Self {
        Self {
            what,
            loc: Loc::SYNTHETIC,
        }
    }

    /// Where a diagnostic for it points: the construct, or the document's start.
    #[must_use]
    pub fn span(&self) -> Span {
        self.loc.span().unwrap_or_default()
    }
}
