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
}
