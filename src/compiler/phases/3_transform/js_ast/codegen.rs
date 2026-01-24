//! JavaScript code generation from AST nodes.
//!
//! This module converts our AST representation to JavaScript source code,
//! then normalizes it using oxc.

use super::nodes::*;
use std::fmt::Write;

/// Generate JavaScript source code from a program AST.
pub fn generate(program: &JsProgram) -> Result<String, String> {
    let mut codegen = JsCodegen::new();
    codegen.emit_program(program);
    let raw = codegen.output;

    // Normalize through oxc parser/codegen
    normalize_js(&raw)
}

/// Generate raw JavaScript source code without normalization.
pub fn generate_raw(program: &JsProgram) -> String {
    let mut codegen = JsCodegen::new();
    codegen.emit_program(program);
    codegen.output
}

/// Normalize JavaScript code using oxc parser/codegen.
///
/// This is also aliased as `parse_and_generate` for backwards compatibility.
pub fn normalize_js(source: &str) -> Result<String, String> {
    use oxc_allocator::Allocator;
    use oxc_codegen::{Codegen, CodegenOptions};
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    let allocator = Allocator::default();
    let source_type = SourceType::mjs();
    let parser = Parser::new(&allocator, source, source_type);
    let result = parser.parse();

    if !result.errors.is_empty() {
        return Err(format!("Parse errors: {:?}", result.errors));
    }

    let options = CodegenOptions {
        single_quote: true,
        ..Default::default()
    };
    let code = Codegen::new()
        .with_options(options)
        .build(&result.program)
        .code;
    Ok(collapse_short_arrays(code))
}

/// Collapse short arrays from multi-line to single-line format.
///
/// oxc's codegen always formats arrays with multiple elements on separate lines.
/// This function collapses arrays that contain only simple literals (strings, numbers, etc.)
/// to a single line format to match Svelte's esrap output.
///
/// Example:
/// ```js
/// // Input:
/// ['foo',
///     'bar',
///     'baz'
/// ]
/// // Output:
/// ['foo', 'bar', 'baz']
/// ```
fn collapse_short_arrays(code: String) -> String {
    use regex::Regex;

    // Match arrays that span multiple lines with only simple literals
    // Pattern: [ followed by newline+indent+items, ending with newline+indent+]
    let re = Regex::new(r"(?s)\[(\s*\n\t*'[^']*'(?:,\s*\n\t*'[^']*')*)\s*\n\t*\]").unwrap();

    let result = re.replace_all(&code, |caps: &regex::Captures| {
        // Extract the content between [ and ]
        let content = &caps[1];
        // Split by comma and newline, trim each element
        let elements: Vec<&str> = content
            .split(',')
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect();
        format!("[{}]", elements.join(", "))
    });

    result.into_owned()
}

/// JavaScript code generator.
struct JsCodegen {
    output: String,
    indent_level: usize,
    needs_semicolon: bool,
}

impl JsCodegen {
    fn new() -> Self {
        Self {
            output: String::new(),
            indent_level: 0,
            needs_semicolon: false,
        }
    }

    fn indent(&mut self) {
        for _ in 0..self.indent_level {
            self.output.push('\t');
        }
    }

    fn newline(&mut self) {
        self.output.push('\n');
    }

    fn emit_program(&mut self, program: &JsProgram) {
        for (i, stmt) in program.body.iter().enumerate() {
            if i > 0 {
                self.newline();
            }
            self.emit_statement(stmt);
        }
    }

    fn emit_statement(&mut self, stmt: &JsStatement) {
        self.indent();
        self.emit_statement_inner(stmt);
        if self.needs_semicolon {
            self.output.push(';');
            self.needs_semicolon = false;
        }
        self.newline();
    }

