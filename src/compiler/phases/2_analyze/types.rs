//! Type definitions for the analysis phase.

use super::scope::{Scope, ScopeRoot};
use crate::ast::template::{Root, Script};
use crate::compiler::CompileOptions;
use rustc_hash::{FxHashMap, FxHashSet};

/// Pre-extracted script content to avoid re-parsing in Phase 3.
#[derive(Debug, Clone)]
pub struct ScriptContent {
    /// The raw script content as a string.
    pub raw: String,
    /// Start position in the source.
    pub start: u32,
    /// End position in the source.
    pub end: u32,
    /// Whether this script uses runes ($state, $derived, $effect, $props).
    pub uses_runes: bool,
}

/// A reactive statement ($: statement) in legacy mode (Svelte 4).
#[derive(Debug, Clone)]
pub struct ReactiveStatement {
    /// Bindings that are assigned to in this reactive statement
    pub assignments: FxHashSet<usize>,
    /// Bindings that this reactive statement depends on
    pub dependencies: Vec<usize>,
}

/// Pre-transformed instance script body sections.
/// Used for optimization during code generation.
/// Corresponds to `instance_body` in ComponentAnalysis (phases/types.d.ts).
#[derive(Debug, Default, Clone)]
pub struct InstanceBody {
    /// Statements hoisted to the top (imports)
    pub hoisted: Vec<serde_json::Value>,
    /// Synchronous statements (regular let/const declarations, function declarations)
    pub sync: Vec<serde_json::Value>,
    /// Asynchronous statements (with their await status)
    pub async_: Vec<AsyncStatement>,
    /// Variable declarations (identifiers that need blocker tracking)
    pub declarations: Vec<String>,
}

/// An asynchronous statement with its await status.
/// Corresponds to items in `instance_body.async` array.
#[derive(Debug, Clone)]
pub struct AsyncStatement {
    /// The statement node (VariableDeclarator or Statement)
    pub node: serde_json::Value,
    /// Whether this statement contains await expressions
    pub has_await: bool,
}

/// Declaration for an awaited value in an await block.
/// Corresponds to AwaitedDeclaration in the official compiler.
#[derive(Debug, Clone)]
pub struct AwaitedDeclaration {
    /// The identifier being declared
    pub id: String,
    /// Whether this declaration has await in its value
    pub has_await: bool,
    /// The pattern being destructured (if applicable)
    pub pattern: Option<String>,
    /// Expression metadata for the declaration
    pub metadata: crate::ast::template::ExpressionMetadata,
    /// Identifiers that update this declaration
    pub updated_by: FxHashSet<String>,
}

impl ScriptContent {
    /// Extract script content from an AST Script node and source.
    pub fn from_script(script: &Script, source: &str) -> Self {
        Self::from_script_with_ts(script, source, false)
    }

    /// Extract script content from an AST Script node and source,
    /// with optional forced TypeScript stripping.
    /// `force_typescript` is true when another script in the component has `lang="ts"`.
    pub fn from_script_with_ts(script: &Script, source: &str, force_typescript: bool) -> Self {
        let start = script.content.start().unwrap_or(0);
        let end = script.content.end().unwrap_or(0);
        let raw = if (end as usize) > (start as usize) && (end as usize) <= source.len() {
            source[start as usize..end as usize].to_string()
        } else {
            String::new()
        };

        // Check if this script uses TypeScript
        let is_typescript = force_typescript
            || script.attributes.iter().any(|attr| {
                if attr.name == "lang"
                    && let crate::ast::template::AttributeValue::Sequence(parts) = &attr.value
                    && let Some(crate::ast::template::AttributeValuePart::Text(text)) =
                        parts.first()
                {
                    return text.data == "ts" || text.data == "typescript";
                }
                false
            });

        // Strip TypeScript from the raw content if this is a TypeScript script
        let raw = if is_typescript && !raw.is_empty() {
            strip_typescript(&raw)
        } else {
            raw
        };

        let uses_runes = has_rune_text(&raw, "$state")
            || has_rune_text(&raw, "$derived")
            || has_rune_text(&raw, "$effect")
            || has_rune_text(&raw, "$props");

        Self {
            raw,
            start,
            end,
            uses_runes,
        }
    }
}

/// Check if a rune name appears as a genuine rune usage in the source text.
/// This avoids false positives from:
/// - `$effect:` (labeled statement, not a rune call)
/// - `$$props` (reserved identifier, `$props` is a substring)
/// - Property names like `foo.$state`
fn has_rune_text(raw: &str, rune_name: &str) -> bool {
    let mut start = 0;
    while let Some(pos) = raw[start..].find(rune_name) {
        let abs_pos = start + pos;

        // Check character before: must not be `$` or an identifier char
        // This avoids matching `$$props` when searching for `$props`
        if abs_pos > 0 {
            let prev_char = raw.as_bytes()[abs_pos - 1];
            if prev_char == b'$'
                || prev_char.is_ascii_alphanumeric()
                || prev_char == b'_'
                || prev_char == b'.'
            {
                start = abs_pos + rune_name.len();
                continue;
            }
        }

        // Check character after: if it's just `:` followed by whitespace or end,
        // it's a label, not a rune call
        let after_pos = abs_pos + rune_name.len();
        if after_pos < raw.len() {
            let after_char = raw.as_bytes()[after_pos];
            // If followed by alphanumeric or underscore, it's part of a longer identifier
            if after_char.is_ascii_alphanumeric() || after_char == b'_' {
                start = after_pos;
                continue;
            }
            // If followed by `:` (and not `::` which doesn't apply to JS), it might be a label
            // Labels look like `$effect: <statement>` or `$effect : <statement>`
            // But we only skip if the colon is NOT part of a ternary or object literal
            // For simplicity, we check: if it's `$effect:` at the top of a statement (no `(` before `:`)
            if after_char == b':' {
                // Check if this is a labeled statement pattern
                // In a labeled statement, the label is `$effect:` without `(` before `:`
                // This is a heuristic - we skip it as a potential label
                start = after_pos + 1;
                continue;
            }
        }

        // Found a genuine rune reference
        return true;
    }
    false
}

