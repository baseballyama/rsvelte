use super::*;

fn check(plugins: &'static [Plugin]) -> Result<(), PluginError> {
    let mut registry = Plugins::default();
    for plugin in plugins {
        registry.register(plugin);
    }
    registry.validate()
}

#[test]
fn semver_requirements_follow_cargo_rules() {
    macro_rules! case {
        ($requirement:literal, $version:literal, $accepted:literal) => {
            (
                &[
                    Plugin {
                        identifier: "consumer",
                        version: "1.0.0",
                        dependencies: &[Dependency {
                            identifier: "provider",
                            requirement: $requirement,
                        }],
                    },
                    Plugin {
                        identifier: "provider",
                        version: $version,
                        dependencies: &[],
                    },
                ],
                $accepted,
            )
        };
    }
    const CASES: &[(&[Plugin], bool)] = &[
        case!("^1.2.3", "1.9.0", true),
        case!("^1.2.3", "2.0.0", false),
        case!("~1.2.3", "1.2.9", true),
        case!("~1.2.3", "1.3.0", false),
        case!(">=1.2, <2", "1.5.0", true),
        case!("1.2.*", "1.2.8", true),
        case!("=1.2.3", "1.2.3+build.4", true),
        case!("=1.2.3", "1.2.4", false),
        case!("^0.2.3", "0.2.9", true),
        case!("^0.2.3", "0.3.0", false),
        case!("^0.0.3", "0.0.4", false),
        case!("*", "1.0.0-beta.1", false),
        case!("^1.0.0-beta.1", "1.0.0-beta.2", true),
        case!("^1.0.0-beta.1", "1.1.0-beta.1", false),
        case!("^1.0.0-beta.1", "1.1.0", true),
    ];
    for &(plugins, accepted) in CASES {
        let result = check(plugins);
        if accepted {
            assert_eq!(result, Ok(()), "{plugins:?}");
        } else {
            assert!(
                matches!(result, Err(PluginError::VersionMismatch { .. })),
                "{plugins:?}: {result:?}"
            );
        }
    }
}

#[test]
fn a_shared_dependency_and_registration_order_do_not_change_validity() {
    static PLUGINS: &[Plugin] = &[
        Plugin {
            identifier: "app",
            version: "1.0.0",
            dependencies: &[
                Dependency {
                    identifier: "left",
                    requirement: "^1",
                },
                Dependency {
                    identifier: "right",
                    requirement: "^1",
                },
            ],
        },
        Plugin {
            identifier: "left",
            version: "1.0.0",
            dependencies: &[Dependency {
                identifier: "base",
                requirement: "^1",
            }],
        },
        Plugin {
            identifier: "right",
            version: "1.0.0",
            dependencies: &[Dependency {
                identifier: "base",
                requirement: ">=1, <2",
            }],
        },
        Plugin {
            identifier: "base",
            version: "1.5.0",
            dependencies: &[],
        },
    ];
    assert_eq!(check(PLUGINS), Ok(()));
    let mut registry = Plugins::default();
    for plugin in PLUGINS.iter().rev() {
        registry.register(plugin);
        registry.register(plugin);
    }
    assert_eq!(registry.validate(), Ok(()));
    assert_eq!(registry.declarations().len(), 4);
}

#[test]
fn missing_and_incompatible_dependencies_name_the_consumer_and_requirement() {
    static CONSUMER: Plugin = Plugin {
        identifier: "lint.typed",
        version: "1.0.0",
        dependencies: &[Dependency {
            identifier: "types",
            requirement: "^2.0",
        }],
    };
    let mut registry = Plugins::default();
    registry.register(&CONSUMER);
    let error = registry.validate().unwrap_err();
    assert_eq!(
        error,
        PluginError::MissingDependency {
            plugin: "lint.typed",
            dependency: "types",
            requirement: "^2.0",
        }
    );
    assert_eq!(
        error.to_string(),
        "plugin `lint.typed` requires `types` ^2.0, but it is not registered"
    );
    registry.register(&Plugin {
        identifier: "types",
        version: "1.0.0",
        dependencies: &[],
    });
    let error = registry.validate().unwrap_err();
    assert_eq!(
        error,
        PluginError::VersionMismatch {
            plugin: "lint.typed",
            dependency: "types",
            requirement: "^2.0",
            actual: "1.0.0".into(),
        }
    );
    assert_eq!(
        error.to_string(),
        "plugin `lint.typed` requires `types` ^2.0, but version 1.0.0 is registered"
    );
}

