//! Type checking with TypeScript's own checker.
//!
//! The native `tsc` (TypeScript 7) runs once over a
//! whole set of generated files, and its diagnostics come back in generated coordinates for the
//! host language to map to its documents.
//!
//! `tsc` has no machine-readable output, so the pretty report is parsed: its header gives the
//! start, its underline gives the end. The parser accepts only the shapes it knows and checks the
//! count against tsc's own summary, so an unrecognised report is an error, never a dropped finding.

use std::path::{Path, PathBuf};
use std::process::Command;
use std::sync::atomic::{AtomicU32, Ordering};

use rsv_kernel::json::JsonWriter;
use rsv_kernel::metrics;
use rsv_kernel::source::{LineIndex, Span};

#[derive(Debug)]
pub struct Tsc {
    /// The native `tsc` executable.
    pub binary: PathBuf,
    /// The project's tsconfig.json; the check extends it.
    pub tsconfig: Option<PathBuf>,
}

#[derive(Default, Debug)]
pub struct CheckRequest {
    /// Generated TypeScript, one per document.
    pub files: Vec<String>,
    /// Declaration files written beside the generated ones, by name.
    pub declarations: Vec<(&'static str, &'static str)>,
    /// Existing declaration files to include.
    pub include: Vec<PathBuf>,
    /// `compilerOptions.paths` entries: module specifier → file.
    pub paths: Vec<(&'static str, PathBuf)>,
}

#[derive(Debug, PartialEq, Eq)]
pub struct TsDiagnostic {
    /// Index into [`CheckRequest::files`].
    pub file: usize,
    pub code: u32,
    /// The message chain, one line per link, indented two spaces per level (as svelte-check and
    /// `ts.flattenDiagnosticMessageText(…, "\n")` render it).
    pub message: String,
    /// Byte range in the generated file.
    pub span: Span,
}

static RUN: AtomicU32 = AtomicU32::new(0);

impl Tsc {
    /// # Errors
    ///
    /// A message if the temporary project cannot be written, `tsc` cannot be run, or its report
    /// cannot be parsed.
    pub fn check(&self, req: &CheckRequest) -> Result<Vec<TsDiagnostic>, String> {
        let dir = std::env::temp_dir().join(format!(
            "rsv-tsc-{}-{}",
            std::process::id(),
            RUN.fetch_add(1, Ordering::Relaxed)
        ));
        std::fs::create_dir_all(&dir).map_err(|e| format!("{}: {e}", dir.display()))?;
        let result = self.check_in(&dir, req);
        // Best effort: a leftover temporary directory does not affect the result.
        drop(std::fs::remove_dir_all(&dir));
        result
    }

    fn check_in(&self, dir: &Path, req: &CheckRequest) -> Result<Vec<TsDiagnostic>, String> {
        let write = |name: &str, text: &str| {
            std::fs::write(dir.join(name), text).map_err(|e| format!("{name}: {e}"))
        };
        for (i, text) in req.files.iter().enumerate() {
            write(&file_name(i), text)?;
        }
        for (name, text) in &req.declarations {
            write(name, text)?;
        }
        write("tsconfig.json", &self.tsconfig_json(req))?;
        let output = {
            let _p = metrics::phase("ts.tsc");
            Command::new(&self.binary)
                .args(["-p", ".", "--pretty", "true"])
                .current_dir(dir)
                .output()
                .map_err(|e| format!("{}: {e}", self.binary.display()))?
        };
        let stdout = String::from_utf8(output.stdout).map_err(|e| e.to_string())?;
        if !matches!(output.status.code(), Some(0..=2)) || !output.stderr.is_empty() {
            return Err(format!(
                "tsc exited with {}: {}{stdout}",
                output.status,
                String::from_utf8_lossy(&output.stderr)
            ));
        }
        let _p = metrics::phase("ts.report");
        let lines: Vec<LineIndex> = req.files.iter().map(|f| LineIndex::new(f)).collect();
        parse_report(&strip_ansi(&stdout), |file, line, col| {
            lines
                .get(file)
                .and_then(|l| l.offset(&req.files[file], line, col))
        })
    }

