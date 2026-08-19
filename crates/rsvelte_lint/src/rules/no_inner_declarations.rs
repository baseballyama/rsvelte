//! `svelte/no-inner-declarations`.
//!
//! `svelte/no-inner-declarations` — disallow `function` / `var` declarations in
//! nested blocks. Port of the core `ESLint` `no-inner-declarations` rule (the
//! eslint-plugin-svelte extension just re-parents through `SvelteScriptElement`,
//! which in rsvelte is already the script `Program`). Runs over the `<script>`
//! `ESTree` program via the [`ScriptRule`] hook, plus the template expressions —
//! upstream sees a single `Program` spanning the whole component, so a `var`
//! inside a template event handler is in scope for it as well.
//!
//! Options (`ESLint` ≥9 shape — the plugin's `v8` fixtures are skipped by the
//! oracle): `[ "functions" | "both", { "blockScopedFunctions": "allow" | "disallow" } ]`.
//! `"functions"` checks only function declarations; `"both"` also checks `var`
//! declarations. Under the default `blockScopedFunctions: "allow"` a function
//! declaration is skipped when the scope enclosing it is strict — see
//! `upper_scope_is_strict`, which is why a *block*-scoped one is reported only
//! with `"disallow"` while `$: function f() {}` is reported either way.

use oxc_allocator::Allocator;
use oxc_ast::AstKind;
use oxc_parser::{ParseOptions as OxcParseOptions, Parser};
use oxc_semantic::SemanticBuilder;
use oxc_span::{GetSpan, SourceType};
use rsvelte_core::ast::template::Root;
use serde_json::Value;

use crate::context::LintContext;
use crate::rule::{Fixable, Rule, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::script::{ProgramView, ScriptKind, ScriptRule, node_end, node_start, node_type};

static META: RuleMeta = RuleMeta {
    name: "svelte/no-inner-declarations",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Error,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "Disallow variable or `function` declarations in nested blocks",
    options_schema: None,
};

#[derive(Default)]
pub struct NoInnerDeclarations;

impl ScriptRule for NoInnerDeclarations {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_program(&self, ctx: &mut LintContext, program: &ProgramView<'_>, kind: ScriptKind) {
        let opts = Options::read(ctx);
        let mut reports: Vec<(u32, u32, &'static str, &'static str)> = Vec::new();
        program.walk(|node, ancestors| collect(node, ancestors, opts, &mut reports));
        collect_static_blocks(ctx.source(), program, opts, &mut reports);
        // Upstream sees one `Program` spanning the whole component, so a handler
        // in the template is checked too. Attach that pass to the instance
        // script; `check_root` covers components that have none.
        if kind == ScriptKind::Instance {
            let fragment = ctx.template_fragment_json();
            crate::script::walk_js(&fragment, |node, ancestors| {
                collect(node, ancestors, opts, &mut reports);
            });
        }
        emit(ctx, reports);
    }
}

impl Rule for NoInnerDeclarations {
    fn meta(&self) -> &'static RuleMeta {
        &META
    }

    fn check_root(&self, ctx: &mut LintContext, root: &Root) {
        // `check_program` already walks the template alongside the instance
        // script; without one, this is the only pass that reaches it.
        if root.instance.is_some() {
            return;
        }
        let opts = Options::read(ctx);
        let mut reports: Vec<(u32, u32, &'static str, &'static str)> = Vec::new();
        let fragment = ctx.template_fragment_json();
        crate::script::walk_js(&fragment, |node, ancestors| {
            collect(node, ancestors, opts, &mut reports);
        });
        emit(ctx, reports);
    }
}

/// The rule's two resolved switches.
#[derive(Clone, Copy)]
struct Options {
    /// `blockScopedFunctions: "disallow"` — check a function declaration even
    /// when the scope enclosing it is strict.
    block_scoped_functions: bool,
    vars: bool,
}

impl Options {
    fn read(ctx: &LintContext) -> Self {
        let opts = ctx.options();
        let vars = opts.and_then(|a| a.get(0)).and_then(Value::as_str) == Some("both");
        let block_scoped_functions = opts
            .and_then(|a| a.get(1))
            .and_then(|o| o.get("blockScopedFunctions"))
            .and_then(Value::as_str)
            == Some("disallow");
        Self {
            block_scoped_functions,
            vars,
        }
    }
}

