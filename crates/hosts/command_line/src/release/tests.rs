use rsvelte_kernel::computation::registry::Registry;

use super::*;

#[test]
fn the_installed_plugins_run_every_command_and_no_other_language() {
    let mut settings = rsvelte_plugin_interface::Settings::new(
        Selection::DocumentTasks,
        Arc::new(rsvelte_plugin_interface::NoFunctions),
    );
    let mut reg = Registry::new();
    rsvelte_plugin_interface::install(&mut reg, EXTENSIONS, &mut settings).unwrap();
    assert_eq!(reg.validate_plugins(), Ok(()));
    for tasks in [LINT, FORMAT, TYPECHECK] {
        assert_eq!(reg.check_task_identifiers(tasks), Ok(()), "{tasks:?}");
    }
    let plugins: Vec<_> = reg.plugins().map(|plugin| plugin.identifier).collect();
    assert!(
        plugins
            .iter()
            .all(|p| p.starts_with("svelte.") || p.starts_with("typescript.")),
        "{plugins:?}"
    );
}
