fn main() -> Result<(), Box<dyn std::error::Error>> {
    rsvelte_typescript_content_mapper::serve("rsvelte", |_, source, output| {
        rsvelte_svelte_typescript_projection::content_mapper::write_transform(source, output);
        Ok(())
    })
}
