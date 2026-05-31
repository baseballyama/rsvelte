//! JavaScript code generation from AST nodes.
//!
//! This module converts our AST representation to JavaScript source code.

use super::arena::JsArena;
use super::nodes::*;
use std::fmt::Write;

/// A raw source span recorded during codegen: (output_byte_offset, source_start, source_end).
/// output_byte_offset is the position in the generated output string.
/// source_start/source_end are byte offsets in the original source.
#[derive(Debug, Clone)]
pub struct RawSpan {
    pub output_offset: usize,
    pub source_start: u32,
    pub source_end: u32,
}

/// A single source mapping entry (generated -> original).
#[derive(Debug, Clone)]
pub struct SourceMapping {
    /// Generated line (0-indexed)
    pub gen_line: u32,
    /// Generated column (0-indexed)
    pub gen_col: u32,
    /// Source index (always 0 for single-source)
    pub source: u32,
    /// Original line (0-indexed)
    pub orig_line: u32,
    /// Original column (0-indexed)
    pub orig_col: u32,
    /// Optional name index (into the names array)
    pub name: Option<u32>,
}

/// Result of code generation with source map.
pub struct CodegenResult {
    /// The generated JavaScript code
    pub code: String,
    /// Source mappings collected during codegen
    pub mappings: Vec<SourceMapping>,
}

/// Generate JavaScript source code from a program AST.
pub fn generate(program: &JsProgram, arena: &JsArena) -> Result<String, String> {
    let mut codegen = JsCodegen::new(arena);
    codegen.emit_program(program);
    // Trim trailing newline to match esrap behavior (Svelte's codegen)
    // Truncate in-place to avoid allocating a new String.
    let trimmed_len = codegen.output.trim_end_matches('\n').len();
    codegen.output.truncate(trimmed_len);
    Ok(codegen.output)
}

/// Generate JavaScript source code from a program AST, with source map data.
pub fn generate_with_sourcemap(
    program: &JsProgram,
    source: &str,
    arena: &JsArena,
) -> Result<CodegenResult, String> {
    let mut codegen = JsCodegen::new(arena);
    codegen.track_mappings = true;
    codegen.source_code = Some(source);
    codegen.emit_program(program);

    // Convert raw spans to source mappings
    let mappings = codegen.compute_mappings();

    // Trim trailing newline to match esrap behavior (Svelte's codegen)
    // Truncate in-place to avoid allocating a new String.
    let trimmed_len = codegen.output.trim_end_matches('\n').len();
    codegen.output.truncate(trimmed_len);

    Ok(CodegenResult {
        code: codegen.output,
        mappings,
    })
}

/// Generate JavaScript source code for a list of statements at a given indent level.
///
/// This is used by the SSR bridge to convert `Vec<JsStatement>` (produced by
/// `build_template`) into a string that can be embedded in the component function body.
pub fn generate_stmts(
    stmts: &[super::nodes::JsStatement],
    arena: &JsArena,
    indent_level: usize,
) -> String {
    let mut codegen = JsCodegen {
        output: String::with_capacity(1024),
        indent_level,
        needs_semicolon: false,
        track_mappings: false,
        raw_spans: Vec::new(),
        source_code: None,
        arena,
    };
    codegen.emit_body(stmts);
    codegen.output
}

/// Generate JavaScript source code for a single expression.
/// Uses a smaller buffer than full program generation since expressions are typically short.
pub fn generate_expr(expr: &super::nodes::JsExpr, arena: &JsArena) -> String {
    let mut codegen = JsCodegen {
        output: String::with_capacity(128),
        indent_level: 0,
        needs_semicolon: false,
        track_mappings: false,
        raw_spans: Vec::new(),
        source_code: None,
        arena,
    };
    codegen.emit_expression(expr);
    codegen.output
}

/// JavaScript code generator.
struct JsCodegen<'a> {
    output: String,
    indent_level: usize,
    needs_semicolon: bool,
    /// Whether to track source mappings
    track_mappings: bool,
    /// Raw spans collected during codegen
    raw_spans: Vec<RawSpan>,
    /// Original source code (needed for byte offset -> line/col conversion)
    source_code: Option<&'a str>,
    /// Arena containing all expressions and statements
    arena: &'a JsArena,
}

impl<'a> JsCodegen<'a> {
    fn new(arena: &'a JsArena) -> Self {
        Self {
            output: String::with_capacity(4096),
            indent_level: 0,
            needs_semicolon: false,
            track_mappings: false,
            raw_spans: Vec::new(),
            source_code: None,
            arena,
        }
    }

    /// Record the start of a spanned expression in the output.
    #[inline]
    fn record_span_start(&mut self, source_start: u32, source_end: u32) {
        if self.track_mappings {
            self.raw_spans.push(RawSpan {
                output_offset: self.output.len(),
                source_start,
                source_end,
            });
        }
    }

    /// Convert raw spans to line/column-based source mappings.
    fn compute_mappings(&self) -> Vec<SourceMapping> {
        let source_code = match self.source_code {
            Some(s) => s,
            None => return Vec::new(),
        };
        if self.raw_spans.is_empty() {
            return Vec::new();
        }

        let output_line_starts = build_line_starts(&self.output);
        let source_line_starts = build_line_starts(source_code);

        let mut mappings = Vec::with_capacity(self.raw_spans.len());

        for span in &self.raw_spans {
            let (gen_line, gen_col) = offset_to_line_col(&output_line_starts, span.output_offset);
            let (orig_line, orig_col) =
                offset_to_line_col(&source_line_starts, span.source_start as usize);

            mappings.push(SourceMapping {
                gen_line: gen_line as u32,
                gen_col: gen_col as u32,
                source: 0,
                orig_line: orig_line as u32,
                orig_col: orig_col as u32,
                name: None,
            });
        }

        // Sort by generated position
        mappings.sort_by(|a, b| a.gen_line.cmp(&b.gen_line).then(a.gen_col.cmp(&b.gen_col)));

        // Deduplicate: keep only the first mapping at each gen_line/gen_col
        mappings.dedup_by(|a, b| a.gen_line == b.gen_line && a.gen_col == b.gen_col);

        mappings
    }

    /// Pre-computed indentation strings for common indent levels (0..16).
    /// Avoids per-character push loop for the most common cases.
    const INDENT_CACHE: [&'static str; 17] = [
        "",
        "\t",
        "\t\t",
        "\t\t\t",
        "\t\t\t\t",
        "\t\t\t\t\t",
        "\t\t\t\t\t\t",
        "\t\t\t\t\t\t\t",
        "\t\t\t\t\t\t\t\t",
        "\t\t\t\t\t\t\t\t\t",
        "\t\t\t\t\t\t\t\t\t\t",
        "\t\t\t\t\t\t\t\t\t\t\t",
        "\t\t\t\t\t\t\t\t\t\t\t\t",
        "\t\t\t\t\t\t\t\t\t\t\t\t\t",
        "\t\t\t\t\t\t\t\t\t\t\t\t\t\t",
        "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t",
        "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t",
    ];

    #[inline]
    fn indent(&mut self) {
        if self.indent_level < Self::INDENT_CACHE.len() {
            self.output.push_str(Self::INDENT_CACHE[self.indent_level]);
        } else {
            for _ in 0..self.indent_level {
                self.output.push('\t');
            }
        }
    }

    #[inline]
    fn newline(&mut self) {
        self.output.push('\n');
    }

    fn emit_program(&mut self, program: &JsProgram) {
        self.emit_body(&program.body);
    }

    /// Emit a sequence of statements with esrap-style blank line separation.
    /// A blank line is inserted between consecutive statements when:
    /// - The statement types differ, OR
    /// - Either the previous or current statement is multiline
    fn emit_body(&mut self, stmts: &[JsStatement]) {
        let mut prev_type: Option<&str> = None;
        let mut prev_multiline = false;

        for stmt in stmts {
            let current_type = stmt_type_name(stmt);

            if let Some(pt) = prev_type
                && current_type != "Comment"
                && pt != "Comment"
            {
                let current_multiline = self.pre_render_stmt_is_multiline(stmt);
                if current_multiline || prev_multiline || current_type != pt {
                    self.newline();
                }
            }

            let start_pos = self.output.len();
            self.emit_statement(stmt);

            // Check if the rendered statement was multiline.
            // For Raw statements that contain multiple sub-statements (e.g., user code),
            // we check multiline status of only the LAST logical line, since that's what
            // will be adjacent to the next statement.
            let rendered = &self.output[start_pos..];
            if matches!(stmt, JsStatement::Raw(_) | JsStatement::RawMapped { .. }) {
                // For Raw blocks, check if the last logical statement is multiline.
                // Find the last non-empty line (excluding trailing newline).
                let trimmed_end = rendered.trim_end_matches('\n');
                if let Some(last_newline) = trimmed_end.rfind('\n') {
                    let last_line = &trimmed_end[last_newline + 1..];
                    let last_trimmed = last_line.trim();
                    // If the last line is a closing brace, the preceding statement
                    // was multiline (it opened a block that spans multiple lines).
                    prev_multiline = last_trimmed.starts_with('}');
                    prev_type = Some(raw_stmt_type_name(last_line));
                } else {
                    prev_multiline = has_multiple_newlines(rendered.as_bytes());
                    prev_type = Some(current_type);
                }
            } else {
                // A statement is multiline if it contains a newline before the final newline.
                // Use memchr for fast newline search: find 2nd newline to confirm >1.
                prev_multiline = has_multiple_newlines(rendered.as_bytes());
                prev_type = Some(current_type);
            }
        }
    }