/// The scope-owning `ESTree` node types, minus `Program` and minus a
/// `BlockStatement` that is a function body (the function scope covers it).
const SCOPE_NODES: &[&str] = &[
    "FunctionDeclaration",
    "FunctionExpression",
    "ArrowFunctionExpression",
    "SwitchStatement",
    "ForStatement",
    "ForInStatement",
    "ForOfStatement",
    "CatchClause",
    "ClassDeclaration",
    "ClassExpression",
    "StaticBlock",
    "WithStatement",
    "TSModuleDeclaration",
    "TSEnumDeclaration",
];

/// Whether the scope `sourceCode.getScope(node)` lands on has a **strict**
/// upper scope, which is what makes upstream skip a function declaration under
/// the default `blockScopedFunctions: "allow"`.
///
/// The plugin hands the core rule a *proxy* node, so the scope manager's
/// identity lookup misses and `ESLint` walks the parent chain to the nearest
/// node that owns a scope: reaching the `Program` lands on the module scope,
/// whose upper is the sloppy global scope, while any nested scope's upper is
/// the strict module scope. So only a chain that reaches the program without
/// crossing a scope — a `$:`/labelled statement, a braceless `if` — is checked.
fn upper_scope_is_strict(ancestors: &[&Value]) -> bool {
    for (i, node) in ancestors.iter().enumerate().rev() {
        match node_type(node) {
            Some("Program") => return false,
            Some("BlockStatement") => {
                let owner = i.checked_sub(1).and_then(|j| node_type(ancestors[j]));
                if !matches!(
                    owner,
                    Some("FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression")
                ) {
                    return true;
                }
            }
            Some(t) if SCOPE_NODES.contains(&t) => return true,
            _ => {}
        }
    }
    true
}

fn collect<'a>(
    node: &'a Value,
    ancestors: &[&'a Value],
    opts: Options,
    reports: &mut Vec<(u32, u32, &'static str, &'static str)>,
) {
    let kind = match node_type(node) {
        Some("FunctionDeclaration") => {
            if !opts.block_scoped_functions && upper_scope_is_strict(ancestors) {
                return;
            }
            "function"
        }
        Some("VariableDeclaration")
            if opts.vars && node.get("kind").and_then(Value::as_str) == Some("var") =>
        {
            "variable"
        }
        _ => return,
    };
    if !is_inner(ancestors) {
        return;
    }
    let (Some(start), Some(end)) = (node_start(node), node_end(node)) else {
        return;
    };
    reports.push((start, end, kind, body_root(ancestors)));
}

/// Report declarations nested inside a class `static { … }` block.
///
/// The serialized `ESTree` program carries a class body with no members at all
/// (rsvelte's parse drops `StaticBlock` on the way to JSON), so [`collect`]
/// cannot reach them — this recovers exactly that population from an oxc parse
/// of the same script text, and reports nothing a static block does not enclose.
fn collect_static_blocks(
    source: &str,
    program: &ProgramView<'_>,
    opts: Options,
    reports: &mut Vec<(u32, u32, &'static str, &'static str)>,
) {
    // Nothing a static block encloses is reportable unless one of the two
    // switches is on, and the recovery parse below is not free.
    if !opts.block_scoped_functions && !opts.vars {
        return;
    }
    let (Some(base), Some(end)) = (node_start(program.value()), node_end(program.value())) else {
        return;
    };
    if base > end || end as usize > source.len() {
        return;
    }
    let body = &source[base as usize..end as usize];
    let allocator = Allocator::default();
    // TS grammar is a superset of what a lint-accepted script body contains, so
    // one TS parse covers both script languages.
    let parsed = Parser::new(&allocator, body, SourceType::ts().with_module(true))
        .with_options(OxcParseOptions {
            allow_return_outside_function: true,
            ..OxcParseOptions::default()
        })
        .parse();
    let parsed_program = allocator.alloc(parsed.program);
    let semantic = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(parsed_program)
        .semantic;
    let nodes = semantic.nodes();
    for node in nodes.iter() {
        let kind = match node.kind() {
            AstKind::Function(function)
                if opts.block_scoped_functions && function.is_function_declaration() =>
            {
                "function"
            }
            AstKind::VariableDeclaration(declaration) if opts.vars && declaration.kind.is_var() => {
                "variable"
            }
            _ => continue,
        };
        let ancestors = nodes.ancestor_kinds(node.id());
        // `oxc_is_inner` consumes up to two links, one of which can be the very
        // static block the body-root walk needs to see.
        if !oxc_is_inner(&mut ancestors.clone()) {
            continue;
        }
        if let Some(place) = static_block_body_root(ancestors) {
            reports.push((
                base + node.span().start,
                base + node.span().end,
                kind,
                place,
            ));
        }
    }
}

