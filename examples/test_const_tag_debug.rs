use svelte_compiler_rust::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn main() {
    // Test 1: const-tag-each-const
    println!("=== TEST 1: const-tag-each-const ===");
    let src1 = r#"<script>
	export let nums = [1, 2];
	let foos = [
		{
			nums: [1, 2, 3],
		},
		{
			nums: [0, 2, 4],
		},
		{
			nums: [-100, 0, 100],
		},
	];
	let foo = 0;
</script>

<p>{foo}</p>
{#each nums as num, index}
	{@const bar = nums.map((num) => {
		const func = (foos, num) => {
			return [...foos.map((foo) => foo), num];
		}
		return func(foos[index].nums, num);
	})}
	<p>bar: {bar}, num: {num}</p>
{/each}
"#;

    let opts1 = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        accessors: true,
        ..Default::default()
    };

    match compile(src1, opts1) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }

    // Test 2: const-tag-shadow-2
    println!("\n=== TEST 2: const-tag-shadow-2 ===");
    let src2 = r#"<script>
	export let array = [1, 2, 3];
	export let baz = 3;
	const foo = (item) => item;
</script>

{#each array as item}
	<p>{foo(item)}</p>
	{@const bar = array.map((item) => {
		const bar = baz;
		const foo = (item) => item * bar;
		return foo(item);
	})}
	<p>{bar}</p>
{/each}
"#;

    let opts2 = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        accessors: true,
        ..Default::default()
    };

    match compile(src2, opts2) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }

    // Test 3: const-tag-await-then-destructuring
    println!("\n=== TEST 3: const-tag-await-then-destructuring ===");
    let src3 = r#"<script>
	export let promise1 = {width: 3, height: 4};
	export let promise2 = {width: 5, height: 7};
	export let constant = 10;

	function calculate(width, height, constant) {
		return { area: width * height, volume: width * height * constant };
	}
</script>

{#await promise1 then { width, height }}
	{@const {area, volume} = calculate(width, height, constant)}
	{@const perimeter = (width + height) * constant}
	{@const [_width, _height, sum] = [width * constant, height, width * constant + height]}
	<div>{area} {volume} {perimeter}, {_width}+{_height}={sum}</div>
{/await}

{#await promise2 catch { width, height }}
	{@const {area, volume} = calculate(width, height, constant)}
	{@const perimeter = (width + height) * constant}
	{@const [_width, _height, sum] = [width * constant, height, width * constant + height]}
	<div>{area} {volume} {perimeter}, {_width}+{_height}={sum}</div>
{/await}
"#;

    let opts3 = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some("main.svelte".to_string()),
        css: CssMode::External,
        accessors: true,
        ..Default::default()
    };

    match compile(src3, opts3) {
        Ok(r) => println!("{}", r.js.code),
        Err(e) => eprintln!("ERROR: {:?}", e),
    }
}