    fn tsconfig_json(&self, req: &CheckRequest) -> String {
        let mut w = JsonWriter::new(true);
        w.begin_object();
        if let Some(base) = &self.tsconfig {
            w.key("extends").str(&base.to_string_lossy());
        }
        w.key("compilerOptions")
            .begin_object()
            .key("noEmit")
            .bool(true)
            .key("skipLibCheck")
            .bool(true);
        // Every generated file is a module, whatever its imports: documents share no globals.
        w.key("moduleDetection").str("force");
        w.key("paths").begin_object();
        for (spec, file) in &req.paths {
            w.key(spec)
                .begin_array()
                .str(&file.to_string_lossy())
                .end_array();
        }
        w.end_object().end_object().key("files").begin_array();
        for i in 0..req.files.len() {
            w.str(&file_name(i));
        }
        for (name, _) in &req.declarations {
            w.str(name);
        }
        for p in &req.include {
            w.str(&p.to_string_lossy());
        }
        w.end_array().end_object();
        w.finish()
    }
}

fn file_name(i: usize) -> String {
    format!("f{i}.ts")
}

fn strip_ansi(s: &str) -> String {
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
fn header(line: &str) -> Option<(usize, u32, u32, u32, &str)> {
    let (loc, rest) = line.split_once(" - error TS")?;
    let (code, message) = rest.split_once(": ")?;
    let mut it = loc.rsplitn(3, ':');
    let col = it.next()?.parse().ok()?;
    let ln = it.next()?.parse().ok()?;
    let file = it.next()?;
    let index = file.strip_prefix('f')?.strip_suffix(".ts")?.parse().ok()?;
    Some((index, ln, col, code.parse().ok()?, message))
}

/// An excerpt line `  12 code`: (line number, gutter width including the separator space).
fn gutter(line: &str) -> Option<(u32, usize)> {
    let digits_at = line.len() - line.trim_start().len();
    let rest = &line[digits_at..];
    let digits = rest.bytes().take_while(u8::is_ascii_digit).count();
    if digits == 0 || rest.as_bytes().get(digits).is_some_and(|&b| b != b' ') {
        return None;
    }
    Some((rest[..digits].parse().ok()?, digits_at + digits + 1))
}

fn is_table_row(line: &str) -> bool {
    let mut it = line.split_whitespace();
    matches!(
        (it.next(), it.next(), it.next()),
        (Some(n), Some(at), None) if n.parse::<u32>().is_ok() && at.contains(".ts:")
    )
}

/// `offset(file, line, column)`: 1-based line, 0-based UTF-16 column → byte offset.
fn parse_report(
    report: &str,
    offset: impl Fn(usize, u32, u32) -> Option<u32>,
) -> Result<Vec<TsDiagnostic>, String> {
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
        let Some((file, ln, col, code, first)) = header(line) else {
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
        let Some((end_line, end_col)) = end else {
            return bad(line, "no underline");
        };
        while i < lines.len() && (lines[i].is_empty() || lines[i].starts_with(' ')) {
            i += 1;
        }
        // tsc draws at least one `~`, so a span that is empty at a line's end underlines the
        // column past it; only that column is taken back.
        let hi = offset(file, end_line, end_col)
            .or_else(|| offset(file, ln, col - 1).filter(|_| (end_line, end_col) == (ln, col)));
        let (Some(lo), Some(hi)) = (offset(file, ln, col - 1), hi) else {
            return bad(line, "position outside the generated file");
        };
        if hi < lo {
            return bad(line, "underline ends before the diagnostic starts");
        }
        out.push(TsDiagnostic {
            file,
            code,
            message,
            span: Span::new(lo, hi),
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

#[cfg(test)]
mod tests {
    use super::*;

    // Captured from tsc 7.0.2 `--pretty true`, colours stripped.
    const REPORT: &str = "f0.ts:1:5 - error TS2322: Type '(x: string) => number' is not \
                          assignable to type '(x: number) => string'.
  Types of parameters 'x' and 'x' are incompatible.
    Type 'number' is not assignable to type 'string'.

1 let f: (x: number) => string = (x: string) => 1;
      ~

f1.ts:3:3 - error TS2783: 'a' is specified more than once, so this usage will be overwritten.

3   a: 1,
    ~~~~

  f1.ts:4:3 - This spread always overwrites this property.
    4   ...{ a: \"x\" },
        ~~~~~~~~~~~~~


Found 2 errors in 2 files.

Errors  Files
     1  f0.ts:1
     1  f1.ts:3
";

    #[test]
    fn parses_chains_underlines_and_skips_related_information() {
        let files = [
            "let f: (x: number) => string = (x: string) => 1;\n".to_owned(),
            "const big = {\n\n  a: 1,\n  ...{ a: \"x\" },\n};\n".to_owned(),
        ];
        let index: Vec<LineIndex> = files.iter().map(|f| LineIndex::new(f)).collect();
        let got = parse_report(REPORT, |f, l, c| index[f].offset(&files[f], l, c)).unwrap();
        assert_eq!(got.len(), 2);
        assert_eq!(got[0].code, 2322);
        assert_eq!(
            got[0].message,
            "Type '(x: string) => number' is not assignable to type '(x: number) => string'.\
             \n  Types of parameters 'x' and 'x' are incompatible.\
             \n    Type 'number' is not assignable to type 'string'."
        );
        assert_eq!(got[0].span.text(&files[0]), "f");
        assert_eq!((got[1].file, got[1].span.text(&files[1])), (1, "a: 1"));
    }

    #[test]
    fn a_count_that_disagrees_with_the_summary_is_an_error() {
        let files = ["let f: (x: number) => string = (x: string) => 1;\n".to_owned()];
        let index = LineIndex::new(&files[0]);
        let truncated = format!(
            "{}Found 2 errors in 2 files.\n",
            REPORT.split("f1.ts:3:3").next().unwrap()
        );
        let got = parse_report(&truncated, |f, l, c| index.offset(&files[f], l, c));
        assert!(got.unwrap_err().contains("reported 2 error(s), parsed 1"));
    }

    #[test]
    fn an_empty_span_at_a_line_end_is_empty() {
        // tsc 7.0.2 `--pretty true`, colours stripped: the underline sits one column past the line.
        let report = "f0.ts:2:12 - error TS1109: Expression expected.\n\n2 let t = s +\
                      \n             ~\n\n\nFound 1 error in f0.ts:2\n\n";
        let files = ["let s = 1;\nlet t = s +\n".to_owned()];
        let index = LineIndex::new(&files[0]);
        let got = parse_report(report, |f, l, c| index.offset(&files[f], l, c)).unwrap();
        let end = files[0].find(" +").unwrap() as u32 + 2;
        assert_eq!(got[0].span, Span::new(end, end));
    }

    #[test]
    fn an_unknown_line_is_an_error() {
        let got = parse_report("error TS5083: Cannot read file 'x'.\n", |_, _, _| Some(0));
        got.unwrap_err();
    }
}
