//! Code formatting and cleanup utilities for generated JavaScript.

use std::cell::RefCell;

use memchr::memmem;

use oxc_allocator::Allocator;

use crate::compiler::phases::phase3_transform::shared::js_scan::skip_opaque;
use crate::compiler::utils::is_escaped;

// Thread-local OXC allocator reused across normalize_js_with_oxc calls to avoid
// repeated allocator creation/destruction overhead. The allocator is reset
// before each use, which clears all allocations while keeping the underlying
// memory chunks for reuse.
thread_local! {
    static NORMALIZE_OXC_ALLOCATOR: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// Execute a closure with a freshly-reset thread-local OXC allocator.
fn with_normalize_allocator<F, R>(f: F) -> R
where
    F: FnOnce(&Allocator) -> R,
{
    NORMALIZE_OXC_ALLOCATOR.with(|cell| {
        let mut alloc = cell.borrow_mut();
        alloc.reset();
        f(&alloc)
    })
}

pub(super) fn replace_state_with_reactive_import(
    script: &str,
    name: &str,
    import_id: &str,
) -> String {
    let mut result = script.to_string();

    // 1. Replace $.get(name) -> import_id()
    // Build patterns without intermediate format! allocations
    let mut get_pattern = String::with_capacity(6 + name.len());
    get_pattern.push_str("$.get(");
    get_pattern.push_str(name);
    get_pattern.push(')');
    let mut get_replacement = String::with_capacity(import_id.len() + 2);
    get_replacement.push_str(import_id);
    get_replacement.push_str("()");
    result = result.replace(&get_pattern, &get_replacement);

    // 2. Replace $.mutate(name, EXPR) -> import_id(EXPR)
    // We need to find the matching closing paren for $.mutate(name, ...)
    let mut mutate_prefix = String::with_capacity(10 + name.len());
    mutate_prefix.push_str("$.mutate(");
    mutate_prefix.push_str(name);
    mutate_prefix.push_str(", ");
    while let Some(start) = result.find(&mutate_prefix) {
        let after_prefix = start + mutate_prefix.len();
        // Find the matching closing paren
        if let Some(end) = find_matching_close_paren(&result[after_prefix..]) {
            let inner = &result[after_prefix..after_prefix + end];
            let mut replacement = String::with_capacity(import_id.len() + inner.len() + 2);
            replacement.push_str(import_id);
            replacement.push('(');
            replacement.push_str(inner);
            replacement.push(')');
            let mut new_result = String::with_capacity(result.len());
            new_result.push_str(&result[..start]);
            new_result.push_str(&replacement);
            new_result.push_str(&result[after_prefix + end + 1..]); // +1 to skip the closing ')'
            result = new_result;
        } else {
            break;
        }
    }

    // 3. Replace $.set(name, EXPR) -> import_id(EXPR) (in case assignments are generated)
    let mut set_prefix = String::with_capacity(7 + name.len());
    set_prefix.push_str("$.set(");
    set_prefix.push_str(name);
    set_prefix.push_str(", ");
    while let Some(start) = result.find(&set_prefix) {
        let after_prefix = start + set_prefix.len();
        if let Some(end) = find_matching_close_paren(&result[after_prefix..]) {
            let inner = &result[after_prefix..after_prefix + end];
            let mut replacement = String::with_capacity(import_id.len() + inner.len() + 2);
            replacement.push_str(import_id);
            replacement.push('(');
            replacement.push_str(inner);
            replacement.push(')');
            let mut new_result = String::with_capacity(result.len());
            new_result.push_str(&result[..start]);
            new_result.push_str(&replacement);
            new_result.push_str(&result[after_prefix + end + 1..]);
            result = new_result;
        } else {
            break;
        }
    }

    // 4. Replace remaining bare identifier references.
    // After steps 1-3, any remaining bare `name` identifiers should become `import_id()`.
    // We need to be careful to only replace whole-word occurrences that aren't:
    // - Part of the import_id itself ($$_import_name)
    // - Part of another identifier
    // - On the LHS of a declaration
    //
    // Use byte-level scanning for ASCII delimiters, but copy UTF-8 segments to preserve encoding.
    let result_bytes = result.as_bytes();
    let name_bytes = name.as_bytes();
    let name_len = name_bytes.len();
    let import_id_bytes = import_id.as_bytes();
    let import_id_len = import_id_bytes.len();
    let mut new_result = String::with_capacity(result.len() + result.len() / 4);
    let mut i = 0;
    let mut copy_start = 0;

    while i < result_bytes.len() {
        // Check if the next bytes match the import_id (skip it to avoid infinite recursion)
        if i + import_id_len <= result_bytes.len()
            && &result_bytes[i..i + import_id_len] == import_id_bytes
        {
            new_result.push_str(&result[copy_start..i]);
            new_result.push_str(import_id);
            i += import_id_len;
            copy_start = i;
            continue;
        }

        // Check if current position matches the bare name
        if i + name_len <= result_bytes.len() && &result_bytes[i..i + name_len] == name_bytes {
            // Check word boundary before
            let before_ok = if i == 0 {
                true
            } else {
                let prev = result_bytes[i - 1];
                !prev.is_ascii_alphanumeric() && prev != b'_' && prev != b'$'
            };
            // Check word boundary after
            let after_ok = if i + name_len >= result_bytes.len() {
                true
            } else {
                let next = result_bytes[i + name_len];
                !next.is_ascii_alphanumeric() && next != b'_' && next != b'$'
            };

            if before_ok && after_ok {
                // Replace with import_id()
                new_result.push_str(&result[copy_start..i]);
                new_result.push_str(import_id);
                new_result.push_str("()");
                i += name_len;
                copy_start = i;
                continue;
            }
        }

        i += 1;
    }

    // Flush remaining content
    if copy_start < result_bytes.len() {
        new_result.push_str(&result[copy_start..]);
    }

    new_result
}

/// Find the position of the matching close parenthesis in a string.
/// The string starts AFTER the opening context (e.g., after "$.mutate(name, ").
/// Returns the index of the closing ')' relative to the start of the string,
/// or None if not found.
pub(super) fn find_matching_close_paren(s: &str) -> Option<usize> {
    let mut depth: u32 = 1; // We're already inside one paren level
    let bytes = s.as_bytes();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = b'"';

    while i < bytes.len() {
        let c = bytes[i];

        if in_string {
            if c == string_char && !is_escaped(bytes, i) {
                in_string = false;
            }
            i += 1;
            continue;
        }

        match c {
            b'"' | b'\'' | b'`' => {
                in_string = true;
                string_char = c;
            }
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
        i += 1;
    }

    None
}

/// Move the comments belonging to a `$:` reactive statement to where upstream
/// prints them.
///
/// Upstream replaces each reactive statement with a synthesized
/// `$.legacy_pre_effect(...)` call, so its comments have no node of their own
/// left, and esrap's comment cursor decides their fate twice over:
///
/// * a statement that survives after the `$:` flushes them as its leading
///   trivia, so they re-home onto it — here that is a copy re-inserted just past
///   the statement, since this pass emits the effect body from the same text;
/// * a `BlockStatement` *nested* inside the `$:` body keeps its source span, so
///   the cursor rewinds into it and prints the comment a second time, in place.
///   The `$:` body's own outermost block is rebuilt by `b.block(body)` and has
///   no span, so comments sitting directly in it do not come back.
///
/// `svelte-ignore` comments are left exactly where they are: later text passes
/// locate them by scanning backwards from the node they annotate.
///
/// String literals, template literals and their `${…}` interpolations are
/// tracked so a `$:` or `//` inside one is not mistaken for code.
pub(super) fn rehome_reactive_statement_comments(source: &str) -> String {
    let reactive_spans = reactive_statement_spans(source);
    if reactive_spans.is_empty() {
        return source.to_string();
    }
    relocate_comments_in_spans(source, &reactive_spans)
}

/// A top-level `$:` statement, with the byte ranges the rewrite needs.
struct ReactiveSpan {
    /// Start of the comment run leading the statement.
    leading: usize,
    /// The `$` of the label.
    label: usize,
    /// One past the statement, including a comment trailing it on the same line.
    end: usize,
    /// Whether a statement that survives into the output follows.
    has_successor: bool,
}

impl ReactiveSpan {
    /// The range whose comments this statement takes with it. With a surviving
    /// successor the leading run re-homes onto that successor on its own, so
    /// the range starts at the label instead.
    fn comment_range(&self) -> (usize, usize) {
        (
            if self.has_successor {
                self.label
            } else {
                self.leading
            },
            self.end,
        )
    }
}

/// Every top-level `$:` statement in `source`.
fn reactive_statement_spans(source: &str) -> Vec<ReactiveSpan> {
    let bytes = source.as_bytes();
    let len = bytes.len();
    // (leading-run start, label start, end)
    let mut spans: Vec<(usize, usize, usize)> = Vec::new();
    let mut scan = JsScan::new();
    let mut i = 0;
    // Byte just past the last code token, i.e. where a leading comment run may
    // start.
    let mut after_last_code = 0;
    // Same, but never advanced by a reactive statement: the end of the last
    // statement that survives into the output.
    let mut after_last_surviving_code = 0;

    while i < len {
        let starts_comment = scan.starts_comment(source, i);
        if let Some(next) = scan.step(source, i) {
            // A string is a code token, and so — for attachment purposes — is a
            // comment that trails code on the same line: it belongs to the
            // statement above, not to whatever follows.
            //
            // There is one deliberate exception. Upstream's client declaration
            // lowering does not flush a trailing `//` comment when its line is
            // ended by a lone CR or U+2028/U+2029. If the last thing after it is
            // a rebuilt `$:` statement, the span-less effect kills the cursor and
            // the comment disappears. CRLF follows the ordinary LF path.
            let exotic_line_comment_end = starts_comment
                && bytes.get(i + 1) == Some(&b'/')
                && has_non_lf_line_comment_end(bytes, next);
            let trails_code = starts_comment
                && !source[after_last_code..i].contains('\n')
                && !exotic_line_comment_end;
            if !starts_comment || trails_code {
                after_last_code = next;
                after_last_surviving_code = next;
            }
            i = next;
            continue;
        }
        if let Some(width) = line_terminator_len(bytes, i) {
            i += width;
            continue;
        }
        let c = bytes[i];
        if c.is_ascii_whitespace() {
            i += 1;
            continue;
        }
        // A `$:` label only starts a reactive statement at the top level of the
        // script, and only where a statement can begin.
        if c == b'$'
            && bytes.get(i + 1) == Some(&b':')
            && scan.depth == 0
            && statement_can_begin(&scan, bytes, after_last_code, i)
        {
            let end = reactive_statement_end(source, &mut scan, i + 2);
            let end = extend_over_trailing_comment(source, end);
            spans.push((after_last_code, i, end));
            i = end;
            after_last_code = end;
            continue;
        }
        // Bracket depth is what confines the scan to the script's top level;
        // `reactive_statement_end` maintains it only while inside a statement.
        match c {
            b'{' | b'(' | b'[' => scan.depth += 1,
            b'}' | b')' | b']' => scan.depth = scan.depth.saturating_sub(1),
            _ => {}
        }
        scan.note_code(c);
        i += 1;
        after_last_code = i;
        after_last_surviving_code = i;
    }

    let mut spans: Vec<ReactiveSpan> = spans
        .into_iter()
        .map(|(leading, label, end)| ReactiveSpan {
            leading,
            label,
            end,
            has_successor: after_last_surviving_code > end,
        })
        .collect();
    // The `$.legacy_pre_effect(…, () => { … })` upstream builds for the last
    // reactive statement carries a span-less block, and printing it parks esrap's
    // comment cursor past the end of the list. With no statement left to flush
    // them first, every comment after that statement dies with it.
    if let Some(last) = spans.last_mut()
        && !last.has_successor
    {
        last.end = source.len();
    }
    spans
}

/// Whether a statement can begin at `at`, `after_last_code` being the byte just
/// past the preceding code token. Besides the explicit boundaries, automatic
/// semicolon insertion makes a line terminator after a token that can end an
/// expression one too — `let bar` followed by a `$:` line is a labeled
/// statement just as much as `let bar;` is.
fn statement_can_begin(scan: &JsScan, bytes: &[u8], after_last_code: usize, at: usize) -> bool {
    match scan.last_code {
        None | Some(b';') | Some(b'{') | Some(b'}') => true,
        Some(c) => {
            (c.is_ascii_alphanumeric()
                || matches!(c, b'_' | b'$' | b')' | b']' | b'\'' | b'"' | b'`'))
                && contains_line_terminator(&bytes[after_last_code..at])
        }
    }
}

/// Byte just past the end of the reactive statement whose body starts at
/// `from`. A statement that opens a block ends with the matching `}`;
/// otherwise it ends at the next top-level `;`, or at a line break that can
/// only be a statement boundary.
fn reactive_statement_end(source: &str, scan: &mut JsScan, from: usize) -> usize {
    let bytes = source.as_bytes();
    let len = bytes.len();
    let base_depth = scan.depth;
    let mut opened_block = false;
    // A label's body is one statement, so nothing before its first code token
    // can end it — `$:` on a line of its own is not an empty statement.
    let mut body_started = false;
    let mut i = from;

    while i < len {
        let starts_comment = scan.starts_comment(source, i);
        if let Some(next) = scan.step(source, i) {
            body_started |= !starts_comment;
            i = next;
            continue;
        }
        if let Some(width) = line_terminator_len(bytes, i) {
            if body_started
                && scan.depth == base_depth
                && !opened_block
                && !continues_statement(scan.last_code)
                && !next_line_continues(source, i + width)
            {
                return i;
            }
            i += width;
            continue;
        }
        let c = bytes[i];
        if c.is_ascii_whitespace() {
            i += 1;
            continue;
        }
        body_started = true;
        match c {
            b'(' | b'[' => scan.depth += 1,
            b'{' => {
                scan.depth += 1;
                opened_block = true;
            }
            b')' | b']' => scan.depth = scan.depth.saturating_sub(1),
            b'}' => {
                scan.depth = scan.depth.saturating_sub(1);
                if scan.depth == base_depth && opened_block {
                    scan.note_code(c);
                    // `else`, `catch` and `finally` can never begin a statement,
                    // so a block closing in front of one has not ended the
                    // statement — `$: if (a) { … } else if (b) { … }` is one.
                    match continuation_keyword(source, i + 1) {
                        Some(at) => {
                            opened_block = false;
                            i = at;
                            continue;
                        }
                        None => return i + 1,
                    }
                }
            }
            b';' if scan.depth == base_depth => {
                scan.note_code(c);
                return i + 1;
            }
            _ => {}
        }
        scan.note_code(c);
        i += 1;
    }
    len
}

/// Where the `else` / `catch` / `finally` that continues a just-closed block
/// starts, skipping whitespace and comments. `do … while` is deliberately not
/// recognised: unlike these three, `while` also begins a statement, so absorbing
/// it would swallow the statement after a plain `$: { … }`.
fn continuation_keyword(source: &str, from: usize) -> Option<usize> {
    let bytes = source.as_bytes();
    let mut i = from;
    loop {
        match bytes.get(i) {
            Some(b) if b.is_ascii_whitespace() => i += 1,
            Some(b'/') if bytes.get(i + 1) == Some(&b'/') => {
                i = source[i..].find('\n').map_or(source.len(), |nl| i + nl + 1);
            }
            Some(b'/') if bytes.get(i + 1) == Some(&b'*') => {
                i = source[i + 2..]
                    .find("*/")
                    .map_or(source.len(), |end| i + 2 + end + 2);
            }
            _ => break,
        }
    }
    let rest = source.get(i..)?;
    ["else", "catch", "finally"]
        .iter()
        .find(|keyword| {
            rest.starts_with(*keyword)
                && !rest.as_bytes()[keyword.len()..]
                    .first()
                    .is_some_and(|b| b.is_ascii_alphanumeric() || matches!(b, b'_' | b'$'))
        })
        .map(|_| i)
}

/// Whether the next line continues the statement rather than starting a new
/// one — a leading `.`, `(` or operator, as in a chained call split across
/// lines.
fn next_line_continues(source: &str, from: usize) -> bool {
    let bytes = source.as_bytes();
    let mut i = from;
    loop {
        while matches!(
            bytes.get(i),
            Some(b' ') | Some(b'\t') | Some(b'\r') | Some(b'\n')
        ) {
            i += 1;
        }
        // Skip over comments between the two lines.
        match (bytes.get(i), bytes.get(i + 1)) {
            (Some(b'/'), Some(b'/')) => {
                while i < bytes.len() && bytes[i] != b'\n' {
                    i += 1;
                }
            }
            (Some(b'/'), Some(b'*')) => {
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(bytes.len());
            }
            _ => break,
        }
    }
    matches!(
        bytes.get(i),
        Some(
            b'.' | b')'
                | b']'
                | b','
                | b'?'
                | b':'
                | b'='
                | b'+'
                | b'-'
                | b'*'
                | b'/'
                | b'%'
                | b'&'
                | b'|'
                | b'^'
                | b'<'
                | b'>'
                | b'('
                | b'['
                | b'`'
        )
    )
}

/// Extend a statement's end over a comment that trails it on the same line.
/// Such a comment belongs to the statement being removed, so upstream drops it
/// too — and leaving it behind would strand it inside the generated call.
fn extend_over_trailing_comment(source: &str, end: usize) -> usize {
    let bytes = source.as_bytes();
    let mut i = end;
    while matches!(bytes.get(i), Some(b' ') | Some(b'\t')) {
        i += 1;
    }
    if bytes.get(i) != Some(&b'/') {
        return end;
    }
    match bytes.get(i + 1) {
        Some(b'/') => {
            let mut j = i + 2;
            while j < bytes.len() && line_terminator_len(bytes, j).is_none() {
                j += 1;
            }
            j
        }
        Some(b'*') => {
            let mut j = i + 2;
            while j + 1 < bytes.len() && !(bytes[j] == b'*' && bytes[j + 1] == b'/') {
                if bytes[j] == b'\n' {
                    return end;
                }
                j += 1;
            }
            (j + 2).min(bytes.len())
        }
        _ => end,
    }
}

/// Whether a statement can continue past a line break after this token.
fn continues_statement(last_code: Option<u8>) -> bool {
    matches!(
        last_code,
        None | Some(
            b'=' | b'+'
                | b'-'
                | b'*'
                | b'/'
                | b'%'
                | b'&'
                | b'|'
                | b'^'
                | b'!'
                | b'~'
                | b'<'
                | b'>'
                | b'?'
                | b':'
                | b','
                | b'.'
                | b'('
                | b'['
                | b'{'
        )
    )
}

/// Rebuild `source` with every comment that falls inside one of `spans` moved
/// to wherever upstream's comment cursor prints it.
fn relocate_comments_in_spans(source: &str, spans: &[ReactiveSpan]) -> String {
    let bytes = source.as_bytes();
    let len = bytes.len();
    // Comments to re-insert just past each span, in source order.
    let mut rehomed: Vec<Vec<&str>> = spans.iter().map(|_| Vec::new()).collect();
    // Ranges to blank out, as (start, end).
    let mut removed: Vec<(usize, usize)> = Vec::new();
    // A `$:` body's nested blocks, resolved on first use — parsing is only
    // worth it for a statement that actually holds a comment.
    let mut nested: Vec<Option<Vec<(usize, usize)>>> = spans.iter().map(|_| None).collect();
    let mut scan = JsScan::new();
    let mut i = 0;

    while i < len {
        let comment_start = i;
        let is_comment = scan.starts_comment(source, i);
        let Some(next) = scan.step(source, i) else {
            scan.note_code(bytes[i]);
            i += 1;
            continue;
        };
        i = next;
        if !is_comment {
            continue;
        }
        let text = &source[comment_start..i];
        if memmem::find(text.as_bytes(), b"svelte-ignore").is_some() {
            continue;
        }
        let Some(index) = spans.iter().position(|span| {
            let (start, end) = span.comment_range();
            comment_start >= start && comment_start < end
        }) else {
            continue;
        };
        let span = &spans[index];
        if span.has_successor {
            rehomed[index].push(text);
        }
        let blocks =
            nested[index].get_or_insert_with(|| nested_block_ranges(source, span.label, span.end));
        let kept_in_place = blocks
            .iter()
            .any(|&(start, end)| comment_start > start && i < end);
        if !kept_in_place {
            removed.push((comment_start, i));
        }
    }

    let mut result = String::with_capacity(source.len());
    let mut copy_start = 0;
    let mut removals = removed.into_iter().peekable();
    for (index, span) in spans.iter().enumerate() {
        while let Some(&(start, end)) = removals.peek() {
            if start >= span.end {
                break;
            }
            removals.next();
            result.push_str(&source[copy_start..start]);
            // Keep the line structure so later offset-based passes stay aligned.
            for byte in source[start..end].bytes() {
                if byte == b'\n' {
                    result.push('\n');
                }
            }
            copy_start = end;
        }
        if rehomed[index].is_empty() {
            continue;
        }
        result.push_str(&source[copy_start..span.end]);
        copy_start = span.end;
        let indent = successor_indent(source, span.end);
        for text in &rehomed[index] {
            result.push('\n');
            result.push_str(indent);
            result.push_str(text);
        }
    }
    for (start, end) in removals {
        result.push_str(&source[copy_start..start]);
        for byte in source[start..end].bytes() {
            if byte == b'\n' {
                result.push('\n');
            }
        }
        copy_start = end;
    }

    result.push_str(&source[copy_start..]);
    result
}

/// The indentation of the first line after `at` that holds anything — the line
/// the re-homed comment becomes leading trivia of.
fn successor_indent(source: &str, at: usize) -> &str {
    let rest = &source[at..];
    let offset = rest
        .find(|c: char| !c.is_whitespace())
        .map_or(rest.len(), |offset| at + offset);
    let line_start = source[..offset].rfind('\n').map_or(0, |nl| nl + 1);
    let line = &source[line_start..offset];
    &line[..line.len() - line.trim_start().len()]
}

/// The `BlockStatement` ranges nested inside the `$:` statement at
/// `[label, end)`, whose spans upstream keeps and whose comments therefore
/// survive in place. The statement's own outermost block is excluded: upstream
/// rebuilds it as a span-less `b.block(body)`.
///
/// An unparseable statement yields none, which drops its comments — the
/// behaviour before this pass learned to re-home them.
fn nested_block_ranges(source: &str, label: usize, end: usize) -> Vec<(usize, usize)> {
    use oxc_ast::ast::Statement;

    use oxc_ast_visit::Visit;

    let statement = &source[label..end];
    let allocator = Allocator::default();
    let mut parsed =
        oxc_parser::Parser::new(&allocator, statement, oxc_span::SourceType::mjs()).parse();
    if !parsed.diagnostics.is_empty() {
        parsed = oxc_parser::Parser::new(&allocator, statement, oxc_span::SourceType::ts()).parse();
        if !parsed.diagnostics.is_empty() {
            return Vec::new();
        }
    }
    let [Statement::LabeledStatement(labeled)] = parsed.program.body.as_slice() else {
        return Vec::new();
    };

    let mut collector = NestedBlocks {
        base: label,
        ranges: Vec::new(),
    };
    match &labeled.body {
        Statement::BlockStatement(block) => {
            for statement in &block.body {
                collector.visit_statement(statement);
            }
        }
        body => collector.visit_statement(body),
    }
    collector.ranges
}

struct NestedBlocks {
    base: usize,
    ranges: Vec<(usize, usize)>,
}

impl<'a> oxc_ast_visit::Visit<'a> for NestedBlocks {
    fn visit_block_statement(&mut self, it: &oxc_ast::ast::BlockStatement<'a>) {
        self.ranges.push((
            self.base + it.span.start as usize,
            self.base + it.span.end as usize,
        ));
        oxc_ast_visit::walk::walk_block_statement(self, it);
    }

    // ESTree — the shape esrap prints — has no `FunctionBody`; a function's
    // body is a `BlockStatement` there and resets the cursor like any other.
    fn visit_function_body(&mut self, it: &oxc_ast::ast::FunctionBody<'a>) {
        self.ranges.push((
            self.base + it.span.start as usize,
            self.base + it.span.end as usize,
        ));
        oxc_ast_visit::walk::walk_function_body(self, it);
    }
}

/// Shared scanner state for the string / template / comment shapes that must
/// not be read as code.
struct JsScan {
    in_string: bool,
    string_char: u8,
    template_interp: Vec<i32>,
    depth: i32,
    last_code: Option<u8>,
}

impl JsScan {
    fn new() -> Self {
        Self {
            in_string: false,
            string_char: b'"',
            template_interp: Vec::new(),
            depth: 0,
            last_code: None,
        }
    }

    fn note_code(&mut self, c: u8) {
        if !c.is_ascii_whitespace() {
            self.last_code = Some(c);
        }
    }

    /// Whether a comment begins at `i` — false inside a string, where `//` is
    /// just text.
    fn starts_comment(&self, source: &str, i: usize) -> bool {
        let bytes = source.as_bytes();
        !self.in_string && bytes[i] == b'/' && matches!(bytes.get(i + 1), Some(b'/') | Some(b'*'))
    }

    /// Consume a string, template literal or comment starting at `i`, returning
    /// the byte just past it. `None` when `i` is ordinary code.
    fn step(&mut self, source: &str, i: usize) -> Option<usize> {
        let bytes = source.as_bytes();
        let len = bytes.len();
        let c = bytes[i];

        if self.in_string {
            if self.string_char == b'`' && c == b'$' && bytes.get(i + 1) == Some(&b'{') {
                self.template_interp.push(0);
                self.in_string = false;
                return Some(i + 2);
            }
            if c == b'\\' && i + 1 < len {
                return Some(i + 2);
            }
            if c == self.string_char {
                self.in_string = false;
                self.last_code = Some(c);
            }
            return Some(i + 1);
        }

        if let Some(top) = self.template_interp.last_mut() {
            if c == b'{' {
                *top += 1;
                return Some(i + 1);
            }
            if c == b'}' {
                if *top == 0 {
                    self.template_interp.pop();
                    self.in_string = true;
                    self.string_char = b'`';
                } else {
                    *top -= 1;
                }
                return Some(i + 1);
            }
        }

        if c == b'\'' || c == b'"' || c == b'`' {
            self.in_string = true;
            self.string_char = c;
            return Some(i + 1);
        }

        if c == b'/' && bytes.get(i + 1) == Some(&b'/') {
            let mut end = i + 2;
            while end < len && line_terminator_len(bytes, end).is_none() {
                end += 1;
            }
            return Some(end);
        }

        if c == b'/' && bytes.get(i + 1) == Some(&b'*') {
            let mut end = i + 2;
            while end + 1 < len && !(bytes[end] == b'*' && bytes[end + 1] == b'/') {
                end += 1;
            }
            return Some((end + 2).min(len));
        }

        // A regex literal is opaque too: in `/^https?:\/\//` the escaped slash
        // and the closing slash are adjacent, and reading them as a comment
        // deleted the rest of the line.
        if c == b'/'
            && let Some((end, false)) = skip_opaque(bytes, i, self.last_code)
        {
            // A regex is an expression-ending token, like a closing paren.
            self.last_code = Some(b')');
            return Some(end);
        }

        None
    }
}

/// Width in bytes of an ECMAScript `LineTerminator` at `i`.
fn line_terminator_len(bytes: &[u8], i: usize) -> Option<usize> {
    match bytes.get(i) {
        Some(b'\n') => Some(1),
        Some(b'\r') if bytes.get(i + 1) == Some(&b'\n') => Some(2),
        Some(b'\r') => Some(1),
        Some(0xE2)
            if bytes.get(i + 1) == Some(&0x80) && matches!(bytes.get(i + 2), Some(0xA8 | 0xA9)) =>
        {
            Some(3)
        }
        _ => None,
    }
}

fn contains_line_terminator(bytes: &[u8]) -> bool {
    let mut i = 0;
    while i < bytes.len() {
        if line_terminator_len(bytes, i).is_some() {
            return true;
        }
        i += 1;
    }
    false
}

/// `end` is the first byte after a scanned line comment. Only the three line
/// endings for which upstream misses the declaration's trailing-comment flush
/// take the dead-cursor path; CRLF behaves like LF.
fn has_non_lf_line_comment_end(bytes: &[u8], end: usize) -> bool {
    (matches!(bytes.get(end), Some(b'\r')) && bytes.get(end + 1) != Some(&b'\n'))
        || matches!(line_terminator_len(bytes, end), Some(3))
}

/// Strip `/* $$async_noop... */;` placeholders from script output.
/// Used when async body transform returns None (no top-level await).
pub(super) fn strip_async_noop_placeholders(s: &str) -> String {
    // Fast path: if no $$async markers exist, return early
    if memmem::find(s.as_bytes(), b"$$async_noop").is_none()
        && memmem::find(s.as_bytes(), b"$$async_hole").is_none()
    {
        return s.to_string();
    }

    let mut result = String::with_capacity(s.len());
    let mut first = true;
    // Track whether previous line needs a semicolon appended
    let mut need_semicolon_on_prev = false;

    for line in s.lines() {
        let trimmed = line.trim();

        // Filter out $$async_noop placeholder lines (shape-checked: a user
        // string literal CONTAINING the marker text must survive, #3032).
        if crate::compiler::phases::phase3_transform::shared::async_body::is_placeholder_stmt(
            trimmed,
            "$$async_noop",
        ) {
            continue;
        }

        if need_semicolon_on_prev {
            // Insert semicolon before the newline of the previous content
            result.push(';');
            need_semicolon_on_prev = false;
        }

        if !first {
            result.push('\n');
        }
        first = false;

        // When there's no top-level await, $$async_hole markers (from $inspect()
        // removed in non-dev mode) should become two empty statements (;;) to match
        // the official compiler behavior.
        if crate::compiler::phases::phase3_transform::shared::async_body::is_placeholder_stmt(
            trimmed,
            "$$async_hole",
        ) {
            // Check if prev content needs a semicolon
            let prev_trimmed = result.trim_end();
            if !prev_trimmed.ends_with(';')
                && !prev_trimmed.ends_with('{')
                && !prev_trimmed.ends_with('}')
                && !prev_trimmed.ends_with(',')
                && !prev_trimmed.is_empty()
            {
                result.push(';');
            }
            // Marked so `to_oxc` can tell this pair from a `;;` the USER wrote,
            // which esrap drops.
            result.push_str("/* $$inspect_removed$$ */;;");
        } else {
            result.push_str(line);
        }
    }

    result
}

/// Extract variable names from a $props() destructuring pattern.
/// e.g., "const { name, age } = $props()" -> ["name", "age"]
/// e.g., "let { a: b, c = 1 } = $props()" -> ["b", "c"]
pub(super) fn extract_destructured_prop_names(statement: &str) -> Vec<String> {
    let trimmed = statement.trim();

    // Look for pattern: (const|let|var) { ... } = $props(...)
    let brace_start = match trimmed.find('{') {
        Some(pos) => pos,
        None => return vec![],
    };

    let brace_end = match trimmed.find('}') {
        Some(pos) => pos,
        None => return vec![],
    };

    if brace_start >= brace_end {
        return vec![];
    }

    let inner = &trimmed[brace_start + 1..brace_end];
    let mut names = Vec::new();

    for part in inner.split(',') {
        let part = part.trim();
        if part.is_empty() {
            continue;
        }

        // Handle "...rest" pattern
        if let Some(rest) = part.strip_prefix("...") {
            names.push(rest.trim().to_string());
            continue;
        }

        // Handle "key: alias" or "key: alias = default" pattern
        if let Some(colon_pos) = part.find(':') {
            let after_colon = part[colon_pos + 1..].trim();
            // May have default: "alias = default"
            let alias = if let Some(eq_pos) = after_colon.find('=') {
                after_colon[..eq_pos].trim()
            } else {
                after_colon
            };
            names.push(alias.to_string());
            continue;
        }

        // Handle "name = default" pattern
        if let Some(eq_pos) = part.find('=') {
            names.push(part[..eq_pos].trim().to_string());
            continue;
        }

        // Simple name
        names.push(part.to_string());
    }

    names
}

/// Normalize raw JavaScript formatting using OXC parser and codegen.
///
/// Detect the common base indentation shared by all non-empty, non-first lines.
/// Skips the first line because normalize_js_with_oxc doesn't add indent to it
/// (the codegen's emit_statement handles first-line indentation).
/// After trim(), the first line often has 0 indent which would defeat detection.
fn detect_base_indent(code: &str) -> usize {
    let mut min_indent: Option<usize> = None;
    for (i, line) in code.lines().enumerate() {
        if i == 0 || line.trim().is_empty() {
            continue;
        }
        let indent = line.len() - line.trim_start().len();
        min_indent = Some(min_indent.map_or(indent, |m: usize| m.min(indent)));
    }
    min_indent.unwrap_or(0)
}

/// Strip `base_indent` characters from the start of a line.
fn strip_indent(line: &str, base_indent: usize) -> &str {
    if base_indent == 0 || line.len() <= base_indent {
        return line;
    }
    // Only strip if the line has enough leading whitespace
    let leading = line.len() - line.trim_start().len();
    if leading >= base_indent {
        &line[base_indent..]
    } else {
        line.trim_start()
    }
}

/// esrap elides `ParenthesizedExpression` (acorn does too), so a one-dependency
/// `$.legacy_pre_effect(() => (dep), …)` thunk would lose its parens across this
/// round-trip; rebuild it as the one-element sequence upstream emits.
fn restore_pre_effect_thunk_parens<'a>(
    program: &mut oxc_ast::ast::Program<'a>,
    allocator: &'a Allocator,
) {
    use oxc_allocator::{ArenaVec, ReplaceWith};
    use oxc_ast::ast::{Argument, Expression, SequenceExpression, Statement};

    let ab = oxc_ast::builder::AstBuilder::new(allocator);
    for stmt in program.body.iter_mut() {
        let Statement::ExpressionStatement(es) = stmt else {
            continue;
        };
        let Expression::CallExpression(call) = &mut es.expression else {
            continue;
        };
        let Expression::StaticMemberExpression(m) = &call.callee else {
            continue;
        };
        if !matches!(&m.object, Expression::Identifier(id) if id.name == "$")
            || m.property.name != "legacy_pre_effect"
        {
            continue;
        }
        let Some(Argument::ArrowFunctionExpression(arrow)) = call.arguments.first_mut() else {
            continue;
        };
        let Some(body) = arrow.get_expression_mut() else {
            continue;
        };
        // A multi-dependency thunk is already `Paren(Sequence)` and prints its own parens.
        if !matches!(&*body, Expression::ParenthesizedExpression(p)
            if !matches!(p.expression, Expression::SequenceExpression(_)))
        {
            continue;
        }
        body.replace_with(|e| {
            let Expression::ParenthesizedExpression(p) = e else {
                unreachable!()
            };
            // Keep the paren's own span so comment placement is unchanged.
            let span = p.span;
            Expression::SequenceExpression(SequenceExpression::boxed(
                span,
                ArenaVec::from_value_in(p.unbox().expression, &ab),
                &ab,
            ))
        });
    }
}

/// Parses the input as JavaScript, then reprints it with OXC's codegen to normalize:
/// - Spacing around operators (e.g., `let x=0` -> `let x = 0`)
/// - Spacing before braces (e.g., `function f(){` -> `function f() {`)
/// - Consistent semicolons and whitespace
///
/// If parsing fails, returns the original input unchanged.
/// The output uses single quotes, tab indentation, and strips comments
/// (matching esrap/Svelte compiler behavior).
pub(crate) fn normalize_js_with_oxc(js: &str, indent_level: usize) -> String {
    // Fast path: skip OXC parse+codegen for scripts without JSDoc or await.
    // JSDoc comments need OXC to fix indentation (tab+space before *).
    // await scripts go through async_body transform which needs OXC formatting.
    let needs_oxc = memmem::find(js.as_bytes(), b"/**").is_some()
        || memmem::find(js.as_bytes(), b"*/").is_some()
        || memmem::find(js.as_bytes(), b"await ").is_some();

    if !needs_oxc {
        // Skip ALL OXC-specific post-processing since those fix OXC artifacts
        let code = js.trim_end();
        let code = rejoin_inspect_empty_stmts(code);
        let code = strip_empty_statements_from_js(&code);

        if indent_level == 0 {
            return code;
        }

        // Strip the common base indentation from the source before applying target indent.
        // Script content retains its original indentation (e.g., tabs from Svelte source).
        // We must remove that base indent first, then apply the target indent level.
        let base_indent = detect_base_indent(&code);

        // Apply indentation for non-first lines
        // Build directly into a single String to avoid Vec<String> + join overhead
        let indent_str: &str = match indent_level {
            1 => "\t",
            2 => "\t\t",
            3 => "\t\t\t",
            _ => &"\t".repeat(indent_level),
        };
        let mut result = String::with_capacity(code.len() + code.lines().count() * indent_level);
        // Use the full template/interpolation stack, not a `bool`: a multi-line
        // `${ … }` interpolation (the `[Template, Interp]` state) cannot be
        // represented by a single bool, which then desyncs and mis-indents the
        // continuation lines of a LATER template literal's string content. This
        // mirrors the slow path below.
        let mut stack: Vec<TemplateStateFrame> = Vec::new();
        for (i, line) in code.lines().enumerate() {
            if i > 0 {
                result.push('\n');
            }
            let in_template_literal = in_string_content(&stack);
            if i == 0 {
                let stripped = strip_indent(line, base_indent);
                update_template_literal_stack(stripped, &mut stack);
                result.push_str(stripped);
            } else if line.is_empty() {
                // empty line, nothing to push
            } else if in_template_literal {
                update_template_literal_stack(line, &mut stack);
                result.push_str(line);
            } else {
                let stripped = strip_indent(line, base_indent);
                update_template_literal_stack(stripped, &mut stack);
                result.push_str(indent_str);
                result.push_str(stripped);
            }
        }
        return result;
    }

    // Slow path: parse and re-print with the `rsvelte_esrap` printer — the
    // printer the official Svelte compiler uses (esrap). It preserves literal
    // raw spellings (quotes, numbers), threads comments positionally (with the
    // ` * ` block-comment dedent), keeps short arrays inline, applies esrap's
    // blank-line margins, and emits `[a,, b]` holes directly — so the entire
    // tail of oxc_codegen string fix-ups (`restore_original_quotes`,
    // `restore_number_literals`, `restore_block_comment_alignment`,
    // `join_oxc_multiline_arrays`, `add_esrap_blank_lines`,
    // `remove_blank_lines_before_closing_braces`, `fix_array_holes`,
    // `rejoin_tmp_destructure_declarations`) is no longer needed.
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    // Preserve `;;` markers ($inspect-removal empty-statement pairs) across the
    // parse+print: both oxc and esrap drop empty statements, so smuggle them as
    // a void-expression pair and restore afterwards. Single-quoted to match
    // esrap's preserved quote style.
    const DOUBLE_SEMI_PLACEHOLDER: &str = "void '$$DOUBLE_SEMI$$';void '$$DOUBLE_SEMI$$'";
    let has_double_semi = memmem::find(js.as_bytes(), b";;").is_some();
    let protected = if has_double_semi {
        js.replace(";;", DOUBLE_SEMI_PLACEHOLDER)
    } else {
        js.to_string()
    };

    // Use thread-local allocator to avoid repeated allocation overhead
    let code = with_normalize_allocator(|allocator| {
        let _pt = super::super::profile::timer_start();
        let mut parsed = Parser::new(allocator, &protected, SourceType::mjs()).parse();
        super::super::profile::record_direct_parse(
            super::super::profile::timer_elapsed(_pt),
            protected.len(),
        );
        if !parsed.diagnostics.is_empty() {
            return js.to_string();
        }
        restore_pre_effect_thunk_parens(&mut parsed.program, allocator);
        let _t = super::super::profile::timer_start();
        let printed = rsvelte_esrap::print(&parsed.program, &protected);
        super::super::profile::record_esrap_normalize(super::super::profile::timer_elapsed(_t));
        printed
    });

    // Restore `;;` after esrap has chosen its own whitespace between the pair.
    let code = if has_double_semi {
        restore_double_semi_placeholder(&code)
    } else {
        code
    };

    if indent_level == 0 {
        return code;
    }

    // The raw statement goes inside a function body. The codegen's emit_statement
    // adds self.indent() before the FIRST line only. Subsequent lines in the Raw block
    // don't get automatic indentation. We need to re-add the original source-level
    // indentation to non-first lines so the output matches the expected format.
    //
    // IMPORTANT: We must NOT add indentation to lines inside template literals (backticks),
    // because that would modify the template content. Template literal content should
    // preserve its original indentation exactly as-is.
    let mut result_lines = Vec::new();
    let indent_str: String = "\t".repeat(indent_level);
    // Use a persistent stack so we correctly preserve state across lines,
    // including inside nested template literals (e.g. `${`...`}`). A simple
    // `bool` cannot represent whether we are in a nested Template vs an
    // outer Template, so we thread the full stack through.
    let mut stack: Vec<TemplateStateFrame> = Vec::new();
    for (i, line) in code.lines().enumerate() {
        let in_template_at_start = in_string_content(&stack);
        if i == 0 {
            // First line gets indent from emit_statement's self.indent()
            update_template_literal_stack(line, &mut stack);
            result_lines.push(line.to_string());
        } else if line.is_empty() {
            result_lines.push(String::new());
        } else if in_template_at_start {
            // Inside a template literal - preserve content exactly as-is
            update_template_literal_stack(line, &mut stack);
            result_lines.push(line.to_string());
        } else {
            // Subsequent lines need the source-level indentation prefix
            update_template_literal_stack(line, &mut stack);
            result_lines.push(format!("{}{}", indent_str, line));
        }
    }
    result_lines.join("\n")
}

fn restore_double_semi_placeholder(code: &str) -> String {
    const TOKEN: &str = "void '$$DOUBLE_SEMI$$';";
    let mut output = String::with_capacity(code.len());
    let mut rest = code;

    while let Some(first) = memmem::find(rest.as_bytes(), TOKEN.as_bytes()) {
        output.push_str(&rest[..first]);
        let after_first = &rest[first + TOKEN.len()..];
        let whitespace = after_first.len() - after_first.trim_start().len();
        if after_first[whitespace..].starts_with(TOKEN) {
            output.push_str(";;");
            rest = &after_first[whitespace + TOKEN.len()..];
        } else {
            output.push_str(TOKEN);
            rest = after_first;
        }
    }
    output.push_str(rest);
    output
}

/// Track whether we're inside a template literal by counting unescaped backticks on a line.
///
/// This is used by `normalize_js_with_oxc` to avoid adding indentation to content
/// inside template literals, which would modify the template content.
/// A single frame in the template-literal / interpolation parser stack.
#[derive(Clone, Copy)]
pub(super) enum TemplateStateFrame {
    /// We are inside the text portion of a template literal.
    Template,
    /// We are inside a `${...}` expression. The u32 counts `{`/`}` pairs
    /// (not counting the outer `${`'s matching `}`).
    Interp(u32),
    /// We are inside a `'…'` / `"…"` string that a line continuation carried
    /// past the end of a line. The byte is the quote character. Everything up
    /// to the closing quote is string *content*, so it must not be indented.
    Quoted(u8),
    /// We are inside a `/* … */` block comment. A backtick or quote in there is
    /// text, not a delimiter — without this frame a `` ` `` in a doc comment
    /// opened a template literal and every line after it stopped being indented.
    BlockComment,
}

/// Is the next line's first character inside a string, and therefore content
/// that must be reproduced byte-for-byte rather than indented? Every re-indenter
/// in this pipeline asks exactly this, so they ask it here.
pub(super) fn in_string_content(stack: &[TemplateStateFrame]) -> bool {
    // A block comment is not content: esrap re-indents a comment's lines too.
    matches!(
        stack.last(),
        Some(TemplateStateFrame::Template) | Some(TemplateStateFrame::Quoted(_))
    )
}

/// What a quote character at some offset turned out to be.
enum Quote {
    /// A string that opens and closes on this line; the offset is just past it.
    Closed(usize),
    /// A string carried to the next line by a trailing `\`.
    Continued,
    /// Neither — an apostrophe in a comment, a quote inside a regex literal,
    /// or any other byte this line-at-a-time scanner has no context for. The
    /// character is not a string opener and must not push a frame.
    NotAString,
}

/// Scan from the byte after an opening quote to just past the closing one.
///
/// A string may only cross a line break through a line continuation, so a run
/// to the end of the line is `Continued` when the last byte is the escaping
/// backslash and `NotAString` otherwise. Treating every unterminated quote as
/// a carried string is what a comment containing `isn't` breaks.
fn scan_quoted(bytes: &[u8], mut i: usize, quote: u8) -> Quote {
    let len = bytes.len();
    while i < len {
        if bytes[i] == b'\\' {
            if i + 1 == len {
                return Quote::Continued;
            }
            i += 2;
            continue;
        }
        if bytes[i] == quote {
            return Quote::Closed(i + 1);
        }
        i += 1;
    }
    Quote::NotAString
}

/// Stack-based template/interpolation tracker. Mutates `stack` as the line
/// is scanned.
pub(super) fn update_template_literal_stack(line: &str, stack: &mut Vec<TemplateStateFrame>) {
    let bytes = line.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    while i < len {
        let c = bytes[i];
        match stack.last().copied() {
            Some(TemplateStateFrame::BlockComment) => {
                match line[i..].find("*/") {
                    Some(offset) => {
                        stack.pop();
                        i += offset + 2;
                    }
                    // Unterminated on this line: the frame carries to the next.
                    None => return,
                }
                continue;
            }
            Some(TemplateStateFrame::Quoted(quote)) => {
                match scan_quoted(bytes, i, quote) {
                    Quote::Closed(next) => {
                        stack.pop();
                        i = next;
                    }
                    Quote::Continued | Quote::NotAString => return,
                }
                continue;
            }
            Some(TemplateStateFrame::Template) => {
                if c == b'\\' {
                    i += 2;
                    continue;
                } else if c == b'`' {
                    stack.pop();
                    i += 1;
                    continue;
                } else if c == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                    stack.push(TemplateStateFrame::Interp(0));
                    i += 2;
                    continue;
                }
                i += 1;
            }
            Some(TemplateStateFrame::Interp(_)) => {
                if c == b'\\' {
                    i += 1;
                    continue;
                } else if c == b'\'' || c == b'"' {
                    match scan_quoted(bytes, i + 1, c) {
                        Quote::Closed(next) => i = next,
                        Quote::Continued => {
                            stack.push(TemplateStateFrame::Quoted(c));
                            return;
                        }
                        Quote::NotAString => i += 1,
                    }
                    continue;
                } else if c == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
                    stack.push(TemplateStateFrame::BlockComment);
                    i += 2;
                    continue;
                } else if c == b'`' {
                    stack.push(TemplateStateFrame::Template);
                    i += 1;
                    continue;
                } else if c == b'{' {
                    if let Some(TemplateStateFrame::Interp(d)) = stack.last_mut() {
                        *d += 1;
                    }
                    i += 1;
                    continue;
                } else if c == b'}' {
                    if let Some(TemplateStateFrame::Interp(d)) = stack.last_mut() {
                        if *d == 0 {
                            stack.pop();
                            i += 1;
                            continue;
                        }
                        *d -= 1;
                    }
                    i += 1;
                    continue;
                }
                i += 1;
            }
            None => {
                if c == b'\'' || c == b'"' {
                    match scan_quoted(bytes, i + 1, c) {
                        Quote::Closed(next) => i = next,
                        Quote::Continued => {
                            stack.push(TemplateStateFrame::Quoted(c));
                            return;
                        }
                        Quote::NotAString => i += 1,
                    }
                    continue;
                } else if c == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
                    break;
                } else if c == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
                    stack.push(TemplateStateFrame::BlockComment);
                    i += 2;
                    continue;
                } else if c == b'`' {
                    stack.push(TemplateStateFrame::Template);
                    i += 1;
                    continue;
                }
                i += 1;
            }
        }
    }
}

