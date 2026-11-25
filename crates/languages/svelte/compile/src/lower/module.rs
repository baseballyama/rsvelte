//! A `.svelte.js` module (upstream `compileModule`): its script lowered as a component's module
//! script is, with no component around it.

use oxc_allocator::Allocator;
use oxc_ast::ast::Program;
use oxc_span::{SPAN, SourceType};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::resolve::Resolution;

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
            (program.comments.iter())
                .filter(|comment| script::outside(&rewrite.removed, comment.span))
                .cloned(),
        ),
        None,
        [],
        b.vec(hoisted.into_iter().chain(statements)),
        &b,
    );
    out.body.insert(0, builder::import(&b, Some("$"), runtime));
    Ok(out)
}
