//! Async instance body splitting.
//!
//! Transforms an already-transformed instance script body to separate sync and async parts.
//! The instance script body is split at the first top-level `await` expression.
//! Statements before the first await (and function declarations) go to the sync section.
//! Statements after the first await go to the async section, wrapped in thunks.
//!
//! Corresponds to `transform_body()` in `svelte/packages/svelte/src/compiler/phases/3-transform/shared/transform-async.js`

/// Result of the async body transformation.
pub struct AsyncBodyResult {
    /// The transformed script with sync statements, hoisted var declarations, and $$promises
    pub output: String,
    /// Mapping from variable names to their promise indices in $$promises.
    /// e.g., if `condition` is assigned in the 2nd thunk (index 1), then
    /// `blocker_map["condition"] = 1`.
    pub blocker_map: std::collections::HashMap<String, usize>,
}

/// Pre-compute the blocker map from raw instance script content.
///
/// This performs a lightweight analysis to determine which variables are
/// declared after the first `await` expression and assigns them blocker indices.
/// The map can then be used during template generation to determine which
/// expressions need `$.async()` wrapping.
///
/// This should be called BEFORE template generation but doesn't need the fully
/// transformed script - it works on the raw instance script content.
pub fn compute_blocker_map(raw_script: &str) -> std::collections::HashMap<String, usize> {
    let trimmed = raw_script.trim();
    if trimmed.is_empty() || !has_top_level_await(trimmed) {
        return std::collections::HashMap::new();
    }

    let statements = split_top_level_statements(trimmed);

    // First pass: collect all declared variable names from the entire script.
    // This is used to identify which referenced identifiers are instance-scope variables.
    let all_declared_vars = collect_all_declared_variables(&statements);

    // Collect function bodies by name for transitive dependency resolution.
    // When a function is called from an async thunk, all variables referenced in that
    // function's body should also be considered blocked (the official compiler traces
    // mutations through function calls via its AST-based dependency analysis).
    let function_bodies = collect_function_bodies(&statements);

    let mut found_await = false;
    let mut blocker_map = std::collections::HashMap::new();
    let mut async_index: usize = 0;

    for stmt in &statements {
        let trimmed_stmt = stmt.trim();
        if trimmed_stmt.is_empty() {
            continue;
        }

        // Skip single-line comments (// ...) - they should not affect blocker indices
        if trimmed_stmt.starts_with("//") {
            continue;
        }

        let has_await_in_stmt = has_top_level_await_in_statement(trimmed_stmt);

        // Function declarations always go to sync (hoisted)
        if is_function_declaration(trimmed_stmt) {
            continue;
        }

        // Function variable declarations always go to sync (hoisted like function declarations)
        if is_function_var_declaration(trimmed_stmt) {
            continue;
        }

        if !found_await && !has_await_in_stmt {
            // Sync statement, no blocker needed
            continue;
        }

        found_await = true;

        // Skip props_id declarations
        if is_variable_declaration(trimmed_stmt) && is_props_id_declaration(trimmed_stmt) {
            continue;
        }

        if is_variable_declaration(trimmed_stmt) {
            let decls = extract_var_declarations(trimmed_stmt);
            let current_async_index = async_index;
            for decl in &decls {
                if decl.hoist_only {
                    continue;
                }
                // Each variable's blocker is its own thunk index.
                // Templates reference $$promises[idx] which resolves when
                // the thunk (and all prior thunks) complete.
                blocker_map.insert(decl.name.clone(), async_index);
                async_index += 1;
            }

            // Also add referenced variables that are instance-scope declarations.
            // This mimics the official compiler's trace_references which walks
            // CallExpressions with touch() and adds all referenced bindings to writes.
            // Allow overwriting existing entries with higher indices - the official
            // compiler overwrites binding.blocker when a later statement references
            // the same variable.
            let referenced_ids = extract_all_identifiers_from_statement(trimmed_stmt);
            for ref_id in &referenced_ids {
                if all_declared_vars.contains(ref_id) {
                    let should_update = match blocker_map.get(ref_id) {
                        None => true,
                        Some(&existing) => current_async_index > existing,
                    };
                    if should_update {
                        blocker_map.insert(ref_id.clone(), current_async_index);
                    }
                }
            }

            // Transitively resolve function calls: if a function is called in this
            // async thunk, all instance-scope variables referenced in that function's
            // body should also be considered blocked.
            resolve_transitive_function_deps(
                trimmed_stmt,
                &function_bodies,
                &all_declared_vars,
                &mut blocker_map,
                current_async_index,
            );
        } else {
            // Non-declaration async statement (e.g., bare expression with await)
            let current_async_index = async_index;
            async_index += 1;

            // Skip $effect calls for blocker tracking - the official compiler's
            // trace_references skips $effect calls because effects only run after
            // async work completes. But $effect.pre is NOT skipped.
            // After transformation: $effect -> $.user_effect, $effect.pre -> $.user_pre_effect
            if is_user_effect_call(trimmed_stmt) {
                continue;
            }

            // For non-$effect statements, trace all referenced identifiers and
            // update their blocker indices. Allow overwriting with higher indices
            // to match the official compiler's behavior.
            let referenced_ids = extract_all_identifiers_from_statement(trimmed_stmt);
            for ref_id in &referenced_ids {
                if all_declared_vars.contains(ref_id) {
                    let should_update = match blocker_map.get(ref_id) {
                        None => true,
                        Some(&existing) => current_async_index > existing,
                    };
                    if should_update {
                        blocker_map.insert(ref_id.clone(), current_async_index);
                    }
                }
            }
            resolve_transitive_function_deps(
                trimmed_stmt,
                &function_bodies,
                &all_declared_vars,
                &mut blocker_map,
                current_async_index,
            );
        }
    }

    // Post-processing: add function names to the blocker_map if their bodies
    // transitively reference any blocked variable. This ensures that template
    // expressions like `checkedFactory()()` get properly detected by
    // `find_expression_blockers` when `checkedFactory` closures over a blocked variable.
    let mut changed = true;
    while changed {
        changed = false;
        for (func_name, func_body) in &function_bodies {
            if blocker_map.contains_key(func_name) {
                continue;
            }
            let body_ids = extract_all_identifiers_from_statement(func_body);
            for body_id in &body_ids {
                if let Some(&idx) = blocker_map.get(body_id) {
                    blocker_map.insert(func_name.clone(), idx);
                    changed = true;
                    break;
                }
            }
        }
    }

    blocker_map
}

/// Enrich the blocker_map with transitive function dependencies.
///
/// After `transform_async_body` produces a blocker_map mapping variable names to
/// thunk indices, this function scans function/const declarations in the transformed
/// script for references to blocked variables. If a function body references a blocked
/// variable (directly or transitively through other functions), the function name is
/// added to the blocker_map with the same thunk index.
///
/// This is needed because template expressions may call functions that transitively
/// access blocked state. For example:
/// ```js
/// const checkedFactory = () => { return () => $.get(checked); }
/// ```
/// If `checked` is in the blocker_map, `checkedFactory` should be too.
///
/// Similarly, for indirect chains:
/// ```js
/// function x() { return $.get(value); }
/// function getValue() { return x(); }
/// ```
/// If `value` is blocked, then `x` is blocked, and transitively `getValue` is too.
pub fn enrich_blocker_map_with_transitive_deps(
    transformed_script: &str,
    blocker_map: &mut std::collections::HashMap<String, usize>,
) {
    if blocker_map.is_empty() {
        return;
    }

    // Split the transformed script into top-level statements and collect function bodies
    let statements = split_top_level_statements(transformed_script.trim());
    let function_bodies = collect_function_bodies(&statements);

    if function_bodies.is_empty() {
        return;
    }

    // Iteratively resolve transitive dependencies until no more changes
    let mut changed = true;
    while changed {
        changed = false;
        for (func_name, func_body) in &function_bodies {
            if blocker_map.contains_key(func_name) {
                continue;
            }
            let body_ids = extract_all_identifiers_from_statement(func_body);
            for body_id in &body_ids {
                if let Some(&idx) = blocker_map.get(body_id) {
                    blocker_map.insert(func_name.clone(), idx);
                    changed = true;
                    break;
                }
            }
        }
    }
}

