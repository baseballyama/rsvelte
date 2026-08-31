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
//! Four kills exist. `3-transform/client/visitors/ClassBody.js` lowers a public rune
//! field into builder-made `get` / `set` methods whose `BlockStatement` has no `loc`.
//! A reactive destructuring assignment with a non-identifier RHS is lowered through a
//! builder-made arrow-function body. `AssignmentExpression.js` appends
//! `$.invalidate_inner_signals(() => { … })` to a mutation of a binding that backs a
//! legacy `<select bind:value>`, and that arrow's block is builder-made too. And the
//! enclosing `Program` is itself builder-made
//! for a `<script module>`, so its cursor starts dead — unlike a `.svelte.(js|ts)` module
//! (`print_module_program` simulates the real cursor) or a component's instance script
//! (upstream assigns `component_block.loc = instance.loc`). `Rules` selects which apply.

use oxc_allocator::Allocator;
use oxc_ast::ast::{
    AssignmentExpression, AssignmentTarget, BlockStatement, ClassBody, ClassElement, Expression,
    FunctionBody, MethodDefinitionKind, Program, PropertyKey, Statement, StaticBlock,
    UpdateExpression,
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
    /// Names carrying `legacy_indirect_bindings`, whose member mutation grows an
    /// unlocated `$.invalidate_inner_signals` thunk. Legacy mode only.
    pub invalidate_inner_signals_targets: &'a [String],
    /// Legacy mode, where every top-level `$:` becomes a `$.legacy_pre_effect`
    /// appended after the whole instance body — so its subtree is printed in a
    /// second pass this one cannot see.
    pub legacy_reactive_effects: bool,
}

impl Rules<'static> {
    /// A program upstream prints with its own `loc` — only its accessors kill.
    pub(crate) const ACCESSORS: Self = Self {
        program_unlocated: false,
        rune_accessors: true,
        destructure_iife_targets: &[],
        invalidate_inner_signals_targets: &[],
        legacy_reactive_effects: false,
    };

    /// A `<script module>`, whose `Program` is builder-made.
    pub(crate) const fn module_script(runes: bool) -> Self {
        Self {
            program_unlocated: true,
            rune_accessors: runes,
            destructure_iife_targets: &[],
            invalidate_inner_signals_targets: &[],
            legacy_reactive_effects: false,
        }
    }
}

impl<'a> Rules<'a> {
    pub(crate) const fn component(
        runes: bool,
        destructure_iife_targets: &'a [String],
        invalidate_inner_signals_targets: &'a [String],
    ) -> Self {
        Self {
            program_unlocated: false,
            rune_accessors: runes,
            destructure_iife_targets,
            invalidate_inner_signals_targets,
            legacy_reactive_effects: !runes,
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
                && (bytes.contains(&b'{') || bytes.contains(&b'[')))
            || (!rules.invalidate_inner_signals_targets.is_empty() && bytes.contains(&b'.')))
}

