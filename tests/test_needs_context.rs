use svelte_compiler_rust::{
    CompileOptions, ExperimentalOptions, GenerateMode, compile, compiler::CssMode,
};

#[test]
fn test_async_reactivity_loss_needs_context() {
    let src = r#"<script>
	import { untrack } from 'svelte';
	let a = $state(1);
	let b = $state(2);
	let c = $state(3);

	async function a_plus_b_plus_c() {
		return await a + await b + await untrack(() => c);
	}
</script>

<button onclick={() => a++}>a</button>
<button onclick={() => b++}>b</button>
<button onclick={() => c++}>c</button>

<svelte:boundary>
	<h1>{await a_plus_b_plus_c()}</h1>
	<p>{await a + await b + await c}</p>

	{#snippet pending()}
		<p>pending</p>
	{/snippet}
</svelte:boundary>
"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        experimental: ExperimentalOptions { r#async: true },
        ..Default::default()
    };

    let result = compile(src, options).expect("Compilation should succeed");
    let code = &result.js.code;

    eprintln!("=== Generated code ===");
    eprintln!("{}", code);
    eprintln!("=== End ===");

    assert!(
        code.contains(".push("),
        "Expected $.push() in output but not found"
    );
    assert!(
        code.contains(".pop()"),
        "Expected $.pop() in output but not found"
    );
    assert!(
        code.contains("$$props"),
        "Expected $$props parameter but not found"
    );
}

#[test]
fn test_flush_sync_needs_context() {
    let src = r#"<script>
	import { flushSync, mount } from 'svelte'
	import Child from './Child.svelte';

	let show = $state(false);
</script>

<button onclick={() => show = true}>show</button>

<div {@attach (target) => {
	mount(Child, { target, props: { text: 'hello' }  });
	flushSync();
}}></div>
"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        experimental: ExperimentalOptions { r#async: true },
        ..Default::default()
    };

    let result = compile(src, options).expect("Compilation should succeed");
    let code = &result.js.code;

    eprintln!("=== Generated code ===");
    eprintln!("{}", code);
    eprintln!("=== End ===");

    assert!(
        code.contains(".push("),
        "Expected $.push() in output but not found"
    );
}