/// Strip standalone empty statements (`;` on its own line) from JavaScript code.
///
/// OXC sometimes emits standalone semicolons that the Svelte compiler doesn't produce.
/// This removes lines that consist only of whitespace followed by `;`.
/// Lines with `;;` (from $inspect() removal) are kept as-is.
pub(super) fn strip_empty_statements_from_js(code: &str) -> String {
    // Quick pre-check: if there's no standalone `;` possibility (no newline followed by
    // optional whitespace and `;`), skip the expensive line-by-line processing.
    // We check for `\n;` or a code that starts with `;` (first line could be bare `;`).
    if !code.starts_with(';')
        && memmem::find(code.as_bytes(), b"\n;").is_none()
        && memmem::find(code.as_bytes(), b"\n\t;").is_none()
    {
        return code.to_string();
    }

    let lines: Vec<&str> = code.lines().collect();
    let result: Vec<&str> = lines
        .into_iter()
        .filter(|line| {
            let trimmed = line.trim();
            // Keep lines that are not just a single `;`
            // Keep `;;` which comes from $inspect() removal
            trimmed != ";"
        })
        .collect();
    result.join("\n")
}

/// Rejoin consecutive `;` lines that OXC split from `;;` (from $inspect() removal).
///
/// When $inspect() is removed in non-dev mode, it produces `;;`. OXC then parses this
/// as two EmptyStatements and outputs them as two separate `;` lines. We rejoin them
/// back to `;;` so they survive the empty-statement stripping.
pub(super) fn rejoin_inspect_empty_stmts(code: &str) -> String {
    // Quick pre-check: if there's no `;\n` pattern, there can't be consecutive `;` lines
    if memmem::find(code.as_bytes(), b";\n").is_none() {
        return code.to_string();
    }

    let lines: Vec<&str> = code.lines().collect();
    let mut result: Vec<String> = Vec::with_capacity(lines.len());
    let mut i = 0;
    while i < lines.len() {
        if lines[i].trim() == ";" && i + 1 < lines.len() && lines[i + 1].trim() == ";" {
            // Rejoin consecutive `;` lines into `;;`
            let indent = &lines[i][..lines[i].len() - lines[i].trim_start().len()];
            result.push(format!("{};;", indent));
            i += 2;
        } else {
            result.push(lines[i].to_string());
            i += 1;
        }
    }
    result.join("\n")
}

