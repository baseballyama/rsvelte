use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use serde::Deserialize;

#[derive(Deserialize)]
struct Projection {
    source: String,
    text: String,
    mappings: Vec<[u32; 5]>,
}

/// # Errors
/// Returns protocol, input, or projection validation errors.
pub fn serve_precomputed() -> Result<(), Box<dyn std::error::Error>> {
    crate::serve("rsvelte-projection", |file, content, output| {
        let bytes =
            std::fs::read(format!("{file}.projection.json")).map_err(|error| error.to_string())?;
        let projection: Projection =
            serde_json::from_slice(&bytes).map_err(|error| error.to_string())?;
        if projection.source != content {
            return Err("projection source does not match the native input".into());
        }
        write_projection(&projection, output);
        Ok(())
    })
}

fn write_projection(projection: &Projection, output: &mut StructuredDataWriter) {
    output
        .begin_object()
        .key("extension")
        .write_string(".ts")
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
