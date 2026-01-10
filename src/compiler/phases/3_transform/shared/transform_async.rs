//! Async component transformation
//!
//! Transforms the instance script body to make await expressions non-blocking.
//!
//! This enables the `experimental.async` feature, which allows components to have
//! top-level await expressions that resolve in parallel where possible.
//!
//! # Example Transformation
//!
//! ```javascript
//! // Input:
//! let x = 1;
//! let data = await fetch('/api');
//! let y = data.value;
//!
//! // Output:
//! let x = 1;
//! var data, y;
//! var $$promises = $.run([
//!   () => data = await fetch('/api'),
//!   () => y = data.value
//! ]);
//! ```
//!
//! The `$$promises` array allows template expressions to await specific promises
//! (e.g., `await $$promises[0]`) without waiting for all later promises to resolve.
//!
//! Corresponds to `svelte/packages/svelte/src/compiler/phases/3-transform/shared/transform-async.js`

use oxc::ast::ast::{Expression, Statement, VariableDeclaration};

/// Information about async statements in the instance body.
#[derive(Debug, Clone)]
pub struct AsyncStatement {
    /// The statement node (VariableDeclarator, ClassDeclaration, or other Statement)
    pub node: Statement,

    /// Whether this statement contains an await expression
    pub has_await: bool,
}

/// Analysis result for the instance body, separating sync and async parts.
#[derive(Debug, Default)]
pub struct InstanceBody {
    /// Synchronous statements before the first await
    pub sync: Vec<Statement>,

    /// Variable declarations that will be hoisted (for async assignments)
    pub declarations: Vec<String>,

    /// Async statements that will be wrapped in thunks
    pub async_statements: Vec<AsyncStatement>,
}

/// Transform the instance script body for async components.
///
/// This function:
/// 1. Keeps synchronous statements before the first await as-is
/// 2. Hoists variable declarations for async assignments
/// 3. Wraps async statements in thunks
/// 4. Creates a `$$promises` array with the runner function
///
/// Corresponds to `transform_body()` in `transform-async.js`.
///
/// # Arguments
///
/// * `instance_body` - Analyzed instance body with sync/async separation
/// * `runner` - The runner expression (usually `$.run`)
/// * `transform` - Callback to transform individual nodes
///
/// # Returns
///
/// Returns a vector of transformed statements for the instance script.
pub fn transform_body<F>(
    instance_body: &InstanceBody,
    runner: Expression,
    mut transform: F,
) -> Vec<Statement>
where
    F: FnMut(&Statement) -> Statement,
{
    let mut statements = Vec::new();

    // Add sync statements before first await
    for node in &instance_body.sync {
        statements.push(transform(node));
    }

    // Hoist declarations for async assignments
    if !instance_body.declarations.is_empty() {
        // TODO: Create a var declaration with all the identifiers
        // For now, skip this
    }

    // Create thunks for async statements
    if !instance_body.async_statements.is_empty() {
        // TODO: Transform each async statement into a thunk
        // Each thunk is an arrow function that executes the statement
        // For VariableDeclarator: convert to assignment
        // For ClassDeclaration: convert to assignment expression
        // For ExpressionStatement: wrap in void or return as-is if await
        //
        // Then create: var $$promises = $.run([thunk1, thunk2, ...])
    }

    statements
}

/// Create a thunk (arrow function) wrapping a statement or expression.
///
/// # Arguments
///
/// * `body` - The statement or expression to wrap
/// * `is_async` - Whether the thunk should be async
///
/// # Returns
///
/// Returns an arrow function expression.
fn create_thunk(body: Statement, is_async: bool) -> Expression {
    // TODO: Create an arrow function:
    // - Parameters: none
    // - Body: the given statement/expression
    // - Async: based on is_async flag
    //
    // For now, return a placeholder
    todo!("create_thunk not yet implemented")
}

/// Analyze the instance body to separate sync and async parts.
///
/// This walks the statements and identifies:
/// - Sync statements before the first await
/// - Declarations that need hoisting
/// - Async statements that need thunk wrapping
pub fn analyze_instance_body(statements: &[Statement]) -> InstanceBody {
    let mut body = InstanceBody::default();
    let mut found_await = false;

    for stmt in statements {
        if !found_await && !contains_await(stmt) {
            // This statement is sync and comes before any await
            body.sync.push(stmt.clone());
        } else {
            // This statement is async or comes after an await
            found_await = true;

            // Extract declarations for hoisting
            // TODO: Walk variable declarators and extract identifiers

            body.async_statements.push(AsyncStatement {
                node: stmt.clone(),
                has_await: contains_await(stmt),
            });
        }
    }

    body
}

/// Check if a statement contains an await expression.
fn contains_await(stmt: &Statement) -> bool {
    // TODO: Walk the AST and check for AwaitExpression nodes
    // For now, return false
    false
}
