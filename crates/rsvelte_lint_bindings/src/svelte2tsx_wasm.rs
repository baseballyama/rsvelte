//! The playground svelte2tsx wasm export.

use wasm_bindgen::prelude::*;

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx as rust_svelte2tsx};

/// Convert a Svelte component to TypeScript/TSX. Mirrors the napi `svelte2tsx`
/// shape — `options_json` and the return value are JSON strings so the wasm
/// boundary stays at primitive types and no bespoke `wasm_bindgen` struct is
/// needed for every field of `Svelte2TsxResult`.
#[wasm_bindgen]
pub fn svelte2tsx(source: &str, options_json: &str) -> String {
    let opts = parse_svelte2tsx_options(options_json);
    match rust_svelte2tsx(source, opts) {
        Ok(result) => {
            let props: Vec<serde_json::Value> = result
                .exported_names
                .get_prop_names()
                .iter()
                .map(|n: &&str| serde_json::Value::String((*n).to_string()))
                .collect();
            let all: Vec<serde_json::Value> = result
                .exported_names
                .get_all_names()
                .iter()
                .map(|n: &&str| serde_json::Value::String((*n).to_string()))
                .collect();
            let events: Vec<serde_json::Value> = result
                .events
                .get_api_entries()
                .into_iter()
                .map(|(name, ty)| serde_json::json!({ "name": name, "type": ty }))
                .collect();
            let output = serde_json::json!({
                "success": true,
                "code": result.code,
                "map": result.map,
                "exportedNames": { "props": props, "all": all },
                "events": events,
            });
            output.to_string()
        }
        Err(e) => serde_json::json!({
            "success": false,
            "error": format!("{e}"),
        })
        .to_string(),
    }
}

fn parse_svelte2tsx_options(options_json: &str) -> Svelte2TsxOptions {
    let Ok(value) = serde_json::from_str::<serde_json::Value>(options_json) else {
        return Svelte2TsxOptions::default();
    };
    Svelte2TsxOptions::from_json(&value)
}
