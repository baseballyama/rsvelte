//! Large-corpus round-trip and source-map gate for `rsvelte_esrap`.

use std::fs;
use std::path::PathBuf;

use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use oxc_parser::{ParseOptions, Parser};
use oxc_span::{GetSpan, SourceType};
use rsvelte_ast_equiv::Comparison;
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Report {
    files: usize,
    bytes: usize,
    comment_files: usize,
    comments: usize,
    mapped_files: usize,
    mappings: usize,
}

fn main() {
    let mut file_list = None;
    let mut minimum_files = 1;
    let mut minimum_comment_files = 0;

    let mut args = std::env::args().skip(1);
    while let Some(arg) = args.next() {
        match arg.as_str() {
            "--files" => file_list = args.next(),
            "--minimum-files" => minimum_files = parse_usize(args.next(), minimum_files),
            "--minimum-comment-files" => {
                minimum_comment_files = parse_usize(args.next(), minimum_comment_files);
            }
            value => panic!("unknown argument: {value}"),
        }
    }

    let file_list = file_list.expect("usage: esrap_corpus --files <path>");
    let paths: Vec<PathBuf> = fs::read_to_string(&file_list)
        .unwrap_or_else(|error| panic!("cannot read {file_list}: {error}"))
        .lines()
        .filter(|line| !line.is_empty())
        .map(PathBuf::from)
        .collect();
    assert!(
        paths.len() >= minimum_files,
        "esrap corpus population is too small: {} files, expected at least {minimum_files}",
        paths.len()
    );

    let options = rsvelte_esrap::PrintOptions::default().with_empty_statements(true);
    let mut report = Report {
        files: paths.len(),
        bytes: 0,
        comment_files: 0,
        comments: 0,
        mapped_files: 0,
        mappings: 0,
    };
    let mut failures = Vec::new();

    for path in &paths {
        let source = fs::read_to_string(path)
            .unwrap_or_else(|error| panic!("cannot read {}: {error}", path.display()));
        report.bytes += source.len();
        let allocator = Allocator::default();
        let parsed = parse(&allocator, &source);
        if parsed.panicked || !parsed.diagnostics.is_empty() {
            failures.push(format!(
                "{}: input is not valid JavaScript: {:?}",
                path.display(),
                parsed.diagnostics.first()
            ));
            continue;
        }

        if !parsed.program.comments.is_empty() {
            report.comment_files += 1;
            report.comments += parsed.program.comments.len();
        }
        let input_comments = comment_bodies(&parsed.program, &source);
        let plain = rsvelte_esrap::print_with(&parsed.program, &source, &options);
        let mapped = rsvelte_esrap::print_with_map(&parsed.program, &source, &options);
        if plain != mapped.code {
            let offset = plain
                .bytes()
                .zip(mapped.code.bytes())
                .position(|(plain, mapped)| plain != mapped)
                .unwrap_or_else(|| plain.len().min(mapped.code.len()));
            let start = offset.saturating_sub(80);
            let plain_end = (offset + 160).min(plain.len());
            let mapped_end = (offset + 160).min(mapped.code.len());
            failures.push(format!(
                "{}: print_with and print_with_map first differ at byte {offset}: plain={:?}, mapped={:?}",
                path.display(),
                String::from_utf8_lossy(&plain.as_bytes()[start..plain_end]),
                String::from_utf8_lossy(&mapped.code.as_bytes()[start..mapped_end]),
            ));
            continue;
        }

        // Parens are not semantics, and the printer deliberately adds one pair:
        // esrap wraps a `return` argument when a comment sits between the keyword
        // and the expression, so `return /*c*/ x` prints as `return (/*c*/ x);`.
        // Comparing with parens preserved reports that rule as a changed program.
        match rsvelte_ast_equiv::compare_with(
            &source,
            &plain,
            rsvelte_ast_equiv::Options::default()
                .with_parens(rsvelte_ast_equiv::ParenPolicy::Ignore),
        ) {
            Comparison::Equivalent => {}
            difference => {
                failures.push(format!(
                    "{}: printed program changed semantics: {difference:?}",
                    path.display()
                ));
                continue;
            }
        }

        let output_allocator = Allocator::default();
        let output = parse(&output_allocator, &plain);
        if output.panicked || !output.diagnostics.is_empty() {
            failures.push(format!(
                "{}: printer emitted invalid JavaScript: {:?}",
                path.display(),
                output.diagnostics.first()
            ));
            continue;
        }
        let output_comments = comment_bodies(&output.program, &plain);
        if input_comments != output_comments {
            failures.push(format!(
                "{}: comment kinds or bodies changed: input={input_comments:?}, output={output_comments:?}",
                path.display()
            ));
            continue;
        }

        if !mapped.mappings.is_empty() {
            report.mapped_files += 1;
            report.mappings += mapped.mappings.len();
        }
        if let Err(error) = validate_mappings(&mapped.mappings, &plain, &source) {
            failures.push(format!("{}: {error}", path.display()));
        }
    }

    assert!(
        report.comment_files >= minimum_comment_files,
        "esrap corpus comment population is too small: {} files, expected at least {minimum_comment_files}",
        report.comment_files
    );
    assert!(
        report.mapped_files > 0,
        "esrap corpus produced no source maps"
    );
    if !failures.is_empty() {
        for failure in failures.iter().take(20) {
            eprintln!("{failure}");
        }
        panic!(
            "esrap corpus failed for {} of {} files",
            failures.len(),
            paths.len()
        );
    }

    println!(
        "{}",
        serde_json::to_string(&report).expect("corpus report serializes")
    );
}

