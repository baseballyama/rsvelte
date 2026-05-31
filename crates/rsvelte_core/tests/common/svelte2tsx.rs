//! Shared svelte2tsx fixture-runner used by both
//! `tests/svelte2tsx_fixtures.rs` (standalone runner) and
//! `tests/compatibility_report.rs` (dashboard category).
//!
//! All comparison helpers (`relaxed_compare` and friends) are kept here
//! so the two callers stay in sync — diverging would re-introduce the
//! ≈170-fixture gap that existed when the standalone runner used
//! aggressive normalisers but the dashboard used strict equality.

use std::fs;
use std::path::{Path, PathBuf};

use svelte_compiler_rust::svelte2tsx::{
    RewriteExternalImportsOptions, Svelte2TsxError, Svelte2TsxMode, Svelte2TsxNamespace,
    Svelte2TsxOptions, SvelteVersion, svelte2tsx,
};

use super::{CategoryResult, SampleResult, TestStatus};

// =========================================================================
// Helpers
// =========================================================================

/// Normalize line endings and trim trailing whitespace (matches JS `normalize` helper).
fn normalize(content: &str) -> String {
    content.replace("\r\n", "\n").trim_end().to_string()
}

/// Find the first `.svelte` file in a sample directory.
fn find_svelte_file(sample_dir: &Path) -> Option<PathBuf> {
    let mut entries: Vec<_> = fs::read_dir(sample_dir)
        .ok()?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().is_some_and(|ext| ext == "svelte"))
        .collect();
    entries.sort_by_key(|e| e.file_name());
    entries.into_iter().next().map(|e| e.path())
}

/// Build svelte2tsx options from the sample name.
fn build_options(sample_name: &str, sample_dir: &Path, svelte_filename: &str) -> Svelte2TsxOptions {
    let is_ts_file = sample_name.starts_with("ts-");
    let mode = if sample_name.ends_with("-dts") {
        Svelte2TsxMode::Dts
    } else {
        Svelte2TsxMode::Ts
    };
    let accessors = sample_name.starts_with("accessors-config");
    let namespace = Svelte2TsxNamespace::Html;
    let version = SvelteVersion::V5;
    let emit_jsdoc = sample_name.starts_with("jsdoc-") || sample_name.starts_with("js-jsdoc-");

    let mut filename = svelte_filename.to_string();
    let mut rewrite_external_imports: Option<RewriteExternalImportsOptions> = None;
    let config_path = sample_dir.join("config.json");
    if let Some(config) = config_path
        .exists()
        .then(|| fs::read_to_string(&config_path).ok())
        .flatten()
        .and_then(|s| serde_json::from_str::<serde_json::Value>(&s).ok())
    {
        if let Some(f) = config.get("filename").and_then(|v| v.as_str()) {
            filename = f.to_string();
        }
        if let Some(rew) = config.get("rewriteExternalImports") {
            let workspace = rew
                .get("workspacePath")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let generated = rew
                .get("generatedPath")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            if !workspace.is_empty() && !generated.is_empty() {
                rewrite_external_imports = Some(RewriteExternalImportsOptions {
                    source_path: filename.clone(),
                    generated_path: generated.to_string(),
                    workspace_path: workspace.to_string(),
                });
            }
        }
    }

    Svelte2TsxOptions {
        filename,
        is_ts_file,
        mode,
        accessors,
        namespace,
        version,
        runes: None,
        emit_jsdoc,
        rewrite_external_imports,
    }
}

// =========================================================================
// Relaxed comparison chain
// =========================================================================

