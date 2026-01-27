#[cfg(test)]
mod tests {
    use svelte_compiler_rust::compiler::{CompileOptions, compile};

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
}
