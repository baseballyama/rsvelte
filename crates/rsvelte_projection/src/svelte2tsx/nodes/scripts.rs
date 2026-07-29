//! Instance/module `<script>` scanning — import extraction and top-level-await
//! detection. Mirrors `svelte2tsx/nodes/Scripts.ts` plus the scanning half of
//! `processInstanceScriptContent.ts`.

use super::super::svelte2tsx::slice_src;
use super::super::utils::lexical::contains_word;

/// Find the start of `</script>` tag by scanning backwards from the script end position.
pub(crate) fn find_script_close_tag_start(source: &str, script_end: u32) -> u32 {
    let bytes = source.as_bytes();
    let end = script_end as usize;
    let needle = b"</script>";
    let needle_len = needle.len();

    if end < needle_len {
        return script_end;
    }

    let mut i = end;
    while i >= needle_len {
        i -= 1;
        if i + needle_len <= end
            && bytes[i..i + needle_len]
                .iter()
                .zip(needle.iter())
                .all(|(a, b)| a.to_ascii_lowercase() == *b)
        {
            return i as u32;
        }
    }

    script_end
}

/// Find top-level import declarations in an instance script.
///
/// Returns a sorted list of (start, end) positions relative to the script
/// content (i.e., relative to `script.content_offset`).
/// Returns `(comments_start, import_start, import_end)` for each top-level
/// import in `script`. `comments_start <= import_start` — the leading comment
/// span lets the caller hoist JSDoc / line comments alongside their import,
/// matching the JS reference's `moveNode` per-comment moves.
pub(crate) fn find_instance_imports(
    script: &crate::ast::template::Script,
    source: &str,
    program: &oxc_ast::ast::Program,
) -> Vec<(u32, u32, u32)> {
    use oxc_ast::ast as oxc;

    let content_start = script.content_offset as usize;
    let script_source = slice_src(source, script.start as usize, script.end as usize);
    let close_tag_offset = script_source
        .rfind("</script>")
        .or_else(|| script_source.rfind("</Script>"))
        .unwrap_or(script_source.len());
    let content_end = script.start as usize + close_tag_offset;
    let raw_content = &source[content_start..content_end];

    // Fast path: an `import` substring is required for any import
    // declaration to exist. Skip the OXC parse entirely for the majority
    // of scripts that have no imports.
    if !contains_word(raw_content.as_bytes(), b"import") {
        return Vec::new();
    }

    // Parser comments are source-ordered. Keep a monotonic cursor over them to
    // compute each import's leading-comment region the way TS
    // `getLeadingCommentRanges(node.getFullText())` does — including a TRAILING
    // line comment on the PREVIOUS statement's line (it is leading trivia of the
    // following import and moves up with it). The parser already tokenised
    // strings/regex correctly, so `// …` inside a string is never misread.
    let mut imports = Vec::new();
    let bytes = raw_content.as_bytes();
    let comments = &program.comments;
    let mut comment_cursor = 0;
    for stmt in program.body.iter() {
        if let oxc::Statement::ImportDeclaration(import) = stmt {
            // All import declarations (including side-effect imports like `import ''`)
            // should be lifted. The parser only creates ImportDeclaration nodes for
            // valid `import` statements with a source clause.
            let start = import.span.start;
            let end = import.span.end;
            while comment_cursor < comments.len() && comments[comment_cursor].span.end <= start {
                comment_cursor += 1;
            }

            // Walk backwards over leading trivia, pulling in every comment whose
            // end is reachable from the current start via whitespace only, and
            // stopping at the first non-comment code (the previous token). This
            // mirrors `getLeadingCommentRanges` and pulls a trailing line comment
            // (`import …; // TODO`) into the FOLLOWING import's leading region.
            let new_start =
                scan_back_leading_comments(bytes, start as usize, comments, comment_cursor);

            imports.push((new_start, start, end));
        }
    }
    imports
}

/// Walk backwards from `pos` over leading trivia (whitespace + comments),
/// returning the start of the earliest reachable parser-discovered comment.
fn scan_back_leading_comments(
    bytes: &[u8],
    pos: usize,
    comments: &[oxc_ast::ast::Comment],
    comment_cursor: usize,
) -> u32 {
    let mut cstart = pos as u32;
    let mut comment_index = comment_cursor;
    loop {
        // Skip whitespace backward.
        let mut p = cstart as usize;
        while p > 0 && matches!(bytes[p - 1], b' ' | b'\t' | b'\n' | b'\r') {
            p -= 1;
        }

        while comment_index > 0 && comments[comment_index - 1].span.end as usize > p {
            comment_index -= 1;
        }
        if comment_index > 0 && comments[comment_index - 1].span.end as usize == p {
            let cs = comments[comment_index - 1].span.start;
            if cs >= cstart {
                break;
            }
            cstart = cs;
            comment_index -= 1;
        } else {
            break;
        }
    }
    cstart
}

