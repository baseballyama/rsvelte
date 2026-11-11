//! A `.svelte.js` module (upstream `compileModule`): its script lowered as a component's module
//! script is, with no component around it.

use std::path::Path;

use oxc_allocator::Allocator;
use oxc_ast::ast::{Program, Statement};
use oxc_semantic::SemanticBuilder;
use oxc_span::{SPAN, SourceType};
use oxc_transformer::{TransformOptions, Transformer};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::resolve::Resolution;

use super::{
    Builder, CompileInput, Erasure, Target, check_runes, client, prepare, script,
    validate_erased_by,
};

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
    let validated = validate_erased_by(input, res, Erasure::TypeScript)?;
    check_runes(input, res, target, false)?;
    let component = &input.component;
    let program = component
        .javascript
        .get_program(component.module.expect("a module is one program"));
    let b = Builder::new(allocator);
    let names = prepare::names(res);
    let mut rewrite = script::ScriptRewrite {
        b: &b,
        target,
        accessors: false,
        rest_reads: Some(&validated.rest_reads),
        res,
        template: None,
        shadows: None,
        stores: &validated.stores,
        untracked: None,
        invalidates: None,
        primitive: false,
        classes: script::Classes::default(),
        names: Some(&names),
    };
    let mut hoisted = Vec::new();
    let statements = script::lower_script(
        &mut rewrite,
        program,
        &mut hoisted,
        &names,
        script::ScriptContext::File,
    )?;
    let runtime = match target {
        Target::Client => "svelte/internal/client",
        Target::Server => "svelte/internal/server",
    };
    let mut out = Program::new(
        SPAN,
        SourceType::mjs(),
        b.str(component.source_text),
        [],
        None,
        [],
        b.vec(hoisted.into_iter().chain(statements)),
        &b,
    );
    if program.source_type.is_typescript() {
        typescript_emit(&b, allocator, program, component.filename, &mut out)?;
    }
    out.body.insert(0, client::import(&b, Some("$"), runtime));
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
    let scoping = SemanticBuilder::new().build(out).semantic.into_scoping();
    let mut options = TransformOptions::default();
    options.typescript.only_remove_type_imports = true;
    let transformed =
        Transformer::new(allocator, Path::new(filename), &options).build_with_scoping(scoping, out);
    out.source_type = SourceType::mjs();
    if let Some(error) = transformed.diagnostics.first() {
        // oxc's transform labels the node it cannot emit, in the module's own text.
        let span = error.labels.first().map_or_else(
            || Span::new(source.span.start, source.span.end),
            |label| Span::new(label.offset(), label.offset() + label.len()),
        );
        return Err(Diagnostic::error(
            "typescript_transform",
            error.message.to_string(),
            span,
        ));
    }
    if !source.body.iter().any(Statement::is_module_declaration) {
        out.body.insert(0, b.stmt(b.string("use strict")));
    }
    Ok(())
}
