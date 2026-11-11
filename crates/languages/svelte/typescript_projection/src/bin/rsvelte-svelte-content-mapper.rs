fn main() -> Result<(), Box<dyn std::error::Error>> {
    rsvelte_typescript_content_mapper::serve("rsvelte", |input, output| {
        rsvelte_svelte_typescript_projection::content_mapper::write_transform(
            input.content,
            output,
        );
        Ok(())
    })
}