    #[inline]
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
                self.emit_expression(self.arena.get_expr(expr_stmt.expression));
                self.needs_semicolon = true;
            }
            JsStatement::Return(ret) => {
                self.output.push_str("return");
                if let Some(arg_id) = ret.argument {
                    self.output.push(' ');
                    self.emit_expression(self.arena.get_expr(arg_id));
                }
                self.needs_semicolon = true;
            }
            JsStatement::If(if_stmt) => self.emit_if_statement(if_stmt),
            JsStatement::For(for_stmt) => self.emit_for_statement(for_stmt),
            JsStatement::ForOf(for_of) => self.emit_for_of_statement(for_of),
            JsStatement::While(while_stmt) => self.emit_while_statement(while_stmt),
            JsStatement::DoWhile(do_while) => self.emit_do_while_statement(do_while),
            JsStatement::Switch(sw) => self.emit_switch_statement(sw),
            JsStatement::Block(block) => self.emit_block_statement(block),
            JsStatement::Empty => self.needs_semicolon = true,
            JsStatement::Debugger => {
                self.output.push_str("debugger");
                self.needs_semicolon = true;
            }
            JsStatement::Labeled(labeled) => {
                self.output.push_str(&labeled.label);
                self.output.push_str(": ");
                self.emit_statement_inner(self.arena.get_stmt(labeled.body));
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
            JsStatement::Throw(expr_id) => {
                self.output.push_str("throw ");
                self.emit_expression(self.arena.get_expr(*expr_id));
                self.needs_semicolon = true;
            }
            JsStatement::Try(try_stmt) => self.emit_try_statement(try_stmt),
            JsStatement::Raw(code) => {
                // Output raw JavaScript code verbatim
                self.output.push_str(code);
                self.needs_semicolon = false; // Raw code handles its own semicolons
            }
            JsStatement::RawMapped {
                code,
                source_offset,
            } => {
                // Output raw JavaScript code with per-line source mappings.
                // Each line of the raw code maps to the corresponding position
                // in the original source, offset by `source_offset`.
                self.emit_raw_mapped(code, *source_offset);
                self.needs_semicolon = false;
            }
        }
    }

    /// Emit raw JavaScript code with token-level source mappings.
    ///
    /// For script content, the `source_offset` is the byte offset in the original
    /// `.svelte` source where the script content begins. We tokenize the output
    /// and match each token to its position in the original source, creating
    /// precise source map entries.
    fn emit_raw_mapped(&mut self, code: &str, source_offset: u32) {
        if !self.track_mappings {
            self.output.push_str(code);
            return;
        }

        let source_code = match self.source_code {
            Some(s) => s,
            None => {
                self.output.push_str(code);
                return;
            }
        };

        // Extract tokens from the output code. A "token" is a contiguous sequence
        // of identifier characters (a-zA-Z0-9_$) or a single non-whitespace
        // punctuation character.
        let tokens = extract_tokens(code);

        // Match tokens to positions in the original source.
        // Since the code was only reformatted (not semantically changed),
        // tokens appear in the same order in both the output and the source.
        let mut source_scan = source_offset as usize;
        let mut token_mappings: Vec<(usize, u32, usize)> = Vec::new(); // (output_byte_offset, source_byte_offset, token_len)

        for token in &tokens {
            if source_scan >= source_code.len() {
                break;
            }

            // Search for this token in the original source
            let remaining = &source_code[source_scan..];
            if let Some(pos) = remaining.find(token.text) {
                // Only accept if within reasonable range
                if pos < 5000 {
                    let abs_pos = source_scan + pos;
                    token_mappings.push((token.output_offset, abs_pos as u32, token.text.len()));
                    source_scan = abs_pos + token.text.len();
                }
            }
        }

        // Now emit the code and record the mappings at the correct output positions.
        // Since emit_raw_mapped is called from emit_statement_inner (which is called
        // after indent()), the output already has the line's indent. We need to adjust
        // the token offsets by the current output position.
        let output_base = self.output.len();
        self.output.push_str(code);

        // Record the mappings
        for (token_offset, source_pos, token_len) in token_mappings {
            // Record start of token
            self.raw_spans.push(RawSpan {
                output_offset: output_base + token_offset,
                source_start: source_pos,
                source_end: source_pos + token_len as u32,
            });
            // Record end of token (needed for tests that check end position)
            self.raw_spans.push(RawSpan {
                output_offset: output_base + token_offset + token_len,
                source_start: source_pos + token_len as u32,
                source_end: source_pos + token_len as u32,
            });
        }
    }

    fn emit_import(&mut self, import: &JsImportDeclaration) {
        self.output.push_str("import ");

        let has_specifiers = !import.specifiers.is_empty()
            && !matches!(import.specifiers[0], JsImportSpecifier::SideEffect);

        if has_specifiers {
            let mut has_default = false;
            // Use references instead of cloning strings
            let mut named: Vec<(&str, &str)> = Vec::new();
            let mut namespace: Option<&str> = None;

            for spec in &import.specifiers {
                match spec {
                    JsImportSpecifier::Default(name) => {
                        has_default = true;
                        self.output.push_str(name);
                    }
                    JsImportSpecifier::Namespace(name) => {
                        namespace = Some(name.as_str());
                    }
                    JsImportSpecifier::Named { imported, local } => {
                        named.push((imported.as_str(), local.as_str()));
                    }
                    JsImportSpecifier::SideEffect => {}
                }
            }

            if has_default && (namespace.is_some() || !named.is_empty()) {
                self.output.push_str(", ");
            }

            if let Some(ns) = namespace {
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
                        self.output.push_str(imported);
                        self.output.push_str(" as ");
                        self.output.push_str(local);
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
            JsExportDefaultDeclaration::Expression(expr_id) => {
                self.emit_expression(self.arena.get_expr(*expr_id));
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
                    self.output.push_str(&spec.local);
                    self.output.push_str(" as ");
                    self.output.push_str(&spec.exported);
                }
            }
            self.output.push_str(" }");
            self.needs_semicolon = true;
        }
    }

    fn emit_variable_declaration(&mut self, decl: &JsVariableDeclaration) {
        self.output.push_str(decl.kind.as_str());
        self.output.push(' ');

        for (i, declarator) in decl.declarations.iter().enumerate() {
            if i > 0 {
                self.output.push_str(", ");
            }
            self.emit_pattern(&declarator.id);
            if let Some(init_id) = declarator.init {
                self.output.push_str(" = ");
                self.emit_expression(self.arena.get_expr(init_id));
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
        self.emit_expression(self.arena.get_expr(if_stmt.test));
        self.output.push_str(") ");
        self.emit_if_branch(self.arena.get_stmt(if_stmt.consequent));

        if let Some(alt_id) = if_stmt.alternate {
            self.output.push(' ');
            self.output.push_str("else ");
            self.emit_if_branch(self.arena.get_stmt(alt_id));
        }
    }

    /// Emit an if branch (consequent or alternate).
    /// Like esrap, we just visit the node directly:
    /// - BlockStatement -> `{ ... }`
    /// - IfStatement -> `if (...) ...` (for else-if chains)
    /// - Other -> inline statement (e.g. `expr;`)
    fn emit_if_branch(&mut self, stmt: &JsStatement) {
        match stmt {
            JsStatement::Block(block) => self.emit_block_inline(block),
            JsStatement::If(nested_if) => self.emit_if_statement(nested_if),
            _ => {
                // Single statement without braces (like esrap)
                self.emit_statement_inner(stmt);
                if self.needs_semicolon {
                    self.output.push(';');
                    self.needs_semicolon = false;
                }
            }
        }
    }

    fn emit_for_statement(&mut self, for_stmt: &JsForStatement) {
        self.output.push_str("for (");
        if let Some(ref init) = for_stmt.init {
            match init {
                JsForInit::Variable(decl) => {
                    self.output.push_str(decl.kind.as_str());
                    self.output.push(' ');
                    for (i, declarator) in decl.declarations.iter().enumerate() {
                        if i > 0 {
                            self.output.push_str(", ");
                        }
                        self.emit_pattern(&declarator.id);
                        if let Some(init_id) = declarator.init {
                            self.output.push_str(" = ");
                            self.emit_expression(self.arena.get_expr(init_id));
                        }
                    }
                }
                JsForInit::Expression(expr_id) => {
                    self.emit_expression(self.arena.get_expr(*expr_id))
                }
            }
        }
        self.output.push(';');
        if let Some(test_id) = for_stmt.test {
            self.output.push(' ');
            self.emit_expression(self.arena.get_expr(test_id));
        }
        self.output.push(';');
        if let Some(update_id) = for_stmt.update {
            self.output.push(' ');
            self.emit_expression(self.arena.get_expr(update_id));
        }
        self.output.push_str(") ");
        self.emit_statement_as_block(self.arena.get_stmt(for_stmt.body));
    }

    fn emit_for_of_statement(&mut self, for_of: &JsForOfStatement) {
        self.output.push_str("for ");
        if for_of.is_await {
            self.output.push_str("await ");
        }
        self.output.push('(');
        match &for_of.left {
            JsForOfLeft::Variable(decl) => {
                self.output.push_str(decl.kind.as_str());
                self.output.push(' ');
                if let Some(declarator) = decl.declarations.first() {
                    self.emit_pattern(&declarator.id);
                }
            }
            JsForOfLeft::Pattern(pattern) => self.emit_pattern(pattern),
        }
        self.output
            .push_str(if for_of.is_for_in { " in " } else { " of " });
        self.emit_expression(self.arena.get_expr(for_of.right));
        self.output.push_str(") ");
        self.emit_statement_as_block(self.arena.get_stmt(for_of.body));
    }

    fn emit_while_statement(&mut self, while_stmt: &JsWhileStatement) {
        self.output.push_str("while (");
        self.emit_expression(self.arena.get_expr(while_stmt.test));
        self.output.push_str(") ");
        self.emit_statement_as_block(self.arena.get_stmt(while_stmt.body));
    }

    fn emit_do_while_statement(&mut self, do_while: &JsDoWhileStatement) {
        self.output.push_str("do ");
        self.emit_statement_as_block(self.arena.get_stmt(do_while.body));
        self.output.push_str(" while (");
        self.emit_expression(self.arena.get_expr(do_while.test));
        self.output.push(')');
        self.needs_semicolon = true;
    }

    fn emit_block_statement(&mut self, block: &JsBlockStatement) {
        self.output.push('{');
        self.newline();
        self.indent_level += 1;
        self.emit_body(&block.body);
        self.indent_level -= 1;
        self.indent();
        self.output.push('}');
    }

    fn emit_switch_statement(&mut self, sw: &JsSwitchStatement) {
        self.output.push_str("switch (");
        self.emit_expression(self.arena.get_expr(sw.discriminant));
        self.output.push_str(") {");
        // Cases sit one level in; their bodies a further level in. A `newline()`
        // before each case is a plain line break for the first case (after `{`)
        // and a blank-line separator for the rest (the previous non-empty case
        // body ends in a newline), matching esrap's blank line between cases.
        self.indent_level += 1;
        for case in &sw.cases {
            self.newline();
            self.indent();
            match &case.test {
                Some(test) => {
                    self.output.push_str("case ");
                    self.emit_expression(self.arena.get_expr(*test));
                    self.output.push(':');
                }
                None => self.output.push_str("default:"),
            }
            if !case.consequent.is_empty() {
                self.indent_level += 1;
                self.newline();
                // Emit each statement tightly (no inter-statement blank lines —
                // unlike `emit_body`, which adds them between differing top-level
                // statement types; esrap keeps a case body compact).
                for stmt in &case.consequent {
                    self.emit_statement(stmt);
                }
                self.indent_level -= 1;
            }
        }
        self.indent_level -= 1;
        // A non-empty final case body already ends in a newline; an empty final
        // case (or no cases) does not, so add one before the closing brace.
        if !self.output.ends_with('\n') {
            self.newline();
        }
        self.indent();
        self.output.push('}');
        self.needs_semicolon = false;
    }

    fn emit_block_inline(&mut self, block: &JsBlockStatement) {
        self.output.push('{');
        if !block.body.is_empty() {
            self.newline();
            self.indent_level += 1;
            self.emit_body(&block.body);
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

    #[inline]
    fn emit_expression(&mut self, expr: &JsExpr) {
        match expr {
            JsExpr::Identifier(name) => self.output.push_str(name),
            JsExpr::Literal(lit) => self.emit_literal(lit),
            JsExpr::TemplateLiteral(template) => self.emit_template_literal(template),
            JsExpr::TaggedTemplate(tagged) => self.emit_tagged_template(tagged),
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
            JsExpr::Spread(inner_id) => {
                self.output.push_str("...");
                self.emit_expression(self.arena.get_expr(*inner_id));
            }
            JsExpr::This => self.output.push_str("this"),
            JsExpr::Await(inner_id) => {
                self.output.push_str("await ");
                let arg = self.arena.get_expr(*inner_id);
                let needs_parens = Self::unary_operand_needs_parens(arg);
                if needs_parens {
                    self.output.push('(');
                }
                self.emit_expression(arg);
                if needs_parens {
                    self.output.push(')');
                }
            }
            JsExpr::Yield(yield_expr) => {
                self.output.push_str("yield");
                if yield_expr.delegate {
                    self.output.push('*');
                }
                if let Some(arg_id) = yield_expr.argument {
                    self.output.push(' ');
                    self.emit_expression(self.arena.get_expr(arg_id));
                }
            }
            JsExpr::Class(class) => self.emit_class_expression(class),
            JsExpr::Chain(chain) => self.emit_expression(self.arena.get_expr(chain.expression)),
            JsExpr::Void(inner_id) => {
                self.output.push_str("void ");
                let arg = self.arena.get_expr(*inner_id);
                let needs_parens = Self::unary_operand_needs_parens(arg);
                if needs_parens {
                    self.output.push('(');
                }
                self.emit_expression(arg);
                if needs_parens {
                    self.output.push(')');
                }
            }
            JsExpr::Raw(code) => {
                // Emit raw JavaScript code as-is
                self.output.push_str(code);
            }
            JsExpr::Spanned(inner_id, start, end) => {
                self.record_span_start(*start, *end);
                self.emit_expression(self.arena.get_expr(*inner_id));
            }
        }
    }

    #[inline]
    fn emit_literal(&mut self, lit: &JsLiteral) {
        match lit {
            JsLiteral::String(s) => {
                // Use single quotes for generated string literals.
                // This matches OXC's output format (single_quote: true) and
                // ensures that only user source code strings (which come through
                // Raw() statements with their original quotes) will have double quotes.
                self.output.push('\'');
                self.output.push_str(&escape_string_single(s));
                self.output.push('\'');
            }
            JsLiteral::Number(n) => {
                // Fast path for non-negative integer values: use itoa for
                // zero-allocation integer formatting. This covers the vast
                // majority of number literals in generated Svelte code
                // (indices, counts, etc.). We exclude negative zero (-0.0)
                // because it must render as "-0" in JS, and itoa would give "0".
                let i = *n as i64;
                if i >= 0 && *n == i as f64 && n.is_finite() {
                    let mut buf = itoa::Buffer::new();
                    self.output.push_str(buf.format(i));
                } else {
                    let _ = write!(self.output, "{}", n);
                }
            }
            JsLiteral::Boolean(b) => {
                self.output.push_str(if *b { "true" } else { "false" });
            }
            JsLiteral::Null => self.output.push_str("null"),
            JsLiteral::Undefined => self.output.push_str("undefined"),
            JsLiteral::Regex { pattern, flags } => {
                self.output.push('/');
                self.output.push_str(pattern);
                self.output.push('/');
                self.output.push_str(flags);
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

    fn emit_tagged_template(&mut self, tagged: &JsTaggedTemplate) {
        // The tag of a tagged template must be a member/call/primary expression.
        // Lower-precedence tags need parentheses, e.g. `(x => x)`tpl``.
        let tag = self.arena.get_expr(tagged.tag);
        let needs_parens = matches!(
            tag,
            JsExpr::Arrow(_)
                | JsExpr::Function(_)
                | JsExpr::Conditional(_)
                | JsExpr::Logical(_)
                | JsExpr::Binary(_)
                | JsExpr::Unary(_)
                | JsExpr::Assignment(_)
                | JsExpr::Sequence(_)
                | JsExpr::Await(_)
                | JsExpr::Yield(_)
                | JsExpr::Object(_)
                | JsExpr::Class(_)
        );
        if needs_parens {
            self.output.push('(');
        }
        self.emit_expression(tag);
        if needs_parens {
            self.output.push(')');
        }
        self.emit_template_literal(&tagged.quasi);
    }

    fn emit_array_expression(&mut self, arr: &JsArrayExpression) {
        self.output.push('[');
        // Build a stack-local SmallVec-style slice to avoid heap allocation for typical arrays.
        // Most arrays in generated Svelte code have <= 8 elements.
        let items: smallvec::SmallVec<[Option<&JsExpr>; 8]> =
            arr.elements.iter().map(|e| e.as_ref()).collect();
        self.emit_sequence_exprs(&items, false);
        self.output.push(']');
    }

    fn emit_object_expression(&mut self, obj: &JsObjectExpression) {
        self.output.push('{');
        if obj.properties.is_empty() {
            self.output.push('}');
            return;
        }

        // Use heuristic to detect likely-multiline objects without pre-rendering.
        // This avoids exponential blowup from pre-rendering deeply nested structures.
        let likely_multiline = obj.properties.len() > 3
            || obj
                .properties
                .iter()
                .any(|m| self.is_member_likely_multiline(m));

        if likely_multiline {
            // Render directly in multiline mode without pre-rendering
            self.indent_level += 1;
            self.newline();
            for (i, member) in obj.properties.iter().enumerate() {
                // Insert blank line between getter/setter members,
                // matching esrap's blank line behavior for object literals.
                if i > 0 {
                    let prev_is_gs = matches!(
                        &obj.properties[i - 1],
                        JsObjectMember::Property(p) if matches!(p.kind, JsPropertyKind::Get | JsPropertyKind::Set)
                    );
                    let curr_is_gs = matches!(
                        member,
                        JsObjectMember::Property(p) if matches!(p.kind, JsPropertyKind::Get | JsPropertyKind::Set)
                    );
                    if prev_is_gs || curr_is_gs {
                        self.newline();
                    }
                }
                self.indent();
                self.emit_object_member(member);
                if i < obj.properties.len() - 1 {
                    self.output.push(',');
                }
                self.newline();
            }
            self.indent_level -= 1;
            self.indent();
        } else {
            // Small, simple objects: use a single tmp codegen to measure length
            // and detect multiline, avoiding per-member String allocations.
            let mut tmp = self.tmp_codegen();
            let mut offsets: smallvec::SmallVec<[(usize, usize); 4]> =
                smallvec::SmallVec::with_capacity(obj.properties.len());
            for m in &obj.properties {
                let start = tmp.output.len();
                tmp.emit_object_member(m);
                offsets.push((start, tmp.output.len()));
            }

            let total_len: usize = offsets.iter().map(|(s, e)| e - s).sum::<usize>()
                + if offsets.len() > 1 {
                    (offsets.len() - 1) * 2
                } else {
                    0
                };

            let tmp_bytes = tmp.output.as_bytes();
            let any_multiline = offsets
                .iter()
                .any(|(s, e)| memchr::memchr(b'\n', &tmp_bytes[*s..*e]).is_some());
            let multiline = any_multiline || total_len > 60;

            if multiline {
                // Pre-render determined multiline despite heuristic saying otherwise.
                // Render directly in multiline mode.
                self.indent_level += 1;
                self.newline();
                for (i, member) in obj.properties.iter().enumerate() {
                    if i > 0 {
                        let prev_is_gs = matches!(
                            &obj.properties[i - 1],
                            JsObjectMember::Property(p) if matches!(p.kind, JsPropertyKind::Get | JsPropertyKind::Set)
                        );
                        let curr_is_gs = matches!(
                            member,
                            JsObjectMember::Property(p) if matches!(p.kind, JsPropertyKind::Get | JsPropertyKind::Set)
                        );
                        if prev_is_gs || curr_is_gs {
                            self.newline();
                        }
                    }
                    self.indent();
                    self.emit_object_member(member);
                    if i < obj.properties.len() - 1 {
                        self.output.push(',');
                    }
                    self.newline();
                }
                self.indent_level -= 1;
                self.indent();
            } else {
                self.output.push(' ');
                for (i, member) in obj.properties.iter().enumerate() {
                    if i > 0 {
                        self.output.push_str(", ");
                    }
                    self.emit_object_member(member);
                }
                self.output.push(' ');
            }
        }
        self.output.push('}');
    }

    fn emit_object_member(&mut self, member: &JsObjectMember) {
        match member {
            JsObjectMember::Property(prop) => {
                // Auto-detect shorthand: Init property where key identifier
                // matches value identifier (mirrors esrap/astring behavior).
                let auto_shorthand = !prop.computed
                    && matches!(prop.kind, JsPropertyKind::Init)
                    && matches!(
                        (&prop.key, self.arena.get_expr(prop.value)),
                        (JsPropertyKey::Identifier(k), JsExpr::Identifier(v)) if k == v
                    );

                if (prop.shorthand || auto_shorthand)
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

                // For method shorthand the `async`/`*` markers precede the key
                // (`async load()`, `*gen()`, `async *both()`). The key is emitted
                // just below, so these have to come first.
                let is_shorthand_method = prop.method
                    || (!prop.computed
                        && matches!(prop.kind, JsPropertyKind::Init)
                        && matches!(self.arena.get_expr(prop.value), JsExpr::Function(_)));
                if is_shorthand_method
                    && let JsExpr::Function(func) = self.arena.get_expr(prop.value)
                {
                    if func.is_async {
                        self.output.push_str("async ");
                    }
                    if func.is_generator {
                        self.output.push('*');
                    }
                }

                if prop.computed {
                    self.output.push('[');
                }
                self.emit_property_key(&prop.key);
                if prop.computed {
                    self.output.push(']');
                }

                // Auto-detect method shorthand: Init property with a non-arrow
                // FunctionExpression value is emitted as `name(params) { body }`,
                // mirroring esrap/astring. This applies for both explicit and
                // implicit method shorthand.
                let auto_method = !prop.computed
                    && matches!(prop.kind, JsPropertyKind::Init)
                    && matches!(self.arena.get_expr(prop.value), JsExpr::Function(_));

                // Method shorthand: name(params) { body }
                if prop.method || auto_method {
                    if let JsExpr::Function(func) = self.arena.get_expr(prop.value) {
                        self.output.push('(');
                        self.emit_params(&func.params);
                        self.output.push_str(") ");
                        self.emit_block_inline(&func.body);
                    } else {
                        // Fallback: emit as normal property
                        self.output.push_str(": ");
                        self.emit_expression(self.arena.get_expr(prop.value));
                    }
                } else {
                    match prop.kind {
                        JsPropertyKind::Get | JsPropertyKind::Set => {
                            if let JsExpr::Function(func) = self.arena.get_expr(prop.value) {
                                self.output.push('(');
                                self.emit_params(&func.params);
                                self.output.push_str(") ");
                                self.emit_block_inline(&func.body);
                            }
                        }
                        JsPropertyKind::Init => {
                            self.output.push_str(": ");
                            self.emit_expression(self.arena.get_expr(prop.value));
                        }
                    }
                }
            }
            JsObjectMember::SpreadElement(expr_id) => {
                self.output.push_str("...");
                self.emit_expression(self.arena.get_expr(*expr_id));
            }
        }
    }

    #[inline]
    fn emit_property_key(&mut self, key: &JsPropertyKey) {
        match key {
            JsPropertyKey::Identifier(name) => self.output.push_str(name),
            JsPropertyKey::Literal(lit) => self.emit_literal(lit),
            JsPropertyKey::Computed(expr_id) => self.emit_expression(self.arena.get_expr(*expr_id)),
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
        // Add a space before '(' for anonymous function expressions to match
        // the official Svelte compiler output: `function (...$$args)` not `function(...$$args)`
        if func.id.is_none() && !func.is_generator {
            self.output.push(' ');
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

        self.output.push('(');
        self.emit_params(&arrow.params);
        self.output.push(')');

        self.output.push_str(" => ");

        match &arrow.body {
            JsArrowBody::Expression(expr_id) => {
                let expr = self.arena.get_expr(*expr_id);
                // Wrap in parentheses when the arrow body expression could be
                // ambiguous without them:
                let needs_parens = matches!(expr, JsExpr::Object(_))
                    || matches!(expr, JsExpr::Assignment(a)
                        if matches!(self.arena.get_expr(a.left), JsExpr::Raw(s) if s.starts_with('{')));
                if needs_parens {
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

    #[inline]
    fn emit_call_expression(&mut self, call: &JsCallExpression) {
        let callee = self.arena.get_expr(call.callee);
        let needs_parens = matches!(
            callee,
            JsExpr::Arrow(_)
                | JsExpr::Function(_)
                | JsExpr::Await(_)
                | JsExpr::Logical(_)
                | JsExpr::Binary(_)
                | JsExpr::Conditional(_)
                | JsExpr::Assignment(_)
                | JsExpr::Sequence(_)
        );
        if needs_parens {
            self.output.push('(');
        }
        self.emit_expression(callee);
        if needs_parens {
            self.output.push(')');
        }
        if call.optional {
            self.output.push_str("?.");
        }
        self.output.push('(');
        self.emit_call_args(&call.arguments);
        self.output.push(')');
    }

    fn emit_new_expression(&mut self, new_expr: &JsNewExpression) {
        self.output.push_str("new ");
        let callee = self.arena.get_expr(new_expr.callee);
        // `new` binds tighter than most operators, so any lower-precedence
        // callee must be parenthesised: `new (a ? B : C)()`, `new (await f())()`.
        let needs_parens = matches!(
            callee,
            JsExpr::Class(_)
                | JsExpr::Conditional(_)
                | JsExpr::Logical(_)
                | JsExpr::Binary(_)
                | JsExpr::Unary(_)
                | JsExpr::Arrow(_)
                | JsExpr::Function(_)
                | JsExpr::Await(_)
                | JsExpr::Assignment(_)
                | JsExpr::Sequence(_)
                | JsExpr::Yield(_)
        );
        if needs_parens {
            self.output.push('(');
        }
        self.emit_expression(callee);
        if needs_parens {
            self.output.push(')');
        }
        self.output.push('(');
        self.emit_call_args(&new_expr.arguments);
        self.output.push(')');
    }

    #[inline]
    fn emit_member_expression(&mut self, member: &JsMemberExpression) {
        let object = self.arena.get_expr(member.object);
        let needs_parens = matches!(
            object,
            JsExpr::Literal(JsLiteral::Number(_))
                | JsExpr::Literal(JsLiteral::String(_))
                | JsExpr::Binary(_)
                | JsExpr::Unary(_)
                | JsExpr::Conditional(_)
                | JsExpr::Assignment(_)
                | JsExpr::Sequence(_)
                | JsExpr::Logical(_)
                | JsExpr::Await(_)
                | JsExpr::Arrow(_)
                | JsExpr::Function(_)
                | JsExpr::Object(_)
                | JsExpr::Class(_)
                | JsExpr::Yield(_)
        );
        if needs_parens {
            self.output.push('(');
        }
        self.emit_expression(object);
        if needs_parens {
            self.output.push(')');
        }

        if member.optional {
            self.output.push_str("?.");
        }

        if member.computed {
            self.output.push('[');
            match &member.property {
                JsMemberProperty::Expression(expr_id) => {
                    self.emit_expression(self.arena.get_expr(*expr_id))
                }
                JsMemberProperty::Identifier(name) => {
                    self.output.push('\'');
                    self.output.push_str(name);
                    self.output.push('\'');
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
                JsMemberProperty::Expression(expr_id) => {
                    self.emit_expression(self.arena.get_expr(*expr_id))
                }
            }
        }
    }

    fn emit_binary_expression(&mut self, binary: &JsBinaryExpression) {
        // Left operand: needs parens only if it has strictly lower precedence,
        // or is a conditional/assignment expression.
        // Same-precedence on the left is fine for left-associative operators.
        let left = self.arena.get_expr(binary.left);
        let left_needs_parens = self.binary_operand_needs_parens(
            left,
            &binary.operator,
            true, // is_left
        );
        if left_needs_parens {
            self.output.push('(');
        }
        self.emit_expression(left);
        if left_needs_parens {
            self.output.push(')');
        }
        self.output.push(' ');
        self.output.push_str(binary.operator.as_str());
        self.output.push(' ');
        let right = self.arena.get_expr(binary.right);
        let right_needs_parens = self.binary_operand_needs_parens(
            right,
            &binary.operator,
            false, // is_left
        );
        if right_needs_parens {
            self.output.push('(');
        }
        self.emit_expression(right);
        if right_needs_parens {
            self.output.push(')');
        }
    }

    /// Check if an operand of a binary expression needs parentheses.
    fn binary_operand_needs_parens(
        &self,
        operand: &JsExpr,
        parent_op: &JsBinaryOp,
        is_left: bool,
    ) -> bool {
        match operand {
            // Conditional and assignment always need parens inside binary
            JsExpr::Conditional(_) | JsExpr::Assignment(_) | JsExpr::Sequence(_) => true,
            JsExpr::Binary(inner) => {
                let parent_prec = binary_op_precedence(parent_op);
                let inner_prec = binary_op_precedence(&inner.operator);
                if is_left {
                    // Left operand: needs parens only if strictly lower precedence
                    inner_prec < parent_prec
                } else {
                    // Right operand: needs parens if lower or equal precedence
                    // (because most binary operators are left-associative)
                    // Exception: ** is right-associative
                    if matches!(parent_op, JsBinaryOp::Pow) {
                        inner_prec < parent_prec
                    } else {
                        inner_prec <= parent_prec
                    }
                }
            }
            // Logical expressions (&&, ||, ??) always have lower precedence than
            // any binary operator, so they always need parens when used as operands
            JsExpr::Logical(_) => true,
            // Unary expressions have higher precedence than most binary ops,
            // no parens needed
            _ => false,
        }
    }

    fn emit_logical_expression(&mut self, logical: &JsLogicalExpression) {
        let left = self.arena.get_expr(logical.left);
        let left_needs_parens = self.logical_operand_needs_parens(left, &logical.operator);
        if left_needs_parens {
            self.output.push('(');
        }
        self.emit_expression(left);
        if left_needs_parens {
            self.output.push(')');
        }
        self.output.push(' ');
        self.output.push_str(logical.operator.as_str());
        self.output.push(' ');
        let right = self.arena.get_expr(logical.right);
        let right_needs_parens = self.logical_operand_needs_parens(right, &logical.operator);
        if right_needs_parens {
            self.output.push('(');
        }
        self.emit_expression(right);
        if right_needs_parens {
            self.output.push(')');
        }
    }

    /// Check if an operand of a logical expression needs parentheses.
    /// JavaScript requires parentheses when:
    /// - Mixing `??` with `||` or `&&`
    /// - `||` is nested inside `&&` (because `&&` binds tighter)
    /// - Assignment or conditional sub-expressions
    fn logical_operand_needs_parens(&self, operand: &JsExpr, parent_op: &JsLogicalOp) -> bool {
        match operand {
            // Assignment and conditional expressions always need parens inside logical
            JsExpr::Assignment(_) | JsExpr::Conditional(_) => true,
            JsExpr::Logical(inner) => {
                let is_parent_nullish = matches!(parent_op, JsLogicalOp::NullishCoalescing);
                let is_inner_nullish = matches!(inner.operator, JsLogicalOp::NullishCoalescing);
                // If one is ?? and the other is ||/&&, they cannot be mixed
                if is_parent_nullish != is_inner_nullish {
                    return true;
                }
                // `||` inside `&&` needs parens: (a || b) && c
                if matches!(parent_op, JsLogicalOp::And)
                    && matches!(inner.operator, JsLogicalOp::Or)
                {
                    return true;
                }
                false
            }
            _ => false,
        }
    }

    /// Whether `expr`, used as the operand of a prefix unary keyword
    /// (`!`, `typeof`, `void`, `delete`, `await`), must be parenthesised to
    /// preserve precedence. All of these bind looser than a unary operator, so
    /// `await (a + b)` must keep its parens or it reparses as `(await a) + b`.
    #[inline]
    fn unary_operand_needs_parens(expr: &JsExpr) -> bool {
        matches!(
            expr,
            JsExpr::Binary(_)
                | JsExpr::Logical(_)
                | JsExpr::Assignment(_)
                | JsExpr::Conditional(_)
                | JsExpr::Sequence(_)
        )
    }

    fn emit_unary_expression(&mut self, unary: &JsUnaryExpression) {
        let op_str = unary.operator.as_str();
        if unary.prefix {
            self.output.push_str(op_str);
            if matches!(
                unary.operator,
                JsUnaryOp::TypeOf | JsUnaryOp::Void | JsUnaryOp::Delete
            ) {
                self.output.push(' ');
            }
            let arg = self.arena.get_expr(unary.argument);
            let needs_parens = Self::unary_operand_needs_parens(arg);
            if needs_parens {
                self.output.push('(');
            }
            self.emit_expression(arg);
            if needs_parens {
                self.output.push(')');
            }
        } else {
            self.emit_expression(self.arena.get_expr(unary.argument));
            self.output.push_str(op_str);
        }
    }

    #[inline]
    fn emit_update_expression(&mut self, update: &JsUpdateExpression) {
        if update.prefix {
            self.output.push_str(update.operator.as_str());
            self.emit_expression(self.arena.get_expr(update.argument));
        } else {
            self.emit_expression(self.arena.get_expr(update.argument));
            self.output.push_str(update.operator.as_str());
        }
    }

    #[inline]
    fn emit_assignment_expression(&mut self, assignment: &JsAssignmentExpression) {
        self.emit_expression(self.arena.get_expr(assignment.left));
        self.output.push(' ');
        self.output.push_str(assignment.operator.as_str());
        self.output.push(' ');
        self.emit_expression(self.arena.get_expr(assignment.right));
    }

    fn emit_conditional_expression(&mut self, cond: &JsConditionalExpression) {
        self.emit_expression(self.arena.get_expr(cond.test));
        self.output.push_str(" ? ");
        self.emit_expression(self.arena.get_expr(cond.consequent));
        self.output.push_str(" : ");
        self.emit_expression(self.arena.get_expr(cond.alternate));
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
        if let Some(super_id) = class.super_class {
            self.output.push_str(" extends ");
            let sup = self.arena.get_expr(super_id);
            let needs_parens = matches!(
                sup,
                JsExpr::Binary(_)
                    | JsExpr::Logical(_)
                    | JsExpr::Conditional(_)
                    | JsExpr::Assignment(_)
                    | JsExpr::Sequence(_)
                    | JsExpr::Arrow(_)
                    | JsExpr::Await(_)
            );
            if needs_parens {
                self.output.push('(');
            }
            self.emit_expression(sup);
            if needs_parens {
                self.output.push(')');
            }
        }
        if class.body.body.is_empty() {
            self.output.push_str(" {}");
            return;
        }
        self.output.push_str(" {");
        self.indent_level += 1;
        for member in &class.body.body {
            self.newline();
            self.emit_class_member(member);
        }
        self.indent_level -= 1;
        self.newline();
        self.output.push('}');
    }

    fn emit_class_member(&mut self, member: &JsClassMember) {
        match member {
            JsClassMember::Method(method) => {
                if method.is_static {
                    self.output.push_str("static ");
                }
                let func = &method.value;
                if func.is_async {
                    self.output.push_str("async ");
                }
                if func.is_generator {
                    self.output.push('*');
                }
                match method.kind {
                    JsMethodKind::Get => self.output.push_str("get "),
                    JsMethodKind::Set => self.output.push_str("set "),
                    JsMethodKind::Constructor | JsMethodKind::Method => {}
                }
                if method.computed {
                    self.output.push('[');
                }
                self.emit_property_key(&method.key);
                if method.computed {
                    self.output.push(']');
                }
                self.output.push('(');
                self.emit_params(&func.params);
                self.output.push_str(") ");
                self.emit_block_inline(&func.body);
            }
            JsClassMember::Property(prop) => {
                if prop.is_static {
                    self.output.push_str("static ");
                }
                if prop.computed {
                    self.output.push('[');
                }
                self.emit_property_key(&prop.key);
                if prop.computed {
                    self.output.push(']');
                }
                if let Some(value_id) = prop.value {
                    self.output.push_str(" = ");
                    self.emit_expression(self.arena.get_expr(value_id));
                }
                self.output.push(';');
            }
            JsClassMember::StaticBlock(block) => {
                self.output.push_str("static ");
                self.emit_block_inline(block);
            }
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

    #[inline]
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
                self.emit_expression(self.arena.get_expr(assign.right));
            }
        }
    }

    /// Check if a statement will render as multiline using a lightweight heuristic.
    /// Avoids full rendering to prevent exponential complexity in nested blocks.
    fn is_stmt_multiline(&self, stmt: &JsStatement) -> bool {
        match stmt {
            // These are always multiline
            JsStatement::FunctionDeclaration(_)
            | JsStatement::For(_)
            | JsStatement::ForOf(_)
            | JsStatement::While(_)
            | JsStatement::DoWhile(_)
            | JsStatement::Try(_)
            | JsStatement::Switch(_)
            | JsStatement::ExportDefault(_) => true,
            // Block is multiline if it has any statements
            JsStatement::Block(block) => !block.body.is_empty(),
            // If statement is always multiline
            JsStatement::If(_) => true,
            // Labeled inherits from body
            JsStatement::Labeled(labeled) => {
                self.is_stmt_multiline(self.arena.get_stmt(labeled.body))
            }
            // Raw code: check if it contains newlines (memchr is SIMD-accelerated)
            JsStatement::Raw(code) => memchr::memchr(b'\n', code.as_bytes()).is_some(),
            JsStatement::RawMapped { code, .. } => memchr::memchr(b'\n', code.as_bytes()).is_some(),
            // Variable declarations: multiline if they have complex initializers
            JsStatement::VariableDeclaration(decl) => {
                decl.declarations.len() > 1
                    || decl.declarations.iter().any(|d| {
                        d.init.is_some_and(|init_id| {
                            self.is_expr_likely_multiline(self.arena.get_expr(init_id))
                        })
                    })
            }
            // Expression statements: check if the expression is likely multiline
            JsStatement::Expression(expr_stmt) => {
                self.is_expr_likely_multiline(self.arena.get_expr(expr_stmt.expression))
            }
            // Simple statements are single-line
            _ => false,
        }
    }

    /// Create a lightweight temporary codegen for pre-rendering (no source map tracking).
    #[inline]
    fn tmp_codegen(&self) -> JsCodegen<'a> {
        JsCodegen {
            output: String::with_capacity(128),
            indent_level: self.indent_level,
            needs_semicolon: false,
            track_mappings: false,
            raw_spans: Vec::new(),
            source_code: None,
            arena: self.arena,
        }
    }

    /// Pre-render a statement and check if it's multiline.
    /// Used by emit_body to accurately detect multiline status for blank line logic.
    fn pre_render_stmt_is_multiline(&self, stmt: &JsStatement) -> bool {
        // Use heuristic first as a fast-path for obviously multiline statements
        if self.is_stmt_multiline(stmt) {
            return true;
        }
        // For statements that might be multiline but the heuristic misses,
        // pre-render to check. This handles cases like expression statements
        // or variable declarations with complex initializers (e.g. calls with
        // arrays whose total length exceeds 60 chars).
        let mut tmp = self.tmp_codegen();
        tmp.emit_statement(stmt);
        has_multiple_newlines(tmp.output.as_bytes())
    }

    /// Heuristic check if an expression is likely to render as multiline.
    /// Used to avoid pre-rendering complex expressions (which causes exponential blowup).
    fn is_expr_likely_multiline(&self, expr: &JsExpr) -> bool {
        match expr {
            JsExpr::Function(_) => true,
            // Arrow functions are only multiline if they have a block body.
            // Expression-body arrows like `() => x` or `(a) => a + 1` are single-line.
            JsExpr::Arrow(arrow) => matches!(arrow.body, JsArrowBody::Block(_)),
            // Objects are multiline if they have multiple properties or
            // any property value that is itself likely multiline.
            JsExpr::Object(obj) => {
                obj.properties.len() > 1
                    || obj
                        .properties
                        .iter()
                        .any(|m| self.is_member_likely_multiline(m))
            }
            JsExpr::Array(arr) => {
                // Arrays are multiline only if they contain complex sub-expressions.
                // Simple arrays of numbers/literals/small sub-arrays should be inline.
                arr.elements.iter().any(|e| {
                    e.as_ref()
                        .is_some_and(|ex| self.is_expr_likely_multiline(ex))
                })
            }
            JsExpr::Call(call) => call
                .arguments
                .iter()
                .any(|a| self.is_expr_likely_multiline(a)),
            JsExpr::Conditional(c) => {
                self.is_expr_likely_multiline(self.arena.get_expr(c.consequent))
                    || self.is_expr_likely_multiline(self.arena.get_expr(c.alternate))
            }
            JsExpr::Spanned(inner_id, _, _) => {
                self.is_expr_likely_multiline(self.arena.get_expr(*inner_id))
            }
            _ => false,
        }
    }

    /// Heuristic check if an object member is likely to render as multiline.
    fn is_member_likely_multiline(&self, member: &JsObjectMember) -> bool {
        match member {
            JsObjectMember::Property(p) => {
                matches!(p.kind, JsPropertyKind::Get | JsPropertyKind::Set)
                    || self.is_expr_likely_multiline(self.arena.get_expr(p.value))
            }
            JsObjectMember::SpreadElement(expr_id) => {
                self.is_expr_likely_multiline(self.arena.get_expr(*expr_id))
            }
        }
    }

    /// Emit a comma-separated sequence of expressions with esrap-style wrapping.
    /// When total length exceeds 60 or any element is multiline, switches to multi-line mode.
    /// `pad` controls whether spaces are added around the content in single-line mode
    /// (true for objects: `{ a: 1 }`, false for arrays/calls: `[1, 2]`).
    fn emit_sequence_exprs(&mut self, items: &[Option<&JsExpr>], pad: bool) {
        if items.is_empty() {
            return;
        }

        // Use heuristic to detect likely-multiline sequences without pre-rendering.
        // This avoids exponential blowup from pre-rendering deeply nested structures.
        // The heuristic: only skip pre-rendering when BOTH the item count is large
        // AND items contain complex expressions (functions, block arrows, etc.).
        // Simple arrays of literals/small sub-arrays should always be pre-rendered
        // to check actual width, matching esrap behavior.
        let has_complex_items = items
            .iter()
            .any(|item| item.is_some_and(|expr| self.is_expr_likely_multiline(expr)));
        let likely_multiline = items.len() > 3 && has_complex_items;

        if likely_multiline {
            // Render directly in multiline mode without pre-rendering.
            // We render each item and track its output to detect multiline for margin logic.
            self.indent_level += 1;
            self.newline();

            let mut prev_was_multiline = false;
            let mut prev_had_obj_array = false;

            for (i, item) in items.iter().enumerate() {
                // Check if this item has object/array value (for margin logic)
                let has_obj_array = has_object_or_array_value(item);

                // Record position before indentation for possible margin insertion
                let margin_insert_pos = self.output.len();

                self.indent();
                let start_pos = self.output.len();
                if let Some(expr) = item {
                    self.emit_expression(expr);
                }
                if i < items.len() - 1 {
                    self.output.push(',');
                }

                // Check if the rendered item was multiline (memchr for SIMD speed)
                let rendered_part = &self.output[start_pos..];
                let curr_is_multiline = memchr::memchr(b'\n', rendered_part.as_bytes()).is_some();

                // Insert blank line (margin) between consecutive multiline items
                // that don't have object/array values (matching esrap behavior).
                // We do this retroactively after rendering to accurately detect multiline.
                if i > 0
                    && prev_was_multiline
                    && curr_is_multiline
                    && !prev_had_obj_array
                    && !has_obj_array
                {
                    self.output.insert(margin_insert_pos, '\n');
                }

                prev_was_multiline = curr_is_multiline;
                prev_had_obj_array = has_obj_array;

                self.newline();
            }

            self.indent_level -= 1;
            self.indent();
        } else {
            // Small, simple items: use a single tmp codegen to measure total length
            // and detect multiline, avoiding per-item String allocations.
            let mut tmp = self.tmp_codegen();
            // Record (start_offset, end_offset) for each rendered item in the tmp buffer.
            let mut offsets: smallvec::SmallVec<[(usize, usize); 8]> =
                smallvec::SmallVec::with_capacity(items.len());
            for item in items.iter() {
                let start = tmp.output.len();
                if let Some(expr) = item {
                    tmp.emit_expression(expr);
                }
                offsets.push((start, tmp.output.len()));
            }

            let total_len: usize = offsets.iter().map(|(s, e)| e - s).sum::<usize>()
                + if offsets.len() > 1 {
                    (offsets.len() - 1) * 2
                } else {
                    0
                };

            let tmp_bytes = tmp.output.as_bytes();
            let any_multiline = offsets
                .iter()
                .any(|(s, e)| memchr::memchr(b'\n', &tmp_bytes[*s..*e]).is_some());
            let multiline = any_multiline || total_len > 60;

            if multiline {
                // Pre-render determined multiline despite heuristic saying otherwise.
                // Render directly in multiline mode.
                self.indent_level += 1;
                self.newline();

                for (i, item) in items.iter().enumerate() {
                    self.indent();
                    if let Some(expr) = item {
                        self.emit_expression(expr);
                    }
                    if i < items.len() - 1 {
                        self.output.push(',');
                    }

                    if i < items.len() - 1 {
                        let (cs, ce) = offsets[i];
                        let (ns, ne) = offsets[i + 1];
                        let tmp_bytes = tmp.output.as_bytes();
                        if memchr::memchr(b'\n', &tmp_bytes[cs..ce]).is_some()
                            && memchr::memchr(b'\n', &tmp_bytes[ns..ne]).is_some()
                            && !has_object_or_array_value(item)
                            && !has_object_or_array_value(&items[i + 1])
                        {
                            self.newline(); // margin
                        }
                    }

                    self.newline();
                }

                self.indent_level -= 1;
                self.indent();
            } else {
                if pad && total_len > 0 {
                    self.output.push(' ');
                }
                for (i, item) in items.iter().enumerate() {
                    if i > 0 {
                        self.output.push_str(", ");
                    }
                    if let Some(expr) = item {
                        self.emit_expression(expr);
                    }
                }
                if pad && total_len > 0 {
                    self.output.push(' ');
                }
            }
        }
    }

    /// Emit call/new expression arguments with esrap-style wrapping.
    /// In esrap, only non-final arguments' multiline status triggers wrapping.
    /// Uses a heuristic fast-path to avoid expensive pre-rendering when possible.
    fn emit_call_args(&mut self, arguments: &[JsExpr]) {
        if arguments.is_empty() {
            return;
        }

        // Fast path: use heuristic to check if any non-final argument is likely multiline.
        // This avoids expensive pre-rendering for the common case where all args are simple.
        let non_final = &arguments[..arguments.len().saturating_sub(1)];
        let any_likely_multiline = non_final
            .iter()
            .any(|arg| self.is_expr_likely_multiline(arg));

        // Only pre-render if the heuristic didn't find anything (to catch edge cases
        // where simple-looking expressions render as multiline due to width)
        // If heuristic found multiline, we can skip pre-rendering entirely.
        let non_final_multiline = if any_likely_multiline {
            true
        } else if non_final.is_empty() {
            false
        } else {
            // Pre-render non-final arguments in a single tmp codegen to check actual
            // multiline status. Reuses one buffer instead of allocating per-argument.
            let mut tmp = self.tmp_codegen();
            non_final.iter().any(|arg| {
                let start = tmp.output.len();
                tmp.emit_expression(arg);
                memchr::memchr(b'\n', &tmp.output.as_bytes()[start..]).is_some()
            })
        };

        if non_final_multiline {
            self.indent_level += 1;
            self.newline();

            for (i, arg) in arguments.iter().enumerate() {
                self.indent();
                self.emit_expression(arg);
                if i < arguments.len() - 1 {
                    self.output.push(',');
                }
                self.newline();
            }

            self.indent_level -= 1;
            self.indent();
        } else {
            for (i, arg) in arguments.iter().enumerate() {
                if i > 0 {
                    self.output.push_str(", ");
                }
                self.emit_expression(arg);
            }
        }
    }
}

/// Check if a byte slice contains more than one newline character.
/// Uses memchr for SIMD-accelerated search, short-circuiting after finding 2 newlines.
#[inline]
fn has_multiple_newlines(bytes: &[u8]) -> bool {
    if let Some(first) = memchr::memchr(b'\n', bytes) {
        memchr::memchr(b'\n', &bytes[first + 1..]).is_some()
    } else {
        false
    }
}

/// Check if an expression is an object or array value (used for margin logic in sequence).
/// In esrap, consecutive multiline properties with object/array values don't get extra margins.
#[inline]
fn has_object_or_array_value(item: &Option<&JsExpr>) -> bool {
    if let Some(expr) = item {
        matches!(expr, JsExpr::Object(_) | JsExpr::Array(_))
    } else {
        false
    }
}

/// Get the ESTree-style type name for a statement, used for blank line logic.
/// Consecutive statements of the same type don't get blank lines between them
/// (unless either is multiline).
#[inline]
fn stmt_type_name(stmt: &JsStatement) -> &'static str {
    match stmt {
        JsStatement::Import(_) => "ImportDeclaration",
        JsStatement::ExportDefault(_) => "ExportDefaultDeclaration",
        JsStatement::ExportNamed(_) => "ExportNamedDeclaration",
        JsStatement::VariableDeclaration(_) => "VariableDeclaration",
        JsStatement::FunctionDeclaration(_) => "FunctionDeclaration",
        JsStatement::Expression(_) => "ExpressionStatement",
        JsStatement::Return(_) => "ReturnStatement",
        JsStatement::If(_) => "IfStatement",
        JsStatement::For(_) => "ForStatement",
        JsStatement::ForOf(_) => "ForOfStatement",
        JsStatement::While(_) => "WhileStatement",
        JsStatement::DoWhile(_) => "DoWhileStatement",
        JsStatement::Switch(_) => "SwitchStatement",
        JsStatement::Block(_) => "BlockStatement",
        JsStatement::Empty => "EmptyStatement",
        JsStatement::Debugger => "DebuggerStatement",
        JsStatement::Labeled(_) => "LabeledStatement",
        JsStatement::Break(_) => "BreakStatement",
        JsStatement::Continue(_) => "ContinueStatement",
        JsStatement::Throw(_) => "ThrowStatement",
        JsStatement::Try(_) => "TryStatement",
        JsStatement::Raw(code) => raw_stmt_type_name(code),
        JsStatement::RawMapped { code, .. } => raw_stmt_type_name(code),
    }
}

/// Infer the ESTree-like type name for a Raw statement based on its content.
/// This allows Raw statements to participate correctly in blank-line logic.
/// Dispatches on the first byte to minimize the number of `starts_with()` comparisons.
#[inline]
fn raw_stmt_type_name(code: &str) -> &'static str {
    let trimmed = code.trim_start();
    let bytes = trimmed.as_bytes();
    if bytes.is_empty() {
        return "ExpressionStatement";
    }
    match bytes[0] {
        b'/' if (trimmed.starts_with("/*") || trimmed.starts_with("//")) => "Comment",
        b'i' => {
            if trimmed.starts_with("import ") || trimmed.starts_with("import\t") {
                "ImportDeclaration"
            } else if trimmed.starts_with("if ") || trimmed.starts_with("if(") {
                "IfStatement"
            } else {
                "ExpressionStatement"
            }
        }
        b'e' => {
            if trimmed.starts_with("export default ") {
                "ExportDefaultDeclaration"
            } else if trimmed.starts_with("export ") {
                "ExportNamedDeclaration"
            } else {
                "ExpressionStatement"
            }
        }
        b'v' if trimmed.starts_with("var ") => "VariableDeclaration",
        b'l' if trimmed.starts_with("let ") => "VariableDeclaration",
        b'c' => {
            if trimmed.starts_with("const ") {
                "VariableDeclaration"
            } else if trimmed.starts_with("class ") {
                "ClassDeclaration"
            } else {
                "ExpressionStatement"
            }
        }
        b'f' => {
            if trimmed.starts_with("function ") {
                "FunctionDeclaration"
            } else if trimmed.starts_with("for ") || trimmed.starts_with("for(") {
                "ForStatement"
            } else {
                "ExpressionStatement"
            }
        }
        b'a' if trimmed.starts_with("async function ") => "FunctionDeclaration",
        b'r' if (trimmed.starts_with("return ")
            || trimmed.starts_with("return;")
            || trimmed == "return") =>
        {
            "ReturnStatement"
        }
        b'w' if (trimmed.starts_with("while ") || trimmed.starts_with("while(")) => {
            "WhileStatement"
        }
        _ => "ExpressionStatement",
    }
}

/// Get the precedence level of a binary operator.
/// Higher number = higher precedence (binds tighter).
/// Based on MDN operator precedence table.
#[inline]
fn binary_op_precedence(op: &JsBinaryOp) -> u8 {
    match op {
        JsBinaryOp::Pow => 14,
        JsBinaryOp::Mul | JsBinaryOp::Div | JsBinaryOp::Mod => 13,
        JsBinaryOp::Add | JsBinaryOp::Sub => 12,
        JsBinaryOp::Shl | JsBinaryOp::Shr | JsBinaryOp::UShr => 11,
        JsBinaryOp::Lt
        | JsBinaryOp::Le
        | JsBinaryOp::Gt
        | JsBinaryOp::Ge
        | JsBinaryOp::In
        | JsBinaryOp::InstanceOf => 10,
        JsBinaryOp::Eq | JsBinaryOp::Ne | JsBinaryOp::StrictEq | JsBinaryOp::StrictNe => 9,
        JsBinaryOp::BitAnd => 8,
        JsBinaryOp::BitXor => 7,
        JsBinaryOp::BitOr => 6,
    }
}

/// Escape special characters in a single-quoted string literal.
#[inline]
fn escape_string_single(s: &str) -> std::borrow::Cow<'_, str> {
    // Fast path: use memchr to check if any escaping is needed.
    // This is faster than iterating all bytes for strings that don't need escaping.
    let bytes = s.as_bytes();
    if memchr::memchr3(b'\'', b'\\', b'\n', bytes).is_none()
        && memchr::memchr3(b'\r', b'\t', 0x0c /* \f */, bytes).is_none()
        && memchr::memchr2(0x08 /* \b */, 0x0b /* \v */, bytes).is_none()
    {
        return std::borrow::Cow::Borrowed(s);
    }
    // Slow path: escape needed. Use byte-level scanning and copy slices
    // between special characters to reduce per-character overhead.
    let mut result = String::with_capacity(s.len() + 8);
    let mut last_copied = 0;
    for (i, &b) in bytes.iter().enumerate() {
        let replacement = match b {
            b'\'' => "\\'",
            b'\\' => "\\\\",
            b'\n' => "\\n",
            b'\r' => "\\r",
            b'\t' => "\\t",
            0x08 => "\\b",
            0x0b => "\\v",
            0x0c => "\\f",
            _ => continue,
        };
        // Copy the unmodified slice before this special character
        result.push_str(&s[last_copied..i]);
        result.push_str(replacement);
        last_copied = i + 1;
    }
    result.push_str(&s[last_copied..]);
    std::borrow::Cow::Owned(result)
}

// ============================================================================
// Token extraction for source map generation
// ============================================================================

/// A token found in JavaScript source code.
struct Token<'a> {
    /// The token text (e.g., identifier name, literal value, operator)
    text: &'a str,
    /// Byte offset in the code string where this token starts
    output_offset: usize,
}

/// Extract tokens from JavaScript source code for source map matching.
///
/// Returns tokens in order of appearance. Each token is either:
/// - An identifier-like sequence (a-zA-Z0-9_$)
/// - A numeric literal (digits, possibly with dots/e/x)
/// - A string literal (including quotes)
/// - An operator or punctuation character
///
/// Whitespace is skipped.
fn extract_tokens(code: &str) -> Vec<Token<'_>> {
    let bytes = code.as_bytes();
    let len = bytes.len();
    // Rough estimate: ~1 token per 5 bytes of code on average
    let mut tokens = Vec::with_capacity(len / 5);
    let mut i = 0;

    while i < len {
        let b = bytes[i];

        // Skip whitespace
        if b == b' ' || b == b'\t' || b == b'\n' || b == b'\r' {
            i += 1;
            continue;
        }

        // Identifier or keyword: [a-zA-Z_$][a-zA-Z0-9_$]*
        if b.is_ascii_alphabetic() || b == b'_' || b == b'$' {
            let start = i;
            i += 1;
            while i < len
                && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'_' || bytes[i] == b'$')
            {
                i += 1;
            }
            tokens.push(Token {
                text: &code[start..i],
                output_offset: start,
            });
            continue;
        }

        // Numeric literal: [0-9][0-9a-zA-Z._]*
        if b.is_ascii_digit() {
            let start = i;
            i += 1;
            while i < len
                && (bytes[i].is_ascii_alphanumeric() || bytes[i] == b'.' || bytes[i] == b'_')
            {
                i += 1;
            }
            // Handle BigInt suffix 'n'
            if i < len && bytes[i] == b'n' {
                i += 1;
            }
            tokens.push(Token {
                text: &code[start..i],
                output_offset: start,
            });
            continue;
        }

        // String literal: single or double quote
        if b == b'\'' || b == b'"' {
            let start = i;
            let quote = b;
            i += 1;
            while i < len && bytes[i] != quote {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2; // skip escaped char
                } else {
                    i += 1;
                }
            }
            if i < len {
                i += 1; // skip closing quote
            }
            tokens.push(Token {
                text: &code[start..i],
                output_offset: start,
            });
            continue;
        }

        // Template literal - skip static parts but process ${...} expressions
        if b == b'`' {
            i += 1;
            while i < len {
                if bytes[i] == b'`' {
                    i += 1;
                    break;
                }
                if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                    i += 2; // skip ${
                    let mut brace_depth = 1u32;
                    while i < len && brace_depth > 0 {
                        let eb = bytes[i];
                        if eb == b'{' {
                            brace_depth += 1;
                            i += 1;
                        } else if eb == b'}' {
                            brace_depth -= 1;
                            if brace_depth == 0 {
                                i += 1;
                                break;
                            }
                            i += 1;
                        } else if eb.is_ascii_alphabetic() || eb == b'_' || eb == b'$' {
                            let start = i;
                            i += 1;
                            while i < len
                                && (bytes[i].is_ascii_alphanumeric()
                                    || bytes[i] == b'_'
                                    || bytes[i] == b'$')
                            {
                                i += 1;
                            }
                            tokens.push(Token {
                                text: &code[start..i],
                                output_offset: start,
                            });
                        } else if eb.is_ascii_digit() {
                            let start = i;
                            i += 1;
                            while i < len
                                && (bytes[i].is_ascii_alphanumeric()
                                    || bytes[i] == b'.'
                                    || bytes[i] == b'_')
                            {
                                i += 1;
                            }
                            tokens.push(Token {
                                text: &code[start..i],
                                output_offset: start,
                            });
                        } else {
                            i += 1;
                        }
                    }
                    continue;
                }
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                } else {
                    i += 1;
                }
            }
            continue;
        }

        // Line comment - skip
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }

        // Block comment - skip
        if b == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            if i + 1 < len {
                i += 2;
            }
            continue;
        }

        // Single punctuation character (operator, bracket, etc.)
        // Don't create tokens for very common delimiters that would create noise
        i += 1;
    }

    tokens
}

