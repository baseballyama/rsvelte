use oxc_ast::ast::{ImportDeclarationSpecifier, ModuleExportName, StringLiteral};
use oxc_span::GetSpan;

use super::{Plan, R, span_of, unsupported};

pub(super) fn collect(
    source: &StringLiteral<'_>,
    specifiers: Option<&[ImportDeclarationSpecifier<'_>]>,
    plan: &mut Plan,
) -> R<()> {
    let source = source.value.as_str();
    let target = match source {
        Some("svelte") => &mut plan.lifecycle,
        Some("svelte/attachments") => &mut plan.attachments,
        _ => return Ok(()),
    };
    for specifier in specifiers.unwrap_or_default() {
        let ImportDeclarationSpecifier::ImportSpecifier(s) = specifier else {
            return Err(unsupported(
                "a default or namespace import from Svelte",
                span_of(specifier.span()),
            ));
        };
        let imported = match &s.imported {
            ModuleExportName::IdentifierName(n) => Some(n.name.as_str()),
            ModuleExportName::IdentifierReference(n) => Some(n.name.as_str()),
            ModuleExportName::StringLiteral(n) => n.value.as_str(),
        };
        let name = match (source, imported) {
            (Some("svelte"), Some("onMount")) => "onMount",
            (Some("svelte"), Some("onDestroy")) => "onDestroy",
            (Some("svelte"), Some("tick")) => "tick",
            (Some("svelte"), Some("untrack")) => "untrack",
            (Some("svelte/attachments"), Some("createAttachmentKey")) => "createAttachmentKey",
            (Some("svelte/attachments"), Some("fromAction")) => "fromAction",
            _ => {
                return Err(unsupported(
                    "this import from Svelte",
                    span_of(specifier.span()),
                ));
            }
        };
        target.push((
            name,
            s.local.symbol_id.get().expect("an import has a symbol"),
        ));
    }
    Ok(())
}