#[cfg(test)]
mod reactive_comment_tests {
    use super::rehome_reactive_statement_comments;

    #[track_caller]
    fn assert_kept(source: &str) {
        assert_eq!(rehome_reactive_statement_comments(source), source);
    }

    #[test]
    fn keeps_comments_that_belong_to_surviving_statements() {
        assert_kept("/** @type {number} */\nlet x = 1;\n$: y = x;\n");
        assert_kept("let x = 1; // trailing\n$: y = x;\n");
        assert_kept("// leading the whole script\nlet x = 1;\n$: y = x;\n");
    }

    /// Upstream does not flush the declaration's trailing comment for these
    /// three line endings. The last reactive statement is rebuilt without a
    /// location, so its effect kills the still-pending comment cursor.
    #[test]
    fn drops_an_exotic_line_comment_before_the_last_reactive_statement() {
        for terminator in ["\r", "\u{2028}", "\u{2029}"] {
            let source = format!("let x = 1; // gone{terminator}$: y = x;{terminator}");
            let out = rehome_reactive_statement_comments(&source);
            assert!(
                !out.contains("// gone"),
                "terminator {terminator:?}: {out:?}"
            );
            assert!(
                out.contains("$: y = x;"),
                "terminator {terminator:?}: {out:?}"
            );
        }
    }

