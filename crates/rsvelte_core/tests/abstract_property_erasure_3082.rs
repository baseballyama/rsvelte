//! An `abstract` class PROPERTY has no runtime representation, so the TypeScript
//! eraser must drop it. Upstream drops an abstract *method* and leaves the
//! property's `abstract` keyword in place, emitting `abstract kind;` — two
//! adjacent identifiers that no JavaScript parser accepts (issue #3082,
//! `upstream_issues/3082-svelte-abstract-property-not-erased.md`).
//!
//! rsvelte drops it. That is a deliberate divergence, recorded in
//! `compatibility/deliberate-divergences.md`: byte parity here would mean
//! emitting a module that does not parse. This test is what pins the choice, so
//! a later "improve parity" change fails here instead of shipping.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn code(src: &str, generate: GenerateMode) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("Test.svelte".to_string()),
            generate,
            dev: false,
            css: CssMode::External,
            ..Default::default()
        },
    )
    .expect("an abstract class in a TypeScript script compiles")
    .js
    .code
}

/// `kept` is what survives erasure; every abstract member is gone.
const SOURCE: &str = r#"<script lang="ts">
	abstract class B {
		abstract kind: string;
		protected abstract other: number;
		abstract m(): void;
		declare size: number;
		protected kept: string = 'k';
	}
	const b = new (class extends B {
		kind = 'x';
		other = 1;
		m() {}
	})();
</script>

<p>{b.kind}</p>
"#;

#[test]
fn an_abstract_member_is_erased_on_every_target() {
    for generate in [GenerateMode::Client, GenerateMode::Server] {
        let js = code(SOURCE, generate);
        assert!(
            !js.contains("abstract"),
            "the `abstract` keyword must not survive erasure ({generate:?}):\n{js}"
        );
        assert!(
            js.contains("kept = 'k'"),
            "a plain field with an accessibility modifier keeps its initializer ({generate:?}):\n{js}"
        );
        assert!(
            !js.contains("size"),
            "a `declare` field has no runtime representation ({generate:?}):\n{js}"
        );

        let allocator = oxc_allocator::Allocator::default();
        let parsed = oxc_parser::Parser::new(&allocator, &js, oxc_span::SourceType::mjs()).parse();
        assert!(
            parsed.diagnostics.is_empty(),
            "emitted JS does not parse ({generate:?}): {:?}\n{js}",
            parsed.diagnostics
        );
    }
}
