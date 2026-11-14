//! Serves the projections a check stored, and projects any other component, such as one the
//! checker found in a package, when the checker asks for it.

fn main() -> Result<(), Box<dyn std::error::Error>> {
    rsvelte_typescript_content_mapper::serve_precomputed_or(|input, output| {
        rsvelte_svelte_typescript_projection::content_mapper::write_transform(
            input.file_name,
            input.content,
            output,
        );
        Ok(())
    })
}