/// Strip TypeScript syntax from source code, producing valid JavaScript.
///
/// Uses OXC parser to parse TypeScript, then walks the AST to find
/// TypeScript-specific source regions to remove.
pub fn strip_typescript(source: &str) -> String {
    use oxc_allocator::Allocator;
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    let allocator = Allocator::default();
    let source_type = SourceType::ts();
    let parser = Parser::new(&allocator, source, source_type);
    let result = parser.parse();

    if !result.errors.is_empty() {
        // If parsing fails, return original source and let downstream handle errors
        return source.to_string();
    }

    // Collect source spans to remove (sorted by start position)
    let mut removals: Vec<(u32, u32)> = Vec::new();

    collect_ts_removals_from_program(&result.program, source, &mut removals);

    if removals.is_empty() {
        return source.to_string();
    }

    // Sort removals by start position
    removals.sort_by_key(|r| r.0);

    // Merge overlapping removals
    let mut merged: Vec<(u32, u32)> = Vec::new();
    for (start, end) in removals {
        if let Some(last) = merged.last_mut()
            && start <= last.1
        {
            last.1 = last.1.max(end);
            continue;
        }
        merged.push((start, end));
    }

    // Build output by skipping removed regions
    let mut output = String::with_capacity(source.len());
    let mut pos = 0u32;

    for (remove_start, remove_end) in &merged {
        if *remove_start > pos {
            output.push_str(&source[pos as usize..*remove_start as usize]);
        }
        pos = pos.max(*remove_end);
    }

    // Add remaining content
    if (pos as usize) < source.len() {
        output.push_str(&source[pos as usize..]);
    }

    output
}

/// Collect TypeScript-specific source spans to remove from a program.
fn collect_ts_removals_from_program(
    program: &oxc_ast::ast::Program,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    for stmt in &program.body {
        collect_ts_removals_from_statement(stmt, source, removals);
    }
}

/// Collect TS removals from a function (type params, return type, this param).
fn collect_ts_removals_from_function(
    func: &oxc_ast::ast::Function,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    // Remove type parameters: function foo<T>()
    if let Some(ref type_params) = func.type_parameters {
        removals.push((type_params.span.start, type_params.span.end));
    }

    // Remove return type: function foo(): string
    if let Some(ref return_type) = func.return_type {
        removals.push((return_type.span.start, return_type.span.end));
    }

    // Remove `this` parameter type: function foo(this: any)
    if let Some(ref this_param) = func.this_param {
        // Need to also remove the comma after `this: any` if there are more params
        let end = if !func.params.items.is_empty() {
            // Remove up to the start of the first param, including comma
            func.params.items[0].span.start
        } else {
            this_param.span.end
        };
        removals.push((this_param.span.start, end));
    }

    // Recurse into params for type annotations
    for param in &func.params.items {
        if let Some(ref type_ann) = param.type_annotation {
            removals.push((type_ann.span.start, type_ann.span.end));
        }
        collect_ts_removals_from_binding_pattern(&param.pattern, source, removals);
    }

    // Recurse into function body
    if let Some(ref body) = func.body {
        for stmt in &body.statements {
            collect_ts_removals_from_statement(stmt, source, removals);
        }
    }
}

/// Collect TS removals from a class (abstract keyword, type params, implements, members).
fn collect_ts_removals_from_class(
    class: &oxc_ast::ast::Class,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    use oxc_span::GetSpan;

    // Remove `abstract` keyword before `class`
    if class.r#abstract && !source.is_empty() {
        let class_source = &source[class.span.start as usize..class.span.end as usize];
        if let Some(abstract_pos) = class_source.find("abstract") {
            let abs_start = class.span.start + abstract_pos as u32;
            let abs_end = abs_start + 8; // "abstract" is 8 chars
            let space_end = if (abs_end as usize) < source.len()
                && source.as_bytes()[abs_end as usize] == b' '
            {
                abs_end + 1
            } else {
                abs_end
            };
            removals.push((abs_start, space_end));
        }
    }

    // Remove type parameters: class Foo<T>
    if let Some(ref type_params) = class.type_parameters {
        removals.push((type_params.span.start, type_params.span.end));
    }

    // Remove super type arguments: extends Bar<T>
    if let Some(ref super_type_args) = class.super_type_arguments {
        removals.push((super_type_args.span.start, super_type_args.span.end));
    }

    // Remove `implements` clause
    if !class.implements.is_empty() && !source.is_empty() {
        let last_impl = class.implements.last().unwrap();
        let search_start = if let Some(ref _super) = class.super_class {
            _super.span().end as usize
        } else if let Some(ref type_params) = class.type_parameters {
            type_params.span.end as usize
        } else if let Some(ref id) = class.id {
            id.span.end as usize
        } else {
            class.span.start as usize
        };

        if search_start < class.body.span.start as usize {
            let search_source = &source[search_start..class.body.span.start as usize];
            if let Some(impl_pos) = search_source.find("implements") {
                let abs_start = search_start as u32 + impl_pos as u32;
                removals.push((abs_start, last_impl.span.end));
                if abs_start > 0
                    && (abs_start as usize) <= source.len()
                    && source.as_bytes()[(abs_start - 1) as usize] == b' '
                {
                    removals.push((abs_start - 1, abs_start));
                }
            }
        }
    }

    // Process class body members
    for element in &class.body.body {
        match element {
            oxc_ast::ast::ClassElement::MethodDefinition(method) => {
                if method.r#type == oxc_ast::ast::MethodDefinitionType::TSAbstractMethodDefinition {
                    removals.push((method.span.start, method.span.end));
                    continue;
                }
                if let Some(ref accessibility) = method.accessibility {
                    remove_keyword_from_source(
                        match accessibility {
                            oxc_ast::ast::TSAccessibility::Public => "public",
                            oxc_ast::ast::TSAccessibility::Private => "private",
                            oxc_ast::ast::TSAccessibility::Protected => "protected",
                        },
                        method.span,
                        source,
                        removals,
                    );
                }
                collect_ts_removals_from_function(&method.value, source, removals);
            }
            oxc_ast::ast::ClassElement::PropertyDefinition(prop) => {
                if prop.declare {
                    removals.push((prop.span.start, prop.span.end));
                    continue;
                }
                if prop.r#type == oxc_ast::ast::PropertyDefinitionType::TSAbstractPropertyDefinition
                {
                    removals.push((prop.span.start, prop.span.end));
                    continue;
                }
                if let Some(ref type_ann) = prop.type_annotation {
                    removals.push((type_ann.span.start, type_ann.span.end));
                }
                if let Some(ref accessibility) = prop.accessibility {
                    remove_keyword_from_source(
                        match accessibility {
                            oxc_ast::ast::TSAccessibility::Public => "public",
                            oxc_ast::ast::TSAccessibility::Private => "private",
                            oxc_ast::ast::TSAccessibility::Protected => "protected",
                        },
                        prop.span,
                        source,
                        removals,
                    );
                }
                if prop.readonly {
                    remove_keyword_from_source("readonly", prop.span, source, removals);
                }
                if let Some(ref value) = prop.value {
                    collect_ts_removals_from_expression(value, source, removals);
                }
            }
            oxc_ast::ast::ClassElement::StaticBlock(block) => {
                for stmt in &block.body {
                    collect_ts_removals_from_statement(stmt, source, removals);
                }
            }
            _ => {}
        }
    }
}

