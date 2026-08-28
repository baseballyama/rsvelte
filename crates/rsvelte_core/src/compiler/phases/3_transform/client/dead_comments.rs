//! Delete the comments upstream's esrap comment cursor never reaches.
//!
//! esrap keeps one cursor over the whole comment list, and only `body()` moves it:
//! for a located body (`BlockStatement`, `ClassBody`, `StaticBlock`, `Program`)
//! `reset_comment_index` re-syncs it to the first comment at or after that body's
//! start — *including* when it is parked past the end — and for an unlocated one it
//! parks it past the end. So a comment survives iff the last cursor event at or
//! before it is a **revive** rather than a **kill**, which is what this pass walks.
//! rsvelte carries the same code as source text, where every body is located and the
//! cursor never dies, so the pass has to remove what upstream drops.
//!
//! Three kills exist. `3-transform/client/visitors/ClassBody.js` lowers a public rune
//! field into builder-made `get` / `set` methods whose `BlockStatement` has no `loc`.
//! A reactive destructuring assignment with a non-identifier RHS is lowered through a
//! builder-made arrow-function body. And the enclosing `Program` is itself builder-made
//! for a `<script module>`, so its cursor starts dead — unlike a `.svelte.(js|ts)` module
//! (`print_module_program` simulates the real cursor) or a component's instance script
//! (upstream assigns `component_block.loc = instance.loc`). `Rules` selects which apply.

use oxc_allocator::Allocator;
use oxc_ast::ast::{
    AssignmentExpression, AssignmentTarget, BlockStatement, ClassBody, ClassElement, Expression,
    FunctionBody, MethodDefinitionKind, Program, PropertyKey, Statement, StaticBlock,
};
use oxc_ast_visit::{Visit, walk};
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};

/// Where the comment cursor dies (an unlocated body) and where it comes back (a
/// located body's `{`).
#[derive(Clone, Copy, PartialEq, Eq)]
enum Event {
    Revive,
    Kill,
}

/// Which cursor kills the printed program is subject to.
#[derive(Clone, Copy)]
pub(crate) struct Rules<'a> {
    /// The `Program` upstream prints is builder-made, so the cursor is already
    /// dead when the first statement is flushed.
    pub program_unlocated: bool,
    /// Runes mode, where a public rune field becomes an unlocated accessor pair.
    pub rune_accessors: bool,
    /// Names whose assignment transform makes a destructuring assignment grow an
    /// unlocated IIFE body. Empty outside a component instance script.
    pub destructure_iife_targets: &'a [String],
}

impl Rules<'static> {
    /// A program upstream prints with its own `loc` — only its accessors kill.
    pub(crate) const ACCESSORS: Self = Self {
        program_unlocated: false,
        rune_accessors: true,
        destructure_iife_targets: &[],
    };

    /// A `<script module>`, whose `Program` is builder-made.
    pub(crate) const fn module_script(runes: bool) -> Self {
        Self {
            program_unlocated: true,
            rune_accessors: runes,
            destructure_iife_targets: &[],
        }
    }
}

impl<'a> Rules<'a> {
    pub(crate) const fn component(runes: bool, destructure_iife_targets: &'a [String]) -> Self {
        Self {
            program_unlocated: false,
            rune_accessors: runes,
            destructure_iife_targets,
        }
    }
}