/// Transform the instance script body for async components.
///
/// Takes the already-transformed script text (after rune transforms, etc.)
/// and splits it at the first top-level `await`.
///
/// # Arguments
/// * `script` - The already-transformed instance script text
/// * `runner` - The runner expression (e.g., "$.run" for client, "$$renderer.run" for server)
///
/// # Returns
/// The transformed script with sync/async split, or None if no top-level await found.
pub fn transform_async_body(script: &str, runner: &str) -> Option<AsyncBodyResult> {
    let trimmed = script.trim();
    if trimmed.is_empty() {
        return None;
    }

    // Check if the script has a top-level await
    if !has_top_level_await(trimmed) {
        return None;
    }

    // Split the script into top-level statements
    let statements = split_top_level_statements(trimmed);

    // Classify statements into sync and async groups
    let mut sync_stmts: Vec<String> = Vec::new();
    let mut async_stmts: Vec<AsyncStmt> = Vec::new();
    let mut hoisted_vars: Vec<String> = Vec::new();
    let mut found_await = false;

    for stmt in &statements {
        let trimmed_stmt = stmt.trim();
        if trimmed_stmt.is_empty() {
            continue;
        }

        // Strip leading single-line comment lines from the statement.
        // The statement splitter may combine a `// comment` line with the following
        // code line into one statement. We need to process the code, not skip it.
        let trimmed_stmt = {
            let mut s = trimmed_stmt;
            loop {
                if s.starts_with("//") {
                    // Skip to end of this comment line
                    if let Some(nl) = s.find('\n') {
                        s = s[nl + 1..].trim();
                    } else {
                        // Entire statement is a comment — skip
                        s = "";
                        break;
                    }
                } else {
                    break;
                }
            }
            s
        };
        if trimmed_stmt.is_empty() {
            continue;
        }

        let has_await = has_top_level_await_in_statement(trimmed_stmt);

        // Function declarations always go to sync (they are hoisted)
        if is_function_declaration(trimmed_stmt) {
            sync_stmts.push(stmt.clone());
            continue;
        }

        // If a declarator's init is an arrow function or function expression,
        // it goes to sync too (mirrors official compiler: these are like function declarations).
        // This applies REGARDLESS of whether we've found an await - function-like
        // declarations are always hoisted to the sync section.
        if is_function_var_declaration(trimmed_stmt) {
            sync_stmts.push(stmt.clone());
            continue;
        }

        if !found_await && !has_await {
            sync_stmts.push(stmt.clone());
        } else {
            found_await = true;

            // Special case: `const id = $.props_id($$renderer)` should stay as a sync
            // const declaration (it needs to be on the first line of the component).
            // This matches the official compiler where props_id is placed before the
            // async body transform.
            if is_variable_declaration(trimmed_stmt) && is_props_id_declaration(trimmed_stmt) {
                sync_stmts.push(stmt.clone());
                continue;
            }

            // Handle async void noop placeholder (from $effect() removed on server)
            // Format: /* $$async_void_noop */
            if trimmed_stmt.contains("$$async_void_noop") {
                async_stmts.push(AsyncStmt {
                    kind: AsyncStmtKind::VoidNoop,
                    has_await: false,
                });
                continue;
            }

            // Handle async noop placeholder (from $props() that transformed to empty)
            // Format: /* $$async_noop */ or /* $$async_noop:var1,var2 */
            if trimmed_stmt.contains("$$async_noop") {
                // Extract variable names for hoisting if present
                if let Some(colon_pos) = trimmed_stmt.find("$$async_noop:") {
                    let start = colon_pos + "$$async_noop:".len();
                    if let Some(end) = trimmed_stmt[start..].find("*/") {
                        let vars_str = trimmed_stmt[start..start + end].trim();
                        for var in vars_str.split(',') {
                            let var = var.trim();
                            if !var.is_empty() {
                                hoisted_vars.push(var.to_string());
                            }
                        }
                    }
                }
                async_stmts.push(AsyncStmt {
                    kind: AsyncStmtKind::Noop,
                    has_await: false,
                });
                continue;
            }

            // Handle different statement types
            if is_variable_declaration(trimmed_stmt) {
                // Extract variable names and init expressions
                let decls = extract_var_declarations(trimmed_stmt);

                // Hoist all variable names
                for decl in &decls {
                    hoisted_vars.push(decl.name.clone());
                }

                // Separate non-hoist-only decls for thunk generation
                let active_decls: Vec<VarDecl> =
                    decls.into_iter().filter(|d| !d.hoist_only).collect();

                if active_decls.len() == 1 {
                    // Single declarator: use VarDecl as before
                    let decl = active_decls.into_iter().next().unwrap();
                    let has_await_in_init =
                        decl.init.as_ref().is_some_and(|i| has_await_in_expr(i));
                    async_stmts.push(AsyncStmt {
                        kind: AsyncStmtKind::VarDecl(decl),
                        has_await: has_await_in_init,
                    });
                } else if active_decls.len() > 1 {
                    // Multiple declarators from same statement: group into a block thunk.
                    // This handles patterns like:
                    //   let $$d = await ..., squared = ..., cubed = ...;
                    // which become:
                    //   async () => { var $$d = await ...; squared = ...; cubed = ...; }
                    let has_await = active_decls
                        .iter()
                        .any(|d| d.init.as_ref().is_some_and(|i| has_await_in_expr(i)));
                    async_stmts.push(AsyncStmt {
                        kind: AsyncStmtKind::VarDeclGroup(active_decls),
                        has_await,
                    });
                }
            } else if is_expression_statement(trimmed_stmt) {
                // Strip trailing semicolon to get the expression
                let expr = strip_trailing_semicolon(trimmed_stmt);
                let is_await_expr = is_await_expression(expr);

                if is_await_expr {
                    // Strip the `await` prefix to get the inner expression
                    let inner = strip_await_prefix(expr);
                    let inner_has_await = has_await_in_expr(inner);
                    if inner_has_await {
                        // async () => await <expr> (can't simplify)
                        async_stmts.push(AsyncStmt {
                            kind: AsyncStmtKind::ExprAwait(expr.to_string()),
                            has_await: true,
                        });
                    } else {
                        // unthunk optimization: async () => await <expr> -> () => <expr>
                        async_stmts.push(AsyncStmt {
                            kind: AsyncStmtKind::ExprSimple(inner.to_string()),
                            has_await: false,
                        });
                    }
                } else {
                    // Wrap in void for non-await expressions
                    async_stmts.push(AsyncStmt {
                        kind: AsyncStmtKind::ExprVoid(expr.to_string()),
                        has_await,
                    });
                }
            } else {
                // Other statements (throw, if, etc.) - wrap in block
                async_stmts.push(AsyncStmt {
                    kind: AsyncStmtKind::Block(trimmed_stmt.to_string()),
                    has_await,
                });
            }
        }
    }

    // If no async statements were created, no transformation needed
    if async_stmts.is_empty() {
        return None;
    }

    // Collect all declared variable names from the entire script for reference tracking.
    let all_declared_vars = collect_all_declared_variables(&statements);

    // Build blocker_map: variable name -> promise index
    // Each async statement gets a promise index (its position in the $.run() array).
    // Variables assigned in an async thunk are "blocked" by that promise.
    // Additionally, variables referenced in call expressions within async statements
    // get the same blocker (mimicking the official compiler's trace_references/touch).
    let mut blocker_map = std::collections::HashMap::new();

    for (idx, stmt) in async_stmts.iter().enumerate() {
        match &stmt.kind {
            AsyncStmtKind::VarDecl(decl) => {
                if decl.hoist_only {
                    continue;
                }
                // Each variable's blocker is its own thunk index.
                // Templates reference $$promises[idx] which resolves when
                // the thunk (and all prior thunks) complete.
                blocker_map.insert(decl.name.clone(), idx);

                // Also add referenced variables that are instance-scope declarations.
                // This mimics the official compiler's trace_references which walks
                // CallExpressions with touch() and adds all referenced bindings to writes.
                // Allow overwriting with higher indices.
                if let Some(init) = &decl.init {
                    let referenced_ids = extract_all_identifiers_from_statement(init);
                    for ref_id in &referenced_ids {
                        if all_declared_vars.contains(ref_id) {
                            let should_update = match blocker_map.get(ref_id) {
                                None => true,
                                Some(&existing) => idx > existing,
                            };
                            if should_update {
                                blocker_map.insert(ref_id.clone(), idx);
                            }
                        }
                    }
                }
            }
            AsyncStmtKind::ExprAwait(expr)
            | AsyncStmtKind::ExprSimple(expr)
            | AsyncStmtKind::ExprVoid(expr) => {
                // Skip $effect calls for blocker tracking (same as official compiler).
                // $effect.pre is NOT skipped.
                if is_user_effect_call(expr) {
                    continue;
                }
                // Non-declaration async statements can still reference instance-scope
                // variables, which should update their blocker indices.
                let referenced_ids = extract_all_identifiers_from_statement(expr);
                for ref_id in &referenced_ids {
                    if all_declared_vars.contains(ref_id) {
                        let should_update = match blocker_map.get(ref_id) {
                            None => true,
                            Some(&existing) => idx > existing,
                        };
                        if should_update {
                            blocker_map.insert(ref_id.clone(), idx);
                        }
                    }
                }
            }
            AsyncStmtKind::Block(block_text) => {
                // Block statements can also reference variables
                let referenced_ids = extract_all_identifiers_from_statement(block_text);
                for ref_id in &referenced_ids {
                    if all_declared_vars.contains(ref_id) {
                        let should_update = match blocker_map.get(ref_id) {
                            None => true,
                            Some(&existing) => idx > existing,
                        };
                        if should_update {
                            blocker_map.insert(ref_id.clone(), idx);
                        }
                    }
                }
            }
            AsyncStmtKind::VarDeclGroup(decls) => {
                // All variables in the group get the same blocker index
                for decl in decls {
                    if decl.hoist_only {
                        continue;
                    }
                    blocker_map.insert(decl.name.clone(), idx);
                    if let Some(init) = &decl.init {
                        let referenced_ids = extract_all_identifiers_from_statement(init);
                        for ref_id in &referenced_ids {
                            if all_declared_vars.contains(ref_id) {
                                let should_update = match blocker_map.get(ref_id) {
                                    None => true,
                                    Some(&existing) => idx > existing,
                                };
                                if should_update {
                                    blocker_map.insert(ref_id.clone(), idx);
                                }
                            }
                        }
                    }
                }
            }
            AsyncStmtKind::Noop | AsyncStmtKind::VoidNoop => {
                // Noop statements don't contribute to blocker_map
            }
        }
    }

    // Build output
    let mut output = String::new();

    // Sync statements
    for stmt in &sync_stmts {
        let trimmed = stmt.trim();
        if !trimmed.is_empty() {
            output.push_str(trimmed);
            output.push('\n');
        }
    }

    // Hoisted var declarations
    if !hoisted_vars.is_empty() {
        output.push_str("var ");
        output.push_str(&hoisted_vars.join(", "));
        output.push_str(";\n");
    }

    // Build thunks
    let mut thunks: Vec<String> = Vec::new();
    for stmt in &async_stmts {
        let thunk = build_thunk(stmt);
        thunks.push(thunk);
    }

    // Build $$promises = runner([thunks])
    if thunks.len() == 1 {
        output.push_str(&format!("var $$promises = {}([{}]);\n", runner, thunks[0]));
    } else {
        output.push_str(&format!("var $$promises = {}([\n", runner));
        for (i, thunk) in thunks.iter().enumerate() {
            output.push_str(&format!("\t{}", thunk));
            if i < thunks.len() - 1 {
                output.push(',');
            }
            output.push('\n');
        }
        output.push_str("]);\n");
    }

    Some(AsyncBodyResult {
        output,
        blocker_map,
    })
}

