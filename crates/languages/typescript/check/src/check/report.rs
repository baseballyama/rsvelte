use super::{Span, TypeScriptDiagnostic};

pub(super) fn file_name(i: usize) -> String {
    format!("f{i}.ts")
}

pub(super) fn strip_ansi(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars();
    while let Some(c) = chars.next() {
        if c == '\x1b' {
            for c in chars.by_ref() {
                if c.is_ascii_alphabetic() {
                    break;
                }
            }
        } else {
            out.push(c);
        }
    }
    out
}

/// `f3.ts:12:5 - error TS2322: message` → (3, 12, 5, 2322, message).
pub(super) fn header(line: &str) -> Option<(usize, u32, u32, u32, &str)> {
    let (source_location, rest) = line.split_once(" - error TS")?;
    let (code, message) = rest.split_once(": ")?;
    let mut it = source_location.rsplitn(3, ':');
    let column = it.next()?.parse().ok()?;
    let ln = it.next()?.parse().ok()?;
    let file = it.next()?;
    let index = file.strip_prefix('f')?.strip_suffix(".ts")?.parse().ok()?;
    Some((index, ln, column, code.parse().ok()?, message))
}

/// An excerpt line `  12 code`: (line number, gutter width including the separator space).
pub(super) fn gutter(line: &str) -> Option<(u32, usize)> {
    let digits_at = line.len() - line.trim_start().len();
    let rest = &line[digits_at..];
    let digits = rest.bytes().take_while(u8::is_ascii_digit).count();
    if digits == 0 || rest.as_bytes().get(digits).is_some_and(|&b| b != b' ') {
        return None;
    }
    Some((rest[..digits].parse().ok()?, digits_at + digits + 1))
}

pub(super) fn is_table_row(line: &str) -> bool {
    let mut it = line.split_whitespace();
    matches!(
        (it.next(), it.next(), it.next()),
        (Some(n), Some(at), None) if n.parse::<u32>().is_ok() && at.contains(".ts:")
    )
}

/// `offset(file, line, column)`: 1-based line, 0-based UTF-16 column → byte offset.
pub(super) fn parse_report(
    report: &str,
    offset: impl Fn(usize, u32, u32) -> Option<u32>,
) -> Result<Vec<TypeScriptDiagnostic>, String> {
    let lines: Vec<&str> = report.lines().collect();
    let mut out = Vec::new();
    let mut summary = None;
    let mut i = 0;
    let bad = |line: &str, why: &str| Err(format!("unrecognised tsc report ({why}): {line:?}"));
    while i < lines.len() {
        let line = lines[i];
        if line.trim().is_empty() {
            i += 1;
            continue;
        }
        if let Some(rest) = line.strip_prefix("Found ") {
            let n = rest.split(' ').next().and_then(|n| n.parse::<usize>().ok());
            if n.is_none() {
                return bad(line, "summary");
            }
            summary = n;
            i += 1;
            continue;
        }
        // The per-file table after a multi-file summary: `Errors  Files`, then `     6  f0.ts:2`.
        if line == "Errors  Files" {
            i += 1;
            while i < lines.len() && is_table_row(lines[i]) {
                i += 1;
            }
            continue;
        }
        let Some((file, ln, column, code, first)) = header(line) else {
            return bad(line, "expected a diagnostic header");
        };
        i += 1;
        let mut message = first.to_owned();
        while i < lines.len() && lines[i].starts_with("  ") {
            message.push('\n');
            message.push_str(lines[i]);
            i += 1;
        }
        while i < lines.len() && lines[i].is_empty() {
            i += 1;
        }
        let mut end = None;
        while i + 1 < lines.len() {
            let (n, width) = match gutter(lines[i]) {
                Some(g) => g,
                None if lines[i].trim_start().starts_with("...") => {
                    i += 1;
                    continue;
                }
                None => break,
            };
            let underline = lines[i + 1].get(width..).unwrap_or("");
            if !underline.bytes().all(|b| b == b' ' || b == b'~') {
                return bad(lines[i + 1], "expected an underline");
            }
            if let Some(last) = underline.rfind('~') {
                end = Some((n, last as u32 + 1));
            }
            i += 2;
        }
        let Some((end_line, end_column)) = end else {
            return bad(line, "no underline");
        };
        while i < lines.len() && (lines[i].is_empty() || lines[i].starts_with(' ')) {
            i += 1;
        }
        // tsc draws at least one `~`, so a span that is empty at a line's end underlines the
        // column past it; only that column is taken back.
        let end_offset = offset(file, end_line, end_column).or_else(|| {
            offset(file, ln, column - 1).filter(|_| (end_line, end_column) == (ln, column))
        });
        let (Some(start_offset), Some(end_offset)) = (offset(file, ln, column - 1), end_offset)
        else {
            return bad(line, "position outside the generated file");
        };
        if end_offset < start_offset {
            return bad(line, "underline ends before the diagnostic starts");
        }
        out.push(TypeScriptDiagnostic {
            file,
            code,
            message,
            span: Span::new(start_offset, end_offset),
        });
    }
    if summary.unwrap_or(0) != out.len() {
        return Err(format!(
            "tsc reported {} error(s), parsed {}",
            summary.unwrap_or(0),
            out.len()
        ));
    }
    Ok(out)
}
