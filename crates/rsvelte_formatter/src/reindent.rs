//! Shared re-indentation for spliced `oxc_formatter` output.
//!
//! Both `<script>` bodies ([`crate::script`]) and markup `{expr}` content
//! ([`crate::expression`]) are formatted by `oxc_formatter` at indent 0 and
//! then spliced back into the document at a deeper nesting level. The spliced
//! text's continuation lines must gain that nesting indent — but lines that
//! begin *inside* multi-line template-literal quasi text must be left verbatim:
//! their leading whitespace is part of the runtime string value, so
//! re-indenting them would both mutate the string and make formatting
//! non-idempotent (every pass would add another level) (#686).

/// One level of the scanner stack. We only need to know whether a line begins
/// inside template-literal *quasi* text (raw string content) versus ordinary
/// code — the latter is re-indented, the former is left verbatim.
enum Frame {
    /// Inside `` `…` `` quasi text (between backticks, outside `${}`).
    Template,
    /// Inside a `${ … }` substitution. The `u32` is the `{`-nesting depth
    /// within the substitution, so the matching `}` is recognised.
    Subst(u32),
}

/// Prepend `prefix` to the start of every line of `formatted`, **except** lines
/// that begin inside multi-line template-literal quasi text. When `skip_first`
/// is true the first line is also left unprefixed — used when that line is
/// spliced inline after an opener (e.g. a `{` or `<script>` already positioned
/// by an outer pass).
///
/// The scanner tracks template-literal / `${}` nesting plus string and comment
/// context so backticks, `${`, and braces inside strings or comments aren't
/// misread.
pub(crate) fn reindent(formatted: &str, prefix: &str, skip_first: bool) -> String {
    let chars: Vec<char> = formatted.chars().collect();
    let n = chars.len();
    let mut out = String::with_capacity(formatted.len() + 16);
    let mut stack: Vec<Frame> = Vec::new();
    let mut line_comment = false;
    let mut block_comment = false;
    let mut string: Option<char> = None;
    let mut at_line_start = true;
    let mut seen_newline = false;
    let mut i = 0;

    while i < n {
        let c = chars[i];

        if at_line_start {
            let in_quasi = matches!(stack.last(), Some(Frame::Template));
            let suppress_first = skip_first && !seen_newline;
            if c != '\n' && !in_quasi && !suppress_first {
                out.push_str(prefix);
            }
            at_line_start = false;
        }

        // Line comment: runs to end of line.
        if line_comment {
            out.push(c);
            i += 1;
            if c == '\n' {
                line_comment = false;
                at_line_start = true;
                seen_newline = true;
            }
            continue;
        }

        // Block comment: runs to `*/`. Interior lines are still re-indented
        // (code context), matching `oxc_formatter`'s own re-alignment.
        if block_comment {
            if c == '*' && chars.get(i + 1) == Some(&'/') {
                out.push('*');
                out.push('/');
                i += 2;
                block_comment = false;
                continue;
            }
            out.push(c);
            i += 1;
            if c == '\n' {
                at_line_start = true;
                seen_newline = true;
            }
            continue;
        }

        // Regular string: consumes its own escapes; can't span lines in
        // well-formed formatter output.
        if let Some(q) = string {
            out.push(c);
            if c == '\\' {
                if i + 1 < n {
                    out.push(chars[i + 1]);
                    i += 2;
                } else {
                    i += 1;
                }
                continue;
            }
            i += 1;
            if c == q {
                string = None;
            }
            continue;
        }

        if matches!(stack.last(), Some(Frame::Template)) {
            // Inside template-literal quasi text.
            match c {
                '`' => {
                    stack.pop();
                    out.push(c);
                    i += 1;
                }
                '\\' => {
                    out.push(c);
                    if i + 1 < n {
                        out.push(chars[i + 1]);
                        i += 2;
                    } else {
                        i += 1;
                    }
                }
                '$' if chars.get(i + 1) == Some(&'{') => {
                    stack.push(Frame::Subst(0));
                    out.push('$');
                    out.push('{');
                    i += 2;
                }
                '\n' => {
                    out.push(c);
                    at_line_start = true;
                    seen_newline = true;
                    i += 1;
                }
                _ => {
                    out.push(c);
                    i += 1;
                }
            }
        } else {
            // Ordinary code context (top level or inside `${ … }`).
            match c {
                '`' => {
                    stack.push(Frame::Template);
                    out.push(c);
                    i += 1;
                }
                '\'' | '"' => {
                    string = Some(c);
                    out.push(c);
                    i += 1;
                }
                '/' if chars.get(i + 1) == Some(&'/') => {
                    line_comment = true;
                    out.push('/');
                    out.push('/');
                    i += 2;
                }
                '/' if chars.get(i + 1) == Some(&'*') => {
                    block_comment = true;
                    out.push('/');
                    out.push('*');
                    i += 2;
                }
                '{' => {
                    if let Some(Frame::Subst(d)) = stack.last_mut() {
                        *d += 1;
                    }
                    out.push(c);
                    i += 1;
                }
                '}' => {
                    if matches!(stack.last(), Some(Frame::Subst(0))) {
                        stack.pop();
                    } else if let Some(Frame::Subst(d)) = stack.last_mut() {
                        *d -= 1;
                    }
                    out.push(c);
                    i += 1;
                }
                '\n' => {
                    out.push(c);
                    at_line_start = true;
                    seen_newline = true;
                    i += 1;
                }
                _ => {
                    out.push(c);
                    i += 1;
                }
            }
        }
    }

    out
}