/// [`is_inner`] over an oxc ancestor chain (parent first). A function body is
/// its own `FunctionBody` node in oxc, standing in for `ESTree`'s
/// `BlockStatement` whose parent is a function.
fn oxc_is_inner<'a>(ancestors: &mut impl Iterator<Item = AstKind<'a>>) -> bool {
    match ancestors.next() {
        None => false,
        Some(
            AstKind::Program(_)
            | AstKind::StaticBlock(_)
            | AstKind::FunctionBody(_)
            | AstKind::ExportNamedDeclaration(_)
            | AstKind::ExportDefaultDeclaration(_),
        ) => false,
        Some(AstKind::BlockStatement(_)) => !matches!(
            ancestors.next(),
            Some(AstKind::Function(_) | AstKind::ArrowFunctionExpression(_))
        ),
        Some(_) => true,
    }
}

/// [`body_root`] over an oxc ancestor chain, restricted to declarations a class
/// static block encloses: `None` means no static block is in the chain, which
/// is the case [`collect`] already covers from the JSON program.
fn static_block_body_root<'a>(
    ancestors: impl Iterator<Item = AstKind<'a>>,
) -> Option<&'static str> {
    let mut nearest = None;
    for kind in ancestors {
        match kind {
            AstKind::StaticBlock(_) => return Some(nearest.unwrap_or("class static block body")),
            AstKind::Function(_) | AstKind::ArrowFunctionExpression(_) if nearest.is_none() => {
                nearest = Some("function body");
            }
            _ => {}
        }
    }
    None
}

fn emit(ctx: &mut LintContext, mut reports: Vec<(u32, u32, &'static str, &'static str)>) {
    reports.sort_unstable();
    reports.dedup();
    for (start, end, kind, place) in reports {
        ctx.report(
            start,
            end,
            format!("Move {kind} declaration to {place} root."),
        );
    }
}

/// Whether a declaration with the given `ancestors` (nearest parent last) sits
/// in a nested block — i.e. NOT directly in a `Program`, a function body, or a
/// class static block. Mirrors core `ESLint`'s `no-inner-declarations` check.
fn is_inner(ancestors: &[&Value]) -> bool {
    let Some(parent) = ancestors.last() else {
        return false;
    };
    match node_type(parent) {
        Some("Program" | "StaticBlock" | "ExportNamedDeclaration" | "ExportDefaultDeclaration") => {
            false
        }
        Some("BlockStatement") => {
            // Valid only when the block is a function body.
            let gp = ancestors.get(ancestors.len().wrapping_sub(2));
            !matches!(
                gp.and_then(|g| node_type(g)),
                Some("FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression")
            )
        }
        _ => true,
    }
}

