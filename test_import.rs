// Quick test for ImportDeclaration visitor

use svelte_compiler_rust::{compile, CompileOptions, GenerateMode};

fn main() {
    // Test 1: svelte/internal import
    let code1 = r#"
<svelte:options runes={true} />
<script>
    import { something } from 'svelte/internal/client';
</script>
"#;

    let result1 = compile(code1, CompileOptions {
        generate: GenerateMode::Client,
        ..Default::default()
    });

    println!("Test 1 (svelte/internal import):");
    match result1 {
        Ok(_) => println!("  FAILED: Should have errored"),
        Err(e) => {
            let err_str = format!("{:?}", e);
            if err_str.contains("import_svelte_internal_forbidden") {
                println!("  PASSED: Got expected error");
            } else {
                println!("  FAILED: Got wrong error: {}", err_str);
            }
        }
    }

    // Test 2: beforeUpdate import
    let code2 = r#"
<svelte:options runes />
<script>
    import { beforeUpdate, afterUpdate } from 'svelte';
</script>
"#;

    let result2 = compile(code2, CompileOptions {
        generate: GenerateMode::Client,
        ..Default::default()
    });

    println!("\nTest 2 (beforeUpdate import):");
    match result2 {
        Ok(_) => println!("  FAILED: Should have errored"),
        Err(e) => {
            let err_str = format!("{:?}", e);
            if err_str.contains("runes_mode_invalid_import") && err_str.contains("beforeUpdate") {
                println!("  PASSED: Got expected error");
            } else {
                println!("  FAILED: Got wrong error: {}", err_str);
            }
        }
    }

    // Test 3: Normal import (should succeed)
    let code3 = r#"
<svelte:options runes={true} />
<script>
    import { onMount } from 'svelte';
</script>
<h1>Hello</h1>
"#;

    let result3 = compile(code3, CompileOptions {
        generate: GenerateMode::Client,
        ..Default::default()
    });

    println!("\nTest 3 (normal import):");
    match result3 {
        Ok(_) => println!("  PASSED: Compilation succeeded"),
        Err(e) => println!("  FAILED: Should have succeeded, got: {:?}", e),
    }
}
