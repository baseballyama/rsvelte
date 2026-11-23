//! Each document's findings, ordered and written as svelte-check and vue-tsc report them.

use std::borrow::Cow;
use std::path::Path;

use rsvelte_kernel::computation::task::TaskOutput;
use rsvelte_kernel::diagnostics::{self, Diagnostic};
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::{LineIndex, Span};

use super::{Prepared, Report};
use crate::CheckedDocument;

const NO_OVERLOAD_MATCHES_CALL: u32 = 2769;
const ARGUMENT_NOT_ASSIGNABLE: u32 = 2345;
const USED_BEFORE_ASSIGNED: u32 = 2454;
const EXPECTED_ARGUMENTS: u32 = 2554;
const NOT_ASSIGNABLE: u32 = 2322;
const MULTIPLE_DEFAULT_EXPORTS: u32 = 2528;
const REDECLARED_BLOCK_SCOPED: u32 = 2451;
const CANNOT_FIND_MODULE: u32 = 2307;
const NAMESPACE_HAS_NO_MEMBER: u32 = 2694;
const MUST_RETURN_A_VALUE: u32 = 2355;

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
pub(super) fn write_findings(docs: &[Prepared], outs: Vec<&mut TaskOutput>, report: Report) {
    let Report {
        diagnostics: found,
        root,
    } = report;
    let mut per_doc: Vec<Vec<Finding>> = (0..docs.len()).map(|_| Vec::new()).collect();
    let mut unmapped: Vec<Vec<String>> = vec![Vec::new(); docs.len()];
    for mut f in found {
        let (source_text, d) = (&docs[f.file].source_text, &*docs[f.file].document);
        let Some(span) = f.span else {
            // The projection's own default export repeats a script's, and its subscription `$x`
            // a `$x` the script declares. TypeScript reports both copies: the script's maps, and
            // svelte-check drops the other, which does not.
            let repeats = f.code == MULTIPLE_DEFAULT_EXPORTS
                || f.code == REDECLARED_BLOCK_SCOPED
                    && f.message
                        .starts_with("Cannot redeclare block-scoped variable '$");
            if !d.drops_unmapped && !repeats {
                unmapped[f.file].push(format!("TS{}: {}", f.code, f.message));
            }
            continue;
        };
        let inserted = d.inserted.iter().find(|(generated, _)| {
            (generated.start_offset..generated.end_offset).contains(&span.start_offset)
        });
        if inserted.is_some() && !kept_in_kit_insertion(f.code, &mut f.message) {
            continue;
        }
        let bom = byte_order_mark(source_text);
        let content_mapped = d.env.mapped_extension.is_some();
        if starts_ignored(d, span, bom) {
            continue;
        }
        let generated = if content_mapped {
            generated_offset(&d.projection, span.start_offset + bom)
        } else {
            span.start_offset
        };
        let mapped = if let Some(&(_, original)) = inserted {
            Some(original)
        } else if content_mapped {
            Some(span)
        } else {
            (d.map_back)(&d.projection, span).and_then(|span| {
                Some(Span::new(
                    span.start_offset.checked_sub(bom)?,
                    span.end_offset.checked_sub(bom)?,
                ))
            })
        };
        // svelte-check's `mapAndFilterDiagnostics`: the call that reads `$store` fails at the
        // store, a finding it hides and repeats at each read.
        if let Some(span) = mapped
            && (f.code == NO_OVERLOAD_MATCHES_CALL || f.code == ARGUMENT_NOT_ASSIGNABLE)
            && let Some((_, reads)) = d.store_reads.iter().find(|(store, _)| *store == span)
        {
            let store = span.text(&source_text[bom as usize..]);
            for &read in reads {
                per_doc[f.file].push(Finding {
                    semantic: true,
                    // svelte-check lists the copies where the failing call is, in read order.
                    generated,
                    span: read,
                    code: f.code,
                    message: format!(
                        "Cannot use '{store}' as a store. '{store}' needs to be an object with a \
                         subscribe method on it.\n\n{}",
                        f.message
                    ),
                });
            }
            continue;
        }
        // A declaration is never read before it is assigned: the read is svelte2tsx's, which
        // svelte-check hides.
        if let Some(span) = mapped
            && f.code == USED_BEFORE_ASSIGNED
            && d.store_reads.iter().any(|(store, _)| *store == span)
        {
            continue;
        }
        if let Some(span) = mapped
            && d.hidden.iter().any(|hidden| hidden.hides(f.code, span))
        {
            continue;
        }
        // svelte-check's `expectedTransitionThirdArgument`: Svelte passes a transition the third
        // argument that svelte2tsx's call leaves out.
        if f.code == EXPECTED_ARGUMENTS
            && (f.message.starts_with("Expected 3 arguments")
                || f.message.starts_with("Expected 3-"))
            && (d.projection.out.get(..generated as usize))
                .is_some_and(|before| before.ends_with("__sveltets_2_ensureTransition("))
        {
            continue;
        }
        let message = not_bindable(&d.projection.out, generated, f.code, f.message);
        if let Some(span) = mapped {
            per_doc[f.file].push(Finding {
                // TypeScript 7 parses some grammar errors that TypeScript 6 checks, such as
                // TS2880; svelte-check lists those with the semantic findings. JSX's parse
                // errors, such as TS17008, are syntax errors in both.
                semantic: !f.syntactic || (f.code >= 2000 && !(17000..18000).contains(&f.code)),
                generated,
                span,
                code: f.code,
                message: match d.env.notes.iter().find(|(code, _)| *code == f.code) {
                    Some((_, note)) => format!("{message}\n{note}"),
                    None => message,
                },
            });
        }
    }
    write_outputs(docs, outs, per_doc, unmapped, &root);
}

