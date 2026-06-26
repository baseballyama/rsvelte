//! Port of [`svelte-switch-case`](https://github.com/l-portet/svelte-switch-case)
//! (v2.0.0) — a markup preprocessor that rewrites the non-standard
//! `{#switch}` / `{:case}` / `{:default}` block sugar into Svelte's native
//! `{#if}` / `{:else if}` / `{:else}` blocks.
//!
//! Because `{#switch}` is not valid Svelte syntax, the input cannot be fed to
//! rsvelte's strict Svelte parser; instead we run a focused brace-aware scanner
//! that locates the switch blocks (with nesting) and overwrites their markers in
//! place — exactly mirroring the upstream `magic-string` overwrite algorithm.

use rsvelte_core::compiler::preprocess::types::{
    MarkupPreprocessorFn, MarkupPreprocessorOptions, PreprocessorGroup, PreprocessorResult,
    Processed,
};

const COMMENT: &str = "<!-- Injected by svelte-switch-case -->";

/// Build the `svelte-switch-case` [`PreprocessorGroup`].
///
/// Mirrors the upstream default export `preprocess()` which returns
/// `{ name, markup }`.
pub fn switch_case() -> PreprocessorGroup {
    PreprocessorGroup {
        name: Some("svelte-switch-case".to_string()),
        markup: Some(
            Box::new(|opts: MarkupPreprocessorOptions| -> PreprocessorResult {
                Box::pin(async move {
                    let code = transform(&opts.content).map_err(
                        rsvelte_core::compiler::preprocess::types::PreprocessError::Other,
                    )?;
                    Ok(Some(Processed {
                        code,
                        ..Default::default()
                    }))
                })
            }) as MarkupPreprocessorFn,
        ),
        ..Default::default()
    }
}

/// What kind of branch a `{:…}` marker is.
#[derive(Debug, PartialEq, Eq)]
enum BranchKind {
    Case,
    Default,
    /// Any other `{:name}` — illegal inside a switch (`{:invalid}` etc.).
    Invalid,
}

#[derive(Debug)]
struct Branch {
    kind: BranchKind,
    /// Text after the keyword (the case expression / default argument).
    expr: String,
    /// Byte offset of the opening `{`.
    marker_start: usize,
    /// Byte offset just past the closing `}`.
    marker_end: usize,
}

#[derive(Debug)]
struct SwitchBlock {
    open_start: usize,
    expr: String,
    branches: Vec<Branch>,
    close_start: usize,
    close_end: usize,
    /// Whether the region between `{#switch …}` and the first branch holds any
    /// non-comment, non-whitespace content (the `switchBranchHasContent` check).
    switch_branch_has_content: bool,
}

/// Builder accumulated while a switch frame is open on the scan stack.
struct SwitchBuilder {
    open_start: usize,
    open_end: usize,
    expr: String,
    branches: Vec<Branch>,
}

enum Frame {
    Switch(SwitchBuilder),
    Other,
}

/// Transform all `{#switch}` blocks in `code` into `{#if}` blocks.
///
/// Returns `Err(message)` for any of the upstream `validateSyntax` failures
/// (the JS original throws `SyntaxError`).
pub fn transform(code: &str) -> Result<String, String> {
    let blocks = scan(code)?;

    if blocks.is_empty() {
        return Ok(code.to_string());
    }

    for block in &blocks {
        validate(block)?;
    }

    // Collect every (start, end, replacement) edit, then apply right-to-left so
    // earlier byte offsets stay valid.
    let mut edits: Vec<(usize, usize, String)> = Vec::new();
    for block in &blocks {
        let first = &block.branches[0];
        edits.push((
            block.open_start,
            first.marker_end,
            format!(
                "{COMMENT}\n{{#if {}}}",
                build_conditions(&block.expr, &first.expr)
            ),
        ));
        for branch in &block.branches[1..] {
            let replacement = match branch.kind {
                BranchKind::Case => {
                    format!(
                        "{{:else if {}}}",
                        build_conditions(&block.expr, &branch.expr)
                    )
                }
                // Default / Invalid (Invalid is rejected by validate() above).
                _ => "{:else}".to_string(),
            };
            edits.push((branch.marker_start, branch.marker_end, replacement));
        }
        edits.push((block.close_start, block.close_end, "{/if}".to_string()));
    }

    edits.sort_by_key(|e| std::cmp::Reverse(e.0));

    let mut out = code.to_string();
    for (start, end, replacement) in edits {
        out.replace_range(start..end, &replacement);
    }
    Ok(out)
}

