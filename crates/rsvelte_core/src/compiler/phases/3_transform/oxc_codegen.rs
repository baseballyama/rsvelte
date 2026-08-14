use std::path::PathBuf;

use oxc_allocator::{Allocator, CloneIn, Vec as ArenaVec};
use oxc_ast::ast::{
    BlockStatement, CommentContent, CommentKind, CommentPosition, ComputedMemberExpression,
    Expression, FunctionBody, ObjectProperty, Program, PropertyKind, Statement, StaticBlock,
    StringLiteral, SwitchCase,
};
use oxc_ast_visit::{Visit, VisitMut, walk, walk_mut};
use oxc_codegen::{Codegen, CodegenOptions};
use oxc_span::GetSpan;

use super::js_ast::codegen::{CodegenResult, SourceMapping, build_line_starts, offset_to_line_col};

fn options(source_map: bool) -> CodegenOptions {
    CodegenOptions {
        single_quote: true,
        source_map_path: source_map.then(|| PathBuf::from("input.svelte")),
        ..CodegenOptions::default()
    }
}

fn without_final_newline(mut code: String) -> String {
    if code.ends_with('\n') {
        code.pop();
    }
    code
}

struct DropBareEmptyStatements;

impl DropBareEmptyStatements {
    fn retain_kept<'a>(statements: &mut ArenaVec<'a, Statement<'a>>) {
        let keep: std::vec::Vec<_> = statements
            .iter()
            .enumerate()
            .map(|(index, statement)| match statement {
                Statement::EmptyStatement(empty) => {
                    empty.span.end == u32::MAX
                        || (empty.span != oxc_span::SPAN
                            && (index.checked_sub(1).is_some_and(|previous| {
                                matches!(statements[previous], Statement::EmptyStatement(_))
                            }) || statements
                                .get(index + 1)
                                .is_some_and(|next| matches!(next, Statement::EmptyStatement(_)))))
                }
                _ => true,
            })
            .collect();
        let mut index = 0;
        statements.retain(|_| {
            let retain = keep[index];
            index += 1;
            retain
        });
    }
}

struct NormalizeObjectMethods;

impl<'a> VisitMut<'a> for NormalizeObjectMethods {
    fn visit_object_property(&mut self, property: &mut ObjectProperty<'a>) {
        walk_mut::walk_object_property(self, property);
        if !property.computed
            && matches!(property.kind, PropertyKind::Init)
            && matches!(property.value, Expression::FunctionExpression(_))
        {
            property.method = true;
        }
    }
}

struct PreserveRawStrings<'a> {
    allocator: &'a Allocator,
    substitutions: Vec<(String, String)>,
}

fn raw_string_needs_preserving(raw: &str) -> bool {
    let bytes = raw.as_bytes();
    bytes.windows(2).any(|pair| {
        pair[0] == b'\\'
            && matches!(
                pair[1],
                b'0' | b'b' | b'f' | b't' | b'v' | b'x' | b'u' | b'\n' | b'\r'
            )
    }) || raw.to_ascii_lowercase().contains("<\\/script")
}

impl<'a> VisitMut<'a> for PreserveRawStrings<'a> {
    fn visit_computed_member_expression(&mut self, member: &mut ComputedMemberExpression<'a>) {
        if let Expression::StringLiteral(literal) = &mut member.expression {
            literal.raw = None;
        }
        walk_mut::walk_computed_member_expression(self, member);
    }

    fn visit_string_literal(&mut self, literal: &mut StringLiteral<'a>) {
        let raw = if let Some(raw) = literal.raw.filter(|raw| raw_string_needs_preserving(raw)) {
            raw.to_string()
        } else if literal
            .value
            .chars()
            .any(|c| matches!(c, '\0' | '\u{0008}' | '\t' | '\u{000b}' | '\u{000c}'))
        {
            let mut raw = String::from("'");
            for c in literal.value.chars() {
                match c {
                    '\\' => raw.push_str("\\\\"),
                    '\'' => raw.push_str("\\'"),
                    '\n' => raw.push_str("\\n"),
                    '\r' => raw.push_str("\\r"),
                    _ => raw.push(c),
                }
            }
            raw.push('\'');
            raw
        } else {
            return;
        };
        let sentinel = format!("\u{e000}rsvelte_raw_{}\u{e001}", self.substitutions.len());
        self.substitutions.push((format!("'{sentinel}'"), raw));
        literal.value = self.allocator.alloc_str(&sentinel).into();
        literal.raw = None;
        literal.lone_surrogates = false;
    }
}

fn prepare_program<'a>(
    program: &Program<'_>,
    allocator: &'a Allocator,
) -> (Program<'a>, Vec<(String, String)>) {
    let mut program = program.clone_in(allocator);
    DropBareEmptyStatements.visit_program(&mut program);
    NormalizeObjectMethods.visit_program(&mut program);
    for comment in &mut program.comments {
        comment.content = CommentContent::CoverageIgnoreFile;
        if comment.position == CommentPosition::Trailing {
            comment.position = CommentPosition::Leading;
            comment.attached_to = comment.span.end;
        }
    }
    let mut preserve = PreserveRawStrings {
        allocator,
        substitutions: Vec::new(),
    };
    preserve.visit_program(&mut program);
    (program, preserve.substitutions)
}

fn restore_raw_strings(mut code: String, substitutions: &[(String, String)]) -> String {
    for (sentinel, raw) in substitutions {
        code = code.replacen(sentinel, raw, 1);
    }
    code
}