struct VarDecl {
    name: String,
    init: Option<String>,
    /// If true, this is a destructuring assignment and the init is the full
    /// destructuring expression (e.g., `({ a, b } = expr)`). The thunk should
    /// use the init directly, not wrap it in `name = init`.
    is_destructure_assignment: bool,
    /// If true, this declaration is just for hoisting the variable name
    /// and should not produce a thunk.
    hoist_only: bool,
}

enum AsyncStmtKind {
    /// Variable declaration: `let x = expr;` -> `() => x = expr`
    VarDecl(VarDecl),
    /// Group of variable declarations from a multi-declarator statement.
    /// E.g., `let $$d = await ..., squared = ..., cubed = ...;`
    /// Generates a block thunk: `async () => { var $$d = await ...; squared = ...; cubed = ...; }`
    /// Variables starting with `$$` get `var` declarations, others get assignments.
    VarDeclGroup(Vec<VarDecl>),
    /// Expression statement that was `await expr` -> `() => expr` (await stripped, simplified)
    ExprSimple(String),
    /// Expression statement that was `await expr` with nested await -> `async () => await expr`
    ExprAwait(String),
    /// Expression statement (non-await) -> `() => void expr`
    ExprVoid(String),
    /// Other statement -> `() => { stmt }`
    Block(String),
    /// Empty thunk placeholder (from $props() that was removed) -> `() => {}`
    Noop,
    /// Void noop placeholder (from $effect() removed on server) -> `() => void void 0`
    VoidNoop,
}

struct AsyncStmt {
    kind: AsyncStmtKind,
    has_await: bool,
}

fn build_thunk(stmt: &AsyncStmt) -> String {
    match &stmt.kind {
        AsyncStmtKind::VarDecl(decl) => {
            if decl.hoist_only {
                return String::new();
            }
            let init = decl.init.as_deref().unwrap_or("void 0");
            let assignment = if decl.is_destructure_assignment {
                init.to_string()
            } else {
                format!("{} = {}", decl.name, init)
            };
            if stmt.has_await {
                format!("async () => {}", assignment)
            } else {
                format!("() => {}", assignment)
            }
        }
        AsyncStmtKind::VarDeclGroup(decls) => {
            // Build a block with each declarator as a statement.
            // Names starting with `$$` get `var` declarations (they are intermediate),
            // others get assignments (they were hoisted).
            let mut body_lines: Vec<String> = Vec::new();
            for decl in decls {
                if decl.hoist_only {
                    continue;
                }
                let init = decl.init.as_deref().unwrap_or("void 0");
                if decl.is_destructure_assignment {
                    body_lines.push(format!("{};", init));
                } else if decl.name.starts_with("$$") {
                    // Intermediate variable: use var declaration
                    body_lines.push(format!("var {} = {};", decl.name, init));
                } else {
                    // Hoisted variable: use assignment
                    body_lines.push(format!("{} = {};", decl.name, init));
                }
            }
            let body = body_lines.join("\n\t\t");
            if stmt.has_await {
                format!("async () => {{\n\t\t{}\n\t}}", body)
            } else {
                format!("() => {{\n\t\t{}\n\t}}", body)
            }
        }
        AsyncStmtKind::ExprSimple(expr) => {
            format!("() => {}", expr)
        }
        AsyncStmtKind::ExprAwait(expr) => {
            format!("async () => {}", expr)
        }
        AsyncStmtKind::ExprVoid(expr) => {
            // Always wrap the expression in parens after `void` to handle cases
            // like `void (y = await ...)` which would be invalid without parens.
            // This matches the official compiler's b.unary('void', expression) behavior.
            if stmt.has_await {
                format!("async () => void ({})", expr)
            } else {
                format!("() => void ({})", expr)
            }
        }
        AsyncStmtKind::Block(block) => {
            if stmt.has_await {
                format!("async () => {{\n\t\t{}\n\t}}", block)
            } else {
                format!("() => {{\n\t\t{}\n\t}}", block)
            }
        }
        AsyncStmtKind::Noop => "() => {}".to_string(),
        AsyncStmtKind::VoidNoop => "() => void void 0".to_string(),
    }
}

/// Check if a statement (not looking into nested functions) contains a top-level `await`.
fn has_top_level_await(s: &str) -> bool {
    has_await_at_depth(s, true)
}

fn has_top_level_await_in_statement(s: &str) -> bool {
    has_await_at_depth(s, true)
}