/// Remove a keyword and trailing space from a source span.
fn remove_keyword_from_source(
    keyword: &str,
    parent_span: oxc_span::Span,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    if source.is_empty() {
        return;
    }
    let region = &source[parent_span.start as usize..parent_span.end as usize];
    if let Some(pos) = region.find(keyword) {
        let abs_start = parent_span.start + pos as u32;
        let abs_end = abs_start + keyword.len() as u32;
        let space_end =
            if (abs_end as usize) < source.len() && source.as_bytes()[abs_end as usize] == b' ' {
                abs_end + 1
            } else {
                abs_end
            };
        removals.push((abs_start, space_end));
    }
}

/// Collect TS removals from an expression.
fn collect_ts_removals_from_expression(
    expr: &oxc_ast::ast::Expression,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    use oxc_ast::ast::Expression as E;
    use oxc_span::GetSpan;

    match expr {
        E::TSAsExpression(ts_as) => {
            removals.push((ts_as.expression.span().end, ts_as.span.end));
            collect_ts_removals_from_expression(&ts_as.expression, source, removals);
        }
        E::TSSatisfiesExpression(ts_sat) => {
            removals.push((ts_sat.expression.span().end, ts_sat.span.end));
            collect_ts_removals_from_expression(&ts_sat.expression, source, removals);
        }
        E::TSNonNullExpression(ts_nn) => {
            removals.push((ts_nn.expression.span().end, ts_nn.span.end));
            collect_ts_removals_from_expression(&ts_nn.expression, source, removals);
        }
        E::TSTypeAssertion(ts_assertion) => {
            removals.push((
                ts_assertion.span.start,
                ts_assertion.expression.span().start,
            ));
            collect_ts_removals_from_expression(&ts_assertion.expression, source, removals);
        }
        E::TSInstantiationExpression(ts_inst) => {
            removals.push((ts_inst.expression.span().end, ts_inst.span.end));
            collect_ts_removals_from_expression(&ts_inst.expression, source, removals);
        }
        E::CallExpression(call) => {
            collect_ts_removals_from_expression(&call.callee, source, removals);
            if let Some(ref type_args) = call.type_arguments {
                removals.push((type_args.span.start, type_args.span.end));
            }
            for arg in &call.arguments {
                if let Some(e) = arg.as_expression() {
                    collect_ts_removals_from_expression(e, source, removals);
                }
            }
        }
        E::NewExpression(new_expr) => {
            collect_ts_removals_from_expression(&new_expr.callee, source, removals);
            if let Some(ref type_args) = new_expr.type_arguments {
                removals.push((type_args.span.start, type_args.span.end));
            }
            for arg in &new_expr.arguments {
                if let Some(e) = arg.as_expression() {
                    collect_ts_removals_from_expression(e, source, removals);
                }
            }
        }
        E::TaggedTemplateExpression(tagged) => {
            collect_ts_removals_from_expression(&tagged.tag, source, removals);
            if let Some(ref type_args) = tagged.type_arguments {
                removals.push((type_args.span.start, type_args.span.end));
            }
        }
        E::AssignmentExpression(assign) => {
            collect_ts_removals_from_expression(&assign.right, source, removals);
        }
        E::BinaryExpression(bin) => {
            collect_ts_removals_from_expression(&bin.left, source, removals);
            collect_ts_removals_from_expression(&bin.right, source, removals);
        }
        E::LogicalExpression(log) => {
            collect_ts_removals_from_expression(&log.left, source, removals);
            collect_ts_removals_from_expression(&log.right, source, removals);
        }
        E::ConditionalExpression(cond) => {
            collect_ts_removals_from_expression(&cond.test, source, removals);
            collect_ts_removals_from_expression(&cond.consequent, source, removals);
            collect_ts_removals_from_expression(&cond.alternate, source, removals);
        }
        E::UnaryExpression(unary) => {
            collect_ts_removals_from_expression(&unary.argument, source, removals);
        }
        E::UpdateExpression(_update) => {
            // UpdateExpression.argument is SimpleAssignmentTarget, not Expression
            // No TS-specific removals needed here
        }
        E::SequenceExpression(seq) => {
            for e in &seq.expressions {
                collect_ts_removals_from_expression(e, source, removals);
            }
        }
        E::ArrayExpression(arr) => {
            for elem in &arr.elements {
                if let Some(e) = elem.as_expression() {
                    collect_ts_removals_from_expression(e, source, removals);
                }
            }
        }
        E::ObjectExpression(obj) => {
            for prop in &obj.properties {
                match prop {
                    oxc_ast::ast::ObjectPropertyKind::ObjectProperty(p) => {
                        collect_ts_removals_from_expression(&p.value, source, removals);
                    }
                    oxc_ast::ast::ObjectPropertyKind::SpreadProperty(spread) => {
                        collect_ts_removals_from_expression(&spread.argument, source, removals);
                    }
                }
            }
        }
        E::ArrowFunctionExpression(arrow) => {
            if let Some(ref type_params) = arrow.type_parameters {
                removals.push((type_params.span.start, type_params.span.end));
            }
            if let Some(ref return_type) = arrow.return_type {
                removals.push((return_type.span.start, return_type.span.end));
            }
            for param in &arrow.params.items {
                if let Some(ref type_ann) = param.type_annotation {
                    removals.push((type_ann.span.start, type_ann.span.end));
                }
                collect_ts_removals_from_binding_pattern(&param.pattern, source, removals);
            }
            for stmt in &arrow.body.statements {
                collect_ts_removals_from_statement(stmt, source, removals);
            }
        }
        E::FunctionExpression(func) => {
            collect_ts_removals_from_function(func, source, removals);
        }
        E::ClassExpression(class) => {
            collect_ts_removals_from_class(class, source, removals);
        }
        E::TemplateLiteral(tmpl) => {
            for e in &tmpl.expressions {
                collect_ts_removals_from_expression(e, source, removals);
            }
        }
        E::ParenthesizedExpression(paren) => {
            collect_ts_removals_from_expression(&paren.expression, source, removals);
        }
        E::AwaitExpression(await_expr) => {
            collect_ts_removals_from_expression(&await_expr.argument, source, removals);
        }
        E::YieldExpression(yield_expr) => {
            if let Some(ref arg) = yield_expr.argument {
                collect_ts_removals_from_expression(arg, source, removals);
            }
        }
        // MemberExpression variants are inherited into Expression
        E::ComputedMemberExpression(computed) => {
            collect_ts_removals_from_expression(&computed.object, source, removals);
            collect_ts_removals_from_expression(&computed.expression, source, removals);
        }
        E::StaticMemberExpression(static_member) => {
            collect_ts_removals_from_expression(&static_member.object, source, removals);
        }
        E::PrivateFieldExpression(pfe) => {
            collect_ts_removals_from_expression(&pfe.object, source, removals);
        }
        E::ChainExpression(chain) => match &chain.expression {
            oxc_ast::ast::ChainElement::CallExpression(call) => {
                collect_ts_removals_from_expression(&call.callee, source, removals);
                if let Some(ref type_args) = call.type_arguments {
                    removals.push((type_args.span.start, type_args.span.end));
                }
                for arg in &call.arguments {
                    if let Some(e) = arg.as_expression() {
                        collect_ts_removals_from_expression(e, source, removals);
                    }
                }
            }
            oxc_ast::ast::ChainElement::TSNonNullExpression(ts_nn) => {
                removals.push((ts_nn.expression.span().end, ts_nn.span.end));
                collect_ts_removals_from_expression(&ts_nn.expression, source, removals);
            }
            _ => {}
        },
        _ => {}
    }
}

