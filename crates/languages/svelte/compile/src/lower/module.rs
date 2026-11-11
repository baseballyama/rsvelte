//! A `.svelte.js` module (upstream `compileModule`): its script lowered as a component's module
//! script is, with no component around it.

use oxc_allocator::{Allocator, Vec as ArenaVec};
use oxc_ast::ast::{ImportOrExportKind, Program, Statement};
use oxc_ast_visit::VisitMut;
use oxc_span::{SPAN, SourceType};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::resolve::Resolution;

use super::{Builder, CompileInput, Target, check_runes, client, prepare, script, validate};

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
    let validated = validate(input, res)?;
    check_runes(input, res, target, false)?;
    let component = &input.component;
    let program = component
        .javascript
        .get_program(component.module.expect("a module is one program"));
    let b = Builder::new(allocator);
    let mut names = prepare::names(res);
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
    };
    let mut hoisted = Vec::new();
    let statements = script::lower_script(
        &mut rewrite,
        program,
        &mut hoisted,
        &mut names,
        script::ScriptContext::File,
    )?;
    let runtime = match target {
        Target::Client => "svelte/internal/client",
        Target::Server => "svelte/internal/server",
    };
    let body = std::iter::once(client::import(&b, Some("$"), runtime))
        .chain(hoisted)
        .chain(statements);
    let mut out = Program::new(
        SPAN,
        SourceType::mjs(),
        b.str(component.source_text),
        [],
        None,
        [],
        b.vec(body),
        &b,
    );
    if program.source_type.is_typescript() {
        // Each statement, not the list: the list keeps what TypeScript's emit keeps.
        let mut strip = rsvelte_typescript_compile::strip::Strip::new(allocator);
        for statement in &mut out.body {
            strip.visit_statement(statement);
        }
        typescript_emit(&b, program, &mut out.body);
    }
    Ok(out)
}

/// What TypeScript's own emit adds to a `.svelte.ts` module before upstream reads it: a script
/// is strict, and a module whose every import and export was a type stays a module.
fn typescript_emit<'o>(
    b: &Builder<'o>,
    source: &Program<'_>,
    body: &mut ArenaVec<'o, Statement<'o>>,
) {
    // The first statement is upstream's import of its runtime.
    if !source.body.iter().any(Statement::is_module_declaration) {
        body.insert(1, b.stmt(b.string("use strict")));
    } else if !body[1..].iter().any(Statement::is_module_declaration) {
        body.push(Statement::new_export_named_declaration(
            SPAN,
            b.vec([]),
            ImportOrExportKind::Value,
            b,
        ));
    }
}