/// Check if a string contains `await` at the current nesting level
/// (not inside nested functions).
fn has_await_at_depth(s: &str, skip_functions: bool) -> bool {
    let bytes = s.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut brace_depth: i32 = 0;
    let mut _paren_depth: i32 = 0;
    let mut function_depth: i32 = 0;

    while i < len {
        let ch = bytes[i];

        // Skip string literals
        if ch == b'\'' || ch == b'"' || ch == b'`' {
            i = skip_string(bytes, i);
            continue;
        }

        // Skip single-line comments
        if ch == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }

        // Skip multi-line comments
        if ch == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Track nesting
        if ch == b'(' {
            _paren_depth += 1;
        } else if ch == b')' {
            _paren_depth -= 1;
        } else if ch == b'{' {
            brace_depth += 1;
        } else if ch == b'}' {
            brace_depth -= 1;
            if brace_depth < function_depth {
                function_depth = brace_depth;
            }
        }

        // Detect function/arrow boundaries
        if skip_functions && function_depth == 0 {
            // Check for `function ` or `function(`
            if ch == b'f' && i + 8 <= len && &s[i..i + 8] == "function" {
                let next = if i + 8 < len { bytes[i + 8] } else { 0 };
                if next == b' ' || next == b'(' || next == b'*' {
                    // This is a function declaration/expression - skip inside it
                    // Find the opening brace
                    let save_i = i;
                    i += 8;
                    while i < len && bytes[i] != b'{' {
                        if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
                            i = skip_string(bytes, i);
                            continue;
                        }
                        i += 1;
                    }
                    if i < len {
                        // Skip the body of the function
                        let mut depth = 1i32;
                        i += 1;
                        while i < len && depth > 0 {
                            let c = bytes[i];
                            if c == b'\'' || c == b'"' || c == b'`' {
                                i = skip_string(bytes, i);
                                continue;
                            }
                            if c == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
                                while i < len && bytes[i] != b'\n' {
                                    i += 1;
                                }
                                continue;
                            }
                            if c == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
                                i += 2;
                                while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                                    i += 1;
                                }
                                i += 2;
                                continue;
                            }
                            if c == b'{' {
                                depth += 1;
                            } else if c == b'}' {
                                depth -= 1;
                            }
                            i += 1;
                        }
                        continue;
                    } else {
                        i = save_i + 1;
                        continue;
                    }
                }
            }

            // Check for arrow function: `=>` followed by block or expression
            // We need to be careful - `=>` should only create a function boundary
            // if we're inside a `(params) =>` or `param =>` context.
            // For now, we handle this by tracking when we see `=> {`
            if ch == b'=' && i + 1 < len && bytes[i + 1] == b'>' {
                // Skip the arrow
                i += 2;
                // Skip whitespace
                while i < len && (bytes[i] == b' ' || bytes[i] == b'\n' || bytes[i] == b'\t') {
                    i += 1;
                }
                if i < len && bytes[i] == b'{' {
                    // Arrow with block body - skip the entire block
                    let mut depth = 1i32;
                    i += 1;
                    while i < len && depth > 0 {
                        let c = bytes[i];
                        if c == b'\'' || c == b'"' || c == b'`' {
                            i = skip_string(bytes, i);
                            continue;
                        }
                        if c == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
                            while i < len && bytes[i] != b'\n' {
                                i += 1;
                            }
                            continue;
                        }
                        if c == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
                            i += 2;
                            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                                i += 1;
                            }
                            i += 2;
                            continue;
                        }
                        if c == b'{' {
                            depth += 1;
                        } else if c == b'}' {
                            depth -= 1;
                        }
                        i += 1;
                    }
                    continue;
                }
                // Arrow with expression body - continue normally
                // The expression might contain await which we want to detect
                continue;
            }
        }

        // Check for `await` keyword at top level (not inside nested functions).
        // Note: we only check function_depth, NOT brace_depth, because `await` inside
        // an object literal (e.g., `let d = { value: await promise }`) is still at the
        // statement's top level and requires async handling.
        if function_depth == 0 && ch == b'a' && i + 5 <= len && &s[i..i + 5] == "await" {
            // Make sure it's a word boundary
            let before_ok = i == 0 || !is_ident_char(bytes[i - 1]);
            let after = if i + 5 < len { bytes[i + 5] } else { 0 };
            let after_ok = !is_ident_char(after);
            if before_ok && after_ok {
                return true;
            }
        }

        i += 1;
    }

    false
}

/// Check if an expression contains `await` (including in nested contexts, but not in nested functions)
fn has_await_in_expr(s: &str) -> bool {
    has_await_at_depth(s, true)
}

fn is_ident_char(c: u8) -> bool {
    c.is_ascii_alphanumeric() || c == b'_' || c == b'$'
}

/// Skip a string literal (single-quoted, double-quoted, or template literal).
/// Returns the index after the closing quote.
fn skip_string(bytes: &[u8], start: usize) -> usize {
    let quote = bytes[start];
    let mut i = start + 1;
    let len = bytes.len();

    if quote == b'`' {
        // Template literal - handle ${} interpolations
        while i < len {
            if bytes[i] == b'\\' {
                i += 2;
                continue;
            }
            if bytes[i] == b'`' {
                return i + 1;
            }
            if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                // Skip interpolation
                i += 2;
                let mut depth = 1i32;
                while i < len && depth > 0 {
                    if bytes[i] == b'{' {
                        depth += 1;
                    } else if bytes[i] == b'}' {
                        depth -= 1;
                    } else if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
                        i = skip_string(bytes, i);
                        continue;
                    }
                    i += 1;
                }
                continue;
            }
            i += 1;
        }
    } else {
        // Single or double quoted string
        while i < len {
            if bytes[i] == b'\\' {
                i += 2;
                continue;
            }
            if bytes[i] == quote {
                return i + 1;
            }
            i += 1;
        }
    }

    i
}

/// Split a script into top-level statements.
/// This handles semicolons, braces, and multi-line statements.
fn split_top_level_statements(script: &str) -> Vec<String> {
    let mut statements: Vec<String> = Vec::new();
    let bytes = script.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut stmt_start = 0;

    // Track nesting depth
    let mut brace_depth: i32 = 0;
    let mut paren_depth: i32 = 0;
    let mut bracket_depth: i32 = 0;

    while i < len {
        let ch = bytes[i];

        // Skip string literals
        if ch == b'\'' || ch == b'"' || ch == b'`' {
            i = skip_string(bytes, i);
            continue;
        }

        // Skip single-line comments
        if ch == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }

        // Skip multi-line comments
        if ch == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Track nesting
        match ch {
            b'(' => paren_depth += 1,
            b')' => {
                paren_depth -= 1;
                // After closing paren at top level, check if next line starts a new statement
                if brace_depth == 0
                    && paren_depth == 0
                    && bracket_depth == 0
                    && is_stmt_boundary_after(script, i + 1)
                {
                    let stmt = script[stmt_start..=i].trim().to_string();
                    if !stmt.is_empty() {
                        statements.push(stmt);
                    }
                    i += 1;
                    // Skip whitespace
                    while i < len
                        && (bytes[i] == b' '
                            || bytes[i] == b'\n'
                            || bytes[i] == b'\t'
                            || bytes[i] == b'\r'
                            || bytes[i] == b';')
                    {
                        i += 1;
                    }
                    stmt_start = i;
                    continue;
                }
            }
            b'[' => bracket_depth += 1,
            b']' => bracket_depth -= 1,
            b'{' => brace_depth += 1,
            b'}' => {
                brace_depth -= 1;
                // If we close a top-level brace (function body, class body, block),
                // that ends a statement.
                // BUT: if the current statement starts with a variable declaration
                // keyword (let/const/var), the `{}` is a destructuring pattern or
                // object literal, not a block - so don't split here.
                // Also don't split if the `{}` is part of an object expression
                // (e.g., `const some = { fn: () => {} }`)
                if brace_depth == 0 && paren_depth == 0 && bracket_depth == 0 {
                    let stmt_so_far = script[stmt_start..=i].trim();
                    let is_block_end = !stmt_so_far.starts_with("let ")
                        && !stmt_so_far.starts_with("const ")
                        && !stmt_so_far.starts_with("var ")
                        && !stmt_so_far.starts_with("return ")
                        // Expression statements with object patterns (assignments)
                        && !is_object_expr_context(stmt_so_far);
                    if is_block_end {
                        // Check if the next token is `catch` or `finally` - if so,
                        // this is a try-catch/try-finally and should NOT be split here.
                        let mut peek = i + 1;
                        while peek < len
                            && (bytes[peek] == b' '
                                || bytes[peek] == b'\n'
                                || bytes[peek] == b'\t'
                                || bytes[peek] == b'\r')
                        {
                            peek += 1;
                        }
                        let rest_after = &script[peek..];
                        let is_try_continuation = rest_after.starts_with("catch ")
                            || rest_after.starts_with("catch(")
                            || rest_after.starts_with("catch{")
                            || rest_after.starts_with("catch\n")
                            || rest_after.starts_with("finally ")
                            || rest_after.starts_with("finally{")
                            || rest_after.starts_with("finally\n");
                        if !is_try_continuation {
                            let stmt = stmt_so_far.to_string();
                            if !stmt.is_empty() {
                                statements.push(stmt);
                            }
                            // Skip any trailing semicolons or whitespace
                            i += 1;
                            while i < len
                                && (bytes[i] == b';'
                                    || bytes[i] == b' '
                                    || bytes[i] == b'\n'
                                    || bytes[i] == b'\t'
                                    || bytes[i] == b'\r')
                            {
                                i += 1;
                            }
                            stmt_start = i;
                            continue;
                        }
                    }
                }
            }
            _ => {}
        }

        // Semicolon at top level marks end of statement
        if ch == b';' && brace_depth == 0 && paren_depth == 0 && bracket_depth == 0 {
            let stmt = script[stmt_start..=i].trim().to_string();
            if !stmt.is_empty() {
                statements.push(stmt);
            }
            i += 1;
            stmt_start = i;
            continue;
        }

        // Newline at top level - check if next line starts a new statement
        // This handles ASI (Automatic Semicolon Insertion) cases
        if ch == b'\n'
            && brace_depth == 0
            && paren_depth == 0
            && bracket_depth == 0
            && is_stmt_boundary_after(script, i + 1)
        {
            let stmt = script[stmt_start..i].trim().to_string();
            if !stmt.is_empty() {
                statements.push(stmt);
            }
            i += 1;
            // Skip whitespace
            while i < len
                && (bytes[i] == b' ' || bytes[i] == b'\n' || bytes[i] == b'\t' || bytes[i] == b'\r')
            {
                i += 1;
            }
            stmt_start = i;
            continue;
        }

        i += 1;
    }

    // Handle any remaining text
    let remaining = script[stmt_start..].trim();
    if !remaining.is_empty() {
        statements.push(remaining.to_string());
    }

    statements
}

