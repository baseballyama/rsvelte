//! `Converted::into_coordinate_free_program` — the contract a native bundler
//! integration needs before it can adopt rsvelte's `Program` instead of
//! re-parsing the printed code.
//!
//! The property is negative and total: **no** span in the returned program may
//! index anything, and no comment may survive. A partial strip is worse than
//! none, because the consumer's acceptance test is "this program makes no claim
//! about any text" and a single surviving span makes that claim falsely.

use oxc_ast::AstKind;
use oxc_ast::ast::Program;
use oxc_ast_visit::Visit;
use oxc_span::{GetSpan, Span};
use rsvelte_core::compiler::compile_client_with_program_sink;
use rsvelte_core::compiler::phases::phase3_transform::js_ast::to_oxc::program_to_oxc;
use rsvelte_core::{CompileOptions, GenerateMode};

/// A component whose output carries both disqualifiers: comments, and nodes the
/// converter parses from generated chunks and therefore leaves located.
const SOURCE: &str = r#"<script>
	import Child from './Child.svelte';
	// a comment the converter has to place
	export let value = 1;
	let doubled = value * 2;
	function bump() {
		value += 1;
	}
</script>
<button onclick={bump}>{doubled}</button>
<Child {value} />
"#;

#[derive(Default)]
struct Located {
    spans: Vec<(String, Span)>,
}

impl<'a> Visit<'a> for Located {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        if kind.span() != Span::default() {
            self.spans
                .push((kind.debug_name().into_owned(), kind.span()));
        }
    }
}

fn located(program: &Program<'_>) -> Vec<(String, Span)> {
    let mut probe = Located::default();
    for statement in &program.body {
        probe.visit_statement(statement);
    }
    probe.spans
}

#[test]
fn stripping_leaves_no_span_and_no_comment_behind() {
    let options = CompileOptions {
        filename: Some("Handoff.svelte".to_string()),
        generate: GenerateMode::Client,
        enable_sourcemap: false,
        ..Default::default()
    };

    let mut before = Vec::new();
    let mut before_comments = 0;
    let mut after = Vec::new();
    let mut after_comments = 0;

    compile_client_with_program_sink(SOURCE, options, &mut |program, arena| {
        let allocator = oxc_allocator::Allocator::default();
        let converted =
            program_to_oxc(program, arena, &allocator).expect("fixture must convert to OXC");
        before = located(&converted.program);
        before_comments = converted.program.comments.len();

        let stripped = converted.into_coordinate_free_program();
        after = located(&stripped);
        after_comments = stripped.comments.len();
    })
    .expect("fixture must compile");

    // Positive control: without the strip the program does carry coordinates, so
    // an empty `after` means the strip worked rather than that the fixture had
    // nothing to strip.
    assert!(
        !before.is_empty(),
        "fixture carries no located spans, so it cannot discriminate"
    );
    assert!(
        before_comments > 0,
        "fixture carries no comments, so it cannot discriminate"
    );

    assert_eq!(after, Vec::new(), "spans survived the strip");
    assert_eq!(after_comments, 0, "comments survived the strip");
}
