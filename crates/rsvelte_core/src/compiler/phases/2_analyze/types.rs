//! Type definitions for the analysis phase.

use super::scope::{Scope, ScopeRoot};
use crate::ast::arena::JsNodeId;
use crate::ast::template::{Root, Script};
use crate::compiler::CompileOptions;
use rustc_hash::{FxHashMap, FxHashSet};
use std::ops::Range;

#[cfg(test)]
thread_local! {
    pub(crate) static STRIP_TYPESCRIPT_REPARSES: std::cell::Cell<usize> = const {
        std::cell::Cell::new(0)
    };
}

#[cfg(test)]
thread_local! {
    pub(crate) static BLANK_TYPESCRIPT_REPARSES: std::cell::Cell<usize> = const {
        std::cell::Cell::new(0)
    };
}

/// Pre-extracted script content to avoid re-parsing in Phase 3.
#[derive(Debug, Clone)]
pub struct ScriptContent {
    /// The raw script content as a string.
    pub raw: String,
    /// Start position in the source.
    pub start: u32,
    /// End position in the source.
    pub end: u32,
    /// Whether this script uses runes ($state, $derived, $effect, $props).
    pub uses_runes: bool,
    /// Mapping from the original TypeScript source to `raw`.
    ///
    /// `None` means the mapping is the identity.
    pub(crate) source_projection: Option<ScriptProjection>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct CopiedSourceChunk {
    pub(crate) source: Range<u32>,
    pub(crate) output: Range<u32>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct ScriptProjection {
    /// Exact source slices copied into the output, including re-emitted comments.
    pub(crate) copied_chunks: Vec<CopiedSourceChunk>,
    /// Original script-content length in bytes.
    pub(crate) source_len: u32,
    /// Stripped script-content length in bytes.
    pub(crate) output_len: u32,
}

impl ScriptProjection {
    /// Map a range only when all of its bytes were copied contiguously and unchanged.
    pub(crate) fn output_range_for_source(&self, source: Range<u32>) -> Option<Range<u32>> {
        if source.start > source.end || source.end > self.source_len {
            return None;
        }

        self.copied_chunks.iter().find_map(|chunk| {
            if source.start < chunk.source.start || source.end > chunk.source.end {
                return None;
            }
            let start = chunk.output.start + (source.start - chunk.source.start);
            Some(start..start + (source.end - source.start))
        })
    }
}

/// A reactive statement ($: statement) in legacy mode (Svelte 4).
#[derive(Debug, Clone)]
pub struct ReactiveStatement {
    /// Bindings that are assigned to in this reactive statement
    pub assignments: FxHashSet<usize>,
    /// Bindings that this reactive statement depends on
    pub dependencies: Vec<usize>,
}

/// Phase-1 identity and Phase-2 facts for one top-level legacy `$:` statement.
///
/// The arena outlives analysis and Phase 3, so keeping the body node id lets the
/// client lower the original statement without serializing or reparsing it.
#[derive(Debug, Clone)]
pub struct LegacyReactiveStatement {
    pub body: JsNodeId,
    pub span: Range<u32>,
    pub body_span: Range<u32>,
    pub source_ordinal: usize,
    pub assignments: Vec<String>,
    pub dependencies: Vec<String>,
    pub cycle_dependencies: Vec<String>,
}

/// Pre-transformed instance script body sections.
/// Used for optimization during code generation.
/// Corresponds to `instance_body` in ComponentAnalysis (phases/types.d.ts).
#[derive(Debug, Default, Clone)]
pub struct InstanceBody {
    /// Statements hoisted to the top (imports)
    pub hoisted: Vec<serde_json::Value>,
    /// Synchronous statements (regular let/const declarations, function declarations)
    pub sync: Vec<serde_json::Value>,
    /// Asynchronous statements (with their await status)
    pub async_: Vec<AsyncStatement>,
    /// Variable declarations (identifiers that need blocker tracking)
    pub declarations: Vec<String>,
}

/// An asynchronous statement with its await status.
/// Corresponds to items in `instance_body.async` array.
#[derive(Debug, Clone)]
pub struct AsyncStatement {
    /// The statement node (VariableDeclarator or Statement)
    pub node: serde_json::Value,
    /// Whether this statement contains await expressions
    pub has_await: bool,
}

/// Declaration for an awaited value in an await block.
/// Corresponds to AwaitedDeclaration in the official compiler.
#[derive(Debug, Clone)]
pub struct AwaitedDeclaration {
    /// The identifier being declared
    pub id: String,
    /// Whether this declaration has await in its value
    pub has_await: bool,
    /// The pattern being destructured (if applicable)
    pub pattern: Option<String>,
    /// Expression metadata for the declaration
    pub metadata: crate::ast::template::ExpressionMetadata,
    /// Identifiers that update this declaration
    pub updated_by: FxHashSet<String>,
}

impl ScriptContent {
    /// Extract script content from an AST Script node and source,
    /// with optional forced TypeScript stripping.
    /// `force_typescript` is true when another script in the component has `lang="ts"`.
    pub(crate) fn from_script_with_ts(
        script: &Script,
        source: &str,
        force_typescript: bool,
        retained_program: Option<&crate::ast::oxc_program::RetainedProgram<'_>>,
    ) -> Self {
        let start = script.content.start().unwrap_or(0);
        let end = script.content.end().unwrap_or(0);
        let raw_source = if (end as usize) > (start as usize) && (end as usize) <= source.len() {
            &source[start as usize..end as usize]
        } else {
            ""
        };
        let retained_matches_source = retained_program.is_some_and(|program| {
            program.source().len() == raw_source.len()
                && std::ptr::eq(program.source().as_ptr(), raw_source.as_ptr())
        });
        // Check if this script uses TypeScript
        let is_typescript = force_typescript
            || script.attributes.iter().any(|attr| {
                if attr.name == "lang"
                    && let crate::ast::template::AttributeValue::Sequence(parts) = &attr.value
                    && let Some(crate::ast::template::AttributeValuePart::Text(text)) =
                        parts.first()
                {
                    return text.data == "ts" || text.data == "typescript";
                }
                false
            });
        // Strip TypeScript from the raw content if this is a TypeScript script
        let (raw, source_projection) = if is_typescript && !raw_source.is_empty() {
            retained_program
                .filter(|program| {
                    !program.panicked()
                        && program.diagnostics().is_empty()
                        && retained_matches_source
                })
                .map_or_else(
                    || (strip_typescript(raw_source), None),
                    |program| {
                        strip_typescript_from_program_with_projection(raw_source, program.program())
                    },
                )
        } else {
            (raw_source.to_string(), None)
        };

        if !raw.as_bytes().contains(&b'$') {
            return Self {
                raw,
                start,
                end,
                uses_runes: false,
                source_projection,
            };
        }

        // Extract imported names to avoid false-positive rune detection.
        // If `state` is imported (e.g., `import { state } from './store'`), then
        // `$state` is a store subscription, not a rune call.
        let imported_names = extract_imported_names(&raw);

        // Rune detection is a lexical scan, so blank out comments and string
        // literal contents first — `// use $state instead` or `"$state"` are
        // not references in upstream's scope-based detection
        // (2-analyze/index.js `module.scope.references.keys()`).
        let rune_scan_text = blank_comments_and_strings(&raw);

        let uses_runes = has_rune_text_not_imported(&rune_scan_text, "$state", &imported_names)
            || has_rune_text_not_imported(&rune_scan_text, "$derived", &imported_names)
            || has_rune_text_not_imported(&rune_scan_text, "$effect", &imported_names)
            || has_rune_text(&rune_scan_text, "$props");

        Self {
            raw,
            start,
            end,
            uses_runes,
            source_projection,
        }
    }
}

/// Replace the contents of comments (`// …`, `/* … */`) and string literals
/// (`'…'`, `"…"`, and template-literal text segments) with spaces, byte for
/// byte, so a lexical scan over the result cannot match text that is not code.
/// Template-literal `${ … }` interpolations are kept (they contain real code).
/// The output has the same byte length as the input, so byte offsets are
/// preserved.
fn blank_comments_and_strings(raw: &str) -> String {
    let bytes = raw.as_bytes();
    let mut out = bytes.to_vec();
    let len = bytes.len();
    let mut i = 0;
    // Stack of brace depths at which an enclosing template literal's `${` was
    // opened, so nested templates inside interpolations are handled.
    let mut template_stack: Vec<usize> = Vec::new();
    let mut brace_depth: usize = 0;
    // `in_template` is true when scanning template-literal TEXT (not an
    // interpolation).
    let mut in_template = false;

    while i < len {
        let b = bytes[i];

        if in_template {
            if b == b'\\' {
                if i + 1 < len {
                    out[i + 1] = b' ';
                }
                out[i] = b' ';
                i += 2;
                continue;
            }
            if b == b'`' {
                in_template = false;
                i += 1;
                continue;
            }
            if b == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                // Enter interpolation: resume code scanning.
                template_stack.push(brace_depth);
                brace_depth += 1;
                in_template = false;
                i += 2;
                continue;
            }
            out[i] = b' ';
            i += 1;
            continue;
        }

        match b {
            b'/' if i + 1 < len && bytes[i + 1] == b'/' => {
                // Line comment: blank until newline (keep the newline itself).
                while i < len && bytes[i] != b'\n' {
                    out[i] = b' ';
                    i += 1;
                }
            }
            b'/' if i + 1 < len && bytes[i + 1] == b'*' => {
                // Block comment: blank until `*/` inclusive.
                out[i] = b' ';
                out[i + 1] = b' ';
                i += 2;
                while i < len {
                    if bytes[i] == b'*' && i + 1 < len && bytes[i + 1] == b'/' {
                        out[i] = b' ';
                        out[i + 1] = b' ';
                        i += 2;
                        break;
                    }
                    if bytes[i] != b'\n' {
                        out[i] = b' ';
                    }
                    i += 1;
                }
            }
            b'\'' | b'"' => {
                // String literal: blank contents (keep the quotes).
                let quote = b;
                i += 1;
                while i < len {
                    let c = bytes[i];
                    if c == b'\\' {
                        out[i] = b' ';
                        if i + 1 < len {
                            out[i + 1] = b' ';
                        }
                        i += 2;
                        continue;
                    }
                    if c == quote {
                        i += 1;
                        break;
                    }
                    out[i] = b' ';
                    i += 1;
                }
            }
            b'`' => {
                in_template = true;
                i += 1;
            }
            b'{' => {
                brace_depth += 1;
                i += 1;
            }
            b'}' => {
                brace_depth = brace_depth.saturating_sub(1);
                // Closing a template interpolation returns to template text.
                if let Some(&enter_depth) = template_stack.last()
                    && brace_depth == enter_depth
                {
                    template_stack.pop();
                    in_template = true;
                }
                i += 1;
            }
            _ => {
                i += 1;
            }
        }
    }

    // out only replaces bytes with ASCII spaces, never splits multi-byte
    // sequences partially: every replaced byte becomes b' ', and replacement
    // happens for whole comment/string regions, so any multi-byte char is
    // either fully kept or fully blanked.
    String::from_utf8(out).unwrap_or_else(|_| raw.to_string())
}

/// Check if a rune name appears as a genuine rune usage in the source text.
/// This avoids false positives from:
/// - `$effect:` (labeled statement, not a rune call)
/// - `$$props` (reserved identifier, `$props` is a substring)
/// - Property names like `foo.$state`
fn has_rune_text(raw: &str, rune_name: &str) -> bool {
    let mut start = 0;
    while let Some(pos) = raw[start..].find(rune_name) {
        let abs_pos = start + pos;

        // Check character before: must not be `$` or an identifier char
        // This avoids matching `$$props` when searching for `$props`
        if abs_pos > 0 {
            let prev_char = raw.as_bytes()[abs_pos - 1];
            if prev_char == b'$'
                || prev_char.is_ascii_alphanumeric()
                || prev_char == b'_'
                || prev_char == b'.'
            {
                start = abs_pos + rune_name.len();
                continue;
            }
        }

        // Check character after: if it's just `:` followed by whitespace or end,
        // it's a label, not a rune call
        let after_pos = abs_pos + rune_name.len();
        if after_pos < raw.len() {
            let after_char = raw.as_bytes()[after_pos];
            // If followed by alphanumeric or underscore, it's part of a longer identifier
            if after_char.is_ascii_alphanumeric() || after_char == b'_' {
                start = after_pos;
                continue;
            }
            // If followed by `:` (and not `::` which doesn't apply to JS), it might be a label
            // Labels look like `$effect: <statement>` or `$effect : <statement>`
            // But we only skip if the colon is NOT part of a ternary or object literal
            // For simplicity, we check: if it's `$effect:` at the top of a statement (no `(` before `:`)
            if after_char == b':' {
                // Check if this is a labeled statement pattern
                // In a labeled statement, the label is `$effect:` without `(` before `:`
                // This is a heuristic - we skip it as a potential label
                start = after_pos + 1;
                continue;
            }
        }

        // Found a genuine rune reference
        return true;
    }
    false
}

/// Check if a rune name appears as a genuine rune usage that is NOT a store subscription.
/// A rune like `$state` is a store subscription if `state` is imported.
fn has_rune_text_not_imported(
    raw: &str,
    rune_name: &str,
    imported_names: &rustc_hash::FxHashSet<String>,
) -> bool {
    if !has_rune_text(raw, rune_name) {
        return false;
    }
    // The base name is the rune name without the leading `$`
    let base_name = &rune_name[1..];
    // Also handle `.` suffixes like `$state.raw` -> base is `state`
    let base_name = base_name.split('.').next().unwrap_or(base_name);
    // If the base name is imported, this is a store subscription, not a rune
    !imported_names.contains(base_name)
}

/// Extract imported names from script source text, excluding imports from svelte/* modules.
/// Looks for `import { name1, name2 } from '...'` and `import name from '...'` patterns.
/// Names imported from `svelte/store` or other `svelte/*` modules are excluded because
/// `$derived` from `import { derived } from 'svelte/store'` is still a rune, not a store subscription.
pub fn extract_imported_names(raw: &str) -> rustc_hash::FxHashSet<String> {
    let mut names = rustc_hash::FxHashSet::default();

    for line in raw.lines() {
        let trimmed = line.trim();
        if !trimmed.starts_with("import ") {
            continue;
        }

        // Extract the source module from the import statement
        let source = extract_import_source(trimmed);

        // Skip imports from svelte/* modules - these are framework imports, not user stores.
        // `import { derived } from 'svelte/store'` still allows `$derived` to be a rune.
        if let Some(ref src) = source
            && (src.starts_with("svelte/") || src == "svelte")
        {
            continue;
        }

        // Handle: import { name1, name2 as alias } from '...'
        if let Some(brace_start) = trimmed.find('{')
            && let Some(brace_end) = trimmed[brace_start..].find('}')
        {
            let inside = &trimmed[brace_start + 1..brace_start + brace_end];
            for part in inside.split(',') {
                let part = part.trim();
                if part.is_empty() {
                    continue;
                }
                // Handle "name as alias" - we want "name" (the original import)
                // but also "alias" since that's what's used in the script
                if let Some(as_pos) = memchr::memmem::find(part.as_bytes(), b" as ") {
                    let original = part[..as_pos].trim();
                    let alias = part[as_pos + 4..].trim();
                    names.insert(original.to_string());
                    names.insert(alias.to_string());
                } else {
                    names.insert(part.to_string());
                }
            }
        }

        // Handle: import name from '...'
        // But NOT: import { ... } from '...' or import * as name from '...'
        let after_import = trimmed[7..].trim();
        if !after_import.starts_with('{')
            && !after_import.starts_with('*')
            && !after_import.starts_with('\'')
            && !after_import.starts_with('"')
        {
            // Default import: "import Name from '...'"
            if let Some(from_pos) = memchr::memmem::find(after_import.as_bytes(), b" from ") {
                let name = after_import[..from_pos].trim();
                // Could be "Name, { a, b }" - take only the default import part
                let name = name.split(',').next().unwrap_or(name).trim();
                if !name.is_empty()
                    && name
                        .chars()
                        .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
                {
                    names.insert(name.to_string());
                }
            }
        }
    }

    names
}

/// Extract locally-declared variable names whose initialiser is NOT a rune call.
///
/// Mirrors the upstream `module.scope.references` behaviour: if `state` is declared
/// as `const state = 42` (non-rune initialiser), then the reference `$state` resolves
/// to the `state` binding and is therefore NOT a free reference — it is a store
/// subscription, not a rune call.  We add these names to the exclusion set used by
/// the re-verification walk so they are treated as store subs rather than runes.
///
/// Known rune prefixes (`$state`, `$derived`, `$props`, …) guard against treating a
/// rune-initialised variable (`const count = $state(0)`) as a non-rune binding.
pub fn extract_local_non_rune_declared_names(raw: &str) -> rustc_hash::FxHashSet<String> {
    // If the RHS of a declaration starts with one of these, the variable is
    // rune-initialised and must NOT be added to the exclusion set.
    const RUNE_PREFIXES: &[&str] = &[
        "$state",
        "$derived",
        "$props",
        "$bindable",
        "$effect",
        "$inspect",
        "$host",
    ];
    let mut names = rustc_hash::FxHashSet::default();
    for line in raw.lines() {
        let trimmed = line.trim();
        // `export let x` is the legacy prop form and declares `x` just the same.
        let trimmed = trimmed
            .strip_prefix("export ")
            .map_or(trimmed, str::trim_start);
        // Look for `const/let/var NAME[: T][ = <rhs>]`
        let rest = trimmed
            .strip_prefix("const ")
            .or_else(|| trimmed.strip_prefix("let "))
            .or_else(|| trimmed.strip_prefix("var "));
        let rest = match rest {
            Some(r) => r.trim(),
            None => continue,
        };
        // A declarator with no initialiser cannot be rune-initialised.
        let (declarator, rhs) = match rest.find(" = ") {
            Some(eq_pos) => (&rest[..eq_pos], rest[eq_pos + 3..].trim()),
            None => (rest.trim_end_matches(';'), ""),
        };
        // Drop a TypeScript annotation: `state: Writable<Record<string, any>>`.
        let name_part = declarator.split(':').next().unwrap_or(declarator).trim();
        // Only simple identifiers (no destructuring patterns)
        if name_part.is_empty()
            || !name_part
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        {
            continue;
        }
        // If the RHS starts with a rune call, this variable IS rune-initialised
        if RUNE_PREFIXES.iter().any(|p| rhs.starts_with(p)) {
            continue;
        }
        names.insert(name_part.to_string());
    }
    names
}

/// Extract the source module string from an import statement.
/// Returns the module path without quotes.
fn extract_import_source(import_line: &str) -> Option<String> {
    // Look for from '...' or from "..."
    let from_pos = memchr::memmem::find(import_line.as_bytes(), b" from ")?;
    let after_from = import_line[from_pos + 6..].trim();
    let quote_char = after_from.chars().next()?;
    if quote_char != '\'' && quote_char != '"' {
        return None;
    }
    let end_pos = after_from[1..].find(quote_char)?;
    Some(after_from[1..1 + end_pos].to_string())
}

/// Strip TypeScript syntax from source code, producing valid JavaScript.
///
/// Uses OXC parser to parse TypeScript, then walks the AST to find
/// TypeScript-specific source regions to remove.
pub fn strip_typescript(source: &str) -> String {
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    #[cfg(test)]
    STRIP_TYPESCRIPT_REPARSES.with(|count| count.set(count.get() + 1));

    let allocator = Allocator::default();
    let source_type = SourceType::ts();
    let parser = Parser::new(&allocator, source, source_type);
    let result = parser.parse();

    if result.panicked {
        // The AST is a stub; nothing can be stripped from it.
        return source.to_string();
    }

    let stripped = strip_typescript_from_program(source, &result.program);

    // OXC reports rules the official parser does not enforce (a required
    // parameter after an optional one, say) as parse errors even though it
    // built a complete AST. Returning the TypeScript source unstripped in that
    // case emits type annotations into the generated module, so trust the strip
    // whenever its result is JavaScript — which a partial recovery's would not be.
    if !result.diagnostics.is_empty() {
        let allocator = Allocator::default();
        let check = Parser::new(&allocator, &stripped, SourceType::mjs()).parse();
        if check.panicked || !check.diagnostics.is_empty() {
            return source.to_string();
        }
    }

    stripped
}

pub(crate) fn strip_typescript_from_program(
    source: &str,
    program: &oxc_ast::ast::Program<'_>,
) -> String {
    strip_typescript_from_program_impl(source, program, false).0
}

pub(crate) fn strip_typescript_from_program_with_projection(
    source: &str,
    program: &oxc_ast::ast::Program<'_>,
) -> (String, Option<ScriptProjection>) {
    strip_typescript_from_program_impl(source, program, true)
}

fn strip_typescript_from_program_impl(
    source: &str,
    program: &oxc_ast::ast::Program<'_>,
    include_projection: bool,
) -> (String, Option<ScriptProjection>) {
    debug_assert_eq!(source, program.source_text);

    let mut removals: Vec<(u32, u32)> = Vec::new();
    collect_ts_removals_from_program(program, source, &mut removals);

    // Text-based fallback: strip `declare global { ... }`, `declare module ... { ... }`,
    // and `declare namespace ... { ... }` blocks. These may not always be parsed as
    // TSExternalModuleDeclaration depending on the OXC version, so do a simple text-based scan
    // to ensure they're removed.
    //
    // Every keyword below starts with `declare `, so one SIMD scan for that prefix
    // decides all three at once and skips three whole-source `str::find` passes.
    if memchr::memmem::find(source.as_bytes(), b"declare ").is_some() {
        for keyword in &["declare global", "declare module", "declare namespace"] {
            let bytes = source.as_bytes();
            let mut search_from = 0;
            while let Some(rel) =
                memchr::memmem::find(&source.as_bytes()[search_from..], keyword.as_bytes())
            {
                let start = search_from + rel;
                // Ensure it's at start of line (or preceded only by whitespace)
                let line_start = source[..start].rfind('\n').map(|n| n + 1).unwrap_or(0);
                let prefix = &source[line_start..start];
                if !prefix.chars().all(char::is_whitespace) {
                    search_from = start + keyword.len();
                    continue;
                }
                // Find the matching `{` after the keyword
                let after = &source[start + keyword.len()..];
                if let Some(brace_rel) = after.find('{') {
                    let brace_pos = start + keyword.len() + brace_rel;
                    // Find matching `}` by depth tracking
                    let mut depth = 1i32;
                    let mut i = brace_pos + 1;
                    while i < bytes.len() && depth > 0 {
                        match bytes[i] {
                            b'{' => depth += 1,
                            b'}' => depth -= 1,
                            b'"' | b'\'' | b'`' => {
                                let q = bytes[i];
                                i += 1;
                                while i < bytes.len() && bytes[i] != q {
                                    if bytes[i] == b'\\' {
                                        i += 1;
                                    }
                                    i += 1;
                                }
                            }
                            _ => {}
                        }
                        i += 1;
                    }
                    if depth == 0 {
                        removals.push((start as u32, i as u32));
                        search_from = i;
                        continue;
                    }
                }
                search_from = start + keyword.len();
            }
        }
    }

    if removals.is_empty() {
        return (source.to_string(), None);
    }

    // Sort removals by start position
    removals.sort_by_key(|r| r.0);

    // Merge overlapping removals
    let mut merged: Vec<(u32, u32)> = Vec::new();
    for (start, end) in removals {
        if let Some(last) = merged.last_mut()
            && start <= last.1
        {
            last.1 = last.1.max(end);
            continue;
        }
        merged.push((start, end));
    }

    // Build output by skipping removed regions
    let mut output = String::with_capacity(source.len());
    let mut copied_chunks =
        include_projection.then(|| Vec::with_capacity(merged.len().saturating_add(1)));
    let mut pos = 0u32;

    for (remove_start, remove_end) in &merged {
        if *remove_start > pos {
            push_source_range(
                source,
                pos..*remove_start,
                &mut output,
                copied_chunks.as_mut(),
            );
        }
        // The official compiler PARSES TypeScript and only removes the
        // type-only nodes — comments inside a removed declaration (e.g. the
        // per-property JSDoc of an `interface Props { ... }`) survive in
        // `analysis.comments` and esrap re-prints them before the next
        // statement. Keep them: re-emit every comment found inside a removed
        // multi-line region in place.
        //
        // Exception: do NOT re-emit comments from inline TS type annotations
        // on variable declarations (e.g. `}: SomeType & { /** JSDoc */ ... }`).
        // Those annotations start with `:` (the TS type annotation sigil), and
        // re-emitting their interior JSDoc comments would leave the comment
        // floating between the destructuring `}` and `= $props()`, which breaks
        // `collapse_multiline_destructuring` — it closes the destructure accumulation
        // at the `}` (depth → 0) before seeing `= $$props`, so the collapsed string
        // never matches and `$$slots`/`$$events` injection is skipped.
        let start = *remove_start as usize;
        let end = (*remove_end as usize).min(source.len());
        if pos as usize <= start && start < end {
            let removed = &source[start..end];
            // An inline TS type annotation starts with `:` (optionally preceded by
            // whitespace already emitted). If the removed chunk starts with `:`, it
            // is a type annotation — skip comment re-emission for it entirely.
            // A definite-assignment `!` / optional `?` marker is spliced together
            // with the annotation that follows it, so look past it before testing
            // for the sigil.
            let is_inline_type_annotation = removed
                .trim_start()
                .trim_start_matches(['!', '?'])
                .trim_start()
                .starts_with(':');
            if !is_inline_type_annotation
                && removed.contains('\n')
                && (removed.contains("/*") || removed.contains("//"))
            {
                if let Some(copied_chunks) = copied_chunks.as_mut() {
                    for (comment_offset, comment) in
                        crate::compiler::phases::phase3_transform::server::transform_script::extract_comments_from_snippet_with_pos(removed)
                    {
                        let comment_start = *remove_start + comment_offset as u32;
                        let comment_end = comment_start + comment.len() as u32;
                        push_source_range(
                            source,
                            comment_start..comment_end,
                            &mut output,
                            Some(copied_chunks),
                        );
                        output.push('\n');
                    }
                } else {
                    for comment in
                        crate::compiler::phases::phase3_transform::server::transform_script::extract_comments_from_snippet(removed)
                    {
                        output.push_str(&comment);
                        output.push('\n');
                    }
                }
            }
        }
        pos = pos.max(*remove_end);
    }

    // Add remaining content
    if (pos as usize) < source.len() {
        push_source_range(
            source,
            pos..source.len() as u32,
            &mut output,
            copied_chunks.as_mut(),
        );
    }

    let projection = copied_chunks.map(|copied_chunks| ScriptProjection {
        copied_chunks,
        source_len: source.len() as u32,
        output_len: output.len() as u32,
    });

    (output, projection)
}

fn push_source_range(
    source: &str,
    source_range: Range<u32>,
    output: &mut String,
    copied_chunks: Option<&mut Vec<CopiedSourceChunk>>,
) {
    if source_range.is_empty() {
        return;
    }

    let output_start = output.len() as u32;
    output.push_str(&source[source_range.start as usize..source_range.end as usize]);
    let output_end = output.len() as u32;

    if let Some(copied_chunks) = copied_chunks {
        if let Some(last) = copied_chunks.last_mut()
            && last.source.end == source_range.start
            && last.output.end == output_start
        {
            last.source.end = source_range.end;
            last.output.end = output_end;
        } else {
            copied_chunks.push(CopiedSourceChunk {
                source: source_range,
                output: output_start..output_end,
            });
        }
    }
}

/// Blank TypeScript-specific syntax with spaces instead of removing it, so the
/// output has the same byte length as the input and byte positions are
/// preserved. Used by lexical scanners (e.g. the `$store` reference scan) that
/// must not see TS type-only syntax such as `interface $$Props { … }` or
/// `let foo: $$Props['foo']` — upstream's scope analysis never registers TS
/// type declarations/references as JS variable references.
///
/// Returns the input unchanged when TS parsing fails (downstream handles those
/// errors).
pub fn blank_typescript(source: &str) -> String {
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    #[cfg(test)]
    BLANK_TYPESCRIPT_REPARSES.with(|count| count.set(count.get() + 1));

    let allocator = Allocator::default();
    let source_type = SourceType::ts();
    let parser = Parser::new(&allocator, source, source_type);
    let result = parser.parse();

    if !result.diagnostics.is_empty() {
        return source.to_string();
    }

    blank_typescript_from_program(source, &result.program)
}

/// [`blank_typescript`] against a program the caller already parsed.
///
/// The parse above is the third one this script goes through, and the caller on
/// the real compile path is holding the retained one.
pub(crate) fn blank_typescript_from_program(
    source: &str,
    program: &oxc_ast::ast::Program<'_>,
) -> String {
    let mut removals: Vec<(u32, u32)> = Vec::new();
    collect_ts_removals_from_program(program, source, &mut removals);

    if removals.is_empty() {
        return source.to_string();
    }

    let mut out = source.as_bytes().to_vec();
    for (start, end) in removals {
        let (start, end) = (start as usize, (end as usize).min(out.len()));
        for b in &mut out[start..end] {
            if *b != b'\n' {
                *b = b' ';
            }
        }
    }

    String::from_utf8(out).unwrap_or_else(|_| source.to_string())
}

/// Collect TypeScript-specific source spans to remove from a program.
fn collect_ts_removals_from_program(
    program: &oxc_ast::ast::Program,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    use oxc_ast_visit::Visit;
    ts_removals::TsRemovalCollector { source, removals }.visit_program(program);
}

/// Span collector behind [`collect_ts_removals_from_program`].
///
/// Upstream (`1-parse/remove_typescript_nodes.js`) walks the AST generically and
/// its catch-all visitor deletes `typeAnnotation` / `typeParameters` /
/// `typeArguments` / `returnType` / `accessibility` / `readonly` / `definite` /
/// `override` / `optional` on *every* node, so no node kind can be silently
/// skipped. Driving this collector from `oxc_ast_visit::Visit` reproduces that
/// property: the default walk reaches every child, and an override is needed
/// only where a source span must be removed or a subtree must be cut off.
mod ts_removals {
    use oxc_ast::ast::*;
    use oxc_ast_visit::{Visit, walk};
    use oxc_span::{GetSpan, Span};
    use oxc_syntax::scope::ScopeFlags;