/// Check if the text after position `pos` starts a new statement keyword.
/// This handles ASI (Automatic Semicolon Insertion) cases where no semicolon
/// is present but a new statement begins on the next line.
fn is_stmt_boundary_after(script: &str, pos: usize) -> bool {
    let bytes = script.as_bytes();
    let len = bytes.len();
    let mut i = pos;

    // Skip whitespace
    while i < len
        && (bytes[i] == b' ' || bytes[i] == b'\n' || bytes[i] == b'\t' || bytes[i] == b'\r')
    {
        i += 1;
    }

    if i >= len {
        return false;
    }

    // Check for statement-starting keywords
    let rest = &script[i..];
    rest.starts_with("let ")
        || rest.starts_with("const ")
        || rest.starts_with("var ")
        || rest.starts_with("function ")
        || rest.starts_with("function*")
        || rest.starts_with("async function ")
        || rest.starts_with("class ")
        || rest.starts_with("if ")
        || rest.starts_with("if(")
        || rest.starts_with("for ")
        || rest.starts_with("for(")
        || rest.starts_with("while ")
        || rest.starts_with("while(")
        || rest.starts_with("switch ")
        || rest.starts_with("switch(")
        || rest.starts_with("try ")
        || rest.starts_with("try{")
        || rest.starts_with("return ")
        || rest.starts_with("return;")
        || rest.starts_with("throw ")
        || rest.starts_with("await ")
        || rest.starts_with("import ")
        || rest.starts_with("export ")
        || rest.starts_with("$.")  // $.effect, $.state, etc.
        || rest.starts_with("//")
        || rest.starts_with("/*")
}

/// Check if the statement so far is in an object expression context
/// (i.e., the `{}` is an object literal or part of an assignment, not a block).
/// This is used to prevent the statement splitter from treating `}` as a block end
/// when it's part of an object pattern or literal.
fn is_object_expr_context(stmt: &str) -> bool {
    // If the last `{` was preceded by `=`, `(`, `,`, `:`, `=>`, or `return`,
    // then the brace is an object literal / destructuring, not a block.
    let bytes = stmt.as_bytes();
    let len = bytes.len();

    // Find the position of the first `{` at the top level
    let mut i = 0;
    while i < len {
        let ch = bytes[i];
        if ch == b'\'' || ch == b'"' || ch == b'`' {
            i = skip_string(bytes, i);
            continue;
        }
        if ch == b'{' {
            // Check what precedes this brace
            let before = stmt[..i].trim_end();
            if before.ends_with('=')
                || before.ends_with('(')
                || before.ends_with(',')
                || before.ends_with(':')
                || before.ends_with("=>")
                || before.ends_with("return")
            {
                return true;
            }
            break;
        }
        i += 1;
    }

    false
}

/// Check if a variable declaration is `const/let/var id = $.props_id($$renderer)`.
/// This needs to stay as a sync declaration before $$promises.
fn is_props_id_declaration(s: &str) -> bool {
    let s = s.trim();
    // Check for pattern: const/let/var <name> = $.props_id(...) or $props.id()
    if let Some(rest) = s
        .strip_prefix("const ")
        .or_else(|| s.strip_prefix("let "))
        .or_else(|| s.strip_prefix("var "))
    {
        let rest = rest.trim();
        if let Some(eq_pos) = rest.find('=') {
            let rhs = rest[eq_pos + 1..].trim();
            let rhs = rhs.strip_suffix(';').unwrap_or(rhs).trim();
            return rhs == "$.props_id($$renderer)"
                || rhs == "$.props_id()"
                || rhs == "$props.id()";
        }
    }
    false
}

/// Check if a statement is a function declaration.
fn is_function_declaration(s: &str) -> bool {
    let s = s.trim();
    s.starts_with("function ") || s.starts_with("function*") || s.starts_with("async function ")
}

/// Check if a variable declaration's init is a function expression or arrow function.
fn is_function_var_declaration(s: &str) -> bool {
    let s = s.trim();
    if !s.starts_with("let ") && !s.starts_with("const ") && !s.starts_with("var ") {
        return false;
    }
    // Look for = followed by function or arrow
    if let Some(eq_pos) = find_assignment_in_decl(s) {
        let after_eq = s[eq_pos + 1..].trim();
        after_eq.starts_with("function ")
            || after_eq.starts_with("function(")
            || after_eq.starts_with("(")  // potential arrow function
            || after_eq.starts_with("async function")
            // Simple arrow: `x =>`  - check if it's an identifier followed by =>
            || {
                let bytes = after_eq.as_bytes();
                let mut j = 0;
                while j < bytes.len() && is_ident_char(bytes[j]) {
                    j += 1;
                }
                j > 0 && j < bytes.len() && after_eq[j..].trim_start().starts_with("=>")
            }
    } else {
        false
    }
}

/// Check if a statement is a variable declaration.
fn is_variable_declaration(s: &str) -> bool {
    let s = s.trim();
    s.starts_with("let ") || s.starts_with("const ") || s.starts_with("var ")
}

/// Check if a statement is a `$effect(...)` or `$.user_effect(...)` call.
/// The official compiler skips `$effect` calls in `trace_references` because effects only run
/// after async work completes. `$effect.pre` (transformed to `$.user_pre_effect`) is NOT skipped.
/// This function works on both raw (pre-transformation) and transformed script text.
fn is_user_effect_call(s: &str) -> bool {
    let s = s.trim();
    // Strip trailing semicolons for matching
    let s = s.strip_suffix(';').unwrap_or(s).trim();
    // After transformation, $effect(...) becomes $.user_effect(...)
    // and may be wrapped in `void` e.g. `void $.user_effect(...)`
    let check = if let Some(rest) = s.strip_prefix("void ") {
        rest.trim()
    } else {
        s
    };
    // Match $effect( or $.user_effect( but NOT $effect.pre( or $.user_pre_effect(
    if check.starts_with("$effect.pre(") || check.starts_with("$.user_pre_effect(") {
        return false;
    }
    check.starts_with("$effect(") || check.starts_with("$.user_effect(")
}

/// Check if a statement is an expression statement (not a declaration, not a control structure).
fn is_expression_statement(s: &str) -> bool {
    let s = s.trim();
    // Not a declaration
    if s.starts_with("let ") || s.starts_with("const ") || s.starts_with("var ") {
        return false;
    }
    // Not a function/class declaration
    if s.starts_with("function ") || s.starts_with("async function ") || s.starts_with("class ") {
        return false;
    }
    // Not a control structure
    if s.starts_with("if ")
        || s.starts_with("for ")
        || s.starts_with("while ")
        || s.starts_with("switch ")
        || s.starts_with("try ")
        || s.starts_with("return ")
        || s.starts_with("throw ")
    {
        // "throw" is a statement, not an expression
        // But it CAN be wrapped in a block thunk
        return false;
    }
    true
}

/// Check if an expression starts with `await`.
fn is_await_expression(s: &str) -> bool {
    let s = s.trim();
    if s.starts_with("await ") || s.starts_with("await\n") || s.starts_with("await\t") {
        return true;
    }
    // `await(` - rare but valid
    if s.starts_with("await(") {
        return true;
    }
    false
}