// ============================================================================
// Source map helper functions
// ============================================================================

/// Build a list of byte offsets where each line starts.
/// Uses byte-level iteration instead of char_indices since '\n' is a single
/// byte in UTF-8, which is faster and avoids UTF-8 decoding overhead.
pub fn build_line_starts(s: &str) -> Vec<usize> {
    let bytes = s.as_bytes();
    // Estimate ~80 chars per line for initial capacity
    let estimated_lines = bytes.len() / 80 + 1;
    let mut starts = Vec::with_capacity(estimated_lines);
    starts.push(0);
    let mut pos = 0;
    while pos < bytes.len() {
        if let Some(offset) = memchr::memchr(b'\n', &bytes[pos..]) {
            starts.push(pos + offset + 1);
            pos += offset + 1;
        } else {
            break;
        }
    }
    starts
}

/// Convert a byte offset to (line, column), both 0-indexed.
pub fn offset_to_line_col(line_starts: &[usize], offset: usize) -> (usize, usize) {
    match line_starts.binary_search(&offset) {
        Ok(line) => (line, 0),
        Err(line) => {
            let line = line.saturating_sub(1);
            let col = offset.saturating_sub(line_starts[line]);
            (line, col)
        }
    }
}

/// Encode a list of source mappings into a VLQ-encoded mappings string.
pub fn encode_vlq_mappings(mappings: &[SourceMapping]) -> String {
    if mappings.is_empty() {
        return String::new();
    }

    let mut result = String::with_capacity(mappings.len() * 8);
    let mut prev_gen_line: u32 = 0;
    let mut prev_gen_col: i64 = 0;
    let mut prev_source: i64 = 0;
    let mut prev_orig_line: i64 = 0;
    let mut prev_orig_col: i64 = 0;
    let mut prev_name: i64 = 0;
    let mut first_on_line = true;

    for m in mappings {
        // Add semicolons for line gaps
        while prev_gen_line < m.gen_line {
            result.push(';');
            prev_gen_line += 1;
            prev_gen_col = 0;
            first_on_line = true;
        }

        if !first_on_line {
            result.push(',');
        }

        // Field 1: generated column (relative)
        vlq_encode(&mut result, m.gen_col as i64 - prev_gen_col);
        // Field 2: source index (relative)
        vlq_encode(&mut result, m.source as i64 - prev_source);
        // Field 3: original line (relative)
        vlq_encode(&mut result, m.orig_line as i64 - prev_orig_line);
        // Field 4: original column (relative)
        vlq_encode(&mut result, m.orig_col as i64 - prev_orig_col);
        // Field 5: name index (relative, optional)
        if let Some(name_idx) = m.name {
            vlq_encode(&mut result, name_idx as i64 - prev_name);
            prev_name = name_idx as i64;
        }

        prev_gen_col = m.gen_col as i64;
        prev_source = m.source as i64;
        prev_orig_line = m.orig_line as i64;
        prev_orig_col = m.orig_col as i64;
        first_on_line = false;
    }

    result
}

