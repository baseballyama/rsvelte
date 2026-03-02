use std::env;
use std::fs;
use svelte_compiler_rust::CompileOptions;
use svelte_compiler_rust::compile;
use svelte_compiler_rust::compiler::CssMode;

fn normalize_js(s: &str) -> String {
    let mut result = String::new();
    let mut prev_ws = false;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut prev_char = ' ';

    for ch in s.chars() {
        if !in_string && (ch == '\'' || ch == '"' || ch == '`') {
            in_string = true;
            string_char = ch;
            result.push(ch);
            prev_ws = false;
        } else if in_string && ch == string_char && prev_char != '\\' {
            in_string = false;
            result.push(ch);
            prev_ws = false;
        } else if in_string {
            result.push(ch);
            prev_ws = false;
        } else if ch.is_whitespace() {
            if !prev_ws {
                result.push(' ');
            }
            prev_ws = true;
        } else {
            result.push(ch);
            prev_ws = false;
        }
        prev_char = ch;
    }

    let result = result.replace("function (", "function(");
    let result = result.replace("var ", "let ").replace("const ", "let ");
    result.trim().to_string()
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let test_name = args
        .get(1)
        .map(|s| s.as_str())
        .unwrap_or("component-slot-let-in-slot-2");
    let category = args.get(2).map(|s| s.as_str()).unwrap_or("runtime-legacy");

    let base = "/workspace/svelte/packages/svelte/tests";
    let input = fs::read_to_string(format!(
        "{}/{}/samples/{}/main.svelte",
        base, category, test_name
    ))
    .unwrap();

    let client_options = CompileOptions {
        generate: svelte_compiler_rust::GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        accessors: true,
        ..Default::default()
    };

    match compile(&input, client_options) {
        Ok(result) => {
            let expected_path = format!(
                "{}/{}/samples/{}/_output/client/main.svelte.js",
                base, category, test_name
            );
            if let Ok(expected) = fs::read_to_string(&expected_path) {
                let norm_actual = normalize_js(&result.js.code);
                let norm_expected = normalize_js(&expected);
                if norm_actual == norm_expected {
                    println!("CLIENT: PASS");
                } else {
                    println!("CLIENT: FAIL");
                    let actual_chars: Vec<char> = norm_actual.chars().collect();
                    let expected_chars: Vec<char> = norm_expected.chars().collect();
                    for i in 0..actual_chars.len().min(expected_chars.len()) {
                        if actual_chars[i] != expected_chars[i] {
                            let start = i.saturating_sub(60);
                            let end_a = (i + 100).min(actual_chars.len());
                            let end_e = (i + 100).min(expected_chars.len());
                            println!("First diff at pos {}:", i);
                            println!(
                                "  ACTUAL:   ...{}...",
                                actual_chars[start..end_a].iter().collect::<String>()
                            );
                            println!(
                                "  EXPECTED: ...{}...",
                                expected_chars[start..end_e].iter().collect::<String>()
                            );
                            break;
                        }
                    }
                    if actual_chars.len() != expected_chars.len() {
                        println!(
                            "Length diff: actual={}, expected={}",
                            actual_chars.len(),
                            expected_chars.len()
                        );
                    }
                    println!("\n=== ACTUAL CLIENT JS ===");
                    println!("{}", result.js.code);
                }
            } else {
                println!("No expected client output found");
                println!("{}", result.js.code);
            }
        }
        Err(e) => {
            println!("CLIENT COMPILE ERROR: {:?}", e);
        }
    }
}
