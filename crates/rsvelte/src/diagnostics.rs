use std::fmt;

use rsvelte_core::{
    CompileError as CoreCompileError,
    compiler::{
        AnalysisError as CoreAnalysisError, Position as CorePosition, Warning as CoreWarning,
    },
    error::ParseError as CoreParseError,
};

use crate::ByteRange;

/// Diagnostic severity.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum DiagnosticSeverity {
    /// A non-fatal compiler warning.
    Warning,
    /// A compilation failure.
    Error,
}

/// A compiler-neutral diagnostic anchored in UTF-8 source bytes.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Diagnostic {
    /// Severity.
    pub severity: DiagnosticSeverity,
    /// Stable Svelte diagnostic code when available.
    pub code: String,
    /// Human-readable message.
    pub message: String,
    /// Source filename when configured.
    pub filename: Option<String>,
    /// Half-open UTF-8 byte range in the original source.
    pub span: Option<ByteRange>,
}

/// A compilation failure containing only a neutral diagnostic.
#[non_exhaustive]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CompileFailure {
    /// Failure diagnostic.
    pub diagnostic: Diagnostic,
}

impl fmt::Display for CompileFailure {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str(&self.diagnostic.message)
    }
}

impl std::error::Error for CompileFailure {}

impl CompileFailure {
    pub(crate) fn from_core(
        error: &CoreCompileError,
        source: &str,
        filename: Option<String>,
    ) -> Self {
        let (code, span) = match error {
            CoreCompileError::Parse(parse) => {
                let code = match parse {
                    CoreParseError::SvelteError { code, .. } => code.clone(),
                    CoreParseError::UnexpectedEof { .. } => "unexpected_eof".to_string(),
                    CoreParseError::UnexpectedToken { .. } => "unexpected_token".to_string(),
                    CoreParseError::UnclosedElement { .. } => "element_unclosed".to_string(),
                    CoreParseError::UnclosedBlock { .. } => "block_unclosed".to_string(),
                    CoreParseError::InvalidAttribute { .. } => "attribute_invalid".to_string(),
                    CoreParseError::InvalidExpression { .. } => "js_parse_error".to_string(),
                    CoreParseError::Generic { .. } => "parse_error".to_string(),
                };
                let (start, end) = parse.span();
                (
                    code,
                    Some(ByteRange::from_clamped_usize(start, end, source.len())),
                )
            }
            CoreCompileError::Analysis(analysis) => {
                let code = match analysis {
                    CoreAnalysisError::ValidationWithCode { code, .. } => code.clone(),
                    CoreAnalysisError::Scope(_) => "scope_error".to_string(),
                    CoreAnalysisError::Validation(_) => "validation_error".to_string(),
                    CoreAnalysisError::Css(_) => "css_error".to_string(),
                };
                (code, None)
            }
            CoreCompileError::Transform(_) => ("transform_error".to_string(), None),
        };
        Self {
            diagnostic: Diagnostic {
                severity: DiagnosticSeverity::Error,
                code,
                message: error.to_string(),
                filename,
                span,
            },
        }
    }
}

impl Diagnostic {
    pub(crate) fn from_core_warning(source: &str, warning: CoreWarning) -> Self {
        Self {
            severity: DiagnosticSeverity::Warning,
            code: warning.code,
            message: warning.message,
            filename: warning.filename,
            span: warning_span(source, warning.start, warning.end),
        }
    }
}

fn warning_span(
    source: &str,
    start: Option<CorePosition>,
    end: Option<CorePosition>,
) -> Option<ByteRange> {
    let start = start?;
    let end = end.unwrap_or_else(|| start.clone());
    ByteRange::new(
        utf16_offset_to_byte(source, start.character),
        utf16_offset_to_byte(source, end.character),
    )
}

fn utf16_offset_to_byte(source: &str, wanted: usize) -> u32 {
    let mut utf16_offset = 0;
    for (byte_offset, character) in source.char_indices() {
        if utf16_offset >= wanted {
            return u32::try_from(byte_offset).unwrap_or(u32::MAX);
        }
        utf16_offset += character.len_utf16();
    }
    u32::try_from(source.len()).unwrap_or(u32::MAX)
}
