use svelte_compiler_rust::compiler::compile;
use svelte_compiler_rust::compiler::{CompileOptions, GenerateMode};

fn main() {
    let source = r#"<script>
	export let selected;
	export let tasks;
</script>

<select bind:value={selected}>
	{#each tasks as task}
		<option value='{task}'>{task.description}</option>
	{/each}
</select>

<label>
	<input type='checkbox' bind:checked={selected.done}> {selected.description}
</label>

<h2>Pending tasks</h2>
{#each tasks.filter(t => !t.done) as task}
	<p>{task.description}</p>
{/each}"#;

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