/// Detect whether a script content contains top-level `await` expressions.
///
/// Checks the retained OXC program for AwaitExpression at the top level.
pub(crate) fn detect_top_level_await(content: &str, program: &oxc_ast::ast::Program) -> bool {
    use oxc_ast::ast as oxc;

    // Fast path: an `await` substring is required for any top-level await
    // to exist. Skip the AST walk when the keyword is absent.
    if !contains_word(content.as_bytes(), b"await") {
        return false;
    }

    // Mirror upstream `processInstanceScriptContent.ts` which sets
    // `hasTopLevelAwait = true` whenever an AwaitExpression is visited at the
    // root scope (i.e. not inside any Block / FunctionLike node).
    //
    // We do not have the upstream's full AST-walker machinery, but we can
    // replicate the effect for the cases that actually occur in Svelte
    // components:
    //
    //   • `VariableDeclaration` at module top-level whose initialiser
    //     *contains* an AwaitExpression (e.g. `let x = $derived(await f())`
    //     or `const user = await getUser()`).
    //   • `ExpressionStatement` at module top-level whose expression
    //     *contains* an AwaitExpression (e.g. `y = await promise`).
    //
    // For both, we use a deep recursive scan that stops at function
    // boundaries (`FunctionExpression` / `ArrowFunctionExpression`) — those
    // introduce a new scope and their inner `await` is NOT top-level.
    for stmt in program.body.iter() {
        match stmt {
            oxc::Statement::VariableDeclaration(decl) => {
                for declarator in decl.declarations.iter() {
                    if let Some(ref init) = declarator.init
                        && expr_contains_await_deep(init)
                    {
                        return true;
                    }
                }
            }
            oxc::Statement::ExpressionStatement(expr)
                if expr_contains_await_deep(&expr.expression) =>
            {
                return true;
            }
            _ => {}
        }
    }
    false
}

