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
///
/// Scans bytes rather than a `Vec<char>`: every character the scanner keys off
/// is ASCII, and an ASCII byte can never occur inside a UTF-8 multi-byte
/// sequence, so multi-byte characters are copied through verbatim by the
/// catch-all arms without ever being mistaken for a delimiter.
pub(crate) fn reindent(formatted: &str, prefix: &str, skip_first: bool) -> String {
    let bytes = formatted.as_bytes();
    let n = bytes.len();
    let prefix = prefix.as_bytes();
    let mut out: Vec<u8> = Vec::with_capacity(formatted.len() + 16);
    let mut stack: Vec<Frame> = Vec::new();
    let mut line_comment = false;
    let mut block_comment = false;
    // Whether the current block comment is a JSDoc comment (`/**`). JSDoc
    // comments have their interior re-indented by `oxc_formatter` (each ` * `
    // continuation line is aligned relative to the `/**` opener).  Regular
    // block comments (`/*`) have their interiors preserved verbatim.
    let mut is_jsdoc = false;
    let mut string: Option<u8> = None;
    let mut at_line_start = true;
    let mut seen_newline = false;
    let mut i = 0;

    while i < n {
        let c = bytes[i];

        if at_line_start {
            let in_quasi = matches!(stack.last(), Some(Frame::Template));
            let suppress_first = skip_first && !seen_newline;
            if c != b'\n' && !in_quasi && !suppress_first {
                out.extend_from_slice(prefix);
            }
            at_line_start = false;
        }

        // Line comment: runs to end of line.
        if line_comment {
            out.push(c);
            i += 1;
            if c == b'\n' {
                line_comment = false;
                at_line_start = true;
                seen_newline = true;
            }
            continue;
        }

        // Block comment: runs to `*/`.
        // - JSDoc comments (`/**`): interior lines ARE re-indented because
        //   `oxc_formatter` aligns ` * ` continuations relative to the `/**`
        //   opener. `is_jsdoc = true` for these.
        // - Regular block comments (`/*`): interior lines are preserved
        //   verbatim. The comment author's formatting is intentional, and
        //   `oxc_formatter` does not touch the interior. `is_jsdoc = false`.
        if block_comment {
            if c == b'*' && bytes.get(i + 1) == Some(&b'/') {
                out.push(b'*');
                out.push(b'/');
                i += 2;
                block_comment = false;
                is_jsdoc = false;
                continue;
            }
            out.push(c);
            i += 1;
            if c == b'\n' {
                seen_newline = true;
                if is_jsdoc {
                    // JSDoc interior: re-indent continuation lines normally.
                    at_line_start = true;
                }
                // Non-JSDoc (`/*`) interior: do NOT set `at_line_start` —
                // the next line's existing whitespace is kept verbatim.
            }
            continue;
        }

        // Regular string: consumes its own escapes; can't span lines in
        // well-formed formatter output.
        if let Some(q) = string {
            // A regular string never spans a line in valid formatter output, so
            // a raw newline here means string tracking desynced — most often
            // quotes inside a regex literal (`/["']x/`), which this scanner
            // doesn't lex. Recover: close the string and treat the newline as an
            // ordinary line boundary. Otherwise the spuriously-open string
            // swallows every following line and they all lose their indent
            // prefix (a script body de-indents after such a regex). The
            // mis-scanned tail sits on the already-prefixed line, so the visible
            // indentation is unaffected.
            if c == b'\n' {
                out.push(c);
                string = None;
                at_line_start = true;
                seen_newline = true;
                i += 1;
                continue;
            }
            out.push(c);
            if c == b'\\' {
                if i + 1 < n {
                    out.push(bytes[i + 1]);
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
                b'`' => {
                    stack.pop();
                    out.push(c);
                    i += 1;
                }
                b'\\' => {
                    out.push(c);
                    if i + 1 < n {
                        out.push(bytes[i + 1]);
                        i += 2;
                    } else {
                        i += 1;
                    }
                }
                b'$' if bytes.get(i + 1) == Some(&b'{') => {
                    stack.push(Frame::Subst(0));
                    out.push(b'$');
                    out.push(b'{');
                    i += 2;
                }
                b'\n' => {
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
                b'`' => {
                    stack.push(Frame::Template);
                    out.push(c);
                    i += 1;
                }
                b'\'' | b'"' => {
                    string = Some(c);
                    out.push(c);
                    i += 1;
                }
                b'/' if bytes.get(i + 1) == Some(&b'/') => {
                    line_comment = true;
                    out.push(b'/');
                    out.push(b'/');
                    i += 2;
                }
                b'/' if bytes.get(i + 1) == Some(&b'*') => {
                    block_comment = true;
                    // A block comment's interior is re-indented (aligned) by
                    // `oxc_formatter` only when it is "indentable": it spans
                    // multiple lines and EVERY continuation line's first
                    // non-whitespace character is `*` (the canonical
                    // star-aligned JSDoc / banner shape). This mirrors
                    // prettier's `isIndentableBlockComment`. A `/**` comment
                    // whose continuation lines are prose — which may carry
                    // intentional leading whitespace such as a tab — is NOT
                    // indentable: `oxc_formatter` leaves its interior verbatim,
                    // so the splice indent must not be prepended to those lines
                    // either. (Being `/**` is not sufficient on its own.)
                    is_jsdoc = is_indentable_block_comment(bytes, i, n);
                    out.push(b'/');
                    out.push(b'*');
                    i += 2;
                }
                b'{' => {
                    if let Some(Frame::Subst(d)) = stack.last_mut() {
                        *d += 1;
                    }
                    out.push(c);
                    i += 1;
                }
                b'}' => {
                    if matches!(stack.last(), Some(Frame::Subst(0))) {
                        stack.pop();
                    } else if let Some(Frame::Subst(d)) = stack.last_mut() {
                        *d -= 1;
                    }
                    out.push(c);
                    i += 1;
                }
                b'\n' => {
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

    // SAFETY-equivalent (checked): every byte pushed is copied verbatim from
    // `formatted` or `prefix`, both valid UTF-8, and multi-byte sequences are
    // never split (the scanner only ever branches on ASCII bytes), so `out` is
    // always valid UTF-8. The validation cost is a single linear scan, far
    // cheaper than the `Vec<char>` decode+allocation it replaces.
    String::from_utf8(out).expect("reindent output is valid utf-8")
}

/// Whether the block comment beginning at `start` (where `bytes[start] == b'/'`
/// and `bytes[start + 1] == b'*'`) is "indentable" in the prettier sense: it
/// spans more than one line and every continuation line (each line after the
/// opener line) has `*` as its first non-whitespace character. Only such
/// comments have their interior re-aligned by `oxc_formatter`; all others —
/// single-line comments and multi-line prose comments — are emitted verbatim,
/// so their continuation lines must not receive the splice indent.
fn is_indentable_block_comment(bytes: &[u8], start: usize, n: usize) -> bool {
    let mut j = start + 2;
    let mut saw_newline = false;
    while j < n {
        // Closing `*/` ends the comment before any further continuation line.
        if bytes[j] == b'*' && bytes.get(j + 1) == Some(&b'/') {
            break;
        }
        if bytes[j] == b'\n' {
            saw_newline = true;
            // First non-whitespace character of the next line.
            let mut k = j + 1;
            while k < n && (bytes[k] == b' ' || bytes[k] == b'\t') {
                k += 1;
            }
            // A continuation line that does not start with `*` (including a
            // blank line, where the next char is the newline) makes the comment
            // non-indentable.
            if k >= n || bytes[k] != b'*' {
                return false;
            }
        }
        j += 1;
    }
    saw_newline
}
