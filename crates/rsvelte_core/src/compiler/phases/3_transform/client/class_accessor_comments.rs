//! Delete the comments upstream loses when it lowers a public rune class field.
//!
//! `3-transform/client/visitors/ClassBody.js` replaces such a field with
//! builder-made `get` / `set` methods, and a builder-made `BlockStatement` has no
//! `loc`. esrap keeps one cursor over the whole comment list and `reset_comment_index`
//! parks it past the end whenever it prints an unlocated body, so every later
//! comment is skipped until a *located* body (`BlockStatement`, `ClassBody`,
//! `StaticBlock`, `Program`) re-syncs the cursor to the first comment at or after
//! that body's start. rsvelte builds the accessors as source text, so they carry
//! real positions and the cursor never dies — this pass removes what upstream drops.
//!
//! Only the accessor's kill is modelled here. Whether the *enclosing* program is
//! located is the caller's question: `print_module_program` answers it for a
//! `.svelte.(js|ts)` module and `strip_module_toplevel_comments` for a
//! `<script module>`, while a component's instance script is located by upstream
//! assigning `component_block.loc = instance.loc`.

use oxc_allocator::Allocator;
use oxc_ast::ast::{
    BlockStatement, ClassBody, ClassElement, Expression, FunctionBody, MethodDefinitionKind,
    Program, PropertyKey, Statement, StaticBlock,
};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};

/// Where the comment cursor dies (a synthesized accessor body) and where it comes
/// back (a located body's `{`).
#[derive(Clone, Copy, PartialEq, Eq)]
enum Event {
    Revive,
    Kill,
}

/// Parse `src` and drop the comments an upstream accessor would swallow. Returns
/// `None` when nothing is removed (parse failure included), so callers keep the
/// input untouched.
pub(crate) fn strip_class_accessor_dead_comments(src: &str) -> Option<String> {
    if !may_have_dead_comments(src) {
        return None;
    }
    let allocator = Allocator::default();
    let _pt = super::super::profile::timer_start();
    let ret = Parser::new(&allocator, src, SourceType::mjs()).parse();
    super::super::profile::record_direct_parse(
        super::super::profile::timer_elapsed(_pt),
        src.len(),
    );
    if !ret.diagnostics.is_empty() {
        return None;
    }
    strip_from_program(src, &ret.program)
}

/// The same pass over a parse the caller already holds. `program` must be the
/// parse of `src`; a mismatch would silently report "nothing to strip", so the
/// caller checks `source_text` before choosing this over the parsing entry point.
pub(crate) fn strip_class_accessor_dead_comments_from_program(
    src: &str,
    program: &Program<'_>,
) -> Option<String> {
    debug_assert_eq!(program.source_text, src);
    if !may_have_dead_comments(src) {
        return None;
    }
    strip_from_program(src, program)
}

/// Nothing is removed without a class, a rune field and a comment, so a script
/// missing any of the three skips the parse. Over-matching (a `class` inside a
/// comment) only costs that parse; the pass itself reads the AST.
fn may_have_dead_comments(src: &str) -> bool {
    let bytes = src.as_bytes();
    memchr::memmem::find(bytes, b"class").is_some()
        && (memchr::memmem::find(bytes, b"$state").is_some()
            || memchr::memmem::find(bytes, b"$derived").is_some())
        && (memchr::memmem::find(bytes, b"//").is_some()
            || memchr::memmem::find(bytes, b"/*").is_some())
}

fn strip_from_program(src: &str, program: &Program<'_>) -> Option<String> {
    if program.comments.is_empty() || program.source_text != src {
        return None;
    }

    let mut collector = EventCollector {
        events: Vec::new(),
        src,
    };
    collector.visit_program(program);
    if !collector
        .events
        .iter()
        .any(|(_, kind)| *kind == Event::Kill)
    {
        return None;
    }
    // A `Kill` at the same offset as the `Revive` of the body it sits in must win,
    // and `Revive` is emitted by the enclosing body before the accessor is printed.
    collector
        .events
        .sort_by_key(|&(pos, kind)| (pos, kind == Event::Kill));

    let mut removals: Vec<(usize, usize)> = Vec::new();
    for comment in &program.comments {
        let start = comment.span.start;
        let idx = collector.events.partition_point(|&(pos, _)| pos <= start);
        if idx > 0 && collector.events[idx - 1].1 == Event::Kill {
            removals.push((start as usize, comment.span.end as usize));
        }
    }
    if removals.is_empty() {
        return None;
    }

    let mut out = String::with_capacity(src.len());
    let mut pos = 0usize;
    for (start, end) in removals {
        if start > pos {
            out.push_str(&src[pos..start]);
        }
        pos = pos.max(end);
    }
    out.push_str(&src[pos..]);
    Some(out)
}

struct EventCollector<'s> {
    events: Vec<(u32, Event)>,
    src: &'s str,
}

impl<'s> EventCollector<'s> {
    /// A comment on the same line as the accessor's field is still flushed as that
    /// field's trailing comment, so a kill only reaches the next line.
    fn kill_at(&mut self, offset: u32) {
        let rest = &self.src.as_bytes()[offset as usize..];
        let Some(nl) = memchr::memchr(b'\n', rest) else {
            return;
        };
        self.events.push((offset + nl as u32 + 1, Event::Kill));
    }
}