/// Strip `await ` prefix from an expression.
fn strip_await_prefix(s: &str) -> &str {
    let s = s.trim();
    if let Some(rest) = s
        .strip_prefix("await ")
        .or_else(|| s.strip_prefix("await\n"))
        .or_else(|| s.strip_prefix("await\t"))
    {
        rest.trim_start()
    } else if let Some(rest) = s.strip_prefix("await") {
        // `await(` - keep the (
        rest
    } else {
        s
    }
}

/// Strip trailing semicolon from a statement.
fn strip_trailing_semicolon(s: &str) -> &str {
    let s = s.trim();
    s.strip_suffix(';').unwrap_or(s).trim()
}

/// Extract variable declarations from a declaration statement.
/// Handles simple cases: `let x = expr;`, `const y = expr;`, `var z = expr;`
/// Also handles destructuring: `let { a, b } = expr;`, `let [x, y] = expr;`
fn extract_var_declarations(stmt: &str) -> Vec<VarDecl> {
    let stmt = stmt.trim();

    // Strip the declaration keyword
    let rest = if let Some(rest) = stmt
        .strip_prefix("let ")
        .or_else(|| stmt.strip_prefix("var "))
        .or_else(|| stmt.strip_prefix("const "))
    {
        rest
    } else {
        return vec![];
    };

    // Strip trailing semicolon
    let rest = rest.strip_suffix(';').unwrap_or(rest).trim();

    // Split into individual declarators at top-level commas
    let declarators = split_declarators(rest);

    let mut result = Vec::new();
    for decl_str in &declarators {
        let decl_str = decl_str.trim();
        if decl_str.is_empty() {
            continue;
        }

        // Find the assignment `=` at the top level
        if let Some(eq_pos) = find_assignment_in_str(decl_str) {
            let lhs = decl_str[..eq_pos].trim();
            let rhs = decl_str[eq_pos + 1..].trim();

            // Handle destructuring patterns
            if lhs.starts_with('{') || lhs.starts_with('[') {
                let names = extract_identifiers_from_pattern(lhs);
                if names.is_empty() {
                    continue;
                }
                // First name gets the full destructuring assignment as the thunk
                result.push(VarDecl {
                    name: names[0].clone(),
                    init: Some(format!("({} = {})", lhs, rhs)),
                    is_destructure_assignment: true,
                    hoist_only: false,
                });
                // Remaining names are just for hoisting
                for name in &names[1..] {
                    result.push(VarDecl {
                        name: name.clone(),
                        init: None,
                        is_destructure_assignment: false,
                        hoist_only: true,
                    });
                }
            } else {
                // Simple identifier
                result.push(VarDecl {
                    name: lhs.to_string(),
                    init: Some(rhs.to_string()),
                    is_destructure_assignment: false,
                    hoist_only: false,
                });
            }
        } else {
            // No init: `x` (part of `let x, y;`)
            result.push(VarDecl {
                name: decl_str.to_string(),
                init: None,
                is_destructure_assignment: false,
                hoist_only: false,
            });
        }
    }

    result
}

/// Split comma-separated declarators at the top level (outside parens, braces, brackets, strings).
/// E.g., `$$d = await foo(), squared = bar()` -> [`$$d = await foo()`, `squared = bar()`]
fn split_declarators(s: &str) -> Vec<String> {
    let bytes = s.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut depth: i32 = 0; // combined nesting depth for {}, (), []
    let mut parts = Vec::new();
    let mut start = 0;

    while i < len {
        let ch = bytes[i];

        // Skip string literals
        if ch == b'\'' || ch == b'"' || ch == b'`' {
            i = skip_string(bytes, i);
            continue;
        }

        // Skip comments
        if ch == b'/' && i + 1 < len {
            if bytes[i + 1] == b'/' {
                while i < len && bytes[i] != b'\n' {
                    i += 1;
                }
                continue;
            }
            if bytes[i + 1] == b'*' {
                i += 2;
                while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i += 2;
                continue;
            }
        }

        match ch {
            b'(' | b'{' | b'[' => depth += 1,
            b')' | b'}' | b']' => depth -= 1,
            b',' if depth == 0 => {
                parts.push(s[start..i].to_string());
                start = i + 1;
                i += 1;
                continue;
            }
            _ => {}
        }

        i += 1;
    }

    // Push the last part
    let last = s[start..].to_string();
    if !last.trim().is_empty() {
        parts.push(last);
    }

    parts
}

/// Find the position of the first `=` that is an assignment (not `==`, `=>`, etc.)
/// at the top nesting level in a string.
fn find_assignment_in_str(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut depth: i32 = 0; // combined nesting depth for {}, (), []

    while i < len {
        let ch = bytes[i];

        // Skip strings
        if ch == b'\'' || ch == b'"' || ch == b'`' {
            i = skip_string(bytes, i);
            continue;
        }

        match ch {
            b'(' | b'[' | b'{' => depth += 1,
            b')' | b']' | b'}' => depth -= 1,
            b'=' if depth == 0 => {
                // Check it's not ==, ===, or =>
                let next = if i + 1 < len { bytes[i + 1] } else { 0 };
                if next != b'=' && next != b'>' {
                    return Some(i);
                }
                // Skip ==, ===
                i += 1;
                if next == b'=' && i + 1 < len && bytes[i + 1] == b'=' {
                    i += 1;
                }
            }
            _ => {}
        }

        i += 1;
    }

    None
}

/// Find the assignment `=` in a variable declaration (after the name/pattern).
fn find_assignment_in_decl(s: &str) -> Option<usize> {
    // Skip the keyword
    let skip = if let Some(rest) = s.strip_prefix("let ") {
        s.len() - rest.len()
    } else if let Some(rest) = s.strip_prefix("const ") {
        s.len() - rest.len()
    } else if let Some(rest) = s.strip_prefix("var ") {
        s.len() - rest.len()
    } else {
        0
    };

    find_assignment_in_str(&s[skip..]).map(|pos| pos + skip)
}

/// Extract identifiers from a destructuring pattern.
fn extract_identifiers_from_pattern(pattern: &str) -> Vec<String> {
    let mut names = Vec::new();
    let pattern = pattern.trim();

    // Remove outer braces/brackets
    let inner = if (pattern.starts_with('{') && pattern.ends_with('}'))
        || (pattern.starts_with('[') && pattern.ends_with(']'))
    {
        &pattern[1..pattern.len() - 1]
    } else {
        pattern
    };

    // Split by commas at top level
    let bytes = inner.as_bytes();
    let len = bytes.len();
    let mut i = 0;
    let mut item_start = 0;
    let mut depth: i32 = 0;

    while i <= len {
        if i == len || (bytes[i] == b',' && depth == 0) {
            let item = inner[item_start..i].trim();
            if !item.is_empty() {
                // Handle various patterns:
                // - Simple: `x`
                // - With default: `x = default_val`
                // - Property: `key: value` or `key: value = default`
                // - Rest: `...rest`
                // - Nested: `{ nested }` or `[nested]`
                let ident = extract_ident_from_item(item);
                if !ident.is_empty() {
                    names.push(ident);
                }
            }
            item_start = i + 1;
        } else {
            let ch = bytes[i];
            if ch == b'\'' || ch == b'"' || ch == b'`' {
                i = skip_string(bytes, i);
                continue;
            }
            match ch {
                b'(' | b'[' | b'{' => depth += 1,
                b')' | b']' | b'}' => depth -= 1,
                _ => {}
            }
        }
        i += 1;
    }

    names
}