/// Encode a single integer as a VLQ value appended to the output string.
/// Uses a pre-computed ASCII lookup table to avoid the `as char` conversion overhead.
#[inline]
fn vlq_encode(out: &mut String, value: i64) {
    // Base64 chars as a static array for direct indexing
    const B64: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut v = if value < 0 {
        ((-value) << 1) | 1
    } else {
        value << 1
    } as u64;

    loop {
        let mut digit = (v & 0x1F) as u8;
        v >>= 5;
        if v > 0 {
            digit |= 0x20; // continuation bit
        }
        // SAFETY: digit is at most 0x3F (63), which is within B64 bounds,
        // and B64 contains only ASCII bytes.
        out.push(B64[digit as usize] as char);
        if v == 0 {
            break;
        }
    }
}

/// Compute the source name (relative path from output to input), matching
/// the official Svelte compiler's `get_source_name` behavior.
pub fn get_source_name(
    filename: Option<&str>,
    output_filename: Option<&str>,
    default_name: &str,
) -> String {
    let source = filename.unwrap_or(default_name);
    match output_filename {
        Some(output) => get_relative_path(output, source),
        None => get_basename(source).to_string(),
    }
}

/// Get relative path from `from` to `to`, matching Svelte's `get_relative_path`.
fn get_relative_path(from: &str, to: &str) -> String {
    let from_parts: Vec<&str> = from.split('/').collect();
    let to_parts: Vec<&str> = to.split('/').collect();

    // Remove filename part from `from`
    let from_dir = &from_parts[..from_parts.len().saturating_sub(1)];

    let mut common = 0;
    for (a, b) in from_dir.iter().zip(to_parts.iter()) {
        if a == b {
            common += 1;
        } else {
            break;
        }
    }

    let ups = from_dir.len() - common;
    let mut parts: Vec<&str> = vec![".."; ups];
    for p in &to_parts[common..] {
        parts.push(p);
    }

    let result = parts.join("/");
    if result.starts_with("../") || result.starts_with("./") {
        result
    } else {
        format!("./{}", result)
    }
}

