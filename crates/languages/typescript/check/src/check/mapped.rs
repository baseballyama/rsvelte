use std::collections::BTreeSet;
use std::path::Path;

use rsvelte_kernel::output::emitter::Mapping;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;

use super::CheckRequest;

#[derive(Debug)]
pub struct ContentMappedInput {
    pub source: String,
    pub extension: &'static str,
    pub mappings: Vec<Mapping>,
}

impl ContentMappedInput {
    pub(super) fn json(&self, text: &str) -> String {
        let mut output = StructuredDataWriter::new(false);
        output
            .begin_object()
            .key("source")
            .write_string(&self.source)
            .key("text")
            .write_string(text);
        rsvelte_typescript_content_mapper::write_mappings(&self.mappings, &mut output);
        output.end_object();
        output.finish()
    }
}

impl CheckRequest {
    pub(super) fn file_name(&self, index: usize) -> String {
        let extension = self
            .mapped_files
            .get(index)
            .and_then(Option::as_ref)
            .map_or(".ts", |file| file.extension);
        format!("f{index}{extension}")
    }

    pub(super) fn write_mapper_package(&self, directory: &Path) -> Result<(), String> {
        let Some(binary) = &self.content_mapper else {
            return Ok(());
        };
        let package = directory.join("node_modules/rsvelte-content-mapper");
        std::fs::create_dir_all(&package).map_err(|error| error.to_string())?;
        let mut output = StructuredDataWriter::new(false);
        output
            .begin_object()
            .key("name")
            .write_string("rsvelte-content-mapper")
            .key("version")
            .write_string(env!("CARGO_PKG_VERSION"))
            .key("typescript")
            .begin_object()
            .key("contentMapper")
            .begin_object()
            .key("exec")
            .begin_array()
            .write_string(&binary.to_string_lossy())
            .end_array()
            .end_object()
            .end_object()
            .end_object();
        std::fs::write(package.join("package.json"), output.finish())
            .map_err(|error| error.to_string())
    }

    pub(super) fn write_mapper_config(&self, output: &mut StructuredDataWriter) {
        if self.content_mapper.is_none() {
            return;
        }
        output
            .key("contentMappers")
            .begin_array()
            .begin_object()
            .key("package")
            .write_string("rsvelte-content-mapper")
            .key("extensions")
            .begin_array();
        let extensions: BTreeSet<_> = self
            .mapped_files
            .iter()
            .flatten()
            .map(|file| file.extension)
            .collect();
        for extension in extensions {
            output.write_string(extension);
        }
        output.end_array().end_object().end_array();
    }
}