/// svelte-check's filter of a finding in the types `upsertKitFile` inserts: it keeps three codes,
/// two with a hint at what `SvelteKit` did not generate.
fn kept_in_kit_insertion(code: u32, message: &mut String) -> bool {
    match code {
        CANNOT_FIND_MODULE if message.contains("./$types") => message.push_str(
            " (this likely means that SvelteKit's type generation didn't run yet - try running it \
             by executing 'npm run dev' or 'npm run build')",
        ),
        NAMESPACE_HAS_NO_MEMBER if message.contains("/$types") => message.push_str(
            " (this likely means that SvelteKit's generated types are out of date - try rerunning \
             it by executing 'npm run dev' or 'npm run build')",
        ),
        CANNOT_FIND_MODULE | NAMESPACE_HAS_NO_MEMBER | MUST_RETURN_A_VALUE => {}
        _ => return false,
    }
    true
}

/// Writes each document's ordered findings: the report that matches upstream's, and the same
/// findings for a person to read.
fn write_outputs(
    docs: &[Prepared],
    outs: Vec<&mut TaskOutput>,
    per_doc: Vec<Vec<Finding>>,
    unmapped: Vec<Vec<String>>,
    root: &Path,
) {
    // svelte-check prints TypeScript's absolute paths; its recorded output, which the corpus and
    // the fixtures compare with this report, names a path in the project from its root.
    let root = format!("{}{}", root.display(), std::path::MAIN_SEPARATOR);
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
        let bom = byte_order_mark(&d.source_text);
        let text = &d.source_text[bom as usize..];
        let recorded: Vec<_> = (found.iter())
            .map(|(span, code, message)| (*span, *code, from_root(message, &root)))
            .collect();
        out.file("json", render_findings(&LineIndex::new(text), &recorded));
        // A finding's span is in the document, which keeps the mark.
        out.findings
            .extend(found.into_iter().map(|(span, code, message)| {
                let span = Span::new(span.start_offset + bom, span.end_offset + bom);
                finding(span, code, message)
            }));
    }
}

/// A finding for a person to read, beside the report that matches upstream's. `code` -1 is a
/// document the checker cannot take.
pub(super) fn finding(span: Span, code: i64, message: String) -> diagnostics::Finding {
    let code: Cow<'static, str> = if code < 0 {
        "check_rejected".into()
    } else {
        format!("TS{code}").into()
    };
    diagnostics::Finding {
        diagnostic: Diagnostic::error(code, message, span),
        fix: Vec::new(),
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

/// Whether the finding at `span` starts in an [`Emitter::ignored`] range, as svelte-check's
/// `isInGeneratedCode` tests its start. The checker maps a content-mapped finding back, and only
/// an ignored range maps from where it starts.
fn starts_ignored(d: &CheckedDocument, span: Span, bom: u32) -> bool {
    let content_mapped = d.env.mapped_extension.is_some();
    d.projection.ignored.iter().any(|&range| {
        if content_mapped {
            d.projection.maps_into(range, span.start_offset + bom)
        } else {
            (range.start_offset..range.end_offset).contains(&span.start_offset)
        }
    })
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
/// `message` with each path under `root` written from it.
fn from_root<'m>(message: &'m str, root: &str) -> Cow<'m, str> {
    if message.contains(root) {
        Cow::Owned(message.replace(root, ""))
    } else {
        Cow::Borrowed(message)
    }
}

pub(crate) fn render_findings<M: AsRef<str>>(
    lines: &LineIndex,
    found: &[(Span, i64, M)],
) -> String {
    let mut w = StructuredDataWriter::new(true);
    w.begin_array();
    for (span, code, message) in found {
        w.begin_object()
            .key("code")
            .write_number(*code)
            .key("message")
            .write_string(message.as_ref());
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

/// svelte-check's message for a `bind:` of a prop that the component does not declare bindable,
/// where `generated` is svelte2tsx's `$$bindings` check in `projection`.
fn not_bindable(projection: &str, generated: u32, code: u32, message: String) -> String {
    const LEAD: &str = "Cannot use 'bind:' with this property. It is declared as non-bindable \
                        inside the component.\nTo mark a property as bindable: ";
    if code != NOT_ASSIGNABLE
        || !(projection.get(generated as usize..))
            .is_some_and(|after| after.starts_with("__rsvelte_bindings("))
    {
        return message;
    }
    if message.contains("is not assignable to type '")
        && let Some(name) =
            (message.strip_prefix("Type '\"")).and_then(|rest| rest.split('"').next())
    {
        format!("{LEAD}'let {{ {name} = $bindable() }} = $props()'")
    } else {
        format!("{LEAD}'let {{ prop = $bindable() }} = $props()'\n\n{message}")
    }
}