/// `${expr} === ${value}` for each `||`-separated value, joined by `||`.
fn build_conditions(expr: &str, raw_value: &str) -> String {
    raw_value
        .split("||")
        .map(|value| format!("{expr} === {value}"))
        .collect::<Vec<_>>()
        .join(" || ")
}

/// Scan the markup, returning every switch block (innermost-finalized first).
fn scan(code: &str) -> Result<Vec<SwitchBlock>, String> {
    let bytes = code.as_bytes();
    let mut stack: Vec<Frame> = Vec::new();
    let mut blocks: Vec<SwitchBlock> = Vec::new();
    let mut i = 0;

    while i < bytes.len() {
        // Skip HTML comments so their contents never look like markup.
        if code[i..].starts_with("<!--") {
            i = code[i..]
                .find("-->")
                .map(|p| i + p + 3)
                .unwrap_or(bytes.len());
            continue;
        }
        // Skip <script>…</script> and <style>…</style> bodies (may contain braces).
        if let Some(end) = skip_raw_element(code, i, "script") {
            i = end;
            continue;
        }
        if let Some(end) = skip_raw_element(code, i, "style") {
            i = end;
            continue;
        }

        if bytes[i] == b'{'
            && let Some((content, end)) = read_tag(code, i)
        {
            let trimmed = content.trim();
            if let Some(rest) = trimmed.strip_prefix('#') {
                let (kw, expr) = split_keyword(rest);
                if kw == "switch" {
                    stack.push(Frame::Switch(SwitchBuilder {
                        open_start: i,
                        open_end: end,
                        expr: expr.to_string(),
                        branches: Vec::new(),
                    }));
                } else {
                    stack.push(Frame::Other);
                }
            } else if let Some(rest) = trimmed.strip_prefix('/') {
                let kw = rest.trim();
                if kw == "switch" {
                    match stack.pop() {
                        Some(Frame::Switch(b)) => {
                            blocks.push(finalize(b, i, end, code));
                        }
                        _ => {
                            return Err("Invalid switch syntax. Unbalanced {/switch}.".to_string());
                        }
                    }
                } else {
                    // Closing some other block type.
                    stack.pop();
                }
            } else if let Some(rest) = trimmed.strip_prefix(':') {
                let (kw, expr) = split_keyword(rest);
                if let Some(Frame::Switch(b)) = stack.last_mut() {
                    let kind = match kw {
                        "case" => BranchKind::Case,
                        "default" => BranchKind::Default,
                        _ => BranchKind::Invalid,
                    };
                    b.branches.push(Branch {
                        kind,
                        expr: expr.to_string(),
                        marker_start: i,
                        marker_end: end,
                    });
                }
                // Otherwise it's a branch of a non-switch block — ignore.
            }
            // Plain `{expr}` / `{@const …}` etc. — nothing to do.
            i = end;
            continue;
        }
        i += 1;
    }

    if !stack.is_empty() {
        return Err("Invalid switch syntax. Unterminated {#switch}.".to_string());
    }

    Ok(blocks)
}

/// Finalize an open switch frame into a [`SwitchBlock`].
fn finalize(b: SwitchBuilder, close_start: usize, close_end: usize, code: &str) -> SwitchBlock {
    // Content between `{#switch …}` and the first branch (or `{/switch}`).
    let content_end = b
        .branches
        .first()
        .map(|br| br.marker_start)
        .unwrap_or(close_start);
    let between = &code[b.open_end..content_end];
    let switch_branch_has_content = !strip_html_comments(between).trim().is_empty();

    SwitchBlock {
        open_start: b.open_start,
        expr: b.expr,
        branches: b.branches,
        close_start,
        close_end,
        switch_branch_has_content,
    }
}

