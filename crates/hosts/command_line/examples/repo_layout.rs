#![expect(clippy::print_stdout, reason = "reports measured type layouts")]

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_kernel::source::tokens::Token;
use rsvelte_svelte::compilation::compiler_syntax_tree::{Attribute, Node};
use rsvelte_svelte_compile::render_plan::{Item, Region};
use rsvelte_typescript::NodeIdentifier;
use rsvelte_typescript::lexer::{LexedToken, T};
use rsvelte_typescript::scope::{Binding, Reference};
use rsvelte_typescript::syntax_tree::Tag;

fn record<T>(writer: &mut StructuredDataWriter, name: &str, fields: &[(&str, usize)]) {
    writer
        .begin_object()
        .key("name")
        .write_string(name)
        .key("bytes")
        .write_number(size_of::<T>())
        .key("alignment")
        .write_number(align_of::<T>())
        .key("fields")
        .begin_object();
    for &(name, offset) in fields {
        writer.key(name).write_number(offset);
    }
    writer.end_object().end_object();
}

fn main() {
    let mut writer = StructuredDataWriter::new(true);
    writer
        .begin_object()
        .key("architecture")
        .write_string(std::env::consts::ARCH)
        .key("records")
        .begin_array();
    record::<Span>(&mut writer, "kernel.span", &[]);
    record::<SourceLocation>(&mut writer, "kernel.source_location", &[]);
    record::<Tag>(&mut writer, "javascript.tag_column", &[]);
    record::<u8>(&mut writer, "javascript.flags_column", &[]);
    record::<[u32; 2]>(&mut writer, "javascript.data_column", &[]);
    record::<NodeIdentifier>(&mut writer, "javascript.child_identifier", &[]);
    record::<Token<T>>(
        &mut writer,
        "javascript.token",
        &[
            ("kind", std::mem::offset_of!(Token<T>, kind)),
            ("span", std::mem::offset_of!(Token<T>, span)),
        ],
    );
    record::<LexedToken>(&mut writer, "javascript.lexer_token", &[]);
    record::<Binding>(&mut writer, "javascript.binding", &[]);
    record::<Reference>(&mut writer, "javascript.reference", &[]);
    record::<Node>(
        &mut writer,
        "svelte.hir_node",
        &[
            ("kind", std::mem::offset_of!(Node, kind)),
            ("span", std::mem::offset_of!(Node, span)),
            ("parent", std::mem::offset_of!(Node, parent)),
        ],
    );
    record::<Attribute>(&mut writer, "svelte.hir_attribute", &[]);
    record::<Item<'static>>(&mut writer, "svelte.render_item", &[]);
    record::<Region>(&mut writer, "svelte.render_region", &[]);
    record::<rsvelte_stylesheet::syntax_tree::Rule>(&mut writer, "css.rule", &[]);
    record::<rsvelte_stylesheet::syntax_tree::Declaration>(&mut writer, "css.declaration", &[]);
    record::<rsvelte_stylesheet::syntax_tree::ComplexSelector>(
        &mut writer,
        "css.complex_selector",
        &[],
    );
    record::<rsvelte_stylesheet::syntax_tree::RelativeSelector>(
        &mut writer,
        "css.relative_selector",
        &[],
    );
    record::<rsvelte_stylesheet::syntax_tree::Simple>(&mut writer, "css.simple_selector", &[]);
    record::<rsvelte_vue::syntax_tree::TemplateNode>(&mut writer, "vue.template_node", &[]);
    record::<rsvelte_vue::syntax_tree::Attribute>(&mut writer, "vue.attribute", &[]);
    writer.end_array().end_object();
    println!("{}", writer.finish());
}