    /// LF and CRLF take esrap's normal trailing-comment path, and a later
    /// located statement revives the cursor even after an exotic terminator.
    #[test]
    fn keeps_the_controls_for_an_exotic_reactive_comment() {
        assert_kept("let x = 1; // kept\n$: y = x;\n");
        assert_kept("let x = 1; // kept\r\n$: y = x;\r\n");
        for terminator in ["\r", "\u{2028}", "\u{2029}"] {
            let source = format!("let x = 1; // kept{terminator}$: y = x;{terminator}let z = 2;");
            assert_eq!(
                rehome_reactive_statement_comments(&source),
                source,
                "terminator {terminator:?}"
            );
        }
    }

    #[test]
    fn drops_the_comments_leading_a_last_reactive_statement() {
        let out = rehome_reactive_statement_comments("let x = 1;\n// note\n$: y = x;\n");
        assert_eq!(out, "let x = 1;\n\n$: y = x;\n");
    }

    #[test]
    fn keeps_the_comments_leading_a_reactive_statement_that_has_a_successor() {
        // esrap re-homes them onto `let z`, so they do reach the output.
        assert_kept("let x = 1;\n// note\n$: y = x;\nlet z = 2;\n");
        assert_kept("let x = 1;\n// note\n$: y = x;\n$: w = y;\nlet z = 2;\n");
    }