/// Deep check: returns `true` if `expr` is, or transitively contains (outside
/// any function boundary), an `AwaitExpression`.
///
/// Mirrors the upstream TypeScript walker's `scope === rootScope` predicate:
/// we recurse into all expression sub-nodes but stop when entering a
/// `FunctionExpression` or `ArrowFunctionExpression` (a new async scope
/// whose internal `await` is not "top-level" for the Svelte component).
///
/// Reference: `processInstanceScriptContent.ts` lines 246-349
///   `if (ts.isBlock(node) || ts.isFunctionLike(node)) pushScope();`
///   `if (isSvelte5Plus && ts.isAwaitExpression(node) && scope === rootScope)`
pub(crate) fn expr_contains_await_deep(expr: &oxc_ast::ast::Expression) -> bool {
    use oxc_ast::ast::{Argument, Expression as E};

    match expr {
        // Base case: this expression is an await.
        E::AwaitExpression(_) => true,

        // Function boundaries: do NOT recurse — their inner awaits are in a
        // new scope and are not "top-level" from the component's perspective.
        E::ArrowFunctionExpression(_) | E::FunctionExpression(_) => false,

        // Parenthesised expression: transparent wrapper.
        E::ParenthesizedExpression(p) => expr_contains_await_deep(&p.expression),

        // Assignment: `x = await y` or `x = f(await y)` — check the RHS.
        // (LHS is a pattern/identifier and cannot contain await directly.)
        E::AssignmentExpression(a) => expr_contains_await_deep(&a.right),

        // Binary / logical: check both sides.
        E::BinaryExpression(b) => {
            expr_contains_await_deep(&b.left) || expr_contains_await_deep(&b.right)
        }
        E::LogicalExpression(l) => {
            expr_contains_await_deep(&l.left) || expr_contains_await_deep(&l.right)
        }

        // Conditional: test ? consequent : alternate.
        E::ConditionalExpression(c) => {
            expr_contains_await_deep(&c.test)
                || expr_contains_await_deep(&c.consequent)
                || expr_contains_await_deep(&c.alternate)
        }

        // Unary / yield: single argument.
        E::UnaryExpression(u) => expr_contains_await_deep(&u.argument),
        E::YieldExpression(y) => y
            .argument
            .as_ref()
            .is_some_and(|a| expr_contains_await_deep(a)),

        // Sequence: any expression in the list.
        E::SequenceExpression(s) => s.expressions.iter().any(expr_contains_await_deep),

        // Call expression: callee + arguments.  This is the key case for
        // `$derived(await x)` — the callee is `$derived` and the argument
        // is an AwaitExpression.
        //
        // `Argument` inherits `Expression` variants via `@inherit Expression`;
        // `to_expression()` panics for `SpreadElement` (handled first in the
        // match), and returns the inner `&Expression` for all other variants.
        E::CallExpression(call) => {
            expr_contains_await_deep(&call.callee)
                || call.arguments.iter().any(|arg| match arg {
                    Argument::SpreadElement(sp) => expr_contains_await_deep(&sp.argument),
                    _ => expr_contains_await_deep(arg.to_expression()),
                })
        }

        // `new Foo(await x)`.
        E::NewExpression(n) => n.arguments.iter().any(|arg| match arg {
            Argument::SpreadElement(sp) => expr_contains_await_deep(&sp.argument),
            _ => expr_contains_await_deep(arg.to_expression()),
        }),

        // Member expressions: `obj[await key]` or `obj.prop`.
        E::ComputedMemberExpression(c) => {
            expr_contains_await_deep(&c.object) || expr_contains_await_deep(&c.expression)
        }
        E::StaticMemberExpression(s) => expr_contains_await_deep(&s.object),
        E::PrivateFieldExpression(p) => expr_contains_await_deep(&p.object),

        // Template literals: `${await x}`.
        E::TemplateLiteral(tl) => tl.expressions.iter().any(expr_contains_await_deep),
        E::TaggedTemplateExpression(tt) => {
            expr_contains_await_deep(&tt.tag)
                || tt.quasi.expressions.iter().any(expr_contains_await_deep)
        }

        // Object / array literals: `$derived({ value: await x })`, `[await x]`.
        E::ObjectExpression(o) => o.properties.iter().any(|p| match p {
            oxc_ast::ast::ObjectPropertyKind::ObjectProperty(prop) => {
                expr_contains_await_deep(&prop.value)
            }
            oxc_ast::ast::ObjectPropertyKind::SpreadProperty(sp) => {
                expr_contains_await_deep(&sp.argument)
            }
        }),
        E::ArrayExpression(a) => a.elements.iter().any(|el| match el {
            oxc_ast::ast::ArrayExpressionElement::SpreadElement(sp) => {
                expr_contains_await_deep(&sp.argument)
            }
            oxc_ast::ast::ArrayExpressionElement::Elision(_) => false,
            other => other.as_expression().is_some_and(expr_contains_await_deep),
        }),

        // Everything else (literals, identifiers, `this`, …) cannot contain await.
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use oxc_ast::ast::Comment;
    use oxc_span::Span;
    use std::fmt::Write as _;

    fn comment(source: &str, text: &str) -> Comment {
        let start = source.find(text).unwrap() as u32;
        Comment {
            span: Span::new(start, start + text.len() as u32),
            ..Comment::default()
        }
    }

    #[test]
    fn comment_cursor_keeps_contiguous_leading_trivia() {
        let source = "const value = 1; // trailing\n/* block */\nimport value from './value';";
        let comments = [
            comment(source, "// trailing"),
            comment(source, "/* block */"),
        ];
        let import_start = source.find("import value").unwrap();

        assert_eq!(
            scan_back_leading_comments(source.as_bytes(), import_start, &comments, comments.len()),
            comments[0].span.start
        );
    }

    #[test]
    fn comment_cursor_scales_across_ordered_imports() {
        const IMPORTS: usize = 1_024;
        let mut source = String::with_capacity(IMPORTS * 40);
        let mut comments = Vec::with_capacity(IMPORTS);
        let mut import_starts = Vec::with_capacity(IMPORTS);
        for index in 0..IMPORTS {
            let comment_start = source.len() as u32;
            write!(source, "// import {index}").unwrap();
            comments.push(Comment {
                span: Span::new(comment_start, source.len() as u32),
                ..Comment::default()
            });
            source.push('\n');
            import_starts.push(source.len());
            writeln!(source, "import v{index} from './m';").unwrap();
        }

        let mut comment_cursor = 0;
        for (index, &import_start) in import_starts.iter().enumerate() {
            while comment_cursor < comments.len()
                && comments[comment_cursor].span.end <= import_start as u32
            {
                comment_cursor += 1;
            }
            assert_eq!(
                scan_back_leading_comments(
                    source.as_bytes(),
                    import_start,
                    &comments,
                    comment_cursor,
                ),
                comments[index].span.start
            );
        }
    }
}
