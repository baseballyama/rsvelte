use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    let input = r#"<script>
	import { writable } from 'svelte/store';

	let userName1 = writable('init1');
	let userName2 = writable('init2');
	let userName3 = writable('init3');
	let userName4 = writable('init4');
	let userName5 = writable('init5');
	let userName6 = writable('init6');
	let userName7 = writable('init7');

	let obj = {
		userName1: 'user1',
		userName2: 'user2',
		userName3: 'user3',
		$userName4: 'user4',
		userName5: 'user5',
		$userName6: 'user6',
		userName7: 'user7',
	};

	({userName1: $userName1, $userName2 } = obj);
	({$userName3} = obj);
	({$userName4} = obj);
	({$userName5, $userName6, $userName7} = obj);
</script>

<div>$userName1: {$userName1}</div>
<div>$userName2: {$userName2}</div>
<div>$userName3: {$userName3}</div>
<div>$userName4: {$userName4}</div>
<div>$userName5: {$userName5}</div>
<div>$userName6: {$userName6}</div>
<div>$userName7: {$userName7}</div>
"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        accessors: true,
        ..Default::default()
    };

    match compile(input, options) {
        Ok(result) => {
            println!("{}", result.js.code);
        }
        Err(e) => {
            eprintln!("Compilation error: {}", e);
        }
    }
}
