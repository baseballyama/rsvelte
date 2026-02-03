#[cfg(test)]
mod tests {
    use svelte_compiler_rust::compiler::{CompileOptions, compile};

    /// Test that $state() without arguments compiles correctly.
    /// Previously this would generate invalid JavaScript like `let value = ;`
    #[test]
    fn test_state_without_args_compiles() {
        let source = r#"<script>
let value1 = $state();
let value2 = $state(null);
let value3 = $state('test');
</script>
<p>{value1} {value2} {value3}</p>"#;

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result = compile(source, options);
        assert!(
            result.is_ok(),
            "Compilation should succeed: {:?}",
            result.err()
        );

        let code = result.unwrap().js.code;
        // value1 has no bind:, so it should be undefined (skip_state_vars)
        // value2 and value3 have no bind:, so they should also use their values directly
        assert!(
            !code.contains("let value1 = ;"),
            "Should not generate invalid JavaScript"
        );
    }

    /// Test that $state() with bind: compiles correctly.
    #[test]
    fn test_state_with_bind_compiles() {
        let source = r#"<script>
let value = $state();
</script>
<input bind:value />"#;

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result = compile(source, options);
        assert!(
            result.is_ok(),
            "Compilation should succeed: {:?}",
            result.err()
        );

        let code = result.unwrap().js.code;
        // value has bind:, so it should be $.state()
        assert!(
            code.contains("$.state()"),
            "Should generate $.state() for bound variables"
        );
    }