/// Parse `src` and drop the comments upstream's cursor never reaches. Returns
/// `None` when nothing is removed (parse failure included), so callers keep the
/// input untouched.
pub(crate) fn strip_dead_comments(src: &str, rules: Rules<'_>) -> Option<String> {
    if !may_have_dead_comments(src, rules) {
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
    strip_from_program(src, &ret.program, rules)
}

/// The same pass over a parse the caller already holds. `program` must be the
/// parse of `src`; a mismatch would silently report "nothing to strip", so the
/// caller checks `source_text` before choosing this over the parsing entry point.
pub(crate) fn strip_dead_comments_from_program(
    src: &str,
    program: &Program<'_>,
    rules: Rules<'_>,
) -> Option<String> {
    debug_assert_eq!(program.source_text, src);
    if !may_have_dead_comments(src, rules) {
        return None;
    }
    strip_from_program(src, program, rules)
}

/// With only the accessor kill in play, nothing is removed without a class, a rune
/// field and a comment, so a script missing any of the three skips the parse.
/// Over-matching (a `class` inside a comment) only costs that parse; the pass itself
/// reads the AST. An unlocated program kills before the first body, so no such
/// shortcut exists for it.
fn may_have_dead_comments(src: &str, rules: Rules<'_>) -> bool {
    if rules.program_unlocated {
        return true;
    }
    let bytes = src.as_bytes();
    let has_comment = memchr::memmem::find(bytes, b"//").is_some()
        || memchr::memmem::find(bytes, b"/*").is_some();
    has_comment
        && ((rules.rune_accessors
            && memchr::memmem::find(bytes, b"class").is_some()
            && (memchr::memmem::find(bytes, b"$state").is_some()
                || memchr::memmem::find(bytes, b"$derived").is_some()))
            || (!rules.destructure_iife_targets.is_empty()
                && bytes.contains(&b'=')
                && (bytes.contains(&b'{') || bytes.contains(&b'['))))
}

fn strip_from_program(src: &str, program: &Program<'_>, rules: Rules<'_>) -> Option<String> {
    if program.comments.is_empty() || program.source_text != src {
        return None;
    }

    let mut collector = EventCollector {
        events: Vec::new(),
        rune_accessors: rules.rune_accessors,
        destructure_iife_targets: rules.destructure_iife_targets,
        src,
    };
    collector.visit_program(program);
    // Held out of the event list rather than pushed at offset 0: a `Revive` there
    // would sort ahead of it under the kill-wins tie-break below.
    let seeded = if rules.program_unlocated {
        Event::Kill
    } else {
        Event::Revive
    };
    if seeded == Event::Revive
        && !collector
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
        let last = if idx > 0 {
            collector.events[idx - 1].1
        } else {
            seeded
        };
        if last == Event::Kill {
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
    rune_accessors: bool,
    destructure_iife_targets: &'s [String],
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
    fn visit_assignment_expression(&mut self, it: &AssignmentExpression<'a>) {
        // `visit_assignment_expression` in upstream's shared/assignments.js
        // caches a non-identifier RHS in a generated arrow IIFE whenever at
        // least one destructured leaf has an assignment transform. Printing
        // that arrow's unlocated BlockStatement exhausts esrap's comment cursor
        // before the original RHS is printed as the call argument.
        let is_pattern = matches!(
            &it.left,
            AssignmentTarget::ArrayAssignmentTarget(_)
                | AssignmentTarget::ObjectAssignmentTarget(_)
        );
        if is_pattern && !matches!(&it.right, Expression::Identifier(_)) {
            let span = it.left.span();
            let pattern = &self.src[span.start as usize..span.end as usize];
            let transformed = super::destructure_transforms::extract_destructure_targets(pattern)
                .iter()
                .any(|name| {
                    self.destructure_iife_targets
                        .iter()
                        .any(|target| target == name)
                });
            if transformed {
                self.events.push((it.span.start, Event::Kill));
            }
        }
        walk::walk_assignment_expression(self, it);
    }

    fn visit_class_body(&mut self, it: &ClassBody<'a>) {
        self.events.push((it.span.start, Event::Revive));
        if self.rune_accessors
            && let Some(offset) = accessor_kill_offset(it)
        {
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
                if !prop.computed
                    && !prop.r#static
                    && field_kill.is_none()
                    && is_public_key(&prop.key) =>
            {
                if let Some(value) = prop.value.as_ref().filter(|v| is_state_creation_rune(v)) {
                    field_kill = Some(value.span().end);
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
    use super::{Rules, strip_dead_comments};

    fn strip(src: &str) -> Option<String> {
        strip_dead_comments(src, Rules::ACCESSORS)
    }

    fn strip_module(src: &str) -> Option<String> {
        strip_dead_comments(src, Rules::module_script(true))
    }

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

    #[test]
    fn a_module_script_kills_before_its_first_body() {
        let out = strip_module("// gone\nexport const x = 1;\n").unwrap();
        assert!(!out.contains("// gone"));
    }

    #[test]
    fn a_module_class_body_revives_the_cursor_for_what_follows() {
        let src = "// gone\nclass A {\n\tvalue = 0;\n}\n// kept\nexport const x = 1;\n";
        let out = strip_module(src).unwrap();
        assert!(!out.contains("// gone"));
        assert!(out.contains("// kept"));
    }

    #[test]
    fn a_module_block_statement_revives_the_cursor() {
        let src = "class A {\n\tvalue = $state(0);\n}\n// gone\n{\n\t// kept\n}\n// kept too\nexport const x = 1;\n";
        let out = strip_module(src).unwrap();
        assert!(!out.contains("// gone"));
        assert!(out.contains("// kept\n"));
        assert!(out.contains("// kept too"));
    }

    #[test]
    fn a_module_accessor_kill_outlives_the_class_it_is_in() {
        let src = "class A {\n\tvalue = $state(0);\n}\n// gone\nexport const x = 1;\n";
        assert!(!strip_module(src).unwrap().contains("// gone"));
    }

    #[test]
    fn a_legacy_module_grows_no_accessor_kill() {
        let src = "// gone\nclass A {\n\tvalue = $state(0);\n}\n// kept\nexport const x = 1;\n";
        let legacy = strip_dead_comments(src, Rules::module_script(false)).unwrap();
        assert!(!legacy.contains("// gone"));
        assert!(legacy.contains("// kept"));
        // The same input under runes, where the field does grow an accessor.
        assert!(!strip_module(src).unwrap().contains("// kept"));
    }

    #[test]
    fn a_reactive_destructure_iife_kills_later_comments() {
        let targets = vec!["$value".to_string()];
        let rules = Rules::component(false, &targets);
        let src = "({ $value } = { $value: 1 }) // gone\n// gone too\n";
        let out = strip_dead_comments(src, rules).unwrap();
        assert!(!out.contains("// gone"));
    }

    #[test]
    fn a_plain_destructure_grows_no_iife_and_keeps_comments() {
        let targets = vec!["$value".to_string()];
        let rules = Rules::component(false, &targets);
        let src = "({ plain } = { plain: 1 }) // kept\n";
        assert!(strip_dead_comments(src, rules).is_none());
    }

    #[test]
    fn a_located_body_after_a_destructure_iife_revives_the_cursor() {
        let targets = vec!["$value".to_string()];
        let rules = Rules::component(false, &targets);
        let src = "({ $value } = { $value: 1 }) // gone\nfunction f() {\n\t// kept\n}\n";
        let out = strip_dead_comments(src, rules).unwrap();
        assert!(!out.contains("// gone"));
        assert!(out.contains("// kept"));
    }
}