/// Get basename of a path (last component).
fn get_basename(path: &str) -> &str {
    path.rsplit('/').next().unwrap_or(path)
}

/// Generate a complete source map JSON string (v3 format).
pub fn generate_sourcemap_json(
    file: &str,
    source_name: &str,
    source_content: &str,
    mappings: &str,
    names: &[&str],
) -> String {
    let mut json = String::with_capacity(256 + source_content.len() + mappings.len());
    json.push_str("{\"version\":3");
    json.push_str(",\"file\":\"");
    json_escape_str(&mut json, file);
    json.push('"');
    json.push_str(",\"sources\":[\"");
    json_escape_str(&mut json, source_name);
    json.push_str("\"]");
    json.push_str(",\"sourcesContent\":[\"");
    json_escape_str(&mut json, source_content);
    json.push_str("\"]");
    json.push_str(",\"names\":[");
    for (i, name) in names.iter().enumerate() {
        if i > 0 {
            json.push(',');
        }
        json.push('"');
        json_escape_str(&mut json, name);
        json.push('"');
    }
    json.push(']');
    json.push_str(",\"mappings\":\"");
    json.push_str(mappings);
    json.push_str("\"}");
    json
}

/// Escape a string for use in JSON.
fn json_escape_str(out: &mut String, s: &str) {
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => {
                let _ = write!(out, "\\u{:04x}", c as u32);
            }
            c => out.push(c),
        }
    }
}

