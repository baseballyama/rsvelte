//! Each document's findings, ordered and written as svelte-check and vue-tsc report them.

use rsvelte_kernel::computation::task::TaskOutput;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::{LineIndex, Span};

use super::{Prepared, TypeScriptDiagnostic};

/// A finding located in its document, with what orders it.
struct Finding {
    semantic: bool,
    generated: u32,
    span: Span,
    code: u32,
    message: String,
}

/// Writes each document's findings, ordered as svelte-check and vue-tsc list them: syntax errors
/// first, then by position in the generated text, where the upstream projection may have moved
/// code.
pub(super) fn write_findings(
    docs: &[Prepared],
    outs: Vec<&mut TaskOutput>,
    found: Vec<TypeScriptDiagnostic>,
) {
    let mut per_doc: Vec<Vec<Finding>> = (0..docs.len()).map(|_| Vec::new()).collect();
    let mut unmapped: Vec<Vec<String>> = vec![Vec::new(); docs.len()];
    for f in found {
        let d = &docs[f.file];
        let Some(span) = f.span else {
            unmapped[f.file].push(format!("TS{}: {}", f.code, f.message));
            continue;
        };
        let bom = byte_order_mark(&d.source_text);
        let content_mapped = d.env.mapped_extension.is_some();
        let generated = if content_mapped {
            generated_offset(&d.projection, span.start_offset + bom)
        } else {
            span.start_offset
        };
        let mapped = if content_mapped {
            Some(span)
        } else {
            (d.map_back)(&d.projection, span).and_then(|span| {
                Some(Span::new(
                    span.start_offset.checked_sub(bom)?,
                    span.end_offset.checked_sub(bom)?,
                ))
            })
        };
        if let Some(span) = mapped {
            per_doc[f.file].push(Finding {
                // TypeScript 7 parses some grammar errors that TypeScript 6 checks, such as
                // TS2880; svelte-check lists those with the semantic findings.
                semantic: !f.syntactic || f.code >= 2000,
                generated,
                span,
                code: f.code,
                message: f.message,
            });
        }
    }
    for (d, keyed) in docs.iter().zip(&mut per_doc) {
        let bom = byte_order_mark(&d.source_text);
        keyed.extend(d.placement.iter().filter_map(|&(span, code, message)| {
            Some(Finding {
                semantic: true,
                generated: generated_offset(&d.projection, span.start_offset),
                span: Span::new(
                    span.start_offset.checked_sub(bom)?,
                    span.end_offset.checked_sub(bom)?,
                ),
                code,
                message: message.to_owned(),
            })
        }));
    }
    // svelte-check and vue-tsc count positions in the text TypeScript reads: without the mark.
    for (((d, out), mut keyed), unmapped) in docs.iter().zip(outs).zip(per_doc).zip(unmapped) {
        keyed.sort_by_key(|f| (f.semantic, f.generated, f.span.start_offset));
        let found: Vec<_> = keyed
            .into_iter()
            .map(|f| (f.span, i64::from(f.code), f.message))
            .collect();
        // A finding in synthesized code is a projection defect; the document's result is refused.
        for message in unmapped {
            out.diagnostics.push(Diagnostic::error(
                "check_unmapped",
                format!("the projection made a finding with no source range: {message}"),
                Span::new(0, 0),
            ));
        }
        let text = &d.source_text[byte_order_mark(&d.source_text) as usize..];
        out.file("json", render_findings(&LineIndex::new(text), &found));
    }
}

/// The length of a leading byte order mark. TypeScript removes it when it reads a file, so the
/// content mapper and the report count positions from after it.
pub(super) fn byte_order_mark(source: &str) -> u32 {
    if source.starts_with('\u{feff}') {
        '\u{feff}'.len_utf8() as u32
    } else {
        0
    }
}

/// The first generated offset copied from the original `offset`, or the end of the copy before
/// it.
fn generated_offset(projection: &Emitter, offset: u32) -> u32 {
    let copies = projection
        .mappings
        .iter()
        .filter(|m| m.source_text <= offset && offset <= m.source_text + m.len)
        .map(|m| m.generated + (offset - m.source_text));
    let atoms = projection
        .atoms
        .iter()
        .filter(|a| a.original.start_offset <= offset && offset <= a.original.end_offset)
        .map(|a| a.generated.start_offset);
    copies.chain(atoms).min().unwrap_or_else(|| {
        projection
            .mappings
            .iter()
            .filter(|m| m.source_text + m.len <= offset)
            .max_by_key(|m| m.source_text + m.len)
            .map_or(0, |m| m.generated + m.len)
    })
}

/// Findings as svelte-check and vue-tsc report them: `code`, the flattened `message`, and 0-based
/// lines with UTF-16 characters, in the order given.
pub(crate) fn render_findings(lines: &LineIndex, found: &[(Span, i64, String)]) -> String {
    let mut w = StructuredDataWriter::new(true);
    w.begin_array();
    for (span, code, message) in found {
        w.begin_object()
            .key("code")
            .write_number(*code)
            .key("message")
            .write_string(message);
        for (key, at) in [("start", span.start_offset), ("end", span.end_offset)] {
            let lc = lines.line_column(at);
            w.key(key)
                .begin_object()
                .key("line")
                .write_number(lc.line - 1)
                .key("character")
                .write_number(lc.column)
                .end_object();
        }
        w.end_object();
    }
    w.end_array();
    w.finish()
}