/// Extract all identifier-like tokens from a statement, excluding JS keywords,
/// built-in globals, and Svelte rune identifiers. This is used to find references
/// to instance-scope variables in async statements (mimicking the official compiler's
/// `trace_references` which walks CallExpressions with `touch()` to add all referenced
/// bindings to `writes`).
fn extract_all_identifiers_from_statement(stmt: &str) -> Vec<String> {
    let bytes = stmt.as_bytes();
    let len = bytes.len();
    let mut identifiers = Vec::new();
    let mut i = 0;

    while i < len {
        let ch = bytes[i];

        // Skip regular string literals (single/double quotes)
        if ch == b'\'' || ch == b'"' {
            i = skip_string(bytes, i);
            continue;
        }

        // For template literals, skip text parts but recurse into ${} interpolations
        if ch == b'`' {
            i += 1;
            while i < len {
                if bytes[i] == b'\\' {
                    i += 2;
                    continue;
                }
                if bytes[i] == b'`' {
                    i += 1;
                    break;
                }
                if bytes[i] == b'$' && i + 1 < len && bytes[i + 1] == b'{' {
                    // Extract interpolation content and recurse
                    i += 2;
                    let interp_start = i;
                    let mut depth = 1i32;
                    while i < len && depth > 0 {
                        if bytes[i] == b'{' {
                            depth += 1;
                        } else if bytes[i] == b'}' {
                            depth -= 1;
                        } else if bytes[i] == b'\'' || bytes[i] == b'"' || bytes[i] == b'`' {
                            i = skip_string(bytes, i);
                            continue;
                        }
                        if depth > 0 {
                            i += 1;
                        }
                    }
                    // Extract identifiers from the interpolation
                    if i > interp_start {
                        let interp_text = &stmt[interp_start..i];
                        let inner_ids = extract_all_identifiers_from_statement(interp_text);
                        identifiers.extend(inner_ids);
                    }
                    i += 1; // skip closing }
                    continue;
                }
                i += 1;
            }
            continue;
        }

        // Skip single-line comments
        if ch == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }

        // Skip multi-line comments
        if ch == b'/' && i + 1 < len && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            i += 2;
            continue;
        }

        // Extract identifier tokens
        if is_ident_start(ch) {
            let start = i;
            while i < len && is_ident_char(bytes[i]) {
                i += 1;
            }
            let token = &stmt[start..i];

            // Skip JS keywords, built-in globals, and Svelte runes
            if !is_js_keyword(token) && !is_builtin_global(token) && !is_svelte_rune(token) {
                identifiers.push(token.to_string());
            }
            continue;
        }

        i += 1;
    }

    identifiers
}

/// Check if a byte can start a JS identifier (letter, underscore, or dollar sign).
fn is_ident_start(c: u8) -> bool {
    c.is_ascii_alphabetic() || c == b'_' || c == b'$'
}

/// Check if a token is a JavaScript keyword that should be excluded from identifier extraction.
fn is_js_keyword(s: &str) -> bool {
    matches!(
        s,
        "let"
            | "const"
            | "var"
            | "await"
            | "async"
            | "function"
            | "return"
            | "if"
            | "else"
            | "for"
            | "while"
            | "do"
            | "switch"
            | "case"
            | "break"
            | "continue"
            | "throw"
            | "try"
            | "catch"
            | "finally"
            | "new"
            | "delete"
            | "typeof"
            | "void"
            | "in"
            | "of"
            | "instanceof"
            | "this"
            | "class"
            | "extends"
            | "super"
            | "import"
            | "export"
            | "default"
            | "from"
            | "with"
            | "yield"
            | "debugger"
            | "true"
            | "false"
            | "null"
            | "undefined"
    )
}

/// Check if a token is a built-in global that should be excluded from identifier extraction.
fn is_builtin_global(s: &str) -> bool {
    matches!(
        s,
        "Promise"
            | "Array"
            | "Object"
            | "String"
            | "Number"
            | "Boolean"
            | "Symbol"
            | "BigInt"
            | "Map"
            | "Set"
            | "WeakMap"
            | "WeakSet"
            | "Date"
            | "RegExp"
            | "Error"
            | "TypeError"
            | "RangeError"
            | "SyntaxError"
            | "ReferenceError"
            | "JSON"
            | "Math"
            | "Infinity"
            | "NaN"
            | "parseInt"
            | "parseFloat"
            | "isNaN"
            | "isFinite"
            | "encodeURI"
            | "decodeURI"
            | "encodeURIComponent"
            | "decodeURIComponent"
            | "console"
            | "window"
            | "document"
            | "globalThis"
            | "Proxy"
            | "Reflect"
            | "fetch"
            | "setTimeout"
            | "setInterval"
            | "clearTimeout"
            | "clearInterval"
            | "queueMicrotask"
            | "URL"
            | "URLSearchParams"
            | "AbortController"
            | "AbortSignal"
            | "Headers"
            | "Request"
            | "Response"
            | "FormData"
            | "Blob"
            | "File"
            | "ReadableStream"
            | "WritableStream"
            | "TextEncoder"
            | "TextDecoder"
            | "Event"
            | "EventTarget"
            | "CustomEvent"
            | "Intl"
            | "ArrayBuffer"
            | "SharedArrayBuffer"
            | "DataView"
            | "Float32Array"
            | "Float64Array"
            | "Int8Array"
            | "Int16Array"
            | "Int32Array"
            | "Uint8Array"
            | "Uint16Array"
            | "Uint32Array"
            | "WeakRef"
            | "FinalizationRegistry"
            | "Iterator"
            | "Generator"
            | "AsyncGenerator"
            | "AsyncIterator"
    )
}

/// Check if a token is a Svelte rune identifier that should be excluded.
fn is_svelte_rune(s: &str) -> bool {
    // $state, $derived, $effect, $props, $bindable, $inspect, $host
    // Also $$props, $$restProps, $$slots, $$promises, $$renderer, $$async_noop
    s.starts_with('$')
}

/// Collect all declared variable names from a list of statements.
/// This scans all statements for variable declarations (`let`, `const`, `var`)
/// and collects the declared names. Used to determine which identifiers in
/// async statements correspond to actual instance-scope variables.
fn collect_all_declared_variables(statements: &[String]) -> std::collections::HashSet<String> {
    let mut vars = std::collections::HashSet::new();

    for stmt in statements {
        let trimmed = stmt.trim();
        if is_variable_declaration(trimmed) {
            let decls = extract_var_declarations(trimmed);
            for decl in &decls {
                vars.insert(decl.name.clone());
            }
        }
    }

    vars
}

/// Extract the identifier name from a destructuring item.
fn extract_ident_from_item(item: &str) -> String {
    let item = item.trim();

    // Rest element: `...rest`
    if let Some(rest) = item.strip_prefix("...") {
        return rest.trim().to_string();
    }

    // Property pattern: `key: value`
    if let Some(colon_pos) = item.find(':') {
        // Check it's not nested
        let before_colon = &item[..colon_pos];
        if !before_colon.contains('{') && !before_colon.contains('[') {
            let value_part = item[colon_pos + 1..].trim();
            // Value might have a default: `value = default`
            return extract_ident_from_item(value_part);
        }
    }

    // With default: `x = default`
    if let Some(eq_pos) = find_assignment_in_str(item) {
        return item[..eq_pos].trim().to_string();
    }

    // Simple identifier
    item.to_string()
}

/// Collect function bodies indexed by function name.
/// This includes both `function foo() { ... }` declarations and
/// `let foo = function() { ... }` / `let foo = (...) => { ... }` declarations.
fn collect_function_bodies(statements: &[String]) -> std::collections::HashMap<String, String> {
    let mut bodies = std::collections::HashMap::new();

    for stmt in statements {
        let trimmed = stmt.trim();

        // function foo(...) { ... }
        if is_function_declaration(trimmed)
            && let Some(name) = extract_function_decl_name(trimmed)
        {
            bodies.insert(name, trimmed.to_string());
        }

        // let foo = function() { ... } or let foo = (...) => { ... }
        if is_function_var_declaration(trimmed)
            && let Some(name) = extract_var_decl_name(trimmed)
        {
            bodies.insert(name, trimmed.to_string());
        }
    }

    bodies
}

/// Extract the function name from `function foo(...)` or `async function foo(...)`.
fn extract_function_decl_name(s: &str) -> Option<String> {
    let s = s.trim();
    let rest = if let Some(r) = s.strip_prefix("async function ") {
        r.trim()
    } else if let Some(r) = s.strip_prefix("function*") {
        r.trim()
    } else if let Some(r) = s.strip_prefix("function ") {
        r.trim()
    } else {
        return None;
    };

    let mut i = 0;
    let bytes = rest.as_bytes();
    while i < bytes.len() && is_ident_char(bytes[i]) {
        i += 1;
    }
    if i > 0 {
        Some(rest[..i].to_string())
    } else {
        None
    }
}

/// Extract the variable name from `let foo = ...` / `const foo = ...`.
fn extract_var_decl_name(s: &str) -> Option<String> {
    let s = s.trim();
    let rest = if let Some(r) = s.strip_prefix("let ") {
        r
    } else if let Some(r) = s.strip_prefix("const ") {
        r
    } else if let Some(r) = s.strip_prefix("var ") {
        r
    } else {
        return None;
    };
    let rest = rest.trim();
    let mut i = 0;
    let bytes = rest.as_bytes();
    while i < bytes.len() && is_ident_char(bytes[i]) {
        i += 1;
    }
    if i > 0 {
        Some(rest[..i].to_string())
    } else {
        None
    }
}