/// Decoded source map segment: [gen_col, source_index, orig_line, orig_col, name_index?]
pub type DecodedSegment = Vec<i64>;

/// Decoded source map: Vec of lines, each line is a Vec of segments
pub type DecodedMappings = Vec<Vec<DecodedSegment>>;

/// Decode VLQ-encoded source map mappings string into a 2D structure.
pub fn decode_vlq_mappings(mappings: &str) -> DecodedMappings {
    let mut result: DecodedMappings = Vec::new();
    let mut current_line: Vec<DecodedSegment> = Vec::new();

    // Running state (cumulative across lines except gen_col which resets per line)
    let mut gen_col: i64 = 0;
    let mut source: i64 = 0;
    let mut orig_line: i64 = 0;
    let mut orig_col: i64 = 0;
    let mut name_idx: i64 = 0;

    let bytes = mappings.as_bytes();
    let mut i = 0;

    while i < bytes.len() {
        let b = bytes[i];

        if b == b';' {
            result.push(std::mem::take(&mut current_line));
            gen_col = 0;
            i += 1;
            continue;
        }

        if b == b',' {
            i += 1;
            continue;
        }

        // Decode a segment
        let mut segment = Vec::new();

        // Field 1: gen_col (relative)
        let (val, consumed) = vlq_decode(&bytes[i..]);
        gen_col += val;
        segment.push(gen_col);
        i += consumed;

        if i < bytes.len() && bytes[i] != b',' && bytes[i] != b';' {
            // Field 2: source index (relative)
            let (val, consumed) = vlq_decode(&bytes[i..]);
            source += val;
            segment.push(source);
            i += consumed;

            // Field 3: orig_line (relative)
            let (val, consumed) = vlq_decode(&bytes[i..]);
            orig_line += val;
            segment.push(orig_line);
            i += consumed;

            // Field 4: orig_col (relative)
            let (val, consumed) = vlq_decode(&bytes[i..]);
            orig_col += val;
            segment.push(orig_col);
            i += consumed;

            // Optional field 5: name index (relative)
            if i < bytes.len() && bytes[i] != b',' && bytes[i] != b';' {
                let (val, consumed) = vlq_decode(&bytes[i..]);
                name_idx += val;
                segment.push(name_idx);
                i += consumed;
            }
        }

        current_line.push(segment);
    }

    // Push last line
    result.push(current_line);

    result
}