    fn emit_statement_inner(&mut self, stmt: &JsStatement) {
        match stmt {
            JsStatement::Import(import) => self.emit_import(import),
            JsStatement::ExportDefault(export) => self.emit_export_default(export),
            JsStatement::ExportNamed(export) => self.emit_export_named(export),
            JsStatement::VariableDeclaration(decl) => self.emit_variable_declaration(decl),
            JsStatement::FunctionDeclaration(decl) => self.emit_function_declaration(decl),
            JsStatement::Expression(expr_stmt) => {
                self.emit_expression(&expr_stmt.expression);
                self.needs_semicolon = true;
            }
            JsStatement::Return(ret) => {
                self.output.push_str("return");
                if let Some(ref arg) = ret.argument {
                    self.output.push(' ');
                    self.emit_expression(arg);
                }
                self.needs_semicolon = true;
            }
            JsStatement::If(if_stmt) => self.emit_if_statement(if_stmt),
            JsStatement::For(for_stmt) => self.emit_for_statement(for_stmt),
            JsStatement::ForOf(for_of) => self.emit_for_of_statement(for_of),
            JsStatement::While(while_stmt) => self.emit_while_statement(while_stmt),
            JsStatement::DoWhile(do_while) => self.emit_do_while_statement(do_while),
            JsStatement::Block(block) => self.emit_block_statement(block),
            JsStatement::Empty => self.needs_semicolon = true,
            JsStatement::Debugger => {
                self.output.push_str("debugger");
                self.needs_semicolon = true;
            }
            JsStatement::Labeled(labeled) => {
                self.output.push_str(&labeled.label);
                self.output.push_str(": ");
                self.emit_statement_inner(&labeled.body);
            }
            JsStatement::Break(label) => {
                self.output.push_str("break");
                if let Some(l) = label {
                    self.output.push(' ');
                    self.output.push_str(l);
                }
                self.needs_semicolon = true;
            }
            JsStatement::Continue(label) => {
                self.output.push_str("continue");
                if let Some(l) = label {
                    self.output.push(' ');
                    self.output.push_str(l);
                }
                self.needs_semicolon = true;
            }
            JsStatement::Throw(expr) => {
                self.output.push_str("throw ");
                self.emit_expression(expr);
                self.needs_semicolon = true;
            }
            JsStatement::Try(try_stmt) => self.emit_try_statement(try_stmt),
        }
    }

    fn emit_import(&mut self, import: &JsImportDeclaration) {
        self.output.push_str("import ");

        let has_specifiers = !import.specifiers.is_empty()
            && !matches!(import.specifiers[0], JsImportSpecifier::SideEffect);

        if has_specifiers {
            let mut has_default = false;
            let mut named = Vec::new();
            let mut namespace = None;

            for spec in &import.specifiers {
                match spec {
                    JsImportSpecifier::Default(name) => {
                        has_default = true;
                        self.output.push_str(name);
                    }
                    JsImportSpecifier::Namespace(name) => {
                        namespace = Some(name.clone());
                    }
                    JsImportSpecifier::Named { imported, local } => {
                        named.push((imported.clone(), local.clone()));
                    }
                    JsImportSpecifier::SideEffect => {}
                }
            }

            if has_default && (namespace.is_some() || !named.is_empty()) {
                self.output.push_str(", ");
            }

            if let Some(ref ns) = namespace {
                self.output.push_str("* as ");
                self.output.push_str(ns);
            }

            if !named.is_empty() {
                if namespace.is_some() {
                    self.output.push_str(", ");
                }
                self.output.push_str("{ ");
                for (i, (imported, local)) in named.iter().enumerate() {
                    if i > 0 {
                        self.output.push_str(", ");
                    }
                    if imported == local {
                        self.output.push_str(local);
                    } else {
                        let _ = write!(self.output, "{} as {}", imported, local);
                    }
                }
                self.output.push_str(" }");
            }

            self.output.push_str(" from ");
        }

        self.output.push('\'');
        self.output.push_str(&import.source);
        self.output.push('\'');
        self.needs_semicolon = true;
    }

    fn emit_export_default(&mut self, export: &JsExportDefault) {
        self.output.push_str("export default ");
        match &export.declaration {
            JsExportDefaultDeclaration::Function(func) => {
                self.emit_function_declaration(func);
            }
            JsExportDefaultDeclaration::Expression(expr) => {
                self.emit_expression(expr);
                self.needs_semicolon = true;
            }
        }
    }

