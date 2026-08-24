//! The TypeScript **content mapper** protocol for `.svelte`.
//!
//! A content mapper is an external process TypeScript spawns during program
//! construction (`microsoft/typescript-go#4712`): TypeScript hands it a file it
//! cannot parse, the mapper hands back TypeScript text plus a map between the
//! two, and TypeScript reports its diagnostics at the original coordinates. It
//! is the mechanism that lets `tsc` and the TS language server read `.svelte`
//! directly, instead of a tool materialising `.tsx` shadows beside every
//! component.
//!
//! This module is the wire types plus the pure transform; [`crate::server`]
//! drives them over stdio.
//!
//! Protocol version 1. Positions are UTF-8 byte offsets — the encoding is
//! negotiated in `initialize`, and rsvelte's own offsets are bytes, so any
//! other choice would buy a conversion per span.

use serde::{Deserialize, Serialize};

pub mod server;

/// The only protocol version this mapper implements.
pub const PROTOCOL_VERSION: u32 = 1;

/// Prefix for this mapper's own diagnostics. Must not collide with `ts`.
pub const DIAGNOSTIC_SOURCE: &str = "svelte";

const ENCODING_UTF8: &str = "utf-8";

/// svelte2tsx brackets scaffolding whose diagnostics are artefacts of the
/// projection rather than user errors. The overlay pipeline drops those
/// diagnostics after the fact; a content mapper says so up front instead.
const IGNORE_START: &str = "/*\u{03A9}ignore_start\u{03A9}*/";
const IGNORE_END: &str = "/*\u{03A9}ignore_end\u{03A9}*/";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InitializeParams {
    pub protocol_version: u32,
    pub position_encodings: Vec<String>,
    #[serde(default)]
    pub locale: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InitializeResult {
    pub protocol_version: u32,
    pub position_encoding: String,
    pub diagnostic_source: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenProjectParams {
    pub config_file_name: String,
    pub project_handle: String,
    #[serde(default)]
    pub options: Option<serde_json::Value>,
    #[serde(default)]
    pub compiler_options: serde_json::Value,
}

/// Empty on purpose: `configIdentity` and `watchedFiles` are only allowed when
/// the package declares `dynamicConfig`, which this mapper does not yet do.
#[derive(Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenProjectResult {}

/// Per-project settings read from the `contentMappers[].options` object.
#[derive(Debug, Clone, Default, Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct MapperOptions {
    /// Absolute `.d.ts` paths every projection should reference.
    ///
    /// A content mapper cannot add a file to the program, and in the language
    /// server the user's tsconfig is not ours to edit — so the ambient
    /// declarations svelte2tsx output depends on (`__sveltets_2_*`, the JSX
    /// namespace) reach the program as a reference from each virtual file.
    pub global_types: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TransformParams {
    pub file_name: String,
    pub content: String,
    pub project_handle: String,
}

/// `[virtualStart, virtualLength, originalStart, originalLength, kind]`.
/// Only `kind` 0 (verbatim) is emitted: svelte2tsx's forward map records
/// equal-length copies, which is exactly what verbatim means.
pub type SpanMapping = [u32; 5];

const SPAN_KIND_VERBATIM: u32 = 0;
const DIRECTIVE_POLICY_IGNORE: u32 = 0;

/// `[originalStart, originalLength, virtualStart, virtualEnd, policy]`.
pub type MappedDiagnosticDirective = [u32; 5];

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticDirectives {
    /// Required by the protocol even with no `Expect` directive to report on.
    pub unused_expect_directive_diagnostics: Vec<serde_json::Value>,
    pub directives: Vec<MappedDiagnosticDirective>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MapperDiagnostic {
    pub message_text: String,
    pub start: u32,
    pub length: u32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TransformResult {
    pub text: String,
    pub extension: &'static str,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub mappings: Vec<SpanMapping>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub diagnostic_directives: Option<DiagnosticDirectives>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub diagnostics: Vec<MapperDiagnostic>,
}

/// Choose the encoding to answer `initialize` with.
///
/// # Errors
///
/// Returns an error when TypeScript offers neither a version this mapper
/// implements nor an encoding it can produce.
pub fn initialize(params: &InitializeParams) -> Result<InitializeResult, String> {
    if params.protocol_version != PROTOCOL_VERSION {
        return Err(format!(
            "unsupported content mapper protocol version {} (this mapper implements {PROTOCOL_VERSION})",
            params.protocol_version
        ));
    }
    if !params.position_encodings.iter().any(|e| e == ENCODING_UTF8) {
        return Err(format!(
            "none of the offered position encodings {:?} is supported",
            params.position_encodings
        ));
    }
    Ok(InitializeResult {
        protocol_version: PROTOCOL_VERSION,
        position_encoding: ENCODING_UTF8.to_string(),
        diagnostic_source: DIAGNOSTIC_SOURCE.to_string(),
    })
}

/// Lower one `.svelte` file to TSX with a span map back to the original.
///
/// A projection failure is returned as a mapper diagnostic on the original
/// text rather than as a protocol error: TypeScript disables a mapper after
/// five protocol failures, so reporting an unparseable component that way
/// would take the whole project's remaining components down with it.
#[must_use]
pub fn transform(params: &TransformParams, options: &MapperOptions) -> TransformResult {
    use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

    let filename = std::path::Path::new(&params.file_name)
        .file_name()
        .map_or_else(
            || "Component.svelte".to_string(),
            |n| n.to_string_lossy().into_owned(),
        );
    let result = svelte2tsx(
        &params.content,
        Svelte2TsxOptions {
            filename,
            is_ts_file: true,
            ..Default::default()
        },
    );
    let result = match result {
        Ok(r) => r,
        Err(e) => {
            return TransformResult {
                text: String::new(),
                extension: ".tsx",
                mappings: Vec::new(),
                diagnostic_directives: None,
                diagnostics: vec![MapperDiagnostic {
                    message_text: format!("{e:?}"),
                    start: 0,
                    length: u32::try_from(params.content.len()).unwrap_or(u32::MAX),
                }],
            };
        }
    };

    let mut text = result.code;
    // svelte2tsx emits `/// <reference types="svelte" />`, which resolves only
    // when svelte is installed as a types package. Blanking it with spaces
    // keeps every generated offset — and therefore the span map — intact.
    blank_svelte_type_reference(&mut text);
    let prefix = global_type_references(&options.global_types);
    let shift = u32::try_from(prefix.len()).unwrap_or(0);

    let mappings = result
        .forward_map
        .iter()
        .filter(|(start, end, _)| end > start)
        .map(|&(original_start, original_end, generated_start)| {
            let len = original_end - original_start;
            [
                generated_start + shift,
                len,
                original_start,
                len,
                SPAN_KIND_VERBATIM,
            ]
        })
        .collect();

    let directives = ignore_directives(&text, shift);
    TransformResult {
        text: prefix + &text,
        extension: ".tsx",
        mappings,
        diagnostic_directives: (!directives.is_empty()).then(|| DiagnosticDirectives {
            unused_expect_directive_diagnostics: Vec::new(),
            directives,
        }),
        diagnostics: Vec::new(),
    }
}

/// Collect one `Ignore` directive per `Ωignore` region in the generated text.
///
/// The region has no counterpart in the original file, so it is anchored at
/// offset 0: the policy suppresses the diagnostics rather than relocating them.
fn ignore_directives(generated: &str, shift: u32) -> Vec<MappedDiagnosticDirective> {
    let mut out = Vec::new();
    let mut cursor = 0usize;
    while let Some(rel) = generated[cursor..].find(IGNORE_START) {
        let start = cursor + rel;
        let Some(rel_end) = generated[start..].find(IGNORE_END) else {
            break;
        };
        let end = start + rel_end + IGNORE_END.len();
        if let (Ok(vs), Ok(ve)) = (u32::try_from(start), u32::try_from(end)) {
            out.push([0, 0, vs + shift, ve + shift, DIRECTIVE_POLICY_IGNORE]);
        }
        cursor = end;
    }
    out
}

/// One `/// <reference path>` per ambient declaration file, as a prefix.
fn global_type_references(paths: &[String]) -> String {
    let mut out = String::new();
    for path in paths {
        out.push_str("/// <reference path=\"");
        out.push_str(path);
        out.push_str("\" />\n");
    }
    out
}

/// Blank svelte2tsx's `types="svelte"` triple-slash directive **in place**, so
/// the offsets after it are unchanged.
fn blank_svelte_type_reference(tsx: &mut String) {
    for directive in [
        "///<reference types=\"svelte\" />",
        "/// <reference types=\"svelte\" />",
    ] {
        while let Some(at) = tsx.find(directive) {
            tsx.replace_range(at..at + directive.len(), &" ".repeat(directive.len()));
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn params(content: &str) -> TransformParams {
        TransformParams {
            file_name: "/p/App.svelte".into(),
            content: content.into(),
            project_handle: "h".into(),
        }
    }

    #[test]
    fn verbatim_spans_round_trip_the_script_body() {
        let src = "<script lang=\"ts\">\n  let count = 0;\n</script>\n<b>{count}</b>\n";
        let out = transform(&params(src), &MapperOptions::default());
        assert!(!out.mappings.is_empty(), "expected verbatim spans");
        for [vs, vlen, os, olen, kind] in out.mappings.iter().copied() {
            assert_eq!(vlen, olen, "a verbatim span must not change length");
            assert_eq!(kind, SPAN_KIND_VERBATIM);
            let virt = &out.text[vs as usize..(vs + vlen) as usize];
            let orig = &src[os as usize..(os + olen) as usize];
            assert_eq!(virt, orig, "verbatim span text must be identical");
        }
    }

    #[test]
    fn spans_do_not_overlap_in_the_virtual_text() {
        let src = "<script lang=\"ts\">\n  let a = 1;\n  let b = a + 1;\n</script>\n<i>{b}</i>\n";
        let out = transform(&params(src), &MapperOptions::default());
        let mut spans: Vec<_> = out.mappings.iter().map(|m| (m[0], m[0] + m[1])).collect();
        spans.sort_unstable();
        for pair in spans.windows(2) {
            assert!(
                pair[0].1 <= pair[1].0,
                "overlapping virtual spans {pair:?} — the protocol forbids them"
            );
        }
    }

    #[test]
    fn an_unparseable_component_reports_a_diagnostic_instead_of_failing() {
        let out = transform(&params("{#if x}"), &MapperOptions::default());
        assert_eq!(out.diagnostics.len(), 1, "expected one mapper diagnostic");
        assert!(out.mappings.is_empty());
        assert!(out.text.is_empty());
    }

    /// A broken *script* is not a projection failure: svelte2tsx copies the
    /// body through, so TypeScript reports the syntax error itself and the
    /// span map puts it back on the original. Reporting it here instead would
    /// spend one of the five failures TypeScript allows before it disables the
    /// mapper for the whole project.
    #[test]
    fn a_broken_script_body_is_left_for_typescript_to_report() {
        let out = transform(
            &params("<script>\n  let a = (\n</script>"),
            &MapperOptions::default(),
        );
        assert!(out.diagnostics.is_empty());
        assert!(!out.text.is_empty());
    }

    #[test]
    fn ignore_regions_become_ignore_directives() {
        let generated = format!("a{IGNORE_START}b{IGNORE_END}c{IGNORE_START}d{IGNORE_END}");
        let directives = ignore_directives(&generated, 0);
        assert_eq!(directives.len(), 2);
        assert_eq!(directives[0][4], DIRECTIVE_POLICY_IGNORE);
        assert!(
            directives[0][3] <= directives[1][2],
            "directives must not overlap"
        );
    }

    #[test]
    fn a_global_type_reference_shifts_every_span_by_its_own_length() {
        let src = "<script lang=\"ts\">\n  let count = 0;\n</script>\n<b>{count}</b>\n";
        let options = MapperOptions {
            global_types: vec!["/abs/shims.d.ts".into()],
        };
        let out = transform(&params(src), &options);
        assert!(
            out.text
                .starts_with("/// <reference path=\"/abs/shims.d.ts\" />\n")
        );
        assert!(!out.mappings.is_empty());
        for [vs, vlen, os, olen, _] in out.mappings.iter().copied() {
            assert_eq!(
                &out.text[vs as usize..(vs + vlen) as usize],
                &src[os as usize..(os + olen) as usize],
                "the prefix must shift spans, not desynchronise them"
            );
        }
    }

    #[test]
    fn the_svelte_types_directive_is_blanked_without_moving_anything() {
        let src = "<script lang=\"ts\">\n  let a = 1;\n</script>\n<i>{a}</i>\n";
        let out = transform(&params(src), &MapperOptions::default());
        assert!(!out.text.contains("reference types=\"svelte\""));
        for [vs, vlen, os, olen, _] in out.mappings.iter().copied() {
            assert_eq!(
                &out.text[vs as usize..(vs + vlen) as usize],
                &src[os as usize..(os + olen) as usize]
            );
        }
    }

    #[test]
    fn initialize_rejects_a_version_it_does_not_implement() {
        let p = InitializeParams {
            protocol_version: 2,
            position_encodings: vec!["utf-8".into()],
            locale: None,
        };
        assert!(initialize(&p).is_err());
    }

    #[test]
    fn initialize_rejects_an_encoding_it_cannot_produce() {
        let p = InitializeParams {
            protocol_version: 1,
            position_encodings: vec!["utf-16".into()],
            locale: None,
        };
        assert!(initialize(&p).is_err());
    }
}