/// Collect TS removals from a statement.
fn collect_ts_removals_from_statement(
    stmt: &oxc_ast::ast::Statement,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    use oxc_ast::ast::*;
    use oxc_span::GetSpan;

    match stmt {
        Statement::ExpressionStatement(expr_stmt) => {
            collect_ts_removals_from_expression(&expr_stmt.expression, source, removals);
        }
        Statement::VariableDeclaration(var_decl) => {
            if var_decl.declare {
                removals.push((var_decl.span.start, var_decl.span.end));
                return;
            }
            for decl in &var_decl.declarations {
                if let Some(ref type_ann) = decl.type_annotation {
                    removals.push((type_ann.span.start, type_ann.span.end));
                }
                collect_ts_removals_from_binding_pattern(&decl.id, source, removals);
                if let Some(ref init) = decl.init {
                    collect_ts_removals_from_expression(init, source, removals);
                }
            }
        }
        Statement::ReturnStatement(ret) => {
            if let Some(ref arg) = ret.argument {
                collect_ts_removals_from_expression(arg, source, removals);
            }
        }
        Statement::IfStatement(if_stmt) => {
            collect_ts_removals_from_expression(&if_stmt.test, source, removals);
            collect_ts_removals_from_statement(&if_stmt.consequent, source, removals);
            if let Some(ref alt) = if_stmt.alternate {
                collect_ts_removals_from_statement(alt, source, removals);
            }
        }
        Statement::BlockStatement(block) => {
            for s in &block.body {
                collect_ts_removals_from_statement(s, source, removals);
            }
        }
        Statement::ForStatement(for_stmt) => {
            if let Some(ref init) = for_stmt.init
                && let ForStatementInit::VariableDeclaration(vd) = init
            {
                for decl in &vd.declarations {
                    if let Some(ref type_ann) = decl.type_annotation {
                        removals.push((type_ann.span.start, type_ann.span.end));
                    }
                    collect_ts_removals_from_binding_pattern(&decl.id, source, removals);
                    if let Some(ref i) = decl.init {
                        collect_ts_removals_from_expression(i, source, removals);
                    }
                }
            }
            if let Some(ref test) = for_stmt.test {
                collect_ts_removals_from_expression(test, source, removals);
            }
            if let Some(ref update) = for_stmt.update {
                collect_ts_removals_from_expression(update, source, removals);
            }
            collect_ts_removals_from_statement(&for_stmt.body, source, removals);
        }
        Statement::WhileStatement(while_stmt) => {
            collect_ts_removals_from_expression(&while_stmt.test, source, removals);
            collect_ts_removals_from_statement(&while_stmt.body, source, removals);
        }
        Statement::FunctionDeclaration(func) => {
            if func.r#type == FunctionType::TSDeclareFunction || func.declare || func.body.is_none()
            {
                removals.push((func.span.start, func.span.end));
            } else {
                collect_ts_removals_from_function(func, source, removals);
            }
        }
        Statement::ClassDeclaration(class) => {
            if class.declare {
                removals.push((class.span.start, class.span.end));
            } else {
                collect_ts_removals_from_class(class, source, removals);
            }
        }
        Statement::ThrowStatement(throw_stmt) => {
            collect_ts_removals_from_expression(&throw_stmt.argument, source, removals);
        }
        Statement::TryStatement(try_stmt) => {
            for s in &try_stmt.block.body {
                collect_ts_removals_from_statement(s, source, removals);
            }
            if let Some(ref handler) = try_stmt.handler {
                for s in &handler.body.body {
                    collect_ts_removals_from_statement(s, source, removals);
                }
            }
            if let Some(ref finalizer) = try_stmt.finalizer {
                for s in &finalizer.body {
                    collect_ts_removals_from_statement(s, source, removals);
                }
            }
        }
        Statement::SwitchStatement(switch_stmt) => {
            collect_ts_removals_from_expression(&switch_stmt.discriminant, source, removals);
            for case in &switch_stmt.cases {
                if let Some(ref test) = case.test {
                    collect_ts_removals_from_expression(test, source, removals);
                }
                for s in &case.consequent {
                    collect_ts_removals_from_statement(s, source, removals);
                }
            }
        }
        // Import/Export declarations
        Statement::ImportDeclaration(import_decl) => {
            if import_decl.import_kind == ImportOrExportKind::Type {
                removals.push((import_decl.span.start, import_decl.span.end));
            } else if let Some(specifiers) = &import_decl.specifiers {
                let type_specs: Vec<_> = specifiers
                    .iter()
                    .filter(|s| {
                        if let ImportDeclarationSpecifier::ImportSpecifier(spec) = s {
                            spec.import_kind == ImportOrExportKind::Type
                        } else {
                            false
                        }
                    })
                    .collect();
                if !type_specs.is_empty() {
                    if type_specs.len() == specifiers.len() {
                        removals.push((import_decl.span.start, import_decl.span.end));
                    } else {
                        for spec in type_specs {
                            remove_specifier_with_comma(spec.span(), source, removals);
                        }
                    }
                }
            }
        }
        Statement::ExportNamedDeclaration(export_decl) => {
            if export_decl.export_kind == ImportOrExportKind::Type {
                removals.push((export_decl.span.start, export_decl.span.end));
            } else {
                if let Some(ref decl) = export_decl.declaration {
                    match decl {
                        Declaration::FunctionDeclaration(func) => {
                            if func.r#type == FunctionType::TSDeclareFunction
                                || func.declare
                                || func.body.is_none()
                            {
                                removals.push((export_decl.span.start, export_decl.span.end));
                            } else {
                                collect_ts_removals_from_function(func, source, removals);
                            }
                        }
                        Declaration::ClassDeclaration(class) => {
                            if class.declare {
                                removals.push((export_decl.span.start, export_decl.span.end));
                            } else {
                                collect_ts_removals_from_class(class, source, removals);
                            }
                        }
                        Declaration::VariableDeclaration(var_decl) => {
                            if var_decl.declare {
                                removals.push((export_decl.span.start, export_decl.span.end));
                            }
                        }
                        Declaration::TSTypeAliasDeclaration(_)
                        | Declaration::TSInterfaceDeclaration(_)
                        | Declaration::TSEnumDeclaration(_)
                        | Declaration::TSModuleDeclaration(_) => {
                            removals.push((export_decl.span.start, export_decl.span.end));
                        }
                        _ => {}
                    }
                }
                // Type-only export specifiers
                let type_specs: Vec<_> = export_decl
                    .specifiers
                    .iter()
                    .filter(|s| s.export_kind == ImportOrExportKind::Type)
                    .collect();
                if !type_specs.is_empty() && export_decl.declaration.is_none() {
                    if type_specs.len() == export_decl.specifiers.len() {
                        removals.push((export_decl.span.start, export_decl.span.end));
                    } else {
                        for spec in type_specs {
                            remove_specifier_with_comma(spec.span, source, removals);
                        }
                    }
                }
            }
        }
        Statement::ExportDefaultDeclaration(export_decl) => match &export_decl.declaration {
            ExportDefaultDeclarationKind::TSInterfaceDeclaration(_) => {
                removals.push((export_decl.span.start, export_decl.span.end));
            }
            ExportDefaultDeclarationKind::FunctionDeclaration(func) => {
                if func.r#type == FunctionType::TSDeclareFunction
                    || func.declare
                    || func.body.is_none()
                {
                    removals.push((export_decl.span.start, export_decl.span.end));
                } else {
                    collect_ts_removals_from_function(func, source, removals);
                }
            }
            ExportDefaultDeclarationKind::ClassDeclaration(class) => {
                if class.declare {
                    removals.push((export_decl.span.start, export_decl.span.end));
                } else {
                    collect_ts_removals_from_class(class, source, removals);
                }
            }
            _ => {
                if let Some(expr) = export_decl.declaration.as_expression() {
                    collect_ts_removals_from_expression(expr, source, removals);
                }
            }
        },
        Statement::ExportAllDeclaration(export_decl) => {
            if export_decl.export_kind == ImportOrExportKind::Type {
                removals.push((export_decl.span.start, export_decl.span.end));
            }
        }
        // TS-only statements
        Statement::TSTypeAliasDeclaration(decl) => {
            removals.push((decl.span.start, decl.span.end));
        }
        Statement::TSInterfaceDeclaration(decl) => {
            removals.push((decl.span.start, decl.span.end));
        }
        Statement::TSModuleDeclaration(decl) => {
            removals.push((decl.span.start, decl.span.end));
        }
        Statement::TSEnumDeclaration(decl) => {
            removals.push((decl.span.start, decl.span.end));
        }
        _ => {}
    }
}