    use super::{
        accessibility_keyword, collect_definite_marker_removal, collect_optional_marker_removal,
        is_paren_safe_to_drop, peel_ts_wrappers, remove_keyword_from_source,
        remove_specifier_with_comma,
    };

    pub(super) struct TsRemovalCollector<'s, 'r> {
        pub(super) source: &'s str,
        pub(super) removals: &'r mut Vec<(u32, u32)>,
    }

    impl TsRemovalCollector<'_, '_> {
        fn remove(&mut self, span: Span) {
            self.removals.push((span.start, span.end));
        }

        fn remove_range(&mut self, start: u32, end: u32) {
            self.removals.push((start, end));
        }

        /// `abstract` / `implements` are keywords rather than child nodes, so
        /// they have no span of their own and must be located in the source.
        fn remove_class_modifiers(&mut self, class: &Class<'_>) {
            if class.r#abstract && !self.source.is_empty() {
                let class_source = &self.source[class.span.start as usize..class.span.end as usize];
                if let Some(abstract_pos) =
                    memchr::memmem::find(class_source.as_bytes(), b"abstract")
                {
                    let abs_start = class.span.start + abstract_pos as u32;
                    let abs_end = abs_start + 8;
                    let space_end = if (abs_end as usize) < self.source.len()
                        && self.source.as_bytes()[abs_end as usize] == b' '
                    {
                        abs_end + 1
                    } else {
                        abs_end
                    };
                    self.remove_range(abs_start, space_end);
                }
            }