/// Resolve transitive function dependencies.
/// When a function `foo` is called in an async thunk, all instance-scope variables
/// referenced in `foo`'s body should be added to the blocker_map.
/// This mimics the official compiler's trace_references behavior.
fn resolve_transitive_function_deps(
    stmt: &str,
    function_bodies: &std::collections::HashMap<String, String>,
    all_declared_vars: &std::collections::HashSet<String>,
    blocker_map: &mut std::collections::HashMap<String, usize>,
    blocker_index: usize,
) {
    // Extract all identifiers from the async statement
    let direct_ids = extract_all_identifiers_from_statement(stmt);

    // For each identifier, check if it's a known function and scan its body
    let mut visited = std::collections::HashSet::new();
    let mut queue: Vec<String> = direct_ids;

    while let Some(id) = queue.pop() {
        if visited.contains(&id) {
            continue;
        }
        visited.insert(id.clone());

        if let Some(body) = function_bodies.get(&id) {
            let body_ids = extract_all_identifiers_from_statement(body);
            for body_id in body_ids {
                if all_declared_vars.contains(&body_id) && !blocker_map.contains_key(&body_id) {
                    blocker_map.insert(body_id.clone(), blocker_index);
                }
                // Also check if this identifier is itself a function (transitive)
                if !visited.contains(&body_id) {
                    queue.push(body_id);
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simple_await_expression() {
        let script = "await 1;";
        let result = transform_async_body(script, "$.run").unwrap();
        assert!(result.output.contains("$.run(["));
        assert!(result.output.contains("() => 1"));
    }

    #[test]
    fn test_sync_then_await() {
        let script = "let x = 1;\nawait 0;\nlet y = 2;";
        let result = transform_async_body(script, "$.run").unwrap();
        assert!(result.output.contains("let x = 1;"));
        assert!(result.output.contains("var y;"));
        assert!(result.output.contains("() => 0"));
        assert!(result.output.contains("() => y = 2"));
    }

    #[test]
    fn test_no_await() {
        let script = "let x = 1;\nlet y = 2;";
        assert!(transform_async_body(script, "$.run").is_none());
    }

    #[test]
    fn test_function_stays_sync() {
        let script = "await 0;\nfunction foo() { return 1; }\nlet x = 2;";
        let result = transform_async_body(script, "$.run").unwrap();
        assert!(result.output.contains("function foo()"));
        assert!(result.output.contains("var x;"));
    }

    #[test]
    fn test_await_in_var_decl() {
        let script = "let data = await fetch('/api');";
        let result = transform_async_body(script, "$.run").unwrap();
        assert!(result.output.contains("var data;"));
        assert!(
            result
                .output
                .contains("async () => data = await fetch('/api')")
        );
    }

    #[test]
    fn test_server_runner() {
        let script = "await 1;";
        let result = transform_async_body(script, "$$renderer.run").unwrap();
        assert!(result.output.contains("$$renderer.run(["));
    }

    #[test]
    fn test_throw_statement() {
        let script = "await 1;\nthrow new Error('oops');";
        let result = transform_async_body(script, "$.run").unwrap();
        assert!(result.output.contains("() => 1"));
        assert!(result.output.contains("throw new Error('oops')"));
    }

    #[test]
    fn test_destructuring_after_await() {
        let script = "await Promise.resolve(42);\nconst { name } = $$props;";
        let result = transform_async_body(script, "$$renderer.run").unwrap();
        assert!(
            result.output.contains("var name;"),
            "Should hoist destructured var. Output: {}",
            result.output
        );
        assert!(
            result.output.contains("({ name } = $$props)"),
            "Should produce destructuring thunk. Output: {}",
            result.output
        );
        // Should NOT contain `var { name };` (invalid JS)
        assert!(
            !result.output.contains("var { name }"),
            "Should not produce invalid var destructuring. Output: {}",
            result.output
        );
    }

    #[test]
    fn test_asi_statement_boundary() {
        // Test that $.effect() without semicolon is properly split from the next `let`
        let script = "await Promise.resolve();\n$.effect(() => console.log(value))\nlet value = $.state('value');";
        let result = transform_async_body(script, "$.run").unwrap();
        assert!(
            result.output.contains("var value;"),
            "Should hoist `value`. Output: {}",
            result.output
        );
        assert!(
            result.output.contains("$.effect"),
            "Should contain $.effect. Output: {}",
            result.output
        );
        // The output should NOT mix $.effect into the let declaration
        assert!(
            !result
                .output
                .contains("$.effect(() => console.log(value))\nlet"),
            "Should split $.effect and let into separate statements. Output: {}",
            result.output
        );
    }

    #[test]
    fn test_object_literal_in_const() {
        // Object literal in const should not be split at the closing brace
        let script = "await 1;\nconst some = { fn: () => {} };";
        let result = transform_async_body(script, "$.run").unwrap();
        assert!(
            result.output.contains("some = { fn: () => {} }"),
            "Object literal should stay together. Output: {}",
            result.output
        );
    }

    #[test]
    fn test_compute_blocker_map_includes_referenced_variables() {
        // Mimics the async-if-nested test case:
        // let foo = $state(false);
        // let blocking = $derived(await foo);
        // let bar = Promise.resolve(true);
        //
        // After rune transforms, this becomes something like:
        // let foo = false;
        // let blocking = await $.async_derived(() => foo);
        // let bar = Promise.resolve(true);
        //
        // The blocker_map should include `foo` (referenced in the $derived call)
        // with the same promise index as `blocking`.
        let script = "let foo = false;\nlet blocking = await $.async_derived(() => foo);\nlet bar = Promise.resolve(true);";
        let map = compute_blocker_map(script);

        assert!(
            map.contains_key("blocking"),
            "Should contain 'blocking'. Map: {:?}",
            map
        );
        assert!(
            map.contains_key("foo"),
            "Should contain 'foo' as a referenced variable. Map: {:?}",
            map
        );
        assert!(
            map.contains_key("bar"),
            "Should contain 'bar'. Map: {:?}",
            map
        );

        // foo should have the same index as blocking (both blocked by the same promise)
        assert_eq!(
            map.get("foo"),
            map.get("blocking"),
            "foo and blocking should have the same promise index. Map: {:?}",
            map
        );
    }

    #[test]
    fn test_transform_blocker_map_includes_referenced_variables() {
        // Same test but for transform_async_body
        let script = "let foo = false;\nlet blocking = await $.async_derived(() => foo);\nlet bar = Promise.resolve(true);";
        let result = transform_async_body(script, "$.run").unwrap();

        assert!(
            result.blocker_map.contains_key("blocking"),
            "Should contain 'blocking'. Map: {:?}",
            result.blocker_map
        );
        assert!(
            result.blocker_map.contains_key("foo"),
            "Should contain 'foo' as a referenced variable. Map: {:?}",
            result.blocker_map
        );
        assert!(
            result.blocker_map.contains_key("bar"),
            "Should contain 'bar'. Map: {:?}",
            result.blocker_map
        );

        // foo should have the same index as blocking
        assert_eq!(
            result.blocker_map.get("foo"),
            result.blocker_map.get("blocking"),
            "foo and blocking should have the same promise index. Map: {:?}",
            result.blocker_map
        );
    }

    #[test]
    fn test_referenced_var_gets_highest_index() {
        // A variable referenced in multiple async statements should get the highest promise index,
        // matching the official compiler behavior where binding.blocker gets overwritten by later
        // trace_references calls.
        let script = "let a = await fetch();\nlet b = await transform(a);\nlet c = await use(a);";
        let map = compute_blocker_map(script);

        // 'a' is referenced in both the 'b' and 'c' statements
        // It should get index 2 (from the last statement that references it)
        assert!(map.contains_key("a"), "Should contain 'a'. Map: {:?}", map);
        assert_eq!(
            map.get("a").copied(),
            Some(2),
            "a should have index 2 (highest referencing statement). Map: {:?}",
            map
        );
    }

    #[test]
    fn test_extract_all_identifiers_excludes_keywords() {
        let ids =
            extract_all_identifiers_from_statement("let foo = await bar + Promise.resolve(baz)");
        assert!(ids.contains(&"foo".to_string()));
        assert!(ids.contains(&"bar".to_string()));
        assert!(ids.contains(&"baz".to_string()));
        assert!(!ids.iter().any(|id| id == "let"));
        assert!(!ids.iter().any(|id| id == "await"));
        assert!(!ids.iter().any(|id| id == "Promise"));
    }

    #[test]
    fn test_extract_all_identifiers_excludes_svelte_runes() {
        let ids = extract_all_identifiers_from_statement("$derived(await foo)");
        assert!(ids.contains(&"foo".to_string()));
        assert!(!ids.iter().any(|id| id.starts_with('$')));
    }
}