/// Decode a single VLQ value from a byte slice.
/// Returns (value, bytes_consumed).
fn vlq_decode(bytes: &[u8]) -> (i64, usize) {
    let mut value: u64 = 0;
    let mut shift = 0u32;
    let mut i = 0;

    loop {
        if i >= bytes.len() {
            break;
        }
        let b = bytes[i];
        let digit = match b {
            b'A'..=b'Z' => b - b'A',
            b'a'..=b'z' => b - b'a' + 26,
            b'0'..=b'9' => b - b'0' + 52,
            b'+' => 62,
            b'/' => 63,
            _ => break,
        };
        i += 1;
        value |= ((digit & 0x1F) as u64) << shift;
        shift += 5;
        if digit & 0x20 == 0 {
            break;
        }
    }

    // Convert from unsigned to signed
    let signed = if value & 1 == 1 {
        -((value >> 1) as i64)
    } else {
        (value >> 1) as i64
    };

    (signed, i)
}

/// Remap source mappings through a preprocessor source map.
///
/// Given our compiler's mappings (generated -> preprocessed positions) and
/// a preprocessor source map (preprocessed -> original positions),
/// produce mappings from generated -> original positions.
pub fn remap_through_sourcemap(mappings: &mut [SourceMapping], preprocessor_map_json: &str) {
    // Parse the preprocessor source map
    let map: serde_json::Value = match serde_json::from_str(preprocessor_map_json) {
        Ok(v) => v,
        Err(_) => return,
    };

    let pp_mappings_str = match map.get("mappings").and_then(|v| v.as_str()) {
        Some(s) => s,
        None => return,
    };

    let decoded = decode_vlq_mappings(pp_mappings_str);

    // Extract names array for handling named replacements
    let names: Vec<String> = map
        .get("names")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    // For each of our mappings, orig_line/orig_col point to the preprocessed code.
    // We need to look up that position in the preprocessor's decoded mappings
    // to find the original source position.

    for mapping in mappings.iter_mut() {
        let pp_line = mapping.orig_line as usize;
        let pp_col = mapping.orig_col as usize;

        if pp_line >= decoded.len() {
            continue;
        }

        let segments = &decoded[pp_line];
        if segments.is_empty() {
            continue;
        }

        // Find the segment that best matches pp_col
        // Each segment: [gen_col, source_index, orig_line, orig_col, name_index?]
        // We want the last segment where gen_col <= pp_col
        let mut best: Option<&DecodedSegment> = None;
        let mut next_seg_col: Option<i64> = None;
        for (i, seg) in segments.iter().enumerate() {
            if seg.len() >= 4 && seg[0] as usize <= pp_col {
                best = Some(seg);
                // Track the next segment's column to know the extent of this segment
                next_seg_col = segments
                    .get(i + 1)
                    .and_then(|s| if s.len() >= 4 { Some(s[0]) } else { None });
            } else if seg[0] as usize > pp_col {
                break;
            }
        }

        if let Some(seg) = best {
            let col_offset = pp_col as i64 - seg[0];

            // Handle named replacements (segment has 5th field = name index).
            // Named segments indicate text replacement (e.g., "--replace-me" -> "\n --done-replace").
            // Positions within the replacement range should map to the start of the
            // original name, NOT by linear col_offset interpolation, because the
            // replacement text has no character-by-character correspondence with the original.
            if seg.len() >= 5 {
                let name_idx = seg[4] as usize;
                if name_idx < names.len() {
                    let original_name = &names[name_idx];
                    let original_name_len = original_name.len() as i64;

                    // Determine the generated (preprocessed) text length for this segment.
                    // This is the distance to the next segment, or we assume a short replacement.
                    let gen_len = next_seg_col
                        .map(|nc| nc - seg[0])
                        .unwrap_or(original_name_len); // fallback

                    if col_offset >= gen_len && gen_len > 0 {
                        // Position is at or past the end of the replaced text;
                        // map to end of original name. Use clamped saturating cast to
                        // avoid silent overflow if a malformed source map produces a
                        // negative or out-of-range value.
                        mapping.orig_line = seg[2].max(0) as u32;
                        mapping.orig_col =
                            u32::try_from(seg[3] + original_name_len).unwrap_or(u32::MAX);
                        mapping.source = seg[1].max(0) as u32;
                        continue;
                    }

                    // Position is within the replacement range;
                    // map to the start of the original name and carry the name index
                    mapping.orig_line = seg[2].max(0) as u32;
                    mapping.orig_col = u32::try_from(seg[3]).unwrap_or(u32::MAX);
                    mapping.source = seg[1].max(0) as u32;
                    mapping.name = Some(name_idx as u32);
                    continue;
                }
            }

            mapping.orig_line = seg[2].max(0) as u32;
            mapping.orig_col = u32::try_from(seg[3] + col_offset).unwrap_or(u32::MAX);
            mapping.source = seg[1].max(0) as u32;
        }
    }
}