    fn emit_export_named(&mut self, export: &JsExportNamed) {
        self.output.push_str("export ");
        if let Some(ref decl) = export.declaration {
            self.emit_variable_declaration(decl);
        } else {
            self.output.push_str("{ ");
            for (i, spec) in export.specifiers.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                if spec.local == spec.exported {
                    self.output.push_str(&spec.local);
                } else {
                    let _ = write!(self.output, "{} as {}", spec.local, spec.exported);
                }
            }
            self.output.push_str(" }");
            self.needs_semicolon = true;
        }
    }

    fn emit_variable_declaration(&mut self, decl: &JsVariableDeclaration) {
        self.output.push_str(&decl.kind.to_string());
        self.output.push(' ');

        for (i, declarator) in decl.declarations.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_pattern(&declarator.id);
            if let Some(ref init) = declarator.init {
                self.output.push_str(" = ");
                self.emit_expression(init);
            }
        }
        self.needs_semicolon = true;
    }

    fn emit_function_declaration(&mut self, func: &JsFunctionDeclaration) {
        if func.is_async {
            self.output.push_str("async ");
        }
        self.output.push_str("function");
        if func.is_generator {
            self.output.push('*');
        }
        if let Some(ref id) = func.id {
            self.output.push(' ');
            self.output.push_str(id);
        }
        self.output.push('(');
        self.emit_params(&func.params);
        self.output.push_str(") ");
        self.emit_block_inline(&func.body);
    }

    fn emit_if_statement(&mut self, if_stmt: &JsIfStatement) {
        self.output.push_str("if (");
        self.emit_expression(&if_stmt.test);
        self.output.push_str(") ");
        self.emit_statement_as_block(&if_stmt.consequent);

        if let Some(ref alt) = if_stmt.alternate {
            self.output.push_str(" else ");
            if matches!(alt.as_ref(), JsStatement::If(_)) {
                self.emit_statement_inner(alt);
            } else {
                self.emit_statement_as_block(alt);
            }
        }
    }

    fn emit_for_statement(&mut self, for_stmt: &JsForStatement) {
        self.output.push_str("for (");
        if let Some(ref init) = for_stmt.init {
            match init {
                JsForInit::Variable(decl) => {
                    self.output.push_str(&decl.kind.to_string());
                    self.output.push(' ');
                    for (i, declarator) in decl.declarations.iter().enumerate() {
                        if i > 0 {
                            self.output.push_str(", ");
                        }
                        self.emit_pattern(&declarator.id);
                        if let Some(ref init_expr) = declarator.init {
                            self.output.push_str(" = ");
                            self.emit_expression(init_expr);
                        }
                    }
                }
                JsForInit::Expression(expr) => self.emit_expression(expr),
            }
        }
        self.output.push(';');
        if let Some(ref test) = for_stmt.test {
            self.output.push(' ');
            self.emit_expression(test);
        }
        self.output.push(';');
        if let Some(ref update) = for_stmt.update {
            self.output.push(' ');
            self.emit_expression(update);
        }
        self.output.push_str(") ");
        self.emit_statement_as_block(&for_stmt.body);
    }

    fn emit_for_of_statement(&mut self, for_of: &JsForOfStatement) {
        self.output.push_str("for ");
        if for_of.is_await {
            self.output.push_str("await ");
        }
        self.output.push('(');
        match &for_of.left {
            JsForOfLeft::Variable(decl) => {
                self.output.push_str(&decl.kind.to_string());
                self.output.push(' ');
                if let Some(declarator) = decl.declarations.first() {
                    self.emit_pattern(&declarator.id);
                }
            }
            JsForOfLeft::Pattern(pattern) => self.emit_pattern(pattern),
        }
        self.output.push_str(" of ");
        self.emit_expression(&for_of.right);
        self.output.push_str(") ");
        self.emit_statement_as_block(&for_of.body);
    }

    fn emit_while_statement(&mut self, while_stmt: &JsWhileStatement) {
        self.output.push_str("while (");
        self.emit_expression(&while_stmt.test);
        self.output.push_str(") ");
        self.emit_statement_as_block(&while_stmt.body);
    }

    fn emit_do_while_statement(&mut self, do_while: &JsDoWhileStatement) {
        self.output.push_str("do ");
        self.emit_statement_as_block(&do_while.body);
        self.output.push_str(" while (");
        self.emit_expression(&do_while.test);
        self.output.push(')');
        self.needs_semicolon = true;
    }

    fn emit_block_statement(&mut self, block: &JsBlockStatement) {
        self.output.push('{');
        self.newline();
        self.indent_level += 1;
        for stmt in &block.body {
            self.emit_statement(stmt);
        }
        self.indent_level -= 1;
        self.indent();
        self.output.push('}');
    }

    fn emit_block_inline(&mut self, block: &JsBlockStatement) {
        self.output.push('{');
        if !block.body.is_empty() {
            self.newline();
            self.indent_level += 1;
            for stmt in &block.body {
                self.emit_statement(stmt);
            }
            self.indent_level -= 1;
            self.indent();
        }
        self.output.push('}');
    }

    fn emit_statement_as_block(&mut self, stmt: &JsStatement) {
        match stmt {
            JsStatement::Block(block) => self.emit_block_inline(block),
            _ => {
                self.output.push('{');
                self.newline();
                self.indent_level += 1;
                self.emit_statement(stmt);
                self.indent_level -= 1;
                self.indent();
                self.output.push('}');
            }
        }
    }

    fn emit_try_statement(&mut self, try_stmt: &JsTryStatement) {
        self.output.push_str("try ");
        self.emit_block_inline(&try_stmt.block);

        if let Some(ref handler) = try_stmt.handler {
            self.output.push_str(" catch");
            if let Some(ref param) = handler.param {
                self.output.push_str(" (");
                self.emit_pattern(param);
                self.output.push(')');
            }
            self.output.push(' ');
            self.emit_block_inline(&handler.body);
        }

        if let Some(ref finalizer) = try_stmt.finalizer {
            self.output.push_str(" finally ");
            self.emit_block_inline(finalizer);
        }
    }

    fn emit_expression(&mut self, expr: &JsExpr) {
        match expr {
            JsExpr::Identifier(name) => self.output.push_str(name),
            JsExpr::Literal(lit) => self.emit_literal(lit),
            JsExpr::TemplateLiteral(template) => self.emit_template_literal(template),
            JsExpr::Array(arr) => self.emit_array_expression(arr),
            JsExpr::Object(obj) => self.emit_object_expression(obj),
            JsExpr::Function(func) => self.emit_function_expression(func),
            JsExpr::Arrow(arrow) => self.emit_arrow_function(arrow),
            JsExpr::Call(call) => self.emit_call_expression(call),
            JsExpr::New(new_expr) => self.emit_new_expression(new_expr),
            JsExpr::Member(member) => self.emit_member_expression(member),
            JsExpr::Binary(binary) => self.emit_binary_expression(binary),
            JsExpr::Logical(logical) => self.emit_logical_expression(logical),
            JsExpr::Unary(unary) => self.emit_unary_expression(unary),
            JsExpr::Update(update) => self.emit_update_expression(update),
            JsExpr::Assignment(assignment) => self.emit_assignment_expression(assignment),
            JsExpr::Conditional(cond) => self.emit_conditional_expression(cond),
            JsExpr::Sequence(seq) => self.emit_sequence_expression(seq),
            JsExpr::Spread(inner) => {
                self.output.push_str("...");
                self.emit_expression(inner);
            }
            JsExpr::This => self.output.push_str("this"),
            JsExpr::Await(inner) => {
                self.output.push_str("await ");
                self.emit_expression(inner);
            }
            JsExpr::Yield(yield_expr) => {
                self.output.push_str("yield");
                if yield_expr.delegate {
                    self.output.push('*');
                }
                if let Some(ref arg) = yield_expr.argument {
                    self.output.push(' ');
                    self.emit_expression(arg);
                }
            }
            JsExpr::Class(class) => self.emit_class_expression(class),
            JsExpr::Chain(chain) => self.emit_expression(&chain.expression),
            JsExpr::Void(inner) => {
                self.output.push_str("void ");
                self.emit_expression(inner);
            }
            JsExpr::Raw(code) => {
                // Emit raw JavaScript code as-is
                self.output.push_str(code);
            }
        }
    }

    fn emit_literal(&mut self, lit: &JsLiteral) {
        match lit {
            JsLiteral::String(s) => {
                self.output.push('"');
                self.output.push_str(&escape_string(s));
                self.output.push('"');
            }
            JsLiteral::Number(n) => {
                let _ = write!(self.output, "{}", n);
            }
            JsLiteral::Boolean(b) => {
                self.output.push_str(if *b { "true" } else { "false" });
            }
            JsLiteral::Null => self.output.push_str("null"),
            JsLiteral::Undefined => self.output.push_str("undefined"),
            JsLiteral::Regex { pattern, flags } => {
                let _ = write!(self.output, "/{}/{}", pattern, flags);
            }
        }
    }

    fn emit_template_literal(&mut self, template: &JsTemplateLiteral) {
        self.output.push('`');
        for (i, quasi) in template.quasis.iter().enumerate() {
            self.output.push_str(&quasi.raw);
            if i < template.expressions.len() {
                self.output.push_str("${");
                self.emit_expression(&template.expressions[i]);
                self.output.push('}');
            }
        }
        self.output.push('`');
    }

    fn emit_array_expression(&mut self, arr: &JsArrayExpression) {
        self.output.push('[');
        for (i, elem) in arr.elements.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            if let Some(e) = elem {
                self.emit_expression(e);
            }
        }
        self.output.push(']');
    }

    fn emit_object_expression(&mut self, obj: &JsObjectExpression) {
        if obj.properties.is_empty() {
            self.output.push_str("{}");
            return;
        }

        self.output.push_str("{ ");
        for (i, member) in obj.properties.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_object_member(member);
        }
        self.output.push_str(" }");
    }

    fn emit_object_member(&mut self, member: &JsObjectMember) {
        match member {
            JsObjectMember::Property(prop) => {
                if prop.shorthand
                    && let JsPropertyKey::Identifier(name) = &prop.key
                {
                    self.output.push_str(name);
                    return;
                }

                match prop.kind {
                    JsPropertyKind::Get => self.output.push_str("get "),
                    JsPropertyKind::Set => self.output.push_str("set "),
                    JsPropertyKind::Init => {}
                }

                if prop.computed {
                    self.output.push('[');
                }
                self.emit_property_key(&prop.key);
                if prop.computed {
                    self.output.push(']');
                }

                match prop.kind {
                    JsPropertyKind::Get | JsPropertyKind::Set => {
                        if let JsExpr::Function(func) = prop.value.as_ref() {
                            self.output.push('(');
                            self.emit_params(&func.params);
                            self.output.push_str(") ");
                            self.emit_block_inline(&func.body);
                        }
                    }
                    JsPropertyKind::Init => {
                        self.output.push_str(": ");
                        self.emit_expression(&prop.value);
                    }
                }
            }
            JsObjectMember::SpreadElement(expr) => {
                self.output.push_str("...");
                self.emit_expression(expr);
            }
        }
    }

    fn emit_property_key(&mut self, key: &JsPropertyKey) {
        match key {
            JsPropertyKey::Identifier(name) => self.output.push_str(name),
            JsPropertyKey::Literal(lit) => self.emit_literal(lit),
            JsPropertyKey::Computed(expr) => self.emit_expression(expr),
        }
    }

    fn emit_function_expression(&mut self, func: &JsFunctionExpression) {
        if func.is_async {
            self.output.push_str("async ");
        }
        self.output.push_str("function");
        if func.is_generator {
            self.output.push('*');
        }
        if let Some(ref id) = func.id {
            self.output.push(' ');
            self.output.push_str(id);
        }
        self.output.push('(');
        self.emit_params(&func.params);
        self.output.push_str(") ");
        self.emit_block_inline(&func.body);
    }

    fn emit_arrow_function(&mut self, arrow: &JsArrowFunction) {
        if arrow.is_async {
            self.output.push_str("async ");
        }

        if arrow.params.len() == 1 && matches!(&arrow.params[0], JsPattern::Identifier(_)) {
            self.emit_pattern(&arrow.params[0]);
        } else {
            self.output.push('(');
            self.emit_params(&arrow.params);
            self.output.push(')');
        }

        self.output.push_str(" => ");

        match &arrow.body {
            JsArrowBody::Expression(expr) => {
                // Wrap object literals in parentheses
                if matches!(expr.as_ref(), JsExpr::Object(_)) {
                    self.output.push('(');
                    self.emit_expression(expr);
                    self.output.push(')');
                } else {
                    self.emit_expression(expr);
                }
            }
            JsArrowBody::Block(block) => self.emit_block_inline(block),
        }
    }

    fn emit_call_expression(&mut self, call: &JsCallExpression) {
        let needs_parens = matches!(call.callee.as_ref(), JsExpr::Arrow(_) | JsExpr::Function(_));
        if needs_parens {
            self.output.push('(');
        }
        self.emit_expression(&call.callee);
        if needs_parens {
            self.output.push(')');
        }
        if call.optional {
            self.output.push_str("?.");
        }
        self.output.push('(');
        for (i, arg) in call.arguments.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_expression(arg);
        }
        self.output.push(')');
    }

    fn emit_new_expression(&mut self, new_expr: &JsNewExpression) {
        self.output.push_str("new ");
        self.emit_expression(&new_expr.callee);
        self.output.push('(');
        for (i, arg) in new_expr.arguments.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_expression(arg);
        }
        self.output.push(')');
    }

    fn emit_member_expression(&mut self, member: &JsMemberExpression) {
        let needs_parens = matches!(
            member.object.as_ref(),
            JsExpr::Literal(JsLiteral::Number(_))
        );
        if needs_parens {
            self.output.push('(');
        }
        self.emit_expression(&member.object);
        if needs_parens {
            self.output.push(')');
        }

        if member.optional {
            self.output.push_str("?.");
        }

        if member.computed {
            self.output.push('[');
            match &member.property {
                JsMemberProperty::Expression(expr) => self.emit_expression(expr),
                JsMemberProperty::Identifier(name) => {
                    self.output.push('"');
                    self.output.push_str(name);
                    self.output.push('"');
                }
                JsMemberProperty::PrivateIdentifier(name) => {
                    self.output.push('#');
                    self.output.push_str(name);
                }
            }
            self.output.push(']');
        } else {
            if !member.optional {
                self.output.push('.');
            }
            match &member.property {
                JsMemberProperty::Identifier(name) => self.output.push_str(name),
                JsMemberProperty::PrivateIdentifier(name) => {
                    self.output.push('#');
                    self.output.push_str(name);
                }
                JsMemberProperty::Expression(expr) => self.emit_expression(expr),
            }
        }
    }

    fn emit_binary_expression(&mut self, binary: &JsBinaryExpression) {
        self.emit_expression_with_parens(&binary.left, Some(&binary.operator));
        let _ = write!(self.output, " {} ", binary.operator);
        self.emit_expression_with_parens(&binary.right, Some(&binary.operator));
    }

    fn emit_logical_expression(&mut self, logical: &JsLogicalExpression) {
        self.emit_expression(&logical.left);
        let _ = write!(self.output, " {} ", logical.operator);
        self.emit_expression(&logical.right);
    }

    fn emit_unary_expression(&mut self, unary: &JsUnaryExpression) {
        let op_str = unary.operator.to_string();
        if unary.prefix {
            self.output.push_str(&op_str);
            if matches!(
                unary.operator,
                JsUnaryOp::TypeOf | JsUnaryOp::Void | JsUnaryOp::Delete
            ) {
                self.output.push(' ');
            }
            self.emit_expression(&unary.argument);
        } else {
            self.emit_expression(&unary.argument);
            self.output.push_str(&op_str);
        }
    }

    fn emit_update_expression(&mut self, update: &JsUpdateExpression) {
        if update.prefix {
            self.output.push_str(&update.operator.to_string());
            self.emit_expression(&update.argument);
        } else {
            self.emit_expression(&update.argument);
            self.output.push_str(&update.operator.to_string());
        }
    }

    fn emit_assignment_expression(&mut self, assignment: &JsAssignmentExpression) {
        self.emit_expression(&assignment.left);
        let _ = write!(self.output, " {} ", assignment.operator);
        self.emit_expression(&assignment.right);
    }

    fn emit_conditional_expression(&mut self, cond: &JsConditionalExpression) {
        self.emit_expression(&cond.test);
        self.output.push_str(" ? ");
        self.emit_expression(&cond.consequent);
        self.output.push_str(" : ");
        self.emit_expression(&cond.alternate);
    }

    fn emit_sequence_expression(&mut self, seq: &JsSequenceExpression) {
        self.output.push('(');
        for (i, expr) in seq.expressions.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_expression(expr);
        }
        self.output.push(')');
    }

    fn emit_class_expression(&mut self, class: &JsClassExpression) {
        self.output.push_str("class");
        if let Some(ref id) = class.id {
            self.output.push(' ');
            self.output.push_str(id);
        }
        if let Some(ref super_class) = class.super_class {
            self.output.push_str(" extends ");
            self.emit_expression(super_class);
        }
        self.output.push_str(" {");
        // TODO: emit class body
        self.output.push('}');
    }

    fn emit_expression_with_parens(&mut self, expr: &JsExpr, _parent_op: Option<&JsBinaryOp>) {
        let needs_parens = matches!(
            expr,
            JsExpr::Binary(_) | JsExpr::Conditional(_) | JsExpr::Assignment(_)
        );
        if needs_parens {
            self.output.push('(');
        }
        self.emit_expression(expr);
        if needs_parens {
            self.output.push(')');
        }
    }

    fn emit_params(&mut self, params: &[JsPattern]) {
        for (i, param) in params.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_pattern(param);
        }
    }

    fn emit_pattern(&mut self, pattern: &JsPattern) {
        match pattern {
            JsPattern::Identifier(name) => self.output.push_str(name),
            JsPattern::Array(arr) => {
                self.output.push('[');
                for (i, elem) in arr.elements.iter().enumerate() {
                    if i > 0 {
                        self.output.push_str(", ");
                    }
                    if let Some(p) = elem {
                        self.emit_pattern(p);
                    }
                }
                self.output.push(']');
            }
            JsPattern::Object(obj) => {
                self.output.push_str("{ ");
                for (i, prop) in obj.properties.iter().enumerate() {
                    if i > 0 {
                        self.output.push_str(", ");
                    }
                    match prop {
                        JsObjectPatternProperty::Property {
                            key,
                            value,
                            shorthand,
                            computed,
                        } => {
                            if *shorthand {
                                self.emit_pattern(value);
                            } else {
                                if *computed {
                                    self.output.push('[');
                                }
                                self.emit_property_key(key);
                                if *computed {
                                    self.output.push(']');
                                }
                                self.output.push_str(": ");
                                self.emit_pattern(value);
                            }
                        }
                        JsObjectPatternProperty::Rest(p) => {
                            self.output.push_str("...");
                            self.emit_pattern(p);
                        }
                    }
                }
                self.output.push_str(" }");
            }
            JsPattern::Rest(inner) => {
                self.output.push_str("...");
                self.emit_pattern(inner);
            }
            JsPattern::Assignment(assign) => {
                self.emit_pattern(&assign.left);
                self.output.push_str(" = ");
                self.emit_expression(&assign.right);
            }
        }
    }
}