fn separate_block_comments_from_line_continuations(
    program: &Program<'_>,
    mut code: String,
) -> (String, Vec<(usize, usize, usize)>) {
    let mut edits = Vec::new();
    let mut search_from = 0;
    for comment in &program.comments {
        if matches!(comment.kind, CommentKind::Line) {
            continue;
        }
        let Some(text) = program
            .source_text
            .get(comment.span.start as usize..comment.span.end as usize)
        else {
            continue;
        };
        let Some(relative) = code[search_from..].find(text) else {
            continue;
        };
        let start = search_from + relative;
        let end = start + text.len();
        search_from = end;
        let after = &code[end..];
        let whitespace_len = after
            .find(|c: char| !c.is_whitespace())
            .unwrap_or(after.len());
        if after[..whitespace_len].contains('\n') {
            continue;
        }
        let next = &after[whitespace_len..];
        if matches!(next.as_bytes().first(), Some(b'\'' | b'"'))
            && next
                .find('\n')
                .is_some_and(|newline| next[..newline].ends_with('\\'))
        {
            edits.push((end, 0, "\n".to_string()));
        }
    }
    for (start, old_len, replacement) in edits.iter().rev() {
        code.replace_range(*start..*start + *old_len, replacement);
    }
    let ranges = edits
        .into_iter()
        .map(|(start, old_len, replacement)| (start, old_len, replacement.len()))
        .collect();
    (code, ranges)
}

fn unescape_script_close_tags(mut code: String) -> (String, Vec<(usize, usize, usize)>) {
    let mut edits = Vec::new();
    let bytes = code.as_bytes();
    for start in 0..bytes.len().saturating_sub(8) {
        if bytes[start] == b'<'
            && bytes[start + 1] == b'\\'
            && bytes[start + 2] == b'/'
            && bytes[start + 3..start + 9].eq_ignore_ascii_case(b"script")
        {
            edits.push((start + 1, 1, 0));
        }
    }
    for &(start, old_len, _) in edits.iter().rev() {
        code.replace_range(start..start + old_len, "");
    }
    (code, edits)
}

fn comment_key(text: &str) -> String {
    let text = text
        .strip_prefix("/*")
        .and_then(|text| text.strip_suffix("*/"))
        .or_else(|| text.strip_prefix("//"))
        .unwrap_or(text);
    text.lines()
        .map(|line| line.trim().strip_prefix('*').unwrap_or(line.trim()).trim())
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join(" ")
}

fn restore_marked_effect_comment(mut code: String) -> String {
    const MARKER: &str = "// __rsvelte_effect_trailing__";
    let Some(comment_start) = code.find(MARKER) else {
        return code;
    };
    let comment_end = code[comment_start..]
        .find('\n')
        .map_or(code.len(), |offset| comment_start + offset);
    let payload = &code[comment_start + MARKER.len()..comment_end];
    let comment = if let Some(text) = payload.strip_prefix("line__") {
        format!("//{text}")
    } else if let Some(text) = payload.strip_prefix("block__") {
        text.to_string()
    } else {
        format!("//{payload}")
    };
    let after = ["$.user_effect(", "$.user_pre_effect(", "$.effect_root("]
        .iter()
        .filter_map(|callee| {
            code[comment_end..]
                .find(callee)
                .map(|offset| comment_end + offset)
        })
        .min();
    let before = ["$.user_effect(", "$.user_pre_effect(", "$.effect_root("]
        .iter()
        .filter_map(|callee| code[..comment_start].rfind(callee))
        .max();
    let Some(effect_offset) = after.or(before) else {
        code.replace_range(comment_start..comment_end, &comment);
        return code;
    };
    let Some(open) = code[effect_offset..]
        .find('(')
        .map(|offset| effect_offset + offset)
    else {
        return code;
    };
    let mut depth = 0u32;
    let mut end = None;
    for (offset, byte) in code[open..].bytes().enumerate() {
        match byte {
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    end = code[open + offset + 1..]
                        .starts_with(';')
                        .then_some(open + offset + 2);
                    break;
                }
            }
            _ => {}
        }
    }
    let Some(end) = end else {
        return code;
    };
    let line_start = code[..effect_offset]
        .rfind('\n')
        .map_or(0, |offset| offset + 1);
    let indent = &code[line_start..effect_offset];
    let argument = code[open + 1..end - 2].trim();
    let replacement = format!(
        "{}(\n{indent}\t{argument}, {comment}\n{indent});",
        &code[effect_offset..open]
    );
    if effect_offset < comment_start {
        code.replace_range(comment_start..comment_end, "");
        code.replace_range(effect_offset..end, &replacement);
    } else {
        code.replace_range(effect_offset..end, &replacement);
        code.replace_range(comment_start..comment_end, "");
    }
    code
}