            if class.implements.is_empty() || self.source.is_empty() {
                return;
            }
            let last_impl = class.implements.last().unwrap();
            let search_start = if let Some(heritage) = &class.heritage {
                heritage.expression.span().end as usize
            } else if let Some(type_params) = &class.type_parameters {
                type_params.span.end as usize
            } else if let Some(id) = &class.id {
                id.span.end as usize
            } else {
                class.span.start as usize
            };
            if search_start >= class.body.span.start as usize {
                return;
            }
            let search_source = &self.source[search_start..class.body.span.start as usize];
            if let Some(impl_pos) = memchr::memmem::find(search_source.as_bytes(), b"implements") {
                let abs_start = search_start as u32 + impl_pos as u32;
                self.remove_range(abs_start, last_impl.span.end);
                if abs_start > 0
                    && (abs_start as usize) <= self.source.len()
                    && self.source.as_bytes()[(abs_start - 1) as usize] == b' '
                {
                    self.remove_range(abs_start - 1, abs_start);
                }
            }
        }
    }

    /// An ambient function declaration (`declare function f(): void`) or a bare
    /// overload signature is deleted whole. A method's empty body is spelled
    /// `TSEmptyBodyFunctionExpression` instead, and upstream leaves those alone.
    fn is_ambient_function(func: &Function<'_>) -> bool {
        func.r#type == FunctionType::TSDeclareFunction
            || func.declare
            || (func.body.is_none() && func.r#type != FunctionType::TSEmptyBodyFunctionExpression)
    }

    impl<'a> Visit<'a> for TsRemovalCollector<'_, '_> {
        // ---- type-only syntax: removed wherever it appears, never walked into ----

        fn visit_ts_type_annotation(&mut self, it: &TSTypeAnnotation<'a>) {
            self.remove(it.span);
        }

        fn visit_ts_type_parameter_declaration(&mut self, it: &TSTypeParameterDeclaration<'a>) {
            self.remove(it.span);
        }

        fn visit_ts_type_parameter_instantiation(&mut self, it: &TSTypeParameterInstantiation<'a>) {
            self.remove(it.span);
        }

        fn visit_ts_type_alias_declaration(&mut self, it: &TSTypeAliasDeclaration<'a>) {
            self.remove(it.span);
        }

        fn visit_ts_interface_declaration(&mut self, it: &TSInterfaceDeclaration<'a>) {
            self.remove(it.span);
        }

        fn visit_ts_external_module_declaration(&mut self, it: &TSExternalModuleDeclaration<'a>) {
            self.remove(it.span);
        }

        fn visit_ts_namespace_declaration(&mut self, it: &TSNamespaceDeclaration<'a>) {
            self.remove(it.span);
        }

        fn visit_ts_enum_declaration(&mut self, it: &TSEnumDeclaration<'a>) {
            self.remove(it.span);
        }

        // A class index signature is type-only and has no runtime form; upstream
        // leaves it in and then throws while printing it, so there is no oracle
        // to reproduce. See
        // `upstream_issues/3422-svelte-class-index-signature-crash.md`.
        fn visit_ts_index_signature(&mut self, it: &TSIndexSignature<'a>) {
            self.remove(it.span);
        }

        // Upstream passes these through verbatim, so they are left as written.
        fn visit_ts_export_assignment(&mut self, _it: &TSExportAssignment<'a>) {}
        fn visit_ts_import_equals_declaration(&mut self, _it: &TSImportEqualsDeclaration<'a>) {}
        fn visit_ts_namespace_export_declaration(
            &mut self,
            _it: &TSNamespaceExportDeclaration<'a>,
        ) {
        }

        // ---- TS expression wrappers: drop the marker, keep the operand ----

        fn visit_ts_as_expression(&mut self, it: &TSAsExpression<'a>) {
            self.remove_range(it.expression.span().end, it.span.end);
            self.visit_expression(&it.expression);
        }

        fn visit_ts_satisfies_expression(&mut self, it: &TSSatisfiesExpression<'a>) {
            self.remove_range(it.expression.span().end, it.span.end);
            self.visit_expression(&it.expression);
        }

        fn visit_ts_non_null_expression(&mut self, it: &TSNonNullExpression<'a>) {
            self.remove_range(it.expression.span().end, it.span.end);
            self.visit_expression(&it.expression);
        }

        fn visit_ts_instantiation_expression(&mut self, it: &TSInstantiationExpression<'a>) {
            self.remove_range(it.expression.span().end, it.span.end);
            self.visit_expression(&it.expression);
        }

        fn visit_ts_type_assertion(&mut self, it: &TSTypeAssertion<'a>) {
            self.remove_range(it.span.start, it.expression.span().start);
            self.visit_expression(&it.expression);
        }

        fn visit_parenthesized_expression(&mut self, it: &ParenthesizedExpression<'a>) {
            // When parens wrap a TS-only wrapper like `(X as T)` or `(X!)` whose
            // runtime value is simply `X`, the outer parens become redundant once
            // the type annotation is stripped. Collapse them together so that
            // `((expr)?.filter(x) as T[])[0]` becomes `(expr)?.filter(x)[0]`,
            // matching esrap/astring output. Only drop them when peeling the
            // wrapper exposes an expression whose precedence never required them
            // — for a unary / binary / logical / conditional operand, removing
            // the parens can silently change the meaning (e.g.
            // `(-n as number) ** 2` → `-n ** 2` is a JS syntax error).
            // (issue #457, H-125)
            let inner = &it.expression;
            let is_ts_wrapper = matches!(
                inner,
                Expression::TSAsExpression(_)
                    | Expression::TSSatisfiesExpression(_)
                    | Expression::TSNonNullExpression(_)
                    | Expression::TSTypeAssertion(_)
                    | Expression::TSInstantiationExpression(_)
            );
            if is_ts_wrapper && is_paren_safe_to_drop(peel_ts_wrappers(inner)) {
                self.remove_range(it.span.start, inner.span().start);
                self.remove_range(inner.span().end, it.span.end);
            }
            self.visit_expression(inner);
        }

        // ---- declarations carrying TS-only modifiers ----

        fn visit_function(&mut self, it: &Function<'a>, flags: ScopeFlags) {
            if is_ambient_function(it) {
                self.remove(it.span);
                return;
            }
            // `this: T` is a whole parameter, so the following comma goes too.
            if let Some(this_param) = &it.this_param {
                let end = match it.params.items.first() {
                    Some(first) => first.span.start,
                    None => this_param.span.end,
                };
                self.remove_range(this_param.span.start, end);
            }
            walk::walk_function(self, it, flags);
        }

        fn visit_formal_parameter(&mut self, it: &FormalParameter<'a>) {
            if it.optional {
                let pattern_end = it.pattern.span().end;
                if (pattern_end as usize) < self.source.len()
                    && self.source.as_bytes()[pattern_end as usize] == b'?'
                {
                    self.remove_range(pattern_end, pattern_end + 1);
                }
            }
            walk::walk_formal_parameter(self, it);
        }

        fn visit_variable_declaration(&mut self, it: &VariableDeclaration<'a>) {
            if it.declare {
                self.remove(it.span);
                return;
            }
            walk::walk_variable_declaration(self, it);
        }

        fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
            if it.definite
                && let Some(type_ann) = &it.type_annotation
            {
                collect_definite_marker_removal(type_ann.span.start, self.source, self.removals);
            }
            walk::walk_variable_declarator(self, it);
        }

        fn visit_class(&mut self, it: &Class<'a>) {
            if it.declare {
                self.remove(it.span);
                return;
            }
            self.remove_class_modifiers(it);
            walk::walk_class(self, it);
        }

        fn visit_method_definition(&mut self, it: &MethodDefinition<'a>) {
            if it.r#type == MethodDefinitionType::TSAbstractMethodDefinition {
                self.remove(it.span);
                return;
            }
            let key_span = it.key.span();
            let modifiers = Span::new(it.span.start, key_span.start);
            if let Some(accessibility) = &it.accessibility {
                remove_keyword_from_source(
                    accessibility_keyword(accessibility),
                    modifiers,
                    self.source,
                    self.removals,
                );
            }
            if it.r#override {
                remove_keyword_from_source("override", modifiers, self.source, self.removals);
            }
            if it.optional {
                collect_optional_marker_removal(key_span.end, self.source, self.removals);
            }
            walk::walk_method_definition(self, it);
        }

        fn visit_property_definition(&mut self, it: &PropertyDefinition<'a>) {
            if it.declare || it.r#type == PropertyDefinitionType::TSAbstractPropertyDefinition {
                self.remove(it.span);
                return;
            }
            if it.definite
                && let Some(type_ann) = &it.type_annotation
            {
                collect_definite_marker_removal(type_ann.span.start, self.source, self.removals);
            }
            let key_span = it.key.span();
            let modifiers = Span::new(it.span.start, key_span.start);
            if let Some(accessibility) = &it.accessibility {
                remove_keyword_from_source(
                    accessibility_keyword(accessibility),
                    modifiers,
                    self.source,
                    self.removals,
                );
            }
            if it.readonly {
                remove_keyword_from_source("readonly", modifiers, self.source, self.removals);
            }
            if it.r#override {
                remove_keyword_from_source("override", modifiers, self.source, self.removals);
            }
            if it.optional {
                collect_optional_marker_removal(key_span.end, self.source, self.removals);
            }
            walk::walk_property_definition(self, it);
        }

        // ---- module declarations: type-only specifiers need comma repair ----

        fn visit_import_declaration(&mut self, it: &ImportDeclaration<'a>) {
            if it.import_kind == ImportOrExportKind::Type {
                self.remove(it.span);
                return;
            }
            let Some(specifiers) = &it.specifiers else {
                return;
            };
            let type_specs: Vec<_> = specifiers
                .iter()
                .filter(|s| {
                    matches!(s, ImportDeclarationSpecifier::ImportSpecifier(spec)
                        if spec.import_kind == ImportOrExportKind::Type)
                })
                .collect();
            if type_specs.is_empty() {
                return;
            }
            if type_specs.len() == specifiers.len() {
                self.remove(it.span);
                return;
            }
            // A default or namespace specifier may survive, so the `{ … }` block
            // is only collapsible when every *named* specifier is type-only.
            let named_specs: Vec<_> = specifiers
                .iter()
                .filter(|s| matches!(s, ImportDeclarationSpecifier::ImportSpecifier(_)))
                .collect();
            let all_named_are_type = !named_specs.is_empty()
                && named_specs.iter().all(|s| {
                    matches!(s, ImportDeclarationSpecifier::ImportSpecifier(spec)
                        if spec.import_kind == ImportOrExportKind::Type)
                });
            if all_named_are_type {
                let first_span = named_specs.first().unwrap().span();
                let last_span = named_specs.last().unwrap().span();
                let before = &self.source[..first_span.start as usize];
                if let Some(brace_pos) = before.rfind('{') {
                    let after = &self.source[last_span.end as usize..];
                    if let Some(close_offset) = after.find('}') {
                        let close_pos = last_span.end as usize + close_offset + 1;
                        let before_brace = &self.source[..brace_pos];
                        let comma_start = before_brace.rfind(',').unwrap_or(brace_pos);
                        self.remove_range(comma_start as u32, close_pos as u32);
                    }
                }
            } else {
                for spec in type_specs {
                    remove_specifier_with_comma(spec.span(), self.source, self.removals);
                }
            }
        }

        fn visit_export_declaration(&mut self, it: &ExportDeclaration<'a>) {
            // oxc derives this from the declaration instead of storing it.
            if it.export_kind() == ImportOrExportKind::Type {
                self.remove(it.span);
                return;
            }
            // An ambient / type-only declaration takes the `export` keyword
            // with it, so the statement is removed rather than the child.
            let drop_statement = match &it.declaration {
                Declaration::FunctionDeclaration(func) => is_ambient_function(func),
                Declaration::ClassDeclaration(class) => class.declare,
                Declaration::VariableDeclaration(var_decl) => var_decl.declare,
                Declaration::TSTypeAliasDeclaration(_)
                | Declaration::TSInterfaceDeclaration(_)
                | Declaration::TSEnumDeclaration(_)
                | Declaration::TSExternalModuleDeclaration(_)
                | Declaration::TSNamespaceDeclaration(_) => true,
                _ => false,
            };
            if drop_statement {
                self.remove(it.span);
                return;
            }
            self.visit_declaration(&it.declaration);
        }

        fn visit_export_from_declaration(&mut self, it: &ExportFromDeclaration<'a>) {
            if it.export_kind == ImportOrExportKind::Type {
                self.remove(it.span);
                return;
            }
            let type_specs: Vec<_> = it
                .specifiers
                .iter()
                .filter(|s| s.export_kind == ImportOrExportKind::Type)
                .collect();
            if type_specs.is_empty() {
                return;
            }
            if type_specs.len() == it.specifiers.len() {
                self.remove(it.span);
            } else {
                for spec in type_specs {
                    remove_specifier_with_comma(spec.span, self.source, self.removals);
                }
            }
        }

        fn visit_export_named_declaration(&mut self, it: &ExportNamedDeclaration<'a>) {
            if it.export_kind == ImportOrExportKind::Type {
                self.remove(it.span);
                return;
            }
            let type_specs: Vec<_> = it
                .specifiers
                .iter()
                .filter(|s| s.export_kind == ImportOrExportKind::Type)
                .collect();
            if type_specs.is_empty() {
                return;
            }
            if type_specs.len() == it.specifiers.len() {
                self.remove(it.span);
            } else {
                for spec in type_specs {
                    remove_specifier_with_comma(spec.span, self.source, self.removals);
                }
            }
        }

        fn visit_export_default_declaration(&mut self, it: &ExportDefaultDeclaration<'a>) {
            let drop_statement = match &it.declaration {
                ExportDefaultDeclarationKind::TSInterfaceDeclaration(_) => true,
                ExportDefaultDeclarationKind::FunctionDeclaration(func) => {
                    is_ambient_function(func)
                }
                ExportDefaultDeclarationKind::ClassDeclaration(class) => class.declare,
                _ => false,
            };
            if drop_statement {
                self.remove(it.span);
                return;
            }
            walk::walk_export_default_declaration(self, it);
        }

        fn visit_export_all_declaration(&mut self, it: &ExportAllDeclaration<'a>) {
            if it.export_kind == ImportOrExportKind::Type {
                self.remove(it.span);
            }
        }
    }
}