/// The nearest enclosing context the rule allows declarations in, mirroring
/// core `ESLint`'s `getAllowedBodyDescription`: a class static block wins over
/// an outer function, and a bare `Program` is the fallback.
fn body_root(ancestors: &[&Value]) -> &'static str {
    for node in ancestors.iter().rev() {
        match node_type(node) {
            Some("StaticBlock") => return "class static block body",
            Some("FunctionDeclaration" | "FunctionExpression" | "ArrowFunctionExpression") => {
                return "function body";
            }
            _ => {}
        }
    }
    "program"
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn anc(types: &[&str]) -> Vec<Value> {
        types
            .iter()
            .map(|t| json!({ "type": t }))
            .collect::<Vec<_>>()
    }

    #[test]
    fn top_level_is_not_inner() {
        let a = anc(&["Program"]);
        let refs: Vec<&Value> = a.iter().collect();
        assert!(!is_inner(&refs));
    }

    #[test]
    fn function_body_is_not_inner() {
        let a = anc(&["Program", "FunctionDeclaration", "BlockStatement"]);
        let refs: Vec<&Value> = a.iter().collect();
        assert!(!is_inner(&refs));
    }

    #[test]
    fn block_in_if_is_inner() {
        let a = anc(&["Program", "IfStatement", "BlockStatement"]);
        let refs: Vec<&Value> = a.iter().collect();
        assert!(is_inner(&refs));
    }

    #[test]
    fn directly_in_if_is_inner() {
        let a = anc(&["Program", "IfStatement"]);
        let refs: Vec<&Value> = a.iter().collect();
        assert!(is_inner(&refs));
    }

    #[test]
    fn export_declaration_is_a_valid_parent() {
        let a = anc(&["Program", "ExportNamedDeclaration"]);
        let refs: Vec<&Value> = a.iter().collect();
        assert!(!is_inner(&refs));
    }

    #[test]
    fn nearest_static_block_wins_over_an_outer_function() {
        let a = anc(&[
            "Program",
            "FunctionDeclaration",
            "BlockStatement",
            "ClassDeclaration",
            "ClassBody",
            "StaticBlock",
            "IfStatement",
            "BlockStatement",
        ]);
        let refs: Vec<&Value> = a.iter().collect();
        assert!(is_inner(&refs));
        assert_eq!(body_root(&refs), "class static block body");
    }

    fn static_block_reports(src: &str) -> Vec<(u32, u32, &'static str, &'static str)> {
        let value = json!({ "type": "Program", "start": 0, "end": src.len() });
        let program = ProgramView::new(&value);
        let mut reports = Vec::new();
        collect_static_blocks(
            src,
            &program,
            Options {
                block_scoped_functions: true,
                vars: true,
            },
            &mut reports,
        );
        reports
    }

    #[test]
    fn only_a_nested_declaration_in_a_static_block_is_reported() {
        let src = "class C {\n\tstatic {\n\t\tvar direct = 1;\n\t\tif (direct) {\n\t\t\tvar nested = 2;\n\t\t}\n\t}\n}\n";
        let start = u32::try_from(src.find("var nested").unwrap()).unwrap();
        assert_eq!(
            static_block_reports(src),
            vec![(start, start + 15, "variable", "class static block body")]
        );
    }

    #[test]
    fn a_bare_block_inside_a_static_block_still_names_the_static_block() {
        let src = "class C { static { { var x = 1; } } }";
        let start = u32::try_from(src.find("var x").unwrap()).unwrap();
        assert_eq!(
            static_block_reports(src),
            vec![(start, start + 10, "variable", "class static block body")]
        );
    }

    #[test]
    fn a_function_inside_a_static_block_wins_over_it() {
        let src = "class C { static { function f() { if (1) { var x = 1; } } } }";
        let start = u32::try_from(src.find("var x").unwrap()).unwrap();
        assert_eq!(
            static_block_reports(src),
            vec![(start, start + 10, "variable", "function body")]
        );
    }

    #[test]
    fn declarations_outside_a_static_block_are_left_to_the_json_walk() {
        let src = "if (1) { var x = 1; }\nfunction f() { if (1) { var y = 2; } }\n";
        assert!(static_block_reports(src).is_empty());
    }

    #[test]
    fn only_a_chain_reaching_the_program_has_a_sloppy_upper_scope() {
        // `$: function f() {}` — nothing between the declaration and the
        // program owns a scope, so the module scope's upper (global) is sloppy.
        let labeled = anc(&["Program", "LabeledStatement"]);
        let refs: Vec<&Value> = labeled.iter().collect();
        assert!(!upper_scope_is_strict(&refs));
        // A block owns a scope, whose upper is the strict module scope.
        let block = anc(&["Program", "IfStatement", "BlockStatement"]);
        let refs: Vec<&Value> = block.iter().collect();
        assert!(upper_scope_is_strict(&refs));
        // A function body block does not own one; the function itself does.
        let in_fn = anc(&[
            "Program",
            "FunctionDeclaration",
            "BlockStatement",
            "LabeledStatement",
        ]);
        let refs: Vec<&Value> = in_fn.iter().collect();
        assert!(upper_scope_is_strict(&refs));
    }

    #[test]
    fn body_root_picks_function_or_program() {
        let prog = anc(&["Program", "IfStatement", "BlockStatement"]);
        let refs: Vec<&Value> = prog.iter().collect();
        assert_eq!(body_root(&refs), "program");
        let func = anc(&[
            "Program",
            "FunctionDeclaration",
            "BlockStatement",
            "IfStatement",
        ]);
        let refs2: Vec<&Value> = func.iter().collect();
        assert_eq!(body_root(&refs2), "function body");
    }
}
