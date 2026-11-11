use std::collections::HashMap;

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use serde::Deserialize;

/// `contentMappers[].options`: the store the checker's host wrote before it opened the project.
#[derive(Deserialize)]
struct Options {
    projections: String,
}

/// Every projection of one check, by the file name the checker reads.
#[derive(Deserialize)]
struct Store {
    files: HashMap<String, Projection>,
}

#[derive(Deserialize)]
struct Projection {
    source: String,
    text: String,
    extension: String,
    mappings: Vec<[u32; 5]>,
}

/// # Errors
/// Returns protocol, input, or projection validation errors.
pub fn serve_precomputed() -> Result<(), Box<dyn std::error::Error>> {
    // A store is read once per project options, when the first file is transformed; a host that
    // rewrites a store changes another option, which the checker folds into its cache key too.
    let mut stores: HashMap<String, Store> = HashMap::new();
    crate::serve("rsvelte-projection", |input, output| {
        let raw = input
            .options
            .ok_or("the project gives no `projections` option")?;
        if !stores.contains_key(raw) {
            let options: Options = serde_json::from_str(raw).map_err(|e| e.to_string())?;
            let bytes = std::fs::read(&options.projections)
                .map_err(|e| format!("{}: {e}", options.projections))?;
            let store: Store = serde_json::from_slice(&bytes).map_err(|e| e.to_string())?;
            stores.insert(raw.to_owned(), store);
        }
        let projection = stores[raw]
            .files
            .get(input.file_name)
            .ok_or("no projection for the file")?;
        if projection.source != input.content {
            return Err("projection source does not match the native input".into());
        }
        write_projection(projection, output);
        Ok(())
    })
}

fn write_projection(projection: &Projection, output: &mut StructuredDataWriter) {
    output
        .begin_object()
        .key("extension")
        .write_string(&projection.extension)
        .key("text")
        .write_string(&projection.text)
        .key("mappings")
        .begin_array();
    for mapping in &projection.mappings {
        output.begin_array();
        for value in mapping {
            output.write_number(*value);
        }
        output.end_array();
    }
    output.end_array().end_object();
}