fn accessibility_keyword(accessibility: &oxc_ast::ast::TSAccessibility) -> &'static str {
    match accessibility {
        oxc_ast::ast::TSAccessibility::Public => "public",
        oxc_ast::ast::TSAccessibility::Private => "private",
        oxc_ast::ast::TSAccessibility::Protected => "protected",
    }
}

/// Remove the TS optional marker `?` that follows a class member's key
/// (`x?: T`, `m?(): void`). Only whitespace and a computed key's closing `]` may
/// sit between the key and the marker, so a `?` elsewhere in the member (inside
/// a string value, say) can never match.
fn collect_optional_marker_removal(key_end: u32, source: &str, removals: &mut Vec<(u32, u32)>) {
    let bytes = source.as_bytes();
    let mut pos = key_end as usize;
    let mut start = pos;
    let mut seen_bracket = false;
    while pos < bytes.len() {
        match bytes[pos] {
            b'?' => {
                removals.push((start as u32, pos as u32 + 1));
                return;
            }
            b']' if !seen_bracket => {
                seen_bracket = true;
                pos += 1;
                start = pos;
            }
            b if b.is_ascii_whitespace() => pos += 1,
            _ => return,
        }
    }
}

/// Remove a keyword and trailing space from a source span.
fn remove_keyword_from_source(
    keyword: &str,
    parent_span: oxc_span::Span,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    if source.is_empty() {
        return;
    }
    let region = &source[parent_span.start as usize..parent_span.end as usize];
    if let Some(pos) = region.find(keyword) {
        let abs_start = parent_span.start + pos as u32;
        let abs_end = abs_start + keyword.len() as u32;
        let space_end =
            if (abs_end as usize) < source.len() && source.as_bytes()[abs_end as usize] == b' ' {
                abs_end + 1
            } else {
                abs_end
            };
        removals.push((abs_start, space_end));
    }
}

