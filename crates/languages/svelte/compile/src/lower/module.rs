//! A `.svelte.js` module (upstream `compileModule`): its script lowered as a component's module
//! script is, with no component around it.

use std::path::Path;

use oxc_allocator::Allocator;
use oxc_ast::ast::{BigIntLiteral, ImportOrExportKind, NumericLiteral, Program, Statement};
use oxc_ast_visit::VisitMut;
use oxc_semantic::SemanticBuilder;
use oxc_span::{SPAN, SourceType};
use oxc_transformer::{TransformOptions, Transformer};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_typescript_tree::document_span;

use super::validation::check_runes;
use super::{Builder, Unit, builder, prepare, script, validate_unit};
use crate::input::{CompileInput, Target};

/// The module of one target, in `allocator`; its spans index the module's text.
///
/// # Errors
///
/// What upstream rejects, or what this port does not lower yet.
pub(crate) fn lower_module<'o>(
    input: &CompileInput<'_>,
    res: &Resolution,
    target: Target,
    allocator: &'o Allocator,
) -> Result<Program<'o>, Diagnostic> {
    let validated = validate_unit(input, res, Unit::Module)?;
    check_runes(input, res, Unit::Module, target, false)?;
    let component = &input.component;
    let program = component
        .javascript
        .get_program(component.module.expect("a module is one program"));
    let b = Builder::new(allocator);
    let names = prepare::names(res);
    let mut rewrite = script::ScriptRewrite {
        stores: &validated.stores,
        names: Some(&names),
        ..script::ScriptRewrite::new(&b, target, res, Unit::Module)
    };
    let mut hoisted = Vec::new();
    let statements = script::lower_script(
        &mut rewrite,
        program,
        &mut hoisted,
        &names,
        script::ScriptContext::File,
    )?;
    let runtime = target.runtime();
    let mut out = Program::new(
        SPAN,
        SourceType::mjs(),
        b.str(component.source_text),
        b.vec(
            program
                .comments
                .iter()
                .filter(|comment| script::outside(&rewrite.removed, comment.span))
                .cloned(),
        ),
        None,
        [],
        b.vec(hoisted.into_iter().chain(statements)),
        &b,
    );
    if program.source_type.is_typescript() {
        typescript_emit(&b, allocator, program, component.filename, &mut out)?;
    }
    out.body.insert(0, builder::import(&b, Some("$"), runtime));
    Ok(out)
}

/// TypeScript's emit of a `.svelte.ts` module, which upstream reads instead of the module: oxc's
/// transform erases the types as `verbatimModuleSyntax` does and lowers parameter properties
/// and enums, and a script is strict.
fn typescript_emit<'o>(
    b: &Builder<'o>,
    allocator: &'o Allocator,
    source: &Program<'_>,
    filename: &str,
    out: &mut Program<'o>,
) -> Result<(), Diagnostic> {
    out.source_type = SourceType::ts();
    let scoping = (SemanticBuilder::new()
        .with_build_jsdoc(false)
        .with_enum_eval(true))
    .build(out)
    .semantic
    .into_scoping();
    let mut options = TransformOptions::default();
    options.typescript.only_remove_type_imports = true;
    let transformed =
        Transformer::new(allocator, Path::new(filename), &options).build_with_scoping(scoping, out);
    out.source_type = SourceType::mjs();
    if let Some(error) = transformed.diagnostics.first() {
        // oxc's transform labels the node it cannot emit, in the module's own text.
        let span = error.labels.first().map_or_else(
            || document_span(source.span),
            |label| Span::new(label.offset(), label.offset() + label.len()),
        );
        return Err(Diagnostic::error(
            "typescript_transform",
            error.message.to_string(),
            span,
        ));
    }
    OriginalText(b).visit_program(out);
    // TypeScript keeps a script strict, and a module that its emit leaves without an import or an
    // export a module.
    let module = source.body.iter().any(Statement::is_module_declaration);
    if !module {
        // TypeScript reads a directive by its value, escapes and all.
        if !(source.directives.iter()).any(|d| d.expression.value == "use strict") {
            out.body.insert(0, b.statement(b.string("use strict")));
        }
    } else if !out.body.iter().any(Statement::is_module_declaration) {
        let nothing =
            Statement::new_export_named_declaration(SPAN, b.vec([]), ImportOrExportKind::Value, b);
        out.body.push(nothing);
    }
    Ok(())
}

/// TypeScript's emit prints a literal by its source text only where `canUseOriginalText` allows,
/// and otherwise by the text its scanner keeps (TypeScript 6.0.3 at 050880ce59,
/// `src/compiler/utilities.ts:2036`). A bigint never keeps its text; a number keeps it unless
/// `TokenFlags.IsInvalid` holds. The separators an ES2021 target allows stay.
struct OriginalText<'b, 'o>(&'b Builder<'o>);

impl<'o> VisitMut<'o> for OriginalText<'_, 'o> {
    fn visit_numeric_literal(&mut self, it: &mut NumericLiteral<'o>) {
        // The scanner's text for an invalid number is `"" + value`, which the printer gives one
        // without a raw.
        if it.raw.is_some_and(|raw| is_invalid(&raw)) {
            it.raw = None;
        }
    }

    fn visit_big_int_literal(&mut self, it: &mut BigIntLiteral<'o>) {
        it.raw = (it.raw)
            .and_then(|raw| self.scanned_hexadecimal(&raw))
            .map(Into::into);
    }
}

impl<'o> OriginalText<'_, 'o> {
    /// The scanner's text for a hexadecimal bigint: its digits lowercased, without separators
    /// (`scanner.ts:1378`). Any other bigint's is its decimal value plus `n` (`scanner.ts:1869`),
    /// which the printer gives one without a raw.
    fn scanned_hexadecimal(&self, raw: &str) -> Option<&'o str> {
        let digits = raw.strip_prefix("0x").or_else(|| raw.strip_prefix("0X"))?;
        let digits: String = digits.chars().filter(|c| *c != '_').collect();
        Some(self.0.str(&format!("0x{}", digits.to_ascii_lowercase())))
    }
}

/// `TokenFlags.IsInvalid` of a number the parser accepts: `Octal` (`010`) and
/// `ContainsLeadingZero` (`08`, `09.5`), both a `0` followed by a digit (`scanner.ts:1236`).
/// `ContainsInvalidSeparator` and `ContainsInvalidEscape` are parse errors here.
const fn is_invalid(raw: &str) -> bool {
    matches!(raw.as_bytes(), [b'0', b'0'..=b'9', ..])
}