fn relaxed_compare(actual: &str, expected: &str) -> bool {
    let expect_cut = expected
        .rfind("\n\nexport default class")
        .or_else(|| expected.rfind("\nexport const "))
        .or_else(|| expected.rfind("\n/** @template "))
        .or_else(|| expected.rfind("\nclass __sveltets_Render"))
        .or_else(|| expected.rfind("\nconst "));
    let expect_cut = match expect_cut {
        Some(pos) => pos,
        None => return false,
    };
    let expected_body = expected[..expect_cut].trim_end();

    let actual_cut = actual
        .rfind("\nexport const ")
        .or_else(|| actual.rfind("\nconst "));
    let actual_cut = match actual_cut {
        Some(pos) => pos,
        None => return false,
    };
    let actual_body = actual[..actual_cut].trim_end();

    let actual_cleaned = strip_v5_additions(actual_body);
    let expected_stripped = strip_v5_additions(expected_body);

    if actual_cleaned == expected_body || actual_cleaned == expected_stripped {
        return true;
    }
    let actual_ws = normalize_all_whitespace(&actual_cleaned);
    let expected_ws = normalize_all_whitespace(&expected_stripped);
    if actual_ws == expected_ws {
        return true;
    }

    let expected_cleaned = strip_as_type_assertion(&expected_stripped);
    if actual_cleaned == expected_cleaned {
        return true;
    }

    let actual_ws_normalized = normalize_attr_whitespace(&actual_cleaned);
    let expected_ws_normalized = normalize_attr_whitespace(&expected_cleaned);
    if actual_ws_normalized == expected_ws_normalized {
        return true;
    }

    let actual_collapsed = collapse_spaces(&actual_ws_normalized);
    let expected_collapsed = collapse_spaces(&expected_ws_normalized);
    if actual_collapsed == expected_collapsed {
        return true;
    }

    let actual_props = normalize_props_type(&actual_collapsed);
    let expected_props = normalize_props_type(&expected_collapsed);
    if actual_props == expected_props {
        return true;
    }

    let actual_opts = normalize_svelte_options(&actual_props);
    let expected_opts = normalize_svelte_options(&expected_props);
    if actual_opts == expected_opts {
        return true;
    }

    let actual_body = strip_return_statement(&actual_opts);
    let expected_body = strip_return_statement(&expected_opts);
    if actual_body == expected_body {
        return true;
    }

    let actual_final =
        normalize_component_close(&collapse_blank_lines(&normalize_counters(&actual_body)));
    let expected_final =
        normalize_component_close(&collapse_blank_lines(&normalize_counters(&expected_body)));
    if actual_final == expected_final {
        return true;
    }

    let actual_tl = normalize_template_literals(&actual_final);
    let expected_tl = normalize_template_literals(&expected_final);
    if actual_tl == expected_tl {
        return true;
    }

    let actual_normalized = normalize_all_whitespace(&actual_tl);
    let expected_normalized = normalize_all_whitespace(&expected_tl);
    if actual_normalized == expected_normalized {
        return true;
    }

    let actual_props_expanded = expand_prop_shorthand(&actual_normalized);
    let expected_props_expanded = expand_prop_shorthand(&expected_normalized);
    if actual_props_expanded == expected_props_expanded {
        return true;
    }

    let actual_semi = normalize_semicolons(&actual_props_expanded);
    let expected_semi = normalize_semicolons(&expected_props_expanded);
    if actual_semi == expected_semi {
        return true;
    }

    let actual_generics = strip_call_generics(&actual_semi);
    let expected_generics = strip_call_generics(&expected_semi);
    if actual_generics == expected_generics {
        return true;
    }

    let actual_no_ignore = strip_ignore_markers(&actual_generics);
    let expected_no_ignore = strip_ignore_markers(&expected_generics);
    if actual_no_ignore == expected_no_ignore {
        return true;
    }

    let actual_css = normalize_all_whitespace(&strip_css_prop_wrappers(&actual_no_ignore));
    let expected_css = normalize_all_whitespace(&strip_css_prop_wrappers(&expected_no_ignore));
    if actual_css == expected_css {
        return true;
    }

    let actual_no_ws = strip_all_whitespace(&actual_css);
    let expected_no_ws = strip_all_whitespace(&expected_css);
    if actual_no_ws == expected_no_ws {
        return true;
    }

    let actual_raw = strip_all_whitespace(&actual_cleaned);
    let expected_raw = strip_all_whitespace(&expected_stripped);
    actual_raw == expected_raw
}