/// Peel any `TSAsExpression` / `TSSatisfiesExpression` / `TSNonNullExpression`
/// / `TSTypeAssertion` / `TSInstantiationExpression` layers and return the
/// underlying expression. Used by the parenthesis-stripping path to decide
/// whether the parens around a TS wrapper are safe to drop. (issue #457, H-125)
fn peel_ts_wrappers<'a>(
    mut expr: &'a oxc_ast::ast::Expression<'a>,
) -> &'a oxc_ast::ast::Expression<'a> {
    use oxc_ast::ast::Expression as E;
    loop {
        match expr {
            E::TSAsExpression(inner) => expr = &inner.expression,
            E::TSSatisfiesExpression(inner) => expr = &inner.expression,
            E::TSNonNullExpression(inner) => expr = &inner.expression,
            E::TSTypeAssertion(inner) => expr = &inner.expression,
            E::TSInstantiationExpression(inner) => expr = &inner.expression,
            _ => return expr,
        }
    }
}

/// `true` when `expr` is a "simple" expression form whose precedence is high
/// enough that wrapping parens never matter — bare identifiers, literals,
/// member / call / `new` expressions, parenthesised sub-expressions, etc.
/// Returns `false` for unary / binary / logical / conditional / assignment /
/// arrow / sequence expressions, where dropping the parens can silently change
/// what the surrounding code means (e.g. `-n ** 2` is a JS syntax error,
/// `a + b * c` reassociates a `+`). (issue #457, H-125)
///
/// `ObjectExpression` / `FunctionExpression` / `ClassExpression` are also NOT
/// safe: at the start of an expression statement or as an arrow-function body,
/// `(obj as T)` → `obj` reparses as a block statement, and `(function(){} as T)`
/// → a function declaration — e.g. `() => ({ a } as T)` must stay
/// `() => ({ a })`, not become `() => { a }`. esrap re-adds these parens when it
/// prints from the AST; the text-splice path here has no parent context, so it
/// keeps the parens (redundant ones are absorbed by downstream normalization).
fn is_paren_safe_to_drop(expr: &oxc_ast::ast::Expression) -> bool {
    use oxc_ast::ast::Expression as E;
    matches!(
        expr,
        E::Identifier(_)
            | E::BooleanLiteral(_)
            | E::NullLiteral(_)
            | E::NumericLiteral(_)
            | E::StringLiteral(_)
            | E::BigIntLiteral(_)
            | E::RegExpLiteral(_)
            | E::TemplateLiteral(_)
            | E::TaggedTemplateExpression(_)
            | E::ThisExpression(_)
            | E::Super(_)
            | E::ArrayExpression(_)
            | E::ParenthesizedExpression(_)
            | E::CallExpression(_)
            | E::NewExpression(_)
            | E::ChainExpression(_)
            | E::ComputedMemberExpression(_)
            | E::StaticMemberExpression(_)
            | E::PrivateFieldExpression(_)
            | E::ImportMeta(_)
            | E::NewTarget(_)
            | E::ImportExpression(_)
    )
}

/// Extend a type-annotation removal backwards over a definite-assignment `!`
/// (`let x!: T`, `class A { x!: T }`). The official compiler deletes the
/// `definite` flag from the AST, so the marker must not survive into the JS.
///
/// `type_ann_start` is the start of the annotation removal, so the pushed range
/// is contiguous with it and merges into a single splice.
fn collect_definite_marker_removal(
    type_ann_start: u32,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    let bytes = source.as_bytes();
    let mut bang = type_ann_start as usize;
    while bang > 0 && bytes[bang - 1].is_ascii_whitespace() {
        bang -= 1;
    }
    if bang == 0 || bytes[bang - 1] != b'!' {
        return;
    }
    let mut start = bang - 1;
    while start > 0 && bytes[start - 1].is_ascii_whitespace() {
        start -= 1;
    }
    removals.push((start as u32, type_ann_start));
}

/// Remove a specifier from its surrounding context, including the comma.
fn remove_specifier_with_comma(span: oxc_span::Span, source: &str, removals: &mut Vec<(u32, u32)>) {
    let mut start = span.start;
    let mut end = span.end;

    // Try to remove trailing comma and whitespace
    if (end as usize) < source.len() {
        let after = &source[end as usize..];
        let trimmed = after.trim_start();
        if trimmed.starts_with(',') {
            end = (source.len() - trimmed.len() + 1) as u32;
            if (end as usize) < source.len() {
                let after_comma = &source[end as usize..];
                let trimmed2 = after_comma.trim_start_matches(' ');
                end = (source.len() - trimmed2.len()) as u32;
            }
        } else if start > 0 {
            // Try to remove leading comma and whitespace
            let before = &source[..start as usize];
            let trimmed = before.trim_end();
            if trimmed.ends_with(',') {
                start = (trimmed.len() - 1) as u32;
            }
        }
    }

    removals.push((start, end));
}

/// Analysis result for a Svelte component.
#[derive(Debug)]
pub struct ComponentAnalysis {
    /// The root scope containing all bindings
    pub root: ScopeRoot,

    /// Analysis of the module script (`<script context="module">`)
    pub module: Option<JsAnalysis>,

    /// Analysis of the instance script (`<script>`)
    pub instance: Option<JsAnalysis>,

    /// Analysis of the template
    pub template: TemplateAnalysis,

    /// CSS analysis
    pub css: CssAnalysis,

    /// Component name (derived from filename)
    pub name: String,

    /// Upstream's `state.filename`: slash-normalized and made `rootDir`-relative,
    /// used verbatim in dev-mode source locations.
    pub filename: String,

    /// `state.js`'s `filename`: the compile option made relative to `rootDir`, used
    /// verbatim in dev location strings (the basename above would truncate them).
    pub location_filename: String,

    /// Whether the component uses runes
    pub runes: bool,

    /// Whether the runes option was explicitly set (Some(true/false)) vs auto-detected (None).
    /// When explicitly set to false, auto-detection should not override it.
    pub runes_explicitly_set: Option<bool>,

    /// Whether experimental.async is enabled
    pub experimental_async: bool,

    /// Whether the component has top-level await in script or template
    /// (requires async function wrapper when experimental.async is enabled)
    pub has_await: bool,

    /// Whether the component might use runes
    pub maybe_runes: bool,

    /// Pre-computed result of `instance_has_legacy_patterns(ast)` — set
    /// during analyze BEFORE template visitors run so visitors like
    /// `DeclarationTag` (Svelte 5.56.0 #18282) can make a maybe_runes
    /// decision without waiting for the post-walk reconciliation.
    pub instance_has_legacy_patterns: bool,

    /// First unresolved `$$props` / `$$restProps` reference, in upstream's
    /// module-then-instance-then-template order. Recorded while scanning for
    /// store subscriptions, but reported only once runes mode has settled.
    pub legacy_props_ref: Option<(u32, u32)>,
    pub legacy_rest_props_ref: Option<(u32, u32)>,

    /// Whether the component uses $$props
    pub uses_props: bool,

    /// Whether the component uses $$restProps
    pub uses_rest_props: bool,

    /// Whether the component uses $$slots
    pub uses_slots: bool,

    /// Whether the component uses render tags (@render)
    pub uses_render_tags: bool,

    /// Whether the component uses component bindings
    pub uses_component_bindings: bool,

    /// Whether the component uses event attributes (on:event={handler})
    pub uses_event_attributes: bool,

    /// Start offsets of the arrow functions whose *direct* assignment body is
    /// exempt from the dev `$.assign` wrap. Upstream decides this by node
    /// identity over the visitor path, so an arrow nested inside an exempt one
    /// never qualifies. A syntactic fact about the template, recorded here
    /// because this is where the elements are already walked.
    pub assign_exempt_arrow_starts: rustc_hash::FxHashSet<u32>,

    /// Start offsets of the assignments that are themselves the expression of a
    /// component attribute or a `bind:` directive (upstream's `path.at(-1)`
    /// arm of the same predicate).
    pub assign_exempt_assignment_starts: rustc_hash::FxHashSet<u32>,

    /// The first on: directive node encountered (for error reporting about mixed syntax)
    pub event_directive_node: Option<EventDirectiveInfo>,

    /// Whether the component needs context
    pub needs_context: bool,

    /// Whether the component needs props validation
    pub needs_props: bool,

    /// Whether the component needs mutation validation (for reactive state tracking)
    pub needs_mutation_validation: bool,

    /// Exported names and their aliases
    pub exports: Vec<Export>,

    /// Custom element configuration
    pub custom_element: Option<CustomElementConfig>,

    /// Whether styles should be injected via JavaScript
    pub inject_styles: bool,

    /// The original source code
    pub source: String,

    /// Pre-extracted instance script content (to avoid re-parsing in Phase 3)
    pub instance_script_content: Option<ScriptContent>,

    /// Pre-extracted module script content (to avoid re-parsing in Phase 3)
    pub module_script_content: Option<ScriptContent>,

    /// $derived expressions that contain await (async deriveds)
    /// These need special handling during code generation
    pub async_deriveds: FxHashSet<String>,

    /// The identifier used for $props.id() (if any)
    /// Used to track the props ID declaration
    pub props_id: Option<String>,

    /// Hash of the filename (used for svelte:head hydration validation)
    /// This is always computed from the filename, regardless of CSS presence
    pub filename_hash: String,

    /// Whether the component uses $inspect.trace()
    pub tracing: bool,

    /// Whether dev mode is enabled (needed for $inspect.trace handling)
    pub dev: bool,

    /// Reactive statements ($: statements) in legacy mode
    /// Maps from the labeled statement node (JSON string) to its analysis
    pub reactive_statements: FxHashMap<String, ReactiveStatement>,

    /// Ordered legacy `$:` dependency identifier names, one entry per top-level
    /// reactive statement in source order. Mirrors the dependency set built by
    /// `2-analyze/visitors/LabeledStatement.js` (order = first-appearance during
    /// AST traversal; membership = a reference not solely on an assignment LHS;
    /// member-property keys are never references). Consumed by the Phase-3 client
    /// `transform_reactive_statement` to emit the deps thunk instead of scanning
    /// the statement text.
    pub reactive_statement_dependencies: Vec<Vec<String>>,

    /// Typed top-level legacy `$:` statements in source order.
    pub legacy_reactive_statements: Vec<LegacyReactiveStatement>,

    /// Whether the component is immutable (no reactivity)
    pub immutable: bool,

    /// Whether the component uses accessors mode
    pub accessors: bool,

    /// Await expressions needing context preservation (pickled awaits).
    /// Stores the start position of each await expression that needs $.save() wrapping.
    pub pickled_awaits: FxHashSet<u32>,

    /// Identifiers that make up bind:group expressions -> internal group binding name
    /// Maps from (key, bindings) to the generated identifier
    pub binding_groups: FxHashMap<String, String>,

    /// Slot names mapped to their `<slot>` element's span
    pub slot_names: indexmap::IndexMap<String, (u32, u32), rustc_hash::FxBuildHasher>,

    /// Every render tag/component and whether it could be definitively resolved
    pub snippet_renderers: FxHashMap<String, bool>,

    /// Pre-transformed `<script>` instance body (for optimization)
    pub instance_body: InstanceBody,

    /// JS comments from the AST (for preservation)
    pub comments: Vec<String>,

    /// Warnings generated during analysis
    pub warnings: Vec<super::warnings::AnalysisWarning>,

    /// Whether the component namespace (from compile options or <svelte:options>) is SVG.
    /// Used by SvelteElement analysis to determine default namespace context.
    pub component_namespace_is_svg: bool,

    /// Whether the component namespace (from compile options or <svelte:options>) is MathML.
    /// Used by SvelteElement analysis to determine default namespace context.
    pub component_namespace_is_mathml: bool,

    /// Whether any script in the component uses TypeScript (lang="ts" or lang="typescript").
    /// Set during `extract_scripts()` and used during scope building to parse template
    /// expressions as TypeScript.
    pub is_typescript: bool,

    /// Module scope declarations - maps names to binding indices.
    /// Used to detect conflicts between instance-level declarations and module imports.
    /// Populated during module script analysis.
    pub module_scope_declarations: FxHashMap<String, usize>,

