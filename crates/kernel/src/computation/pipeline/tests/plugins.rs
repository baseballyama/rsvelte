use super::super::*;
use crate::computation::plugins::{Dependency, Plugin, PluginError};

struct Probe;

impl Task for Probe {
    fn identifier(&self) -> &'static str {
        "probe"
    }

    fn applies(&self, _: &Document) -> bool {
        panic!("invalid dependencies must fail before selecting documents");
    }

    fn run(&self, _: &DocumentContext<'_>, _: &mut TaskOutput) {
        panic!("invalid dependencies must fail before running tasks");
    }
}

struct FinishProbe;

impl FinishTask for FinishProbe {
    fn identifier(&self) -> &'static str {
        "finish-probe"
    }

    fn applies(&self, _: &Document) -> bool {
        panic!("invalid dependencies must fail before selecting documents");
    }

    fn prepare(&self, _: &DocumentContext<'_>, _: &mut TaskOutput) -> Option<Part> {
        panic!("invalid dependencies must fail before preparing project tasks");
    }

    fn finish(&self, _: Vec<Part>, _: Vec<&mut TaskOutput>) {
        panic!("invalid dependencies must fail before finishing project tasks");
    }
}

#[test]
fn invalid_dependencies_stop_both_entry_points_before_any_work() {
    let mut registry = Registry::new();
    registry
        .plugin(&Plugin {
            identifier: "lint.typed",
            version: "1.0.0",
            dependencies: &[Dependency {
                identifier: "types",
                requirement: "^2",
            }],
        })
        .task(Probe)
        .finish_task(FinishProbe);
    let documents = [registry.document("a", "text").expect("valid document")];
    let options = RunOptions {
        tasks: &[],
        sharing: Sharing::Shared,
        threads: Some(1),
    };
    let expected = RunError::Plugins(PluginError::MissingDependency {
        plugin: "lint.typed",
        dependency: "types",
        requirement: "^2",
    });
    assert_eq!(run(&registry, &documents, &options).unwrap_err(), expected);
    assert_eq!(
        run_each(&registry, &documents, &options, &|_, _| {
            panic!("invalid dependencies must fail before calling the sink");
        })
        .unwrap_err(),
        expected
    );
}

#[test]
fn empty_registries_and_repeated_equal_declarations_are_valid() {
    let mut registry = Registry::new();
    assert_eq!(registry.validate_plugins(), Ok(()));
    registry
        .plugin(&Plugin {
            identifier: "syntax",
            version: "1.0.0",
            dependencies: &[],
        })
        .plugin(&Plugin {
            identifier: "syntax",
            version: "1.0.0",
            dependencies: &[],
        });
    assert_eq!(registry.validate_plugins(), Ok(()));
    assert_eq!(
        registry
            .plugins()
            .map(|plugin| plugin.identifier)
            .collect::<Vec<_>>(),
        ["syntax"]
    );
    let options = RunOptions {
        tasks: &[],
        sharing: Sharing::Shared,
        threads: Some(1),
    };
    assert!(
        run(&registry, &[], &options)
            .expect("valid registry")
            .is_empty()
    );
}