/// Escape special characters in a string literal.
fn escape_string(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '"' => result.push_str("\\\""),
            '\\' => result.push_str("\\\\"),
            '\n' => result.push_str("\\n"),
            '\r' => result.push_str("\\r"),
            '\t' => result.push_str("\\t"),
            _ => result.push(c),
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::phases::phase3_transform::js_ast::builders::*;

    #[test]
    fn test_simple_program() {
        let prog = program(vec![
            import_namespace("$", "svelte/internal/client"),
            var_decl("root", Some(svelte_from_html("<h1>Hello</h1>", None))),
            export_default_function(
                "Test",
                vec![id_pattern("$$anchor")],
                vec![
                    var_decl("h1", Some(call(id("root"), vec![]))),
                    stmt(svelte_append(id("$$anchor"), id("h1"))),
                ],
            ),
        ]);

        let code = generate(&prog).unwrap();
        println!("{}", code);
        assert!(code.contains("import * as $ from"));
        assert!(code.contains("$.from_html"));
        assert!(code.contains("export default function Test"));
    }

    #[test]
    fn test_arrow_function() {
        let prog = program(vec![const_decl(
            "add",
            arrow(
                vec![id_pattern("a"), id_pattern("b")],
                binary(JsBinaryOp::Add, id("a"), id("b")),
            ),
        )]);

        let code = generate(&prog).unwrap();
        println!("{}", code);
        assert!(code.contains("const add = (a, b) => a + b"));
    }

    #[test]
    fn test_template_literal() {
        let prog = program(vec![const_decl(
            "msg",
            template(
                vec![quasi("Hello, ", false), quasi("!", true)],
                vec![id("name")],
            ),
        )]);

        let code = generate(&prog).unwrap();
        println!("{}", code);
        assert!(code.contains("`Hello, ${name}!`"));
    }

    #[test]
    fn test_apostrophe_escaping() {
        // Test that apostrophes are properly escaped when using single quotes
        let prog = program(vec![const_decl("msg", string("I don't need this"))]);

        let code = generate(&prog).unwrap();
        println!("Generated code: {}", code);
        // oxc codegen with single_quote: true should escape apostrophes
        // Either it uses double quotes OR escapes the apostrophe
        assert!(
            code.contains(r#"'I don\'t need this'"#) || code.contains(r#""I don't need this""#),
            "Apostrophe should be escaped or double quotes should be used: {}",
            code
        );
    }
}