impl<'a> Visit<'a> for EventCollector<'_> {
    fn visit_class_body(&mut self, it: &ClassBody<'a>) {
        self.events.push((it.span.start, Event::Revive));
        if let Some(offset) = accessor_kill_offset(it) {
            self.kill_at(offset);
        }
        walk::walk_class_body(self, it);
    }

    fn visit_function_body(&mut self, it: &FunctionBody<'a>) {
        self.events.push((it.span.start, Event::Revive));
        walk::walk_function_body(self, it);
    }

    fn visit_block_statement(&mut self, it: &BlockStatement<'a>) {
        self.events.push((it.span.start, Event::Revive));
        walk::walk_block_statement(self, it);
    }

    fn visit_static_block(&mut self, it: &StaticBlock<'a>) {
        self.events.push((it.span.start, Event::Revive));
        walk::walk_static_block(self, it);
    }
}

/// The offset the first synthesized accessor of `class_body` is printed at, or
/// `None` when the class produces none. Fields assigned in the constructor are
/// emitted ahead of every source member, so one of those kills from the `{`.
fn accessor_kill_offset(class_body: &ClassBody<'_>) -> Option<u32> {
    let mut field_kill = None;
    for element in &class_body.body {
        match element {
            ClassElement::PropertyDefinition(prop)
                if !prop.computed && !prop.r#static && field_kill.is_none() =>
            {
                if is_public_key(&prop.key)
                    && prop.value.as_ref().is_some_and(is_state_creation_rune)
                {
                    field_kill = Some(prop.value.as_ref().unwrap().span().end);
                }
            }
            ClassElement::MethodDefinition(method)
                if method.kind == MethodDefinitionKind::Constructor =>
            {
                if let Some(body) = method.value.body.as_ref()
                    && body.statements.iter().any(is_public_this_rune_assignment)
                {
                    return Some(class_body.span.start);
                }
            }
            _ => {}
        }
    }
    field_kill
}

fn is_public_key(key: &PropertyKey<'_>) -> bool {
    !matches!(key, PropertyKey::PrivateIdentifier(_))
}

fn is_public_this_rune_assignment(statement: &Statement<'_>) -> bool {
    let Statement::ExpressionStatement(stmt) = statement else {
        return false;
    };
    let Expression::AssignmentExpression(assign) = &stmt.expression else {
        return false;
    };
    let Some(member) = assign.left.as_member_expression() else {
        return false;
    };
    matches!(member.object(), Expression::ThisExpression(_))
        && !matches!(
            member,
            oxc_ast::ast::MemberExpression::PrivateFieldExpression(_)
        )
        && is_state_creation_rune(&assign.right)
}

/// `$state`, `$state.raw`, `$derived` or `$derived.by` — upstream's
/// `STATE_CREATION_RUNES`, the set whose fields grow accessors.
fn is_state_creation_rune(value: &Expression<'_>) -> bool {
    let Expression::CallExpression(call) = value else {
        return false;
    };
    match &call.callee {
        Expression::Identifier(id) => id.name == "$state" || id.name == "$derived",
        Expression::StaticMemberExpression(member) => match &member.object {
            Expression::Identifier(id) if id.name == "$state" => member.property.name == "raw",
            Expression::Identifier(id) if id.name == "$derived" => member.property.name == "by",
            _ => false,
        },
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::strip_class_accessor_dead_comments as strip;

    #[test]
    fn drops_the_comment_between_two_rune_classes() {
        let src = "class First {\n\tvalue = $state(0);\n}\n\n// gone\nclass Second {\n\tvalue = $state(1);\n}\n";
        assert_eq!(
            strip(src).unwrap(),
            "class First {\n\tvalue = $state(0);\n}\n\n\nclass Second {\n\tvalue = $state(1);\n}\n"
        );
    }

    #[test]
    fn a_located_body_after_the_accessor_revives_the_cursor() {
        let src = "class First {\n\tvalue = $state(0);\n}\n// gone\nfunction f() {\n\t// kept\n}\n// kept\n";
        let out = strip(src).unwrap();
        assert_eq!(out.matches("// kept").count(), 2);
        assert!(!out.contains("// gone"));
    }

    #[test]
    fn a_comment_before_the_rune_field_survives() {
        let src = "class First {\n\t// kept\n\tvalue = $state(0);\n\t// gone\n}\n";
        let out = strip(src).unwrap();
        assert!(out.contains("// kept"));
        assert!(!out.contains("// gone"));
    }

    #[test]
    fn a_constructor_assignment_kills_from_the_class_brace() {
        let src = "class First {\n\t// gone\n\tconstructor() {\n\t\t// kept\n\t\tthis.value = $state(0);\n\t}\n}\n";
        let out = strip(src).unwrap();
        assert!(out.contains("// kept"));
        assert!(!out.contains("// gone"));
    }

    #[test]
    fn a_private_field_grows_no_accessor() {
        assert!(strip("class First {\n\t#value = $state(0);\n}\n// kept\n").is_none());
    }

    #[test]
    fn a_plain_field_leaves_the_class_body_alone() {
        assert!(strip("class First {\n\tvalue = 0;\n}\n// kept\nlet x = $state(1);\n").is_none());
    }

    #[test]
    fn a_trailing_comment_on_the_field_line_is_still_flushed() {
        let src = "class First {\n\tvalue = $state(0); // kept\n}\n// gone\n";
        let out = strip(src).unwrap();
        assert!(out.contains("// kept"));
        assert!(!out.contains("// gone"));
    }

    #[test]
    fn unparseable_input_is_left_untouched() {
        assert!(strip("class First { value = $state(0); // oops\n").is_none());
    }
}