/// Mirror of upstream `validateSyntax`.
fn validate(block: &SwitchBlock) -> Result<(), String> {
    let branches_msg =
        "Invalid switch syntax. Switch must only contain {:case} and {:default} branches.";

    if block.switch_branch_has_content {
        return Err(branches_msg.to_string());
    }

    let mut default_count = 0;
    let mut case_count = 0;
    for branch in &block.branches {
        match branch.kind {
            BranchKind::Case => {
                case_count += 1;
                if branch.expr.trim().is_empty() {
                    return Err(
                        "Invalid switch syntax. {:case <expression>} needs an expression."
                            .to_string(),
                    );
                }
            }
            BranchKind::Default => {
                default_count += 1;
                if !branch.expr.trim().is_empty() {
                    return Err(
                        "Invalid switch syntax. {:default} branch can't have any argument."
                            .to_string(),
                    );
                }
            }
            BranchKind::Invalid => return Err(branches_msg.to_string()),
        }
    }

    if default_count > 1 {
        return Err(
            "Invalid switch syntax. Switch can't contain more than one {:default} branch."
                .to_string(),
        );
    }
    if case_count < 1 {
        return Err("Invalid switch syntax. Switch needs at least one {:case} branch.".to_string());
    }
    Ok(())
}

/// Read a `{ … }` tag starting at `start` (which must index a `{`), returning
/// the inner content and the offset just past the matching `}`. Respects nested
/// braces and string / template literals.
fn read_tag(code: &str, start: usize) -> Option<(String, usize)> {
    let bytes = code.as_bytes();
    let mut depth = 0usize;
    let mut i = start;
    let mut in_str: Option<u8> = None;
    while i < bytes.len() {
        let c = bytes[i];
        if let Some(q) = in_str {
            if c == b'\\' {
                i += 2;
                continue;
            }
            if c == q {
                in_str = None;
            }
            i += 1;
            continue;
        }
        match c {
            b'\'' | b'"' | b'`' => in_str = Some(c),
            b'{' => depth += 1,
            b'}' => {
                depth -= 1;
                if depth == 0 {
                    return Some((code[start + 1..i].to_string(), i + 1));
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// If `code[at..]` begins a `<tag …>` open tag for `tag`, return the offset just
/// past its matching `</tag>`. Otherwise `None`.
fn skip_raw_element(code: &str, at: usize, tag: &str) -> Option<usize> {
    let rest = &code[at..];
    let open = format!("<{tag}");
    if !rest.starts_with(&open) {
        return None;
    }
    // The char after `<tag` must be `>`, `/`, or whitespace (else it's e.g. `<scripted>`).
    let after = rest[open.len()..].chars().next()?;
    if after != '>' && after != '/' && !after.is_whitespace() {
        return None;
    }
    // Self-closing `<style/>` — skip just the open tag.
    let gt = rest.find('>')?;
    if rest.as_bytes()[gt.saturating_sub(1)] == b'/' {
        return Some(at + gt + 1);
    }
    let close = format!("</{tag}>");
    match rest[gt..].find(&close) {
        Some(p) => Some(at + gt + p + close.len()),
        None => Some(code.len()),
    }
}

/// Split `keyword rest…` at the first whitespace.
fn split_keyword(s: &str) -> (&str, &str) {
    let s = s.trim_start();
    match s.find(char::is_whitespace) {
        Some(idx) => (&s[..idx], s[idx..].trim()),
        None => (s, ""),
    }
}

/// Remove `<!-- … -->` comments from `s` (for the content-emptiness check).
fn strip_html_comments(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut rest = s;
    while let Some(start) = rest.find("<!--") {
        out.push_str(&rest[..start]);
        match rest[start..].find("-->") {
            Some(end) => rest = &rest[start + end + 3..],
            None => {
                rest = "";
                break;
            }
        }
    }
    out.push_str(rest);
    out
}
