use std::path::Path;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use rsvelte_core::ast::template::Root;

static META: RuleMeta = RuleMeta {
    name: "svelte/no-conflicting-module-names",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "disallow a component and same-named runes module from coexisting",
    options_schema: Some("[]"),
};
const EXTS: &[&str] = &[".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs"];
fn real_name(path: &Path) -> String {
    path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("module")
        .to_string()
}
#[derive(Default)]
pub struct NoConflictingModuleNames;
impl Rule for NoConflictingModuleNames {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }
    fn check_root(&self, ctx: &mut LintContext, _: &Root) {
        let Some(path) = ctx.path() else { return };
        let Some(name) = path.file_name().and_then(|n| n.to_str()) else {
            return;
        };
        if name.ends_with(".svelte") {
            for ext in EXTS {
                let candidate = Path::new(&format!("{}{}", path.display(), ext)).to_path_buf();
                if candidate.is_file() {
                    let module = real_name(&candidate);
                    ctx.report(0,0,format!("The module `{module}` has the same name as this component. TypeScript resolves the import `./{name}` to that module, not to this component. Rename `{module}`."));
                    return;
                }
            }
        } else if let Some(ext) = EXTS.iter().find(|ext| name.ends_with(**ext)) {
            let rendered = path.to_string_lossy();
            let Some(prefix) = rendered.strip_suffix(ext) else {
                return;
            };
            let svelte = Path::new(prefix);
            if svelte.extension().and_then(|e| e.to_str()) == Some("svelte") && svelte.is_file() {
                let component = real_name(svelte);
                ctx.report(0,0,format!("This module has the same name as the component `{component}`. TypeScript resolves the import `./{component}` to this module, not to the component. Rename this file."));
            }
        }
    }
}