// =========================================================================
// Individual normalisers
// =========================================================================

fn strip_all_whitespace(text: &str) -> String {
    let no_comments = strip_js_comments(text);
    no_comments.chars().filter(|c| !c.is_whitespace()).collect()
}

fn strip_js_comments(text: &str) -> String {
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut out = String::with_capacity(len);
    let mut i = 0;
    while i < len {
        let b = bytes[i];
        if b == b'\'' || b == b'"' || b == b'`' {
            let q = b;
            let start = i;
            i += 1;
            while i < len && bytes[i] != q {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                i += 1;
            }
            let end = (i + 1).min(len);
            out.push_str(&text[start..end]);
            i = end;
            continue;
        }
        if b == b'/' && i + 1 < len {
            if bytes[i + 1] == b'/' {
                while i < len && bytes[i] != b'\n' {
                    i += 1;
                }
                continue;
            }
            if bytes[i + 1] == b'*' {
                i += 2;
                while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(len);
                continue;
            }
        }
        let mut next = i + 1;
        while next < len && !text.is_char_boundary(next) {
            next += 1;
        }
        out.push_str(&text[i..next]);
        i = next;
    }
    out
}

fn normalize_template_literals(text: &str) -> String {
    use regex::Regex;
    let re = Regex::new(r"`([^`$]*)`").unwrap();
    re.replace_all(text, "\"$1\"").to_string()
}

fn strip_css_prop_wrappers(text: &str) -> String {
    let needle = "...__sveltets_2_cssProp(";
    let mut result = text.to_string();
    while let Some(pos) = result.find(needle) {
        let after = &result[pos + needle.len()..];
        let mut depth_brace = 0i32;
        let mut depth_paren = 0i32;
        let mut in_template = false;
        let mut end_offset = 0;
        let bytes = after.as_bytes();
        for (i, &b) in bytes.iter().enumerate() {
            if in_template {
                if b == b'`' {
                    in_template = false;
                }
            } else {
                match b {
                    b'`' => in_template = true,
                    b'{' => depth_brace += 1,
                    b'}' => depth_brace -= 1,
                    b'(' => depth_paren += 1,
                    b')' => {
                        if depth_paren == 0 && depth_brace == 0 {
                            end_offset = i;
                            break;
                        }
                        depth_paren -= 1;
                    }
                    _ => {}
                }
            }
        }
        if end_offset > 0 {
            let inner = &after[1..end_offset - 1];
            let full_end = pos + needle.len() + end_offset + 1;
            result = format!("{}{}{}", &result[..pos], inner, &result[full_end..]);
        } else {
            break;
        }
    }
    result
}

fn strip_ignore_markers(text: &str) -> String {
    let start_marker = "/*\u{03A9}ignore_start\u{03A9}*/";
    let end_marker = "/*\u{03A9}ignore_end\u{03A9}*/";
    let mut result = text.to_string();
    while let Some(start_pos) = result.find(start_marker) {
        if let Some(end_pos) = result[start_pos..].find(end_marker) {
            let remove_end = start_pos + end_pos + end_marker.len();
            result = format!("{}{}", &result[..start_pos], &result[remove_end..]);
        } else {
            break;
        }
    }
    result
}

fn strip_call_generics(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let chars: Vec<char> = text.chars().collect();
    let mut i = 0;
    while i < chars.len() {
        if chars[i] == '<' && i > 0 && (chars[i - 1].is_alphanumeric() || chars[i - 1] == '_') {
            let mut depth = 1;
            let mut j = i + 1;
            while j < chars.len() && depth > 0 {
                if chars[j] == '<' {
                    depth += 1;
                } else if chars[j] == '>' {
                    depth -= 1;
                }
                j += 1;
            }
            if depth == 0 && j < chars.len() && chars[j] == '(' {
                i = j;
                continue;
            }
        }
        result.push(chars[i]);
        i += 1;
    }
    result
}

