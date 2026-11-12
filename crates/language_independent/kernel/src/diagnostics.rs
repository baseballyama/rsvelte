//! Diagnostics shared by every task. A diagnostic is positioned by a [`Span`] in its document;
//! conversion to line/column happens once, when a task renders its output.

use std::borrow::Cow;

use crate::source::positions::{SourceLocation, Span};

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Severity {
    Error,
    Warning,
}

#[derive(Clone, Debug)]
pub struct Diagnostic {
    pub severity: Severity,
    /// Stable machine-readable code, independent of the task identifier.
    pub code: Cow<'static, str>,
    pub message: String,
    pub span: Span,
    /// `false` for a point report: `span` is empty and renderers print no end.
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

    /// The same diagnostic at `span.start_offset` alone, with no end.
    #[must_use]
    pub const fn without_end(mut self) -> Self {
        self.span = Span::new(self.span.start_offset, self.span.start_offset);
        self.has_end = false;
        self
    }
}

/// A replacement of `span` in a document with `text`.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Replacement {
    pub span: Span,
    pub text: String,
}

/// A diagnostic, with the replacement that fixes it when its task offers one.
#[derive(Clone, Debug)]
pub struct Finding {
    pub diagnostic: Diagnostic,
    pub fix: Option<Replacement>,
}

/// One pass of fixing, as `ESLint` applies fixes: replacements in range order, and one that starts
/// at or before the end of the last applied one waits for the next pass.
#[must_use]
pub fn apply_fixes<'a>(source: &str, fixes: impl IntoIterator<Item = &'a Replacement>) -> String {
    let mut fixes: Vec<&Replacement> = fixes.into_iter().collect();
    fixes.sort_by_key(|r| (r.span.start_offset, r.span.end_offset));
    let mut out = String::with_capacity(source.len());
    let mut copied = 0usize;
    let mut last_end: Option<u32> = None;
    for fix in fixes {
        if last_end.is_some_and(|end| end >= fix.span.start_offset) {
            continue;
        }
        out.push_str(&source[copied..fix.span.start_offset as usize]);
        out.push_str(&fix.text);
        copied = fix.span.end_offset as usize;
        last_end = Some(fix.span.end_offset);
    }
    out.push_str(&source[copied..]);
    out
}

/// A construct a port does not cover yet. Tasks report it instead of approximating the output.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Unsupported {
    pub what: &'static str,
    /// The construct; synthetic when the refusal is about the whole document.
    pub source_location: SourceLocation,
}

impl Unsupported {
    pub fn at(what: &'static str, source_location: impl Into<SourceLocation>) -> Self {
        Self {
            what,
            source_location: source_location.into(),
        }
    }

    /// A refusal no single construct explains (a layout decision over the whole document).
    #[must_use]
    pub const fn nowhere(what: &'static str) -> Self {
        Self {
            what,
            source_location: SourceLocation::SYNTHETIC,
        }
    }

    /// Where a diagnostic for it points: the construct, or the document's start.
    #[must_use]
    pub fn span(&self) -> Span {
        self.source_location.span().unwrap_or_default()
    }
}

#[cfg(test)]
mod tests;