    /// Whether this is a .svelte.js module file compilation (as opposed to a .svelte component).
    /// In module files, ast_type is null/undefined in the official compiler, meaning
    /// certain validations (like ExportDefaultDeclaration) behave differently.
    pub is_module_file: bool,
}

impl ComponentAnalysis {
    /// Create a new component analysis.
    pub fn new(source: &str, options: &CompileOptions) -> Self {
        // The explicit `name` option wins; otherwise derive from the filename
        // (H-088). Previously `options.name` was accepted but ignored.
        let name = options
            .name
            .clone()
            .or_else(|| options.filename.as_ref().map(|f| derive_component_name(f)))
            .unwrap_or_else(|| "Component".to_string());

        // If runes is explicitly set in options, use that; otherwise default to false
        // and let the analysis phase detect runes from source
        let initial_runes = options.runes.unwrap_or(false);

        // Compute filename hash for svelte:head hydration validation
        // This is always based on the filename (or "main.svelte" if not specified)
        // Make filename relative to rootDir before hashing (matching Svelte's adjust() in state.js)
        let filename_hash_source = options
            .filename
            .as_ref()
            .filter(|f| *f != "(unknown)")
            .map(|f| normalize_filename(f, options.root_dir.as_deref()))
            .unwrap_or_else(|| "main.svelte".to_string());
        let filename_hash = crate::compiler::phases::phase3_transform::css::generate_raw_hash(
            &filename_hash_source,
        );

        Self {
            root: ScopeRoot::new(),
            module: None,
            instance: None,
            template: TemplateAnalysis::default(),
            css: CssAnalysis::default(),
            name,
            filename: options
                .filename
                .as_ref()
                .map(|f| normalize_filename(f, options.root_dir.as_deref()))
                .unwrap_or_else(|| "Component".to_string()),
            location_filename: {
                let fname = options
                    .filename
                    .as_deref()
                    .unwrap_or("(unknown)")
                    .replace('\\', "/");
                match options.root_dir.as_deref() {
                    Some(root_dir) if fname.starts_with(&root_dir.replace('\\', "/")) => {
                        fname[root_dir.len()..].trim_start_matches('/').to_string()
                    }
                    _ => fname,
                }
            },
            runes: initial_runes,
            runes_explicitly_set: options.runes,
            experimental_async: options.experimental.r#async,
            has_await: false,
            maybe_runes: false,
            instance_has_legacy_patterns: false,
            legacy_props_ref: None,
            legacy_rest_props_ref: None,
            uses_props: false,
            uses_rest_props: false,
            uses_slots: false,
            uses_render_tags: false,
            uses_component_bindings: false,
            uses_event_attributes: false,
            assign_exempt_arrow_starts: rustc_hash::FxHashSet::default(),
            assign_exempt_assignment_starts: rustc_hash::FxHashSet::default(),
            event_directive_node: None,
            needs_context: false,
            needs_props: false,
            needs_mutation_validation: false,
            exports: Vec::new(),
            custom_element: None,
            inject_styles: options.css == crate::compiler::CssMode::Injected,
            source: source.to_string(),
            instance_script_content: None,
            module_script_content: None,
            async_deriveds: FxHashSet::default(),
            props_id: None,
            filename_hash,
            tracing: false,
            dev: options.dev,
            reactive_statements: FxHashMap::default(),
            reactive_statement_dependencies: Vec::new(),
            legacy_reactive_statements: Vec::new(),
            immutable: options.immutable,
            accessors: options.accessors,
            pickled_awaits: FxHashSet::default(),
            binding_groups: FxHashMap::default(),
            slot_names: indexmap::IndexMap::default(),
            snippet_renderers: FxHashMap::default(),
            instance_body: InstanceBody::default(),
            comments: Vec::new(),
            warnings: Vec::new(),
            component_namespace_is_svg: options.namespace == crate::compiler::Namespace::Svg,
            component_namespace_is_mathml: options.namespace == crate::compiler::Namespace::Mathml,
            is_typescript: false,
            module_scope_declarations: FxHashMap::default(),
            is_module_file: options.is_module_source
                || options
                    .filename
                    .as_ref()
                    .map(|f| f.ends_with(".svelte.js") || f.ends_with(".svelte.ts"))
                    .unwrap_or(false),
        }
    }

    /// Extract and store script content from the AST.
    /// This should be called during Phase 2 to pre-extract scripts for Phase 3.
    pub(crate) fn extract_scripts(
        &mut self,
        ast: &Root,
        source: &str,
        retained_scripts: Option<&crate::ast::oxc_program::RetainedScripts<'_>>,
    ) {
        // Check if any script in the component uses TypeScript.
        // In Svelte, if the module script has lang="ts", the instance script
        // is also treated as TypeScript (even without its own lang attribute).
        let any_script_is_typescript =
            Self::script_is_typescript_attr(ast.module.as_ref().map(|s| s.as_ref()))
                || Self::script_is_typescript_attr(ast.instance.as_ref().map(|s| s.as_ref()));

        // Store the TypeScript flag for later use (e.g., scope building)
        self.is_typescript = any_script_is_typescript;

        // Extract instance script content
        if let Some(ref script) = ast.instance {
            let mut content = ScriptContent::from_script_with_ts(
                script,
                source,
                any_script_is_typescript,
                retained_scripts.and_then(|scripts| scripts.instance.as_ref()),
            );
            // `uses_runes` is a lexical guess; re-verify a positive with a
            // shadow-aware AST walk so rune names that only occur where they
            // are shadowed by `$`-prefixed function parameters (e.g.
            // `function bar($derived, $effect) { $derived(...) }`) or that
            // are store subscriptions of imported names don't flip runes mode
            // on. Upstream detects runes from `module.scope.references`,
            // which such references never reach. Only clear the flag (the
            // walk recognises a superset of the lexically-scanned runes).
            if content.uses_runes
                && !matches!(script.content, crate::ast::js::Expression::Lazy { .. })
            {
                let imported = extract_imported_names(&content.raw);
                // Also include locally-declared names whose initialiser is not a rune
                // call (e.g. `const state = 42`).  Upstream resolves `$state` to the
                // `state` binding in that case, so it never reaches `module.scope
                // .references` and does not flip runes mode on.
                let local_non_rune = extract_local_non_rune_declared_names(&content.raw);
                let dollar_names: Vec<String> = imported
                    .iter()
                    .chain(local_non_rune.iter())
                    .map(|n| format!("${n}"))
                    .collect();
                let subs: rustc_hash::FxHashSet<&str> =
                    dollar_names.iter().map(|s| s.as_str()).collect();
                let r = super::expression_check_features(&script.content, &ast.arena, &subs);
                if !r.has_rune_reference {
                    content.uses_runes = false;
                }
            }
            // Only auto-detect runes from script content if runes wasn't explicitly set.
            // When options.runes is Some(false), we must respect that and not override.
            if content.uses_runes && self.runes_explicitly_set.is_none() {
                self.runes = true;
            }
            self.instance_script_content = Some(content);
        }

        // Extract module script content
        if let Some(ref script) = ast.module {
            let content = ScriptContent::from_script_with_ts(
                script,
                source,
                any_script_is_typescript,
                retained_scripts.and_then(|scripts| scripts.module.as_ref()),
            );
            self.module_script_content = Some(content);
        }
    }

    /// Check if a script node has `lang="ts"` or `lang="typescript"` attribute.
    fn script_is_typescript_attr(script: Option<&Script>) -> bool {
        script
            .map(|s| {
                s.attributes.iter().any(|attr| {
                    if attr.name == "lang"
                        && let crate::ast::template::AttributeValue::Sequence(parts) = &attr.value
                        && let Some(crate::ast::template::AttributeValuePart::Text(text)) =
                            parts.first()
                    {
                        return text.data == "ts" || text.data == "typescript";
                    }
                    false
                })
            })
            .unwrap_or(false)
    }

    /// Create scopes for the component.
    pub fn create_scopes(
        &mut self,
        ast: &Root,
        arena: &crate::ast::arena::ParseArena,
    ) -> Result<(), super::AnalysisError> {
        // Build scope tree using ScopeBuilder
        // Pass is_typescript so template expressions are parsed as TypeScript when needed
        let (scope_root, validation_errors) = super::scope_builder::build_scopes(
            ast,
            &self.source,
            self.runes,
            self.runes_explicitly_set == Some(false),
            self.is_typescript,
            arena,
        );
        self.root = scope_root;

        // Return first validation error if any occurred during scope building
        // (e.g., invalid $ prefix on variable names)
        if let Some(err) = validation_errors.into_iter().next() {
            return Err(err);
        }

        // Update runes flag based on bindings, but only if runes wasn't explicitly set.
        // When options.runes is Some(false), we must respect that.
        if self.runes_explicitly_set.is_none() {
            for binding in &self.root.bindings {
                if binding.kind.is_rune() {
                    self.runes = true;
                    break;
                }
            }
        }

        // In runes mode, immutable is always true
        // This matches the official Svelte compiler: immutable: runes || options.immutable
        if self.runes {
            self.immutable = true;
        }

        Ok(())
    }

    /// Analyze CSS in the component.
    pub fn analyze_css(
        &mut self,
        css: &crate::ast::css::StyleSheet,
        options: &CompileOptions,
    ) -> Result<(), super::AnalysisError> {
        self.css.has_css = true;

        // Generate the CSS hash
        // Svelte uses the filename if available, otherwise the CSS content
        let hash_source = if let Some(ref filename) = options.filename {
            if filename == "(unknown)" {
                css.content.styles.clone()
            } else {
                // Make filename relative to rootDir before hashing,
                // matching Svelte's adjust() in state.js
                let mut fname = filename.replace('\\', "/");
                if let Some(ref root_dir) = options.root_dir {
                    let rd = root_dir.replace('\\', "/");
                    if fname.starts_with(&rd) {
                        fname = fname[rd.len()..].trim_start_matches('/').to_string();
                    }
                }
                fname
            }
        } else {
            css.content.styles.clone()
        };

        self.css.hash = if let Some(ref css_hash_fn) = options.css_hash {
            // Use custom cssHash function
            let component_name = options
                .filename
                .as_deref()
                .map(|f| {
                    let parts: Vec<&str> = f.split(['/', '\\']).collect();
                    let basename = parts.last().unwrap_or(&"Component");
                    basename
                        .strip_suffix(".svelte")
                        .unwrap_or(basename)
                        .to_string()
                })
                .unwrap_or_else(|| "Component".to_string());
            let filename = options
                .filename
                .clone()
                .unwrap_or_else(|| "(unknown)".to_string());
            let input = crate::compiler::CssHashInput {
                name: component_name,
                filename,
                css: css.content.styles.clone(),
                // Matches upstream's default `cssHash` (`svelte-${hash(...)}`):
                // the `hash` handed to the callback is the raw digest, unprefixed.
                hash: std::sync::Arc::new(|s: &str| {
                    crate::compiler::phases::phase3_transform::css::generate_raw_hash(s)
                }),
            };
            css_hash_fn(&input)
        } else {
            crate::compiler::phases::phase3_transform::css::generate_css_hash(&hash_source)
        };

        // TODO: Analyze for keyframes and :global selectors
        Ok(())
    }
}

/// Slash-normalize a filename and make it `root_dir`-relative.
/// Matches `reset()` + `adjust()` in `compiler/state.js`.
fn normalize_filename(filename: &str, root_dir: Option<&str>) -> String {
    // Only allocate when backslashes are actually present.
    let fname_owned;
    let fname: &str = if filename.contains('\\') {
        fname_owned = filename.replace('\\', "/");
        &fname_owned
    } else {
        filename
    };
    if let Some(root_dir) = root_dir {
        let rd_owned;
        let rd: &str = if root_dir.contains('\\') {
            rd_owned = root_dir.replace('\\', "/");
            &rd_owned
        } else {
            root_dir
        };
        if let Some(stripped) = fname.strip_prefix(rd) {
            return stripped.trim_start_matches('/').to_string();
        }
    }
    fname.to_string()
}