    #[test]
    fn drops_comments_inside_a_reactive_block() {
        let out = rehome_reactive_statement_comments("$: {\n\t// inner\n\ty = 1;\n}\n");
        assert_eq!(out, "$: {\n\t\n\ty = 1;\n}\n");
    }

    #[test]
    fn drops_comments_after_a_semicolon_less_predecessor() {
        let out = rehome_reactive_statement_comments("let y\n$: {\n\t// inner\n\ty = 1;\n}\n");
        assert_eq!(out, "let y\n$: {\n\t\n\ty = 1;\n}\n");
    }

    #[test]
    fn a_conditional_consequent_is_not_a_reactive_statement() {
        let source = "let y = c ?\n/* keep */\n$: 1;\n";
        assert_eq!(rehome_reactive_statement_comments(source), source);
    }

    /// The ASI accept side, on the other token classes that can end an
    /// expression — a bare `?` is not the only byte that has to be rejected.
    #[test]
    fn any_token_that_can_end_an_expression_opens_a_statement() {
        for predecessor in ["f()", "xs[0]", "y", "1", "_x", "$x", "'s'", "`t`"] {
            let source = format!("{predecessor}\n$: {{\n\t// inner\n\ty = 1;\n}}\n");
            let expected = format!("{predecessor}\n$: {{\n\t\n\ty = 1;\n}}\n");
            assert_eq!(
                rehome_reactive_statement_comments(&source),
                expected,
                "predecessor: {predecessor}"
            );
        }
    }