fn strip_from_program(src: &str, program: &Program<'_>, rules: Rules<'_>) -> Option<String> {
    if program.comments.is_empty() || program.source_text != src {
        return None;
    }

    let (reactive_spans, mut collector) = collect_events(src, program, rules);
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

    // Where the effects leave the cursor. Each starts with its own unlocated
    // thunk, so only the last one's revives can outlive them, and a comment at
    // or after that revive is still pending when the first located template
    // node flushes it.
    collector
        .reactive_events
        .sort_by_key(|&(index, pos, kind)| (index, pos, kind == Event::Kill));
    // No per-effect reset for the opening thunk: every event below settles the
    // state on its own, and an effect that contributes none is the case handled
    // after the loop.
    let mut effects_alive = false;
    let mut effect_revive = 0u32;
    let mut last_effect = usize::MAX;
    for &(index, pos, kind) in &collector.reactive_events {
        last_effect = index;
        match kind {
            Event::Revive => {
                effects_alive = true;
                effect_revive = pos;
            }
            Event::Kill => effects_alive = false,
        }
    }
    if !reactive_spans.is_empty() && last_effect != reactive_spans.len() - 1 {
        // The last `$:` contributed nothing, so its own thunk is the last word.
        effects_alive = false;
    }

    let mut removals: Vec<(usize, usize)> = Vec::new();
    for comment in &program.comments {
        let start = comment.span.start;
        // A comment inside a `$:` is re-emitted with the effect body, which
        // `rehome_reactive_statement_comments` owns.
        if reactive_spans
            .iter()
            .any(|&(from, to)| start >= from && start < to)
        {
            continue;
        }
        let idx = collector.events.partition_point(|&(pos, _)| pos <= start);
        let last = if idx > 0 {
            collector.events[idx - 1].1
        } else {
            seeded
        };
        if last == Event::Kill && !(effects_alive && start >= effect_revive) {
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

/// The `$:` spans and the walk's events, shared by the strip and the liveness
/// query below.
fn collect_events<'p>(
    src: &'p str,
    program: &Program<'_>,
    rules: Rules<'p>,
) -> (Vec<(u32, u32)>, EventCollector<'p>) {
    // Upstream replaces each with `b.empty` and appends the effect after the
    // whole instance body, so the subtree neither flushes nor revives here.
    let reactive_spans: Vec<(u32, u32)> = if rules.legacy_reactive_effects {
        program
            .body
            .iter()
            .filter_map(|statement| match statement {
                Statement::LabeledStatement(labeled) if labeled.label.name == "$" => {
                    Some((labeled.span.start, labeled.span.end))
                }
                _ => None,
            })
            .collect()
    } else {
        Vec::new()
    };
    let mut collector = EventCollector {
        events: Vec::new(),
        reactive_events: Vec::new(),
        in_reactive: None,
        rune_accessors: rules.rune_accessors,
        destructure_iife_targets: rules.destructure_iife_targets,
        invalidate_inner_signals_targets: rules.invalidate_inner_signals_targets,
        reactive_spans: Vec::new(),
        src,
    };
    collector.reactive_spans = reactive_spans.clone();
    collector.visit_program(program);
    (reactive_spans, collector)
}

/// Whether esrap's cursor is alive at a given offset of the FIRST printing
/// pass — the question `rehome_reactive_statement_comments` has to answer
/// before it copies a `$:`'s comments onto the statement that follows it.
pub(crate) struct CursorLiveness {
    events: Vec<(u32, Event)>,
    seeded: Event,
}

impl CursorLiveness {
    pub(crate) fn alive_at(&self, offset: u32) -> bool {
        let idx = self.events.partition_point(|&(pos, _)| pos <= offset);
        let last = if idx > 0 {
            self.events[idx - 1].1
        } else {
            self.seeded
        };
        last == Event::Revive
    }
}

/// `None` when the script does not parse, so the caller keeps its old rule.
pub(crate) fn cursor_liveness(src: &str, rules: Rules<'_>) -> Option<CursorLiveness> {
    let allocator = Allocator::default();
    let ret = Parser::new(&allocator, src, SourceType::mjs()).parse();
    if !ret.diagnostics.is_empty() {
        return None;
    }
    let (_, mut collector) = collect_events(src, &ret.program, rules);
    collector
        .events
        .sort_by_key(|&(pos, kind)| (pos, kind == Event::Kill));
    Some(CursorLiveness {
        events: collector.events,
        seeded: if rules.program_unlocated {
            Event::Kill
        } else {
            Event::Revive
        },
    })
}

struct EventCollector<'s> {
    events: Vec<(u32, Event)>,
    /// Events from inside a top-level `$:`, tagged with its index: they belong
    /// to the second printing pass, in that pass's order.
    reactive_events: Vec<(usize, u32, Event)>,
    /// Index of the `$:` being walked, if any.
    in_reactive: Option<usize>,
    rune_accessors: bool,
    destructure_iife_targets: &'s [String],
    invalidate_inner_signals_targets: &'s [String],
    /// Top-level `$:` statements, whose subtree is printed in upstream's second
    /// pass; `body()` skips the `EmptyStatement` left behind, so nothing inside
    /// one moves the cursor for a comment outside it.
    reactive_spans: Vec<(u32, u32)>,
    src: &'s str,
}

impl<'s> EventCollector<'s> {
    /// A comment on the same line as the accessor's field is still flushed as that
    /// field's trailing comment, so a kill only reaches the next line.
    /// `AssignmentExpression.js` only appends the thunk when the mutated binding
    /// carries `legacy_indirect_bindings`; a shadowing local of the same name is
    /// treated as the binding, matching the destructure kill above.
    fn invalidates(&self, name: &str) -> bool {
        self.invalidate_inner_signals_targets
            .iter()
            .any(|target| target == name)
    }

    fn push(&mut self, pos: u32, kind: Event) {
        match self.in_reactive {
            Some(index) => self.reactive_events.push((index, pos, kind)),
            None => self.events.push((pos, kind)),
        }
    }

    fn kill_at(&mut self, offset: u32) {
        let rest = &self.src.as_bytes()[offset as usize..];
        let Some(nl) = memchr::memchr(b'\n', rest) else {
            return;
        };
        self.push(offset + nl as u32 + 1, Event::Kill);
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
                self.push(it.span.start, Event::Kill);
            }
        }
        // The thunk is appended after the mutation, and `$.mutate(obj, …)` still
        // flushes a comment trailing the source assignment's own line.
        if let Some(root) = assignment_target_member_root(&it.left)
            && self.invalidates(root)
        {
            self.kill_at(it.span.end);
        }
        walk::walk_assignment_expression(self, it);
    }

    fn visit_update_expression(&mut self, it: &UpdateExpression<'a>) {
        if let Some(root) = simple_target_member_root(&it.argument)
            && self.invalidates(root)
        {
            self.kill_at(it.span.end);
        }
        walk::walk_update_expression(self, it);
    }

    fn visit_labeled_statement(&mut self, it: &oxc_ast::ast::LabeledStatement<'a>) {
        let index = self
            .reactive_spans
            .iter()
            .position(|&(start, end)| start == it.span.start && end == it.span.end);
        let outer = self.in_reactive;
        if index.is_some() {
            self.in_reactive = index;
        }
        walk::walk_labeled_statement(self, it);
        self.in_reactive = outer;
    }

    fn visit_class_body(&mut self, it: &ClassBody<'a>) {
        self.push(it.span.start, Event::Revive);
        if self.rune_accessors
            && let Some(offset) = accessor_kill_offset(it)
        {
            self.kill_at(offset);
        }
        walk::walk_class_body(self, it);
    }

    fn visit_function_body(&mut self, it: &FunctionBody<'a>) {
        self.push(it.span.start, Event::Revive);
        walk::walk_function_body(self, it);
    }

    fn visit_block_statement(&mut self, it: &BlockStatement<'a>) {
        self.push(it.span.start, Event::Revive);
        walk::walk_block_statement(self, it);
    }

    fn visit_static_block(&mut self, it: &StaticBlock<'a>) {
        self.push(it.span.start, Event::Revive);
        walk::walk_static_block(self, it);
    }
}