/// Derive component name from filename.
/// Matches Svelte's get_component_name() in phases/2-analyze/index.js
fn derive_component_name(filename: &str) -> String {
    // Find basename and parent dir without allocating a Vec
    let basename = filename.rsplit(['/', '\\']).next().unwrap_or("Component");
    let last_dir = {
        let without_basename = &filename[..filename.len() - basename.len()];
        let without_sep = without_basename.trim_end_matches(['/', '\\']);
        if without_sep.is_empty() {
            None
        } else {
            without_sep.rsplit(['/', '\\']).next()
        }
    };

    // Remove .svelte extension
    let mut name = basename.replace(".svelte", "");

    // If name is "index" and there's a parent dir (not "src"), use the parent dir name
    if name == "index"
        && let Some(dir) = last_dir
        && dir != "src"
        && !dir.is_empty()
    {
        name = dir.to_string();
    }

    let stem = if name.is_empty() { "Component" } else { &name };

    // Match official Svelte: name[0].toUpperCase() + name.slice(1)
    // Then sanitize to a valid JS identifier (scope.generate equivalent)
    let mut chars = stem.chars();
    let mut result = String::new();
    if let Some(first) = chars.next() {
        // Uppercase the first character
        result.extend(first.to_uppercase());
        result.push_str(chars.as_str());
    }

    if result.is_empty() {
        return "Component".to_string();
    }

    // Sanitize: replace characters that are not valid in JS identifiers with '_'
    // A valid JS identifier starts with [a-zA-Z_$] and continues with [a-zA-Z0-9_$]
    let sanitized: String = result
        .chars()
        .enumerate()
        .map(|(i, c)| {
            if i == 0 {
                if c.is_ascii_alphabetic() || c == '_' || c == '$' {
                    c
                } else {
                    '_'
                }
            } else if c.is_ascii_alphanumeric() || c == '_' || c == '$' {
                c
            } else {
                '_'
            }
        })
        .collect();

    sanitized
}

/// Analysis of a JavaScript block.
#[derive(Debug, Default)]
pub struct JsAnalysis {
    /// The scope for this JS block
    pub scope: Scope,

    /// Scopes for nested blocks
    pub scopes: FxHashMap<usize, Scope>,

    /// Whether this block contains await expressions
    pub has_await: bool,
}

/// Analysis of the template.
#[derive(Debug, Default)]
pub struct TemplateAnalysis {
    /// The scope for the template
    pub scope: Scope,

    /// Scopes for nested template blocks
    pub scopes: FxHashMap<usize, Scope>,

    /// All DOM elements in the template
    pub elements: Vec<ElementInfo>,

    /// All components used in the template
    pub components: Vec<ComponentInfo>,

    /// All snippets declared in the template
    pub snippets: FxHashSet<String>,

    /// Snippets that can be hoisted to module scope.
    /// These are root-level snippets that only reference module-level bindings,
    /// globals, or their own parameters. Used by the `snippet_invalid_export`
    /// validation to distinguish hoisted snippets from instance-level ones.
    pub hoisted_snippets: FxHashSet<String>,
}

/// Information about a DOM element.
#[derive(Debug)]
pub struct ElementInfo {
    /// The element tag name
    pub name: String,
    /// Start position in source
    pub start: usize,
    /// End position in source
    pub end: usize,
    /// Whether this element has dynamic attributes
    pub has_dynamic_attributes: bool,
    /// Whether this element has spread attributes
    pub has_spread: bool,
}

/// Information about a component usage.
#[derive(Debug)]
pub struct ComponentInfo {
    /// The component name
    pub name: String,
    /// Start position in source
    pub start: usize,
    /// End position in source
    pub end: usize,
    /// Whether this component has bindings
    pub has_bindings: bool,
}

/// Information about an event directive (for error reporting).
#[derive(Debug, Clone)]
pub struct EventDirectiveInfo {
    /// The event name
    pub name: String,
    /// Start position in source
    pub start: u32,
    /// End position in source
    pub end: u32,
}

/// A state field in a class (using $state, $state.raw, $derived, $derived.by).
#[derive(Debug, Clone)]
pub struct StateField {
    /// The field node (PropertyDefinition or AssignmentExpression in JS)
    pub node: serde_json::Value,
}

/// CSS analysis result.
#[derive(Debug, Default)]
pub struct CssAnalysis {
    /// Whether CSS is present
    pub has_css: bool,

    /// The CSS hash for scoping
    pub hash: String,

    /// Keyframe names for scoping
    pub keyframes: Vec<String>,

    /// True if any `@keyframes` rule contains at least one step whose prelude is a
    /// percentage (e.g. `0%`, `50%`). When true, the official compiler's css-prune
    /// walker visits those `Percentage` selectors and treats them as possibly matching
    /// any element, which effectively scopes ALL elements in the component. Keyframes
    /// using only keyword steps (`from`, `to`) do NOT trigger this behavior.
    pub has_percentage_keyframe_step: bool,

    /// Whether the CSS contains :global
    pub has_global: bool,

    /// Element tag names used in the template (for unused selector detection)
    pub used_elements: FxHashSet<String>,

    /// Class names used in the template (for unused selector detection)
    pub used_classes: FxHashSet<String>,

    /// IDs used in the template (for unused selector detection)
    pub used_ids: FxHashSet<String>,

    /// Whether there are dynamic elements (svelte:element with dynamic this)
    /// If true, type selectors cannot be safely pruned
    pub has_dynamic_elements: bool,

    /// Whether there are dynamic class expressions (spreads, complex expressions)
    /// If true, class selectors cannot be safely pruned
    pub has_dynamic_classes: bool,

    /// Whether any element has a dynamically-valued `id` (`id={expr}`, the `{id}`
    /// shorthand, an interpolated `id="a{x}"`, or a spread that could set `id`).
    /// A dynamic id can resolve to any value at runtime, so when this is true no
    /// `#id` selector can be safely pruned. Mirrors `has_dynamic_classes`.
    pub has_dynamic_ids: bool,

    /// Whether the template has control flow (if/each/await/snippet) that affects sibling relationships
    /// If true, sibling combinator unused detection cannot be safely performed
    pub has_control_flow: bool,

    /// Whether the template has constructs that create opaque boundaries for
    /// sibling relationships. This includes:
    /// - Slots, render tags, snippets: Phase 2 uses separate fragment paths
    /// - Non-exhaustive await blocks: may render nothing in some states
    /// - Each blocks: elements can repeat, nest, and wrap around across iterations,
    ///   creating complex sibling relationships that Phase 2 doesn't fully model
    pub has_opaque_elements: bool,

    /// DOM structure information for selector matching
    pub dom_structure: DomStructure,

    /// Tag names that appear in CSS selectors (e.g., "div", "span", "my-element")
    /// Used for per-element scoped marking: only elements whose tag matches
    /// a CSS selector (or could match via dynamic class) get the scoped hash.
    pub selector_tag_names: FxHashSet<String>,

    /// Class names that appear in CSS selectors (e.g., "foo", "bar")
    pub selector_class_names: FxHashSet<String>,

    /// ID names that appear in CSS selectors
    pub selector_id_names: FxHashSet<String>,

    /// Whether CSS contains a universal selector (*) or pseudo-class that
    /// could match any element
    pub has_universal_selector: bool,
}

/// DOM structure information for CSS selector matching.
#[derive(Debug, Default, Clone)]
pub struct DomStructure {
    /// All elements in the template, with their relationships
    pub elements: Vec<CssDomElement>,
    pub general_siblings_linked: bool,
    /// `{@render name(...)}` call sites, keyed by snippet name. A snippet-declared
    /// element's real DOM ancestors are the union of its sites' ancestors.
    pub snippet_render_sites: FxHashMap<String, Vec<CssRenderSite>>,
}

/// A `{@render}` call site: where the snippet body is spliced into the DOM.
#[derive(Debug, Clone)]
pub struct CssRenderSite {
    /// Enclosing element index, `None` at the fragment root.
    pub parent_idx: Option<usize>,
    /// Innermost `{#snippet}` the call site itself sits in, if any.
    pub snippet_name: Option<String>,
}

/// Certainty level of sibling relationships.
/// Used for control flow analysis to determine if sibling combinators are valid.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum SiblingCertainty {
    /// Element definitely exists in the DOM (not inside control flow)
    #[default]
    Definite,
    /// Element may or may not exist (inside if/each/await block)
    Probable,
}

/// Element information for CSS selector matching (DOM tree structure).
#[derive(Debug, Clone)]
pub struct CssDomElement {
    /// Element tag name
    pub tag_name: String,
    /// Class names on this element
    pub classes: FxHashSet<String>,
    /// ID (if any)
    pub id: Option<String>,
    /// Attributes for CSS selector matching.
    /// Each entry is (name, value) where value is Some(String) for static attribute values,
    /// or None for boolean attributes (e.g., `<details open>`).
    pub static_attributes: Vec<(String, Option<String>)>,
    /// Attribute names that have dynamic values (expressions, bind directives, etc.)
    /// CSS selectors matching these attributes should not be pruned.
    pub dynamic_attribute_names: FxHashSet<String>,
    /// Whether this element has any spread attributes (which could set any attribute)
    pub has_spread: bool,
    /// Whether this element has a class directive (class:name)
    pub has_class_directive: bool,
    /// Class names contributed by `class:NAME={...}` directives.
    /// These are classes that the element may carry at runtime in addition to
    /// any static `class="..."` names, so compound selector matching (e.g. the
    /// `&.NAME` native-nesting path) must consult them as well as `classes`.
    pub class_directive_names: FxHashSet<String>,
    /// Whether this element has a style directive (style:name)
    pub has_style_directive: bool,
    /// Parent element index (in elements array), None for root
    pub parent_idx: Option<usize>,
    /// Child element indices
    pub children_idx: Vec<usize>,
    /// Whether this element is a direct child of the component root
    pub is_root_child: bool,
    /// Possible previous adjacent siblings (for + combinator)
    /// Tuple of (element_index, certainty)
    pub possible_prev_adjacent: Vec<(usize, SiblingCertainty)>,
    /// Possible next adjacent siblings (for + combinator)
    /// Tuple of (element_index, certainty)
    pub possible_next_adjacent: Vec<(usize, SiblingCertainty)>,
    /// Possible previous general siblings (for ~ combinator)
    /// Tuple of (element_index, certainty)
    pub possible_prev_general: Vec<(usize, SiblingCertainty)>,
    /// Possible next general siblings (for ~ combinator)
    /// Tuple of (element_index, certainty)
    pub possible_next_general: Vec<(usize, SiblingCertainty)>,
    /// Whether this element has content (non-empty children)
    pub has_content: bool,
    /// Whether this element contains render tags, slots, or components that can inject
    /// unknown element content. Used to be conservative in descendant selector pruning.
    pub has_opaque_content: bool,
    /// Whether this element has a dynamic tag name (svelte:element)
    /// When true, any type selector matches this element
    pub is_dynamic_tag: bool,
    /// Innermost enclosing `{#snippet}` name — its real DOM ancestors are that
    /// snippet's render sites, not its lexical `parent_idx`.
    pub snippet_name: Option<String>,
    /// Set when the sibling walk stopped at something it could not enumerate, so
    /// the four lists above are a subset of the real siblings rather than all of
    /// them. A `{#if}` / `{#each}` / `{#await}` / `{#key}` branch does not set it:
    /// an inexhaustive branch demotes a sibling to `Probable` instead.
    pub sibling_walk_incomplete: bool,
    /// Whether this element can be immediately preceded by an opaque boundary
    /// (slot, render tag, component) - used for :global(X) + Y detection
    pub prev_is_opaque_boundary: bool,
    /// Whether this element can be preceded (not necessarily immediately) by an opaque boundary
    /// (slot, render tag, component) - used for :global(X) ~ Y detection
    pub prev_has_opaque_boundary: bool,
}

/// Export information.
#[derive(Debug, Clone)]
pub struct Export {
    /// The exported name
    pub name: String,
    /// The alias (if different from name)
    pub alias: Option<String>,
}

