//! Make the generated program read the same in a `.tsx` file as in the `.ts`
//! file upstream svelte-check writes it to.
//!
//! TypeScript lexes two `.ts` forms as JSX in a `.tsx` file: a generic arrow
//! whose only type parameter has no constraint (`<T>(x: T) => x`,
//! `<const T>(x: T) => x`), and an angle-bracket assertion (`<T>expr`). Both can
//! reach the output from the instance script, the module script, a markup
//! expression or a snippet's `typeParams`, so this pass reads the assembled
//! output rather than any one of its producers.

use oxc_ast::ast as oxc;
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;

use super::rewrite_external_imports::TextEdit;

/// A type moved by an assertion rewrite: its text now starts at
/// `new_offset` in the rewritten output, and its old start was `old_offset`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) struct MovedType {
    pub(crate) old_offset: u32,
    pub(crate) new_offset: u32,
}

pub(crate) struct TsxRewrite {
    pub(crate) code: String,
    pub(crate) edits: Vec<TextEdit>,
    pub(crate) moved_types: Vec<MovedType>,
}

struct Insertion {
    start: u32,
    end: u32,
    text: String,
    /// Within one offset, inner edits are written before outer ones.
    depth: u32,
    /// Byte offset, inside `text`, of a moved type and the type's old start.
    moved_type: Option<(u32, u32)>,
}

fn to_u32(value: usize) -> u32 {
    u32::try_from(value).expect("generated offsets fit in u32")
}

/// Rewrite every JSX-ambiguous form in `code`, or `None` when there is none.
/// A recoverable parse error (a user's own syntax error, carried through)
/// still leaves every node it built at its real span; only a parse that gave
/// up is skipped.
pub(crate) fn disambiguate_for_tsx(code: &str) -> Option<TsxRewrite> {
    if !code.as_bytes().contains(&b'<') {
        return None;
    }
    let allocator = oxc_allocator::Allocator::default();
    let parsed = oxc_parser::Parser::new(&allocator, code, oxc_span::SourceType::ts()).parse();
    if parsed.fatal_error {
        return None;
    }
    let mut collector = Collector {
        code,
        depth: 0,
        insertions: Vec::new(),
    };
    collector.visit_program(&parsed.program);
    let mut insertions = collector.insertions;
    if insertions.is_empty() {
        return None;
    }
    insertions.sort_by(|a, b| {
        (a.start, a.end, std::cmp::Reverse(a.depth)).cmp(&(
            b.start,
            b.end,
            std::cmp::Reverse(b.depth),
        ))
    });

    let mut out = String::with_capacity(code.len() + insertions.len() * 8);
    let mut edits: Vec<TextEdit> = Vec::with_capacity(insertions.len());
    let mut moved_types = Vec::new();
    let mut copied = 0usize;
    for insertion in insertions {
        let start = insertion.start as usize;
        let end = insertion.end as usize;
        if start < copied {
            // Overlapping rewrites cannot be expressed as ordered edits.
            return None;
        }
        out.push_str(&code[copied..start]);
        if let Some((within, old_offset)) = insertion.moved_type {
            moved_types.push(MovedType {
                old_offset,
                new_offset: to_u32(out.len()) + within,
            });
        }
        out.push_str(&insertion.text);
        copied = end;
        // Two zero-width insertions at one offset become one edit.
        if let Some(last) = edits.last_mut()
            && last.start == insertion.start
            && last.end == insertion.start
            && insertion.end == insertion.start
        {
            last.replacement_len += to_u32(insertion.text.len());
            last.replacement_utf16_len += to_u32(insertion.text.encode_utf16().count());
            continue;
        }
        edits.push(TextEdit {
            start: insertion.start,
            end: insertion.end,
            replacement_len: to_u32(insertion.text.len()),
            replacement_utf16_len: to_u32(insertion.text.encode_utf16().count()),
        });
    }
    out.push_str(&code[copied..]);
    Some(TsxRewrite {
        code: out,
        edits,
        moved_types,
    })
}

struct Collector<'s> {
    code: &'s str,
    depth: u32,
    insertions: Vec<Insertion>,
}

impl Collector<'_> {
    /// Whether a `,` follows the lone type parameter before the closing `>`,
    /// read over code bytes only (a comma inside a comment does not count).
    fn has_trailing_comma(&self, from: u32, to: u32) -> bool {
        let bytes = self.code.as_bytes();
        let mut i = from as usize;
        let to = (to as usize).min(bytes.len());
        while i < to {
            match bytes[i] {
                b',' => return true,
                b'/' if bytes.get(i + 1) == Some(&b'/') => {
                    while i < to && bytes[i] != b'\n' {
                        i += 1;
                    }
                }
                b'/' if bytes.get(i + 1) == Some(&b'*') => {
                    i += 2;
                    while i + 1 < to && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                        i += 1;
                    }
                    i += 2;
                }
                _ => i += 1,
            }
        }
        false
    }
}