/// The root identifier of a member-expression assignment target, or `None` when
/// the target is a bare name (which takes the `assign` transform, not `mutate`).
fn assignment_target_member_root<'a>(target: &'a AssignmentTarget<'_>) -> Option<&'a str> {
    let member = target.as_member_expression()?;
    member_root(member)
}

fn simple_target_member_root<'a>(
    target: &'a oxc_ast::ast::SimpleAssignmentTarget<'_>,
) -> Option<&'a str> {
    member_root(target.as_member_expression()?)
}

fn member_root<'a>(member: &'a oxc_ast::ast::MemberExpression<'_>) -> Option<&'a str> {
    let mut object = member.object();
    loop {
        match object {
            Expression::Identifier(id) => return Some(id.name.as_str()),
            _ => object = object.as_member_expression()?.object(),
        }
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

    fn strip_invalidate(src: &str) -> Option<String> {
        let targets = [String::from("obj")];
        strip_dead_comments(src, Rules::component(false, &[], &targets))
    }

    #[test]
    fn a_select_bound_mutation_kills_from_the_next_line() {
        let src = "let obj = { v: 1 };\nfunction bump() {\n\tobj.v = 3; // kept\n\t// gone\n\tobj.v = 4;\n}\n";
        let out = strip_invalidate(src).unwrap();
        assert!(out.contains("// kept"));
        assert!(!out.contains("// gone"));
    }

    #[test]
    fn a_located_body_after_the_mutation_revives_the_cursor() {
        let src = "let obj = { v: 1 };\nfunction bump() {\n\tobj.v = 3;\n}\n// gone\nfunction after() {\n\t// kept\n\treturn 1;\n}\n";
        let out = strip_invalidate(src).unwrap();
        assert!(out.contains("// kept"));
        assert!(!out.contains("// gone"));
    }

    #[test]
    fn an_update_expression_kills_the_same_way() {
        let src =
            "let obj = { v: 1 };\nfunction bump() {\n\tobj.v++;\n\t// gone\n\tobj.v = 4;\n}\n";
        let out = strip_invalidate(src).unwrap();
        assert!(!out.contains("// gone"));
    }

    #[test]
    fn a_bare_assignment_takes_the_assign_transform_and_kills_nothing() {
        let src = "let obj = { v: 1 };\nfunction bump() {\n\tobj = { v: 3 };\n}\n// kept\n";
        assert!(strip_invalidate(src).is_none());
    }

    #[test]
    fn a_binding_outside_the_target_list_kills_nothing() {
        let src = "let other = { v: 1 };\nfunction bump() {\n\tother.v = 3;\n}\n// kept\n";
        assert!(strip_invalidate(src).is_none());
    }

    /// The effects print after the whole instance body, so a block inside one
    /// cannot revive the cursor for a comment BETWEEN two of them: the next
    /// effect's own thunk kills again before anything flushes it.
    #[test]
    fn a_block_inside_a_reactive_statement_does_not_revive_what_follows_it() {
        let src = "let obj = { v: 1 };\nlet bar = 2;\nfunction bump() {\n\tobj.v = 3;\n}\n$: if (obj.v) {\n\tbar = 5;\n}\n// gone\n$: obj.n = bar;\n";
        let out = strip_invalidate(src).unwrap();
        assert!(!out.contains("// gone"));
    }

    /// CONTROL — the same shape with nothing killing the cursor first. A rule
    /// that treats a `$:` as a kill rather than as a hole breaks this row.
    #[test]
    fn a_reactive_statement_alone_kills_nothing_here() {
        let src = "let obj = { v: 1 };\nlet bar = 2;\nfunction bump() {\n\tbar = 9;\n}\n$: if (obj.v) {\n\tbar = 5;\n}\n// kept\n$: obj.n = bar;\n";
        assert!(strip_invalidate(src).is_none());
    }

    /// A comment inside a reactive statement belongs to the effect body this
    /// pass never sees; `rehome_reactive_statement_comments` decides its fate.
    #[test]
    fn a_comment_inside_a_reactive_statement_is_left_alone() {
        let src = "let obj = { v: 1 };\nlet bar = 2;\nfunction bump() {\n\tobj.v = 3;\n}\n$: if (obj.v) {\n\t// kept\n\tbar = 5;\n}\n// gone\n$: obj.n = bar;\n";
        let out = strip_invalidate(src).unwrap();
        assert!(out.contains("// kept"));
        assert!(!out.contains("// gone"));
    }

    /// CONTROL — past the LAST `$:` the effects' own order decides, and a block
    /// in the last-printed one leaves the cursor alive; `rehome_…` owns that
    /// region, so this pass must not touch it.
    #[test]
    fn a_comment_past_the_last_reactive_statement_is_left_alone() {
        let src = "let obj = { v: 1 };\nlet bar = 2;\nfunction bump() {\n\tobj.v = 3;\n}\n$: if (obj.v) {\n\tbar = 5;\n}\n// kept\nfunction after() {\n\treturn 1;\n}\n";
        assert!(strip_invalidate(src).is_none());
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
        let rules = Rules::component(false, &targets, &[]);
        let src = "({ $value } = { $value: 1 }) // gone\n// gone too\n";
        let out = strip_dead_comments(src, rules).unwrap();
        assert!(!out.contains("// gone"));
    }

    #[test]
    fn a_plain_destructure_grows_no_iife_and_keeps_comments() {
        let targets = vec!["$value".to_string()];
        let rules = Rules::component(false, &targets, &[]);
        let src = "({ plain } = { plain: 1 }) // kept\n";
        assert!(strip_dead_comments(src, rules).is_none());
    }

    #[test]
    fn a_located_body_after_a_destructure_iife_revives_the_cursor() {
        let targets = vec!["$value".to_string()];
        let rules = Rules::component(false, &targets, &[]);
        let src = "({ $value } = { $value: 1 }) // gone\nfunction f() {\n\t// kept\n}\n";
        let out = strip_dead_comments(src, rules).unwrap();
        assert!(!out.contains("// gone"));
        assert!(out.contains("// kept"));
    }
}
