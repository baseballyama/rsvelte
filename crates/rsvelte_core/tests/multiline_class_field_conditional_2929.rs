use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;
use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

const SOURCE: &str = r#"
export class SystemPrefersMode {
	#defaultValue = undefined;
	#track = true;
	#current = $state(this.#defaultValue);
	#persisted = $state(this.#makePersisted());
	#mediaQueryState = typeof window !== "undefined" && typeof window.matchMedia === "function"
		? new MediaQuery("prefers-color-scheme: light")
		: { current: false };
	query() {
		this.#current = this.#mediaQueryState.current ? "light" : "dark";
	}
	#makePersisted() {
		return {};
	}
	constructor() {
		$effect.root(() => {
			$effect.pre(() => {
				if (!this.#track) return;
				this.query();
			});
		});
	}
}
"#;

#[test]
fn multiline_conditional_class_field_remains_a_single_expression_in_every_mode() {
    for dev in [false, true] {
        for generate in [GenerateMode::Client, GenerateMode::Server] {
            let result = compile_module(
                SOURCE,
                ModuleCompileOptions {
                    filename: Some("mode-states.svelte.js".into()),
                    generate,
                    dev,
                    ..Default::default()
                },
            )
            .expect("compileModule should compile a multiline class-field conditional");

            assert!(
                result.js.code.contains("? new MediaQuery"),
                "conditional was split in {generate:?}, dev={dev}:\n{}",
                result.js.code
            );
            if matches!(generate, GenerateMode::Client) {
                assert!(
                    result
                        .js
                        .code
                        .contains("$.state($.proxy(this.#makePersisted()))"),
                    "private method result was not proxied in dev={dev}:\n{}",
                    result.js.code
                );
                assert!(
                    result
                        .js
                        .code
                        .contains("$.state($.proxy(this.#defaultValue))"),
                    "private member value was not proxied in dev={dev}:\n{}",
                    result.js.code
                );
            }
            let allocator = Allocator::default();
            let parsed = Parser::new(&allocator, &result.js.code, SourceType::mjs()).parse();
            assert!(
                parsed.diagnostics.is_empty(),
                "compileModule emitted invalid JavaScript in {generate:?}, dev={dev}: {:?}\n{}",
                parsed.diagnostics,
                result.js.code
            );
        }
    }
}