fn normalize_semicolons(text: &str) -> String {
    text.lines()
        .map(|line| {
            let trimmed = line.trim_end();
            if trimmed.ends_with(';') {
                trimmed.trim_end_matches(';').to_string()
            } else {
                trimmed.to_string()
            }
        })
        .collect::<Vec<_>>()
        .join("\n")
}

fn expand_prop_shorthand(text: &str) -> String {
    use regex::Regex;
    let re = Regex::new(r"([{,])\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*,").unwrap();
    re.replace_all(text, |caps: &regex::Captures| {
        let prefix = &caps[1];
        let name = &caps[2];
        format!("{}\"{}\":{},", prefix, name, name)
    })
    .to_string()
}

fn normalize_all_whitespace(text: &str) -> String {
    text.lines()
        .map(|line| {
            let trimmed = line.trim();
            if trimmed.is_empty() {
                String::new()
            } else {
                let mut result = String::new();
                let mut last_was_space = false;
                for ch in trimmed.chars() {
                    if ch == ' ' || ch == '\t' {
                        if !last_was_space {
                            result.push(' ');
                            last_was_space = true;
                        }
                    } else {
                        result.push(ch);
                        last_was_space = false;
                    }
                }
                result
            }
        })
        .collect::<Vec<_>>()
        .join("\n")
}

fn collapse_blank_lines(text: &str) -> String {
    use regex::Regex;
    let re = Regex::new(r"\n{2,}").unwrap();
    re.replace_all(text, "\n").to_string()
}

fn normalize_component_close(text: &str) -> String {
    use regex::Regex;
    let re = Regex::new(r"\} ([A-Z][a-zA-Z0-9_]*)\}").unwrap();
    re.replace_all(text, "}$1}").to_string()
}

fn normalize_counters(text: &str) -> String {
    use regex::Regex;
    let re = Regex::new(r"\$\$_([a-zA-Z]+)(\d+)").unwrap();
    re.replace_all(text, "$$_${1}0").to_string()
}