/// Collect TS removals from a binding pattern.
fn collect_ts_removals_from_binding_pattern(
    pattern: &oxc_ast::ast::BindingPattern,
    source: &str,
    removals: &mut Vec<(u32, u32)>,
) {
    match pattern {
        oxc_ast::ast::BindingPattern::BindingIdentifier(_) => {
            // No type annotation on BindingIdentifier in OXC 0.107
        }
        oxc_ast::ast::BindingPattern::ObjectPattern(obj) => {
            for prop in &obj.properties {
                collect_ts_removals_from_binding_pattern(&prop.value, source, removals);
            }
            if let Some(ref rest) = obj.rest {
                collect_ts_removals_from_binding_pattern(&rest.argument, source, removals);
            }
        }
        oxc_ast::ast::BindingPattern::ArrayPattern(arr) => {
            for elem in arr.elements.iter().flatten() {
                collect_ts_removals_from_binding_pattern(elem, source, removals);
            }
            if let Some(ref rest) = arr.rest {
                collect_ts_removals_from_binding_pattern(&rest.argument, source, removals);
            }
        }
        oxc_ast::ast::BindingPattern::AssignmentPattern(assign) => {
            collect_ts_removals_from_binding_pattern(&assign.left, source, removals);
            collect_ts_removals_from_expression(&assign.right, source, removals);
        }
    }
}

