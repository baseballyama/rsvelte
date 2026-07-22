//! Type definitions for the analysis phase.

use super::scope::{Scope, ScopeRoot};
use crate::ast::template::{Root, Script};
use crate::compiler::CompileOptions;
use rustc_hash::{FxHashMap, FxHashSet};

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
}

/// A reactive statement ($: statement) in legacy mode (Svelte 4).
#[derive(Debug, Clone)]
pub struct ReactiveStatement {
    /// Bindings that are assigned to in this reactive statement
    pub assignments: FxHashSet<usize>,
    /// Bindings that this reactive statement depends on
    pub dependencies: Vec<usize>,
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
    /// Extract script content from an AST Script node and source.
    pub fn from_script(script: &Script, source: &str) -> Self {
        Self::from_script_with_ts(script, source, false)
    }

    /// Extract script content from an AST Script node and source,
    /// with optional forced TypeScript stripping.
    /// `force_typescript` is true when another script in the component has `lang="ts"`.
    pub fn from_script_with_ts(script: &Script, source: &str, force_typescript: bool) -> Self {
        let start = script.content.start().unwrap_or(0);
        let end = script.content.end().unwrap_or(0);
        let raw = if (end as usize) > (start as usize) && (end as usize) <= source.len() {
            source[start as usize..end as usize].to_string()
        } else {
            String::new()
        };
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
        let raw = if is_typescript && !raw.is_empty() {
            strip_typescript(&raw)
        } else {
            raw
        };

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
        // Look for `const/let/var NAME = <rhs>`
        let rest = trimmed
            .strip_prefix("const ")
            .or_else(|| trimmed.strip_prefix("let "))
            .or_else(|| trimmed.strip_prefix("var "));
        let rest = match rest {
            Some(r) => r.trim(),
            None => continue,
        };
        // Find the `= ` separator (simple assignment, not destructuring)
        if let Some(eq_pos) = rest.find(" = ") {
            let name_part = rest[..eq_pos].trim();
            // Only simple identifiers (no destructuring patterns)
            if name_part.is_empty()
                || !name_part
                    .chars()
                    .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
            {
                continue;
            }
            let rhs = rest[eq_pos + 3..].trim();
            // If the RHS starts with a rune call, this variable IS rune-initialised
            let is_rune_init = RUNE_PREFIXES.iter().any(|p| rhs.starts_with(p));
            if !is_rune_init {
                names.insert(name_part.to_string());
            }
        }
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

    let allocator = Allocator::default();
    let source_type = SourceType::ts();
    let parser = Parser::new(&allocator, source, source_type);
    let result = parser.parse();

    if !result.diagnostics.is_empty() {
        // If parsing fails, return original source and let downstream handle errors
        return source.to_string();
    }

    // Collect source spans to remove (sorted by start position)
    let mut removals: Vec<(u32, u32)> = Vec::new();

    collect_ts_removals_from_program(&result.program, source, &mut removals);

    // Text-based fallback: strip `declare global { ... }`, `declare module ... { ... }`,
    // and `declare namespace ... { ... }` blocks. These may not always be parsed as
    // TSModuleDeclaration depending on the OXC version, so do a simple text-based scan
    // to ensure they're removed.
    for keyword in &["declare global", "declare module", "declare namespace"] {
        let bytes = source.as_bytes();
        let mut search_from = 0;
        while let Some(rel) = source[search_from..].find(keyword) {
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

    if removals.is_empty() {
        return source.to_string();
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
    let mut pos = 0u32;

    for (remove_start, remove_end) in &merged {
        if *remove_start > pos {
            output.push_str(&source[pos as usize..*remove_start as usize]);
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
            let is_inline_type_annotation = removed.trim_start().starts_with(':');
            if !is_inline_type_annotation
                && removed.contains('\n')
                && (removed.contains("/*") || removed.contains("//"))
            {
                for comment in
                    crate::compiler::phases::phase3_transform::server::transform_script::extract_comments_from_snippet(removed)
                {
                    output.push_str(&comment);
                    output.push('\n');
                }
            }
        }
        pos = pos.max(*remove_end);
    }

    // Add remaining content
    if (pos as usize) < source.len() {
        output.push_str(&source[pos as usize..]);
    }

    output
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

    let allocator = Allocator::default();
    let source_type = SourceType::ts();
    let parser = Parser::new(&allocator, source, source_type);
    let result = parser.parse();

    if !result.diagnostics.is_empty() {
        return source.to_string();
    }

    let mut removals: Vec<(u32, u32)> = Vec::new();
    collect_ts_removals_from_program(&result.program, source, &mut removals);

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
    for stmt in &program.body {
        collect_ts_removals_from_statement(stmt, source, removals);
    }
}

/// Collect TS removals from a function (type params, return type, this param).
fn collect_ts_removals_from_function(
    func: &oxc_ast::ast::Function,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    // Remove type parameters: function foo<T>()
    if let Some(ref type_params) = func.type_parameters {
        removals.push((type_params.span.start, type_params.span.end));
    }

    // Remove return type: function foo(): string
    if let Some(ref return_type) = func.return_type {
        removals.push((return_type.span.start, return_type.span.end));
    }

    // Remove `this` parameter type: function foo(this: any)
    if let Some(ref this_param) = func.this_param {
        // Need to also remove the comma after `this: any` if there are more params
        let end = if !func.params.items.is_empty() {
            // Remove up to the start of the first param, including comma
            func.params.items[0].span.start
        } else {
            this_param.span.end
        };
        removals.push((this_param.span.start, end));
    }

    // Recurse into params for type annotations and optional markers
    for param in &func.params.items {
        // Remove optional `?` marker (e.g., `key?: Type` → `key`)
        if param.optional {
            use oxc_span::GetSpan;
            // The `?` sits right after the binding pattern's span end
            let pattern_end = param.pattern.span().end;
            if (pattern_end as usize) < source.len()
                && source.as_bytes()[pattern_end as usize] == b'?'
            {
                removals.push((pattern_end, pattern_end + 1));
            }
        }
        if let Some(ref type_ann) = param.type_annotation {
            removals.push((type_ann.span.start, type_ann.span.end));
        }
        collect_ts_removals_from_binding_pattern(&param.pattern, source, removals);
    }

    // Strip type annotation from rest param: `(...args: Type[])` → `(...args)`
    if let Some(ref rest) = func.params.rest
        && let Some(ref type_ann) = rest.type_annotation
    {
        removals.push((type_ann.span.start, type_ann.span.end));
    }

    // Recurse into function body
    if let Some(ref body) = func.body {
        for stmt in &body.statements {
            collect_ts_removals_from_statement(stmt, source, removals);
        }
    }
}

/// Collect TS removals from a class (abstract keyword, type params, implements, members).
fn collect_ts_removals_from_class(
    class: &oxc_ast::ast::Class,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    use oxc_span::GetSpan;

    // Remove `abstract` keyword before `class`
    if class.r#abstract && !source.is_empty() {
        let class_source = &source[class.span.start as usize..class.span.end as usize];
        if let Some(abstract_pos) = memchr::memmem::find(class_source.as_bytes(), b"abstract") {
            let abs_start = class.span.start + abstract_pos as u32;
            let abs_end = abs_start + 8; // "abstract" is 8 chars
            let space_end = if (abs_end as usize) < source.len()
                && source.as_bytes()[abs_end as usize] == b' '
            {
                abs_end + 1
            } else {
                abs_end
            };
            removals.push((abs_start, space_end));
        }
    }

    // Remove type parameters: class Foo<T>
    if let Some(ref type_params) = class.type_parameters {
        removals.push((type_params.span.start, type_params.span.end));
    }

    // Remove super type arguments: extends Bar<T>
    if let Some(ref super_type_args) = class.super_type_arguments {
        removals.push((super_type_args.span.start, super_type_args.span.end));
    }

    // Remove `implements` clause
    if !class.implements.is_empty() && !source.is_empty() {
        let last_impl = class.implements.last().unwrap();
        let search_start = if let Some(ref _super) = class.super_class {
            _super.span().end as usize
        } else if let Some(ref type_params) = class.type_parameters {
            type_params.span.end as usize
        } else if let Some(ref id) = class.id {
            id.span.end as usize
        } else {
            class.span.start as usize
        };

        if search_start < class.body.span.start as usize {
            let search_source = &source[search_start..class.body.span.start as usize];
            if let Some(impl_pos) = memchr::memmem::find(search_source.as_bytes(), b"implements") {
                let abs_start = search_start as u32 + impl_pos as u32;
                removals.push((abs_start, last_impl.span.end));
                if abs_start > 0
                    && (abs_start as usize) <= source.len()
                    && source.as_bytes()[(abs_start - 1) as usize] == b' '
                {
                    removals.push((abs_start - 1, abs_start));
                }
            }
        }
    }

    // Process class body members
    for element in &class.body.body {
        match element {
            oxc_ast::ast::ClassElement::MethodDefinition(method) => {
                if method.r#type == oxc_ast::ast::MethodDefinitionType::TSAbstractMethodDefinition {
                    removals.push((method.span.start, method.span.end));
                    continue;
                }
                if let Some(ref accessibility) = method.accessibility {
                    remove_keyword_from_source(
                        match accessibility {
                            oxc_ast::ast::TSAccessibility::Public => "public",
                            oxc_ast::ast::TSAccessibility::Private => "private",
                            oxc_ast::ast::TSAccessibility::Protected => "protected",
                        },
                        method.span,
                        source,
                        removals,
                    );
                }
                collect_ts_removals_from_function(&method.value, source, removals);
            }
            oxc_ast::ast::ClassElement::PropertyDefinition(prop) => {
                if prop.declare {
                    removals.push((prop.span.start, prop.span.end));
                    continue;
                }
                if prop.r#type == oxc_ast::ast::PropertyDefinitionType::TSAbstractPropertyDefinition
                {
                    removals.push((prop.span.start, prop.span.end));
                    continue;
                }
                if let Some(ref type_ann) = prop.type_annotation {
                    removals.push((type_ann.span.start, type_ann.span.end));
                }
                if let Some(ref accessibility) = prop.accessibility {
                    remove_keyword_from_source(
                        match accessibility {
                            oxc_ast::ast::TSAccessibility::Public => "public",
                            oxc_ast::ast::TSAccessibility::Private => "private",
                            oxc_ast::ast::TSAccessibility::Protected => "protected",
                        },
                        prop.span,
                        source,
                        removals,
                    );
                }
                if prop.readonly {
                    remove_keyword_from_source("readonly", prop.span, source, removals);
                }
                if let Some(ref value) = prop.value {
                    collect_ts_removals_from_expression(value, source, removals);
                }
            }
            oxc_ast::ast::ClassElement::StaticBlock(block) => {
                for stmt in &block.body {
                    collect_ts_removals_from_statement(stmt, source, removals);
                }
            }
            _ => {}
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
            | E::MetaProperty(_)
            | E::ImportExpression(_)
    )
}

/// Collect TS removals from a call/new argument. `Argument::as_expression()`
/// returns `None` for spread arguments, so `...(<expr> as T)` (and any TS
/// syntax nested inside a spread) must be unwrapped explicitly — otherwise
/// the cast survives stripping and the output is not valid JavaScript.
fn collect_ts_removals_from_argument(
    arg: &oxc_ast::ast::Argument,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    if let oxc_ast::ast::Argument::SpreadElement(spread) = arg {
        collect_ts_removals_from_expression(&spread.argument, source, removals);
    } else if let Some(e) = arg.as_expression() {
        collect_ts_removals_from_expression(e, source, removals);
    }
}

/// Collect TS removals from an expression.
fn collect_ts_removals_from_expression(
    expr: &oxc_ast::ast::Expression,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    use oxc_ast::ast::Expression as E;
    use oxc_span::GetSpan;

    match expr {
        E::TSAsExpression(ts_as) => {
            removals.push((ts_as.expression.span().end, ts_as.span.end));
            collect_ts_removals_from_expression(&ts_as.expression, source, removals);
        }
        E::TSSatisfiesExpression(ts_sat) => {
            removals.push((ts_sat.expression.span().end, ts_sat.span.end));
            collect_ts_removals_from_expression(&ts_sat.expression, source, removals);
        }
        E::TSNonNullExpression(ts_nn) => {
            removals.push((ts_nn.expression.span().end, ts_nn.span.end));
            collect_ts_removals_from_expression(&ts_nn.expression, source, removals);
        }
        E::TSTypeAssertion(ts_assertion) => {
            removals.push((
                ts_assertion.span.start,
                ts_assertion.expression.span().start,
            ));
            collect_ts_removals_from_expression(&ts_assertion.expression, source, removals);
        }
        E::TSInstantiationExpression(ts_inst) => {
            removals.push((ts_inst.expression.span().end, ts_inst.span.end));
            collect_ts_removals_from_expression(&ts_inst.expression, source, removals);
        }
        E::CallExpression(call) => {
            collect_ts_removals_from_expression(&call.callee, source, removals);
            if let Some(ref type_args) = call.type_arguments {
                removals.push((type_args.span.start, type_args.span.end));
            }
            for arg in &call.arguments {
                collect_ts_removals_from_argument(arg, source, removals);
            }
        }
        E::NewExpression(new_expr) => {
            collect_ts_removals_from_expression(&new_expr.callee, source, removals);
            if let Some(ref type_args) = new_expr.type_arguments {
                removals.push((type_args.span.start, type_args.span.end));
            }
            for arg in &new_expr.arguments {
                collect_ts_removals_from_argument(arg, source, removals);
            }
        }
        E::TaggedTemplateExpression(tagged) => {
            collect_ts_removals_from_expression(&tagged.tag, source, removals);
            if let Some(ref type_args) = tagged.type_arguments {
                removals.push((type_args.span.start, type_args.span.end));
            }
        }
        E::AssignmentExpression(assign) => {
            collect_ts_removals_from_assignment_target(&assign.left, source, removals);
            collect_ts_removals_from_expression(&assign.right, source, removals);
        }
        E::BinaryExpression(bin) => {
            collect_ts_removals_from_expression(&bin.left, source, removals);
            collect_ts_removals_from_expression(&bin.right, source, removals);
        }
        E::LogicalExpression(log) => {
            collect_ts_removals_from_expression(&log.left, source, removals);
            collect_ts_removals_from_expression(&log.right, source, removals);
        }
        E::ConditionalExpression(cond) => {
            collect_ts_removals_from_expression(&cond.test, source, removals);
            collect_ts_removals_from_expression(&cond.consequent, source, removals);
            collect_ts_removals_from_expression(&cond.alternate, source, removals);
        }
        E::UnaryExpression(unary) => {
            collect_ts_removals_from_expression(&unary.argument, source, removals);
        }
        E::UpdateExpression(_update) => {
            // UpdateExpression.argument is SimpleAssignmentTarget, not Expression
            // No TS-specific removals needed here
        }
        E::SequenceExpression(seq) => {
            for e in &seq.expressions {
                collect_ts_removals_from_expression(e, source, removals);
            }
        }
        E::ArrayExpression(arr) => {
            use oxc_ast::ast::ArrayExpressionElement as AEE;
            for elem in &arr.elements {
                match elem {
                    AEE::SpreadElement(spread) => {
                        collect_ts_removals_from_expression(&spread.argument, source, removals);
                    }
                    AEE::Elision(_) => {}
                    _ => {
                        if let Some(e) = elem.as_expression() {
                            collect_ts_removals_from_expression(e, source, removals);
                        }
                    }
                }
            }
        }
        E::ObjectExpression(obj) => {
            for prop in &obj.properties {
                match prop {
                    oxc_ast::ast::ObjectPropertyKind::ObjectProperty(p) => {
                        // Visit computed keys for TS expressions like `[foo as number]`
                        if p.computed
                            && let Some(key_expr) = match &p.key {
                                oxc_ast::ast::PropertyKey::StaticIdentifier(_)
                                | oxc_ast::ast::PropertyKey::PrivateIdentifier(_) => None,
                                other => other.as_expression(),
                            }
                        {
                            collect_ts_removals_from_expression(key_expr, source, removals);
                        }
                        collect_ts_removals_from_expression(&p.value, source, removals);
                    }
                    oxc_ast::ast::ObjectPropertyKind::SpreadProperty(spread) => {
                        collect_ts_removals_from_expression(&spread.argument, source, removals);
                    }
                }
            }
        }
        E::ArrowFunctionExpression(arrow) => {
            if let Some(ref type_params) = arrow.type_parameters {
                removals.push((type_params.span.start, type_params.span.end));
            }
            if let Some(ref return_type) = arrow.return_type {
                removals.push((return_type.span.start, return_type.span.end));
            }
            for param in &arrow.params.items {
                if param.optional {
                    let pattern_end = param.pattern.span().end;
                    if (pattern_end as usize) < source.len()
                        && source.as_bytes()[pattern_end as usize] == b'?'
                    {
                        removals.push((pattern_end, pattern_end + 1));
                    }
                }
                if let Some(ref type_ann) = param.type_annotation {
                    removals.push((type_ann.span.start, type_ann.span.end));
                }
                collect_ts_removals_from_binding_pattern(&param.pattern, source, removals);
            }
            // Strip type annotation from rest param: `(...args: Type[])` → `(...args)`
            if let Some(ref rest) = arrow.params.rest
                && let Some(ref type_ann) = rest.type_annotation
            {
                removals.push((type_ann.span.start, type_ann.span.end));
            }
            for stmt in &arrow.body.statements {
                collect_ts_removals_from_statement(stmt, source, removals);
            }
        }
        E::FunctionExpression(func) => {
            collect_ts_removals_from_function(func, source, removals);
        }
        E::ClassExpression(class) => {
            collect_ts_removals_from_class(class, source, removals);
        }
        E::TemplateLiteral(tmpl) => {
            for e in &tmpl.expressions {
                collect_ts_removals_from_expression(e, source, removals);
            }
        }
        E::ParenthesizedExpression(paren) => {
            // When parens wrap a TS-only wrapper like `(X as T)` or `(X!)` whose
            // runtime value is simply `X`, the outer parens become redundant once
            // the type annotation is stripped. Collapse them together so that
            // `((expr)?.filter(x) as T[])[0]` becomes `(expr)?.filter(x)[0]`,
            // matching esrap/astring output. We only drop the outer parens when
            // the inner expression is one of the single-value TS wrappers AND
            // peeling the wrapper exposes a "simple" expression — one whose
            // precedence never requires the surrounding parens. For a unary /
            // binary / logical / conditional / etc. expression we keep the
            // parens because removing them can silently change the meaning
            // (e.g. `(-n as number) ** 2` → `-n ** 2` is a JS syntax error;
            // `(a + b as T) * c` → `a + b * c` reassociates). (issue #457, H-125)
            let inner = &paren.expression;
            let is_ts_wrapper = matches!(
                inner,
                E::TSAsExpression(_)
                    | E::TSSatisfiesExpression(_)
                    | E::TSNonNullExpression(_)
                    | E::TSTypeAssertion(_)
                    | E::TSInstantiationExpression(_)
            );
            if is_ts_wrapper {
                let unwrapped = peel_ts_wrappers(inner);
                if is_paren_safe_to_drop(unwrapped) {
                    // Remove `(` and `)` surrounding the TS wrapper.
                    removals.push((paren.span.start, inner.span().start));
                    removals.push((inner.span().end, paren.span.end));
                }
            }
            collect_ts_removals_from_expression(inner, source, removals);
        }
        E::AwaitExpression(await_expr) => {
            collect_ts_removals_from_expression(&await_expr.argument, source, removals);
        }
        E::YieldExpression(yield_expr) => {
            if let Some(ref arg) = yield_expr.argument {
                collect_ts_removals_from_expression(arg, source, removals);
            }
        }
        // MemberExpression variants are inherited into Expression
        E::ComputedMemberExpression(computed) => {
            collect_ts_removals_from_expression(&computed.object, source, removals);
            collect_ts_removals_from_expression(&computed.expression, source, removals);
        }
        E::StaticMemberExpression(static_member) => {
            collect_ts_removals_from_expression(&static_member.object, source, removals);
        }
        E::PrivateFieldExpression(pfe) => {
            collect_ts_removals_from_expression(&pfe.object, source, removals);
        }
        E::ChainExpression(chain) => match &chain.expression {
            oxc_ast::ast::ChainElement::CallExpression(call) => {
                collect_ts_removals_from_expression(&call.callee, source, removals);
                if let Some(ref type_args) = call.type_arguments {
                    removals.push((type_args.span.start, type_args.span.end));
                }
                for arg in &call.arguments {
                    collect_ts_removals_from_argument(arg, source, removals);
                }
            }
            oxc_ast::ast::ChainElement::StaticMemberExpression(static_member) => {
                collect_ts_removals_from_expression(&static_member.object, source, removals);
            }
            oxc_ast::ast::ChainElement::ComputedMemberExpression(computed) => {
                collect_ts_removals_from_expression(&computed.object, source, removals);
                collect_ts_removals_from_expression(&computed.expression, source, removals);
            }
            oxc_ast::ast::ChainElement::PrivateFieldExpression(pfe) => {
                collect_ts_removals_from_expression(&pfe.object, source, removals);
            }
            oxc_ast::ast::ChainElement::TSNonNullExpression(ts_nn) => {
                removals.push((ts_nn.expression.span().end, ts_nn.span.end));
                collect_ts_removals_from_expression(&ts_nn.expression, source, removals);
            }
        },
        _ => {}
    }
}

/// Collect TS removals from an assignment target (left side of assignments).
fn collect_ts_removals_from_assignment_target(
    target: &oxc_ast::ast::AssignmentTarget,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    use oxc_ast::ast::AssignmentTarget as AT;
    use oxc_span::GetSpan;

    match target {
        AT::TSAsExpression(ts_as) => {
            removals.push((ts_as.expression.span().end, ts_as.span.end));
            collect_ts_removals_from_expression(&ts_as.expression, source, removals);
        }
        AT::TSSatisfiesExpression(ts_sat) => {
            removals.push((ts_sat.expression.span().end, ts_sat.span.end));
            collect_ts_removals_from_expression(&ts_sat.expression, source, removals);
        }
        AT::TSNonNullExpression(ts_nn) => {
            removals.push((ts_nn.expression.span().end, ts_nn.span.end));
            collect_ts_removals_from_expression(&ts_nn.expression, source, removals);
        }
        AT::TSTypeAssertion(ts_assertion) => {
            removals.push((
                ts_assertion.span.start,
                ts_assertion.expression.span().start,
            ));
            collect_ts_removals_from_expression(&ts_assertion.expression, source, removals);
        }
        AT::ComputedMemberExpression(computed) => {
            collect_ts_removals_from_expression(&computed.object, source, removals);
            collect_ts_removals_from_expression(&computed.expression, source, removals);
        }
        AT::StaticMemberExpression(static_member) => {
            collect_ts_removals_from_expression(&static_member.object, source, removals);
        }
        AT::PrivateFieldExpression(pfe) => {
            collect_ts_removals_from_expression(&pfe.object, source, removals);
        }
        _ => {}
    }
}

/// Collect TS removals from a statement.
fn collect_ts_removals_from_statement(
    stmt: &oxc_ast::ast::Statement,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    use oxc_ast::ast::*;
    use oxc_span::GetSpan;

    match stmt {
        Statement::ExpressionStatement(expr_stmt) => {
            collect_ts_removals_from_expression(&expr_stmt.expression, source, removals);
        }
        Statement::VariableDeclaration(var_decl) => {
            if var_decl.declare {
                removals.push((var_decl.span.start, var_decl.span.end));
                return;
            }
            for decl in &var_decl.declarations {
                if let Some(ref type_ann) = decl.type_annotation {
                    removals.push((type_ann.span.start, type_ann.span.end));
                }
                collect_ts_removals_from_binding_pattern(&decl.id, source, removals);
                if let Some(ref init) = decl.init {
                    collect_ts_removals_from_expression(init, source, removals);
                }
            }
        }
        Statement::ReturnStatement(ret) => {
            if let Some(ref arg) = ret.argument {
                collect_ts_removals_from_expression(arg, source, removals);
            }
        }
        Statement::IfStatement(if_stmt) => {
            collect_ts_removals_from_expression(&if_stmt.test, source, removals);
            collect_ts_removals_from_statement(&if_stmt.consequent, source, removals);
            if let Some(ref alt) = if_stmt.alternate {
                collect_ts_removals_from_statement(alt, source, removals);
            }
        }
        Statement::BlockStatement(block) => {
            for s in &block.body {
                collect_ts_removals_from_statement(s, source, removals);
            }
        }
        Statement::ForStatement(for_stmt) => {
            if let Some(ref init) = for_stmt.init
                && let ForStatementInit::VariableDeclaration(vd) = init
            {
                for decl in &vd.declarations {
                    if let Some(ref type_ann) = decl.type_annotation {
                        removals.push((type_ann.span.start, type_ann.span.end));
                    }
                    collect_ts_removals_from_binding_pattern(&decl.id, source, removals);
                    if let Some(ref i) = decl.init {
                        collect_ts_removals_from_expression(i, source, removals);
                    }
                }
            }
            if let Some(ref test) = for_stmt.test {
                collect_ts_removals_from_expression(test, source, removals);
            }
            if let Some(ref update) = for_stmt.update {
                collect_ts_removals_from_expression(update, source, removals);
            }
            collect_ts_removals_from_statement(&for_stmt.body, source, removals);
        }
        Statement::WhileStatement(while_stmt) => {
            collect_ts_removals_from_expression(&while_stmt.test, source, removals);
            collect_ts_removals_from_statement(&while_stmt.body, source, removals);
        }
        Statement::DoWhileStatement(do_while) => {
            collect_ts_removals_from_statement(&do_while.body, source, removals);
            collect_ts_removals_from_expression(&do_while.test, source, removals);
        }
        Statement::ForOfStatement(for_of) => {
            if let ForStatementLeft::VariableDeclaration(vd) = &for_of.left {
                for decl in &vd.declarations {
                    if let Some(ref type_ann) = decl.type_annotation {
                        removals.push((type_ann.span.start, type_ann.span.end));
                    }
                    collect_ts_removals_from_binding_pattern(&decl.id, source, removals);
                    if let Some(ref init) = decl.init {
                        collect_ts_removals_from_expression(init, source, removals);
                    }
                }
            }
            collect_ts_removals_from_expression(&for_of.right, source, removals);
            collect_ts_removals_from_statement(&for_of.body, source, removals);
        }
        Statement::ForInStatement(for_in) => {
            if let ForStatementLeft::VariableDeclaration(vd) = &for_in.left {
                for decl in &vd.declarations {
                    if let Some(ref type_ann) = decl.type_annotation {
                        removals.push((type_ann.span.start, type_ann.span.end));
                    }
                    collect_ts_removals_from_binding_pattern(&decl.id, source, removals);
                    if let Some(ref init) = decl.init {
                        collect_ts_removals_from_expression(init, source, removals);
                    }
                }
            }
            collect_ts_removals_from_expression(&for_in.right, source, removals);
            collect_ts_removals_from_statement(&for_in.body, source, removals);
        }
        Statement::LabeledStatement(labeled) => {
            collect_ts_removals_from_statement(&labeled.body, source, removals);
        }
        Statement::FunctionDeclaration(func) => {
            if func.r#type == FunctionType::TSDeclareFunction || func.declare || func.body.is_none()
            {
                removals.push((func.span.start, func.span.end));
            } else {
                collect_ts_removals_from_function(func, source, removals);
            }
        }
        Statement::ClassDeclaration(class) => {
            if class.declare {
                removals.push((class.span.start, class.span.end));
            } else {
                collect_ts_removals_from_class(class, source, removals);
            }
        }
        Statement::ThrowStatement(throw_stmt) => {
            collect_ts_removals_from_expression(&throw_stmt.argument, source, removals);
        }
        Statement::TryStatement(try_stmt) => {
            for s in &try_stmt.block.body {
                collect_ts_removals_from_statement(s, source, removals);
            }
            if let Some(ref handler) = try_stmt.handler {
                // Remove type annotation from catch clause parameter: catch (err: unknown)
                if let Some(ref param) = handler.param {
                    if let Some(ref type_ann) = param.type_annotation {
                        removals.push((type_ann.span.start, type_ann.span.end));
                    }
                    collect_ts_removals_from_binding_pattern(&param.pattern, source, removals);
                }
                for s in &handler.body.body {
                    collect_ts_removals_from_statement(s, source, removals);
                }
            }
            if let Some(ref finalizer) = try_stmt.finalizer {
                for s in &finalizer.body {
                    collect_ts_removals_from_statement(s, source, removals);
                }
            }
        }
        Statement::SwitchStatement(switch_stmt) => {
            collect_ts_removals_from_expression(&switch_stmt.discriminant, source, removals);
            for case in &switch_stmt.cases {
                if let Some(ref test) = case.test {
                    collect_ts_removals_from_expression(test, source, removals);
                }
                for s in &case.consequent {
                    collect_ts_removals_from_statement(s, source, removals);
                }
            }
        }
        // Import/Export declarations
        Statement::ImportDeclaration(import_decl) => {
            if import_decl.import_kind == ImportOrExportKind::Type {
                removals.push((import_decl.span.start, import_decl.span.end));
            } else if let Some(specifiers) = &import_decl.specifiers {
                let type_specs: Vec<_> = specifiers
                    .iter()
                    .filter(|s| {
                        if let ImportDeclarationSpecifier::ImportSpecifier(spec) = s {
                            spec.import_kind == ImportOrExportKind::Type
                        } else {
                            false
                        }
                    })
                    .collect();
                if !type_specs.is_empty() {
                    if type_specs.len() == specifiers.len() {
                        removals.push((import_decl.span.start, import_decl.span.end));
                    } else {
                        // Check if all named ImportSpecifiers are type-only
                        // (there may be a DefaultSpecifier or NamespaceSpecifier remaining)
                        let named_specs: Vec<_> = specifiers
                            .iter()
                            .filter(|s| matches!(s, ImportDeclarationSpecifier::ImportSpecifier(_)))
                            .collect();
                        let all_named_are_type = !named_specs.is_empty()
                            && named_specs.iter().all(|s| {
                                if let ImportDeclarationSpecifier::ImportSpecifier(spec) = s {
                                    spec.import_kind == ImportOrExportKind::Type
                                } else {
                                    false
                                }
                            });
                        if all_named_are_type && named_specs.len() >= 2 {
                            // Multiple named type specs: remove the whole { ... } block
                            // including the preceding comma
                            let first_span = named_specs.first().unwrap().span();
                            let last_span = named_specs.last().unwrap().span();
                            // Find the opening `{` before the first named spec
                            let before = &source[..first_span.start as usize];
                            if let Some(brace_pos) = before.rfind('{') {
                                // Find the closing `}` after the last named spec
                                let after = &source[last_span.end as usize..];
                                if let Some(close_offset) = after.find('}') {
                                    let close_pos = last_span.end as usize + close_offset + 1;
                                    // Also remove the comma before `{`
                                    let before_brace = &source[..brace_pos];
                                    let comma_start = before_brace.rfind(',').unwrap_or(brace_pos);
                                    removals.push((comma_start as u32, close_pos as u32));
                                }
                            }
                        } else if all_named_are_type {
                            // Single named type spec: remove it and clean up the braces + comma
                            let spec = named_specs[0];
                            let spec_span = spec.span();
                            // Find the opening `{` before this spec
                            let before = &source[..spec_span.start as usize];
                            if let Some(brace_pos) = before.rfind('{') {
                                // Find the closing `}` after this spec
                                let after = &source[spec_span.end as usize..];
                                if let Some(close_offset) = after.find('}') {
                                    let close_pos = spec_span.end as usize + close_offset + 1;
                                    // Also remove the comma before `{`
                                    let before_brace = &source[..brace_pos];
                                    let comma_start = before_brace.rfind(',').unwrap_or(brace_pos);
                                    removals.push((comma_start as u32, close_pos as u32));
                                }
                            }
                        } else {
                            for spec in type_specs {
                                remove_specifier_with_comma(spec.span(), source, removals);
                            }
                        }
                    }
                }
            }
        }
        Statement::ExportNamedDeclaration(export_decl) => {
            if export_decl.export_kind == ImportOrExportKind::Type {
                removals.push((export_decl.span.start, export_decl.span.end));
            } else {
                if let Some(ref decl) = export_decl.declaration {
                    match decl {
                        Declaration::FunctionDeclaration(func) => {
                            if func.r#type == FunctionType::TSDeclareFunction
                                || func.declare
                                || func.body.is_none()
                            {
                                removals.push((export_decl.span.start, export_decl.span.end));
                            } else {
                                collect_ts_removals_from_function(func, source, removals);
                            }
                        }
                        Declaration::ClassDeclaration(class) => {
                            if class.declare {
                                removals.push((export_decl.span.start, export_decl.span.end));
                            } else {
                                collect_ts_removals_from_class(class, source, removals);
                            }
                        }
                        Declaration::VariableDeclaration(var_decl) => {
                            if var_decl.declare {
                                removals.push((export_decl.span.start, export_decl.span.end));
                            } else {
                                for decl in &var_decl.declarations {
                                    if let Some(ref type_ann) = decl.type_annotation {
                                        removals.push((type_ann.span.start, type_ann.span.end));
                                    }
                                    collect_ts_removals_from_binding_pattern(
                                        &decl.id, source, removals,
                                    );
                                    if let Some(ref init) = decl.init {
                                        collect_ts_removals_from_expression(init, source, removals);
                                    }
                                }
                            }
                        }
                        Declaration::TSTypeAliasDeclaration(_)
                        | Declaration::TSInterfaceDeclaration(_)
                        | Declaration::TSEnumDeclaration(_)
                        | Declaration::TSModuleDeclaration(_) => {
                            removals.push((export_decl.span.start, export_decl.span.end));
                        }
                        _ => {}
                    }
                }
                // Type-only export specifiers
                let type_specs: Vec<_> = export_decl
                    .specifiers
                    .iter()
                    .filter(|s| s.export_kind == ImportOrExportKind::Type)
                    .collect();
                if !type_specs.is_empty() && export_decl.declaration.is_none() {
                    if type_specs.len() == export_decl.specifiers.len() {
                        removals.push((export_decl.span.start, export_decl.span.end));
                    } else {
                        for spec in type_specs {
                            remove_specifier_with_comma(spec.span, source, removals);
                        }
                    }
                }
            }
        }
        Statement::ExportDefaultDeclaration(export_decl) => match &export_decl.declaration {
            ExportDefaultDeclarationKind::TSInterfaceDeclaration(_) => {
                removals.push((export_decl.span.start, export_decl.span.end));
            }
            ExportDefaultDeclarationKind::FunctionDeclaration(func) => {
                if func.r#type == FunctionType::TSDeclareFunction
                    || func.declare
                    || func.body.is_none()
                {
                    removals.push((export_decl.span.start, export_decl.span.end));
                } else {
                    collect_ts_removals_from_function(func, source, removals);
                }
            }
            ExportDefaultDeclarationKind::ClassDeclaration(class) => {
                if class.declare {
                    removals.push((export_decl.span.start, export_decl.span.end));
                } else {
                    collect_ts_removals_from_class(class, source, removals);
                }
            }
            _ => {
                if let Some(expr) = export_decl.declaration.as_expression() {
                    collect_ts_removals_from_expression(expr, source, removals);
                }
            }
        },
        Statement::ExportAllDeclaration(export_decl)
            if export_decl.export_kind == ImportOrExportKind::Type =>
        {
            removals.push((export_decl.span.start, export_decl.span.end));
        }
        // TS-only statements
        Statement::TSTypeAliasDeclaration(decl) => {
            removals.push((decl.span.start, decl.span.end));
        }
        Statement::TSInterfaceDeclaration(decl) => {
            removals.push((decl.span.start, decl.span.end));
        }
        Statement::TSModuleDeclaration(decl) => {
            removals.push((decl.span.start, decl.span.end));
        }
        Statement::TSEnumDeclaration(decl) => {
            removals.push((decl.span.start, decl.span.end));
        }
        _ => {}
    }
}

/// Collect TS removals from a binding pattern.
fn collect_ts_removals_from_binding_pattern(
    pattern: &oxc_ast::ast::BindingPattern,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    match pattern {
        oxc_ast::ast::BindingPattern::BindingIdentifier(_) => {
            // A `BindingIdentifier` carries no type annotation of its own in OXC's
            // AST (the annotation lives on the enclosing pattern), so nothing to strip.
        }
        oxc_ast::ast::BindingPattern::ObjectPattern(obj) => {
            for prop in &obj.properties {
                collect_ts_removals_from_binding_pattern(&prop.value, source, removals);
            }
            if let Some(ref rest) = obj.rest {
                collect_ts_removals_from_binding_pattern(&rest.argument, source, removals);
            }
        }
        oxc_ast::ast::BindingPattern::ArrayPattern(arr) => {
            for elem in arr.elements.iter().flatten() {
                collect_ts_removals_from_binding_pattern(elem, source, removals);
            }
            if let Some(ref rest) = arr.rest {
                collect_ts_removals_from_binding_pattern(&rest.argument, source, removals);
            }
        }
        oxc_ast::ast::BindingPattern::AssignmentPattern(assign) => {
            collect_ts_removals_from_binding_pattern(&assign.left, source, removals);
            collect_ts_removals_from_expression(&assign.right, source, removals);
        }
    }
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

    /// Original filename (e.g., "main.svelte") used for dev-mode source locations
    pub filename: String,

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

    /// Slot names mapped to their SlotElement nodes
    pub slot_names: indexmap::IndexMap<String, String, rustc_hash::FxBuildHasher>,

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
            .map(|f| {
                // Only allocate if backslashes are present
                let fname_owned;
                let fname: &str = if f.contains('\\') {
                    fname_owned = f.replace('\\', "/");
                    &fname_owned
                } else {
                    f
                };
                if let Some(ref root_dir) = options.root_dir {
                    // Only allocate if backslashes are present in root_dir
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
            })
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
                .map(|f| {
                    // Extract just the basename (e.g., "main.svelte" from "/path/to/main.svelte")
                    f.rsplit('/')
                        .next()
                        .unwrap_or(f)
                        .rsplit('\\')
                        .next()
                        .unwrap_or(f)
                        .to_string()
                })
                .unwrap_or_else(|| "Component".to_string()),
            runes: initial_runes,
            runes_explicitly_set: options.runes,
            experimental_async: options.experimental.r#async,
            has_await: false,
            maybe_runes: false,
            instance_has_legacy_patterns: false,
            uses_props: false,
            uses_rest_props: false,
            uses_slots: false,
            uses_render_tags: false,
            uses_component_bindings: false,
            uses_event_attributes: false,
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
            is_module_file: options
                .filename
                .as_ref()
                .map(|f| f.ends_with(".svelte.js") || f.ends_with(".svelte.ts"))
                .unwrap_or(false),
        }
    }

    /// Extract and store script content from the AST.
    /// This should be called during Phase 2 to pre-extract scripts for Phase 3.
    pub fn extract_scripts(&mut self, ast: &Root) {
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
            let mut content =
                ScriptContent::from_script_with_ts(script, &self.source, any_script_is_typescript);
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
            let content =
                ScriptContent::from_script_with_ts(script, &self.source, any_script_is_typescript);
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
                hash: std::sync::Arc::new(|s: &str| {
                    crate::compiler::phases::phase3_transform::css::generate_css_hash(s)
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
    /// Whether this element sits inside a `{#snippet}` declaration — its real
    /// DOM ancestors are the render sites, not its lexical `parent_idx`.
    pub in_snippet: bool,
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
    use super::strip_typescript;

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
}