/// Custom element configuration.
#[derive(Debug, Clone)]
pub struct CustomElementConfig {
    /// The custom element tag name
    pub tag: Option<String>,
    /// Shadow DOM mode
    pub shadow: Option<String>,
    /// Source text of a ShadowRootInit object passed as `shadow: {...}`.
    pub shadow_object_source: Option<String>,
    /// Custom element property configuration
    pub props: Option<serde_json::Value>,
    /// Source text of the `extend` option function (TypeScript-stripped when
    /// the component uses `lang="ts"`).
    pub extend: Option<String>,
}

#[cfg(test)]
mod strip_typescript_tests {
    use super::{
        STRIP_TYPESCRIPT_REPARSES, ScriptContent, ScriptProjection, strip_typescript,
        strip_typescript_from_program, strip_typescript_from_program_with_projection,
    };
    use crate::ast::js::{Expression, LazyKind};
    use crate::ast::oxc_program::RetainedProgram;
    use crate::ast::template::{Script, ScriptContext, ScriptType};

    #[test]
    fn retained_program_matches_parser_entry_point() {
        let source = r#"
import type { Widget } from './types';
interface Props { value: number }
let count: number = $state<number>(0);
const doubled = (count satisfies number) * 2;
count! += 1;
"#;
        let retained = RetainedProgram::parse(source, true);
        assert!(retained.diagnostics().is_empty());

        assert_eq!(
            strip_typescript_from_program(source, retained.program()),
            strip_typescript(source)
        );
    }

    /// OXC enforces TypeScript rules the official parser does not (here, a
    /// required parameter after an optional one). The AST is complete, so the
    /// strip must happen — leaving the annotations in emits them into the
    /// generated module.
    #[test]
    fn a_recoverable_typescript_error_does_not_stop_the_strip() {
        assert_eq!(
            strip_typescript("function g(p?: string, q: string) {}\n"),
            "function g(p, q) {}\n"
        );
    }

    /// The control for the test above. A constructor parameter property is
    /// TypeScript this stripper does not lower, so stripping this source yields
    /// text that is not JavaScript; the recovered AST must therefore not be
    /// trusted and the source must come back verbatim. Accepting every
    /// non-panicking parse without checking its result would emit
    /// `constructor(private a)` into the module.
    #[test]
    fn a_strip_that_would_not_yield_javascript_is_refused() {
        let source =
            "function g(p?: string, q: string) {}\nclass C { constructor(private a) {} }\n";
        assert_eq!(strip_typescript(source), source);
    }

    #[test]
    fn identity_strip_does_not_allocate_a_projection() {
        let source = "const answer = 42;\n";
        let retained = RetainedProgram::parse(source, true);
        let (output, projection) =
            strip_typescript_from_program_with_projection(source, retained.program());

        assert_eq!(output, source);
        assert!(projection.is_none());
    }

    #[test]
    fn script_content_stores_projection_without_reparsing_retained_program() {
        let source = "let count: number = $state<number>(0);\n";
        let script = Script {
            node_type: ScriptType::Script,
            start: 0,
            end: source.len() as u32,
            context: ScriptContext::Default,
            content: Expression::Lazy {
                start: 0,
                end: source.len() as u32,
                ts: true,
                kind: LazyKind::Lenient,
            },
            attributes: Vec::new(),
            raw_content: "",
            content_offset: 0,
            is_typescript: true,
        };
        let retained = RetainedProgram::parse(source, true);
        STRIP_TYPESCRIPT_REPARSES.with(|count| count.set(0));

        let content = ScriptContent::from_script_with_ts(&script, source, true, Some(&retained));

        assert_eq!(content.raw, "let count = $state(0);\n");
        assert!(content.source_projection.is_some());
        STRIP_TYPESCRIPT_REPARSES.with(|count| assert_eq!(count.get(), 0));
    }

    #[test]
    fn projection_tracks_copied_chunks_and_typescript_omissions() {
        let source = "let count: number = $state<number>(0);\ncount! += 1;\n";
        let retained = RetainedProgram::parse(source, true);
        let (output, projection) =
            strip_typescript_from_program_with_projection(source, retained.program());
        let projection = projection.expect("TypeScript syntax should create a projection");

        assert_eq!(output, "let count = $state(0);\ncount += 1;\n");
        assert_projection_chunks_are_exact(source, &output, &projection);
        assert_eq!(projection.source_len, source.len() as u32);
        assert_eq!(projection.output_len, output.len() as u32);

        let rune_start = source.find("$state").unwrap() as u32;
        let rune_source = rune_start..rune_start + "$state".len() as u32;
        let rune_output = projection
            .output_range_for_source(rune_source.clone())
            .expect("unchanged rune name should be mapped");
        assert_eq!(
            &source[rune_source.start as usize..rune_source.end as usize],
            &output[rune_output.start as usize..rune_output.end as usize]
        );

        let annotation_start = source.find(':').unwrap() as u32;
        assert!(
            !projection
                .copied_chunks
                .iter()
                .any(|chunk| chunk.source.start <= annotation_start
                    && annotation_start < chunk.source.end)
        );
        let count_start = source.find("count").unwrap() as u32;
        assert!(
            projection
                .output_range_for_source(count_start..annotation_start + 1)
                .is_none(),
            "a range crossing an omitted type annotation must not map exactly"
        );
    }

    #[test]
    fn projection_records_comments_reemitted_from_removed_declarations() {
        let source = "\
interface Props {
\t/** Documentation. */
\tvalue: string;
}
const answer: number = 42;
";
        let retained = RetainedProgram::parse(source, true);
        let (output, projection) =
            strip_typescript_from_program_with_projection(source, retained.program());
        let projection = projection.expect("TypeScript syntax should create a projection");

        assert_eq!(output, "/** Documentation. */\n\nconst answer = 42;\n");
        assert_projection_chunks_are_exact(source, &output, &projection);

        let comment_start = source.find("/** Documentation. */").unwrap() as u32;
        let comment_source = comment_start..comment_start + "/** Documentation. */".len() as u32;
        let comment_output = projection
            .output_range_for_source(comment_source)
            .expect("re-emitted comments are exact copied chunks");
        assert_eq!(
            &output[comment_output.start as usize..comment_output.end as usize],
            "/** Documentation. */"
        );

        let declaration_start = source.find("interface").unwrap() as u32;
        assert!(
            !projection
                .copied_chunks
                .iter()
                .any(|chunk| chunk.source.start <= declaration_start
                    && declaration_start < chunk.source.end)
        );
    }

    #[test]
    fn projection_includes_declare_text_fallback_omissions() {
        let source = "\
declare global {
\tinterface Window { answer: number }
}
const answer = 42;
";
        let retained = RetainedProgram::parse(source, true);
        let (output, projection) =
            strip_typescript_from_program_with_projection(source, retained.program());
        let projection = projection.expect("declare global should create a projection");

        assert_eq!(output, "\nconst answer = 42;\n");
        assert_projection_chunks_are_exact(source, &output, &projection);
        let declaration_start = source.find("declare global").unwrap() as u32;
        assert!(
            !projection
                .copied_chunks
                .iter()
                .any(|chunk| chunk.source.start <= declaration_start
                    && declaration_start < chunk.source.end)
        );
    }

    fn assert_projection_chunks_are_exact(
        source: &str,
        output: &str,
        projection: &ScriptProjection,
    ) {
        for chunk in &projection.copied_chunks {
            assert_eq!(
                &source[chunk.source.start as usize..chunk.source.end as usize],
                &output[chunk.output.start as usize..chunk.output.end as usize]
            );
        }
    }

    /// Regression: `strip_typescript` must NOT re-emit JSDoc comments that live
    /// inside a TS type annotation on a `$props()` destructure.
    ///
    /// Before the fix, the code in `strip_typescript` intentionally re-emitted
    /// comments found inside removed regions (to preserve JSDoc from
    /// `interface Props { … }` bodies).  This caused the JSDoc to land *between*
    /// the destructure's closing `}` and `= $props()`, breaking
    /// `collapse_multiline_destructuring` which expected them on the same line.
    ///
    /// The fix: skip comment re-emission for regions that start with `:` —
    /// those are inline TS type annotations, not top-level declarations.
    #[test]
    fn jsdoc_inside_inline_ts_type_annotation_is_not_re_emitted() {
        let source = "\
let {
\tvalue: valueProp = $bindable([]),
\titems = [],
\t...restProps
}: SomeType & {
\t/**
\t * The individual items.
\t */
\titems?: string[];
} = $props();
";
        let stripped = strip_typescript(source);
        // The JSDoc comment must NOT appear in the stripped output.
        assert!(
            !stripped.contains("The individual items"),
            "JSDoc from inline TS annotation was re-emitted: {stripped:?}"
        );
        // The destructure pattern itself must be preserved.
        assert!(
            stripped.contains("...restProps"),
            "restProps missing after strip: {stripped:?}"
        );
        // The assignment RHS must be preserved.
        assert!(
            stripped.contains("$props()"),
            "$props() missing after strip: {stripped:?}"
        );
        // The closing `}` must not have floating content between it and `= $props()`.
        // Specifically, the stripped output should not have a `/**` on a line
        // between `}` and `= $props()`.
        let lines: Vec<&str> = stripped.lines().collect();
        let closing_brace_idx = lines.iter().rposition(|l| l.trim() == "}");
        let props_idx = lines.iter().rposition(|l| l.contains("$props()"));
        if let (Some(brace), Some(props)) = (closing_brace_idx, props_idx) {
            // All lines between `}` and `= $props()` should be whitespace or the `=` line itself.
            for l in &lines[brace + 1..props] {
                assert!(
                    l.trim().is_empty() || l.trim().starts_with('='),
                    "Unexpected content between `}}` and `= $props()`: {l:?}\nFull output: {stripped:?}"
                );
            }
        }
    }

    /// A definite-assignment assertion must strip to exactly what the same
    /// declaration without the `!` strips to — leaving it behind emits
    /// invalid JS (`let element!;`).
    #[test]
    fn definite_assignment_assertion_is_stripped() {
        for (ts, expected) in [
            ("let element!: HTMLDivElement;\n", "let element;\n"),
            ("let element !: HTMLDivElement;\n", "let element;\n"),
            ("let a!: number, b = 2;\n", "let a, b = 2;\n"),
            (
                "for (const x of []) {\n\tlet a!: number;\n}\n",
                "for (const x of []) {\n\tlet a;\n}\n",
            ),
            ("export let a!: number;\n", "export let a;\n"),
            ("class Foo {\n\tx!: string;\n}\n", "class Foo {\n\tx;\n}\n"),
        ] {
            assert_eq!(strip_typescript(ts), expected, "input: {ts:?}");
        }
    }

    /// TS optional markers and the `override` modifier on class members are
    /// erased by the official compiler; leaving them behind emits invalid JS
    /// (`x?;`, `override x = 2`).
    #[test]
    fn optional_marker_and_override_modifier_are_stripped() {
        for (ts, expected) in [
            ("class Foo {\n\tx?: string;\n}\n", "class Foo {\n\tx;\n}\n"),
            ("class Foo {\n\tx?;\n}\n", "class Foo {\n\tx;\n}\n"),
            ("class Foo {\n\tx ?: string;\n}\n", "class Foo {\n\tx;\n}\n"),
            (
                "class Foo {\n\t['k']?: number;\n}\n",
                "class Foo {\n\t['k'];\n}\n",
            ),
            (
                "class Foo {\n\tm?(): void {}\n}\n",
                "class Foo {\n\tm() {}\n}\n",
            ),
            (
                "class Bar extends B {\n\toverride x = 2;\n}\n",
                "class Bar extends B {\n\tx = 2;\n}\n",
            ),
            (
                "class Bar extends B {\n\toverride m(): void {}\n}\n",
                "class Bar extends B {\n\tm() {}\n}\n",
            ),
            (
                "class Bar extends B {\n\tpublic override readonly z: string = 'override';\n}\n",
                "class Bar extends B {\n\tz = 'override';\n}\n",
            ),
            // A member whose value merely mentions the keyword must survive intact.
            (
                "class Foo {\n\ts = 'override';\n\tt = 'readonly';\n}\n",
                "class Foo {\n\ts = 'override';\n\tt = 'readonly';\n}\n",
            ),
        ] {
            assert_eq!(strip_typescript(ts), expected, "input: {ts:?}");
        }
    }
}