fn rehome_direct_effect_block_comments(code: &str, source: &str) -> String {
    struct EffectCalls {
        spans: Vec<oxc_span::Span>,
    }

    impl<'a> Visit<'a> for EffectCalls {
        fn visit_call_expression(&mut self, call: &oxc_ast::ast::CallExpression<'a>) {
            if matches!(
                &call.callee,
                Expression::StaticMemberExpression(member)
                    if matches!(&member.object, Expression::Identifier(id) if id.name == "$")
                        && matches!(member.property.name.as_str(), "user_effect" | "user_pre_effect" | "effect_root")
            ) {
                self.spans.push(call.span);
            }
            walk::walk_call_expression(self, call);
        }
    }

    let allocator = Allocator::default();
    let parsed = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    if !parsed.diagnostics.is_empty() {
        return code.to_string();
    }
    let mut calls = EffectCalls { spans: Vec::new() };
    calls.visit_program(&parsed.program);
    let mut edits = Vec::new();
    for comment in &parsed.program.comments {
        if matches!(comment.kind, CommentKind::Line) {
            continue;
        }
        let Some(call) = calls
            .spans
            .iter()
            .filter(|span| span.end <= comment.span.start)
            .max_by_key(|span| span.end)
        else {
            continue;
        };
        let comment_text = &code[comment.span.start as usize..comment.span.end as usize];
        let gap = &code[call.end as usize..comment.span.start as usize];
        let source_marks_effect_trailing = source.contains(&format!("; {comment_text}"))
            && ["$.user_effect", "$.user_pre_effect", "$.effect_root"]
                .iter()
                .any(|callee| source[..source.find(comment_text).unwrap_or(0)].contains(callee));
        let tail_of_block = code[comment.span.end as usize..]
            .trim_start()
            .starts_with('}');
        if gap.trim() != ";" && !source_marks_effect_trailing && !tail_of_block {
            continue;
        }
        let start = call.start as usize;
        let comment_end = comment.span.end as usize;
        let Some(open) = code[start..call.end as usize]
            .find('(')
            .map(|offset| start + offset)
        else {
            continue;
        };
        let line_start = code[..start].rfind('\n').map_or(0, |offset| offset + 1);
        let indent = &code[line_start..start];
        let argument = code[open + 1..call.end as usize - 1]
            .trim()
            .lines()
            .map(|line| format!("{indent}  {}", line.strip_prefix(indent).unwrap_or(line)))
            .collect::<Vec<_>>()
            .join("\n");
        let replacement = format!(
            "{}(\n{argument} {comment_text},\n{indent});",
            &code[start..open]
        );
        if gap.trim() == ";" {
            edits.push((start, comment_end - start, replacement));
        } else {
            let call_end = call.end as usize;
            let end = call_end + usize::from(code.as_bytes().get(call_end) == Some(&b';'));
            edits.push((start, end - start, replacement));
            edits.push((
                comment.span.start as usize,
                comment_end - comment.span.start as usize,
                String::new(),
            ));
        }
    }
    let mut code = code.to_string();
    for (start, len, replacement) in edits.into_iter().rev() {
        code.replace_range(start..start + len, &replacement);
    }
    code
}

fn following_anchor(source_after: &str) -> Option<String> {
    let source_after = source_after.trim_start();
    if source_after.starts_with("$:") {
        return Some("$:".into());
    }
    if let Some(rest) = source_after.strip_prefix('.') {
        let end = rest
            .find(|c: char| !c.is_ascii_alphanumeric() && c != '_' && c != '$')
            .map_or(source_after.len(), |end| end + 1);
        let mut anchor = source_after[..end].to_string();
        if source_after[end..].trim_start().starts_with('(') {
            anchor.push('(');
        }
        return Some(anchor);
    }
    let end = source_after
        .find(|c: char| !c.is_ascii_alphanumeric() && c != '_' && c != '$')
        .unwrap_or(source_after.len());
    if end == 0 {
        return None;
    }
    let identifier = &source_after[..end];
    let rest = source_after[end..].trim_start();
    if matches!(identifier, "let" | "const" | "var" | "class" | "function") {
        let name_end = rest
            .find(|c: char| !c.is_ascii_alphanumeric() && c != '_' && c != '$')
            .unwrap_or(rest.len());
        if name_end > 0 {
            return Some(format!("{identifier} {}", &rest[..name_end]));
        }
    }
    if rest.starts_with(')')
        && rest
            .find('\n')
            .is_none_or(|newline| rest[..newline].contains("=>"))
    {
        return Some(format!("{identifier}) =>"));
    }
    Some(identifier.to_string())
}

fn find_comment_target(code: &str, source_after: &str, before: usize) -> Option<usize> {
    let anchor = following_anchor(source_after)?;
    let code = code.get(..before)?;
    let mut search_end = code.len();
    while let Some(start) = code[..search_end].rfind(&anchor) {
        let identifier_anchor = anchor
            .as_bytes()
            .first()
            .is_some_and(|byte| byte.is_ascii_alphanumeric() || matches!(byte, b'_' | b'$'));
        let starts_at_boundary = !identifier_anchor
            || (start == 0
                || !code.as_bytes()[start - 1].is_ascii_alphanumeric()
                    && !matches!(code.as_bytes()[start - 1], b'_' | b'$'));
        let ends_with_identifier = anchor
            .as_bytes()
            .last()
            .is_some_and(|byte| byte.is_ascii_alphanumeric() || matches!(byte, b'_' | b'$'));
        let end = start + anchor.len();
        let ends_at_boundary = !ends_with_identifier
            || end == code.len()
            || !code.as_bytes()[end].is_ascii_alphanumeric()
                && !matches!(code.as_bytes()[end], b'_' | b'$');
        if starts_at_boundary && ends_at_boundary {
            return Some(start);
        }
        search_end = start;
    }
    None
}

