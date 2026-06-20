//! AST-based strip of the `export ` keyword from top-level
//! `export function` / `export async function` / `export const` /
//! `export class` declarations for the server target.
//!
//! Replaces the line-anchored byte scanner `strip_export_from_declarations`,
//! which removed exactly the 7-byte `"export "` prefix (the word `export` plus
//! ONE space) whenever a *trimmed* line began with one of those four forms.
//! oxc gives the same set structurally: an `ExportNamedDeclaration` whose
//! `.declaration` is a `FunctionDeclaration` (covers both `export function`
//! and `export async function`), a `ClassDeclaration`, or a
//! `VariableDeclaration` with `kind == Const`. The specifier form
//! (`export { … }`, `declaration: None`), `export let` / `export var`, and
//! `export default` are deliberately left untouched — they're handled by other
//! passes or must stay as-is.
//!
//! The edit removes EXACTLY the same 7 bytes (`"export "`) starting at the
//! export declaration's span start. The `export` keyword is ASCII, so the
//! `keyword(6) + single-space(1) = 7` byte count matches the scanner's
//! `strip_prefix("export ")` byte-for-byte. A top-level export declaration
//! always begins its (trimmed) line, so the structural match and the
//! line-anchored scanner agree; the AST resolves indentation / multi-line
//! bodies without byte heuristics.
//!
//! Output is byte-identical to the scanner, so the existing fixture + corpus
//! gates verify the swap. Returns `None` (caller falls back to the scanner)
//! when the script doesn't parse as a standalone module.

use std::cell::RefCell;

use oxc_allocator::Allocator;
use oxc_ast::ast::*;
use oxc_ast_visit::{Visit, walk};
use oxc_parser::ParseOptions;
use oxc_span::SourceType;

use super::super::shared::ast_rewrite::{self, Edit};

thread_local! {
    static STRIP_EXPORT_ALLOC: RefCell<Allocator> = RefCell::new(Allocator::default());
}

/// The byte length of the `"export "` prefix removed from each matching
/// declaration. `export` (6 ASCII bytes) + one space (1 byte) = 7, matching the
/// scanner's `strip_prefix("export ")`.
const EXPORT_PREFIX_LEN: u32 = 7;

/// Strip the `export ` keyword from top-level `export function` /
/// `export async function` / `export const` / `export class` declarations.
///
/// Returns `Some(rewritten)` when at least one declaration matched, `None` on a
/// parse failure or when nothing matched (caller falls back to the byte
/// scanner).
pub(crate) fn strip_export_from_declarations_ast(script: &str) -> Option<String> {
    ast_rewrite::rewrite_once(
        &STRIP_EXPORT_ALLOC,
        script,
        SourceType::mjs(),
        ParseOptions {
            allow_return_outside_function: true,
            ..ParseOptions::default()
        },
        // These edits never nest (each removes a 7-byte keyword prefix at a
        // distinct declaration start), so skip the containment check.
        false,
        |program| {
            let mut collector = StripExportCollector { edits: Vec::new() };
            collector.visit_program(program);
            collector.edits
        },
    )
}

struct StripExportCollector {
    edits: Vec<Edit>,
}

impl StripExportCollector {
    /// True when the exported declaration is one the scanner strips: a function
    /// (incl. `async function`), a class, or a `const` variable declaration.
    /// `let` / `var` exports are NOT stripped (other passes own those).
    fn should_strip(decl: &Declaration) -> bool {
        match decl {
            Declaration::FunctionDeclaration(_) | Declaration::ClassDeclaration(_) => true,
            Declaration::VariableDeclaration(var) => var.kind == VariableDeclarationKind::Const,
            _ => false,
        }
    }
}

impl<'ast> Visit<'ast> for StripExportCollector {
    fn visit_export_named_declaration(&mut self, export: &ExportNamedDeclaration<'ast>) {
        if let Some(decl) = &export.declaration
            && Self::should_strip(decl)
        {
            // Remove exactly the `export ` prefix (7 bytes) at the start of the
            // export declaration, mirroring `strip_prefix("export ")`.
            self.edits.push((
                export.span.start,
                export.span.start + EXPORT_PREFIX_LEN,
                String::new(),
            ));
        }
        walk::walk_export_named_declaration(self, export);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strips_export_const() {
        assert_eq!(
            strip_export_from_declarations_ast("export const x = 1;").unwrap(),
            "const x = 1;"
        );
    }

    #[test]
    fn strips_export_function() {
        assert_eq!(
            strip_export_from_declarations_ast("export function f(){}").unwrap(),
            "function f(){}"
        );
    }

    #[test]
    fn strips_export_async_function() {
        assert_eq!(
            strip_export_from_declarations_ast("export async function f(){}").unwrap(),
            "async function f(){}"
        );
    }

    #[test]
    fn strips_export_class() {
        assert_eq!(
            strip_export_from_declarations_ast("export class C {}").unwrap(),
            "class C {}"
        );
    }

    #[test]
    fn leaves_export_let() {
        // `export let` is owned by other passes — not stripped here.
        assert!(strip_export_from_declarations_ast("export let y = 2;").is_none());
    }

    #[test]
    fn leaves_export_var() {
        assert!(strip_export_from_declarations_ast("export var y = 2;").is_none());
    }

    #[test]
    fn leaves_export_specifiers() {
        // `export { z };` — declaration: None, the specifier form.
        assert!(strip_export_from_declarations_ast("const z = 1;\nexport { z };").is_none());
    }

    #[test]
    fn leaves_export_default() {
        assert!(strip_export_from_declarations_ast("const x = 1;\nexport default x;").is_none());
    }

    #[test]
    fn preserves_indentation() {
        // Span-anchored removal keeps any leading indentation intact.
        assert_eq!(
            strip_export_from_declarations_ast("  export const x = 1;").unwrap(),
            "  const x = 1;"
        );
    }

    #[test]
    fn strips_multiple_declarations() {
        assert_eq!(
            strip_export_from_declarations_ast(
                "export const a = 1;\nexport function b(){}\nexport let c = 3;"
            )
            .unwrap(),
            "const a = 1;\nfunction b(){}\nexport let c = 3;"
        );
    }

    #[test]
    fn returns_none_on_parse_failure() {
        // Malformed input falls back to the byte scanner.
        assert!(strip_export_from_declarations_ast("export const = ;").is_none());
    }
}