/// Generate a source map JSON with multiple sources support.
pub fn generate_sourcemap_json_multi(
    file: &str,
    sources: &[&str],
    sources_content: &[&str],
    mappings: &str,
    names: &[&str],
) -> String {
    let mut json = String::with_capacity(256 + mappings.len());
    json.push_str("{\"version\":3");
    json.push_str(",\"file\":\"");
    json_escape_str(&mut json, file);
    json.push('"');
    json.push_str(",\"sources\":[");
    for (i, src) in sources.iter().enumerate() {
        if i > 0 {
            json.push(',');
        }
        json.push('"');
        json_escape_str(&mut json, src);
        json.push('"');
    }
    json.push(']');
    json.push_str(",\"sourcesContent\":[");
    for (i, content) in sources_content.iter().enumerate() {
        if i > 0 {
            json.push(',');
        }
        json.push('"');
        json_escape_str(&mut json, content);
        json.push('"');
    }
    json.push(']');
    json.push_str(",\"names\":[");
    for (i, name) in names.iter().enumerate() {
        if i > 0 {
            json.push(',');
        }
        json.push('"');
        json_escape_str(&mut json, name);
        json.push('"');
    }
    json.push(']');
    json.push_str(",\"mappings\":\"");
    json.push_str(mappings);
    json.push_str("\"}");
    json
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::compiler::phases::phase3_transform::js_ast::builders::*;

    #[test]
    fn test_simple_program() {
        let arena = JsArena::new();
        let prog = program(vec![
            import_namespace("$", "svelte/internal/client"),
            var_decl(
                &arena,
                "root",
                Some(svelte_from_html(&arena, "<h1>Hello</h1>", None)),
            ),
            export_default_function(
                "Test",
                vec![id_pattern("$$anchor")],
                vec![
                    var_decl(&arena, "h1", Some(call(&arena, id("root"), vec![]))),
                    stmt(&arena, svelte_append(&arena, id("$$anchor"), id("h1"))),
                ],
            ),
        ]);

        let code = generate(&prog, &arena).unwrap();
        println!("{}", code);
        assert!(code.contains("import * as $ from"));
        assert!(code.contains("$.from_html"));
        assert!(code.contains("export default function Test"));
    }

    #[test]
    fn test_arrow_function() {
        let arena = JsArena::new();
        let prog = program(vec![const_decl(
            &arena,
            "add",
            arrow(
                &arena,
                vec![id_pattern("a"), id_pattern("b")],
                binary(&arena, JsBinaryOp::Add, id("a"), id("b")),
            ),
        )]);

        let code = generate(&prog, &arena).unwrap();
        println!("{}", code);
        assert!(code.contains("const add = (a, b) => a + b"));
    }

    #[test]
    fn test_template_literal() {
        let arena = JsArena::new();
        let prog = program(vec![const_decl(
            &arena,
            "msg",
            template(
                vec![quasi("Hello, ", false), quasi("!", true)],
                vec![id("name")],
            ),
        )]);

        let code = generate(&prog, &arena).unwrap();
        println!("{}", code);
        assert!(code.contains("`Hello, ${name}!`"));
    }

    #[test]
    fn test_apostrophe_escaping() {
        let arena = JsArena::new();
        // Test that apostrophes are properly escaped when using single quotes
        let prog = program(vec![const_decl(&arena, "msg", string("I don't need this"))]);

        let code = generate(&prog, &arena).unwrap();
        println!("Generated code: {}", code);
        // oxc codegen with single_quote: true should escape apostrophes
        // Either it uses double quotes OR escapes the apostrophe
        assert!(
            code.contains(r#"'I don\'t need this'"#) || code.contains(r#""I don't need this""#),
            "Apostrophe should be escaped or double quotes should be used: {}",
            code
        );
    }

    #[test]
    fn test_arrow_function_with_object_literal() {
        let arena = JsArena::new();
        // Test that arrow functions with object literal bodies are wrapped in parentheses
        let obj = object(vec![prop(&arena, "value", number(1.0))]);
        let arrow_fn = arrow(&arena, vec![], obj);
        let prog = program(vec![const_decl(&arena, "fn", arrow_fn)]);

        let code = generate(&prog, &arena).unwrap();
        println!("Generated code: {}", code);
        assert!(
            code.contains("() => ({ value: 1 })") || code.contains("() => ({value: 1})"),
            "Object literal in arrow function should be wrapped in parentheses: {}",
            code
        );
    }

    #[test]
    fn test_arrow_function_with_getter_setter_object() {
        let arena = JsArena::new();
        // Test that arrow functions returning objects with getters/setters work correctly
        // This mirrors the `derived-proxy` test case:
        // $derived({ get value() { return count * 2}, set value(c) { count = c / 2 } })

        let getter = JsObjectMember::Property(JsProperty {
            key: JsPropertyKey::Identifier("value".into()),
            value: arena.alloc_expr(JsExpr::Function(JsFunctionExpression {
                id: None,
                params: smallvec::smallvec![],
                body: JsBlockStatement::with_body(vec![JsStatement::Return(JsReturnStatement {
                    argument: Some(arena.alloc_expr(binary(
                        &arena,
                        JsBinaryOp::Mul,
                        id("count"),
                        number(2.0),
                    ))),
                })]),
                is_async: false,
                is_generator: false,
            })),
            kind: JsPropertyKind::Get,
            computed: false,
            shorthand: false,
            method: false,
        });

        let setter = JsObjectMember::Property(JsProperty {
            key: JsPropertyKey::Identifier("value".into()),
            value: arena.alloc_expr(JsExpr::Function(JsFunctionExpression {
                id: None,
                params: smallvec::smallvec![id_pattern("c")],
                body: JsBlockStatement::with_body(vec![JsStatement::Expression(
                    JsExpressionStatement {
                        expression: arena.alloc_expr(JsExpr::Assignment(JsAssignmentExpression {
                            operator: JsAssignmentOp::Assign,
                            left: arena.alloc_expr(id("count")),
                            right: arena.alloc_expr(binary(
                                &arena,
                                JsBinaryOp::Div,
                                id("c"),
                                number(2.0),
                            )),
                        })),
                    },
                )]),
                is_async: false,
                is_generator: false,
            })),
            kind: JsPropertyKind::Set,
            computed: false,
            shorthand: false,
            method: false,
        });

        let obj = JsExpr::Object(JsObjectExpression {
            properties: vec![getter, setter],
        });

        let arrow_fn = arrow(&arena, vec![], obj);
        let prog = program(vec![const_decl(
            &arena,
            "double",
            call(
                &arena,
                JsExpr::Member(JsMemberExpression {
                    object: arena.alloc_expr(id("$")),
                    property: JsMemberProperty::Identifier("derived".into()),
                    computed: false,
                    optional: false,
                }),
                vec![arrow_fn],
            ),
        )]);

        let code = generate(&prog, &arena).unwrap();
        println!("Generated code: {}", code);

        // The arrow function body should be wrapped in parentheses
        assert!(
            code.contains("() => ({") || code.contains("()=>({"),
            "Object literal with getters in arrow function should be wrapped in parentheses: {}",
            code
        );
    }

    #[test]
    fn test_logical_inside_binary_needs_parens() {
        let arena = JsArena::new();
        // Bug: `(a ?? b) > 0` lost parentheses because binary_operand_needs_parens
        // didn't handle JsExpr::Logical operands.
        // This caused: "Nullish coalescing operator(??) requires parens when mixing
        // with logical operators" at build time.
        let logical = JsExpr::Logical(JsLogicalExpression {
            operator: JsLogicalOp::NullishCoalescing,
            left: arena.alloc_expr(id("a")),
            right: arena.alloc_expr(number(0.0)),
        });
        let binary_expr = JsExpr::Binary(JsBinaryExpression {
            operator: JsBinaryOp::Gt,
            left: arena.alloc_expr(logical),
            right: arena.alloc_expr(number(0.0)),
        });
        let prog = program(vec![const_decl(&arena, "x", binary_expr)]);
        let code = generate(&prog, &arena).unwrap();
        println!("Generated code: {}", code);
        assert!(
            code.contains("(a ?? 0) > 0"),
            "Logical expression inside binary should be wrapped in parens: {}",
            code
        );
    }

    #[test]
    fn test_logical_or_inside_binary_needs_parens() {
        let arena = JsArena::new();
        let logical = JsExpr::Logical(JsLogicalExpression {
            operator: JsLogicalOp::Or,
            left: arena.alloc_expr(id("a")),
            right: arena.alloc_expr(id("b")),
        });
        let binary_expr = JsExpr::Binary(JsBinaryExpression {
            operator: JsBinaryOp::Add,
            left: arena.alloc_expr(logical),
            right: arena.alloc_expr(number(1.0)),
        });
        let prog = program(vec![const_decl(&arena, "x", binary_expr)]);
        let code = generate(&prog, &arena).unwrap();
        assert!(
            code.contains("(a || b) + 1"),
            "Logical OR inside binary should be wrapped in parens: {}",
            code
        );
    }

    // H-007: `await`/`void` must parenthesise low-precedence operands.
    #[test]
    fn test_await_parenthesises_binary_operand() {
        let arena = JsArena::new();
        let await_e = await_expr(&arena, binary(&arena, JsBinaryOp::Add, id("a"), id("b")));
        let code = generate_expr(&await_e, &arena);
        assert_eq!(code, "await (a + b)", "got: {code}");
    }

    #[test]
    fn test_void_parenthesises_binary_operand() {
        let arena = JsArena::new();
        let inner = arena.alloc_expr(binary(&arena, JsBinaryOp::Add, id("a"), id("b")));
        let code = generate_expr(&JsExpr::Void(inner), &arena);
        assert_eq!(code, "void (a + b)", "got: {code}");
    }

    // H-008: object-method shorthand keeps `async` / generator markers.
    #[test]
    fn test_method_shorthand_preserves_async_and_generator() {
        let arena = JsArena::new();
        let async_fn = JsExpr::Function(JsFunctionExpression {
            id: None,
            params: smallvec::smallvec![],
            body: JsBlockStatement::with_body(vec![]),
            is_async: true,
            is_generator: false,
        });
        let gen_fn = JsExpr::Function(JsFunctionExpression {
            id: None,
            params: smallvec::smallvec![],
            body: JsBlockStatement::with_body(vec![]),
            is_async: false,
            is_generator: true,
        });
        let obj = JsExpr::Object(JsObjectExpression {
            properties: vec![
                JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier("load".into()),
                    value: arena.alloc_expr(async_fn),
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                    method: true,
                }),
                JsObjectMember::Property(JsProperty {
                    key: JsPropertyKey::Identifier("gen".into()),
                    value: arena.alloc_expr(gen_fn),
                    kind: JsPropertyKind::Init,
                    computed: false,
                    shorthand: false,
                    method: true,
                }),
            ],
        });
        let code = generate_expr(&obj, &arena);
        assert!(code.contains("async load("), "got: {code}");
        assert!(code.contains("*gen("), "got: {code}");
    }

    // H-009: `new` / member object parenthesisation for low-precedence forms.
    #[test]
    fn test_new_parenthesises_conditional_callee() {
        let arena = JsArena::new();
        let new_e = new_expr(
            &arena,
            conditional(&arena, id("a"), id("B"), id("C")),
            vec![],
        );
        let code = generate_expr(&new_e, &arena);
        assert_eq!(code, "new (a ? B : C)()", "got: {code}");
    }

    #[test]
    fn test_member_parenthesises_arrow_object() {
        let arena = JsArena::new();
        let m = member(
            &arena,
            arrow(&arena, vec![id_pattern("x")], id("x")),
            "prop",
        );
        let code = generate_expr(&m, &arena);
        assert_eq!(code, "((x) => x).prop", "got: {code}");
    }

    // H-010: class expression emits its body, not an empty `{}`.
    #[test]
    fn test_class_expression_emits_body() {
        let arena = JsArena::new();
        let method = JsClassMember::Method(JsMethodDefinition {
            key: JsPropertyKey::Identifier("foo".into()),
            value: JsFunctionExpression {
                id: None,
                params: smallvec::smallvec![],
                body: JsBlockStatement::with_body(vec![]),
                is_async: false,
                is_generator: false,
            },
            kind: JsMethodKind::Method,
            computed: false,
            is_static: false,
        });
        let field = JsClassMember::Property(JsPropertyDefinition {
            key: JsPropertyKey::Identifier("count".into()),
            value: Some(arena.alloc_expr(number(0.0))),
            computed: false,
            is_static: true,
        });
        let class = JsExpr::Class(JsClassExpression {
            id: Some("Thing".into()),
            super_class: None,
            body: JsClassBody {
                body: vec![method, field],
            },
        });
        let code = generate_expr(&class, &arena);
        assert!(code.contains("class Thing {"), "got: {code}");
        assert!(code.contains("foo()"), "got: {code}");
        assert!(code.contains("static count = 0;"), "got: {code}");
        assert!(!code.contains("class Thing {}"), "body dropped: {code}");
    }
}
