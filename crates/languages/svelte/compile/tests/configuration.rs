use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

use rsvelte_kernel::computation::functions::{CallError, Function};
use rsvelte_kernel::computation::pipeline::{Registry, RunOptions, Sharing, run};
use rsvelte_svelte_compile::{Configuration, CssHash};

fn run_with(
    source: &str,
    configuration: Configuration,
) -> rsvelte_kernel::computation::pipeline::DocumentResult {
    let mut registry = Registry::new();
    rsvelte_svelte_compile::register_with_configuration(&mut registry, configuration);
    let document = registry
        .document("Button.svelte", source)
        .expect("valid source");
    run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &[],
            sharing: Sharing::Shared,
            threads: Some(2),
        },
    )
    .expect("valid plugins")
    .remove(0)
}

#[test]
fn client_server_and_stylesheet_share_one_css_hash_call() {
    let calls = Arc::new(AtomicUsize::new(0));
    let called = Arc::clone(&calls);
    let configuration = Configuration {
        css_hash: Some(Function::<CssHash>::new(move |input| {
            called.fetch_add(1, Ordering::Relaxed);
            assert_eq!(input.name, "Button");
            assert_eq!(input.filename, "Button.svelte");
            assert_eq!(input.css, "button { color: red; }");
            Ok("custom-scope".into())
        })),
    };
    let result = run_with(
        "<button>Hi</button><style>button { color: red; }</style>",
        configuration,
    );
    assert!(result.panic.is_none(), "{:?}", result.panic);
    assert_eq!(calls.load(Ordering::Relaxed), 1);
    assert_eq!(result.outputs.len(), 2);
    for (_, output) in &result.outputs {
        assert!(output.diagnostics.is_empty(), "{:?}", output.diagnostics);
        assert!(
            output
                .files
                .iter()
                .any(|file| file.name == "js" && file.text.contains("custom-scope"))
        );
        assert!(
            output
                .files
                .iter()
                .any(|file| file.name == "css" && file.text.contains("custom-scope"))
        );
    }
}

#[test]
fn components_without_styles_do_not_call_the_hash_function() {
    let configuration = Configuration {
        css_hash: Some(Function::<CssHash>::new(|_| {
            Err(CallError("must not run".into()))
        })),
    };
    let result = run_with("<button>Hi</button>", configuration);
    assert!(result.panic.is_none());
    assert!(
        result
            .outputs
            .iter()
            .all(|(_, output)| output.diagnostics.is_empty())
    );
}

#[test]
fn failed_or_invalid_hashes_are_diagnostics_and_never_fall_back() {
    for result in [
        Err(CallError("custom failure".into())),
        Ok("invalid hash".into()),
        Ok("-1".into()),
        Ok(String::new()),
    ] {
        let configuration = Configuration {
            css_hash: Some(Function::<CssHash>::new(move |_| result.clone())),
        };
        let result = run_with(
            "<button>Hi</button><style>button { color: red; }</style>",
            configuration,
        );
        assert!(result.panic.is_none());
        for (_, output) in result.outputs {
            assert!(output.files.is_empty());
            assert_eq!(output.diagnostics.len(), 1);
        }
    }
}
