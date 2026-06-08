<script>
	let items = [1, 2, 3];
	let html = '<b>hi</b>';
	let cond = true;
</script>

<!-- svelte/no-at-html-tags: {@html} can lead to XSS -->
<p>{@html html}</p>

<!-- svelte/require-each-key: this {#each} has no (key) -->
{#each items as item}
	<li>{item}</li>
{/each}

<!-- svelte/no-dupe-else-if-blocks: the second branch can never run -->
{#if cond}a{:else if cond}b{/if}

<!-- svelte/no-object-in-text-mustaches: renders [object Object] -->
<p>{ { a: 1 } }</p>

<!-- svelte/no-at-debug-tags: debugging leftover (autofixable) -->
{@debug items}

<!-- svelte/button-has-type (opt-in): enable it via demo/rsvelte-lint.json -->
<button>Click</button>