fn containing_statement_start(code: &str, offset: usize) -> Option<usize> {
    struct Statements {
        spans: Vec<oxc_span::Span>,
    }

    impl<'a> Visit<'a> for Statements {
        fn visit_statement(&mut self, statement: &Statement<'a>) {
            self.spans.push(statement.span());
            walk::walk_statement(self, statement);
        }

        fn visit_expression(&mut self, _expression: &Expression<'a>) {}
    }

    let allocator = Allocator::default();
    let parsed = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    let mut statements = Statements { spans: Vec::new() };
    statements.visit_program(&parsed.program);
    statements
        .spans
        .into_iter()
        .filter(|span| span.start as usize <= offset && offset < span.end as usize)
        .min_by_key(|span| span.end - span.start)
        .map(|span| span.start as usize)
}

fn containing_statement_end(code: &str, offset: usize) -> Option<usize> {
    struct Statements {
        spans: Vec<oxc_span::Span>,
    }

    impl<'a> Visit<'a> for Statements {
        fn visit_statement(&mut self, statement: &Statement<'a>) {
            self.spans.push(statement.span());
            walk::walk_statement(self, statement);
        }

        fn visit_expression(&mut self, _expression: &Expression<'a>) {}
    }

    let allocator = Allocator::default();
    let parsed = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    let mut statements = Statements { spans: Vec::new() };
    statements.visit_program(&parsed.program);
    statements
        .spans
        .into_iter()
        .filter(|span| span.start as usize <= offset && offset < span.end as usize)
        .min_by_key(|span| span.end - span.start)
        .map(|span| span.end as usize)
}

fn trailing_declaration_target(source_before: &str, code: &str) -> Option<usize> {
    let line = source_before
        .rsplit_once('\n')
        .map_or(source_before, |(_, line)| line);
    let declaration = line.rfind("let ").or_else(|| line.rfind("const "))?;
    let name = line[declaration..]
        .split_whitespace()
        .nth(1)?
        .trim_end_matches(|c: char| !c.is_ascii_alphanumeric() && c != '_' && c != '$');
    (!name.is_empty()).then(|| {
        let needle = format!(" {name}");
        let start = code.rfind(&needle)? + 1;
        let end = containing_statement_end(code, start)?;
        Some(end + usize::from(code.as_bytes().get(end) == Some(&b';')))
    })?
}

fn inside_source_top_level_statement(source: &str, offset: u32) -> bool {
    let allocator = Allocator::default();
    let parsed = oxc_parser::Parser::new(&allocator, source, oxc_span::SourceType::mjs()).parse();
    parsed
        .program
        .body
        .iter()
        .any(|statement| statement.span().start <= offset && offset < statement.span().end)
}

fn trailing_generated_var_target(code: &str) -> Option<usize> {
    code.rfind("var ").map(|start| start + "var ".len())
}

fn nearest_statement_division_target(
    code: &str,
    actual_start: usize,
    actual_end: usize,
) -> Option<usize> {
    struct Statements {
        spans: Vec<oxc_span::Span>,
    }

    impl<'a> Visit<'a> for Statements {
        fn visit_statement(&mut self, statement: &Statement<'a>) {
            self.spans.push(statement.span());
            walk::walk_statement(self, statement);
        }

        fn visit_expression(&mut self, _expression: &Expression<'a>) {}
    }

    let allocator = Allocator::default();
    let parsed = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::mjs()).parse();
    let mut statements = Statements { spans: Vec::new() };
    statements.visit_program(&parsed.program);
    statements
        .spans
        .into_iter()
        .filter_map(|span| {
            let start = span.start as usize;
            let end = span.end as usize;
            let slash = code[start..end]
                .find(" / ")
                .map(|relative| start + relative + 3)?;
            let distance = if end <= actual_start {
                actual_start - end
            } else {
                start.saturating_sub(actual_end)
            };
            Some((distance, span.end - span.start, slash))
        })
        .min()
        .map(|(_, _, slash)| slash)
}

fn inspect_trailing_comment_target(code: &str, before: usize) -> Option<usize> {
    let call = code[..before].rfind("$.inspect(")?;
    let array = code[call..before].find("() => [")? + call + "() => ".len();
    let mut depth = 0_u32;
    for (offset, byte) in code.as_bytes()[array..before].iter().enumerate() {
        match byte {
            b'[' => depth += 1,
            b']' => {
                depth -= 1;
                if depth == 0 {
                    return Some(array + offset);
                }
            }
            _ => {}
        }
    }
    None
}

fn relocate_late_comments(
    program: &Program<'_>,
    mut code: String,
    anchors: &[(usize, usize)],
    substitutions: &[(String, String)],
    loc_map: Option<&[(u32, u32, Option<u32>)]>,
    original_source: Option<&str>,
) -> (String, Vec<(usize, usize, usize)>) {
    let original_code = code.clone();
    let generated_comments = {
        let allocator = Allocator::default();
        let parsed =
            oxc_parser::Parser::new(&allocator, &code, oxc_span::SourceType::mjs()).parse();
        parsed
            .program
            .comments
            .iter()
            .filter_map(|comment| {
                let start = comment.span.start as usize;
                let end = comment.span.end as usize;
                code.get(start..end)
                    .map(|text| (comment_key(text), start, end))
            })
            .collect::<Vec<_>>()
    };
    let mut edits = Vec::new();
    let mut search_from = 0;
    for comment in &program.comments {
        let span = comment.span;
        let Some(text) = program
            .source_text
            .get(span.start as usize..span.end as usize)
        else {
            continue;
        };
        let anchor_target = anchors
            .iter()
            .filter(|(source, _)| *source >= span.end as usize)
            .min_by_key(|(source, _)| *source)
            .map(|(_, generated)| *generated);
        let actual = code[search_from..]
            .find(text)
            .map(|relative| (search_from + relative, text.len()))
            .or_else(|| {
                let key = comment_key(text);
                generated_comments
                    .iter()
                    .find(|(candidate, start, _)| *start >= search_from && *candidate == key)
                    .map(|(_, start, end)| (*start, end - start))
            });
        if let Some((actual_start, actual_len)) = actual {
            search_from = actual_start + actual_len;
        }
        let source_after = &program.source_text[span.end as usize..];
        let source_before = &program.source_text[..span.start as usize];
        let own_line = program.source_text[..span.start as usize]
            .rsplit_once('\n')
            .map_or(span.start == 0, |(_, prefix)| prefix.trim().is_empty())
            && source_after
                .find(|c: char| !c.is_whitespace())
                .is_some_and(|next| source_after[..next].contains('\n'));
        let starts_on_own_line = program.source_text[..span.start as usize]
            .rsplit_once('\n')
            .map_or(span.start == 0, |(_, prefix)| prefix.trim().is_empty());
        let source_after_trimmed = source_after.trim_start();
        let mut trailing_target = (anchor_target.is_none()
            && !inside_source_top_level_statement(program.source_text, span.start)
            && (source_after.trim().is_empty() || source_after.trim_start().starts_with("//")))
        .then(|| {
            starts_on_own_line
                .then(|| trailing_generated_var_target(&code))
                .flatten()
                .or_else(|| {
                    anchors
                        .iter()
                        .filter(|(source, _)| *source <= span.start as usize)
                        .max_by_key(|(source, _)| *source)
                        .and_then(|(_, generated)| containing_statement_end(&code, *generated))
                        .map(|end| end + usize::from(code.as_bytes().get(end) == Some(&b';')))
                        .or_else(|| trailing_declaration_target(source_before, &code))
                })
        })
        .flatten();
        let textual_target = (source_after_trimmed.starts_with('.')
            || actual.is_none()
            || (!own_line && !matches!(comment.kind, CommentKind::Line)))
        .then(|| {
            find_comment_target(
                &code,
                source_after,
                actual.map_or(code.len(), |(start, _)| start),
            )
        })
        .flatten();
        let thunk_parameter_target =
            (!own_line && !matches!(comment.kind, CommentKind::Line) && text.starts_with("/**"))
                .then(|| {
                    let reference = anchor_target.or_else(|| actual.map(|(start, _)| start))?;
                    let arrow = code[..reference].rfind("() =>")?;
                    code[arrow + 5..reference]
                        .chars()
                        .all(|c| c.is_whitespace() || c == '(')
                        .then_some(arrow + 1)
                })
                .flatten();
        let reactive_target = (!matches!(comment.kind, CommentKind::Line)
            && source_after.trim_start().starts_with("$:"))
        .then(|| {
            actual.and_then(|(actual_start, _)| {
                let label = code[..actual_start].rfind("$:")?;
                code[label + 2..actual_start]
                    .trim()
                    .is_empty()
                    .then_some(label + 2)
            })
        })
        .flatten()
        .or_else(|| {
            (!matches!(comment.kind, CommentKind::Line)
                && source_after.trim_start().starts_with("$:")
                && anchor_target
                    .and_then(|target| code.get(target..))
                    .is_some_and(|rest| rest.starts_with("$:")))
            .then(|| anchor_target.map(|target| target + 2))
            .flatten()
        });
        let preceding =
            actual.and_then(|(start, _)| code[..start].chars().rev().find(|c| !c.is_whitespace()));
        let source_preceding = program.source_text[..span.start as usize]
            .chars()
            .rev()
            .find(|c| !c.is_whitespace());
        let source_following = source_after_trimmed.chars().next();
        let crosses_closing_kind = matches!(
            (source_preceding, source_following),
            (Some(')'), Some('}')) | (Some('}'), Some(')'))
        );
        let interior_target = actual
            .filter(|_| {
                (!own_line && !crosses_closing_kind)
                    && (matches!(comment.kind, CommentKind::Line) || !text.starts_with("/**"))
                    || matches!(preceding, Some('['))
            })
            .and_then(|(start, _)| containing_statement_start(&code, start));
        let missing_interior_target = actual
            .is_none()
            .then(|| {
                (!own_line || matches!(source_preceding, Some('[')))
                    .then(|| {
                        textual_target
                            .or(anchor_target)
                            .and_then(|target| containing_statement_start(&code, target))
                    })
                    .flatten()
            })
            .flatten();
        let dangling_chunk = loc_map
            .and_then(|loc_map| {
                loc_map
                    .iter()
                    .find(|(start, end, _)| span.start >= *start && span.end <= *end)
            })
            .is_some_and(|(_, end, _)| {
                program.source_text[span.end as usize..*end as usize]
                    .trim()
                    .is_empty()
            });
        let dangling_prefix_has_code = loc_map
            .and_then(|loc_map| {
                loc_map
                    .iter()
                    .find(|(start, end, _)| span.start >= *start && span.end <= *end)
            })
            .is_some_and(|(start, _, _)| {
                let prefix = &program.source_text[*start as usize..span.start as usize];
                let allocator = Allocator::default();
                !oxc_parser::Parser::new(&allocator, prefix, oxc_span::SourceType::mjs())
                    .parse()
                    .program
                    .body
                    .is_empty()
            });
        let previous_generated = anchors
            .iter()
            .filter(|(source, _)| *source <= span.start as usize)
            .max_by_key(|(source, _)| *source)
            .map_or(0, |(_, generated)| *generated);
        let original_source_after_comment = loc_map
            .and_then(|loc_map| {
                loc_map
                    .iter()
                    .find(|(start, end, _)| span.start >= *start && span.end <= *end)
            })
            .and_then(|(_, _, source_offset)| {
                let source = original_source?.get((*source_offset)? as usize..)?;
                let script_end = source.find("</script>")?;
                let relative = source[..script_end].rfind(text)?;
                source.get(relative + text.len()..)
            });
        let removed_inspect_comment = !program.source_text.contains("$.inspect(")
            && loc_map
                .and_then(|loc_map| {
                    loc_map
                        .iter()
                        .find(|(start, end, _)| span.start >= *start && span.end <= *end)
                })
                .and_then(|(_, _, source_offset)| {
                    let source = original_source?.get((*source_offset)? as usize..)?;
                    let script_end = source.find("</script>")?;
                    let comment_start = source[..script_end].rfind(text)?;
                    let before = &source[..comment_start];
                    let inspect = before.rfind("$inspect(")?;
                    before[inspect..].trim_end().ends_with(';').then_some(())
                })
                .is_some();
        let trailing_script_comment = original_source_after_comment.is_some_and(|source| {
            source
                .find("</script>")
                .is_some_and(|close| source[..close].trim().is_empty())
        });
        let source_continues_after_script = original_source_after_comment.is_some_and(|source| {
            source.find("</script>").is_some_and(|close| {
                source[..close].trim().is_empty() && !source[close + 9..].trim().is_empty()
            })
        });
        let generated_var = (dangling_chunk
            && (!dangling_prefix_has_code || source_continues_after_script))
            .then(|| {
                code[previous_generated..]
                    .match_indices("var ")
                    .find(|(relative, _)| {
                        !code[previous_generated + relative + 4..].starts_with("$$exports")
                    })
                    .map(|(relative, _)| previous_generated + relative + 3)
            })
            .flatten();
        let body_tail = (dangling_chunk && dangling_prefix_has_code && trailing_script_comment)
            .then(|| code.rfind("\n}").map(|target| target + 1))
            .flatten();
        if body_tail.is_some() {
            trailing_target = None;
        }
        let generated_own_line = actual.is_some_and(|(start, _)| {
            code[..start]
                .rsplit_once('\n')
                .map_or(start == 0, |(_, prefix)| prefix.trim().is_empty())
        });
        let division_target = ((actual.is_none() || generated_own_line)
            && !own_line
            && !matches!(comment.kind, CommentKind::Line)
            && (matches!(source_following, Some('/')) || matches!(source_preceding, Some('/'))))
        .then(|| {
            let (start, end) = actual
                .map(|(start, len)| (start, start + len))
                .or_else(|| anchor_target.map(|target| (target, target)))?;
            nearest_statement_division_target(&code, start, end)
        })
        .flatten();
        let raw_string_target = matches!(source_following, Some('\'' | '"'))
            .then(|| {
                let index = substitutions
                    .iter()
                    .position(|(_, raw)| source_after_trimmed.starts_with(raw))?;
                let before = actual.map_or(code.len(), |(start, _)| start);
                code[..before].rfind(&format!("'\u{e000}rsvelte_raw_{index}\u{e001}"))
            })
            .flatten();
        let line_argument_range = (generated_own_line
            && !own_line
            && matches!(comment.kind, CommentKind::Line)
            && matches!(source_preceding, Some('(')))
        .then(|| {
            let target = find_comment_target(
                &code,
                source_after,
                actual.map_or(code.len(), |(start, _)| start),
            )?;
            let open = code[..target].rfind('(')?;
            let close = code[target..].find(')').map(|close| target + close)?;
            let argument = code[target..close].trim();
            (!argument.is_empty() && !argument.contains(',')).then(|| {
                let line_start = code[..open].rfind('\n').map_or(0, |start| start + 1);
                let indent = &code[line_start..open]
                    [..code[line_start..open].len() - code[line_start..open].trim_start().len()];
                (
                    open + 1,
                    close,
                    format!("\n{indent}\t{text}\n{indent}\t{argument}\n{indent}"),
                )
            })
        })
        .flatten();
        let removed_inspect_target = removed_inspect_comment
            .then(|| {
                let actual_start = actual.map_or(code.len(), |(start, _)| start);
                code[..actual_start]
                    .rfind("\n\tvar ")
                    .map(|start| start + 1)
            })
            .flatten();
        if let Some(target) = removed_inspect_target {
            edits.push((target, 0, format!("\t{text}\n")));
            if let Some((actual_start, actual_len)) = actual {
                edits.push((actual_start, actual_len, String::new()));
            }
            continue;
        }
        let inspect_target = source_before
            .contains("$.inspect")
            .then(|| {
                inspect_trailing_comment_target(
                    &code,
                    actual.map_or(code.len(), |(start, _)| start),
                )
            })
            .flatten();
        if let Some(target) = inspect_target {
            edits.push((target, 0, format!(", {text}\n")));
            if let Some((actual_start, actual_len)) = actual {
                edits.push((actual_start, actual_len, String::new()));
            }
            continue;
        }
        if actual.is_some()
            && matches!(source_preceding, Some(';'))
            && !source_continues_after_script
            && trailing_target.is_none()
        {
            continue;
        }
        let closing_anchor_target = source_after_trimmed
            .chars()
            .next()
            .filter(|char| matches!(char, ')' | '}'))
            .is_some_and(|source_char| {
                anchor_target
                    .and_then(|target| code[target..].chars().next())
                    .is_some_and(|generated_char| generated_char == source_char)
            });
        if generated_own_line
            && reactive_target.is_none()
            && division_target.is_none()
            && raw_string_target.is_none()
            && body_tail.is_none()
            && generated_var.is_none()
            && thunk_parameter_target.is_none()
            && line_argument_range.is_none()
            && trailing_target.is_none()
            && !source_after_trimmed.starts_with('.')
            && !closing_anchor_target
            && !text.starts_with("/**")
            && (!dangling_chunk || trailing_script_comment)
        {
            continue;
        }
        if let Some((start, end, replacement)) = line_argument_range {
            edits.push((start, end - start, replacement));
            if let Some((actual_start, actual_len)) = actual {
                edits.push((actual_start, actual_len, String::new()));
            }
            continue;
        }
        let Some(target) = reactive_target
            .or(trailing_target)
            .or(division_target)
            .or(raw_string_target)
            .or(generated_var)
            .or(body_tail)
            .or(interior_target)
            .or(missing_interior_target)
            .or(thunk_parameter_target)
            .or(textual_target)
            .or(anchor_target)
        else {
            continue;
        };
        if actual.is_some_and(|(actual_start, _)| actual_start <= target) {
            continue;
        }
        let insertion = if reactive_target.is_some() {
            format!(" {text}")
        } else if trailing_target.is_some() {
            if starts_on_own_line {
                format!("{text}\n ")
            } else {
                format!(" {text}")
            }
        } else if division_target.is_some() {
            format!("{text} ")
        } else if generated_var.is_some() {
            match comment.kind {
                CommentKind::Line => format!(" {text}\n"),
                CommentKind::SingleLineBlock | CommentKind::MultiLineBlock => {
                    format!(" {text} ")
                }
            }
        } else if body_tail.is_some() {
            match comment.kind {
                CommentKind::Line => format!("\t{text}\n"),
                CommentKind::SingleLineBlock | CommentKind::MultiLineBlock => {
                    format!("\t{text}\n")
                }
            }
        } else if interior_target.is_some() || missing_interior_target.is_some() {
            match comment.kind {
                CommentKind::Line => format!("{text}\n"),
                CommentKind::SingleLineBlock | CommentKind::MultiLineBlock => format!("{text}\n"),
            }
        } else if thunk_parameter_target.is_some() {
            text.to_string()
        } else {
            match comment.kind {
                CommentKind::Line => format!("{text}\n"),
                CommentKind::SingleLineBlock | CommentKind::MultiLineBlock if own_line => {
                    format!("{text}\n")
                }
                CommentKind::SingleLineBlock | CommentKind::MultiLineBlock => format!("{text} "),
            }
        };
        edits.push((target, 0, insertion));
        if let Some((actual_start, actual_len)) = actual {
            edits.push((actual_start, actual_len, String::new()));
        }
    }
    edits.retain(|(start, old_len, _)| {
        code.is_char_boundary(*start) && code.is_char_boundary(*start + *old_len)
    });
    edits.sort_unstable_by(|a, b| {
        b.0.cmp(&a.0)
            .then_with(|| b.1.cmp(&a.1))
            .then_with(|| b.2.starts_with(" //").cmp(&a.2.starts_with(" //")))
    });
    for (start, old_len, replacement) in &edits {
        code.replace_range(*start..*start + *old_len, replacement);
    }
    let allocator = Allocator::default();
    let parsed = oxc_parser::Parser::new(&allocator, &code, oxc_span::SourceType::mjs()).parse();
    if parsed.panicked || !parsed.diagnostics.is_empty() {
        return (original_code, Vec::new());
    }
    let mut ranges = edits
        .into_iter()
        .map(|(start, old_len, replacement)| (start, old_len, replacement.len()))
        .collect::<Vec<_>>();
    ranges.sort_unstable_by_key(|range| range.0);
    (code, ranges)
}

fn source_anchors(
    program: &Program<'_>,
    code: &str,
    map: Option<&oxc_sourcemap::SourceMap>,
) -> Vec<(usize, usize)> {
    let source_starts = build_line_starts(program.source_text);
    let generated_starts = build_line_starts(code);
    let Some(map) = map else {
        return Vec::new();
    };
    map.get_tokens()
        .filter_map(|token| {
            token.get_source_id()?;
            let source = line_col_to_offset(
                &source_starts,
                token.get_src_line() as usize,
                token.get_src_col() as usize,
            )?;
            let generated = line_col_to_offset(
                &generated_starts,
                token.get_dst_line() as usize,
                token.get_dst_col() as usize,
            )?;
            Some((source, generated))
        })
        .collect()
}

impl<'a> VisitMut<'a> for DropBareEmptyStatements {
    fn visit_program(&mut self, program: &mut Program<'a>) {
        walk_mut::walk_program(self, program);
        Self::retain_kept(&mut program.body);
    }

    fn visit_block_statement(&mut self, block: &mut BlockStatement<'a>) {
        walk_mut::walk_block_statement(self, block);
        Self::retain_kept(&mut block.body);
    }

    fn visit_switch_case(&mut self, case: &mut SwitchCase<'a>) {
        walk_mut::walk_switch_case(self, case);
        Self::retain_kept(&mut case.consequent);
    }

    fn visit_function_body(&mut self, body: &mut FunctionBody<'a>) {
        walk_mut::walk_function_body(self, body);
        Self::retain_kept(&mut body.statements);
    }

    fn visit_static_block(&mut self, block: &mut StaticBlock<'a>) {
        walk_mut::walk_static_block(self, block);
        Self::retain_kept(&mut block.body);
    }
}

fn print_inner(program: &Program<'_>) -> String {
    let allocator = Allocator::default();
    let (program, substitutions) = prepare_program(program, &allocator);
    let printed = Codegen::new()
        .with_options(options(
            !program.comments.is_empty() && !program.source_text.is_empty(),
        ))
        .build(&program);
    let anchors = source_anchors(&program, &printed.code, printed.map.as_ref());
    let (code, _) =
        relocate_late_comments(&program, printed.code, &anchors, &substitutions, None, None);
    let code = rehome_direct_effect_block_comments(
        &restore_marked_effect_comment(code),
        program.source_text,
    );
    let code = restore_raw_strings(code, &substitutions);
    let (code, _) = separate_block_comments_from_line_continuations(&program, code);
    let (code, _) = unescape_script_close_tags(code);
    without_final_newline(code)
}

pub fn print(program: &Program<'_>) -> String {
    print_inner(program)
}

fn print_with_raw_map_inner(
    program: &Program<'_>,
    loc_map: Option<&[(u32, u32, Option<u32>)]>,
    original_source: Option<&str>,
) -> CodegenResult {
    let allocator = Allocator::default();
    let (program, substitutions) = prepare_program(program, &allocator);
    let printed = Codegen::new().with_options(options(true)).build(&program);
    let anchors = source_anchors(&program, &printed.code, printed.map.as_ref());
    let (old_code, comment_replacements) = relocate_late_comments(
        &program,
        printed.code,
        &anchors,
        &substitutions,
        loc_map,
        original_source,
    );
    let old_starts = build_line_starts(&old_code);
    let restored_code = restore_raw_strings(old_code.clone(), &substitutions);
    let (code, line_continuation_replacements) =
        separate_block_comments_from_line_continuations(&program, restored_code);
    let (code, script_close_replacements) = unescape_script_close_tags(code);
    let new_starts = build_line_starts(&code);
    let replacements = substitution_ranges(&old_code, &substitutions);
    let mappings = printed
        .map
        .map(|map| {
            map.get_tokens()
                .filter_map(|token| {
                    token.get_source_id().and_then(|_| {
                        let old_offset = line_col_to_offset(
                            &old_starts,
                            token.get_dst_line() as usize,
                            token.get_dst_col() as usize,
                        )?;
                        let moved_offset = translate_offset(old_offset, &comment_replacements);
                        let restored_offset = translate_offset(moved_offset, &replacements);
                        let new_offset =
                            translate_offset(restored_offset, &line_continuation_replacements);
                        let new_offset = translate_offset(new_offset, &script_close_replacements);
                        let (gen_line, gen_col) = offset_to_line_col(&new_starts, new_offset);
                        Some(SourceMapping {
                            gen_line: gen_line as u32,
                            gen_col: gen_col as u32,
                            source: 0,
                            orig_line: token.get_src_line(),
                            orig_col: token.get_src_col(),
                            name: None,
                        })
                    })
                })
                .collect()
        })
        .unwrap_or_default();
    CodegenResult {
        code: without_final_newline(rehome_direct_effect_block_comments(
            &restore_marked_effect_comment(code),
            program.source_text,
        )),
        mappings,
    }
}

fn print_with_raw_map(
    program: &Program<'_>,
    loc_map: Option<&[(u32, u32, Option<u32>)]>,
    original_source: Option<&str>,
) -> CodegenResult {
    print_with_raw_map_inner(program, loc_map, original_source)
}

fn substitution_ranges(
    code: &str,
    substitutions: &[(String, String)],
) -> Vec<(usize, usize, usize)> {
    let mut ranges = Vec::with_capacity(substitutions.len());
    for (sentinel, raw) in substitutions {
        if let Some(start) = code.find(sentinel) {
            ranges.push((start, sentinel.len(), raw.len()));
        }
    }
    ranges.sort_unstable_by_key(|range| range.0);
    ranges
}

fn translate_offset(offset: usize, replacements: &[(usize, usize, usize)]) -> usize {
    let mut translated = offset;
    for &(start, old_len, new_len) in replacements {
        if offset < start {
            break;
        }
        if old_len > 0 && offset < start + old_len {
            return start + new_len.min(offset - start);
        }
        translated = translated.saturating_add_signed(new_len as isize - old_len as isize);
    }
    translated
}

pub fn print_with_map(program: &Program<'_>, original_source: &str) -> CodegenResult {
    let mut printed = print_with_raw_map(program, None, Some(original_source));
    let source_starts = build_line_starts(program.source_text);
    printed.mappings.retain(|mapping| {
        line_col_to_offset(
            &source_starts,
            mapping.orig_line as usize,
            mapping.orig_col as usize,
        )
        .is_some_and(|offset| offset <= original_source.len())
    });
    printed
}

pub fn print_split_with_map(
    program: &Program<'_>,
    original_source: &str,
    loc_base: u32,
    loc_map: &[(u32, u32, Option<u32>)],
) -> CodegenResult {
    let mut printed = print_with_raw_map(program, Some(loc_map), Some(original_source));
    let split_starts = build_line_starts(program.source_text);
    let original_starts = build_line_starts(original_source);

    printed.mappings.retain_mut(|mapping| {
        let Some(split_offset) = line_col_to_offset(
            &split_starts,
            mapping.orig_line as usize,
            mapping.orig_col as usize,
        ) else {
            return false;
        };
        if split_offset < loc_base as usize {
            return false;
        }
        let Some((start, _, Some(source_offset))) = loc_map
            .iter()
            .find(|(start, end, _)| (*start as usize..*end as usize).contains(&split_offset))
        else {
            return false;
        };
        let original_offset = *source_offset as usize + split_offset - *start as usize;
        if original_offset > original_source.len() {
            return false;
        }
        let (line, column) = offset_to_line_col(&original_starts, original_offset);
        mapping.source = 0;
        mapping.orig_line = line as u32;
        mapping.orig_col = column as u32;
        mapping.name = None;
        true
    });
    printed
}

fn line_col_to_offset(line_starts: &[usize], line: usize, column: usize) -> Option<usize> {
    line_starts.get(line).map(|start| start + column)
}