    #[test]
    fn debug_accessors_props() {
        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/accessors-props/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => {
                println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e);
            }
        }
    }

    #[test]
    fn debug_effect_cleanup() {
        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/effect-cleanup/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => {
                println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e);
            }
        }
    }

    #[test]
    fn debug_action_context() {
        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/action-context/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_action_void_element() {
        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/action-void-element/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_boundary_server() {
        use svelte_compiler_rust::compiler::GenerateMode;

        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/async-derived-unchanging/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Server,
            filename: Some("main.svelte".to_string()),
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED SERVER OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_snippet_hoisting_server() {
        use svelte_compiler_rust::compiler::GenerateMode;

        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/snippet-hoisting-4/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Server,
            filename: Some("Main.svelte".to_string()),
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED SERVER OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_snippet_hoisting_client() {
        use svelte_compiler_rust::compiler::GenerateMode;

        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/snippet-hoisting-4/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Client,
            filename: Some("Main.svelte".to_string()),
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_snippet_scope_client() {
        use svelte_compiler_rust::compiler::GenerateMode;

        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/snippet-scope/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Client,
            filename: Some("Main.svelte".to_string()),
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_snippet_prop_explicit_client() {
        use svelte_compiler_rust::compiler::GenerateMode;

        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/snippet-prop-explicit/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Client,
            filename: Some("Main.svelte".to_string()),
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_needs_context() {
        let source = r#"<script>
    let count = $state(0);
    const obj = {
        update() {
            this.count = 1;
        }
    };
</script>
<div>{count}</div>"#;

        let options = CompileOptions {
            generate: svelte_compiler_rust::compiler::GenerateMode::Server,
            dev: false,
            ..Default::default()
        };

        match compile(source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED SERVER OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => {
                println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e);
            }
        }
    }

    #[test]
    fn debug_bind_and_spread_server() {
        use svelte_compiler_rust::compiler::GenerateMode;

        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/bind-and-spread/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Server,
            filename: Some("Main.svelte".to_string()),
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED SERVER OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
                // Check if spread_props is present
                assert!(
                    result.js.code.contains("spread_props"),
                    "Output should contain $.spread_props when there are spreads with bindings"
                );
            }
            Err(e) => {
                panic!("Compilation failed: {:?}", e);
            }
        }
    }

    #[test]
    fn debug_class_state_derived_server() {
        use svelte_compiler_rust::compiler::GenerateMode;

        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/class-state-derived/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Server,
            filename: Some("Main.svelte".to_string()),
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                // Verify the class field transformation is correct
                // Expected output should contain $.derived() and getter/setter
                assert!(
                    result.js.code.contains("$.derived("),
                    "Output should contain $.derived()"
                );
                assert!(
                    result.js.code.contains("#doubled = $.derived("),
                    "Output should have private #doubled field with $.derived()"
                );
                assert!(
                    result.js.code.contains("get doubled()"),
                    "Output should have getter for doubled"
                );
                assert!(
                    result.js.code.contains("set doubled("),
                    "Output should have setter for doubled"
                );
                assert!(
                    result.js.code.contains("count = 0;"),
                    "Output should transform $state(0) to 0"
                );
            }
            Err(e) => {
                panic!("Compilation failed: {:?}", e);
            }
        }
    }

    #[test]
    fn debug_action_context_server() {
        use svelte_compiler_rust::compiler::GenerateMode;

        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/action-context/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Server,
            filename: Some("main.svelte".to_string()),
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED SERVER OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_inspect_deep_array_client() {
        use svelte_compiler_rust::compiler::GenerateMode;

        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/inspect-deep-array/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_inspect_deep_array_server() {
        use svelte_compiler_rust::compiler::GenerateMode;

        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/inspect-deep-array/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Server,
            filename: Some("main.svelte".to_string()),
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED SERVER OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_await_block_client() {
        use svelte_compiler_rust::compiler::GenerateMode;

        let source = r#"<script>
  const promise = Promise.resolve(42);
</script>
{#await promise}
  <p>pending</p>
{:then value}
  <p>then {value}</p>
{/await}"#;

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            ..Default::default()
        };

        match compile(source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_await_shorthand_client() {
        use svelte_compiler_rust::compiler::GenerateMode;

        // Test the shorthand await syntax: {#await promise then}...{/await}
        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/await-render-error-restore-reaction/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Client,
            filename: Some("main.svelte".to_string()),
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_svelte_element_snapshot() {
        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/snapshot/samples/svelte-element/index.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            filename: Some("svelte-element/index.svelte".to_string()),
            dev: false,
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn debug_derived_destructured() {
        let source = r#"<script>
  let stuff = $state({ foo: true, bar: [1, 2, {baz: 'baz'}] });
  let { foo, bar: [a, b, { baz }]} = $derived(stuff);
</script>

{foo} {a} {b} {baz}"#;

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        match compile(source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    result.js.code
                );
            }
            Err(e) => match e {
                svelte_compiler_rust::compiler::CompileError::Transform(ref transform_err) => {
                    println!(
                        "\n=== TRANSFORM ERROR ===\n{:?}\n=== END ===\n",
                        transform_err
                    );
                }
                _ => println!("\n=== ERROR ===\n{:?}\n=== END ===\n", e),
            },
        }
    }

    #[test]
    fn test_inspect_rune_transformation() {
        // Test $inspect transformation in dev mode
        let source = r#"<script>
let x = $state(0);
$inspect(x);
</script>
<p>{x}</p>"#;

        let options = CompileOptions {
            dev: true,
            ..Default::default()
        };

        let result = compile(source, options).expect("Compilation should succeed");
        let code = result.js.code;

        // Verify the $inspect transformation
        assert!(
            code.contains("$.inspect("),
            "Should transform $inspect to $.inspect"
        );
        assert!(code.contains("() => ["), "Should wrap arguments in a thunk");
        assert!(
            code.contains("(...$$args) => console.log(...$$args)"),
            "Should create arrow function for console.log"
        );
        assert!(
            code.contains(", true)"),
            "Should include true as third argument for plain $inspect"
        );

        // Test $inspect in non-dev mode (should be removed)
        let options_non_dev = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result_non_dev = compile(source, options_non_dev).expect("Compilation should succeed");
        let code_non_dev = result_non_dev.js.code;

        assert!(
            !code_non_dev.contains("$inspect"),
            "Should remove $inspect in non-dev mode"
        );
        assert!(
            !code_non_dev.contains("$.inspect"),
            "Should not contain $.inspect in non-dev mode"
        );
    }

    #[test]
    fn test_inspect_with_callback_transformation() {
        // Test $inspect().with() transformation in dev mode
        let source = r#"<script>
let x = $state(0);
$inspect(x).with(console.warn);
</script>
<p>{x}</p>"#;

        let options = CompileOptions {
            dev: true,
            ..Default::default()
        };

        let result = compile(source, options).expect("Compilation should succeed");
        let code = result.js.code;

        // Verify the $inspect().with() transformation
        assert!(
            code.contains("$.inspect("),
            "Should transform $inspect().with() to $.inspect"
        );
        assert!(code.contains("() => ["), "Should wrap arguments in a thunk");
        // For $inspect().with(), the third argument (true) should NOT be present
        // The callback should be wrapped in an arrow function
    }

    #[test]
    fn test_constant_folding() {
        // Test constant folding for non-reactive variables
        let source = r#"<script>
let name = 'world';
</script>
<h1>Hello {name}!</h1>"#;

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result = compile(source, options).expect("Compilation should succeed");
        let code = result.js.code;

        // Verify constant folding occurred
        assert!(
            code.contains("'Hello world!'"),
            "Should fold constant 'name' to 'Hello world!' but got:\n{}",
            code
        );
        // Should not have template literal with expression
        assert!(
            !code.contains("${name"),
            "Should not have template literal with 'name' variable"
        );
    }

    #[test]
    fn test_class_field_state_proxy_wrapping() {
        // Test that $state() with object/array literals in class fields gets $.proxy() wrapping
        let source = r#"<script>
class Counter {
    #a = $state();
    #b = $state({ val: -1 });
    #c = $state([1, 2, 3]);
    #d = $state(42);
}
const counter = new Counter();
</script>

<p>{counter}</p>"#;

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result = compile(source, options).expect("Compilation should succeed");
        let code = result.js.code;

        // Object literal should be wrapped with $.proxy()
        assert!(
            code.contains("$.state($.proxy({ val: -1 }))"),
            "Object literal should be wrapped with $.proxy(): {}",
            code
        );

        // Array literal should be wrapped with $.proxy()
        assert!(
            code.contains("$.state($.proxy([1, 2, 3]))"),
            "Array literal should be wrapped with $.proxy(): {}",
            code
        );

        // Primitive should NOT be wrapped with $.proxy()
        assert!(
            code.contains("$.state(42)"),
            "Primitive should not have $.proxy() wrapper: {}",
            code
        );
        assert!(
            !code.contains("$.proxy(42)"),
            "Primitive 42 should not be wrapped with $.proxy()"
        );

        // Empty $state() should NOT be wrapped with $.proxy()
        assert!(
            code.contains("#a = $.state();") || code.contains("#a = $.state()"),
            "Empty $state() should not have $.proxy() wrapper: {}",
            code
        );
    }

    #[test]
    fn test_class_field_state_raw_no_proxy() {
        // Test that $state.raw() in class fields does NOT get $.proxy() wrapping
        let source = r#"<script>
class Counter {
    count = $state.raw(0);
    obj = $state.raw({ val: 1 });
}
const counter = new Counter();
</script>

<p>{counter.count}</p>"#;

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result = compile(source, options).expect("Compilation should succeed");
        let code = result.js.code;

        // Primitive should NOT be wrapped with $.proxy()
        assert!(
            code.contains("$.state(0)"),
            "Primitive in $state.raw() should become $.state(0): {}",
            code
        );

        // Object in $state.raw() should NOT be wrapped with $.proxy()
        assert!(
            code.contains("$.state({ val: 1 })"),
            "Object in $state.raw() should NOT have $.proxy() wrapper: {}",
            code
        );
        assert!(
            !code.contains("$.proxy({ val: 1 })"),
            "$state.raw() should never use $.proxy(): {}",
            code
        );
    }

    /// Test that snippet body in component children has <!---> marker when starting with text
    /// This prevents text fusion during hydration
    #[test]
    fn test_snippet_text_marker_server() {
        use svelte_compiler_rust::compiler::GenerateMode;

        // A component with a snippet that starts with text should have <!----> marker
        let source = r#"<script>
    import Component from './Component.svelte';
</script>

<Component>
    {#snippet children()}
        Default
        <span slot="slot">Slotted</span>
    {/snippet}
</Component>"#;

        let options = CompileOptions {
            dev: false,
            generate: GenerateMode::Server,
            filename: Some("Main.svelte".to_string()),
            ..Default::default()
        };

        let result = compile(source, options).expect("Compilation should succeed");
        let code = result.js.code;

        println!("\n=== COMPILED SERVER OUTPUT ===\n{}\n=== END ===\n", code);

        // The snippet body should have <!---> marker since it starts with text,
        // and should preserve trailing space before the next element
        assert!(
            code.contains("<!---->Default <span"),
            "Snippet body should have <!----> marker and preserve space before next element.\nExpected to contain: '<!---->Default <span'\nActual output:\n{}",
            code
        );
    }

    /// Test that render tags with object arguments compile correctly.
    #[test]
    fn test_render_tag_with_object_arg() {
        // Use the exact same source as the fixture
        let source = "<script>\n\tlet count = $state(0);\n</script>\n\n{#snippet foo({ count })}\n\t<p>clicks: {count}</p>\n{/snippet}\n\n{@render foo({ count })}\n\n<button on:click={() => count += 1}>\n\tclick me\n</button>\n";

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result = compile(source, options);
        assert!(
            result.is_ok(),
            "Compilation should succeed: {:?}",
            result.err()
        );

        let output = result.unwrap().js.code;

        // Verify key patterns in the output
        // 1. Snippet should use $$arg0 parameter
        assert!(output.contains("$$arg0"), "Should use $$arg0 as parameter");
        // 2. Should create a getter that calls $$arg0 as a function: $$arg0?.().count
        assert!(
            output.contains("$$arg0?.().count"),
            "Should call $$arg0 as a function before accessing property: {}",
            output
        );
        // 3. The snippet body should use count() to call the getter
        assert!(
            output.contains("count()"),
            "Should call count() as a getter function"
        );
    }

    #[test]
    fn test_snippet_array_destructure_param() {
        // Test that snippet parameters with array destructuring are handled correctly
        // The parameter should use $$arg0 identifier, not the destructuring pattern directly
        let source = r#"<script>
let array = $state(['a', 'b', 'c'])
</script>

{#snippet content([x])}
    {x}
{/snippet}

{@render content(array)}"#;

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result = compile(source, options);
        assert!(
            result.is_ok(),
            "Compilation should succeed: {:?}",
            result.err()
        );

        let output = result.unwrap().js.code;

        // Verify key patterns in the output
        // 1. Snippet should use $$arg0 parameter (not [x] or [...])
        assert!(
            output.contains("$$arg0"),
            "Should use $$arg0 as parameter: {}",
            output
        );
        // 2. Should NOT contain [...] in function signature (indicates bug)
        assert!(
            !output.contains("[...]"),
            "Should NOT contain [...] in function signature: {}",
            output
        );
        // 3. Should use $.to_array to convert the argument
        assert!(
            output.contains("$.to_array"),
            "Should use $.to_array for array destructuring: {}",
            output
        );
    }

    /// Test that complex expressions in component props are memoized with $.derived()
    /// This tests the Memoizer functionality for ternary expressions
    #[test]
    fn test_component_prop_memoization() {
        // Test case: ternary expression in component prop should be memoized
        // We need a button that modifies show_foo to ensure the state is actually used
        let source = r#"<script>
    import Inner from './Inner.svelte';
    let show_foo = $state(true);
</script>

{#snippet foo()}
    <p>foo</p>
{/snippet}

{#snippet bar()}
    <p>bar</p>
{/snippet}

<Inner snippet={show_foo ? foo : bar} />
<button onclick={() => show_foo = false}>toggle</button>"#;

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result = compile(source, options);
        assert!(
            result.is_ok(),
            "Compilation should succeed: {:?}",
            result.err()
        );

        let output = result.unwrap().js.code;
        println!("=== OUTPUT ===\n{}\n=== END ===", output);

        // The ternary expression should be memoized with $.derived()
        // Expected: let $0 = $.derived(() => $.get(show_foo) ? foo : bar);
        assert!(
            output.contains("$.derived"),
            "Ternary expression should be memoized with $.derived(): {}",
            output
        );

        // The getter should use $.get($0)
        // Expected: get snippet() { return $.get($0); }
        assert!(
            output.contains("$.get($0)") || output.contains("$.get($"),
            "Getter should return memoized value with $.get($N): {}",
            output
        );
    }

    #[test]
    fn debug_numeric_class_field_names() {
        // Test numeric property names in class - should NOT generate invalid #0, #1 identifiers
        let source = r#"<script>
class Test {
    0 = $state();
    1 = $state({ val: 1 });
}
const test = new Test();
</script>

<p>{test}</p>"#;

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result = compile(source, options);
        let r = result.expect("Compilation should succeed with numeric field names");

        println!(
            "\n=== NUMERIC FIELD OUTPUT ===\n{}\n=== END ===\n",
            r.js.code
        );

        // Should NOT contain invalid private field names like #0, #1
        assert!(
            !r.js.code.contains("#0 ="),
            "Should NOT generate #0 private field name: {}",
            r.js.code
        );
        assert!(
            !r.js.code.contains("#1 ="),
            "Should NOT generate #1 private field name: {}",
            r.js.code
        );

        // Should contain valid sanitized identifiers like #_ or #_0
        // The name "0" should become "_" and "1" should become "_" as well
        // So they might conflict and become "_" and "__" or similar
        assert!(
            r.js.code.contains("#_"),
            "Should generate sanitized private field names like #_: {}",
            r.js.code
        );
    }

    /// Test CSS scoping with dynamic class expression
    #[test]
    fn debug_css_dynamic_class() {
        use svelte_compiler_rust::compiler::CssMode;

        let source = r#"<h1 class={{ [foo]: true }}>hello world</h1>

<style>
	.x { color: green; }
</style>"#;

        let options = CompileOptions {
            dev: false,
            css: CssMode::External,
            filename: Some("input.svelte".to_string()),
            ..Default::default()
        };

        let result = compile(source, options).expect("Compilation should succeed");

        // Print CSS for debugging
        if let Some(css) = &result.css {
            println!(
                "\n=== CSS OUTPUT (dynamic class) ===\n{}\n=== END ===\n",
                css.code
            );

            // CSS should NOT be commented as unused because of dynamic class expression
            assert!(
                !css.code.contains("/* (unused)"),
                "CSS selector '.x' should NOT be marked as unused since class is dynamic: {}",
                css.code
            );
        } else {
            panic!("Expected CSS output but got None");
        }
    }

    /// Debug test for runtime-runes/each-updates
    #[test]
    fn debug_each_updates() {
        use svelte_compiler_rust::compiler::ExperimentalOptions;

        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/each-updates/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            filename: Some("main.svelte".to_string()),
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!("\n=== OUR OUTPUT ===\n{}\n=== END ===", result.js.code);
            }
            Err(e) => {
                println!("\n=== ERROR ===\n{:?}\n=== END ===", e);
            }
        }
    }

    #[test]
    fn debug_css_basic() {
        use svelte_compiler_rust::compiler::CssMode;

        let source = r#"<div>red</div>

<style>
    div {
        color: red;
    }
</style>"#;

        let options = CompileOptions {
            dev: false,
            css: CssMode::External,
            filename: Some("input.svelte".to_string()),
            ..Default::default()
        };

        let result = compile(source, options).expect("Compilation should succeed");

        // Print CSS for debugging
        if let Some(css) = &result.css {
            println!("\n=== CSS OUTPUT ===\n{}\n=== END ===\n", css.code);

            // CSS should NOT be commented as unused
            assert!(
                !css.code.contains("/* (unused)"),
                "CSS selector 'div' should NOT be marked as unused since <div> is used in template: {}",
                css.code
            );

            // CSS should be properly scoped
            assert!(
                css.code.contains("div.svelte-"),
                "CSS selector should be scoped with svelte hash: {}",
                css.code
            );
        } else {
            panic!("Expected CSS output but got None");
        }
    }

    /// Test that CSS hash class is added to template HTML for elements without class attribute
    /// This test verifies the fix for: elements without class attributes should still get
    /// the CSS scoping hash added to their template HTML.
    #[test]
    fn test_css_hash_added_to_template_without_class_attr() {
        use svelte_compiler_rust::compiler::CssMode;

        // Element without class attribute should have CSS hash added to template
        let source = r#"<div>hello</div>

<style>
    div {
        color: red;
    }
</style>"#;

        let options = CompileOptions {
            dev: false,
            css: CssMode::External,
            filename: Some("test.svelte".to_string()),
            ..Default::default()
        };

        let result = compile(source, options).expect("Compilation should succeed");
        let code = result.js.code;

        println!(
            "\n=== JS OUTPUT (no class attr) ===\n{}\n=== END ===\n",
            code
        );

        // The template HTML should include the CSS hash class
        // Expected: $.from_html(`<div class="svelte-xxx">hello</div>`)
        // Not: $.from_html(`<div>hello</div>`)
        assert!(
            code.contains("class=\"svelte-"),
            "Template HTML should include CSS hash class for element without class attribute:\n{}",
            code
        );
    }

    /// Test that CSS hash class is appended to existing class attribute
    #[test]
    fn test_css_hash_appended_to_existing_class() {
        use svelte_compiler_rust::compiler::CssMode;

        // Element with existing class attribute should have CSS hash appended
        let source = r#"<div class="foo">hello</div>

<style>
    div {
        color: red;
    }
</style>"#;

        let options = CompileOptions {
            dev: false,
            css: CssMode::External,
            filename: Some("test.svelte".to_string()),
            ..Default::default()
        };

        let result = compile(source, options).expect("Compilation should succeed");
        let code = result.js.code;

        println!(
            "\n=== JS OUTPUT (with class attr) ===\n{}\n=== END ===\n",
            code
        );

        // The template HTML should have both the original class and the CSS hash
        // Expected: $.from_html(`<div class="foo svelte-xxx">hello</div>`)
        assert!(
            code.contains("class=\"foo svelte-"),
            "Template HTML should include both original class and CSS hash:\n{}",
            code
        );
    }

    /// Debug test for class private fields with assignment shorthand
    #[test]
    fn debug_class_private_fields() {
        use svelte_compiler_rust::compiler::ExperimentalOptions;

        let source = std::fs::read_to_string(
            "svelte/packages/svelte/tests/runtime-runes/samples/class-private-fields-assignment-shorthand/main.svelte",
        )
        .unwrap();

        let options = CompileOptions {
            dev: false,
            filename: Some("main.svelte".to_string()),
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        };

        match compile(&source, options) {
            Ok(result) => {
                println!("\n=== OUR OUTPUT ===\n{}\n=== END ===", result.js.code);
            }
            Err(e) => {
                println!("\n=== ERROR ===\n{:?}\n=== END ===", e);
            }
        }
    }

    #[test]
    fn debug_bind_this_legacy_mode() {
        // Test bind:this in legacy (non-runes) mode
        // Expected: let container = $.mutable_source(); $.bind_this(div, ($$value) => $.set(container, $$value), () => $.get(container));
        // The binding should be promoted to 'state' kind and use $.set/$.get
        let source = r#"<script>
    let container;
</script>

<div bind:this={container}>Hello</div>"#;

        let options = CompileOptions {
            dev: false,
            filename: Some("main.svelte".to_string()),
            ..Default::default()
        };

        match compile(source, options) {
            Ok(result) => {
                println!(
                    "\n=== BIND:THIS LEGACY MODE OUTPUT ===\n{}\n=== END ===",
                    result.js.code
                );
                // Check for expected patterns
                if result.js.code.contains("$.mutable_source") {
                    println!("PASS: Found $.mutable_source()");
                } else {
                    println!(
                        "WARN: $.mutable_source() NOT found - binding may not be promoted to state"
                    );
                }
                if result.js.code.contains("$.set(container") {
                    println!("PASS: Found $.set(container, ...)");
                } else {
                    println!("WARN: $.set() NOT found - setter may not be using state function");
                }
                if result.js.code.contains("$.get(container") {
                    println!("PASS: Found $.get(container)");
                } else {
                    println!("WARN: $.get() NOT found - getter may not be using state function");
                }
            }
            Err(e) => {
                println!("\n=== ERROR ===\n{:?}\n=== END ===", e);
            }
        }
    }

    /// Test that multiple on:click directives on a component compile correctly.
    #[test]
    fn debug_multiple_on_click() {
        let source = r#"<script>
import Component from "./Component.svelte";
</script>

<Component on:click={() => console.log("a")} on:click={() => console.log("b")}>
test
</Component>"#;

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result = compile(source, options);
        match result {
            Ok(output) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    output.js.code
                );
            }
            Err(e) => {
                panic!("Compilation error: {:?}", e);
            }
        }
    }

    /// Test that svelte:window with onclick compiles correctly.
    #[test]
    fn debug_svelte_window_onclick() {
        let source = r#"<svelte:window onclick="{() => console.log('window main')}" />"#;

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result = compile(source, options);
        match result {
            Ok(output) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    output.js.code
                );
            }
            Err(e) => {
                panic!("Compilation error: {:?}", e);
            }
        }
    }

    /// Test full event-attribute-delegation-4 test case.
    #[test]
    fn debug_event_attribute_delegation_4() {
        let source = r#"<script>
	import Component from "./Component.svelte";
	import Sub from "./sub.svelte";
</script>

<svelte:window onclick="{() => console.log('window main')}" />
<svelte:document onclick="{() => console.log('document main')}" />

<Component on:click={() => console.log('div main 1')} on:click={() => console.log('div main 2')}>
	<button onclick={() => console.log('button main')}>main</button>
</Component>

<Sub />"#;

        let options = CompileOptions {
            dev: false,
            ..Default::default()
        };

        let result = compile(source, options);
        match result {
            Ok(output) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===\n",
                    output.js.code
                );
            }
            Err(e) => {
                panic!("Compilation error: {:?}", e);
            }
        }
    }

    /// Test the normalization of the event-attribute-delegation-4 actual vs expected
    #[test]
    fn debug_event_delegation_4_normalization() {
        // Read the actual and expected files from the fixtures directory
        let actual = std::fs::read_to_string(
            "/workspace/fixtures/123c48d38d1a/runtime-runes/event-attribute-delegation-4/_actual/client.js",
        );
        let expected = std::fs::read_to_string(
            "/workspace/fixtures/123c48d38d1a/runtime-runes/event-attribute-delegation-4/client.js",
        );

        if let (Ok(actual_content), Ok(expected_content)) = (actual, expected) {
            println!("\n=== ACTUAL RAW ===\n{}\n=== END ===\n", actual_content);
            println!(
                "\n=== EXPECTED RAW ===\n{}\n=== END ===\n",
                expected_content
            );

            // Normalize both
            fn normalize_js(js: &str) -> String {
                js.lines()
                    .filter(|line| {
                        let trimmed = line.trim();
                        !trimmed.is_empty()
                            && !trimmed.starts_with("import 'svelte/internal/flags/")
                    })
                    .map(|line| line.replace('"', "'"))
                    .collect::<Vec<_>>()
                    .join("\n")
            }

            let actual_normalized = normalize_js(&actual_content);
            let expected_normalized = normalize_js(&expected_content);

            println!(
                "\n=== ACTUAL NORMALIZED ===\n{}\n=== END ===\n",
                actual_normalized
            );
            println!(
                "\n=== EXPECTED NORMALIZED ===\n{}\n=== END ===\n",
                expected_normalized
            );

            // Check each line
            let actual_lines: Vec<&str> = actual_normalized.lines().collect();
            let expected_lines: Vec<&str> = expected_normalized.lines().collect();

            for (i, (a, e)) in actual_lines.iter().zip(expected_lines.iter()).enumerate() {
                if a != e {
                    println!(
                        "Line {} differs:\n  Actual:   '{}'\n  Expected: '{}'",
                        i + 1,
                        a,
                        e
                    );
                }
            }

            if actual_lines.len() != expected_lines.len() {
                println!(
                    "Line count differs: actual={}, expected={}",
                    actual_lines.len(),
                    expected_lines.len()
                );
            }
        } else {
            println!("Could not read files");
        }
    }

    #[test]
    fn debug_async_component_exports() {
        use svelte_compiler_rust::compiler::ExperimentalOptions;

        let source = r#"<script>
	import Child from './Child.svelte';

	let child;
</script>

<Child bind:this={child} />
<button onclick={() => {
	child.foo();
	child.bar();
}}>log</button>
"#;

        let options = CompileOptions {
            dev: false,
            filename: Some("main.svelte".to_string()),
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        };

        match compile(source, options) {
            Ok(result) => {
                println!(
                    "\n=== COMPILED CLIENT OUTPUT ===\n{}\n=== END ===",
                    result.js.code
                );

                // Check if bind_this uses $.get and $.set
                if result.js.code.contains("$.set(child,")
                    && result.js.code.contains("$.get(child)")
                {
                    println!("\nSUCCESS: bind_this uses $.get() and $.set()");
                } else if result.js.code.contains("child = $$value") {
                    println!(
                        "\nFAILURE: bind_this uses direct assignment instead of $.get()/$.set()"
                    );
                }
            }
            Err(e) => {
                println!("\n=== ERROR ===\n{:?}\n=== END ===", e);
            }
        }
    }
}