impl<'a> Visit<'a> for Collector<'_> {
    fn visit_arrow_function_expression(&mut self, it: &oxc::ArrowFunctionExpression<'a>) {
        if let Some(declaration) = it.type_parameters.as_deref()
            && let [param] = declaration.params.as_slice()
            && param.constraint.is_none()
            && param.default.is_none()
            && !self.has_trailing_comma(param.span.end, declaration.span.end)
        {
            self.insertions.push(Insertion {
                start: param.span.end,
                end: param.span.end,
                text: ",".to_string(),
                depth: self.depth,
                moved_type: None,
            });
        }
        self.depth += 1;
        oxc_ast_visit::walk::walk_arrow_function_expression(self, it);
        self.depth -= 1;
    }

    fn visit_ts_type_assertion(&mut self, it: &oxc::TSTypeAssertion<'a>) {
        let type_span = it.type_annotation.span();
        let expression = it.expression.span();
        let prefix = &self.code[it.span.start as usize..expression.start as usize];
        let type_text = &self.code[type_span.start as usize..type_span.end as usize];
        // The map remap shifts columns, not lines.
        if !prefix.contains('\n') && !type_text.contains('\n') {
            self.insertions.push(Insertion {
                start: it.span.start,
                end: expression.start,
                text: "(".to_string(),
                depth: self.depth,
                moved_type: None,
            });
            self.insertions.push(Insertion {
                start: expression.end,
                end: expression.end,
                text: format!(" as {type_text})"),
                depth: self.depth,
                moved_type: Some((4, type_span.start)),
            });
        }
        self.depth += 1;
        oxc_ast_visit::walk::walk_ts_type_assertion(self, it);
        self.depth -= 1;
    }
}

#[cfg(test)]
mod tests {
    use super::disambiguate_for_tsx;

    fn rewrite(code: &str) -> String {
        disambiguate_for_tsx(code).map_or_else(|| code.to_string(), |r| r.code)
    }

    #[test]
    fn lone_unconstrained_type_parameters_get_a_comma() {
        assert_eq!(
            rewrite("const f = <T>(x: T) => x;"),
            "const f = <T,>(x: T) => x;"
        );
        assert_eq!(
            rewrite("const f = <const T>(x: T) => x;"),
            "const f = <const T,>(x: T) => x;"
        );
        assert_eq!(
            rewrite("const f = async <T>(x: T) => x;"),
            "const f = async <T,>(x: T) => x;"
        );
        assert_eq!(
            rewrite("class C { m = <K>(k: K) => k; }"),
            "class C { m = <K,>(k: K) => k; }"
        );
        assert_eq!(
            rewrite("const f = <T /* , */>(x: T) => x;"),
            "const f = <T, /* , */>(x: T) => x;"
        );
    }

    #[test]
    fn forms_tsx_already_reads_as_generics_are_untouched() {
        for code in [
            "const f = <T,>(x: T) => x;",
            "const f = <T, U>(x: T, y: U) => x;",
            "const f = <T extends string>(x: T) => x;",
            "const f = <T = string>(x: T) => x;",
            "const f = <T // c\n,>(x: T) => x;",
            "function f<T>(x: T) { return x; }",
            "const s = '<T>(x: T) => x'; // <T>(x) => x",
            "const n = f<T>(x);",
        ] {
            assert!(disambiguate_for_tsx(code).is_none(), "{code}");
        }
    }

    #[test]
    fn angle_bracket_assertions_become_parenthesized_as_expressions() {
        assert_eq!(
            rewrite("const n = <number>raw;"),
            "const n = (raw as number);"
        );
        assert_eq!(
            rewrite("const b = !<boolean>raw;"),
            "const b = !(raw as boolean);"
        );
        assert_eq!(
            rewrite("const n = <A><B>raw;"),
            "const n = ((raw as B) as A);"
        );
        assert_eq!(
            rewrite("const f = <F>(<T>(x: T) => x);"),
            "const f = ((<T,>(x: T) => x) as F);"
        );
    }

    #[test]
    fn a_moved_type_records_its_old_and_new_offsets() {
        let code = "x = <Foo>raw;";
        let rewritten = disambiguate_for_tsx(code).unwrap();
        assert_eq!(rewritten.code, "x = (raw as Foo);");
        let moved = rewritten.moved_types[0];
        assert_eq!(&code[moved.old_offset as usize..][..3], "Foo");
        assert_eq!(&rewritten.code[moved.new_offset as usize..][..3], "Foo");
    }
}