/// Remove a specifier from its surrounding context, including the comma.
fn remove_specifier_with_comma(span: oxc_span::Span, source: &str, removals: &mut Vec<(u32, u32)>) {
    let mut start = span.start;
    let mut end = span.end;

    // Try to remove trailing comma and whitespace
    if (end as usize) < source.len() {
        let after = &source[end as usize..];
        let trimmed = after.trim_start();
        if trimmed.starts_with(',') {
            end = (source.len() - trimmed.len() + 1) as u32;
            if (end as usize) < source.len() {
                let after_comma = &source[end as usize..];
                let trimmed2 = after_comma.trim_start_matches(' ');
                end = (source.len() - trimmed2.len()) as u32;
            }
        } else if start > 0 {
            // Try to remove leading comma and whitespace
            let before = &source[..start as usize];
            let trimmed = before.trim_end();
            if trimmed.ends_with(',') {
                start = (trimmed.len() - 1) as u32;
            }
        }
    }

    removals.push((start, end));
}

/// Analysis result for a Svelte component.
#[derive(Debug)]
pub struct ComponentAnalysis {
    /// The root scope containing all bindings
    pub root: ScopeRoot,

    /// Analysis of the module script (<script context="module">)
    pub module: Option<JsAnalysis>,

    /// Analysis of the instance script (<script>)
    pub instance: Option<JsAnalysis>,

    /// Analysis of the template
    pub template: TemplateAnalysis,

    /// CSS analysis
    pub css: CssAnalysis,

    /// Component name (derived from filename)
    pub name: String,

    /// Whether the component uses runes
    pub runes: bool,

    /// Whether experimental.async is enabled
    pub experimental_async: bool,

    /// Whether the component has top-level await in script or template
    /// (requires async function wrapper when experimental.async is enabled)
    pub has_await: bool,

    /// Whether the component might use runes
    pub maybe_runes: bool,

    /// Whether the component uses $$props
    pub uses_props: bool,

    /// Whether the component uses $$restProps
    pub uses_rest_props: bool,

    /// Whether the component uses $$slots
    pub uses_slots: bool,

    /// Whether the component uses render tags (@render)
    pub uses_render_tags: bool,

    /// Whether the component uses component bindings
    pub uses_component_bindings: bool,

    /// Whether the component uses event attributes (on:event={handler})
    pub uses_event_attributes: bool,

    /// The first on: directive node encountered (for error reporting about mixed syntax)
    pub event_directive_node: Option<EventDirectiveInfo>,

    /// Whether the component needs context
    pub needs_context: bool,

    /// Whether the component needs props validation
    pub needs_props: bool,

    /// Whether the component needs mutation validation (for reactive state tracking)
    pub needs_mutation_validation: bool,

    /// Exported names and their aliases
    pub exports: Vec<Export>,

    /// Custom element configuration
    pub custom_element: Option<CustomElementConfig>,

    /// Whether styles should be injected via JavaScript
    pub inject_styles: bool,

    /// The original source code
    pub source: String,

    /// Pre-extracted instance script content (to avoid re-parsing in Phase 3)
    pub instance_script_content: Option<ScriptContent>,

    /// Pre-extracted module script content (to avoid re-parsing in Phase 3)
    pub module_script_content: Option<ScriptContent>,

    /// $derived expressions that contain await (async deriveds)
    /// These need special handling during code generation
    pub async_deriveds: FxHashSet<String>,

    /// The identifier used for $props.id() (if any)
    /// Used to track the props ID declaration
    pub props_id: Option<String>,

    /// Hash of the filename (used for svelte:head hydration validation)
    /// This is always computed from the filename, regardless of CSS presence
    pub filename_hash: String,

    /// Whether the component uses $inspect.trace()
    pub tracing: bool,

    /// Whether dev mode is enabled (needed for $inspect.trace handling)
    pub dev: bool,

    /// Class bodies with their state fields (for class body analysis)
    /// Maps from class body node (JSON) to state fields by name
    pub classes: FxHashMap<String, FxHashMap<String, StateField>>,

    /// Reactive statements ($: statements) in legacy mode
    /// Maps from the labeled statement node (JSON string) to its analysis
    pub reactive_statements: FxHashMap<String, ReactiveStatement>,

    /// Whether the component is immutable (no reactivity)
    pub immutable: bool,

    /// Whether the component uses accessors mode
    pub accessors: bool,

    /// Await expressions needing context preservation (pickled awaits).
    /// Stores the start position of each await expression that needs $.save() wrapping.
    pub pickled_awaits: FxHashSet<u32>,

    /// Identifiers that make up bind:group expressions -> internal group binding name
    /// Maps from (key, bindings) to the generated identifier
    pub binding_groups: FxHashMap<String, String>,

    /// Slot names mapped to their SlotElement nodes
    pub slot_names: FxHashMap<String, String>,

    /// Every render tag/component and whether it could be definitively resolved
    pub snippet_renderers: FxHashMap<String, bool>,

    /// Pre-transformed <script> instance body (for optimization)
    pub instance_body: InstanceBody,

    /// JS comments from the AST (for preservation)
    pub comments: Vec<String>,

    /// Warnings generated during analysis
    pub warnings: Vec<super::warnings::AnalysisWarning>,

    /// Whether the component namespace (from compile options or <svelte:options>) is SVG.
    /// Used by SvelteElement analysis to determine default namespace context.
    pub component_namespace_is_svg: bool,

    /// Whether the component namespace (from compile options or <svelte:options>) is MathML.
    /// Used by SvelteElement analysis to determine default namespace context.
    pub component_namespace_is_mathml: bool,

    /// Whether any script in the component uses TypeScript (lang="ts" or lang="typescript").
    /// Set during `extract_scripts()` and used during scope building to parse template
    /// expressions as TypeScript.
    pub is_typescript: bool,
}