    /// The ASI reject side: an operator cannot end an expression, so the next
    /// line continues it rather than starting a labeled statement.
    #[test]
    fn an_operator_does_not_open_a_statement() {
        for predecessor in ["let y = c ?", "let y = a +", "let y =", "let y = a,"] {
            let source = format!("{predecessor}\n/* keep */\n$: 1;\n");
            assert_eq!(
                rehome_reactive_statement_comments(&source),
                source,
                "predecessor: {predecessor}"
            );
        }
    }

    /// The newline term: without a line terminator there is no ASI, so the
    /// `$:` cannot be a statement start however its predecessor ends.
    #[test]
    fn a_same_line_predecessor_does_not_open_a_statement() {
        let source = "let y = a $: /* keep */ 1;\n";
        assert_eq!(rehome_reactive_statement_comments(source), source);
    }

    /// `$` is an ordinary object key, and `,` sits at bracket depth — upstream
    /// only treats a `$:` at the script's top level as reactive.
    #[test]
    fn an_object_literal_key_is_not_a_reactive_statement() {
        let source = "let o = {\n\ta: 1,\n\t/* keep */\n\t$: 2\n};\n";
        assert_eq!(rehome_reactive_statement_comments(source), source);
    }

    /// The `if`'s consequent keeps its source span, so upstream's cursor rewinds
    /// into it after re-homing the comment and prints it a second time.
    #[test]
    fn rehomes_and_keeps_a_comment_inside_a_reactive_if_block() {
        let out = rehome_reactive_statement_comments(
            "$: if (a) {\n\t/* inner */\n\tb = 1;\n}\nlet z = 1; // kept\n",
        );
        assert_eq!(
            out,
            "$: if (a) {\n\t/* inner */\n\tb = 1;\n}\n/* inner */\nlet z = 1; // kept\n"
        );
    }