#[test]
fn cycles_report_the_closed_path_without_unrelated_dependents() {
    let error = check(&[
        Plugin {
            identifier: "app",
            version: "1.0.0",
            dependencies: &[Dependency {
                identifier: "a",
                requirement: "*",
            }],
        },
        Plugin {
            identifier: "a",
            version: "1.0.0",
            dependencies: &[Dependency {
                identifier: "b",
                requirement: "*",
            }],
        },
        Plugin {
            identifier: "b",
            version: "1.0.0",
            dependencies: &[Dependency {
                identifier: "c",
                requirement: "*",
            }],
        },
        Plugin {
            identifier: "c",
            version: "1.0.0",
            dependencies: &[Dependency {
                identifier: "a",
                requirement: "*",
            }],
        },
    ])
    .unwrap_err();
    assert_eq!(
        error,
        PluginError::Cycle {
            plugins: vec!["a", "b", "c", "a"]
        }
    );
    assert_eq!(
        error.to_string(),
        "plugin dependency cycle: a -> b -> c -> a"
    );
    assert_eq!(
        check(&[Plugin {
            identifier: "self",
            version: "1.0.0",
            dependencies: &[Dependency {
                identifier: "self",
                requirement: "*"
            },]
        }]),
        Err(PluginError::Cycle {
            plugins: vec!["self", "self"]
        })
    );
}

#[test]
fn invalid_versions_requirements_and_names_are_errors() {
    assert_eq!(
        check(&[Plugin {
            identifier: "",
            version: "1.0.0",
            dependencies: &[]
        }]),
        Err(PluginError::EmptyIdentifier)
    );
    assert!(matches!(
        check(&[Plugin {
            identifier: "bad",
            version: "1.0",
            dependencies: &[]
        }]),
        Err(PluginError::InvalidVersion { .. })
    ));
    assert!(matches!(
        check(&[Plugin {
            identifier: "bad",
            version: "1.0.0",
            dependencies: &[Dependency {
                identifier: "dep",
                requirement: "latest"
            },]
        }]),
        Err(PluginError::InvalidRequirement { .. })
    ));
    assert_eq!(
        check(&[Plugin {
            identifier: "bad",
            version: "1.0.0",
            dependencies: &[Dependency {
                identifier: "",
                requirement: "*"
            },]
        }]),
        Err(PluginError::EmptyDependency { plugin: "bad" })
    );
}

#[test]
fn conflicting_declarations_and_repeated_dependencies_are_errors() {
    assert!(matches!(
        check(&[
            Plugin {
                identifier: "dep",
                version: "1.0.0",
                dependencies: &[]
            },
            Plugin {
                identifier: "dep",
                version: "2.0.0",
                dependencies: &[]
            },
        ]),
        Err(PluginError::ConflictingRegistration { .. })
    ));
    assert!(matches!(
        check(&[
            Plugin {
                identifier: "dep",
                version: "1.0.0",
                dependencies: &[]
            },
            Plugin {
                identifier: "dep",
                version: "1.0.0",
                dependencies: &[Dependency {
                    identifier: "other",
                    requirement: "*"
                },]
            },
        ]),
        Err(PluginError::ConflictingRegistration { .. })
    ));
    assert_eq!(
        check(&[
            Plugin {
                identifier: "dep",
                version: "1.0.0",
                dependencies: &[]
            },
            Plugin {
                identifier: "app",
                version: "1.0.0",
                dependencies: &[
                    Dependency {
                        identifier: "dep",
                        requirement: "*"
                    },
                    Dependency {
                        identifier: "dep",
                        requirement: "^1"
                    },
                ]
            },
        ]),
        Err(PluginError::DuplicateDependency {
            plugin: "app",
            dependency: "dep"
        })
    );
}

#[test]
fn adding_a_declaration_invalidates_both_success_and_failure() {
    let mut registry = Plugins::default();
    assert_eq!(registry.validate(), Ok(()));
    registry.register(&Plugin {
        identifier: "app",
        version: "1.0.0",
        dependencies: &[Dependency {
            identifier: "dep",
            requirement: "*",
        }],
    });
    assert!(matches!(
        registry.validate(),
        Err(PluginError::MissingDependency { .. })
    ));
    registry.register(&Plugin {
        identifier: "dep",
        version: "1.0.0",
        dependencies: &[],
    });
    assert_eq!(registry.validate(), Ok(()));
    registry.register(&Plugin {
        identifier: "dep",
        version: "2.0.0",
        dependencies: &[],
    });
    assert!(matches!(
        registry.validate(),
        Err(PluginError::ConflictingRegistration { .. })
    ));
}
