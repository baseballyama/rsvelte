use std::fs;
use svelte_compiler_rust::compiler::phases::phase1_parse::{ParseOptions, parse};

fn main() {
    let input = fs::read_to_string(
        "svelte/packages/svelte/tests/css/samples/unused-selector-in-between/input.svelte",
    )
    .unwrap();

    let result = parse(&input, ParseOptions::default()).unwrap();

    if let Some(css) = &result.css {
        let json: serde_json::Value =
            serde_json::from_str(&serde_json::to_string(&css).unwrap()).unwrap();

        // Get CSS content
        let css_source = json
            .get("content")
            .and_then(|c| c.get("styles"))
            .and_then(|s| s.as_str())
            .unwrap();
        let css_start = json
            .get("content")
            .and_then(|c| c.get("start"))
            .and_then(|s| s.as_u64())
            .unwrap() as usize;

        println!("=== CSS Source ===");
        println!("css_start: {}", css_start);
        println!("css_source: {:?}", css_source);
        println!("css_source length: {}", css_source.len());
        println!();

        // Get selectors from first rule
        if let Some(children) = json.get("children").and_then(|c| c.as_array()) {
            if let Some(rule) = children.first() {
                if let Some(prelude) = rule.get("prelude") {
                    if let Some(selectors) = prelude.get("children").and_then(|c| c.as_array()) {
                        println!("=== Selectors ===");
                        let mut prev_end: Option<usize> = None;
                        for (i, sel) in selectors.iter().enumerate() {
                            let start =
                                sel.get("start").and_then(|s| s.as_u64()).unwrap_or(0) as usize;
                            let end = sel.get("end").and_then(|e| e.as_u64()).unwrap_or(0) as usize;

                            println!("\nSelector {}: start={}, end={}", i, start, end);

                            // Show what the selector text actually is
                            let sel_start_idx = start.saturating_sub(css_start);
                            let sel_end_idx = end.saturating_sub(css_start);
                            if sel_end_idx <= css_source.len() && sel_start_idx < sel_end_idx {
                                println!(
                                    "  Selector text: {:?}",
                                    &css_source[sel_start_idx..sel_end_idx]
                                );
                            }

                            if let Some(pe) = prev_end {
                                let sep_start = pe.saturating_sub(css_start);
                                let sep_end = start.saturating_sub(css_start);
                                println!(
                                    "  Separator range in css_source: {} - {}",
                                    sep_start, sep_end
                                );
                                if sep_end <= css_source.len() && sep_start < sep_end {
                                    let sep = &css_source[sep_start..sep_end];
                                    println!("  Separator: {:?}", sep);
                                } else {
                                    println!("  Separator: OUT OF BOUNDS");
                                }
                            }

                            prev_end = Some(end);
                        }
                    }
                }
            }
        }
    }
}