    /// The `$:` body's own block is rebuilt as a span-less `b.block(body)`, so a
    /// comment sitting directly in it only reaches the successor.
    #[test]
    fn moves_a_comment_out_of_the_reactive_block_itself() {
        let out =
            rehome_reactive_statement_comments("$: {\n\t/* inner */\n\ty = 1;\n}\nlet z = 1;\n");
        assert_eq!(out, "$: {\n\t\n\ty = 1;\n}\n/* inner */\nlet z = 1;\n");
    }

    /// An object literal is not a `BlockStatement`, so its braces do not make the
    /// comment survive in place.
    #[test]
    fn an_object_literal_brace_does_not_keep_a_comment_in_place() {
        let out = rehome_reactive_statement_comments(
            "$: {\n\ty = {\n\t\t/* inner */\n\t\ta: 1\n\t};\n}\nlet z = 1;\n",
        );
        assert_eq!(
            out,
            "$: {\n\ty = {\n\t\t\n\t\ta: 1\n\t};\n}\n/* inner */\nlet z = 1;\n"
        );
    }

    /// Nothing survives after, so there is nowhere to re-home to — but the
    /// nested block still keeps its copy.
    #[test]
    fn keeps_a_nested_block_comment_with_no_successor() {
        let source = "$: if (a) {\n\t/* inner */\n\tb = 1;\n}\n";
        assert_eq!(rehome_reactive_statement_comments(source), source);
    }

    #[test]
    fn rehomes_every_comment_in_source_order() {
        let out = rehome_reactive_statement_comments(
            "$: {\n\t/* one */\n\ty = 1;\n\t/* two */\n}\nlet z = 1;\n",
        );
        assert_eq!(
            out,
            "$: {\n\t\n\ty = 1;\n\t\n}\n/* one */\n/* two */\nlet z = 1;\n"
        );
    }

