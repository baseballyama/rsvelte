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
    }
}
