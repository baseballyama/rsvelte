use svelte_compiler_rust::compiler::compile;
use svelte_compiler_rust::compiler::{CompileOptions, GenerateMode};

fn main() {
    let source = r#"<script>
	import { writable } from 'svelte/store';

	let eid = writable(1);
	let foo;
	const u = writable(2);
	const v = writable(3);
	const w = writable(4);
	const x = writable(5);
	const y = writable(6);
	[$u, $v, $w] = [
		{id: eid = writable(foo = 2), name: 'xxx'},
		5,
		6
	];
	({ a: $x, b: $y } = { a: 9, b: 10 });
	$: z = $u.id;

	export function update() {
		[$u, $v, $w] = [
			{id: eid = writable(foo = 11), name: 'yyy'},
			12,
			13
		];
		({ a: $x, b: $y } = { a: 14, b: 15 });
	}
</script>

<h1>{foo} {$eid} {$u.name} {$v} {$w} {$x} {$y} {$z}</h1>
"#;

    let options = CompileOptions {
        generate: GenerateMode::Client,
        ..Default::default()
    };

    match compile(source, options) {
        Ok(result) => {
            println!("=== CLIENT OUTPUT ===");
            println!("{}", result.js.code);
        }
        Err(e) => {
            eprintln!("Error: {:?}", e);
        }
    }
}