impl ComponentAnalysis {
    /// Create a new component analysis.
    pub fn new(source: &str, options: &CompileOptions) -> Self {
        let name = options
            .filename
            .as_ref()
            .map(|f| derive_component_name(f))
            .unwrap_or_else(|| "Component".to_string());

        // If runes is explicitly set in options, use that; otherwise default to false
        // and let the analysis phase detect runes from source
        let initial_runes = options.runes.unwrap_or(false);

        // Compute filename hash for svelte:head hydration validation
        // This is always based on the filename (or "main.svelte" if not specified)
        let filename_hash_source = options
            .filename
            .as_ref()
            .filter(|f| *f != "(unknown)")
            .map(|f| f.as_str())
            .unwrap_or("main.svelte");
        let filename_hash =
            crate::compiler::phases::phase3_transform::css::generate_raw_hash(filename_hash_source);

        Self {
            root: ScopeRoot::new(),
            module: None,
            instance: None,
            template: TemplateAnalysis::default(),
            css: CssAnalysis::default(),
            name,
            runes: initial_runes,
            experimental_async: options.experimental.r#async,
            has_await: false,
            maybe_runes: false,
            uses_props: false,
            uses_rest_props: false,
            uses_slots: false,
            uses_render_tags: false,
            uses_component_bindings: false,
            uses_event_attributes: false,
            event_directive_node: None,
            needs_context: false,
            needs_props: false,
            needs_mutation_validation: false,
            exports: Vec::new(),
            custom_element: None,
            inject_styles: options.css == crate::compiler::CssMode::Injected,
            source: source.to_string(),
            instance_script_content: None,
            module_script_content: None,
            async_deriveds: FxHashSet::default(),
            props_id: None,
            filename_hash,
            tracing: false,
            dev: options.dev,
            classes: FxHashMap::default(),
            reactive_statements: FxHashMap::default(),
            immutable: options.immutable,
            accessors: options.accessors,
            pickled_awaits: FxHashSet::default(),
            binding_groups: FxHashMap::default(),
            slot_names: FxHashMap::default(),
            snippet_renderers: FxHashMap::default(),
            instance_body: InstanceBody::default(),
            comments: Vec::new(),
            warnings: Vec::new(),
            component_namespace_is_svg: options.namespace == crate::compiler::Namespace::Svg,
            component_namespace_is_mathml: options.namespace == crate::compiler::Namespace::Mathml,
            is_typescript: false,
        }
    }

    /// Extract and store script content from the AST.
    /// This should be called during Phase 2 to pre-extract scripts for Phase 3.
    pub fn extract_scripts(&mut self, ast: &Root) {
        // Check if any script in the component uses TypeScript.
        // In Svelte, if the module script has lang="ts", the instance script
        // is also treated as TypeScript (even without its own lang attribute).
        let any_script_is_typescript =
            Self::script_is_typescript_attr(ast.module.as_ref().map(|s| s.as_ref()))
                || Self::script_is_typescript_attr(ast.instance.as_ref().map(|s| s.as_ref()));

        // Store the TypeScript flag for later use (e.g., scope building)
        self.is_typescript = any_script_is_typescript;

        // Extract instance script content
        if let Some(ref script) = ast.instance {
            let content =
                ScriptContent::from_script_with_ts(script, &self.source, any_script_is_typescript);
            if content.uses_runes {
                self.runes = true;
            }
            self.instance_script_content = Some(content);
        }

        // Extract module script content
        if let Some(ref script) = ast.module {
            let content =
                ScriptContent::from_script_with_ts(script, &self.source, any_script_is_typescript);
            self.module_script_content = Some(content);
        }
    }

    /// Check if a script node has `lang="ts"` or `lang="typescript"` attribute.
    fn script_is_typescript_attr(script: Option<&Script>) -> bool {
        script
            .map(|s| {
                s.attributes.iter().any(|attr| {
                    if attr.name == "lang"
                        && let crate::ast::template::AttributeValue::Sequence(parts) = &attr.value
                        && let Some(crate::ast::template::AttributeValuePart::Text(text)) =
                            parts.first()
                    {
                        return text.data == "ts" || text.data == "typescript";
                    }
                    false
                })
            })
            .unwrap_or(false)
    }

    /// Create scopes for the component.
    pub fn create_scopes(&mut self, ast: &Root) -> Result<(), super::AnalysisError> {
        // Build scope tree using ScopeBuilder
        // Pass is_typescript so template expressions are parsed as TypeScript when needed
        let (scope_root, validation_errors) =
            super::scope_builder::build_scopes(ast, &self.source, self.runes, self.is_typescript);
        self.root = scope_root;

        // Return first validation error if any occurred during scope building
        // (e.g., invalid $ prefix on variable names)
        if let Some(err) = validation_errors.into_iter().next() {
            return Err(err);
        }

        // Update runes flag based on bindings
        for binding in &self.root.bindings {
            if binding.kind.is_rune() {
                self.runes = true;
                break;
            }
        }

        // In runes mode, immutable is always true
        // This matches the official Svelte compiler: immutable: runes || options.immutable
        if self.runes {
            self.immutable = true;
        }

        Ok(())
    }

    /// Analyze CSS in the component.
    pub fn analyze_css(
        &mut self,
        css: &crate::ast::css::StyleSheet,
        options: &CompileOptions,
    ) -> Result<(), super::AnalysisError> {
        self.css.has_css = true;

        // Generate the CSS hash
        // Svelte uses the filename if available, otherwise the CSS content
        let hash_source = if let Some(ref filename) = options.filename {
            if filename == "(unknown)" {
                css.content.styles.clone()
            } else {
                filename.clone()
            }
        } else {
            css.content.styles.clone()
        };

        self.css.hash =
            crate::compiler::phases::phase3_transform::css::generate_css_hash(&hash_source);

        // TODO: Analyze for keyframes and :global selectors
        Ok(())
    }
}

/// Derive component name from filename.
/// Matches Svelte's get_component_name() in phases/2-analyze/index.js
fn derive_component_name(filename: &str) -> String {
    // Split by path separators (like JS: filename.split(/[/\\]/))
    let parts: Vec<&str> = filename.split(['/', '\\']).collect();
    let basename = parts.last().unwrap_or(&"Component");
    let last_dir = if parts.len() > 1 {
        parts.get(parts.len() - 2).copied()
    } else {
        None
    };

    // Remove .svelte extension
    let mut name = basename.replace(".svelte", "");

    // If name is "index" and there's a parent dir (not "src"), use the parent dir name
    if name == "index"
        && let Some(dir) = last_dir
        && dir != "src"
        && !dir.is_empty()
    {
        name = dir.to_string();
    }

    let stem = if name.is_empty() { "Component" } else { &name };

    // Convert to component name format
    let parts: Vec<&str> = stem
        .split(['-', '_', '.'])
        .filter(|part| !part.is_empty())
        .collect();

    if parts.is_empty() {
        return "Component".to_string();
    }

    let mut result = String::new();
    for (i, part) in parts.iter().enumerate() {
        if i > 0 {
            result.push('_');
        }

        if i == 0 {
            let mut chars = part.chars();
            if let Some(first) = chars.next() {
                result.extend(first.to_uppercase());
                result.push_str(chars.as_str());
            }
        } else {
            result.push_str(part);
        }
    }

    result
}