    #[test]
    fn a_reactive_statement_without_a_semicolon_ends_at_the_line() {
        let out = rehome_reactive_statement_comments("$: y = x\n// after, kept\nlet z = 1;\n");
        assert_eq!(out, "$: y = x\n// after, kept\nlet z = 1;\n");
    }

    #[test]
    fn keeps_svelte_ignore_even_on_a_reactive_statement() {
        assert_kept("let x = 1;\n// svelte-ignore state_referenced_locally\n$: y = x;\n");
    }

    #[test]
    fn ignores_dollar_colon_inside_strings_and_templates() {
        assert_kept("let a = '$: not code';\n// kept\nlet b = 1;\n");
        assert_kept("let a = `${x}$: still not code`;\n// kept\nlet b = 1;\n");
        assert_kept("let a = 'a // not a comment';\n// kept\nlet b = 1;\n");
    }

    /// Upstream bails on `context.path.length > 1`, so even a `$:` — not just a
    /// label that could never be confused for one — is plain inside a function.
    #[test]
    fn a_label_inside_a_function_body_is_not_a_reactive_statement() {
        assert_kept("function f() {\n\t// kept\n\tlab: for (;;) break lab;\n}\n");
        assert_kept("function f() {\n\tlet a = 1\n\t$: {\n\t\t/* keep */\n\t\ta = 2;\n\t}\n}\n");
    }

    #[test]
    fn line_structure_survives_so_later_offset_passes_stay_aligned() {
        let source = "let x = 1;\n/* multi\n   line */\n$: y = x;\n";
        let out = rehome_reactive_statement_comments(source);
        assert_eq!(out.lines().count(), source.lines().count());
    }
}

#[cfg(test)]
mod reactive_trailing_comment_tests {
    use super::rehome_reactive_statement_comments;

    #[test]
    fn rehomes_a_comment_trailing_the_reactive_statement_itself() {
        // Left in place it lands inside the generated `legacy_pre_effect` call
        // and the output stops being parseable.
        let out =
            rehome_reactive_statement_comments("$: double = count * 2; // this too\nlet x = 1;\n");
        assert_eq!(out, "$: double = count * 2; \n// this too\nlet x = 1;\n");
    }

    #[test]
    fn rehomes_a_block_comment_trailing_on_the_same_line() {
        let out =
            rehome_reactive_statement_comments("$: y = x; /* trailing */\nlet z = 1; // kept\n");
        assert_eq!(out, "$: y = x; \n/* trailing */\nlet z = 1; // kept\n");
    }

    #[test]
    fn keeps_a_comment_on_the_line_after_a_reactive_statement() {
        let source = "$: y = x;\n// belongs to the next statement\nlet z = 1;\n";
        assert_eq!(rehome_reactive_statement_comments(source), source);
    }

    #[test]
    fn rehomes_a_comment_trailing_a_reactive_block() {
        let out = rehome_reactive_statement_comments("$: {\n\ty = 1;\n} // trailing\nlet z = 1;\n");
        assert_eq!(out, "$: {\n\ty = 1;\n} \n// trailing\nlet z = 1;\n");
    }
}

#[cfg(test)]
mod double_semi_placeholder_tests {
    use super::restore_double_semi_placeholder;

    #[test]
    fn restores_a_pair_separated_by_blank_lines() {
        assert_eq!(
            restore_double_semi_placeholder("void '$$DOUBLE_SEMI$$';\n\nvoid '$$DOUBLE_SEMI$$';"),
            ";;"
        );
    }

    #[test]
    fn leaves_a_single_placeholder_unchanged() {
        assert_eq!(
            restore_double_semi_placeholder("void '$$DOUBLE_SEMI$$';"),
            "void '$$DOUBLE_SEMI$$';"
        );
    }
}

#[cfg(test)]
mod reactive_multiline_tests {
    use super::rehome_reactive_statement_comments;

    /// Ending the statement at the first newline would leave the trailing `;`
    /// outside the statement. The arrow body is a `BlockStatement`, so its
    /// comment is both kept in place and re-homed.
    #[test]
    fn a_chained_call_split_across_lines_is_one_statement() {
        let out = rehome_reactive_statement_comments(
            "$: filtered = rows\n\t.filter(r => {\n\t\t// inner\n\t\treturn true;\n\t});\nlet z = 1; // kept\n",
        );
        assert_eq!(
            out,
            "$: filtered = rows\n\t.filter(r => {\n\t\t// inner\n\t\treturn true;\n\t});\n// inner\nlet z = 1; // kept\n"
        );
    }

    #[test]
    fn an_operator_at_the_end_of_a_line_continues_the_statement() {
        let out = rehome_reactive_statement_comments(
            "$: total = a +\n\tb; // trailing\nlet z = 1; // kept\n",
        );
        assert_eq!(
            out,
            "$: total = a +\n\tb; \n// trailing\nlet z = 1; // kept\n"
        );
    }
}

#[cfg(test)]
mod quote_frame_tests {
    use super::{TemplateStateFrame, in_string_content, update_template_literal_stack};

    fn state_after(lines: &[&str]) -> Vec<TemplateStateFrame> {
        let mut stack = Vec::new();
        for line in lines {
            update_template_literal_stack(line, &mut stack);
        }
        stack
    }

    /// A fenced code sample in a JSDoc block puts backticks in a comment. Read
    /// as template-literal delimiters they opened a string that swallowed the
    /// rest of the comment, so every line after it lost its indentation.
    #[test]
    fn a_backtick_in_a_block_comment_is_not_a_template_literal() {
        let stack = state_after(&["\t/**", "\t * @example", "\t * ```svelte", "\t * <A />"]);
        assert!(matches!(
            stack.as_slice(),
            [TemplateStateFrame::BlockComment]
        ));
        assert!(!in_string_content(&stack));
    }

    #[test]
    fn a_block_comment_frame_ends_at_its_terminator() {
        assert!(state_after(&["/* ` */ const a = 1;"]).is_empty());
    }

    #[test]
    fn a_backtick_after_a_block_comment_still_opens_a_template() {
        let stack = state_after(&["/* ` */ const a = `x"]);
        assert!(matches!(stack.as_slice(), [TemplateStateFrame::Template]));
        assert!(in_string_content(&stack));
    }

    /// The reverse direction: a `/*` inside a template literal is text.
    #[test]
    fn a_block_comment_opener_inside_a_template_is_text() {
        let stack = state_after(&["const a = `/* not a comment"]);
        assert!(matches!(stack.as_slice(), [TemplateStateFrame::Template]));
    }

    /// A `'…'` can only reach the next line through a trailing `\`. Every other
    /// unterminated quote is an apostrophe in prose or a quote inside a regex,
    /// and treating it as a carried string made every following line count as
    /// string content — which is how `isn't` in a doc comment stopped an entire
    /// component below it from being re-indented.
    #[test]
    fn only_a_trailing_backslash_carries_a_string() {
        for line in [
            "\t/** the console isn't shown */",
            "\t// we can't avoid this",
            "\tconst quotes = /'|\"/g;",
            "\t * focus control in ways we can't prevent",
        ] {
            assert!(
                !in_string_content(&state_after(&[line])),
                "a quote that closes nothing opened a string: {line}"
            );
        }
    }

    #[test]
    fn a_trailing_backslash_still_carries_one() {
        assert!(in_string_content(&state_after(&["\tconst cont = 'a\\"])));
        assert!(in_string_content(&state_after(&["\tconst cont = \"a\\"])));
        // …and the closing quote on the next line ends it.
        assert!(!in_string_content(&state_after(&[
            "\tconst cont = 'a\\",
            "b';"
        ])));
    }

    /// Two stray apostrophes on separate lines is the shape that reached the
    /// corpus, and it is invisible at the end: the second one closes the frame
    /// the first opened, so only the state *between* them tells them apart.
    #[test]
    fn two_stray_apostrophes_never_pair_up() {
        let mut stack = Vec::new();
        for line in [
            "\t/** the console isn't shown */",
            "\tlet n = 0;",
            "\t/* we can't avoid this */",
            "\tn += 1;",
        ] {
            update_template_literal_stack(line, &mut stack);
            assert!(stack.is_empty(), "a frame outlived the line: {line}");
        }
    }
}
