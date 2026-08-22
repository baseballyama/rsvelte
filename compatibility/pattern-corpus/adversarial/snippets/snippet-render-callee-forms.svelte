<script>
	let { maybe, other } = $props();
	let flag = $state(true);
	const table = { a: maybe, b: other };
	let key = $state('a');
</script>

{#snippet fallback()}<em>fb</em>{/snippet}

{@render (maybe ?? fallback)()}
{@render (flag ? maybe : fallback)()}
{@render maybe?.()}
{@render table[key]?.()}
{@render (() => fallback)()()}
{@render fallback()}
<button onclick={() => (flag = !flag)}>{key}</button>