/// Analysis of a JavaScript block.
#[derive(Debug, Default)]
pub struct JsAnalysis {
    /// The scope for this JS block
    pub scope: Scope,

    /// Scopes for nested blocks
    pub scopes: FxHashMap<usize, Scope>,

    /// Whether this block contains await expressions
    pub has_await: bool,
}

/// Analysis of the template.
#[derive(Debug, Default)]
pub struct TemplateAnalysis {
    /// The scope for the template
    pub scope: Scope,

    /// Scopes for nested template blocks
    pub scopes: FxHashMap<usize, Scope>,

    /// All DOM elements in the template
    pub elements: Vec<ElementInfo>,

    /// All components used in the template
    pub components: Vec<ComponentInfo>,

    /// All snippets declared in the template
    pub snippets: FxHashSet<String>,
}

/// Information about a DOM element.
#[derive(Debug)]
pub struct ElementInfo {
    /// The element tag name
    pub name: String,
    /// Start position in source
    pub start: usize,
    /// End position in source
    pub end: usize,
    /// Whether this element has dynamic attributes
    pub has_dynamic_attributes: bool,
    /// Whether this element has spread attributes
    pub has_spread: bool,
}

/// Information about a component usage.
#[derive(Debug)]
pub struct ComponentInfo {
    /// The component name
    pub name: String,
    /// Start position in source
    pub start: usize,
    /// End position in source
    pub end: usize,
    /// Whether this component has bindings
    pub has_bindings: bool,
}

/// Information about an event directive (for error reporting).
#[derive(Debug, Clone)]
pub struct EventDirectiveInfo {
    /// The event name
    pub name: String,
    /// Start position in source
    pub start: u32,
    /// End position in source
    pub end: u32,
}

/// A state field in a class (using $state, $state.raw, $derived, $derived.by).
#[derive(Debug, Clone)]
pub struct StateField {
    /// The type of rune used ($state, $state.raw, $derived, $derived.by)
    pub rune_type: String,
    /// The field node (PropertyDefinition or AssignmentExpression in JS)
    pub node: serde_json::Value,
    /// The private identifier key
    pub key: serde_json::Value,
    /// The call expression value ($state(...), etc.)
    pub value: serde_json::Value,
}

/// CSS analysis result.
#[derive(Debug, Default)]
pub struct CssAnalysis {
    /// Whether CSS is present
    pub has_css: bool,

    /// The CSS hash for scoping
    pub hash: String,

    /// Keyframe names for scoping
    pub keyframes: Vec<String>,

    /// Whether the CSS contains :global
    pub has_global: bool,

    /// Element tag names used in the template (for unused selector detection)
    pub used_elements: FxHashSet<String>,

    /// Class names used in the template (for unused selector detection)
    pub used_classes: FxHashSet<String>,

    /// IDs used in the template (for unused selector detection)
    pub used_ids: FxHashSet<String>,

    /// Whether there are dynamic elements (svelte:element with dynamic this)
    /// If true, type selectors cannot be safely pruned
    pub has_dynamic_elements: bool,

    /// Whether there are dynamic class expressions (spreads, complex expressions)
    /// If true, class selectors cannot be safely pruned
    pub has_dynamic_classes: bool,

    /// Whether the template has control flow (if/each/await/snippet) that affects sibling relationships
    /// If true, sibling combinator unused detection cannot be safely performed
    pub has_control_flow: bool,

    /// Whether the template has constructs that create opaque boundaries for
    /// sibling relationships. This includes:
    /// - Slots, render tags, snippets: Phase 2 uses separate fragment paths
    /// - Non-exhaustive await blocks: may render nothing in some states
    /// - Each blocks: elements can repeat, nest, and wrap around across iterations,
    ///   creating complex sibling relationships that Phase 2 doesn't fully model
    pub has_opaque_elements: bool,

    /// DOM structure information for selector matching
    pub dom_structure: DomStructure,
}

/// DOM structure information for CSS selector matching.
#[derive(Debug, Default, Clone)]
pub struct DomStructure {
    /// All elements in the template, with their relationships
    pub elements: Vec<CssDomElement>,
}

/// Certainty level of sibling relationships.
/// Used for control flow analysis to determine if sibling combinators are valid.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum SiblingCertainty {
    /// Element definitely exists in the DOM (not inside control flow)
    #[default]
    Definite,
    /// Element may or may not exist (inside if/each/await block)
    Probable,
}

/// Element information for CSS selector matching (DOM tree structure).
#[derive(Debug, Clone)]
pub struct CssDomElement {
    /// Element tag name
    pub tag_name: String,
    /// Class names on this element
    pub classes: FxHashSet<String>,
    /// ID (if any)
    pub id: Option<String>,
    /// Parent element index (in elements array), None for root
    pub parent_idx: Option<usize>,
    /// Child element indices
    pub children_idx: Vec<usize>,
    /// Whether this element is a direct child of the component root
    pub is_root_child: bool,
    /// Possible previous adjacent siblings (for + combinator)
    /// Tuple of (element_index, certainty)
    pub possible_prev_adjacent: Vec<(usize, SiblingCertainty)>,
    /// Possible next adjacent siblings (for + combinator)
    /// Tuple of (element_index, certainty)
    pub possible_next_adjacent: Vec<(usize, SiblingCertainty)>,
    /// Possible previous general siblings (for ~ combinator)
    /// Tuple of (element_index, certainty)
    pub possible_prev_general: Vec<(usize, SiblingCertainty)>,
    /// Possible next general siblings (for ~ combinator)
    /// Tuple of (element_index, certainty)
    pub possible_next_general: Vec<(usize, SiblingCertainty)>,
    /// Whether this element has content (non-empty children)
    pub has_content: bool,
}

/// Export information.
#[derive(Debug, Clone)]
pub struct Export {
    /// The exported name
    pub name: String,
    /// The alias (if different from name)
    pub alias: Option<String>,
}

/// Custom element configuration.
#[derive(Debug, Clone)]
pub struct CustomElementConfig {
    /// The custom element tag name
    pub tag: Option<String>,
    /// Shadow DOM mode
    pub shadow: Option<String>,
}