fn parse<'a>(allocator: &'a Allocator, source: &'a str) -> oxc_parser::ParserReturn<'a> {
    Parser::new(allocator, source, SourceType::mjs())
        .with_options(ParseOptions {
            preserve_parens: true,
            ..ParseOptions::default()
        })
        .parse()
}

fn comment_bodies(program: &Program<'_>, source: &str) -> Vec<(bool, String)> {
    program
        .comments
        .iter()
        .map(|comment| {
            let span = comment.span();
            let raw = span.source_text(source);
            let block = !matches!(comment.kind, oxc_ast::ast::CommentKind::Line);
            let value = if block {
                let inner = raw
                    .strip_prefix("/*")
                    .and_then(|text| text.strip_suffix("*/"))
                    .unwrap_or(raw);
                normalize_block_comment(inner)
            } else {
                raw.strip_prefix("//").unwrap_or(raw).to_string()
            };
            (block, value)
        })
        .collect()
}

fn normalize_block_comment(inner: &str) -> String {
    if !inner.contains('\n') {
        return inner.to_string();
    }

    let mut common_indent: Option<&str> = None;
    for line in inner.split('\n').skip(1) {
        let indent_len = line
            .as_bytes()
            .iter()
            .take_while(|&&byte| matches!(byte, b' ' | b'\t'))
            .count();
        let indentation = &line[..indent_len];
        common_indent = Some(match common_indent {
            None => indentation,
            Some(common) => {
                let common_len = common
                    .bytes()
                    .zip(indentation.bytes())
                    .take_while(|(left, right)| left == right)
                    .count();
                &common[..common_len]
            }
        });
    }

    let common_indent = common_indent.unwrap_or_default();
    let mut normalized = String::with_capacity(inner.len());
    for (index, line) in inner.split('\n').enumerate() {
        if index > 0 {
            normalized.push('\n');
            normalized.push_str(line.strip_prefix(common_indent).unwrap_or(line));
        } else {
            normalized.push_str(line);
        }
    }
    normalized
}

fn validate_mappings(
    mappings: &[rsvelte_esrap::Mapping],
    generated: &str,
    source: &str,
) -> Result<(), String> {
    let generated_lines: Vec<&str> = generated.split('\n').collect();
    let source_lines: Vec<&str> = source.split('\n').collect();
    let mut previous = None;

    for mapping in mappings {
        let generated_line = mapping.gen_line as usize;
        let source_line = mapping.source_line as usize;
        if generated_line >= generated_lines.len()
            || mapping.gen_column as usize > generated_lines[generated_line].len()
        {
            return Err(format!("generated mapping is out of bounds: {mapping:?}"));
        }
        if source_line >= source_lines.len()
            || mapping.source_column as usize > source_lines[source_line].len()
        {
            return Err(format!("source mapping is out of bounds: {mapping:?}"));
        }
        let position = (mapping.gen_line, mapping.gen_column);
        if previous.is_some_and(|previous| position < previous) {
            return Err(format!("generated mappings are not ordered at {mapping:?}"));
        }
        previous = Some(position);
    }
    Ok(())
}

fn parse_usize(value: Option<String>, fallback: usize) -> usize {
    value
        .and_then(|value| value.parse().ok())
        .unwrap_or(fallback)
}

#[cfg(test)]
mod tests {
    use super::{comment_bodies, parse};
    use oxc_allocator::Allocator;

    #[test]
    fn comment_bodies_ignore_printer_reindentation() {
        let input_source = "/** first\n\t * second\n\t */";
        let output_source = "\t/** first\n\t\t * second\n\t\t */";
        let input_allocator = Allocator::default();
        let output_allocator = Allocator::default();
        let input = parse(&input_allocator, input_source);
        let output = parse(&output_allocator, output_source);

        assert_eq!(
            comment_bodies(&input.program, input_source),
            comment_bodies(&output.program, output_source)
        );
    }
}
