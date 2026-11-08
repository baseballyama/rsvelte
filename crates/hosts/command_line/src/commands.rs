//! Command execution.

pub(crate) mod benchmark;
pub(crate) mod corpus;
pub(crate) mod performance;
pub(crate) mod run;

/// `tools`: the external programs the run's plugins run, each `{ command, version }`.
fn write_tools(
    tools: &[rsvelte_plugin_interface::Tool],
    w: &mut rsvelte_kernel::output::structured_data::StructuredDataWriter,
) {
    w.key("tools").begin_array();
    for tool in tools {
        w.begin_object()
            .key("command")
            .write_string(&tool.command)
            .key("version")
            .write_string(&tool.version)
            .end_object();
    }
    w.end_array();
}
