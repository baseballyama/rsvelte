//! Recursive scan for `$$Slots` / `$$Events` / `$$Props` interface or type-alias
//! declarations nested inside a function, block, or class body.
//!
//! Official svelte2tsx's `processInstanceScriptContent.ts` walk is fully
//! recursive (`ts.forEachChild`), so `is$$SlotsDeclaration` / `is$$EventsDeclaration`
//! / `is$$PropsDeclaration` fire at any depth. That walk also runs
//! `hoistableInterfaces.analyzeInstanceScriptNode`, but only when `parent ===
//! tsAst` (top-level only) — `HoistableInterfaces.analyzeInstanceScriptNode`
//! populates the very map that decides hoistability/shadowing, so a nested
//! declaration never becomes a hoist candidate there either. This module
//! mirrors only the unconditional half: it must not feed
//! `instance_type_names` / hoist candidates, which stay top-level-only via the
//! existing Pass 1 loop in mod.rs.

use oxc_ast::ast as oxc;

use super::exported_names::ExportedNames;

/// Set `has_slots_type` / `has_events_type` / `events_type_decl_pos` /
/// `uses_dollar_props_type` from a `$$Slots` / `$$Events` / `$$Props`
/// interface-or-type-alias name, regardless of nesting depth. Shared with
/// Pass 1's top-level detection in mod.rs so the two never drift.
pub(super) fn apply_special_type_name(
    name: &str,
    span_start: u32,
    exported_names: &mut ExportedNames,
    offset: u32,
) {
    if name == "$$Slots" {
        exported_names.has_slots_type = true;
    } else if name == "$$Events" {
        exported_names.has_events_type = true;
        if exported_names.events_type_decl_pos.is_none() {
            exported_names.events_type_decl_pos = Some(offset + span_start);
        }
    } else if name == "$$Props" {
        exported_names.uses_dollar_props_type = true;
    }
}

pub(super) fn scan_nested_special_type_decls(
    stmts: &[oxc::Statement],
    exported_names: &mut ExportedNames,
    offset: u32,
) {
    for stmt in stmts {
        scan_stmt(stmt, exported_names, offset);
    }
}

fn scan_stmt(stmt: &oxc::Statement, exported_names: &mut ExportedNames, offset: u32) {
    match stmt {
        oxc::Statement::TSInterfaceDeclaration(iface) => {
            apply_special_type_name(
                iface.id.name.as_str(),
                iface.span.start,
                exported_names,
                offset,
            );
        }
        oxc::Statement::TSTypeAliasDeclaration(alias) => {
            apply_special_type_name(
                alias.id.name.as_str(),
                alias.span.start,
                exported_names,
                offset,
            );
        }
        oxc::Statement::BlockStatement(block) => {
            scan_nested_special_type_decls(&block.body, exported_names, offset);
        }
        oxc::Statement::IfStatement(if_stmt) => {
            scan_stmt(&if_stmt.consequent, exported_names, offset);
            if let Some(alt) = &if_stmt.alternate {
                scan_stmt(alt, exported_names, offset);
            }
        }
        oxc::Statement::WhileStatement(w) => scan_stmt(&w.body, exported_names, offset),
        oxc::Statement::DoWhileStatement(d) => scan_stmt(&d.body, exported_names, offset),
        oxc::Statement::ForStatement(f) => scan_stmt(&f.body, exported_names, offset),
        oxc::Statement::ForOfStatement(f) => scan_stmt(&f.body, exported_names, offset),
        oxc::Statement::ForInStatement(f) => scan_stmt(&f.body, exported_names, offset),
        oxc::Statement::LabeledStatement(l) => scan_stmt(&l.body, exported_names, offset),
        oxc::Statement::TryStatement(t) => {
            scan_nested_special_type_decls(&t.block.body, exported_names, offset);
            if let Some(h) = &t.handler {
                scan_nested_special_type_decls(&h.body.body, exported_names, offset);
            }
            if let Some(f) = &t.finalizer {
                scan_nested_special_type_decls(&f.body, exported_names, offset);
            }
        }
        oxc::Statement::SwitchStatement(s) => {
            for case in &s.cases {
                scan_nested_special_type_decls(&case.consequent, exported_names, offset);
            }
        }
        oxc::Statement::FunctionDeclaration(func) => {
            if let Some(body) = &func.body {
                scan_nested_special_type_decls(&body.statements, exported_names, offset);
            }
        }
        oxc::Statement::ClassDeclaration(class) => scan_class_body(class, exported_names, offset),
        oxc::Statement::ExpressionStatement(es) => {
            scan_expr(&es.expression, exported_names, offset);
        }
        oxc::Statement::VariableDeclaration(var_decl) => {
            for decl in &var_decl.declarations {
                if let Some(init) = &decl.init {
                    scan_expr(init, exported_names, offset);
                }
            }
        }
        oxc::Statement::ReturnStatement(ret) => {
            if let Some(arg) = &ret.argument {
                scan_expr(arg, exported_names, offset);
            }
        }
        _ => {}
    }
}

fn scan_class_body(class: &oxc::Class, exported_names: &mut ExportedNames, offset: u32) {
    for member in &class.body.body {
        match member {
            oxc::ClassElement::MethodDefinition(method) => {
                if let Some(body) = &method.value.body {
                    scan_nested_special_type_decls(&body.statements, exported_names, offset);
                }
            }
            oxc::ClassElement::PropertyDefinition(prop) => {
                if let Some(value) = &prop.value {
                    scan_expr(value, exported_names, offset);
                }
            }
            _ => {}
        }
    }
}

fn scan_expr(expr: &oxc::Expression, exported_names: &mut ExportedNames, offset: u32) {
    match expr {
        oxc::Expression::ArrowFunctionExpression(arrow) => {
            scan_nested_special_type_decls(&arrow.body.statements, exported_names, offset);
        }
        oxc::Expression::FunctionExpression(func) => {
            if let Some(body) = &func.body {
                scan_nested_special_type_decls(&body.statements, exported_names, offset);
            }
        }
        oxc::Expression::ClassExpression(class) => scan_class_body(class, exported_names, offset),
        oxc::Expression::CallExpression(call) => {
            scan_expr(&call.callee, exported_names, offset);
            for arg in &call.arguments {
                match arg {
                    oxc::Argument::SpreadElement(spread) => {
                        scan_expr(&spread.argument, exported_names, offset);
                    }
                    _ => scan_expr(arg.to_expression(), exported_names, offset),
                }
            }
        }
        _ => {}
    }
}