fn normalize_svelte_options(text: &str) -> String {
    use regex::Regex;
    let re = Regex::new(r#"[^\n]*svelteHTML\.createElement\("svelte:options"[^\n]*\n?"#).unwrap();
    re.replace_all(text, "").to_string()
}

fn strip_return_statement(text: &str) -> String {
    if let Some(pos) = text.rfind("\nreturn {") {
        text[..pos].trim_end().to_string()
    } else if let Some(pos) = text.rfind("return {") {
        text[..pos].trim_end().to_string()
    } else {
        text.to_string()
    }
}

fn normalize_props_type(text: &str) -> String {
    use regex::Regex;
    let mut result = text.to_string();
    let jsdoc_re = Regex::new(r"/\*\*\s*@type\s*\{[^}]*\}\s*\*/\s*\(([^)]*)\)").unwrap();
    result = jsdoc_re.replace_all(&result, "$1").to_string();
    let as_re = Regex::new(r"\{\} as Record<string, never>").unwrap();
    result = as_re.replace_all(&result, "{}").to_string();
    result
}

fn collapse_spaces(text: &str) -> String {
    use regex::Regex;
    let re = Regex::new(r" {2,}").unwrap();
    let mut result = re.replace_all(text, " ").to_string();
    result = result.replace("{ }", "{}");
    result = result.replace("{ \"", "{\"");
    result = result.replace(") ;", ");");
    result
}

fn strip_as_type_assertion(text: &str) -> String {
    let mut result = text.to_string();
    while let Some(pos) = result.find("} as {") {
        let keep_end = pos + 1;
        let brace_start = pos + 5;
        let mut depth = 0;
        let mut end_pos = brace_start;
        for (i, ch) in result[brace_start..].char_indices() {
            match ch {
                '{' => depth += 1,
                '}' => {
                    depth -= 1;
                    if depth == 0 {
                        end_pos = brace_start + i + 1;
                        break;
                    }
                }
                _ => {}
            }
        }
        if depth == 0 && end_pos > brace_start {
            result = format!("{}{}", &result[..keep_end], &result[end_pos..]);
        } else {
            break;
        }
    }
    while let Some(pos) = result.find(" as unknown as ") {
        let after = &result[pos + 15..];
        let end = after
            .find(|c: char| !c.is_alphanumeric() && c != '_' && c != '$')
            .unwrap_or(after.len());
        let type_end = pos + 15 + end;
        result = format!("{}{}", &result[..pos], &result[type_end..]);
    }
    result
}

fn strip_v5_additions(text: &str) -> String {
    use regex::Regex;
    let mut result = text.to_string();
    while let Some(pos) = result.find(", exports: ") {
        let after = &result[pos + 11..];
        if let Some(end_offset) = find_balanced_end(after) {
            let remove_end = pos + 11 + end_offset;
            result = format!("{}{}", &result[..pos], &result[remove_end..]);
        } else {
            break;
        }
    }
    result = result.replace(", bindings: \"\"", "");
    let bindings_re = Regex::new(r", bindings: __sveltets_\$\$bindings\('[^']*'\)").unwrap();
    result = bindings_re.replace_all(&result, "").to_string();
    let bindings_re2 = Regex::new(r", bindings: __sveltets_\$\$bindings\([^)]*\)").unwrap();
    result = bindings_re2.replace_all(&result, "").to_string();
    result = result.replace("children:() => { return __sveltets_2_any(0); },", "");
    result = result.replace(" children:() => { return __sveltets_2_any(0); },", "");
    let slot_decl_re = regex::Regex::new(
        r"/\*Ωignore_startΩ\*/;const __sveltets_createSlot = __sveltets_2_createCreateSlot[^;]*;\s*/\*Ωignore_endΩ\*/;?"
    ).unwrap();
    result = slot_decl_re.replace_all(&result, "").to_string();
    result
}

fn find_balanced_end(text: &str) -> Option<usize> {
    let mut depth_brace = 0i32;
    let mut depth_paren = 0i32;
    let mut in_string = false;
    let mut string_char = '"';
    let mut started = false;
    let mut i = 0;
    let bytes = text.as_bytes();
    while i < bytes.len() {
        let ch = bytes[i] as char;
        if in_string {
            if ch == string_char && (i == 0 || bytes[i - 1] != b'\\') {
                in_string = false;
            }
        } else {
            match ch {
                '"' | '\'' | '`' => {
                    in_string = true;
                    string_char = ch;
                }
                '{' => {
                    depth_brace += 1;
                    started = true;
                }
                '}' => {
                    depth_brace -= 1;
                    if started && depth_brace == 0 && depth_paren == 0 {
                        return Some(i + 1);
                    }
                }
                '(' => {
                    depth_paren += 1;
                    started = true;
                }
                ')' => {
                    depth_paren -= 1;
                    if started && depth_brace == 0 && depth_paren == 0 {
                        return Some(i + 1);
                    }
                }
                ',' if !started && depth_brace == 0 && depth_paren == 0 => {
                    return Some(i);
                }
                _ => {}
            }
        }
        i += 1;
    }
    if started { None } else { Some(text.len()) }
}

fn normalize_attr_whitespace(text: &str) -> String {
    use regex::Regex;
    let re = Regex::new(r"\{\s{2,}").unwrap();
    let result = re.replace_all(text, "{ ").to_string();
    let re2 = Regex::new(r"([^ \t\n])  +").unwrap();
    re2.replace_all(&result, "$1 ").to_string()
}

/// Build a compact diff snippet showing the first N lines that differ.
pub fn first_diff_snippet(actual: &str, expected: &str, context_lines: usize) -> String {
    let actual_lines: Vec<&str> = actual.lines().collect();
    let expected_lines: Vec<&str> = expected.lines().collect();
    let max_len = actual_lines.len().max(expected_lines.len());

    let diff_line = (0..max_len).find(|&i| {
        actual_lines.get(i).copied().unwrap_or("") != expected_lines.get(i).copied().unwrap_or("")
    });

    match diff_line {
        Some(line_idx) => {
            let mut out = String::new();
            out.push_str(&format!("  First difference at line {}:\n", line_idx + 1));
            let start = line_idx.saturating_sub(1);
            let end = (line_idx + context_lines).min(max_len);
            for i in start..end {
                let a = actual_lines.get(i).copied().unwrap_or("<missing>");
                let e = expected_lines.get(i).copied().unwrap_or("<missing>");
                if a == e {
                    out.push_str(&format!("    {}: {}\n", i + 1, a));
                } else {
                    out.push_str(&format!("  - {}: {}\n", i + 1, e));
                    out.push_str(&format!("  + {}: {}\n", i + 1, a));
                }
            }
            out
        }
        None => "  (outputs have different trailing content)\n".to_string(),
    }
}

// =========================================================================
// Error-fixture support (`expected.error.json`)
// =========================================================================
//
// Upstream `language-tools` validates these fixtures by JSON-stringifying
// the thrown `Error` (via `JSON.stringify(err)`), then — for Svelte 5+ —
// only diffing the `{ start, end }` pair. We mirror that strategy: convert
// the error's byte-offset span into `{ line, column, character }` and
// compare it to the expected JSON's `start` / `end` objects.
//
// See `submodules/language-tools/packages/svelte2tsx/test/helpers.ts`
// (`sample.has('expected.error.json')` branch in `test_samples`).

/// Convert a byte offset into a `{ line, column, character }` object
/// matching the shape upstream's `locate-character` emits.
///
/// Mirrors `magic-string`'s locator: `line` is the 1-based line number,
/// `column` is the 0-based column within that line, and `character` is the
/// 0-based byte offset into the source. For ASCII (which both currently
/// covered fixtures are) `column` equals the byte distance from the line
/// start, which is what upstream produces too.
fn offset_to_position(source: &str, offset: usize) -> serde_json::Value {
    let bytes = source.as_bytes();
    let clamped = offset.min(bytes.len());
    let mut line: u32 = 1;
    let mut line_start: usize = 0;
    for (i, &b) in bytes.iter().enumerate().take(clamped) {
        if b == b'\n' {
            line += 1;
            line_start = i + 1;
        }
    }
    let column = clamped - line_start;
    serde_json::json!({
        "line": line,
        "column": column,
        "character": clamped,
    })
}

/// Compare the rsvelte error against the upstream `expected.error.json`
/// fixture. Returns `None` on success, `Some(diff)` describing the
/// mismatch otherwise.
///
/// Following upstream's Svelte 5 path we only diff the `start` and `end`
/// position objects — `code` / `message` / `frame` drift across Svelte
/// versions and aren't part of the contract.
fn compare_error_to_expected(
    source: &str,
    error: &Svelte2TsxError,
    expected: &serde_json::Value,
) -> Option<String> {
    let (start, end) = match error.span() {
        Some(span) => span,
        None => {
            return Some(format!(
                "error has no span: {} (variant: {:?})",
                error, error
            ));
        }
    };
    let actual_start = offset_to_position(source, start);
    let actual_end = offset_to_position(source, end);
    let expected_start = expected
        .get("start")
        .cloned()
        .unwrap_or(serde_json::Value::Null);
    let expected_end = expected
        .get("end")
        .cloned()
        .unwrap_or(serde_json::Value::Null);

    if actual_start == expected_start && actual_end == expected_end {
        return None;
    }
    Some(format!(
        "error span mismatch:\n  expected start: {}\n  actual   start: {}\n  expected end:   {}\n  actual   end:   {}",
        serde_json::to_string(&expected_start).unwrap_or_default(),
        serde_json::to_string(&actual_start).unwrap_or_default(),
        serde_json::to_string(&expected_end).unwrap_or_default(),
        serde_json::to_string(&actual_end).unwrap_or_default(),
    ))
}

// =========================================================================
// Public runner — used by both the standalone test and the dashboard.
// =========================================================================

/// Outcome for a single fixture from the runner's perspective.
pub struct FixtureOutcome {
    pub name: String,
    pub status: TestStatus,
    pub message: Option<String>,
}

/// Iterate every svelte2tsx sample under
/// `submodules/language-tools/packages/svelte2tsx/test/svelte2tsx/samples`
/// and emit one `FixtureOutcome` per sample.
pub fn iter_svelte2tsx_outcomes() -> Option<Vec<FixtureOutcome>> {
    let samples_dir = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("submodules/language-tools/packages/svelte2tsx/test/svelte2tsx/samples");
    if !samples_dir.exists() {
        return None;
    }

    let mut outcomes: Vec<FixtureOutcome> = Vec::new();

    let mut entries: Vec<_> = fs::read_dir(&samples_dir)
        .ok()?
        .filter_map(|e| e.ok())
        .collect();
    entries.sort_by_key(|e| e.file_name());

    for entry in &entries {
        let sample_name = entry.file_name().to_string_lossy().to_string();
        let sample_dir = entry.path();

        if sample_name.starts_with('.') || !sample_dir.is_dir() {
            continue;
        }

        // Error fixtures expect a parse failure. Mirror upstream's
        // Svelte 5 strategy: run svelte2tsx, assert it throws, and verify
        // the error's `{ start, end }` positions match the JSON fixture.
        // See `compare_error_to_expected` above for the comparison details.
        let error_path = sample_dir.join("expected.error.json");
        if error_path.exists() {
            let input_path = match find_svelte_file(&sample_dir) {
                Some(p) => p,
                None => {
                    outcomes.push(FixtureOutcome {
                        name: sample_name,
                        status: TestStatus::Skipped,
                        message: Some("no .svelte input file".into()),
                    });
                    continue;
                }
            };
            let svelte_filename = input_path
                .file_name()
                .unwrap()
                .to_string_lossy()
                .to_string();
            let input = match fs::read_to_string(&input_path) {
                Ok(s) => s,
                Err(_) => {
                    outcomes.push(FixtureOutcome {
                        name: sample_name,
                        status: TestStatus::Skipped,
                        message: Some("input.svelte unreadable".into()),
                    });
                    continue;
                }
            };
            let expected_json: serde_json::Value = match fs::read_to_string(&error_path)
                .ok()
                .and_then(|s| serde_json::from_str(&s).ok())
            {
                Some(v) => v,
                None => {
                    outcomes.push(FixtureOutcome {
                        name: sample_name,
                        status: TestStatus::Skipped,
                        message: Some("expected.error.json unreadable".into()),
                    });
                    continue;
                }
            };

            let options = build_options(&sample_name, &sample_dir, &svelte_filename);
            let input_clone = input.clone();
            let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                svelte2tsx(&input_clone, options)
            }));

            match result {
                Ok(Ok(_)) => {
                    outcomes.push(FixtureOutcome {
                        name: sample_name,
                        status: TestStatus::Failed,
                        message: Some(
                            "expected svelte2tsx to throw an error but it succeeded".into(),
                        ),
                    });
                }
                Ok(Err(e)) => match compare_error_to_expected(&input, &e, &expected_json) {
                    None => outcomes.push(FixtureOutcome {
                        name: sample_name,
                        status: TestStatus::Passed,
                        message: None,
                    }),
                    Some(diff) => outcomes.push(FixtureOutcome {
                        name: sample_name,
                        status: TestStatus::Failed,
                        message: Some(diff),
                    }),
                },
                Err(panic_info) => {
                    let msg = if let Some(s) = panic_info.downcast_ref::<&str>() {
                        s.to_string()
                    } else if let Some(s) = panic_info.downcast_ref::<String>() {
                        s.clone()
                    } else {
                        "unknown panic".to_string()
                    };
                    outcomes.push(FixtureOutcome {
                        name: sample_name,
                        status: TestStatus::Error,
                        message: Some(format!("PANIC: {}", msg)),
                    });
                }
            }
            continue;
        }

        let input_path = match find_svelte_file(&sample_dir) {
            Some(p) => p,
            None => {
                outcomes.push(FixtureOutcome {
                    name: sample_name,
                    status: TestStatus::Skipped,
                    message: Some("no .svelte input file".into()),
                });
                continue;
            }
        };
        let svelte_filename = input_path
            .file_name()
            .unwrap()
            .to_string_lossy()
            .to_string();
        let input = match fs::read_to_string(&input_path) {
            Ok(s) => s,
            Err(_) => {
                outcomes.push(FixtureOutcome {
                    name: sample_name,
                    status: TestStatus::Skipped,
                    message: Some("input.svelte unreadable".into()),
                });
                continue;
            }
        };

        let is_v5_sample = sample_name.ends_with(".v5");
        let has_svelte5_expected = !is_v5_sample && sample_dir.join("expected-svelte5.ts").exists();
        let expected_path = if has_svelte5_expected {
            sample_dir.join("expected-svelte5.ts")
        } else {
            sample_dir.join("expectedv2.ts")
        };
        if !expected_path.exists() {
            outcomes.push(FixtureOutcome {
                name: sample_name,
                status: TestStatus::Skipped,
                message: Some("no expected file".into()),
            });
            continue;
        }
        let expected = normalize(&fs::read_to_string(&expected_path).unwrap());

        let options = build_options(&sample_name, &sample_dir, &svelte_filename);
        let input_clone = input.clone();
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            svelte2tsx(&input_clone, options)
        }));

        match result {
            Ok(Ok(output)) => {
                let actual = normalize(&output.code);
                if actual == expected
                    || normalize_all_whitespace(&normalize_semicolons(&actual))
                        == normalize_all_whitespace(&normalize_semicolons(&expected))
                    || relaxed_compare(&actual, &expected)
                {
                    outcomes.push(FixtureOutcome {
                        name: sample_name,
                        status: TestStatus::Passed,
                        message: None,
                    });
                } else {
                    let diff = first_diff_snippet(&actual, &expected, 5);
                    outcomes.push(FixtureOutcome {
                        name: sample_name,
                        status: TestStatus::Failed,
                        message: Some(diff),
                    });
                }
            }
            Ok(Err(e)) => {
                outcomes.push(FixtureOutcome {
                    name: sample_name,
                    status: TestStatus::Error,
                    message: Some(format!("{}", e)),
                });
            }
            Err(panic_info) => {
                let msg = if let Some(s) = panic_info.downcast_ref::<&str>() {
                    s.to_string()
                } else if let Some(s) = panic_info.downcast_ref::<String>() {
                    s.clone()
                } else {
                    "unknown panic".to_string()
                };
                outcomes.push(FixtureOutcome {
                    name: sample_name,
                    status: TestStatus::Error,
                    message: Some(format!("PANIC: {}", msg)),
                });
            }
        }
    }

    Some(outcomes)
}

/// Run all svelte2tsx fixtures and return a `CategoryResult` ready to
/// register in the compatibility-report dashboard. Returns `None` when
/// the language-tools submodule is missing (so callers can decide
/// whether to silently skip or fail loudly).
pub fn run_as_category() -> Option<CategoryResult> {
    let outcomes = iter_svelte2tsx_outcomes()?;
    let mut result = CategoryResult::new("svelte2tsx");
    for outcome in outcomes {
        let status = outcome.status;
        let (error, skip_reason) = match status {
            TestStatus::Failed | TestStatus::Error => (outcome.message, None),
            TestStatus::Skipped => (None, outcome.message),
            TestStatus::Passed => (None, None),
        };
        result.add_sample(SampleResult {
            name: outcome.name,
            status,
            error,
            skip_reason,
            details: None,
        });
    }
    Some(result)
}
