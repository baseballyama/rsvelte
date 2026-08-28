//! A nested destructuring assignment still participates in legacy `$:`
//! topological ordering. Huly uses a leading semicolon before `[[mode]]` to
//! guard against ASI; Phase 2 sees the target, while the removed Phase-3 text
//! scan did not.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(dev: bool) -> String {
    compile(
        r#"<script>
	let mode;
	let queries = {};
	let config = [['ready']];
	let baseQuery;
	let consumer;

	$: consumer = baseQuery;
	$: if (mode === undefined || queries[mode] === undefined) {
		;[[mode]] = config;
	}
	$: if (mode !== undefined) {
		baseQuery = queries[mode] ?? {};
	}
</script>

<p>{consumer}</p>
"#,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn nested_destructure_assigner_precedes_its_dependent() {
    for dev in [false, true] {
        let out = client(dev);
        let assigner = out
            .find("mode) === undefined")
            .or_else(|| out.find("mode), undefined"))
            .expect("nested destructuring reactive statement survives");
        let dependent = out
            .find("mode) !== undefined")
            .or_else(|| out.find("mode), undefined, false"))
            .expect("dependent reactive statement survives");
        assert!(assigner < dependent, "assigner must run first:\n{out}");
    }
}
